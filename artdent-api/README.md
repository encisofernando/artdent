# ArtDent API - Paquete funcional

## Qué es esto
Archivos listos para soltar en tu proyecto Laravel (11/12). Incluye:
- Rutas API, controladores, modelos, servicios de stock
- CORS configurado
- Seeders de tipos de factura
- `.env.example` para XAMPP (cache en archivos)

## Pasos
1) Descomprimir en la **raíz** del proyecto (aceptar sobrescribir cuando aplique).
2) Copiar `.env.example` a `.env` y ajustar claves si fuese necesario.
3) Instalar Sanctum y migrar **solo** sus tablas (no toque tus tablas importadas):
   ```bash
   composer require laravel/sanctum
   php artisan migrate --path=vendor/laravel/sanctum/database/migrations
   ```
4) (Opcional) Semillas de tipos de factura:
   ```bash
   php artisan db:seed --class=Database\\Seeders\\InvoiceTypeSeeder
   ```
5) Limpiar cachés y levantar:
   ```bash
   php artisan config:clear
   php artisan cache:clear --store=file
   php artisan optimize:clear
   php artisan serve --host=127.0.0.1 --port=8000
   ```
6) Probar endpoints:
   - Ping: `GET /api/ping`
   - Register: `POST /api/auth/register` con JSON
   - Login: `POST /api/auth/login`

> Nota: Si tenías migraciones base de Laravel que chocan con tu SQL (users, jobs, etc.), mantenelas deshabilitadas (mover a `database/migrations/_disabled`).

## Endpoints principales
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `POST /api/auth/logout`
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/{id}`
- `PUT/PATCH /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/stock/low?min=1`
- `GET /api/stock/{productId}`
- `POST /api/sales`
- `GET /api/sales/{id}`
- `POST /api/invoices`
- `GET /api/invoices/{id}`

## Notas
- `InvoicesController` devuelve autorización **mock** (CAE ficticio). Para AFIP/ARCA agregaremos el cliente WS.
- Todos los recursos filtran por `company_id` del usuario autenticado.
