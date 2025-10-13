# AFIP integrado en InvoicesController

- Reemplaza `app/Http/Controllers/InvoicesController.php` por este archivo.
- Agrega la ruta `POST /api/invoices/authorize` según `routes_patch_2.txt`.
- Requiere tener configurado `config/afip.php` y los servicios `AfipWsClient` y `AfipQrService` (del ZIP anterior de Addons).
- Variables `.env` necesarias:
  - AFIP_CUIT, AFIP_CERT_PATH, AFIP_KEY_PATH, AFIP_WSAA_URL, AFIP_WSFE_URL, AFIP_POS, AFIP_QR_BASE.

## Ejemplo de uso
POST /api/invoices
```json
{
  "sale_id": 123,
  "invoice_type_code": "C",
  "pos_number": 1
}
```

Respuesta: factura con `cae`, `cae_due_date`, `invoice_number` y `arca_response.qr_url`.
