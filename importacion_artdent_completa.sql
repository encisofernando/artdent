-- =====================================================================
-- SCRIPT DE IMPORTACIÓN DE PRODUCTOS Y STOCK INICIAL (SIN ACRITONE)
-- =====================================================================
SET @company_id = 1;
SET @tax_id = 1;
SET @warehouse_id = 1;

START TRANSACTION;

-- Producto: ACRILICO POLIMERO AUTOCURABLE SUBITON x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO POLIMERO AUTOCURABLE SUBITON x 1Kg', 'acrilico-polimero-autocurable-subiton-x-1kg', '7', 41646.09, 62500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: ACRILICO LIQUIDO AUTOCURABLE SUBITON x 1Lt
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO LIQUIDO AUTOCURABLE SUBITON x 1Lt', 'acrilico-liquido-autocurable-subiton-x-1lt', '8', 27674.0, 41500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: ACRILICO PARA COLADO APC OKI x 800Gs
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA COLADO APC OKI x 800Gs', 'acrilico-para-colado-apc-oki-x-800gs', '9', 75756.0, 113600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE CELESTE x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE CELESTE x 1Kg', 'acrilico-para-cubetas-oki-cril-autopolimerizable-celeste-x-1kg', '10', 46640.0, 70000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: ACRILICO PARA ORTODONCIA OKI AUTOPOLIMERIZABLE CRISTAL x 1Kg 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA ORTODONCIA OKI AUTOPOLIMERIZABLE CRISTAL x 1Kg ', 'acrilico-para-ortodoncia-oki-autopolimerizable-cristal-x-1kg', '11', 86000.0, 129000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: ACRILICO PARA ORTODONCIA OKI AUTOPOLIMERIZABLE BLANCO/NEGRO x 400Gs 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA ORTODONCIA OKI AUTOPOLIMERIZABLE BLANCO/NEGRO x 400Gs ', 'acrilico-para-ortodoncia-oki-autopolimerizable-blanconegro-x-400gs', '12', 42360.0, 63500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: ACRILICO ROSADO PARA PLACA BASE INDENTAL x 1 Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO ROSADO PARA PLACA BASE INDENTAL x 1 Kg', 'acrilico-rosado-para-placa-base-indental-x-1-kg', '13', 45000.0, 67500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: ACRILICO PARA INYECCION API x 1Kg CLARO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA INYECCION API x 1Kg CLARO', 'acrilico-para-inyeccion-api-x-1kg-claro', '14', 155800.0, 233700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: ACRILICO PARA INYECCION API x 1Kg CRISTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA INYECCION API x 1Kg CRISTAL', 'acrilico-para-inyeccion-api-x-1kg-cristal', '15', 155800.0, 233700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 3, NOW());

-- Producto: ACRILICO PARA INYECCION API x 1Kg MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA INYECCION API x 1Kg MEDIO', 'acrilico-para-inyeccion-api-x-1kg-medio', '16', 155800.0, 233700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: ACRILICO PARA INYECCION API x 1Kg OSCURO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA INYECCION API x 1Kg OSCURO', 'acrilico-para-inyeccion-api-x-1kg-oscuro', '17', 155800.0, 233700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: ACRILICO PARA INYECCION API x 1Kg ROSADO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA INYECCION API x 1Kg ROSADO', 'acrilico-para-inyeccion-api-x-1kg-rosado', '18', 155800.0, 233700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 7, NOW());

-- Producto: ACRILICO PARA INYECCION API x 1/2Kg CRISTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA INYECCION API x 1/2Kg CRISTAL', 'acrilico-para-inyeccion-api-x-12kg-cristal', '19', 96030.0, 144000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: ACRILICO TERMOCURABLE EGEO ROSA x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO TERMOCURABLE EGEO ROSA x 1Kg', 'acrilico-termocurable-egeo-rosa-x-1kg', '20', 36000.0, 54000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: ACRILICO POLIMERO TERMOCURABLE PROTHOPLAST x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO POLIMERO TERMOCURABLE PROTHOPLAST x 1Kg', 'acrilico-polimero-termocurable-prothoplast-x-1kg', '21', 36608.51, 54900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: ALAMBRE 0,9mm MORELLI x 50Gs
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALAMBRE 0,9mm MORELLI x 50Gs', 'alambre-09mm-morelli-x-50gs', '22', 13000.0, 19500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: ALAMBRE PARA APOYOS ACLUSALES O RETENEDORES MEDIA CAÑA 10CM X 5Unid
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALAMBRE PARA APOYOS ACLUSALES O RETENEDORES MEDIA CAÑA 10CM X 5Unid', 'alambre-para-apoyos-aclusales-o-retenedores-media-cana-10cm-x-5unid', '23', 13000.0, 19500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA', 'alginato-high-precision-alginmax-major-x-453gs-vainilla', '24', 10000.0, 15000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -14, NOW());

-- Producto: ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES', 'alginato-extra-high-precision-alginplus-major-x-453gs-frutos-tropicales', '25', 9900.0, 14800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -6, NOW());

