# Onboarding de un terminal Hikvision vía ISUP — guía operativa

Para dar de alta un terminal nuevo (o migrar uno existente de ISAPI a ISUP)
una vez que `isup-listener` esté corriendo en producción con el binding real
a HCNetSDK. Ver diseño completo en
[`hikvision-isup-arquitectura.md`](hikvision-isup-arquitectura.md).

## 1. Dar de alta el dispositivo en el CRM

1. Entrar a **RRHH → Terminales HikVision** (`/hikvision/devices`).
2. "Agregar terminal" → Tipo de conexión: **ISUP**.
3. Completar nombre y modelo (IP/usuario/contraseña no hacen falta para ISUP
   — el terminal es el que se conecta a nosotros, no al revés).
4. Al guardar, queda un **Account ID** generado (visible en la tarjeta del
   dispositivo, formato `Account ID: xxxxxxxxxxxx`). Copiarlo — hace falta en
   el paso 2.

## 2. Configurar el terminal físico

En el menú del terminal (o vía su interfaz web local):

```
Configuración → Red → Plataforma de acceso → ISUP
  Habilitar: Sí
  Modo de registro: (según firmware — "ISUP" o "Servidor de registro")
  Dirección del servidor: <IP o dominio del VPS>
  Puerto: <ISUP_LISTEN_PORT del listener, default 15900>
  Account ID: <el que copiaste en el paso 1>
```

Los nombres exactos de estos campos varían levemente entre familias de
firmware del DS-K1T320MX — buscar "Plataforma de acceso" / "ISUP" / "Platform
Access" en el menú de Red si no aparece tal cual.

## 3. Verificar la conexión

- En la lista de terminales del CRM, el badge del dispositivo debería pasar
  de **"nunca se conectó"** a **"conectado"** (puede tardar unos segundos
  después de guardar la config en el terminal).
- En el servidor: `journalctl -u isup-listener -f` — debería aparecer una
  línea `"message":"Terminal conectado"` con el `accountId` correspondiente.
- Si no conecta: confirmar que el puerto ISUP está abierto en el firewall del
  VPS (tráfico TCP crudo, no HTTP — no pasa por nginx) y que el terminal tiene
  salida a internet normal (no necesita nada especial de su lado, ni siquiera
  IP fija).

## 4. Probar con una fichada real

Hacer una fichada de prueba (huella/rostro/tarjeta) con un colaborador o
empleado que ya tenga `hik_employee_no` cargado (o cuyo ID numérico coincida
con el legajo del terminal). Confirmar en el CRM:

- Aparece un registro nuevo en **RRHH → Eventos HikVision** (`/hikvision/events`)
  asociado a este dispositivo.
- Se generó (o actualizó) el fichaje del día en Asistencia.
- Si Reverb está corriendo, la notificación en tiempo real del kiosko de
  producción se dispara igual que con ISAPI push.

## Troubleshooting

| Síntoma | Causa probable |
|---|---|
| El dispositivo nunca pasa a "conectado" | Puerto ISUP cerrado en el firewall del VPS, o Account ID mal tipeado en el terminal (debe ser exactamente igual, sin espacios). |
| Se conecta pero no llegan fichadas | Revisar `journalctl -u isup-listener` — si el evento llega pero Laravel devuelve 404/401, confirmar que `ISUP_LISTENER_TOKEN` coincide entre el `.env` del listener y el de `artdent-crm`. |
| Llega el evento pero no se registra asistencia | Ver `HikVisionEvent.error` en `/hikvision/events` — el caso más común es `employeeNo` sin matchear ningún colaborador/empleado activo (revisar `hik_employee_no`). |
| El terminal se desconecta seguido | Comportamiento esperado si hay cortes de internet en el local — el terminal reintenta solo; no requiere acción. Si es muy frecuente, revisar la estabilidad de la conexión del local, no del listener. |

## Piloto sobre ArtDent (antes de vender esto a un cliente nuevo)

Ver §4 de `hikvision-isup-arquitectura.md` — activar ISUP en el terminal de
ArtDent **sin apagar** su ISAPI actual, comparar que ambas vías generan el
mismo resultado ante la misma fichada, y sólo después de un período estable
evaluar si tiene sentido dejar de usar ISAPI para ese terminal (fuera de
alcance de esta etapa).
