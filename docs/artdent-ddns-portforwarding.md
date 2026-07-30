# ArtDent: sacar la PC con Tailscale del medio (DDNS + port forwarding)

**ACTUALIZACIÓN 2026-07-30: plan bloqueado por doble NAT de Starlink — no
reintentar sin resolver eso primero.** Se hicieron los pasos 1-4 (puerto
8899 en el terminal, reserva DHCP, port forwarding en el TP-Link, DDNS con
No-IP) y quedaron correctamente configurados — confirmado por LAN
(`http://192.168.0.100:8899/ISAPI/...` responde 401, o sea el terminal
escucha bien ahí). Pero desde afuera (`http://hikvision.hopto.org:8899/...`)
nunca respondió nada (timeout).

Causa encontrada: el TP-Link **no está conectado directo a internet**. Su
propia pantalla de Estado muestra IP de WAN `192.168.1.x` (rango privado) con
gateway `192.168.1.1` — eso es el router/nodo del Starlink, no el ISP. Es
decir, hay un **doble NAT**: Starlink → (NAT) → TP-Link → (NAT) → terminal.
El port forwarding configurado en el TP-Link es correcto pero inútil sin una
segunda regla equivalente en el router de Starlink (forwardear 8899 hacia la
IP `192.168.1.x` del TP-Link) — y ese Starlink en particular **no tiene modo
Bypass ni opción de port forwarding** (nodo de malla/principal sin esos
controles expuestos), así que no hay forma de resolverlo desde este lado sin
cambiar de plan/hardware de Starlink.

**Por qué esto NO es un problema grave en la práctica:** el objetivo
original de este documento (ISAPI *pull* — test de conexión, sync de
colaboradores, pull de registros) es lo único que necesita esta ruta. El
fichaje en tiempo real (ISAPI *push*, el terminal conectando saliente al
VPS) ya funciona 24/7 sin depender de la PC ni del doble NAT, porque es una
conexión saliente — confirmado funcionando el 2026-07-30 (checkout de FER
vía ISAPI push, sin Tailscale). La PC con Tailscale sólo hace falta prendida
para las acciones de gestión ocasionales (alta/baja de colaboradores en el
terminal), no para el uso diario. Dado que también se decidió priorizar
ISUP (ver `hikvision-isup-arquitectura.md`) — que no depende de ninguna
conectividad entrante al local — este plan de DDNS queda en pausa
indefinida, no cancelado: si en el futuro cambia el equipo/plan de Starlink
(o se consigue exponer port forwarding de otra forma), retomar desde el
paso 5 de abajo, ya que los pasos 1-4 quedaron hechos y verificados.

**Horario real de la PC con Tailscale (confirmado 2026-07-30):** la PC se
apaga a las 15hs y se prende recién a las 8am — no queda encendida 24/7. El
laboratorio abre a las 7am (a veces hasta las 18hs), así que hay una ventana
de una hora (7-8am) donde el lugar está abierto pero la PC todavía apagada.
Esto **no afecta el fichaje en tiempo real**: tanto ISAPI push como ISUP son
conexiones salientes del terminal hacia el VPS, no pasan por esta PC — una
fichada a las 7:15am se procesa y queda registrada igual que a cualquier
otra hora. Sólo afecta a las acciones de *pull* (probar conexión, sincronizar
colaboradores, pull de registros) si alguien las necesita antes de las 8am o
después de las 15hs — en la práctica no pasa, porque esas acciones son
manuales y sólo se hacen con el lugar abierto y alguien de gestión presente.
No hay ningún cron/job automático en el CRM que dependa de esta ruta.

**Prueba de una semana en curso (arrancada 2026-07-30):** se decidió correr
ISAPI push e ISUP en paralelo una semana para ver el comportamiento real de
ISUP con el watchdog nuevo (ver `hikvision-isup-arquitectura.md` § actualización
2026-07-30 tarde) antes de decidir si conviene apagar ISAPI. No apagar nada
de esto hasta cumplir la semana de observación.

**Estado original: iniciado 2026-07-28/29, a terminar en el laboratorio
(el router está ahí físicamente).** Valores ya decididos y confirmados, ver
abajo — no volver a improvisar nombres/puertos, usar estos.

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

## Valores reales decididos (no cambiar sin razón)