-- Producto: BARBIJO DESCARTABLE VERDE Caja x 50Un
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJO DESCARTABLE VERDE Caja x 50Un', 'barbijo-descartable-verde-caja-x-50un', '26', 5200.0, 8300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: BARBIJO DESCARTABLE NEGRO Caja x 50Un
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJO DESCARTABLE NEGRO Caja x 50Un', 'barbijo-descartable-negro-caja-x-50un', '27', 5200.0, 8300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: BARBIJO DESCARTABLE  BLANCO Caja x 50Un
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJO DESCARTABLE  BLANCO Caja x 50Un', 'barbijo-descartable-blanco-caja-x-50un', '28', 5200.0, 8300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: BARBIJO DESCARTABLE CELESTE Caja x 50Un
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJO DESCARTABLE CELESTE Caja x 50Un', 'barbijo-descartable-celeste-caja-x-50un', '29', 5200.0, 8300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: BARBIJO DESCARTABLE ROSADO Caja x 50Un
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJO DESCARTABLE ROSADO Caja x 50Un', 'barbijo-descartable-rosado-caja-x-50un', '30', 5200.0, 8300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: BASE PORTA PINCEL INDENTAL 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BASE PORTA PINCEL INDENTAL ', 'base-porta-pincel-indental', '32', 44000.0, 70400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: BISTURI HOJAS DESCARTABLES x Unidad
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BISTURI HOJAS DESCARTABLES x Unidad', 'bisturi-hojas-descartables-x-unidad', '33', 156.94559999999998, 250, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: BISTURI HOJAS DESCARTABLES Caja x 50Un
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BISTURI HOJAS DESCARTABLES Caja x 50Un', 'bisturi-hojas-descartables-caja-x-50un', '34', 13078.8, 18300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 120mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 120mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-classic-22mm-x-120mm-rosa-medio', '382', 6600.0, 9900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 85mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 85mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-classic-22mm-x-85mm-rosa-medio', '383', 5950.0, 8900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 55mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 55mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-classic-22mm-x-55mm-rosa-medio', '384', 5000.0, 7500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 19, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 90mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 90mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-classic-25mm-x-90mm-rosa-medio', '385', 6600.0, 9900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 21, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 70mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 70mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-classic-25mm-x-70mm-rosa-medio', '386', 5950.0, 8900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 30, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 50mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 50mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-classic-25mm-x-50mm-rosa-medio', '387', 5000.0, 7500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 17, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 120mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 120mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-fluence-22mm-x-120mm-rosa-medio', '388', 6600.0, 9900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 19, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 85mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 85mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-fluence-22mm-x-85mm-rosa-medio', '389', 5950.0, 8900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 20, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 55mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 55mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-fluence-22mm-x-55mm-rosa-medio', '390', 5000.0, 7500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 19, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 90mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 90mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-fluence-25mm-x-90mm-rosa-medio', '391', 6600.0, 9900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 28, NOW());

-- Producto: CARTUCHO POLIAMIDA DEFLEX FLUENCE 25mm x 70mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA DEFLEX FLUENCE 25mm x 70mm ROSA MEDIO', 'cartucho-poliamida-deflex-fluence-25mm-x-70mm-rosa-medio', '392', 5950.0, 8900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 29, NOW());

-- Producto: CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 50mm ROSA MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 50mm ROSA MEDIO', 'cartucho-poliamida-para-inyeccion-deflex-fluence-25mm-x-50mm-rosa-medio', '393', 5000.0, 7500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 20, NOW());

-- Producto: CARTUCHO PARA INYECCION INDENTAL INDENT FLEX 22mm x 120mm 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO PARA INYECCION INDENTAL INDENT FLEX 22mm x 120mm ', 'cartucho-para-inyeccion-indental-indent-flex-22mm-x-120mm', '394', 4500.0, 6700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 20, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 22mm CLARO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 22mm CLARO', 'cartucho-acrilico-para-inyeccion-api-22mm-claro', '395', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 18, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 22mm CRISTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 22mm CRISTAL', 'cartucho-acrilico-para-inyeccion-api-22mm-cristal', '396', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 20, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 22mm MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 22mm MEDIO', 'cartucho-acrilico-para-inyeccion-api-22mm-medio', '397', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 28, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 22mm OSCURO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 22mm OSCURO', 'cartucho-acrilico-para-inyeccion-api-22mm-oscuro', '398', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 13, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 22mm ROSADO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 22mm ROSADO', 'cartucho-acrilico-para-inyeccion-api-22mm-rosado', '399', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 107, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 25mm CLARO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 25mm CLARO', 'cartucho-acrilico-para-inyeccion-api-25mm-claro', '400', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 25mm CRISTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 25mm CRISTAL', 'cartucho-acrilico-para-inyeccion-api-25mm-cristal', '401', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 40, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 25mm MEDIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 25mm MEDIO', 'cartucho-acrilico-para-inyeccion-api-25mm-medio', '402', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 28, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 25mm OSCURO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 25mm OSCURO', 'cartucho-acrilico-para-inyeccion-api-25mm-oscuro', '403', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 23, NOW());

-- Producto: CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO', 'cartucho-acrilico-para-inyeccion-api-25mm-rosado', '404', 7420.0, 11100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 31, NOW());

-- Producto: CARTUCHOS VACIOS PARA INYECCION INDENTAL 22mm x 120mm CON TAPA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHOS VACIOS PARA INYECCION INDENTAL 22mm x 120mm CON TAPA ', 'cartuchos-vacios-para-inyeccion-indental-22mm-x-120mm-con-tapa', '405', 800.0, 1300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 14, NOW());

-- Producto: CARTUCHOS VACIOS PARA INYECCION INDENTAL 25mm x 100mm CON TAPA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CARTUCHOS VACIOS PARA INYECCION INDENTAL 25mm x 100mm CON TAPA ', 'cartuchos-vacios-para-inyeccion-indental-25mm-x-100mm-con-tapa', '406', 800.0, 1300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 5, NOW());

-- Producto: CEPILLO 2 HILERAS ROMAN PARA PULIDORA x UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CEPILLO 2 HILERAS ROMAN PARA PULIDORA x UNIDAD', 'cepillo-2-hileras-roman-para-pulidora-x-unidad', '407', 4000.0, 6000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 124, NOW());

-- Producto: CERA CERVICAL OKI x 50gr
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CERA CERVICAL OKI x 50gr', 'cera-cervical-oki-x-50gr', '408', 37000.0, 59200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 182, NOW());

-- Producto: CERA CROMO INDENTAL x 1/2Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CERA CROMO INDENTAL x 1/2Kg', 'cera-cromo-indental-x-12kg', '409', 37000.0, 59200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: CERA ROSA EN LAMINAS INDENTAL CAJA x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CERA ROSA EN LAMINAS INDENTAL CAJA x 1Kg', 'cera-rosa-en-laminas-indental-caja-x-1kg', '410', 36100.0, 57800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: CERA ROSA EN LAMINAS INDENTAL x UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CERA ROSA EN LAMINAS INDENTAL x UNIDAD', 'cera-rosa-en-laminas-indental-x-unidad', '411', 700.0, 1100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -2, NOW());

