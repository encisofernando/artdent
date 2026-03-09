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
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_code` (`company_id`,`code`),
  KEY `idx_branches_company` (`company_id`),
  CONSTRAINT `fk_branches_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,1,'Casa Central','CENTRAL',NULL,NULL,NULL,1,'2026-03-04 23:09:31','2026-03-04 23:09:31',NULL);
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `idx_cd_branch` (`branch_id`),
  KEY `fk_cd_company` (`company_id`),
  CONSTRAINT `fk_cd_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cd_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_drawers`
--

LOCK TABLES `cash_drawers` WRITE;
/*!40000 ALTER TABLE `cash_drawers` DISABLE KEYS */;
INSERT INTO `cash_drawers` VALUES (1,1,1,'Caja Principal',1,'2026-03-04 23:09:31','2026-03-04 23:09:31');
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
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `type` enum('in','out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `concept` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'sale, lab_payment, expense, manual',
  `reference_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cm_session` (`cash_session_id`),
  KEY `idx_cm_reference` (`reference_type`,`reference_id`),
  KEY `fk_cm_pm` (`payment_method_id`),
  CONSTRAINT `fk_cm_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cm_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cs_drawer` (`cash_drawer_id`),
  KEY `fk_cs_user` (`user_id`),
  CONSTRAINT `fk_cs_drawer` FOREIGN KEY (`cash_drawer_id`) REFERENCES `cash_drawers` (`id`),
  CONSTRAINT `fk_cs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `parent_id` bigint unsigned DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_slug` (`slug`),
  KEY `idx_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
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
  `company_id` bigint unsigned NOT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `work_date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `hours` decimal(6,2) DEFAULT '0.00' COMMENT 'Horas trabajadas (calculadas)',
  `hourly_rate_snap` decimal(12,2) DEFAULT '0.00' COMMENT 'Tarifa horaria al momento del fichaje (snapshot)',
  `amount` decimal(12,2) DEFAULT '0.00' COMMENT 'hours × hourly_rate_snap',
  `method` enum('biometric','manual','system') COLLATE utf8mb4_unicode_ci DEFAULT 'manual',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_absent` tinyint(1) DEFAULT '0' COMMENT 'Ausencia justificada/injustificada',
  `absence_reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_day` (`collaborator_id`,`work_date`) COMMENT 'Un registro por día por colaborador',
  KEY `idx_att_company_date` (`company_id`,`work_date`),
  KEY `idx_att_collaborator_date` (`collaborator_id`,`work_date`),
  CONSTRAINT `fk_att_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
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
  `company_id` bigint unsigned NOT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `concept` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Adelanto, Falta injustificada, Retención, etc.',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_discounts_collab_date` (`collaborator_id`,`date`),
  CONSTRAINT `fk_discounts_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
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
  `company_id` bigint unsigned NOT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `concept` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Horas extra, Viático, Presentismo, etc.',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_extras_collab_date` (`collaborator_id`,`date`),
  CONSTRAINT `fk_extras_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
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
  `company_id` bigint unsigned NOT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `created_by` bigint unsigned DEFAULT NULL COMMENT 'Usuario que liquidó',
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `period_from` date NOT NULL,
  `period_to` date NOT NULL,
  `days_worked` smallint DEFAULT '0',
  `hours` decimal(8,2) DEFAULT '0.00' COMMENT 'Total horas del período',
  `gross` decimal(12,2) DEFAULT '0.00' COMMENT 'hours × tarifa = bruto',
  `extras_total` decimal(12,2) DEFAULT '0.00',
  `discounts_total` decimal(12,2) DEFAULT '0.00',
  `net` decimal(12,2) DEFAULT '0.00' COMMENT 'gross + extras - discounts',
  `status` enum('draft','paid','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `paid_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_receipts_collaborator` (`collaborator_id`),
  KEY `idx_receipts_period` (`period_from`,`period_to`),
  KEY `fk_receipts_created_by` (`created_by`),
  KEY `fk_receipts_payment_method` (`payment_method_id`),
  CONSTRAINT `fk_receipts_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_receipts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_receipts_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL
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
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DNI',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `hourly_rate` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Valor hora en ARS',
  `specialty` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ceramista, Protesista, Técnico general, etc.',
  `faceio_fid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FaceIO Face ID para fichaje biométrico',
  `is_active` tinyint(1) DEFAULT '1',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_collaborator_faceio` (`faceio_fid`),
  KEY `idx_collab_company` (`company_id`),
  CONSTRAINT `fk_collab_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborators`
--

LOCK TABLES `collaborators` WRITE;
/*!40000 ALTER TABLE `collaborators` DISABLE KEYS */;
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
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Razón social',
  `fantasy_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasía',
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iva_condition` enum('responsable_inscripto','monotributista','exento','consumidor_final') COLLATE utf8mb4_unicode_ci DEFAULT 'responsable_inscripto',
  `iibb` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ingresos Brutos',
  `start_date` date DEFAULT NULL COMMENT 'Fecha inicio actividades',
  `afip_point_sale` smallint unsigned DEFAULT '1' COMMENT 'Punto de venta AFIP',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Argentina',
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'America/Argentina/Buenos_Aires',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'ARTDENT Laboratorio Dental','ARTDENT',NULL,NULL,'responsable_inscripto',NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Argentina','ARS','America/Argentina/Buenos_Aires','2026-03-04 23:09:29','2026-03-04 23:09:29');
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
  `customer_id` bigint unsigned DEFAULT NULL,
  `order_id` bigint unsigned DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cu_coupon` (`coupon_id`),
  CONSTRAINT `fk_cu_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE
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
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci DEFAULT 'percentage',
  `value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(12,2) DEFAULT NULL,
  `max_uses` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `max_uses_per_customer` int DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupon_code` (`code`)
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
-- Table structure for table `crm_clients`
--

DROP TABLE IF EXISTS `crm_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_clients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned DEFAULT NULL COMMENT 'Vinculado a cuenta e-commerce si existe',
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_crm_company` (`company_id`),
  KEY `idx_crm_customer` (`customer_id`),
  CONSTRAINT `fk_crm_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_crm_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_clients`
--

LOCK TABLES `crm_clients` WRITE;
/*!40000 ALTER TABLE `crm_clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_addresses`
--

DROP TABLE IF EXISTS `customer_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_addresses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `label` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'Principal',
  `recipient` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ca_customer` (`customer_id`),
  CONSTRAINT `fk_ca_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_addresses`
--

LOCK TABLES `customer_addresses` WRITE;
/*!40000 ALTER TABLE `customer_addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accepts_marketing` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customer_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Enciso Fernando Ariel','fernandoenciso97@gmail.com',NULL,'3704211436','40215516','B° Doña Valentina Mz 50 Casa 12','Formosa','Formosa','3600',NULL,NULL,0,1,'2026-03-06 02:55:29','2026-03-06 02:55:29',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dentist_tariff_prices`
--

DROP TABLE IF EXISTS `dentist_tariff_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dentist_tariff_prices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dentist_id` bigint unsigned NOT NULL,
  `tariff_id` bigint unsigned NOT NULL,
  `price` decimal(12,2) NOT NULL COMMENT 'Precio especial para este odontólogo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dtp` (`dentist_id`,`tariff_id`),
  KEY `fk_dtp_tariff` (`tariff_id`),
  CONSTRAINT `fk_dtp_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dtp_tariff` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dentist_tariff_prices`
--

LOCK TABLES `dentist_tariff_prices` WRITE;
/*!40000 ALTER TABLE `dentist_tariff_prices` DISABLE KEYS */;
/*!40000 ALTER TABLE `dentist_tariff_prices` ENABLE KEYS */;
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
  `code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código interno del lab',
  `type` enum('individual','clinic') COLLATE utf8mb4_unicode_ci DEFAULT 'individual',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del odontólogo o clínica',
  `contact_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Contacto en caso de clínica',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_alt` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iva_condition` enum('responsable_inscripto','monotributista','exento','consumidor_final') COLLATE utf8mb4_unicode_ci DEFAULT 'consumidor_final',
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_limit` decimal(12,2) DEFAULT NULL COMMENT 'Límite de crédito (NULL = sin límite)',
  `payment_days` smallint DEFAULT '30' COMMENT 'Días de crédito acordados',
  `is_active` tinyint(1) DEFAULT '1',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dentist_code` (`company_id`,`code`),
  KEY `idx_dentists_company` (`company_id`),
  CONSTRAINT `fk_dentists_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dentists`
--

LOCK TABLES `dentists` WRITE;
/*!40000 ALTER TABLE `dentists` DISABLE KEYS */;
INSERT INTO `dentists` VALUES (1,1,NULL,'individual','Carlos Consiglio',NULL,NULL,NULL,NULL,NULL,'Formosa','Formosa',NULL,'consumidor_final',NULL,2000000.00,15,1,NULL,'2026-03-07 03:01:12','2026-03-07 03:01:12',NULL);
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
  `product_id` bigint unsigned DEFAULT NULL,
  `variant_id` bigint unsigned DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_eoi_order` (`order_id`),
  KEY `fk_eoi_product` (`product_id`),
  CONSTRAINT `fk_eoi_order` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eoi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
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
  `customer_id` bigint unsigned DEFAULT NULL,
  `coupon_id` bigint unsigned DEFAULT NULL,
  `shipping_method_id` bigint unsigned DEFAULT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `shipping_cost` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `shipping_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_postal` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_notes` text COLLATE utf8mb4_unicode_ci,
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_number` (`order_number`),
  KEY `idx_eorders_customer` (`customer_id`),
  KEY `idx_eorders_status` (`status`),
  KEY `fk_eorders_company` (`company_id`),
  KEY `fk_eorders_coupon` (`coupon_id`),
  CONSTRAINT `fk_eorders_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_eorders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_eorders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
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
  `user_id` bigint unsigned NOT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Cargo',
  `salary` decimal(12,2) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employee_user` (`user_id`),
  KEY `idx_employees_branch` (`branch_id`),
  CONSTRAINT `fk_employees_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,1,1,NULL,'Administrador del Sistema',NULL,'2026-03-04',NULL,NULL,'2026-03-04 23:09:31','2026-03-04 23:09:31',NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_categories`
--

DROP TABLE IF EXISTS `expense_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Alquiler, Servicios, Insumos, Sueldos, etc.',
  `type` enum('expense','income') COLLATE utf8mb4_unicode_ci DEFAULT 'expense',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_categories`
--

LOCK TABLES `expense_categories` WRITE;
/*!40000 ALTER TABLE `expense_categories` DISABLE KEYS */;
INSERT INTO `expense_categories` VALUES (1,'Alquiler','expense',NULL),(2,'Servicios (luz, agua, gas)','expense',NULL),(3,'Sueldos y jornales','expense',NULL),(4,'Insumos de laboratorio','expense',NULL),(5,'Insumos de oficina','expense',NULL),(6,'Mantenimiento','expense',NULL),(7,'Impuestos y tasas','expense',NULL),(8,'Otros gastos','expense',NULL),(9,'Otros ingresos','income',NULL);
/*!40000 ALTER TABLE `expense_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `branch_id` bigint unsigned DEFAULT NULL,
  `expense_category_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'Quién registró',
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `vendor_id` bigint unsigned DEFAULT NULL COMMENT 'Proveedor al que se le pagó',
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'N° factura, remito, etc.',
  `expense_date` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_expenses_company` (`company_id`),
  KEY `idx_expenses_date` (`expense_date`),
  KEY `fk_expenses_category` (`expense_category_id`),
  KEY `fk_expenses_vendor` (`vendor_id`),
  KEY `fk_expenses_pm` (`payment_method_id`),
  CONSTRAINT `fk_expenses_category` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_expenses_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `income_records`
--

DROP TABLE IF EXISTS `income_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `expense_category_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `income_date` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_income_company` (`company_id`),
  CONSTRAINT `fk_income_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `income_records`
--

LOCK TABLES `income_records` WRITE;
/*!40000 ALTER TABLE `income_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `income_records` ENABLE KEYS */;
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
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,3) NOT NULL DEFAULT '1.000',
  `unit_price` decimal(12,2) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT '21.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ii_invoice` (`invoice_id`),
  CONSTRAINT `fk_ii_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Factura A, Factura B, Factura C, ND A, NC A, etc.',
  `afip_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código AFIP (ej: 001, 006, 011)',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_types`
