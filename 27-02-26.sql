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

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,2,'Smoke Category 1768229177 (updated)',NULL,'2026-01-12 18:14:37','2026-01-12 18:15:19','2026-01-12 18:15:19');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
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
  `type` enum('clinica','odontologo','otrolab','colegio','particular') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'clinica',
  `cuit` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `balance` decimal(15,2) DEFAULT '0.00',
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_clinics_company` (`company_id`),
  KEY `idx_clinics_name` (`name`),
  KEY `idx_clinics_active` (`is_active`),
  CONSTRAINT `fk_clinics_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinics`
--

LOCK TABLES `clinics` WRITE;
/*!40000 ALTER TABLE `clinics` DISABLE KEYS */;
INSERT INTO `clinics` VALUES (1,2,'CARLOS CONSIGLIO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-02-28 00:37:31','2026-02-28 00:37:31',NULL,'odontologo',NULL,0.00,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_receipts`
--

LOCK TABLES `collaborator_receipts` WRITE;
/*!40000 ALTER TABLE `collaborator_receipts` DISABLE KEYS */;
INSERT INTO `collaborator_receipts` VALUES (1,2,2,'2026-02-27','2026-02-27',0.00,0.00,0.00,0.00,0.00,1,'2026-02-28 00:44:54','2026-02-28 00:44:54');
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
-- Table structure for table `costs`
--

DROP TABLE IF EXISTS `costs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `costs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `job_id` bigint unsigned DEFAULT NULL,
  `type` enum('material','mano_obra','herramienta','logistica','otros') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `margin` decimal(5,2) NOT NULL DEFAULT '30.00',
  `total` decimal(15,2) NOT NULL,
  `suggested` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `costs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `costs_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `costs`
--

LOCK TABLES `costs` WRITE;
/*!40000 ALTER TABLE `costs` DISABLE KEYS */;
/*!40000 ALTER TABLE `costs` ENABLE KEYS */;
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
-- Dumping data for table `job_types`
--