-- Producto: CERA PARA INMERSION OKI x 30Gs
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CERA PARA INMERSION OKI x 30Gs', 'cera-para-inmersion-oki-x-30gs', '412', 29700.0, 47500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 8, NOW());

-- Producto: CERA PREFORMADA INDENTAL PLACA CERICA INF. O SUP. x UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CERA PREFORMADA INDENTAL PLACA CERICA INF. O SUP. x UNIDAD', 'cera-preformada-indental-placa-cerica-inf-o-sup-x-unidad', '413', 560.0, 900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -125, NOW());

-- Producto: CERA REGULAR PARA FIJA OKI VARIOS COLORES x 50Gs 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CERA REGULAR PARA FIJA OKI VARIOS COLORES x 50Gs ', 'cera-regular-para-fija-oki-varios-colores-x-50gs', '414', 33000.0, 52800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: CIZALLA PARA CORTE YESO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CIZALLA PARA CORTE YESO', 'cizalla-para-corte-yeso', '415', 27500.0, 38500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 192, NOW());

-- Producto: COMPRESA PAQUETE x 50 UNIDADES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'COMPRESA PAQUETE x 50 UNIDADES', 'compresa-paquete-x-50-unidades', '416', 6000.0, 8400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 13, NOW());

-- Producto: CREMA SUPER BRILLO INDENTAL x 20Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CREMA SUPER BRILLO INDENTAL x 20Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)', 'crema-super-brillo-indental-x-20gs-poliamida-flexible-acrilico-metal', '417', 19000.0, 30400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: DESMOLDANTE PARA INYECCION INDENTAL EN AEROSOL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'DESMOLDANTE PARA INYECCION INDENTAL EN AEROSOL', 'desmoldante-para-inyeccion-indental-en-aerosol', '418', 10100.0, 1620, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: DESMOLDANTE SILICONADO PARA INYECCION DEFLEX EN AEROSOL x 290Gs
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'DESMOLDANTE SILICONADO PARA INYECCION DEFLEX EN AEROSOL x 290Gs', 'desmoldante-siliconado-para-inyeccion-deflex-en-aerosol-x-290gs', '419', 5800.0, 8700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: DISCO DE FIBRA SILICIO FLEXIBLE 22mm x 0,2mm
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'DISCO DE FIBRA SILICIO FLEXIBLE 22mm x 0,2mm', 'disco-de-fibra-silicio-flexible-22mm-x-02mm', '420', 1900.0, 3000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 3, NOW());

-- Producto: DOSIFICADOR AGUA-ALGINATO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'DOSIFICADOR AGUA-ALGINATO', 'dosificador-agua-alginato', '421', 2200.0, 3000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: ESTUCHE BUCAL PLASTICO VARIOS COLORES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ESTUCHE BUCAL PLASTICO VARIOS COLORES', 'estuche-bucal-plastico-varios-colores', '422', 1000.0, 1600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: FLAMEADOR ROMAN
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'FLAMEADOR ROMAN', 'flameador-roman', '423', 4400.0, 6500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: FRESON CARBURO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'FRESON CARBURO ', 'freson-carburo', '424', 15500.0, 24800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 59, NOW());

-- Producto: GELATINA PARA COLADO API SOBRE PARA 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GELATINA PARA COLADO API SOBRE PARA 1Kg', 'gelatina-para-colado-api-sobre-para-1kg', '425', 26800.0, 42900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: GLACE PARA PORCELANA INDENTAL MONO PASTA x 10gr 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GLACE PARA PORCELANA INDENTAL MONO PASTA x 10gr ', 'glace-para-porcelana-indental-mono-pasta-x-10gr', '426', 67000.0, 107200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: GUANTES LATEX DESCARTABLES CAJA x 100 Ud 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GUANTES LATEX DESCARTABLES CAJA x 100 Ud ', 'guantes-latex-descartables-caja-x-100-ud', '427', 6200.0, 8700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: GUANTES NITRILO DESCARTABLES CAJA x 100 Ud 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GUANTES NITRILO DESCARTABLES CAJA x 100 Ud ', 'guantes-nitrilo-descartables-caja-x-100-ud', '428', 6200.0, 8700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 3, NOW());

-- Producto: HORNO DE DESENCERADO COMPUTARIZADO TECNODENT H-21 E FURNACE USADO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'HORNO DE DESENCERADO COMPUTARIZADO TECNODENT H-21 E FURNACE USADO', 'horno-de-desencerado-computarizado-tecnodent-h-21-e-furnace-usado', '430', 900000.0, 1440000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 8, NOW());

