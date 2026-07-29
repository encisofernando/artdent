# ArtDent vs. plataformas CRM/ERP de vanguardia — qué falta

Este análisis es distinto al de AdmGlobal: ahí comparaba contra un sistema de facturación de mostrador. Acá el punto de referencia es el nivel de plataformas SaaS de punta (Salesforce, HubSpot, Odoo, Zoho, monday.com) en términos de profundidad de producto, no de features puntuales de POS.

Cada punto está verificado contra el código real de esta sesión, no supuesto.

---

## 1. Dónde ArtDent ya compite de igual a igual (o mejor)

- **Motor de fórmulas de liquidación sin código** (`FormulaEngine`, conceptos versionados) — la mayoría de los ERPs de punta tercerizan esto a un partner de payroll; ArtDent lo tiene nativo.
- **Asistente de IA propio** (Artie, sobre Claude) con base de conocimiento propia — muchas plataformas recién están agregando esto como feature premium.
- **PWA instalable real**: `public/manifest.webmanifest` completo (standalone, iconos maskable, shortcuts a Dashboard/Nueva Venta/Órdenes) + service worker con fallback offline. Esto ya es equivalente a lo que ofrecen apps móviles "ligeras" de plataformas grandes, sin haber construido una app nativa.
- **Integración biométrica + kiosks en tiempo real** (HikVision, Reverb) — nivel de sofisticación que no suelen tener ni siquiera CRMs de punta genéricos (es vertical-specific).
- **Multi-tenant real con aislamiento de datos por base de datos** — arquitectónicamente más robusto que el modelo "una tabla con company_id" que usan muchos SaaS medianos.

---

## 2. Brechas reales frente al estado del arte

Ordenadas de mayor a menor impacto de negocio para un laboratorio dental específicamente (no genérico).

### 2.1. ✅ Portal de autogestión para el odontólogo — IMPLEMENTADO (con login real por email + código)
Portal en `/dentist-portal`: estado de las últimas 20 órdenes con badge de color, saldo de cuenta corriente (`LabAccount`/`LabAccountMove`, ya existían y no se usaban para esto), historial de movimientos con comprobante en PDF descargable, y un botón "Pedir retiro" que notifica al laboratorio (`CrmNotification`) y queda registrado como interacción de CRM (`CrmInteraction`).

**Acceso**: reemplazado el link secreto permanente por un login real — el odontólogo ingresa su email, recibe un código numérico de 4 dígitos por correo (de un solo uso, vence en 10 minutos, máximo 5 intentos), y con el checkbox "Recordarme" la sesión se mantiene 60 días vía una cookie firmada con un token propio hasheado (no reutiliza el remember_token de ningún guard de Laravel, es una guarda de sesión independiente igual en espíritu a la que ya existía para el portal de colaboradores por PIN). Con rate limiting (3 pedidos de código cada 10 minutos por email+IP) y sin filtrar si un email existe o no en las respuestas.

**Comprobante de cuenta**: dado que hoy no existe una facturación AFIP real para los trabajos de laboratorio (se confirmó que `Job.invoice_id` nunca se usa en todo el código), se generó un comprobante interno de cuenta corriente en PDF por cada cargo/nota — explícitamente marcado como "no válido como factura" — en vez de simular una factura fiscal que el sistema no emite realmente.

### 2.2. Pipeline comercial (captar nuevos odontólogos clientes)
**No existe** — solo hay un log de interacciones (`CrmInteraction`: llamada/email/whatsapp/visita, con resultado y fecha de seguimiento) y una ficha de contacto (`CrmClient`), pero sin etapas de embudo (prospecto → contactado → demo → cliente → perdido). Es un CRM de registro, no un CRM de ventas. Si el laboratorio activamente sale a buscar nuevos odontólogos clientes, esto importa; si el crecimiento es por referidos/orgánico, es menos urgente.

