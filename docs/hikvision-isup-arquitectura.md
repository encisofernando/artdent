# Listener ISUP (Hikvision Platform Access) para ArtCode CRM — Arquitectura

Estado: diseño + esqueleto de implementación. El binding real a HCNetSDK no puede
compilarse ni probarse hasta conseguir los binarios propietarios del SDK (ver
"Bloqueo conocido" al final). Todo lo que no depende del SDK (esquema de datos,
ingesta en Laravel, UI de administración) está implementado y funcional.

## 1. Por qué esto es necesario (y qué no reemplaza)

`artdent-crm` ya tiene dos integraciones Hikvision:

- **ISAPI *pull*** (`HikVisionIsapiService`): el backend llama al terminal por HTTP
  Digest Auth. Requiere que el terminal sea alcanzable desde el VPS (hoy vía Tailscale
  en ArtDent; a futuro vía DDNS + port forwarding, ver Parte 1 del pedido original).
- **ISAPI *push*** (`HikVisionWebhookController` + `subscribeEventPush()`): el terminal
  hace POST HTTP al VPS. Ya es un modelo *push* que funciona detrás de NAT/CGNAT sin
  abrir puertos en el router del cliente — arquitectónicamente resuelve el mismo
  problema de fondo que ISUP.

**ISUP/HCNetSDK no es la única forma de lograr push multitenant** — el webhook HTTP ya
la logra. Se construye igual por decisión explícita del negocio (ver decisión del
2026-07-28: se prioriza tener el listener ISUP real en vez de sólo reforzar el webhook
existente). Ambos caminos comparten el mismo problema de fondo — mapear qué evento
entrante pertenece a qué tenant — y este documento reutiliza para eso el mismo patrón ya
usado por `kiosk_networks` (tabla central + tenancy por token).

## 2. Componentes

```
┌─────────────────────┐        TCP/ISUP        ┌──────────────────────────┐
│ Terminal Hikvision   │ ─────────outbound────► │  isup-listener (Node.js) │
│ (DS-K1T320MX u otro) │   registra Account ID  │  daemon, systemd         │
└─────────────────────┘                          └────────────┬─────────────┘
                                                                │ HTTP interno
                                                                │ (localhost, Bearer token)
                                                                ▼
                                              ┌──────────────────────────────────┐
                                              │  Laravel (artdent-crm)            │
                                              │  IsupIngestController             │
                                              │   1. valida token interno         │
                                              │   2. resuelve tenant (DB central) │
                                              │   3. tenancy()->initialize()      │
                                              │   4. HikVisionEventProcessor      │
                                              │      (mismo código que usa hoy    │
                                              │      el webhook ISAPI push)       │
                                              └──────────────────────────────────┘
```

### 2.1 `isup-listener` (Node.js, proceso separado)

- Enlaza con **HCNetSDK** (binarios propietarios de Hikvision, no PHP-nativo — de ahí
  que sea un proceso separado, no parte de Laravel).
- Abre el puerto de escucha ISUP configurado (ej. `15900/tcp`) y acepta conexiones
  entrantes de terminales que se registran con su Account ID.
- Mantiene un mapa en memoria `accountId → handle de conexión` para poder correlacionar
  callbacks de eventos con el dispositivo que los generó.
- Ante cada callback del SDK (conexión, desconexión, evento de acceso/alarma), normaliza
  el payload a la misma forma que ya entiende `HikVisionEventProcessor` en Laravel
  (`AccessControllerEvent`-like) y hace `POST` a un endpoint interno.
- **Cola de reintentos local**: si Laravel no responde (deploy, reinicio), los eventos
  se buffean en disco (SQLite o un archivo append-only JSON-lines) y se reintentan con
  backoff — un evento de fichada no se debe perder porque Laravel estaba reiniciando.
- No expone nada públicamente por HTTP — el único puerto expuesto a internet es el
  puerto TCP crudo del protocolo ISUP. La comunicación con Laravel es sólo
  `127.0.0.1` con un token estático (`ISUP_LISTENER_TOKEN`).
