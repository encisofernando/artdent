# Comparativa ArtDent vs. AdmGlobal (planes.html) — Oportunidades de mejora

Fuente analizada: https://www.admglobal.com.ar/planes.html (planes Simple / Plus / Avanzado, $140.000–$390.000, sistema de facturación/POS de escritorio para comercios genéricos, no específico de laboratorios dentales).

**Aclaración de contexto**: AdmGlobal es un sistema de facturación de punto de venta para comercio minorista (kiosco, despensa, ferretería, etc.), instalado localmente en una PC Windows. ArtDent es un ERP/CRM web multi-tenant para laboratorios dentales, con módulos que AdmGlobal ni siquiera contempla (Laboratorio, RRHH completo, portal del empleado, biometría). Por eso esta comparación filtra lo que aplica realmente al negocio y descarta lo que es propio de un comercio minorista de mostrador.

---

## 1. Cosas que ArtDent ya tiene igual o mejor (no requieren trabajo)

| Feature de AdmGlobal | Estado en ArtDent |
|---|---|
| Factura electrónica fiscal | Ya integrado en producción contra AFIP/ARCA (`app/Services/Afip/*`), PV 10, monotributista |
| Sin límite de comprobantes / múltiples CUITs | ArtDent es multi-tenant SaaS: cada empresa es independiente y no tiene límites artificiales de comprobantes ni de "licencias" |
| 1/2/6 licencias según plan | ArtDent no cobra por usuario/licencia — cualquier cantidad de usuarios con roles y permisos (Spatie) |
| Envío de comprobante por correo (Gmail/Yahoo) | Ya existe (`app/Mail/InvoiceAfipMail.php`) |
| Libro de IVA Digital | Ya existe (`Contable → Libro IVA Ventas / Libro IVA Compras`) |
| Reportes de Ventas | Ya existen (`Análisis → Estadísticas/Reportes`) |
| Códigos de barra — generación e impresión de etiquetas | Ya existe (`Ventas → Etiquetas / Códigos`, varios formatos de hoja A4) |
| Asistente inteligente (ATU AI) | ArtDent ya tiene **Artie**, un chatbot propio basado en Claude (Anthropic) con base de conocimiento propia — más flexible que un asistente genérico |
| Tienda Online (WooCommerce) | ArtDent tiene una tienda propia nativa (pedidos, cupones, ofertas, banners, envíos, Mercado Pago) en vez de depender de una sincronización externa a WooCommerce — es una integración más profunda, no una limitación |
| Conexión Nube (PC y celulares, con costo extra en AdmGlobal) | No aplica como "addon": ArtDent ya es 100% web, se accede desde cualquier dispositivo con navegador sin configuración ni costo adicional |
| Promociones por combos | Existe a nivel tienda online (`Offer` model) |

---

## 2. Gaps reales que sí conviene evaluar implementar

Ordenados de mayor a menor impacto/facilidad.

### 2.1. ✅ Apertura y cierre de caja — IMPLEMENTADO
Ya existían los modelos/rutas (`CashDrawer`, `CashSession`, `CashMovement`) pero los controllers eran stubs vacíos. Se implementó la lógica completa: apertura con monto inicial, movimientos manuales (ingreso/egreso), cierre con conteo real vs. esperado (sobrante/faltante), y vínculo automático de ventas en efectivo a la sesión abierta. Páginas: `/cash-sessions`, `/cash-drawers`. Además se encontró y corrigió que las tablas nunca habían tenido una migración real (existían solo en la BD de desarrollo) — ahora hay migraciones para que cualquier tenant nuevo las reciba.

### 2.2. ✅ Aumento masivo de precios — IMPLEMENTADO
Nueva pantalla `/products/bulk-price` (botón "Precios" en Ventas → Artículos): filtra por categoría/proveedor/activos, ajusta % o monto fijo sobre precio y/o costo, con vista previa antes de aplicar.

### 2.3. ✅ Alertas de "artículos a reponer" (stock mínimo) — CORRECCIÓN: ya existía
Al revisar el código con más detalle, esto ya estaba implementado: el Dashboard (`DashboardController.php`) tiene un widget de "Stock bajo", y `Ventas → Inventario → Stock` tiene un filtro "Solo stock bajo / sin stock". No requirió trabajo.

### 2.4. ✅ Importación de clientes por CSV — IMPLEMENTADO
Botón "Importar" en Clientes con el mismo mapeo de columnas que ya existía para productos. En el camino se encontró y corrigió un bug real: `email` es `NOT NULL` en la tabla `customers`, y la primera versión pisaba el email existente con `null` al actualizar un cliente por DNI si la fila del CSV no lo traía.

