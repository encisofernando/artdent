# Handoff MercadoPago Local - 2026-04-04

## Objetivo

Dejar documentado el estado actual de la prueba integral del checkout del e-commerce local contra `artdent-crm`, usando MercadoPago.

## Alcance acordado

- `artdent_admin` no se toca.
- El `e-commerce` debe leer y operar **directamente contra `artdent-crm`**.
- La configuración de MercadoPago se carga en el CRM desde:
  - `http://127.0.0.1:8000/ecommerce-payment-configs`
- Esa configuración se guarda en la base del CRM (`ecommerce_payment_configs`).

## Estado confirmado hoy

### 1. Configuración de MercadoPago que está leyendo el CRM

Se verificó en DB/config del CRM que `mercadopago` está tomando:

- `public_key`: `[REDACTADO]`
- `access_token`: `[REDACTADO]`
- `webhook_secret`: presente

Archivo relevante:
- `artdent-crm/app/Http/Controllers/Api/PaymentController.php`

### 2. El shop local está usando el CRM local

Se dejó el entorno local alineado para que:

- CRM local:
  - `http://127.0.0.1:8000`
- Shop local:
  - `http://127.0.0.1:8080`

Y el frontend del shop consume:

- `http://127.0.0.1:8000/api`

### 3. La preferencia de MercadoPago se crea correctamente

Prueba manual exitosa:

```bash
curl -s -X POST http://127.0.0.1:8000/api/payment/mp/create \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  --data '{"order_code":"AMH-LAGIRR"}'
```

Respuesta obtenida:

- `preference_id`: válido
- `init_point`: válido
- `sandbox_init_point`: válido

Conclusión:

- El CRM sí puede crear la preferencia.
- El shop está usando `sandbox_init_point || init_point`.

Archivo relevante:
- `e-commerce/src/api/payment.ts`

## Correcciones ya hechas hoy

### Backend CRM

Se corrigió el manejo de credenciales para evitar que el token enmascarado se vuelva a guardar como valor real:

- `artdent-crm/app/Models/EcommercePaymentConfig.php`
- `artdent-crm/app/Http/Controllers/EcommercePaymentConfigController.php`
- `artdent-crm/app/Http/Controllers/Api/PaymentController.php`
- `artdent-crm/app/Services/MercadoPagoRefundService.php`
- `artdent-crm/app/Services/MercadoPagoReportService.php`

### Flujo del shop

Se mejoró la UX del e-commerce en estas áreas:

- títulos/metadatos
- GTM/GA4
- galería/zoom de imágenes
- navegación y título de pestaña

Eso ya quedó aparte y no bloquea la prueba de MercadoPago.

## Resultado real de la simulación end-to-end

Se corrió el checkout local completo hasta el final usando automatización de navegador.

### Flujo que sí funciona

- navegar el shop
- abrir producto
- agregar al carrito
- completar checkout
- crear pedido local
- redirigir a MercadoPago
- completar tarjeta
- elegir cuotas
- llegar a la pantalla final de revisión

### Donde falla hoy

Al confirmar el pago final, MercadoPago devuelve:

- título: `Algo salió mal...`
- mensaje: `No pudimos procesar tu pago`

URL final observada:

- `https://sandbox.mercadopago.com.ar/.../congrats/recover/error/...`

Conclusión actual:

- **el flujo de la app ya no está roto**
- el rechazo ahora es **real de MercadoPago**, no un bug del frontend ni del CRM

## Hipótesis principal para mañana

La configuración actual mezcla:

- credenciales `APP_USR` / productivas cargadas en el CRM
- checkout usando `sandbox_init_point`
- tarjetas/estados de prueba de MercadoPago (`APRO`, etc.)

Eso puede ser la causa del rechazo final.

### Punto a verificar mañana

Determinar cuál de estas combinaciones es la válida para completar una aprobación real en el entorno actual:

1. credenciales productivas + `sandbox_init_point` + tarjetas de prueba
2. credenciales productivas + `init_point` + usuario de prueba
3. credenciales de prueba + `sandbox_init_point` + usuario/tarjetas de prueba

## Scripts temporales útiles

Se usaron scripts en:

- `/tmp/artdent-pw/mp-e2e-localhostrun.mjs`
- `/tmp/artdent-pw/mp-debug-cvv.mjs`
- `/tmp/artdent-pw/mp-inspect-installments.mjs`
- `/tmp/artdent-pw/mp-finish-checkout.mjs`
- `/tmp/artdent-pw/mp-complete-payment.mjs`

El más útil para retomar mañana es:

- `/tmp/artdent-pw/mp-complete-payment.mjs`

Ese script ya:

- crea pedido local
- entra al checkout MP
- completa tarjeta
- elige `1x`
- hace click en pagar

## Último resultado concreto de hoy

Pedido creado por la prueba:

- `XV9-GXWQAQ`

Resultado:

- finalizó en página de error de MercadoPago

## Logs a revisar mañana

Archivo:

- `artdent-crm/storage/logs/laravel.log`

Buscar:

- `MercadoPago preference request`
- `MercadoPago preference error`
- cualquier webhook posterior al intento final de pago

## Tablas/entidades clave

- `ecommerce_orders`
- `ecommerce_payment_configs`

Validar mañana si después del intento de pago cambia alguno de estos campos:

- `status`
- `payment_status`
- `mp_payment_id`

## Credenciales de prueba entregadas por el usuario

### Cuenta de prueba MercadoPago

- País: Argentina
- User ID: `3313855472`
- Usuario: `TESTUSER377646805939070134`
- Contraseña: `kCdOJdzObe`
- Código de verificación: `855472`

### Tarjetas de prueba visibles

- Mastercard: `5031 7557 3453 0604` - CVV `123` - `11/30`
- Visa: `4509 9535 6623 3704` - CVV `123` - `11/30`
- Amex: `3711 803032 57522` - CVV `1234` - `11/30`

### Estados de pago visibles

- `APRO` -> pago aprobado, documento `12345678`
- `OTHE`
- `CONT`
- `CALL`
- `FUND`
- `SECU`
- `EXPI`
- `FORM`

## Sugerencia de arranque para mañana

1. Verificar si el checkout del shop debe usar `init_point` en vez de `sandbox_init_point` cuando la config del CRM es productiva.
2. Repetir la compra con el script existente.
3. Si vuelve a rechazar, revisar si MercadoPago requiere otra combinación de credencial + entorno.
4. Confirmar en DB si el pedido queda siempre `pending`.

## Estado de cierre de hoy

- No quedó nada más desplegado por este tema después del último intento.
- El código del proyecto quedó estable.
- La integración ya está lo suficientemente avanzada como para concentrarse mañana solo en la compatibilidad real con MercadoPago.