--

LOCK TABLES `invoice_types` WRITE;
/*!40000 ALTER TABLE `invoice_types` DISABLE KEYS */;
INSERT INTO `invoice_types` VALUES (1,'Factura A','001',1),(2,'Nota de Débito A','002',1),(3,'Nota de Crédito A','003',1),(4,'Factura B','006',1),(5,'Nota de Débito B','007',1),(6,'Nota de Crédito B','008',1),(7,'Factura C','011',1),(8,'Nota de Débito C','012',1),(9,'Nota de Crédito C','013',1),(10,'Recibo A','004',1),(11,'Recibo B','009',1);
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
  `invoice_type_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'Quién emitió',
  `reference_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'sale, lab_billing',
  `reference_id` bigint unsigned DEFAULT NULL,
  `recipient_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_cuit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_iva` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `point_sale` smallint unsigned DEFAULT '1',
  `number` int unsigned DEFAULT NULL,
  `cae` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cae_expiry` date DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `status` enum('draft','issued','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `issued_at` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoice_number` (`company_id`,`invoice_type_id`,`point_sale`,`number`),
  KEY `idx_invoices_reference` (`reference_type`,`reference_id`),
  KEY `fk_invoices_type` (`invoice_type_id`),
  CONSTRAINT `fk_invoices_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_invoices_type` FOREIGN KEY (`invoice_type_id`) REFERENCES `invoice_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `user_id` bigint unsigned DEFAULT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size_bytes` int unsigned DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ja_job` (`job_id`),
  CONSTRAINT `fk_ja_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
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
-- Table structure for table `job_collaborators`
--

