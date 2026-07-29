# Memoria de sesión — 2026-07-28 (ISUP/EHome HikVision)

Este archivo es para retomar el trabajo desde otra PC. Documento técnico
completo en [`hikvision-isup-arquitectura.md`](hikvision-isup-arquitectura.md)
(§6 tiene el estado más actual) — esto es sólo el resumen de orientación
rápida y los datos operativos que hacen falta para no perder tiempo
reconstruyendo contexto.

## Qué se hizo hoy (resumen)

1. `pos.artdent.com.ar` (VPS, producción real de ArtDent) se convirtió de
   `CRM_MODE=owner` a tenant multi-tenant (`artdent` → base `fer_artdent`,
   central compartida con `pos.artcode.com.ar`). El detalle completo de esa
   conversión sólo está en la memoria local de Claude en esta PC (no en
   git) — si estás en otra PC y no tenés esa memoria, lo importante es:
   **`pos.artdent.com.ar` ya es multi-tenant, no vuelvas a intentar
   convertirlo**.
2. Arquitectura ISUP completa implementada en Laravel (`artdent-crm`):
   `HikVisionEventProcessor`, `IsupIngestController`, middlewares
   `isup.internal`/`isup.tenant`, tabla central `isup_device_registry`
   (migraciones en `artdent-admin`), extensión de `hikvision_devices`.
   Todo esto **ya está deployado en producción** (`pos.artdent.com.ar` +
   `pos.artcode.com.ar` para la parte central).
3. `isup-listener/` (Node.js, nuevo directorio en la raíz del monorepo):
   daemon que habla el protocolo ISUP/EHome real de Hikvision. Corre como
   systemd en el VPS (`/home/artcode/isup-listener`, servicio
   `isup-listener.service`, `Restart=always`, ya habilitado).
4. **El SDK que hay que usar es `HCISUPSDK`, no `HCNetSDK`** (el genérico
   "Device Network SDK" no sirve para esto — se probó y el terminal nunca le
   mandó ni un paquete). El real se consiguió del repo público
   `corenel/ip-camera-ehome-server` en GitHub, que lo bundlea completo para
   linux64. Los binarios están en `isup-listener/vendor-sdk/` en el
   filesystem local (**gitignored, no está en git** — son propietarios de
   Hikvision) — si estás en otra PC, hay que volver a conseguirlos (ver
   README de `isup-listener/` para las instrucciones).

## Estado del terminal físico (ArtDent, en este momento)

- Modelo: DS-K1T320MX, firmware V3.5.2 build 240401 (última versión).
- Configurado en **ISUP5.0** (ISUP4.0 no funciona en este firmware — no
  intenta conectar, probado y descartado).
- Server IP: `149.50.143.129`, **Port: `8091`** (no 7660 — se cambió durante
  el diagnóstico de hoy).
- Device ID: `kpy5s3r6b55o`
- Encryption Key: `ArtDent2026Key` (elegida por nosotros, tiene que coincidir
  exacto con `ISUP_EHOME_KEY` en `isup-listener/.env` del VPS — hoy está
  hardcodeada como default en `sdk.js` si esa env var no está seteada).

## Dónde está trabado

El handshake de EHome5.0 llega hasta `ENUM_DEV_SESSIONKEY` (la SessionKey se
intercambia OK, sin error del SDK) pero el equipo nunca completa el registro
final (`ENUM_DEV_ON`) — vuelve a `ENUM_DEV_AUTH` en loop cada ~18 segundos.
El repo de referencia que tenemos es para cámaras IP, no para terminales de
control de acceso — probablemente falta un paso de la secuencia específico
de este tipo de equipo que no está cubierto ahí. Se mandó un ticket a
soporte de Hikvision (Hik-Partner Pro) pidiendo el SDK — ya se consiguió
igual por otra vía, pero la respuesta del ticket podría tener el detalle del
paso que falta si preguntan puntualmente por esto.

## Para retomar

1. Conseguir de nuevo `HCISUPSDK` (linux64) si estás en otra máquina — ver
   `isup-listener/README.md`.
2. El listener ya está corriendo en el VPS con el binding real
   (`isup-listener/src/sdk.js`, función `createRealSdk`) — no hace falta
   tocar nada de la config del terminal, ya está apuntando bien.
3. Iterar sobre qué falta responder después de `ENUM_DEV_SESSIONKEY` para
   que el equipo complete `ENUM_DEV_ON` — único punto pendiente real.
4. `ssh donweb` da acceso al VPS. `journalctl -u isup-listener -f` para ver
   logs en vivo, `tcpdump -i any -n port 8091` para tráfico crudo.

## Archivos clave

- `docs/hikvision-isup-arquitectura.md` — diseño completo + § 6 con el
  detalle técnico exacto de hoy (structs, funciones, hallazgos).
- `docs/hikvision-isup-onboarding.md` — guía de alta de un terminal nuevo.
- `docs/artdent-ddns-portforwarding.md` — Parte 1 del pedido original
  (DDNS/port forwarding para ISAPI pull) — **en curso, ver sección siguiente**.
- `isup-listener/src/sdk.js` — el binding real a HCISUPSDK.
- `isup-listener/README.md` — cómo correr en mock / producción.

## Parte 1 (aparte de ISUP): DDNS/port-forwarding para ISAPI pull — EN CURSO

Objetivo distinto del ISUP de arriba: sacar la PC con Tailscale que hoy hace
de puente para las consultas ISAPI **pull** (test de conexión, sync de
colaboradores, pull de registros — el modelo "el servidor le pregunta al
terminal", no el push). Guía completa y actualizada con los valores reales
en [`artdent-ddns-portforwarding.md`](artdent-ddns-portforwarding.md).

**Hecho:**
- Cuenta y hostname en No-IP creados: `hikvision.hopto.org` (cuenta
  `fernandoenciso97@gmail.com`).

**Falta (se termina en el laboratorio, ahí está el router físicamente):**
1. Terminal: cambiar HTTP Port de 80 a `8899` (System Configuration →
   Network → Network Service → HTTP(S)).
2. Router TP-Link WR940N: reserva DHCP para MAC `04:03:12:1f:1f:41` →
   `192.168.0.100`.
3. Router: port forwarding `8899` externo → `192.168.0.100:8899` interno,
   TCP.
4. Router: configurar el cliente DDNS nativo con la cuenta de No-IP y el
   hostname `hikvision.hopto.org` (si el firmware del WR940N no lo soporta,
   hay que definir una alternativa — no resuelto todavía).
5. CRM: editar el dispositivo "Registro Facial" (ISAPI) en
   `HikVision/Devices.jsx` → IP `hikvision.hopto.org`, Puerto `8899` →
   "Probar conexión".
6. Recién con eso estable, apagar la PC con Tailscale.

No se tocó nada de código para esto — es 100% configuración de
router/terminal/CRM vía UI, sin cambios en el repo.
