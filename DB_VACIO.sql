CREATE DATABASE  IF NOT EXISTS `artdent_lab` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `artdent_lab`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: artdent_lab
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('asset','liability','equity','income','expense') COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `is_postable` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_accounts_company_code` (`company_id`,`code`),
  KEY `accounts_parent` (`parent_id`),
  KEY `accounts_company` (`company_id`),
  CONSTRAINT `fk_accounts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_accounts_parent` FOREIGN KEY (`parent_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_company_code` (`company_id`,`code`),
  KEY `branches_company_id` (`company_id`),
  CONSTRAINT `fk_branches_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_drawers`
--

DROP TABLE IF EXISTS `cash_drawers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_drawers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cd_company` (`company_id`),
  KEY `cd_branch` (`branch_id`),
  CONSTRAINT `fk_cd_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cd_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_drawers`
--

LOCK TABLES `cash_drawers` WRITE;
/*!40000 ALTER TABLE `cash_drawers` DISABLE KEYS */;
/*!40000 ALTER TABLE `cash_drawers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_movements`
--

DROP TABLE IF EXISTS `cash_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cash_session_id` bigint unsigned NOT NULL,
  `movement_date` datetime NOT NULL,
  `type` enum('in','out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `reference_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cm_session` (`cash_session_id`,`movement_date`),
  KEY `cm_reference` (`reference_type`,`reference_id`),
  KEY `fk_cm_pm` (`payment_method_id`),
  CONSTRAINT `fk_cm_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cm_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_movements`
--

LOCK TABLES `cash_movements` WRITE;
/*!40000 ALTER TABLE `cash_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `cash_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_sessions`
--

DROP TABLE IF EXISTS `cash_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cash_drawer_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `opened_at` datetime NOT NULL,
  `closed_at` datetime DEFAULT NULL,
  `opening_amount` decimal(14,2) DEFAULT '0.00',
  `closing_amount` decimal(14,2) DEFAULT '0.00',
  `status` enum('open','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cs_drawer` (`cash_drawer_id`),
  KEY `cs_user` (`user_id`),
  KEY `cs_status` (`status`),
  CONSTRAINT `fk_cs_drawer` FOREIGN KEY (`cash_drawer_id`) REFERENCES `cash_drawers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_sessions`
--

