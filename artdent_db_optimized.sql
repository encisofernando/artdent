-- =====================================================================
--  ARTDENT - Base de Datos Optimizada
--  Versión: 2.0  |  Motor: MySQL 8.0  |  Charset: utf8mb4_unicode_ci
-- =====================================================================
--  MÓDULOS:
--    1. BASE         → Empresa, Usuarios, Roles, Métodos de Pago
--    2. E-COMMERCE   → Productos, Variantes, Órdenes Online, Envíos
--    3. CRM / POS    → Clientes CRM, Ventas Presenciales, Caja
--    4. LABORATORIO  → Odontólogos, Pacientes, Órdenes de Trabajo,
--                      Aranceles, Cuentas Corrientes, Facturación
--    5. FACTURACIÓN  → Facturas AFIP (POS + Lab)
--    6. COLABORADORES→ Fichaje, Asistencia, Haberes, Asignación a Jobs
--    7. LAB CUENTAS  → Cuentas Corrientes Odontólogos
--    8. EGRESOS      → Gastos e Ingresos generales
-- =====================================================================
--
--  TABLAS ELIMINADAS VS DB ANTERIOR:
--    ✗ import_products_raw / import_products_staging  (staging temporal)
--    ✗ sale_items_staging / stock_movements_staging   (staging temporal)
--    ✗ purchases_backup_keep                          (backup manual)
--    ✗ ledgers / ledger_entries                       (contabilidad no usada)
--    ✗ journal_entries / journal_lines                (contabilidad no usada)
--    ✗ accounts (chart of accounts)                   (no requerido)
--    ✗ messengers                                     (sin uso definido)
--    ✗ email_campaigns                                (no requerido)
--    ✗ popular_searches / search_history              (analytics, no core)
--    ✗ product_comparisons                            (analytics, no core)
--    ✗ collaborators y sub-tablas                     (reemplazado por employees)
--    ✗ clinics                                        (unificado en dentists)
--
--  TABLAS NUEVAS:
--    ✓ product_variants    (variantes de producto: talla, color, etc.)
--    ✓ product_attributes  (atributos dinámicos)
--    ✓ shipping_methods    (métodos de envío configurables)
--    ✓ shipments           (reemplaza deliveries con más detalle)
--    ✓ lab_accounts        (cuentas corrientes por odontólogo)
--    ✓ lab_account_moves   (movimientos de cuenta corriente)
--    ✓ job_items           (ítems dentro de una orden de trabajo)
--    ✓ expense_categories  (categorías de gastos)
--    ✓ expenses            (egresos del laboratorio / empresa)
--    ✓ income_records      (ingresos no asociados a ventas/facturas)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `artdent_lab`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `artdent_lab`;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 0. SISTEMA  (Laravel internals)
-- =====================================================================

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id`        int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch`     int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email`      varchar(191) NOT NULL,
  `token`      varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id`             bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) NOT NULL,
  `tokenable_id`   bigint unsigned NOT NULL,
  `name`           varchar(191) NOT NULL,
  `token`          varchar(64) NOT NULL,
  `abilities`      text,
  `last_used_at`   timestamp NULL DEFAULT NULL,
  `expires_at`     timestamp NULL DEFAULT NULL,
  `created_at`     timestamp NULL DEFAULT NULL,
  `updated_at`     timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pat_token` (`token`),
  KEY `idx_pat_tokenable` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 1. BASE
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1.1 Empresa
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  -- Datos generales
  `name`            varchar(191) NOT NULL COMMENT 'Razón social',
  `fantasy_name`    varchar(191) DEFAULT NULL COMMENT 'Nombre de fantasía',
  `logo_url`        varchar(500) DEFAULT NULL,
  -- AFIP / Fiscal Argentina
  `cuit`            varchar(20) DEFAULT NULL,
  `iva_condition`   enum('responsable_inscripto','monotributista','exento','consumidor_final') DEFAULT 'responsable_inscripto',
  `iibb`            varchar(30) DEFAULT NULL COMMENT 'Ingresos Brutos',
  `start_date`      date DEFAULT NULL COMMENT 'Fecha inicio actividades',
  `afip_point_sale` smallint unsigned DEFAULT 1 COMMENT 'Punto de venta AFIP',
  -- Contacto
  `email`           varchar(191) DEFAULT NULL,
  `phone`           varchar(64) DEFAULT NULL,
  `website`         varchar(255) DEFAULT NULL,
  -- Dirección
  `address`         varchar(255) DEFAULT NULL,
  `city`            varchar(100) DEFAULT NULL,
  `province`        varchar(100) DEFAULT NULL,
  `postal_code`     varchar(20) DEFAULT NULL,
  `country`         varchar(100) DEFAULT 'Argentina',
  -- Config
  `currency`        char(3) DEFAULT 'ARS',
  `timezone`        varchar(64) DEFAULT 'America/Argentina/Buenos_Aires',
  `created_at`      timestamp NULL DEFAULT NULL,
  `updated_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 1.2 Sucursales / Puntos de venta
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name`       varchar(191) NOT NULL,
  `code`       varchar(32) NOT NULL,
  `address`    varchar(255) DEFAULT NULL,
  `phone`      varchar(64) DEFAULT NULL,
  `email`      varchar(191) DEFAULT NULL,
  `is_active`  tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_code` (`company_id`, `code`),
  KEY `idx_branches_company` (`company_id`),
  CONSTRAINT `fk_branches_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 1.3 Roles y Usuarios del sistema
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`        varchar(64) NOT NULL COMMENT 'admin, lab_operator, seller, ecommerce_manager, etc.',
  `display_name` varchar(191) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`                bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`        bigint unsigned NOT NULL,
  `branch_id`         bigint unsigned DEFAULT NULL,
  `name`              varchar(191) NOT NULL,
  `email`             varchar(191) NOT NULL,
  `password`          varchar(255) NOT NULL,
  `phone`             varchar(64) DEFAULT NULL,
  `avatar_url`        varchar(500) DEFAULT NULL,
  `is_active`         tinyint(1) DEFAULT 1,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token`    varchar(100) DEFAULT NULL,
  `last_login_at`     timestamp NULL DEFAULT NULL,
  `created_at`        timestamp NULL DEFAULT NULL,
  `updated_at`        timestamp NULL DEFAULT NULL,
  `deleted_at`        timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_company` (`company_id`),
  CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `fk_ru_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ru_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Empleados (info laboral adicional al usuario)
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`     bigint unsigned NOT NULL,
  `branch_id`   bigint unsigned DEFAULT NULL,
  `dni`         varchar(20) DEFAULT NULL,
  `position`    varchar(100) DEFAULT NULL COMMENT 'Cargo',
  `salary`      decimal(12,2) DEFAULT NULL,
  `hire_date`   date DEFAULT NULL,
  `end_date`    date DEFAULT NULL,
  `notes`       text DEFAULT NULL,
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  `deleted_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employee_user` (`user_id`),
  KEY `idx_employees_branch` (`branch_id`),
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_employees_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notificaciones internas
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id`           char(36) NOT NULL,
  `type`         varchar(191) NOT NULL,
  `notifiable_type` varchar(191) NOT NULL,
  `notifiable_id`   bigint unsigned NOT NULL,
  `data`         json NOT NULL,
  `read_at`      timestamp NULL DEFAULT NULL,
  `created_at`   timestamp NULL DEFAULT NULL,
  `updated_at`   timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_notifiable` (`notifiable_type`, `notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 1.4 Métodos de Pago (compartido E-Commerce + POS + Lab)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`        varchar(100) NOT NULL COMMENT 'Efectivo, Tarjeta Débito, Transferencia, MercadoPago, etc.',
  `type`        enum('cash','card_debit','card_credit','transfer','mp','check','other') DEFAULT 'other',
  `surcharge_pct` decimal(5,2) DEFAULT 0.00 COMMENT 'Recargo % (ej: tarjeta crédito)',
  `is_active`   tinyint(1) DEFAULT 1,
  `applies_to`  set('ecommerce','pos','lab') DEFAULT 'ecommerce,pos,lab',
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 1.5 Impuestos / Alícuotas IVA
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `taxes`;
CREATE TABLE `taxes` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`        varchar(100) NOT NULL COMMENT 'IVA 21%, IVA 10.5%, Exento, etc.',
  `rate`        decimal(5,2) NOT NULL DEFAULT 21.00,
  `afip_code`   varchar(10) DEFAULT NULL COMMENT 'Código AFIP para facturación electrónica',
  `is_active`   tinyint(1) DEFAULT 1,
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 2. E-COMMERCE
-- =====================================================================

-- ---------------------------------------------------------------------
-- 2.1 Proveedores
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `vendors`;
CREATE TABLE `vendors` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`   bigint unsigned NOT NULL,
  `name`         varchar(191) NOT NULL,
  `contact_name` varchar(191) DEFAULT NULL,
  `email`        varchar(191) DEFAULT NULL,
  `phone`        varchar(64) DEFAULT NULL,
  `address`      varchar(255) DEFAULT NULL,
  `cuit`         varchar(20) DEFAULT NULL,
  `iva_condition` enum('responsable_inscripto','monotributista','exento') DEFAULT NULL,
  `notes`        text DEFAULT NULL,
  `is_active`    tinyint(1) DEFAULT 1,
  `created_at`   timestamp NULL DEFAULT NULL,
  `updated_at`   timestamp NULL DEFAULT NULL,
  `deleted_at`   timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_vendors_company` (`company_id`),
  CONSTRAINT `fk_vendors_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2.2 Categorías de Productos (árbol jerárquico)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id`   bigint unsigned DEFAULT NULL,
  `name`        varchar(191) NOT NULL,
  `slug`        varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url`   varchar(500) DEFAULT NULL,
  `sort_order`  int DEFAULT 0,
  `is_active`   tinyint(1) DEFAULT 1,
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_slug` (`slug`),
  KEY `idx_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2.3 Productos
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
-- Versión corregida de la tabla (sin columna generada)
CREATE TABLE `products` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `company_id` bigint unsigned NOT NULL,
    `vendor_id` bigint unsigned DEFAULT NULL,
    `category_id` bigint unsigned DEFAULT NULL,
    `tax_id` bigint unsigned DEFAULT NULL,
    `name` varchar(255) NOT NULL,
    `slug` varchar(255) NOT NULL,
    `sku` varchar(100) DEFAULT NULL,
    `barcode` varchar(100) DEFAULT NULL,
    `short_description` varchar(500) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `cost_price` decimal(12,2) DEFAULT 0.00,
    `price` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio de venta sin IVA',
    `compare_price` decimal(12,2) DEFAULT NULL COMMENT 'Precio tachado original',
    `has_variants` tinyint(1) DEFAULT 0,
    `track_stock` tinyint(1) DEFAULT 1,
    `weight` decimal(8,3) DEFAULT NULL COMMENT 'kg',
    `is_active` tinyint(1) DEFAULT 1,
    `is_featured` tinyint(1) DEFAULT 0,
    `meta_title` varchar(255) DEFAULT NULL,
    `meta_desc` varchar(500) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    `deleted_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_product_slug` (`slug`),
    KEY `idx_products_company` (`company_id`),
    KEY `idx_products_category` (`category_id`),
    KEY `idx_products_vendor` (`vendor_id`),
    KEY `idx_products_sku` (`sku`),
    CONSTRAINT `fk_products_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_products_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_products_tax` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE products
    ADD COLUMN tax_rate decimal(5,2) DEFAULT 21.00 COMMENT 'Alícuota IVA snapshot al crear/actualizar producto';

-- Imágenes de Productos
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id`  bigint unsigned NOT NULL,
  `variant_id`  bigint unsigned DEFAULT NULL,
  `url`         varchar(500) NOT NULL,
  `alt`         varchar(255) DEFAULT NULL,
  `sort_order`  int DEFAULT 0,
  `is_cover`    tinyint(1) DEFAULT 0,
  `created_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pimages_product` (`product_id`),
  CONSTRAINT `fk_pimages_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Atributos (Color, Talle, Material, etc.)
DROP TABLE IF EXISTS `product_attributes`;
CREATE TABLE `product_attributes` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`       varchar(100) NOT NULL COMMENT 'Color, Talle, Material',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attr_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `product_attribute_values`;
CREATE TABLE `product_attribute_values` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `attribute_id` bigint unsigned NOT NULL,
  `value`        varchar(100) NOT NULL COMMENT 'Rojo, XL, Titanio',
  PRIMARY KEY (`id`),
  KEY `idx_pav_attribute` (`attribute_id`),
  CONSTRAINT `fk_pav_attribute` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Variantes de Productos (SKU único por combinación de atributos)
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id`   bigint unsigned NOT NULL,
  `sku`          varchar(100) DEFAULT NULL,
  `barcode`      varchar(100) DEFAULT NULL,
  `price`        decimal(12,2) DEFAULT NULL COMMENT 'NULL = usa precio del producto padre',
  `cost_price`   decimal(12,2) DEFAULT NULL,
  `is_active`    tinyint(1) DEFAULT 1,
  `created_at`   timestamp NULL DEFAULT NULL,
  `updated_at`   timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pvariants_product` (`product_id`),
  CONSTRAINT `fk_pvariants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivote: variante ↔ valor de atributo
DROP TABLE IF EXISTS `variant_attribute_values`;
CREATE TABLE `variant_attribute_values` (
  `variant_id`            bigint unsigned NOT NULL,
  `attribute_value_id`    bigint unsigned NOT NULL,
  PRIMARY KEY (`variant_id`, `attribute_value_id`),
  CONSTRAINT `fk_vav_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vav_value` FOREIGN KEY (`attribute_value_id`) REFERENCES `product_attribute_values` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2.4 Stock (multi-depósito)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `warehouses`;
CREATE TABLE `warehouses` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `branch_id`  bigint unsigned DEFAULT NULL,
  `name`       varchar(191) NOT NULL,
  `code`       varchar(32) DEFAULT NULL,
  `address`    varchar(255) DEFAULT NULL,
  `is_active`  tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_warehouses_company` (`company_id`),
  CONSTRAINT `fk_warehouses_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock por producto/variante/depósito
DROP TABLE IF EXISTS `stocks`;
CREATE TABLE `stocks` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id`   bigint unsigned NOT NULL,
  `variant_id`   bigint unsigned DEFAULT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `quantity`     decimal(12,3) DEFAULT 0.000,
  `min_quantity` decimal(12,3) DEFAULT 0.000 COMMENT 'Stock mínimo para alerta',
  `updated_at`   timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stock` (`product_id`, `variant_id`, `warehouse_id`),
  KEY `idx_stocks_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_stocks_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stocks_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stocks_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Movimientos de Stock
DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id`             bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id`     bigint unsigned NOT NULL,
  `variant_id`     bigint unsigned DEFAULT NULL,
  `warehouse_id`   bigint unsigned NOT NULL,
  `user_id`        bigint unsigned DEFAULT NULL,
  `type`           enum('in','out','adjustment','transfer_in','transfer_out') NOT NULL,
  `quantity`       decimal(12,3) NOT NULL,
  `stock_before`   decimal(12,3) DEFAULT NULL,
  `stock_after`    decimal(12,3) DEFAULT NULL,
  `reference_type` varchar(64) DEFAULT NULL COMMENT 'purchase, ecommerce_order, sale, manual',
  `reference_id`   bigint unsigned DEFAULT NULL,
  `note`           varchar(255) DEFAULT NULL,
  `created_at`     timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sm_product` (`product_id`, `warehouse_id`),
  KEY `idx_sm_reference` (`reference_type`, `reference_id`),
  CONSTRAINT `fk_sm_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_sm_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compras a Proveedores
DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`   bigint unsigned NOT NULL,
  `vendor_id`    bigint unsigned NOT NULL,
  `user_id`      bigint unsigned DEFAULT NULL COMMENT 'Quién registró',
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `reference_no` varchar(100) DEFAULT NULL COMMENT 'N° remito / factura proveedor',
  `status`       enum('pending','received','partial','cancelled') DEFAULT 'pending',
  `subtotal`     decimal(12,2) DEFAULT 0.00,
  `tax_amount`   decimal(12,2) DEFAULT 0.00,
  `total`        decimal(12,2) DEFAULT 0.00,
  `notes`        text DEFAULT NULL,
  `purchased_at` date DEFAULT NULL,
  `created_at`   timestamp NULL DEFAULT NULL,
  `updated_at`   timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_purchases_vendor` (`vendor_id`),
  CONSTRAINT `fk_purchases_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_purchases_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `fk_purchases_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `purchase_items`;
CREATE TABLE `purchase_items` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_id`  bigint unsigned NOT NULL,
  `product_id`   bigint unsigned NOT NULL,
  `variant_id`   bigint unsigned DEFAULT NULL,
  `quantity`     decimal(12,3) NOT NULL,
  `unit_cost`    decimal(12,2) NOT NULL,
  `total`        decimal(12,2) NOT NULL,
  `received_qty` decimal(12,3) DEFAULT 0.000,
  PRIMARY KEY (`id`),
  KEY `idx_pi_purchase` (`purchase_id`),
  CONSTRAINT `fk_pi_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2.5 Clientes del E-Commerce (usuarios públicos)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id`                bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`              varchar(191) NOT NULL,
  `email`             varchar(191) NOT NULL,
  `password`          varchar(255) DEFAULT NULL,
  `phone`             varchar(64) DEFAULT NULL,
  `dni`               varchar(20) DEFAULT NULL,
  `address`           varchar(255) DEFAULT NULL,
  `city`              varchar(100) DEFAULT NULL,
  `province`          varchar(100) DEFAULT NULL,
  `postal_code`       varchar(20) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token`    varchar(100) DEFAULT NULL,
  `accepts_marketing` tinyint(1) DEFAULT 0,
  `is_active`         tinyint(1) DEFAULT 1,
  `created_at`        timestamp NULL DEFAULT NULL,
  `updated_at`        timestamp NULL DEFAULT NULL,
  `deleted_at`        timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customer_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Direcciones múltiples por cliente
DROP TABLE IF EXISTS `customer_addresses`;
CREATE TABLE `customer_addresses` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `label`       varchar(64) DEFAULT 'Principal',
  `recipient`   varchar(191) DEFAULT NULL,
  `address`     varchar(255) NOT NULL,
  `city`        varchar(100) DEFAULT NULL,
  `province`    varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `phone`       varchar(64) DEFAULT NULL,
  `is_default`  tinyint(1) DEFAULT 0,
  `created_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ca_customer` (`customer_id`),
  CONSTRAINT `fk_ca_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lista de deseos
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `product_id`  bigint unsigned NOT NULL,
  `created_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist` (`customer_id`, `product_id`),
  CONSTRAINT `fk_wl_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wl_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2.6 Cupones de Descuento
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id`             bigint unsigned NOT NULL AUTO_INCREMENT,
  `code`           varchar(64) NOT NULL,
  `type`           enum('percentage','fixed') DEFAULT 'percentage',
  `value`          decimal(10,2) NOT NULL,
  `min_order_amount` decimal(12,2) DEFAULT NULL,
  `max_uses`       int DEFAULT NULL,
  `used_count`     int DEFAULT 0,
  `max_uses_per_customer` int DEFAULT NULL,
  `valid_from`     date DEFAULT NULL,
  `valid_until`    date DEFAULT NULL,
  `is_active`      tinyint(1) DEFAULT 1,
  `created_at`     timestamp NULL DEFAULT NULL,
  `updated_at`     timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupon_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `coupon_usages`;
CREATE TABLE `coupon_usages` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `coupon_id`   bigint unsigned NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `order_id`    bigint unsigned DEFAULT NULL,
  `used_at`     timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cu_coupon` (`coupon_id`),
  CONSTRAINT `fk_cu_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2.7 Métodos y Costos de Envío
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `shipping_methods`;
CREATE TABLE `shipping_methods` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`        varchar(191) NOT NULL COMMENT 'Correo Argentino, OCA, Andreani, Retiro en Tienda',
  `type`        enum('free','flat','calculated','pickup') DEFAULT 'flat',
  `base_cost`   decimal(10,2) DEFAULT 0.00,
  `free_above`  decimal(12,2) DEFAULT NULL COMMENT 'Envío gratis si pedido supera este monto',
  `is_active`   tinyint(1) DEFAULT 1,
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2.8 Órdenes E-Commerce
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `ecommerce_orders`;
CREATE TABLE `ecommerce_orders` (
  `id`                bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`        bigint unsigned NOT NULL,
  `customer_id`       bigint unsigned DEFAULT NULL,
  `coupon_id`         bigint unsigned DEFAULT NULL,
  `shipping_method_id` bigint unsigned DEFAULT NULL,
  -- Número de orden
  `order_number`      varchar(50) NOT NULL,
  -- Estado
  `status`            enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_status`    enum('pending','paid','failed','refunded') DEFAULT 'pending',
  -- Montos
  `subtotal`          decimal(12,2) DEFAULT 0.00,
  `discount_amount`   decimal(12,2) DEFAULT 0.00,
  `shipping_cost`     decimal(12,2) DEFAULT 0.00,
  `tax_amount`        decimal(12,2) DEFAULT 0.00,
  `total`             decimal(12,2) DEFAULT 0.00,
  -- Datos de envío (snapshot al momento de la compra)
  `shipping_name`     varchar(191) DEFAULT NULL,
  `shipping_address`  varchar(255) DEFAULT NULL,
  `shipping_city`     varchar(100) DEFAULT NULL,
  `shipping_province` varchar(100) DEFAULT NULL,
  `shipping_postal`   varchar(20) DEFAULT NULL,
  `shipping_phone`    varchar(64) DEFAULT NULL,
  -- Notas
  `customer_notes`    text DEFAULT NULL,
  `admin_notes`       text DEFAULT NULL,
  `created_at`        timestamp NULL DEFAULT NULL,
  `updated_at`        timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_number` (`order_number`),
  KEY `idx_eorders_customer` (`customer_id`),
  KEY `idx_eorders_status` (`status`),
  CONSTRAINT `fk_eorders_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_eorders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_eorders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `ecommerce_order_items`;
CREATE TABLE `ecommerce_order_items` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id`    bigint unsigned NOT NULL,
  `product_id`  bigint unsigned DEFAULT NULL,
  `variant_id`  bigint unsigned DEFAULT NULL,
  -- Snapshot del producto al momento de la compra
  `product_name`  varchar(255) NOT NULL,
  `sku`           varchar(100) DEFAULT NULL,
  `quantity`      int NOT NULL DEFAULT 1,
  `unit_price`    decimal(12,2) NOT NULL,
  `discount`      decimal(12,2) DEFAULT 0.00,
  `total`         decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_eoi_order` (`order_id`),
  CONSTRAINT `fk_eoi_order` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eoi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Envíos (tracking)
DROP TABLE IF EXISTS `shipments`;
CREATE TABLE `shipments` (
  `id`                 bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id`           bigint unsigned NOT NULL,
  `shipping_method_id` bigint unsigned DEFAULT NULL,
  `tracking_code`      varchar(191) DEFAULT NULL,
  `status`             enum('preparing','shipped','in_transit','delivered','returned') DEFAULT 'preparing',
  `carrier`            varchar(100) DEFAULT NULL,
  `shipped_at`         datetime DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `delivered_at`       datetime DEFAULT NULL,
  `notes`              text DEFAULT NULL,
  `created_at`         timestamp NULL DEFAULT NULL,
  `updated_at`         timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_shipments_order` (`order_id`),
  CONSTRAINT `fk_shipments_order` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_shipments_method` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reseñas de Productos
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id`  bigint unsigned NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `order_id`    bigint unsigned DEFAULT NULL,
  `rating`      tinyint NOT NULL DEFAULT 5,
  `title`       varchar(191) DEFAULT NULL,
  `body`        text DEFAULT NULL,
  `status`      enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product` (`product_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Newsletter
DROP TABLE IF EXISTS `newsletter_subscribers`;
CREATE TABLE `newsletter_subscribers` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `email`      varchar(191) NOT NULL,
  `name`       varchar(191) DEFAULT NULL,
  `is_active`  tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_newsletter_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 3. CRM / POS (Ventas Presenciales en Tienda)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 3.1 Clientes CRM (pueden ser distintos a customers e-commerce,
--     o pueden vincularse si el cliente tiene cuenta online)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `crm_clients`;
CREATE TABLE `crm_clients` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id`  bigint unsigned DEFAULT NULL COMMENT 'Vinculado a cuenta e-commerce si existe',
  `company_id`   bigint unsigned NOT NULL,
  `name`         varchar(191) NOT NULL,
  `email`        varchar(191) DEFAULT NULL,
  `phone`        varchar(64) DEFAULT NULL,
  `dni`          varchar(20) DEFAULT NULL,
  `address`      varchar(255) DEFAULT NULL,
  `city`         varchar(100) DEFAULT NULL,
  `province`     varchar(100) DEFAULT NULL,
  `birth_date`   date DEFAULT NULL,
  `notes`        text DEFAULT NULL,
  `is_active`    tinyint(1) DEFAULT 1,
  `created_at`   timestamp NULL DEFAULT NULL,
  `updated_at`   timestamp NULL DEFAULT NULL,
  `deleted_at`   timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_crm_company` (`company_id`),
  KEY `idx_crm_customer` (`customer_id`),
  CONSTRAINT `fk_crm_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_crm_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3.2 Caja (POS)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `cash_drawers`;
CREATE TABLE `cash_drawers` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `branch_id`  bigint unsigned DEFAULT NULL,
  `name`       varchar(191) NOT NULL,
  `is_active`  tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cd_branch` (`branch_id`),
  CONSTRAINT `fk_cd_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_cd_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cash_sessions`;
CREATE TABLE `cash_sessions` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `cash_drawer_id`  bigint unsigned NOT NULL,
  `user_id`         bigint unsigned NOT NULL,
  `opened_at`       datetime NOT NULL,
  `closed_at`       datetime DEFAULT NULL,
  `opening_amount`  decimal(14,2) DEFAULT 0.00,
  `closing_amount`  decimal(14,2) DEFAULT 0.00,
  `status`          enum('open','closed') DEFAULT 'open',
  `notes`           text DEFAULT NULL,
  `created_at`      timestamp NULL DEFAULT NULL,
  `updated_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cs_drawer` (`cash_drawer_id`),
  CONSTRAINT `fk_cs_drawer` FOREIGN KEY (`cash_drawer_id`) REFERENCES `cash_drawers` (`id`),
  CONSTRAINT `fk_cs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cash_movements`;
CREATE TABLE `cash_movements` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `cash_session_id` bigint unsigned NOT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `type`            enum('in','out') NOT NULL,
  `amount`          decimal(14,2) NOT NULL,
  `concept`         varchar(255) DEFAULT NULL,
  `reference_type`  varchar(64) DEFAULT NULL COMMENT 'sale, lab_payment, expense, manual',
  `reference_id`    bigint unsigned DEFAULT NULL,
  `created_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cm_session` (`cash_session_id`),
  KEY `idx_cm_reference` (`reference_type`, `reference_id`),
  CONSTRAINT `fk_cm_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cm_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3.3 Ventas Presenciales (POS)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`      bigint unsigned NOT NULL,
  `branch_id`       bigint unsigned DEFAULT NULL,
  `cash_session_id` bigint unsigned DEFAULT NULL,
  `user_id`         bigint unsigned DEFAULT NULL COMMENT 'Vendedor',
  `crm_client_id`   bigint unsigned DEFAULT NULL,
  `invoice_id`      bigint unsigned DEFAULT NULL COMMENT 'Factura AFIP si fue facturada',
  `sale_number`     varchar(50) DEFAULT NULL,
  `status`          enum('draft','completed','cancelled','refunded') DEFAULT 'completed',
  -- Montos
  `subtotal`        decimal(12,2) DEFAULT 0.00,
  `discount_amount` decimal(12,2) DEFAULT 0.00,
  `tax_amount`      decimal(12,2) DEFAULT 0.00,
  `total`           decimal(12,2) DEFAULT 0.00,
  `paid_amount`     decimal(12,2) DEFAULT 0.00,
  `change_amount`   decimal(12,2) DEFAULT 0.00,
  `notes`           text DEFAULT NULL,
  `sold_at`         datetime DEFAULT NULL,
  `created_at`      timestamp NULL DEFAULT NULL,
  `updated_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sales_company` (`company_id`),
  KEY `idx_sales_session` (`cash_session_id`),
  KEY `idx_sales_client` (`crm_client_id`),
  CONSTRAINT `fk_sales_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_sales_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sales_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE `sale_items` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `sale_id`      bigint unsigned NOT NULL,
  `product_id`   bigint unsigned DEFAULT NULL,
  `variant_id`   bigint unsigned DEFAULT NULL,
  -- Snapshot
  `product_name` varchar(255) NOT NULL,
  `sku`          varchar(100) DEFAULT NULL,
  `quantity`     decimal(12,3) NOT NULL,
  `unit_price`   decimal(12,2) NOT NULL,
  `discount`     decimal(12,2) DEFAULT 0.00,
  `tax_amount`   decimal(12,2) DEFAULT 0.00,
  `total`        decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_si_sale` (`sale_id`),
  CONSTRAINT `fk_si_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_si_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pagos de venta (permite pago dividido en múltiples métodos)
DROP TABLE IF EXISTS `sale_payments`;
CREATE TABLE `sale_payments` (
  `id`                bigint unsigned NOT NULL AUTO_INCREMENT,
  `sale_id`           bigint unsigned NOT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `amount`            decimal(12,2) NOT NULL,
  `reference`         varchar(191) DEFAULT NULL COMMENT 'N° comprobante, last 4 dígitos tarjeta, etc.',
  `paid_at`           datetime DEFAULT NULL,
  `created_at`        timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sp_sale` (`sale_id`),
  CONSTRAINT `fk_sp_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 4. FACTURACIÓN AFIP (compartida entre POS y Laboratorio)
-- =====================================================================

DROP TABLE IF EXISTS `invoice_types`;
CREATE TABLE `invoice_types` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`        varchar(100) NOT NULL COMMENT 'Factura A, Factura B, Factura C, ND A, NC A, etc.',
  `afip_code`   varchar(10) NOT NULL COMMENT 'Código AFIP (ej: 001, 006, 011)',
  `is_active`   tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`      bigint unsigned NOT NULL,
  `invoice_type_id` bigint unsigned NOT NULL,
  `user_id`         bigint unsigned DEFAULT NULL COMMENT 'Quién emitió',
  -- Referencia: puede ser de venta POS o de job de laboratorio
  `reference_type`  varchar(64) DEFAULT NULL COMMENT 'sale, lab_billing',
  `reference_id`    bigint unsigned DEFAULT NULL,
  -- Datos del cliente/receptor
  `recipient_name`  varchar(191) NOT NULL,
  `recipient_cuit`  varchar(20) DEFAULT NULL,
  `recipient_iva`   varchar(64) DEFAULT NULL,
  `recipient_address` varchar(255) DEFAULT NULL,
  -- Numeración AFIP
  `point_sale`      smallint unsigned DEFAULT 1,
  `number`          int unsigned DEFAULT NULL,
  `cae`             varchar(20) DEFAULT NULL,
  `cae_expiry`      date DEFAULT NULL,
  -- Montos
  `subtotal`        decimal(12,2) DEFAULT 0.00,
  `discount`        decimal(12,2) DEFAULT 0.00,
  `tax_amount`      decimal(12,2) DEFAULT 0.00,
  `total`           decimal(12,2) DEFAULT 0.00,
  -- Estado
  `status`          enum('draft','issued','cancelled') DEFAULT 'draft',
  `issued_at`       date DEFAULT NULL,
  `due_date`        date DEFAULT NULL,
  `notes`           text DEFAULT NULL,
  `created_at`      timestamp NULL DEFAULT NULL,
  `updated_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoice_number` (`company_id`, `invoice_type_id`, `point_sale`, `number`),
  KEY `idx_invoices_reference` (`reference_type`, `reference_id`),
  CONSTRAINT `fk_invoices_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_invoices_type` FOREIGN KEY (`invoice_type_id`) REFERENCES `invoice_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `invoice_items`;
CREATE TABLE `invoice_items` (
  `id`            bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id`    bigint unsigned NOT NULL,
  `description`   varchar(255) NOT NULL,
  `quantity`      decimal(12,3) NOT NULL DEFAULT 1.000,
  `unit_price`    decimal(12,2) NOT NULL,
  `tax_rate`      decimal(5,2) DEFAULT 21.00,
  `tax_amount`    decimal(12,2) DEFAULT 0.00,
  `total`         decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ii_invoice` (`invoice_id`),
  CONSTRAINT `fk_ii_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 5. LABORATORIO ODONTOLÓGICO
-- =====================================================================

-- ---------------------------------------------------------------------
-- 5.1 Odontólogos / Clínicas (clientes del laboratorio)
--     UNIFICA: clinics + dentists del esquema anterior
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `dentists`;
CREATE TABLE `dentists` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`   bigint unsigned NOT NULL,
  `code`         varchar(32) DEFAULT NULL COMMENT 'Código interno del lab',
  -- Puede ser persona física (odontólogo) o jurídica (clínica)
  `type`         enum('individual','clinic') DEFAULT 'individual',
  `name`         varchar(191) NOT NULL COMMENT 'Nombre del odontólogo o clínica',
  `contact_name` varchar(191) DEFAULT NULL COMMENT 'Contacto en caso de clínica',
  `email`        varchar(191) DEFAULT NULL,
  `phone`        varchar(64) DEFAULT NULL,
  `phone_alt`    varchar(64) DEFAULT NULL,
  `address`      varchar(255) DEFAULT NULL,
  `city`         varchar(100) DEFAULT NULL,
  `province`     varchar(100) DEFAULT NULL,
  -- Fiscal
  `cuit`         varchar(20) DEFAULT NULL,
  `iva_condition` enum('responsable_inscripto','monotributista','exento','consumidor_final') DEFAULT 'consumidor_final',
  -- Matrícula profesional
  `license_number` varchar(50) DEFAULT NULL,
  -- Configuración de cuenta corriente
  `credit_limit` decimal(12,2) DEFAULT NULL COMMENT 'Límite de crédito (NULL = sin límite)',
  `payment_days` smallint DEFAULT 30 COMMENT 'Días de crédito acordados',
  -- Estado
  `is_active`    tinyint(1) DEFAULT 1,
  `notes`        text DEFAULT NULL,
  `created_at`   timestamp NULL DEFAULT NULL,
  `updated_at`   timestamp NULL DEFAULT NULL,
  `deleted_at`   timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dentist_code` (`company_id`, `code`),
  KEY `idx_dentists_company` (`company_id`),
  CONSTRAINT `fk_dentists_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5.2 Pacientes (pertenecen a un odontólogo)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `dentist_id`  bigint unsigned NOT NULL,
  `name`        varchar(191) NOT NULL,
  `birth_date`  date DEFAULT NULL,
  `gender`      enum('M','F','other') DEFAULT NULL,
  `phone`       varchar(64) DEFAULT NULL,
  `notes`       text DEFAULT NULL,
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  `deleted_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patients_dentist` (`dentist_id`),
  CONSTRAINT `fk_patients_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5.3 Aranceles / Catálogo de Trabajos del Lab
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `tariffs`;
CREATE TABLE `tariffs` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`  bigint unsigned NOT NULL,
  `code`        varchar(32) DEFAULT NULL,
  `name`        varchar(191) NOT NULL COMMENT 'Corona Zirconio, Prótesis Total, Carilla, etc.',
  `category`    varchar(100) DEFAULT NULL COMMENT 'Agrupación: Fija, Removible, Ortodoncia, etc.',
  `price`       decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit`        varchar(32) DEFAULT 'unidad' COMMENT 'unidad, pieza, par, etc.',
  `description` text DEFAULT NULL,
  `is_active`   tinyint(1) DEFAULT 1,
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tariffs_company` (`company_id`),
  CONSTRAINT `fk_tariffs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Precios personalizados por odontólogo (descuento/precio especial)
DROP TABLE IF EXISTS `dentist_tariff_prices`;
CREATE TABLE `dentist_tariff_prices` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `dentist_id`  bigint unsigned NOT NULL,
  `tariff_id`   bigint unsigned NOT NULL,
  `price`       decimal(12,2) NOT NULL COMMENT 'Precio especial para este odontólogo',
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dtp` (`dentist_id`, `tariff_id`),
  CONSTRAINT `fk_dtp_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dtp_tariff` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5.4 Tipos de Trabajo
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `job_types`;
CREATE TABLE `job_types` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`  bigint unsigned NOT NULL,
  `name`        varchar(191) NOT NULL,
  `color`       varchar(7) DEFAULT '#6366f1' COMMENT 'Color hex para UI',
  `is_active`   tinyint(1) DEFAULT 1,
  `created_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_jt_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5.5 Órdenes de Trabajo (Jobs)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`      bigint unsigned NOT NULL,
  `dentist_id`      bigint unsigned NOT NULL,
  `patient_id`      bigint unsigned DEFAULT NULL,
  `job_type_id`     bigint unsigned DEFAULT NULL,
  `assigned_user_id` bigint unsigned DEFAULT NULL COMMENT 'Técnico asignado',
  -- Numeración
  `job_number`      varchar(50) NOT NULL,
  -- Estado
  `status`          enum('received','in_progress','quality_check','ready','delivered','cancelled') DEFAULT 'received',
  `priority`        enum('normal','urgent','rush') DEFAULT 'normal',
  -- Descripción
  `description`     text DEFAULT NULL,
  `clinical_notes`  text DEFAULT NULL COMMENT 'Indicaciones clínicas del odontólogo',
  -- Color / Shade dental
  `shade`           varchar(30) DEFAULT NULL COMMENT 'Color dental: A1, A2, B3, etc.',
  -- Fechas
  `received_at`     date DEFAULT NULL,
  `due_date`        date DEFAULT NULL COMMENT 'Fecha de entrega comprometida',
  `delivered_at`    datetime DEFAULT NULL,
  -- Montos
  `subtotal`        decimal(12,2) DEFAULT 0.00,
  `discount_amount` decimal(12,2) DEFAULT 0.00,
  `total`           decimal(12,2) DEFAULT 0.00,
  -- Billing
  `billed`          tinyint(1) DEFAULT 0 COMMENT 'Si ya fue incluido en factura',
  `invoice_id`      bigint unsigned DEFAULT NULL,
  `notes`           text DEFAULT NULL,
  `created_at`      timestamp NULL DEFAULT NULL,
  `updated_at`      timestamp NULL DEFAULT NULL,
  `deleted_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_job_number` (`company_id`, `job_number`),
  KEY `idx_jobs_dentist` (`dentist_id`),
  KEY `idx_jobs_patient` (`patient_id`),
  KEY `idx_jobs_status` (`status`),
  KEY `idx_jobs_due` (`due_date`),
  CONSTRAINT `fk_jobs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_jobs_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`),
  CONSTRAINT `fk_jobs_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_user` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ítems de la orden de trabajo (trabajos realizados, referenciando arancel)
DROP TABLE IF EXISTS `job_items`;
CREATE TABLE `job_items` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id`      bigint unsigned NOT NULL,
  `tariff_id`   bigint unsigned DEFAULT NULL,
  -- Snapshot del arancel al momento de crear
  `description` varchar(255) NOT NULL,
  `quantity`    decimal(8,3) NOT NULL DEFAULT 1.000,
  `unit_price`  decimal(12,2) NOT NULL,
  `discount`    decimal(12,2) DEFAULT 0.00,
  `total`       decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ji_job` (`job_id`),
  CONSTRAINT `fk_ji_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ji_tariff` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dientes involucrados en el trabajo
DROP TABLE IF EXISTS `job_teeth`;
CREATE TABLE `job_teeth` (
  `id`      bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id`  bigint unsigned NOT NULL,
  `tooth`   varchar(10) NOT NULL COMMENT 'Número FDI: 11, 12, 21... o 11-16 para rango',
  `note`    varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jt_job` (`job_id`),
  CONSTRAINT `fk_jt_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Historial de estados del trabajo
DROP TABLE IF EXISTS `job_status_history`;
CREATE TABLE `job_status_history` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id`     bigint unsigned NOT NULL,
  `user_id`    bigint unsigned DEFAULT NULL,
  `status`     varchar(64) NOT NULL,
  `note`       text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jsh_job` (`job_id`),
  CONSTRAINT `fk_jsh_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Archivos adjuntos (fotos, rx, stl, etc.)
DROP TABLE IF EXISTS `job_attachments`;
CREATE TABLE `job_attachments` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id`      bigint unsigned NOT NULL,
  `user_id`     bigint unsigned DEFAULT NULL,
  `filename`    varchar(255) NOT NULL,
  `url`         varchar(500) NOT NULL,
  `mime_type`   varchar(100) DEFAULT NULL,
  `size_bytes`  int unsigned DEFAULT NULL,
  `note`        varchar(255) DEFAULT NULL,
  `created_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ja_job` (`job_id`),
  CONSTRAINT `fk_ja_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5.6 Cuentas Corrientes del Laboratorio (por odontólogo)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `lab_accounts`;
CREATE TABLE `lab_accounts` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `dentist_id`  bigint unsigned NOT NULL,
  `balance`     decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Negativo = debe, Positivo = saldo a favor',
  `created_at`  timestamp NULL DEFAULT NULL,
  `updated_at`  timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lab_account_dentist` (`dentist_id`),
  CONSTRAINT `fk_la_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Movimientos de la cuenta corriente
DROP TABLE IF EXISTS `lab_account_moves`;
CREATE TABLE `lab_account_moves` (
  `id`             bigint unsigned NOT NULL AUTO_INCREMENT,
  `lab_account_id` bigint unsigned NOT NULL,
  `user_id`        bigint unsigned DEFAULT NULL COMMENT 'Quién registró',
  `type`           enum('charge','payment','adjustment','note_credit','note_debit') NOT NULL,
  `amount`         decimal(14,2) NOT NULL COMMENT 'Siempre positivo; el tipo define si suma o resta',
  `balance_after`  decimal(14,2) DEFAULT NULL COMMENT 'Saldo resultante para trazabilidad',
  `description`    varchar(255) DEFAULT NULL,
  `reference_type` varchar(64) DEFAULT NULL COMMENT 'job, invoice, manual',
  `reference_id`   bigint unsigned DEFAULT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `move_date`      date NOT NULL,
  `created_at`     timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lam_account` (`lab_account_id`),
  KEY `idx_lam_date` (`move_date`),
  KEY `idx_lam_reference` (`reference_type`, `reference_id`),
  CONSTRAINT `fk_lam_account` FOREIGN KEY (`lab_account_id`) REFERENCES `lab_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lam_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lam_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 6. COLABORADORES DEL LABORATORIO
-- =====================================================================
--  Gestiona técnicos / colaboradores del lab:
--    · Ficha del colaborador (tarifa horaria, datos, biométrico)
--    · Control de asistencia: fichaje entrada/salida → horas → monto
--    · Extras y descuentos por período
--    · Recibos de haberes (liquidación)
--    · Asignación a órdenes de trabajo
-- =====================================================================

-- ---------------------------------------------------------------------
-- 6.1 Colaboradores
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `collaborators`;
CREATE TABLE `collaborators` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`   bigint unsigned NOT NULL,
  -- Datos personales
  `name`         varchar(191) NOT NULL,
  `document`     varchar(30) DEFAULT NULL COMMENT 'DNI',
  `email`        varchar(191) DEFAULT NULL,
  `phone`        varchar(64) DEFAULT NULL,
  `address`      varchar(255) DEFAULT NULL,
  `birth_date`   date DEFAULT NULL,
  -- Configuración laboral
  `hourly_rate`  decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Valor hora en ARS',
  `specialty`    varchar(100) DEFAULT NULL COMMENT 'Ceramista, Protesista, Técnico general, etc.',
  -- Biometría para fichaje facial (FaceIO)
  `faceio_fid`   varchar(255) DEFAULT NULL COMMENT 'FaceIO Face ID para fichaje biométrico',
  -- Estado
  `is_active`    tinyint(1) DEFAULT 1,
  `notes`        text DEFAULT NULL,
  `created_at`   timestamp NULL DEFAULT NULL,
  `updated_at`   timestamp NULL DEFAULT NULL,
  `deleted_at`   timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_collaborator_faceio` (`faceio_fid`),
  KEY `idx_collab_company` (`company_id`),
  CONSTRAINT `fk_collab_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6.2 Asistencias / Fichajes
--   Cada fila = 1 jornada. time_in y time_out se van completando
--   a medida que el colaborador ficha (biométrico o manual).
--   Al cerrar (time_out), se calculan hours y amount automáticamente
--   vía trigger o lógica de aplicación.
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `collaborator_attendances`;
CREATE TABLE `collaborator_attendances` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`       bigint unsigned NOT NULL,
  `collaborator_id`  bigint unsigned NOT NULL,
  `work_date`        date NOT NULL,
  -- Fichaje
  `time_in`          time DEFAULT NULL,
  `time_out`         time DEFAULT NULL,
  -- Calculados al cierre
  `hours`            decimal(6,2) DEFAULT 0.00 COMMENT 'Horas trabajadas (calculadas)',
  `hourly_rate_snap` decimal(12,2) DEFAULT 0.00 COMMENT 'Tarifa horaria al momento del fichaje (snapshot)',
  `amount`           decimal(12,2) DEFAULT 0.00 COMMENT 'hours × hourly_rate_snap',
  -- Origen del fichaje
  `method`           enum('biometric','manual','system') DEFAULT 'manual',
  `ip_address`       varchar(45) DEFAULT NULL,
  `device_info`      varchar(255) DEFAULT NULL,
  -- Ajustes manuales
  `is_absent`        tinyint(1) DEFAULT 0 COMMENT 'Ausencia justificada/injustificada',
  `absence_reason`   varchar(191) DEFAULT NULL,
  `notes`            text DEFAULT NULL,
  `created_at`       timestamp NULL DEFAULT NULL,
  `updated_at`       timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_day` (`collaborator_id`, `work_date`) COMMENT 'Un registro por día por colaborador',
  KEY `idx_att_company_date` (`company_id`, `work_date`),
  KEY `idx_att_collaborator_date` (`collaborator_id`, `work_date`),
  CONSTRAINT `fk_att_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6.3 Extras por período (bonificaciones, horas extra, viáticos, etc.)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `collaborator_extras`;
CREATE TABLE `collaborator_extras` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`      bigint unsigned NOT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `date`            date NOT NULL,
  `concept`         varchar(255) NOT NULL COMMENT 'Horas extra, Viático, Presentismo, etc.',
  `amount`          decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at`      timestamp NULL DEFAULT NULL,
  `updated_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_extras_collab_date` (`collaborator_id`, `date`),
  CONSTRAINT `fk_extras_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6.4 Descuentos por período (adelantos, faltas, retenciones, etc.)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `collaborator_discounts`;
CREATE TABLE `collaborator_discounts` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`      bigint unsigned NOT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `date`            date NOT NULL,
  `concept`         varchar(255) NOT NULL COMMENT 'Adelanto, Falta injustificada, Retención, etc.',
  `amount`          decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at`      timestamp NULL DEFAULT NULL,
  `updated_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_discounts_collab_date` (`collaborator_id`, `date`),
  CONSTRAINT `fk_discounts_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6.5 Recibos de Haberes (liquidación por período)
--   Agrupa: horas trabajadas + extras - descuentos = neto a pagar
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `collaborator_receipts`;
CREATE TABLE `collaborator_receipts` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `company_id` bigint unsigned NOT NULL,
    `collaborator_id` bigint unsigned NOT NULL,
    `created_by` bigint unsigned DEFAULT NULL COMMENT 'Usuario que liquidó',
    `payment_method_id` bigint unsigned DEFAULT NULL,
    -- Período liquidado
    `period_from` date NOT NULL,
    `period_to` date NOT NULL,
    -- Detalle del cálculo
    `days_worked` smallint DEFAULT 0,
    `hours` decimal(8,2) DEFAULT 0.00 COMMENT 'Total horas del período',
    `gross` decimal(12,2) DEFAULT 0.00 COMMENT 'hours × tarifa = bruto',
    `extras_total` decimal(12,2) DEFAULT 0.00,
    `discounts_total` decimal(12,2) DEFAULT 0.00,
    `net` decimal(12,2) DEFAULT 0.00 COMMENT 'gross + extras - discounts',
    -- Estado del pago
    `status` enum('draft','paid','cancelled') DEFAULT 'draft',
    `paid_at` datetime DEFAULT NULL,
    `notes` text DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_receipts_collaborator` (`collaborator_id`),
    KEY `idx_receipts_period` (`period_from`, `period_to`),
    CONSTRAINT `fk_receipts_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_receipts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_receipts_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6.6 Asignación de Colaboradores a Órdenes de Trabajo
--   Un job puede tener varios colaboradores.
--   Un colaborador puede estar en varios jobs simultáneamente.
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `job_collaborators`;
CREATE TABLE `job_collaborators` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id`          bigint unsigned NOT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `assigned_by`     bigint unsigned DEFAULT NULL COMMENT 'Usuario que asignó',
  `role`            varchar(100) DEFAULT NULL COMMENT 'Rol en este trabajo: ceramista, montaje, etc.',
  `assigned_at`     datetime DEFAULT NULL,
  `completed_at`    datetime DEFAULT NULL COMMENT 'Cuando terminó su parte',
  `notes`           varchar(255) DEFAULT NULL,
  `created_at`      timestamp NULL DEFAULT NULL,
  `updated_at`      timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_job_collaborator` (`job_id`, `collaborator_id`),
  KEY `idx_jc_collaborator` (`collaborator_id`),
  KEY `idx_jc_job` (`job_id`),
  CONSTRAINT `fk_jc_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jc_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jc_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 8. INGRESOS Y EGRESOS GENERALES
-- =====================================================================

DROP TABLE IF EXISTS `expense_categories`;
CREATE TABLE `expense_categories` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`       varchar(100) NOT NULL COMMENT 'Alquiler, Servicios, Insumos, Sueldos, etc.',
  `type`       enum('expense','income') DEFAULT 'expense',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Egresos (gastos de la empresa/laboratorio)
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `id`                  bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`          bigint unsigned NOT NULL,
  `branch_id`           bigint unsigned DEFAULT NULL,
  `expense_category_id` bigint unsigned DEFAULT NULL,
  `user_id`             bigint unsigned DEFAULT NULL COMMENT 'Quién registró',
  `payment_method_id`   bigint unsigned DEFAULT NULL,
  `description`         varchar(255) NOT NULL,
  `amount`              decimal(12,2) NOT NULL,
  `tax_amount`          decimal(12,2) DEFAULT 0.00,
  `vendor_id`           bigint unsigned DEFAULT NULL COMMENT 'Proveedor al que se le pagó',
  `reference`           varchar(191) DEFAULT NULL COMMENT 'N° factura, remito, etc.',
  `expense_date`        date NOT NULL,
  `notes`               text DEFAULT NULL,
  `created_at`          timestamp NULL DEFAULT NULL,
  `updated_at`          timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_expenses_company` (`company_id`),
  KEY `idx_expenses_date` (`expense_date`),
  CONSTRAINT `fk_expenses_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_expenses_category` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ingresos no relacionados a ventas (subsidios, transferencias, etc.)
DROP TABLE IF EXISTS `income_records`;
CREATE TABLE `income_records` (
  `id`                  bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id`          bigint unsigned NOT NULL,
  `expense_category_id` bigint unsigned DEFAULT NULL,
  `user_id`             bigint unsigned DEFAULT NULL,
  `payment_method_id`   bigint unsigned DEFAULT NULL,
  `description`         varchar(255) NOT NULL,
  `amount`              decimal(12,2) NOT NULL,
  `income_date`         date NOT NULL,
  `notes`               text DEFAULT NULL,
  `created_at`          timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_income_company` (`company_id`),
  CONSTRAINT `fk_income_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- 9. DATOS INICIALES (Seed)
-- =====================================================================

-- Roles del sistema
INSERT INTO `roles` (`name`, `display_name`, `created_at`) VALUES
  ('admin',             'Administrador',         NOW()),
  ('lab_operator',      'Operario de Lab',        NOW()),
  ('lab_manager',       'Jefe de Laboratorio',    NOW()),
  ('seller',            'Vendedor POS',           NOW()),
  ('ecommerce_manager', 'Gestor E-Commerce',      NOW());

-- Tipos de factura AFIP más comunes
INSERT INTO `invoice_types` (`name`, `afip_code`) VALUES
  ('Factura A',         '001'),
  ('Nota de Débito A',  '002'),
  ('Nota de Crédito A', '003'),
  ('Factura B',         '006'),
  ('Nota de Débito B',  '007'),
  ('Nota de Crédito B', '008'),
  ('Factura C',         '011'),
  ('Nota de Débito C',  '012'),
  ('Nota de Crédito C', '013'),
  ('Recibo A',          '004'),
  ('Recibo B',          '009');

-- Alícuotas IVA
INSERT INTO `taxes` (`name`, `rate`, `afip_code`) VALUES
  ('IVA 21%',   21.00, '5'),
  ('IVA 10.5%', 10.50, '4'),
  ('IVA 27%',   27.00, '6'),
  ('Exento',     0.00, '2'),
  ('No Gravado', 0.00, '1');

-- Métodos de Pago base
INSERT INTO `payment_methods` (`name`, `type`, `surcharge_pct`, `applies_to`) VALUES
  ('Efectivo',              'cash',        0.00, 'ecommerce,pos,lab'),
  ('Transferencia Bancaria','transfer',    0.00, 'ecommerce,pos,lab'),
  ('Débito',                'card_debit',  0.00, 'pos,lab'),
  ('Crédito 1 cuota',       'card_credit', 0.00, 'pos,lab'),
  ('MercadoPago',           'mp',          0.00, 'ecommerce,pos'),
  ('Cheque',                'check',       0.00, 'lab');

-- Categorías de Gastos base
INSERT INTO `expense_categories` (`name`, `type`) VALUES
  ('Alquiler',         'expense'),
  ('Servicios (luz, agua, gas)', 'expense'),
  ('Sueldos y jornales', 'expense'),
  ('Insumos de laboratorio', 'expense'),
  ('Insumos de oficina', 'expense'),
  ('Mantenimiento',    'expense'),
  ('Impuestos y tasas','expense'),
  ('Otros gastos',     'expense'),
  ('Otros ingresos',   'income');


SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