- Se corre como `systemd` (`isup-listener.service`), mismo patrón que `reverb.service`
  y los `*-queue-worker.service` ya existentes en el VPS.

### 2.2 Ingesta en Laravel

- **Nueva tabla central** `isup_device_registry` (conexión `central`, no `tenant`):
  única fuente de verdad para "¿de qué tenant es este Account ID?" — se consulta
  *antes* de inicializar tenancy, exactamente como hace `RestrictToLabNetwork` con
  `kiosk_networks`.
- **`hikvision_devices` (tenant) extendida** con `connection_type` (`isapi` | `isup`),
  `isup_account_id`, `isup_status` (`never_connected` | `connected` | `disconnected`),
  `isup_last_connected_at`, `isup_last_disconnected_at`. El dispositivo ISUP sigue
  siendo un `HikVisionDevice` normal — mismo modelo, misma pantalla de administración,
  mismo `company_id` — sólo cambia el transporte por el que llegan sus eventos.
- **`HikVisionEventProcessor`** (nuevo, extraído de `HikVisionWebhookController`):
  contiene toda la lógica de negocio que hoy vive sólo en el webhook — mapeo de
  `verifyMode`, resolución de colaborador/empleado, inferencia de entrada/salida,
  registro de asistencia, notificación en tiempo real. La reutilizan **tanto** el
  webhook ISAPI existente **como** el nuevo ingest de ISUP — un solo lugar donde vive
  la lógica de "qué hacemos con un evento de fichada", sin importar por qué transporte
  llegó.
- **`IsupIngestController`** (nuevo, rutas internas, no públicas):
  - `POST /internal/isup/connect` — el listener avisa que un Account ID se conectó.
  - `POST /internal/isup/disconnect` — el listener avisa que se desconectó.
  - `POST /internal/isup/events` — el listener manda un evento normalizado.
  - Middleware propio (`isup.internal`) que exige `Authorization: Bearer
    {ISUP_LISTENER_TOKEN}` y rechaza cualquier otro origen — a diferencia del webhook
    ISAPI (que es público porque lo llama el terminal directo), este endpoint sólo lo
    debe poder llamar el proceso `isup-listener` corriendo en el mismo VPS.

### 2.3 Alta de un dispositivo ISUP

- Se hace desde la misma pantalla `HikVision/Devices.jsx` que ya existe — se agrega un
  selector de tipo de conexión (ISAPI / ISUP). Al elegir ISUP se genera un
  `isup_account_id` (string aleatorio corto, ej. `Str::random(12)`) que hay que cargar
  a mano en el terminal.
- Un `Observer` sobre `HikVisionDevice` (`HikVisionDeviceObserver`) escribe/borra el
  espejo en la tabla central `isup_device_registry` cuando se crea/edita/borra un
  dispositivo con `connection_type = isup` — mantiene ambas tablas sincronizadas sin
  que el admin tenga que tocar nada manualmente.

## 3. Esquema de datos

### `isup_device_registry` (central, nueva)

| columna       | tipo               | notas                                    |
|---------------|---------------------|-------------------------------------------|
| id            | bigint pk           |                                             |
| account_id    | string, unique       | generado al dar de alta el dispositivo (a cargar a mano en el terminal) |
| serial_no     | string nullable, indexado | confirmado disponible en `NET_DVR_ALARMER` — ver § 5 |
| mac_address   | string nullable, indexado | ídem |
| tenant_id     | string (FK tenants)  |                                             |
| device_id     | bigint               | id del `HikVisionDevice` en la BD del tenant (referencia informativa, no FK real: BD distinta) |
| created_at / updated_at | timestamps |                                             |

La resolución de tenant (`InitializeTenancyByIsupAccount`) acepta cualquiera
de los tres identificadores — no sólo `account_id` — porque no quedó
confirmado que el Account ID viaje de vuelta en los callbacks del SDK real
(ver § 5), mientras que serial/MAC sí están confirmados.

### `hikvision_devices` (tenant, columnas nuevas)

