# Documentación Técnica — ArtDent CRM

Catálogo de referencia de todos los modelos, controladores, servicios, páginas y componentes del proyecto. Generado por relevamiento automático del código; sirve como mapa de navegación del sistema, no como documentación de diseño ni de decisiones de negocio.

**Stack**: Laravel 12 + Inertia + React 19, multi-tenant (`stancl/tenancy`), un tenant = una empresa (laboratorio odontológico), `branches` como sucursales dentro de cada tenant.

---

## 1. Backend (Laravel)

### 1.1 Modelos (`app/Models`)

#### Multi-tenancy y Sistema
- **Tenant** — Inquilino (laboratorio/cliente SaaS) del sistema multi-tenant (stancl/tenancy), cada uno con su propia base de datos aislada. Relaciones: subscriptions().
- **TenantSubscription** — Suscripción de un tenant a un plan de precios, integrada con Mercado Pago. Relaciones: plan(). Campos clave: tenant_id, plan_id, mp_preapproval_id, status, next_payment_date, amount.
- **Plan** — Plan de suscripción SaaS ofrecido a los tenants (features, precio, período de prueba). Relaciones: subscriptions(). Campos clave: slug, name, price, trial_days, is_active, features.
- **UserTenantMap** — Mapeo de email de usuario a su tenant correspondiente, usado para el login centralizado multi-tenant. Campos clave: email, tenant_id.
- **Company** — Empresa/laboratorio propietaria de los datos dentro de un tenant, con configuración fiscal AFIP, WhatsApp y chatbot. Relaciones: branches(), cash_drawers(), collaborators(), crm_clients(), dentists(), ecommerce_orders(), expenses(), income_records(), invoices(), job_types(), jobs(), products(), purchases(), sales(), tariffs(), users(), chatbot_conversations(), vendors(), warehouses(). Campos clave: name, cuit, afip_point_sale, afip_environment, currency, instagram_handle, tariff_notes.
- **Branch** — Sucursal física de la empresa. Relaciones: company(), cash_drawers(), employees(), sales(). Campos clave: company_id, name, code, address, is_active.
- **User** — Usuario interno del sistema (staff/admin) con acceso al CRM/ERP. Relaciones: company(), cash_sessions(), chatbot_conversations(), collaborator_receipts(), employee(), job_collaborators(), jobs(), lab_account_moves(). Campos clave: company_id, branch_id, name, email, password.
- **Role** — Rol de usuario (extiende Spatie Permission) para control de acceso. Campos clave: name, display_name, guard_name.
- **Permission** — Permiso individual (extiende Spatie Permission) asignable a roles. Campos clave: name, guard_name.
- **RoleUser** — Tabla pivote entre roles y usuarios. Relaciones: role(), user().
- **Session** — Registro de sesiones HTTP activas de los usuarios. Campos clave: user_id, ip_address, user_agent, payload, last_activity.
- **Cache** — Modelo interno para el driver de cache en base de datos de Laravel (infraestructura). Campos clave: value, expiration.
- **CacheLock** — Modelo interno para los locks del driver de cache de Laravel. Campos clave: owner, expiration.
- **KioskAllowedIp** — IP autorizada para operar el modo kiosco (fichado biométrico/POS restringido). Campos clave: label, ip_address, is_active.

#### Clínica y Laboratorio Dental
- **Dentist** — Odontólogo/clínica cliente que encarga trabajos de laboratorio (con portal propio). Relaciones: company(), tariffs(), jobs(), lab_account(), patients(), crm_interactions(), login_codes(), delivery_routes(), supply_sales(). Campos clave: company_id, name, cuit, credit_limit, discount_pct, zone.
- **DentistDeliveryRoute** — Ruta de entrega/retiro de trabajos asignada a un dentista. Relaciones: company(), dentist(). Campos clave: dentist_id, route_name, delivery_day, address.
- **DentistLoginCode** — Código OTP temporal para el login del portal de dentistas. Relaciones: dentist(). Campos clave: dentist_id, code, expires_at, used_at.
- **DentistTariffPrice** — Precio especial de una tarifa negociado con un dentista puntual. Relaciones: dentist(), tariff(). Campos clave: dentist_id, tariff_id, price.
- **Patient** — Paciente del dentista asociado a los trabajos de laboratorio. Relaciones: dentist(), jobs(). Campos clave: dentist_id, name, dni, birth_date.
- **Job** — Orden de trabajo de laboratorio (pieza protésica); entidad central del negocio. Relaciones: company(), dentist(), patient(), job_type(), user(), receivedBy(), job_attachments(), collaborators(), job_items(), job_status_histories(), job_teeths(), remakes(), phaseProgress(), phaseTickets(). Campos clave: job_number, status, priority, due_date, total.
- **JobAttachment** — Archivo adjunto (foto/documento) de un trabajo. Relaciones: job(). Campos clave: job_id, filename, url, mime_type.
- **JobCollaborator** — Pivote de colaboradores asignados a un trabajo. Relaciones: user(), collaborator(), job(). Campos clave: job_id, collaborator_id, role, assigned_at.
- **JobItem** — Ítem/línea de un trabajo que referencia una tarifa. Relaciones: job(), tariff(). Campos clave: job_id, tariff_id, quantity, unit_price, total.
- **JobPhaseCollaborator** — Colaborador que participó en una fase del trabajo (reparto de comisión). Relaciones: phase(), collaborator(). Campos clave: job_phase_progress_id, collaborator_id, commission_share.
- **JobPhaseProgress** — Avance de una fase de producción de un trabajo, según plantilla de fases. Relaciones: job(), tariffPhase(), collaborator(), labAccountMove(), phaseCollaborators(), ticket(). Campos clave: job_id, tariff_phase_id, status, started_at, completed_at.
- **JobPhaseTicket** — Ticket/comprobante impreso de una fase completada. Relaciones: job(), phaseProgress(), collaborator(). Campos clave: job_id, ticket_number, phase_name, amount.
- **JobRemake** — Rehecho de un trabajo por error, con análisis de responsabilidad y costo. Relaciones: job(), original_job(), reported_by_user(). Campos clave: job_id, original_job_id, responsibility, material_cost, labor_cost.
- **JobStatusHistory** — Historial de cambios de estado de un trabajo. Relaciones: job(). Campos clave: job_id, user_id, status, note.
- **JobTeeth** — Pieza dental (diente) asociada a un trabajo. Relaciones: job(). Campos clave: job_id, tooth, note.
- **JobType** — Tipo/categoría de trabajo de laboratorio. Relaciones: company(), jobs(). Campos clave: company_id, name, color.
- **PhaseTemplate** — Plantilla reutilizable de fase de producción (con precio) para armar tarifas; catálogo central de fases que propaga precio a los aranceles que la usan. Relaciones: company(), tariffPhases(). Campos clave: company_id, name, price.
- **Tariff** — Tarifa/nomenclador de precios de trabajos de laboratorio (arancel). Relaciones: company(), costs(), dentists(), job_items(), phases(). Campos clave: company_id, code, name, category, price, margin_pct.
- **TariffCost** — Costo de insumo asociado a una tarifa, usado para calcular margen. Relaciones: tariff(). Campos clave: tariff_id, type, unit_cost, quantity, margin_pct.
- **TariffPhase** — Fase de producción configurada dentro de una tarifa. Relaciones: tariff(), phaseTemplate(), jobPhaseProgress(). Campos clave: tariff_id, phase_template_id, name, price, sort_order.
- **LabAccount** — Cuenta corriente del laboratorio con un dentista. Relaciones: dentist(), moves(). Campos clave: dentist_id, balance.
- **LabAccountMove** — Movimiento de débito/crédito de la cuenta corriente laboratorio-dentista. Relaciones: account(), user(), paymentMethod(). Campos clave: lab_account_id, type, amount, balance_after.
- **Collaborator** — Técnico/operario de laboratorio que produce los trabajos. Relaciones: company(), collaborator_attendances(), collaborator_discounts(), collaborator_extras(), collaborator_receipts(), jobs(). Campos clave: company_id, name, hourly_rate, specialty, pin, faceio_fid.
- **CollaboratorAttendance** — Fichada de asistencia (entrada/salida) de un colaborador. Relaciones: collaborator(), company(). Campos clave: collaborator_id, work_date, time_in, time_out, hours.
- **CollaboratorDiscount** — Descuento aplicado al pago de un colaborador. Relaciones: collaborator(). Campos clave: collaborator_id, date, concept, amount.
- **CollaboratorExtra** — Adicional/extra pagado a un colaborador. Relaciones: collaborator(). Campos clave: collaborator_id, date, concept, amount.
- **CollaboratorReceipt** — Recibo de pago liquidado a un colaborador. Relaciones: collaborator(), user(), payment_method(). Campos clave: collaborator_id, period_from, period_to, gross, net, status.
- **CollaboratorWebAuthnCredential** — Credencial biométrica (WebAuthn) para fichada o login del colaborador. Relaciones: collaborator(). Campos clave: collaborator_id, credential_id, public_key.

