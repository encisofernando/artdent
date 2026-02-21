use artdent_lab;

USE `artdent_lab`;

SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- LIMPIEZA
-- =========================

TRUNCATE TABLE `ecommerce_order_items`;
TRUNCATE TABLE `ecommerce_orders`;

TRUNCATE TABLE `invoice_items`;
TRUNCATE TABLE `invoices`;
TRUNCATE TABLE `receipts`;

TRUNCATE TABLE `sale_items`;
TRUNCATE TABLE `sales`;

TRUNCATE TABLE `purchase_items`;
TRUNCATE TABLE `purchases`;

TRUNCATE TABLE `stock_movements`;
TRUNCATE TABLE `stocks`;

TRUNCATE TABLE `product_images`;
TRUNCATE TABLE `products`;

SET FOREIGN_KEY_CHECKS = 1;