-- Producto: INDENT-FLEX MATERIAL DE INYECCION INDENTAL x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'INDENT-FLEX MATERIAL DE INYECCION INDENTAL x 1Kg', 'indent-flex-material-de-inyeccion-indental-x-1kg', '431', 70900.0, 99300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: INDENT-FLEX MATERIAL DE INYECCION INDENTAL x 1/2Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'INDENT-FLEX MATERIAL DE INYECCION INDENTAL x 1/2Kg', 'indent-flex-material-de-inyeccion-indental-x-12kg', '432', 40700.0, 57000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: INYECTORA COMPUTARIZADA INDENTAL PARA FLEXIBLE DE AIRE
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'INYECTORA COMPUTARIZADA INDENTAL PARA FLEXIBLE DE AIRE', 'inyectora-computarizada-indental-para-flexible-de-aire', '433', 1225000.0, 1960000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: KIT SISTEMA COLADO APC 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'KIT SISTEMA COLADO APC ', 'kit-sistema-colado-apc', '434', 415000.0, 581000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: KIT REPARACION PARA API
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'KIT REPARACION PARA API', 'kit-reparacion-para-api', '435', 32000.0, 44800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: KIT ZOCALOS ROSA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'KIT ZOCALOS ROSA', 'kit-zocalos-rosa', '436', 10990.0, 15400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: LACA OPACADORA PARA ACRILICO INDENTAL COLOR ROSA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LACA OPACADORA PARA ACRILICO INDENTAL COLOR ROSA', 'laca-opacadora-para-acrilico-indental-color-rosa', '437', 23900.0, 33500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: LACA OPACADORA PARA ACRILICO INDENTAL COLOR DIENTE
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LACA OPACADORA PARA ACRILICO INDENTAL COLOR DIENTE', 'laca-opacadora-para-acrilico-indental-color-diente', '438', 23900.0, 33500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: LACA DE ESCAYOLA INDENTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LACA DE ESCAYOLA INDENTAL', 'laca-de-escayola-indental', '439', 14000.0, 19600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: LIQUIDO CHEQUEADOR DE SUPERFICIES INDENTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LIQUIDO CHEQUEADOR DE SUPERFICIES INDENTAL', 'liquido-chequeador-de-superficies-indental', '440', 7000.0, 9800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: LIQUIDO GLACE PARA PORCELANA OKI
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LIQUIDO GLACE PARA PORCELANA OKI', 'liquido-glace-para-porcelana-oki', '441', 25000.0, 35000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: LIQUIDO MODELADOR PARA PORCELANA OKI x 100cc
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LIQUIDO MODELADOR PARA PORCELANA OKI x 100cc', 'liquido-modelador-para-porcelana-oki-x-100cc', '442', 30000.0, 42000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MANDRIL PARA DISCO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MANDRIL PARA DISCO ', 'mandril-para-disco', '443', 860.0, 1400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MANDRIL PARA LIJA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MANDRIL PARA LIJA', 'mandril-para-lija', '444', 860.0, 1400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 3, NOW());

-- Producto: MATRIZ DE PONTICOS Y TRAMOS PARA PORCELANA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MATRIZ DE PONTICOS Y TRAMOS PARA PORCELANA', 'matriz-de-ponticos-y-tramos-para-porcelana', '445', 45000.0, 500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 3, NOW());

-- Producto: MATRIZ DE SILICONA PARA CARILLAS PARA SOBRE DENTADURA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MATRIZ DE SILICONA PARA CARILLAS PARA SOBRE DENTADURA', 'matriz-de-silicona-para-carillas-para-sobre-dentadura', '446', 45000.0, 58500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MATRIZ DE SILICONA PARA CARAS OCLUSALES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MATRIZ DE SILICONA PARA CARAS OCLUSALES', 'matriz-de-silicona-para-caras-oclusales', '447', 45000.0, 58500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MATRIZ DE SILICONA PARA RODETES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MATRIZ DE SILICONA PARA RODETES', 'matriz-de-silicona-para-rodetes', '448', 45000.0, 58500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MECHERO PARA LABORATORIO CON RECIPIENTE CON VALVULA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MECHERO PARA LABORATORIO CON RECIPIENTE CON VALVULA', 'mechero-para-laboratorio-con-recipiente-con-valvula', '449', 134000.0, 174200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MICROBRUSH
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MICROBRUSH', 'microbrush', '450', 3270.0, 5200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MICROMOTOR ELECTRICO RENHE 119
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MICROMOTOR ELECTRICO RENHE 119', 'micromotor-electrico-renhe-119', '451', 189000.0, 264600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MINIACUTRAC
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MINIACUTRAC', 'miniacutrac', '452', 9000.0, 12600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MODIFICADOR DE COLORES PARA ACRILICO KIT DE 4 COLORES + BETAS
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MODIFICADOR DE COLORES PARA ACRILICO KIT DE 4 COLORES + BETAS', 'modificador-de-colores-para-acrilico-kit-de-4-colores-betas', '453', 35000.0, 49000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: MONOMERO PARA COLADO OKI x 1Lt
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO PARA COLADO OKI x 1Lt', 'monomero-para-colado-oki-x-1lt', '454', 42140.0, 59000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MONOMERO SEMIFLEX API x 1Lt
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO SEMIFLEX API x 1Lt', 'monomero-semiflex-api-x-1lt', '455', 60110.0, 84100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MONOMERO TERMOCURADO x 1Lt
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO TERMOCURADO x 1Lt', 'monomero-termocurado-x-1lt', '456', 23000.0, 36800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MONOMERO AUTO x 1Lt NEW POLL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO AUTO x 1Lt NEW POLL', 'monomero-auto-x-1lt-new-poll', '457', 51775.0, 72500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MONOMERO AUTO x 1Lt VERACRIL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO AUTO x 1Lt VERACRIL', 'monomero-auto-x-1lt-veracril', '458', 38935.0, 54500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: MONOMERO AUTO x 1Lt VAICEL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO AUTO x 1Lt VAICEL', 'monomero-auto-x-1lt-vaicel', '459', 36923.0, 51700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: MONOMERO AUTO x 1Lt SUBITON
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO AUTO x 1Lt SUBITON', 'monomero-auto-x-1lt-subiton', '460', 36868.0, 51700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MONOMERO TERMO x 1Lt NEW POLL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO TERMO x 1Lt NEW POLL', 'monomero-termo-x-1lt-new-poll', '461', 49478.0, 69300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MONOMERO TERMO x 1Lt VERACRIL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO TERMO x 1Lt VERACRIL', 'monomero-termo-x-1lt-veracril', '462', 37755.0, 52900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MONOMERO TERMO x 1Lt TERMODEN
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO TERMO x 1Lt TERMODEN', 'monomero-termo-x-1lt-termoden', '463', 33725.0, 47200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 8, NOW());