| columna                  | tipo                                    | notas                              |
|---------------------------|------------------------------------------|-------------------------------------|
| connection_type           | enum('isapi','isup') default 'isapi'     |                                      |
| isup_account_id           | string nullable, unique                  | null si `connection_type = isapi`  |
| isup_status                | enum('never_connected','connected','disconnected') default 'never_connected' | |
| isup_last_connected_at     | timestamp nullable                       |                                      |
| isup_last_disconnected_at  | timestamp nullable                       |                                      |

## 4. Piloto sobre el terminal de ArtDent (sin tocar ISAPI)

1. Activar "Plataforma de acceso → ISUP" en el DS-K1T320MX de ArtDent, **además** de la
   suscripción HTTP/ISAPI que ya tiene activa — ambos módulos son independientes en el
   equipo y pueden convivir sin conflicto.
2. Dar de alta el mismo terminal como un segundo registro `HikVisionDevice` con
   `connection_type = isup` (o agregar el campo al registro existente, a decidir según
   si conviene ver el terminal como una sola fila con ambos transportes activos o dos
   filas separadas — recomendado: una sola fila con ambos, para no duplicar el
   `company_id`/`serial_no`; ajustar el modelo si se opta por esto en vez de forzar
   `connection_type` a un único valor por fila).
3. Cargar el Account ID generado en el terminal (Configuración → Red → Plataforma de
   acceso), IP/hostname del VPS y puerto de escucha del `isup-listener`.
4. Confirmar en el log del listener que el terminal se conecta y queda registrado.
5. Provocar una fichada real y confirmar que llega el mismo tipo de evento
   (`AccessControllerEvent`) tanto por ISAPI push como por ISUP, comparando
   `hikvision_events` (columna `event_type`/`raw_payload`) de ambas vías.
6. Mantener ambas vías activas un período antes de decidir si ISAPI push se apaga para
   ese terminal (fuera de alcance de esta etapa — no se apaga nada de ISAPI en esta
   fase).

## 5. Binding real a HCNetSDK — hallazgos verificados

El HCNetSDK (`HCNetSDKV6.1.9.4`, linux64) se consiguió y se revisó
directamente (`HCNetSDK.h` + el "Device Network SDK (Person-Based Access
Control) Developer Guide"). El binding real está **implementado** en
`isup-listener/src/sdk.js` (`createRealSdk`), no es un stub — esto es lo que
se confirmó y lo que queda pendiente de un terminal/VPS real:

**Confirmado contra el header + la guía oficial:**
- El flujo correcto es `NET_DVR_Init()` → `NET_DVR_StartListen_V30(NULL,
  puerto, callback, NULL)` — sin login ni credenciales del lado servidor. El
  terminal, configurado localmente (Configuración → Red → Plataforma de
  acceso) con la IP/puerto del listener, se conecta solo. Esto confirma la
  premisa central del diseño: no hace falta que el servidor pueda alcanzar al
  terminal, sólo al revés — el mismo modelo push que ya usa ISAPI event push.
- El callback (`MSGCallBack`) recibe `lCommand`, un puntero a `NET_DVR_ALARMER`
  (identifica al dispositivo: `sSerialNumber`, `sDeviceIP`, `byMacAddr` — cada
  uno con su propio flag `byXxxValid`) y un puntero a los datos del evento,
  cuyo tipo depende de `lCommand`.
- Los eventos de control de acceso llegan con `lCommand = COMM_ALARM_ACS`
  (`0x5002`), tipados como `NET_DVR_ACS_ALARM_INFO` → `struAcsEventInfo`
  (`NET_DVR_ACS_EVENT_INFO`) y, si `byAcsEventInfoExtend` está activo, un
  puntero adicional a `NET_DVR_ACS_EVENT_INFO_EXTEND` con
  `byEmployeeNo`/`byCurrentVerifyMode`/`byAttendanceStatus` — mapea casi 1:1
  con lo que ya parseamos del JSON de ISAPI (`employeeNoString`,
  `currentVerifyMode`, `attendanceStatus`, incluyendo el mismo enum
  0=undefined/1=checkIn/.../6=overtimeOut que ya maneja
  `HikVisionEventProcessor`).
