# Plan de Implementación — Retiro de Insumos del Laboratorio

## Objetivo

Permitir registrar el retiro de insumos del stock del laboratorio a precio de costo, generando un ticket imprimible y dejando automáticamente un registro en gastos/egresos.

---

## Contexto del sistema actual

| Elemento | Estado |
|---|---|
| `stock_movements` | Soporta type `out` + `reference_type` / `reference_id` |
| `expenses` | Tiene columna `scope` (puede ser `'lab'`) |
| `products.cost` | Precio de costo ya existe en el modelo |
| `products.internal_use` | Flag para productos solo de uso interno |
| Compras (Purchase) | Patrón de referencia para el formulario multi-ítem |
| PurchaseController | Implementado, sirve de referencia directa |

No existe todavía ningún flujo específico de "retiro interno" ni tabla dedicada.

---

## Modelo de datos

### Tabla nueva: `lab_supply_withdrawals`

```
id                bigint PK
company_id        bigint FK → companies
warehouse_id      bigint FK → warehouses
user_id           bigint FK → users (quien registra)
collaborator_id   bigint nullable FK → collaborators (quien retira)
status            enum('draft','confirmed','cancelled')  default 'confirmed'
total_cost        decimal(12,2)
notes             text nullable
withdrawn_at      date
created_at / updated_at
```

### Tabla nueva: `lab_supply_withdrawal_items`

```
id               bigint PK
withdrawal_id    bigint FK → lab_supply_withdrawals
product_id       bigint FK → products
variant_id       bigint nullable FK → product_variants
quantity         decimal(12,3)
unit_cost        decimal(12,2)   -- snapshot del cost al momento del retiro
total            decimal(12,2)   -- quantity × unit_cost
```

---

## Flujo completo al confirmar un retiro

```
Usuario crea retiro
       │
       ▼
[lab_supply_withdrawals] → status = 'confirmed'
       │
       ├─► Por cada ítem:
       │     ├─ INSERT stock_movements
       │     │    type = 'out'
       │     │    reference_type = 'lab_withdrawal'
       │     │    reference_id = withdrawal.id
       │     │    quantity = -qty
       │     │
       │     └─ UPDATE stocks (reducir quantity)
       │
       └─► INSERT expenses
             company_id  = withdrawal.company_id
             scope       = 'lab'
             description = 'Retiro de insumos #NRO'
             amount      = withdrawal.total_cost
             expense_date = withdrawal.withdrawn_at
             reference   = 'lab_withdrawal:{id}'
             expense_category_id = [cat. "Insumos Lab"]
```

---

## Archivos a crear / modificar

### Migrations (en orden)

1. `create_lab_supply_withdrawals_table.php`
2. `create_lab_supply_withdrawal_items_table.php`
3. `add_lab_withdrawal_to_stock_movements_type_enum.php` *(agregar `'lab_withdrawal'` al enum)*

### Modelos

- `app/Models/LabSupplyWithdrawal.php`
  - `belongsTo`: company, warehouse, user, collaborator
  - `hasMany`: items
  - `hasOne`: expense (via `reference_type`)

- `app/Models/LabSupplyWithdrawalItem.php`
  - `belongsTo`: withdrawal, product, variant

### Controlador

- `app/Http/Controllers/LabWithdrawalController.php`
  - `index()` — listado con filtros (colaborador, fecha, estado)
  - `create()` — formulario (mismo patrón que PurchaseController)
  - `store()` — valida, crea retiro + items, dispara acciones
  - `show()` — detalle / ticket imprimible
  - `destroy()` — cancela (revierte stock + expense)

### Servicio (lógica de negocio)

- `app/Services/LabWithdrawalService.php`
  - `confirm(LabSupplyWithdrawal $withdrawal): void`
    - Itera ítems → inserta `StockMovement` → actualiza `Stock`
    - Crea `Expense` con scope `'lab'`
  - `cancel(LabSupplyWithdrawal $withdrawal): void`
    - Inserta movimientos de reversa
    - Soft-deletes o anula el expense

### Form Requests

- `app/Http/Requests/StoreLabWithdrawalRequest.php`

### Rutas

```php
// routes/modules/inventory.php
Route::resource('lab-withdrawals', LabWithdrawalController::class)
    ->only(['index', 'create', 'store', 'show', 'destroy']);
```

### Páginas React (Inertia)

| Archivo | Descripción |
|---|---|
| `resources/js/Pages/LabWithdrawal/Index.tsx` | Tabla con filtros, link a ticket |
| `resources/js/Pages/LabWithdrawal/Create.tsx` | Formulario multi-ítem (clonar lógica de Purchase/Create) |
| `resources/js/Pages/LabWithdrawal/Show.tsx` | Detalle + ticket imprimible (botón print) |

---

## Ticket imprimible

El `Show.tsx` debe incluir:

- Número de retiro (`#0001`)
- Fecha
- Colaborador que retira
- Tabla: Producto | Cantidad | Precio unitario (costo) | Subtotal
- **Total a precio de costo**
- Nota / observación
- Sección de firma

Botón `Imprimir` que llama `window.print()` con CSS `@media print` que oculta la navegación y muestra solo el ticket.

---

## Integración con Gastos

Al confirmar el retiro se crea automáticamente un registro en `expenses`:

```
description  = "Retiro insumos #0001 — [nombre colaborador]"
scope        = 'lab'
amount       = total_cost
expense_date = withdrawn_at
reference    = 'lab_withdrawal:1'
expense_category_id = ID de la categoría "Insumos / Consumibles"
```

El listado de `Gastos` filtrando por `scope = 'lab'` mostrará todos los retiros históricos.

---

## Orden de implementación sugerido

1. **Migrations** — crear las dos tablas nuevas + agregar enum
2. **Modelos** — LabSupplyWithdrawal + LabSupplyWithdrawalItem
3. **LabWithdrawalService** — confirm() y cancel()
4. **StoreLabWithdrawalRequest** — validación
5. **LabWithdrawalController** — index, create, store, show, destroy
6. **Rutas** — agregar al módulo inventory
7. **Index.tsx** — listado básico
8. **Create.tsx** — formulario (busca producto, muestra costo, agrega ítems)
9. **Show.tsx** — detalle + ticket con print CSS
10. **Sidebar/nav** — agregar link en el menú de Inventario

---

## Notas adicionales

- **Precio de costo**: tomar `products.cost` al momento del retiro (snapshot en `unit_cost` del ítem).
- **Stock negativo**: decidir si se permite o se bloquea el retiro cuando no hay stock suficiente.
- **Categoría de gasto "Insumos Lab"**: crear el seeder o indicar al usuario que la cree manualmente antes de usar el módulo.
- **Permisos**: el módulo puede quedar bajo el permiso existente `inventory.manage` o crear uno nuevo `lab_withdrawals.create`.
- **YESI** (repartidora): si se necesita registrar retiros de personas externas, el campo `collaborator_id` puede dejarse nullable y usar un campo `external_person` varchar.
