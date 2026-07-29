# isup-listener

Daemon Node.js que habla ISUP (Hikvision Platform Access, vía HCNetSDK) y
reenvía conexiones/eventos normalizados a `artdent-crm`. Diseño completo en
[`docs/hikvision-isup-arquitectura.md`](../docs/hikvision-isup-arquitectura.md)
en la raíz del monorepo.

## Estado actual

- Todo el pipeline (recepción de callbacks, forwarding a Laravel, cola de
  reintentos en disco, logging) está implementado y probado end-to-end en modo
  **mock** contra un Laravel local real (conexión simulada → fichada simulada
  → asistencia registrada en la BD).
- El binding real a HCNetSDK (`src/sdk.js`, función `createRealSdk`) está
  **implementado**, con las firmas y layouts de structs verificados contra el
  SDK real (`HCNetSDKV6.1.9.4`, linux64) — no es un stub. Smoke-testeado en
  este entorno de desarrollo: `libhcnetsdk.so` carga vía koffi,
  `NET_DVR_Init()` y `NET_DVR_StartListen_V30()` corren sin crashear y
  devuelven éxito. **Lo que falta de verificar** (necesita el VPS real o un
  terminal físico, no se pudo confirmar en este entorno):
  1. Que el puerto de escucha efectivamente acepta conexiones entrantes desde
     afuera del proceso — el smoke test local dio "connection refused" al
     conectar por loopback, posiblemente por restricciones del sandbox de
     desarrollo (no del código) — confirmar en el VPS con `ss -tlnp` y con un
     terminal real.
  2. Si el "Account ID" configurado en el terminal viaja de vuelta en
     `NET_DVR_ALARMER` — no encontrado en el header/guía sin hardware para
     probarlo; mientras tanto la resolución de tenant en Laravel acepta
     también `serial_no`/`mac_address` (confirmados presentes en ese struct),
     ver `docs/hikvision-isup-arquitectura.md` § 5.
  3. El mapeo numérico completo de `byCurrentVerifyMode` — se manda tal cual
     (numérico) y `HikVisionEventProcessor` cae a `'biometric'` por defecto
     si no matchea nada conocido, mismo comportamiento seguro que ya tiene
     para verifyModes de ISAPI no mapeados.

## Correr en modo mock (sin SDK, sin hardware)

Sirve para probar que Laravel recibe y procesa bien los eventos, sin
necesitar un terminal físico ni el SDK.

```bash
cd isup-listener
cp .env.example .env
# dejar HCNETSDK_LIB_PATH vacío (o ISUP_MOCK=1) — eso activa el modo mock
npm install
ISUP_MOCK_SIMULATE=1 ISUP_MOCK_ACCOUNT_ID=<account_id de un HikVisionDevice de prueba> npm start
```

A los 3 segundos simula que el terminal se conecta, y 3 segundos después
manda una fichada de prueba (`employeeNoString` configurable con
`ISUP_MOCK_EMPLOYEE_NO`). Confirmar en `artdent-crm` que:
- El `HikVisionDevice` correspondiente pasa a `isup_status = connected`.
- Aparece un `HikVisionEvent` nuevo y, si el `employeeNoString` matchea un
  colaborador/empleado activo, un fichaje en `collaborator_attendances` o
  `employee_attendances`.

## Correr en producción

```bash
sudo cp -r isup-listener /home/artcode/isup-listener
# copiar también las .so del SDK (libhcnetsdk.so + HCNetSDKCom/ + libcrypto/libssl/libHCCore, etc.)
# a donde apunten HCNETSDK_LIB_PATH/LD_LIBRARY_PATH en el .env, ej. /opt/hcnetsdk/lib/
cd /home/artcode/isup-listener
npm install --omit=dev
cp .env.example .env   # completar con los valores reales
sudo cp systemd/isup-listener.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now isup-listener
sudo systemctl status isup-listener
journalctl -u isup-listener -f
```

`LARAVEL_INTERNAL_TOKEN` en `.env` tiene que ser exactamente el mismo valor
que `ISUP_LISTENER_TOKEN` en el `.env` de `artdent-crm` — es el token que
protege `/internal/isup/*` (middleware `isup.internal`).

El puerto de `ISUP_LISTEN_PORT` (default 15900) tiene que estar abierto en el
firewall del VPS para conexiones entrantes — es tráfico TCP crudo del
protocolo ISUP, no pasa por nginx/HTTP.