DROP TABLE IF EXISTS `job_collaborators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_collaborators` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `collaborator_id` bigint unsigned NOT NULL,
  `assigned_by` bigint unsigned DEFAULT NULL COMMENT 'Usuario que asignó',
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Rol en este trabajo: ceramista, montaje, etc.',
  `assigned_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL COMMENT 'Cuando terminó su parte',
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_job_collaborator` (`job_id`,`collaborator_id`),
  KEY `idx_jc_collaborator` (`collaborator_id`),
  KEY `idx_jc_job` (`job_id`),
  KEY `fk_jc_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_jc_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jc_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jc_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_collaborators`
--

LOCK TABLES `job_collaborators` WRITE;
/*!40000 ALTER TABLE `job_collaborators` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_collaborators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_items`
--

DROP TABLE IF EXISTS `job_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `tariff_id` bigint unsigned DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(8,3) NOT NULL DEFAULT '1.000',
  `unit_price` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ji_job` (`job_id`),
  KEY `fk_ji_tariff` (`tariff_id`),
  CONSTRAINT `fk_ji_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ji_tariff` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_items`
--

LOCK TABLES `job_items` WRITE;
/*!40000 ALTER TABLE `job_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_items` ENABLE KEYS */;
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
  `user_id` bigint unsigned DEFAULT NULL,
  `status` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jsh_job` (`job_id`),
  CONSTRAINT `fk_jsh_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
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
  `tooth` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Número FDI: 11, 12, 21... o 11-16 para rango',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jt_job` (`job_id`),
  CONSTRAINT `fk_jt_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
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
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#6366f1' COMMENT 'Color hex para UI',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jt_company` (`company_id`),
  CONSTRAINT `fk_jt_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_types`