-- Producto: MONOMERO TERMO x 1Lt VAICRON
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO TERMO x 1Lt VAICRON', 'monomero-termo-x-1lt-vaicron', '464', 29082.0, 40700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MONOMERO TERMO x 1Lt PROTHOPLAST
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO TERMO x 1Lt PROTHOPLAST', 'monomero-termo-x-1lt-prothoplast', '465', 27839.0, 39000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MUFLA PARA SISTEMA APC INDENTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MUFLA PARA SISTEMA APC INDENTAL', 'mufla-para-sistema-apc-indental', '466', 78000.0, 109200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MUFLA METALICA PARA INYECTORA DEFLEX 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MUFLA METALICA PARA INYECTORA DEFLEX ', 'mufla-metalica-para-inyectora-deflex', '467', 20000.0, 28000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: OCLUSORES PLASTICOS PARA FIJA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'OCLUSORES PLASTICOS PARA FIJA', 'oclusores-plasticos-para-fija', '468', 360.0, 500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: OCLUSORES PARA REMOVIBLE ROMAN
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'OCLUSORES PARA REMOVIBLE ROMAN', 'oclusores-para-removible-roman', '469', 1400.0, 2000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: OPACIFICADOR DE METALES BASE ROSA INDENTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'OPACIFICADOR DE METALES BASE ROSA INDENTAL', 'opacificador-de-metales-base-rosa-indental', '470', 10000.0, 14000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: OPACIFICADOR DE METALES BASE DIENTE INDENTAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'OPACIFICADOR DE METALES BASE DIENTE INDENTAL', 'opacificador-de-metales-base-diente-indental', '471', 10000.0, 14000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: PASTA PARA BRILLO DEFLEX x 200Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PASTA PARA BRILLO DEFLEX x 200Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)', 'pasta-para-brillo-deflex-x-200gs-poliamida-flexible-acrilico-metal', '472', 6500.0, 9100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 48, NOW());

-- Producto: PASTA ALTO BRILLO INDENTAL x 20Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PASTA ALTO BRILLO INDENTAL x 20Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)', 'pasta-alto-brillo-indental-x-20gs-poliamida-flexible-acrilico-metal', '473', 1000.0, 1400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 25, NOW());

-- Producto: PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX BLANCO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX BLANCO', 'pasta-para-soporte-de-corona-jeringa-super-fix-blanco', '474', 3500.0, 4900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX MARRON
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX MARRON', 'pasta-para-soporte-de-corona-jeringa-super-fix-marron', '475', 3500.0, 4900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX BEIGE
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX BEIGE', 'pasta-para-soporte-de-corona-jeringa-super-fix-beige', '476', 3500.0, 4900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: PIEDRA POMEZ COMUN INDENTAL SUPER ESPECIAL x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PIEDRA POMEZ COMUN INDENTAL SUPER ESPECIAL x 1Kg', 'piedra-pomez-comun-indental-super-especial-x-1kg', '477', 3850.0, 5400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: PINCEL MANGO N°4 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PINCEL MANGO N°4 ', 'pincel-mango-n4', '478', 4000.0, 5600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x UNIDAD 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x UNIDAD ', 'placas-para-termoformado-rigida-008-2mm-egeo-x-unidad', '479', 1800.0, 2900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un ', 'placas-para-termoformado-rigida-008-2mm-egeo-x-pack-x-5un', '480', 12000.0, 19200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: PLACAS PARA TERMOFORMADO RIGIDA 0,02 (0,5mm) DENT 3D x PACK x 10Un 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PLACAS PARA TERMOFORMADO RIGIDA 0,02 (0,5mm) DENT 3D x PACK x 10Un ', 'placas-para-termoformado-rigida-002-05mm-dent-3d-x-pack-x-10un', '481', 5000.0, 8000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: PLACAS PARA TERMOFORMADO RIGIDA 0,03 (0,75mm) DENT 3D x PACK x 10Un 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PLACAS PARA TERMOFORMADO RIGIDA 0,03 (0,75mm) DENT 3D x PACK x 10Un ', 'placas-para-termoformado-rigida-003-075mm-dent-3d-x-pack-x-10un', '482', 5500.0, 8800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 10, NOW());

-- Producto: PLACAS PARA TERMOFORMADO RIGIDA 0,04 (1mm) DENT 3D x PACK x 10Un 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PLACAS PARA TERMOFORMADO RIGIDA 0,04 (1mm) DENT 3D x PACK x 10Un ', 'placas-para-termoformado-rigida-004-1mm-dent-3d-x-pack-x-10un', '483', 6000.0, 9600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: PORTAGUANTES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PORTAGUANTES', 'portaguantes', '484', 5000.0, 7000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -2, NOW());

-- Producto: PORTA INSTRUMENTAL INDENTAL 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PORTA INSTRUMENTAL INDENTAL ', 'porta-instrumental-indental', '485', 25000.0, 35000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -3, NOW());

-- Producto: REFUERZO SUPERIOR ENMALLADO DE ACERO INOX x 10 UNIDADES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REFUERZO SUPERIOR ENMALLADO DE ACERO INOX x 10 UNIDADES', 'refuerzo-superior-enmallado-de-acero-inox-x-10-unidades', '486', 8200.0, 11500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: REFUERZO SUPERIOR ENMALLADO DE ACERO INOX x UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REFUERZO SUPERIOR ENMALLADO DE ACERO INOX x UNIDAD', 'refuerzo-superior-enmallado-de-acero-inox-x-unidad', '487', 950.0, 1300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 10, NOW());

-- Producto: REFUERZO INFERIOR ENMALLADO DE ACERO INOX x 10 UNIDADES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REFUERZO INFERIOR ENMALLADO DE ACERO INOX x 10 UNIDADES', 'refuerzo-inferior-enmallado-de-acero-inox-x-10-unidades', '488', 8200.0, 11500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 3, NOW());

