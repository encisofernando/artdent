# isup-listener

Daemon Node.js que habla ISUP/EHome (Hikvision Platform Access) y reenvía
conexiones/eventos normalizados a `artdent-crm`. Diseño completo en
[`docs/hikvision-isup-arquitectura.md`](../docs/hikvision-isup-arquitectura.md)
en la raíz del monorepo (§ 6 tiene el estado más actual y verificado).

## Estado: funcionando en producción (confirmado 2026-07-29)

Probado end-to-end contra un terminal DS-K1T320MX real: registro ISUP5.0
completo (`Registration Status: Online` en el propio terminal), estable, sin
crashes. El binding real usa **HCISUPSDK** (no el Device Network SDK
genérico — ver más abajo por qué).

### Arquitectura: dos procesos

```
index.js (proceso principal, bajo systemd)
  │  hace fetch()/HTTPS a Laravel — usa el OpenSSL propio de Node
  │
  └─ fork() ──> sdkWorker.js (proceso hijo)
                  │  único lugar donde se carga koffi + HCISUPSDK
                  │  el SDK trae su propio OpenSSL 1.0.0 embebido
                  └─ comunica por IPC (process.send/on('message'))
```

**Por qué dos procesos, no uno:** el SDK real carga transitivamente su
propio OpenSSL 1.0.0 (`libHCNetUtils.so` → `libcrypto/libssl.so.1.0.0`,
bundlados en `vendor-sdk/isup/lib/`). Si esto convive en el mismo proceso
que el `fetch()`/TLS de Node (que usa su propio OpenSSL 3.x), los símbolos
de ambas versiones chocan y el proceso crashea con `SIGSEGV` apenas Node
necesita su propio crypto — confirmado con un core dump real
(`node::crypto::Hash::GetHashes` → `EVP_MD_do_all_sorted` → segfault en
`__strlen_avx2`). Aislar el SDK en un proceso hijo aparte, que nunca hace
red por su cuenta (todo pasa por IPC al padre), elimina el problema de raíz.

## Conseguir HCISUPSDK

**No es el mismo paquete que "Device Network SDK" (HCNetSDK)** del portal
general de soporte de Hikvision — es un SDK separado, específico del
protocolo EHome/ISUP, con soporte nativo de eventos de control de acceso
(`EHOME_ALARM_ACS`). Se encontró vía el repo público
[`corenel/ip-camera-ehome-server`](https://github.com/corenel/ip-camera-ehome-server)
en GitHub, que lo bundlea completo para linux64 en
`thirdparty/HCISUPSDK/linux64/`.

Los binarios van en `vendor-sdk/isup/` (gitignored — es contenido
propietario de Hikvision, no se commitea):

```
vendor-sdk/isup/
  include/   HCISUPCMS.h, HCISUPAlarm.h, HCISUPPublic.h, etc.
  lib/       libHCISUPCMS.so, libHCISUPAlarm.so, libHCNetUtils.so,
             libcrypto.so.1.0.0, libssl.so.1.0.0, libhpr.so, etc.
```

**Paso obligatorio después de copiar los `.so`** (evita el crash de
OpenSSL descripto arriba sin necesitar `LD_LIBRARY_PATH` global):

```bash
cd vendor-sdk/isup/lib
sudo apt-get install -y patchelf   # si no está
for f in *.so; do patchelf --set-rpath '$ORIGIN' "$f"; done
```

## Correr en modo mock (sin SDK, sin hardware)

Sirve para probar que Laravel recibe y procesa bien los eventos, sin
necesitar un terminal físico ni el SDK.

```bash
cd isup-listener
cp .env.example .env
# dejar HCISUPSDK_LIB_DIR vacío (o ISUP_MOCK=1) — eso activa el modo mock
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
cd /home/artcode/isup-listener
npm install --omit=dev
cp .env.example .env   # completar con los valores reales (ver arriba)

# copiar vendor-sdk/isup/ (HCISUPSDK) acá y aplicar el patchelf del paso anterior

sudo cp systemd/isup-listener.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now isup-listener
sudo systemctl status isup-listener
journalctl -u isup-listener -f
```

## Configurar el terminal

En el terminal: **Configuración → Red → Plataforma de acceso → ISUP**:

- Protocol Version: **ISUP5.0** (ISUP4.0 no funciona en al menos algunos
  firmwares del DS-K1T320MX — probado y descartado, no intenta conectar en
  absoluto).
- Server IP Address / Port: la IP pública del VPS y `ISUP_LISTEN_PORT`.
- Device ID: el Account ID generado al dar de alta el dispositivo en
  `artdent-crm` (ver `docs/hikvision-isup-onboarding.md`).
- Encryption Key: tiene que ser **idéntica** a `ISUP_EHOME_KEY` del `.env`
  del listener.

`Registration Status` debería pasar a **Online** en unos segundos.