### 2.3. Motor de automatización genérico ("si esto, entonces esto")
**No existe.** Cada automatización (alerta de stock bajo, webhook de HikVision, recordatorio de pedido impago) está programada a mano, caso por caso. Las plataformas de punta dejan que el usuario arme sus propias reglas sin tocar código. Es una inversión arquitectónica grande — vale la pena solo si se prevé necesitar reglas nuevas constantemente; si no, seguir agregando automatizaciones puntuales (como se hizo esta sesión) es más barato.

### 2.4. Auditoría transversal (quién cambió qué, en cualquier módulo)
**No existe.** Solo hay historiales puntuales por módulo (`JobStatusHistory`, `CustomerAccountMove`). No hay un log de auditoría genérico tipo `spatie/laravel-activitylog` que registre cambios en cualquier entidad del sistema. Importa para trazabilidad legal/contable y para poder responder "¿quién modificó este precio/permiso/dato?" sin tener que haberlo previsto módulo por módulo.

### 2.5. Tareas y recordatorios genéricos
**No existe.** `CrmClient.next_followup_at`/`CrmInteraction.followup_date` son campos de fecha sueltos, no un sistema real de tareas asignables con recordatorio y bandeja de pendientes ("llamar al Dr. Pérez el viernes"). Es una pieza chica pero muy usada en cualquier CRM de punta para que nada se caiga por el olvido humano.

### 2.6. API pública documentada + webhooks salientes
**No existe** como tal. Hay una API interna (`routes/api.php`) pero está pensada solo para el frontend de e-commerce propio, no versionada ni documentada para terceros. Los webhooks que existen (Mercado Pago, HikVision) son todos entrantes — no hay forma de que un odontólogo o un partner externo se suscriba a eventos de ArtDent (ej. "avisame cuando mi orden esté lista"). Esto es lo que habilitaría integraciones tipo Zapier a futuro.

### 2.7. Reportes / BI configurable por el usuario
**No existe.** Todos los reportes (Dashboard, Costos y Ganancias, Reportes RRHH) tienen estructura fija definida en código. Las plataformas de punta dejan armar un reporte a medida arrastrando campos y filtros. Alto esfuerzo de construir bien; se puede vivir sin esto bastante tiempo agregando reportes puntuales como se hizo esta sesión.

### 2.8. Seguridad: 2FA / SSO empresarial
**No existe.** Hay login social (`laravel/socialite`) pero ningún segundo factor de autenticación ni SSO (SAML/OIDC) para clientes corporativos. Si en algún momento un odontólogo grande o una cadena pide SSO para sus empleados, hoy no se podría ofrecer.

### 2.9. Pronóstico de demanda de inventario
**No existe.** La alerta de stock bajo es un umbral estático (`min_stock`), no una sugerencia de punto de reposición basada en velocidad de venta histórica. Con los datos que ya existen (`StockMovement`, `SaleItem`) esto es construible sin depender de nada externo — es más una mejora incremental que una brecha arquitectónica.

---

## 3. Recomendación de prioridad

Si tuviera que elegir dónde invertir primero, en este orden:

1. **Portal del odontólogo** — impacto de negocio directo y tangible, reutiliza patrones ya construidos (Mi Portal de empleados, cuenta corriente de clientes).
2. **Tareas y recordatorios** + **auditoría transversal** — piezas relativamente chicas, alto valor de "no se me cae nada" y trazabilidad, bajo riesgo.
3. **Pipeline comercial** — solo si el laboratorio efectivamente prospecta activamente nuevos clientes; si no, no es prioritario.
4. **Pronóstico de demanda** — mejora incremental sobre algo que ya funciona.
5. **API pública/webhooks, motor de automatización, BI configurable, 2FA/SSO** — inversiones grandes, evaluar solo si hay una necesidad concreta hoy (un partner pidiendo integración, un cliente pidiendo SSO), no "porque las plataformas grandes lo tienen".