- Todos los structs/tipos (`BYTE`=uint8, `WORD`=uint16, `DWORD`=uint32,
  `LONG`=int32 en Linux 64-bit) y sin `#pragma pack` en el header → alineación
  natural, la que asume `koffi` por default.
- **Smoke-testeado en este entorno**: `libhcnetsdk.so` carga vía `koffi`,
  `NET_DVR_Init()` devuelve éxito, `NET_DVR_StartListen_V30()` corre sin
  crashear (ninguna struct mal dimensionada, que hubiera volado el proceso al
  primer llamado FFI) y devuelve un handle válido.

**No confirmado — necesita hardware/VPS real:**
- Si el "Account ID" que se configura en el terminal viaja de vuelta en
  `NET_DVR_ALARMER` o en algún otro campo del callback — no aparece
  explícitamente en el header como tal; sólo se encontró como campo de
  *configuración del lado del terminal* (`NET_DVR_ALARMHOST_NETPARAM_V50.
  byDevID`, para cuando es el SDK el que configura remotamente al terminal,
  no nuestro caso). Por eso la resolución de tenant en Laravel también acepta
  `serial_no`/`mac_address`, que sí están confirmados en `NET_DVR_ALARMER`.
- Si el puerto de escucha acepta conexiones entrantes reales — en este
  entorno de desarrollo (sandbox), un `NET_DVR_StartListen_V30` "exitoso" no
  se tradujo en un puerto TCP aceptando conexiones por loopback (connection
  refused). Es consistente con restricciones de red del sandbox, no
  necesariamente un bug — falta confirmar en el VPS real con `ss -tlnp` y,
  después, con un terminal físico.
- El mapeo numérico completo de `byCurrentVerifyMode` — la guía sólo confirma
  que existe y da un ejemplo (27 = tarjeta+huella+contraseña), no la tabla
  completa. Se manda el valor numérico tal cual; `HikVisionEventProcessor`
  cae a `'biometric'` por defecto si no matchea nada — mismo comportamiento
  seguro que ya tiene hoy para verifyModes de ISAPI no reconocidos.

Los binarios del SDK (`.zip` completo + `.so` + `HCNetSDK.h`) quedan en
`isup-listener/vendor-sdk/` (gitignored — es contenido propietario de
Hikvision, no se commitea).

## 6. Actualización 2026-07-28: HCNetSDK genérico descartado, HCISUPSDK real probado contra el terminal

Todo lo de la §5 quedó **superado**: el terminal (DS-K1T320MX, firmware
V3.5.2 build 240401) nunca llegó a intentar ninguna conexión de red con el
binding `NET_DVR_StartListen_V30` del HCNetSDK genérico (confirmado con
`tcpdump` en el VPS — cero paquetes, en ISUP4.0 y con dos puertos distintos,
antes y después de reiniciar el equipo). El SDK correcto es **`HCISUPSDK`**
(paquete separado, específico de EHome/ISUP, con soporte nativo de eventos
de control de acceso vía `EHOME_ALARM_ACS = 11`) — conseguido a través de
`corenel/ip-camera-ehome-server` (repo de referencia en GitHub, que lo bundlea
completo para linux64 en `thirdparty/HCISUPSDK/`). `isup-listener/src/sdk.js`
se reescribió por completo contra este SDK — el binding a `NET_DVR_*`
descrito en §5 ya no se usa.

**Arquitectura real (confirmada, no `NET_DVR_*`):**
- `NET_ECMS_Init()` + `NET_ECMS_StartListen(NET_EHOME_CMS_LISTEN_PARAM)` —
  registro. Callback `DEVICE_REGISTER_CB(lUserID, dwDataType, pOutBuffer, ...)`
  con `dwDataType` = `ENUM_DEV_ON` (0) / `ENUM_DEV_OFF` (1) /
  `ENUM_DEV_ADDRESS_CHANGED` (2) / `ENUM_DEV_AUTH` (3, sólo EHome5.0) /
  `ENUM_DEV_SESSIONKEY` (4, sólo EHome5.0). `pOutBuffer` decodifica a
  `NET_EHOME_DEV_REG_INFO` (`byDeviceID` = nuestro Account ID) en ON/OFF, o a
  `NET_EHOME_DEV_REG_INFO_V12` en AUTH/SESSIONKEY.
