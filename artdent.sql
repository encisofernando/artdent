CREATE DATABASE  IF NOT EXISTS `artdent_lab` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `artdent_lab`;
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
  KEY `ca_collab_workdate_idx` (`collaborator_id`,`work_date`),
  CONSTRAINT `collaborator_attendances_collaborator_id_foreign` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_attendances`
--

LOCK TABLES `collaborator_attendances` WRITE;
/*!40000 ALTER TABLE `collaborator_attendances` DISABLE KEYS */;
INSERT INTO `collaborator_attendances` VALUES (1,2,1,'2026-02-02','08:00:00','14:00:00',6.00,33000.00,NULL,'2026-02-05 01:27:06','2026-02-05 01:27:06'),(2,2,1,'2026-02-03','08:00:00','14:00:00',6.00,33000.00,NULL,'2026-02-05 01:27:20','2026-02-05 01:27:20'),(3,2,1,'2026-02-04','08:00:00','14:00:00',6.00,33000.00,NULL,'2026-02-05 01:27:31','2026-02-05 01:27:31');
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
  KEY `cd_collab_date_idx` (`collaborator_id`,`date`),
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
  KEY `ce_collab_date_idx` (`collaborator_id`,`date`),
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
  KEY `cr_collab_period_idx` (`collaborator_id`,`period_from`,`period_to`),
  CONSTRAINT `collaborator_receipts_collaborator_id_foreign` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborator_receipts`
--