- **Proveedor DDNS**: No-IP (cuenta `fernandoenciso97@gmail.com`).
- **Hostname**: `hikvision.hopto.org` — ya creado como registro tipo A en
  No-IP (2026-07-28). El IPv4 que quedó cargado al crearlo es un placeholder
  (la IP de la PC personal desde la que se creó la cuenta, NO la del
  laboratorio) — se autocorrige solo en cuanto el router del local actualice
  el registro vía el cliente DDNS nativo (paso 4). No hace falta editarlo a
  mano.
- **Puerto HTTP del terminal**: `8899` (elegido para no chocar con 8090 y
  8091, que ya usa el VPS para el webhook ISAPI y el listener ISUP
  respectivamente).
- **MAC del terminal** (para la reserva DHCP del paso 2):
  `04:03:12:1f:1f:41`.
- **IP local actual del terminal**: `192.168.0.100` (reservarla tal cual en
  el paso 2, para no tener que cambiar nada más).

## Antes de empezar

- Dejá la PC con Tailscale prendida y funcionando hasta el final del paso 5
  — es el fallback si algo falla en el medio.
- Vas a necesitar: acceso admin al router (normalmente `192.168.0.1` o
  `192.168.1.1`, usuario/contraseña en la etiqueta del router si no lo
  cambiaste) y acceso admin al terminal (por su IP local, ya lo tenés
  configurado en el CRM hoy).

## 1. Fijar el puerto HTTP del terminal

En el terminal: **System Configuration → Network → Network Service → HTTP(S)**
(la misma pantalla donde está configurado el webhook ISAPI push).

- Cambiar **HTTP Port** de `80` a **`8899`**. Reduce el ruido de bots que
  escanean el puerto 80 buscando cámaras/DVRs expuestos, y evita chocar con
  los puertos 8090/8091 que ya usa el VPS.
- HTTPS puede quedar como está (activado, puerto 443) — no hace falta
  tocarlo para esto.
- ⚠️ Después de este cambio, cualquier acceso local a `http://192.168.0.100`
  sin puerto deja de andar hasta agregar `:8899` a la URL.

## 2. Reserva de IP fija por MAC (router)

Router → **DHCP → Address Reservation** (o "Reserva de direcciones"):

- Agregar una entrada: MAC `04:03:12:1f:1f:41` → IP fija `192.168.0.100`
  (la que ya tiene hoy, así no cambia nada más).
- Reiniciar el terminal (o esperar a que renueve el DHCP) y confirmar que
  tomó esa IP.

## 3. Port forwarding (Virtual Server)

Router → **Forwarding → Virtual Servers**:

- Puerto de servicio (externo): **`8899`**.
- Puerto interno: **`8899`** (el que se configuró en el paso 1).
- IP interna: `192.168.0.100`.
- Protocolo: TCP.
- Si el WR940N permite **restringir por IP de origen** en esa regla (no
  todos los firmwares lo tienen): limitarlo a la IP pública del VPS
  (`149.50.143.129`). Si no lo tiene, seguir igual — queda cubierto por el
  usuario/contraseña del ISAPI y por no usar el puerto default.

## 4. DDNS

Router → **Dynamic DNS**:

- Ya existe la cuenta y el hostname en **No-IP**: `hikvision.hopto.org`
  (cuenta `fernandoenciso97@gmail.com`). No crear una cuenta nueva ni otro
  hostname — usar este.
- Si el WR940N soporta No-IP nativamente en su menú de DDNS: cargar ahí el
  usuario/contraseña de esa cuenta de No-IP y el hostname
  `hikvision.hopto.org`.
- Si el firmware del WR940N no tiene No-IP en la lista de proveedores
  (pasa en firmwares viejos, sólo traen DynDNS u otros): avisar para ver una
  alternativa (cliente de actualización de No-IP corriendo en algún equipo
  del local, o confirmar si hay firmware alternativo para este router).
- El router va a mantener `hikvision.hopto.org` apuntando a la IP pública
  actual del local aunque cambie (típico de ISPs residenciales/PyME en
  Argentina, IP dinámica).
- Confirmar que resuelve bien: `nslookup hikvision.hopto.org` tiene que
  devolver la IP pública actual del local (no la del VPS ni la de ninguna
  otra PC).

## 5. Apuntar el CRM al nuevo host

En `artdent-crm` → **RRHH → Terminales HikVision** → editar "Registro
Facial" (el dispositivo ISAPI real, no el de ISUP):

- Campo **"IP o hostname del terminal"**: cambiar `192.168.0.100` (o la IP
  de Tailscale, según cuál esté cargada) por **`hikvision.hopto.org`** — el
  campo ya acepta hostname además de IP.
- Campo **Puerto**: **`8899`**.
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