--

LOCK TABLES `job_types` WRITE;
/*!40000 ALTER TABLE `job_types` DISABLE KEYS */;
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
  `dentist_id` bigint unsigned NOT NULL,
  `patient_id` bigint unsigned DEFAULT NULL,
  `job_type_id` bigint unsigned DEFAULT NULL,
  `assigned_user_id` bigint unsigned DEFAULT NULL COMMENT 'Técnico asignado',
  `job_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('received','in_progress','quality_check','ready','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'received',
  `priority` enum('normal','urgent','rush') COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `description` text COLLATE utf8mb4_unicode_ci,
  `clinical_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Indicaciones clínicas del odontólogo',
  `shade` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Color dental: A1, A2, B3, etc.',
  `received_at` date DEFAULT NULL,
  `due_date` date DEFAULT NULL COMMENT 'Fecha de entrega comprometida',
  `delivered_at` datetime DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `billed` tinyint(1) DEFAULT '0' COMMENT 'Si ya fue incluido en factura',
  `invoice_id` bigint unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_job_number` (`company_id`,`job_number`),
  KEY `idx_jobs_dentist` (`dentist_id`),
  KEY `idx_jobs_patient` (`patient_id`),
  KEY `idx_jobs_status` (`status`),
  KEY `idx_jobs_due` (`due_date`),
  KEY `fk_jobs_type` (`job_type_id`),
  KEY `fk_jobs_user` (`assigned_user_id`),
  CONSTRAINT `fk_jobs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_jobs_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`),
  CONSTRAINT `fk_jobs_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_user` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
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
-- Table structure for table `lab_account_moves`
--

DROP TABLE IF EXISTS `lab_account_moves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_account_moves` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lab_account_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'Quién registró',
  `type` enum('charge','payment','adjustment','note_credit','note_debit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL COMMENT 'Siempre positivo; el tipo define si suma o resta',
  `balance_after` decimal(14,2) DEFAULT NULL COMMENT 'Saldo resultante para trazabilidad',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'job, invoice, manual',
  `reference_id` bigint unsigned DEFAULT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `move_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lam_account` (`lab_account_id`),
  KEY `idx_lam_date` (`move_date`),
  KEY `idx_lam_reference` (`reference_type`,`reference_id`),
  KEY `fk_lam_pm` (`payment_method_id`),
  KEY `fk_lam_user` (`user_id`),
  CONSTRAINT `fk_lam_account` FOREIGN KEY (`lab_account_id`) REFERENCES `lab_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lam_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lam_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_account_moves`
--

LOCK TABLES `lab_account_moves` WRITE;
/*!40000 ALTER TABLE `lab_account_moves` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_account_moves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_accounts`
--