#### RRHH y Nómina
- **ArtAccident** — Accidente laboral reportado a la ART de un empleado. Relaciones: employee(). Campos clave: employee_id, occurred_at, art_case_number, status, days_lost.
- **ArtProvider** — Aseguradora de Riesgos del Trabajo (ART) contratada por la empresa. Relaciones: company(), employees(). Campos clave: company_id, name, cuit, policy_number.
- **Department** — Departamento/área organizacional jerárquica. Relaciones: parent(), children(), positions(), employees(). Campos clave: company_id, parent_id, name.
- **Employee** — Empleado en relación de dependencia (staff administrativo), con datos legales y salariales. Relaciones: user(), branch(), department(), jobPosition(), supervisor(), subordinates(), laborAgreementCategory(), extras(), discounts(), receipts(), documents(), familyMembers(), attendances(), leaveBalances(), leaveRequests(), artProvider(), medicalExams(), artAccidents(), evaluations(), objectives(), trainingEnrollments(). Campos clave: company_id, dni, cuil, salary, hire_date.
- **EmployeeAttendance** — Fichada de asistencia del empleado. Relaciones: employee(), company(). Campos clave: employee_id, work_date, time_in, time_out, hours.
- **EmployeeDiscount** — Descuento aplicado al recibo de un empleado. Relaciones: employee(). Campos clave: employee_id, date, concept, amount.
- **EmployeeDocument** — Documento/archivo legal del legajo del empleado. Relaciones: employee(), uploadedBy(). Campos clave: employee_id, type, file_path, expires_at.
- **EmployeeExtra** — Concepto extra pagado a un empleado. Relaciones: employee(). Campos clave: employee_id, date, concept, amount.
- **EmployeeFamilyMember** — Familiar a cargo declarado del empleado (asignaciones familiares). Relaciones: employee(). Campos clave: employee_id, name, relationship, dni, disability.
- **EmployeeReceipt** — Recibo de sueldo liquidado de un empleado (cabecera). Relaciones: employee(), creator(), payrollRun(), lines(). Campos clave: employee_id, payroll_run_id, gross, net, status, paid_at.
- **EmployeeReceiptLine** — Línea de concepto (haber/descuento) dentro de un recibo de sueldo. Relaciones: receipt(), concept(). Campos clave: employee_receipt_id, payroll_concept_id, label, amount.
- **EmployeeWebAuthnCredential** — Credencial biométrica del empleado para fichada/login. Relaciones: employee(). Campos clave: employee_id, credential_id, public_key.
- **EvaluationCriterion** — Criterio de evaluación de desempeño (con peso) dentro de un ciclo. Relaciones: evaluationCycle(). Campos clave: evaluation_cycle_id, name, weight.
- **EvaluationCycle** — Ciclo/campaña de evaluación de desempeño del personal. Relaciones: company(), criteria(), evaluations(). Campos clave: company_id, name, period_start, period_end, status.
- **Evaluation** — Evaluación de desempeño de un empleado dentro de un ciclo. Relaciones: evaluationCycle(), employee(), evaluator(), scores(). Campos clave: employee_id, evaluator_id, status, summary.
- **EvaluationScore** — Puntaje otorgado a un criterio dentro de una evaluación. Relaciones: evaluation(), criterion(). Campos clave: evaluation_id, evaluation_criterion_id, score, comment.
- **HikVisionDevice** — Dispositivo biométrico HikVision (control de acceso/fichada) instalado en la empresa. Relaciones: company(), events(). Campos clave: company_id, name, ip_address, serial_no, is_active.
- **HikVisionEvent** — Evento de fichada capturado por un dispositivo HikVision. Relaciones: device(), collaborator(), employee(), attendance(). Campos clave: device_id, event_type, employee_no, event_time, processed.
- **LaborAgreement** — Convenio colectivo de trabajo aplicable a la empresa. Relaciones: categories(). Campos clave: company_id, name, code, description.
- **LaborAgreementCategory** — Categoría salarial dentro de un convenio colectivo. Relaciones: laborAgreement(), salaryScales(), employees(). Campos clave: labor_agreement_id, name, code, order.
- **LeaveBalance** — Saldo anual de días de licencia disponibles de un empleado. Relaciones: employee(), leaveType(). Campos clave: employee_id, leave_type_id, year, accrued_days, used_days.
- **LeaveRequest** — Solicitud de licencia/ausencia de un empleado. Relaciones: employee(), leaveType(), requestedBy(), approvedBy(). Campos clave: employee_id, start_date, end_date, status.
- **LeaveType** — Tipo de licencia configurable (vacaciones, enfermedad, etc). Relaciones: company(), balances(), requests(). Campos clave: company_id, code, name, paid, max_days_per_year.
- **MedicalExam** — Examen médico preocupacional/periódico de un empleado. Relaciones: employee(). Campos clave: employee_id, type, exam_date, result, expires_at.
- **Objective** — Objetivo de desempeño asignado a un empleado. Relaciones: employee(). Campos clave: employee_id, title, target, progress, status.
- **PayrollBookSubmission** — Presentación del libro de sueldos digital ante el organismo correspondiente. Relaciones: company(), payrollRun(). Campos clave: company_id, payroll_run_id, period, status.
- **PayrollConcept** — Concepto de liquidación de sueldos (haber/descuento) configurable. Relaciones: versions(). Campos clave: company_id, code, name, type, calculation_type.
- **PayrollConceptVersion** — Versión histórica de la fórmula de cálculo de un concepto de liquidación. Relaciones: concept(), createdBy(). Campos clave: payroll_concept_id, formula, effective_from, effective_to.
- **PayrollRun** — Corrida/período de liquidación de sueldos de una sucursal. Relaciones: branch(), generatedBy(), approvedBy(), receipts(). Campos clave: company_id, branch_id, period_from, period_to, status.
- **PayrollVariable** — Variable de entrada usada en las fórmulas de liquidación de sueldos. Campos clave: company_id, code, name, data_type, source.
- **Position** — Puesto/cargo dentro de un departamento. Relaciones: department(), reportsTo(), subordinatePositions(), employees(). Campos clave: company_id, department_id, name.
- **SalaryScale** — Escala salarial vigente de una categoría de convenio. Relaciones: category(), createdBy(). Campos clave: labor_agreement_category_id, base_amount, effective_from, effective_to.
- **Training** — Capacitación/curso ofrecido a empleados. Relaciones: company(), sessions(). Campos clave: company_id, name, provider, hours, category.
- **TrainingSession** — Dictado concreto (cohorte) de una capacitación. Relaciones: training(), enrollments(). Campos clave: training_id, start_date, end_date, capacity.
- **TrainingEnrollment** — Inscripción de un empleado a una sesión de capacitación. Relaciones: trainingSession(), employee(). Campos clave: training_session_id, employee_id, status, score.