LOCK TABLES `job_types` WRITE;
/*!40000 ALTER TABLE `job_types` DISABLE KEYS */;
INSERT INTO `job_types` VALUES (1,1,'Corona Metal-Cerámica','Corona de metal con recubrimiento cerámico',35000.00,7,'#397B9C',1,'2026-02-20 23:43:12','2026-02-20 23:43:12',NULL),(2,1,'Prótesis Completa','Prótesis dental completa superior o inferior',80000.00,14,'#5AAD9C',1,'2026-02-20 23:43:12','2026-02-20 23:43:12',NULL),(3,1,'Puente Fijo','Puente dental fijo de 3 piezas',95000.00,10,'#ACD6CE',1,'2026-02-20 23:43:12','2026-02-20 23:43:12',NULL),(4,1,'Incrustación','Incrustación dental (onlay/inlay)',28000.00,5,'#7CA5C3',1,'2026-02-20 23:43:12','2026-02-20 23:43:12',NULL),(5,1,'Férula Oclusal','Férula de protección nocturna',20000.00,3,'#4994C',1,'2026-02-20 23:43:12','2026-02-20 23:43:12',NULL),(6,1,'Carilla Dental','Carilla estética de porcelana',45000.00,7,'#397B9C',1,'2026-02-20 23:43:12','2026-02-20 23:43:12',NULL);
/*!40000 ALTER TABLE `job_types` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES ('smoke+1768229177@example.com','$2y$12$kVJuaNvzdzDBj.cmArGf1uqbK9CT9iIVRlySuxaCO8JI0ilkKUdBa','2026-01-12 18:10:29');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'api','f13442627492d3b5ebb8e5e8262a1c9e8720c76fc3013b0e3fc027d29ffa6154','[\"*\"]',NULL,NULL,'2025-10-05 21:15:38','2025-10-05 21:15:38'),(2,'App\\Models\\User',1,'api','85d8cf6757e210f93185a177bf080312eed98c69fd1f4c681eb7d69fca71ad69','[\"*\"]','2025-10-05 23:14:54',NULL,'2025-10-05 21:58:38','2025-10-05 23:14:54'),(3,'App\\Models\\User',1,'api','f0ad6fbb7bb05c2de8cf8189d70e7d296339ed0b91a18a95e05e6184a608a8de','[\"*\"]',NULL,NULL,'2025-10-05 23:38:03','2025-10-05 23:38:03'),(4,'App\\Models\\User',1,'api','a17ed93196f2a4779779d461959dc95679c84ca0e8f6a4ead9c5ae22ba3c9741','[\"*\"]',NULL,NULL,'2025-10-05 23:38:20','2025-10-05 23:38:20'),(5,'App\\Models\\User',1,'api','fcdb3ecb9bbf65cd50f39e9acb9f73f71f5878b0ca28d6a67be7ce3315a4169e','[\"*\"]','2025-10-06 01:00:22',NULL,'2025-10-05 23:38:38','2025-10-06 01:00:22'),(6,'App\\Models\\User',1,'api','faa13b8a48eea4ef25e45444d78370a0d8cfef4936cdeb24478ae830103330ad','[\"*\"]','2025-10-06 04:37:29',NULL,'2025-10-06 01:12:00','2025-10-06 04:37:29'),(7,'App\\Models\\User',1,'api','6b9b455f84af7fe3aee8a1f553309bdb8dfdd1d64b2f030afcd06b0b2f313a79','[\"*\"]','2025-10-17 15:16:07',NULL,'2025-10-15 17:43:25','2025-10-17 15:16:07'),(8,'App\\Models\\User',1,'api','3fa766d0bfd867fcd17af03f102ac7982dd87b94ab89e0c0c819bb350fc2d47c','[\"*\"]','2025-12-23 14:20:04',NULL,'2025-10-16 14:25:34','2025-12-23 14:20:04'),(9,'App\\Models\\User',1,'api','9e3459a220a3f215b783da2c3d2e4102b50d255dbd0c3aaa45f42abbb44d0d6b','[\"*\"]',NULL,NULL,'2025-10-17 17:02:46','2025-10-17 17:02:46'),(10,'App\\Models\\User',1,'api','3b4b64f5ddc2fbb1fdbfb527e839f01824cc9739ce4d3faa138cb01407d2ab5e','[\"*\"]','2025-10-23 14:05:00',NULL,'2025-10-20 13:50:24','2025-10-23 14:05:00'),(11,'App\\Models\\User',1,'api','351cf05386b41159259f573ee144c45192b346b0d5b2aebcd98ad51b9eea2912','[\"*\"]','2025-10-23 16:40:59',NULL,'2025-10-23 14:05:10','2025-10-23 16:40:59'),(12,'App\\Models\\User',1,'api','38233c29a8f1eeff671922824a4428c1791872cca7b737fc574b553055ad7ea0','[\"*\"]','2026-01-29 16:52:17',NULL,'2025-12-23 14:20:23','2026-01-29 16:52:17'),(13,'App\\Models\\User',2,'api','5e74326d9cd8411e049156b92099d45bde2ede335de43f3a093cc41fc860cbba','[\"*\"]',NULL,NULL,'2026-01-12 18:01:10','2026-01-12 18:01:10'),(14,'App\\Models\\User',2,'api','2bc1dc8b905c5cc100b164654b82c52398f8453b1ec664d66dfb1b9a502ddd7f','[\"*\"]','2026-01-12 18:15:19',NULL,'2026-01-12 18:04:31','2026-01-12 18:15:19'),(15,'App\\Models\\User',1,'api','8128e20262ed101aaf4c73eea15e9f44829eb05079e0bfad0047dfbf9e846223','[\"*\"]','2026-02-13 16:05:35',NULL,'2026-01-29 16:54:50','2026-02-13 16:05:35'),(16,'App\\Models\\User',1,'api','30da1f0697c6e3bf36f3f7878d13a9d9287eb991bf24f9e0f66d5c9b0f3f7841','[\"*\"]','2026-02-11 17:02:18',NULL,'2026-02-11 16:25:55','2026-02-11 17:02:18'),(19,'App\\Models\\User',1,'api','431897edb241546c767b2e0c92be214cd21056b1719a801e02b82335131bf823','[\"*\"]','2026-02-11 18:52:46',NULL,'2026-02-11 18:29:40','2026-02-11 18:52:46'),(20,'App\\Models\\User',1,'api','c57929b6cfb21b7d73afea30dddc9b06b66cc665975b9b874b8a905360cb73fd','[\"*\"]','2026-02-11 19:08:35',NULL,'2026-02-11 18:54:26','2026-02-11 19:08:35'),(21,'App\\Models\\User',1,'api','e2e6a031c0a8678b9245ce14dbf942681f4fb924e91f11364763f2bc02612dcb','[\"*\"]','2026-02-13 16:19:55',NULL,'2026-02-13 16:05:52','2026-02-13 16:19:55'),(22,'App\\Models\\User',1,'api','c1193bf24ec30c8c0b3acf17b11605f59b1555c1363d7290c1e7eaa7b094d281','[\"*\"]','2026-02-13 16:42:28',NULL,'2026-02-13 16:42:22','2026-02-13 16:42:28'),(23,'App\\Models\\User',1,'api','f94a9f5e6c3675fc60d7a36f97f9bc17e06bde6baf33fcdc874fb1a799cc39c2','[\"*\"]','2026-02-13 17:01:42',NULL,'2026-02-13 16:54:23','2026-02-13 17:01:42'),(24,'App\\Models\\User',1,'api','b5c47e6e0682d9853725edaf8b549cf8637b760276224885141be4fecf2b301b','[\"*\"]','2026-02-13 16:56:41',NULL,'2026-02-13 16:55:52','2026-02-13 16:56:41'),(25,'App\\Models\\User',1,'api','ce064589dd7707f6148cf80e1720c95a33ae9e6ad904b1786b4b6d68c7eaa2d6','[\"*\"]','2026-02-21 17:08:55',NULL,'2026-02-13 17:04:28','2026-02-21 17:08:55'),(26,'App\\Models\\User',1,'api','1669df5505345d81b0d46a70a694e06d9146b999033180087630eed9262ab759','[\"*\"]','2026-02-13 17:32:19',NULL,'2026-02-13 17:32:04','2026-02-13 17:32:19'),(27,'App\\Models\\User',1,'api','7bc31fb6feb3a855c3414a1c84aaa2811010978677672d28fdfff3016e137cfa','[\"*\"]','2026-02-13 17:41:34',NULL,'2026-02-13 17:41:34','2026-02-13 17:41:34'),(28,'App\\Models\\User',1,'api','415332121a27c6b252737c8e84e45924d47d1a08ae99f99cee32b0711026a009','[\"*\"]','2026-02-13 17:42:55',NULL,'2026-02-13 17:42:55','2026-02-13 17:42:55'),(29,'App\\Models\\User',1,'api','6c4e173fa7bca73f809bff2bbcddf2e9ca07a08fe7dd56c15fae8fab00116465','[\"*\"]','2026-02-21 14:41:52',NULL,'2026-02-21 11:14:00','2026-02-21 14:41:52'),(30,'App\\Models\\User',1,'api','1dbd258b09d233e46cf10b0917b7e3e3293bb2f55fff75b6d981bf4c5c09fb4d','[\"*\"]','2026-02-24 19:20:09',NULL,'2026-02-24 19:18:52','2026-02-24 19:20:09'),(31,'App\\Models\\User',1,'api','51a40bc2b915968bc83e9eba6036310674983bfac0921c4510627726ce2fe105','[\"*\"]','2026-02-24 22:59:13',NULL,'2026-02-24 19:20:16','2026-02-24 22:59:13'),(32,'App\\Models\\User',1,'api','64fc38c55ebfb255cf7eb5cb10fc99a672a74b961284999803e6703be7208985','[\"*\"]','2026-02-24 23:26:17',NULL,'2026-02-24 23:26:16','2026-02-24 23:26:17'),(33,'App\\Models\\User',1,'api','9919a69193124968ea1a36edd39af6d6fa77595c7391ae01e8ab65cb5b289e24','[\"*\"]','2026-02-24 23:26:42',NULL,'2026-02-24 23:26:40','2026-02-24 23:26:42'),(34,'App\\Models\\User',1,'api','f0b8450d5644daf57d4d6b31a3b027ac2563a8920db01189e116f3565508261b','[\"*\"]','2026-02-24 23:58:26',NULL,'2026-02-24 23:27:07','2026-02-24 23:58:26'),(35,'App\\Models\\User',1,'api','8e25f957f7fe0873e6770b01cc5b1335c52ca48c8496698559362d378dfa5e4a','[\"*\"]','2026-02-25 00:46:22',NULL,'2026-02-25 00:46:20','2026-02-25 00:46:22'),(36,'App\\Models\\User',1,'api','e8b17b329aa8a251582eb6a41a36bab759353ae76a9490622eab029c78140fdf','[\"*\"]','2026-02-25 00:58:23',NULL,'2026-02-25 00:47:22','2026-02-25 00:58:23'),(37,'App\\Models\\User',1,'api','cb6b25c9824a496208e97d388eb65c44d01d87df4747b6a562a595e1cb30c83f','[\"*\"]','2026-02-25 01:15:36',NULL,'2026-02-25 01:00:45','2026-02-25 01:15:36'),(38,'App\\Models\\User',1,'api','5e94357eda7dd9e2c3ce210fb0c598d908c1f75a7cc32543940635e3beadaac2','[\"*\"]','2026-02-25 01:27:02',NULL,'2026-02-25 01:16:09','2026-02-25 01:27:02'),(39,'App\\Models\\User',1,'api','a42232e5a60f3e3354a366d4af77dc220f5cc5508f834a7676c41f4dca4a754a','[\"*\"]','2026-02-25 01:44:49',NULL,'2026-02-25 01:27:26','2026-02-25 01:44:49'),(40,'App\\Models\\User',1,'api','437d4b4f221238bb0c46bc5b92563916d93c16e1e88ef8f471b5e575da693a43','[\"*\"]',NULL,NULL,'2026-02-25 19:05:42','2026-02-25 19:05:42'),(41,'App\\Models\\User',1,'api','24a38f422faa1175b9226393231e58c6dbd7ed7488e4a337d9bd780ff95e124c','[\"*\"]','2026-02-25 19:16:13',NULL,'2026-02-25 19:12:18','2026-02-25 19:16:13'),(42,'App\\Models\\User',1,'api','13861ae94594374a1bb5ecbd2f0cd29f041749d45efc6526cf33cfe46a1f921e','[\"*\"]','2026-02-25 19:18:30',NULL,'2026-02-25 19:16:34','2026-02-25 19:18:30'),(43,'App\\Models\\User',1,'api','0563998b59ddcb445bfad68048968fa47630432b12e4c93af90da05b6b9af4c2','[\"*\"]','2026-02-25 19:44:11',NULL,'2026-02-25 19:43:11','2026-02-25 19:44:11'),(44,'App\\Models\\User',1,'api','e2f116f9155f40cc7d538c63380150055db2df126258911dda6b1d33b6e3c577','[\"*\"]','2026-02-25 19:45:31',NULL,'2026-02-25 19:44:20','2026-02-25 19:45:31'),(45,'App\\Models\\User',1,'api','7bd63b99bafa51546a178bd8dadb355d42184e6bf473deb0deec18718a3fe37f','[\"*\"]','2026-02-25 19:55:39',NULL,'2026-02-25 19:48:20','2026-02-25 19:55:39'),(46,'App\\Models\\User',1,'api','4fb8b4e831b62b9ca4699ee5c7ede8a41b0792125b72460e1516309fb97c65eb','[\"*\"]','2026-02-25 20:05:12',NULL,'2026-02-25 19:55:45','2026-02-25 20:05:12'),(47,'App\\Models\\User',1,'api','fd83ec1038140cbddfddc1eca9aed71814b0fa7bf5312286749387cb10a54c58','[\"*\"]','2026-02-25 20:08:40',NULL,'2026-02-25 20:06:08','2026-02-25 20:08:40'),(48,'App\\Models\\User',1,'api','f305ae797edfca4fe44ff22f56175345db63bac62f248cd7e332e92f3ad282b6','[\"*\"]','2026-02-25 20:18:48',NULL,'2026-02-25 20:09:07','2026-02-25 20:18:48'),(49,'App\\Models\\User',1,'api','63e651f18bda05805aa82db34a73e2f5e1fab29a9b672c622cdac8f8b940c660','[\"*\"]','2026-02-25 20:35:33',NULL,'2026-02-25 20:21:15','2026-02-25 20:35:33'),(50,'App\\Models\\User',1,'api','b12d6ea9b2681cdc7595d913e684a65b9d4909eadd8d21a9065d9307a9dac61d','[\"*\"]','2026-02-25 21:34:00',NULL,'2026-02-25 20:40:23','2026-02-25 21:34:00'),(51,'App\\Models\\User',1,'api','3e429d38828a981763dcd64f5680bb63911e6e166f9a326a2d2f6ec6ed60a5d9','[\"*\"]','2026-02-26 18:33:17',NULL,'2026-02-26 18:32:45','2026-02-26 18:33:17'),(52,'App\\Models\\User',1,'api','814cbf7ff15bf999422ed1b59d662d9262838e65509e362a4e288f9b26e70ae7','[\"*\"]','2026-02-26 18:33:42',NULL,'2026-02-26 18:33:42','2026-02-26 18:33:42'),(53,'App\\Models\\User',1,'api','79f3c2179bf6d04d0db68a67712853ab96a6acadf8bda20f7bcb934e30532f5c','[\"*\"]','2026-02-26 18:33:53',NULL,'2026-02-26 18:33:52','2026-02-26 18:33:53'),(92,'App\\Models\\User',1,'access_token','2a7fbdb720a6a2e0382ae8c279f2cc6563d4ae7a0bdefbb289d0b34b43dfab63','[\"*\"]','2026-02-28 00:45:15','2026-02-28 00:58:01','2026-02-28 00:43:01','2026-02-28 00:45:15'),(93,'App\\Models\\User',1,'refresh_token','cffa120bdbd0f72a524c085c58df0c99a929e701dce82915857e0922782f5856','[\"refresh\"]',NULL,'2026-03-30 00:43:01','2026-02-28 00:43:01','2026-02-28 00:43:01');
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

--
-- Dumping data for table `sale_items_staging`
--

LOCK TABLES `sale_items_staging` WRITE;
/*!40000 ALTER TABLE `sale_items_staging` DISABLE KEYS */;
INSERT INTO `sale_items_staging` VALUES (1,1,485,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un',1.000,13600.00,0.00,NULL,NULL,0.00,13600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(2,1,471,'OCLUSOR MAGNETICO INDENTAL',2.000,48000.00,0.00,NULL,NULL,0.00,96000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(3,1,517,'YESO TALLER BLANCO PESCIO x 25Kg',1.000,40800.00,0.00,NULL,NULL,0.00,40800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(4,1,513,'YESO PIEDRA AZUL PESCIO x 25Kg',1.000,43600.00,0.00,NULL,NULL,0.00,43600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(5,2,517,'YESO TALLER BLANCO PESCIO x 25Kg',1.000,40800.00,0.00,NULL,NULL,0.00,40800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(6,2,415,'CERA PREFORMADA INDENTAL PLACA CERICA INF. O SUP. x UNIDAD',8.000,896.00,0.00,NULL,NULL,0.00,7168.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(7,2,516,'YESO PIEDRA VERDE PESCIO x 1Kg',3.000,1920.00,0.00,NULL,NULL,0.00,5760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(8,2,329,'BLISTER DIENTES ACRITONE P5 sup 68',2.000,1600.00,0.00,NULL,NULL,0.00,3200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(9,2,365,'BLISTER DIENTES ACRITONE P5 inf 68',2.000,1600.00,0.00,NULL,NULL,0.00,3200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(10,2,233,'BLISTER DIENTES ACRITONE 25 inf 68',2.000,1600.00,0.00,NULL,NULL,0.00,3200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(11,2,90,'BLISTER DIENTES ACRITONE 25 sup 68',2.000,1600.00,0.00,NULL,NULL,0.00,3200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(12,3,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(13,3,406,'CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO',1.000,9600.00,0.00,NULL,NULL,0.00,9600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(14,4,484,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x UNIDAD',4.000,2880.00,0.00,NULL,NULL,0.00,11520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(15,4,289,'BLISTER DIENTES ACRITONE 38 inf 67 (A3,5)',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(16,4,254,'BLISTER DIENTES ACRITONE 30 inf 81 (A4)',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(17,4,342,'BLISTER DIENTES ACRITONE P6 sup 69 (C3)',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(18,4,378,'BLISTER DIENTES ACRITONE P6 inf 69 (C3)',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(19,5,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(20,5,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(21,5,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(22,5,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(23,5,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,15000.00,0.00,NULL,NULL,0.00,15000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(24,5,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(25,5,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(26,5,401,'CARTUCHO ACRILICO PARA INYECCION API 22mm ROSADO',1.000,9600.00,0.00,NULL,NULL,0.00,9600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(27,6,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(28,6,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(29,6,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(30,6,537,'COMPRESA POR 10 UNIDADES',1.000,1500.00,0.00,NULL,NULL,0.00,1500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(31,6,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(32,6,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(33,6,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',NULL,15000.00,0.00,NULL,NULL,0.00,NULL,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(34,6,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(35,7,537,'COMPRESA POR 10 UNIDADES',1.000,1500.00,0.00,NULL,NULL,0.00,1500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(36,7,549,'10 MODELO DE YESO SUP',1.000,8750.00,0.00,NULL,NULL,0.00,8750.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(37,7,548,'10 ESPATULAS PLASTICO',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(38,7,547,'10 TAZAS DE GOMA',1.000,30000.00,0.00,NULL,NULL,0.00,30000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(39,7,550,'100 GRAMOS DE ACRILICO',1.000,5600.00,0.00,NULL,NULL,0.00,5600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(40,7,313,'BLISTER DIENTES ACRITONE P4 sup 67 (A3,5)',8.000,1600.00,0.00,NULL,NULL,0.00,12800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(41,7,86,'BLISTER DIENTES ACRITONE 25 sup 67 (A3,5)',4.000,1600.00,0.00,NULL,NULL,0.00,6400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(42,7,85,'BLISTER DIENTES ACRITONE 25 sup 66 (A3)',2.000,1600.00,0.00,NULL,NULL,0.00,3200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(43,7,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',5.000,1100.00,0.00,NULL,NULL,0.00,5500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(44,7,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,15000.00,0.00,NULL,NULL,0.00,15000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(45,7,541,'COMPRESAS EVODENT X50',1.000,2775.00,0.00,NULL,NULL,0.00,2775.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(46,7,427,'GELATINA PARA COLADO API SOBRE PARA 1Kg',1.000,40480.00,0.00,NULL,NULL,0.00,40480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(47,7,9,'ACRILICO PARA COLADO APC OKI x 800Gs',1.000,121210.00,0.00,NULL,NULL,0.00,121210.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(48,7,457,'MONOMERO PARA COLADO OKI x 1Lt',1.000,62400.00,0.00,NULL,NULL,0.00,62400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(49,7,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(50,8,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(51,8,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(52,8,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(53,8,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(54,8,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(55,8,544,'MODELOS DE YESO',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(56,8,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,2500.00,0.00,NULL,NULL,0.00,2500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(57,8,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(58,8,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(59,8,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(60,8,544,'MODELOS DE YESO',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(61,8,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(62,8,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(63,8,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(64,8,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,15000.00,0.00,NULL,NULL,0.00,15000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(65,8,544,'MODELOS DE YESO',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(66,8,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3500.00,0.00,NULL,NULL,0.00,7000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(67,8,549,'10 MODELO DE YESO SUP',1.000,8750.00,0.00,NULL,NULL,0.00,8750.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(68,8,548,'10 ESPATULAS PLASTICO',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(69,8,547,'10 TAZAS DE GOMA',1.000,30000.00,0.00,NULL,NULL,0.00,30000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(70,9,529,'INST LECRON',1.000,3045.00,0.00,NULL,NULL,0.00,3045.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(71,9,425,'FLAMEADOR ROMAN',1.000,4480.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(72,9,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(73,9,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(74,9,530,'GUANTES LATEX ELIT',1.000,4660.00,0.00,NULL,NULL,0.00,4660.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(75,9,535,'BARBIJOS POR 10 UNIDADES',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(76,9,537,'COMPRESA POR 10 UNIDADES',1.000,1500.00,0.00,NULL,NULL,0.00,1500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(77,9,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,15000.00,0.00,NULL,NULL,0.00,15000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(78,9,544,'MODELOS DE YESO',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(79,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(80,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(81,10,552,'DOSIFICADOR DE ALGINATO',5.000,3120.00,0.00,NULL,NULL,0.00,15600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(82,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(83,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(84,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(85,10,533,'MODELOS SUPERIOR E INFERIOR',10.000,880.00,0.00,NULL,NULL,0.00,8800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(86,10,537,'COMPRESA POR 10 UNIDADES',1.000,1500.00,0.00,NULL,NULL,0.00,1500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(87,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',10.000,3500.00,0.00,NULL,NULL,0.00,35000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(88,10,536,'COMPRESA POR UNIDAD',6.000,160.00,0.00,NULL,NULL,0.00,960.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(89,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(90,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(91,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(92,10,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(93,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',2.000,1800.00,0.00,NULL,NULL,0.00,3600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(94,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',2.000,1900.00,0.00,NULL,NULL,0.00,3800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(95,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3500.00,0.00,NULL,NULL,0.00,7000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(96,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(97,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(98,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(99,10,542,'ESPATULA PLASTICA COMUN',1.000,520.00,0.00,NULL,NULL,0.00,520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(100,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(101,10,533,'MODELOS SUPERIOR E INFERIOR',6.000,880.00,0.00,NULL,NULL,0.00,5280.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(102,10,542,'ESPATULA PLASTICA COMUN',6.000,520.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(103,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(104,10,533,'MODELOS SUPERIOR E INFERIOR',5.000,880.00,0.00,NULL,NULL,0.00,4400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(105,10,542,'ESPATULA PLASTICA COMUN',5.000,520.00,0.00,NULL,NULL,0.00,2600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(106,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',5.000,2730.00,0.00,NULL,NULL,0.00,13650.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(107,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(108,10,536,'COMPRESA POR UNIDAD',3.000,160.00,0.00,NULL,NULL,0.00,480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(109,10,538,'GUANTES POR UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(110,10,534,'BARBIJOS POR UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(111,10,533,'MODELOS SUPERIOR E INFERIOR',5.000,880.00,0.00,NULL,NULL,0.00,4400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(112,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',3.000,3500.00,0.00,NULL,NULL,0.00,10500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(113,10,533,'MODELOS SUPERIOR E INFERIOR',9.000,880.00,0.00,NULL,NULL,0.00,7920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(114,10,552,'DOSIFICADOR DE ALGINATO',5.000,3120.00,0.00,NULL,NULL,0.00,15600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(115,10,542,'ESPATULA PLASTICA COMUN',9.000,520.00,0.00,NULL,NULL,0.00,4680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(116,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',9.000,2730.00,0.00,NULL,NULL,0.00,24570.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(117,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(118,10,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(119,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(120,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(121,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(122,10,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(123,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(124,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(125,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',2.000,1900.00,0.00,NULL,NULL,0.00,3800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(126,10,533,'MODELOS SUPERIOR E INFERIOR',10.000,880.00,0.00,NULL,NULL,0.00,8800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(127,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',10.000,3500.00,0.00,NULL,NULL,0.00,35000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(128,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(129,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(130,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(131,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(132,10,542,'ESPATULA PLASTICA COMUN',1.000,520.00,0.00,NULL,NULL,0.00,520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(133,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(134,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(135,10,541,'COMPRESAS EVODENT X50',1.000,2776.00,0.00,NULL,NULL,0.00,2776.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(136,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3500.00,0.00,NULL,NULL,0.00,7000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(137,10,406,'CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO',1.000,9600.00,0.00,NULL,NULL,0.00,9600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(138,10,408,'CARTUCHOS VACIOS PARA INYECCION INDENTAL 25mm x 100mm CON TAPA',1.000,1280.00,0.00,NULL,NULL,0.00,1280.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(139,10,530,'GUANTES LATEX ELIT',1.000,4660.00,0.00,NULL,NULL,0.00,4660.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(140,10,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(141,10,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(142,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(143,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(144,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(145,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(146,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(147,10,542,'ESPATULA PLASTICA COMUN',1.000,520.00,0.00,NULL,NULL,0.00,520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(148,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(149,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(150,10,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(151,10,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(152,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(153,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(154,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(155,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(156,10,542,'ESPATULA PLASTICA COMUN',1.000,520.00,0.00,NULL,NULL,0.00,520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(157,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(158,10,541,'COMPRESAS EVODENT X50',1.000,2776.00,0.00,NULL,NULL,0.00,2776.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(159,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(160,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(161,10,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(162,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(163,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(164,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(165,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(166,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(167,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(168,10,536,'COMPRESA POR UNIDAD',5.000,160.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(169,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(170,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(171,10,533,'MODELOS SUPERIOR E INFERIOR',8.000,880.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(172,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(173,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(174,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(175,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(176,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(177,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(178,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(179,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(180,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(181,10,533,'MODELOS SUPERIOR E INFERIOR',7.000,880.00,0.00,NULL,NULL,0.00,6160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(182,10,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(183,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(184,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',2.000,14850.00,0.00,NULL,NULL,0.00,29700.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(185,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(186,10,533,'MODELOS SUPERIOR E INFERIOR',9.000,880.00,0.00,NULL,NULL,0.00,7920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(187,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',8.000,3500.00,0.00,NULL,NULL,0.00,28000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(188,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(189,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(190,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',10.000,2730.00,0.00,NULL,NULL,0.00,27300.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(191,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(192,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(193,10,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(194,10,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(195,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(196,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',7.000,3500.00,0.00,NULL,NULL,0.00,24500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(197,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(198,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(199,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(200,10,551,'CUBETA PLASTICA  AUTOCLAVABLES',2.000,1397.00,0.00,NULL,NULL,0.00,2794.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(201,10,533,'MODELOS SUPERIOR E INFERIOR',4.000,880.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(202,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',6.000,3500.00,0.00,NULL,NULL,0.00,21000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(203,10,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(204,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(205,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(206,10,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(207,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(208,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(209,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(210,10,542,'ESPATULA PLASTICA COMUN',1.000,520.00,0.00,NULL,NULL,0.00,520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(211,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(212,10,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(213,10,536,'COMPRESA POR UNIDAD',4.000,160.00,0.00,NULL,NULL,0.00,640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(214,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(215,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(216,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(217,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(218,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(219,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(220,10,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(221,10,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(222,10,535,'BARBIJOS POR 10 UNIDADES',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(223,10,539,'GUANTES POR 10 PARES',1.000,1750.00,0.00,NULL,NULL,0.00,1750.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(224,10,537,'COMPRESA POR 10 UNIDADES',1.000,1500.00,0.00,NULL,NULL,0.00,1500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(225,10,549,'10 MODELO DE YESO SUP',1.000,8750.00,0.00,NULL,NULL,0.00,8750.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(226,10,548,'10 ESPATULAS PLASTICO',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(227,10,547,'10 TAZAS DE GOMA',1.000,30000.00,0.00,NULL,NULL,0.00,30000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(228,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(229,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(230,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(231,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(232,10,541,'COMPRESAS EVODENT X50',1.000,2776.00,0.00,NULL,NULL,0.00,2776.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(233,10,530,'GUANTES LATEX ELIT',1.000,4660.00,0.00,NULL,NULL,0.00,4660.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(234,10,531,'BARBIJOS TRIPACA X50 U.',1.000,2050.00,0.00,NULL,NULL,0.00,2050.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(235,10,536,'COMPRESA POR UNIDAD',3.000,160.00,0.00,NULL,NULL,0.00,480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(236,10,538,'GUANTES POR UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(237,10,534,'BARBIJOS POR UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(238,10,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(239,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',3.000,3500.00,0.00,NULL,NULL,0.00,10500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(240,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(241,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(242,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(243,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(244,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(245,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(246,10,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(247,10,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(248,10,551,'CUBETA PLASTICA  AUTOCLAVABLES',1.000,1397.00,0.00,NULL,NULL,0.00,1397.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(249,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(250,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(251,10,533,'MODELOS SUPERIOR E INFERIOR',10.000,880.00,0.00,NULL,NULL,0.00,8800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(252,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(253,10,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(254,10,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(255,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(256,10,537,'COMPRESA POR 10 UNIDADES',1.000,1500.00,0.00,NULL,NULL,0.00,1500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(257,10,551,'CUBETA PLASTICA  AUTOCLAVABLES',10.000,1397.00,0.00,NULL,NULL,0.00,13970.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(258,10,549,'10 MODELO DE YESO SUP',2.000,8750.00,0.00,NULL,NULL,0.00,17500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(259,10,548,'10 ESPATULAS PLASTICO',1.000,4480.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(260,10,547,'10 TAZAS DE GOMA',1.000,30000.00,0.00,NULL,NULL,0.00,30000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(261,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3500.00,0.00,NULL,NULL,0.00,7000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(262,10,551,'CUBETA PLASTICA  AUTOCLAVABLES',2.000,1397.00,0.00,NULL,NULL,0.00,2794.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(263,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(264,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(265,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3500.00,0.00,NULL,NULL,0.00,7000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(266,10,551,'CUBETA PLASTICA  AUTOCLAVABLES',2.000,1397.00,0.00,NULL,NULL,0.00,2794.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(267,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(268,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(269,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(270,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',6.000,2730.00,0.00,NULL,NULL,0.00,16380.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(271,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(272,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(273,10,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(274,10,551,'CUBETA PLASTICA  AUTOCLAVABLES',1.000,1397.00,0.00,NULL,NULL,0.00,1397.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(275,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(276,10,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(277,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(278,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(279,10,514,'YESO PIEDRA AZUL PESCIO x 1Kg',2.000,1900.00,0.00,NULL,NULL,0.00,3800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(280,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(281,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(282,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(283,10,533,'MODELOS SUPERIOR E INFERIOR',4.000,880.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(284,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(285,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(286,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(287,10,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(288,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(289,10,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(290,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(291,10,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(292,10,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(293,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(294,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(295,10,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(296,10,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(297,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(298,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(299,10,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(300,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(301,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(302,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3500.00,0.00,NULL,NULL,0.00,7000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(303,10,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(304,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3500.00,0.00,NULL,NULL,0.00,7000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(305,10,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(306,10,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3500.00,0.00,NULL,NULL,0.00,3500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(307,10,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(308,10,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(309,10,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(310,10,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1800.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(311,10,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1900.00,0.00,NULL,NULL,0.00,1900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(312,10,539,'GUANTES POR 10 PARES',1.000,1750.00,0.00,NULL,NULL,0.00,1750.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(313,10,535,'BARBIJOS POR 10 UNIDADES',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(314,11,554,'CUBETA PLASTICA COLOR AZUL',10.000,2000.00,0.00,NULL,NULL,0.00,20000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(315,11,544,'MODELOS DE YESO',10.000,900.00,0.00,NULL,NULL,0.00,9000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(316,12,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(317,12,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(318,12,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(319,12,536,'COMPRESA POR UNIDAD',3.000,160.00,0.00,NULL,NULL,0.00,480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(320,12,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(321,12,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(322,12,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(323,12,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(324,12,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(325,12,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(326,12,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(327,12,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(328,12,542,'ESPATULA PLASTICA COMUN',3.000,512.00,0.00,NULL,NULL,0.00,1536.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(329,12,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',4.000,2730.00,0.00,NULL,NULL,0.00,10920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(330,12,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(331,12,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(332,12,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(333,12,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(334,12,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(335,12,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(336,12,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(337,12,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',9.000,2730.00,0.00,NULL,NULL,0.00,24570.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(338,12,552,'DOSIFICADOR DE ALGINATO',3.000,3120.00,0.00,NULL,NULL,0.00,9360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(339,12,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(340,12,542,'ESPATULA PLASTICA COMUN',3.000,512.00,0.00,NULL,NULL,0.00,1536.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(341,12,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',3.000,2730.00,0.00,NULL,NULL,0.00,8190.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(342,12,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(343,12,540,'TAZA DE GOMA + ESPATULA PLASTICO',3.000,3520.00,0.00,NULL,NULL,0.00,10560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(344,12,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(345,12,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(346,12,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(347,12,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(348,12,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(349,12,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(350,12,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(351,12,534,'BARBIJOS POR UNIDAD',5.000,200.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(352,12,538,'GUANTES POR UNIDAD',5.000,200.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(353,12,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(354,12,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(355,12,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(356,12,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(357,12,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(358,12,542,'ESPATULA PLASTICA COMUN',3.000,512.00,0.00,NULL,NULL,0.00,1536.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(359,12,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',3.000,2730.00,0.00,NULL,NULL,0.00,8190.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(360,12,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(361,12,540,'TAZA DE GOMA + ESPATULA PLASTICO',3.000,3520.00,0.00,NULL,NULL,0.00,10560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(362,12,548,'10 ESPATULAS PLASTICO',1.000,4480.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(363,12,533,'MODELOS SUPERIOR E INFERIOR',10.000,880.00,0.00,NULL,NULL,0.00,8800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(364,12,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(365,12,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(366,12,533,'MODELOS SUPERIOR E INFERIOR',9.000,880.00,0.00,NULL,NULL,0.00,7920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(367,12,542,'ESPATULA PLASTICA COMUN',10.000,512.00,0.00,NULL,NULL,0.00,5120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(368,12,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(369,12,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(370,12,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(371,12,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(372,12,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(373,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(374,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(375,13,555,'CUBETAS VERDE',4.000,2301.00,0.00,NULL,NULL,0.00,9204.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(376,13,533,'MODELOS SUPERIOR E INFERIOR',6.000,880.00,0.00,NULL,NULL,0.00,5280.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(377,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(378,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(379,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(380,13,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(381,13,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(382,13,555,'CUBETAS VERDE',1.000,2301.00,0.00,NULL,NULL,0.00,2301.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(383,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(384,13,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(385,13,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(386,13,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(387,13,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(388,13,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(389,13,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(390,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(391,13,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(392,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(393,13,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(394,13,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(395,13,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(396,13,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(397,13,555,'CUBETAS VERDE',1.000,2301.00,0.00,NULL,NULL,0.00,2301.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(398,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(399,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(400,13,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(401,13,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(402,13,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(403,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',3.000,2730.00,0.00,NULL,NULL,0.00,8190.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(404,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(405,13,555,'CUBETAS VERDE',1.000,2301.00,0.00,NULL,NULL,0.00,2301.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(406,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(407,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(408,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(409,13,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(410,13,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(411,13,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(412,13,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(413,13,542,'ESPATULA PLASTICA COMUN',2.000,512.00,0.00,NULL,NULL,0.00,1024.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(414,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',2.000,2730.00,0.00,NULL,NULL,0.00,5460.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(415,13,555,'CUBETAS VERDE',1.000,2301.00,0.00,NULL,NULL,0.00,2301.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(416,13,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(417,13,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(418,13,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(419,13,555,'CUBETAS VERDE',1.000,2301.00,0.00,NULL,NULL,0.00,2301.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(420,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(421,13,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(422,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(423,13,555,'CUBETAS VERDE',20.000,2301.00,0.00,NULL,NULL,0.00,46020.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(424,13,534,'BARBIJOS POR UNIDAD',8.000,200.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(425,13,536,'COMPRESA POR UNIDAD',8.000,160.00,0.00,NULL,NULL,0.00,1280.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(426,13,555,'CUBETAS VERDE',4.000,2301.00,0.00,NULL,NULL,0.00,9204.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(427,13,533,'MODELOS SUPERIOR E INFERIOR',8.000,880.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(428,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(429,13,542,'ESPATULA PLASTICA COMUN',8.000,512.00,0.00,NULL,NULL,0.00,4096.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(430,13,538,'GUANTES POR UNIDAD',4.000,200.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(431,13,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(432,13,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(433,13,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(434,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(435,13,555,'CUBETAS VERDE',1.000,2301.00,0.00,NULL,NULL,0.00,2301.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(436,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(437,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(438,13,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(439,13,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(440,13,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(441,13,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(442,13,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(443,13,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(444,13,555,'CUBETAS VERDE',1.000,2301.00,0.00,NULL,NULL,0.00,2301.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(445,13,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(446,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(447,13,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(448,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(449,13,555,'CUBETAS VERDE',6.000,2301.00,0.00,NULL,NULL,0.00,13806.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(450,13,555,'CUBETAS VERDE',2.000,2301.00,0.00,NULL,NULL,0.00,4602.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(451,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(452,13,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(453,13,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(454,13,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(455,13,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(456,13,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(457,13,536,'COMPRESA POR UNIDAD',3.000,160.00,0.00,NULL,NULL,0.00,480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(458,13,518,'YESO TALLER BLANCO PESCIO x 1Kg',2.000,1760.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(459,13,516,'YESO PIEDRA VERDE PESCIO x 1Kg',2.000,1920.00,0.00,NULL,NULL,0.00,3840.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(460,13,533,'MODELOS SUPERIOR E INFERIOR',6.000,880.00,0.00,NULL,NULL,0.00,5280.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(461,13,542,'ESPATULA PLASTICA COMUN',3.000,512.00,0.00,NULL,NULL,0.00,1536.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(462,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',3.000,2730.00,0.00,NULL,NULL,0.00,8190.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(463,13,533,'MODELOS SUPERIOR E INFERIOR',8.000,880.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(464,13,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(465,13,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(466,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(467,13,534,'BARBIJOS POR UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(468,13,538,'GUANTES POR UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(469,13,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(470,13,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(471,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(472,13,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(473,13,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(474,13,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(475,13,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(476,13,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(477,13,533,'MODELOS SUPERIOR E INFERIOR',4.000,880.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(478,13,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(479,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(480,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',3.000,3520.00,0.00,NULL,NULL,0.00,10560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(481,13,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(482,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',3.000,3520.00,0.00,NULL,NULL,0.00,10560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(483,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(484,13,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(485,13,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(486,13,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(487,13,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(488,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(489,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(490,13,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(491,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(492,13,529,'INST LECRON',1.000,3045.00,0.00,NULL,NULL,0.00,3045.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(493,13,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(494,13,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(495,13,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(496,13,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(497,13,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(498,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(499,13,542,'ESPATULA PLASTICA COMUN',3.000,512.00,0.00,NULL,NULL,0.00,1536.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(500,13,540,'TAZA DE GOMA + ESPATULA PLASTICO',7.000,3520.00,0.00,NULL,NULL,0.00,24640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(501,13,533,'MODELOS SUPERIOR E INFERIOR',12.000,880.00,0.00,NULL,NULL,0.00,10560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(502,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',20.000,2730.00,0.00,NULL,NULL,0.00,54600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(503,13,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(504,13,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',2.000,2730.00,0.00,NULL,NULL,0.00,5460.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(505,13,530,'GUANTES LATEX ELIT',1.000,4662.00,0.00,NULL,NULL,0.00,4662.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(506,13,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(507,13,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(508,14,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(509,14,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',5.000,1120.00,0.00,NULL,NULL,0.00,5600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(510,14,409,'CEPILLO 2 HILERAS ROMAN PARA PULIDORA x UNIDAD',1.000,6000.00,0.00,NULL,NULL,0.00,6000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(511,14,90,'BLISTER DIENTES ACRITONE 25 sup 68',2.000,1600.00,0.00,NULL,NULL,0.00,3200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(512,14,523,'ALCOHOL ETILICO',1.000,6720.00,0.00,NULL,NULL,0.00,6720.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(513,14,515,'YESO PIEDRA VERDE PESCIO x 25Kg',1.000,43600.00,0.00,NULL,NULL,0.00,43600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(514,14,338,'BLISTER DIENTES ACRITONE P6 sup 81 (A4)',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(515,14,99,'BLISTER DIENTES ACRITONE 26 sup 81 (A4)',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(516,14,87,'BLISTER DIENTES ACRITONE 25 sup 81 (A4)',1.000,1600.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(517,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(518,14,554,'CUBETA PLASTICA COLOR AZUL',2.000,2000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(519,14,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(520,14,406,'CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO',1.000,9000.00,0.00,NULL,NULL,0.00,9000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(521,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',2.000,2730.00,0.00,NULL,NULL,0.00,5460.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(522,14,553,'COMPRESA EVODENT',1.000,3000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(523,14,554,'CUBETA PLASTICA COLOR AZUL',2.000,2000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(524,14,554,'CUBETA PLASTICA COLOR AZUL',2.000,2000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(525,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',10.000,3520.00,0.00,NULL,NULL,0.00,35200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(526,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(527,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(528,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(529,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(530,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(531,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(532,14,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(533,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(534,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(535,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(536,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(537,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(538,14,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(539,14,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(540,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(541,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(542,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(543,14,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(544,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(545,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(546,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(547,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(548,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(549,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(550,14,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(551,14,538,'GUANTES POR UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(552,14,534,'BARBIJOS POR UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(553,14,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(554,14,554,'CUBETA PLASTICA COLOR AZUL',2.000,2000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(555,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(556,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(557,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(558,14,554,'CUBETA PLASTICA COLOR AZUL',2.000,2000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(559,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(560,14,533,'MODELOS SUPERIOR E INFERIOR',4.000,880.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(561,14,554,'CUBETA PLASTICA COLOR AZUL',4.000,2000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(562,14,406,'CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO',1.000,9000.00,0.00,NULL,NULL,0.00,9000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(563,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(564,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(565,14,554,'CUBETA PLASTICA COLOR AZUL',5.000,2000.00,0.00,NULL,NULL,0.00,10000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(566,14,533,'MODELOS SUPERIOR E INFERIOR',5.000,880.00,0.00,NULL,NULL,0.00,4400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(567,14,554,'CUBETA PLASTICA COLOR AZUL',4.000,2000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(568,14,533,'MODELOS SUPERIOR E INFERIOR',5.000,880.00,0.00,NULL,NULL,0.00,4400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(569,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(570,14,533,'MODELOS SUPERIOR E INFERIOR',7.000,880.00,0.00,NULL,NULL,0.00,6160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(571,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(572,14,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(573,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(574,14,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(575,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(576,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(577,14,533,'MODELOS SUPERIOR E INFERIOR',5.000,880.00,0.00,NULL,NULL,0.00,4400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(578,14,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(579,14,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(580,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(581,14,554,'CUBETA PLASTICA COLOR AZUL',1.000,2000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(582,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(583,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(584,14,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(585,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(586,14,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(587,14,554,'CUBETA PLASTICA COLOR AZUL',4.000,2000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(588,14,533,'MODELOS SUPERIOR E INFERIOR',4.000,880.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(589,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(590,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(591,14,525,'ESPATULA PLASTICA',3.000,448.00,0.00,NULL,NULL,0.00,1344.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(592,14,536,'COMPRESA POR UNIDAD',10.000,160.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(593,14,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(594,14,525,'ESPATULA PLASTICA',10.000,448.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(595,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',10.000,2730.00,0.00,NULL,NULL,0.00,27300.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(596,14,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(597,14,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(598,14,525,'ESPATULA PLASTICA',1.000,448.00,0.00,NULL,NULL,0.00,448.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(599,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',2.000,2730.00,0.00,NULL,NULL,0.00,5460.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(600,14,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(601,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(602,14,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(603,14,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(604,14,536,'COMPRESA POR UNIDAD',5.000,160.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(605,14,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(606,14,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(607,14,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(608,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(609,14,525,'ESPATULA PLASTICA',1.000,448.00,0.00,NULL,NULL,0.00,448.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(610,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(611,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(612,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(613,14,533,'MODELOS SUPERIOR E INFERIOR',5.000,880.00,0.00,NULL,NULL,0.00,4400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(614,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',5.000,3520.00,0.00,NULL,NULL,0.00,17600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(615,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(616,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(617,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(618,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',2.000,2730.00,0.00,NULL,NULL,0.00,5460.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(619,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(620,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(621,14,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(622,14,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(623,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(624,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(625,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',2.000,3520.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(626,14,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(627,14,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(628,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(629,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(630,14,536,'COMPRESA POR UNIDAD',10.000,160.00,0.00,NULL,NULL,0.00,1600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(631,14,525,'ESPATULA PLASTICA',10.000,448.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(632,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',10.000,2730.00,0.00,NULL,NULL,0.00,27300.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(633,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(634,14,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(635,14,518,'YESO TALLER BLANCO PESCIO x 1Kg',2.000,1760.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(636,14,514,'YESO PIEDRA AZUL PESCIO x 1Kg',2.000,1920.00,0.00,NULL,NULL,0.00,3840.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(637,14,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',2.000,14850.00,0.00,NULL,NULL,0.00,29700.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(638,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',6.000,3520.00,0.00,NULL,NULL,0.00,21120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(639,14,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(640,14,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(641,14,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(642,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(643,14,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(644,14,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(645,14,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(646,14,542,'ESPATULA PLASTICA COMUN',2.000,512.00,0.00,NULL,NULL,0.00,1024.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(647,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',2.000,2730.00,0.00,NULL,NULL,0.00,5460.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(648,14,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',2.000,14850.00,0.00,NULL,NULL,0.00,29700.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(649,14,407,'CARTUCHOS VACIOS PARA INYECCION INDENTAL 22mm x 120mm CON TAPA',1.000,1280.00,0.00,NULL,NULL,0.00,1280.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(650,14,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(651,14,406,'CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO',2.000,9000.00,0.00,NULL,NULL,0.00,18000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(652,14,542,'ESPATULA PLASTICA COMUN',10.000,512.00,0.00,NULL,NULL,0.00,5120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(653,14,533,'MODELOS SUPERIOR E INFERIOR',5.000,880.00,0.00,NULL,NULL,0.00,4400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(654,14,534,'BARBIJOS POR UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(655,14,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(656,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(657,14,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(658,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(659,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(660,14,541,'COMPRESAS EVODENT X50',1.000,2776.00,0.00,NULL,NULL,0.00,2776.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(661,14,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(662,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(663,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(664,14,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(665,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(666,14,533,'MODELOS SUPERIOR E INFERIOR',3.000,880.00,0.00,NULL,NULL,0.00,2640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(667,14,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(668,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(669,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(670,14,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(671,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(672,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(673,14,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(674,14,538,'GUANTES POR UNIDAD',5.000,200.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(675,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(676,14,540,'TAZA DE GOMA + ESPATULA PLASTICO',1.000,3520.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(677,14,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(678,14,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(679,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(680,14,533,'MODELOS SUPERIOR E INFERIOR',2.000,880.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(681,14,542,'ESPATULA PLASTICA COMUN',1.000,512.00,0.00,NULL,NULL,0.00,512.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(682,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(683,14,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(684,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(685,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(686,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(687,14,555,'CUBETAS VERDE',2.000,2301.00,0.00,NULL,NULL,0.00,4602.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(688,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(689,14,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(690,14,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(691,14,533,'MODELOS SUPERIOR E INFERIOR',13.000,880.00,0.00,NULL,NULL,0.00,11440.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(692,14,555,'CUBETAS VERDE',1.000,2301.00,0.00,NULL,NULL,0.00,2301.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(693,14,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(694,14,520,'YESO TALLER AMARILLO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(695,14,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(696,14,555,'CUBETAS VERDE',3.000,2301.00,0.00,NULL,NULL,0.00,6903.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(697,14,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(698,14,534,'BARBIJOS POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(699,14,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(700,14,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(701,14,514,'YESO PIEDRA AZUL PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(702,14,24,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(703,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(704,14,525,'ESPATULA PLASTICA',1.000,448.00,0.00,NULL,NULL,0.00,448.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(705,14,524,'TAZA DE GOMA PARA YESO \"ROMAN\"',1.000,2730.00,0.00,NULL,NULL,0.00,2730.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(706,14,533,'MODELOS SUPERIOR E INFERIOR',1.000,880.00,0.00,NULL,NULL,0.00,880.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(707,15,25,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',1.000,14850.00,0.00,NULL,NULL,0.00,14850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(708,15,516,'YESO PIEDRA VERDE PESCIO x 1Kg',2.000,1920.00,0.00,NULL,NULL,0.00,3840.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(709,16,561,'MACROMODELOS PARA ANATOMIA DENTARIA',2.000,5501.00,0.00,NULL,NULL,0.00,11002.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(710,17,411,'CERA CROMO INDENTAL x 1/2Kg',8.000,0.00,0.00,NULL,NULL,0.00,0.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(711,17,10,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE CELESTE x 1Kg',1.000,0.00,0.00,NULL,NULL,0.00,0.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(712,17,10,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE CELESTE x 1Kg',20.000,0.00,0.00,NULL,NULL,0.00,0.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(713,17,533,'MODELOS SUPERIOR E INFERIOR',22.000,900.00,0.00,NULL,NULL,0.00,19800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(714,17,544,'MODELOS DE YESO',324.000,0.00,0.00,NULL,NULL,0.00,0.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(715,17,546,'TAZAS DE GOMA',289.000,0.00,0.00,NULL,NULL,0.00,0.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(716,18,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(717,18,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(718,18,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(719,19,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(720,19,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(721,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(722,19,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(723,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(724,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(725,19,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(726,19,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(727,19,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(728,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(729,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(730,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(731,19,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(732,19,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(733,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(734,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(735,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(736,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(737,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(738,19,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(739,19,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(740,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(741,19,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(742,19,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(743,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(744,19,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(745,19,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(746,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(747,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(748,19,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(749,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(750,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(751,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(752,19,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(753,19,571,'0',2.000,352.00,0.00,NULL,NULL,0.00,704.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(754,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(755,19,545,'BARRITA DE CERA',2.000,560.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(756,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(757,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(758,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(759,19,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(760,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(761,19,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(762,19,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(763,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(764,19,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(765,19,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',2.000,8701.00,0.00,NULL,NULL,0.00,17402.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(766,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',2.000,4000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(767,19,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(768,19,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(769,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(770,19,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(771,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(772,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(773,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(774,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(775,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(776,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(777,19,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',2.000,8701.00,0.00,NULL,NULL,0.00,17402.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(778,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(779,19,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(780,19,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(781,19,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(782,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(783,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(784,19,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(785,19,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(786,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(787,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(788,19,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(789,19,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(790,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(791,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(792,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(793,19,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(794,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(795,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(796,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(797,19,545,'BARRITA DE CERA',4.000,560.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(798,19,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(799,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(800,19,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(801,19,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(802,19,571,'0',2.000,352.00,0.00,NULL,NULL,0.00,704.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(803,19,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(804,19,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(805,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(806,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(807,19,571,'0',5.000,352.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(808,19,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(809,19,545,'BARRITA DE CERA',4.000,560.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(810,19,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',12.000,1120.00,0.00,NULL,NULL,0.00,13440.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(811,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',2.000,4000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(812,19,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(813,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(814,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(815,19,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(816,19,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(817,19,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(818,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(819,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(820,19,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(821,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(822,19,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(823,19,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(824,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(825,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(826,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(827,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(828,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(829,19,566,'TABLETA DE CERA PARA CROMO',3.000,1000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(830,19,545,'BARRITA DE CERA',3.000,560.00,0.00,NULL,NULL,0.00,1680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(831,19,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(832,19,571,'0',3.000,352.00,0.00,NULL,NULL,0.00,1056.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(833,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(834,19,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(835,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(836,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(837,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(838,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(839,19,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(840,19,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(841,19,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(842,19,545,'BARRITA DE CERA',2.000,560.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(843,19,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(844,19,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(845,19,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(846,19,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(847,19,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(848,19,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(849,20,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(850,20,534,'BARBIJO POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(851,20,565,'COFIA DESCARTABLE POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(852,20,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(853,20,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(854,20,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(855,20,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(856,20,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(857,20,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(858,20,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(859,20,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(860,20,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(861,20,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(862,20,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(863,20,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(864,20,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(865,20,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(866,20,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(867,20,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(868,20,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(869,20,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(870,20,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(871,20,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(872,20,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(873,20,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(874,20,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(875,20,571,'0',2.000,352.00,0.00,NULL,NULL,0.00,704.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(876,20,545,'BARRITA DE CERA',2.000,560.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(877,20,522,'SEPARADOR ACRILICO 100CC',2.000,1200.00,0.00,NULL,NULL,0.00,2400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(878,20,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',2.000,4000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(879,20,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(880,20,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(881,20,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',3.000,1000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(882,20,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(883,20,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(884,20,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(885,20,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(886,20,571,'0',2.000,352.00,0.00,NULL,NULL,0.00,704.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(887,20,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(888,20,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(889,20,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(890,20,516,'YESO PIEDRA VERDE PESCIO x 1Kg',1.000,1920.00,0.00,NULL,NULL,0.00,1920.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(891,20,518,'YESO TALLER BLANCO PESCIO x 1Kg',1.000,1760.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(892,20,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(893,20,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(894,20,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(895,20,565,'COFIA DESCARTABLE POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(896,20,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(897,20,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(898,20,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(899,20,425,'FLAMEADOR ROMAN',1.000,4200.00,0.00,NULL,NULL,0.00,4200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(900,21,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(901,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(902,21,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(903,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(904,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(905,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',4.000,1120.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(906,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(907,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(908,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(909,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(910,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(911,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(912,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(913,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(914,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(915,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(916,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(917,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(918,21,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(919,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(920,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(921,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(922,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(923,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(924,21,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(925,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(926,21,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(927,21,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(928,21,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(929,21,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(930,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(931,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(932,21,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(933,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(934,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(935,21,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(936,21,534,'BARBIJO POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(937,21,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(938,21,565,'COFIA DESCARTABLE POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(939,21,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(940,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(941,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(942,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(943,21,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(944,21,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(945,21,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(946,21,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(947,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(948,21,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(949,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(950,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(951,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(952,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(953,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(954,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(955,21,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(956,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(957,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(958,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(959,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(960,21,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(961,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(962,21,513,'YESO PIEDRA AZUL PESCIO x 25Kg',1.000,43600.00,0.00,NULL,NULL,0.00,43600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(963,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(964,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(965,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(966,21,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(967,21,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(968,21,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(969,21,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(970,21,566,'TABLETA DE CERA PARA CROMO',5.000,1000.00,0.00,NULL,NULL,0.00,5000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(971,21,545,'BARRITA DE CERA',5.000,560.00,0.00,NULL,NULL,0.00,2800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(972,21,571,'0',5.000,352.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(973,21,534,'BARBIJO POR UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(974,21,536,'COMPRESA POR UNIDAD',3.000,160.00,0.00,NULL,NULL,0.00,480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(975,21,565,'COFIA DESCARTABLE POR UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(976,21,538,'GUANTES POR UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(977,21,566,'TABLETA DE CERA PARA CROMO',3.000,1000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(978,21,545,'BARRITA DE CERA',3.000,560.00,0.00,NULL,NULL,0.00,1680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(979,21,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(980,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',3.000,1000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(981,21,569,'ESPATULA PARA CEMENTO DOBLE',3.000,4500.00,0.00,NULL,NULL,0.00,13500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(982,21,558,'TALLADOR LECRON',3.000,4202.00,0.00,NULL,NULL,0.00,12606.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(983,21,533,'MODELOS SUPERIOR E INFERIOR',6.000,900.00,0.00,NULL,NULL,0.00,5400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(984,21,557,'VASO DAPPEN SILICONA',3.000,7364.00,0.00,NULL,NULL,0.00,22092.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(985,21,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',3.000,8701.00,0.00,NULL,NULL,0.00,26103.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(986,21,571,'0',3.000,352.00,0.00,NULL,NULL,0.00,1056.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(987,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',3.000,1120.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(988,21,522,'SEPARADOR ACRILICO 100CC',3.000,1200.00,0.00,NULL,NULL,0.00,3600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(989,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',3.000,4000.00,0.00,NULL,NULL,0.00,12000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(990,21,562,'MONOMERO AUTO X 100CC',3.000,4992.00,0.00,NULL,NULL,0.00,14976.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(991,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(992,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(993,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(994,21,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(995,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(996,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(997,21,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(998,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(999,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1000,21,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1001,21,571,'0',6.000,352.00,0.00,NULL,NULL,0.00,2112.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1002,21,545,'BARRITA DE CERA',4.000,560.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1003,21,534,'BARBIJO POR UNIDAD',4.000,200.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1004,21,536,'COMPRESA POR UNIDAD',4.000,160.00,0.00,NULL,NULL,0.00,640.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1005,21,565,'COFIA DESCARTABLE POR UNIDAD',4.000,200.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1006,21,538,'GUANTES POR UNIDAD',4.000,200.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1007,21,566,'TABLETA DE CERA PARA CROMO',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1008,21,545,'BARRITA DE CERA',4.000,560.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1009,21,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',4.000,200.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1010,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1011,21,569,'ESPATULA PARA CEMENTO DOBLE',4.000,4500.00,0.00,NULL,NULL,0.00,18000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1012,21,558,'TALLADOR LECRON',4.000,4202.00,0.00,NULL,NULL,0.00,16808.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1013,21,533,'MODELOS SUPERIOR E INFERIOR',8.000,900.00,0.00,NULL,NULL,0.00,7200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1014,21,557,'VASO DAPPEN SILICONA',4.000,7364.00,0.00,NULL,NULL,0.00,29456.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1015,21,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',4.000,8701.00,0.00,NULL,NULL,0.00,34804.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1016,21,571,'0',4.000,352.00,0.00,NULL,NULL,0.00,1408.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1017,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',4.000,1120.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1018,21,522,'SEPARADOR ACRILICO 100CC',4.000,1200.00,0.00,NULL,NULL,0.00,4800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1019,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',4.000,4000.00,0.00,NULL,NULL,0.00,16000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1020,21,562,'MONOMERO AUTO X 100CC',4.000,4992.00,0.00,NULL,NULL,0.00,19968.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1021,21,534,'BARBIJO POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1022,21,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1023,21,565,'COFIA DESCARTABLE POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1024,21,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1025,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1026,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1027,21,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1028,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1029,21,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1030,21,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1031,21,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1032,21,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1033,21,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1034,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1035,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1036,21,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1037,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1038,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1039,21,553,'COMPRESA EVODENT',1.000,3000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1040,21,530,'GUANTES LATEX ELIT',1.000,4662.00,0.00,NULL,NULL,0.00,4662.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1041,21,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1042,21,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1043,21,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1044,21,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1045,21,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1046,21,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1047,21,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1048,21,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1049,21,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1050,21,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1051,21,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1052,21,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1053,21,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1054,21,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1055,22,536,'COMPRESA POR UNIDAD',2.000,160.00,0.00,NULL,NULL,0.00,320.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1056,22,545,'BARRITA DE CERA',2.000,560.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1057,22,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1058,22,558,'TALLADOR LECRON',2.000,4202.00,0.00,NULL,NULL,0.00,8404.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1059,22,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1060,22,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1061,22,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1062,22,411,'CERA CROMO INDENTAL x 1/2Kg',2.000,59200.00,0.00,NULL,NULL,0.00,118400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1063,22,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',2.000,4000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1064,22,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1065,22,566,'TABLETA DE CERA PARA CROMO',5.000,1000.00,0.00,NULL,NULL,0.00,5000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1066,22,545,'BARRITA DE CERA',8.000,560.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1067,22,522,'SEPARADOR ACRILICO 100CC',4.000,1200.00,0.00,NULL,NULL,0.00,4800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1068,22,571,'0',8.000,352.00,0.00,NULL,NULL,0.00,2816.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1069,22,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',8.000,1120.00,0.00,NULL,NULL,0.00,8960.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1070,22,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',8.000,1000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1071,22,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1072,22,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',4.000,1120.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1073,22,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1074,22,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1075,22,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1076,22,545,'BARRITA DE CERA',2.000,560.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1077,22,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1078,22,558,'TALLADOR LECRON',2.000,4202.00,0.00,NULL,NULL,0.00,8404.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1079,22,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1080,22,557,'VASO DAPPEN SILICONA',2.000,7364.00,0.00,NULL,NULL,0.00,14728.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1081,22,571,'0',2.000,352.00,0.00,NULL,NULL,0.00,704.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1082,22,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1083,22,522,'SEPARADOR ACRILICO 100CC',2.000,1200.00,0.00,NULL,NULL,0.00,2400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1084,22,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',2.000,4000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1085,22,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1086,22,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1087,22,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1088,22,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1089,22,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1090,22,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1091,22,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1092,22,545,'BARRITA DE CERA',2.000,560.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1093,22,571,'0',3.000,352.00,0.00,NULL,NULL,0.00,1056.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1094,22,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1095,22,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1096,22,557,'VASO DAPPEN SILICONA',2.000,7364.00,0.00,NULL,NULL,0.00,14728.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1097,22,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',2.000,4000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1098,22,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1099,22,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1100,22,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1101,22,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1102,22,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1103,22,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1104,22,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1105,22,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1106,22,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1107,22,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1108,22,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1109,22,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1110,22,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1111,22,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1112,22,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1113,22,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1114,22,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1115,22,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1116,22,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1117,22,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1118,23,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1119,23,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1120,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1121,23,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1122,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1123,23,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1124,23,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1125,23,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1126,23,566,'TABLETA DE CERA PARA CROMO',6.000,1000.00,0.00,NULL,NULL,0.00,6000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1127,23,571,'0',10.000,352.00,0.00,NULL,NULL,0.00,3520.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1128,23,545,'BARRITA DE CERA',10.000,560.00,0.00,NULL,NULL,0.00,5600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1129,23,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1130,23,562,'MONOMERO AUTO X 100CC',4.000,4992.00,0.00,NULL,NULL,0.00,19968.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1131,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',6.000,1000.00,0.00,NULL,NULL,0.00,6000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1132,23,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1133,23,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1134,23,566,'TABLETA DE CERA PARA CROMO',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1135,23,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1136,23,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',4.000,4000.00,0.00,NULL,NULL,0.00,16000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1137,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1138,23,571,'0',4.000,352.00,0.00,NULL,NULL,0.00,1408.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1139,23,545,'BARRITA DE CERA',4.000,560.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1140,23,533,'MODELOS SUPERIOR E INFERIOR',6.000,900.00,0.00,NULL,NULL,0.00,5400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1141,23,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1142,23,533,'MODELOS SUPERIOR E INFERIOR',4.000,900.00,0.00,NULL,NULL,0.00,3600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1143,23,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',2.000,8701.00,0.00,NULL,NULL,0.00,17402.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1144,23,558,'TALLADOR LECRON',3.000,4202.00,0.00,NULL,NULL,0.00,12606.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1145,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',3.000,1000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1146,23,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',3.000,1120.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1147,23,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',3.000,4000.00,0.00,NULL,NULL,0.00,12000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1148,23,522,'SEPARADOR ACRILICO 100CC',3.000,1200.00,0.00,NULL,NULL,0.00,3600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1149,23,562,'MONOMERO AUTO X 100CC',3.000,4992.00,0.00,NULL,NULL,0.00,14976.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1150,23,545,'BARRITA DE CERA',4.000,560.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1151,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1152,23,566,'TABLETA DE CERA PARA CROMO',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1153,23,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',4.000,200.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1154,23,571,'0',4.000,352.00,0.00,NULL,NULL,0.00,1408.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1155,23,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1156,23,522,'SEPARADOR ACRILICO 100CC',2.000,1200.00,0.00,NULL,NULL,0.00,2400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1157,23,571,'0',2.000,352.00,0.00,NULL,NULL,0.00,704.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1158,23,545,'BARRITA DE CERA',2.000,560.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1159,23,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1160,23,566,'TABLETA DE CERA PARA CROMO',5.000,1000.00,0.00,NULL,NULL,0.00,5000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1161,23,562,'MONOMERO AUTO X 100CC',3.000,4992.00,0.00,NULL,NULL,0.00,14976.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1162,23,533,'MODELOS SUPERIOR E INFERIOR',4.000,900.00,0.00,NULL,NULL,0.00,3600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1163,23,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',5.000,4000.00,0.00,NULL,NULL,0.00,20000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1164,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',6.000,1000.00,0.00,NULL,NULL,0.00,6000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1165,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1166,23,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1167,23,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1168,23,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1169,23,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1170,23,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1171,23,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1172,23,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1173,23,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1174,23,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1175,23,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1176,23,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1177,23,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1178,23,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1179,23,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1180,23,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1181,23,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1182,23,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1183,24,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1184,24,533,'MODELOS SUPERIOR E INFERIOR',3.000,900.00,0.00,NULL,NULL,0.00,2700.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1185,24,562,'MONOMERO AUTO X 100CC',8.000,4992.00,0.00,NULL,NULL,0.00,39936.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1186,24,533,'MODELOS SUPERIOR E INFERIOR',1.000,900.00,0.00,NULL,NULL,0.00,900.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1187,24,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1188,24,558,'TALLADOR LECRON',2.000,4202.00,0.00,NULL,NULL,0.00,8404.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1189,24,566,'TABLETA DE CERA PARA CROMO',3.000,1000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1190,24,545,'BARRITA DE CERA',2.000,560.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1191,24,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1192,24,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',4.000,1000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1193,24,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1194,24,522,'SEPARADOR ACRILICO 100CC',3.000,1200.00,0.00,NULL,NULL,0.00,3600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1195,24,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',3.000,4000.00,0.00,NULL,NULL,0.00,12000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1196,24,562,'MONOMERO AUTO X 100CC',4.000,4992.00,0.00,NULL,NULL,0.00,19968.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1197,24,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1198,24,534,'BARBIJO POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1199,24,536,'COMPRESA POR UNIDAD',1.000,160.00,0.00,NULL,NULL,0.00,160.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1200,24,565,'COFIA DESCARTABLE POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1201,24,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1202,24,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1203,24,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1204,24,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1205,24,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1206,24,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1207,24,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1208,24,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1209,24,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1210,24,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1211,24,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1212,24,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1213,24,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1214,24,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1215,24,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1216,24,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1217,24,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1218,24,533,'MODELOS SUPERIOR E INFERIOR',2.000,900.00,0.00,NULL,NULL,0.00,1800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1219,24,560,'MECHERO DE ALCOHOL TIPO BUNSEN VIDRIO',1.000,8701.00,0.00,NULL,NULL,0.00,8701.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1220,24,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1221,24,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1222,24,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1223,24,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1224,25,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1225,25,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1226,25,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1227,25,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1228,25,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1229,25,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1230,25,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1231,25,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1232,25,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1233,25,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1234,25,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1235,25,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1236,25,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1237,25,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1238,25,545,'BARRITA DE CERA',1.000,560.00,0.00,NULL,NULL,0.00,560.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1239,25,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1240,25,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1241,25,571,'0',1.000,352.00,0.00,NULL,NULL,0.00,352.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1242,25,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1243,25,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1244,25,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1245,25,558,'TALLADOR LECRON',2.000,4202.00,0.00,NULL,NULL,0.00,8404.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1246,25,538,'GUANTES POR UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1247,25,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',4.000,200.00,0.00,NULL,NULL,0.00,800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1248,25,571,'0',5.000,352.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1249,25,522,'SEPARADOR ACRILICO 100CC',3.000,1200.00,0.00,NULL,NULL,0.00,3600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1250,25,545,'BARRITA DE CERA',5.000,560.00,0.00,NULL,NULL,0.00,2800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1251,25,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',5.000,1000.00,0.00,NULL,NULL,0.00,5000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1252,25,566,'TABLETA DE CERA PARA CROMO',5.000,1000.00,0.00,NULL,NULL,0.00,5000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1253,25,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',5.000,1000.00,0.00,NULL,NULL,0.00,5000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1254,25,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',4.000,4000.00,0.00,NULL,NULL,0.00,16000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1255,25,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1256,25,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1257,25,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1258,25,533,'MODELOS SUPERIOR E INFERIOR',8.000,900.00,0.00,NULL,NULL,0.00,7200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1259,25,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1260,25,522,'SEPARADOR ACRILICO 100CC',2.000,1200.00,0.00,NULL,NULL,0.00,2400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1261,25,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1262,25,571,'0',2.000,352.00,0.00,NULL,NULL,0.00,704.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1263,25,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',3.000,1000.00,0.00,NULL,NULL,0.00,3000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1264,25,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',1.000,200.00,0.00,NULL,NULL,0.00,200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1265,25,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1266,25,545,'BARRITA DE CERA',5.000,560.00,0.00,NULL,NULL,0.00,2800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1267,25,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',5.000,1000.00,0.00,NULL,NULL,0.00,5000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1268,25,533,'MODELOS SUPERIOR E INFERIOR',3.000,900.00,0.00,NULL,NULL,0.00,2700.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1269,25,571,'0',5.000,352.00,0.00,NULL,NULL,0.00,1760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1270,25,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',5.000,1120.00,0.00,NULL,NULL,0.00,5600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1271,25,538,'GUANTES POR UNIDAD',2.000,200.00,0.00,NULL,NULL,0.00,400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1272,25,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1273,25,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1274,25,522,'SEPARADOR ACRILICO 100CC',1.000,1200.00,0.00,NULL,NULL,0.00,1200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1275,25,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1276,25,562,'MONOMERO AUTO X 100CC',2.000,4992.00,0.00,NULL,NULL,0.00,9984.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1277,25,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1278,25,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1279,25,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1280,25,545,'BARRITA DE CERA',4.000,560.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1281,25,572,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',3.000,200.00,0.00,NULL,NULL,0.00,600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1282,25,522,'SEPARADOR ACRILICO 100CC',2.000,1200.00,0.00,NULL,NULL,0.00,2400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1283,25,571,'0',3.000,352.00,0.00,NULL,NULL,0.00,1056.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1284,25,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',6.000,1120.00,0.00,NULL,NULL,0.00,6720.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1285,26,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1286,26,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1287,26,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1288,26,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1289,26,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1290,26,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1291,26,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1292,26,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1293,26,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1294,26,563,'MODELO DENSITA',6.000,1680.00,0.00,NULL,NULL,0.00,10080.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1295,26,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1296,26,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1297,26,482,'PIGMENTO PARA ACRILICO EN POLVO 20G PARA ORTODONCIA OKI',1.000,15400.00,0.00,NULL,NULL,0.00,15400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1298,26,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1299,26,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1300,26,580,'PASTILLA METAL',2.000,5680.00,0.00,NULL,NULL,0.00,11360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1301,26,532,'REV HIL VEST',2.000,3170.00,0.00,NULL,NULL,0.00,6340.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1302,26,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,21000.00,0.00,NULL,NULL,0.00,21000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1303,26,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1304,27,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1305,27,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1306,27,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1307,27,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1308,27,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1309,28,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1310,28,561,'MACROMODELO PARA ANATOMIA DENTARIA',1.000,5501.00,0.00,NULL,NULL,0.00,5501.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1311,28,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1312,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1313,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1314,28,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1315,28,568,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1316,28,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1317,28,563,'MODELO DENSITA',4.000,1680.00,0.00,NULL,NULL,0.00,6720.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1318,28,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1319,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1320,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1321,28,553,'COMPRESA EVODENT',2.000,3000.00,0.00,NULL,NULL,0.00,6000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1322,28,559,'INSTRUMENTO PKT (PETER K THOMAS)',2.000,19008.00,0.00,NULL,NULL,0.00,38016.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1323,28,580,'PASTILLA METAL',2.000,5680.00,0.00,NULL,NULL,0.00,11360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1324,28,532,'REV HIL VEST',2.000,3170.00,0.00,NULL,NULL,0.00,6340.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1325,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',4.000,1120.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1326,28,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1327,28,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1328,28,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1329,28,563,'MODELO DENSITA',4.000,1680.00,0.00,NULL,NULL,0.00,6720.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1330,28,482,'PIGMENTO PARA ACRILICO EN POLVO 20G PARA ORTODONCIA OKI',1.000,15400.00,0.00,NULL,NULL,0.00,15400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1331,28,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1332,28,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1333,28,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1334,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1335,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1336,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1337,28,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1338,28,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1339,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1340,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1341,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1342,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1343,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1344,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1345,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1346,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1347,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1348,28,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1349,28,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1350,28,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1351,28,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1352,28,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1353,28,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1354,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1355,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1356,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1357,28,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1358,28,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1359,28,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1360,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1361,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1362,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1363,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1364,28,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1365,28,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1366,28,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1367,28,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1368,28,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1369,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1370,28,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1371,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1372,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1373,28,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1374,28,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1375,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1376,28,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1377,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1378,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1379,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1380,28,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1381,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1382,28,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1383,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1384,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1385,28,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1386,28,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1387,28,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1388,28,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1389,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1390,28,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1391,28,561,'MACROMODELO PARA ANATOMIA DENTARIA',1.000,5501.00,0.00,NULL,NULL,0.00,5501.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1392,28,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1393,28,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1394,28,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1395,28,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1396,28,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1397,28,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1398,28,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1399,29,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1400,29,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1401,29,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1402,29,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',2.000,16500.00,0.00,NULL,NULL,0.00,33000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1403,29,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1404,29,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1405,29,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1406,29,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1407,29,561,'MACROMODELO PARA ANATOMIA DENTARIA',2.000,5501.00,0.00,NULL,NULL,0.00,11002.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1408,29,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1409,29,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1410,29,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1411,29,580,'PASTILLA METAL',2.000,5680.00,0.00,NULL,NULL,0.00,11360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1412,29,532,'REV HIL VEST',2.000,3170.00,0.00,NULL,NULL,0.00,6340.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1413,29,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1414,29,575,'INST MANGO BISTURI',2.000,1832.00,0.00,NULL,NULL,0.00,3664.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1415,29,559,'INSTRUMENTO PKT (PETER K THOMAS)',2.000,19008.00,0.00,NULL,NULL,0.00,38016.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1416,29,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1417,29,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',2.000,16500.00,0.00,NULL,NULL,0.00,33000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1418,29,563,'MODELO DENSITA',4.000,1680.00,0.00,NULL,NULL,0.00,6720.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1419,29,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1420,29,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1421,29,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1422,29,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1423,29,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1424,29,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1425,29,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1426,29,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1427,29,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1428,29,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1429,29,482,'PIGMENTO PARA ACRILICO EN POLVO 20G PARA ORTODONCIA OKI',1.000,15400.00,0.00,NULL,NULL,0.00,15400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1430,29,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1431,29,561,'MACROMODELO PARA ANATOMIA DENTARIA',1.000,5501.00,0.00,NULL,NULL,0.00,5501.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1432,30,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1433,30,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1434,30,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1435,30,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1436,30,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1437,30,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1438,30,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1439,30,484,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x UNIDAD',2.000,2880.00,0.00,NULL,NULL,0.00,5760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1440,30,407,'CARTUCHOS VACIOS PARA INYECCION INDENTAL 22mm x 120mm CON TAPA',5.000,1280.00,0.00,NULL,NULL,0.00,6400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1441,30,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1442,30,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1443,30,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1444,30,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1445,30,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1446,30,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1447,30,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1448,30,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1449,30,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1450,30,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1451,30,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1452,30,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1453,30,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1454,30,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1455,30,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1456,30,482,'PIGMENTO PARA ACRILICO EN POLVO 20G PARA ORTODONCIA OKI',1.000,15400.00,0.00,NULL,NULL,0.00,15400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1457,30,532,'REV HIL VEST',2.000,3170.00,0.00,NULL,NULL,0.00,6340.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1458,30,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1459,30,482,'PIGMENTO PARA ACRILICO EN POLVO 20G PARA ORTODONCIA OKI',1.000,15400.00,0.00,NULL,NULL,0.00,15400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1460,30,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1461,30,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1462,30,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1463,30,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1464,30,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1465,30,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1466,30,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1467,30,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1468,30,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1469,30,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1470,30,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1471,30,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1472,30,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1473,30,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1474,30,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1475,30,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1476,30,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1477,31,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1478,31,532,'REV HIL VEST',2.000,3170.00,0.00,NULL,NULL,0.00,6340.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1479,31,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1480,31,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1481,31,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1482,31,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1483,31,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1484,31,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1485,31,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1486,31,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1487,31,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1488,31,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1489,31,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1490,31,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1491,31,391,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 85mm ROSA MEDIO',2.000,8925.00,0.00,NULL,NULL,0.00,17850.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1492,31,561,'MACROMODELO PARA ANATOMIA DENTARIA',2.000,5501.00,0.00,NULL,NULL,0.00,11002.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1493,31,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1494,31,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1495,31,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1496,31,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1497,31,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1498,31,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1499,31,558,'TALLADOR LECRON',1.000,4202.00,0.00,NULL,NULL,0.00,4202.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1500,31,569,'ESPATULA PARA CEMENTO DOBLE',1.000,4500.00,0.00,NULL,NULL,0.00,4500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1501,31,557,'VASO DAPPEN SILICONA',1.000,7364.00,0.00,NULL,NULL,0.00,7364.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1502,31,561,'MACROMODELO PARA ANATOMIA DENTARIA',2.000,5501.00,0.00,NULL,NULL,0.00,11002.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1503,32,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1504,32,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1505,32,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1506,32,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1507,32,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1508,32,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1509,33,541,'COMPRESAS EVODENT X50',1.000,2776.00,0.00,NULL,NULL,0.00,2776.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1510,33,531,'BARBIJOS TRIPACA X50 U.',1.000,2048.00,0.00,NULL,NULL,0.00,2048.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1511,33,530,'GUANTES LATEX ELIT',1.000,4662.00,0.00,NULL,NULL,0.00,4662.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1512,33,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',3.000,1120.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1513,33,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1514,33,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1515,33,580,'PASTILLA METAL',2.000,5680.00,0.00,NULL,NULL,0.00,11360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1516,33,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1517,33,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1518,33,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1519,33,569,'ESPATULA PARA CEMENTO DOBLE',2.000,4500.00,0.00,NULL,NULL,0.00,9000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1520,33,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1521,33,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',4.000,1120.00,0.00,NULL,NULL,0.00,4480.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1522,33,575,'INST MANGO BISTURI',2.000,1832.00,0.00,NULL,NULL,0.00,3664.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1523,33,559,'INSTRUMENTO PKT (PETER K THOMAS)',2.000,19008.00,0.00,NULL,NULL,0.00,38016.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1524,33,563,'MODELO DENSITA',4.000,1680.00,0.00,NULL,NULL,0.00,6720.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1525,33,482,'PIGMENTO PARA ACRILICO EN POLVO 20G PARA ORTODONCIA OKI',1.000,15400.00,0.00,NULL,NULL,0.00,15400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1526,33,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1527,33,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1528,33,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1529,33,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1530,33,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1531,33,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1532,33,408,'CARTUCHOS VACIOS PARA INYECCION INDENTAL 25mm x 100mm CON TAPA',5.000,1280.00,0.00,NULL,NULL,0.00,6400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1533,33,485,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un',1.000,13600.00,0.00,NULL,NULL,0.00,13600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1534,34,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1535,34,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1536,34,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1537,34,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1538,34,516,'YESO PIEDRA VERDE PESCIO x 1Kg',3.000,1920.00,0.00,NULL,NULL,0.00,5760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1539,34,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1540,34,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',20.000,1120.00,0.00,NULL,NULL,0.00,22400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1541,34,573,'ALGINATO IQ CROMATICO',1.000,16168.00,0.00,NULL,NULL,0.00,16168.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1542,34,561,'MACROMODELO PARA ANATOMIA DENTARIA',2.000,5501.00,0.00,NULL,NULL,0.00,11002.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1543,34,387,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 90mm ROSA MEDIO',3.000,9900.00,0.00,NULL,NULL,0.00,29700.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1544,34,388,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 70mm ROSA MEDIO',1.000,8925.00,0.00,NULL,NULL,0.00,8925.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1545,34,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1546,34,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1547,34,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1548,34,560,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',1.000,13000.00,0.00,NULL,NULL,0.00,13000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1549,34,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1550,34,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1551,34,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1552,35,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1553,35,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1554,35,581,'MICROMOTOR',1.000,334400.00,0.00,NULL,NULL,0.00,334400.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1555,35,513,'YESO PIEDRA AZUL PESCIO x 25Kg',1.000,43600.00,0.00,NULL,NULL,0.00,43600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1556,35,513,'YESO PIEDRA AZUL PESCIO x 25Kg',2.000,43600.00,0.00,NULL,NULL,0.00,87200.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1557,35,562,'MONOMERO AUTO X 100CC',1.000,4992.00,0.00,NULL,NULL,0.00,4992.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1558,35,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',1.000,4000.00,0.00,NULL,NULL,0.00,4000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1559,35,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1560,35,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1561,35,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1562,35,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1563,35,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',5.000,1120.00,0.00,NULL,NULL,0.00,5600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1564,35,532,'REV HIL VEST',3.000,3170.00,0.00,NULL,NULL,0.00,9510.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1565,35,580,'PASTILLA METAL',10.000,5680.00,0.00,NULL,NULL,0.00,56800.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1566,35,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1567,35,430,'GUANTES NITRILO DESCARTABLES CAJA x 100 Ud',1.000,8680.00,0.00,NULL,NULL,0.00,8680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1568,35,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1569,35,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1570,35,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1571,35,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1572,35,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1573,35,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1574,35,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1575,35,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1576,35,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1577,35,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1578,35,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1579,36,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1580,36,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1581,36,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1582,36,575,'INST MANGO BISTURI',1.000,1832.00,0.00,NULL,NULL,0.00,1832.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1583,36,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1584,36,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1585,36,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1586,36,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1587,36,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1588,36,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1589,36,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1590,36,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1591,36,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1592,36,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1593,36,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1594,36,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',1.000,1120.00,0.00,NULL,NULL,0.00,1120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1595,36,566,'TABLETA DE CERA PARA CROMO',2.000,1000.00,0.00,NULL,NULL,0.00,2000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1596,36,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1597,36,395,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 50mm ROSA MEDIO',2.000,7500.00,0.00,NULL,NULL,0.00,15000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1598,36,564,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',2.000,4000.00,0.00,NULL,NULL,0.00,8000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1599,36,573,'ALGINATO IQ CROMATICO',1.000,16168.00,0.00,NULL,NULL,0.00,16168.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1600,36,485,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un',1.000,13600.00,0.00,NULL,NULL,0.00,13600.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1601,36,563,'MODELO DENSITA',4.000,1680.00,0.00,NULL,NULL,0.00,6720.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1602,36,392,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 55mm ROSA MEDIO',1.000,7500.00,0.00,NULL,NULL,0.00,7500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1603,36,516,'YESO PIEDRA VERDE PESCIO x 1Kg',3.000,1920.00,0.00,NULL,NULL,0.00,5760.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1604,36,520,'YESO TALLER AMARILLO PESCIO x 1Kg',4.000,1760.00,0.00,NULL,NULL,0.00,7040.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1605,36,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1606,36,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1607,36,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1608,36,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1609,36,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1610,36,559,'INSTRUMENTO PKT (PETER K THOMAS)',1.000,19008.00,0.00,NULL,NULL,0.00,19008.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1611,36,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1612,36,563,'MODELO DENSITA',2.000,1680.00,0.00,NULL,NULL,0.00,3360.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1613,36,552,'DOSIFICADOR DE ALGINATO',1.000,3120.00,0.00,NULL,NULL,0.00,3120.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1614,36,532,'REV HIL VEST',1.000,3170.00,0.00,NULL,NULL,0.00,3170.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1615,36,580,'PASTILLA METAL',1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1616,36,566,'TABLETA DE CERA PARA CROMO',1.000,1000.00,0.00,NULL,NULL,0.00,1000.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1617,36,413,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',2.000,1120.00,0.00,NULL,NULL,0.00,2240.00,'2026-02-21 16:06:01','2026-02-21 16:06:01'),(1618,36,508,'SEPARADOR LIQUIDO OKI LUBE x 20cc',1.000,16500.00,0.00,NULL,NULL,0.00,16500.00,'2026-02-21 16:06:01','2026-02-21 16:06:01');
/*!40000 ALTER TABLE `sale_items_staging` ENABLE KEYS */;
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

--
-- Dumping data for table `stock_movements_staging`
--

LOCK TABLES `stock_movements_staging` WRITE;
/*!40000 ALTER TABLE `stock_movements_staging` DISABLE KEYS */;
INSERT INTO `stock_movements_staging` VALUES (1,2,1,289,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(2,2,1,277,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(3,2,1,276,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(4,2,1,249,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(5,2,1,246,'2025-04-01 00:00:00','in',25.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(6,2,1,245,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(7,2,1,244,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(8,2,1,243,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(9,2,1,242,'2025-04-01 00:00:00','in',46.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(10,2,1,241,'2025-04-01 00:00:00','in',17.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(11,2,1,240,'2025-04-01 00:00:00','in',48.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(12,2,1,239,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(13,2,1,238,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(14,2,1,237,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(15,2,1,234,'2025-04-01 00:00:00','in',25.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(16,2,1,233,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(17,2,1,232,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(18,2,1,231,'2025-04-01 00:00:00','in',15.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(19,2,1,230,'2025-04-01 00:00:00','in',15.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(20,2,1,229,'2025-04-01 00:00:00','in',26.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(21,2,1,228,'2025-04-01 00:00:00','in',40.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(22,2,1,227,'2025-04-01 00:00:00','in',24.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(23,2,1,226,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(24,2,1,182,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(25,2,1,180,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(26,2,1,169,'2025-04-01 00:00:00','in',9.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(27,2,1,170,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(28,2,1,144,'2025-04-01 00:00:00','in',12.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(29,2,1,107,'2025-04-01 00:00:00','in',24.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(30,2,1,106,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(31,2,1,103,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(32,2,1,102,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(33,2,1,101,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(34,2,1,100,'2025-04-01 00:00:00','in',25.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(35,2,1,99,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(36,2,1,98,'2025-04-01 00:00:00','in',13.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(37,2,1,97,'2025-04-01 00:00:00','in',25.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(38,2,1,96,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(39,2,1,95,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(40,2,1,94,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(41,2,1,91,'2025-04-01 00:00:00','in',28.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(42,2,1,90,'2025-04-01 00:00:00','in',10.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(43,2,1,89,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(44,2,1,88,'2025-04-01 00:00:00','in',17.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(45,2,1,87,'2025-04-01 00:00:00','in',11.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(46,2,1,86,'2025-04-01 00:00:00','in',19.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(47,2,1,85,'2025-04-01 00:00:00','in',38.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(48,2,1,84,'2025-04-01 00:00:00','in',25.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(49,2,1,83,'2025-04-01 00:00:00','in',20.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(50,2,1,34,'2025-04-01 00:00:00','in',2.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(51,2,1,27,'2025-04-01 00:00:00','in',1.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(52,2,1,26,'2025-04-01 00:00:00','in',1.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(53,2,1,25,'2025-04-01 00:00:00','in',8.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(54,2,1,24,'2025-04-01 00:00:00','in',9.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(55,2,1,22,'2025-04-01 00:00:00','in',4.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(56,2,1,21,'2025-04-01 00:00:00','in',2.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(57,2,1,19,'2025-04-01 00:00:00','in',1.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(58,2,1,18,'2025-04-01 00:00:00','in',7.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(59,2,1,17,'2025-04-01 00:00:00','in',2.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(60,2,1,16,'2025-04-01 00:00:00','in',1.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(61,2,1,15,'2025-04-01 00:00:00','in',3.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(62,2,1,14,'2025-04-01 00:00:00','in',4.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(63,2,1,10,'2025-04-01 00:00:00','in',1.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(64,2,1,8,'2025-04-01 00:00:00','in',2.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(65,2,1,7,'2025-04-01 00:00:00','in',2.000,'purchase',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(66,2,1,415,'2025-04-02 00:00:00','in',200.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(67,2,1,414,'2025-04-02 00:00:00','in',2.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(68,2,1,413,'2025-04-02 00:00:00','in',52.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(69,2,1,412,'2025-04-02 00:00:00','in',4.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(70,2,1,411,'2025-04-02 00:00:00','in',2.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(71,2,1,409,'2025-04-02 00:00:00','in',5.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(72,2,1,408,'2025-04-02 00:00:00','in',188.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(73,2,1,407,'2025-04-02 00:00:00','in',130.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(74,2,1,406,'2025-04-02 00:00:00','in',11.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(75,2,1,405,'2025-04-02 00:00:00','in',14.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(76,2,1,404,'2025-04-02 00:00:00','in',31.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(77,2,1,403,'2025-04-02 00:00:00','in',23.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(78,2,1,402,'2025-04-02 00:00:00','in',28.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(79,2,1,401,'2025-04-02 00:00:00','in',41.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(80,2,1,399,'2025-04-02 00:00:00','in',107.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(81,2,1,398,'2025-04-02 00:00:00','in',13.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(82,2,1,397,'2025-04-02 00:00:00','in',28.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(83,2,1,396,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(84,2,1,395,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(85,2,1,394,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(86,2,1,393,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(87,2,1,392,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(88,2,1,391,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(89,2,1,390,'2025-04-02 00:00:00','in',19.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(90,2,1,389,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(91,2,1,388,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(92,2,1,387,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(93,2,1,386,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(94,2,1,385,'2025-04-02 00:00:00','in',21.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(95,2,1,384,'2025-04-02 00:00:00','in',19.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(96,2,1,382,'2025-04-02 00:00:00','in',1.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(97,2,1,381,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(98,2,1,378,'2025-04-02 00:00:00','in',43.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(99,2,1,377,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(100,2,1,376,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(101,2,1,375,'2025-04-02 00:00:00','in',15.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(102,2,1,374,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(103,2,1,373,'2025-04-02 00:00:00','in',40.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(104,2,1,372,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(105,2,1,371,'2025-04-02 00:00:00','in',31.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(106,2,1,370,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(107,2,1,369,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(108,2,1,366,'2025-04-02 00:00:00','in',19.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(109,2,1,365,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(110,2,1,364,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(111,2,1,363,'2025-04-02 00:00:00','in',19.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(112,2,1,362,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(113,2,1,361,'2025-04-02 00:00:00','in',21.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(114,2,1,360,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(115,2,1,359,'2025-04-02 00:00:00','in',19.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(116,2,1,358,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(117,2,1,357,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(118,2,1,354,'2025-04-02 00:00:00','in',25.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(119,2,1,353,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(120,2,1,352,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(121,2,1,351,'2025-04-02 00:00:00','in',15.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(122,2,1,350,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(123,2,1,349,'2025-04-02 00:00:00','in',33.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(124,2,1,348,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(125,2,1,347,'2025-04-02 00:00:00','in',29.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(126,2,1,346,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(127,2,1,345,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(128,2,1,342,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(129,2,1,341,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(130,2,1,340,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(131,2,1,339,'2025-04-02 00:00:00','in',18.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(132,2,1,338,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(133,2,1,337,'2025-04-02 00:00:00','in',33.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(134,2,1,336,'2025-04-02 00:00:00','in',28.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(135,2,1,335,'2025-04-02 00:00:00','in',22.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(136,2,1,334,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(137,2,1,333,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(138,2,1,330,'2025-04-02 00:00:00','in',30.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(139,2,1,329,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(140,2,1,328,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(141,2,1,327,'2025-04-02 00:00:00','in',18.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(142,2,1,326,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(143,2,1,325,'2025-04-02 00:00:00','in',15.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(144,2,1,324,'2025-04-02 00:00:00','in',38.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(145,2,1,323,'2025-04-02 00:00:00','in',15.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(146,2,1,322,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(147,2,1,358,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(148,2,1,321,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(149,2,1,318,'2025-04-02 00:00:00','in',18.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(150,2,1,317,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(151,2,1,316,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(152,2,1,315,'2025-04-02 00:00:00','in',20.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(153,2,1,314,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(154,2,1,313,'2025-04-02 00:00:00','in',19.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(155,2,1,312,'2025-04-02 00:00:00','in',32.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(156,2,1,311,'2025-04-02 00:00:00','in',15.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(157,2,1,310,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(158,2,1,301,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(159,2,1,300,'2025-04-02 00:00:00','in',10.000,'purchase',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(160,2,1,522,'2025-04-03 00:00:00','in',50.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(161,2,1,520,'2025-04-03 00:00:00','in',6.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(162,2,1,519,'2025-04-03 00:00:00','in',3.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(163,2,1,518,'2025-04-03 00:00:00','in',9.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(164,2,1,517,'2025-04-03 00:00:00','in',2.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(165,2,1,515,'2025-04-03 00:00:00','in',3.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(166,2,1,514,'2025-04-03 00:00:00','in',14.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(167,2,1,513,'2025-04-03 00:00:00','in',2.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(168,2,1,506,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(169,2,1,505,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(170,2,1,506,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(171,2,1,503,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(172,2,1,502,'2025-04-03 00:00:00','in',5.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(173,2,1,492,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(174,2,1,488,'2025-04-03 00:00:00','in',3.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(175,2,1,487,'2025-04-03 00:00:00','in',10.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(176,2,1,486,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(177,2,1,484,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(178,2,1,482,'2025-04-03 00:00:00','in',16.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(179,2,1,481,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(180,2,1,480,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(181,2,1,479,'2025-04-03 00:00:00','in',2.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(182,2,1,478,'2025-04-03 00:00:00','in',2.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(183,2,1,476,'2025-04-03 00:00:00','in',2.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(184,2,1,473,'2025-04-03 00:00:00','in',25.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(185,2,1,472,'2025-04-03 00:00:00','in',48.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(186,2,1,471,'2025-04-03 00:00:00','in',6.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(187,2,1,470,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(188,2,1,469,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(189,2,1,463,'2025-04-03 00:00:00','in',2.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(190,2,1,459,'2025-04-03 00:00:00','in',2.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(191,2,1,458,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(192,2,1,457,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(193,2,1,453,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(194,2,1,445,'2025-04-03 00:00:00','in',3.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(195,2,1,444,'2025-04-03 00:00:00','in',3.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(196,2,1,419,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(197,2,1,437,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(198,2,1,431,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(199,2,1,430,'2025-04-03 00:00:00','in',9.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(200,2,1,429,'2025-04-03 00:00:00','in',6.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(201,2,1,428,'2025-04-03 00:00:00','in',3.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(202,2,1,427,'2025-04-03 00:00:00','in',3.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(203,2,1,425,'2025-04-03 00:00:00','in',6.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(204,2,1,424,'2025-04-03 00:00:00','in',59.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(205,2,1,421,'2025-04-03 00:00:00','in',4.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(206,2,1,420,'2025-04-03 00:00:00','in',3.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(207,2,1,418,'2025-04-03 00:00:00','in',1.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(208,2,1,417,'2025-04-03 00:00:00','in',2.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(209,2,1,416,'2025-04-03 00:00:00','in',13.000,'purchase',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(210,2,1,532,'2025-04-05 00:00:00','in',1.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(211,2,1,531,'2025-04-05 00:00:00','in',10.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(212,2,1,530,'2025-04-05 00:00:00','in',20.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(213,2,1,529,'2025-04-05 00:00:00','in',20.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(214,2,1,528,'2025-04-05 00:00:00','in',10.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(215,2,1,527,'2025-04-05 00:00:00','in',2.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(216,2,1,526,'2025-04-05 00:00:00','in',70.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(217,2,1,525,'2025-04-05 00:00:00','in',70.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(218,2,1,524,'2025-04-05 00:00:00','in',70.000,'purchase',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(219,2,1,532,'2025-04-11 00:00:00','in',25.000,'purchase',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(220,2,1,540,'2025-04-12 00:00:00','in',10.000,'purchase',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(221,2,1,533,'2025-04-12 00:00:00','in',116.000,'purchase',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(222,2,1,533,'2025-04-14 00:00:00','in',1.000,'purchase',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(223,2,1,543,'2025-04-14 00:00:00','in',6.000,'purchase',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(224,2,1,542,'2025-04-14 00:00:00','in',300.000,'purchase',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(225,2,1,541,'2025-04-14 00:00:00','in',10.000,'purchase',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(226,2,1,550,'2025-04-15 00:00:00','in',5.000,'purchase',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(227,2,1,549,'2025-04-15 00:00:00','in',10.000,'purchase',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(228,2,1,548,'2025-04-15 00:00:00','in',10.000,'purchase',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(229,2,1,547,'2025-04-15 00:00:00','in',10.000,'purchase',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(230,2,1,546,'2025-04-15 00:00:00','in',500.000,'purchase',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(231,2,1,545,'2025-04-15 00:00:00','in',200.000,'purchase',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(232,2,1,544,'2025-04-15 00:00:00','in',340.000,'purchase',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(233,2,1,552,'2025-04-21 00:00:00','in',20.000,'purchase',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(234,2,1,551,'2025-04-21 00:00:00','in',18.000,'purchase',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(235,2,1,533,'2025-05-01 00:00:00','in',4.000,'purchase',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(236,2,1,540,'2025-05-01 00:00:00','in',1.000,'purchase',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(237,2,1,554,'2025-05-03 00:00:00','in',92.000,'purchase',11,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(238,2,1,553,'2025-05-03 00:00:00','in',38.000,'purchase',11,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(239,2,1,555,'2025-05-08 00:00:00','in',50.000,'purchase',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(240,2,1,557,'2025-05-13 00:00:00','in',20.000,'purchase',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(241,2,1,556,'2025-05-13 00:00:00','in',7.000,'purchase',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(242,2,1,561,'2025-05-15 00:00:00','in',50.000,'purchase',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(243,2,1,559,'2025-05-15 00:00:00','in',10.000,'purchase',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(244,2,1,558,'2025-05-15 00:00:00','in',50.000,'purchase',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(245,2,1,563,'2025-05-16 00:00:00','in',64.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(246,2,1,562,'2025-05-16 00:00:00','in',150.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(247,2,1,533,'2025-05-16 00:00:00','in',282.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(248,2,1,522,'2025-05-16 00:00:00','in',150.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(249,2,1,9,'2025-05-16 00:00:00','in',2.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(250,2,1,545,'2025-05-16 00:00:00','in',400.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(251,2,1,411,'2025-05-16 00:00:00','in',6.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(252,2,1,412,'2025-05-16 00:00:00','in',4.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(253,2,1,10,'2025-05-16 00:00:00','in',20.000,'purchase',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(254,2,1,564,'2025-05-17 00:00:00','in',495.000,'purchase',16,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(255,2,1,533,'2025-05-17 00:00:00','in',302.000,'purchase',16,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(256,2,1,571,'2025-05-24 00:00:00','in',190.000,'purchase',17,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(257,2,1,572,'2025-06-12 00:00:00','in',200.000,'purchase',18,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(258,2,1,558,'2025-06-27 00:00:00','in',50.000,'purchase',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(259,2,1,557,'2025-06-27 00:00:00','in',7.000,'purchase',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(260,2,1,463,'2025-06-27 00:00:00','in',6.000,'purchase',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(261,2,1,575,'2025-06-27 00:00:00','in',10.000,'purchase',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(262,2,1,574,'2025-06-27 00:00:00','in',7.000,'purchase',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(263,2,1,573,'2025-06-27 00:00:00','in',10.000,'purchase',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(264,2,1,576,'2025-06-28 00:00:00','in',6.000,'purchase',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(265,2,1,579,'2025-07-05 00:00:00','in',95.000,'purchase',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(266,2,1,578,'2025-07-05 00:00:00','in',2.000,'purchase',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(267,2,1,577,'2025-07-05 00:00:00','in',2.000,'purchase',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(268,2,1,580,'2025-07-15 00:00:00','in',70.000,'purchase',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(269,2,1,559,'2025-07-30 00:00:00','in',1.000,'purchase',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(270,2,1,566,'2025-07-30 00:00:00','in',1.000,'purchase',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(271,2,1,581,'2025-08-30 00:00:00','in',4.000,'purchase',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(272,2,1,485,'2025-04-03 00:00:00','out',1.000,'sale',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(273,2,1,471,'2025-04-03 00:00:00','out',2.000,'sale',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(274,2,1,517,'2025-04-03 00:00:00','out',1.000,'sale',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(275,2,1,513,'2025-04-03 00:00:00','out',1.000,'sale',1,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(276,2,1,517,'2025-04-04 00:00:00','out',1.000,'sale',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(277,2,1,415,'2025-04-04 00:00:00','out',8.000,'sale',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(278,2,1,516,'2025-04-04 00:00:00','out',3.000,'sale',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(279,2,1,329,'2025-04-04 00:00:00','out',2.000,'sale',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(280,2,1,365,'2025-04-04 00:00:00','out',2.000,'sale',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(281,2,1,233,'2025-04-04 00:00:00','out',2.000,'sale',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(282,2,1,90,'2025-04-04 00:00:00','out',2.000,'sale',2,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(283,2,1,518,'2025-04-07 00:00:00','out',1.000,'sale',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(284,2,1,406,'2025-04-07 00:00:00','out',1.000,'sale',3,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(285,2,1,484,'2025-04-11 00:00:00','out',4.000,'sale',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(286,2,1,289,'2025-04-11 00:00:00','out',1.000,'sale',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(287,2,1,254,'2025-04-11 00:00:00','out',1.000,'sale',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(288,2,1,342,'2025-04-11 00:00:00','out',1.000,'sale',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(289,2,1,378,'2025-04-11 00:00:00','out',1.000,'sale',4,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(290,2,1,534,'2025-04-12 00:00:00','out',1.000,'sale',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(291,2,1,538,'2025-04-12 00:00:00','out',1.000,'sale',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(292,2,1,536,'2025-04-12 00:00:00','out',1.000,'sale',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(293,2,1,516,'2025-04-12 00:00:00','out',1.000,'sale',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(294,2,1,24,'2025-04-12 00:00:00','out',1.000,'sale',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(295,2,1,533,'2025-04-12 00:00:00','out',1.000,'sale',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(296,2,1,540,'2025-04-12 00:00:00','out',1.000,'sale',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(297,2,1,401,'2025-04-12 00:00:00','out',1.000,'sale',5,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(298,2,1,540,'2025-04-14 00:00:00','out',1.000,'sale',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(299,2,1,516,'2025-04-14 00:00:00','out',1.000,'sale',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(300,2,1,518,'2025-04-14 00:00:00','out',1.000,'sale',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(301,2,1,537,'2025-04-14 00:00:00','out',1.000,'sale',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(302,2,1,520,'2025-04-14 00:00:00','out',1.000,'sale',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(303,2,1,514,'2025-04-14 00:00:00','out',1.000,'sale',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(304,2,1,25,'2025-04-14 00:00:00','out',NULL,'sale',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(305,2,1,540,'2025-04-14 00:00:00','out',1.000,'sale',6,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(306,2,1,537,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(307,2,1,549,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(308,2,1,548,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(309,2,1,547,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(310,2,1,550,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(311,2,1,313,'2025-04-15 00:00:00','out',8.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(312,2,1,86,'2025-04-15 00:00:00','out',4.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(313,2,1,85,'2025-04-15 00:00:00','out',2.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(314,2,1,413,'2025-04-15 00:00:00','out',5.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(315,2,1,25,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(316,2,1,541,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(317,2,1,427,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(318,2,1,9,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(319,2,1,457,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(320,2,1,540,'2025-04-15 00:00:00','out',1.000,'sale',7,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(321,2,1,534,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(322,2,1,538,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(323,2,1,536,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(324,2,1,514,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(325,2,1,520,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(326,2,1,544,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(327,2,1,540,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(328,2,1,536,'2025-04-16 00:00:00','out',2.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(329,2,1,514,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(330,2,1,518,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(331,2,1,544,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(332,2,1,540,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(333,2,1,516,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(334,2,1,520,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(335,2,1,24,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(336,2,1,544,'2025-04-16 00:00:00','out',2.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(337,2,1,540,'2025-04-16 00:00:00','out',2.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(338,2,1,549,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(339,2,1,548,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(340,2,1,547,'2025-04-16 00:00:00','out',1.000,'sale',8,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(341,2,1,529,'2025-04-23 00:00:00','out',1.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(342,2,1,425,'2025-04-23 00:00:00','out',1.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(343,2,1,520,'2025-04-23 00:00:00','out',1.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(344,2,1,514,'2025-04-23 00:00:00','out',1.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(345,2,1,530,'2025-04-23 00:00:00','out',1.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(346,2,1,535,'2025-04-23 00:00:00','out',1.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(347,2,1,537,'2025-04-23 00:00:00','out',1.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(348,2,1,24,'2025-04-23 00:00:00','out',1.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(349,2,1,544,'2025-04-23 00:00:00','out',2.000,'sale',9,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(350,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(351,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(352,2,1,552,'2025-05-01 00:00:00','out',5.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(353,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(354,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(355,2,1,24,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(356,2,1,533,'2025-05-01 00:00:00','out',10.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(357,2,1,537,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(358,2,1,540,'2025-05-01 00:00:00','out',10.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(359,2,1,536,'2025-05-01 00:00:00','out',6.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(360,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(361,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(362,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(363,2,1,536,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(364,2,1,520,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(365,2,1,516,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(366,2,1,540,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(367,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(368,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(369,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(370,2,1,542,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(371,2,1,524,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(372,2,1,533,'2025-05-01 00:00:00','out',6.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(373,2,1,542,'2025-05-01 00:00:00','out',6.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(374,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(375,2,1,533,'2025-05-01 00:00:00','out',5.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(376,2,1,542,'2025-05-01 00:00:00','out',5.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(377,2,1,524,'2025-05-01 00:00:00','out',5.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(378,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(379,2,1,536,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(380,2,1,538,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(381,2,1,534,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(382,2,1,533,'2025-05-01 00:00:00','out',5.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(383,2,1,540,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(384,2,1,533,'2025-05-01 00:00:00','out',9.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(385,2,1,552,'2025-05-01 00:00:00','out',5.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(386,2,1,542,'2025-05-01 00:00:00','out',9.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(387,2,1,524,'2025-05-01 00:00:00','out',9.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(388,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(389,2,1,518,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(390,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(391,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(392,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(393,2,1,536,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(394,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(395,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(396,2,1,516,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(397,2,1,533,'2025-05-01 00:00:00','out',10.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(398,2,1,540,'2025-05-01 00:00:00','out',10.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(399,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(400,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(401,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(402,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(403,2,1,542,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(404,2,1,524,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(405,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(406,2,1,541,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(407,2,1,540,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(408,2,1,406,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(409,2,1,408,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(410,2,1,530,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(411,2,1,538,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(412,2,1,534,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(413,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(414,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(415,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(416,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(417,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(418,2,1,542,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(419,2,1,524,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(420,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(421,2,1,534,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(422,2,1,538,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(423,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(424,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(425,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(426,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(427,2,1,542,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(428,2,1,524,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(429,2,1,541,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(430,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(431,2,1,524,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(432,2,1,538,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(433,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(434,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(435,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(436,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(437,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(438,2,1,24,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(439,2,1,536,'2025-05-01 00:00:00','out',5.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(440,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(441,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(442,2,1,533,'2025-05-01 00:00:00','out',8.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(443,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(444,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(445,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(446,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(447,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(448,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(449,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(450,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(451,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(452,2,1,533,'2025-05-01 00:00:00','out',7.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(453,2,1,520,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(454,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(455,2,1,24,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(456,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(457,2,1,533,'2025-05-01 00:00:00','out',9.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(458,2,1,540,'2025-05-01 00:00:00','out',8.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(459,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(460,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(461,2,1,524,'2025-05-01 00:00:00','out',10.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(462,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(463,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(464,2,1,534,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(465,2,1,538,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(466,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(467,2,1,540,'2025-05-01 00:00:00','out',7.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(468,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(469,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(470,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(471,2,1,551,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(472,2,1,533,'2025-05-01 00:00:00','out',4.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(473,2,1,540,'2025-05-01 00:00:00','out',6.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(474,2,1,538,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(475,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(476,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(477,2,1,518,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(478,2,1,24,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(479,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(480,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(481,2,1,542,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(482,2,1,524,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(483,2,1,534,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(484,2,1,536,'2025-05-01 00:00:00','out',4.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(485,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(486,2,1,24,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(487,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(488,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(489,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(490,2,1,24,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(491,2,1,516,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(492,2,1,518,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(493,2,1,535,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(494,2,1,539,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(495,2,1,537,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(496,2,1,549,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(497,2,1,548,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(498,2,1,547,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(499,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(500,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(501,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(502,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(503,2,1,541,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(504,2,1,530,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(505,2,1,531,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(506,2,1,536,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(507,2,1,538,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(508,2,1,534,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(509,2,1,533,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(510,2,1,540,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(511,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(512,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(513,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(514,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(515,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(516,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(517,2,1,538,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(518,2,1,534,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(519,2,1,551,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(520,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(521,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(522,2,1,533,'2025-05-01 00:00:00','out',10.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(523,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(524,2,1,518,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(525,2,1,514,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(526,2,1,24,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(527,2,1,537,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(528,2,1,551,'2025-05-01 00:00:00','out',10.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(529,2,1,549,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(530,2,1,548,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(531,2,1,547,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(532,2,1,540,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(533,2,1,551,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(534,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(535,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(536,2,1,540,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(537,2,1,551,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(538,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(539,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(540,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(541,2,1,524,'2025-05-01 00:00:00','out',6.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(542,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(543,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(544,2,1,536,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(545,2,1,551,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(546,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(547,2,1,552,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(548,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(549,2,1,524,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(550,2,1,514,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(551,2,1,24,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(552,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(553,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(554,2,1,533,'2025-05-01 00:00:00','out',4.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(555,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(556,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(557,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(558,2,1,536,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(559,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(560,2,1,524,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(561,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(562,2,1,514,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(563,2,1,25,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(564,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(565,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(566,2,1,514,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(567,2,1,24,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(568,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(569,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(570,2,1,533,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(571,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(572,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(573,2,1,540,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(574,2,1,533,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(575,2,1,540,'2025-05-01 00:00:00','out',2.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(576,2,1,533,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(577,2,1,540,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(578,2,1,536,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(579,2,1,514,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(580,2,1,533,'2025-05-01 00:00:00','out',3.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(581,2,1,518,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(582,2,1,514,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(583,2,1,539,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(584,2,1,535,'2025-05-01 00:00:00','out',1.000,'sale',10,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(585,2,1,554,'2025-05-03 00:00:00','out',10.000,'sale',11,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(586,2,1,544,'2025-05-03 00:00:00','out',10.000,'sale',11,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(587,2,1,533,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(588,2,1,24,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(589,2,1,540,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(590,2,1,536,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(591,2,1,516,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(592,2,1,520,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(593,2,1,533,'2025-05-07 00:00:00','out',2.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(594,2,1,552,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(595,2,1,542,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(596,2,1,524,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(597,2,1,540,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(598,2,1,533,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(599,2,1,542,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(600,2,1,524,'2025-05-07 00:00:00','out',4.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(601,2,1,533,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(602,2,1,542,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(603,2,1,524,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(604,2,1,536,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(605,2,1,520,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(606,2,1,516,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(607,2,1,552,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(608,2,1,524,'2025-05-07 00:00:00','out',9.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(609,2,1,552,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(610,2,1,533,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(611,2,1,542,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(612,2,1,524,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(613,2,1,533,'2025-05-07 00:00:00','out',2.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(614,2,1,540,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(615,2,1,533,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(616,2,1,540,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(617,2,1,514,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(618,2,1,533,'2025-05-07 00:00:00','out',2.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(619,2,1,540,'2025-05-07 00:00:00','out',2.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(620,2,1,520,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(621,2,1,516,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(622,2,1,534,'2025-05-07 00:00:00','out',5.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(623,2,1,538,'2025-05-07 00:00:00','out',5.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(624,2,1,533,'2025-05-07 00:00:00','out',2.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(625,2,1,540,'2025-05-07 00:00:00','out',2.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(626,2,1,533,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(627,2,1,524,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(628,2,1,533,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(629,2,1,542,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(630,2,1,524,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(631,2,1,534,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(632,2,1,540,'2025-05-07 00:00:00','out',3.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(633,2,1,548,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(634,2,1,533,'2025-05-07 00:00:00','out',10.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(635,2,1,520,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(636,2,1,516,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(637,2,1,533,'2025-05-07 00:00:00','out',9.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(638,2,1,542,'2025-05-07 00:00:00','out',10.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(639,2,1,533,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(640,2,1,536,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(641,2,1,524,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(642,2,1,24,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(643,2,1,552,'2025-05-07 00:00:00','out',1.000,'sale',12,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(644,2,1,540,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(645,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(646,2,1,555,'2025-05-08 00:00:00','out',4.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(647,2,1,533,'2025-05-08 00:00:00','out',6.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(648,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(649,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(650,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(651,2,1,534,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(652,2,1,536,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(653,2,1,555,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(654,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(655,2,1,538,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(656,2,1,534,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(657,2,1,536,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(658,2,1,518,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(659,2,1,514,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(660,2,1,25,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(661,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(662,2,1,542,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(663,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(664,2,1,538,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(665,2,1,536,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(666,2,1,520,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(667,2,1,516,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(668,2,1,555,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(669,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(670,2,1,540,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(671,2,1,520,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(672,2,1,516,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(673,2,1,24,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(674,2,1,524,'2025-05-08 00:00:00','out',3.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(675,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(676,2,1,555,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(677,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(678,2,1,540,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(679,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(680,2,1,536,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(681,2,1,518,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(682,2,1,516,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(683,2,1,24,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(684,2,1,542,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(685,2,1,524,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(686,2,1,555,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(687,2,1,536,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(688,2,1,514,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(689,2,1,25,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(690,2,1,555,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(691,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(692,2,1,542,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(693,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(694,2,1,555,'2025-05-08 00:00:00','out',20.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(695,2,1,534,'2025-05-08 00:00:00','out',8.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(696,2,1,536,'2025-05-08 00:00:00','out',8.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(697,2,1,555,'2025-05-08 00:00:00','out',4.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(698,2,1,533,'2025-05-08 00:00:00','out',8.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(699,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(700,2,1,542,'2025-05-08 00:00:00','out',8.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(701,2,1,538,'2025-05-08 00:00:00','out',4.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(702,2,1,518,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(703,2,1,514,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(704,2,1,25,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(705,2,1,540,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(706,2,1,555,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(707,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(708,2,1,540,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(709,2,1,538,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(710,2,1,534,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(711,2,1,536,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(712,2,1,518,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(713,2,1,514,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(714,2,1,25,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(715,2,1,555,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(716,2,1,536,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(717,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(718,2,1,542,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(719,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(720,2,1,555,'2025-05-08 00:00:00','out',6.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(721,2,1,555,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(722,2,1,540,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(723,2,1,536,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(724,2,1,533,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(725,2,1,518,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(726,2,1,514,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(727,2,1,25,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(728,2,1,536,'2025-05-08 00:00:00','out',3.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(729,2,1,518,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(730,2,1,516,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(731,2,1,533,'2025-05-08 00:00:00','out',6.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(732,2,1,542,'2025-05-08 00:00:00','out',3.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(733,2,1,524,'2025-05-08 00:00:00','out',3.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(734,2,1,533,'2025-05-08 00:00:00','out',8.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(735,2,1,533,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(736,2,1,542,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(737,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(738,2,1,534,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(739,2,1,538,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(740,2,1,536,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(741,2,1,533,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(742,2,1,540,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(743,2,1,534,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(744,2,1,538,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(745,2,1,536,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(746,2,1,520,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(747,2,1,516,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(748,2,1,533,'2025-05-08 00:00:00','out',4.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(749,2,1,542,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(750,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(751,2,1,540,'2025-05-08 00:00:00','out',3.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(752,2,1,533,'2025-05-08 00:00:00','out',3.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(753,2,1,540,'2025-05-08 00:00:00','out',3.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(754,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(755,2,1,536,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(756,2,1,520,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(757,2,1,516,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(758,2,1,542,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(759,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(760,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(761,2,1,542,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(762,2,1,524,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(763,2,1,529,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(764,2,1,533,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(765,2,1,536,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(766,2,1,518,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(767,2,1,514,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(768,2,1,533,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(769,2,1,540,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(770,2,1,542,'2025-05-08 00:00:00','out',3.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(771,2,1,540,'2025-05-08 00:00:00','out',7.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(772,2,1,533,'2025-05-08 00:00:00','out',12.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(773,2,1,524,'2025-05-08 00:00:00','out',20.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(774,2,1,533,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(775,2,1,524,'2025-05-08 00:00:00','out',2.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(776,2,1,530,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(777,2,1,538,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(778,2,1,24,'2025-05-08 00:00:00','out',1.000,'sale',13,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(779,2,1,516,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(780,2,1,413,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(781,2,1,409,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(782,2,1,90,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(783,2,1,523,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(784,2,1,515,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(785,2,1,338,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(786,2,1,99,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(787,2,1,87,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(788,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(789,2,1,554,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(790,2,1,533,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(791,2,1,406,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(792,2,1,524,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(793,2,1,553,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(794,2,1,554,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(795,2,1,554,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(796,2,1,540,'2025-05-09 00:00:00','out',10.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(797,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(798,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(799,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(800,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(801,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(802,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(803,2,1,533,'2025-05-09 00:00:00','out',3.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(804,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(805,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(806,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(807,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(808,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(809,2,1,534,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(810,2,1,538,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(811,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(812,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(813,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(814,2,1,516,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(815,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(816,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(817,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(818,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(819,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(820,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(821,2,1,533,'2025-05-09 00:00:00','out',3.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(822,2,1,538,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(823,2,1,534,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(824,2,1,533,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(825,2,1,554,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(826,2,1,540,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(827,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(828,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(829,2,1,554,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(830,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(831,2,1,533,'2025-05-09 00:00:00','out',4.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(832,2,1,554,'2025-05-09 00:00:00','out',4.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(833,2,1,406,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(834,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(835,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(836,2,1,554,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(837,2,1,533,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(838,2,1,554,'2025-05-09 00:00:00','out',4.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(839,2,1,533,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(840,2,1,540,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(841,2,1,533,'2025-05-09 00:00:00','out',7.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(842,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(843,2,1,538,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(844,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(845,2,1,534,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(846,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(847,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(848,2,1,533,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(849,2,1,538,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(850,2,1,534,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(851,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(852,2,1,554,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(853,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(854,2,1,540,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(855,2,1,533,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(856,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(857,2,1,533,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(858,2,1,554,'2025-05-09 00:00:00','out',4.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(859,2,1,533,'2025-05-09 00:00:00','out',4.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(860,2,1,540,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(861,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(862,2,1,525,'2025-05-09 00:00:00','out',3.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(863,2,1,536,'2025-05-09 00:00:00','out',10.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(864,2,1,516,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(865,2,1,525,'2025-05-09 00:00:00','out',10.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(866,2,1,524,'2025-05-09 00:00:00','out',10.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(867,2,1,25,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(868,2,1,533,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(869,2,1,525,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(870,2,1,524,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(871,2,1,25,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(872,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(873,2,1,534,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(874,2,1,538,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(875,2,1,536,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(876,2,1,24,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(877,2,1,518,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(878,2,1,514,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(879,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(880,2,1,525,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(881,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(882,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(883,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(884,2,1,533,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(885,2,1,540,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(886,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(887,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(888,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(889,2,1,524,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(890,2,1,540,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(891,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(892,2,1,514,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(893,2,1,518,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(894,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(895,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(896,2,1,540,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(897,2,1,520,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(898,2,1,516,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(899,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(900,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(901,2,1,536,'2025-05-09 00:00:00','out',10.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(902,2,1,525,'2025-05-09 00:00:00','out',10.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(903,2,1,524,'2025-05-09 00:00:00','out',10.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(904,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(905,2,1,536,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(906,2,1,518,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(907,2,1,514,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(908,2,1,25,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(909,2,1,540,'2025-05-09 00:00:00','out',6.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(910,2,1,24,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(911,2,1,520,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(912,2,1,516,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(913,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(914,2,1,520,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(915,2,1,514,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(916,2,1,533,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(917,2,1,542,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(918,2,1,524,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(919,2,1,25,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(920,2,1,407,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(921,2,1,518,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(922,2,1,406,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(923,2,1,542,'2025-05-09 00:00:00','out',10.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(924,2,1,533,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(925,2,1,534,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(926,2,1,536,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(927,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(928,2,1,542,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(929,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(930,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(931,2,1,541,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(932,2,1,24,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(933,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(934,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(935,2,1,542,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(936,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(937,2,1,533,'2025-05-09 00:00:00','out',3.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(938,2,1,538,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(939,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(940,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(941,2,1,542,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(942,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(943,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(944,2,1,534,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(945,2,1,538,'2025-05-09 00:00:00','out',5.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(946,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(947,2,1,540,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(948,2,1,538,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(949,2,1,534,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(950,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(951,2,1,533,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(952,2,1,542,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(953,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(954,2,1,534,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(955,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(956,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(957,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(958,2,1,555,'2025-05-09 00:00:00','out',2.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(959,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(960,2,1,518,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(961,2,1,514,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(962,2,1,533,'2025-05-09 00:00:00','out',13.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(963,2,1,555,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(964,2,1,516,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(965,2,1,520,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(966,2,1,24,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(967,2,1,555,'2025-05-09 00:00:00','out',3.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(968,2,1,538,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(969,2,1,534,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(970,2,1,536,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(971,2,1,518,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(972,2,1,514,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(973,2,1,24,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(974,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(975,2,1,525,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(976,2,1,524,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(977,2,1,533,'2025-05-09 00:00:00','out',1.000,'sale',14,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(978,2,1,25,'2025-05-10 00:00:00','out',1.000,'sale',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(979,2,1,516,'2025-05-10 00:00:00','out',2.000,'sale',15,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(980,2,1,561,'2025-05-15 00:00:00','out',2.000,'sale',16,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(981,2,1,411,'2025-05-17 00:00:00','out',8.000,'sale',17,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(982,2,1,10,'2025-05-17 00:00:00','out',1.000,'sale',17,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(983,2,1,10,'2025-05-17 00:00:00','out',20.000,'sale',17,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(984,2,1,533,'2025-05-17 00:00:00','out',22.000,'sale',17,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(985,2,1,544,'2025-05-17 00:00:00','out',324.000,'sale',17,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(986,2,1,546,'2025-05-17 00:00:00','out',289.000,'sale',17,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(987,2,1,564,'2025-05-24 00:00:00','out',1.000,'sale',18,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(988,2,1,562,'2025-05-24 00:00:00','out',1.000,'sale',18,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(989,2,1,522,'2025-05-24 00:00:00','out',1.000,'sale',18,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(990,2,1,536,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(991,2,1,572,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(992,2,1,568,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(993,2,1,558,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(994,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(995,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(996,2,1,545,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(997,2,1,413,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(998,2,1,522,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(999,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1000,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1001,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1002,2,1,545,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1003,2,1,572,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1004,2,1,568,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1005,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1006,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1007,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1008,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1009,2,1,545,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1010,2,1,572,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1011,2,1,568,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1012,2,1,558,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1013,2,1,560,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1014,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1015,2,1,413,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1016,2,1,522,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1017,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1018,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1019,2,1,572,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1020,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1021,2,1,568,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1022,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1023,2,1,560,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1024,2,1,571,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1025,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1026,2,1,545,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1027,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1028,2,1,568,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1029,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1030,2,1,560,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1031,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1032,2,1,566,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1033,2,1,572,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1034,2,1,568,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1035,2,1,533,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1036,2,1,560,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1037,2,1,564,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1038,2,1,562,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1039,2,1,522,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1040,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1041,2,1,545,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1042,2,1,568,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1043,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1044,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1045,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1046,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1047,2,1,568,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1048,2,1,560,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1049,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1050,2,1,545,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1051,2,1,572,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1052,2,1,568,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1053,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1054,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1055,2,1,413,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1056,2,1,522,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1057,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1058,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1059,2,1,522,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1060,2,1,545,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1061,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1062,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1063,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1064,2,1,413,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1065,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1066,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1067,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1068,2,1,545,'2025-06-12 00:00:00','out',4.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1069,2,1,558,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1070,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1071,2,1,557,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1072,2,1,560,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1073,2,1,571,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1074,2,1,413,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1075,2,1,522,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1076,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1077,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1078,2,1,571,'2025-06-12 00:00:00','out',5.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1079,2,1,566,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1080,2,1,545,'2025-06-12 00:00:00','out',4.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1081,2,1,413,'2025-06-12 00:00:00','out',12.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1082,2,1,564,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1083,2,1,562,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1084,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1085,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1086,2,1,545,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1087,2,1,413,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1088,2,1,522,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1089,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1090,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1091,2,1,558,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1092,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1093,2,1,557,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1094,2,1,560,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1095,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1096,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1097,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1098,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1099,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1100,2,1,566,'2025-06-12 00:00:00','out',3.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1101,2,1,545,'2025-06-12 00:00:00','out',3.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1102,2,1,533,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1103,2,1,571,'2025-06-12 00:00:00','out',3.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1104,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1105,2,1,545,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1106,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1107,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1108,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1109,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1110,2,1,522,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1111,2,1,566,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1112,2,1,536,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1113,2,1,545,'2025-06-12 00:00:00','out',2.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1114,2,1,533,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1115,2,1,557,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1116,2,1,413,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1117,2,1,571,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1118,2,1,564,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1119,2,1,562,'2025-06-12 00:00:00','out',1.000,'sale',19,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1120,2,1,536,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1121,2,1,534,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1122,2,1,565,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1123,2,1,538,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1124,2,1,566,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1125,2,1,572,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1126,2,1,568,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1127,2,1,569,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1128,2,1,558,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1129,2,1,533,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1130,2,1,557,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1131,2,1,560,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1132,2,1,571,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1133,2,1,522,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1134,2,1,564,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1135,2,1,562,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1136,2,1,566,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1137,2,1,545,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1138,2,1,572,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1139,2,1,568,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1140,2,1,533,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1141,2,1,571,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1142,2,1,564,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1143,2,1,562,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1144,2,1,566,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1145,2,1,572,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1146,2,1,571,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1147,2,1,545,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1148,2,1,522,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1149,2,1,564,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1150,2,1,562,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1151,2,1,522,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1152,2,1,568,'2025-06-13 00:00:00','out',3.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1153,2,1,566,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1154,2,1,545,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1155,2,1,572,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1156,2,1,533,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1157,2,1,571,'2025-06-13 00:00:00','out',2.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1158,2,1,564,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1159,2,1,562,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1160,2,1,568,'2025-06-13 00:00:00','out',4.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1161,2,1,516,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1162,2,1,518,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1163,2,1,522,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1164,2,1,560,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1165,2,1,536,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1166,2,1,565,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1167,2,1,538,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1168,2,1,413,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1169,2,1,558,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1170,2,1,425,'2025-06-13 00:00:00','out',1.000,'sale',20,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1171,2,1,533,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1172,2,1,413,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1173,2,1,522,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1174,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1175,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1176,2,1,413,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1177,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1178,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1179,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1180,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1181,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1182,2,1,568,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1183,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1184,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1185,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1186,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1187,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1188,2,1,568,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1189,2,1,533,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1190,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1191,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1192,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1193,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1194,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1195,2,1,572,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1196,2,1,568,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1197,2,1,558,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1198,2,1,533,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1199,2,1,557,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1200,2,1,560,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1201,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1202,2,1,413,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1203,2,1,522,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1204,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1205,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1206,2,1,572,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1207,2,1,534,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1208,2,1,536,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1209,2,1,565,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1210,2,1,538,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1211,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1212,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1213,2,1,568,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1214,2,1,569,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1215,2,1,558,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1216,2,1,557,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1217,2,1,560,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1218,2,1,413,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1219,2,1,522,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1220,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1221,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1222,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1223,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1224,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1225,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1226,2,1,572,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1227,2,1,568,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1228,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1229,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1230,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1231,2,1,522,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1232,2,1,413,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1233,2,1,513,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1234,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1235,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1236,2,1,568,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1237,2,1,558,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1238,2,1,533,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1239,2,1,557,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1240,2,1,560,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1241,2,1,566,'2025-06-16 00:00:00','out',5.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1242,2,1,545,'2025-06-16 00:00:00','out',5.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1243,2,1,571,'2025-06-16 00:00:00','out',5.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1244,2,1,534,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1245,2,1,536,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1246,2,1,565,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1247,2,1,538,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1248,2,1,566,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1249,2,1,545,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1250,2,1,572,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1251,2,1,568,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1252,2,1,569,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1253,2,1,558,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1254,2,1,533,'2025-06-16 00:00:00','out',6.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1255,2,1,557,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1256,2,1,560,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1257,2,1,571,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1258,2,1,413,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1259,2,1,522,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1260,2,1,564,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1261,2,1,562,'2025-06-16 00:00:00','out',3.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1262,2,1,413,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1263,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1264,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1265,2,1,533,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1266,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1267,2,1,413,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1268,2,1,522,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1269,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1270,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1271,2,1,566,'2025-06-16 00:00:00','out',2.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1272,2,1,571,'2025-06-16 00:00:00','out',6.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1273,2,1,545,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1274,2,1,534,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1275,2,1,536,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1276,2,1,565,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1277,2,1,538,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1278,2,1,566,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1279,2,1,545,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1280,2,1,572,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1281,2,1,568,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1282,2,1,569,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1283,2,1,558,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1284,2,1,533,'2025-06-16 00:00:00','out',8.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1285,2,1,557,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1286,2,1,560,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1287,2,1,571,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1288,2,1,413,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1289,2,1,522,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1290,2,1,564,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1291,2,1,562,'2025-06-16 00:00:00','out',4.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1292,2,1,534,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1293,2,1,536,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1294,2,1,565,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1295,2,1,538,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1296,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1297,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1298,2,1,572,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1299,2,1,568,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1300,2,1,569,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1301,2,1,558,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1302,2,1,533,'2025-06-16 00:00:00','out',2.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1303,2,1,557,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1304,2,1,560,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1305,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1306,2,1,413,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1307,2,1,522,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1308,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1309,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1310,2,1,553,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1311,2,1,530,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1312,2,1,566,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1313,2,1,545,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1314,2,1,572,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1315,2,1,568,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1316,2,1,569,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1317,2,1,558,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1318,2,1,533,'2025-06-16 00:00:00','out',2.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1319,2,1,557,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1320,2,1,560,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1321,2,1,571,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1322,2,1,522,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1323,2,1,413,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1324,2,1,564,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1325,2,1,562,'2025-06-16 00:00:00','out',1.000,'sale',21,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1326,2,1,536,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1327,2,1,545,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1328,2,1,568,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1329,2,1,558,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1330,2,1,533,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1331,2,1,566,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1332,2,1,572,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1333,2,1,411,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1334,2,1,564,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1335,2,1,562,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1336,2,1,566,'2025-06-17 00:00:00','out',5.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1337,2,1,545,'2025-06-17 00:00:00','out',8.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1338,2,1,522,'2025-06-17 00:00:00','out',4.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1339,2,1,571,'2025-06-17 00:00:00','out',8.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1340,2,1,413,'2025-06-17 00:00:00','out',8.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1341,2,1,568,'2025-06-17 00:00:00','out',8.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1342,2,1,564,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1343,2,1,413,'2025-06-17 00:00:00','out',4.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1344,2,1,568,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1345,2,1,572,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1346,2,1,566,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1347,2,1,545,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1348,2,1,568,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1349,2,1,558,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1350,2,1,533,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1351,2,1,557,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1352,2,1,571,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1353,2,1,413,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1354,2,1,522,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1355,2,1,564,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1356,2,1,562,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1357,2,1,545,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1358,2,1,572,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1359,2,1,562,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1360,2,1,413,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1361,2,1,533,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1362,2,1,566,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1363,2,1,545,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1364,2,1,571,'2025-06-17 00:00:00','out',3.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1365,2,1,522,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1366,2,1,564,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1367,2,1,557,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1368,2,1,564,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1369,2,1,562,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1370,2,1,568,'2025-06-17 00:00:00','out',4.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1371,2,1,564,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1372,2,1,413,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1373,2,1,568,'2025-06-17 00:00:00','out',2.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1374,2,1,566,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1375,2,1,545,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1376,2,1,568,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1377,2,1,558,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1378,2,1,533,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1379,2,1,571,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1380,2,1,413,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1381,2,1,522,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1382,2,1,564,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1383,2,1,562,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1384,2,1,572,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1385,2,1,566,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1386,2,1,545,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1387,2,1,568,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1388,2,1,558,'2025-06-17 00:00:00','out',1.000,'sale',22,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1389,2,1,562,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1390,2,1,562,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1391,2,1,568,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1392,2,1,533,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1393,2,1,568,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1394,2,1,413,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1395,2,1,522,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1396,2,1,533,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1397,2,1,566,'2025-06-18 00:00:00','out',6.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1398,2,1,571,'2025-06-18 00:00:00','out',10.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1399,2,1,545,'2025-06-18 00:00:00','out',10.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1400,2,1,562,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1401,2,1,562,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1402,2,1,568,'2025-06-18 00:00:00','out',6.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1403,2,1,538,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1404,2,1,522,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1405,2,1,566,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1406,2,1,572,'2025-06-18 00:00:00','out',3.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1407,2,1,564,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1408,2,1,568,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1409,2,1,571,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1410,2,1,545,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1411,2,1,533,'2025-06-18 00:00:00','out',6.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1412,2,1,562,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1413,2,1,533,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1414,2,1,560,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1415,2,1,558,'2025-06-18 00:00:00','out',3.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1416,2,1,568,'2025-06-18 00:00:00','out',3.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1417,2,1,413,'2025-06-18 00:00:00','out',3.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1418,2,1,564,'2025-06-18 00:00:00','out',3.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1419,2,1,522,'2025-06-18 00:00:00','out',3.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1420,2,1,562,'2025-06-18 00:00:00','out',3.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1421,2,1,545,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1422,2,1,568,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1423,2,1,566,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1424,2,1,572,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1425,2,1,571,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1426,2,1,413,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1427,2,1,522,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1428,2,1,571,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1429,2,1,545,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1430,2,1,572,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1431,2,1,566,'2025-06-18 00:00:00','out',5.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1432,2,1,562,'2025-06-18 00:00:00','out',3.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1433,2,1,533,'2025-06-18 00:00:00','out',4.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1434,2,1,564,'2025-06-18 00:00:00','out',5.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1435,2,1,568,'2025-06-18 00:00:00','out',6.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1436,2,1,568,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1437,2,1,545,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1438,2,1,413,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1439,2,1,558,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1440,2,1,572,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1441,2,1,566,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1442,2,1,522,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1443,2,1,564,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1444,2,1,562,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1445,2,1,568,'2025-06-18 00:00:00','out',2.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1446,2,1,545,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1447,2,1,413,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1448,2,1,558,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1449,2,1,572,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1450,2,1,566,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1451,2,1,522,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1452,2,1,564,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1453,2,1,562,'2025-06-18 00:00:00','out',1.000,'sale',23,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1454,2,1,568,'2025-06-19 00:00:00','out',4.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1455,2,1,533,'2025-06-19 00:00:00','out',3.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1456,2,1,562,'2025-06-19 00:00:00','out',8.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1457,2,1,533,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1458,2,1,572,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1459,2,1,558,'2025-06-19 00:00:00','out',2.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1460,2,1,566,'2025-06-19 00:00:00','out',3.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1461,2,1,545,'2025-06-19 00:00:00','out',2.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1462,2,1,413,'2025-06-19 00:00:00','out',2.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1463,2,1,568,'2025-06-19 00:00:00','out',4.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1464,2,1,571,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1465,2,1,522,'2025-06-19 00:00:00','out',3.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1466,2,1,564,'2025-06-19 00:00:00','out',3.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1467,2,1,562,'2025-06-19 00:00:00','out',4.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1468,2,1,572,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1469,2,1,534,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1470,2,1,536,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1471,2,1,565,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1472,2,1,538,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1473,2,1,566,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1474,2,1,545,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1475,2,1,568,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1476,2,1,558,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1477,2,1,533,'2025-06-19 00:00:00','out',2.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1478,2,1,557,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1479,2,1,560,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1480,2,1,413,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1481,2,1,522,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1482,2,1,564,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1483,2,1,562,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1484,2,1,572,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1485,2,1,566,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1486,2,1,545,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1487,2,1,568,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1488,2,1,558,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1489,2,1,533,'2025-06-19 00:00:00','out',2.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1490,2,1,560,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1491,2,1,413,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1492,2,1,522,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1493,2,1,564,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1494,2,1,562,'2025-06-19 00:00:00','out',1.000,'sale',24,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1495,2,1,564,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1496,2,1,562,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1497,2,1,558,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1498,2,1,571,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1499,2,1,566,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1500,2,1,545,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1501,2,1,568,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1502,2,1,413,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1503,2,1,522,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1504,2,1,562,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1505,2,1,564,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1506,2,1,572,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1507,2,1,413,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1508,2,1,566,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1509,2,1,545,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1510,2,1,568,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1511,2,1,538,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1512,2,1,571,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1513,2,1,522,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1514,2,1,562,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1515,2,1,564,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1516,2,1,558,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1517,2,1,538,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1518,2,1,572,'2025-06-20 00:00:00','out',4.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1519,2,1,571,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1520,2,1,522,'2025-06-20 00:00:00','out',3.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1521,2,1,545,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1522,2,1,568,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1523,2,1,566,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1524,2,1,568,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1525,2,1,564,'2025-06-20 00:00:00','out',4.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1526,2,1,564,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1527,2,1,413,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1528,2,1,572,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1529,2,1,533,'2025-06-20 00:00:00','out',8.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1530,2,1,566,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1531,2,1,522,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1532,2,1,562,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1533,2,1,571,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1534,2,1,568,'2025-06-20 00:00:00','out',3.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1535,2,1,572,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1536,2,1,566,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1537,2,1,545,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1538,2,1,568,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1539,2,1,533,'2025-06-20 00:00:00','out',3.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1540,2,1,571,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1541,2,1,413,'2025-06-20 00:00:00','out',5.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1542,2,1,538,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1543,2,1,572,'2025-06-20 00:00:00','out',3.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1544,2,1,558,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1545,2,1,522,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1546,2,1,564,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1547,2,1,562,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1548,2,1,564,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1549,2,1,562,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1550,2,1,558,'2025-06-20 00:00:00','out',1.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1551,2,1,545,'2025-06-20 00:00:00','out',4.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1552,2,1,572,'2025-06-20 00:00:00','out',3.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1553,2,1,522,'2025-06-20 00:00:00','out',2.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1554,2,1,571,'2025-06-20 00:00:00','out',3.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1555,2,1,413,'2025-06-20 00:00:00','out',6.000,'sale',25,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1556,2,1,580,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1557,2,1,532,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1558,2,1,413,'2025-07-15 00:00:00','out',2.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1559,2,1,575,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1560,2,1,559,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1561,2,1,566,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1562,2,1,563,'2025-07-15 00:00:00','out',2.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1563,2,1,580,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1564,2,1,532,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1565,2,1,563,'2025-07-15 00:00:00','out',6.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1566,2,1,566,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1567,2,1,559,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1568,2,1,482,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1569,2,1,564,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1570,2,1,557,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1571,2,1,580,'2025-07-15 00:00:00','out',2.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1572,2,1,532,'2025-07-15 00:00:00','out',2.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1573,2,1,508,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1574,2,1,559,'2025-07-15 00:00:00','out',1.000,'sale',26,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1575,2,1,580,'2025-07-23 00:00:00','out',1.000,'sale',27,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1576,2,1,532,'2025-07-23 00:00:00','out',1.000,'sale',27,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1577,2,1,413,'2025-07-23 00:00:00','out',2.000,'sale',27,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1578,2,1,559,'2025-07-23 00:00:00','out',1.000,'sale',27,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1579,2,1,563,'2025-07-23 00:00:00','out',2.000,'sale',27,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1580,2,1,508,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1581,2,1,561,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1582,2,1,508,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1583,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1584,2,1,413,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1585,2,1,566,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1586,2,1,568,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1587,2,1,508,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1588,2,1,563,'2025-07-24 00:00:00','out',4.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1589,2,1,566,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1590,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1591,2,1,413,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1592,2,1,553,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1593,2,1,559,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1594,2,1,580,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1595,2,1,532,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1596,2,1,413,'2025-07-24 00:00:00','out',4.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1597,2,1,575,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1598,2,1,560,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1599,2,1,566,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1600,2,1,563,'2025-07-24 00:00:00','out',4.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1601,2,1,482,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1602,2,1,564,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1603,2,1,569,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1604,2,1,557,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1605,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1606,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1607,2,1,413,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1608,2,1,566,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1609,2,1,508,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1610,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1611,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1612,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1613,2,1,413,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1614,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1615,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1616,2,1,413,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1617,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1618,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1619,2,1,508,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1620,2,1,560,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1621,2,1,559,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1622,2,1,508,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1623,2,1,557,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1624,2,1,569,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1625,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1626,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1627,2,1,413,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1628,2,1,575,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1629,2,1,560,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1630,2,1,566,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1631,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1632,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1633,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1634,2,1,413,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1635,2,1,575,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1636,2,1,560,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1637,2,1,559,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1638,2,1,566,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1639,2,1,508,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1640,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1641,2,1,575,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1642,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1643,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1644,2,1,559,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1645,2,1,508,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1646,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1647,2,1,559,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1648,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1649,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1650,2,1,413,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1651,2,1,566,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1652,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1653,2,1,562,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1654,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1655,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1656,2,1,575,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1657,2,1,557,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1658,2,1,560,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1659,2,1,566,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1660,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1661,2,1,413,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1662,2,1,561,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1663,2,1,569,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1664,2,1,558,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1665,2,1,580,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1666,2,1,532,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1667,2,1,559,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1668,2,1,566,'2025-07-24 00:00:00','out',1.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1669,2,1,563,'2025-07-24 00:00:00','out',2.000,'sale',28,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1670,2,1,563,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1671,2,1,532,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1672,2,1,566,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1673,2,1,508,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1674,2,1,563,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1675,2,1,566,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1676,2,1,559,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1677,2,1,563,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1678,2,1,561,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1679,2,1,532,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1680,2,1,580,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1681,2,1,559,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1682,2,1,580,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1683,2,1,532,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1684,2,1,413,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1685,2,1,575,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1686,2,1,559,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1687,2,1,566,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1688,2,1,508,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1689,2,1,563,'2025-07-29 00:00:00','out',4.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1690,2,1,557,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1691,2,1,560,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1692,2,1,559,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1693,2,1,566,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1694,2,1,563,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1695,2,1,580,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1696,2,1,532,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1697,2,1,563,'2025-07-29 00:00:00','out',2.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1698,2,1,508,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1699,2,1,559,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1700,2,1,482,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1701,2,1,508,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1702,2,1,561,'2025-07-29 00:00:00','out',1.000,'sale',29,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1703,2,1,566,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1704,2,1,580,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1705,2,1,413,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1706,2,1,532,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1707,2,1,508,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1708,2,1,559,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1709,2,1,563,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1710,2,1,484,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1711,2,1,407,'2025-07-30 00:00:00','out',5.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1712,2,1,580,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1713,2,1,413,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1714,2,1,566,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1715,2,1,532,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1716,2,1,508,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1717,2,1,559,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1718,2,1,563,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1719,2,1,413,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1720,2,1,580,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1721,2,1,413,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1722,2,1,566,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1723,2,1,532,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1724,2,1,508,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1725,2,1,559,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1726,2,1,563,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1727,2,1,482,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1728,2,1,532,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1729,2,1,564,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1730,2,1,482,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1731,2,1,580,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1732,2,1,532,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1733,2,1,575,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1734,2,1,559,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1735,2,1,566,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1736,2,1,508,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1737,2,1,563,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1738,2,1,413,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1739,2,1,580,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1740,2,1,559,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1741,2,1,580,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1742,2,1,532,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1743,2,1,413,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1744,2,1,575,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1745,2,1,560,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1746,2,1,508,'2025-07-30 00:00:00','out',1.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1747,2,1,563,'2025-07-30 00:00:00','out',2.000,'sale',30,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1748,2,1,580,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1749,2,1,532,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1750,2,1,413,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1751,2,1,566,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1752,2,1,508,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1753,2,1,559,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1754,2,1,563,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1755,2,1,569,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1756,2,1,569,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1757,2,1,580,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1758,2,1,413,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1759,2,1,559,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1760,2,1,566,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1761,2,1,563,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1762,2,1,391,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1763,2,1,561,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1764,2,1,569,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1765,2,1,580,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1766,2,1,566,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1767,2,1,508,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1768,2,1,557,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1769,2,1,563,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1770,2,1,558,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1771,2,1,569,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1772,2,1,557,'2025-08-02 00:00:00','out',1.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1773,2,1,561,'2025-08-02 00:00:00','out',2.000,'sale',31,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1774,2,1,580,'2025-08-04 00:00:00','out',1.000,'sale',32,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1775,2,1,532,'2025-08-04 00:00:00','out',1.000,'sale',32,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1776,2,1,413,'2025-08-04 00:00:00','out',2.000,'sale',32,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1777,2,1,566,'2025-08-04 00:00:00','out',1.000,'sale',32,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1778,2,1,563,'2025-08-04 00:00:00','out',2.000,'sale',32,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1779,2,1,559,'2025-08-04 00:00:00','out',1.000,'sale',32,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1780,2,1,541,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1781,2,1,531,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1782,2,1,530,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1783,2,1,413,'2025-08-05 00:00:00','out',3.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1784,2,1,563,'2025-08-05 00:00:00','out',2.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1785,2,1,580,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1786,2,1,580,'2025-08-05 00:00:00','out',2.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1787,2,1,559,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1788,2,1,564,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1789,2,1,566,'2025-08-05 00:00:00','out',2.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1790,2,1,569,'2025-08-05 00:00:00','out',2.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1791,2,1,532,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1792,2,1,413,'2025-08-05 00:00:00','out',4.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1793,2,1,575,'2025-08-05 00:00:00','out',2.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1794,2,1,559,'2025-08-05 00:00:00','out',2.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1795,2,1,563,'2025-08-05 00:00:00','out',4.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1796,2,1,482,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1797,2,1,580,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1798,2,1,532,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1799,2,1,413,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1800,2,1,566,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1801,2,1,563,'2025-08-05 00:00:00','out',2.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1802,2,1,559,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1803,2,1,408,'2025-08-05 00:00:00','out',5.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1804,2,1,485,'2025-08-05 00:00:00','out',1.000,'sale',33,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1805,2,1,413,'2025-08-12 00:00:00','out',2.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1806,2,1,559,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1807,2,1,566,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1808,2,1,563,'2025-08-12 00:00:00','out',2.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1809,2,1,516,'2025-08-12 00:00:00','out',3.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1810,2,1,560,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1811,2,1,413,'2025-08-12 00:00:00','out',20.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1812,2,1,573,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1813,2,1,561,'2025-08-12 00:00:00','out',2.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1814,2,1,387,'2025-08-12 00:00:00','out',3.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1815,2,1,388,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1816,2,1,580,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1817,2,1,532,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1818,2,1,413,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1819,2,1,560,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1820,2,1,559,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1821,2,1,566,'2025-08-12 00:00:00','out',1.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1822,2,1,563,'2025-08-12 00:00:00','out',2.000,'sale',34,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1823,2,1,559,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1824,2,1,563,'2025-08-30 00:00:00','out',2.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1825,2,1,581,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1826,2,1,513,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1827,2,1,513,'2025-08-30 00:00:00','out',2.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1828,2,1,562,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1829,2,1,564,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1830,2,1,580,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1831,2,1,532,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1832,2,1,566,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1833,2,1,563,'2025-08-30 00:00:00','out',2.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1834,2,1,413,'2025-08-30 00:00:00','out',5.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1835,2,1,532,'2025-08-30 00:00:00','out',3.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1836,2,1,580,'2025-08-30 00:00:00','out',10.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1837,2,1,563,'2025-08-30 00:00:00','out',2.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1838,2,1,430,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1839,2,1,580,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1840,2,1,532,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1841,2,1,575,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1842,2,1,563,'2025-08-30 00:00:00','out',2.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1843,2,1,580,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1844,2,1,559,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1845,2,1,532,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1846,2,1,566,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1847,2,1,563,'2025-08-30 00:00:00','out',2.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1848,2,1,532,'2025-08-30 00:00:00','out',1.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1849,2,1,563,'2025-08-30 00:00:00','out',2.000,'sale',35,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1850,2,1,580,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1851,2,1,532,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1852,2,1,413,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1853,2,1,575,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1854,2,1,566,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1855,2,1,563,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1856,2,1,552,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1857,2,1,580,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1858,2,1,532,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1859,2,1,413,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1860,2,1,559,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1861,2,1,566,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1862,2,1,563,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1863,2,1,580,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1864,2,1,532,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1865,2,1,413,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1866,2,1,566,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1867,2,1,563,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1868,2,1,395,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1869,2,1,564,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1870,2,1,573,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1871,2,1,485,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1872,2,1,563,'2025-09-01 00:00:00','out',4.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1873,2,1,392,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1874,2,1,516,'2025-09-01 00:00:00','out',3.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1875,2,1,520,'2025-09-01 00:00:00','out',4.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1876,2,1,508,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1877,2,1,563,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1878,2,1,566,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1879,2,1,532,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1880,2,1,566,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1881,2,1,559,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1882,2,1,508,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1883,2,1,563,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1884,2,1,552,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1885,2,1,532,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1886,2,1,580,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1887,2,1,566,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1888,2,1,413,'2025-09-01 00:00:00','out',2.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01'),(1889,2,1,508,'2025-09-01 00:00:00','out',1.000,'sale',36,'Import XLSM','2026-02-21 16:06:01','2026-02-21 16:06:01');
/*!40000 ALTER TABLE `stock_movements_staging` ENABLE KEYS */;
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
-- Table structure for table `tariffs`
--

DROP TABLE IF EXISTS `tariffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tariffs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` enum('pieza','juego','kit','par','unidad') COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `base_price` decimal(15,2) NOT NULL,
  `price_a` decimal(15,2) NOT NULL,
  `price_b` decimal(15,2) NOT NULL,
  `price_cli` decimal(15,2) NOT NULL,
  `price_lab` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tariffs_company_code` (`company_id`,`code`),
  CONSTRAINT `tariffs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tariffs`
--

LOCK TABLES `tariffs` WRITE;
/*!40000 ALTER TABLE `tariffs` DISABLE KEYS */;
/*!40000 ALTER TABLE `tariffs` ENABLE KEYS */;
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

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,2,1,9,NULL,NULL,0,'2026-02-16 12:23:36','2026-02-16 12:23:36'),(2,2,1,545,NULL,NULL,0,'2026-02-16 12:51:25','2026-02-16 12:51:25');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_job_stats_by_status`
--

/*!50001 DROP VIEW IF EXISTS `v_job_stats_by_status`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`artdent_fer`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_job_stats_by_status` AS select `j`.`company_id` AS `company_id`,`j`.`status` AS `status`,count(0) AS `total_jobs`,sum(`j`.`total`) AS `total_amount`,avg(`j`.`total`) AS `avg_amount`,min(`j`.`entry_date`) AS `oldest_entry`,max(`j`.`entry_date`) AS `newest_entry` from `jobs` `j` where (`j`.`deleted_at` is null) group by `j`.`company_id`,`j`.`status` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_jobs_summary`
--

/*!50001 DROP VIEW IF EXISTS `v_jobs_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`artdent_fer`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_jobs_summary` AS select `j`.`id` AS `id`,`j`.`ticket_number` AS `ticket_number`,`j`.`work_type` AS `work_type`,`j`.`status` AS `status`,`j`.`priority` AS `priority`,`j`.`entry_date` AS `entry_date`,`j`.`promised_date` AS `promised_date`,`j`.`delivery_date` AS `delivery_date`,`j`.`total` AS `total`,`c`.`name` AS `clinic_name`,`d`.`specialty` AS `dentist_specialty`,concat(`p`.`first_name`,' ',`p`.`last_name`) AS `patient_name`,`jt`.`name` AS `job_type_name`,`u`.`name` AS `assigned_to_name`,(select count(0) from `job_teeth` where (`job_teeth`.`job_id` = `j`.`id`)) AS `teeth_count`,(case when ((`j`.`promised_date` < curdate()) and (`j`.`status` not in ('delivered','cancelled'))) then 'overdue' when ((`j`.`promised_date` = curdate()) and (`j`.`status` not in ('delivered','cancelled'))) then 'due_today' when ((`j`.`promised_date` = (curdate() + interval 1 day)) and (`j`.`status` not in ('delivered','cancelled'))) then 'due_tomorrow' else 'normal' end) AS `urgency_status` from (((((`jobs` `j` left join `clinics` `c` on((`j`.`clinic_id` = `c`.`id`))) left join `dentists` `d` on((`j`.`dentist_id` = `d`.`id`))) left join `patients` `p` on((`j`.`patient_id` = `p`.`id`))) left join `job_types` `jt` on((`j`.`job_type_id` = `jt`.`id`))) left join `users` `u` on((`j`.`assigned_to` = `u`.`id`))) where (`j`.`deleted_at` is null) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_pending_deliveries`
--

/*!50001 DROP VIEW IF EXISTS `v_pending_deliveries`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`artdent_fer`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_pending_deliveries` AS select `j`.`id` AS `job_id`,`j`.`ticket_number` AS `ticket_number`,`j`.`promised_date` AS `promised_date`,concat(`p`.`first_name`,' ',`p`.`last_name`) AS `patient_name`,`c`.`name` AS `clinic_name`,`c`.`address` AS `clinic_address`,`c`.`phone` AS `clinic_phone`,`j`.`status` AS `status`,`j`.`priority` AS `priority`,(to_days(`j`.`promised_date`) - to_days(curdate())) AS `days_until_delivery` from ((`jobs` `j` left join `patients` `p` on((`j`.`patient_id` = `p`.`id`))) left join `clinics` `c` on((`j`.`clinic_id` = `c`.`id`))) where ((`j`.`status` = 'completed') and (`j`.`deleted_at` is null)) order by `j`.`promised_date` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

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
/*!50013 DEFINER=`artdent_fer`@`localhost` SQL SECURITY DEFINER */
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

-- Dump completed on 2026-02-27 21:45:50
