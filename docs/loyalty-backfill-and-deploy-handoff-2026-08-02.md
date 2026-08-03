# Handoff — Fidelización, deploy a producción y Reverb pendiente (2026-08-02)

## Objetivo

Dejar documentado qué se hizo hoy en `pos.artdent.com.ar`/`shop.artdent.com.ar`, y qué falta confirmar/correr mañana antes de seguir.

## Ya hecho y verificado hoy

### 1. Fix Dashboard + Control de Ventas (deployado)

- `DashboardController::expensesFor()` ahora suma `VendorPayment` (pagos a proveedores) además de `Expense` — antes esos pagos no impactaban ningún KPI, sin importar el mes filtrado.
- `SaleController::index()` / `Sale/Index.jsx` ("Control de Ventas") ahora tiene filtro real por rango de fechas — antes no existía ninguno.
- Confirmado contra datos reales de producción: los 6 pagos a proveedores de julio 2026 ($996.885,99) ya se ven en el Dashboard de julio, y en agosto da $0 correctamente (no porque esté roto, sino porque no hubo pagos ese mes).

### 2. Fix "Invalid Date" en Pagos a Proveedores (deployado)

`resources/js/Pages/VendorPayment/Index.jsx` — `fmtDate()` asumía `payment_date` como `YYYY-MM-DD` plano; el cast `date` del modelo lo serializa como ISO completo. Se cortan los primeros 10 caracteres antes de parsear. El mismo patrón (`+ 'T00:00:00'` sobre un campo con cast `date`) existe en otras 11 pantallas (Purchase, VendorAccount, varias de RRHH) — **no se tocaron**, quedan como candidatas a revisar en otra sesión.

### 3. Módulo "Ingresos y Egresos de Insumos" (deployado, con ajuste post-feedback)

`app/Http/Controllers/InsumosFinanceController.php` + `resources/js/Pages/InsumosFinance/Index.jsx` — mismo patrón que `LabFinanceController` (scope='insumos' en vez de 'lab' sobre las tablas genéricas `expenses`/`income_records`).

Versión final (ajustada después de que el usuario viera la pantalla real y pidiera cruzar todo, no solo lo manual): la lista mezcla **ventas POS + ventas online pagadas como ingreso automático**, **pagos a proveedores como egreso automático**, más los ingresos/egresos manuales que se carguen a mano — todo no editable salvo lo manual, con link a la pantalla de origen para lo automático (mismo criterio que Laboratorio con pagos de odontólogos/colaboradores).

### 4. Sistema de puntos de fidelización — **deployado pero deshabilitado a propósito**

Ver memoria `project_loyalty_launch_status` para el detalle completo. Resumen: todo el sistema (acreditación en venta POS/pago online, canje como medio de pago / descuento en checkout, ledger idempotente) está en producción y probado, pero `loyalty_settings.is_enabled=false` para no empezar a acreditar puntos con un % sin definir.

### 5. Deriva del VPS encontrada y corregida

El VPS `pos.artdent.com.ar` (deploy no-git, alias SSH `donweb`) llevaba semanas sin sincronizarse con GitHub — faltaban 24 archivos y 7 migraciones de features ya mergeadas (Nave, Andreani, tickets de soporte, Reverb). Se sincronizó todo, se corrieron las migraciones pendientes, y se corrigió una regresión puntual (`AfipPointOfSale` faltante rompía la creación de ventas) que salió a la luz al sincronizar `routes/api.php`. Detalle completo en la memoria `project_pos_artdent_vps_deploy`.

También se hizo el mismo deploy completo para `shop.artdent.com.ar` (e-commerce) — build de más de un mes reemplazado por el actual.

### 6. Otros

- `public/sw.js` `CACHE_VERSION` bumpeado a `2026-08-02-v1` (se había pasado en el primer batch de deploys de hoy).
- Backups reales antes de tocar nada: `mysqldump` de `fer_artdent` + snapshot de código, en `/home/fer/backups/artdent/pre-loyalty-deploy-20260802-221940/` en el VPS.

## Pendiente para mañana

### A. Confirmar y correr el backfill de puntos históricos

1. El usuario entra a `/loyalty-settings` en producción y configura el % de acumulación real + `is_enabled=true`.
2. Correr contra producción:
   ```bash
   ssh donweb
   cd /home/fer/web/pos.artdent.com.ar/public_html/
   sudo -u fer php artisan loyalty:backfill --dry-run
   ```
   Muestra cuántas ventas/pedidos se acreditarían y el total en pesos, **sin confirmar nada** (rollback automático).
3. Si el número tiene sentido para el usuario, correr sin `--dry-run` para confirmarlo de verdad:
   ```bash
   sudo -u fer php artisan loyalty:backfill
   ```
   Es seguro correrlo más de una vez por error — es idempotente (ya verificado en dev: la segunda corrida saltea todo, 0 nuevos).

### B. Reverb (tiempo real) — investigación a mitad de camino, sin decisión tomada

Se encontró que:
- El código de Reverb (eventos, config) ya está sincronizado en `pos.artdent.com.ar`, pero `BROADCAST_CONNECTION=log` (desactivado) y no hay `.env` con `REVERB_*` configurado para este tenant.
- Existe un `reverb.service` (systemd) ya corriendo en el VPS, pero es **compartido entre `pos.artcode.com.ar` y `app.artcode.com.ar`** (arranca desde el codebase de ArtCode, usuario `artcode`). Su `config/reverb.php` usa el proveedor `apps.apps` como array — soporta múltiples "apps" en el mismo proceso/puerto.
- Opción más liviana: sumar `artdent` como una tercera app a ese `config/reverb.php` compartido (nuevo `REVERB_APP_ID`/`KEY`/`SECRET` para artdent) en vez de levantar un proceso nuevo — pero implica reiniciar un servicio que ya sirve tráfico real de ArtCode, hay que coordinarlo con cuidado.
- Falta confirmar si hace falta un subdominio propio (`ws.artdent.com.ar`) o alcanza con reusar `ws.artcode.com.ar` con las credenciales de app nuevas, y revisar el nginx de `ws.artcode.com.ar` para la parte de proxy WS (hay una incompatibilidad nginx+WS+HTTP2 ya resuelta ahí para ArtCode, ver memoria `project_reverb_realtime`).

No se tocó nada de esto todavía — quedó interrumpido por el reporte del bug de "Invalid Date". Retomar desde acá si se quiere seguir.

## Comandos/rutas útiles para retomar

- SSH al VPS: `ssh donweb`
- Código CRM: `/home/fer/web/pos.artdent.com.ar/public_html/`
- Código e-commerce (estático): `/home/fer/web/shop.artdent.com.ar/public_html/`
- Backups de hoy: `/home/fer/backups/artdent/pre-loyalty-deploy-20260802-221940/`
- Tenant: `artdent` (DB `fer_artdent`), company_id real = `1`
