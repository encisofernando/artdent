# Artículos (productos)
Estos servicios y mappers están listos para tu backend Laravel:
- `Products` → CRUD + `toggleProductActive()`
- `Catalog` → `listCategories()`, `listTaxes()`, `listPromotions()` (safe fallback), `listSuppliers()`

Los formularios existentes (`CrearArticulo.jsx` / `EditarArticulo.jsx`) pueden seguir enviando los mismos nombres.
El service traduce al esquema backend (`name`, `sku`, `barcode`, `price`, `cost`, `tax_id/tax_rate`, `category_id`, `is_active`, `track_stock`, `min_stock`).