#### Ventas y Facturación
- **Sale** — Venta/comprobante interno de mostrador o de insumos a dentistas (POS). Relaciones: branch(), company(), user(), cash_session(), sale_items(), sale_payments(), sale_returns(), customer(), dentist(), invoice(). Campos clave: sale_number, status, total, sale_type, dentist_id.
- **SaleItem** — Línea de producto vendido dentro de una venta. Relaciones: product(), sale(). Campos clave: sale_id, product_id, quantity, unit_price, total.
- **SalePayment** — Pago recibido (posiblemente multi-método) de una venta. Relaciones: sale(), paymentMethod(). Campos clave: sale_id, payment_method_id, amount, paid_at.
- **SaleReturn** — Devolución total/parcial de una venta. Relaciones: sale(), user(), items(). Campos clave: sale_id, reason, refund_method, total_refund.
- **SaleReturnItem** — Línea de producto devuelto dentro de una devolución. Relaciones: sale_return(), sale_item(). Campos clave: sale_return_id, sale_item_id, quantity, total.
- **CashDrawer** — Caja registradora física de una sucursal. Relaciones: branch(), company(), cash_sessions(), openSession(). Campos clave: company_id, branch_id, name, is_active.
- **CashSession** — Turno de apertura/cierre de caja de un usuario. Relaciones: cash_drawer(), user(), cash_movements(), sales(). Campos clave: cash_drawer_id, user_id, opening_amount, closing_amount, status.
- **CashMovement** — Movimiento manual de ingreso/egreso dentro de una sesión de caja. Relaciones: payment_method(), cash_session(). Campos clave: cash_session_id, type, amount, concept.
- **HeldSale** — Venta en espera ("carrito guardado") en el POS. Relaciones: user(). Campos clave: company_id, user_id, label, cart_data.
- **PaymentMethod** — Medio de pago configurable (efectivo, tarjeta, transferencia). Relaciones: cash_movements(), collaborator_receipts(), expenses(), lab_account_moves(), sale_payments(). Campos clave: name, type, surcharge_pct, applies_to.
- **Invoice** — Comprobante fiscal (factura electrónica AFIP) emitido. Relaciones: company(), invoice_type(), invoice_items(). Campos clave: invoice_type_id, point_sale, number, cae, total, status.
- **InvoiceItem** — Línea de detalle de un comprobante de factura. Relaciones: invoice(). Campos clave: invoice_id, description, quantity, unit_price, total.
- **InvoiceType** — Tipo de comprobante AFIP (A, B, C, etc). Relaciones: invoices(). Campos clave: name, afip_code, is_active.

#### Inventario y Compras
- **Category** — Categoría de productos (jerárquica) del catálogo. Relaciones: category(), categories(), products(). Campos clave: parent_id, name, slug, sort_order.
- **Product** — Producto/insumo del catálogo, de venta y/o uso interno de laboratorio. Relaciones: category(), company(), tax(), vendor(), ecommerce_order_items(), product_images(), product_variants(), purchase_items(), reviews(), sale_items(), stock_movements(), stocks(), wishlists(), offers(), barcodes(). Campos clave: sku, name, price, cost_price, track_stock, has_variants.
- **ProductAttribute** — Atributo configurable de producto (ej. color, talle). Relaciones: product_attribute_values(). Campos clave: name.
- **ProductAttributeValue** — Valor posible de un atributo de producto. Relaciones: product_attribute(), variant_attribute_values(). Campos clave: attribute_id, value.
- **ProductVariant** — Variante específica de un producto (combinación de atributos). Relaciones: product(), stocks(), variant_attribute_values(). Campos clave: product_id, sku, price, cost_price.
- **VariantAttributeValue** — Pivote que asocia una variante con sus valores de atributo. Relaciones: product_attribute_value(), product_variant(). Campos clave: variant_id, attribute_value_id.
- **ProductBarcode** — Código de barras adicional asociado a un producto/variante. Relaciones: product(), variant(). Campos clave: product_id, variant_id, barcode.
- **ProductImage** — Imagen del catálogo de un producto/variante. Relaciones: product(). Campos clave: product_id, url, sort_order, is_cover.
- **Stock** — Existencia de un producto/variante en un depósito. Relaciones: product(), product_variant(), warehouse(). Campos clave: product_id, warehouse_id, quantity, min_quantity.
- **StockMovement** — Movimiento de entrada/salida/ajuste de stock (auditoría). Relaciones: product(), warehouse(). Campos clave: product_id, type, quantity, stock_before, stock_after.
- **Warehouse** — Depósito/almacén físico de la empresa. Relaciones: company(), purchases(), stock_movements(), stocks(). Campos clave: company_id, branch_id, name, code.
- **Purchase** — Orden de compra a un proveedor. Relaciones: company(), vendor(), warehouse(), purchase_items(), user(). Campos clave: vendor_id, warehouse_id, status, total, invoice_number.
- **PurchaseItem** — Línea de producto dentro de una compra. Relaciones: product(), purchase(). Campos clave: purchase_id, product_id, quantity, unit_cost, received_qty.
- **Vendor** — Proveedor de productos/insumos. Relaciones: company(), expenses(), products(), purchases(), payments(), account(). Campos clave: company_id, name, cuit, payment_terms.
- **LabSupplyWithdrawal** — Retiro de insumos de laboratorio del depósito (para un colaborador o tercero). Relaciones: warehouse(), user(), collaborator(), items(). Campos clave: warehouse_id, collaborator_id, status, total_cost, withdrawn_at.
- **LabSupplyWithdrawalItem** — Línea de producto retirado dentro de un retiro de insumos. Relaciones: withdrawal(), product(), variant(). Campos clave: withdrawal_id, product_id, quantity, unit_cost.

#### E-commerce
- **AbandonedCart** — Carrito de compra abandonado, usado para campañas de recuperación. Campos clave: company_id, email, cart_json, notified_at, recovered_at.
- **Customer** — Cliente final de la tienda online, con autenticación propia (portal). Relaciones: customer_account(), sales(), crm_clients(), customer_addresses(), ecommerce_orders(), reviews(), wishlists(). Campos clave: name, email, dni, cuit, is_active.
- **CustomerAddress** — Dirección de envío/facturación guardada de un cliente. Relaciones: customer(). Campos clave: customer_id, label, address, city, is_default.
- **Coupon** — Cupón de descuento para la tienda online. Relaciones: coupon_usages(), ecommerce_orders(). Campos clave: code, type, value, max_uses, valid_until.
- **CouponUsage** — Registro de uso de un cupón por un cliente/pedido. Relaciones: coupon(). Campos clave: coupon_id, customer_id, order_id, used_at.
- **EcommerceOrder** — Pedido realizado en la tienda online. Relaciones: company(), coupon(), customer(), ecommerce_order_items(), shipments(), paymentReport(). Campos clave: order_number, status, payment_status, total, selected_payment_method.
- **EcommerceOrderItem** — Línea de producto dentro de un pedido online. Relaciones: ecommerce_order(), product(). Campos clave: order_id, product_id, quantity, unit_price, total.
- **EcommercePaymentConfig** — Configuración de un medio de pago habilitado en la tienda online. Campos clave: type, label, is_enabled, config.
- **EcommercePaymentReport** — Comprobante de pago manual (transferencia) subido por el cliente para validar un pedido. Relaciones: order(). Campos clave: order_id, image_path, status, reviewed_by.
- **Shipment** — Envío asociado a un pedido online. Relaciones: shipping_method(), ecommerce_order(). Campos clave: order_id, tracking_code, status, carrier.
- **ShippingMethod** — Método de envío configurable de la tienda (costo, umbral gratis). Relaciones: shipments(). Campos clave: name, type, base_cost, free_above.
- **ShippingMotoCompany** — Empresa de moto/delivery propia para reparto de pedidos. Campos clave: name, phone, price, zone.
- **ShippingPickupPoint** — Punto de retiro físico para pedidos online. Campos clave: name, address, city, schedule, accepts_cash_payment.
- **Review** — Reseña/calificación de un producto dejada por un cliente. Relaciones: customer(), product(). Campos clave: product_id, customer_id, rating, title, status.
- **Wishlist** — Lista de deseos de productos favoritos de un cliente. Relaciones: customer(), product(). Campos clave: customer_id, product_id.
- **NewsletterSubscriber** — Suscriptor al newsletter de la tienda. Campos clave: email, name, is_active.
- **HeroSlide** — Slide del carrusel principal (banner) de la tienda online. Campos clave: image_url, title, button_url, sort_order, is_active.
- **SidebarBanner** — Banner lateral promocional de la tienda online. Campos clave: title, cta_url, image_url, sort_order.
- **Offer** — Oferta/promoción aplicable a productos seleccionados. Relaciones: products(). Campos clave: name, type, value, starts_at, ends_at.