LOCK TABLES `collaborator_receipts` WRITE;
/*!40000 ALTER TABLE `collaborator_receipts` DISABLE KEYS */;
INSERT INTO `collaborator_receipts` VALUES (1,2,1,'2026-02-02','2026-02-06',18.00,99000.00,0.00,0.00,99000.00,1,'2026-02-05 01:28:16','2026-02-05 01:28:16'),(2,2,1,'2026-02-02','2026-02-06',18.00,99000.00,0.00,0.00,99000.00,1,'2026-02-05 01:29:26','2026-02-05 01:29:26');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborators`
--

LOCK TABLES `collaborators` WRITE;
/*!40000 ALTER TABLE `collaborators` DISABLE KEYS */;
INSERT INTO `collaborators` VALUES (1,2,'Fernando','40215516',5500.00,1,NULL,'2026-02-05 01:25:48','2026-02-05 01:25:48');
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
INSERT INTO `companies` VALUES (1,'Empresa Demo',NULL,NULL,NULL,'AR','America/Argentina/Buenos_Aires',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-09 00:41:00','2025-09-09 00:41:00',NULL),(2,'ArtDent SRL',NULL,NULL,NULL,'AR','America/Argentina/Buenos_Aires',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-05 21:15:38','2025-10-05 21:15:38',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2019_12_14_000001_create_personal_access_tokens_table',1),(2,'2025_10_17_202109_create_password_reset_tokens_table',2),(3,'2026_01_29_000001_create_collaborators_tables',3);
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'api','f13442627492d3b5ebb8e5e8262a1c9e8720c76fc3013b0e3fc027d29ffa6154','[\"*\"]',NULL,NULL,'2025-10-05 21:15:38','2025-10-05 21:15:38'),(2,'App\\Models\\User',1,'api','85d8cf6757e210f93185a177bf080312eed98c69fd1f4c681eb7d69fca71ad69','[\"*\"]','2025-10-05 23:14:54',NULL,'2025-10-05 21:58:38','2025-10-05 23:14:54'),(3,'App\\Models\\User',1,'api','f0ad6fbb7bb05c2de8cf8189d70e7d296339ed0b91a18a95e05e6184a608a8de','[\"*\"]',NULL,NULL,'2025-10-05 23:38:03','2025-10-05 23:38:03'),(4,'App\\Models\\User',1,'api','a17ed93196f2a4779779d461959dc95679c84ca0e8f6a4ead9c5ae22ba3c9741','[\"*\"]',NULL,NULL,'2025-10-05 23:38:20','2025-10-05 23:38:20'),(5,'App\\Models\\User',1,'api','fcdb3ecb9bbf65cd50f39e9acb9f73f71f5878b0ca28d6a67be7ce3315a4169e','[\"*\"]','2025-10-06 01:00:22',NULL,'2025-10-05 23:38:38','2025-10-06 01:00:22'),(6,'App\\Models\\User',1,'api','faa13b8a48eea4ef25e45444d78370a0d8cfef4936cdeb24478ae830103330ad','[\"*\"]','2025-10-06 04:37:29',NULL,'2025-10-06 01:12:00','2025-10-06 04:37:29'),(7,'App\\Models\\User',1,'api','6b9b455f84af7fe3aee8a1f553309bdb8dfdd1d64b2f030afcd06b0b2f313a79','[\"*\"]','2025-10-17 15:16:07',NULL,'2025-10-15 17:43:25','2025-10-17 15:16:07'),(8,'App\\Models\\User',1,'api','3fa766d0bfd867fcd17af03f102ac7982dd87b94ab89e0c0c819bb350fc2d47c','[\"*\"]','2025-12-23 14:20:04',NULL,'2025-10-16 14:25:34','2025-12-23 14:20:04'),(9,'App\\Models\\User',1,'api','9e3459a220a3f215b783da2c3d2e4102b50d255dbd0c3aaa45f42abbb44d0d6b','[\"*\"]',NULL,NULL,'2025-10-17 17:02:46','2025-10-17 17:02:46'),(10,'App\\Models\\User',1,'api','3b4b64f5ddc2fbb1fdbfb527e839f01824cc9739ce4d3faa138cb01407d2ab5e','[\"*\"]','2025-10-23 14:05:00',NULL,'2025-10-20 13:50:24','2025-10-23 14:05:00'),(11,'App\\Models\\User',1,'api','351cf05386b41159259f573ee144c45192b346b0d5b2aebcd98ad51b9eea2912','[\"*\"]','2025-10-23 16:40:59',NULL,'2025-10-23 14:05:10','2025-10-23 16:40:59'),(12,'App\\Models\\User',1,'api','38233c29a8f1eeff671922824a4428c1791872cca7b737fc574b553055ad7ea0','[\"*\"]','2026-01-29 16:52:17',NULL,'2025-12-23 14:20:23','2026-01-29 16:52:17'),(13,'App\\Models\\User',2,'api','5e74326d9cd8411e049156b92099d45bde2ede335de43f3a093cc41fc860cbba','[\"*\"]',NULL,NULL,'2026-01-12 18:01:10','2026-01-12 18:01:10'),(14,'App\\Models\\User',2,'api','2bc1dc8b905c5cc100b164654b82c52398f8453b1ec664d66dfb1b9a502ddd7f','[\"*\"]','2026-01-12 18:15:19',NULL,'2026-01-12 18:04:31','2026-01-12 18:15:19'),(15,'App\\Models\\User',1,'api','8128e20262ed101aaf4c73eea15e9f44829eb05079e0bfad0047dfbf9e846223','[\"*\"]','2026-01-29 19:59:39',NULL,'2026-01-29 16:54:50','2026-01-29 19:59:39'),(16,'App\\Models\\User',1,'api','f78972c79d361dba15de23122ce5910b2ba4799513d8766ee3b8b5ed5f05ee2c','[\"*\"]','2026-02-05 05:31:17',NULL,'2026-02-05 00:47:54','2026-02-05 05:31:17');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=579 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,2,NULL,'RES-001',NULL,'Resina Nanohibrida',NULL,'UN',0.00,15000.00,21.00,NULL,1,1,0.000,'2025-10-05 22:42:00','2025-10-05 22:42:00',NULL),(4,2,NULL,'0007',NULL,'ACRILICO POLIMERO AUTOCURABLE SUBITON x 1Kg',NULL,'UN',41646.09,62469.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(5,2,NULL,'0008',NULL,'ACRILICO LIQUIDO AUTOCURABLE SUBITON x 1Lt',NULL,'UN',27674.00,41511.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(6,2,NULL,'0009',NULL,'ACRILICO PARA COLADO APC OKI x 800Gs',NULL,'UN',75756.00,113634.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(7,2,NULL,'0010',NULL,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE CELESTE x 1Kg',NULL,'UN',46640.00,69960.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(8,2,NULL,'0011',NULL,'ACRILICO PARA ORTODONCIA OKI AUTOPOLIMERIZABLE CRISTAL x 1Kg',NULL,'UN',86000.00,129000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(9,2,NULL,'0012',NULL,'ACRILICO PARA ORTODONCIA OKI AUTOPOLIMERIZABLE BLANCO/NEGRO x 400Gs',NULL,'UN',42360.00,63540.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(10,2,NULL,'0013',NULL,'ACRILICO ROSADO PARA PLACA BASE INDENTAL x 1 Kg',NULL,'UN',45000.00,67500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(11,2,NULL,'0014',NULL,'ACRILICO PARA INYECCION API x 1Kg CLARO',NULL,'UN',155800.00,233700.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(12,2,NULL,'0015',NULL,'ACRILICO PARA INYECCION API x 1Kg CRISTAL',NULL,'UN',155800.00,233700.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(13,2,NULL,'0016',NULL,'ACRILICO PARA INYECCION API x 1Kg MEDIO',NULL,'UN',155800.00,233700.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(14,2,NULL,'0017',NULL,'ACRILICO PARA INYECCION API x 1Kg OSCURO',NULL,'UN',155800.00,233700.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(15,2,NULL,'0018',NULL,'ACRILICO PARA INYECCION API x 1Kg ROSADO',NULL,'UN',155800.00,233700.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(16,2,NULL,'0019',NULL,'ACRILICO PARA INYECCION API x 1/2Kg CRISTAL',NULL,'UN',96030.00,144045.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(17,2,NULL,'0020',NULL,'ACRILICO TERMOCURABLE EGEO ROSA x 1Kg',NULL,'UN',36000.00,54000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(18,2,NULL,'0021',NULL,'ACRILICO POLIMERO TERMOCURABLE PROTHOPLAST x 1Kg',NULL,'UN',36608.51,54913.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(19,2,NULL,'0022',NULL,'ALAMBRE 0,9mm MORELLI x 50Gs',NULL,'UN',13000.00,19500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(20,2,NULL,'0023',NULL,'ALAMBRE PARA APOYOS ACLUSALES O RETENEDORES MEDIA CAÑA 10CM X 5Unid',NULL,'UN',13000.00,19500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(21,2,NULL,'0024',NULL,'ALGINATO HIGH PRECISION ALGINMAX MAJOR x 453Gs VAINILLA',NULL,'UN',9900.00,14850.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(22,2,NULL,'0025',NULL,'ALGINATO EXTRA HIGH PRECISION ALGINPLUS MAJOR x 453Gs FRUTOS TROPICALES',NULL,'UN',9900.00,14850.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(23,2,NULL,'0026',NULL,'BARBIJO DESCARTABLE VERDE Caja x 50Un',NULL,'UN',5200.00,8320.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(24,2,NULL,'0027',NULL,'BARBIJO DESCARTABLE NEGRO Caja x 50Un',NULL,'UN',5200.00,8320.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(25,2,NULL,'0028',NULL,'BARBIJO DESCARTABLE  BLANCO Caja x 50Un',NULL,'UN',5200.00,8320.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(26,2,NULL,'0029',NULL,'BARBIJO DESCARTABLE CELESTE Caja x 50Un',NULL,'UN',5200.00,8320.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(27,2,NULL,'0030',NULL,'BARBIJO DESCARTABLE ROSADO Caja x 50Un',NULL,'UN',5200.00,8320.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(28,2,NULL,'0031',NULL,'BARBIJO DESCARTABLE ROSADO Caja x 50Un',NULL,'UN',5200.00,8320.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(29,2,NULL,'0032',NULL,'BASE PORTA PINCEL INDENTAL',NULL,'UN',44000.00,70400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(30,2,NULL,'0033',NULL,'BISTURI HOJAS DESCARTABLES x Unidad',NULL,'UN',156.95,251.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(31,2,NULL,'0034',NULL,'BISTURI HOJAS DESCARTABLES Caja x 50Un',NULL,'UN',13078.80,18310.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(32,2,NULL,'0035',NULL,'BLISTER DIENTES ACRITONE 16 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(33,2,NULL,'0036',NULL,'BLISTER DIENTES ACRITONE 16 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(34,2,NULL,'0037',NULL,'BLISTER DIENTES ACRITONE 16 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(35,2,NULL,'0038',NULL,'BLISTER DIENTES ACRITONE 16 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(36,2,NULL,'0039',NULL,'BLISTER DIENTES ACRITONE 16 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(37,2,NULL,'0040',NULL,'BLISTER DIENTES ACRITONE 16 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(38,2,NULL,'0041',NULL,'BLISTER DIENTES ACRITONE 16 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(39,2,NULL,'0042',NULL,'BLISTER DIENTES ACRITONE 16 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(40,2,NULL,'0043',NULL,'BLISTER DIENTES ACRITONE 16 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(41,2,NULL,'0044',NULL,'BLISTER DIENTES ACRITONE 16 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(42,2,NULL,'0045',NULL,'BLISTER DIENTES ACRITONE 16 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(43,2,NULL,'0046',NULL,'BLISTER DIENTES ACRITONE 16 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(44,2,NULL,'0047',NULL,'BLISTER DIENTES ACRITONE 18 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(45,2,NULL,'0048',NULL,'BLISTER DIENTES ACRITONE 18 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(46,2,NULL,'0049',NULL,'BLISTER DIENTES ACRITONE 18 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(47,2,NULL,'0050',NULL,'BLISTER DIENTES ACRITONE 18 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(48,2,NULL,'0051',NULL,'BLISTER DIENTES ACRITONE 18 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(49,2,NULL,'0052',NULL,'BLISTER DIENTES ACRITONE 18 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(50,2,NULL,'0053',NULL,'BLISTER DIENTES ACRITONE 18 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(51,2,NULL,'0054',NULL,'BLISTER DIENTES ACRITONE 18 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(52,2,NULL,'0055',NULL,'BLISTER DIENTES ACRITONE 18 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(53,2,NULL,'0056',NULL,'BLISTER DIENTES ACRITONE 18 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(54,2,NULL,'0057',NULL,'BLISTER DIENTES ACRITONE 18 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(55,2,NULL,'0058',NULL,'BLISTER DIENTES ACRITONE 18 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(56,2,NULL,'0059',NULL,'BLISTER DIENTES ACRITONE 20 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(57,2,NULL,'0060',NULL,'BLISTER DIENTES ACRITONE 20 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(58,2,NULL,'0061',NULL,'BLISTER DIENTES ACRITONE 20 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(59,2,NULL,'0062',NULL,'BLISTER DIENTES ACRITONE 20 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(60,2,NULL,'0063',NULL,'BLISTER DIENTES ACRITONE 20 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(61,2,NULL,'0064',NULL,'BLISTER DIENTES ACRITONE 20 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(62,2,NULL,'0065',NULL,'BLISTER DIENTES ACRITONE 20 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(63,2,NULL,'0066',NULL,'BLISTER DIENTES ACRITONE 20 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(64,2,NULL,'0067',NULL,'BLISTER DIENTES ACRITONE 20 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(65,2,NULL,'0068',NULL,'BLISTER DIENTES ACRITONE 20 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(66,2,NULL,'0069',NULL,'BLISTER DIENTES ACRITONE 20 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(67,2,NULL,'0070',NULL,'BLISTER DIENTES ACRITONE 20 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(68,2,NULL,'0071',NULL,'BLISTER DIENTES ACRITONE 22 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(69,2,NULL,'0072',NULL,'BLISTER DIENTES ACRITONE 22 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(70,2,NULL,'0073',NULL,'BLISTER DIENTES ACRITONE 22 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(71,2,NULL,'0074',NULL,'BLISTER DIENTES ACRITONE 22 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(72,2,NULL,'0075',NULL,'BLISTER DIENTES ACRITONE 22 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(73,2,NULL,'0076',NULL,'BLISTER DIENTES ACRITONE 22 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(74,2,NULL,'0077',NULL,'BLISTER DIENTES ACRITONE 22 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(75,2,NULL,'0078',NULL,'BLISTER DIENTES ACRITONE 22 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(76,2,NULL,'0079',NULL,'BLISTER DIENTES ACRITONE 22 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(77,2,NULL,'0080',NULL,'BLISTER DIENTES ACRITONE 22 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(78,2,NULL,'0081',NULL,'BLISTER DIENTES ACRITONE 22 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(79,2,NULL,'0082',NULL,'BLISTER DIENTES ACRITONE 22 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(80,2,NULL,'0083',NULL,'BLISTER DIENTES ACRITONE 25 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(81,2,NULL,'0084',NULL,'BLISTER DIENTES ACRITONE 25 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(82,2,NULL,'0085',NULL,'BLISTER DIENTES ACRITONE 25 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(83,2,NULL,'0086',NULL,'BLISTER DIENTES ACRITONE 25 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(84,2,NULL,'0087',NULL,'BLISTER DIENTES ACRITONE 25 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(85,2,NULL,'0088',NULL,'BLISTER DIENTES ACRITONE 25 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(86,2,NULL,'0089',NULL,'BLISTER DIENTES ACRITONE 25 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(87,2,NULL,'0090',NULL,'BLISTER DIENTES ACRITONE 25 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(88,2,NULL,'0091',NULL,'BLISTER DIENTES ACRITONE 25 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(89,2,NULL,'0092',NULL,'BLISTER DIENTES ACRITONE 25 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(90,2,NULL,'0093',NULL,'BLISTER DIENTES ACRITONE 25 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(91,2,NULL,'0094',NULL,'BLISTER DIENTES ACRITONE 25 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(92,2,NULL,'0095',NULL,'BLISTER DIENTES ACRITONE 26 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(93,2,NULL,'0096',NULL,'BLISTER DIENTES ACRITONE 26 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(94,2,NULL,'0097',NULL,'BLISTER DIENTES ACRITONE 26 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(95,2,NULL,'0098',NULL,'BLISTER DIENTES ACRITONE 26 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(96,2,NULL,'0099',NULL,'BLISTER DIENTES ACRITONE 26 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(97,2,NULL,'0100',NULL,'BLISTER DIENTES ACRITONE 26 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(98,2,NULL,'0101',NULL,'BLISTER DIENTES ACRITONE 26 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(99,2,NULL,'0102',NULL,'BLISTER DIENTES ACRITONE 26 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(100,2,NULL,'0103',NULL,'BLISTER DIENTES ACRITONE 26 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(101,2,NULL,'0104',NULL,'BLISTER DIENTES ACRITONE 26 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(102,2,NULL,'0105',NULL,'BLISTER DIENTES ACRITONE 26 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(103,2,NULL,'0106',NULL,'BLISTER DIENTES ACRITONE 26 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(104,2,NULL,'0107',NULL,'BLISTER DIENTES ACRITONE 28 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(105,2,NULL,'0108',NULL,'BLISTER DIENTES ACRITONE 28 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(106,2,NULL,'0109',NULL,'BLISTER DIENTES ACRITONE 28 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(107,2,NULL,'0110',NULL,'BLISTER DIENTES ACRITONE 28 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(108,2,NULL,'0111',NULL,'BLISTER DIENTES ACRITONE 28 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(109,2,NULL,'0112',NULL,'BLISTER DIENTES ACRITONE 28 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(110,2,NULL,'0113',NULL,'BLISTER DIENTES ACRITONE 28 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(111,2,NULL,'0114',NULL,'BLISTER DIENTES ACRITONE 28 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(112,2,NULL,'0115',NULL,'BLISTER DIENTES ACRITONE 28 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(113,2,NULL,'0116',NULL,'BLISTER DIENTES ACRITONE 28 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(114,2,NULL,'0117',NULL,'BLISTER DIENTES ACRITONE 28 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(115,2,NULL,'0118',NULL,'BLISTER DIENTES ACRITONE 28 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(116,2,NULL,'0119',NULL,'BLISTER DIENTES ACRITONE 30 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(117,2,NULL,'0120',NULL,'BLISTER DIENTES ACRITONE 30 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(118,2,NULL,'0121',NULL,'BLISTER DIENTES ACRITONE 30 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(119,2,NULL,'0122',NULL,'BLISTER DIENTES ACRITONE 30 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(120,2,NULL,'0123',NULL,'BLISTER DIENTES ACRITONE 30 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(121,2,NULL,'0124',NULL,'BLISTER DIENTES ACRITONE 30 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(122,2,NULL,'0125',NULL,'BLISTER DIENTES ACRITONE 30 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(123,2,NULL,'0126',NULL,'BLISTER DIENTES ACRITONE 30 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(124,2,NULL,'0127',NULL,'BLISTER DIENTES ACRITONE 30 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(125,2,NULL,'0128',NULL,'BLISTER DIENTES ACRITONE 30 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(126,2,NULL,'0129',NULL,'BLISTER DIENTES ACRITONE 30 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(127,2,NULL,'0130',NULL,'BLISTER DIENTES ACRITONE 30 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(128,2,NULL,'0131',NULL,'BLISTER DIENTES ACRITONE 32 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(129,2,NULL,'0132',NULL,'BLISTER DIENTES ACRITONE 32 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(130,2,NULL,'0133',NULL,'BLISTER DIENTES ACRITONE 32 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(131,2,NULL,'0134',NULL,'BLISTER DIENTES ACRITONE 32 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(132,2,NULL,'0135',NULL,'BLISTER DIENTES ACRITONE 32 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(133,2,NULL,'0136',NULL,'BLISTER DIENTES ACRITONE 32 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(134,2,NULL,'0137',NULL,'BLISTER DIENTES ACRITONE 32 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(135,2,NULL,'0138',NULL,'BLISTER DIENTES ACRITONE 32 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(136,2,NULL,'0139',NULL,'BLISTER DIENTES ACRITONE 32 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(137,2,NULL,'0140',NULL,'BLISTER DIENTES ACRITONE 32 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(138,2,NULL,'0141',NULL,'BLISTER DIENTES ACRITONE 32 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(139,2,NULL,'0142',NULL,'BLISTER DIENTES ACRITONE 32 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(140,2,NULL,'0143',NULL,'BLISTER DIENTES ACRITONE 34 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(141,2,NULL,'0144',NULL,'BLISTER DIENTES ACRITONE 34 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(142,2,NULL,'0145',NULL,'BLISTER DIENTES ACRITONE 34 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(143,2,NULL,'0146',NULL,'BLISTER DIENTES ACRITONE 34 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(144,2,NULL,'0147',NULL,'BLISTER DIENTES ACRITONE 34 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(145,2,NULL,'0148',NULL,'BLISTER DIENTES ACRITONE 34 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(146,2,NULL,'0149',NULL,'BLISTER DIENTES ACRITONE 34 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(147,2,NULL,'0150',NULL,'BLISTER DIENTES ACRITONE 34 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(148,2,NULL,'0151',NULL,'BLISTER DIENTES ACRITONE 34 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(149,2,NULL,'0152',NULL,'BLISTER DIENTES ACRITONE 34 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(150,2,NULL,'0153',NULL,'BLISTER DIENTES ACRITONE 34 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(151,2,NULL,'0154',NULL,'BLISTER DIENTES ACRITONE 34 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(152,2,NULL,'0155',NULL,'BLISTER DIENTES ACRITONE 36 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(153,2,NULL,'0156',NULL,'BLISTER DIENTES ACRITONE 36 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(154,2,NULL,'0157',NULL,'BLISTER DIENTES ACRITONE 36 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(155,2,NULL,'0158',NULL,'BLISTER DIENTES ACRITONE 36 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(156,2,NULL,'0159',NULL,'BLISTER DIENTES ACRITONE 36 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(157,2,NULL,'0160',NULL,'BLISTER DIENTES ACRITONE 36 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(158,2,NULL,'0161',NULL,'BLISTER DIENTES ACRITONE 36 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(159,2,NULL,'0162',NULL,'BLISTER DIENTES ACRITONE 36 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(160,2,NULL,'0163',NULL,'BLISTER DIENTES ACRITONE 36 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(161,2,NULL,'0164',NULL,'BLISTER DIENTES ACRITONE 36 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(162,2,NULL,'0165',NULL,'BLISTER DIENTES ACRITONE 36 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(163,2,NULL,'0166',NULL,'BLISTER DIENTES ACRITONE 36 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(164,2,NULL,'0167',NULL,'BLISTER DIENTES ACRITONE 38 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(165,2,NULL,'0168',NULL,'BLISTER DIENTES ACRITONE 38 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(166,2,NULL,'0169',NULL,'BLISTER DIENTES ACRITONE 38 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(167,2,NULL,'0170',NULL,'BLISTER DIENTES ACRITONE 38 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(168,2,NULL,'0171',NULL,'BLISTER DIENTES ACRITONE 38 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(169,2,NULL,'0172',NULL,'BLISTER DIENTES ACRITONE 38 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(170,2,NULL,'0173',NULL,'BLISTER DIENTES ACRITONE 38 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(171,2,NULL,'0174',NULL,'BLISTER DIENTES ACRITONE 38 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(172,2,NULL,'0175',NULL,'BLISTER DIENTES ACRITONE 38 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(173,2,NULL,'0176',NULL,'BLISTER DIENTES ACRITONE 38 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(174,2,NULL,'0177',NULL,'BLISTER DIENTES ACRITONE 38 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(175,2,NULL,'0178',NULL,'BLISTER DIENTES ACRITONE 38 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(176,2,NULL,'0179',NULL,'BLISTER DIENTES ACRITONE 40 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(177,2,NULL,'0180',NULL,'BLISTER DIENTES ACRITONE 40 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(178,2,NULL,'0181',NULL,'BLISTER DIENTES ACRITONE 40 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(179,2,NULL,'0182',NULL,'BLISTER DIENTES ACRITONE 40 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(180,2,NULL,'0183',NULL,'BLISTER DIENTES ACRITONE 40 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(181,2,NULL,'0184',NULL,'BLISTER DIENTES ACRITONE 40 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(182,2,NULL,'0185',NULL,'BLISTER DIENTES ACRITONE 40 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(183,2,NULL,'0186',NULL,'BLISTER DIENTES ACRITONE 40 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(184,2,NULL,'0187',NULL,'BLISTER DIENTES ACRITONE 40 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(185,2,NULL,'0188',NULL,'BLISTER DIENTES ACRITONE 40 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(186,2,NULL,'0189',NULL,'BLISTER DIENTES ACRITONE 40 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(187,2,NULL,'0190',NULL,'BLISTER DIENTES ACRITONE 40 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(188,2,NULL,'0191',NULL,'BLISTER DIENTES ACRITONE 16 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(189,2,NULL,'0192',NULL,'BLISTER DIENTES ACRITONE 16 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(190,2,NULL,'0193',NULL,'BLISTER DIENTES ACRITONE 16 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(191,2,NULL,'0194',NULL,'BLISTER DIENTES ACRITONE 16 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(192,2,NULL,'0195',NULL,'BLISTER DIENTES ACRITONE 16 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(193,2,NULL,'0196',NULL,'BLISTER DIENTES ACRITONE 16 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(194,2,NULL,'0197',NULL,'BLISTER DIENTES ACRITONE 16 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(195,2,NULL,'0198',NULL,'BLISTER DIENTES ACRITONE 16 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(196,2,NULL,'0199',NULL,'BLISTER DIENTES ACRITONE 16 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(197,2,NULL,'0200',NULL,'BLISTER DIENTES ACRITONE 16 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(198,2,NULL,'0201',NULL,'BLISTER DIENTES ACRITONE 16 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(199,2,NULL,'0202',NULL,'BLISTER DIENTES ACRITONE 16 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(200,2,NULL,'0203',NULL,'BLISTER DIENTES ACRITONE 18 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(201,2,NULL,'0204',NULL,'BLISTER DIENTES ACRITONE 18 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(202,2,NULL,'0205',NULL,'BLISTER DIENTES ACRITONE 18 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(203,2,NULL,'0206',NULL,'BLISTER DIENTES ACRITONE 18 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(204,2,NULL,'0207',NULL,'BLISTER DIENTES ACRITONE 18 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(205,2,NULL,'0208',NULL,'BLISTER DIENTES ACRITONE 18 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(206,2,NULL,'0209',NULL,'BLISTER DIENTES ACRITONE 18 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(207,2,NULL,'0210',NULL,'BLISTER DIENTES ACRITONE 18 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(208,2,NULL,'0211',NULL,'BLISTER DIENTES ACRITONE 18 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(209,2,NULL,'0212',NULL,'BLISTER DIENTES ACRITONE 18 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(210,2,NULL,'0213',NULL,'BLISTER DIENTES ACRITONE 18 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(211,2,NULL,'0214',NULL,'BLISTER DIENTES ACRITONE 18 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(212,2,NULL,'0215',NULL,'BLISTER DIENTES ACRITONE 20 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(213,2,NULL,'0216',NULL,'BLISTER DIENTES ACRITONE 20 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(214,2,NULL,'0217',NULL,'BLISTER DIENTES ACRITONE 20 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(215,2,NULL,'0218',NULL,'BLISTER DIENTES ACRITONE 20 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(216,2,NULL,'0219',NULL,'BLISTER DIENTES ACRITONE 20 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(217,2,NULL,'0220',NULL,'BLISTER DIENTES ACRITONE 20 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(218,2,NULL,'0221',NULL,'BLISTER DIENTES ACRITONE 20 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(219,2,NULL,'0222',NULL,'BLISTER DIENTES ACRITONE 20 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(220,2,NULL,'0223',NULL,'BLISTER DIENTES ACRITONE 20 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(221,2,NULL,'0224',NULL,'BLISTER DIENTES ACRITONE 20 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(222,2,NULL,'0225',NULL,'BLISTER DIENTES ACRITONE 20 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(223,2,NULL,'0226',NULL,'BLISTER DIENTES ACRITONE 25 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(224,2,NULL,'0227',NULL,'BLISTER DIENTES ACRITONE 25 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(225,2,NULL,'0228',NULL,'BLISTER DIENTES ACRITONE 25 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(226,2,NULL,'0229',NULL,'BLISTER DIENTES ACRITONE 25 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(227,2,NULL,'0230',NULL,'BLISTER DIENTES ACRITONE 25 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(228,2,NULL,'0231',NULL,'BLISTER DIENTES ACRITONE 25 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(229,2,NULL,'0232',NULL,'BLISTER DIENTES ACRITONE 25 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(230,2,NULL,'0233',NULL,'BLISTER DIENTES ACRITONE 25 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(231,2,NULL,'0234',NULL,'BLISTER DIENTES ACRITONE 25 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(232,2,NULL,'0235',NULL,'BLISTER DIENTES ACRITONE 25 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(233,2,NULL,'0236',NULL,'BLISTER DIENTES ACRITONE 25 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(234,2,NULL,'0237',NULL,'BLISTER DIENTES ACRITONE 25 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(235,2,NULL,'0238',NULL,'BLISTER DIENTES ACRITONE 26 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(236,2,NULL,'0239',NULL,'BLISTER DIENTES ACRITONE 26 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(237,2,NULL,'0240',NULL,'BLISTER DIENTES ACRITONE 26 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(238,2,NULL,'0241',NULL,'BLISTER DIENTES ACRITONE 26 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(239,2,NULL,'0242',NULL,'BLISTER DIENTES ACRITONE 26 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(240,2,NULL,'0243',NULL,'BLISTER DIENTES ACRITONE 26 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(241,2,NULL,'0244',NULL,'BLISTER DIENTES ACRITONE 26 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(242,2,NULL,'0245',NULL,'BLISTER DIENTES ACRITONE 26 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(243,2,NULL,'0246',NULL,'BLISTER DIENTES ACRITONE 26 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(244,2,NULL,'0247',NULL,'BLISTER DIENTES ACRITONE 26 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(245,2,NULL,'0248',NULL,'BLISTER DIENTES ACRITONE 26 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(246,2,NULL,'0249',NULL,'BLISTER DIENTES ACRITONE 26 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(247,2,NULL,'0250',NULL,'BLISTER DIENTES ACRITONE 30 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(248,2,NULL,'0251',NULL,'BLISTER DIENTES ACRITONE 30 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(249,2,NULL,'0252',NULL,'BLISTER DIENTES ACRITONE 30 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(250,2,NULL,'0253',NULL,'BLISTER DIENTES ACRITONE 30 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(251,2,NULL,'0254',NULL,'BLISTER DIENTES ACRITONE 30 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(252,2,NULL,'0255',NULL,'BLISTER DIENTES ACRITONE 30 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(253,2,NULL,'0256',NULL,'BLISTER DIENTES ACRITONE 30 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(254,2,NULL,'0257',NULL,'BLISTER DIENTES ACRITONE 30 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(255,2,NULL,'0258',NULL,'BLISTER DIENTES ACRITONE 30 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(256,2,NULL,'0259',NULL,'BLISTER DIENTES ACRITONE 30 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(257,2,NULL,'0260',NULL,'BLISTER DIENTES ACRITONE 30 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(258,2,NULL,'0261',NULL,'BLISTER DIENTES ACRITONE 30 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(259,2,NULL,'0262',NULL,'BLISTER DIENTES ACRITONE 32 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(260,2,NULL,'0263',NULL,'BLISTER DIENTES ACRITONE 32 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(261,2,NULL,'0264',NULL,'BLISTER DIENTES ACRITONE 32 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(262,2,NULL,'0265',NULL,'BLISTER DIENTES ACRITONE 32 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(263,2,NULL,'0266',NULL,'BLISTER DIENTES ACRITONE 32 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(264,2,NULL,'0267',NULL,'BLISTER DIENTES ACRITONE 32 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(265,2,NULL,'0268',NULL,'BLISTER DIENTES ACRITONE 32 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(266,2,NULL,'0269',NULL,'BLISTER DIENTES ACRITONE 32 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(267,2,NULL,'0270',NULL,'BLISTER DIENTES ACRITONE 32 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(268,2,NULL,'0271',NULL,'BLISTER DIENTES ACRITONE 32 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(269,2,NULL,'0272',NULL,'BLISTER DIENTES ACRITONE 32 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(270,2,NULL,'0273',NULL,'BLISTER DIENTES ACRITONE 32 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(271,2,NULL,'0274',NULL,'BLISTER DIENTES ACRITONE 36 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(272,2,NULL,'0275',NULL,'BLISTER DIENTES ACRITONE 36 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(273,2,NULL,'0276',NULL,'BLISTER DIENTES ACRITONE 36 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(274,2,NULL,'0277',NULL,'BLISTER DIENTES ACRITONE 36 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(275,2,NULL,'0278',NULL,'BLISTER DIENTES ACRITONE 36 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(276,2,NULL,'0279',NULL,'BLISTER DIENTES ACRITONE 36 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(277,2,NULL,'0280',NULL,'BLISTER DIENTES ACRITONE 36 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(278,2,NULL,'0281',NULL,'BLISTER DIENTES ACRITONE 36 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(279,2,NULL,'0282',NULL,'BLISTER DIENTES ACRITONE 36 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(280,2,NULL,'0283',NULL,'BLISTER DIENTES ACRITONE 36 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(281,2,NULL,'0284',NULL,'BLISTER DIENTES ACRITONE 36 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(282,2,NULL,'0285',NULL,'BLISTER DIENTES ACRITONE 36 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(283,2,NULL,'0286',NULL,'BLISTER DIENTES ACRITONE 38 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(284,2,NULL,'0287',NULL,'BLISTER DIENTES ACRITONE 38 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(285,2,NULL,'0288',NULL,'BLISTER DIENTES ACRITONE 38 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(286,2,NULL,'0289',NULL,'BLISTER DIENTES ACRITONE 38 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(287,2,NULL,'0290',NULL,'BLISTER DIENTES ACRITONE 38 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(288,2,NULL,'0291',NULL,'BLISTER DIENTES ACRITONE 38 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(289,2,NULL,'0292',NULL,'BLISTER DIENTES ACRITONE 38 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(290,2,NULL,'0293',NULL,'BLISTER DIENTES ACRITONE 38 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(291,2,NULL,'0294',NULL,'BLISTER DIENTES ACRITONE 38 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(292,2,NULL,'0295',NULL,'BLISTER DIENTES ACRITONE 38 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(293,2,NULL,'0296',NULL,'BLISTER DIENTES ACRITONE 38 inf, 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(294,2,NULL,'0297',NULL,'BLISTER DIENTES ACRITONE 38 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(295,2,NULL,'0298',NULL,'BLISTER DIENTES ACRITONE 40 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(296,2,NULL,'0299',NULL,'BLISTER DIENTES ACRITONE 40 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(297,2,NULL,'0300',NULL,'BLISTER DIENTES ACRITONE 40 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(298,2,NULL,'0301',NULL,'BLISTER DIENTES ACRITONE 40 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(299,2,NULL,'0302',NULL,'BLISTER DIENTES ACRITONE 40 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(300,2,NULL,'0303',NULL,'BLISTER DIENTES ACRITONE 40 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(301,2,NULL,'0304',NULL,'BLISTER DIENTES ACRITONE 40 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(302,2,NULL,'0305',NULL,'BLISTER DIENTES ACRITONE 40 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(303,2,NULL,'0306',NULL,'BLISTER DIENTES ACRITONE 40 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(304,2,NULL,'0307',NULL,'BLISTER DIENTES ACRITONE 40 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(305,2,NULL,'0308',NULL,'BLISTER DIENTES ACRITONE 40 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(306,2,NULL,'0309',NULL,'BLISTER DIENTES ACRITONE 40 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(307,2,NULL,'0310',NULL,'BLISTER DIENTES ACRITONE P4 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(308,2,NULL,'0311',NULL,'BLISTER DIENTES ACRITONE P4 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(309,2,NULL,'0312',NULL,'BLISTER DIENTES ACRITONE P4 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(310,2,NULL,'0313',NULL,'BLISTER DIENTES ACRITONE P4 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(311,2,NULL,'0314',NULL,'BLISTER DIENTES ACRITONE P4 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(312,2,NULL,'0315',NULL,'BLISTER DIENTES ACRITONE P4 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(313,2,NULL,'0316',NULL,'BLISTER DIENTES ACRITONE P4 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(314,2,NULL,'0317',NULL,'BLISTER DIENTES ACRITONE P4 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(315,2,NULL,'0318',NULL,'BLISTER DIENTES ACRITONE P4 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(316,2,NULL,'0319',NULL,'BLISTER DIENTES ACRITONE P4 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(317,2,NULL,'0320',NULL,'BLISTER DIENTES ACRITONE P4 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(318,2,NULL,'0321',NULL,'BLISTER DIENTES ACRITONE P4 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(319,2,NULL,'0322',NULL,'BLISTER DIENTES ACRITONE P5 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(320,2,NULL,'0323',NULL,'BLISTER DIENTES ACRITONE P5 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(321,2,NULL,'0324',NULL,'BLISTER DIENTES ACRITONE P5 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(322,2,NULL,'0325',NULL,'BLISTER DIENTES ACRITONE P5 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(323,2,NULL,'0326',NULL,'BLISTER DIENTES ACRITONE P5 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(324,2,NULL,'0327',NULL,'BLISTER DIENTES ACRITONE P5 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(325,2,NULL,'0328',NULL,'BLISTER DIENTES ACRITONE P5 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(326,2,NULL,'0329',NULL,'BLISTER DIENTES ACRITONE P5 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(327,2,NULL,'0330',NULL,'BLISTER DIENTES ACRITONE P5 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(328,2,NULL,'0331',NULL,'BLISTER DIENTES ACRITONE P5 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(329,2,NULL,'0332',NULL,'BLISTER DIENTES ACRITONE P5 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(330,2,NULL,'0333',NULL,'BLISTER DIENTES ACRITONE P5 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(331,2,NULL,'0334',NULL,'BLISTER DIENTES ACRITONE P6 sup 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(332,2,NULL,'0335',NULL,'BLISTER DIENTES ACRITONE P6 sup 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(333,2,NULL,'0336',NULL,'BLISTER DIENTES ACRITONE P6 sup 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(334,2,NULL,'0337',NULL,'BLISTER DIENTES ACRITONE P6 sup 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(335,2,NULL,'0338',NULL,'BLISTER DIENTES ACRITONE P6 sup 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(336,2,NULL,'0339',NULL,'BLISTER DIENTES ACRITONE P6 sup B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(337,2,NULL,'0340',NULL,'BLISTER DIENTES ACRITONE P6 sup 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(338,2,NULL,'0341',NULL,'BLISTER DIENTES ACRITONE P6 sup 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(339,2,NULL,'0342',NULL,'BLISTER DIENTES ACRITONE P6 sup 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(340,2,NULL,'0343',NULL,'BLISTER DIENTES ACRITONE P6 sup 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(341,2,NULL,'0344',NULL,'BLISTER DIENTES ACRITONE P6 sup 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(342,2,NULL,'0345',NULL,'BLISTER DIENTES ACRITONE P6 sup D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(343,2,NULL,'0346',NULL,'BLISTER DIENTES ACRITONE P4 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(344,2,NULL,'0347',NULL,'BLISTER DIENTES ACRITONE P4 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(345,2,NULL,'0348',NULL,'BLISTER DIENTES ACRITONE P4 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(346,2,NULL,'0349',NULL,'BLISTER DIENTES ACRITONE P4 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(347,2,NULL,'0350',NULL,'BLISTER DIENTES ACRITONE P4 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(348,2,NULL,'0351',NULL,'BLISTER DIENTES ACRITONE P4 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(349,2,NULL,'0352',NULL,'BLISTER DIENTES ACRITONE P4 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(350,2,NULL,'0353',NULL,'BLISTER DIENTES ACRITONE P4 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(351,2,NULL,'0354',NULL,'BLISTER DIENTES ACRITONE P4 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(352,2,NULL,'0355',NULL,'BLISTER DIENTES ACRITONE P4 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(353,2,NULL,'0356',NULL,'BLISTER DIENTES ACRITONE P4 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(354,2,NULL,'0357',NULL,'BLISTER DIENTES ACRITONE P4 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(355,2,NULL,'0358',NULL,'BLISTER DIENTES ACRITONE P5 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(356,2,NULL,'0359',NULL,'BLISTER DIENTES ACRITONE P5 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(357,2,NULL,'0360',NULL,'BLISTER DIENTES ACRITONE P5 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(358,2,NULL,'0361',NULL,'BLISTER DIENTES ACRITONE P5 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(359,2,NULL,'0362',NULL,'BLISTER DIENTES ACRITONE P5 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(360,2,NULL,'0363',NULL,'BLISTER DIENTES ACRITONE P5 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(361,2,NULL,'0364',NULL,'BLISTER DIENTES ACRITONE P5 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(362,2,NULL,'0365',NULL,'BLISTER DIENTES ACRITONE P5 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(363,2,NULL,'0366',NULL,'BLISTER DIENTES ACRITONE P5 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(364,2,NULL,'0367',NULL,'BLISTER DIENTES ACRITONE P5 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(365,2,NULL,'0368',NULL,'BLISTER DIENTES ACRITONE P5 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(366,2,NULL,'0369',NULL,'BLISTER DIENTES ACRITONE P5 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(367,2,NULL,'0370',NULL,'BLISTER DIENTES ACRITONE P6 inf 61 (A1)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(368,2,NULL,'0371',NULL,'BLISTER DIENTES ACRITONE P6 inf 62 (A2)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(369,2,NULL,'0372',NULL,'BLISTER DIENTES ACRITONE P6 inf 66 (A3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(370,2,NULL,'0373',NULL,'BLISTER DIENTES ACRITONE P6 inf 67 (A3,5)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(371,2,NULL,'0374',NULL,'BLISTER DIENTES ACRITONE P6 inf 81 (A4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(372,2,NULL,'0375',NULL,'BLISTER DIENTES ACRITONE P6 inf B2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(373,2,NULL,'0376',NULL,'BLISTER DIENTES ACRITONE P6 inf 65',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(374,2,NULL,'0377',NULL,'BLISTER DIENTES ACRITONE P6 inf 68',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(375,2,NULL,'0378',NULL,'BLISTER DIENTES ACRITONE P6 inf 69 (C3)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(376,2,NULL,'0379',NULL,'BLISTER DIENTES ACRITONE P6 inf 71',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(377,2,NULL,'0380',NULL,'BLISTER DIENTES ACRITONE P6 inf 77 (C4)',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(378,2,NULL,'0381',NULL,'BLISTER DIENTES ACRITONE P6 inf D2',NULL,'UN',1065.00,1704.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(379,2,NULL,'0382',NULL,'CAJA DE TRABAJO CON LUZ LED INDENTAL COLOR BLANCO',NULL,'UN',144000.00,230400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(380,2,NULL,'0383',NULL,'CALENTADOR DE CERA CON 4 DIVISIONES INDENTAL',NULL,'UN',220000.00,352000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(381,2,NULL,'0384',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 120mm ROSA MEDIO',NULL,'UN',6600.00,9900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(382,2,NULL,'0385',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 85mm ROSA MEDIO',NULL,'UN',5950.00,8925.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(383,2,NULL,'0386',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 22mm x 55mm ROSA MEDIO',NULL,'UN',5000.00,7500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(384,2,NULL,'0387',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 90mm ROSA MEDIO',NULL,'UN',6600.00,9900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(385,2,NULL,'0388',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 70mm ROSA MEDIO',NULL,'UN',5950.00,8925.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(386,2,NULL,'0389',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX CLASSIC 25mm x 50mm ROSA MEDIO',NULL,'UN',5000.00,7500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(387,2,NULL,'0390',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 120mm ROSA MEDIO',NULL,'UN',6600.00,9900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(388,2,NULL,'0391',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 85mm ROSA MEDIO',NULL,'UN',5950.00,8925.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(389,2,NULL,'0392',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 22mm x 55mm ROSA MEDIO',NULL,'UN',5000.00,7500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(390,2,NULL,'0393',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 90mm ROSA MEDIO',NULL,'UN',6600.00,9900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(391,2,NULL,'0394',NULL,'CARTUCHO POLIAMIDA DEFLEX FLUENCE 25mm x 70mm ROSA MEDIO',NULL,'UN',5950.00,8925.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(392,2,NULL,'0395',NULL,'CARTUCHO POLIAMIDA PARA INYECCION DEFLEX FLUENCE 25mm x 50mm ROSA MEDIO',NULL,'UN',5000.00,7500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(393,2,NULL,'0396',NULL,'CARTUCHO PARA INYECCION INDENTAL INDENT FLEX 22mm x 120mm',NULL,'UN',4500.00,6750.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(394,2,NULL,'0397',NULL,'CARTUCHO ACRILICO PARA INYECCION API 22mm CLARO',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(395,2,NULL,'0398',NULL,'CARTUCHO ACRILICO PARA INYECCION API 22mm CRISTAL',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(396,2,NULL,'0399',NULL,'CARTUCHO ACRILICO PARA INYECCION API 22mm MEDIO',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(397,2,NULL,'0400',NULL,'CARTUCHO ACRILICO PARA INYECCION API 22mm OSCURO',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(398,2,NULL,'0401',NULL,'CARTUCHO ACRILICO PARA INYECCION API 22mm ROSADO',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(399,2,NULL,'0402',NULL,'CARTUCHO ACRILICO PARA INYECCION API 25mm CLARO',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(400,2,NULL,'0403',NULL,'CARTUCHO ACRILICO PARA INYECCION API 25mm CRISTAL',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(401,2,NULL,'0404',NULL,'CARTUCHO ACRILICO PARA INYECCION API 25mm MEDIO',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(402,2,NULL,'0405',NULL,'CARTUCHO ACRILICO PARA INYECCION API 25mm OSCURO',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(403,2,NULL,'0406',NULL,'CARTUCHO ACRILICO PARA INYECCION API 25mm ROSADO',NULL,'UN',7420.00,11130.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(404,2,NULL,'0407',NULL,'CARTUCHOS VACIOS PARA INYECCION INDENTAL 22mm x 120mm CON TAPA',NULL,'UN',800.00,1280.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(405,2,NULL,'0408',NULL,'CARTUCHOS VACIOS PARA INYECCION INDENTAL 25mm x 100mm CON TAPA',NULL,'UN',800.00,1280.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(406,2,NULL,'0409',NULL,'CEPILLO 2 HILERAS ROMAN PARA PULIDORA x UNIDAD',NULL,'UN',4000.00,6000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(407,2,NULL,'0410',NULL,'CERA CERVICAL OKI x 50gr',NULL,'UN',37000.00,59200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(408,2,NULL,'0411',NULL,'CERA CROMO INDENTAL x 1/2Kg',NULL,'UN',37000.00,59200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(409,2,NULL,'0412',NULL,'CERA ROSA EN LAMINAS INDENTAL CAJA x 1Kg',NULL,'UN',36100.00,57760.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(410,2,NULL,'0413',NULL,'CERA ROSA EN LAMINAS INDENTAL x UNIDAD',NULL,'UN',700.00,1120.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(411,2,NULL,'0414',NULL,'CERA PARA INMERSION OKI x 30Gs',NULL,'UN',29700.00,47520.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(412,2,NULL,'0415',NULL,'CERA PREFORMADA INDENTAL PLACA CERICA INF. O SUP. x UNIDAD',NULL,'UN',560.00,896.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(413,2,NULL,'0416',NULL,'CERA REGULAR PARA FIJA OKI VARIOS COLORES x 50Gs',NULL,'UN',33000.00,52800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(414,2,NULL,'0417',NULL,'CIZALLA PARA CORTE YESO',NULL,'UN',27500.00,38500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(415,2,NULL,'0418',NULL,'COMPRESA PAQUETE x 50 UNIDADES',NULL,'UN',6000.00,8400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(416,2,NULL,'0419',NULL,'CREMA SUPER BRILLO INDENTAL x 20Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)',NULL,'UN',19000.00,30400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(417,2,NULL,'0420',NULL,'DESMOLDANTE PARA INYECCION INDENTAL EN AEROSOL',NULL,'UN',10100.00,16160.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(418,2,NULL,'0421',NULL,'DESMOLDANTE SILICONADO PARA INYECCION DEFLEX EN AEROSOL x 290Gs',NULL,'UN',5800.00,8700.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(419,2,NULL,'0422',NULL,'DISCO DE FIBRA SILICIO FLEXIBLE 22mm x 0,2mm',NULL,'UN',1900.00,3040.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(420,2,NULL,'0423',NULL,'DOSIFICADOR AGUA-ALGINATO',NULL,'UN',2200.00,3080.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(421,2,NULL,'0424',NULL,'ESTUCHE BUCAL PLASTICO VARIOS COLORES',NULL,'UN',1000.00,1600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(422,2,NULL,'0425',NULL,'FLAMEADOR ROMAN',NULL,'UN',2800.00,4200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(423,2,NULL,'0426',NULL,'FRESON CARBURO',NULL,'UN',15500.00,24800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(424,2,NULL,'0427',NULL,'GELATINA PARA COLADO API SOBRE PARA 1Kg',NULL,'UN',26800.00,42880.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(425,2,NULL,'0428',NULL,'GLACE PARA PORCELANA INDENTAL MONO PASTA x 10gr',NULL,'UN',67000.00,107200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(426,2,NULL,'0429',NULL,'GUANTES LATEX DESCARTABLES CAJA x 100 Ud',NULL,'UN',6200.00,8680.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(427,2,NULL,'0430',NULL,'GUANTES NITRILO DESCARTABLES CAJA x 100 Ud',NULL,'UN',6200.00,8680.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(428,2,NULL,'0431',NULL,'GUIA DE COLORES ACRITONE DIENTES DE STOCK',NULL,'UN',1500.00,2400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(429,2,NULL,'0432',NULL,'HORNO DE DESENCERADO COMPUTARIZADO TECNODENT H-21 E FURNACE USADO',NULL,'UN',900000.00,1440000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(430,2,NULL,'0433',NULL,'HORNO MULTIRET PARA RETENEDORES C/DEDAL Y LIQUIDO INDENTAL',NULL,'UN',280000.00,448000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(431,2,NULL,'0434',NULL,'INDENT-FLEX MATERIAL DE INYECCION INDENTAL x 1Kg',NULL,'UN',70900.00,99260.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(432,2,NULL,'0435',NULL,'INDENT-FLEX MATERIAL DE INYECCION INDENTAL x 1/2Kg',NULL,'UN',40700.00,56980.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(433,2,NULL,'0436',NULL,'INYECTORA COMPUTARIZADA INDENTAL PARA FLEXIBLE DE AIRE',NULL,'UN',1225000.00,1960000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(434,2,NULL,'0437',NULL,'KIT SISTEMA COLADO APC',NULL,'UN',415000.00,581000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(435,2,NULL,'0438',NULL,'KIT REPARACION PARA API',NULL,'UN',32000.00,44800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(436,2,NULL,'0439',NULL,'KIT ZOCALOS ROSA',NULL,'UN',10990.00,15386.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(437,2,NULL,'0440',NULL,'LACA OPACADORA PARA ACRILICO INDENTAL COLOR ROSA',NULL,'UN',23900.00,33460.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(438,2,NULL,'0441',NULL,'LACA OPACADORA PARA ACRILICO INDENTAL COLOR DIENTE',NULL,'UN',23900.00,33460.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(439,2,NULL,'0442',NULL,'LACA DE ESCAYOLA INDENTAL',NULL,'UN',14000.00,19600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(440,2,NULL,'0443',NULL,'LIQUIDO CHEQUEADOR DE SUPERFICIES INDENTAL',NULL,'UN',7000.00,9800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(441,2,NULL,'0444',NULL,'LIQUIDO GLACE PARA PORCELANA OKI',NULL,'UN',25000.00,35000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(442,2,NULL,'0445',NULL,'LIQUIDO MODELADOR PARA PORCELANA OKI x 100cc',NULL,'UN',30000.00,42000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(443,2,NULL,'0446',NULL,'MANDRIL PARA DISCO',NULL,'UN',860.00,1376.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(444,2,NULL,'0447',NULL,'MANDRIL PARA LIJA',NULL,'UN',860.00,1376.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(445,2,NULL,'0448',NULL,'MATRIZ DE PONTICOS Y TRAMOS PARA PORCELANA',NULL,'UN',45000.00,58500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(446,2,NULL,'0449',NULL,'MATRIZ DE SILICONA PARA CARILLAS PARA SOBRE DENTADURA',NULL,'UN',45000.00,58500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(447,2,NULL,'0450',NULL,'MATRIZ DE SILICONA PARA CARAS OCLUSALES',NULL,'UN',45000.00,58500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(448,2,NULL,'0451',NULL,'MATRIZ DE SILICONA PARA RODETES',NULL,'UN',45000.00,58500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(449,2,NULL,'0452',NULL,'MECHERO PARA LABORATORIO CON RECIPIENTE CON VALVULA',NULL,'UN',134000.00,174200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(450,2,NULL,'0453',NULL,'MICROBRUSH',NULL,'UN',3270.00,5232.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(451,2,NULL,'0454',NULL,'MICROMOTOR ELECTRICO RENHE 119',NULL,'UN',189000.00,264600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(452,2,NULL,'0455',NULL,'MINIACUTRAC',NULL,'UN',9000.00,12600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(453,2,NULL,'0456',NULL,'MODIFICADOR DE COLORES PARA ACRILICO KIT DE 4 COLORES + BETAS',NULL,'UN',35000.00,49000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(454,2,NULL,'0457',NULL,'MONOMERO PARA COLADO OKI x 1Lt',NULL,'UN',42140.00,58996.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(455,2,NULL,'0458',NULL,'MONOMERO SEMIFLEX API x 1Lt',NULL,'UN',60110.00,84154.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(456,2,NULL,'0459',NULL,'MONOMERO TERMOCURADO x 1Lt',NULL,'UN',23000.00,36800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(457,2,NULL,'0460',NULL,'MONOMERO AUTO x 1Lt NEW POLL',NULL,'UN',51775.00,72485.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(458,2,NULL,'0461',NULL,'MONOMERO AUTO x 1Lt VERACRIL',NULL,'UN',38935.00,54509.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(459,2,NULL,'0462',NULL,'MONOMERO AUTO x 1Lt VAICEL',NULL,'UN',36923.00,51692.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(460,2,NULL,'0463',NULL,'MONOMERO AUTO x 1Lt SUBITON',NULL,'UN',36868.00,51615.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(461,2,NULL,'0464',NULL,'MONOMERO TERMO x 1Lt NEW POLL',NULL,'UN',49478.00,69269.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(462,2,NULL,'0465',NULL,'MONOMERO TERMO x 1Lt VERACRIL',NULL,'UN',37755.00,52857.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(463,2,NULL,'0466',NULL,'MONOMERO TERMO x 1Lt TERMODEN',NULL,'UN',33725.00,47215.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(464,2,NULL,'0467',NULL,'MONOMERO TERMO x 1Lt VAICRON',NULL,'UN',29082.00,40715.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(465,2,NULL,'0468',NULL,'MONOMERO TERMO x 1Lt PROTHOPLAST',NULL,'UN',27839.00,38975.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(466,2,NULL,'0469',NULL,'MUFLA PARA SISTEMA APC INDENTAL',NULL,'UN',78000.00,109200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(467,2,NULL,'0470',NULL,'MUFLA METALICA PARA INYECTORA DEFLEX',NULL,'UN',20000.00,28000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(468,2,NULL,'0471',NULL,'OCLUSOR MAGNETICO INDENTAL',NULL,'UN',30000.00,42000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(469,2,NULL,'0472',NULL,'OCLUSORES PLASTICOS PARA FIJA',NULL,'UN',360.00,504.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(470,2,NULL,'0473',NULL,'OCLUSORES PARA REMOVIBLE ROMAN',NULL,'UN',1400.00,1960.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(471,2,NULL,'0474',NULL,'OPACIFICADOR DE METALES BASE ROSA INDENTAL',NULL,'UN',10000.00,14000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(472,2,NULL,'0475',NULL,'OPACIFICADOR DE METALES BASE DIENTE INDENTAL',NULL,'UN',10000.00,14000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(473,2,NULL,'0476',NULL,'PASTA PARA BRILLO DEFLEX x 200Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)',NULL,'UN',6500.00,9100.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(474,2,NULL,'0477',NULL,'PASTA ALTO BRILLO INDENTAL x 20Gs (POLIAMIDA, FLEXIBLE, ACRILICO, METAL)',NULL,'UN',1000.00,1400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(475,2,NULL,'0478',NULL,'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX BLANCO',NULL,'UN',3500.00,4900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(476,2,NULL,'0479',NULL,'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX MARRON',NULL,'UN',3500.00,4900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(477,2,NULL,'0480',NULL,'PASTA PARA SOPORTE DE CORONA JERINGA SUPER FIX BEIGE',NULL,'UN',3500.00,4900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(478,2,NULL,'0481',NULL,'PIEDRA POMEZ COMUN INDENTAL SUPER ESPECIAL x 1Kg',NULL,'UN',3850.00,5390.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(479,2,NULL,'0482',NULL,'PIGMENTO PARA ACRILICO EN POLVO 20G PARA ORTODONCIA OKI',NULL,'UN',11000.00,15400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(480,2,NULL,'0483',NULL,'PINCEL MANGO N°4',NULL,'UN',4000.00,5600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(481,2,NULL,'0484',NULL,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x UNIDAD',NULL,'UN',1800.00,2880.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(482,2,NULL,'0485',NULL,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un',NULL,'UN',12000.00,19200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(483,2,NULL,'0486',NULL,'PLACAS PARA TERMOFORMADO RIGIDA 0,02 (0,5mm) DENT 3D x PACK x 10Un',NULL,'UN',5000.00,8000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(484,2,NULL,'0487',NULL,'PLACAS PARA TERMOFORMADO RIGIDA 0,03 (0,75mm) DENT 3D x PACK x 10Un',NULL,'UN',5500.00,8800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(485,2,NULL,'0488',NULL,'PLACAS PARA TERMOFORMADO RIGIDA 0,04 (1mm) DENT 3D x PACK x 10Un',NULL,'UN',6000.00,9600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(486,2,NULL,'0489',NULL,'PORTAGUANTES',NULL,'UN',5000.00,7000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(487,2,NULL,'0490',NULL,'PORTA INSTRUMENTAL INDENTAL',NULL,'UN',25000.00,35000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(488,2,NULL,'0491',NULL,'PROTECTOR PLASTICO PARA PULIDORA CON VICERA CRISTAL INDENTAL',NULL,'UN',57200.00,80080.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(489,2,NULL,'0492',NULL,'PULIDORA ELECTROLITICA INDENTAL',NULL,'UN',622.00,871.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(490,2,NULL,'0493',NULL,'REFUERZO SUPERIOR ENMALLADO DE ACERO INOX x 10 UNIDADES',NULL,'UN',8200.00,11480.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(491,2,NULL,'0494',NULL,'REFUERZO SUPERIOR ENMALLADO DE ACERO INOX x UNIDAD',NULL,'UN',950.00,1330.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(492,2,NULL,'0495',NULL,'REFUERZO INFERIOR ENMALLADO DE ACERO INOX x 10 UNIDADES',NULL,'UN',8200.00,11480.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(493,2,NULL,'0496',NULL,'REFUERZO INFERIOR ENMALLADO DE ACERO INOX x UNIDAD',NULL,'UN',950.00,1330.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(494,2,NULL,'0497',NULL,'REFUERZO SUPERIOR PERFORADO DE ACERO INOX x 10 UNIDADES',NULL,'UN',12000.00,16800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(495,2,NULL,'0498',NULL,'REFUERZO SUPERIOR PERFORADO DE ACERO INOX x UNIDAD',NULL,'UN',1400.00,1960.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(496,2,NULL,'0499',NULL,'REFUERZO INFERIOR PERFORADO DE ACERO INOX x 10 UNIDADES',NULL,'UN',12000.00,16800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(497,2,NULL,'0500',NULL,'REFUERZO INFERIOR PERFORADO DE ACERO INOX x UNIDAD',NULL,'UN',1400.00,1960.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(498,2,NULL,'0501',NULL,'RETENEDORES MULTIRET VARIOS COLORES TIRA DE 5 RETENEDORES CADA UNA',NULL,'UN',3500.00,4900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(499,2,NULL,'0502',NULL,'REVESTIMIENTO GILVEST HS x 160Gs',NULL,'UN',2000.00,2800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(500,2,NULL,'0503',NULL,'REVESTIMIENTO KERA VEST AVIO 2Kg REVEST. + 420cc LIQUIDO',NULL,'UN',38000.00,53200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(501,2,NULL,'0504',NULL,'REVESTIMIENTO VENTURA HIGH VEST AVIO 2Kg REVEST. + 480cc LIQUIDO',NULL,'UN',29000.00,40600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(502,2,NULL,'0505',NULL,'RUEDA DE PAÑO DEFLEX PAREA PULIDO Y BRILLO',NULL,'UN',4100.00,5740.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(503,2,NULL,'0506',NULL,'SEPARADOR DE ACRILICO OKI x 1Lt ROSA',NULL,'UN',8000.00,11200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(504,2,NULL,'0507',NULL,'SEPARADOR DE ACRILICO DEFLEX x 1Lt ROSA',NULL,'UN',5600.00,7840.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(505,2,NULL,'0508',NULL,'SEPARADOR LIQUIDO OKI LUBE x 20cc',NULL,'UN',12400.00,16500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(506,2,NULL,'0509',NULL,'SEPARADOR DE ACRILICO OKI EN SOBRE x 100Gs',NULL,'UN',7000.00,9800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(507,2,NULL,'0510',NULL,'VIBRADORA DE YESO INDENTAL VIBRACUB 990',NULL,'UN',267000.00,373800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(508,2,NULL,'0511',NULL,'YESO DENSITA TIPO V AMARILLO PESCIO x 1Kg',NULL,'UN',6000.00,9600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(509,2,NULL,'0512',NULL,'YESO DENDITA TIPO IV ROSA PESCIO x 1Kg',NULL,'UN',4500.00,7200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(510,2,NULL,'0513',NULL,'YESO PIEDRA AZUL PESCIO x 25Kg',NULL,'UN',27250.00,43600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(511,2,NULL,'0514',NULL,'YESO PIEDRA AZUL PESCIO x 1Kg',NULL,'UN',1200.00,1920.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(512,2,NULL,'0515',NULL,'YESO PIEDRA VERDE PESCIO x 25Kg',NULL,'UN',27250.00,43600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(513,2,NULL,'0516',NULL,'YESO PIEDRA VERDE PESCIO x 1Kg',NULL,'UN',1200.00,1920.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(514,2,NULL,'0517',NULL,'YESO TALLER BLANCO PESCIO x 25Kg',NULL,'UN',25500.00,40800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(515,2,NULL,'0518',NULL,'YESO TALLER BLANCO PESCIO x 1Kg',NULL,'UN',1100.00,1760.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(516,2,NULL,'0519',NULL,'YESO TALLER AMARILLO PESCIO x 25Kg',NULL,'UN',25500.00,40800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(517,2,NULL,'0520',NULL,'YESO TALLER AMARILLO PESCIO x 1Kg',NULL,'UN',1100.00,1760.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(518,2,NULL,'0521',NULL,'Z-PRIME BISCO ADHESIVO ZIRCONIO-ALUMINA-METAL x 2Ml',NULL,'UN',0.00,0.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(519,2,NULL,'0522',NULL,'SEPARADOR ACRILICO 100CC',NULL,'UN',750.00,1200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(520,2,NULL,'0523',NULL,'ALCOHOL ETILICO',NULL,'UN',4200.00,6720.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(521,2,NULL,'0524',NULL,'TAZA DE GOMA PARA YESO \"ROMAN\"',NULL,'UN',1950.00,2730.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(522,2,NULL,'0525',NULL,'ESPATULA PLASTICA',NULL,'UN',320.00,448.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(523,2,NULL,'0526',NULL,'ACRILICO SUBITON POLVO X 1000GR',NULL,'UN',52000.00,72800.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(524,2,NULL,'0527',NULL,'PROTHOPLAST LOQUIDO X100',NULL,'UN',27840.00,38976.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(525,2,NULL,'0528',NULL,'VASO DAPPEN VIDRIO',NULL,'UN',855.00,1197.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(526,2,NULL,'0529',NULL,'TALLADOR LECRON',NULL,'UN',2175.00,3045.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(527,2,NULL,'0530',NULL,'GUANTES LATEX ELIT',NULL,'UN',3330.00,4662.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(528,2,NULL,'0531',NULL,'BARBIJOS TRIPACA X50 U.',NULL,'UN',1280.00,2048.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(529,2,NULL,'0532',NULL,'REV HIL VEST',NULL,'UN',2264.00,3170.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(530,2,NULL,'0533',NULL,'MODELOS SUPERIOR E INFERIOR',NULL,'UN',780.00,900.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(531,2,NULL,'0534',NULL,'BARBIJO POR UNIDAD',NULL,'UN',125.00,200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(532,2,NULL,'0535',NULL,'BARBIJOS POR 10 UNIDADES',NULL,'UN',1000.00,1600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(533,2,NULL,'0536',NULL,'COMPRESA POR UNIDAD',NULL,'UN',100.00,160.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(534,2,NULL,'0537',NULL,'COMPRESA POR 10 UNIDADES',NULL,'UN',950.00,1520.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(535,2,NULL,'0538',NULL,'GUANTES POR UNIDAD',NULL,'UN',125.00,200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(536,2,NULL,'0539',NULL,'GUANTES POR 10 PARES',NULL,'UN',1095.00,1752.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(537,2,NULL,'0540',NULL,'TAZA DE GOMA + ESPATULA PLASTICO',NULL,'UN',2200.00,3520.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(538,2,NULL,'0541',NULL,'COMPRESAS EVODENT X50',NULL,'UN',1735.00,2776.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(539,2,NULL,'0542',NULL,'ESPATULA PLASTICA COMUN',NULL,'UN',320.00,512.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(540,2,NULL,'0543',NULL,'PLACAS PARA TERMOFORMADO RIGIDA 0,08 (2mm) EGEO x PACK x 5Un',NULL,'UN',12000.00,19200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(541,2,NULL,'0544',NULL,'MODELOS DE YESO',NULL,'UN',0.00,0.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(542,2,NULL,'0545',NULL,'BARRITA DE CERA',NULL,'UN',350.00,560.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(543,2,NULL,'0546',NULL,'TAZAS DE GOMA',NULL,'UN',1500.00,2400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(544,2,NULL,'0547',NULL,'10 TAZAS DE GOMA',NULL,'UN',18760.00,30016.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(545,2,NULL,'0548',NULL,'10 ESPATULAS PLASTICO',NULL,'UN',2800.00,4480.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(546,2,NULL,'0549',NULL,'10 MODELO DE YESO SUP',NULL,'UN',5480.00,8768.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(547,2,NULL,'0550',NULL,'100 GRAMOS DE ACRILICO',NULL,'UN',3500.00,5600.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(548,2,NULL,'0551',NULL,'CUBETA PLASTICA  AUTOCLAVABLES',NULL,'UN',873.00,1397.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(549,2,NULL,'0552',NULL,'DOSIFICADOR DE ALGINATO',NULL,'UN',1950.00,3120.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(550,2,NULL,'0553',NULL,'COMPRESA EVODENT',NULL,'UN',1840.00,3000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(551,2,NULL,'0554',NULL,'CUBETA PLASTICA COLOR AZUL',NULL,'UN',890.00,2000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(552,2,NULL,'0555',NULL,'CUBETA VERDE',NULL,'UN',1438.00,2301.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(553,2,NULL,'0556',NULL,'ALGINATO DE 410 GRS',NULL,'UN',7000.00,11200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(554,2,NULL,'0557',NULL,'VASO DAPPEN SILICONA',NULL,'UN',4602.51,7364.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(555,2,NULL,'0558',NULL,'TALLADOR LECRON',NULL,'UN',2626.00,4202.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(556,2,NULL,'0559',NULL,'INSTRUMENTO PKT (PETER K THOMAS)',NULL,'UN',11880.00,19008.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(557,2,NULL,'0560',NULL,'MECHERO DE ALCOHOL TIPO BUNSEN METALICO',NULL,'UN',9000.00,13000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(558,2,NULL,'0561',NULL,'MACROMODELO PARA ANATOMIA DENTARIA',NULL,'UN',3438.00,5501.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(559,2,NULL,'0562',NULL,'MONOMERO AUTO X 100CC',NULL,'UN',3120.00,4992.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(560,2,NULL,'0563',NULL,'MODELO DENSITA',NULL,'UN',1050.00,1680.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(561,2,NULL,'0564',NULL,'ACRILICO PARA CUBETAS OKI CRIL AUTOPOLIMERIZABLE ROSADO x 50GS',NULL,'UN',2500.00,4000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(562,2,NULL,'0565',NULL,'COFIA DESCARTABLE POR UNIDAD',NULL,'UN',50.00,200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(563,2,NULL,'0566',NULL,'TABLETA DE CERA PARA CROMO',NULL,'UN',625.00,1000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(564,2,NULL,'0567',NULL,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',NULL,'UN',125.00,200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(565,2,NULL,'0568',NULL,'LOSETA DE VIDRIO 150mm x 100mm x 6mm ESPESOR',NULL,'UN',625.00,1000.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(566,2,NULL,'0569',NULL,'ESPATULA PARA CEMENTO DOBLE',NULL,'UN',2812.50,4500.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(567,2,NULL,'0571',NULL,'nan',NULL,'UN',220.00,352.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(568,2,NULL,'0572',NULL,'LIJA N°220 HOJA 115mm x 140mm x UNIDAD',NULL,'UN',125.00,200.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(569,2,NULL,'0573',NULL,'ALGINATO IQ CROMATICO',NULL,'UN',10105.00,16168.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(570,2,NULL,'0574',NULL,'ALGINATO ALGIGEL',NULL,'UN',6869.00,10990.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(571,2,NULL,'0575',NULL,'INST MANGO BISTURI',NULL,'UN',1145.00,1832.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(572,2,NULL,'0576',NULL,'ACRILICO VETEADO 400 GS',NULL,'UN',17165.00,27464.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(573,2,NULL,'0577',NULL,'LAMINA BLANQUEAMIENTO',NULL,'UN',14585.00,23336.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(574,2,NULL,'0578',NULL,'PLACAS EGEO 0,8',NULL,'UN',9627.00,15403.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(575,2,NULL,'0579',NULL,'PIEDRA BLANCA',NULL,'UN',333.20,533.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(576,2,NULL,'0580',NULL,'PASTILLA METAL',NULL,'UN',3550.00,5680.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL),(577,2,NULL,'0581',NULL,'MICROMOTOR',NULL,'UN',209000.00,334400.00,21.00,NULL,1,1,0.000,NULL,'2025-10-22 14:58:20',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
INSERT INTO `purchase_items` VALUES (1,1,1,NULL,10.000,10000.00,0.00,NULL,NULL,0.00,100000.00,NULL,NULL),(2,2,1,NULL,10.000,10000.00,0.00,NULL,NULL,0.00,100000.00,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (1,2,NULL,1,'confirmed','2025-10-05 20:42:50',100000.00,0.00,0.00,100000.00,'ARS',NULL,'2025-10-05 23:42:50','2025-10-05 23:42:50',NULL,NULL,'F-0001-00000001'),(2,2,NULL,1,'confirmed','2025-10-05 22:22:42',100000.00,0.00,0.00,100000.00,'ARS',NULL,'2025-10-06 01:22:42','2025-10-06 01:22:42',NULL,NULL,'F-0001-00000001');
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
  `company_id` bigint unsigned NOT NULL,
  `sale_id` bigint unsigned DEFAULT NULL,
  `ledger_id` bigint unsigned DEFAULT NULL,
  `receipt_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `receipts_company` (`company_id`,`receipt_date`),
  KEY `receipts_sale` (`sale_id`),
  KEY `receipts_ledger` (`ledger_id`),
  KEY `fk_receipts_pm` (`payment_method_id`),
  CONSTRAINT `fk_receipts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_ledger` FOREIGN KEY (`ledger_id`) REFERENCES `ledgers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_pm` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
