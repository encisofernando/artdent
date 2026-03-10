-- =============================================================================
-- ARTDENT CRM – Optimización profesional de base de datos
-- Fecha: 2026-03-10
-- Descripción: Agrega columnas y tablas nuevas sin modificar las existentes.
--              Compatible con artdent.sql versión 2026-03-08.
-- =============================================================================

USE `artdent`;

-- -----------------------------------------------------------------------------
-- 1. DENTISTS  – datos CRM adicionales del odontólogo
-- -----------------------------------------------------------------------------
ALTER TABLE `dentists`
    ADD COLUMN `whatsapp`              varchar(64)  COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'WhatsApp del odontólogo' AFTER `phone_alt`,
    ADD COLUMN `specialty`             varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'Especialidad: Ortodoncia, Cirugía, General, etc.' AFTER `whatsapp`,
    ADD COLUMN `zone`                  varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'Zona/barrio para rutas de reparto' AFTER `specialty`,
    ADD COLUMN `instagram`             varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'Instagram sin @' AFTER `zone`,
    ADD COLUMN `website`               varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'Sitio web del odontólogo/clínica' AFTER `instagram`,
    ADD COLUMN `source`                enum('referido','publicidad','espontaneo','red_social','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'espontaneo' COMMENT 'Cómo llegó al laboratorio' AFTER `website`,
    ADD COLUMN `discount_pct`          decimal(5,2)  DEFAULT '0.00'                              COMMENT 'Descuento general aplicado en todos sus trabajos (%)' AFTER `source`,
    ADD COLUMN `preferred_delivery_day` varchar(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL    COMMENT 'Lunes, Martes, etc. — día preferido de entrega/retiro' AFTER `discount_pct`,
    ADD COLUMN `last_order_at`         timestamp NULL DEFAULT NULL                               COMMENT 'Fecha del último trabajo registrado (auto-actualizado)' AFTER `preferred_delivery_day`,
    ADD COLUMN `postal_code`           varchar(20)  COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'Código postal' AFTER `province`;

-- Índice para búsqueda por zona
ALTER TABLE `dentists`
    ADD KEY `idx_dentists_zone` (`zone`);

-- -----------------------------------------------------------------------------
-- 2. CRM_CLIENTS  – completar para CRM de clientes generales / e-commerce
-- -----------------------------------------------------------------------------
ALTER TABLE `crm_clients`
    ADD COLUMN `type`              enum('persona','empresa') COLLATE utf8mb4_unicode_ci DEFAULT 'persona' COMMENT 'Tipo de cliente' AFTER `customer_id`,
    ADD COLUMN `cuit`              varchar(20)  COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CUIT/CUIL' AFTER `dni`,
    ADD COLUMN `iva_condition`     enum('responsable_inscripto','monotributista','exento','consumidor_final') COLLATE utf8mb4_unicode_ci DEFAULT 'consumidor_final' AFTER `cuit`,
    ADD COLUMN `phone_alt`         varchar(64)  COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Teléfono alternativo' AFTER `phone`,
    ADD COLUMN `whatsapp`          varchar(64)  COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `phone_alt`,
    ADD COLUMN `postal_code`       varchar(20)  COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `province`,
    ADD COLUMN `source`            varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Origen: referido, web, redes, etc.' AFTER `postal_code`,
    ADD COLUMN `tags`              json                             DEFAULT NULL         COMMENT 'Etiquetas: ["vip","mayorista"]' AFTER `source`,
    ADD COLUMN `assigned_user_id`  bigint unsigned                  DEFAULT NULL         COMMENT 'Vendedor/asesor asignado' AFTER `tags`,
    ADD COLUMN `last_contact_at`   timestamp NULL DEFAULT NULL                           COMMENT 'Última interacción registrada' AFTER `assigned_user_id`,
    ADD COLUMN `next_followup_at`  date NULL DEFAULT NULL                                COMMENT 'Próximo seguimiento agendado' AFTER `last_contact_at`;

ALTER TABLE `crm_clients`
    ADD KEY `idx_crm_assigned_user` (`assigned_user_id`),
    ADD CONSTRAINT `fk_crm_assigned_user` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 3. JOBS  – trazabilidad y flujo del laboratorio
-- -----------------------------------------------------------------------------
ALTER TABLE `jobs`
    ADD COLUMN `color_system`          varchar(30)  COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sistema de color: Vita, Chromascop, Ivoclar, etc.' AFTER `shade`,
    ADD COLUMN `sector`                varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sector del lab: cerámica, prótesis, ortodoncia, etc.' AFTER `color_system`,
    ADD COLUMN `urgency_fee`           decimal(12,2) DEFAULT '0.00'            COMMENT 'Recargo por urgencia aplicado' AFTER `discount_amount`,
    ADD COLUMN `delivery_method`       enum('retiro_dentista','reparto','courier','retiro_paciente') COLLATE utf8mb4_unicode_ci DEFAULT 'retiro_dentista' COMMENT 'Forma de entrega' AFTER `urgency_fee`,
    ADD COLUMN `pickup_date`           date NULL DEFAULT NULL                   COMMENT 'Fecha pactada de retiro/entrega al odontólogo' AFTER `delivery_method`,
    ADD COLUMN `remake_of_job_id`      bigint unsigned DEFAULT NULL             COMMENT 'Si es rehecho: ID del trabajo original' AFTER `pickup_date`,
    ADD COLUMN `remake_reason`         varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Motivo del rehecho' AFTER `remake_of_job_id`,
    ADD COLUMN `lab_technician_notes`  text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Observaciones internas del técnico' AFTER `remake_reason`,
    ADD COLUMN `estimated_days`        tinyint unsigned DEFAULT NULL            COMMENT 'Días estimados de producción' AFTER `lab_technician_notes`;

ALTER TABLE `jobs`
    ADD KEY `idx_jobs_sector`      (`sector`),
    ADD KEY `idx_jobs_pickup_date` (`pickup_date`),
    ADD KEY `fk_jobs_remake`       (`remake_of_job_id`),
    ADD CONSTRAINT `fk_jobs_remake` FOREIGN KEY (`remake_of_job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 4. PATIENTS  – datos de contacto del paciente
-- -----------------------------------------------------------------------------
ALTER TABLE `patients`
    ADD COLUMN `email`       varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `phone`,
    ADD COLUMN `dni`         varchar(20)  COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DNI del paciente' AFTER `email`,
    ADD COLUMN `address`     varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `dni`,
    ADD COLUMN `city`        varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `address`,
    ADD COLUMN `province`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `city`;

-- -----------------------------------------------------------------------------
-- 5. TARIFFS  – parámetros de producción y urgencias
-- -----------------------------------------------------------------------------
ALTER TABLE `tariffs`
    ADD COLUMN `lab_sector`            varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sector del lab donde se fabrica: cerámica, prótesis, etc.' AFTER `category`,
    ADD COLUMN `min_days`              tinyint unsigned DEFAULT '1'             COMMENT 'Días mínimos de producción' AFTER `lab_sector`,
    ADD COLUMN `urgency_multiplier`    decimal(4,2) DEFAULT '1.50'             COMMENT 'Multiplicador de precio para trabajos urgentes' AFTER `min_days`,
    ADD COLUMN `tooth_count`           tinyint unsigned DEFAULT NULL            COMMENT 'Cantidad de dientes que incluye (NULL = variable)' AFTER `urgency_multiplier`;

-- -----------------------------------------------------------------------------
-- 6. PRODUCTS  – distinción insumos vs. venta minorista
-- -----------------------------------------------------------------------------
ALTER TABLE `products`
    ADD COLUMN `product_type`  enum('supply','retail','both') COLLATE utf8mb4_unicode_ci DEFAULT 'retail' COMMENT 'supply=insumo de lab, retail=venta e-commerce, both=ambos' AFTER `is_featured`,
    ADD COLUMN `internal_use`  tinyint(1) DEFAULT '0' COMMENT 'Si es 1: solo uso interno del lab, no visible en e-commerce' AFTER `product_type`;

ALTER TABLE `products`
    ADD KEY `idx_products_type` (`product_type`);

-- -----------------------------------------------------------------------------
-- 7. VENDORS  – datos adicionales de proveedor
-- -----------------------------------------------------------------------------
ALTER TABLE `vendors`
    ADD COLUMN `whatsapp`       varchar(64)  COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `phone`,
    ADD COLUMN `website`        varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `whatsapp`,
    ADD COLUMN `city`           varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `address`,
    ADD COLUMN `province`       varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `city`,
    ADD COLUMN `payment_terms`  varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Condiciones de pago: 30 días, contado, etc.' AFTER `province`;

-- -----------------------------------------------------------------------------
-- 8. SALES  – soporte para venta de insumos a odontólogos
-- -----------------------------------------------------------------------------
ALTER TABLE `sales`
    ADD COLUMN `dentist_id`  bigint unsigned DEFAULT NULL COMMENT 'Odontólogo comprador de insumos (para sale_type=lab_supply)' AFTER `crm_client_id`,
    ADD COLUMN `sale_type`   enum('pos','lab_supply') COLLATE utf8mb4_unicode_ci DEFAULT 'pos' COMMENT 'pos=venta mostrador, lab_supply=venta de insumos a odontólogo' AFTER `dentist_id`;

ALTER TABLE `sales`
    ADD KEY `idx_sales_dentist` (`dentist_id`),
    ADD KEY `idx_sales_type`    (`sale_type`),
    ADD CONSTRAINT `fk_sales_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 9. NUEVA TABLA: crm_interactions
--    Registro de todas las interacciones con odontólogos/clientes CRM
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `crm_interactions` (
    `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
    `company_id`      bigint unsigned NOT NULL,
    `user_id`         bigint unsigned DEFAULT NULL            COMMENT 'Usuario que registró la interacción',
    `dentist_id`      bigint unsigned DEFAULT NULL            COMMENT 'Odontólogo relacionado (si aplica)',
    `crm_client_id`   bigint unsigned DEFAULT NULL            COMMENT 'Cliente CRM relacionado (si aplica)',
    `type`            enum('llamada','email','whatsapp','visita','reunion','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'llamada',
    `direction`       enum('inbound','outbound') COLLATE utf8mb4_unicode_ci DEFAULT 'outbound' COMMENT 'Entrante o saliente',
    `subject`         varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL    COMMENT 'Asunto o motivo',
    `notes`           text COLLATE utf8mb4_unicode_ci DEFAULT NULL             COMMENT 'Detalle de la interacción',
    `outcome`         varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL    COMMENT 'Resultado: interesado, no contesta, envio presupuesto, etc.',
    `followup_date`   date NULL DEFAULT NULL                                   COMMENT 'Fecha de próximo seguimiento',
    `interaction_at`  datetime NOT NULL                                        COMMENT 'Fecha y hora de la interacción',
    `created_at`      timestamp NULL DEFAULT NULL,
    `updated_at`      timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_ci_company`    (`company_id`),
    KEY `idx_ci_dentist`    (`dentist_id`),
    KEY `idx_ci_crm_client` (`crm_client_id`),
    KEY `idx_ci_user`       (`user_id`),
    KEY `idx_ci_date`       (`interaction_at`),
    CONSTRAINT `fk_ci_company`    FOREIGN KEY (`company_id`)    REFERENCES `companies` (`id`),
    CONSTRAINT `fk_ci_dentist`    FOREIGN KEY (`dentist_id`)    REFERENCES `dentists`  (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ci_crm_client` FOREIGN KEY (`crm_client_id`) REFERENCES `crm_clients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ci_user`       FOREIGN KEY (`user_id`)       REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Historial de interacciones CRM con odontólogos y clientes';

-- -----------------------------------------------------------------------------
-- 10. NUEVA TABLA: job_remakes
--     Registro detallado de trabajos rehechos (causa, responsabilidad, costo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_remakes` (
    `id`                bigint unsigned NOT NULL AUTO_INCREMENT,
    `job_id`            bigint unsigned NOT NULL                                COMMENT 'Trabajo nuevo (el rehecho)',
    `original_job_id`   bigint unsigned NOT NULL                                COMMENT 'Trabajo original que se rehízo',
    `reported_by`       bigint unsigned DEFAULT NULL                            COMMENT 'Usuario que reportó el rehecho',
    `responsibility`    enum('lab','dentist','patient','material','unknown') COLLATE utf8mb4_unicode_ci DEFAULT 'unknown' COMMENT 'A quién se atribuye el error',
    `reason_category`   varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL    COMMENT 'Color, ajuste, fractura, diseño, etc.',
    `description`       text COLLATE utf8mb4_unicode_ci DEFAULT NULL             COMMENT 'Descripción detallada del problema',
    `material_cost`     decimal(12,2) DEFAULT '0.00'                            COMMENT 'Costo de materiales del rehecho',
    `labor_cost`        decimal(12,2) DEFAULT '0.00'                            COMMENT 'Costo de mano de obra del rehecho',
    `charged_to`        enum('lab','dentist','insurance') COLLATE utf8mb4_unicode_ci DEFAULT 'lab' COMMENT 'Quién absorbe el costo',
    `created_at`        timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_jr_job`          (`job_id`),
    KEY `idx_jr_original`     (`original_job_id`),
    KEY `idx_jr_reported_by`  (`reported_by`),
    CONSTRAINT `fk_jr_job`          FOREIGN KEY (`job_id`)          REFERENCES `jobs` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_jr_original_job` FOREIGN KEY (`original_job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_jr_reported_by`  FOREIGN KEY (`reported_by`)     REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Registro de trabajos rehechos: causa, responsabilidad y costo';

-- -----------------------------------------------------------------------------
-- 11. NUEVA TABLA: dentist_delivery_routes
--     Rutas de reparto / retiro de trabajos por odontólogo
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dentist_delivery_routes` (
    `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
    `company_id`      bigint unsigned NOT NULL,
    `dentist_id`      bigint unsigned NOT NULL,
    `route_name`      varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'Nombre de la ruta o zona',
    `delivery_day`    tinyint unsigned DEFAULT NULL                             COMMENT 'ISO weekday: 1=Lunes … 7=Domingo',
    `delivery_order`  smallint unsigned DEFAULT '0'                             COMMENT 'Orden de visita dentro de la ruta',
    `address`         varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'Dirección de entrega (puede diferir del consultorio)',
    `contact_name`    varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL     COMMENT 'Persona que recibe',
    `contact_phone`   varchar(64)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `notes`           text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `is_active`       tinyint(1) DEFAULT '1',
    `created_at`      timestamp NULL DEFAULT NULL,
    `updated_at`      timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_ddr_company`  (`company_id`),
    KEY `idx_ddr_dentist`  (`dentist_id`),
    KEY `idx_ddr_day`      (`delivery_day`),
    CONSTRAINT `fk_ddr_company`  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
    CONSTRAINT `fk_ddr_dentist`  FOREIGN KEY (`dentist_id`) REFERENCES `dentists`  (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Rutas de reparto y retiro de trabajos para cada odontólogo';

-- =============================================================================
-- FIN DE LA OPTIMIZACIÓN
-- =============================================================================
