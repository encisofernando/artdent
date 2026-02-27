CREATE DATABASE  IF NOT EXISTS `artdent` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `artdent`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: artdent_lab
-- ------------------------------------------------------
-- Server version	8.0.44

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
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('asset','liability','equity','income','expense') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `type` enum('in','out') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `status` enum('open','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'open',
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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

-- Table structure for table `clinics`
--

DROP TABLE IF EXISTS `clinics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_clinics_company` (`company_id`),
  KEY `idx_clinics_name` (`name`),
  KEY `idx_clinics_active` (`is_active`),
  CONSTRAINT `fk_clinics_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinics`
--

LOCK TABLES `clinics` WRITE;
/*!40000 ALTER TABLE `clinics` DISABLE KEYS */;
/*!40000 ALTER TABLE `clinics` ENABLE KEYS */;
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
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_info` text COLLATE utf8mb4_unicode_ci,
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
  `concept` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `concept` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hourly_rate` decimal(12,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `faceio_fid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `collaborators_faceio_fid_unique` (`faceio_fid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborators`
--

LOCK TABLES `collaborators` WRITE;
/*!40000 ALTER TABLE `collaborators` DISABLE KEYS */;
INSERT INTO `collaborators` VALUES (1,2,'Lea',NULL,5500.00,1,NULL,NULL,'2026-02-05 16:39:05','2026-02-05 16:39:05'),(2,2,'Fer',NULL,5500.00,1,NULL,NULL,'2026-02-05 16:56:38','2026-02-05 16:56:38');
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arca_point_of_sale` int DEFAULT NULL,
  `country_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'AR',
  `timezone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'America/Argentina/Buenos_Aires',
  `address_line1` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line2` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Table structure for table `coupon_usages`
--

DROP TABLE IF EXISTS `coupon_usages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_usages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `coupon_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `order_id` bigint unsigned NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coupon_usages_user_id_foreign` (`user_id`),
  KEY `coupon_usages_order_id_foreign` (`order_id`),
  KEY `coupon_usages_coupon_id_user_id_index` (`coupon_id`,`user_id`),
  CONSTRAINT `coupon_usages_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_usages`
--

LOCK TABLES `coupon_usages` WRITE;
/*!40000 ALTER TABLE `coupon_usages` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon_usages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('percentage','fixed','free_shipping') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) DEFAULT NULL,
  `min_purchase` decimal(10,2) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `max_uses` int DEFAULT NULL,
  `max_uses_per_user` int NOT NULL DEFAULT '1',
  `current_uses` int NOT NULL DEFAULT '0',
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `applicable_categories` json DEFAULT NULL,
  `applicable_products` json DEFAULT NULL,
  `first_purchase_only` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`),
  KEY `coupons_code_is_active_index` (`code`,`is_active`),
  KEY `coupons_company_id_index` (`company_id`),
  CONSTRAINT `coupons_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
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
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_condition` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,2,NULL,'Clinica Odonto SA','30-12345678-9',NULL,'compras@clinica.com',NULL,NULL,NULL,NULL,NULL,NULL,10000000.00,1,'2025-10-06 00:59:24','2026-02-25 21:17:39',NULL),(2,2,NULL,'Fernando',NULL,'monotributista',NULL,NULL,NULL,NULL,NULL,NULL,NULL,999997.00,1,'2026-02-25 20:46:26','2026-02-25 21:17:59',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `job_id` bigint unsigned NOT NULL,
  `messenger_id` bigint unsigned DEFAULT NULL,
  `delivery_date` date NOT NULL,
  `delivery_time` time DEFAULT NULL,
  `zone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `status` enum('pending','assigned','in_transit','delivered','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_deliveries_company` (`company_id`),
  KEY `fk_deliveries_job` (`job_id`),
  KEY `idx_deliveries_date` (`delivery_date`),
  KEY `idx_deliveries_status` (`status`),
  KEY `idx_deliveries_messenger` (`messenger_id`),
  CONSTRAINT `fk_deliveries_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deliveries_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deliveries_messenger` FOREIGN KEY (`messenger_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dentists`
--

DROP TABLE IF EXISTS `dentists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dentists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `clinic_id` bigint unsigned DEFAULT NULL,
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialty` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_dentists_company` (`company_id`),
  KEY `fk_dentists_user` (`user_id`),
  KEY `idx_dentists_clinic` (`clinic_id`),
  KEY `idx_dentists_active` (`is_active`),
  CONSTRAINT `fk_dentists_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_dentists_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dentists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dentists`
--

LOCK TABLES `dentists` WRITE;
/*!40000 ALTER TABLE `dentists` DISABLE KEYS */;
/*!40000 ALTER TABLE `dentists` ENABLE KEYS */;
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
  `sku` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `pricing_mode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'b2c',
  `customer_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(14,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ARS',
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
-- Table structure for table `email_campaigns`
--

DROP TABLE IF EXISTS `email_campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_campaigns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('draft','scheduled','sending','sent','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `recipients_count` int NOT NULL DEFAULT '0',
  `opened_count` int NOT NULL DEFAULT '0',
  `clicked_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email_campaigns_company_id_foreign` (`company_id`),
  CONSTRAINT `email_campaigns_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_campaigns`
--

LOCK TABLES `email_campaigns` WRITE;
/*!40000 ALTER TABLE `email_campaigns` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_campaigns` ENABLE KEYS */;
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
  `first_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `CODIGO` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PRODUCTO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PRECIO_COMPRA_TXT` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PRECIO_VENTA_TXT` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ENTRADAS_TXT` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SALIDAS_TXT` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `STOCK_ACTUAL_TXT` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
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
  `sku` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `code` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `cae` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cae_due_date` date DEFAULT NULL,
  `issue_date` datetime NOT NULL,
  `customer_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_tax_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_tax_condition` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `tax_total` decimal(14,2) DEFAULT '0.00',
  `total` decimal(14,2) DEFAULT '0.00',
  `currency` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `status` enum('pending','authorized','rejected','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `arca_request` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `arca_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `qr_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
-- Table structure for table `job_attachments`
--

DROP TABLE IF EXISTS `job_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_attachments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `uploaded_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_job_attachments_user` (`uploaded_by`),
  KEY `idx_job_attachments_job` (`job_id`),
  CONSTRAINT `fk_job_attachments_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_attachments_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_attachments`
--

LOCK TABLES `job_attachments` WRITE;
/*!40000 ALTER TABLE `job_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_options`
--

DROP TABLE IF EXISTS `job_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_options` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `option_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_value` text COLLATE utf8mb4_unicode_ci,
  `quantity` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_options_job` (`job_id`),
  CONSTRAINT `fk_job_options_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_options`
--

LOCK TABLES `job_options` WRITE;
/*!40000 ALTER TABLE `job_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_payments`
--

DROP TABLE IF EXISTS `job_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `job_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','transfer','check','other') COLLATE utf8mb4_unicode_ci DEFAULT 'cash',
  `payment_date` date NOT NULL,
  `reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_job_payments_company` (`company_id`),
  KEY `fk_job_payments_user` (`created_by`),
  KEY `idx_job_payments_job` (`job_id`),
  KEY `idx_job_payments_date` (`payment_date`),
  CONSTRAINT `fk_job_payments_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_payments_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_job_payments_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_payments`
--

LOCK TABLES `job_payments` WRITE;
/*!40000 ALTER TABLE `job_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_status_history`
--

DROP TABLE IF EXISTS `job_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_status_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `from_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` bigint unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_job_history_user` (`changed_by`),
  KEY `idx_job_history_job` (`job_id`),
  KEY `idx_job_history_created` (`created_at`),
  CONSTRAINT `fk_job_history_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_status_history`
--

LOCK TABLES `job_status_history` WRITE;
/*!40000 ALTER TABLE `job_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_teeth`
--

DROP TABLE IF EXISTS `job_teeth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_teeth` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `tooth_number` int NOT NULL,
  `position` enum('upper','lower') COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_teeth_job` (`job_id`),
  CONSTRAINT `fk_job_teeth_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_teeth_chk_1` CHECK ((`tooth_number` between 11 and 48))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_teeth`
--

LOCK TABLES `job_teeth` WRITE;
/*!40000 ALTER TABLE `job_teeth` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_teeth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_types`
--

DROP TABLE IF EXISTS `job_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `base_price` decimal(10,2) DEFAULT NULL,
  `estimated_days` int DEFAULT '7',
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#397B9C',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_job_types_company` (`company_id`),
  KEY `idx_job_types_name` (`name`),
  CONSTRAINT `fk_job_types_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `ticket_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinic_id` bigint unsigned DEFAULT NULL,
  `dentist_id` bigint unsigned DEFAULT NULL,
  `patient_id` bigint unsigned DEFAULT NULL,
  `job_type_id` bigint unsigned DEFAULT NULL,
  `entry_date` date NOT NULL,
  `promised_date` date DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `work_type` enum('ticket','budget') COLLATE utf8mb4_unicode_ci DEFAULT 'ticket',
  `status` enum('pending','in_progress','completed','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `priority` enum('low','normal','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `discount` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `specifications` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `fk_jobs_company` (`company_id`),
  KEY `fk_jobs_type` (`job_type_id`),
  KEY `fk_jobs_assigned` (`assigned_to`),
  KEY `fk_jobs_created` (`created_by`),
  KEY `fk_jobs_updated` (`updated_by`),
  KEY `idx_jobs_ticket` (`ticket_number`),
  KEY `idx_jobs_status` (`status`),
  KEY `idx_jobs_entry_date` (`entry_date`),
  KEY `idx_jobs_promised_date` (`promised_date`),
  KEY `idx_jobs_clinic` (`clinic_id`),
  KEY `idx_jobs_dentist` (`dentist_id`),
  KEY `idx_jobs_patient` (`patient_id`),
  CONSTRAINT `fk_jobs_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jobs_created` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_updated` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
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
  `memo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `type` enum('debit','credit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `type` enum('debit','credit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `balance_after` decimal(14,2) NOT NULL DEFAULT '0.00',
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `party_type` enum('customer','vendor') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `party_id` bigint unsigned NOT NULL,
  `currency` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
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
-- Table structure for table `messengers`
--

DROP TABLE IF EXISTS `messengers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messengers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `vehicle_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_plate` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zones` json DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `fk_messengers_company` (`company_id`),
  CONSTRAINT `fk_messengers_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messengers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messengers`
--

LOCK TABLES `messengers` WRITE;
/*!40000 ALTER TABLE `messengers` DISABLE KEYS */;
/*!40000 ALTER TABLE `messengers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2019_12_14_000001_create_personal_access_tokens_table',1),(2,'2025_10_17_202109_create_password_reset_tokens_table',2),(3,'2026_02_05_000000_add_receipt_number_to_receipts_table',3),(4,'2026_02_11_000001_add_b2b_fields_to_users_and_companies',4),(5,'2026_02_11_000002_create_ecommerce_orders_tables',4),(6,'2026_02_11_000001_create_product_images_table',5),(7,'2026_02_25_190043_add_biometrics_to_attendance_system',6),(8,'add_expires_at_to_tokens',7);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `preferences` json DEFAULT NULL,
  `unsubscribe_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscribed_at` timestamp NOT NULL,
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscribers_email_unique` (`email`),
  UNIQUE KEY `newsletter_subscribers_unsubscribe_token_unique` (`unsubscribe_token`),
  KEY `newsletter_subscribers_user_id_foreign` (`user_id`),
  KEY `newsletter_subscribers_company_id_is_active_index` (`company_id`,`is_active`),
  CONSTRAINT `newsletter_subscribers_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `newsletter_subscribers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `type` enum('order_status','price_alert','back_in_stock','promotion','review_response','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `action_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_company_id_foreign` (`company_id`),
  KEY `notifications_user_id_is_read_index` (`user_id`,`is_read`),
  KEY `notifications_type_index` (`type`),
  CONSTRAINT `notifications_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_tracking`
--

DROP TABLE IF EXISTS `order_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_tracking` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','in_transit','out_for_delivery','delivered','cancelled','refunded') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimated_delivery` timestamp NULL DEFAULT NULL,
  `carrier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by_user_id` bigint unsigned DEFAULT NULL,
  `notification_sent` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_tracking_updated_by_user_id_foreign` (`updated_by_user_id`),
  KEY `order_tracking_order_id_created_at_index` (`order_id`,`created_at`),
  KEY `order_tracking_status_index` (`status`),
  CONSTRAINT `order_tracking_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_tracking_updated_by_user_id_foreign` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_tracking`
--

LOCK TABLES `order_tracking` WRITE;
/*!40000 ALTER TABLE `order_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_patients_company` (`company_id`),
  KEY `idx_patients_name` (`last_name`,`first_name`),
  KEY `idx_patients_phone` (`phone`),
  CONSTRAINT `fk_patients_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
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
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `order_id` bigint unsigned NOT NULL,
  `gateway` enum('mercadopago','stripe','manual','transfer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'mercadopago',
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preference_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ARS',
  `status` enum('pending','approved','authorized','in_process','in_mediation','rejected','cancelled','refunded','charged_back') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `status_detail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_type_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payer_data` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `webhook_received_at` timestamp NULL DEFAULT NULL,
  `webhook_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_transactions_transaction_id_unique` (`transaction_id`),
  KEY `payment_transactions_company_id_foreign` (`company_id`),
  KEY `payment_transactions_order_id_status_index` (`order_id`,`status`),
  KEY `payment_transactions_transaction_id_index` (`transaction_id`),
  KEY `payment_transactions_gateway_index` (`gateway`),
  CONSTRAINT `payment_transactions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_transactions_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
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
  `reference` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'api','f13442627492d3b5ebb8e5e8262a1c9e8720c76fc3013b0e3fc027d29ffa6154','[\"*\"]',NULL,NULL,'2025-10-05 21:15:38','2025-10-05 21:15:38'),(2,'App\\Models\\User',1,'api','85d8cf6757e210f93185a177bf080312eed98c69fd1f4c681eb7d69fca71ad69','[\"*\"]','2025-10-05 23:14:54',NULL,'2025-10-05 21:58:38','2025-10-05 23:14:54'),(3,'App\\Models\\User',1,'api','f0ad6fbb7bb05c2de8cf8189d70e7d296339ed0b91a18a95e05e6184a608a8de','[\"*\"]',NULL,NULL,'2025-10-05 23:38:03','2025-10-05 23:38:03'),(4,'App\\Models\\User',1,'api','a17ed93196f2a4779779d461959dc95679c84ca0e8f6a4ead9c5ae22ba3c9741','[\"*\"]',NULL,NULL,'2025-10-05 23:38:20','2025-10-05 23:38:20'),(5,'App\\Models\\User',1,'api','fcdb3ecb9bbf65cd50f39e9acb9f73f71f5878b0ca28d6a67be7ce3315a4169e','[\"*\"]','2025-10-06 01:00:22',NULL,'2025-10-05 23:38:38','2025-10-06 01:00:22'),(6,'App\\Models\\User',1,'api','faa13b8a48eea4ef25e45444d78370a0d8cfef4936cdeb24478ae830103330ad','[\"*\"]','2025-10-06 04:37:29',NULL,'2025-10-06 01:12:00','2025-10-06 04:37:29'),(7,'App\\Models\\User',1,'api','6b9b455f84af7fe3aee8a1f553309bdb8dfdd1d64b2f030afcd06b0b2f313a79','[\"*\"]','2025-10-17 15:16:07',NULL,'2025-10-15 17:43:25','2025-10-17 15:16:07'),(8,'App\\Models\\User',1,'api','3fa766d0bfd867fcd17af03f102ac7982dd87b94ab89e0c0c819bb350fc2d47c','[\"*\"]','2025-12-23 14:20:04',NULL,'2025-10-16 14:25:34','2025-12-23 14:20:04'),(9,'App\\Models\\User',1,'api','9e3459a220a3f215b783da2c3d2e4102b50d255dbd0c3aaa45f42abbb44d0d6b','[\"*\"]',NULL,NULL,'2025-10-17 17:02:46','2025-10-17 17:02:46'),(10,'App\\Models\\User',1,'api','3b4b64f5ddc2fbb1fdbfb527e839f01824cc9739ce4d3faa138cb01407d2ab5e','[\"*\"]','2025-10-23 14:05:00',NULL,'2025-10-20 13:50:24','2025-10-23 14:05:00'),(11,'App\\Models\\User',1,'api','351cf05386b41159259f573ee144c45192b346b0d5b2aebcd98ad51b9eea2912','[\"*\"]','2025-10-23 16:40:59',NULL,'2025-10-23 14:05:10','2025-10-23 16:40:59'),(12,'App\\Models\\User',1,'api','38233c29a8f1eeff671922824a4428c1791872cca7b737fc574b553055ad7ea0','[\"*\"]','2026-01-29 16:52:17',NULL,'2025-12-23 14:20:23','2026-01-29 16:52:17'),(13,'App\\Models\\User',2,'api','5e74326d9cd8411e049156b92099d45bde2ede335de43f3a093cc41fc860cbba','[\"*\"]',NULL,NULL,'2026-01-12 18:01:10','2026-01-12 18:01:10'),(14,'App\\Models\\User',2,'api','2bc1dc8b905c5cc100b164654b82c52398f8453b1ec664d66dfb1b9a502ddd7f','[\"*\"]','2026-01-12 18:15:19',NULL,'2026-01-12 18:04:31','2026-01-12 18:15:19'),(15,'App\\Models\\User',1,'api','8128e20262ed101aaf4c73eea15e9f44829eb05079e0bfad0047dfbf9e846223','[\"*\"]','2026-02-13 16:05:35',NULL,'2026-01-29 16:54:50','2026-02-13 16:05:35'),(16,'App\\Models\\User',1,'api','30da1f0697c6e3bf36f3f7878d13a9d9287eb991bf24f9e0f66d5c9b0f3f7841','[\"*\"]','2026-02-11 17:02:18',NULL,'2026-02-11 16:25:55','2026-02-11 17:02:18'),(19,'App\\Models\\User',1,'api','431897edb241546c767b2e0c92be214cd21056b1719a801e02b82335131bf823','[\"*\"]','2026-02-11 18:52:46',NULL,'2026-02-11 18:29:40','2026-02-11 18:52:46'),(20,'App\\Models\\User',1,'api','c57929b6cfb21b7d73afea30dddc9b06b66cc665975b9b874b8a905360cb73fd','[\"*\"]','2026-02-11 19:08:35',NULL,'2026-02-11 18:54:26','2026-02-11 19:08:35'),(21,'App\\Models\\User',1,'api','e2e6a031c0a8678b9245ce14dbf942681f4fb924e91f11364763f2bc02612dcb','[\"*\"]','2026-02-13 16:19:55',NULL,'2026-02-13 16:05:52','2026-02-13 16:19:55'),(22,'App\\Models\\User',1,'api','c1193bf24ec30c8c0b3acf17b11605f59b1555c1363d7290c1e7eaa7b094d281','[\"*\"]','2026-02-13 16:42:28',NULL,'2026-02-13 16:42:22','2026-02-13 16:42:28'),(23,'App\\Models\\User',1,'api','f94a9f5e6c3675fc60d7a36f97f9bc17e06bde6baf33fcdc874fb1a799cc39c2','[\"*\"]','2026-02-13 17:01:42',NULL,'2026-02-13 16:54:23','2026-02-13 17:01:42'),(24,'App\\Models\\User',1,'api','b5c47e6e0682d9853725edaf8b549cf8637b760276224885141be4fecf2b301b','[\"*\"]','2026-02-13 16:56:41',NULL,'2026-02-13 16:55:52','2026-02-13 16:56:41'),(25,'App\\Models\\User',1,'api','ce064589dd7707f6148cf80e1720c95a33ae9e6ad904b1786b4b6d68c7eaa2d6','[\"*\"]','2026-02-21 17:08:55',NULL,'2026-02-13 17:04:28','2026-02-21 17:08:55'),(26,'App\\Models\\User',1,'api','1669df5505345d81b0d46a70a694e06d9146b999033180087630eed9262ab759','[\"*\"]','2026-02-13 17:32:19',NULL,'2026-02-13 17:32:04','2026-02-13 17:32:19'),(27,'App\\Models\\User',1,'api','7bc31fb6feb3a855c3414a1c84aaa2811010978677672d28fdfff3016e137cfa','[\"*\"]','2026-02-13 17:41:34',NULL,'2026-02-13 17:41:34','2026-02-13 17:41:34'),(28,'App\\Models\\User',1,'api','415332121a27c6b252737c8e84e45924d47d1a08ae99f99cee32b0711026a009','[\"*\"]','2026-02-13 17:42:55',NULL,'2026-02-13 17:42:55','2026-02-13 17:42:55'),(29,'App\\Models\\User',1,'api','6c4e173fa7bca73f809bff2bbcddf2e9ca07a08fe7dd56c15fae8fab00116465','[\"*\"]','2026-02-21 14:41:52',NULL,'2026-02-21 11:14:00','2026-02-21 14:41:52'),(30,'App\\Models\\User',1,'api','1dbd258b09d233e46cf10b0917b7e3e3293bb2f55fff75b6d981bf4c5c09fb4d','[\"*\"]','2026-02-24 19:20:09',NULL,'2026-02-24 19:18:52','2026-02-24 19:20:09'),(31,'App\\Models\\User',1,'api','51a40bc2b915968bc83e9eba6036310674983bfac0921c4510627726ce2fe105','[\"*\"]','2026-02-24 22:59:13',NULL,'2026-02-24 19:20:16','2026-02-24 22:59:13'),(32,'App\\Models\\User',1,'api','64fc38c55ebfb255cf7eb5cb10fc99a672a74b961284999803e6703be7208985','[\"*\"]','2026-02-24 23:26:17',NULL,'2026-02-24 23:26:16','2026-02-24 23:26:17'),(33,'App\\Models\\User',1,'api','9919a69193124968ea1a36edd39af6d6fa77595c7391ae01e8ab65cb5b289e24','[\"*\"]','2026-02-24 23:26:42',NULL,'2026-02-24 23:26:40','2026-02-24 23:26:42'),(34,'App\\Models\\User',1,'api','f0b8450d5644daf57d4d6b31a3b027ac2563a8920db01189e116f3565508261b','[\"*\"]','2026-02-24 23:58:26',NULL,'2026-02-24 23:27:07','2026-02-24 23:58:26'),(35,'App\\Models\\User',1,'api','8e25f957f7fe0873e6770b01cc5b1335c52ca48c8496698559362d378dfa5e4a','[\"*\"]','2026-02-25 00:46:22',NULL,'2026-02-25 00:46:20','2026-02-25 00:46:22'),(36,'App\\Models\\User',1,'api','e8b17b329aa8a251582eb6a41a36bab759353ae76a9490622eab029c78140fdf','[\"*\"]','2026-02-25 00:58:23',NULL,'2026-02-25 00:47:22','2026-02-25 00:58:23'),(37,'App\\Models\\User',1,'api','cb6b25c9824a496208e97d388eb65c44d01d87df4747b6a562a595e1cb30c83f','[\"*\"]','2026-02-25 01:15:36',NULL,'2026-02-25 01:00:45','2026-02-25 01:15:36'),(38,'App\\Models\\User',1,'api','5e94357eda7dd9e2c3ce210fb0c598d908c1f75a7cc32543940635e3beadaac2','[\"*\"]','2026-02-25 01:27:02',NULL,'2026-02-25 01:16:09','2026-02-25 01:27:02'),(39,'App\\Models\\User',1,'api','a42232e5a60f3e3354a366d4af77dc220f5cc5508f834a7676c41f4dca4a754a','[\"*\"]','2026-02-25 01:44:49',NULL,'2026-02-25 01:27:26','2026-02-25 01:44:49'),(40,'App\\Models\\User',1,'api','437d4b4f221238bb0c46bc5b92563916d93c16e1e88ef8f471b5e575da693a43','[\"*\"]',NULL,NULL,'2026-02-25 19:05:42','2026-02-25 19:05:42'),(41,'App\\Models\\User',1,'api','24a38f422faa1175b9226393231e58c6dbd7ed7488e4a337d9bd780ff95e124c','[\"*\"]','2026-02-25 19:16:13',NULL,'2026-02-25 19:12:18','2026-02-25 19:16:13'),(42,'App\\Models\\User',1,'api','13861ae94594374a1bb5ecbd2f0cd29f041749d45efc6526cf33cfe46a1f921e','[\"*\"]','2026-02-25 19:18:30',NULL,'2026-02-25 19:16:34','2026-02-25 19:18:30'),(43,'App\\Models\\User',1,'api','0563998b59ddcb445bfad68048968fa47630432b12e4c93af90da05b6b9af4c2','[\"*\"]','2026-02-25 19:44:11',NULL,'2026-02-25 19:43:11','2026-02-25 19:44:11'),(44,'App\\Models\\User',1,'api','e2f116f9155f40cc7d538c63380150055db2df126258911dda6b1d33b6e3c577','[\"*\"]','2026-02-25 19:45:31',NULL,'2026-02-25 19:44:20','2026-02-25 19:45:31'),(45,'App\\Models\\User',1,'api','7bd63b99bafa51546a178bd8dadb355d42184e6bf473deb0deec18718a3fe37f','[\"*\"]','2026-02-25 19:55:39',NULL,'2026-02-25 19:48:20','2026-02-25 19:55:39'),(46,'App\\Models\\User',1,'api','4fb8b4e831b62b9ca4699ee5c7ede8a41b0792125b72460e1516309fb97c65eb','[\"*\"]','2026-02-25 20:05:12',NULL,'2026-02-25 19:55:45','2026-02-25 20:05:12'),(47,'App\\Models\\User',1,'api','fd83ec1038140cbddfddc1eca9aed71814b0fa7bf5312286749387cb10a54c58','[\"*\"]','2026-02-25 20:08:40',NULL,'2026-02-25 20:06:08','2026-02-25 20:08:40'),(48,'App\\Models\\User',1,'api','f305ae797edfca4fe44ff22f56175345db63bac62f248cd7e332e92f3ad282b6','[\"*\"]','2026-02-25 20:18:48',NULL,'2026-02-25 20:09:07','2026-02-25 20:18:48'),(49,'App\\Models\\User',1,'api','63e651f18bda05805aa82db34a73e2f5e1fab29a9b672c622cdac8f8b940c660','[\"*\"]','2026-02-25 20:35:33',NULL,'2026-02-25 20:21:15','2026-02-25 20:35:33'),(50,'App\\Models\\User',1,'api','b12d6ea9b2681cdc7595d913e684a65b9d4909eadd8d21a9065d9307a9dac61d','[\"*\"]','2026-02-25 21:34:00',NULL,'2026-02-25 20:40:23','2026-02-25 21:34:00'),(51,'App\\Models\\User',1,'api','3e429d38828a981763dcd64f5680bb63911e6e166f9a326a2d2f6ec6ed60a5d9','[\"*\"]','2026-02-26 18:33:17',NULL,'2026-02-26 18:32:45','2026-02-26 18:33:17'),(52,'App\\Models\\User',1,'api','814cbf7ff15bf999422ed1b59d662d9262838e65509e362a4e288f9b26e70ae7','[\"*\"]','2026-02-26 18:33:42',NULL,'2026-02-26 18:33:42','2026-02-26 18:33:42'),(53,'App\\Models\\User',1,'api','79f3c2179bf6d04d0db68a67712853ab96a6acadf8bda20f7bcb934e30532f5c','[\"*\"]','2026-02-26 18:33:53',NULL,'2026-02-26 18:33:52','2026-02-26 18:33:53');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `popular_searches`
--

DROP TABLE IF EXISTS `popular_searches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `popular_searches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `query` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `search_count` int NOT NULL DEFAULT '1',
  `click_count` int NOT NULL DEFAULT '0',
  `conversion_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `last_searched_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `popular_searches_query_unique` (`query`),
  KEY `popular_searches_search_count_index` (`search_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `popular_searches`
--

LOCK TABLES `popular_searches` WRITE;
/*!40000 ALTER TABLE `popular_searches` DISABLE KEYS */;
/*!40000 ALTER TABLE `popular_searches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_analytics`
--

DROP TABLE IF EXISTS `product_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_analytics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` enum('view','click','add_to_cart','add_to_wishlist','purchase') COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `search_query` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_analytics_user_id_foreign` (`user_id`),
  KEY `product_analytics_product_id_event_type_index` (`product_id`,`event_type`),
  KEY `product_analytics_created_at_index` (`created_at`),
  CONSTRAINT `product_analytics_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_analytics_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_analytics`
--

LOCK TABLES `product_analytics` WRITE;
/*!40000 ALTER TABLE `product_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_comparisons`
--

DROP TABLE IF EXISTS `product_comparisons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_comparisons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` bigint unsigned NOT NULL,
  `position` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_comparisons_product_id_foreign` (`product_id`),
  KEY `product_comparisons_user_id_position_index` (`user_id`,`position`),
  KEY `product_comparisons_session_id_position_index` (`session_id`,`position`),
  CONSTRAINT `product_comparisons_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_comparisons_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_comparisons`
--

LOCK TABLES `product_comparisons` WRITE;
/*!40000 ALTER TABLE `product_comparisons` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_comparisons` ENABLE KEYS */;
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
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `sku` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `unit` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'UN',
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
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `status` enum('draft','confirmed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `purchase_date` datetime NOT NULL,
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `discount_total` decimal(14,2) DEFAULT '0.00',
  `tax_total` decimal(14,2) DEFAULT '0.00',
  `total` decimal(14,2) DEFAULT '0.00',
  `currency` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `observations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `supplier_id` bigint unsigned DEFAULT NULL,
  `invoice_number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','confirmed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `purchase_date` datetime NOT NULL,
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `discount_total` decimal(14,2) DEFAULT '0.00',
  `tax_total` decimal(14,2) DEFAULT '0.00',
  `total` decimal(14,2) DEFAULT '0.00',
  `currency` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `observations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `supplier_id` bigint unsigned DEFAULT NULL,
  `invoice_number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_id` bigint unsigned NOT NULL,
  `sale_id` bigint unsigned DEFAULT NULL,
  `ledger_id` bigint unsigned DEFAULT NULL,
  `receipt_date` datetime NOT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `reference` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Table structure for table `review_helpful_votes`
--

DROP TABLE IF EXISTS `review_helpful_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_helpful_votes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_helpful` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `review_helpful_votes_review_id_user_id_unique` (`review_id`,`user_id`),
  KEY `review_helpful_votes_user_id_foreign` (`user_id`),
  KEY `review_helpful_votes_review_id_session_id_index` (`review_id`,`session_id`),
  CONSTRAINT `review_helpful_votes_review_id_foreign` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_helpful_votes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_helpful_votes`
--

LOCK TABLES `review_helpful_votes` WRITE;
/*!40000 ALTER TABLE `review_helpful_votes` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_helpful_votes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `order_id` bigint unsigned DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` tinyint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_verified_purchase` tinyint(1) NOT NULL DEFAULT '0',
  `is_approved` tinyint(1) NOT NULL DEFAULT '1',
  `images` json DEFAULT NULL,
  `helpful_count` int NOT NULL DEFAULT '0',
  `not_helpful_count` int NOT NULL DEFAULT '0',
  `vendor_response` text COLLATE utf8mb4_unicode_ci,
  `vendor_response_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_company_id_foreign` (`company_id`),
  KEY `reviews_user_id_foreign` (`user_id`),
  KEY `reviews_order_id_foreign` (`order_id`),
  KEY `reviews_product_id_is_approved_index` (`product_id`,`is_approved`),
  KEY `reviews_rating_index` (`rating`),
  CONSTRAINT `reviews_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
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
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Table structure for table `sale_items_staging`
--

DROP TABLE IF EXISTS `sale_items_staging`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items_staging` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sale_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qty` decimal(15,3) DEFAULT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `discount` decimal(14,2) DEFAULT '0.00',
  `tax_id` bigint unsigned DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(14,2) DEFAULT '0.00',
  `line_total` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `si_sale` (`sale_id`),
  KEY `si_product` (`product_id`),
  KEY `fk_si_tax` (`tax_id`),
  KEY `idx_si_sale` (`sale_id`),
  KEY `idx_si_product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1619 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','confirmed','invoiced','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `sale_date` datetime NOT NULL,
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `discount_total` decimal(14,2) DEFAULT '0.00',
  `tax_total` decimal(14,2) DEFAULT '0.00',
  `total` decimal(14,2) DEFAULT '0.00',
  `currency` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `observations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
-- Table structure for table `search_history`
--

DROP TABLE IF EXISTS `search_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `search_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `query` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `results_count` int NOT NULL DEFAULT '0',
  `filters` json DEFAULT NULL,
  `has_results` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `search_history_user_id_created_at_index` (`user_id`,`created_at`),
  KEY `search_history_query_index` (`query`),
  CONSTRAINT `search_history_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_history`
--

LOCK TABLES `search_history` WRITE;
/*!40000 ALTER TABLE `search_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `search_history` ENABLE KEYS */;
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
  `type` enum('in','out') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(14,3) NOT NULL,
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Table structure for table `stock_movements_staging`
--

DROP TABLE IF EXISTS `stock_movements_staging`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements_staging` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `movement_date` datetime NOT NULL,
  `type` enum('in','out') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(15,3) DEFAULT NULL,
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sm_company_date` (`company_id`,`movement_date`),
  KEY `sm_product` (`product_id`),
  KEY `sm_reference` (`reference_type`,`reference_id`),
  KEY `fk_sm_warehouse` (`warehouse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1890 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
-- Table structure for table `user_notification_preferences`
--

DROP TABLE IF EXISTS `user_notification_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification_preferences` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `email_order_updates` tinyint(1) NOT NULL DEFAULT '1',
  `email_promotions` tinyint(1) NOT NULL DEFAULT '1',
  `email_price_alerts` tinyint(1) NOT NULL DEFAULT '1',
  `email_reviews` tinyint(1) NOT NULL DEFAULT '1',
  `push_order_updates` tinyint(1) NOT NULL DEFAULT '1',
  `push_promotions` tinyint(1) NOT NULL DEFAULT '0',
  `push_price_alerts` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_notification_preferences_user_id_foreign` (`user_id`),
  CONSTRAINT `user_notification_preferences_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notification_preferences`
--

LOCK TABLES `user_notification_preferences` WRITE;
/*!40000 ALTER TABLE `user_notification_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notification_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_preferences_user_id_key_unique` (`user_id`,`key`),
  KEY `user_preferences_key_index` (`key`),
  CONSTRAINT `user_preferences_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preferences`
--

LOCK TABLES `user_preferences` WRITE;
/*!40000 ALTER TABLE `user_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_preferences` ENABLE KEYS */;
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pricing_mode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'b2c',
  `b2b_discount_percent` decimal(5,2) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Temporary view structure for view `v_job_stats_by_status`
--

DROP TABLE IF EXISTS `v_job_stats_by_status`;
/*!50001 DROP VIEW IF EXISTS `v_job_stats_by_status`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_job_stats_by_status` AS SELECT 
 1 AS `company_id`,
 1 AS `status`,
 1 AS `total_jobs`,
 1 AS `total_amount`,
 1 AS `avg_amount`,
 1 AS `oldest_entry`,
 1 AS `newest_entry`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_jobs_summary`
--

DROP TABLE IF EXISTS `v_jobs_summary`;
/*!50001 DROP VIEW IF EXISTS `v_jobs_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_jobs_summary` AS SELECT 
 1 AS `id`,
 1 AS `ticket_number`,
 1 AS `work_type`,
 1 AS `status`,
 1 AS `priority`,
 1 AS `entry_date`,
 1 AS `promised_date`,
 1 AS `delivery_date`,
 1 AS `total`,
 1 AS `clinic_name`,
 1 AS `dentist_specialty`,
 1 AS `patient_name`,
 1 AS `job_type_name`,
 1 AS `assigned_to_name`,
 1 AS `teeth_count`,
 1 AS `urgency_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_pending_deliveries`
--

DROP TABLE IF EXISTS `v_pending_deliveries`;
/*!50001 DROP VIEW IF EXISTS `v_pending_deliveries`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_pending_deliveries` AS SELECT 
 1 AS `job_id`,
 1 AS `ticket_number`,
 1 AS `promised_date`,
 1 AS `patient_name`,
 1 AS `clinic_name`,
 1 AS `clinic_address`,
 1 AS `clinic_phone`,
 1 AS `status`,
 1 AS `priority`,
 1 AS `days_until_delivery`*/;
SET character_set_client = @saved_cs_client;

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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `price_alert` decimal(10,2) DEFAULT NULL,
  `notify_back_in_stock` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlists_user_id_product_id_unique` (`user_id`,`product_id`),
  KEY `wishlists_product_id_foreign` (`product_id`),
  KEY `wishlists_company_id_user_id_index` (`company_id`,`user_id`),
  CONSTRAINT `wishlists_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Final view structure for view `v_job_stats_by_status`
--
-- =====================================================================
-- Vistas del sistema - Versión limpia sin DEFINER ni comentarios mysqldump
-- =====================================================================

DROP VIEW IF EXISTS v_job_stats_by_status;
CREATE VIEW v_job_stats_by_status AS
SELECT 
    j.company_id,
    j.status,
    COUNT(*)            AS total_jobs,
    SUM(j.total)        AS total_amount,
    AVG(j.total)        AS avg_amount,
    MIN(j.entry_date)   AS oldest_entry,
    MAX(j.entry_date)   AS newest_entry
FROM jobs j
WHERE j.deleted_at IS NULL
GROUP BY j.company_id, j.status;


DROP VIEW IF EXISTS v_jobs_summary;
CREATE VIEW v_jobs_summary AS
SELECT 
    j.id,
    j.ticket_number,
    j.work_type,
    j.status,
    j.priority,
    j.entry_date,
    j.promised_date,
    j.delivery_date,
    j.total,
    c.name              AS clinic_name,
    d.specialty         AS dentist_specialty,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    jt.name             AS job_type_name,
    u.name              AS assigned_to_name,
    
    (SELECT COUNT(*) 
     FROM job_teeth 
     WHERE job_teeth.job_id = j.id) AS teeth_count,
    
    CASE 
        WHEN j.promised_date < CURDATE() 
             AND j.status NOT IN ('delivered', 'cancelled') 
            THEN 'overdue'
            
        WHEN j.promised_date = CURDATE() 
             AND j.status NOT IN ('delivered', 'cancelled') 
            THEN 'due_today'
            
        WHEN j.promised_date = CURDATE() + INTERVAL 1 DAY 
             AND j.status NOT IN ('delivered', 'cancelled') 
            THEN 'due_tomorrow'
            
        ELSE 'normal'
    END AS urgency_status

FROM jobs j
LEFT JOIN clinics   c ON j.clinic_id   = c.id
LEFT JOIN dentists  d ON j.dentist_id  = d.id
LEFT JOIN patients  p ON j.patient_id  = p.id
LEFT JOIN job_types jt ON j.job_type_id = jt.id
LEFT JOIN users     u ON j.assigned_to = u.id

WHERE j.deleted_at IS NULL;


DROP VIEW IF EXISTS v_pending_deliveries;
CREATE VIEW v_pending_deliveries AS
SELECT 
    j.id                AS job_id,
    j.ticket_number,
    j.promised_date,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    c.name              AS clinic_name,
    c.address           AS clinic_address,
    c.phone             AS clinic_phone,
    j.status,
    j.priority,
    DATEDIFF(j.promised_date, CURDATE()) AS days_until_delivery
FROM jobs j
LEFT JOIN patients p ON j.patient_id = p.id
LEFT JOIN clinics  c ON j.clinic_id  = c.id
WHERE j.status = 'completed'
  AND j.deleted_at IS NULL
ORDER BY j.promised_date;
-- Final view structure for view `v_product_stock`
--

DROP VIEW IF EXISTS `v_product_stock`;

CREATE VIEW `v_product_stock` AS
SELECT 
    p.id AS product_id,
    p.company_id AS company_id,
    p.sku AS sku,
    p.name AS name,
    COALESCE(SUM(s.qty), 0) AS total_qty
FROM 
    products p
LEFT JOIN 
    stocks s ON s.product_id = p.id AND s.company_id = p.company_id
GROUP BY 
    p.id, p.company_id, p.sku, p.name;

-- Dump completed on 2026-02-26 16:05:02