INSERT INTO `receipts` VALUES (1,2,4,NULL,'2026-02-04 23:19:26',6,6213.00,NULL,NULL,NULL);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (1,1,1,NULL,2.000,15000.00,0.00,NULL,NULL,0.00,30000.00,NULL,NULL),(2,2,576,NULL,1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,NULL,NULL),(3,3,576,NULL,1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,NULL,NULL),(4,4,576,NULL,1.000,5680.00,0.00,NULL,NULL,0.00,5680.00,NULL,NULL),(5,4,575,NULL,1.000,533.00,0.00,NULL,NULL,0.00,533.00,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,2,NULL,1,1,NULL,NULL,'confirmed','2025-10-05 22:22:59',30000.00,0.00,0.00,30000.00,'ARS',NULL,'2025-10-06 01:22:59','2025-10-06 01:22:59',NULL),(2,2,NULL,1,1,NULL,NULL,'confirmed','2026-02-05 01:43:46',5680.00,0.00,0.00,5680.00,'ARS',NULL,'2026-02-05 04:43:46','2026-02-05 04:43:46',NULL),(3,2,NULL,1,1,NULL,NULL,'confirmed','2026-02-05 02:04:04',5680.00,0.00,0.00,5680.00,'ARS',NULL,'2026-02-05 05:04:04','2026-02-05 05:04:04',NULL),(4,2,NULL,1,1,NULL,NULL,'confirmed','2026-02-05 02:19:25',6213.00,0.00,0.00,6213.00,'ARS',NULL,'2026-02-05 05:19:25','2026-02-05 05:19:25',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
INSERT INTO `stock_movements` VALUES (1,2,1,1,'2025-10-05 20:42:50','in',10.000,'purchase_item',1,NULL,NULL,NULL),(2,2,1,1,'2025-10-05 22:22:42','in',10.000,'purchase_item',2,NULL,NULL,NULL),(3,2,1,1,'2025-10-05 22:22:59','out',2.000,'sale_item',1,NULL,NULL,NULL),(4,2,1,576,'2026-02-05 01:43:46','out',1.000,'sale_item',2,NULL,NULL,NULL),(5,2,1,576,'2026-02-05 02:04:04','out',1.000,'sale_item',3,NULL,NULL,NULL),(6,2,1,576,'2026-02-05 02:19:25','out',1.000,'sale_item',4,NULL,NULL,NULL),(7,2,1,575,'2026-02-05 02:19:25','out',1.000,'sale_item',5,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=576 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,2,1,1,18.000,NULL,NULL),(2,2,1,4,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(3,2,1,5,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(4,2,1,6,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(5,2,1,7,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(6,2,1,8,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(7,2,1,9,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(8,2,1,10,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(9,2,1,11,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(10,2,1,12,3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(11,2,1,13,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(12,2,1,14,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(13,2,1,15,7.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(14,2,1,16,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(15,2,1,17,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(16,2,1,18,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(17,2,1,19,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(18,2,1,20,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(19,2,1,21,-14.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(20,2,1,22,-6.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(21,2,1,23,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(22,2,1,24,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(23,2,1,25,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(24,2,1,26,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(25,2,1,27,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(26,2,1,28,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(27,2,1,29,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(28,2,1,30,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(29,2,1,31,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(30,2,1,32,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(31,2,1,33,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(32,2,1,34,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(33,2,1,35,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(34,2,1,36,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(35,2,1,37,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(36,2,1,38,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(37,2,1,39,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(38,2,1,40,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(39,2,1,41,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(40,2,1,42,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(41,2,1,43,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(42,2,1,44,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(43,2,1,45,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(44,2,1,46,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(45,2,1,47,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(46,2,1,48,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(47,2,1,49,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(48,2,1,50,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(49,2,1,51,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(50,2,1,52,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(51,2,1,53,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(52,2,1,54,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(53,2,1,55,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(54,2,1,56,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(55,2,1,57,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(56,2,1,58,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(57,2,1,59,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(58,2,1,60,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(59,2,1,61,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(60,2,1,62,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(61,2,1,63,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(62,2,1,64,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(63,2,1,65,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(64,2,1,66,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(65,2,1,67,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(66,2,1,68,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(67,2,1,69,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(68,2,1,70,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(69,2,1,71,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(70,2,1,72,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(71,2,1,73,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(72,2,1,74,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(73,2,1,75,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(74,2,1,76,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(75,2,1,77,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(76,2,1,78,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(77,2,1,79,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(78,2,1,80,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(79,2,1,81,25.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(80,2,1,82,36.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(81,2,1,83,15.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(82,2,1,84,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(83,2,1,85,17.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(84,2,1,86,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(85,2,1,87,6.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(86,2,1,88,28.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(87,2,1,89,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(88,2,1,90,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(89,2,1,91,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(90,2,1,92,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(91,2,1,93,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(92,2,1,94,25.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(93,2,1,95,13.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(94,2,1,96,19.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(95,2,1,97,25.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(96,2,1,98,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(97,2,1,99,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(98,2,1,100,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(99,2,1,101,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(100,2,1,102,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(101,2,1,103,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(102,2,1,104,24.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(103,2,1,105,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(104,2,1,106,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(105,2,1,107,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(106,2,1,108,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(107,2,1,109,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(108,2,1,110,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(109,2,1,111,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(110,2,1,112,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(111,2,1,113,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(112,2,1,114,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(113,2,1,115,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(114,2,1,116,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(115,2,1,117,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(116,2,1,118,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(117,2,1,119,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(118,2,1,120,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(119,2,1,121,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(120,2,1,122,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(121,2,1,123,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(122,2,1,124,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(123,2,1,125,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(124,2,1,126,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(125,2,1,127,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(126,2,1,128,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(127,2,1,129,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(128,2,1,130,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(129,2,1,131,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(130,2,1,132,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(131,2,1,133,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(132,2,1,134,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(133,2,1,135,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(134,2,1,136,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(135,2,1,137,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(136,2,1,138,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(137,2,1,139,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(138,2,1,140,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(139,2,1,141,12.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(140,2,1,142,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(141,2,1,143,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(142,2,1,144,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(143,2,1,145,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(144,2,1,146,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(145,2,1,147,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(146,2,1,148,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(147,2,1,149,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(148,2,1,150,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(149,2,1,151,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(150,2,1,152,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(151,2,1,153,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(152,2,1,154,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(153,2,1,155,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(154,2,1,156,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(155,2,1,157,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(156,2,1,158,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(157,2,1,159,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(158,2,1,160,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(159,2,1,161,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(160,2,1,162,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(161,2,1,163,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(162,2,1,164,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(163,2,1,165,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(164,2,1,166,9.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(165,2,1,167,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(166,2,1,168,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(167,2,1,169,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(168,2,1,170,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(169,2,1,171,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(170,2,1,172,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(171,2,1,173,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(172,2,1,174,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(173,2,1,175,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(174,2,1,176,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(175,2,1,177,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(176,2,1,178,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(177,2,1,179,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(178,2,1,180,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(179,2,1,181,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(180,2,1,182,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(181,2,1,183,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(182,2,1,184,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(183,2,1,185,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(184,2,1,186,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(185,2,1,187,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(186,2,1,188,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(187,2,1,189,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(188,2,1,190,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(189,2,1,191,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(190,2,1,192,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(191,2,1,193,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(192,2,1,194,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(193,2,1,195,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(194,2,1,196,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(195,2,1,197,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(196,2,1,198,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(197,2,1,199,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(198,2,1,200,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(199,2,1,201,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(200,2,1,202,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(201,2,1,203,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(202,2,1,204,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(203,2,1,205,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(204,2,1,206,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(205,2,1,207,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(206,2,1,208,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(207,2,1,209,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(208,2,1,210,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(209,2,1,211,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(210,2,1,212,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(211,2,1,213,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(212,2,1,214,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(213,2,1,215,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(214,2,1,216,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(215,2,1,217,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(216,2,1,218,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(217,2,1,219,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(218,2,1,220,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(219,2,1,221,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(220,2,1,222,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(221,2,1,223,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(222,2,1,224,24.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(223,2,1,225,40.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(224,2,1,226,26.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(225,2,1,227,15.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(226,2,1,228,15.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(227,2,1,229,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(228,2,1,230,8.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(229,2,1,231,25.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(230,2,1,232,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(231,2,1,233,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(232,2,1,234,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(233,2,1,235,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(234,2,1,236,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(235,2,1,237,48.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(236,2,1,238,17.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(237,2,1,239,46.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(238,2,1,240,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(239,2,1,241,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(240,2,1,242,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(241,2,1,243,25.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(242,2,1,244,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(243,2,1,245,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(244,2,1,246,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(245,2,1,247,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(246,2,1,248,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(247,2,1,249,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(248,2,1,250,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(249,2,1,251,-1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(250,2,1,252,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(251,2,1,253,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(252,2,1,254,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(253,2,1,255,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(254,2,1,256,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(255,2,1,257,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(256,2,1,258,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(257,2,1,259,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(258,2,1,260,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(259,2,1,261,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(260,2,1,262,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(261,2,1,263,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(262,2,1,264,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(263,2,1,265,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(264,2,1,266,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(265,2,1,267,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(266,2,1,268,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(267,2,1,269,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(268,2,1,270,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(269,2,1,271,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(270,2,1,272,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(271,2,1,273,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(272,2,1,274,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(273,2,1,275,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(274,2,1,276,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(275,2,1,277,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(276,2,1,278,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(277,2,1,279,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(278,2,1,280,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(279,2,1,281,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(280,2,1,282,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(281,2,1,283,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(282,2,1,284,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(283,2,1,285,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(284,2,1,286,9.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(285,2,1,287,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(286,2,1,288,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(287,2,1,289,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(288,2,1,290,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(289,2,1,291,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(290,2,1,292,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(291,2,1,293,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(292,2,1,294,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(293,2,1,295,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(294,2,1,296,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(295,2,1,297,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(296,2,1,298,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(297,2,1,299,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(298,2,1,300,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(299,2,1,301,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(300,2,1,302,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(301,2,1,303,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(302,2,1,304,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(303,2,1,305,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(304,2,1,306,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(305,2,1,307,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(306,2,1,308,15.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(307,2,1,309,32.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(308,2,1,310,11.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(309,2,1,311,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(310,2,1,312,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(311,2,1,313,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(312,2,1,314,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(313,2,1,315,18.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(314,2,1,316,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(315,2,1,317,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(316,2,1,318,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(317,2,1,319,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(318,2,1,320,15.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(319,2,1,321,38.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(320,2,1,322,15.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(321,2,1,323,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(322,2,1,324,18.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(323,2,1,325,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(324,2,1,326,8.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(325,2,1,327,30.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(326,2,1,328,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(327,2,1,329,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(328,2,1,330,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(329,2,1,331,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(330,2,1,332,22.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(331,2,1,333,28.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(332,2,1,334,33.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(333,2,1,335,9.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(334,2,1,336,18.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(335,2,1,337,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(336,2,1,338,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(337,2,1,339,29.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(338,2,1,340,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(339,2,1,341,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(340,2,1,342,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(341,2,1,343,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(342,2,1,344,29.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(343,2,1,345,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(344,2,1,346,33.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(345,2,1,347,30.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(346,2,1,348,15.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(347,2,1,349,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(348,2,1,350,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(349,2,1,351,25.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(350,2,1,352,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(351,2,1,353,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(352,2,1,354,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(353,2,1,355,30.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(354,2,1,356,19.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(355,2,1,357,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(356,2,1,358,21.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(357,2,1,359,30.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(358,2,1,360,19.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(359,2,1,361,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(360,2,1,362,8.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(361,2,1,363,19.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(362,2,1,364,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(363,2,1,365,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(364,2,1,366,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(365,2,1,367,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(366,2,1,368,31.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(367,2,1,369,30.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(368,2,1,370,40.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(369,2,1,371,30.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(370,2,1,372,15.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(371,2,1,373,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(372,2,1,374,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(373,2,1,375,42.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(374,2,1,376,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(375,2,1,377,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(376,2,1,378,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(377,2,1,379,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(378,2,1,380,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(379,2,1,381,19.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(380,2,1,382,21.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(381,2,1,383,30.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(382,2,1,384,17.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(383,2,1,385,19.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(384,2,1,386,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(385,2,1,387,19.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(386,2,1,388,28.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(387,2,1,389,29.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(388,2,1,390,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(389,2,1,391,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(390,2,1,392,18.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(391,2,1,393,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(392,2,1,394,28.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(393,2,1,395,13.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(394,2,1,396,107.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(395,2,1,397,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(396,2,1,398,40.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(397,2,1,399,28.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(398,2,1,400,23.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(399,2,1,401,31.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(400,2,1,402,14.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(401,2,1,403,5.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(402,2,1,404,124.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(403,2,1,405,182.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(404,2,1,406,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(405,2,1,407,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(406,2,1,408,-2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(407,2,1,409,8.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(408,2,1,410,-125.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(409,2,1,411,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(410,2,1,412,192.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(411,2,1,413,13.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(412,2,1,414,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(413,2,1,415,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(414,2,1,416,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(415,2,1,417,3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(416,2,1,418,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(417,2,1,419,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(418,2,1,420,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(419,2,1,421,59.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(420,2,1,422,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(421,2,1,423,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(422,2,1,424,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(423,2,1,425,3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(424,2,1,426,6.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(425,2,1,427,8.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(426,2,1,428,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(427,2,1,429,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(428,2,1,430,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(429,2,1,431,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(430,2,1,432,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(431,2,1,433,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(432,2,1,434,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(433,2,1,435,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(434,2,1,436,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(435,2,1,437,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(436,2,1,438,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(437,2,1,439,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(438,2,1,440,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(439,2,1,441,3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(440,2,1,442,3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(441,2,1,443,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(442,2,1,444,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(443,2,1,445,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(444,2,1,446,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(445,2,1,447,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(446,2,1,448,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(447,2,1,449,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(448,2,1,450,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(449,2,1,451,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(450,2,1,452,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(451,2,1,453,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(452,2,1,454,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(453,2,1,455,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(454,2,1,456,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(455,2,1,457,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(456,2,1,458,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(457,2,1,459,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(458,2,1,460,8.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(459,2,1,461,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(460,2,1,462,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(461,2,1,463,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(462,2,1,464,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(463,2,1,465,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(464,2,1,466,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(465,2,1,467,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(466,2,1,468,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(467,2,1,469,48.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(468,2,1,470,25.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(469,2,1,471,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(470,2,1,472,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(471,2,1,473,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(472,2,1,474,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(473,2,1,475,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(474,2,1,476,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(475,2,1,477,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(476,2,1,478,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(477,2,1,479,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(478,2,1,480,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(479,2,1,481,-2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(480,2,1,482,-3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(481,2,1,483,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(482,2,1,484,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(483,2,1,485,3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(484,2,1,486,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(485,2,1,487,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(486,2,1,488,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(487,2,1,489,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(488,2,1,490,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(489,2,1,491,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(490,2,1,492,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(491,2,1,493,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(492,2,1,494,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(493,2,1,495,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(494,2,1,496,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(495,2,1,497,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(496,2,1,498,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(497,2,1,499,5.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(498,2,1,500,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(499,2,1,501,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(500,2,1,502,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(501,2,1,503,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(502,2,1,504,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(503,2,1,505,-25.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(504,2,1,506,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(505,2,1,507,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(506,2,1,508,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(507,2,1,509,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(508,2,1,510,-3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(509,2,1,511,12.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(510,2,1,512,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(511,2,1,513,20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(512,2,1,514,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(513,2,1,515,23.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(514,2,1,516,3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(515,2,1,517,12.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(516,2,1,518,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(517,2,1,519,140.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(518,2,1,520,-1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(519,2,1,521,-71.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(520,2,1,522,44.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(521,2,1,523,70.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(522,2,1,524,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(523,2,1,525,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(524,2,1,526,18.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(525,2,1,527,14.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(526,2,1,528,8.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(527,2,1,529,-20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(528,2,1,530,242.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(529,2,1,531,-56.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(530,2,1,532,-3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(531,2,1,533,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(532,2,1,534,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(533,2,1,535,10.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(534,2,1,536,-2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(535,2,1,537,12.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(536,2,1,538,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(537,2,1,539,215.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(538,2,1,540,6.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(539,2,1,541,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(540,2,1,542,488.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(541,2,1,543,211.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(542,2,1,544,6.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(543,2,1,545,5.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(544,2,1,546,5.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(545,2,1,547,4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(546,2,1,548,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(547,2,1,549,-12.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(548,2,1,550,34.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(549,2,1,551,45.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(550,2,1,552,1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(551,2,1,553,7.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(552,2,1,554,-1.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(553,2,1,555,60.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(554,2,1,556,-24.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(555,2,1,557,-36.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(556,2,1,558,37.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(557,2,1,559,61.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(558,2,1,560,-42.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(559,2,1,561,411.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(560,2,1,562,-12.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(561,2,1,563,-135.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(562,2,1,564,0.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(563,2,1,565,-121.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(564,2,1,566,-20.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(565,2,1,567,81.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(566,2,1,568,141.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(567,2,1,569,8.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(568,2,1,570,7.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(569,2,1,571,-4.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(570,2,1,572,6.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(571,2,1,573,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(572,2,1,574,2.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(573,2,1,575,94.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(574,2,1,576,13.000,'2025-10-22 14:58:20','2025-10-22 14:58:20'),(575,2,1,577,3.000,'2025-10-22 14:58:20','2025-10-22 14:58:20');
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
INSERT INTO `users` VALUES (1,2,'Admin','admin@artdent.com.ar','$2y$12$KBqjAGcwQAMPazHVgYPo8u9MYQEoJuuRrvptDFtSBLbYaIgrgmMxq',NULL,NULL,1,'2025-10-05 21:15:38','2025-10-05 21:15:38',NULL),(2,2,'Smoke Test','smoke+1768229177@example.com','$2y$12$VUeQzrjuHD1lQIcJz.Vss.iOyhwxjbBLni5AgA4PZ59jp/oM6WLmq',NULL,NULL,1,'2026-01-12 18:01:10','2026-01-12 18:01:10',NULL);
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

-- Dump completed on 2026-02-04 23:37:53