DROP TABLE IF EXISTS `lab_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dentist_id` bigint unsigned NOT NULL,
  `balance` decimal(14,2) NOT NULL DEFAULT '0.00' COMMENT 'Negativo = debe, Positivo = saldo a favor',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lab_account_dentist` (`dentist_id`),
  CONSTRAINT `fk_la_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_accounts`
--

LOCK TABLES `lab_accounts` WRITE;
/*!40000 ALTER TABLE `lab_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_accounts` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
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
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_newsletter_email` (`email`)
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
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint unsigned NOT NULL,
  `data` json NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_notifiable` (`notifiable_type`,`notifiable_id`)
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
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES ('admin@artdent.com.ar','$2y$12$R2fxuMIDkfe6s83oIKFMq.0wfv07j7e9M05jNsHER6gVc06w3JXpC','2026-03-05 03:26:44');
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
  `dentist_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('M','F','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patients_dentist` (`dentist_id`),
  CONSTRAINT `fk_patients_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE CASCADE
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Efectivo, Tarjeta Débito, Transferencia, MercadoPago, etc.',
  `type` enum('cash','card_debit','card_credit','transfer','mp','check','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `surcharge_pct` decimal(5,2) DEFAULT '0.00' COMMENT 'Recargo % (ej: tarjeta crédito)',
  `is_active` tinyint(1) DEFAULT '1',
  `applies_to` set('ecommerce','pos','lab') COLLATE utf8mb4_unicode_ci DEFAULT 'ecommerce,pos,lab',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'Efectivo','cash',0.00,1,'ecommerce,pos,lab',NULL,NULL),(2,'Transferencia Bancaria','transfer',0.00,1,'ecommerce,pos,lab',NULL,NULL),(3,'Débito','card_debit',0.00,1,'pos,lab',NULL,NULL),(4,'Crédito 1 cuota','card_credit',0.00,1,'pos,lab',NULL,NULL),(5,'MercadoPago','mp',0.00,1,'ecommerce,pos',NULL,NULL),(6,'Cheque','check',0.00,1,'lab',NULL,NULL);
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pat_token` (`token`),
  KEY `idx_pat_tokenable` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attribute_values`
--

DROP TABLE IF EXISTS `product_attribute_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_attribute_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `attribute_id` bigint unsigned NOT NULL,
  `value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Rojo, XL, Titanio',
  PRIMARY KEY (`id`),
  KEY `idx_pav_attribute` (`attribute_id`),
  CONSTRAINT `fk_pav_attribute` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attribute_values`
--

LOCK TABLES `product_attribute_values` WRITE;
/*!40000 ALTER TABLE `product_attribute_values` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_attribute_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attributes`
--

DROP TABLE IF EXISTS `product_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_attributes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Color, Talle, Material',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attr_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attributes`
--

LOCK TABLES `product_attributes` WRITE;
/*!40000 ALTER TABLE `product_attributes` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned DEFAULT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_cover` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pimages_product` (`product_id`),
  CONSTRAINT `fk_pimages_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
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
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL COMMENT 'NULL = usa precio del producto padre',
  `cost_price` decimal(12,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pvariants_product` (`product_id`),
  CONSTRAINT `fk_pvariants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
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
  `vendor_id` bigint unsigned DEFAULT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `tax_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cost_price` decimal(12,2) DEFAULT '0.00',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Precio de venta sin IVA',
  `compare_price` decimal(12,2) DEFAULT NULL COMMENT 'Precio tachado original',
  `has_variants` tinyint(1) DEFAULT '0',
  `track_stock` tinyint(1) DEFAULT '1',
  `weight` decimal(8,3) DEFAULT NULL COMMENT 'kg',
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_desc` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT '21.00' COMMENT 'Alícuota IVA snapshot al crear/actualizar producto',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_slug` (`slug`),
  KEY `idx_products_company` (`company_id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_vendor` (`vendor_id`),
  KEY `idx_products_sku` (`sku`),
  KEY `fk_products_tax` (`tax_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_products_tax` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `variant_id` bigint unsigned DEFAULT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit_cost` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `received_qty` decimal(12,3) DEFAULT '0.000',
  PRIMARY KEY (`id`),
  KEY `idx_pi_purchase` (`purchase_id`),
  KEY `fk_pi_product` (`product_id`),
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_pi_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `vendor_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'Quién registró',
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'N° remito / factura proveedor',
  `status` enum('pending','received','partial','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `purchased_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_purchases_vendor` (`vendor_id`),
  KEY `fk_purchases_company` (`company_id`),
  KEY `fk_purchases_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_purchases_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_purchases_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `fk_purchases_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `order_id` bigint unsigned DEFAULT NULL,
  `rating` tinyint NOT NULL DEFAULT '5',
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product` (`product_id`),
  KEY `fk_reviews_customer` (`customer_id`),
  CONSTRAINT `fk_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
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
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_ru_role` (`role_id`),
  CONSTRAINT `fk_ru_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ru_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'admin, lab_operator, seller, ecommerce_manager, etc.',
  `display_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Administrador',NULL,'2026-03-02 21:02:25',NULL),(2,'lab_operator','Operario de Lab',NULL,'2026-03-02 21:02:25',NULL),(3,'lab_manager','Jefe de Laboratorio',NULL,'2026-03-02 21:02:25',NULL),(4,'seller','Vendedor POS',NULL,'2026-03-02 21:02:25',NULL),(5,'ecommerce_manager','Gestor E-Commerce',NULL,'2026-03-02 21:02:25',NULL);
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
  `product_id` bigint unsigned DEFAULT NULL,
  `variant_id` bigint unsigned DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_si_sale` (`sale_id`),
  KEY `fk_si_product` (`product_id`),
  CONSTRAINT `fk_si_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_si_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_payments`
--

DROP TABLE IF EXISTS `sale_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sale_id` bigint unsigned NOT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'N° comprobante, last 4 dígitos tarjeta, etc.',
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sp_sale` (`sale_id`),
  KEY `fk_sp_pm` (`payment_method_id`),
  CONSTRAINT `fk_sp_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sp_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_payments`
--

LOCK TABLES `sale_payments` WRITE;
/*!40000 ALTER TABLE `sale_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `sale_payments` ENABLE KEYS */;
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
  `cash_session_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'Vendedor',
  `crm_client_id` bigint unsigned DEFAULT NULL,
  `invoice_id` bigint unsigned DEFAULT NULL COMMENT 'Factura AFIP si fue facturada',
  `sale_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_type` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'X' COMMENT 'Tipo de comprobante: X, A, B, C',
  `status` enum('draft','completed','cancelled','refunded','confirmed','paid','invoiced') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `paid_amount` decimal(12,2) DEFAULT '0.00',
  `change_amount` decimal(12,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `sold_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sales_company` (`company_id`),
  KEY `idx_sales_session` (`cash_session_id`),
  KEY `idx_sales_client` (`crm_client_id`),
  KEY `fk_sales_branch` (`branch_id`),
  CONSTRAINT `fk_sales_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sales_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_sales_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('jVaYtgmCk8WVBoIqaAU617Va87nvda4sX29XmzsX',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoidUV0RTJGcmRRMUN2QXhLdnNETVByd2JjOGRndllobXV4SHg0UlNVUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYWxlcy9jcmVhdGUiO3M6NToicm91dGUiO3M6MTI6InNhbGVzLmNyZWF0ZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==',1773014211);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipments`
--

DROP TABLE IF EXISTS `shipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `shipping_method_id` bigint unsigned DEFAULT NULL,
  `tracking_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('preparing','shipped','in_transit','delivered','returned') COLLATE utf8mb4_unicode_ci DEFAULT 'preparing',
  `carrier` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_shipments_order` (`order_id`),
  KEY `fk_shipments_method` (`shipping_method_id`),
  CONSTRAINT `fk_shipments_method` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_shipments_order` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipments`
--

LOCK TABLES `shipments` WRITE;
/*!40000 ALTER TABLE `shipments` DISABLE KEYS */;
/*!40000 ALTER TABLE `shipments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_methods`
--

DROP TABLE IF EXISTS `shipping_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_methods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Correo Argentino, OCA, Andreani, Retiro en Tienda',
  `type` enum('free','flat','calculated','pickup') COLLATE utf8mb4_unicode_ci DEFAULT 'flat',
  `base_cost` decimal(10,2) DEFAULT '0.00',
  `free_above` decimal(12,2) DEFAULT NULL COMMENT 'Envío gratis si pedido supera este monto',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_methods`
--

LOCK TABLES `shipping_methods` WRITE;
/*!40000 ALTER TABLE `shipping_methods` DISABLE KEYS */;
/*!40000 ALTER TABLE `shipping_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned DEFAULT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `type` enum('in','out','adjustment','transfer_in','transfer_out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `stock_before` decimal(12,3) DEFAULT NULL,
  `stock_after` decimal(12,3) DEFAULT NULL,
  `reference_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'purchase, ecommerce_order, sale, manual',
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sm_product` (`product_id`,`warehouse_id`),
  KEY `idx_sm_reference` (`reference_type`,`reference_id`),
  KEY `fk_sm_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_sm_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_sm_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `product_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned DEFAULT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `quantity` decimal(12,3) DEFAULT '0.000',
  `min_quantity` decimal(12,3) DEFAULT '0.000' COMMENT 'Stock mínimo para alerta',
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stock` (`product_id`,`variant_id`,`warehouse_id`),
  KEY `idx_stocks_warehouse` (`warehouse_id`),
  KEY `fk_stocks_variant` (`variant_id`),
  CONSTRAINT `fk_stocks_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stocks_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stocks_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tariff_costs`
--

DROP TABLE IF EXISTS `tariff_costs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tariff_costs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tariff_id` bigint unsigned NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'material',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `quantity` decimal(10,3) NOT NULL DEFAULT '1.000',
  `margin_pct` decimal(5,2) NOT NULL DEFAULT '30.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tariff_costs_tariff_id_foreign` (`tariff_id`),
  CONSTRAINT `tariff_costs_tariff_id_foreign` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tariff_costs`
--

LOCK TABLES `tariff_costs` WRITE;
/*!40000 ALTER TABLE `tariff_costs` DISABLE KEYS */;
/*!40000 ALTER TABLE `tariff_costs` ENABLE KEYS */;
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
  `code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Corona Zirconio, Prótesis Total, Carilla, etc.',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Agrupación: Fija, Removible, Ortodoncia, etc.',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `unit` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'unidad' COMMENT 'unidad, pieza, par, etc.',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tariffs_company` (`company_id`),
  CONSTRAINT `fk_tariffs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'IVA 21%, IVA 10.5%, Exento, etc.',
  `rate` decimal(5,2) NOT NULL DEFAULT '21.00',
  `afip_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código AFIP para facturación electrónica',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taxes`
--

LOCK TABLES `taxes` WRITE;
/*!40000 ALTER TABLE `taxes` DISABLE KEYS */;
INSERT INTO `taxes` VALUES (1,'IVA 21%',21.00,'5',1,NULL,NULL),(2,'IVA 10.5%',10.50,'4',1,NULL,NULL),(3,'IVA 27%',27.00,'6',1,NULL,NULL),(4,'Exento',0.00,'2',1,NULL,NULL),(5,'No Gravado',0.00,'1',1,NULL,NULL);
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
  `branch_id` bigint unsigned DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_company` (`company_id`),
  CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,1,'Administrador','admin@artdent.com.ar','$2y$12$/AcFbv9wIrcjfCXm/lRA0eB5uMejJWcQRf6mjpU9iCzTYwVRd26ny',NULL,NULL,1,NULL,'rf3NI6FatANBQxBO9PM5N0Hadlzq5KgBoIzYAgIMfxXzckfqAQceJK3bhurA',NULL,'2026-03-04 23:09:31','2026-03-05 03:25:34',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant_attribute_values`
--

DROP TABLE IF EXISTS `variant_attribute_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant_attribute_values` (
  `variant_id` bigint unsigned NOT NULL,
  `attribute_value_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`variant_id`,`attribute_value_id`),
  KEY `fk_vav_value` (`attribute_value_id`),
  CONSTRAINT `fk_vav_value` FOREIGN KEY (`attribute_value_id`) REFERENCES `product_attribute_values` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vav_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant_attribute_values`
--

LOCK TABLES `variant_attribute_values` WRITE;
/*!40000 ALTER TABLE `variant_attribute_values` DISABLE KEYS */;
/*!40000 ALTER TABLE `variant_attribute_values` ENABLE KEYS */;
UNLOCK TABLES;

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
  `contact_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iva_condition` enum('responsable_inscripto','monotributista','exento') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_vendors_company` (`company_id`),
  CONSTRAINT `fk_vendors_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_warehouses_company` (`company_id`),
  CONSTRAINT `fk_warehouses_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,1,1,'Depósito Principal','DEP-01',NULL,1,'2026-03-04 23:09:31','2026-03-04 23:09:31');
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
  `customer_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist` (`customer_id`,`product_id`),
  KEY `fk_wl_product` (`product_id`),
  CONSTRAINT `fk_wl_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wl_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-08 21:38:11