#### Contabilidad y Cuentas Corrientes
- **CustomerAccount** — Cuenta corriente de un cliente (saldo). Relaciones: customer(), moves(). Campos clave: customer_id, balance.
- **CustomerAccountMove** — Movimiento de débito/crédito en la cuenta corriente de un cliente. Relaciones: account(), user(), paymentMethod(). Campos clave: customer_account_id, type, amount, balance_after.
- **VendorAccount** — Cuenta corriente de un proveedor (saldo a pagar). Relaciones: vendor(), company(), moves(). Campos clave: vendor_id, company_id, balance.
- **VendorAccountMove** — Movimiento de la cuenta corriente de un proveedor. Relaciones: vendorAccount(), user(). Campos clave: vendor_account_id, type, amount, balance_after.
- **VendorPayment** — Pago realizado a un proveedor. Relaciones: vendor(), company(), user(), paymentMethod(). Campos clave: vendor_id, amount, payment_date, reference_no.
- **Expense** — Gasto/egreso operativo de la empresa. Relaciones: expense_category(), company(), payment_method(), vendor(). Campos clave: scope, branch_id, amount, expense_date.
- **ExpenseCategory** — Categoría de clasificación de gastos/ingresos. Relaciones: expenses(). Campos clave: name, type.
- **IncomeRecord** — Registro de ingreso extraordinario (no venta) de la empresa. Relaciones: company(), paymentMethod(), user(), category(). Campos clave: scope, amount, income_date.
- **Tax** — Impuesto/alícuota aplicable a productos (IVA). Relaciones: products(). Campos clave: name, rate, afip_code.

#### CRM y Comunicaciones
- **CrmClient** — Contacto/cliente potencial gestionado por el equipo comercial (CRM). Relaciones: company(), customer(), assigned_user(), crm_interactions(). Campos clave: type, name, email, source, assigned_user_id.
- **CrmInteraction** — Interacción registrada con un contacto de CRM (llamada, visita, etc). Relaciones: company(), user(), dentist(), crm_client(). Campos clave: type, direction, subject, followup_date.
- **CrmNotification** — Notificación interna mostrada en el panel de CRM. Campos clave: type, title, body, url, read_at.
- **ChatbotConversation** — Conversación con el chatbot de IA (soporte/ventas) de un usuario. Relaciones: company(), user(), messages(). Campos clave: company_id, user_id, title, last_message_at.
- **ChatbotMessage** — Mensaje individual dentro de una conversación con el chatbot. Relaciones: conversation(). Campos clave: conversation_id, role, content, metadata.
- **WhatsappConversation** — Conversación de WhatsApp Business con un cliente. Relaciones: company(), customer(), messages(). Campos clave: company_id, phone, customer_id, window_expires_at.
- **WhatsappMessage** — Mensaje individual dentro de una conversación de WhatsApp. Relaciones: conversation(). Campos clave: conversation_id, direction, wa_message_id, status.
- **Notification** — Notificación genérica polimórfica del sistema (Laravel notifications). Campos clave: type, notifiable_type, notifiable_id, data, read_at.

---

### 1.2 Controladores (`app/Http/Controllers`)

#### Clínica y Laboratorio (Trabajos/Jobs)
- **JobController** — Gestión integral de órdenes de trabajo (jobs) del laboratorio dental. Métodos: CRUD estándar, ticket() genera comprobante/etiqueta del trabajo.
- **JobItemController** — Ítems/piezas asociados a una orden de trabajo. CRUD estándar.
- **JobAttachmentController** — Archivos adjuntos de una orden de trabajo. CRUD estándar.
- **JobCollaboratorController** — Asignación de colaboradores a una orden de trabajo. CRUD estándar.
- **JobRemakeController** — Registro de rehechos/retrabajos. Métodos: index(), create(), store(), show(), destroy().
- **JobPhaseKioskController** — Kiosk táctil para que colaboradores tomen y completen fases de producción. Métodos: index(), availableJobs(), inProgressPhases(), takePhase(), completePhase(), sendToProof(), returnFromProof(), registerDelivery(), initializePhases().
- **CollaboratorAssignController** — API JSON del panel de asignación de jobs a colaboradores presentes. Métodos: unassignedJobs(), assignedJobs(), presentCollaborators(), assign(), unassign().
- **PhaseTemplateController** — Catálogo de plantillas de fases de producción (propaga precio a aranceles). Métodos: index(), store(), update(), destroy().
- **JobStatusHistoryController** — Historial de cambios de estado de un trabajo. CRUD estándar (scaffold).
- **JobTeethController** — Piezas dentales asociadas a un trabajo. CRUD estándar (scaffold).
- **JobTypeController** — Tipos de trabajo de laboratorio. CRUD estándar (scaffold).
- **LaboratorioController** — Listado/detalle de trabajos del laboratorio por estado. Métodos: index(), show(), store(), update().
- **DeliveryNoteController** — Remitos de entrega a dentistas. Métodos: create(), store(), pdf().
- **DentistDeliveryRouteController** — Rutas de reparto/entrega de dentistas. CRUD estándar.
- **AnalyticsController** — Reportes analíticos/KPIs de producción. Métodos: lab().
- **PatientController** — Gestión de pacientes. CRUD estándar.
- **TariffController** — Aranceles/tarifario de laboratorio. Métodos: index(), updateNotes() (texto "Importante leer"), create(), store(), edit(), update(), destroy(), pdf() (exporta arancel a PDF vía Browsershot).
- **TariffPhaseController** — Fases de producción asociadas a un arancel. CRUD estándar.
- **DentistTariffPriceController** — Precios de tarifario negociados por dentista. CRUD estándar.
- **MedicinaLaboralController** — Panel de medicina laboral (exámenes, accidentes, ART). Métodos: index().
- **MedicalExamController** — Exámenes médicos ocupacionales. Métodos: store(), update(), destroy().

#### Ventas y Facturación
- **SaleController** — Ventas/POS/facturación. Métodos: index(), create(), store(), show(), pay(), destroy(), sendEmail(), generatePdf().
- **SaleItemController** — Ítems de venta. CRUD estándar (scaffold).
- **SalePaymentController** — Pagos de venta. CRUD estándar (scaffold).
- **SaleReturnController** — Devoluciones de venta. Métodos: store().
- **HeldSaleController** — Ventas en espera del POS. Métodos: index(), store(), show(), destroy().
- **InvoiceController** — Facturas. CRUD estándar.
- **InvoiceItemController** — Ítems de factura. CRUD estándar.
- **InvoiceTypeController** — Tipos de comprobante fiscal. CRUD estándar.
- **QuoteController** — Presupuestos/cotizaciones. Métodos: index(), create(), store(), show(), destroy(), updateStatus(), sendEmail(), publicShow() (vista pública por token).
- **VentasController** — Panel simplificado de ventas/POS (legacy). Métodos: index(), pos(), show(), store().
- **CashDrawerController** — Cajas registradoras. Métodos: index(), store(), update(), destroy().
- **CashSessionController** — Sesiones de apertura/cierre de caja. Métodos: index(), store(), show(), close(), destroy().
- **CashMovementController** — Movimientos manuales de caja. Métodos: store(), destroy().
- **PaymentMethodController** — Medios de pago. CRUD estándar.
- **CouponController** — Cupones de descuento. CRUD estándar.
- **CouponUsageController** — Uso de cupones. CRUD estándar.
- **TaxController** — Impuestos/alícuotas. CRUD estándar (scaffold).
- **ReviewController** — Reseñas de clientes. Métodos: index(), update(), destroy().
- **ReportesController** — Panel de reportes generales. Métodos: index(), exportPdf().
- **ReportExportController** — Exportación de reportes (CSV/streaming): sales(), customers(), quotes(), expenses(), ivaVentas(), ivaCompras(), incomeStatement(), exportJobs(), exportDentists(), exportTariffs().
- **MercadoPagoReportController** — Conciliación de pagos MercadoPago. Métodos: index(), generate(), download().
- **UsdExchangeRateController** — Cotización del dólar. Métodos: update() (recalcula costos en pesos).
- **PadronController** — Consulta al padrón AFIP/ARCA por CUIT. Métodos: lookup(), invalidate().
- **PrintManagerDownloadController** — Instalador del agente de impresión de tickets. Métodos: download().