- `NET_EALARM_Init()` + `NET_EALARM_StartListen(NET_EHOME_ALARM_LISTEN_PARAM,
  byUseCmsPort=1)` — alarmas, reusando el puerto de registro. Callback
  `EHomeMsgCallBack` con `NET_EHOME_ALARM_MSG`; cuando `dwAlarmType ==
  EHOME_ALARM_ACS`, `pAlarmInfo` decodifica a `NET_EHOME_ALARM_ISAPI_INFO`
  (`pAlarmData`/`dwAlarmDataLen`/`byDataType` 1=xml,2=json) — el
  `AccessControllerEvent` crudo, mismo formato que ya decodifica
  `HikVisionEventProcessor::decodePayload()` (extraído del webhook ISAPI para
  reusarlo acá — ver `IsupIngestController::events()`, que ahora acepta
  `raw_payload`+`format` en vez de un objeto ya parseado).

**Resultado de la prueba real (2026-07-28, terminal físico de ArtDent):**
- **ISUP4.0**: el terminal nunca intentó conectar — cero paquetes en la red
  pese a "Save succeeded", reinicio del equipo, y probar dos puertos
  distintos (7660 y 8091). No hay indicios de por qué en el log local del
  equipo (Maintenance → Log sólo registra altas/bajas de datos biométricos,
  nada de red). Firmware ya estaba en la última versión disponible. Conclusión:
  **el módulo ISUP4.0 de este firmware específico no funciona** (bug o
  limitación no documentada), no es un problema de nuestra configuración.
- **ISUP5.0**: SÍ conecta. Requiere una Encryption Key (8-16 caracteres,
  mayúsculas+minúsculas+dígitos según la UI del equipo) que el servidor elige
  libremente (`ISUP_EHOME_KEY` en `.env`, default `ArtDent2026Key` en
  `sdk.js`) — tiene que cargarse idéntica en el terminal. Con esto:
  1. TCP conecta y completa el 3-way handshake (confirmado con `tcpdump`).
  2. El equipo dispara `ENUM_DEV_AUTH` — nuestro callback responde escribiendo
     la key en `pInBuffer` (`koffi.encode(pInBuffer, 'char', keyBytes,
     keyBytes.length)`).
  3. El equipo dispara `ENUM_DEV_SESSIONKEY` — nuestro callback llama
     `NET_ECMS_SetDeviceSessionKey()` con el `byDeviceID`/`bySessionKey` que
     vinieron en `NET_EHOME_DEV_REG_INFO_V12.struRegInfo`, y devuelve `true`.
  4. **Acá se traba**: el equipo nunca llega a `ENUM_DEV_ON` — vuelve a
     `ENUM_DEV_AUTH` cada ~18 segundos, en loop indefinido, sin reportar error
     visible en su propia UI (sigue mostrando "Offline" sin más detalle).

**Hipótesis de por qué se traba (sin confirmar):** el repo de referencia que
tenemos es para cámaras IP, no para terminales de control de acceso — es
posible que falte un paso de la secuencia específico de este tipo de
dispositivo (ej. una respuesta adicional en `ENUM_DEV_SESSIONKEY` que el
ejemplo de cámaras no necesita, o un orden de bytes/padding distinto en
`sDeviceID`/`sSessionKey` que hace que el equipo no pueda validar la sesión
aunque `NET_ECMS_SetDeviceSessionKey` devuelva éxito). No hay documentación
pública que cubra este detalle para dispositivos de acceso — sería la
pregunta más precisa para hacerle a soporte de Hikvision si se retoma el
ticket ya enviado.

**Para retomar:** todo el código (`isup-listener/src/sdk.js`,
`vendor-sdk/isup/` con el HCISUPSDK real) y el terminal (ya configurado en
ISUP5.0, Device ID `kpy5s3r6b55o`, key `ArtDent2026Key`, apuntando a
`149.50.143.129:8091`) quedan tal cual — no hace falta rehacer nada de la
configuración para seguir iterando sobre la respuesta exacta del handshake.