-- Producto: REFUERZO INFERIOR ENMALLADO DE ACERO INOX x UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REFUERZO INFERIOR ENMALLADO DE ACERO INOX x UNIDAD', 'refuerzo-inferior-enmallado-de-acero-inox-x-unidad', '489', 950.0, 1300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: REFUERZO SUPERIOR PERFORADO DE ACERO INOX x 10 UNIDADES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REFUERZO SUPERIOR PERFORADO DE ACERO INOX x 10 UNIDADES', 'refuerzo-superior-perforado-de-acero-inox-x-10-unidades', '490', 12000.0, 16800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: REFUERZO SUPERIOR PERFORADO DE ACERO INOX x UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REFUERZO SUPERIOR PERFORADO DE ACERO INOX x UNIDAD', 'refuerzo-superior-perforado-de-acero-inox-x-unidad', '491', 1400.0, 2000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: REFUERZO INFERIOR PERFORADO DE ACERO INOX x 10 UNIDADES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REFUERZO INFERIOR PERFORADO DE ACERO INOX x 10 UNIDADES', 'refuerzo-inferior-perforado-de-acero-inox-x-10-unidades', '492', 12000.0, 16800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: REFUERZO INFERIOR PERFORADO DE ACERO INOX x UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REFUERZO INFERIOR PERFORADO DE ACERO INOX x UNIDAD', 'refuerzo-inferior-perforado-de-acero-inox-x-unidad', '493', 1400.0, 2000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: RETENEDORES MULTIRET VARIOS COLORES TIRA DE 5 RETENEDORES CADA UNA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'RETENEDORES MULTIRET VARIOS COLORES TIRA DE 5 RETENEDORES CADA UNA', 'retenedores-multiret-varios-colores-tira-de-5-retenedores-cada-una', '494', 3500.0, 4900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: REVESTIMIENTO GILVEST HS x 160Gs
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REVESTIMIENTO GILVEST HS x 160Gs', 'revestimiento-gilvest-hs-x-160gs', '495', 2000.0, 2800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: REVESTIMIENTO KERA VEST AVIO 2Kg REVEST. + 420cc LIQUIDO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REVESTIMIENTO KERA VEST AVIO 2Kg REVEST. + 420cc LIQUIDO ', 'revestimiento-kera-vest-avio-2kg-revest-420cc-liquido', '496', 38000.0, 53200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: REVESTIMIENTO VENTURA HIGH VEST AVIO 2Kg REVEST. + 480cc LIQUIDO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REVESTIMIENTO VENTURA HIGH VEST AVIO 2Kg REVEST. + 480cc LIQUIDO', 'revestimiento-ventura-high-vest-avio-2kg-revest-480cc-liquido', '497', 29000.0, 40600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: RUEDA DE PAÑO DEFLEX PAREA PULIDO Y BRILLO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'RUEDA DE PAÑO DEFLEX PAREA PULIDO Y BRILLO', 'rueda-de-pano-deflex-parea-pulido-y-brillo', '498', 4100.0, 5700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: SEPARADOR DE ACRILICO OKI x 1Lt ROSA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'SEPARADOR DE ACRILICO OKI x 1Lt ROSA ', 'separador-de-acrilico-oki-x-1lt-rosa', '499', 8000.0, 11200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: SEPARADOR DE ACRILICO DEFLEX x 1Lt ROSA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'SEPARADOR DE ACRILICO DEFLEX x 1Lt ROSA ', 'separador-de-acrilico-deflex-x-1lt-rosa', '500', 5600.0, 7800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: SEPARADOR LIQUIDO OKI LUBE x 20cc
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'SEPARADOR LIQUIDO OKI LUBE x 20cc', 'separador-liquido-oki-lube-x-20cc', '501', 12400.0, 16500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: SEPARADOR DE ACRILICO OKI EN SOBRE x 100Gs
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'SEPARADOR DE ACRILICO OKI EN SOBRE x 100Gs', 'separador-de-acrilico-oki-en-sobre-x-100gs', '502', 7000.0, 9800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 5, NOW());

-- Producto: YESO DENSITA TIPO V AMARILLO PESCIO x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO DENSITA TIPO V AMARILLO PESCIO x 1Kg', 'yeso-densita-tipo-v-amarillo-pescio-x-1kg', '503', 6000.0, 9600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: YESO DENDITA TIPO IV ROSA PESCIO x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO DENDITA TIPO IV ROSA PESCIO x 1Kg', 'yeso-dendita-tipo-iv-rosa-pescio-x-1kg', '504', 4500.0, 7200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: YESO PIEDRA AZUL PESCIO x 25Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO PIEDRA AZUL PESCIO x 25Kg', 'yeso-piedra-azul-pescio-x-25kg', '505', 31900.0, 51000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: YESO PIEDRA AZUL PESCIO x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO PIEDRA AZUL PESCIO x 1Kg', 'yeso-piedra-azul-pescio-x-1kg', '506', 1400.0, 2300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 12, NOW());

-- Producto: YESO PIEDRA VERDE PESCIO x 25Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO PIEDRA VERDE PESCIO x 25Kg', 'yeso-piedra-verde-pescio-x-25kg', '507', 31900.0, 51000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: YESO PIEDRA VERDE PESCIO x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO PIEDRA VERDE PESCIO x 1Kg', 'yeso-piedra-verde-pescio-x-1kg', '508', 1400.0, 2300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 20, NOW());

-- Producto: YESO TALLER BLANCO PESCIO x 25Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO TALLER BLANCO PESCIO x 25Kg', 'yeso-taller-blanco-pescio-x-25kg', '509', 30000.0, 48000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: YESO TALLER BLANCO PESCIO x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO TALLER BLANCO PESCIO x 1Kg', 'yeso-taller-blanco-pescio-x-1kg', '510', 1300.0, 2200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 23, NOW());

-- Producto: YESO TALLER AMARILLO PESCIO x 25Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO TALLER AMARILLO PESCIO x 25Kg', 'yeso-taller-amarillo-pescio-x-25kg', '511', 30000.0, 48000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: YESO TALLER AMARILLO PESCIO x 1Kg
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'YESO TALLER AMARILLO PESCIO x 1Kg', 'yeso-taller-amarillo-pescio-x-1kg', '512', 1300.0, 2200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 12, NOW());

-- Producto: Z-PRIME BISCO ADHESIVO ZIRCONIO-ALUMINA-METAL x 2Ml
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'Z-PRIME BISCO ADHESIVO ZIRCONIO-ALUMINA-METAL x 2Ml', 'z-prime-bisco-adhesivo-zirconio-alumina-metal-x-2ml', '513', 0.0, 0, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -3, NOW());