#### Compras y Proveedores
- **PurchaseController** — Compras a proveedores. CRUD estándar.
- **PurchaseItemController** — Ítems de compra. CRUD estándar (scaffold).
- **ComprasController** — Placeholder legado de compras. Métodos: index(), store().
- **VendorController** — Proveedores. CRUD estándar.
- **VendorAccountController** — Cuenta corriente de proveedores. Métodos: index(), show().
- **VendorPaymentController** — Pagos a proveedores. Métodos: index(), create(), store(), destroy().
- **ArtProviderController** — ART de la empresa. Métodos: store(), update(), destroy().

#### Inventario y Productos
- **ProductController** — Gestión completa del catálogo (principal). Métodos: index(), barcodeLabels(), create(), store(), edit(), update(), destroy(), bulkPriceForm(), bulkPricePreview(), bulkPriceApply() (aumento masivo de precios), importCsv(), importSql().
- **ProductosController** — Listado/edición simplificada de productos (legacy). Métodos: index(), create(), store(), edit(), update().
- **ProductAttributeController** — Atributos de producto. CRUD estándar (scaffold).
- **ProductAttributeValueController** — Valores de atributo. CRUD estándar (scaffold).
- **ProductVariantController** — Variantes de producto. CRUD estándar (scaffold).
- **VariantAttributeValueController** — Relación variante-valor de atributo. CRUD estándar (scaffold).
- **ProductImageController** — Imágenes de producto. Métodos: destroy().
- **ProductBarcodeController** — Códigos de barra de producto. Métodos: store(), destroy().
- **CategoryController** — Categorías de producto. CRUD estándar.
- **StockController** — Stock por producto/almacén. Métodos: index(), adjust(), transfer().
- **StockMovementController** — Historial de movimientos de stock. Métodos: index().
- **WarehouseController** — Almacenes/depósitos. Métodos: index(), store(), update(), destroy().

#### E-commerce
- **EcommerceOrderController** — Pedidos de la tienda online. Métodos: index(), show(), update(), generateInvoice(), destroy(), create(), store(), edit().
- **EcommerceOrderItemController** — Ítems de pedido online. CRUD estándar.
- **EcommercePaymentConfigController** — Configuración de medios de pago de la tienda. Métodos: index(), update().
- **OfferController** — Ofertas/promociones. CRUD estándar.
- **WishlistController** — Lista de deseos. CRUD estándar (scaffold).
- **NewsletterSubscriberController** — Suscriptores al newsletter. CRUD estándar (scaffold).
- **HeroSlideController** — Slides del carrusel principal. Métodos: index(), store(), update(), destroy(), apiIndex() (API pública).
- **SidebarBannerController** — Banners laterales de la tienda. Métodos: index(), store(), update(), destroy(), apiIndex().

#### Envíos (Shipping)
- **ShipmentController** — Envíos generados desde ventas/pedidos. CRUD estándar (scaffold).
- **ShippingMethodController** — Métodos de envío. CRUD estándar (scaffold).
- **ShippingMotoCompanyController** — Empresas de moto-mensajería. Métodos: index(), create(), store(), edit(), update(), destroy().
- **ShippingPickupPointController** — Puntos de retiro. Métodos: index(), create(), store(), edit(), update(), destroy().

#### RRHH y Nómina
- **EmployeeController** — Legajo laboral de empleados. Métodos: index(), store(), show(), legajo(), update(), destroy().
- **EmployeeAttendanceController** — Fichajes de empleados. CRUD (index, store, update, destroy).
- **EmployeeDiscountController** — Descuentos de recibo. CRUD (index, store, update, destroy).
- **EmployeeExtraController** — Conceptos extra de recibo. CRUD (index, store, update, destroy).
- **EmployeeDocumentController** — Documentación del legajo. Métodos: store(), destroy().
- **EmployeeFamilyMemberController** — Grupo familiar (asignaciones familiares). Métodos: store(), update(), destroy().
- **EmployeeReceiptController** — Recibos de sueldo. Métodos: index(), store(), show(), pdf(), update(), destroy().
- **DepartmentController** — Departamentos/áreas. Métodos: store(), update(), destroy().
- **PositionController** — Puestos/cargos. CRUD estándar.
- **OrganigramaController** — Organigrama jerárquico. Métodos: index().
- **LaborAgreementController** — Convenios colectivos. Métodos: store(), update(), destroy().
- **LaborAgreementCategoryController** — Categorías salariales de un convenio. Métodos: store(), update(), destroy().
- **SalaryScaleController** — Escalas salariales. Métodos: store(), destroy().
- **ConveniosController** — Vista consolidada de convenios/categorías/escalas. Métodos: index().
- **PayrollConceptController** — Conceptos de liquidación. Métodos: store(), update(), destroy(), simulate() (simula fórmula vía FormulaEngine).
- **PayrollConceptVersionController** — Versionado de fórmula de un concepto. Métodos: store(), destroy().
- **PayrollVariableController** — Variables de fórmulas de liquidación. Métodos: store(), update(), destroy().
- **ConceptosController** — Vista consolidada de variables/conceptos. Métodos: index().
- **PayrollRunController** — Corridas de liquidación de sueldos. CRUD estándar.
- **PayrollBookSubmissionController** — Presentaciones del libro de sueldos digital. Métodos: index(), store().
- **LeaveTypeController** — Tipos de licencia. CRUD estándar.
- **LeaveRequestController** — Solicitudes de licencia. Métodos: store(), update(), destroy().
- **VacacionesController** — Panel de vacaciones/licencias. Métodos: index().
- **EvaluationCycleController** — Ciclos de evaluación de desempeño. Métodos: store(), update(), destroy().
- **EvaluationCriterionController** — Criterios de evaluación. Métodos: store(), update(), destroy().
- **EvaluationController** — Evaluaciones individuales. Métodos: store(), update(), destroy().
- **EvaluacionesController** — Vista consolidada de ciclos/evaluaciones/objetivos. Métodos: index().
- **ObjectiveController** — Objetivos de desempeño. CRUD estándar.
- **TrainingController** — Capacitaciones. CRUD estándar.
- **TrainingSessionController** — Sesiones de capacitación. CRUD estándar.
- **TrainingEnrollmentController** — Inscripciones a capacitaciones. CRUD estándar.
- **CapacitacionesController** — Vista consolidada de capacitaciones/sesiones/inscripciones. Métodos: index().
- **ArtAccidentController** — Accidentes laborales (ART). Métodos: store(), update(), destroy().
- **ReportesRrhhController** — Reportes de RRHH (ausentismo, nómina, dotación). Métodos: index().

#### Colaboradores (Producción de Laboratorio)
- **CollaboratorController** — ABM de colaboradores de producción. CRUD estándar.
- **CollaboratorAttendanceController** — Fichajes de colaboradores. CRUD (index, store, update, destroy).
- **CollaboratorDiscountController** — Descuentos de recibo. CRUD (index, store, update, destroy).
- **CollaboratorExtraController** — Conceptos extra de recibo. CRUD (index, store, update, destroy).
- **CollaboratorReceiptController** — Recibos de pago del colaborador. Métodos: index(), store(), show(), update(), destroy().

#### Portales (Dentista / Colaborador / Empleado / Cliente)
- **DentistPortalController** — Portal del dentista: cuenta corriente y trabajos. Métodos: show(), requestPickup(), movePdf().
- **DentistPortalAuthController** — Login por código (email/SMS). Métodos: showLogin(), sendCode(), showVerify(), verifyCode(), logout().
- **ColaboradorPortalController** — Portal del colaborador para tomar/completar trabajos y fases. Métodos: showLogin(), login(), logout(), dashboard(), claim(), claimPhase(), showJob(), sendToPrueba(), completePhase(), showTicket().
- **EmployeePortalController** — Autogestión del empleado (recibos, licencias, legajo). Métodos: index(), misRecibos(), reciboPdf(), misLicencias(), storeLicencia(), cancelLicencia(), miLegajo(), updateLegajo().
- **CustomerPortalController** — Portal público de cliente vía token. Métodos: show().

#### CRM
- **CrmClientController** — Clientes/leads del CRM comercial. CRUD estándar.
- **CrmInteractionController** — Interacciones con clientes/dentistas. Métodos: index(), create(), store(), edit(), update(), destroy().
- **CrmNotificationController** — Notificaciones internas del CRM. Métodos: index(), markRead(), markAllRead().
- **ClientesController** — Placeholder legado de clientes. Métodos: index(), store(), update().
- **ChatbotController** — Chatbot de atención asistido por IA. Métodos: index(), history(), handle(), reset().