### 2.5. ✅ Remito de entrega en PDF — IMPLEMENTADO (con corrección de alcance)
Al investigar se descubrió que el "comprobante no fiscal" genérico YA existía en Ventas (`receipt_type='X'`, con ticket 80mm/57mm/A4 que imprime "Comprobante no válido como factura") — no había gap ahí. El gap real era distinto: no había ningún documento para acompañar la **entrega de trabajos de laboratorio** a un odontólogo. Se implementó `/remitos`: elegí un odontólogo, seleccioná las órdenes en estado "Listo", genera un PDF de remito (con firma de "retira"/"recibí conforme") y marca esas órdenes como entregadas. Esto es más valioso para ArtDent que un remito de venta genérico, dado que el negocio es B2B laboratorio-odontólogo.

### 2.6. ✅ Cambio o devolución de un artículo vendido — IMPLEMENTADO
Nuevo modelo `SaleReturn`/`SaleReturnItem`. Desde el comprobante de una venta (ticket X) se puede seleccionar qué artículos y cuánta cantidad se devuelven, con reintegro en efectivo (movimiento de caja automático si hay una sola caja abierta), nota de crédito a la cuenta corriente del cliente, o sin reintegro (solo cambio de mercadería). Repone stock automáticamente. Probado con los tres modos de reintegro y con el guard de "no devolver más de lo vendido".

### 2.7. ✅ Costos en moneda extranjera (dólar) — IMPLEMENTADO
Confirmado con el usuario: el laboratorio sí compra insumos importados en USD. Se agregó `cost_currency`/`cost_price_usd` a `Product` y `usd_exchange_rate` a `Company`. Al cargar el costo en USD, el costo en pesos (`cost_price`, usado en todos los cálculos) se calcula solo. Desde Ventas → Precios se actualiza la cotización y se recalculan en lote todos los artículos cargados en USD.

### 2.8. ✅ Reporte de costos y ganancias (margen) — IMPLEMENTADO
Nueva pantalla `/reportes/costos-ganancias` (Análisis → Costos y Ganancias): margen por artículo en un rango de fechas, neto de devoluciones (usa el nuevo `SaleReturnItem` de 2.6), con exportación a CSV.

### 2.9. ✅ Códigos de barra múltiples por producto — IMPLEMENTADO (completo, incluye POS)
Nueva tabla `product_barcodes`: cada artículo (o variante puntual) puede tener códigos adicionales (código de proveedor, presentación en pack, etc.) además del código principal, gestionables desde la edición del artículo. Integrado a la búsqueda del catálogo, a la validación de duplicados, **y al escaneo del punto de venta** (`Sale/Create.jsx`): al pasar el lector de códigos, ahora reconoce tanto el código principal como cualquiera de los adicionales, a nivel producto o de una variante específica. De paso se corrigió un bug real preexistente: el payload del POS nunca incluía el campo `barcode` del producto base (solo el de las variantes), así que el escaneo por código principal no funcionaba para artículos sin variantes.

### 2.10. ✅ Facturación en espera (ventas "en pausa") — IMPLEMENTADO
Nueva tabla `held_sales`: desde el POS se puede "Pausar" la venta actual (guarda el carrito completo) para atender a otro cliente, y "Retomarla" después desde el botón "En espera". Al retomarla se borra el registro en espera.

---

## 3. Cosas de AdmGlobal que NO aplican a ArtDent (descartadas a propósito)

- **Venta por peso / metro / litro / bulto / caja**: es para comercio de mostrador (verdulería, ferretería), no para un laboratorio dental — sus "artículos" son servicios/trabajos e insumos que no se venden por peso.
- **Múltiples listas de precio (1/4/6 según plan)**: tiene sentido en un comercio con distintos canales (mayorista/minorista). En ArtDent el equivalente real ya existe pero a nivel de servicios de laboratorio: `Tariff` + `DentistTariffPrice` (precio personalizado por odontólogo). Extenderlo a productos retail solo valdría la pena si el laboratorio vende con más de un esquema de precios.
- **Mercado Libre (sincronización de stock y precios)**: solo aplica si el laboratorio vendiera productos en ese marketplace, lo cual no parece ser el modelo de negocio actual (B2B con odontólogos, no venta directa a consumidores por marketplace).
- **Marca Blanca (White Label)**: solo sería relevante si ArtDent se fuera a revender como producto a otros laboratorios bajo otra marca — no es el caso actual, es una empresa usando su propio sistema.
- **Reporte de Convenio Multilateral**: aplica a comercios con ingresos brutos en múltiples jurisdicciones simultáneamente con ese régimen específico; no hay indicio de que aplique al laboratorio hoy.
- **Requisitos de sistema (Windows, 4GB RAM, etc.)**: no aplica, ArtDent es 100% web.

---

## 4. Estado final

Las 10 mejoras identificadas en la sección 2 están implementadas y verificadas (2 de ellas — stock mínimo y comprobante no fiscal — resultaron ya existir en el sistema con otro nombre/ubicación, corregido en el análisis). Todo el trabajo fue probado con datos reales de principio a fin (no solo "sin excepción") y no introdujo regresiones en la suite de tests existente. No queda ningún pendiente abierto de esta comparación.