LOCK TABLES `cash_sessions` WRITE;
/*!40000 ALTER TABLE `cash_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `cash_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_company_name` (`company_id`,`name`),
  KEY `categories_parent` (`parent_id`),
  KEY `categories_company` (`company_id`),
  CONSTRAINT `fk_categories_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,2,'Smoke Category 1768229177 (updated)',NULL,'2026-01-12 18:14:37','2026-01-12 18:15:19','2026-01-12 18:15:19');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaborator_attendances`
--

DROP TABLE IF EXISTS `collaborator_attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaborator_attendances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned DEFAULT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `work_date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `hours` decimal(8,2) NOT NULL DEFAULT '0.00',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collaborator_attendances_collaborator_id_work_date_index` (`collaborator_id`,`work_date`),
  CONSTRAINT `collaborator_attendances_collaborator_id_foreign` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_attendances`
--

LOCK TABLES `collaborator_attendances` WRITE;
/*!40000 ALTER TABLE `collaborator_attendances` DISABLE KEYS */;
/*!40000 ALTER TABLE `collaborator_attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaborator_discounts`
--

DROP TABLE IF EXISTS `collaborator_discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaborator_discounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned DEFAULT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `concept` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collaborator_discounts_collaborator_id_date_index` (`collaborator_id`,`date`),
  CONSTRAINT `collaborator_discounts_collaborator_id_foreign` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_discounts`
--

LOCK TABLES `collaborator_discounts` WRITE;
/*!40000 ALTER TABLE `collaborator_discounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `collaborator_discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaborator_extras`
--

DROP TABLE IF EXISTS `collaborator_extras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaborator_extras` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned DEFAULT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `concept` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collaborator_extras_collaborator_id_date_index` (`collaborator_id`,`date`),
  CONSTRAINT `collaborator_extras_collaborator_id_foreign` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_extras`
--

LOCK TABLES `collaborator_extras` WRITE;
/*!40000 ALTER TABLE `collaborator_extras` DISABLE KEYS */;
/*!40000 ALTER TABLE `collaborator_extras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaborator_receipts`
--

DROP TABLE IF EXISTS `collaborator_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaborator_receipts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned DEFAULT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `period_from` date NOT NULL,
  `period_to` date NOT NULL,
  `hours` decimal(8,2) NOT NULL DEFAULT '0.00',
  `gross` decimal(12,2) NOT NULL DEFAULT '0.00',
  `extras_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discounts_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `net` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collaborator_receipts_collaborator_id_foreign` (`collaborator_id`),
  CONSTRAINT `collaborator_receipts_collaborator_id_foreign` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_receipts`
--

LOCK TABLES `collaborator_receipts` WRITE;
/*!40000 ALTER TABLE `collaborator_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `collaborator_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaborators`
--

DROP TABLE IF EXISTS `collaborators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaborators` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hourly_rate` decimal(12,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborators`
--

LOCK TABLES `collaborators` WRITE;
/*!40000 ALTER TABLE `collaborators` DISABLE KEYS */;
INSERT INTO `collaborators` VALUES (1,2,'Lea',NULL,5500.00,1,NULL,'2026-02-05 16:39:05','2026-02-05 16:39:05'),(2,2,'Fer',NULL,5500.00,1,NULL,'2026-02-05 16:56:38','2026-02-05 16:56:38');
/*!40000 ALTER TABLE `collaborators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arca_point_of_sale` int DEFAULT NULL,
  `country_code` char(2) COLLATE utf8mb4_unicode_ci DEFAULT 'AR',
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'America/Argentina/Buenos_Aires',
  `address_line1` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line2` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `b2b_discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companies_tax` (`tax_id`),
  KEY `companies_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Empresa Demo',NULL,NULL,NULL,'AR','America/Argentina/Buenos_Aires',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,'2025-09-09 00:41:00','2025-09-09 00:41:00',NULL),(2,'ArtDent SRL',NULL,NULL,NULL,'AR','America/Argentina/Buenos_Aires',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,'2025-10-05 21:15:38','2025-10-05 21:15:38',NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_condition` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_limit` decimal(12,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customers_company_code` (`company_id`,`code`),
  UNIQUE KEY `uq_customers_company_tax` (`company_id`,`tax_id`),
  KEY `customers_company` (`company_id`),
  KEY `idx_cust_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,2,NULL,'Clinica Odonto SA','30-12345678-9',NULL,'compras@clinica.com',NULL,NULL,NULL,NULL,NULL,0.00,1,'2025-10-06 00:59:24','2025-10-06 00:59:24',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ecommerce_order_items`
--

DROP TABLE IF EXISTS `ecommerce_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecommerce_order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `sku` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(14,3) NOT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `line_subtotal` decimal(14,2) NOT NULL,
  `line_tax` decimal(14,2) NOT NULL DEFAULT '0.00',
  `line_total` decimal(14,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ecommerce_order_items_order_id_index` (`order_id`),
  KEY `ecommerce_order_items_product_id_index` (`product_id`),
  CONSTRAINT `ecommerce_order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ecommerce_order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecommerce_order_items`
--

LOCK TABLES `ecommerce_order_items` WRITE;
/*!40000 ALTER TABLE `ecommerce_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `ecommerce_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ecommerce_orders`
--

DROP TABLE IF EXISTS `ecommerce_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecommerce_orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `pricing_mode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'b2c',
  `customer_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(14,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ARS',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ecommerce_orders_code_unique` (`code`),
  KEY `ecommerce_orders_company_id_created_at_index` (`company_id`,`created_at`),
  KEY `ecommerce_orders_customer_email_index` (`customer_email`),
  KEY `ecommerce_orders_warehouse_id_foreign` (`warehouse_id`),
  KEY `ecommerce_orders_user_id_foreign` (`user_id`),
  CONSTRAINT `ecommerce_orders_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ecommerce_orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ecommerce_orders_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecommerce_orders`
--

LOCK TABLES `ecommerce_orders` WRITE;
/*!40000 ALTER TABLE `ecommerce_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `ecommerce_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_number` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary_base` decimal(12,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employees_company_doc` (`company_id`,`document_type`,`document_number`),
  KEY `employees_company` (`company_id`),
  KEY `employees_branch` (`branch_id`),
  KEY `fk_employees_user` (`user_id`),
  CONSTRAINT `fk_employees_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_employees_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_products_raw`
--

DROP TABLE IF EXISTS `import_products_raw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_products_raw` (
  `CODIGO` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PRODUCTO` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PRECIO_COMPRA_TXT` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PRECIO_VENTA_TXT` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ENTRADAS_TXT` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SALIDAS_TXT` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `STOCK_ACTUAL_TXT` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_products_raw`
--

LOCK TABLES `import_products_raw` WRITE;
/*!40000 ALTER TABLE `import_products_raw` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_products_raw` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_products_staging`
--

DROP TABLE IF EXISTS `import_products_staging`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_products_staging` (
  `company_id` int NOT NULL,
  `sku` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_purchase` decimal(12,2) DEFAULT NULL,
  `price_sale` decimal(12,2) DEFAULT NULL,
  `entradas` decimal(12,3) DEFAULT NULL,
  `salidas` decimal(12,3) DEFAULT NULL,
  `stock_actual` decimal(12,3) DEFAULT NULL,
  PRIMARY KEY (`company_id`,`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_products_staging`
--

LOCK TABLES `import_products_staging` WRITE;
/*!40000 ALTER TABLE `import_products_staging` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_products_staging` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(14,3) NOT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `discount` decimal(14,2) DEFAULT '0.00',
  `tax_id` bigint unsigned DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(14,2) DEFAULT '0.00',
  `line_total` decimal(14,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ii_invoice` (`invoice_id`),
  KEY `fk_ii_tax` (`tax_id`),
  KEY `idx_ii_invoice` (`invoice_id`),
  KEY `idx_ii_product` (`product_id`),
  CONSTRAINT `fk_ii_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ii_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ii_tax` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_types`
--

DROP TABLE IF EXISTS `invoice_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoice_types_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_types`
--

LOCK TABLES `invoice_types` WRITE;
/*!40000 ALTER TABLE `invoice_types` DISABLE KEYS */;
INSERT INTO `invoice_types` VALUES (1,'A','Factura A','2025-09-09 00:41:00','2025-09-09 00:41:00'),(2,'B','Factura B','2025-09-09 00:41:00','2025-09-09 00:41:00'),(3,'C','Factura C','2025-09-09 00:41:00','2025-09-09 00:41:00'),(4,'NC A','Nota de Crédito A','2025-09-09 00:41:00','2025-09-09 00:41:00'),(5,'NC B','Nota de Crédito B','2025-09-09 00:41:00','2025-09-09 00:41:00'),(6,'NC C','Nota de Crédito C','2025-09-09 00:41:00','2025-09-09 00:41:00'),(7,'ND A','Nota de Débito A','2025-09-09 00:41:00','2025-09-09 00:41:00'),(8,'ND B','Nota de Débito B','2025-09-09 00:41:00','2025-09-09 00:41:00'),(9,'ND C','Nota de Débito C','2025-09-09 00:41:00','2025-09-09 00:41:00'),(10,'T','Ticket','2025-09-09 00:41:00','2025-09-09 00:41:00');
/*!40000 ALTER TABLE `invoice_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `sale_id` bigint unsigned NOT NULL,
  `invoice_type_id` bigint unsigned NOT NULL,
  `pos_number` int NOT NULL,
  `invoice_number` bigint unsigned NOT NULL,
  `cae` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cae_due_date` date DEFAULT NULL,
  `issue_date` datetime NOT NULL,
  `customer_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_tax_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_tax_condition` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `tax_total` decimal(14,2) DEFAULT '0.00',
  `total` decimal(14,2) DEFAULT '0.00',
  `currency` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `status` enum('pending','authorized','rejected','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `arca_request` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `arca_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `qr_data` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoice_unique` (`company_id`,`invoice_type_id`,`pos_number`,`invoice_number`),
  KEY `invoices_company` (`company_id`,`issue_date`),
  KEY `invoices_sale` (`sale_id`),
  KEY `fk_invoices_branch` (`branch_id`),
  KEY `idx_inv_company` (`company_id`),
  KEY `idx_inv_sale` (`sale_id`),
  KEY `idx_inv_type` (`invoice_type_id`),
  KEY `idx_inv_pos` (`pos_number`),
  KEY `idx_inv_number` (`invoice_number`),
  CONSTRAINT `fk_invoices_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_type` FOREIGN KEY (`invoice_type_id`) REFERENCES `invoice_types` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `invoices_chk_1` CHECK (json_valid(`arca_request`)),
  CONSTRAINT `invoices_chk_2` CHECK (json_valid(`arca_response`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `entry_date` date NOT NULL,
  `memo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `je_company_date` (`company_id`,`entry_date`),
  KEY `je_reference` (`reference_type`,`reference_id`),
  CONSTRAINT `fk_je_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entries`
--

LOCK TABLES `journal_entries` WRITE;
/*!40000 ALTER TABLE `journal_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_lines`
--

DROP TABLE IF EXISTS `journal_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_lines` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `journal_entry_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `type` enum('debit','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `jl_entry` (`journal_entry_id`),
  KEY `jl_account` (`account_id`),
  CONSTRAINT `fk_jl_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_jl_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_lines`
--

LOCK TABLES `journal_lines` WRITE;
/*!40000 ALTER TABLE `journal_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledger_entries`
--

DROP TABLE IF EXISTS `ledger_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ledger_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ledger_id` bigint unsigned NOT NULL,
  `entry_date` date NOT NULL,
  `type` enum('debit','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `balance_after` decimal(14,2) NOT NULL DEFAULT '0.00',
  `reference_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `le_ledger` (`ledger_id`,`entry_date`),
  KEY `le_reference` (`reference_type`,`reference_id`),
  CONSTRAINT `fk_le_ledger` FOREIGN KEY (`ledger_id`) REFERENCES `ledgers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledger_entries`
--

LOCK TABLES `ledger_entries` WRITE;
/*!40000 ALTER TABLE `ledger_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `ledger_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledgers`
--

DROP TABLE IF EXISTS `ledgers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ledgers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `party_type` enum('customer','vendor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `party_id` bigint unsigned NOT NULL,
  `currency` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ledger_party` (`company_id`,`party_type`,`party_id`),
  KEY `ledgers_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledgers`
--

LOCK TABLES `ledgers` WRITE;
/*!40000 ALTER TABLE `ledgers` DISABLE KEYS */;
/*!40000 ALTER TABLE `ledgers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2019_12_14_000001_create_personal_access_tokens_table',1),(2,'2025_10_17_202109_create_password_reset_tokens_table',2),(3,'2026_02_05_000000_add_receipt_number_to_receipts_table',3),(4,'2026_02_11_000001_add_b2b_fields_to_users_and_companies',4),(5,'2026_02_11_000002_create_ecommerce_orders_tables',4),(6,'2026_02_11_000001_create_product_images_table',5);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES ('smoke+1768229177@example.com','$2y$12$kVJuaNvzdzDBj.cmArGf1uqbK9CT9iIVRlySuxaCO8JI0ilkKUdBa','2026-01-12 18:10:29');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pm_company_name` (`company_id`,`name`),
  KEY `pm_company` (`company_id`),
  CONSTRAINT `fk_pm_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,1,'Efectivo','CASH',1,'2025-09-09 00:41:00','2025-09-09 00:41:00'),(2,1,'Transferencia','BANK',1,'2025-09-09 00:41:00','2025-09-09 00:41:00'),(3,1,'Tarjeta Débito','DEBIT',1,'2025-09-09 00:41:00','2025-09-09 00:41:00'),(4,1,'Tarjeta Crédito','CREDIT',1,'2025-09-09 00:41:00','2025-09-09 00:41:00'),(5,1,'Cheque','CHEQUE',1,'2025-09-09 00:41:00','2025-09-09 00:41:00'),(6,2,'Efectivo','CASH',1,'2025-10-05 21:22:26','2025-10-05 21:22:26'),(7,2,'Transferencia','BANK',1,'2025-10-05 21:22:26','2025-10-05 21:22:26'),(8,2,'Tarjeta Débito','DEBIT',1,'2025-10-05 21:22:26','2025-10-05 21:22:26'),(9,2,'Tarjeta Crédito','CREDIT',1,'2025-10-05 21:22:26','2025-10-05 21:22:26'),(10,2,'Cheque','CHEQUE',1,'2025-10-05 21:22:26','2025-10-05 21:22:26');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `purchase_id` bigint unsigned DEFAULT NULL,
  `ledger_id` bigint unsigned DEFAULT NULL,
  `payment_date` datetime NOT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_company` (`company_id`,`payment_date`),
  KEY `payments_purchase` (`purchase_id`),
  KEY `payments_ledger` (`ledger_id`),
  KEY `fk_payments_pm` (`payment_method_id`),
  CONSTRAINT `fk_payments_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_payments_ledger` FOREIGN KEY (`ledger_id`) REFERENCES `ledgers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payments_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payments_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'api','f13442627492d3b5ebb8e5e8262a1c9e8720c76fc3013b0e3fc027d29ffa6154','[\"*\"]',NULL,NULL,'2025-10-05 21:15:38','2025-10-05 21:15:38'),(2,'App\\Models\\User',1,'api','85d8cf6757e210f93185a177bf080312eed98c69fd1f4c681eb7d69fca71ad69','[\"*\"]','2025-10-05 23:14:54',NULL,'2025-10-05 21:58:38','2025-10-05 23:14:54'),(3,'App\\Models\\User',1,'api','f0ad6fbb7bb05c2de8cf8189d70e7d296339ed0b91a18a95e05e6184a608a8de','[\"*\"]',NULL,NULL,'2025-10-05 23:38:03','2025-10-05 23:38:03'),(4,'App\\Models\\User',1,'api','a17ed93196f2a4779779d461959dc95679c84ca0e8f6a4ead9c5ae22ba3c9741','[\"*\"]',NULL,NULL,'2025-10-05 23:38:20','2025-10-05 23:38:20'),(5,'App\\Models\\User',1,'api','fcdb3ecb9bbf65cd50f39e9acb9f73f71f5878b0ca28d6a67be7ce3315a4169e','[\"*\"]','2025-10-06 01:00:22',NULL,'2025-10-05 23:38:38','2025-10-06 01:00:22'),(6,'App\\Models\\User',1,'api','faa13b8a48eea4ef25e45444d78370a0d8cfef4936cdeb24478ae830103330ad','[\"*\"]','2025-10-06 04:37:29',NULL,'2025-10-06 01:12:00','2025-10-06 04:37:29'),(7,'App\\Models\\User',1,'api','6b9b455f84af7fe3aee8a1f553309bdb8dfdd1d64b2f030afcd06b0b2f313a79','[\"*\"]','2025-10-17 15:16:07',NULL,'2025-10-15 17:43:25','2025-10-17 15:16:07'),(8,'App\\Models\\User',1,'api','3fa766d0bfd867fcd17af03f102ac7982dd87b94ab89e0c0c819bb350fc2d47c','[\"*\"]','2025-12-23 14:20:04',NULL,'2025-10-16 14:25:34','2025-12-23 14:20:04'),(9,'App\\Models\\User',1,'api','9e3459a220a3f215b783da2c3d2e4102b50d255dbd0c3aaa45f42abbb44d0d6b','[\"*\"]',NULL,NULL,'2025-10-17 17:02:46','2025-10-17 17:02:46'),(10,'App\\Models\\User',1,'api','3b4b64f5ddc2fbb1fdbfb527e839f01824cc9739ce4d3faa138cb01407d2ab5e','[\"*\"]','2025-10-23 14:05:00',NULL,'2025-10-20 13:50:24','2025-10-23 14:05:00'),(11,'App\\Models\\User',1,'api','351cf05386b41159259f573ee144c45192b346b0d5b2aebcd98ad51b9eea2912','[\"*\"]','2025-10-23 16:40:59',NULL,'2025-10-23 14:05:10','2025-10-23 16:40:59'),(12,'App\\Models\\User',1,'api','38233c29a8f1eeff671922824a4428c1791872cca7b737fc574b553055ad7ea0','[\"*\"]','2026-01-29 16:52:17',NULL,'2025-12-23 14:20:23','2026-01-29 16:52:17'),(13,'App\\Models\\User',2,'api','5e74326d9cd8411e049156b92099d45bde2ede335de43f3a093cc41fc860cbba','[\"*\"]',NULL,NULL,'2026-01-12 18:01:10','2026-01-12 18:01:10'),(14,'App\\Models\\User',2,'api','2bc1dc8b905c5cc100b164654b82c52398f8453b1ec664d66dfb1b9a502ddd7f','[\"*\"]','2026-01-12 18:15:19',NULL,'2026-01-12 18:04:31','2026-01-12 18:15:19'),(15,'App\\Models\\User',1,'api','8128e20262ed101aaf4c73eea15e9f44829eb05079e0bfad0047dfbf9e846223','[\"*\"]','2026-02-13 16:05:35',NULL,'2026-01-29 16:54:50','2026-02-13 16:05:35'),(16,'App\\Models\\User',1,'api','30da1f0697c6e3bf36f3f7878d13a9d9287eb991bf24f9e0f66d5c9b0f3f7841','[\"*\"]','2026-02-11 17:02:18',NULL,'2026-02-11 16:25:55','2026-02-11 17:02:18'),(19,'App\\Models\\User',1,'api','431897edb241546c767b2e0c92be214cd21056b1719a801e02b82335131bf823','[\"*\"]','2026-02-11 18:52:46',NULL,'2026-02-11 18:29:40','2026-02-11 18:52:46'),(20,'App\\Models\\User',1,'api','c57929b6cfb21b7d73afea30dddc9b06b66cc665975b9b874b8a905360cb73fd','[\"*\"]','2026-02-11 19:08:35',NULL,'2026-02-11 18:54:26','2026-02-11 19:08:35'),(21,'App\\Models\\User',1,'api','e2e6a031c0a8678b9245ce14dbf942681f4fb924e91f11364763f2bc02612dcb','[\"*\"]','2026-02-13 16:19:55',NULL,'2026-02-13 16:05:52','2026-02-13 16:19:55'),(22,'App\\Models\\User',1,'api','c1193bf24ec30c8c0b3acf17b11605f59b1555c1363d7290c1e7eaa7b094d281','[\"*\"]','2026-02-13 16:42:28',NULL,'2026-02-13 16:42:22','2026-02-13 16:42:28'),(23,'App\\Models\\User',1,'api','f94a9f5e6c3675fc60d7a36f97f9bc17e06bde6baf33fcdc874fb1a799cc39c2','[\"*\"]','2026-02-13 17:01:42',NULL,'2026-02-13 16:54:23','2026-02-13 17:01:42'),(24,'App\\Models\\User',1,'api','b5c47e6e0682d9853725edaf8b549cf8637b760276224885141be4fecf2b301b','[\"*\"]','2026-02-13 16:56:41',NULL,'2026-02-13 16:55:52','2026-02-13 16:56:41'),(25,'App\\Models\\User',1,'api','ce064589dd7707f6148cf80e1720c95a33ae9e6ad904b1786b4b6d68c7eaa2d6','[\"*\"]','2026-02-21 16:30:10',NULL,'2026-02-13 17:04:28','2026-02-21 16:30:10'),(26,'App\\Models\\User',1,'api','1669df5505345d81b0d46a70a694e06d9146b999033180087630eed9262ab759','[\"*\"]','2026-02-13 17:32:19',NULL,'2026-02-13 17:32:04','2026-02-13 17:32:19'),(27,'App\\Models\\User',1,'api','7bc31fb6feb3a855c3414a1c84aaa2811010978677672d28fdfff3016e137cfa','[\"*\"]','2026-02-13 17:41:34',NULL,'2026-02-13 17:41:34','2026-02-13 17:41:34'),(28,'App\\Models\\User',1,'api','415332121a27c6b252737c8e84e45924d47d1a08ae99f99cee32b0711026a009','[\"*\"]','2026-02-13 17:42:55',NULL,'2026-02-13 17:42:55','2026-02-13 17:42:55'),(29,'App\\Models\\User',1,'api','6c4e173fa7bca73f809bff2bbcddf2e9ca07a08fe7dd56c15fae8fab00116465','[\"*\"]','2026-02-21 14:41:52',NULL,'2026-02-21 11:14:00','2026-02-21 14:41:52');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_company_id_product_id_index` (`company_id`,`product_id`),
  KEY `product_images_product_id_is_primary_index` (`product_id`,`is_primary`),
  CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `sku` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `unit` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'UN',
  `cost` decimal(12,2) DEFAULT '0.00',
  `price` decimal(12,2) DEFAULT '0.00',
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `tax_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `track_stock` tinyint(1) DEFAULT '1',
  `min_stock` decimal(12,3) DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_company_sku` (`company_id`,`sku`),
  UNIQUE KEY `uq_products_company_barcode` (`company_id`,`barcode`),
  KEY `products_company` (`company_id`),
  KEY `products_category` (`category_id`),
  KEY `products_tax` (`tax_id`),
  KEY `idx_products_company` (`company_id`),
  KEY `idx_products_sku` (`sku`),
  FULLTEXT KEY `ft_products_name_desc` (`name`,`description`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_products_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_products_tax` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qty` decimal(14,3) NOT NULL,
  `unit_cost` decimal(14,2) NOT NULL,
  `discount` decimal(14,2) DEFAULT '0.00',
  `tax_id` bigint unsigned DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(14,2) DEFAULT '0.00',
  `line_total` decimal(14,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pi_purchase` (`purchase_id`),
  KEY `pi_product` (`product_id`),
  KEY `fk_pi_tax` (`tax_id`),
  KEY `idx_pi_purchase` (`purchase_id`),
  KEY `idx_pi_product` (`product_id`),
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pi_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pi_tax` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `status` enum('draft','confirmed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `purchase_date` datetime NOT NULL,
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `discount_total` decimal(14,2) DEFAULT '0.00',
  `tax_total` decimal(14,2) DEFAULT '0.00',
  `total` decimal(14,2) DEFAULT '0.00',
  `currency` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `observations` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `supplier_id` bigint unsigned DEFAULT NULL,
  `invoice_number` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchases_company` (`company_id`,`purchase_date`),
  KEY `fk_purchases_branch` (`branch_id`),
  KEY `idx_pur_company` (`company_id`),
  KEY `idx_pur_warehouse` (`warehouse_id`),
  KEY `idx_pur_date` (`purchase_date`),
  CONSTRAINT `fk_purchases_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_purchases_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_purchases_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases_backup_keep`
--

DROP TABLE IF EXISTS `purchases_backup_keep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases_backup_keep` (
  `id` bigint unsigned NOT NULL DEFAULT '0',
  `company_id` bigint unsigned NOT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `vendor_id` bigint unsigned DEFAULT NULL,
  `number` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','confirmed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `purchase_date` datetime NOT NULL,
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `discount_total` decimal(14,2) DEFAULT '0.00',
  `tax_total` decimal(14,2) DEFAULT '0.00',
  `total` decimal(14,2) DEFAULT '0.00',
  `currency` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `observations` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `supplier_id` bigint unsigned DEFAULT NULL,
  `invoice_number` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases_backup_keep`
--

LOCK TABLES `purchases_backup_keep` WRITE;
/*!40000 ALTER TABLE `purchases_backup_keep` DISABLE KEYS */;
INSERT INTO `purchases_backup_keep` VALUES (1,2,NULL,1,NULL,NULL,'confirmed','2025-10-05 20:42:50',100000.00,0.00,0.00,100000.00,'ARS',NULL,'2025-10-05 23:42:50','2025-10-05 23:42:50',NULL,NULL,'F-0001-00000001'),(1,2,NULL,1,NULL,NULL,'confirmed','2025-10-05 20:42:50',100000.00,0.00,0.00,100000.00,'ARS',NULL,'2025-10-05 23:42:50','2025-10-05 23:42:50',NULL,NULL,'F-0001-00000001'),(1,2,NULL,1,NULL,NULL,'confirmed','2025-10-05 20:42:50',100000.00,0.00,0.00,100000.00,'ARS',NULL,'2025-10-05 23:42:50','2025-10-05 23:42:50',NULL,NULL,'F-0001-00000001'),(1,2,NULL,1,NULL,NULL,'confirmed','2025-10-05 20:42:50',100000.00,0.00,0.00,100000.00,'ARS',NULL,'2025-10-05 23:42:50','2025-10-05 23:42:50',NULL,NULL,'F-0001-00000001');
/*!40000 ALTER TABLE `purchases_backup_keep` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_id` bigint unsigned NOT NULL,
  `sale_id` bigint unsigned DEFAULT NULL,
  `ledger_id` bigint unsigned DEFAULT NULL,
  `receipt_date` datetime NOT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipts_receipt_number_unique` (`receipt_number`),
  KEY `receipts_company` (`company_id`,`receipt_date`),
  KEY `receipts_sale` (`sale_id`),
  KEY `receipts_ledger` (`ledger_id`),
  KEY `fk_receipts_pm` (`payment_method_id`),
  CONSTRAINT `fk_receipts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_ledger` FOREIGN KEY (`ledger_id`) REFERENCES `ledgers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_user`
--

DROP TABLE IF EXISTS `role_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_user` (
  `role_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`user_id`),
  KEY `ru_user` (`user_id`),
  CONSTRAINT `fk_ru_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ru_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_user`
--

LOCK TABLES `role_user` WRITE;
/*!40000 ALTER TABLE `role_user` DISABLE KEYS */;
INSERT INTO `role_user` VALUES (1,1);
/*!40000 ALTER TABLE `role_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','2026-02-13 13:52:36','2026-02-13 13:52:36');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sale_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qty` decimal(14,3) NOT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `discount` decimal(14,2) DEFAULT '0.00',
  `tax_id` bigint unsigned DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(14,2) DEFAULT '0.00',
  `line_total` decimal(14,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `si_sale` (`sale_id`),
  KEY `si_product` (`product_id`),
  KEY `fk_si_tax` (`tax_id`),
  KEY `idx_si_sale` (`sale_id`),
  KEY `idx_si_product` (`product_id`),
  CONSTRAINT `fk_si_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_si_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_si_tax` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `cashier_id` bigint unsigned DEFAULT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `number` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','confirmed','invoiced','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `sale_date` datetime NOT NULL,
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `discount_total` decimal(14,2) DEFAULT '0.00',
  `tax_total` decimal(14,2) DEFAULT '0.00',
  `total` decimal(14,2) DEFAULT '0.00',
  `currency` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `observations` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sales_company` (`company_id`,`sale_date`),
  KEY `sales_customer` (`customer_id`),
  KEY `sales_status` (`status`),
  KEY `fk_sales_branch` (`branch_id`),
  KEY `fk_sales_cashier` (`cashier_id`),
  KEY `idx_sales_company` (`company_id`),
  KEY `idx_sales_warehouse` (`warehouse_id`),
  KEY `idx_sales_customer` (`customer_id`),
  CONSTRAINT `fk_sales_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sales_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sales_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sales_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `movement_date` datetime NOT NULL,
  `type` enum('in','out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(14,3) NOT NULL,
  `reference_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sm_company_date` (`company_id`,`movement_date`),
  KEY `sm_product` (`product_id`),
  KEY `sm_reference` (`reference_type`,`reference_id`),
  KEY `fk_sm_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_sm_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sm_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sm_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `qty` decimal(14,3) DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stock_unique` (`company_id`,`warehouse_id`,`product_id`),
  KEY `stocks_product` (`product_id`),
  KEY `fk_stocks_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_stocks_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_stocks_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stocks_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taxes`
--

DROP TABLE IF EXISTS `taxes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taxes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate` decimal(5,2) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_taxes_company_name` (`company_id`,`name`),
  KEY `taxes_company` (`company_id`),
  CONSTRAINT `fk_taxes_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taxes`
--

LOCK TABLES `taxes` WRITE;
/*!40000 ALTER TABLE `taxes` DISABLE KEYS */;
INSERT INTO `taxes` VALUES (1,1,'IVA 21%',21.00,1,'2025-09-09 00:41:00','2025-09-09 00:41:00'),(2,1,'IVA 10.5%',10.50,0,'2025-09-09 00:41:00','2025-09-09 00:41:00'),(3,1,'Exento',0.00,0,'2025-09-09 00:41:00','2025-09-09 00:41:00'),(4,2,'IVA 21%',21.00,1,'2025-10-05 21:22:26','2025-10-05 21:22:26'),(5,2,'IVA 10.5%',10.50,0,'2025-10-05 21:22:26','2025-10-05 21:22:26'),(6,2,'Exento',0.00,0,'2025-10-05 21:22:26','2025-10-05 21:22:26');
/*!40000 ALTER TABLE `taxes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pricing_mode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'b2c',
  `b2b_discount_percent` decimal(5,2) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_company_email` (`company_id`,`email`),
  KEY `users_company_id` (`company_id`),
  CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,2,'Admin','admin@artdent.com.ar','$2y$12$KBqjAGcwQAMPazHVgYPo8u9MYQEoJuuRrvptDFtSBLbYaIgrgmMxq','b2c',NULL,NULL,NULL,1,'2025-10-05 21:15:38','2025-10-05 21:15:38',NULL),(2,2,'Smoke Test','smoke+1768229177@example.com','$2y$12$VUeQzrjuHD1lQIcJz.Vss.iOyhwxjbBLni5AgA4PZ59jp/oM6WLmq','b2c',NULL,NULL,NULL,1,'2026-01-12 18:01:10','2026-01-12 18:01:10',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_product_stock`
--

DROP TABLE IF EXISTS `v_product_stock`;
/*!50001 DROP VIEW IF EXISTS `v_product_stock`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_product_stock` AS SELECT 
 1 AS `product_id`,
 1 AS `company_id`,
 1 AS `sku`,
 1 AS `name`,
 1 AS `total_qty`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vendors_company_tax` (`company_id`,`tax_id`),
  KEY `vendors_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_warehouse_company_code` (`company_id`,`code`),
  KEY `warehouses_company` (`company_id`),
  KEY `warehouses_branch` (`branch_id`),
  KEY `idx_wh_company` (`company_id`),
  CONSTRAINT `fk_warehouses_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_warehouses_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,2,NULL,'Deposito Central','DC1',1,'2025-10-05 22:34:44','2025-10-05 22:34:44',NULL);
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_product_stock`
--

/*!50001 DROP VIEW IF EXISTS `v_product_stock`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_product_stock` AS select `p`.`id` AS `product_id`,`p`.`company_id` AS `company_id`,`p`.`sku` AS `sku`,`p`.`name` AS `name`,coalesce(sum(`s`.`qty`),0) AS `total_qty` from (`products` `p` left join `stocks` `s` on(((`s`.`product_id` = `p`.`id`) and (`s`.`company_id` = `p`.`company_id`)))) group by `p`.`id`,`p`.`company_id`,`p`.`sku`,`p`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-21 13:35:27