#### Clientes y Cuentas Corrientes
- **CustomerController** — ABM de clientes. Métodos: index(), create(), store(), show(), edit(), update(), destroy(), importCsv().
- **CustomerAddressController** — Direcciones de cliente. CRUD estándar.
- **CustomerAccountController** — Cuenta corriente del cliente. Métodos: index(), show(), storePayment(), storeAdjustment(), sendStatement().
- **DentistController** — ABM de dentistas. CRUD estándar.

#### Contabilidad / AFIP / Finanzas
- **AccountingController** — Dashboard contable general. Métodos: index().
- **AfipController** — Facturación electrónica AFIP. Métodos: generate(), dispatch(), uploadCert(), testConnection(), generateCsr(), saveSettings().
- **ExpenseController** — Gastos/egresos. CRUD estándar.
- **ExpenseCategoryController** — Categorías de gasto. CRUD estándar.
- **IncomeRecordController** — Ingresos manuales. CRUD estándar.
- **CostProfitReportController** — Reporte de costos y rentabilidad. Métodos: index(), exportCsv().
- **UsdExchangeRateController** — Cotización del dólar. CRUD estándar (ver también en Ventas).
- **LabAccountController** — Cuenta corriente laboratorio-dentista. CRUD estándar.
- **LabAccountMoveController** — Movimientos de cuenta de laboratorio. Métodos: index(), create(), store(), show().
- **LabFinanceController** — Panel financiero del laboratorio. Métodos: index(), storeIncome(), storeExpense(), destroyIncome(), destroyExpense().
- **LabWithdrawalController** — Retiros de insumos de laboratorio. Métodos: index(), create(), store(), show(), destroy().
- **PadronController** — Consulta/gestión del padrón fiscal (ver también en Ventas).

#### Kiosks y Biometría
- **AttendanceKioskController** — Kiosk no autenticado de fichaje biométrico. Métodos: index().
- **KioskAccessController** — Accesos permitidos a kiosks (IPs y tokens). Métodos: index(), storeIp(), toggleIp(), destroyIp(), storeToken(), destroyToken().
- **WebAuthnKioskController** — Registro/autenticación biométrica WebAuthn. Métodos: registrationOptions(), register(), employeeRegistrationOptions(), registerEmployee(), authenticationOptions(), verify().
- **HikVisionController** — Administración de terminales HikVision. Métodos: index(), store(), update(), destroy(), testConnection(), syncCollaborators(), subscribeEvents(), syncTime(), pullRecords(), pushCollaborator(), events().
- **HikVisionWebhookController** — Recibe eventos push de fichaje del terminal. Métodos: receive().

#### Administración y Sistema
- **UserController** — Usuarios del sistema. CRUD estándar.
- **RoleController** — Roles y permisos. CRUD estándar.
- **CompanyController** — Configuración de la empresa/tenant. Métodos: index(), edit(), update().
- **BranchController** — Sucursales. CRUD estándar.
- **ProfileController** — Perfil del usuario autenticado. Métodos: edit(), update(), destroy().
- **ApiTokenController** — Tokens de API personales (Sanctum). Métodos: index(), store(), destroy().
- **NotificationController** — Notificaciones del sistema. CRUD estándar (scaffold).
- **SidebarBannerController** — (ver E-commerce) banners promocionales.
- **SubscriptionController** — Plan/suscripción del tenant. Métodos: index(), checkout(), cancel().
- **PrintManagerDownloadController** — (ver Ventas) instalador del agente de impresión.
- **DashboardController** — Panel principal/resumen del sistema. Métodos: index().
- **HomeController** — Página de inicio pública. Métodos: index().
- **HelpController** — Centro de ayuda interno. Métodos: index().
- **Controller** — Clase base abstracta de la que heredan todos los controllers.

---

### 1.3 Servicios y Soporte (`app/Services`, `app/Support`)

#### AFIP/Facturación Electrónica
- **AfipService** (`app/Services/Afip/AfipService.php`) — Orquesta WSAA + WSFEv1 para emitir comprobantes electrónicos a partir de una venta. Métodos: generateFromSale(), allowedReceiptKeys(), suggestReceiptKey().
- **EcommerceInvoiceService** (`app/Services/Afip/EcommerceInvoiceService.php`) — Genera facturas y notas de crédito AFIP para pedidos de e-commerce. Métodos: generateInvoice(), generateCreditNote().
- **PadronService** (`app/Services/Afip/PadronService.php`) — Consulta el padrón de contribuyentes de ARCA por CUIT (cache 24hs). Métodos: getClienteByCuit(), invalidate().
- **WsaaService** (`app/Services/Afip/WsaaService.php`) — Autenticación WSAA de ARCA/AFIP, firma TRA y cachea el Ticket de Acceso (12hs). Métodos: getAuth(), invalidate().
- **WsfevService** (`app/Services/Afip/WsfevService.php`) — Cliente WSFEv1: CAE, último número autorizado, consulta de comprobantes. Métodos: getLastNumber(), requestCae(), queryInvoice().

#### RRHH/Liquidación de Sueldos
- **EmployeePayrollService** (`app/Services/EmployeePayrollService.php`) — Calcula liquidación de sueldos (básico, comisiones, conceptos por fórmula, SAC, aportes) y sincroniza recibos. Métodos: calculateTotals(), buildFormulaVariables(), calculateConceptLines(), syncReceipt(), generateForEmployee(), recordExpense(), removeExpense(), syncDrafts().
- **CollaboratorReceiptSyncService** (`app/Services/CollaboratorReceiptSyncService.php`) — Calcula y sincroniza totales de recibos de colaboradores. Métodos: calculateTotals(), syncReceipt(), syncDraftReceipts(), syncDraftReceiptsForDate().
- **LeaveService** (`app/Services/LeaveService.php`) — Gestiona licencias/vacaciones (cálculo LCT art. 150/153, saldos). Métodos: vacationEntitlementDays(), ensureBalance(), applyStatusChange().
- **HikVisionIsapiService** (`app/Services/HikVisionIsapiService.php`) — Cliente ISAPI para terminales HikVision. Métodos: testConnection(), employeeNo(), addUser(), deleteUser(), getUserList(), syncCollaborators(), pullAttendanceRecords(), subscribeEventPush(), getVerifyMode(), syncTime().
- **FormulaEngine** (`app/Services/Payroll/FormulaEngine.php`) — Motor de evaluación de fórmulas (Symfony ExpressionLanguage) para conceptos de liquidación. Métodos: evaluate(), validate().
- **LibroSueldosDigitalService** (`app/Services/Payroll/LibroSueldosDigitalService.php`) — Placeholder de integración con el Libro de Sueldos Digital/SICOSS. Métodos: buildPayload(), submit().

#### Multi-tenancy
- **CrmMode** (`app/Support/CrmMode.php`) — Determina el modo de operación (owner vs. multi-tenant SaaS) y expone info del tenant. Métodos: isOwner(), isMultiTenant(), billingEnabled(), ownerTenant(), tenantInfo().

#### Notificaciones (WhatsApp/Email)
- **WhatsAppService** (`app/Services/WhatsAppService.php`) — Envía mensajes de WhatsApp Business Cloud API. Métodos: sendTemplate(), sendText(), sendTextMessage().
- **EmailTemplateService** (`app/Services/EmailTemplateService.php`) — Resuelve y envía plantillas de email transaccional con placeholders. Métodos: resolve(), build(), send().

#### Chatbot/IA
- **ChatbotService** (`app/Services/ChatbotService.php`) — Orquesta el asistente "Artie": base de conocimiento estática + contexto dinámico + Claude. Métodos: generateResponse(), isEnabled(), getFrontendConfig(), getWelcomeMessage().
- **ChatbotKnowledgeBase** (`app/Services/ChatbotKnowledgeBase.php`) — Base de conocimiento estática con matching por palabras clave. Métodos: search() (estático).
- **ClaudeService** (`app/Services/ClaudeService.php`) — Cliente de la API de Anthropic Claude con prompt caching. Métodos: chat().
- **ProfanityFilter** (`app/Services/ProfanityFilter.php`) — Detecta contenido ofensivo, normalizando tildes/leetspeak. Métodos: contains() (estático).

