-- =====================================================================
-- INSERCIÓN MASIVA DE VARIANTES: Blister Dientes Acritone
-- =====================================================================

-- 1. Asegurar producto padre
INSERT INTO `products` (`company_id`, `name`, `slug`, `sku`, `has_variants`, `tax_id`, `tax_rate`, `created_at`) 
SELECT 1, 'Blister Dientes Acritone', 'blister-dientes-acritone', 'ACRITONE-PARENT', 1, 1, 21.00, NOW()
WHERE NOT EXISTS (SELECT 1 FROM `products` WHERE `slug` = 'blister-dientes-acritone');
SET @product_id = (SELECT id FROM `products` WHERE `slug` = 'blister-dientes-acritone' LIMIT 1);

-- 2. Asegurar atributos
INSERT INTO `product_attributes` (`name`, `created_at`) SELECT 'Ubicación', NOW() WHERE NOT EXISTS (SELECT 1 FROM `product_attributes` WHERE `name` = 'Ubicación');
INSERT INTO `product_attributes` (`name`, `created_at`) SELECT 'Forma', NOW() WHERE NOT EXISTS (SELECT 1 FROM `product_attributes` WHERE `name` = 'Forma');
INSERT INTO `product_attributes` (`name`, `created_at`) SELECT 'Color', NOW() WHERE NOT EXISTS (SELECT 1 FROM `product_attributes` WHERE `name` = 'Color');
SET @attr_ubi = (SELECT id FROM `product_attributes` WHERE `name` = 'Ubicación' LIMIT 1);
SET @attr_for = (SELECT id FROM `product_attributes` WHERE `name` = 'Forma' LIMIT 1);
SET @attr_col = (SELECT id FROM `product_attributes` WHERE `name` = 'Color' LIMIT 1);

-- 3. Asegurar valores de atributos
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_ubi, 'Anterior Superior' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_ubi, 'Anterior Inferior' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_ubi, 'Posterior Superior' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_ubi, 'Posterior Inferior' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '61 / A1' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '62 / A2' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '66 / A3' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '67 / A3,5' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '81 / A4' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, 'B2' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '65' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '68' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '69 / C3' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '71' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, '77 / C4' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_col, 'D2' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '16' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '18' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '20' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '22' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '25' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '26' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '28' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '30' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '32' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '34' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '36' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '38' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, '40' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, 'P4' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, 'P5' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5');
INSERT INTO `product_attribute_values` (`attribute_id`, `value`) SELECT @attr_for, 'P6' WHERE NOT EXISTS (SELECT 1 FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6');

-- 4. Generación de Variantes y Relaciones
START TRANSACTION;

-- Variante: Anterior Superior | Forma: 16 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 16 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-16-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 18 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-18-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 20 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-20-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 22 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-22-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '22' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 25 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-25-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 26 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-26-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 28 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-28-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '28' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 30 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-30-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 32 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-32-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 34 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-34-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '34' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 36 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-36-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 38 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-38-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Superior | Forma: 40 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AS-40-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 16 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-16-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '16' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 18 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-18-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '18' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 20 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-20-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '20' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 25 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-25-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '25' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 26 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-26-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '26' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 30 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-30-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '30' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 32 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-32-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '32' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 36 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-36-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '36' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 38 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-38-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '38' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Anterior Inferior | Forma: 40 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-AI-40-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Anterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = '40' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Posterior Superior | Forma: P4 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P4-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Posterior Superior | Forma: P5 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P5-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Posterior Superior | Forma: P6 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PS-P6-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Superior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P4 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P4-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P4' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P5 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P5-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P5' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 61 / A1
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-61-A1', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '61 / A1' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 62 / A2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-62-A2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '62 / A2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 66 / A3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-66-A3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '66 / A3' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 67 / A3,5
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-67-A3.5', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '67 / A3,5' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 81 / A4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-81-A4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '81 / A4' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: B2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-B2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'B2' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 65
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-65', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '65' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 68
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-68', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '68' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 69 / C3
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-69-C3', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '69 / C3' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 71
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-71', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '71' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: 77 / C4
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-77-C4', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = '77 / C4' LIMIT 1));

-- Variante: Posterior Inferior | Forma: P6 | Color: D2
INSERT INTO `product_variants` (`product_id`, `sku`, `is_active`, `created_at`) VALUES (@product_id, 'ACR-PI-P6-D2', 1, NOW());
SET @v_id = LAST_INSERT_ID();
INSERT INTO `variant_attribute_values` (`variant_id`, `attribute_value_id`) VALUES 
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_ubi AND `value` = 'Posterior Inferior' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_for AND `value` = 'P6' LIMIT 1)),
(@v_id, (SELECT id FROM `product_attribute_values` WHERE `attribute_id` = @attr_col AND `value` = 'D2' LIMIT 1));

COMMIT;