-- Producto: SEPARADOR ACRILICO 100CC
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'SEPARADOR ACRILICO 100CC', 'separador-acrilico-100cc', '514', 750.0, 1200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -11, NOW());

-- Producto: ALCOHOL ETILICO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALCOHOL ETILICO ', 'alcohol-etilico', '515', 4200.0, 6700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: TAZA DE GOMA PARA YESO "ROMAN"
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'TAZA DE GOMA PARA YESO "ROMAN"', 'taza-de-goma-para-yeso-roman', '516', 1950.0, 2700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -52, NOW());

-- Producto: ESPATULA PLASTICA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ESPATULA PLASTICA', 'espatula-plastica', '517', 320.0, 500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: ACRILICO SUBITON POLVO X 1000GR
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO SUBITON POLVO X 1000GR', 'acrilico-subiton-polvo-x-1000gr', '518', 52000.0, 72800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -15, NOW());

-- Producto: PROTHOPLAST LOQUIDO X100 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PROTHOPLAST LOQUIDO X100 ', 'prothoplast-loquido-x100', '519', 27840.0, 39000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 3, NOW());

-- Producto: VASO DAPPEN VIDRIO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'VASO DAPPEN VIDRIO', 'vaso-dappen-vidrio', '520', 855.0, 1200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -27, NOW());

-- Producto: TALLADOR LECRON  
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'TALLADOR LECRON  ', 'tallador-lecron', '521', 2175.0, 3000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: GUANTES LATEX ELIT 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GUANTES LATEX ELIT ', 'guantes-latex-elit', '522', 3330.0, 4700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 140, NOW());

-- Producto: BARBIJOS TRIPACA X50 U.
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJOS TRIPACA X50 U.', 'barbijos-tripaca-x50-u', '523', 1280.0, 2000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -1, NOW());

-- Producto: REV HIL VEST
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'REV HIL VEST', 'rev-hil-vest', '524', 2264.0, 3200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -71, NOW());

-- Producto: MODELOS SUPERIOR E INFERIOR 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MODELOS SUPERIOR E INFERIOR ', 'modelos-superior-e-inferior', '525', 780.0, 900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 44, NOW());

-- Producto: BARBIJO POR UNIDAD 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJO POR UNIDAD ', 'barbijo-por-unidad', '526', 125.0, 200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 70, NOW());

-- Producto: BARBIJOS POR 10 UNIDADES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJOS POR 10 UNIDADES', 'barbijos-por-10-unidades', '527', 1000.0, 1600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: COMPRESA POR UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'COMPRESA POR UNIDAD', 'compresa-por-unidad', '528', 100.0, 160, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 10, NOW());

-- Producto: COMPRESA POR 10 UNIDADES 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'COMPRESA POR 10 UNIDADES ', 'compresa-por-10-unidades', '529', 950.0, 1500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 10, NOW());

-- Producto: GUANTES POR UNIDAD 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GUANTES POR UNIDAD ', 'guantes-por-unidad', '530', 125.0, 200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 10, NOW());

-- Producto: GUANTES POR 10 PARES
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GUANTES POR 10 PARES', 'guantes-por-10-pares', '531', 1095.0, 1700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 8, NOW());

-- Producto: TAZA DE GOMA + ESPATULA PLASTICO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'TAZA DE GOMA + ESPATULA PLASTICO', 'taza-de-goma-espatula-plastico', '532', 2200.0, 3500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 12, NOW());

-- Producto: COMPRESAS EVODENT X50
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'COMPRESAS EVODENT X50', 'compresas-evodent-x50', '533', 1735.0, 2800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 242, NOW());

-- Producto: ESPATULA PLASTICA COMUN
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ESPATULA PLASTICA COMUN', 'espatula-plastica-comun', '534', 320.0, 500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -56, NOW());

-- Producto: MODELOS DE YESO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MODELOS DE YESO ', 'modelos-de-yeso', '536', 500.0, 900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -135, NOW());

-- Producto: BARRITA DE CERA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARRITA DE CERA', 'barrita-de-cera', '537', 350.0, 600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -6, NOW());

-- Producto: TAZAS DE GOMA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'TAZAS DE GOMA ', 'tazas-de-goma', '538', 1500.0, 2400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -61, NOW());

-- Producto: 10 TAZAS DE GOMA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, '10 TAZAS DE GOMA ', '10-tazas-de-goma', '539', 18760.0, 30000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -2, NOW());

-- Producto: 10 ESPATULAS PLASTICO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, '10 ESPATULAS PLASTICO ', '10-espatulas-plastico', '540', 2800.0, 4500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -161, NOW());

-- Producto: 10 MODELO DE YESO SUP 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, '10 MODELO DE YESO SUP ', '10-modelo-de-yeso-sup', '541', 5480.0, 8800, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 4, NOW());

-- Producto: 100 GRAMOS DE ACRILICO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, '100 GRAMOS DE ACRILICO ', '100-gramos-de-acrilico', '542', 3500.0, 5600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 215, NOW());

-- Producto: CUBETA PLASTICA  AUTOCLAVABLES 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CUBETA PLASTICA  AUTOCLAVABLES ', 'cubeta-plastica-autoclavables', '543', 873.0, 1400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 6, NOW());

-- Producto: DOSIFICADOR DE ALGINATO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'DOSIFICADOR DE ALGINATO ', 'dosificador-de-alginato', '544', 1950.0, 3100, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: COMPRESA EVODENT 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'COMPRESA EVODENT ', 'compresa-evodent', '545', 1840.0, 3000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 488, NOW());

-- Producto: CUBETA PLASTICA COLOR AZUL 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CUBETA PLASTICA COLOR AZUL ', 'cubeta-plastica-color-azul', '546', 890.0, 2000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 211, NOW());