#### Aranceles y Precios
- **TariffPricingService** (`app/Services/TariffPricingService.php`) — Sincroniza precio de arancel con suma de fases + margen; propaga cambios del catálogo de fases. Métodos: syncPriceFromPhases(), applyTemplateChange().
- **TariffNotesRenderer** (`app/Support/TariffNotesRenderer.php`) — Resuelve tokens `{{arancel:Nombre}}` en el texto de "Importante leer" con el precio vigente. Métodos: resolve() (estático).

#### Laboratorio / Órdenes de Trabajo
- **JobPhaseService** (`app/Services/JobPhaseService.php`) — Orquesta el ciclo de vida de fases de producción (inicio, prueba, retorno, completado, facturación a cuenta corriente, tickets, entrega). Métodos: initializePhases(), startPhase(), sendToProof(), returnFromProof(), completePhase(), buildJobTicketSummary(), finalizeJob(), registerDelivery().
- **LabWithdrawalService** (`app/Services/LabWithdrawalService.php`) — Confirma/cancela retiros de insumos, ajusta stock y gasto contable. Métodos: confirm(), cancel().

#### Ventas / Cuentas Corrientes
- **CustomerAccountSaleAllocator** (`app/Services/CustomerAccountSaleAllocator.php`) — Aplica pagos de cuenta corriente a ventas pendientes (FIFO). Métodos: outstandingAmount(), salePaymentReference(), allocatedAmountForMove(), syncSale(), getOpenSales(), applyMoveToSales(), reconcileUnlinkedPaymentsForCustomer().

#### Stock / Inventario
- **StockAlertService** (`app/Services/StockAlertService.php`) — Verifica stock tras un movimiento y notifica (con broadcast Reverb) si cae bajo el mínimo. Métodos: checkAndNotify() (estático).
- **ImageResizeService** (`app/Services/ImageResizeService.php`) — Genera versiones "full" y "thumbnail" WebP de imágenes de producto. Métodos: processUpload().

#### Pagos Online (MercadoPago / Nave)
- **MercadoPagoRefundService** (`app/Services/MercadoPagoRefundService.php`) — Reembolso total de un pedido pagado con MercadoPago. Métodos: refund().
- **MercadoPagoReportService** (`app/Services/MercadoPagoReportService.php`) — Reportes de Liquidaciones/Releases de MercadoPago. Métodos: generateReleasesReport(), getReportContent(), listReports().
- **NaveService** (`app/Services/NaveService.php`) — Integración con Nave/Ranty (Naranja X): OAuth, intenciones de pago, consulta/cancelación. Métodos: isSandbox(), posId(), accessToken(), createPaymentIntent(), getPayment(), getPaymentRequest(), cancelPaymentRequest().

#### Contabilidad
- **AccountingSettings** (`app/Support/AccountingSettings.php`) — Resuelve/sanea configuración contable de la empresa y construye obligaciones fiscales activas. Métodos: defaults(), merge(), buildObligations() (todos estáticos).
- **NumberToWordsEs** (`app/Support/NumberToWordsEs.php`) — Convierte un monto a su expresión en letras en español (recibos de sueldo). Métodos: pesos() (estático).

#### Otros
- **UserLanding** (`app/Support/UserLanding.php`) — Resuelve la URL de aterrizaje tras el login según permisos del usuario. Métodos: uriFor() (estático).

---

## 2. Frontend (React + Inertia)

### 2.1 Páginas (`resources/js/Pages`)

