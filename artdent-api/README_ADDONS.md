# Addons: Warehouses, Customers, Purchases & AFIP WSFE + QR (scaffold)

## Qué incluye
- CRUD `WarehousesController`, `CustomersController`.
- `PurchasesController` para **entradas de stock** (usa `StockService->moveIn()`).
- Cliente AFIP WSFE: `App/Services/EInvoicing/AfipWsClient.php` (WSAA loginCms + FECAESolicitar).
- QR: `App/Services/EInvoicing/AfipQrService.php` y `config/afip.php`.

## Instalación
1) Copiar estos archivos en tu proyecto.
2) Agregar las rutas del archivo `routes_patch.txt` dentro del grupo `auth:sanctum` en `routes/api.php`.
3) Crear `storage/afip/` y colocar `cert.crt` y `key.key`.
4) Variables `.env`:
```
AFIP_ENV=homologacion
AFIP_CUIT=20123456789
AFIP_CERT_PATH="storage/afip/cert.crt"
AFIP_KEY_PATH="storage/afip/key.key"
AFIP_WSAA_URL="https://wsaahomo.afip.gov.ar/ws/services/LoginCms"
AFIP_WSFE_URL="https://wswhomo.afip.gov.ar/wsfev1/service.asmx"
AFIP_POS=1
AFIP_QR_BASE="https://www.afip.gob.ar/fe/qr/?p="
```
5) Requisitos: PHP con **openssl** habilitado.
