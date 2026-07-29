# ArtDent: sacar la PC con Tailscale del medio (DDNS + port forwarding)

Objetivo: que `artdent-crm` en el VPS pueda seguir haciendo las mismas
consultas ISAPI que hace hoy (`HikVisionIsapiService` — test de conexión,
sync de colaboradores, pull de registros, etc.) contra el terminal
DS-K1T320MX del laboratorio, pero llegando directo por internet en vez de a
través de la PC con Tailscale. No cambia nada de código de la integración
ISAPI en sí — sólo a qué host/puerto apunta el dispositivo en el CRM.

No puedo tocar el router ni el terminal directamente (son hardware físico en
tu red) — esta es la guía para que lo hagas vos. Avisame en qué paso quedaste
si algo no coincide con el firmware real (los menúes pueden variar un poco
entre versiones del WR940N).

## Antes de empezar

- Dejá la PC con Tailscale prendida y funcionando hasta el final del paso 5
  — es el fallback si algo falla en el medio.
- Vas a necesitar: acceso admin al router (normalmente `192.168.0.1` o
  `192.168.1.1`, usuario/contraseña en la etiqueta del router si no lo
  cambiaste) y acceso admin al terminal (por su IP local, ya lo tenés
  configurado en el CRM hoy).

## 1. Fijar el puerto HTTP del terminal

En el terminal (interfaz web local, `Configuración → Red → TCP/IP` o similar):

- Cambiar el puerto HTTP de `80` a algo no estándar, ej. **8090**. Reduce el
  ruido de bots que escanean el puerto 80 buscando cámaras/DVRs expuestos.
- Si el equipo soporta HTTPS nativo, activarlo también (puerto separado, ej.
  `8091`) — usar HTTPS en vez de HTTP si es una opción real, no sólo un
  checkbox que no hace nada (algunos firmwares Hikvision tienen HTTPS con
  certificado autofirmado, que el cliente HTTP de Laravel puede aceptar
  igual desactivando la verificación SSL sólo para este host, si hace falta).

## 2. Reserva de IP fija por MAC (router)

Router → **DHCP → Address Reservation** (o "Reserva de direcciones"):

- Agregar una entrada: MAC del terminal (la misma que ya cargamos en el CRM,
  campo "MAC address" de `HikVision/Devices.jsx`) → una IP fija dentro del
  rango DHCP, ej. `192.168.0.50`.
- Reiniciar el terminal (o esperar a que renueve el DHCP) y confirmar que
  tomó esa IP.

## 3. Port forwarding (Virtual Server)

Router → **Forwarding → Virtual Servers**:

- Puerto de servicio (externo): elegir uno, puede ser el mismo 8090 u otro
  distinto si preferís no exponer el mismo número afuera que adentro.
- Puerto interno: **8090** (el que configuraste en el paso 1).
- IP interna: la IP fija del paso 2.
- Protocolo: TCP.
- Si el WR940N permite **restringir por IP de origen** en esa regla (no
  todos los firmwares lo tienen): limitarlo a la IP pública del VPS
  (`157.230.x.x` o la que corresponda — confirmar la IP actual del servidor
  antes de cargarla, `curl ifconfig.me` desde el VPS). Si no lo tiene, seguir
  igual — queda cubierto por el usuario/contraseña del ISAPI y por no usar
  el puerto default.

## 4. DDNS

Router → **Dynamic DNS**:

- El WR940N stock suele soportar **No-IP** y/o **DynDNS** (TP-Link, no
  terceros) según la versión de firmware — ver qué aparece en el menú.
- Si soporta No-IP: crear una cuenta gratuita en noip.com, un hostname (ej.
  `artdent-lab.ddns.net`), cargar usuario/contraseña de No-IP en el router.
- El router va a mantener ese hostname apuntando a la IP pública actual del
  local aunque cambie (la mayoría de los ISP residenciales en Argentina dan
  IP dinámica).
- Confirmar que resuelve: `nslookup artdent-lab.ddns.net` desde cualquier
  lado tiene que devolver la IP pública actual del local.

## 5. Apuntar el CRM al nuevo host

En `artdent-crm` → **RRHH → Terminales HikVision** → editar el dispositivo:

- Campo **"IP o hostname del terminal"**: cambiar la IP de Tailscale por el
  hostname DDNS del paso 4 (ej. `artdent-lab.ddns.net`) — el campo ya acepta
  hostname además de IP.
- Campo **Puerto**: el puerto externo elegido en el paso 3.
- Guardar y usar el botón **"Probar conexión"** de la tarjeta del
  dispositivo — tiene que dar OK y traer el firmware/modelo del terminal,
  igual que hoy vía Tailscale.
- Probar también **"Sincronizar colaboradores"** y **"Pull registros"** para
  confirmar que las mismas llamadas ISAPI que se usan en el día a día
  funcionan igual por la vía nueva.

## 6. Apagar Tailscale (recién después de validar)

Sólo cuando lo de arriba esté estable unos días: apagar/desinstalar
Tailscale de la PC intermediaria. Hasta entonces, dejarla anotada como
fallback — si algo falla con el DDNS/port forwarding, volver a apuntar el
campo IP del dispositivo a la IP de Tailscale de nuevo (no se perdió nada,
sigue siendo la misma fila de `HikVisionDevice`).