#### Clínica y Laboratorio
- **Job/** — Órdenes de trabajo de laboratorio con sus fases. Páginas: Index.jsx, Create.jsx, Edit.jsx, Show.jsx, Ticket.jsx.
- **JobKiosk/** — Terminal táctil (sin layout autenticado) para colaboradores de planta. Páginas: Index.jsx.
- **JobRemake/** — Rehechos/retrabajos de un trabajo. Páginas: Index.jsx, Create.jsx.
- **PhaseTemplate/** — Catálogo de plantillas de fases de producción. Páginas: Index.jsx (CRUD en modal).
- **Patient/** — Pacientes de la clínica/laboratorio. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **Dentist/** — Odontólogos/profesionales que derivan trabajos. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **DentistDeliveryRoute/** — Rutas de entrega/reparto de dentistas. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **Laboratory/** — Documentación de despacho. Páginas: DeliveryNote.jsx (remito imprimible).
- **Laboratorio/** — Stub/prototipo alternativo no integrado al flujo principal. Páginas: Index.tsx, Show.tsx.
- **Colaboradores/** — Portal de colaboradores de planta (login propio). Páginas: Login.jsx, Dashboard.jsx, JobDetail.jsx, PhaseTicket.jsx.

#### Ventas y Facturación
- **Sale/** — Ventas al público/mostrador. Páginas: Index.jsx, Create.jsx, Show.jsx.
- **Invoice/** — Comprobantes fiscales. Páginas: Index.jsx, Create.jsx, Edit.jsx, Show.jsx.
- **Tariff/** — Aranceles/lista de precios. Páginas: Index.jsx (incluye botones PDF y modal "Importante Leer"), Create.jsx, Edit.jsx (gestión de fases y margen).
- **Offer/** — Ofertas/promociones comerciales. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **Coupon/** — Cupones de descuento. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **Caja/** — Caja registradora/turnos. Páginas: Index.jsx, Show.jsx, Drawers.jsx.
- **Customer/** — Clientes y su cuenta corriente. Páginas: Index.jsx, Create.jsx, Edit.jsx, Account.jsx, AccountsIndex.jsx, ImportCsvModal.jsx.
- **Clientes/** — Stub alternativo no integrado. Páginas: Index.tsx.

#### Laboratorio — Cuentas y Finanzas de Odontólogos
- **LabAccount/** — Cuenta corriente de un odontólogo. Páginas: Show.jsx.
- **LabAccountMove/** — Movimientos de cuentas de laboratorio. Páginas: Index.jsx, Create.jsx, Show.jsx.
- **LabWithdrawal/** — Retiros de mercadería/trabajos del laboratorio. Páginas: Index.jsx, Create.jsx, Show.jsx.
- **LabFinance/** — Panel financiero del laboratorio. Páginas: Index.jsx.

#### Inventario y Compras
- **Product/** — Catálogo de productos/insumos. Páginas: Index.jsx, Create.jsx, Edit.jsx, BarcodeLabels.jsx, BarcodeLabelModal.jsx, BulkPrice.jsx, ImportExportModal.jsx.
- **Productos/** — Stub alternativo no integrado. Páginas: Index.tsx, Create.tsx, Edit.tsx.
- **Category/** — Categorías de productos. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **Stock/** — Control de stock por depósito. Páginas: Index.jsx (versión real), Index.tsx (stub duplicado no integrado).
- **StockMovement/** — Historial de movimientos de stock. Páginas: Index.jsx.
- **Warehouse/** — Depósitos/almacenes. Páginas: Index.jsx.
- **Purchase/** — Compras a proveedores. Páginas: Index.jsx, Create.jsx, Edit.jsx, Show.jsx.
- **Compras/** — Stub alternativo no integrado. Páginas: Index.tsx.
- **Vendor/** — Proveedores. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **VendorAccount/** — Cuenta corriente de proveedores. Páginas: Index.jsx, Show.jsx.
- **VendorPayment/** — Pagos a proveedores. Páginas: Index.jsx, Create.jsx.

#### RRHH
- **Employee/** — Legajo de empleados. Páginas: Index.jsx, Show.jsx.
- **EmployeeAttendance/** — Asistencia de empleados. Páginas: Index.jsx.
- **EmployeeDiscount/**, **EmployeeExtra/** — Descuentos/extras de haberes. Páginas: Index.jsx.
- **EmployeeReceipt/** — Recibos de sueldo. Páginas: Index.jsx, Show.jsx.
- **Collaborator/** — Legajo de colaboradores de planta. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **CollaboratorAttendance/** — Asistencia de colaboradores. Páginas: Index.jsx.
- **CollaboratorCompensation/** — Ajustes/compensaciones de pago. Páginas: AdjustmentIndex.jsx.
- **CollaboratorDiscount/**, **CollaboratorExtra/** — Descuentos/extras de colaboradores. Páginas: Index.jsx.
- **CollaboratorReceipt/** — Recibos de pago de colaboradores. Páginas: Index.jsx, Show.jsx.
- **AttendanceKiosk/** — Terminal de fichaje biométrico WebAuthn. Páginas: Kiosk.jsx.
- **HikVision/** — Integración con terminales biométricos. Páginas: Devices.jsx, Events.jsx.
- **Rrhh/** — Suite avanzada de RRHH. Páginas: Liquidaciones/{Index,Create,Show}.jsx, Conceptos/Index.jsx, Convenios/Index.jsx, Capacitaciones/Index.jsx, Evaluaciones/Index.jsx, Vacaciones/Index.jsx, MedicinaLaboral/Index.jsx, Organigrama/Index.jsx, LibroSueldosDigital/Index.jsx, Reportes/Index.jsx, Portal/{Index,MiLegajo,MisLicencias,MisRecibos}.jsx.

#### E-commerce
- **Ecommerce/** — Reportes de la tienda. Páginas: Reports.jsx.
- **EcommerceOrder/** — Pedidos online. Páginas: Index.jsx, Create.jsx, Edit.jsx, Show.jsx.
- **EcommercePayment/** — Pagos de pedidos online. Páginas: Index.jsx.
- **ShippingMotoCompany/**, **ShippingPickupPoint/** — Configuración de envíos. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **HeroSlide/**, **SidebarBanner/** — Contenido promocional de la tienda. Páginas: Index.jsx.
- **Review/** — Reseñas de productos. Páginas: Index.jsx.

#### Contabilidad
- **Accounting/** — Panel contable general. Páginas: Index.jsx.
- **Reportes/** — Reportes gerenciales/operativos. Páginas: Index.jsx, CostosGanancias.jsx.
- **Analytics/** — Analítica avanzada del negocio. Páginas: Lab.jsx.

#### CRM
- **Crm/** — Asistente conversacional IA. Páginas: Chatbot/Assistant.jsx.
- **CrmInteraction/** — Interacciones con clientes/prospectos. Páginas: Index.jsx, Create.jsx, Edit.jsx.

#### Administración y Configuración
- **Admin/** — Configuración general/técnica. Páginas: Settings.jsx, ApiTokens.jsx, KioskAccess.jsx, Subscription.jsx.
- **Users/** — Usuarios del sistema. Páginas: Index.jsx, Create.jsx, Edit.jsx.
- **Roles/** — Roles y permisos. Páginas: Index.jsx.
- **Profile/** — Perfil del usuario autenticado. Páginas: Edit.jsx, Partials/{UpdateProfileInformationForm,UpdatePasswordForm,DeleteUserForm}.jsx.
- **Auth/** — Autenticación Breeze/Fortify. Páginas: Login.jsx, ForgotPassword.jsx, ResetPassword.jsx, ConfirmPassword.jsx, VerifyEmail.jsx.
- **Ayuda/** — Centro de ayuda interno. Páginas: Index.jsx.

#### Otros
- **Dashboard.jsx** — Panel principal (home) tras el login: KPIs de ventas, caja, cobranzas y stock.
- **Welcome.jsx** — Landing pública de bienvenida (marketing, sin autenticación).
- **Error.jsx** — Página genérica de error (404/403/500).

---

### 2.2 Componentes Reutilizables (`resources/js/Components`)

#### Layout y Navegación
- **Sidebar** (`Components/Sidebar.jsx`) — Barra lateral principal; arma el menú filtrando por permisos, soporta colapso con flyout y multi-nivel.
- **Topbar** (`Components/Topbar.jsx`) — Header superior: notificaciones en tiempo real (Echo/Reverb), toasts, instalación PWA, descarga del gestor de impresión, toggle de tema.
- **BottomNav** (`Components/BottomNav.jsx`) — Navegación inferior mobile con FAB de "Nueva Venta".
- **NotificationBell** (`Components/NotificationBell.jsx`) — Campanita de notificaciones con dropdown.
- **Sidebar/Topbar** (`Components/layout/*.jsx`) — Variantes alternativas/experimentales del layout principal.
- **NavLink**, **ResponsiveNavLink**, **ApplicationLogo** (`Components/*.jsx`) — Componentes heredados del starter kit Breeze.

#### Formularios e Inputs
- **TextInput**, **InputLabel**, **InputError**, **Checkbox** — Inputs de formulario genéricos (Breeze).
- **PrimaryButton**, **SecondaryButton**, **DangerButton** — Botones de acción con estilo de marca.
- **Dropdown** (`Components/Dropdown.jsx`) — Menú desplegable compuesto (context-based).
- **SearchableSelect** (`Components/SearchableSelect.jsx`) — Combobox con búsqueda y dropdown vía portal.
- **RichTextEditor** (`Components/RichTextEditor.jsx`) — Editor WYSIWYG basado en Tiptap.
- **_appkit.jsx** (`Components/_appkit.jsx`) — Design system compartido: tokens de marca, `StatusChip`, `Badge`, `InputField`, `SelectField`, `Btn`, `FAB`, `BottomSheet`, `Modal`, `TabStrip`, `KpiCard`, `ProductCard`, `DatePicker`.

#### UI Primitivos (`ui/`)
- **Button**, **Card**, **Input**, **Dialog** (`Components/ui/*`) — Primitivos tipados estilo shadcn/ui (variantes, tamaños, composición).

#### Modales
- **Modal** (`Components/Modal.jsx`) — Modal genérico basado en Headless UI.
- **ModalImprimir** (`Components/Modals/ModalImprimir.jsx`) — Vista previa e impresión de ticket térmico vía iframe oculto.
- **SaleReturnModal** (`Components/Sale/SaleReturnModal.jsx`) — Gestión de cambios/devoluciones de una venta.
- **Odontogram** (`Components/Odontogram.jsx`) — Selector visual de piezas dentales (ver detalle abajo).

#### Gráficos y Dashboards
- **BarChart**, **LineChart**, **PieChart** (`Components/Charts/*.jsx`) — Gráficos Recharts con paleta de marca y tooltips custom.

#### Chatbot/Asistente IA
- **Chatbot** (`Components/Chatbot/Chatbot.jsx`) — Widget de chat flotante "Artie" (implementación monolítica standalone).
- **ArtieWidget**, **ArtieAvatar**, **ArtieMascotSVG**, **ArtiePanel**, **ArtieMessageList**, **ArtieQuickActions** (`Components/Artie/*.jsx`) — Suite modular actual del asistente Artie (orquestación, mascota animada, panel de chat, quick actions).

#### Componentes de Negocio Específicos
- **Odontogram** (`Components/Odontogram.jsx`) — Selector visual de piezas dentales (FDI) con paleta de tonos VITA.
- **TariffCostBuilder** (`Components/TariffCostBuilder.jsx`) — Constructor de desglose de costos para aranceles.
- **VariantGenerator** (`Components/VariantGenerator.jsx`) — Generador de variantes de producto por combinación de opciones.
- **FacturaA4** (`Components/Sale/FacturaA4.jsx`) — Comprobante de venta A4 (factura AFIP/ARCA) con QR de autorización.
- **TicketBase/Ticket80/Ticket57** (`Components/Sale/TicketBase.jsx`) — Ticket térmico compartido (80mm/57mm).
- **Pagination** (`Components/Pagination.jsx`) — Paginador unificado usado en todos los listados del sistema.

---

## 3. Rutas (`routes/modules/*.php`)

El enrutado está modularizado por dominio: `accounting.php`, `admin.php`, `assign-panel.php`, `clinic.php`, `colaborador_portal.php`, `dashboard.php`, `dentist_portal.php`, `ecommerce.php`, `finance.php`, `hikvision.php`, `hr.php`, `inventory.php`, `laboratory.php`, `products.php`, `profile.php`, `sales.php`, `user.php`. Cada archivo agrupa las rutas de un módulo de negocio y sus middlewares de permisos (`permission:*`) correspondientes.

---

*Documento generado automáticamente relevando el código fuente de `artdent-crm`. Puede quedar desactualizado a medida que el proyecto evolucione — usarlo como mapa de navegación, no como fuente de verdad definitiva (esa es siempre el código).*
