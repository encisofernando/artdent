CREATE DATABASE  IF NOT EXISTS `artdent_dev` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `artdent_dev`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: artdent
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `cache` VALUES ('laravel-cache-ventas@artdent.com.ar|127.0.0.1','i:1;',1773594143),('laravel-cache-ventas@artdent.com.ar|127.0.0.1:timer','i:1773594143;',1773594143);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `type` enum('in','out') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `concept` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'sale, lab_payment, expense, manual',
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
  `status` enum('open','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_slug` (`slug`),
  KEY `idx_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'ACRILICOS','acrilicos',NULL,NULL,0,1,'2026-03-16 21:13:43','2026-03-16 21:13:43'),(2,1,'AUTOCURABLE','autocurable',NULL,NULL,0,1,'2026-03-16 21:13:57','2026-03-16 21:13:57'),(3,1,'TERMOCURABLE','termocurable',NULL,NULL,0,1,'2026-03-16 21:14:15','2026-03-16 21:14:15');
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
  `method` enum('biometric','manual','system','webauthn') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'manual',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_info` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_absent` tinyint(1) DEFAULT '0' COMMENT 'Ausencia justificada/injustificada',
  `absence_reason` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `photo_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_day` (`collaborator_id`,`work_date`) COMMENT 'Un registro por día por colaborador',
  KEY `idx_att_company_date` (`company_id`,`work_date`),
  KEY `idx_att_collaborator_date` (`collaborator_id`,`work_date`),
  CONSTRAINT `fk_att_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_attendances`
--

LOCK TABLES `collaborator_attendances` WRITE;
/*!40000 ALTER TABLE `collaborator_attendances` DISABLE KEYS */;
INSERT INTO `collaborator_attendances` VALUES (1,1,1,'2026-03-10','08:00:00','14:45:00',-6.75,5500.00,-37125.00,'manual',NULL,NULL,0,NULL,NULL,NULL,'2026-03-11 14:13:42','2026-03-11 14:13:42');
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
  `concept` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Adelanto, Falta injustificada, Retención, etc.',
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
  `concept` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Horas extra, Viático, Presentismo, etc.',
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
  `status` enum('draft','paid','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `paid_at` datetime DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_receipts`
--

LOCK TABLES `collaborator_receipts` WRITE;
/*!40000 ALTER TABLE `collaborator_receipts` DISABLE KEYS */;
INSERT INTO `collaborator_receipts` VALUES (1,1,1,1,NULL,'2026-03-09','2026-03-14',1,-6.75,-37125.00,0.00,0.00,-37125.00,'draft',NULL,NULL,'2026-03-11 14:14:04','2026-03-11 14:14:04');
/*!40000 ALTER TABLE `collaborator_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaborator_webauthn_credentials`
--

DROP TABLE IF EXISTS `collaborator_webauthn_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaborator_webauthn_credentials` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `collaborator_id` bigint unsigned NOT NULL,
  `credential_id` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_key` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sign_count` bigint unsigned NOT NULL DEFAULT '0',
  `device_label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_handle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collaborator_webauthn_credentials_collaborator_id_foreign` (`collaborator_id`),
  CONSTRAINT `collaborator_webauthn_credentials_collaborator_id_foreign` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_webauthn_credentials`
--

LOCK TABLES `collaborator_webauthn_credentials` WRITE;
/*!40000 ALTER TABLE `collaborator_webauthn_credentials` DISABLE KEYS */;
/*!40000 ALTER TABLE `collaborator_webauthn_credentials` ENABLE KEYS */;
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DNI',
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `hourly_rate` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Valor hora en ARS',
  `specialty` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ceramista, Protesista, Técnico general, etc.',
  `faceio_fid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FaceIO Face ID para fichaje biométrico',
  `is_active` tinyint(1) DEFAULT '1',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_collaborator_faceio` (`faceio_fid`),
  KEY `idx_collab_company` (`company_id`),
  CONSTRAINT `fk_collab_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborators`
--

LOCK TABLES `collaborators` WRITE;
/*!40000 ALTER TABLE `collaborators` DISABLE KEYS */;
INSERT INTO `collaborators` VALUES (1,1,'Enciso Fernando Ariel','40215516','fernandoenciso97@gmail.com','3704211436','B° Doña Valentina Mz 50 Casa 12','1997-07-12',5500.00,'Protesis Fija Digital',NULL,1,NULL,'2026-03-11 02:25:59','2026-03-11 02:25:59',NULL);
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Razón social',
  `fantasy_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasía',
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iva_condition` enum('responsable_inscripto','monotributista','exento','consumidor_final') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'responsable_inscripto',
  `iibb` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ingresos Brutos',
  `start_date` date DEFAULT NULL COMMENT 'Fecha inicio actividades',
  `afip_point_sale` smallint unsigned DEFAULT '1' COMMENT 'Punto de venta AFIP',
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Argentina',
  `currency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ARS',
  `timezone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'America/Argentina/Buenos_Aires',
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_usages`
--

LOCK TABLES `coupon_usages` WRITE;
/*!40000 ALTER TABLE `coupon_usages` DISABLE KEYS */;
INSERT INTO `coupon_usages` VALUES (1,1,1,6,'2026-03-15 18:00:44');
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
  `code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('percentage','fixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'percentage',
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'PROMOUNAF','percentage',10.00,NULL,NULL,1,1,'2026-03-15','2026-03-20',1,'2026-03-15 17:31:53','2026-03-15 18:00:44');
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
  `type` enum('persona','empresa') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'persona' COMMENT 'Tipo de cliente',
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_alt` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Teléfono alternativo',
  `whatsapp` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CUIT/CUIL',
  `iva_condition` enum('responsable_inscripto','monotributista','exento','consumidor_final') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'consumidor_final',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Origen: referido, web, redes, etc.',
  `tags` json DEFAULT NULL COMMENT 'Etiquetas: ["vip","mayorista"]',
  `assigned_user_id` bigint unsigned DEFAULT NULL COMMENT 'Vendedor/asesor asignado',
  `last_contact_at` timestamp NULL DEFAULT NULL COMMENT 'Última interacción registrada',
  `next_followup_at` date DEFAULT NULL COMMENT 'Próximo seguimiento agendado',
  `birth_date` date DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_crm_company` (`company_id`),
  KEY `idx_crm_customer` (`customer_id`),
  KEY `idx_crm_assigned_user` (`assigned_user_id`),
  CONSTRAINT `fk_crm_assigned_user` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
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
-- Table structure for table `crm_interactions`
--

DROP TABLE IF EXISTS `crm_interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_interactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'Usuario que registró la interacción',
  `dentist_id` bigint unsigned DEFAULT NULL COMMENT 'Odontólogo relacionado (si aplica)',
  `crm_client_id` bigint unsigned DEFAULT NULL COMMENT 'Cliente CRM relacionado (si aplica)',
  `type` enum('llamada','email','whatsapp','visita','reunion','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'llamada',
  `direction` enum('inbound','outbound') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'outbound' COMMENT 'Entrante o saliente',
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Asunto o motivo',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Detalle de la interacción',
  `outcome` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Resultado: interesado, no contesta, envio presupuesto, etc.',
  `followup_date` date DEFAULT NULL COMMENT 'Fecha de próximo seguimiento',
  `interaction_at` datetime NOT NULL COMMENT 'Fecha y hora de la interacción',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ci_company` (`company_id`),
  KEY `idx_ci_dentist` (`dentist_id`),
  KEY `idx_ci_crm_client` (`crm_client_id`),
  KEY `idx_ci_user` (`user_id`),
  KEY `idx_ci_date` (`interaction_at`),
  CONSTRAINT `fk_ci_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_ci_crm_client` FOREIGN KEY (`crm_client_id`) REFERENCES `crm_clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de interacciones CRM con odontólogos y clientes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_interactions`
--

LOCK TABLES `crm_interactions` WRITE;
/*!40000 ALTER TABLE `crm_interactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_notifications`
--

DROP TABLE IF EXISTS `crm_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_notifications`
--

LOCK TABLES `crm_notifications` WRITE;
/*!40000 ALTER TABLE `crm_notifications` DISABLE KEYS */;
INSERT INTO `crm_notifications` VALUES (1,'new_order','Nuevo pedido','#0YT-IR3BA3 · Enciso Fernando Ariel · $19.200','/ecommerce-orders/11','0YT-IR3BA3','2026-03-18 00:10:22','2026-03-18 00:09:38','2026-03-18 00:10:22'),(2,'order_cancelled','Pedido cancelado','El cliente canceló el pedido #0YT-IR3BA3','/ecommerce-orders/11','0YT-IR3BA3','2026-03-18 00:20:43','2026-03-18 00:20:23','2026-03-18 00:20:43'),(3,'low_stock','Stock bajo','ACRILICO LIQUIDO AUTOCURABLE SUBITON x 1Lt — 1 unidades (mínimo: 1)','/products/3/edit','product_3','2026-03-18 00:34:12','2026-03-18 00:31:15','2026-03-18 00:34:12'),(4,'new_order','Nuevo pedido','#LWQ-EY8BPN · Enciso Fernando Ariel · $37.350','/ecommerce-orders/12','LWQ-EY8BPN','2026-03-18 00:35:43','2026-03-18 00:31:16','2026-03-18 00:35:43'),(5,'order_cancelled','Pedido cancelado','El cliente canceló el pedido #LWQ-EY8BPN','/ecommerce-orders/12','LWQ-EY8BPN','2026-03-18 00:36:26','2026-03-18 00:36:01','2026-03-18 00:36:26');
/*!40000 ALTER TABLE `crm_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_account_moves`
--

DROP TABLE IF EXISTS `customer_account_moves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_account_moves` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_account_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `balance_after` decimal(12,2) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `move_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_account_moves_customer_account_id_foreign` (`customer_account_id`),
  KEY `customer_account_moves_user_id_foreign` (`user_id`),
  KEY `customer_account_moves_payment_method_id_foreign` (`payment_method_id`),
  CONSTRAINT `customer_account_moves_customer_account_id_foreign` FOREIGN KEY (`customer_account_id`) REFERENCES `customer_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `customer_account_moves_payment_method_id_foreign` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `customer_account_moves_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_account_moves`
--

LOCK TABLES `customer_account_moves` WRITE;
/*!40000 ALTER TABLE `customer_account_moves` DISABLE KEYS */;
INSERT INTO `customer_account_moves` VALUES (1,1,1,'charge',233700.00,233700.00,'Venta POS 00001-00000006','sale',6,NULL,'2026-03-17','2026-03-18 00:56:21','2026-03-18 00:56:21');
/*!40000 ALTER TABLE `customer_account_moves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_accounts`
--

DROP TABLE IF EXISTS `customer_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_accounts_customer_id_unique` (`customer_id`),
  CONSTRAINT `customer_accounts_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_accounts`
--

LOCK TABLES `customer_accounts` WRITE;
/*!40000 ALTER TABLE `customer_accounts` DISABLE KEYS */;
INSERT INTO `customer_accounts` VALUES (1,1,233700.00,'2026-03-15 17:02:01','2026-03-18 00:56:21');
/*!40000 ALTER TABLE `customer_accounts` ENABLE KEYS */;
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
  `label` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Principal',
  `recipient` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Table structure for table `customer_password_reset_tokens`
--

DROP TABLE IF EXISTS `customer_password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_password_reset_tokens`
--

LOCK TABLES `customer_password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `customer_password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `customers` VALUES (1,'Enciso Fernando Ariel','fernandoenciso97@gmail.com','$2y$12$bkbsBqf5FtwopJ2WI8uicOJ104.dheAom65RtQAnBobrTQbUNff2O','3704211436','40215516','B° Doña Valentina Mz 50 Casa 12','Formosa','Formosa','3600',NULL,NULL,0,1,'2026-03-06 02:55:29','2026-03-15 16:34:51',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dentist_delivery_routes`
--

DROP TABLE IF EXISTS `dentist_delivery_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dentist_delivery_routes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `dentist_id` bigint unsigned NOT NULL,
  `route_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de la ruta o zona',
  `delivery_day` tinyint unsigned DEFAULT NULL COMMENT 'ISO weekday: 1=Lunes … 7=Domingo',
  `delivery_order` smallint unsigned DEFAULT '0' COMMENT 'Orden de visita dentro de la ruta',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dirección de entrega (puede diferir del consultorio)',
  `contact_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Persona que recibe',
  `contact_phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ddr_company` (`company_id`),
  KEY `idx_ddr_dentist` (`dentist_id`),
  KEY `idx_ddr_day` (`delivery_day`),
  CONSTRAINT `fk_ddr_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_ddr_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rutas de reparto y retiro de trabajos para cada odontólogo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dentist_delivery_routes`
--

LOCK TABLES `dentist_delivery_routes` WRITE;
/*!40000 ALTER TABLE `dentist_delivery_routes` DISABLE KEYS */;
/*!40000 ALTER TABLE `dentist_delivery_routes` ENABLE KEYS */;
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
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código interno del lab',
  `type` enum('individual','clinic') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'individual',
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del odontólogo o clínica',
  `contact_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Contacto en caso de clínica',
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_alt` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'WhatsApp del odontólogo',
  `specialty` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Especialidad: Ortodoncia, Cirugía, General, etc.',
  `zone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Zona/barrio para rutas de reparto',
  `instagram` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Instagram sin @',
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sitio web del odontólogo/clínica',
  `source` enum('referido','publicidad','espontaneo','red_social','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'espontaneo' COMMENT 'Cómo llegó al laboratorio',
  `discount_pct` decimal(5,2) DEFAULT '0.00' COMMENT 'Descuento general aplicado en todos sus trabajos (%)',
  `preferred_delivery_day` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lunes, Martes, etc. — día preferido de entrega/retiro',
  `last_order_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha del último trabajo registrado (auto-actualizado)',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código postal',
  `cuit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iva_condition` enum('responsable_inscripto','monotributista','exento','consumidor_final') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'consumidor_final',
  `license_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_limit` decimal(12,2) DEFAULT NULL COMMENT 'Límite de crédito (NULL = sin límite)',
  `payment_days` smallint DEFAULT '30' COMMENT 'Días de crédito acordados',
  `is_active` tinyint(1) DEFAULT '1',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dentist_code` (`company_id`,`code`),
  KEY `idx_dentists_company` (`company_id`),
  KEY `idx_dentists_zone` (`zone`),
  KEY `idx_dentists_company_id` (`company_id`),
  KEY `idx_dentists_company_code` (`company_id`,`code`),
  KEY `idx_dentists_name` (`name`),
  KEY `idx_dentists_email` (`email`),
  KEY `idx_dentists_phone` (`phone`),
  KEY `idx_dentists_is_active` (`company_id`,`is_active`),
  KEY `idx_dentists_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_dentists_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dentists`
--

LOCK TABLES `dentists` WRITE;
/*!40000 ALTER TABLE `dentists` DISABLE KEYS */;
INSERT INTO `dentists` VALUES (1,1,'DEN-001','individual','DIEZ AGUSTINA',NULL,'diezagus10@gmail.com','3704823780',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(2,1,'DEN-002','individual','AGUIRRE ALEJANDRA',NULL,'aleagui_ar@gmail.com','3704355200',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(3,1,'DEN-003','individual','LOPEZ ALEJANDRA',NULL,NULL,'3704808623',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FOTHERINGHAM 3115','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(4,1,'DEN-004','individual','OZUNA ALICIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(5,1,'DEN-005','individual','MIGLIORISI ANALIA',NULL,NULL,'3704563695',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'JONAS SALK 590 B° SAN MIGUEL','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(6,1,'DEN-006','individual','PANIAGUA ANDREA',NULL,NULL,'3704697617',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'YRIGOYEN 832','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(7,1,'DEN-007','individual','VAZQUEZ ANDREA',NULL,NULL,'3704702811',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PADRE GROTTI 439','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(8,1,'DEN-008','individual','GONZALEZ ANGELICA',NULL,NULL,'3704383881',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(9,1,'DEN-009','individual','GUILLEM ANIBAL',NULL,NULL,'3704003540',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CORONEL BOGADO','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(10,1,'DEN-010','individual','ORTELLADO CAMILA',NULL,NULL,'3794921892',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'JUAN MANUEL DE ROSAS 1060','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(11,1,'DEN-011','individual','PATERNO CAMILA',NULL,NULL,'3704914553',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RIVADAVIA 1463','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(12,1,'DEN-012','individual','CONSIGLIO CARLOS',NULL,'carlosconciglio@gmail.com','3704282105',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AYACUCHO 1430','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(13,1,'DEN-013','individual','ALVAREZ CAROLINA',NULL,NULL,'3704307457',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FOTHERINGHAM 1369','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(14,1,'DEN-014','individual','ONTIVERO CAROLINA',NULL,NULL,'3704574302',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(15,1,'DEN-015','individual','MUJICA CECILIA',NULL,NULL,'5959956700',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'ALBERDI',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(16,1,'DEN-016','individual','CONSIGLIO CESAR',NULL,NULL,'3704252453',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AV. PANTALEON GOMEZ 971','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(17,1,'DEN-017','individual','VILLAGRAM CHINA',NULL,NULL,'3794881834',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PRINGLES 371 PISO 1 CONSULTORIO 3','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(18,1,'DEN-018','individual','CANELLAS EDUARDO',NULL,NULL,'3704601994',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'MITRE 984','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(19,1,'DEN-019','individual','GAUNA ENRIQUE',NULL,NULL,'3704689610',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CORRIENTES Y SILVA','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(20,1,'DEN-020','individual','BASSI FABIAN',NULL,NULL,'3718528672',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'BELGRANO ENTRE IRIGOYEN Y MARIA CANDELARIA','LAGUNA BLANCA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(21,1,'DEN-021','individual','FLEITAS FABRICIO',NULL,NULL,'3516236058',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AV. NAPOLEON URIBURU 689','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(22,1,'DEN-022','individual','MAFFEI FABRICIO',NULL,NULL,'3794770186',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(23,1,'DEN-023','individual','MENDOZA FATIMA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(24,1,'DEN-024','individual','BASSI FLORENCIA',NULL,NULL,'3718538673',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'LAGUNA BLANCA - CLORINDA','LAGUNA BLANCA - CLORINDA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(25,1,'DEN-025','individual','GIMENEZ FLORENCIA',NULL,'flor.ely.gimenez@gmail.com','3704000919',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'MORENO 289','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(26,1,'DEN-026','individual','AQUINO GABRIELA',NULL,NULL,'3704615839',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AV. 25 DE MAYO 1255','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(27,1,'DEN-027','individual','GOMEZ GELEN',NULL,NULL,'3704547894',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PASAJE YAPEYU 126','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(28,1,'DEN-028','individual','AQUINO GELY',NULL,NULL,'1164570523',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CORDOBA 1538 PASAJE MACEDO MARTINEZ','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(29,1,'DEN-029','individual','SEGOVIA GLADYS LIDIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'H. IRIGOYEN 1740','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(30,1,'DEN-030','individual','LUGO GUSTAVO',NULL,NULL,'3704577107',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'JUAN JOSE SILVA 774','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(31,1,'DEN-031','individual','FEU JOSE',NULL,NULL,'3704589815',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SALTA S/N','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(32,1,'DEN-032','individual','VENICA JOSE',NULL,NULL,'3704255785',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AV. GONZALEZ LELONG 1685','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(33,1,'DEN-033','individual','ZAMBON JUAN',NULL,NULL,'3704615157',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SARMIENTO 120','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(34,1,'DEN-034','individual','BONDARUK KARINA',NULL,NULL,'3704231348',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RIVADAVIA 419','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(35,1,'DEN-035','individual','FAYFER LAURA',NULL,NULL,'3794498728',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(36,1,'DEN-036','individual','JARA LEONOR',NULL,NULL,'3704555648',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(37,1,'DEN-037','individual','D AUGERO LETIZIA',NULL,NULL,'3704782020',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'JUAN JOSE PASO 1445','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(38,1,'DEN-038','individual','CONCHAS MABEL',NULL,NULL,'3704668637',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(39,1,'DEN-039','individual','PEREZ MABEL',NULL,NULL,'3704236857',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'BELGRANO Y CORRIENTES','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(40,1,'DEN-040','individual','CORONEL MARCELA',NULL,NULL,'3704665953',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PARAGUAY Y BELGRANO','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(41,1,'DEN-041','individual','DAVETA MARCELO',NULL,NULL,'3704507238',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(42,1,'DEN-042','individual','LOPEZ MARCELO',NULL,'cofotheringam@hotmail.com','3704567228',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FOTHERINGHAM 3115','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(43,1,'DEN-043','individual','TALADRID MARIA',NULL,'marilyntaladrid@gmail.com','3704410085',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AV. AVELLANEDA 916','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(44,1,'DEN-044','individual','SALOMON MARIANA',NULL,NULL,'3814146471',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(45,1,'DEN-045','individual','NACIF',NULL,NULL,'3704309157',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'INGENIERO JUAREZ',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(46,1,'DEN-046','individual','COLMAN NAHUEL',NULL,NULL,'3704614301',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PEDRO BONACCIO 221','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(47,1,'DEN-047','individual','CANIZA NATALIA',NULL,NULL,'3704307919',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'JUAN MANUEL DE ROSAS 1060','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(48,1,'DEN-048','individual','GONZALEZ NATALIA',NULL,'nataliasgonzalezo@hotmail.com','3704001078',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NUEVA FORMOSA','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(49,1,'DEN-049','individual','CENTURION PAOLA',NULL,'centudent@gmail.com','3704614629',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SAGRADO CORAZON','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(50,1,'DEN-050','individual','SILVERO PATRICIA',NULL,NULL,'3704566752',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'MITRE 506','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(51,1,'DEN-051','individual','QUAGLIOZZI',NULL,NULL,'3704500916',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PUCHINI 750','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(52,1,'DEN-052','individual','AGUAYO RAUL MARCELO',NULL,'rmaguayo@gmail.com','3704230321',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AV. 25 DE MAYO 787 DPTO. 1','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(53,1,'DEN-053','individual','SILVESTRI ROLANDO',NULL,NULL,'3704519399',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(54,1,'DEN-054','individual','MARECOS ROXANA',NULL,'roxynoguera@gmail.com','3704654287',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'AV. ITALIA 2156','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(55,1,'DEN-055','individual','FEREIRA SEBASTIAN',NULL,NULL,'3704697709',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(56,1,'DEN-056','individual','SERVIN SOLANGE',NULL,'solserivn@hotmail.com','3794897987',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(57,1,'DEN-057','individual','VELAZQUEZ SUSANA',NULL,NULL,'3704563464',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(58,1,'DEN-058','individual','BARON PENA TAMARA',NULL,NULL,'3704264889',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORTIN YUNKA 1543','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(59,1,'DEN-059','individual','YONNY',NULL,NULL,'3704084514',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(60,1,'DEN-060','individual','ARIAS CECILIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(61,1,'DEN-061','individual','BALDERRAMA ROCIO',NULL,NULL,'3718445880',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(62,1,'DEN-062','individual','GAMARRA SANTIAGO',NULL,NULL,'3704434951',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'BELGRANO 1214','FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(63,1,'DEN-063','individual','RAMIREZ CRISTIAN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(64,1,'DEN-064','individual','BASABES VERONICA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'FORMOSA',NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(65,1,'DEN-065','individual','HERRERA MATIAS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(66,1,'DEN-067','individual','VAZQUEZ SILVINA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(67,1,'DEN-069','individual','KRIEBAUM DIEGO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(68,1,'DEN-070','individual','VENICA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(69,1,'DEN-071','individual','AVILA AGOSTINA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(70,1,'DEN-072','individual','MARTELLO NATALIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(71,1,'DEN-073','individual','ALEGRE GABRIELA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(72,1,'DEN-074','individual','CLINICA AUDIOVISUAL',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(73,1,'DEN-075','individual','FERREIRO SEBASTIAN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(74,1,'DEN-076','individual','DONKIN LAURA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(75,1,'DEN-077','individual','ARAGUES GUSTAVO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(76,1,'DEN-078','individual','JACOBO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(77,1,'DEN-079','individual','CUENCA SOLEDAD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(78,1,'DEN-080','individual','BRITEZ EMANUEL',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(79,1,'DEN-081','individual','ZAMBONI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(80,1,'DEN-082','individual','VALDES',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(81,1,'DEN-083','individual','GOMEZ ANTONELLA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(82,1,'DEN-084','individual','MENENDEZ MARIA VIRGINIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(83,1,'DEN-085','individual','MONICA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(84,1,'DEN-086','individual','VARGAS NOELIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(85,1,'DEN-087','individual','RIVAROLA SEBASTIAN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(86,1,'DEN-088','individual','CRISTALDO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(87,1,'DEN-089','individual','BARRIOS CAMILA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(88,1,'DEN-090','individual','JURE FLORENCIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(89,1,'DEN-091','individual','LEGUIZAMON',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(90,1,'DEN-092','individual','DE FONTANA CRISTIAN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(91,1,'DEN-093','individual','ROLON',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(92,1,'DEN-094','individual','MARTI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(93,1,'DEN-095','individual','MARTIR',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(94,1,'DEN-097','individual','ALICIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(95,1,'DEN-098','individual','MARIO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(96,1,'DEN-099','individual','POLO VALENTINA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(97,1,'DEN-100','individual','LUGO MARIA LETICIA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL),(98,1,'DEN-101','individual','RIQUELME GERARDO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'consumidor_final',NULL,0.00,0,1,NULL,'2026-03-10 19:17:02','2026-03-10 19:17:02',NULL);
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
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(12,2) NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_eoi_order` (`order_id`),
  KEY `fk_eoi_product` (`product_id`),
  CONSTRAINT `fk_eoi_order` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eoi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecommerce_order_items`
--

LOCK TABLES `ecommerce_order_items` WRITE;
/*!40000 ALTER TABLE `ecommerce_order_items` DISABLE KEYS */;
INSERT INTO `ecommerce_order_items` VALUES (1,1,186,NULL,'10 MODELO DE YESO SUP ','541',1,8800.00,21.00,0.00,10648.00),(2,1,200,NULL,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS','556',1,4000.00,21.00,0.00,4840.00),(3,2,187,NULL,'100 GRAMOS DE ACRILICO ','542',1,5600.00,0.00,0.00,5600.00),(4,3,186,NULL,'10 MODELO DE YESO SUP ','541',1,8800.00,0.00,0.00,8800.00),(5,4,3,NULL,'ACRILICO LIQUIDO AUTOCURABLE SUBITON x 1Lt','8',1,41500.00,0.00,0.00,41500.00),(6,5,200,NULL,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS','556',1,4000.00,0.00,0.00,4000.00),(7,6,200,NULL,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS','556',1,4000.00,0.00,0.00,4000.00),(8,7,200,NULL,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS','556',1,4000.00,0.00,0.00,4000.00),(9,8,200,NULL,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS','556',1,4000.00,0.00,0.00,4000.00),(10,9,2,NULL,'ACRILICO POLIMERO AUTOCURABLE x 1Kg','7',1,62500.00,0.00,0.00,62500.00),(11,10,200,NULL,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS','556',1,3600.00,0.00,0.00,3600.00),(12,11,126,NULL,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un ','480',1,19200.00,0.00,0.00,19200.00),(13,12,3,NULL,'ACRILICO LIQUIDO AUTOCURABLE SUBITON x 1Lt','8',1,37350.00,0.00,0.00,37350.00);
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
  `shipping_method_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'home_delivery|pickup_point|moto',
  `pickup_point_id` bigint unsigned DEFAULT NULL,
  `moto_company_id` bigint unsigned DEFAULT NULL,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `selected_payment_method` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mp_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `shipping_cost` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `shipping_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_postal` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `admin_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_number` (`order_number`),
  KEY `idx_eorders_customer` (`customer_id`),
  KEY `idx_eorders_status` (`status`),
  KEY `fk_eorders_company` (`company_id`),
  KEY `fk_eorders_coupon` (`coupon_id`),
  KEY `ecommerce_orders_pickup_point_id_foreign` (`pickup_point_id`),
  KEY `ecommerce_orders_moto_company_id_foreign` (`moto_company_id`),
  CONSTRAINT `ecommerce_orders_moto_company_id_foreign` FOREIGN KEY (`moto_company_id`) REFERENCES `shipping_moto_companies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ecommerce_orders_pickup_point_id_foreign` FOREIGN KEY (`pickup_point_id`) REFERENCES `shipping_pickup_points` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_eorders_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_eorders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_eorders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecommerce_orders`
--

LOCK TABLES `ecommerce_orders` WRITE;
/*!40000 ALTER TABLE `ecommerce_orders` DISABLE KEYS */;
INSERT INTO `ecommerce_orders` VALUES (1,1,1,NULL,NULL,NULL,NULL,NULL,'NJT-TDI51O','cancelled','pending',NULL,NULL,12800.00,0.00,0.00,2688.00,15488.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-15 16:58:41','2026-03-15 17:51:05'),(2,1,1,NULL,NULL,NULL,NULL,NULL,'0ZS-S8ABR5','cancelled','pending',NULL,NULL,5600.00,0.00,0.00,0.00,5600.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-15 17:36:36','2026-03-15 17:51:15'),(3,1,1,NULL,NULL,NULL,NULL,NULL,'NK8-VAT9LH','cancelled','pending',NULL,NULL,8800.00,0.00,0.00,0.00,8800.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-15 17:44:29','2026-03-15 17:51:22'),(4,1,1,NULL,NULL,NULL,NULL,NULL,'O48-JGBRQI','cancelled','pending',NULL,NULL,41500.00,0.00,0.00,0.00,41500.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-15 17:49:19','2026-03-15 18:01:44'),(5,1,1,NULL,NULL,NULL,NULL,NULL,'ODQ-DLDSVY','cancelled','failed',NULL,NULL,4000.00,0.00,0.00,0.00,4000.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-15 17:53:50','2026-03-18 00:51:39'),(6,1,1,1,NULL,NULL,NULL,NULL,'I05-IGR3MC','cancelled','failed',NULL,NULL,4000.00,400.00,0.00,0.00,3600.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-15 18:00:44','2026-03-18 00:51:29'),(7,1,1,NULL,NULL,NULL,NULL,NULL,'BRL-J2GRBT','cancelled','failed',NULL,NULL,4000.00,0.00,0.00,0.00,4000.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-15 18:07:00','2026-03-15 18:08:13'),(8,1,1,NULL,NULL,'pickup_point',2,NULL,'JRT-I6WCLE','cancelled','failed','mercadopago',NULL,4000.00,0.00,0.00,0.00,4000.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-17 21:59:29','2026-03-17 22:01:09'),(9,1,1,NULL,NULL,'pickup_point',2,NULL,'933-2X6XF6','delivered','paid','bank_transfer',NULL,62500.00,0.00,0.00,0.00,62500.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-17 22:14:00','2026-03-17 22:18:33'),(10,1,1,NULL,NULL,'home_delivery',NULL,NULL,'KCJ-A7DZOP','refunded','refunded','bank_transfer',NULL,3600.00,0.00,0.00,0.00,3600.00,'Enciso Fernando Ariel','Av. Dr. Nestor Kirchner, 4935','Formosa','Formosa','3600','3704211436',NULL,NULL,'2026-03-17 22:19:23','2026-03-18 00:23:49'),(11,1,1,NULL,NULL,'pickup_point',2,NULL,'0YT-IR3BA3','cancelled','refunded','bank_transfer',NULL,19200.00,0.00,0.00,0.00,19200.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-18 00:09:38','2026-03-18 00:20:59'),(12,1,1,NULL,NULL,'pickup_point',2,NULL,'LWQ-EY8BPN','cancelled','pending','cash',NULL,37350.00,0.00,0.00,0.00,37350.00,'Enciso Fernando Ariel',NULL,NULL,NULL,NULL,'3704211436',NULL,NULL,'2026-03-18 00:31:15','2026-03-18 00:36:00');
/*!40000 ALTER TABLE `ecommerce_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ecommerce_payment_configs`
--

DROP TABLE IF EXISTS `ecommerce_payment_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecommerce_payment_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `config` json DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `sort_order` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ecommerce_payment_configs_type_unique` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecommerce_payment_configs`
--

LOCK TABLES `ecommerce_payment_configs` WRITE;
/*!40000 ALTER TABLE `ecommerce_payment_configs` DISABLE KEYS */;
INSERT INTO `ecommerce_payment_configs` VALUES (1,'mercadopago','MercadoPago',1,'{\"public_key\": \"APP_USR-c01428b5-f4e7-4f91-b988-88a22f8e36da\", \"access_token\": \"APP_USR-772101769502719-031713-bc3fe37ea7113d509e114a19a00e4e39-168542276\"}',NULL,1,'2026-03-17 21:05:23','2026-03-17 21:46:21'),(2,'bank_transfer','Transferencia CBU / CVU',1,'{\"alias\": \"dental.bru\", \"account_name\": \"Centurion Roxana Paola\"}',NULL,2,'2026-03-17 21:05:23','2026-03-17 22:03:44'),(3,'qr','Pago por QR',0,NULL,NULL,3,'2026-03-17 21:05:23','2026-03-17 21:05:23'),(4,'cash','Efectivo en sucursal',1,NULL,NULL,4,'2026-03-17 21:05:23','2026-03-17 22:03:52');
/*!40000 ALTER TABLE `ecommerce_payment_configs` ENABLE KEYS */;
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
  `dni` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Cargo',
  `salary` decimal(12,2) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Alquiler, Servicios, Insumos, Sueldos, etc.',
  `type` enum('expense','income') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'expense',
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
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `vendor_id` bigint unsigned DEFAULT NULL COMMENT 'Proveedor al que se le pagó',
  `reference` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'N° factura, remito, etc.',
  `expense_date` date NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
-- Table structure for table `hero_slides`
--

DROP TABLE IF EXISTS `hero_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_slides` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `click_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` tinyint unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_slides`
--

LOCK TABLES `hero_slides` WRITE;
/*!40000 ALTER TABLE `hero_slides` DISABLE KEYS */;
/*!40000 ALTER TABLE `hero_slides` ENABLE KEYS */;
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
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `income_date` date NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,3) NOT NULL DEFAULT '1.000',
  `unit_price` decimal(12,2) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT '21.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ii_invoice` (`invoice_id`),
  CONSTRAINT `fk_ii_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES (1,1,'Blister Dientes Acritone',1.000,1700.00,21.00,295.04,1700.00),(2,1,'BISTURI HOJAS DESCARTABLES x Unidad',2.000,250.00,21.00,86.78,500.00);
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Factura A, Factura B, Factura C, ND A, NC A, etc.',
  `afip_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código AFIP (ej: 001, 006, 011)',
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
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'sale, lab_billing',
  `reference_id` bigint unsigned DEFAULT NULL,
  `recipient_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_cuit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_iva` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `point_sale` smallint unsigned DEFAULT '1',
  `number` int unsigned DEFAULT NULL,
  `cae` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cae_expiry` date DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `status` enum('draft','issued','sent','accepted','expired','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `issued_at` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `public_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quote_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoice_number` (`company_id`,`invoice_type_id`,`point_sale`,`number`),
  UNIQUE KEY `invoices_public_token_unique` (`public_token`),
  KEY `idx_invoices_reference` (`reference_type`,`reference_id`),
  KEY `fk_invoices_type` (`invoice_type_id`),
  CONSTRAINT `fk_invoices_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_invoices_type` FOREIGN KEY (`invoice_type_id`) REFERENCES `invoice_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,1,1,1,'quote',NULL,'Roberto','22306549872','Consumidor Final',NULL,1,NULL,NULL,NULL,1818.18,0.00,381.82,2200.00,'sent','2026-03-14','2026-03-20','','5XfNKlIHRtECVLRG5n8RBnZKiBB02niX','PRES-00001','2026-03-14 03:02:36','2026-03-14 03:09:34');
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
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size_bytes` int unsigned DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Rol en este trabajo: ceramista, montaje, etc.',
  `assigned_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL COMMENT 'Cuando terminó su parte',
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(8,3) NOT NULL DEFAULT '1.000',
  `unit_price` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ji_job` (`job_id`),
  KEY `fk_ji_tariff` (`tariff_id`),
  CONSTRAINT `fk_ji_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ji_tariff` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_items`
--

LOCK TABLES `job_items` WRITE;
/*!40000 ALTER TABLE `job_items` DISABLE KEYS */;
INSERT INTO `job_items` VALUES (1,1,29,'CORONA FRESADA ZIRCONIA MULTIAYER',1.000,110000.00,0.00,110000.00);
/*!40000 ALTER TABLE `job_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_remakes`
--

DROP TABLE IF EXISTS `job_remakes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_remakes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL COMMENT 'Trabajo nuevo (el rehecho)',
  `original_job_id` bigint unsigned NOT NULL COMMENT 'Trabajo original que se rehízo',
  `reported_by` bigint unsigned DEFAULT NULL COMMENT 'Usuario que reportó el rehecho',
  `responsibility` enum('lab','dentist','patient','material','unknown') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'unknown' COMMENT 'A quién se atribuye el error',
  `reason_category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Color, ajuste, fractura, diseño, etc.',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada del problema',
  `material_cost` decimal(12,2) DEFAULT '0.00' COMMENT 'Costo de materiales del rehecho',
  `labor_cost` decimal(12,2) DEFAULT '0.00' COMMENT 'Costo de mano de obra del rehecho',
  `charged_to` enum('lab','dentist','insurance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'lab' COMMENT 'Quién absorbe el costo',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jr_job` (`job_id`),
  KEY `idx_jr_original` (`original_job_id`),
  KEY `idx_jr_reported_by` (`reported_by`),
  CONSTRAINT `fk_jr_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jr_original_job` FOREIGN KEY (`original_job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jr_reported_by` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de trabajos rehechos: causa, responsabilidad y costo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_remakes`
--

LOCK TABLES `job_remakes` WRITE;
/*!40000 ALTER TABLE `job_remakes` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_remakes` ENABLE KEYS */;
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
  `status` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `tooth` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Número FDI: 11, 12, 21... o 11-16 para rango',
  `note` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#6366f1' COMMENT 'Color hex para UI',
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
  `job_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('received','in_progress','quality_check','ready','delivered','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'received',
  `priority` enum('normal','urgent','rush') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `clinical_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Indicaciones clínicas del odontólogo',
  `shade` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Color dental: A1, A2, B3, etc.',
  `color_system` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sistema de color: Vita, Chromascop, Ivoclar, etc.',
  `sector` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sector del lab: cerámica, prótesis, ortodoncia, etc.',
  `received_at` date DEFAULT NULL,
  `due_date` date DEFAULT NULL COMMENT 'Fecha de entrega comprometida',
  `delivered_at` datetime DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `urgency_fee` decimal(12,2) DEFAULT '0.00' COMMENT 'Recargo por urgencia aplicado',
  `delivery_method` enum('retiro_dentista','reparto','courier','retiro_paciente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'retiro_dentista' COMMENT 'Forma de entrega',
  `pickup_date` date DEFAULT NULL COMMENT 'Fecha pactada de retiro/entrega al odontólogo',
  `remake_of_job_id` bigint unsigned DEFAULT NULL COMMENT 'Si es rehecho: ID del trabajo original',
  `remake_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Motivo del rehecho',
  `lab_technician_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Observaciones internas del técnico',
  `estimated_days` tinyint unsigned DEFAULT NULL COMMENT 'Días estimados de producción',
  `total` decimal(12,2) DEFAULT '0.00',
  `billed` tinyint(1) DEFAULT '0' COMMENT 'Si ya fue incluido en factura',
  `invoice_id` bigint unsigned DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  KEY `idx_jobs_sector` (`sector`),
  KEY `idx_jobs_pickup_date` (`pickup_date`),
  KEY `fk_jobs_remake` (`remake_of_job_id`),
  CONSTRAINT `fk_jobs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_jobs_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`),
  CONSTRAINT `fk_jobs_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_remake` FOREIGN KEY (`remake_of_job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_user` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (1,1,12,3,NULL,NULL,'ORD-00001','received','normal',NULL,NULL,NULL,NULL,NULL,'2026-03-10','2026-03-17',NULL,110000.00,0.00,0.00,'retiro_dentista',NULL,NULL,NULL,NULL,NULL,110000.00,0,NULL,NULL,'2026-03-10 23:05:52','2026-03-10 23:05:52',NULL);
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
  `type` enum('charge','payment','adjustment','note_credit','note_debit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL COMMENT 'Siempre positivo; el tipo define si suma o resta',
  `balance_after` decimal(14,2) DEFAULT NULL COMMENT 'Saldo resultante para trazabilidad',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'job, invoice, manual',
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_account_moves`
--

LOCK TABLES `lab_account_moves` WRITE;
/*!40000 ALTER TABLE `lab_account_moves` DISABLE KEYS */;
INSERT INTO `lab_account_moves` VALUES (1,1,1,'charge',110000.00,110000.00,'Cargo por orden ORD-00001','App\\Models\\Job',1,NULL,'2026-03-10',NULL),(2,1,1,'payment',110000.00,0.00,'Pago a cuenta',NULL,NULL,1,'2026-03-10',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_accounts`
--

LOCK TABLES `lab_accounts` WRITE;
/*!40000 ALTER TABLE `lab_accounts` DISABLE KEYS */;
INSERT INTO `lab_accounts` VALUES (1,12,0.00,'2026-03-10 23:05:52','2026-03-10 23:20:50');
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
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2026_03_06_141541_fix_sales_status_enum',1),(2,'2026_03_10_152327_create_personal_access_tokens_table',2),(3,'2026_03_11_001448_add_photo_path_to_collaborator_attendances_table',3),(4,'2026_03_11_043550_create_collaborator_webauthn_credentials_table',4),(5,'2026_03_11_121019_add_webauthn_to_attendance_method_enum',5),(6,'2026_03_13_191938_add_quote_fields_to_invoices_table',6),(7,'2026_03_06_233712_create_tariff_costs_table',7),(8,'2026_03_14_000724_fix_invoices_status_enum',7),(9,'add_receipt_type_to_sales',8),(10,'2026_03_14_111812_add_customer_id_to_sales_table',9),(11,'2026_03_14_111812_create_customer_accounts_table',9),(12,'2026_03_14_111813_create_customer_account_moves_table',9),(13,'2026_03_14_112820_add_pending_to_sales_status_enum',9),(14,'2026_03_14_114145_add_tax_rate_to_ecommerce_order_items_table',9),(15,'2026_03_15_124220_create_customer_password_reset_tokens_table',10),(16,'2026_03_15_231957_create_shipping_pickup_points_table',11),(17,'2026_03_15_231958_create_shipping_moto_companies_table',11),(18,'2026_03_15_231959_add_shipping_method_fields_to_ecommerce_orders_table',11),(19,'2026_03_16_113238_create_sidebar_banners_table',12),(20,'2026_03_16_120237_create_hero_slides_table',12),(21,'2026_03_16_122628_simplify_hero_slides_table',12),(22,'2026_03_16_172444_add_brand_and_min_stock_to_products_table',13),(23,'2026_03_16_200000_create_offers_table',14),(24,'2026_03_17_180430_add_accepts_cash_payment_to_shipping_pickup_points_table',15),(25,'2026_03_17_180430_create_ecommerce_payment_configs_table',15),(26,'2026_03_17_180431_add_payment_method_to_ecommerce_orders_table',15),(27,'2026_03_17_200000_add_tracking_url_to_shipments_table',16),(28,'2026_03_17_203452_create_crm_notifications_table',17),(29,'2026_03_17_214252_add_mp_payment_id_to_ecommerce_orders_table',18);
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
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
-- Table structure for table `offer_products`
--

DROP TABLE IF EXISTS `offer_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offer_products` (
  `offer_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`offer_id`,`product_id`),
  KEY `offer_products_product_id_foreign` (`product_id`),
  CONSTRAINT `offer_products_offer_id_foreign` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offer_products_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offer_products`
--

LOCK TABLES `offer_products` WRITE;
/*!40000 ALTER TABLE `offer_products` DISABLE KEYS */;
INSERT INTO `offer_products` VALUES (1,3),(2,3),(1,4),(2,4),(1,5),(2,5),(1,9),(1,14),(1,200);
/*!40000 ALTER TABLE `offer_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` decimal(8,2) DEFAULT NULL,
  `badge_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge_color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'red',
  `description` text COLLATE utf8mb4_unicode_ci,
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `offers_company_id_foreign` (`company_id`),
  CONSTRAINT `offers_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
INSERT INTO `offers` VALUES (1,1,'Semana del Acrilico','discount_percent',10.00,'10% OFF','red',NULL,'2026-03-16 03:00:00','2026-03-20 03:00:00',1,'2026-03-16 23:45:33','2026-03-16 23:46:18'),(2,1,'Cuotas sin interes','installments',3.00,'3 Cuotas','green','Promo de apertura','2026-03-16 03:00:00','2026-03-20 03:00:00',1,'2026-03-16 23:55:48','2026-03-16 23:55:48');
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('M','F','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DNI del paciente',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patients_dentist` (`dentist_id`),
  CONSTRAINT `fk_patients_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (3,12,'Roberto',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-10 23:05:52','2026-03-10 23:05:52',NULL);
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Efectivo, Tarjeta Débito, Transferencia, MercadoPago, etc.',
  `type` enum('cash','card_debit','card_credit','transfer','mp','check','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `surcharge_pct` decimal(5,2) DEFAULT '0.00' COMMENT 'Recargo % (ej: tarjeta crédito)',
  `is_active` tinyint(1) DEFAULT '1',
  `applies_to` set('ecommerce','pos','lab') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ecommerce,pos,lab',
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
  `tokenable_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pat_token` (`token`),
  KEY `idx_pat_tokenable` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (2,'App\\Models\\User',1,'Asignaciones','ad3c4b2bab80114499e87b6ad696307247bacf74c71c41dff18a65dfaa6ccf28','[\"*\"]','2026-03-11 13:50:04',NULL,'2026-03-10 18:38:34','2026-03-11 13:50:04'),(8,'App\\Models\\User',1,'Panel 2','223a37838ffdbfc0d99a6e84ce397570003241702105b4e9c297278705a37981','[\"*\"]','2026-03-11 03:14:08',NULL,'2026-03-10 21:44:24','2026-03-11 03:14:08'),(9,'App\\Models\\Customer',1,'ecommerce','1aa1920c6d253e275ebf8a41a627f7414945c1ccce8555314bed946335fd3bb5','[\"*\"]','2026-03-15 19:33:40',NULL,'2026-03-15 16:35:07','2026-03-15 19:33:40'),(11,'App\\Models\\Customer',1,'ecommerce','6ba9aa53da62f24503b3499280f19223722fc135ef78234954341fdd3bd43126','[\"*\"]','2026-03-18 01:13:22',NULL,'2026-03-16 00:27:22','2026-03-18 01:13:22');
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
  `value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Rojo, XL, Titanio',
  PRIMARY KEY (`id`),
  KEY `idx_pav_attribute` (`attribute_id`),
  CONSTRAINT `fk_pav_attribute` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attribute_values`
--

LOCK TABLES `product_attribute_values` WRITE;
/*!40000 ALTER TABLE `product_attribute_values` DISABLE KEYS */;
INSERT INTO `product_attribute_values` VALUES (1,1,'Anterior Superior'),(2,1,'Anterior Inferior'),(3,1,'Posterior Superior'),(4,1,'Posterior Inferior'),(5,3,'61 / A1'),(6,3,'62 / A2'),(7,3,'66 / A3'),(8,3,'67 / A3,5'),(9,3,'81 / A4'),(10,3,'B2'),(11,3,'65'),(12,3,'68'),(13,3,'69 / C3'),(14,3,'71'),(15,3,'77 / C4'),(16,3,'D2'),(17,2,'16'),(18,2,'18'),(19,2,'20'),(20,2,'22'),(21,2,'25'),(22,2,'26'),(23,2,'28'),(24,2,'30'),(25,2,'32'),(26,2,'34'),(27,2,'36'),(28,2,'38'),(29,2,'40'),(30,2,'P4'),(31,2,'P5'),(32,2,'P6'),(33,3,'Cristal'),(34,3,'Rosa'),(35,3,'Rosa Jaspeado');
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Color, Talle, Material',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attr_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attributes`
--

LOCK TABLES `product_attributes` WRITE;
/*!40000 ALTER TABLE `product_attributes` DISABLE KEYS */;
INSERT INTO `product_attributes` VALUES (1,'Ubicación','2026-03-09 14:33:15'),(2,'Forma','2026-03-09 14:33:15'),(3,'Color','2026-03-09 14:33:15');
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
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_cover` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pimages_product` (`product_id`),
  CONSTRAINT `fk_pimages_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,2,NULL,'/storage/products/IsPXeymPnsFbU482tm2dZrmvEVCGvZ9lDp8N3xwu.webp',NULL,0,1,NULL);
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
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL COMMENT 'NULL = usa precio del producto padre',
  `cost_price` decimal(12,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pvariants_product` (`product_id`),
  CONSTRAINT `fk_pvariants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=352 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'ACR-AS-16-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(2,1,'ACR-AS-16-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(3,1,'ACR-AS-16-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(4,1,'ACR-AS-16-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(5,1,'ACR-AS-16-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(6,1,'ACR-AS-16-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(7,1,'ACR-AS-16-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(8,1,'ACR-AS-16-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(9,1,'ACR-AS-16-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(10,1,'ACR-AS-16-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(11,1,'ACR-AS-16-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:10'),(12,1,'ACR-AS-16-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(13,1,'ACR-AS-18-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(14,1,'ACR-AS-18-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(15,1,'ACR-AS-18-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(16,1,'ACR-AS-18-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(17,1,'ACR-AS-18-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(18,1,'ACR-AS-18-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(19,1,'ACR-AS-18-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(20,1,'ACR-AS-18-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(21,1,'ACR-AS-18-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(22,1,'ACR-AS-18-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(23,1,'ACR-AS-18-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(24,1,'ACR-AS-18-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(25,1,'ACR-AS-20-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(26,1,'ACR-AS-20-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(27,1,'ACR-AS-20-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(28,1,'ACR-AS-20-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(29,1,'ACR-AS-20-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(30,1,'ACR-AS-20-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:11'),(31,1,'ACR-AS-20-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(32,1,'ACR-AS-20-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(33,1,'ACR-AS-20-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(34,1,'ACR-AS-20-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(35,1,'ACR-AS-20-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(36,1,'ACR-AS-20-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(37,1,'ACR-AS-22-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(38,1,'ACR-AS-22-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(39,1,'ACR-AS-22-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(40,1,'ACR-AS-22-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(41,1,'ACR-AS-22-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(42,1,'ACR-AS-22-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(43,1,'ACR-AS-22-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(44,1,'ACR-AS-22-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(45,1,'ACR-AS-22-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(46,1,'ACR-AS-22-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(47,1,'ACR-AS-22-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(48,1,'ACR-AS-22-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(49,1,'ACR-AS-25-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(50,1,'ACR-AS-25-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(51,1,'ACR-AS-25-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(52,1,'ACR-AS-25-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(53,1,'ACR-AS-25-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:12'),(54,1,'ACR-AS-25-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(55,1,'ACR-AS-25-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(56,1,'ACR-AS-25-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(57,1,'ACR-AS-25-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(58,1,'ACR-AS-25-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(59,1,'ACR-AS-25-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(60,1,'ACR-AS-25-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(61,1,'ACR-AS-26-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(62,1,'ACR-AS-26-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(63,1,'ACR-AS-26-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(64,1,'ACR-AS-26-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(65,1,'ACR-AS-26-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(66,1,'ACR-AS-26-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(67,1,'ACR-AS-26-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(68,1,'ACR-AS-26-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(69,1,'ACR-AS-26-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(70,1,'ACR-AS-26-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(71,1,'ACR-AS-26-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(72,1,'ACR-AS-26-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(73,1,'ACR-AS-28-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(74,1,'ACR-AS-28-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(75,1,'ACR-AS-28-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(76,1,'ACR-AS-28-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(77,1,'ACR-AS-28-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(78,1,'ACR-AS-28-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(79,1,'ACR-AS-28-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(80,1,'ACR-AS-28-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(81,1,'ACR-AS-28-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(82,1,'ACR-AS-28-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(83,1,'ACR-AS-28-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(84,1,'ACR-AS-28-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(85,1,'ACR-AS-30-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(86,1,'ACR-AS-30-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(87,1,'ACR-AS-30-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(88,1,'ACR-AS-30-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(89,1,'ACR-AS-30-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(90,1,'ACR-AS-30-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(91,1,'ACR-AS-30-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(92,1,'ACR-AS-30-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(93,1,'ACR-AS-30-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(94,1,'ACR-AS-30-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(95,1,'ACR-AS-30-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(96,1,'ACR-AS-30-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(97,1,'ACR-AS-32-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(98,1,'ACR-AS-32-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(99,1,'ACR-AS-32-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(100,1,'ACR-AS-32-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(101,1,'ACR-AS-32-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(102,1,'ACR-AS-32-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(103,1,'ACR-AS-32-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(104,1,'ACR-AS-32-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(105,1,'ACR-AS-32-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(106,1,'ACR-AS-32-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(107,1,'ACR-AS-32-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(108,1,'ACR-AS-32-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(109,1,'ACR-AS-34-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:13'),(110,1,'ACR-AS-34-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(111,1,'ACR-AS-34-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(112,1,'ACR-AS-34-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(113,1,'ACR-AS-34-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(114,1,'ACR-AS-34-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(115,1,'ACR-AS-34-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(116,1,'ACR-AS-34-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(117,1,'ACR-AS-34-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(118,1,'ACR-AS-34-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(119,1,'ACR-AS-34-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(120,1,'ACR-AS-34-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(121,1,'ACR-AS-36-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(122,1,'ACR-AS-36-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(123,1,'ACR-AS-36-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(124,1,'ACR-AS-36-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(125,1,'ACR-AS-36-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(126,1,'ACR-AS-36-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(127,1,'ACR-AS-36-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(128,1,'ACR-AS-36-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(129,1,'ACR-AS-36-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(130,1,'ACR-AS-36-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(131,1,'ACR-AS-36-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(132,1,'ACR-AS-36-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(133,1,'ACR-AS-38-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(134,1,'ACR-AS-38-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(135,1,'ACR-AS-38-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(136,1,'ACR-AS-38-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(137,1,'ACR-AS-38-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(138,1,'ACR-AS-38-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(139,1,'ACR-AS-38-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(140,1,'ACR-AS-38-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(141,1,'ACR-AS-38-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(142,1,'ACR-AS-38-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(143,1,'ACR-AS-38-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(144,1,'ACR-AS-38-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(145,1,'ACR-AS-40-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(146,1,'ACR-AS-40-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(147,1,'ACR-AS-40-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(148,1,'ACR-AS-40-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(149,1,'ACR-AS-40-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(150,1,'ACR-AS-40-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(151,1,'ACR-AS-40-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(152,1,'ACR-AS-40-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(153,1,'ACR-AS-40-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(154,1,'ACR-AS-40-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(155,1,'ACR-AS-40-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(156,1,'ACR-AS-40-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(157,1,'ACR-AI-16-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(158,1,'ACR-AI-16-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(159,1,'ACR-AI-16-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(160,1,'ACR-AI-16-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(161,1,'ACR-AI-16-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(162,1,'ACR-AI-16-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(163,1,'ACR-AI-16-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(164,1,'ACR-AI-16-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(165,1,'ACR-AI-16-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(166,1,'ACR-AI-16-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:14'),(167,1,'ACR-AI-16-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(168,1,'ACR-AI-16-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(169,1,'ACR-AI-18-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(170,1,'ACR-AI-18-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(171,1,'ACR-AI-18-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(172,1,'ACR-AI-18-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(173,1,'ACR-AI-18-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(174,1,'ACR-AI-18-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(175,1,'ACR-AI-18-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(176,1,'ACR-AI-18-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(177,1,'ACR-AI-18-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(178,1,'ACR-AI-18-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(179,1,'ACR-AI-18-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(180,1,'ACR-AI-18-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(181,1,'ACR-AI-20-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(182,1,'ACR-AI-20-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(183,1,'ACR-AI-20-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(184,1,'ACR-AI-20-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(185,1,'ACR-AI-20-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(186,1,'ACR-AI-20-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(187,1,'ACR-AI-20-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(188,1,'ACR-AI-20-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(189,1,'ACR-AI-20-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(190,1,'ACR-AI-20-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(191,1,'ACR-AI-20-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(192,1,'ACR-AI-20-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(193,1,'ACR-AI-25-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(194,1,'ACR-AI-25-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(195,1,'ACR-AI-25-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(196,1,'ACR-AI-25-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(197,1,'ACR-AI-25-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(198,1,'ACR-AI-25-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(199,1,'ACR-AI-25-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(200,1,'ACR-AI-25-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(201,1,'ACR-AI-25-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(202,1,'ACR-AI-25-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(203,1,'ACR-AI-25-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(204,1,'ACR-AI-25-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(205,1,'ACR-AI-26-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(206,1,'ACR-AI-26-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(207,1,'ACR-AI-26-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(208,1,'ACR-AI-26-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(209,1,'ACR-AI-26-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(210,1,'ACR-AI-26-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(211,1,'ACR-AI-26-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(212,1,'ACR-AI-26-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(213,1,'ACR-AI-26-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(214,1,'ACR-AI-26-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(215,1,'ACR-AI-26-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(216,1,'ACR-AI-26-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(217,1,'ACR-AI-30-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(218,1,'ACR-AI-30-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(219,1,'ACR-AI-30-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(220,1,'ACR-AI-30-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(221,1,'ACR-AI-30-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(222,1,'ACR-AI-30-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(223,1,'ACR-AI-30-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(224,1,'ACR-AI-30-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(225,1,'ACR-AI-30-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(226,1,'ACR-AI-30-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(227,1,'ACR-AI-30-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:15'),(228,1,'ACR-AI-30-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(229,1,'ACR-AI-32-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(230,1,'ACR-AI-32-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(231,1,'ACR-AI-32-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(232,1,'ACR-AI-32-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(233,1,'ACR-AI-32-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(234,1,'ACR-AI-32-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(235,1,'ACR-AI-32-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(236,1,'ACR-AI-32-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(237,1,'ACR-AI-32-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(238,1,'ACR-AI-32-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(239,1,'ACR-AI-32-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(240,1,'ACR-AI-32-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(241,1,'ACR-AI-36-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(242,1,'ACR-AI-36-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(243,1,'ACR-AI-36-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(244,1,'ACR-AI-36-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(245,1,'ACR-AI-36-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(246,1,'ACR-AI-36-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(247,1,'ACR-AI-36-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(248,1,'ACR-AI-36-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(249,1,'ACR-AI-36-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(250,1,'ACR-AI-36-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(251,1,'ACR-AI-36-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(252,1,'ACR-AI-36-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(253,1,'ACR-AI-38-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(254,1,'ACR-AI-38-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(255,1,'ACR-AI-38-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(256,1,'ACR-AI-38-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(257,1,'ACR-AI-38-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(258,1,'ACR-AI-38-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(259,1,'ACR-AI-38-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(260,1,'ACR-AI-38-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(261,1,'ACR-AI-38-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(262,1,'ACR-AI-38-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(263,1,'ACR-AI-38-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(264,1,'ACR-AI-38-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(265,1,'ACR-AI-40-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(266,1,'ACR-AI-40-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(267,1,'ACR-AI-40-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(268,1,'ACR-AI-40-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(269,1,'ACR-AI-40-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(270,1,'ACR-AI-40-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(271,1,'ACR-AI-40-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(272,1,'ACR-AI-40-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(273,1,'ACR-AI-40-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(274,1,'ACR-AI-40-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(275,1,'ACR-AI-40-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(276,1,'ACR-AI-40-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(277,1,'ACR-PS-P4-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(278,1,'ACR-PS-P4-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(279,1,'ACR-PS-P4-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(280,1,'ACR-PS-P4-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(281,1,'ACR-PS-P4-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(282,1,'ACR-PS-P4-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(283,1,'ACR-PS-P4-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(284,1,'ACR-PS-P4-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(285,1,'ACR-PS-P4-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(286,1,'ACR-PS-P4-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(287,1,'ACR-PS-P4-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(288,1,'ACR-PS-P4-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(289,1,'ACR-PS-P5-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:16'),(290,1,'ACR-PS-P5-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(291,1,'ACR-PS-P5-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(292,1,'ACR-PS-P5-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(293,1,'ACR-PS-P5-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(294,1,'ACR-PS-P5-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(295,1,'ACR-PS-P5-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(296,1,'ACR-PS-P5-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(297,1,'ACR-PS-P5-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(298,1,'ACR-PS-P5-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(299,1,'ACR-PS-P5-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(300,1,'ACR-PS-P5-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(301,1,'ACR-PS-P6-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(302,1,'ACR-PS-P6-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(303,1,'ACR-PS-P6-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(304,1,'ACR-PS-P6-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(305,1,'ACR-PS-P6-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(306,1,'ACR-PS-P6-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(307,1,'ACR-PS-P6-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(308,1,'ACR-PS-P6-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(309,1,'ACR-PS-P6-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(310,1,'ACR-PS-P6-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(311,1,'ACR-PS-P6-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(312,1,'ACR-PS-P6-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(313,1,'ACR-PI-P4-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(314,1,'ACR-PI-P4-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(315,1,'ACR-PI-P4-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(316,1,'ACR-PI-P4-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(317,1,'ACR-PI-P4-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(318,1,'ACR-PI-P4-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(319,1,'ACR-PI-P4-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(320,1,'ACR-PI-P4-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(321,1,'ACR-PI-P4-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(322,1,'ACR-PI-P4-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(323,1,'ACR-PI-P4-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(324,1,'ACR-PI-P4-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(325,1,'ACR-PI-P5-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(326,1,'ACR-PI-P5-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(327,1,'ACR-PI-P5-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(328,1,'ACR-PI-P5-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(329,1,'ACR-PI-P5-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(330,1,'ACR-PI-P5-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(331,1,'ACR-PI-P5-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(332,1,'ACR-PI-P5-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(333,1,'ACR-PI-P5-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(334,1,'ACR-PI-P5-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(335,1,'ACR-PI-P5-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(336,1,'ACR-PI-P5-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(337,1,'ACR-PI-P6-61-A1',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(338,1,'ACR-PI-P6-62-A2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(339,1,'ACR-PI-P6-66-A3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(340,1,'ACR-PI-P6-67-A3.5',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(341,1,'ACR-PI-P6-81-A4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(342,1,'ACR-PI-P6-B2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(343,1,'ACR-PI-P6-65',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(344,1,'ACR-PI-P6-68',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(345,1,'ACR-PI-P6-69-C3',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(346,1,'ACR-PI-P6-71',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(347,1,'ACR-PI-P6-77-C4',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(348,1,'ACR-PI-P6-D2',NULL,1700.00,1065.00,1,'2026-03-09 14:33:15','2026-03-13 22:15:17'),(349,2,'',NULL,62500.00,41646.09,1,'2026-03-16 20:58:59','2026-03-16 20:58:59'),(350,2,'',NULL,62500.00,41646.09,1,'2026-03-16 20:59:00','2026-03-16 20:59:00'),(351,2,'',NULL,62500.00,41646.09,1,'2026-03-16 20:59:00','2026-03-16 20:59:00');
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
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cost_price` decimal(12,2) DEFAULT '0.00',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Precio de venta sin IVA',
  `compare_price` decimal(12,2) DEFAULT NULL COMMENT 'Precio tachado original',
  `has_variants` tinyint(1) DEFAULT '0',
  `track_stock` tinyint(1) DEFAULT '1',
  `min_stock` int NOT NULL DEFAULT '0',
  `weight` decimal(8,3) DEFAULT NULL COMMENT 'kg',
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `product_type` enum('supply','retail','both') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'retail' COMMENT 'supply=insumo de lab, retail=venta e-commerce, both=ambos',
  `internal_use` tinyint(1) DEFAULT '0' COMMENT 'Si es 1: solo uso interno del lab, no visible en e-commerce',
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_desc` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT '21.00' COMMENT 'Alícuota IVA snapshot al crear/actualizar producto',
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_slug` (`slug`),
  KEY `idx_products_company` (`company_id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_vendor` (`vendor_id`),
  KEY `idx_products_sku` (`sku`),
  KEY `fk_products_tax` (`tax_id`),
  KEY `idx_products_type` (`product_type`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_products_tax` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=222 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,NULL,NULL,1,'Blister Dientes Acritone',NULL,'blister-dientes-acritone','ACRITONE-PARENT',NULL,NULL,NULL,1065.00,1700.00,NULL,1,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:15','2026-03-13 22:15:10',NULL,21.00,NULL),(2,1,NULL,2,1,'ACRILICO POLIMERO AUTOCURABLE x 1Kg','SUBITON','acrilico-polimero-autocurable-subiton-x-1kg','7',NULL,'Hola','<p><span style=\"font-size: 14px;\">El <strong>Polímero Autocurable Subiton</strong> es el estándar de oro para profesionales que buscan precisión y durabilidad en trabajos de prótesis dental y ortodoncia. Este acrílico de termopolimerización en frío (quimiopolimerizable) ha sido diseñado para ofrecer una manipulación excepcional y un acabado estético natural.</span></p><p></p><p><span style=\"color: rgb(220, 38, 38); font-size: 16px;\"><strong><u>Características Principales</u></strong></span></p><p><span style=\"font-size: 14px;\"><strong>Alta Estabilidad Cromática:</strong> Formulado para resistir la decoloración con el tiempo, manteniendo un aspecto natural en la cavidad oral.</span></p><p><span style=\"font-size: 14px;\"><strong>Fase Plástica Prolongada:</strong> Permite un tiempo de trabajo cómodo, facilitando el modelado antes del fraguado final.</span></p><p><span style=\"font-size: 14px;\"><strong>Mínima Porosidad:</strong> Gracias a su granulometría extrafina, se obtiene una superficie densa que facilita el pulido y reduce la acumulación de placa.</span></p><p><span style=\"font-size: 14px;\"><strong>Resistencia Mecánica:</strong> Alta capacidad de absorción de impactos y resistencia a la flexión, garantizando reparaciones duraderas.</span></p><p></p><p><span style=\"color: rgb(220, 38, 38); font-size: 16px;\"><strong><u>Aplicaciones Recomendadas</u></strong></span></p><p><span style=\"font-size: 14px;\">Este polímero es versátil y esencial para diversos procedimientos:</span></p><p><span style=\"font-size: 14px;\"><strong>Reparaciones de prótesis</strong> totales y parciales.</span></p><p><span style=\"font-size: 14px;\"><strong>Rebasados</strong> (dentro y fuera de boca).</span></p><p><span style=\"font-size: 14px;\">Confección de <strong>provisorios</strong> de larga duración.</span></p><p><span style=\"font-size: 14px;\">Elaboración de <strong>cubetas individuales</strong> y aparatos de ortopedia funcional.</span></p><p></p><p><span style=\"font-size: 14px;\"><strong>Nota para el profesional:</strong> Para obtener resultados óptimos, se recomienda utilizarlo en combinación con el <strong>Líquido Monómero Subiton</strong>, respetando las proporciones de mezcla indicadas para evitar contracciones lineales innecesarias.</span></p>',41646.09,62500.00,NULL,1,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21','2026-03-16 21:14:38',NULL,21.00,NULL),(3,1,NULL,NULL,1,'ACRILICO LIQUIDO AUTOCURABLE SUBITON x 1Lt',NULL,'acrilico-liquido-autocurable-subiton-x-1lt','8',NULL,NULL,NULL,27674.00,41500.00,NULL,0,1,1,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21','2026-03-18 00:30:24',NULL,21.00,NULL),(4,1,NULL,NULL,1,'ACRILICO PARA COLADO APC OKI x 800Gs',NULL,'acrilico-para-colado-apc-oki-x-800gs','9',NULL,NULL,NULL,75756.00,113600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(5,1,NULL,NULL,1,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE CELESTE x 1Kg',NULL,'acrilico-para-cubetas-oki-cril-autopolimerizable-celeste-x-1kg','10',NULL,NULL,NULL,46640.00,70000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(6,1,NULL,NULL,1,'ACRILICO PARA ORTODONCIA OKI AUTOPOLIMERIZABLE CRISTAL x 1Kg ',NULL,'acrilico-para-ortodoncia-oki-autopolimerizable-cristal-x-1kg','11',NULL,NULL,NULL,86000.00,129000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(7,1,NULL,NULL,1,'ACRILICO PARA ORTODONCIA OKI AUTOPOLIMERIZABLE BLANCO/NEGRO x 400Gs ',NULL,'acrilico-para-ortodoncia-oki-autopolimerizable-blanconegro-x-400gs','12',NULL,NULL,NULL,42360.00,63500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(8,1,NULL,NULL,1,'ACRILICO ROSADO PARA PLACA BASE INDENTAL x 1 Kg',NULL,'acrilico-rosado-para-placa-base-indental-x-1-kg','13',NULL,NULL,NULL,45000.00,67500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(9,1,NULL,NULL,1,'ACRILICO PARA INYECCION API x 1Kg CLARO',NULL,'acrilico-para-inyeccion-api-x-1kg-claro','14',NULL,NULL,NULL,155800.00,233700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(10,1,NULL,NULL,1,'ACRILICO PARA INYECCION API x 1Kg CRISTAL',NULL,'acrilico-para-inyeccion-api-x-1kg-cristal','15',NULL,NULL,NULL,155800.00,233700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(11,1,NULL,NULL,1,'ACRILICO PARA INYECCION API x 1Kg MEDIO',NULL,'acrilico-para-inyeccion-api-x-1kg-medio','16',NULL,NULL,NULL,155800.00,233700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(12,1,NULL,NULL,1,'ACRILICO PARA INYECCION API x 1Kg OSCURO',NULL,'acrilico-para-inyeccion-api-x-1kg-oscuro','17',NULL,NULL,NULL,155800.00,233700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(13,1,NULL,NULL,1,'ACRILICO PARA INYECCION API x 1Kg ROSADO',NULL,'acrilico-para-inyeccion-api-x-1kg-rosado','18',NULL,NULL,NULL,155800.00,233700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(14,1,NULL,NULL,1,'ACRILICO PARA INYECCION API x 1/2Kg CRISTAL',NULL,'acrilico-para-inyeccion-api-x-12kg-cristal','19',NULL,NULL,NULL,96030.00,144000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(15,1,NULL,NULL,1,'ACRILICO TERMOCURABLE EGEO ROSA x 1Kg',NULL,'acrilico-termocurable-egeo-rosa-x-1kg','20',NULL,NULL,NULL,36000.00,54000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(16,1,NULL,NULL,1,'ACRILICO POLIMERO TERMOCURABLE PROTHOPLAST x 1Kg',NULL,'acrilico-polimero-termocurable-prothoplast-x-1kg','21',NULL,NULL,NULL,36608.51,54900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(17,1,NULL,NULL,1,'ALAMBRE 0,9mm MORELLI x 50Gs',NULL,'alambre-09mm-morelli-x-50gs','22',NULL,NULL,NULL,13000.00,19500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(18,1,NULL,NULL,1,'ALAMBRE PARA APOYOS ACLUSALES O RETENEDORES MEDIA CAÑA 10CM X 5Unid',NULL,'alambre-para-apoyos-aclusales-o-retenedores-media-cana-10cm-x-5unid','23',NULL,NULL,NULL,13000.00,19500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(19,1,NULL,NULL,1,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',NULL,'alginato-high-precision-alginmax-major-x-453gs-vainilla','24',NULL,NULL,NULL,10000.00,15000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(20,1,NULL,NULL,1,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',NULL,'alginato-extra-high-precision-alginplus-major-x-453gs-frutos-tropicales','25',NULL,NULL,NULL,9900.00,14800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(21,1,NULL,NULL,1,'BARBIJO DESCARTABLE VERDE Caja x 50Un',NULL,'barbijo-descartable-verde-caja-x-50un','26',NULL,NULL,NULL,5200.00,8300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(22,1,NULL,NULL,1,'BARBIJO DESCARTABLE NEGRO Caja x 50Un',NULL,'barbijo-descartable-negro-caja-x-50un','27',NULL,NULL,NULL,5200.00,8300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(23,1,NULL,NULL,1,'BARBIJO DESCARTABLE  BLANCO Caja x 50Un',NULL,'barbijo-descartable-blanco-caja-x-50un','28',NULL,NULL,NULL,5200.00,8300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(24,1,NULL,NULL,1,'BARBIJO DESCARTABLE CELESTE Caja x 50Un',NULL,'barbijo-descartable-celeste-caja-x-50un','29',NULL,NULL,NULL,5200.00,8300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(25,1,NULL,NULL,1,'BARBIJO DESCARTABLE ROSADO Caja x 50Un',NULL,'barbijo-descartable-rosado-caja-x-50un','30',NULL,NULL,NULL,5200.00,8300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(26,1,NULL,NULL,1,'BASE PORTA PINCEL INDENTAL ',NULL,'base-porta-pincel-indental','32',NULL,NULL,NULL,44000.00,70400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(27,1,NULL,NULL,1,'BISTURI HOJAS DESCARTABLES x Unidad',NULL,'bisturi-hojas-descartables-x-unidad','33',NULL,NULL,NULL,156.95,250.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(28,1,NULL,NULL,1,'BISTURI HOJAS DESCARTABLES Caja x 50Un',NULL,'bisturi-hojas-descartables-caja-x-50un','34',NULL,NULL,NULL,13078.80,18300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(29,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 120mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-classic-22mm-x-120mm-rosa-medio','382',NULL,NULL,NULL,6600.00,9900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(30,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 85mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-classic-22mm-x-85mm-rosa-medio','383',NULL,NULL,NULL,5950.00,8900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(31,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 55mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-classic-22mm-x-55mm-rosa-medio','384',NULL,NULL,NULL,5000.00,7500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(32,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 90mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-classic-25mm-x-90mm-rosa-medio','385',NULL,NULL,NULL,6600.00,9900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(33,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 70mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-classic-25mm-x-70mm-rosa-medio','386',NULL,NULL,NULL,5950.00,8900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(34,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 50mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-classic-25mm-x-50mm-rosa-medio','387',NULL,NULL,NULL,5000.00,7500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(35,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 120mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-fluence-22mm-x-120mm-rosa-medio','388',NULL,NULL,NULL,6600.00,9900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(36,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 85mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-fluence-22mm-x-85mm-rosa-medio','389',NULL,NULL,NULL,5950.00,8900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(37,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 55mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-fluence-22mm-x-55mm-rosa-medio','390',NULL,NULL,NULL,5000.00,7500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(38,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 90mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-fluence-25mm-x-90mm-rosa-medio','391',NULL,NULL,NULL,6600.00,9900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(39,1,NULL,NULL,1,'CARTUCHO POLIAMIDA DEFLEX FLUENCE 25mm x 70mm ROSA MEDIO',NULL,'cartucho-poliamida-deflex-fluence-25mm-x-70mm-rosa-medio','392',NULL,NULL,NULL,5950.00,8900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(40,1,NULL,NULL,1,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 50mm ROSA MEDIO',NULL,'cartucho-poliamida-para-inyeccion-deflex-fluence-25mm-x-50mm-rosa-medio','393',NULL,NULL,NULL,5000.00,7500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(41,1,NULL,NULL,1,'CARTUCHO PARA INYECCION INDENTAL INDENT FLEX 22mm x 120mm ',NULL,'cartucho-para-inyeccion-indental-indent-flex-22mm-x-120mm','394',NULL,NULL,NULL,4500.00,6700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(42,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 22mm CLARO',NULL,'cartucho-acrilico-para-inyeccion-api-22mm-claro','395',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(43,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 22mm CRISTAL',NULL,'cartucho-acrilico-para-inyeccion-api-22mm-cristal','396',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(44,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 22mm MEDIO',NULL,'cartucho-acrilico-para-inyeccion-api-22mm-medio','397',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(45,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 22mm OSCURO',NULL,'cartucho-acrilico-para-inyeccion-api-22mm-oscuro','398',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(46,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 22mm ROSADO',NULL,'cartucho-acrilico-para-inyeccion-api-22mm-rosado','399',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(47,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 25mm CLARO',NULL,'cartucho-acrilico-para-inyeccion-api-25mm-claro','400',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(48,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 25mm CRISTAL',NULL,'cartucho-acrilico-para-inyeccion-api-25mm-cristal','401',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(49,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 25mm MEDIO',NULL,'cartucho-acrilico-para-inyeccion-api-25mm-medio','402',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(50,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 25mm OSCURO',NULL,'cartucho-acrilico-para-inyeccion-api-25mm-oscuro','403',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(51,1,NULL,NULL,1,'CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO',NULL,'cartucho-acrilico-para-inyeccion-api-25mm-rosado','404',NULL,NULL,NULL,7420.00,11100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(52,1,NULL,NULL,1,'CARTUCHOS VACIOS PARA INYECCION INDENTAL 22mm x 120mm CON TAPA ',NULL,'cartuchos-vacios-para-inyeccion-indental-22mm-x-120mm-con-tapa','405',NULL,NULL,NULL,800.00,1300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(53,1,NULL,NULL,1,'CARTUCHOS VACIOS PARA INYECCION INDENTAL 25mm x 100mm CON TAPA ',NULL,'cartuchos-vacios-para-inyeccion-indental-25mm-x-100mm-con-tapa','406',NULL,NULL,NULL,800.00,1300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(54,1,NULL,NULL,1,'CEPILLO 2 HILERAS ROMAN PARA PULIDORA x UNIDAD',NULL,'cepillo-2-hileras-roman-para-pulidora-x-unidad','407',NULL,NULL,NULL,4000.00,6000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(55,1,NULL,NULL,1,'CERA CERVICAL OKI x 50gr',NULL,'cera-cervical-oki-x-50gr','408',NULL,NULL,NULL,37000.00,59200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(56,1,NULL,NULL,1,'CERA CROMO INDENTAL x 1/2Kg',NULL,'cera-cromo-indental-x-12kg','409',NULL,NULL,NULL,37000.00,59200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(57,1,NULL,NULL,1,'CERA ROSA EN LAMINAS INDENTAL CAJA x 1Kg',NULL,'cera-rosa-en-laminas-indental-caja-x-1kg','410',NULL,NULL,NULL,36100.00,57800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(58,1,NULL,NULL,1,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',NULL,'cera-rosa-en-laminas-indental-x-unidad','411',NULL,NULL,NULL,700.00,1100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(59,1,NULL,NULL,1,'CERA PARA INMERSION OKI x 30Gs',NULL,'cera-para-inmersion-oki-x-30gs','412',NULL,NULL,NULL,29700.00,47500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(60,1,NULL,NULL,1,'CERA PREFORMADA INDENTAL PLACA CERICA INF. O SUP. x UNIDAD',NULL,'cera-preformada-indental-placa-cerica-inf-o-sup-x-unidad','413',NULL,NULL,NULL,560.00,900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(61,1,NULL,NULL,1,'CERA REGULAR PARA FIJA OKI VARIOS COLORES x 50Gs ',NULL,'cera-regular-para-fija-oki-varios-colores-x-50gs','414',NULL,NULL,NULL,33000.00,52800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(62,1,NULL,NULL,1,'CIZALLA PARA CORTE YESO',NULL,'cizalla-para-corte-yeso','415',NULL,NULL,NULL,27500.00,38500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(63,1,NULL,NULL,1,'COMPRESA PAQUETE x 50 UNIDADES',NULL,'compresa-paquete-x-50-unidades','416',NULL,NULL,NULL,6000.00,8400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(64,1,NULL,NULL,1,'CREMA SUPER BRILLO INDENTAL x 20Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)',NULL,'crema-super-brillo-indental-x-20gs-poliamida-flexible-acrilico-metal','417',NULL,NULL,NULL,19000.00,30400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(65,1,NULL,NULL,1,'DESMOLDANTE PARA INYECCION INDENTAL EN AEROSOL',NULL,'desmoldante-para-inyeccion-indental-en-aerosol','418',NULL,NULL,NULL,10100.00,1620.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(66,1,NULL,NULL,1,'DESMOLDANTE SILICONADO PARA INYECCION DEFLEX EN AEROSOL x 290Gs',NULL,'desmoldante-siliconado-para-inyeccion-deflex-en-aerosol-x-290gs','419',NULL,NULL,NULL,5800.00,8700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(67,1,NULL,NULL,1,'DISCO DE FIBRA SILICIO FLEXIBLE 22mm x 0,2mm',NULL,'disco-de-fibra-silicio-flexible-22mm-x-02mm','420',NULL,NULL,NULL,1900.00,3000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(68,1,NULL,NULL,1,'DOSIFICADOR AGUA-ALGINATO',NULL,'dosificador-agua-alginato','421',NULL,NULL,NULL,2200.00,3000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(69,1,NULL,NULL,1,'ESTUCHE BUCAL PLASTICO VARIOS COLORES',NULL,'estuche-bucal-plastico-varios-colores','422',NULL,NULL,NULL,1000.00,1600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(70,1,NULL,NULL,1,'FLAMEADOR ROMAN',NULL,'flameador-roman','423',NULL,NULL,NULL,4400.00,6500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(71,1,NULL,NULL,1,'FRESON CARBURO ',NULL,'freson-carburo','424',NULL,NULL,NULL,15500.00,24800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(72,1,NULL,NULL,1,'GELATINA PARA COLADO API SOBRE PARA 1Kg',NULL,'gelatina-para-colado-api-sobre-para-1kg','425',NULL,NULL,NULL,26800.00,42900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(73,1,NULL,NULL,1,'GLACE PARA PORCELANA INDENTAL MONO PASTA x 10gr ',NULL,'glace-para-porcelana-indental-mono-pasta-x-10gr','426',NULL,NULL,NULL,67000.00,107200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(74,1,NULL,NULL,1,'GUANTES LATEX DESCARTABLES CAJA x 100 Ud ',NULL,'guantes-latex-descartables-caja-x-100-ud','427',NULL,NULL,NULL,6200.00,8700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(75,1,NULL,NULL,1,'GUANTES NITRILO DESCARTABLES CAJA x 100 Ud ',NULL,'guantes-nitrilo-descartables-caja-x-100-ud','428',NULL,NULL,NULL,6200.00,8700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(76,1,NULL,NULL,1,'HORNO DE DESENCERADO COMPUTARIZADO TECNODENT H-21 E FURNACE USADO',NULL,'horno-de-desencerado-computarizado-tecnodent-h-21-e-furnace-usado','430',NULL,NULL,NULL,900000.00,1440000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(77,1,NULL,NULL,1,'INDENT-FLEX MATERIAL DE INYECCION INDENTAL x 1Kg',NULL,'indent-flex-material-de-inyeccion-indental-x-1kg','431',NULL,NULL,NULL,70900.00,99300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(78,1,NULL,NULL,1,'INDENT-FLEX MATERIAL DE INYECCION INDENTAL x 1/2Kg',NULL,'indent-flex-material-de-inyeccion-indental-x-12kg','432',NULL,NULL,NULL,40700.00,57000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(79,1,NULL,NULL,1,'INYECTORA COMPUTARIZADA INDENTAL PARA FLEXIBLE DE AIRE',NULL,'inyectora-computarizada-indental-para-flexible-de-aire','433',NULL,NULL,NULL,1225000.00,1960000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(80,1,NULL,NULL,1,'KIT SISTEMA COLADO APC ',NULL,'kit-sistema-colado-apc','434',NULL,NULL,NULL,415000.00,581000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(81,1,NULL,NULL,1,'KIT REPARACION PARA API',NULL,'kit-reparacion-para-api','435',NULL,NULL,NULL,32000.00,44800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(82,1,NULL,NULL,1,'KIT ZOCALOS ROSA',NULL,'kit-zocalos-rosa','436',NULL,NULL,NULL,10990.00,15400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(83,1,NULL,NULL,1,'LACA OPACADORA PARA ACRILICO INDENTAL COLOR ROSA',NULL,'laca-opacadora-para-acrilico-indental-color-rosa','437',NULL,NULL,NULL,23900.00,33500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(84,1,NULL,NULL,1,'LACA OPACADORA PARA ACRILICO INDENTAL COLOR DIENTE',NULL,'laca-opacadora-para-acrilico-indental-color-diente','438',NULL,NULL,NULL,23900.00,33500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(85,1,NULL,NULL,1,'LACA DE ESCAYOLA INDENTAL',NULL,'laca-de-escayola-indental','439',NULL,NULL,NULL,14000.00,19600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(86,1,NULL,NULL,1,'LIQUIDO CHEQUEADOR DE SUPERFICIES INDENTAL',NULL,'liquido-chequeador-de-superficies-indental','440',NULL,NULL,NULL,7000.00,9800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(87,1,NULL,NULL,1,'LIQUIDO GLACE PARA PORCELANA OKI',NULL,'liquido-glace-para-porcelana-oki','441',NULL,NULL,NULL,25000.00,35000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(88,1,NULL,NULL,1,'LIQUIDO MODELADOR PARA PORCELANA OKI x 100cc',NULL,'liquido-modelador-para-porcelana-oki-x-100cc','442',NULL,NULL,NULL,30000.00,42000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(89,1,NULL,NULL,1,'MANDRIL PARA DISCO ',NULL,'mandril-para-disco','443',NULL,NULL,NULL,860.00,1400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(90,1,NULL,NULL,1,'MANDRIL PARA LIJA',NULL,'mandril-para-lija','444',NULL,NULL,NULL,860.00,1400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(91,1,NULL,NULL,1,'MATRIZ DE PONTICOS Y TRAMOS PARA PORCELANA',NULL,'matriz-de-ponticos-y-tramos-para-porcelana','445',NULL,NULL,NULL,45000.00,500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(92,1,NULL,NULL,1,'MATRIZ DE SILICONA PARA CARILLAS PARA SOBRE DENTADURA',NULL,'matriz-de-silicona-para-carillas-para-sobre-dentadura','446',NULL,NULL,NULL,45000.00,58500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(93,1,NULL,NULL,1,'MATRIZ DE SILICONA PARA CARAS OCLUSALES',NULL,'matriz-de-silicona-para-caras-oclusales','447',NULL,NULL,NULL,45000.00,58500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(94,1,NULL,NULL,1,'MATRIZ DE SILICONA PARA RODETES',NULL,'matriz-de-silicona-para-rodetes','448',NULL,NULL,NULL,45000.00,58500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(95,1,NULL,NULL,1,'MECHERO PARA LABORATORIO CON RECIPIENTE CON VALVULA',NULL,'mechero-para-laboratorio-con-recipiente-con-valvula','449',NULL,NULL,NULL,134000.00,174200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(96,1,NULL,NULL,1,'MICROBRUSH',NULL,'microbrush','450',NULL,NULL,NULL,3270.00,5200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(97,1,NULL,NULL,1,'MICROMOTOR ELECTRICO RENHE 119',NULL,'micromotor-electrico-renhe-119','451',NULL,NULL,NULL,189000.00,264600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(98,1,NULL,NULL,1,'MINIACUTRAC',NULL,'miniacutrac','452',NULL,NULL,NULL,9000.00,12600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(99,1,NULL,NULL,1,'MODIFICADOR DE COLORES PARA ACRILICO KIT DE 4 COLORES + BETAS',NULL,'modificador-de-colores-para-acrilico-kit-de-4-colores-betas','453',NULL,NULL,NULL,35000.00,49000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(100,1,NULL,NULL,1,'MONOMERO PARA COLADO OKI x 1Lt',NULL,'monomero-para-colado-oki-x-1lt','454',NULL,NULL,NULL,42140.00,59000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(101,1,NULL,NULL,1,'MONOMERO SEMIFLEX API x 1Lt',NULL,'monomero-semiflex-api-x-1lt','455',NULL,NULL,NULL,60110.00,84100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(102,1,NULL,NULL,1,'MONOMERO TERMOCURADO x 1Lt',NULL,'monomero-termocurado-x-1lt','456',NULL,NULL,NULL,23000.00,36800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(103,1,NULL,NULL,1,'MONOMERO AUTO x 1Lt NEW POLL',NULL,'monomero-auto-x-1lt-new-poll','457',NULL,NULL,NULL,51775.00,72500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(104,1,NULL,NULL,1,'MONOMERO AUTO x 1Lt VERACRIL',NULL,'monomero-auto-x-1lt-veracril','458',NULL,NULL,NULL,38935.00,54500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(105,1,NULL,NULL,1,'MONOMERO AUTO x 1Lt VAICEL',NULL,'monomero-auto-x-1lt-vaicel','459',NULL,NULL,NULL,36923.00,51700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(106,1,NULL,NULL,1,'MONOMERO AUTO x 1Lt SUBITON',NULL,'monomero-auto-x-1lt-subiton','460',NULL,NULL,NULL,36868.00,51700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(107,1,NULL,NULL,1,'MONOMERO TERMO x 1Lt NEW POLL',NULL,'monomero-termo-x-1lt-new-poll','461',NULL,NULL,NULL,49478.00,69300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(108,1,NULL,NULL,1,'MONOMERO TERMO x 1Lt VERACRIL',NULL,'monomero-termo-x-1lt-veracril','462',NULL,NULL,NULL,37755.00,52900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(109,1,NULL,NULL,1,'MONOMERO TERMO x 1Lt TERMODEN',NULL,'monomero-termo-x-1lt-termoden','463',NULL,NULL,NULL,33725.00,47200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(110,1,NULL,NULL,1,'MONOMERO TERMO x 1Lt VAICRON',NULL,'monomero-termo-x-1lt-vaicron','464',NULL,NULL,NULL,29082.00,40700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(111,1,NULL,NULL,1,'MONOMERO TERMO x 1Lt PROTHOPLAST',NULL,'monomero-termo-x-1lt-prothoplast','465',NULL,NULL,NULL,27839.00,39000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(112,1,NULL,NULL,1,'MUFLA PARA SISTEMA APC INDENTAL',NULL,'mufla-para-sistema-apc-indental','466',NULL,NULL,NULL,78000.00,109200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(113,1,NULL,NULL,1,'MUFLA METALICA PARA INYECTORA DEFLEX ',NULL,'mufla-metalica-para-inyectora-deflex','467',NULL,NULL,NULL,20000.00,28000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(114,1,NULL,NULL,1,'OCLUSORES PLASTICOS PARA FIJA',NULL,'oclusores-plasticos-para-fija','468',NULL,NULL,NULL,360.00,500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(115,1,NULL,NULL,1,'OCLUSORES PARA REMOVIBLE ROMAN',NULL,'oclusores-para-removible-roman','469',NULL,NULL,NULL,1400.00,2000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(116,1,NULL,NULL,1,'OPACIFICADOR DE METALES BASE ROSA INDENTAL',NULL,'opacificador-de-metales-base-rosa-indental','470',NULL,NULL,NULL,10000.00,14000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(117,1,NULL,NULL,1,'OPACIFICADOR DE METALES BASE DIENTE INDENTAL',NULL,'opacificador-de-metales-base-diente-indental','471',NULL,NULL,NULL,10000.00,14000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(118,1,NULL,NULL,1,'PASTA PARA BRILLO DEFLEX x 200Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)',NULL,'pasta-para-brillo-deflex-x-200gs-poliamida-flexible-acrilico-metal','472',NULL,NULL,NULL,6500.00,9100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(119,1,NULL,NULL,1,'PASTA ALTO BRILLO INDENTAL x 20Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)',NULL,'pasta-alto-brillo-indental-x-20gs-poliamida-flexible-acrilico-metal','473',NULL,NULL,NULL,1000.00,1400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(120,1,NULL,NULL,1,'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX BLANCO',NULL,'pasta-para-soporte-de-corona-jeringa-super-fix-blanco','474',NULL,NULL,NULL,3500.00,4900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(121,1,NULL,NULL,1,'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX MARRON',NULL,'pasta-para-soporte-de-corona-jeringa-super-fix-marron','475',NULL,NULL,NULL,3500.00,4900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(122,1,NULL,NULL,1,'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX BEIGE',NULL,'pasta-para-soporte-de-corona-jeringa-super-fix-beige','476',NULL,NULL,NULL,3500.00,4900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(123,1,NULL,NULL,1,'PIEDRA POMEZ COMUN INDENTAL SUPER ESPECIAL x 1Kg',NULL,'piedra-pomez-comun-indental-super-especial-x-1kg','477',NULL,NULL,NULL,3850.00,5400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(124,1,NULL,NULL,1,'PINCEL MANGO N°4 ',NULL,'pincel-mango-n4','478',NULL,NULL,NULL,4000.00,5600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(125,1,NULL,NULL,1,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x UNIDAD ',NULL,'placas-para-termoformado-rigida-008-2mm-egeo-x-unidad','479',NULL,NULL,NULL,1800.00,2900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(126,1,NULL,NULL,1,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un ',NULL,'placas-para-termoformado-rigida-008-2mm-egeo-x-pack-x-5un','480',NULL,NULL,NULL,12000.00,19200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(127,1,NULL,NULL,1,'PLACAS PARA TERMOFORMADO RIGIDA 0,02 (0,5mm) DENT 3D x PACK x 10Un ',NULL,'placas-para-termoformado-rigida-002-05mm-dent-3d-x-pack-x-10un','481',NULL,NULL,NULL,5000.00,8000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(128,1,NULL,NULL,1,'PLACAS PARA TERMOFORMADO RIGIDA 0,03 (0,75mm) DENT 3D x PACK x 10Un ',NULL,'placas-para-termoformado-rigida-003-075mm-dent-3d-x-pack-x-10un','482',NULL,NULL,NULL,5500.00,8800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(129,1,NULL,NULL,1,'PLACAS PARA TERMOFORMADO RIGIDA 0,04 (1mm) DENT 3D x PACK x 10Un ',NULL,'placas-para-termoformado-rigida-004-1mm-dent-3d-x-pack-x-10un','483',NULL,NULL,NULL,6000.00,9600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(130,1,NULL,NULL,1,'PORTAGUANTES',NULL,'portaguantes','484',NULL,NULL,NULL,5000.00,7000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(131,1,NULL,NULL,1,'PORTA INSTRUMENTAL INDENTAL ',NULL,'porta-instrumental-indental','485',NULL,NULL,NULL,25000.00,35000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(132,1,NULL,NULL,1,'REFUERZO SUPERIOR ENMALLADO DE ACERO INOX x 10 UNIDADES',NULL,'refuerzo-superior-enmallado-de-acero-inox-x-10-unidades','486',NULL,NULL,NULL,8200.00,11500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(133,1,NULL,NULL,1,'REFUERZO SUPERIOR ENMALLADO DE ACERO INOX x UNIDAD',NULL,'refuerzo-superior-enmallado-de-acero-inox-x-unidad','487',NULL,NULL,NULL,950.00,1300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(134,1,NULL,NULL,1,'REFUERZO INFERIOR ENMALLADO DE ACERO INOX x 10 UNIDADES',NULL,'refuerzo-inferior-enmallado-de-acero-inox-x-10-unidades','488',NULL,NULL,NULL,8200.00,11500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(135,1,NULL,NULL,1,'REFUERZO INFERIOR ENMALLADO DE ACERO INOX x UNIDAD',NULL,'refuerzo-inferior-enmallado-de-acero-inox-x-unidad','489',NULL,NULL,NULL,950.00,1300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(136,1,NULL,NULL,1,'REFUERZO SUPERIOR PERFORADO DE ACERO INOX x 10 UNIDADES',NULL,'refuerzo-superior-perforado-de-acero-inox-x-10-unidades','490',NULL,NULL,NULL,12000.00,16800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(137,1,NULL,NULL,1,'REFUERZO SUPERIOR PERFORADO DE ACERO INOX x UNIDAD',NULL,'refuerzo-superior-perforado-de-acero-inox-x-unidad','491',NULL,NULL,NULL,1400.00,2000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(138,1,NULL,NULL,1,'REFUERZO INFERIOR PERFORADO DE ACERO INOX x 10 UNIDADES',NULL,'refuerzo-inferior-perforado-de-acero-inox-x-10-unidades','492',NULL,NULL,NULL,12000.00,16800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(139,1,NULL,NULL,1,'REFUERZO INFERIOR PERFORADO DE ACERO INOX x UNIDAD',NULL,'refuerzo-inferior-perforado-de-acero-inox-x-unidad','493',NULL,NULL,NULL,1400.00,2000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(140,1,NULL,NULL,1,'RETENEDORES MULTIRET VARIOS COLORES TIRA DE 5 RETENEDORES CADA UNA',NULL,'retenedores-multiret-varios-colores-tira-de-5-retenedores-cada-una','494',NULL,NULL,NULL,3500.00,4900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(141,1,NULL,NULL,1,'REVESTIMIENTO GILVEST HS x 160Gs',NULL,'revestimiento-gilvest-hs-x-160gs','495',NULL,NULL,NULL,2000.00,2800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(142,1,NULL,NULL,1,'REVESTIMIENTO KERA VEST AVIO 2Kg REVEST. + 420cc LIQUIDO ',NULL,'revestimiento-kera-vest-avio-2kg-revest-420cc-liquido','496',NULL,NULL,NULL,38000.00,53200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(143,1,NULL,NULL,1,'REVESTIMIENTO VENTURA HIGH VEST AVIO 2Kg REVEST. + 480cc LIQUIDO',NULL,'revestimiento-ventura-high-vest-avio-2kg-revest-480cc-liquido','497',NULL,NULL,NULL,29000.00,40600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(144,1,NULL,NULL,1,'RUEDA DE PAÑO DEFLEX PAREA PULIDO Y BRILLO',NULL,'rueda-de-pano-deflex-parea-pulido-y-brillo','498',NULL,NULL,NULL,4100.00,5700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(145,1,NULL,NULL,1,'SEPARADOR DE ACRILICO OKI x 1Lt ROSA ',NULL,'separador-de-acrilico-oki-x-1lt-rosa','499',NULL,NULL,NULL,8000.00,11200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(146,1,NULL,NULL,1,'SEPARADOR DE ACRILICO DEFLEX x 1Lt ROSA ',NULL,'separador-de-acrilico-deflex-x-1lt-rosa','500',NULL,NULL,NULL,5600.00,7800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(147,1,NULL,NULL,1,'SEPARADOR LIQUIDO OKI LUBE x 20cc',NULL,'separador-liquido-oki-lube-x-20cc','501',NULL,NULL,NULL,12400.00,16500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(148,1,NULL,NULL,1,'SEPARADOR DE ACRILICO OKI EN SOBRE x 100Gs',NULL,'separador-de-acrilico-oki-en-sobre-x-100gs','502',NULL,NULL,NULL,7000.00,9800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(149,1,NULL,NULL,1,'YESO DENSITA TIPO V AMARILLO PESCIO x 1Kg',NULL,'yeso-densita-tipo-v-amarillo-pescio-x-1kg','503',NULL,NULL,NULL,6000.00,9600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(150,1,NULL,NULL,1,'YESO DENDITA TIPO IV ROSA PESCIO x 1Kg',NULL,'yeso-dendita-tipo-iv-rosa-pescio-x-1kg','504',NULL,NULL,NULL,4500.00,7200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(151,1,NULL,NULL,1,'YESO PIEDRA AZUL PESCIO x 25Kg',NULL,'yeso-piedra-azul-pescio-x-25kg','505',NULL,NULL,NULL,31900.00,51000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(152,1,NULL,NULL,1,'YESO PIEDRA AZUL PESCIO x 1Kg',NULL,'yeso-piedra-azul-pescio-x-1kg','506',NULL,NULL,NULL,1400.00,2300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(153,1,NULL,NULL,1,'YESO PIEDRA VERDE PESCIO x 25Kg',NULL,'yeso-piedra-verde-pescio-x-25kg','507',NULL,NULL,NULL,31900.00,51000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(154,1,NULL,NULL,1,'YESO PIEDRA VERDE PESCIO x 1Kg',NULL,'yeso-piedra-verde-pescio-x-1kg','508',NULL,NULL,NULL,1400.00,2300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(155,1,NULL,NULL,1,'YESO TALLER BLANCO PESCIO x 25Kg',NULL,'yeso-taller-blanco-pescio-x-25kg','509',NULL,NULL,NULL,30000.00,48000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(156,1,NULL,NULL,1,'YESO TALLER BLANCO PESCIO x 1Kg',NULL,'yeso-taller-blanco-pescio-x-1kg','510',NULL,NULL,NULL,1300.00,2200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(157,1,NULL,NULL,1,'YESO TALLER AMARILLO PESCIO x 25Kg',NULL,'yeso-taller-amarillo-pescio-x-25kg','511',NULL,NULL,NULL,30000.00,48000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(158,1,NULL,NULL,1,'YESO TALLER AMARILLO PESCIO x 1Kg',NULL,'yeso-taller-amarillo-pescio-x-1kg','512',NULL,NULL,NULL,1300.00,2200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(159,1,NULL,NULL,1,'Z-PRIME BISCO ADHESIVO ZIRCONIO-ALUMINA-METAL x 2Ml',NULL,'z-prime-bisco-adhesivo-zirconio-alumina-metal-x-2ml','513',NULL,NULL,NULL,0.00,0.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(160,1,NULL,NULL,1,'SEPARADOR ACRILICO 100CC',NULL,'separador-acrilico-100cc','514',NULL,NULL,NULL,750.00,1200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(161,1,NULL,NULL,1,'ALCOHOL ETILICO ',NULL,'alcohol-etilico','515',NULL,NULL,NULL,4200.00,6700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(162,1,NULL,NULL,1,'TAZA DE GOMA PARA YESO \"ROMAN\"',NULL,'taza-de-goma-para-yeso-roman','516',NULL,NULL,NULL,1950.00,2700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(163,1,NULL,NULL,1,'ESPATULA PLASTICA',NULL,'espatula-plastica','517',NULL,NULL,NULL,320.00,500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(164,1,NULL,NULL,1,'ACRILICO SUBITON POLVO X 1000GR',NULL,'acrilico-subiton-polvo-x-1000gr','518',NULL,NULL,NULL,52000.00,72800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(165,1,NULL,NULL,1,'PROTHOPLAST LOQUIDO X100 ',NULL,'prothoplast-loquido-x100','519',NULL,NULL,NULL,27840.00,39000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(166,1,NULL,NULL,1,'VASO DAPPEN VIDRIO',NULL,'vaso-dappen-vidrio','520',NULL,NULL,NULL,855.00,1200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(167,1,NULL,NULL,1,'TALLADOR LECRON  ',NULL,'tallador-lecron','521',NULL,NULL,NULL,2175.00,3000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(168,1,NULL,NULL,1,'GUANTES LATEX ELIT ',NULL,'guantes-latex-elit','522',NULL,NULL,NULL,3330.00,4700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(169,1,NULL,NULL,1,'BARBIJOS TRIPACA X50 U.',NULL,'barbijos-tripaca-x50-u','523',NULL,NULL,NULL,1280.00,2000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(170,1,NULL,NULL,1,'REV HIL VEST',NULL,'rev-hil-vest','524',NULL,NULL,NULL,2264.00,3200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(171,1,NULL,NULL,1,'MODELOS SUPERIOR E INFERIOR ',NULL,'modelos-superior-e-inferior','525',NULL,NULL,NULL,780.00,900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(172,1,NULL,NULL,1,'BARBIJO POR UNIDAD ',NULL,'barbijo-por-unidad','526',NULL,NULL,NULL,125.00,200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(173,1,NULL,NULL,1,'BARBIJOS POR 10 UNIDADES',NULL,'barbijos-por-10-unidades','527',NULL,NULL,NULL,1000.00,1600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(174,1,NULL,NULL,1,'COMPRESA POR UNIDAD',NULL,'compresa-por-unidad','528',NULL,NULL,NULL,100.00,160.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(175,1,NULL,NULL,1,'COMPRESA POR 10 UNIDADES ',NULL,'compresa-por-10-unidades','529',NULL,NULL,NULL,950.00,1500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(176,1,NULL,NULL,1,'GUANTES POR UNIDAD ',NULL,'guantes-por-unidad','530',NULL,NULL,NULL,125.00,200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(177,1,NULL,NULL,1,'GUANTES POR 10 PARES',NULL,'guantes-por-10-pares','531',NULL,NULL,NULL,1095.00,1700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(178,1,NULL,NULL,1,'TAZA DE GOMA + ESPATULA PLASTICO',NULL,'taza-de-goma-espatula-plastico','532',NULL,NULL,NULL,2200.00,3500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(179,1,NULL,NULL,1,'COMPRESAS EVODENT X50',NULL,'compresas-evodent-x50','533',NULL,NULL,NULL,1735.00,2800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(180,1,NULL,NULL,1,'ESPATULA PLASTICA COMUN',NULL,'espatula-plastica-comun','534',NULL,NULL,NULL,320.00,500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(181,1,NULL,NULL,1,'MODELOS DE YESO ',NULL,'modelos-de-yeso','536',NULL,NULL,NULL,500.00,900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(182,1,NULL,NULL,1,'BARRITA DE CERA',NULL,'barrita-de-cera','537',NULL,NULL,NULL,350.00,600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(183,1,NULL,NULL,1,'TAZAS DE GOMA ',NULL,'tazas-de-goma','538',NULL,NULL,NULL,1500.00,2400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(184,1,NULL,NULL,1,'10 TAZAS DE GOMA ',NULL,'10-tazas-de-goma','539',NULL,NULL,NULL,18760.00,30000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(185,1,NULL,NULL,1,'10 ESPATULAS PLASTICO ',NULL,'10-espatulas-plastico','540',NULL,NULL,NULL,2800.00,4500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(186,1,NULL,NULL,1,'10 MODELO DE YESO SUP ',NULL,'10-modelo-de-yeso-sup','541',NULL,NULL,NULL,5480.00,8800.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(187,1,NULL,NULL,1,'100 GRAMOS DE ACRILICO ',NULL,'100-gramos-de-acrilico','542',NULL,NULL,NULL,3500.00,5600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(188,1,NULL,NULL,1,'CUBETA PLASTICA  AUTOCLAVABLES ',NULL,'cubeta-plastica-autoclavables','543',NULL,NULL,NULL,873.00,1400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(189,1,NULL,NULL,1,'DOSIFICADOR DE ALGINATO ',NULL,'dosificador-de-alginato','544',NULL,NULL,NULL,1950.00,3100.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(190,1,NULL,NULL,1,'COMPRESA EVODENT ',NULL,'compresa-evodent','545',NULL,NULL,NULL,1840.00,3000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(191,1,NULL,NULL,1,'CUBETA PLASTICA COLOR AZUL ',NULL,'cubeta-plastica-color-azul','546',NULL,NULL,NULL,890.00,2000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(192,1,NULL,NULL,1,'CUBETA VERDE ',NULL,'cubeta-verde','547',NULL,NULL,NULL,1438.00,2300.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(193,1,NULL,NULL,1,'ALGINATO DE 410 GRS ',NULL,'alginato-de-410-grs','548',NULL,NULL,NULL,7000.00,11200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(194,1,NULL,NULL,1,'VASO DAPPEN SILICONA ',NULL,'vaso-dappen-silicona','549',NULL,NULL,NULL,4602.51,7400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(195,1,NULL,NULL,1,'INSTRUMENTO PKT (PETER K THOMAS)',NULL,'instrumento-pkt-peter-k-thomas','551',NULL,NULL,NULL,11880.00,19000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(196,1,NULL,NULL,1,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',NULL,'mechero-de-alcohol-tipo-bunsen-metalico','552',NULL,NULL,NULL,9000.00,13000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(197,1,NULL,NULL,1,'MACROMODELO PARA ANATOMIA DENTARIA ',NULL,'macromodelo-para-anatomia-dentaria','553',NULL,NULL,NULL,3438.00,5500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(198,1,NULL,NULL,1,'MONOMERO AUTO X 100CC',NULL,'monomero-auto-x-100cc','554',NULL,NULL,NULL,3120.00,5000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(199,1,NULL,NULL,1,'MODELO DENSITA',NULL,'modelo-densita','555',NULL,NULL,NULL,1050.00,1700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(200,1,NULL,NULL,1,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',NULL,'acrilico-para-cubetas-oki-cril-autopolimerizable-rosado-x-50gs','556',NULL,NULL,NULL,2500.00,4000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(201,1,NULL,NULL,1,'COFIA DESCARTABLE POR UNIDAD',NULL,'cofia-descartable-por-unidad','557',NULL,NULL,NULL,50.00,200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(202,1,NULL,NULL,1,'TABLETA DE CERA PARA CROMO',NULL,'tableta-de-cera-para-cromo','558',NULL,NULL,NULL,625.00,1000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(203,1,NULL,NULL,1,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',NULL,'lija-n220-hoja-115mm-x-140mm-x-unidad','559',NULL,NULL,NULL,125.00,200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(204,1,NULL,NULL,1,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',NULL,'loseta-de-vidrio-150mm-x-100mm-x-6mm-espesor','560',NULL,NULL,NULL,625.00,1000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(205,1,NULL,NULL,1,'ESPATULA PARA CEMENTO DOBLE ',NULL,'espatula-para-cemento-doble','561',NULL,NULL,NULL,2812.50,4500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(206,1,NULL,NULL,1,'CERA CRISTAL ',NULL,'cera-cristal','562',NULL,NULL,NULL,220.00,350.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(207,1,NULL,NULL,1,'ALGINATO IQ CROMATICO ',NULL,'alginato-iq-cromatico','564',NULL,NULL,NULL,10105.00,16000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(208,1,NULL,NULL,1,'ALGINATO ALGIGEL ',NULL,'alginato-algigel','565',NULL,NULL,NULL,6869.00,11000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(209,1,NULL,NULL,1,'INST MANGO BISTURI ',NULL,'inst-mango-bisturi','566',NULL,NULL,NULL,1145.00,1900.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(210,1,NULL,NULL,1,'ACRILICO VETEADO 400 GS ',NULL,'acrilico-veteado-400-gs','567',NULL,NULL,NULL,17165.00,27500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(211,1,NULL,NULL,1,'LAMINA BLANQUEAMIENTO ',NULL,'lamina-blanqueamiento','568',NULL,NULL,NULL,14585.00,23400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(212,1,NULL,NULL,1,'PLACAS EGEO 0,8 ',NULL,'placas-egeo-08','569',NULL,NULL,NULL,9627.00,15000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(213,1,NULL,NULL,1,'PIEDRA BLANCA ',NULL,'piedra-blanca','570',NULL,NULL,NULL,333.20,500.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(214,1,NULL,NULL,1,'PASTILLA METAL',NULL,'pastilla-metal','571',NULL,NULL,NULL,3550.00,5700.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(215,1,NULL,NULL,1,'MICROMOTOR  ',NULL,'micromotor','572',NULL,NULL,NULL,209000.00,334400.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(216,1,NULL,NULL,1,'ESPATULA DE CERA ',NULL,'espatula-de-cera','573',NULL,NULL,NULL,2500.00,4000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(217,1,NULL,NULL,1,'GUANTES TALLE MyS ',NULL,'guantes-talle-mys','574',NULL,NULL,NULL,4500.00,7200.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(218,1,NULL,NULL,1,'GUANTES TALLE L',NULL,'guantes-talle-l','575',NULL,NULL,NULL,3500.00,5600.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(219,1,NULL,NULL,1,'ALGINATO KROMALGUIN ',NULL,'alginato-kromalguin','576',NULL,NULL,NULL,7400.00,11840.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(220,1,NULL,NULL,1,'BARBIJO GO BLACK x50u.',NULL,'barbijo-go-black-x50u','577',NULL,NULL,NULL,2500.00,4000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL),(221,1,NULL,NULL,1,'POLIAMIDA COMPOSTELA X 1KG',NULL,'poliamida-compostela-x-1kg','578',NULL,NULL,NULL,0.00,30000.00,NULL,0,1,0,NULL,1,0,'retail',0,NULL,NULL,'2026-03-09 14:33:21',NULL,NULL,21.00,NULL);
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
  `reference_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'N° remito / factura proveedor',
  `status` enum('pending','received','partial','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
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
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'admin, lab_operator, seller, ecommerce_manager, etc.',
  `display_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (1,1,1,1,'Blister Dientes Acritone — Anterior Superior / 61 / A1 / 16','ACR-AS-16-61-A1',1.000,1700.00,0.00,295.04,1700.00),(2,2,12,NULL,'ACRILICO PARA INYECCION API x 1Kg OSCURO','17',1.000,233700.00,0.00,40559.50,233700.00),(3,3,21,NULL,'BARBIJO DESCARTABLE VERDE Caja x 50Un','26',1.000,8300.00,0.00,1440.50,8300.00),(4,4,33,NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 70mm ROSA MEDIO','386',1.000,8900.00,0.00,1544.63,8900.00),(5,5,32,NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 90mm ROSA MEDIO','385',1.000,9900.00,0.00,1718.18,9900.00),(6,6,9,NULL,'ACRILICO PARA INYECCION API x 1Kg CLARO','14',1.000,233700.00,0.00,40559.50,233700.00);
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
  `reference` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'N° comprobante, last 4 dígitos tarjeta, etc.',
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sp_sale` (`sale_id`),
  KEY `fk_sp_pm` (`payment_method_id`),
  CONSTRAINT `fk_sp_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sp_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_payments`
--

LOCK TABLES `sale_payments` WRITE;
/*!40000 ALTER TABLE `sale_payments` DISABLE KEYS */;
INSERT INTO `sale_payments` VALUES (1,1,1,1700.00,NULL,'2026-03-17 21:53:17',NULL),(2,2,1,233700.00,NULL,'2026-03-17 21:54:57',NULL),(3,3,1,8300.00,NULL,'2026-03-17 21:55:10',NULL),(4,4,2,8900.00,NULL,'2026-03-17 21:55:26',NULL),(5,5,NULL,9900.00,NULL,'2026-03-17 21:56:07',NULL);
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
  `customer_id` bigint unsigned DEFAULT NULL,
  `dentist_id` bigint unsigned DEFAULT NULL COMMENT 'Odontólogo comprador de insumos (para sale_type=lab_supply)',
  `sale_type` enum('pos','lab_supply') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pos' COMMENT 'pos=venta mostrador, lab_supply=venta de insumos a odontólogo',
  `invoice_id` bigint unsigned DEFAULT NULL COMMENT 'Factura AFIP si fue facturada',
  `sale_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_type` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'X' COMMENT 'Tipo de comprobante: X, A, B, C',
  `status` enum('draft','completed','cancelled','refunded','confirmed','paid','invoiced','pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `paid_amount` decimal(12,2) DEFAULT '0.00',
  `change_amount` decimal(12,2) DEFAULT '0.00',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sold_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sales_company` (`company_id`),
  KEY `idx_sales_session` (`cash_session_id`),
  KEY `idx_sales_client` (`crm_client_id`),
  KEY `fk_sales_branch` (`branch_id`),
  KEY `idx_sales_dentist` (`dentist_id`),
  KEY `idx_sales_type` (`sale_type`),
  KEY `sales_customer_id_foreign` (`customer_id`),
  CONSTRAINT `fk_sales_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sales_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_sales_dentist` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sales_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,1,NULL,NULL,1,NULL,1,NULL,'pos',NULL,'00001-00000001','C','completed',1700.00,0.00,0.00,1700.00,1700.00,0.00,'Cliente: Enciso Fernando Ariel','2026-03-17 21:53:16','2026-03-18 00:53:16','2026-03-18 00:53:16'),(2,1,NULL,NULL,1,NULL,NULL,NULL,'pos',NULL,'00001-00000002','C','completed',233700.00,0.00,0.00,233700.00,233700.00,0.00,'','2026-03-17 21:54:57','2026-03-18 00:54:57','2026-03-18 00:54:57'),(3,1,NULL,NULL,1,NULL,NULL,NULL,'pos',NULL,'00001-00000003','C','completed',8300.00,0.00,0.00,8300.00,8300.00,0.00,'','2026-03-17 21:55:10','2026-03-18 00:55:10','2026-03-18 00:55:10'),(4,1,NULL,NULL,1,NULL,NULL,NULL,'pos',NULL,'00001-00000004','C','completed',8900.00,0.00,0.00,8900.00,8900.00,0.00,'','2026-03-17 21:55:26','2026-03-18 00:55:26','2026-03-18 00:55:26'),(5,1,NULL,NULL,1,NULL,NULL,NULL,'pos',NULL,'00001-00000005','C','completed',9900.00,0.00,0.00,9900.00,9900.00,0.00,'','2026-03-17 21:56:07','2026-03-18 00:56:07','2026-03-18 00:56:07'),(6,1,NULL,NULL,1,NULL,1,NULL,'pos',NULL,'00001-00000006','C','pending',233700.00,0.00,0.00,233700.00,0.00,0.00,'Cliente: Enciso Fernando Ariel','2026-03-17 21:56:21','2026-03-18 00:56:21','2026-03-18 00:56:21');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `sessions` VALUES ('TJTf04FLqzMKzNPUfFl0KoX1ncWclgzHtTLzb5Ot',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiSEIxT0daUFRRVXQ5M01vY2RQR0RPdzNkVlBLbTJDYWVLYkdsWUJUMiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kYXNoYm9hcmQiO3M6NToicm91dGUiO3M6OToiZGFzaGJvYXJkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9',1773796402);
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
  `tracking_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('preparing','shipped','in_transit','delivered','returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'preparing',
  `carrier` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_shipments_order` (`order_id`),
  KEY `fk_shipments_method` (`shipping_method_id`),
  CONSTRAINT `fk_shipments_method` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_shipments_order` FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipments`
--

LOCK TABLES `shipments` WRITE;
/*!40000 ALTER TABLE `shipments` DISABLE KEYS */;
INSERT INTO `shipments` VALUES (1,10,NULL,'dasdsafsafwqe65749841','http://localhost:8080/contacto','preparing','Andreani','2026-03-17 00:00:00','2026-03-24',NULL,NULL,'2026-03-17 22:34:33','2026-03-17 22:40:29');
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Correo Argentino, OCA, Andreani, Retiro en Tienda',
  `type` enum('free','flat','calculated','pickup') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'flat',
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
-- Table structure for table `shipping_moto_companies`
--

DROP TABLE IF EXISTS `shipping_moto_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_moto_companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `zone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Zona de cobertura',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_moto_companies`
--

LOCK TABLES `shipping_moto_companies` WRITE;
/*!40000 ALTER TABLE `shipping_moto_companies` DISABLE KEYS */;
INSERT INTO `shipping_moto_companies` VALUES (1,'MotoVip',NULL,4000.00,'Formosa Capital',NULL,1,'2026-03-16 02:43:02','2026-03-16 02:43:02');
/*!40000 ALTER TABLE `shipping_moto_companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_pickup_points`
--

DROP TABLE IF EXISTS `shipping_pickup_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_pickup_points` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Formosa',
  `postal_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schedule` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `accepts_cash_payment` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_pickup_points`
--

LOCK TABLES `shipping_pickup_points` WRITE;
/*!40000 ALTER TABLE `shipping_pickup_points` DISABLE KEYS */;
INSERT INTO `shipping_pickup_points` VALUES (1,'Punto ArtDent Snacks Express','Saavedra 110','Formosa','Formosa','3600','+543704302867','Lunes a Sabados de 09:00 a 14:00 y 16:00 a 21:00',-26.1802500,-58.1661300,NULL,1,0,'2026-03-16 02:34:48','2026-03-16 02:34:48'),(2,'Casa Central','B° Sagrado Corazon Mz 40 Casa 2','Formosa','Formosa','3600','+543704995406','Lun-Vier 08:00 a 13:00 / Sab 08:00 a 12:00',-26.1978200,-58.2369400,NULL,1,1,'2026-03-16 02:42:43','2026-03-17 22:04:07');
/*!40000 ALTER TABLE `shipping_pickup_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sidebar_banners`
--

DROP TABLE IF EXISTS `sidebar_banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sidebar_banners` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` tinyint unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sidebar_banners`
--

LOCK TABLES `sidebar_banners` WRITE;
/*!40000 ALTER TABLE `sidebar_banners` DISABLE KEYS */;
/*!40000 ALTER TABLE `sidebar_banners` ENABLE KEYS */;
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
  `type` enum('in','out','adjustment','transfer_in','transfer_out') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `stock_before` decimal(12,3) DEFAULT NULL,
  `stock_after` decimal(12,3) DEFAULT NULL,
  `reference_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'purchase, ecommerce_order, sale, manual',
  `reference_id` bigint unsigned DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sm_product` (`product_id`,`warehouse_id`),
  KEY `idx_sm_reference` (`reference_type`,`reference_id`),
  KEY `fk_sm_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_sm_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_sm_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
INSERT INTO `stock_movements` VALUES (1,1,1,1,1,'adjustment',5.000,0.000,5.000,NULL,NULL,'Ajuste manual desde edición de variante',NULL),(2,1,2,1,1,'adjustment',2.000,0.000,2.000,NULL,NULL,'Ajuste manual desde edición de variante',NULL),(3,1,3,1,1,'adjustment',1.000,0.000,1.000,NULL,NULL,'Ajuste manual desde edición de variante',NULL),(4,1,4,1,1,'adjustment',3.000,0.000,3.000,NULL,NULL,'Ajuste manual desde edición de variante',NULL),(5,1,5,1,1,'adjustment',4.000,0.000,4.000,NULL,NULL,'Ajuste manual desde edición de variante',NULL),(6,2,349,1,1,'adjustment',10.000,0.000,10.000,NULL,NULL,'Ajuste manual desde edición de variante',NULL),(7,2,350,1,1,'adjustment',10.000,0.000,10.000,NULL,NULL,'Ajuste manual desde edición de variante',NULL),(8,2,351,1,1,'adjustment',10.000,0.000,10.000,NULL,NULL,'Ajuste manual desde edición de variante',NULL),(9,3,NULL,1,1,'adjustment',1.000,1.000,2.000,NULL,NULL,'Ajuste manual desde edición de producto',NULL),(10,1,1,1,1,'out',1.000,5.000,4.000,'sale',1,'Venta POS 00001-00000001',NULL),(11,12,NULL,1,1,'out',1.000,2.000,1.000,'sale',2,'Venta POS 00001-00000002',NULL),(12,21,NULL,1,1,'out',1.000,1.000,0.000,'sale',3,'Venta POS 00001-00000003',NULL),(13,33,NULL,1,1,'out',1.000,30.000,29.000,'sale',4,'Venta POS 00001-00000004',NULL),(14,32,NULL,1,1,'out',1.000,21.000,20.000,'sale',5,'Venta POS 00001-00000005',NULL),(15,9,NULL,1,1,'out',1.000,4.000,3.000,'sale',6,'Venta POS 00001-00000006',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,2,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(2,3,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(3,4,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(4,5,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(5,6,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(6,7,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(7,8,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(8,9,NULL,1,3.000,0.000,'2026-03-09 14:33:21'),(9,10,NULL,1,3.000,0.000,'2026-03-09 14:33:21'),(10,11,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(11,12,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(12,13,NULL,1,7.000,0.000,'2026-03-09 14:33:21'),(13,14,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(14,15,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(15,16,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(16,17,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(17,18,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(18,19,NULL,1,-14.000,0.000,'2026-03-09 14:33:21'),(19,20,NULL,1,-6.000,0.000,'2026-03-09 14:33:21'),(20,21,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(21,22,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(22,23,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(23,24,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(24,25,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(25,26,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(26,27,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(27,28,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(28,29,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(29,30,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(30,31,NULL,1,19.000,0.000,'2026-03-09 14:33:21'),(31,32,NULL,1,20.000,0.000,'2026-03-09 14:33:21'),(32,33,NULL,1,29.000,0.000,'2026-03-09 14:33:21'),(33,34,NULL,1,17.000,0.000,'2026-03-09 14:33:21'),(34,35,NULL,1,19.000,0.000,'2026-03-09 14:33:21'),(35,36,NULL,1,20.000,0.000,'2026-03-09 14:33:21'),(36,37,NULL,1,19.000,0.000,'2026-03-09 14:33:21'),(37,38,NULL,1,28.000,0.000,'2026-03-09 14:33:21'),(38,39,NULL,1,29.000,0.000,'2026-03-09 14:33:21'),(39,40,NULL,1,20.000,0.000,'2026-03-09 14:33:21'),(40,41,NULL,1,20.000,0.000,'2026-03-09 14:33:21'),(41,42,NULL,1,18.000,0.000,'2026-03-09 14:33:21'),(42,43,NULL,1,20.000,0.000,'2026-03-09 14:33:21'),(43,44,NULL,1,28.000,0.000,'2026-03-09 14:33:21'),(44,45,NULL,1,13.000,0.000,'2026-03-09 14:33:21'),(45,46,NULL,1,107.000,0.000,'2026-03-09 14:33:21'),(46,47,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(47,48,NULL,1,40.000,0.000,'2026-03-09 14:33:21'),(48,49,NULL,1,28.000,0.000,'2026-03-09 14:33:21'),(49,50,NULL,1,23.000,0.000,'2026-03-09 14:33:21'),(50,51,NULL,1,31.000,0.000,'2026-03-09 14:33:21'),(51,52,NULL,1,14.000,0.000,'2026-03-09 14:33:21'),(52,53,NULL,1,5.000,0.000,'2026-03-09 14:33:21'),(53,54,NULL,1,124.000,0.000,'2026-03-09 14:33:21'),(54,55,NULL,1,182.000,0.000,'2026-03-09 14:33:21'),(55,56,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(56,57,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(57,58,NULL,1,-2.000,0.000,'2026-03-09 14:33:21'),(58,59,NULL,1,8.000,0.000,'2026-03-09 14:33:21'),(59,60,NULL,1,-125.000,0.000,'2026-03-09 14:33:21'),(60,61,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(61,62,NULL,1,192.000,0.000,'2026-03-09 14:33:21'),(62,63,NULL,1,13.000,0.000,'2026-03-09 14:33:21'),(63,64,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(64,65,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(65,66,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(66,67,NULL,1,3.000,0.000,'2026-03-09 14:33:21'),(67,68,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(68,69,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(69,70,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(70,71,NULL,1,59.000,0.000,'2026-03-09 14:33:21'),(71,72,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(72,73,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(73,74,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(74,75,NULL,1,3.000,0.000,'2026-03-09 14:33:21'),(75,76,NULL,1,8.000,0.000,'2026-03-09 14:33:21'),(76,77,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(77,78,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(78,79,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(79,80,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(80,81,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(81,82,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(82,83,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(83,84,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(84,85,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(85,86,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(86,87,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(87,88,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(88,89,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(89,90,NULL,1,3.000,0.000,'2026-03-09 14:33:21'),(90,91,NULL,1,3.000,0.000,'2026-03-09 14:33:21'),(91,92,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(92,93,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(93,94,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(94,95,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(95,96,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(96,97,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(97,98,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(98,99,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(99,100,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(100,101,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(101,102,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(102,103,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(103,104,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(104,105,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(105,106,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(106,107,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(107,108,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(108,109,NULL,1,8.000,0.000,'2026-03-09 14:33:21'),(109,110,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(110,111,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(111,112,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(112,113,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(113,114,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(114,115,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(115,116,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(116,117,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(117,118,NULL,1,48.000,0.000,'2026-03-09 14:33:21'),(118,119,NULL,1,25.000,0.000,'2026-03-09 14:33:21'),(119,120,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(120,121,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(121,122,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(122,123,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(123,124,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(124,125,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(125,126,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(126,127,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(127,128,NULL,1,10.000,0.000,'2026-03-09 14:33:21'),(128,129,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(129,130,NULL,1,-2.000,0.000,'2026-03-09 14:33:21'),(130,131,NULL,1,-3.000,0.000,'2026-03-09 14:33:21'),(131,132,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(132,133,NULL,1,10.000,0.000,'2026-03-09 14:33:21'),(133,134,NULL,1,3.000,0.000,'2026-03-09 14:33:21'),(134,135,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(135,136,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(136,137,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(137,138,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(138,139,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(139,140,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(140,141,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(141,142,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(142,143,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(143,144,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(144,145,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(145,146,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(146,147,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(147,148,NULL,1,5.000,0.000,'2026-03-09 14:33:21'),(148,149,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(149,150,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(150,151,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(151,152,NULL,1,12.000,0.000,'2026-03-09 14:33:21'),(152,153,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(153,154,NULL,1,20.000,0.000,'2026-03-09 14:33:21'),(154,155,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(155,156,NULL,1,23.000,0.000,'2026-03-09 14:33:21'),(156,157,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(157,158,NULL,1,12.000,0.000,'2026-03-09 14:33:21'),(158,159,NULL,1,-3.000,0.000,'2026-03-09 14:33:21'),(159,160,NULL,1,-11.000,0.000,'2026-03-09 14:33:21'),(160,161,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(161,162,NULL,1,-52.000,0.000,'2026-03-09 14:33:21'),(162,163,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(163,164,NULL,1,-15.000,0.000,'2026-03-09 14:33:21'),(164,165,NULL,1,3.000,0.000,'2026-03-09 14:33:21'),(165,166,NULL,1,-27.000,0.000,'2026-03-09 14:33:21'),(166,167,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(167,168,NULL,1,140.000,0.000,'2026-03-09 14:33:21'),(168,169,NULL,1,-1.000,0.000,'2026-03-09 14:33:21'),(169,170,NULL,1,-71.000,0.000,'2026-03-09 14:33:21'),(170,171,NULL,1,44.000,0.000,'2026-03-09 14:33:21'),(171,172,NULL,1,70.000,0.000,'2026-03-09 14:33:21'),(172,173,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(173,174,NULL,1,10.000,0.000,'2026-03-09 14:33:21'),(174,175,NULL,1,10.000,0.000,'2026-03-09 14:33:21'),(175,176,NULL,1,10.000,0.000,'2026-03-09 14:33:21'),(176,177,NULL,1,8.000,0.000,'2026-03-09 14:33:21'),(177,178,NULL,1,12.000,0.000,'2026-03-09 14:33:21'),(178,179,NULL,1,242.000,0.000,'2026-03-09 14:33:21'),(179,180,NULL,1,-56.000,0.000,'2026-03-09 14:33:21'),(180,181,NULL,1,-135.000,0.000,'2026-03-09 14:33:21'),(181,182,NULL,1,-6.000,0.000,'2026-03-09 14:33:21'),(182,183,NULL,1,-61.000,0.000,'2026-03-09 14:33:21'),(183,184,NULL,1,-2.000,0.000,'2026-03-09 14:33:21'),(184,185,NULL,1,-161.000,0.000,'2026-03-09 14:33:21'),(185,186,NULL,1,4.000,0.000,'2026-03-09 14:33:21'),(186,187,NULL,1,215.000,0.000,'2026-03-09 14:33:21'),(187,188,NULL,1,6.000,0.000,'2026-03-09 14:33:21'),(188,189,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(189,190,NULL,1,488.000,0.000,'2026-03-09 14:33:21'),(190,191,NULL,1,211.000,0.000,'2026-03-09 14:33:21'),(191,192,NULL,1,6.000,0.000,'2026-03-09 14:33:21'),(192,193,NULL,1,5.000,0.000,'2026-03-09 14:33:21'),(193,194,NULL,1,5.000,0.000,'2026-03-09 14:33:21'),(194,195,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(195,196,NULL,1,-12.000,0.000,'2026-03-09 14:33:21'),(196,197,NULL,1,34.000,0.000,'2026-03-09 14:33:21'),(197,198,NULL,1,45.000,0.000,'2026-03-09 14:33:21'),(198,199,NULL,1,1.000,0.000,'2026-03-09 14:33:21'),(199,200,NULL,1,8.000,0.000,'2026-03-09 14:33:21'),(200,201,NULL,1,-1.000,0.000,'2026-03-09 14:33:21'),(201,202,NULL,1,60.000,0.000,'2026-03-09 14:33:21'),(202,203,NULL,1,-24.000,0.000,'2026-03-09 14:33:21'),(203,204,NULL,1,-36.000,0.000,'2026-03-09 14:33:21'),(204,205,NULL,1,37.000,0.000,'2026-03-09 14:33:21'),(205,206,NULL,1,61.000,0.000,'2026-03-09 14:33:21'),(206,207,NULL,1,411.000,0.000,'2026-03-09 14:33:21'),(207,208,NULL,1,-12.000,0.000,'2026-03-09 14:33:21'),(208,209,NULL,1,-135.000,0.000,'2026-03-09 14:33:21'),(209,210,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(210,211,NULL,1,-121.000,0.000,'2026-03-09 14:33:21'),(211,212,NULL,1,-20.000,0.000,'2026-03-09 14:33:21'),(212,213,NULL,1,0.000,0.000,'2026-03-09 14:33:21'),(213,214,NULL,1,81.000,0.000,'2026-03-09 14:33:21'),(214,215,NULL,1,141.000,0.000,'2026-03-09 14:33:21'),(215,216,NULL,1,8.000,0.000,'2026-03-09 14:33:21'),(216,217,NULL,1,7.000,0.000,'2026-03-09 14:33:21'),(217,218,NULL,1,-4.000,0.000,'2026-03-09 14:33:21'),(218,219,NULL,1,6.000,0.000,'2026-03-09 14:33:21'),(219,220,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(220,221,NULL,1,2.000,0.000,'2026-03-09 14:33:21'),(221,1,NULL,1,0.000,0.000,NULL),(222,1,1,1,4.000,0.000,NULL),(223,1,2,1,2.000,0.000,NULL),(224,1,3,1,1.000,0.000,NULL),(225,1,4,1,3.000,0.000,NULL),(226,1,5,1,4.000,0.000,NULL),(227,2,349,1,10.000,0.000,NULL),(228,2,350,1,10.000,0.000,NULL),(229,2,351,1,10.000,0.000,NULL);
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
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'material',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Corona Zirconio, Prótesis Total, Carilla, etc.',
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Agrupación: Fija, Removible, Ortodoncia, etc.',
  `lab_sector` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sector del lab donde se fabrica: cerámica, prótesis, etc.',
  `min_days` tinyint unsigned DEFAULT '1' COMMENT 'Días mínimos de producción',
  `urgency_multiplier` decimal(4,2) DEFAULT '1.50' COMMENT 'Multiplicador de precio para trabajos urgentes',
  `tooth_count` tinyint unsigned DEFAULT NULL COMMENT 'Cantidad de dientes que incluye (NULL = variable)',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `unit` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'unidad' COMMENT 'unidad, pieza, par, etc.',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tariffs_company` (`company_id`),
  KEY `idx_tariffs_company_id` (`company_id`),
  KEY `idx_tariffs_company_code` (`company_id`,`code`),
  KEY `idx_tariffs_category` (`category`),
  KEY `idx_tariffs_is_active` (`company_id`,`is_active`),
  CONSTRAINT `fk_tariffs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tariffs`
--

LOCK TABLES `tariffs` WRITE;
/*!40000 ALTER TABLE `tariffs` DISABLE KEYS */;
INSERT INTO `tariffs` VALUES (1,1,'TAR-001','ACRILICO TERMO TRADICIONAL 1 A 3 DIENTES','PROTESIS',NULL,1,1.50,NULL,90000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(2,1,'TAR-002','ACRILICO TERMO TRADICIONAL 4 A 8 DIENTES','PROTESIS',NULL,1,1.50,NULL,95000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(3,1,'TAR-003','ACRILICO TERMO TRADICIONAL 9 O MAS DIENTES','PROTESIS',NULL,1,1.50,NULL,105000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(4,1,'TAR-004','ACRILICO INYECTADO O FLEX 1 A 3 DIENTES','FLEXIBLE',NULL,1,1.50,NULL,105000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(5,1,'TAR-005','ACRILICO INYECTADO O FLEX 4 A 8 DIENTES','FLEXIBLE',NULL,1,1.50,NULL,120000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(6,1,'TAR-006','ACRILICO INYECTADO O FLEX 9 O MAS DIENTES','FLEXIBLE',NULL,1,1.50,NULL,125000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(7,1,'TAR-007','ACRILICO APC 1 A 3 DIENTES','PROTESIS',NULL,1,1.50,NULL,105000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(8,1,'TAR-008','ACRILICO APC 4 A 8 DIENTES','PROTESIS',NULL,1,1.50,NULL,120000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(9,1,'TAR-009','ACRILICO APC 9 O MAS DIENTES','PROTESIS',NULL,1,1.50,NULL,125000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(10,1,'TAR-010','PROTESIS PROVISORIO 1 A 3 DIENTES','PROTESIS',NULL,1,1.50,NULL,63000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(11,1,'TAR-011','BASE COLADA (SUP. O INF.)','PROTESIS',NULL,1,1.50,NULL,130000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(12,1,'TAR-012','COMBINADA ACRILICO','COMBINADA',NULL,1,1.50,NULL,225000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(13,1,'TAR-013','COMBINADO FLEX','FLEXIBLE',NULL,1,1.50,NULL,250000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(14,1,'TAR-014','COMBINADO ACRILICO INYECTADO','COMBINADA',NULL,1,1.50,NULL,250000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(15,1,'TAR-015','CAJA ATACHMEN','PROTESIS',NULL,1,1.50,NULL,29000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(16,1,'TAR-016','CAJA BARRA TANGENCIAL','PROTESIS',NULL,1,1.50,NULL,0.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(17,1,'TAR-017','REBASADO EN ACRILICO AUTO','MANTENIMIENTO',NULL,1,1.50,NULL,38000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(18,1,'TAR-018','REBASADO EN MUFLA TERMO','MANTENIMIENTO',NULL,1,1.50,NULL,64000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(19,1,'TAR-019','REPARACION SIMPLE','IMPLANTES',NULL,1,1.50,NULL,32000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(20,1,'TAR-020','REPARACION COMPLETA','PROTESIS',NULL,1,1.50,NULL,37000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(21,1,'TAR-021','AGREGADO RETENEDORES/DIENTES','PROTESIS',NULL,1,1.50,NULL,34000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(22,1,'TAR-022','SUBSIGUIENTE','PROTESIS',NULL,1,1.50,NULL,17000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(23,1,'TAR-023','CUBETA INDIVIDUAL ACRILICO AURO','PROTESIS',NULL,1,1.50,NULL,31000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(24,1,'TAR-024','CORONA PROVISORIA (NUEVA DIGITAL)','CORONAS',NULL,1,1.50,NULL,55000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(25,1,'TAR-025','CORONA DEFINITIVA (NUEVO DIGITAL)','CORONAS',NULL,1,1.50,NULL,60000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(26,1,'TAR-026','CORONA DEFINITIVA FOTOCURADO (CERAMAGE)','CORONAS',NULL,1,1.50,NULL,96000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(27,1,'TAR-027','CORONA METAL PORCELANA','CORONAS',NULL,1,1.50,NULL,114000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(28,1,'TAR-028','CORONA PORCELANA PURA (DISILICATO)','CORONAS',NULL,1,1.50,NULL,125000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(29,1,'TAR-029','CORONA FRESADA ZIRCONIA MULTIAYER','CORONAS',NULL,1,1.50,NULL,110000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(30,1,'TAR-030','ENCIA CERAMAGE CADA 2 DIENTES','PROTESIS',NULL,1,1.50,NULL,96000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(31,1,'TAR-031','ENCIA METAL PORCELANA CADA 2 DIENTES','PROTESIS',NULL,1,1.50,NULL,114000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(32,1,'TAR-032','INCRUSTACION LARGA DURACION (DIGITAL)','PROTESIS',NULL,1,1.50,NULL,60000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(33,1,'TAR-033','INCRUSTACION LARGA DURACION CERAMAGE','PROTESIS',NULL,1,1.50,NULL,94000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(34,1,'TAR-034','INCRUSTACION INDIRECTA PORCELANA PURA','PROTESIS',NULL,1,1.50,NULL,125000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(35,1,'TAR-035','INCRUSTACION INDIRECTA DE ZIRCONIA','PROTESIS',NULL,1,1.50,NULL,110000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(36,1,'TAR-036','CARILLAS DEFINITIVA FOTOCURADO CERAMAGE','PROTESIS',NULL,1,1.50,NULL,96000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(37,1,'TAR-037','CARILLAS PORCELANA PURA DISILICATO DE LITIO','PROTESIS',NULL,1,1.50,NULL,120000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(38,1,'TAR-038','CARILLAS DE ZIRCONIA MULTIAYER','PROTESIS',NULL,1,1.50,NULL,110000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(39,1,'TAR-039','BOLA SERVO','PROTESIS',NULL,1,1.50,NULL,64000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(40,1,'TAR-040','TEFLON PARA BOLA','PROTESIS',NULL,1,1.50,NULL,18000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(41,1,'TAR-041','RIELERA VERTICAL','PROTESIS',NULL,1,1.50,NULL,42000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(42,1,'TAR-042','PERNO SIMPLE DIRECTO','IMPLANTES',NULL,1,1.50,NULL,40000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(43,1,'TAR-043','PERNO SIMPLE INDIRECTO','IMPLANTES',NULL,1,1.50,NULL,44000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(44,1,'TAR-044','PERNO PASANTE','PROTESIS',NULL,1,1.50,NULL,54000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(45,1,'TAR-045','BOLATACH','PROTESIS',NULL,1,1.50,NULL,92000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(46,1,'TAR-046','PERNO ESPIGA','PROTESIS',NULL,1,1.50,NULL,92000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(47,1,'TAR-047','ENCERADO DE DIAGNOSTICO IMPRESO P/MOCK UP 6 DIENTES (MATRIZ DE SILICONA)','PROTESIS',NULL,1,1.50,NULL,76000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(48,1,'TAR-048','FRESADO UCLA MAQUINADO','PROTESIS',NULL,1,1.50,NULL,14000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(49,1,'TAR-049','POSTE PARA IMPLANTES','IMPLANTES',NULL,1,1.50,NULL,32000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(50,1,'TAR-050','TRAMO BARRA TANGENCIAL','PROTESIS',NULL,1,1.50,NULL,38000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(51,1,'TAR-051','BROCHE METALICO PARA BARRA','PROTESIS',NULL,1,1.50,NULL,29000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(52,1,'TAR-052','TEFLON PARA BARRA','PROTESIS',NULL,1,1.50,NULL,15000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(53,1,'TAR-053','ELEMENTO TRANSFER CADA 2 IMPLANTES','IMPLANTES',NULL,1,1.50,NULL,19000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(54,1,'TAR-054','METALICO COLADO PARA CERAMAGE','PROTESIS',NULL,1,1.50,NULL,39000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(55,1,'TAR-055','ATORNILLADOS PARA CERAMAGE O CERAMICA CON UCLA','PROTESIS',NULL,1,1.50,NULL,96000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(56,1,'TAR-056','PREPARACION DE PILARESPREFORMADO MAS CASQUETE CON CHIMENEA','PROTESIS',NULL,1,1.50,NULL,78000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(57,1,'TAR-057','PLACA ESTAMPADA 0-8 MM.','PLACAS',NULL,1,1.50,NULL,62000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(58,1,'TAR-058','PLACA ESTAMPADA CON PISTA ACRILICO','PLACAS',NULL,1,1.50,NULL,67000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(59,1,'TAR-059','PLACA PARA BLANQUEAMIENTO','PLACAS',NULL,1,1.50,NULL,62000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(60,1,'TAR-060','PROTECTOR BUCAL','PROTESIS',NULL,1,1.50,NULL,67500.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(61,1,'TAR-061','PLACA CRISTAL TERMO INYECTADA','PLACAS',NULL,1,1.50,NULL,94000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(62,1,'TAR-062','PLACA TERMO CRISTAL','PLACAS',NULL,1,1.50,NULL,92000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(63,1,'TAR-063','PLACA PARTIDA INFERIOR CON BARRA LINGUAL','PLACAS',NULL,1,1.50,NULL,84000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(64,1,'TAR-064','PLACA PARTIDA SUPERIOR DE 13 A 23','PLACAS',NULL,1,1.50,NULL,84000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(65,1,'TAR-065','DIGITALIZACION DE MODELO POR CASO SUP O INF','PROTESIS',NULL,1,1.50,NULL,12000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(66,1,'TAR-066','DISENO DE EXOCAD (CORONAS)','CORONAS',NULL,1,1.50,NULL,9000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(67,1,'TAR-067','MODELO DE ESTUDIO OSEO-MAXILAR SUP O INF','PROTESIS',NULL,1,1.50,NULL,76000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(68,1,'TAR-068','RODETE','PROTESIS',NULL,1,1.50,NULL,15000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(69,1,'TAR-069','ENFILADO','PROTESIS',NULL,1,1.50,NULL,20000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(70,1,'TAR-070','ESCANEO','PROTESIS',NULL,1,1.50,NULL,8000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(71,1,'TAR-071','AGREGADO DE MASA CERAMICA CADA 2 DIENTES','PROTESIS',NULL,1,1.50,NULL,73000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(72,1,'TAR-072','BIZCOCHADO','PROTESIS',NULL,1,1.50,NULL,52500.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(73,1,'TAR-073','CECI PROTESIS COMPLETA','PROTESIS',NULL,1,1.50,NULL,54000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(74,1,'TAR-074','CECI PROTESIS PARCIAL','PROTESIS',NULL,1,1.50,NULL,27000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(75,1,'TAR-075','METAL ATORNILLADO','PROTESIS',NULL,1,1.50,NULL,67500.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(76,1,'TAR-076','METAL','PROTESIS',NULL,1,1.50,NULL,43600.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(77,1,'TAR-077','PLACA IMPRESA 3D','PLACAS',NULL,1,1.50,NULL,82000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(78,1,'TAR-078','CASQUETE METAL','PROTESIS',NULL,1,1.50,NULL,52500.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(79,1,'TAR-079','BZCOCHADO ALFREDO','PROTESIS',NULL,1,1.50,NULL,23000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(80,1,'TAR-080','ALFREDO PERNO SIMPLE','IMPLANTES',NULL,1,1.50,NULL,9000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(81,1,'TAR-081','ALFREDO PERNO PASANTE','PROTESIS',NULL,1,1.50,NULL,9000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(82,1,'TAR-082','ALFREDO METAL ATORNILLADO','PROTESIS',NULL,1,1.50,NULL,9000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(83,1,'TAR-083','ALFREDO METAL CASQUETE','PROTESIS',NULL,1,1.50,NULL,9000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(84,1,'TAR-084','INCRUSTRACION LARGA DURACION CERAMAGE','PROTESIS',NULL,1,1.50,NULL,94000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(85,1,'TAR-085','IMPRESION MODELO DE RESINA ALINEADOR SUP O INF','PROTESIS',NULL,1,1.50,NULL,22000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(86,1,'TAR-086','HIBRIDA S/6 IMPLANTES + IMPRESION + CERAMAGE','IMPLANTES',NULL,1,1.50,NULL,637400.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(87,1,'TAR-087','CAMBIO DE COLOR','PROTESIS',NULL,1,1.50,NULL,15000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(88,1,'TAR-088','IMPRESION MODELO GELLER HEMIARCADA','PROTESIS',NULL,1,1.50,NULL,22000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(89,1,'TAR-089','ARCADA COMPLETA GUELLER','PROTESIS',NULL,1,1.50,NULL,45000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(90,1,'TAR-090','MODFELO PARA ALINEADORES','PROTESIS',NULL,1,1.50,NULL,40000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(91,1,'TAR-091','MODELO MAXILAR SUP O INF','PROTESIS',NULL,1,1.50,NULL,70000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(92,1,'TAR-092','MODELO MAXILAR','PROTESIS',NULL,1,1.50,NULL,70000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(93,1,'TAR-093','GUIA QUIRURGICA IMPRESA CON RESINA BIO-SPLIN','PROTESIS',NULL,1,1.50,NULL,44000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(94,1,'TAR-094','PROTESIS TECNICOS 1A3 DIENTES','PROTESIS',NULL,1,1.50,NULL,81000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(95,1,'TAR-095','PROTESIS TECNICOS 4A8 DIENTES','PROTESIS',NULL,1,1.50,NULL,94000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(96,1,'TAR-096','PROTESIS TECNICOS 9 O MAS DIENTES','PROTESIS',NULL,1,1.50,NULL,98000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(97,1,'TAR-097','CORONA PMMA FREZADA','CORONAS',NULL,1,1.50,NULL,60000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(98,1,'TAR-098','CORONA HIBRIDA FRESADA ZIRCONIA/PIEZA','CORONAS',NULL,1,1.50,NULL,123000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(99,1,'TAR-099','INCRUSTACION DE PMMA FREZADA','PROTESIS',NULL,1,1.50,NULL,60000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(100,1,'TAR-100','ENCERADO DIAGNOSTICO IMPRESO 1 PIEZA','PROTESIS',NULL,1,1.50,NULL,22000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(101,1,'TAR-101','ENCERADO DE DIAGNOSTICO IMPRESO DESDE 2 A 5 PIEZAS','PROTESIS',NULL,1,1.50,NULL,0.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(102,1,'TAR-102','DISENOS MAS COMPLEJOS','PROTESIS',NULL,1,1.50,NULL,0.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(103,1,'TAR-103','ENCIA ZIRCONIA C/2 DIENTES','PROTESIS',NULL,1,1.50,NULL,100000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(104,1,'TAR-104','PINZAS','PROTESIS',NULL,1,1.50,NULL,11000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(105,1,'TAR-105','CARILLAS SIN MAQUILLAR','PROTESIS',NULL,1,1.50,NULL,70000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(106,1,'TAR-106','ENCERADO','PROTESIS',NULL,1,1.50,NULL,0.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03'),(107,1,'TAR-107','ENCIA P/CORONA DE ZIRCONIO','CORONAS',NULL,1,1.50,NULL,50000.00,'un',NULL,1,'2026-03-10 19:17:03','2026-03-10 19:17:03');
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'IVA 21%, IVA 10.5%, Exento, etc.',
  `rate` decimal(5,2) NOT NULL DEFAULT '21.00',
  `afip_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código AFIP para facturación electrónica',
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `users` VALUES (1,1,1,'Administrador','admin@artdent.com.ar','$2y$12$/AcFbv9wIrcjfCXm/lRA0eB5uMejJWcQRf6mjpU9iCzTYwVRd26ny',NULL,NULL,1,NULL,'lKKDRJVkjqqE6HAFUr9Ff4j0BwXrSf2UFdxxk7WstcWd4qRREdA0hydlGeFV',NULL,'2026-03-04 23:09:31','2026-03-05 03:25:34',NULL);
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
INSERT INTO `variant_attribute_values` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,1),(11,1),(12,1),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(19,1),(20,1),(21,1),(22,1),(23,1),(24,1),(25,1),(26,1),(27,1),(28,1),(29,1),(30,1),(31,1),(32,1),(33,1),(34,1),(35,1),(36,1),(37,1),(38,1),(39,1),(40,1),(41,1),(42,1),(43,1),(44,1),(45,1),(46,1),(47,1),(48,1),(49,1),(50,1),(51,1),(52,1),(53,1),(54,1),(55,1),(56,1),(57,1),(58,1),(59,1),(60,1),(61,1),(62,1),(63,1),(64,1),(65,1),(66,1),(67,1),(68,1),(69,1),(70,1),(71,1),(72,1),(73,1),(74,1),(75,1),(76,1),(77,1),(78,1),(79,1),(80,1),(81,1),(82,1),(83,1),(84,1),(85,1),(86,1),(87,1),(88,1),(89,1),(90,1),(91,1),(92,1),(93,1),(94,1),(95,1),(96,1),(97,1),(98,1),(99,1),(100,1),(101,1),(102,1),(103,1),(104,1),(105,1),(106,1),(107,1),(108,1),(109,1),(110,1),(111,1),(112,1),(113,1),(114,1),(115,1),(116,1),(117,1),(118,1),(119,1),(120,1),(121,1),(122,1),(123,1),(124,1),(125,1),(126,1),(127,1),(128,1),(129,1),(130,1),(131,1),(132,1),(133,1),(134,1),(135,1),(136,1),(137,1),(138,1),(139,1),(140,1),(141,1),(142,1),(143,1),(144,1),(145,1),(146,1),(147,1),(148,1),(149,1),(150,1),(151,1),(152,1),(153,1),(154,1),(155,1),(156,1),(157,2),(158,2),(159,2),(160,2),(161,2),(162,2),(163,2),(164,2),(165,2),(166,2),(167,2),(168,2),(169,2),(170,2),(171,2),(172,2),(173,2),(174,2),(175,2),(176,2),(177,2),(178,2),(179,2),(180,2),(181,2),(182,2),(183,2),(184,2),(185,2),(186,2),(187,2),(188,2),(189,2),(190,2),(191,2),(192,2),(193,2),(194,2),(195,2),(196,2),(197,2),(198,2),(199,2),(200,2),(201,2),(202,2),(203,2),(204,2),(205,2),(206,2),(207,2),(208,2),(209,2),(210,2),(211,2),(212,2),(213,2),(214,2),(215,2),(216,2),(217,2),(218,2),(219,2),(220,2),(221,2),(222,2),(223,2),(224,2),(225,2),(226,2),(227,2),(228,2),(229,2),(230,2),(231,2),(232,2),(233,2),(234,2),(235,2),(236,2),(237,2),(238,2),(239,2),(240,2),(241,2),(242,2),(243,2),(244,2),(245,2),(246,2),(247,2),(248,2),(249,2),(250,2),(251,2),(252,2),(253,2),(254,2),(255,2),(256,2),(257,2),(258,2),(259,2),(260,2),(261,2),(262,2),(263,2),(264,2),(265,2),(266,2),(267,2),(268,2),(269,2),(270,2),(271,2),(272,2),(273,2),(274,2),(275,2),(276,2),(277,3),(278,3),(279,3),(280,3),(281,3),(282,3),(283,3),(284,3),(285,3),(286,3),(287,3),(288,3),(289,3),(290,3),(291,3),(292,3),(293,3),(294,3),(295,3),(296,3),(297,3),(298,3),(299,3),(300,3),(301,3),(302,3),(303,3),(304,3),(305,3),(306,3),(307,3),(308,3),(309,3),(310,3),(311,3),(312,3),(313,4),(314,4),(315,4),(316,4),(317,4),(318,4),(319,4),(320,4),(321,4),(322,4),(323,4),(324,4),(325,4),(326,4),(327,4),(328,4),(329,4),(330,4),(331,4),(332,4),(333,4),(334,4),(335,4),(336,4),(337,4),(338,4),(339,4),(340,4),(341,4),(342,4),(343,4),(344,4),(345,4),(346,4),(347,4),(348,4),(1,5),(13,5),(25,5),(37,5),(49,5),(61,5),(73,5),(85,5),(97,5),(109,5),(121,5),(133,5),(145,5),(157,5),(169,5),(181,5),(193,5),(205,5),(217,5),(229,5),(241,5),(253,5),(265,5),(277,5),(289,5),(301,5),(313,5),(325,5),(337,5),(2,6),(14,6),(26,6),(38,6),(50,6),(62,6),(74,6),(86,6),(98,6),(110,6),(122,6),(134,6),(146,6),(158,6),(170,6),(182,6),(194,6),(206,6),(218,6),(230,6),(242,6),(254,6),(266,6),(278,6),(290,6),(302,6),(314,6),(326,6),(338,6),(3,7),(15,7),(27,7),(39,7),(51,7),(63,7),(75,7),(87,7),(99,7),(111,7),(123,7),(135,7),(147,7),(159,7),(171,7),(183,7),(195,7),(207,7),(219,7),(231,7),(243,7),(255,7),(267,7),(279,7),(291,7),(303,7),(315,7),(327,7),(339,7),(4,8),(16,8),(28,8),(40,8),(52,8),(64,8),(76,8),(88,8),(100,8),(112,8),(124,8),(136,8),(148,8),(160,8),(172,8),(184,8),(196,8),(208,8),(220,8),(232,8),(244,8),(256,8),(268,8),(280,8),(292,8),(304,8),(316,8),(328,8),(340,8),(5,9),(17,9),(29,9),(41,9),(53,9),(65,9),(77,9),(89,9),(101,9),(113,9),(125,9),(137,9),(149,9),(161,9),(173,9),(185,9),(197,9),(209,9),(221,9),(233,9),(245,9),(257,9),(269,9),(281,9),(293,9),(305,9),(317,9),(329,9),(341,9),(6,10),(18,10),(30,10),(42,10),(54,10),(66,10),(78,10),(90,10),(102,10),(114,10),(126,10),(138,10),(150,10),(162,10),(174,10),(186,10),(198,10),(210,10),(222,10),(234,10),(246,10),(258,10),(270,10),(282,10),(294,10),(306,10),(318,10),(330,10),(342,10),(7,11),(19,11),(31,11),(43,11),(55,11),(67,11),(79,11),(91,11),(103,11),(115,11),(127,11),(139,11),(151,11),(163,11),(175,11),(187,11),(199,11),(211,11),(223,11),(235,11),(247,11),(259,11),(271,11),(283,11),(295,11),(307,11),(319,11),(331,11),(343,11),(8,12),(20,12),(32,12),(44,12),(56,12),(68,12),(80,12),(92,12),(104,12),(116,12),(128,12),(140,12),(152,12),(164,12),(176,12),(188,12),(200,12),(212,12),(224,12),(236,12),(248,12),(260,12),(272,12),(284,12),(296,12),(308,12),(320,12),(332,12),(344,12),(9,13),(21,13),(33,13),(45,13),(57,13),(69,13),(81,13),(93,13),(105,13),(117,13),(129,13),(141,13),(153,13),(165,13),(177,13),(189,13),(201,13),(213,13),(225,13),(237,13),(249,13),(261,13),(273,13),(285,13),(297,13),(309,13),(321,13),(333,13),(345,13),(10,14),(22,14),(34,14),(46,14),(58,14),(70,14),(82,14),(94,14),(106,14),(118,14),(130,14),(142,14),(154,14),(166,14),(178,14),(190,14),(202,14),(214,14),(226,14),(238,14),(250,14),(262,14),(274,14),(286,14),(298,14),(310,14),(322,14),(334,14),(346,14),(11,15),(23,15),(35,15),(47,15),(59,15),(71,15),(83,15),(95,15),(107,15),(119,15),(131,15),(143,15),(155,15),(167,15),(179,15),(191,15),(203,15),(215,15),(227,15),(239,15),(251,15),(263,15),(275,15),(287,15),(299,15),(311,15),(323,15),(335,15),(347,15),(12,16),(24,16),(36,16),(48,16),(60,16),(72,16),(84,16),(96,16),(108,16),(120,16),(132,16),(144,16),(156,16),(168,16),(180,16),(192,16),(204,16),(216,16),(228,16),(240,16),(252,16),(264,16),(276,16),(288,16),(300,16),(312,16),(324,16),(336,16),(348,16),(1,17),(2,17),(3,17),(4,17),(5,17),(6,17),(7,17),(8,17),(9,17),(10,17),(11,17),(12,17),(157,17),(158,17),(159,17),(160,17),(161,17),(162,17),(163,17),(164,17),(165,17),(166,17),(167,17),(168,17),(13,18),(14,18),(15,18),(16,18),(17,18),(18,18),(19,18),(20,18),(21,18),(22,18),(23,18),(24,18),(169,18),(170,18),(171,18),(172,18),(173,18),(174,18),(175,18),(176,18),(177,18),(178,18),(179,18),(180,18),(25,19),(26,19),(27,19),(28,19),(29,19),(30,19),(31,19),(32,19),(33,19),(34,19),(35,19),(36,19),(181,19),(182,19),(183,19),(184,19),(185,19),(186,19),(187,19),(188,19),(189,19),(190,19),(191,19),(192,19),(37,20),(38,20),(39,20),(40,20),(41,20),(42,20),(43,20),(44,20),(45,20),(46,20),(47,20),(48,20),(49,21),(50,21),(51,21),(52,21),(53,21),(54,21),(55,21),(56,21),(57,21),(58,21),(59,21),(60,21),(193,21),(194,21),(195,21),(196,21),(197,21),(198,21),(199,21),(200,21),(201,21),(202,21),(203,21),(204,21),(61,22),(62,22),(63,22),(64,22),(65,22),(66,22),(67,22),(68,22),(69,22),(70,22),(71,22),(72,22),(205,22),(206,22),(207,22),(208,22),(209,22),(210,22),(211,22),(212,22),(213,22),(214,22),(215,22),(216,22),(73,23),(74,23),(75,23),(76,23),(77,23),(78,23),(79,23),(80,23),(81,23),(82,23),(83,23),(84,23),(85,24),(86,24),(87,24),(88,24),(89,24),(90,24),(91,24),(92,24),(93,24),(94,24),(95,24),(96,24),(217,24),(218,24),(219,24),(220,24),(221,24),(222,24),(223,24),(224,24),(225,24),(226,24),(227,24),(228,24),(97,25),(98,25),(99,25),(100,25),(101,25),(102,25),(103,25),(104,25),(105,25),(106,25),(107,25),(108,25),(229,25),(230,25),(231,25),(232,25),(233,25),(234,25),(235,25),(236,25),(237,25),(238,25),(239,25),(240,25),(109,26),(110,26),(111,26),(112,26),(113,26),(114,26),(115,26),(116,26),(117,26),(118,26),(119,26),(120,26),(121,27),(122,27),(123,27),(124,27),(125,27),(126,27),(127,27),(128,27),(129,27),(130,27),(131,27),(132,27),(241,27),(242,27),(243,27),(244,27),(245,27),(246,27),(247,27),(248,27),(249,27),(250,27),(251,27),(252,27),(133,28),(134,28),(135,28),(136,28),(137,28),(138,28),(139,28),(140,28),(141,28),(142,28),(143,28),(144,28),(253,28),(254,28),(255,28),(256,28),(257,28),(258,28),(259,28),(260,28),(261,28),(262,28),(263,28),(264,28),(145,29),(146,29),(147,29),(148,29),(149,29),(150,29),(151,29),(152,29),(153,29),(154,29),(155,29),(156,29),(265,29),(266,29),(267,29),(268,29),(269,29),(270,29),(271,29),(272,29),(273,29),(274,29),(275,29),(276,29),(277,30),(278,30),(279,30),(280,30),(281,30),(282,30),(283,30),(284,30),(285,30),(286,30),(287,30),(288,30),(313,30),(314,30),(315,30),(316,30),(317,30),(318,30),(319,30),(320,30),(321,30),(322,30),(323,30),(324,30),(289,31),(290,31),(291,31),(292,31),(293,31),(294,31),(295,31),(296,31),(297,31),(298,31),(299,31),(300,31),(325,31),(326,31),(327,31),(328,31),(329,31),(330,31),(331,31),(332,31),(333,31),(334,31),(335,31),(336,31),(301,32),(302,32),(303,32),(304,32),(305,32),(306,32),(307,32),(308,32),(309,32),(310,32),(311,32),(312,32),(337,32),(338,32),(339,32),(340,32),(341,32),(342,32),(343,32),(344,32),(345,32),(346,32),(347,32),(348,32),(349,33),(350,34),(351,35);
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Condiciones de pago: 30 días, contado, etc.',
  `cuit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iva_condition` enum('responsable_inscripto','monotributista','exento') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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

-- Dump completed on 2026-03-18 18:16:20