-- Producto: CUBETA VERDE 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CUBETA VERDE ', 'cubeta-verde', '547', 1438.0, 2300, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 6, NOW());

-- Producto: ALGINATO DE 410 GRS 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALGINATO DE 410 GRS ', 'alginato-de-410-grs', '548', 7000.0, 11200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 5, NOW());

-- Producto: VASO DAPPEN SILICONA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'VASO DAPPEN SILICONA ', 'vaso-dappen-silicona', '549', 4602.51, 7400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 5, NOW());

-- Producto: INSTRUMENTO PKT (PETER K THOMAS)
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'INSTRUMENTO PKT (PETER K THOMAS)', 'instrumento-pkt-peter-k-thomas', '551', 11880.0, 19000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: MECHERO DE ALCOHOL TIPO BUNSEN METALICO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MECHERO DE ALCOHOL TIPO BUNSEN METALICO', 'mechero-de-alcohol-tipo-bunsen-metalico', '552', 9000.0, 13000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -12, NOW());

-- Producto: MACROMODELO PARA ANATOMIA DENTARIA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MACROMODELO PARA ANATOMIA DENTARIA ', 'macromodelo-para-anatomia-dentaria', '553', 3438.0, 5500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 34, NOW());

-- Producto: MONOMERO AUTO X 100CC
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MONOMERO AUTO X 100CC', 'monomero-auto-x-100cc', '554', 3120.0, 5000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 45, NOW());

-- Producto: MODELO DENSITA
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MODELO DENSITA', 'modelo-densita', '555', 1050.0, 1700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 1, NOW());

-- Producto: ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS', 'acrilico-para-cubetas-oki-cril-autopolimerizable-rosado-x-50gs', '556', 2500.0, 4000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 7, NOW());

-- Producto: COFIA DESCARTABLE POR UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'COFIA DESCARTABLE POR UNIDAD', 'cofia-descartable-por-unidad', '557', 50.0, 200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -1, NOW());

-- Producto: TABLETA DE CERA PARA CROMO
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'TABLETA DE CERA PARA CROMO', 'tableta-de-cera-para-cromo', '558', 625.0, 1000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 60, NOW());

-- Producto: LIJA N°220 HOJA 115mm x 140mm x UNIDAD
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LIJA N°220 HOJA 115mm x 140mm x UNIDAD', 'lija-n220-hoja-115mm-x-140mm-x-unidad', '559', 125.0, 200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -24, NOW());

-- Producto: LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR', 'loseta-de-vidrio-150mm-x-100mm-x-6mm-espesor', '560', 625.0, 1000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -36, NOW());

-- Producto: ESPATULA PARA CEMENTO DOBLE 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ESPATULA PARA CEMENTO DOBLE ', 'espatula-para-cemento-doble', '561', 2812.5, 4500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 37, NOW());

-- Producto: CERA CRISTAL 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'CERA CRISTAL ', 'cera-cristal', '562', 220.0, 350, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 61, NOW());

-- Producto: ALGINATO IQ CROMATICO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALGINATO IQ CROMATICO ', 'alginato-iq-cromatico', '564', 10105.0, 16000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 411, NOW());

-- Producto: ALGINATO ALGIGEL 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALGINATO ALGIGEL ', 'alginato-algigel', '565', 6869.0, 11000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -12, NOW());

-- Producto: INST MANGO BISTURI 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'INST MANGO BISTURI ', 'inst-mango-bisturi', '566', 1145.0, 1900, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -135, NOW());

-- Producto: ACRILICO VETEADO 400 GS 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ACRILICO VETEADO 400 GS ', 'acrilico-veteado-400-gs', '567', 17165.0, 27500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: LAMINA BLANQUEAMIENTO 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'LAMINA BLANQUEAMIENTO ', 'lamina-blanqueamiento', '568', 14585.0, 23400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -121, NOW());

-- Producto: PLACAS EGEO 0,8 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PLACAS EGEO 0,8 ', 'placas-egeo-08', '569', 9627.0, 15000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -20, NOW());

-- Producto: PIEDRA BLANCA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PIEDRA BLANCA ', 'piedra-blanca', '570', 333.2, 500, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 0, NOW());

-- Producto: PASTILLA METAL
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'PASTILLA METAL', 'pastilla-metal', '571', 3550.0, 5700, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 81, NOW());

-- Producto: MICROMOTOR  
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'MICROMOTOR  ', 'micromotor', '572', 209000.0, 334400, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 141, NOW());

-- Producto: ESPATULA DE CERA 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ESPATULA DE CERA ', 'espatula-de-cera', '573', 2500.0, 4000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 8, NOW());

-- Producto: GUANTES TALLE MyS 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GUANTES TALLE MyS ', 'guantes-talle-mys', '574', 4500.0, 7200, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 7, NOW());

-- Producto: GUANTES TALLE L
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'GUANTES TALLE L', 'guantes-talle-l', '575', 3500.0, 5600, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, -4, NOW());

-- Producto: ALGINATO KROMALGUIN 
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'ALGINATO KROMALGUIN ', 'alginato-kromalguin', '576', 7400.0, 11840, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 6, NOW());

-- Producto: BARBIJO GO BLACK x50u.
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'BARBIJO GO BLACK x50u.', 'barbijo-go-black-x50u', '577', 2500.0, 4000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

-- Producto: POLIAMIDA COMPOSTELA X 1KG
INSERT INTO `products` (`company_id`, `tax_id`, `name`, `slug`, `sku`, `cost_price`, `price`, `tax_rate`, `has_variants`, `track_stock`, `is_active`, `created_at`) 
VALUES (@company_id, @tax_id, 'POLIAMIDA COMPOSTELA X 1KG', 'poliamida-compostela-x-1kg', '578', 0.0, 30000, 21.00, 0, 1, 1, NOW());
SET @last_p_id = LAST_INSERT_ID();
INSERT INTO `stocks` (`product_id`, `warehouse_id`, `quantity`, `updated_at`) VALUES (@last_p_id, @warehouse_id, 2, NOW());

COMMIT;