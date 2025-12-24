-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: localhost    Database: english_center
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '0eeaf514-c72f-11f0-9710-96a36d3ada97:1-2544';

CREATE DATABASE IF NOT EXISTS english_center;
USE english_center;
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_info`
--

DROP TABLE IF EXISTS `bank_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_holder` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code` longtext COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_info`
--

LOCK TABLES `bank_info` WRITE;
/*!40000 ALTER TABLE `bank_info` DISABLE KEYS */;
INSERT INTO `bank_info` VALUES (1,'MB Bank','038204019305','English Center',NULL,1,'2025-12-06 18:14:23','2025-12-06 18:14:23');
/*!40000 ALTER TABLE `bank_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_schedules`
--

DROP TABLE IF EXISTS `class_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_csched_class` (`class_id`),
  CONSTRAINT `fk_csched_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=412 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_schedules`
--

LOCK TABLES `class_schedules` WRITE;
/*!40000 ALTER TABLE `class_schedules` DISABLE KEYS */;
INSERT INTO `class_schedules` VALUES (407,60,NULL,'2026-01-19 02:00:00','{\"end\": \"11:00\", \"room\": \"P101\", \"start\": \"09:00\"}','2025-12-24 13:41:10'),(408,60,NULL,'2026-02-18 02:00:00','{\"end\": \"11:00\", \"room\": \"P101\", \"start\": \"09:00\"}','2025-12-24 13:41:10'),(409,60,NULL,'2026-03-19 02:00:00','{\"end\": \"11:00\", \"room\": \"P101\", \"start\": \"09:00\"}','2025-12-24 13:41:10'),(410,60,NULL,'2026-04-19 02:00:00','{\"end\": \"11:00\", \"room\": \"P101\", \"start\": \"09:00\"}','2025-12-24 13:41:10'),(411,60,NULL,'2026-05-19 02:00:00','{\"end\": \"11:00\", \"room\": \"P101\", \"start\": \"09:00\"}','2025-12-24 13:41:10');
/*!40000 ALTER TABLE `class_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_sessions`
--

DROP TABLE IF EXISTS `class_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `room` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `status` enum('SCHEDULED','CANCELLED','HAPPENED') COLLATE utf8mb4_unicode_ci DEFAULT 'SCHEDULED',
  `meta` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cs_class_sessions_class` (`class_id`),
  CONSTRAINT `fk_cs_class_sessions_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1509 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_sessions`
--

LOCK TABLES `class_sessions` WRITE;
/*!40000 ALTER TABLE `class_sessions` DISABLE KEYS */;
INSERT INTO `class_sessions` VALUES (1492,60,'2026-01-19','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:48:38','2025-12-24 15:48:38'),(1493,60,'2026-02-18','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:48:38','2025-12-24 15:48:38'),(1494,60,'2026-03-19','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:48:38','2025-12-24 15:48:38'),(1495,60,'2026-04-19','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:48:38','2025-12-24 15:48:38'),(1496,60,'2026-05-19','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:48:38','2025-12-24 15:48:38'),(1504,62,'2026-01-20','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:56:47','2025-12-24 15:56:47'),(1505,62,'2026-01-21','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:56:47','2025-12-24 15:56:47'),(1506,62,'2026-01-22','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:56:47','2025-12-24 15:56:47'),(1507,62,'2026-01-23','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:56:47','2025-12-24 15:56:47'),(1508,62,'2026-01-24','09:00:00','11:00:00','P101',NULL,'SCHEDULED',NULL,'2025-12-24 15:56:47','2025-12-24 15:56:47');
/*!40000 ALTER TABLE `class_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_students`
--

DROP TABLE IF EXISTS `class_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','LEFT') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_class_student` (`class_id`,`student_id`),
  KEY `fk_cs_student` (`student_id`),
  CONSTRAINT `fk_cs_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cs_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_students`
--

LOCK TABLES `class_students` WRITE;
/*!40000 ALTER TABLE `class_students` DISABLE KEYS */;
INSERT INTO `class_students` VALUES (60,60,100,'2025-12-24 15:21:14',NULL,'ACTIVE','2025-12-24 15:21:14','2025-12-24 15:21:14');
/*!40000 ALTER TABLE `class_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_teachers`
--

DROP TABLE IF EXISTS `class_teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `role` enum('MAIN','ASSISTANT') COLLATE utf8mb4_unicode_ci DEFAULT 'MAIN',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_class_teacher` (`class_id`,`teacher_id`),
  CONSTRAINT `fk_ct_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_teachers`
--

LOCK TABLES `class_teachers` WRITE;
/*!40000 ALTER TABLE `class_teachers` DISABLE KEYS */;
INSERT INTO `class_teachers` VALUES (18,60,26,'MAIN','2025-12-24 13:41:10'),(24,62,26,'MAIN','2025-12-24 15:56:47');
/*!40000 ALTER TABLE `class_teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher_id` int DEFAULT NULL,
  `capacity` int DEFAULT '20',
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `course_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (60,'HSK',NULL,20,NULL,'2026-01-19','2026-05-19',NULL,'2025-12-24 13:41:10','2025-12-24 13:41:10',NULL),(62,'HSK1',NULL,20,NULL,'2026-01-20','2026-01-24',NULL,'2025-12-24 15:56:47','2025-12-24 15:56:47',NULL);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_history`
--

DROP TABLE IF EXISTS `course_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `field_changed` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_value` text COLLATE utf8mb4_unicode_ci,
  `new_value` text COLLATE utf8mb4_unicode_ci,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `changed_by` int DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_history`
--

LOCK TABLES `course_history` WRITE;
/*!40000 ALTER TABLE `course_history` DISABLE KEYS */;
INSERT INTO `course_history` VALUES (1,10,'CREATE',NULL,NULL,NULL,NULL,1,'2025-12-05 15:48:37'),(2,10,'UPDATE','status','ACTIVE','ARCHIVED','Kết thúc khóa học',1,'2025-12-05 15:48:59'),(3,3,'UPDATE','status','ACTIVE','ARCHIVED','Kết thúc khóa học',1,'2025-12-05 15:56:43'),(4,4,'UPDATE','status','ACTIVE','ARCHIVED','Kết thúc khóa học',1,'2025-12-05 16:17:40'),(5,5,'UPDATE','status','ACTIVE','ARCHIVED',NULL,1,'2025-12-05 16:19:53'),(6,4,'UPDATE','tuition_fee','5000000.00','5000000','Cập nhật thông tin khóa học',1,'2025-12-05 16:22:11'),(7,6,'UPDATE','status','ACTIVE','ARCHIVED','Kết thúc khóa học',1,'2025-12-05 16:23:58'),(8,4,'UPDATE','status','ARCHIVED','ACTIVE','Chuyển trạng thái',1,'2025-12-05 16:39:56'),(9,5,'UPDATE','status','ARCHIVED','ACTIVE','Chuyển trạng thái',1,'2025-12-05 18:19:50'),(10,4,'UPDATE','status','ACTIVE','ARCHIVED','Kết thúc khóa học',1,'2025-12-06 06:37:31'),(11,4,'UPDATE',NULL,NULL,NULL,NULL,1,'2025-12-06 06:37:40'),(12,5,'UPDATE','status','ACTIVE','ARCHIVED','Kết thúc khóa học',1,'2025-12-06 07:25:50'),(13,4,'UPDATE','status','ARCHIVED','ACTIVE','Chuyển trạng thái',1,'2025-12-06 07:33:15'),(14,4,'UPDATE','status','ACTIVE','ARCHIVED','Kết thúc khóa học',1,'2025-12-06 18:22:33'),(15,1,'UPDATE','status','ACTIVE','ARCHIVED','Kết thúc khóa học',1,'2025-12-06 18:22:40'),(16,4,'UPDATE','status','ARCHIVED','ACTIVE','Chuyển trạng thái',1,'2025-12-06 18:24:58'),(17,5,'UPDATE','status','ARCHIVED','ACTIVE','Chuyển trạng thái',1,'2025-12-09 08:06:34'),(18,4,'UPDATE',NULL,NULL,NULL,NULL,1,'2025-12-10 10:55:45'),(19,4,'UPDATE',NULL,NULL,NULL,NULL,1,'2025-12-10 17:50:43'),(20,5,'UPDATE',NULL,NULL,NULL,NULL,1,'2025-12-10 17:51:22'),(21,4,'UPDATE',NULL,NULL,NULL,NULL,1,'2025-12-10 17:51:34'),(22,5,'UPDATE',NULL,NULL,NULL,NULL,1,'2025-12-10 17:51:43'),(23,6,'UPDATE',NULL,NULL,NULL,NULL,1,'2025-12-10 17:53:37');
/*!40000 ALTER TABLE `course_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_lessons`
--

DROP TABLE IF EXISTS `course_lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int DEFAULT NULL,
  `lesson_number` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `content` text COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_id` (`course_id`,`lesson_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lessons`
--

LOCK TABLES `course_lessons` WRITE;
/*!40000 ALTER TABLE `course_lessons` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_materials`
--

DROP TABLE IF EXISTS `course_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int DEFAULT NULL,
  `lesson_id` int DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_materials`
--

LOCK TABLES `course_materials` WRITE;
/*!40000 ALTER TABLE `course_materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_sub_lessons`
--

DROP TABLE IF EXISTS `course_sub_lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_sub_lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int DEFAULT NULL,
  `sub_lesson_number` int DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `answer_key` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_sub_lessons`
--

LOCK TABLES `course_sub_lessons` WRITE;
/*!40000 ALTER TABLE `course_sub_lessons` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_sub_lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `detailed_description` text COLLATE utf8mb4_unicode_ci,
  `duration_weeks` int DEFAULT NULL,
  `sessions_per_week` int DEFAULT NULL,
  `hours_per_session` decimal(3,1) DEFAULT NULL,
  `tuition_fee` decimal(10,2) DEFAULT NULL,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `objectives` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'HSK2','HHHHHKKK','Intermediate','','',NULL,NULL,2.0,NULL,'','','ARCHIVED','2025-12-05 15:33:56','2025-12-06 18:22:40',1),(4,'ENG-BEG-001','HSK','Beginner','Khóa học dành cho người mới bắt đầu học tiếng Anh','ko',5,3,1.5,5000000.00,'','','ACTIVE','2025-12-05 15:45:29','2025-12-10 17:51:34',1),(5,'ENG-INT-001','HSK1','Intermediate','Khóa học tiếng Anh trung cấp','',5,5,1.0,7000000.00,'','','ACTIVE','2025-12-05 15:45:29','2025-12-10 17:51:43',1),(6,'ENG-ADV-001','HSKk','Advanced','Khóa học tiếng Anh nâng cao','',20,3,2.0,9000000.00,'','','ARCHIVED','2025-12-05 15:45:29','2025-12-10 17:53:37',1);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  KEY `fk_employees_user_id` (`user_id`),
  KEY `idx_employee_code` (`employee_code`),
  CONSTRAINT `fk_employees_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (26,'NV0001','Trần Tấn Hoàng',NULL,'Nam','0348419996','djjgkt1901@icloud.com','Thanh Hoá','STAFF',1,'2025-12-23 08:17:41','2025-12-24 18:32:14',56),(27,'NV0002','Vũ Thịnh',NULL,'Nam','0348419996','thinh.vd227154@sis.hust.edu.vn','Thanh Hoá','ACCOUNTANT',1,'2025-12-23 08:17:58','2025-12-24 18:32:34',55);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_class_history`
--

DROP TABLE IF EXISTS `instructor_class_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_class_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instructor_id` int NOT NULL,
  `class_id` int NOT NULL,
  `role` enum('MAIN','ASSISTANT') COLLATE utf8mb4_unicode_ci DEFAULT 'MAIN',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `total_sessions` int DEFAULT '0',
  `total_hours` decimal(10,2) DEFAULT '0.00',
  `total_payment` decimal(10,2) DEFAULT '0.00',
  `rating` decimal(3,2) DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_instructor_class_history_instructor_id` (`instructor_id`),
  CONSTRAINT `instructor_class_history_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_class_history`
--

LOCK TABLES `instructor_class_history` WRITE;
/*!40000 ALTER TABLE `instructor_class_history` DISABLE KEYS */;
INSERT INTO `instructor_class_history` VALUES (1,6,18,'MAIN',NULL,NULL,0,0.00,0.00,NULL,NULL,'2025-12-08 09:08:14'),(2,7,21,'MAIN',NULL,NULL,0,0.00,0.00,NULL,NULL,'2025-12-09 15:33:09'),(3,7,22,'MAIN',NULL,NULL,0,0.00,0.00,NULL,NULL,'2025-12-10 06:54:14'),(4,6,22,'MAIN',NULL,NULL,0,0.00,0.00,NULL,NULL,'2025-12-10 10:37:14');
/*!40000 ALTER TABLE `instructor_class_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_schedules`
--

DROP TABLE IF EXISTS `instructor_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instructor_id` int NOT NULL,
  `day_of_week` int NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_instructor_schedules_instructor_id` (`instructor_id`),
  CONSTRAINT `instructor_schedules_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_schedules`
--

LOCK TABLES `instructor_schedules` WRITE;
/*!40000 ALTER TABLE `instructor_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `instructor_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructors`
--

DROP TABLE IF EXISTS `instructors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('VIETNAMESE','NATIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'VIETNAMESE',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `specialization` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_years` int DEFAULT '0',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `certifications` text COLLATE utf8mb4_unicode_ci,
  `hourly_rate` decimal(10,2) DEFAULT '0.00',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'cash',
  `bank_account` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NEW','ACTIVE','INACTIVE','ON_LEAVE') COLLATE utf8mb4_unicode_ci DEFAULT 'NEW',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_instructors_status` (`status`),
  KEY `idx_instructors_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructors`
--

LOCK TABLES `instructors` WRITE;
/*!40000 ALTER TABLE `instructors` DISABLE KEYS */;
INSERT INTO `instructors` VALUES (16,64,'Nguyễn Văn Gấu','VIETNAMESE','11111111111','thinh.vd227154@sis.hust.edu.vn',NULL,NULL,NULL,NULL,0,NULL,NULL,0.00,'cash',NULL,NULL,'INACTIVE',NULL,'2025-12-24 11:39:26','2025-12-24 15:59:43'),(26,65,'Vũ Thống','VIETNAMESE','0348419996','anhkha19012004@gmail.com',NULL,NULL,'HSK 1-3',NULL,0,'',NULL,150000.00,'cash','','1','ACTIVE',NULL,'2025-12-24 13:26:47','2025-12-24 18:37:27'),(27,NULL,'Trương Thị','VIETNAMESE','034819933322','sonlouisvu@gmail.com',NULL,NULL,'HSK 1-3',NULL,0,'',NULL,150000.00,'cash','','1','ACTIVE',NULL,'2025-12-24 19:11:02','2025-12-24 19:11:02');
/*!40000 ALTER TABLE `instructors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_invoices_student_status` (`student_id`,`status`),
  KEY `idx_invoices_course_status` (`course_id`,`status`),
  KEY `idx_invoices_paid_at` (`paid_at`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (17,100,4,3000000.00,'PAID',NULL,NULL,'2025-12-24 15:05:34','2025-12-24 15:19:04','2025-12-24 15:19:04');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mock_exam_registrations`
--

DROP TABLE IF EXISTS `mock_exam_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mock_exam_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift_id` int NOT NULL,
  `date_registered` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `shift_id` (`shift_id`),
  CONSTRAINT `mock_exam_registrations_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `mock_exam_shifts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mock_exam_registrations`
--

LOCK TABLES `mock_exam_registrations` WRITE;
/*!40000 ALTER TABLE `mock_exam_registrations` DISABLE KEYS */;
INSERT INTO `mock_exam_registrations` VALUES (8,'student99',1,'2025-11-30','REGISTERED'),(9,'student1',1,'2025-12-09','REGISTERED');
/*!40000 ALTER TABLE `mock_exam_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mock_exam_result_sections`
--

DROP TABLE IF EXISTS `mock_exam_result_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mock_exam_result_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `result_id` int NOT NULL,
  `section_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` int NOT NULL,
  `max_score` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `result_id` (`result_id`),
  CONSTRAINT `mock_exam_result_sections_ibfk_1` FOREIGN KEY (`result_id`) REFERENCES `mock_exam_results` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mock_exam_result_sections`
--

LOCK TABLES `mock_exam_result_sections` WRITE;
/*!40000 ALTER TABLE `mock_exam_result_sections` DISABLE KEYS */;
INSERT INTO `mock_exam_result_sections` VALUES (1,1,'Nghe',80,100),(2,1,'Đọc',70,100),(3,1,'Viết',35,50);
/*!40000 ALTER TABLE `mock_exam_result_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mock_exam_results`
--

DROP TABLE IF EXISTS `mock_exam_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mock_exam_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `score` int NOT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mock_exam_results`
--

LOCK TABLES `mock_exam_results` WRITE;
/*!40000 ALTER TABLE `mock_exam_results` DISABLE KEYS */;
INSERT INTO `mock_exam_results` VALUES (1,'student1','HSK2 Mock Test 00','2025-06-01',185,'Nghe tốt, cần cải thiện phần viết.');
/*!40000 ALTER TABLE `mock_exam_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mock_exam_shifts`
--

DROP TABLE IF EXISTS `mock_exam_shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mock_exam_shifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mock_exam_shifts`
--

LOCK TABLES `mock_exam_shifts` WRITE;
/*!40000 ALTER TABLE `mock_exam_shifts` DISABLE KEYS */;
INSERT INTO `mock_exam_shifts` VALUES (1,'HSK2.1 Mock Test 01','2026-01-10','18:00:00','19:30:00','P201','HSK3'),(2,'HSK 2.2Mock Test 02','2026-02-17','18:00:00','19:30:00','P202','HSK3');
/*!40000 ALTER TABLE `mock_exam_shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (8,56,'1fb531a623894f31ad3ed925e019330ca9272b1e1f420fe26a7612b60bd12106','2025-12-25 02:31:19','2025-12-24 18:31:18'),(10,66,'3ce4582791a2023f341cbc7f1a4ba651c0d61d590375957f17fac801679917a3','2025-12-25 02:35:07','2025-12-24 18:35:06'),(11,58,'3a4d2a48fae61299422eeccbb21cefdbe0f26d237fb3ec70174738af42c1f16d','2025-12-25 02:55:01','2025-12-24 18:55:00'),(12,59,'ead55f002a04e50f8f95ae87221a7b21698a0057b91a129c9a6251c135833bff','2025-12-25 03:03:06','2025-12-24 19:03:05');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int DEFAULT NULL,
  `student_id` int NOT NULL,
  `action` enum('ASSIGNED','FINISHED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `meta` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sch_class` (`class_id`),
  KEY `fk_sch_student` (`student_id`),
  CONSTRAINT `fk_sch_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sch_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=485 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_schedule`
--

DROP TABLE IF EXISTS `student_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `class_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_schedule_username` (`username`),
  KEY `idx_schedule_date` (`date`),
  CONSTRAINT `fk_schedule_user` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_schedule`
--

LOCK TABLES `student_schedule` WRITE;
/*!40000 ALTER TABLE `student_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NEW','ACTIVE','PAUSED','COMPLETED','DELETED') COLLATE utf8mb4_unicode_ci DEFAULT 'NEW',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'NEW',
  `is_paid` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (100,'Nguyễn văn Thưởng','0348419996','thinh.vd227154@sis.hust.edu.vn',NULL,'ACTIVE',NULL,'2025-12-24 22:01:48','2025-12-24 22:21:14','PAID',0);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('STUDENT','TEACHER','STAFF','ACCOUNTANT','MANAGER','INSTRUCTOR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_users_student` (`student_id`),
  CONSTRAINT `fk_users_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,'manager1','$2a$10$3iU0L7727.hKG0qSYz0tOeBhQjNqBgYY7hCXsQ6gvwOrv7j3XrCke','MANAGER',NULL,1,'anhkha19012004@gmail.com',NULL),(52,'manager2','$2a$10$3iU0L7727.hKG0qSYz0tOeBhQjNqBgYY7hCXsQ6gvwOrv7j3XrCke','MANAGER',NULL,1,'thinh.vd227154@sis.hust.edu.vn',NULL),(55,'thinhvu','$2a$10$.ttAYk0N2TwVYQKwW1X9yOu3LGRaHbnKCzJgBPvc/2D3kZibxrD/.','ACCOUNTANT',NULL,1,NULL,NULL),(56,'hoangtran','$2b$10$8r1iSKATRNoaecQs6DWU7ufI3ks6uGRApjibcQz16cjEzw9ObsyyG','STAFF',NULL,1,NULL,NULL),(58,'instructor11','$2a$10$hT9G/7omF4NDZ0tZBQhDceVvIfsi0Lxo059MmplsJvmudXQzW9wtq','INSTRUCTOR',NULL,0,NULL,16),(59,'instructor12','$2a$10$42frhZRzkTDCATEBaeWLtupso.dglBCVU1fwu8RU1K2cy76aSIrRi','INSTRUCTOR',NULL,0,NULL,26),(61,'instructor13','$2a$10$L/zGEqYYBmYQIdUcKy8icOLV0kzrEvKmL9GHoinLsnxvpxhxngswy','INSTRUCTOR',NULL,0,NULL,26),(62,'instructor14','$2a$10$GVTTTMzFnhu64JfiRHSgQeJkwQOtLzc0VQCXM/J9yPIDWraDUcfQ.','INSTRUCTOR',NULL,0,NULL,26),(63,'instructor15','$2a$10$3Wk.OYjtlappzmWUbqC6QeYp4K19IWfHDSK/ecMNjGpT7Tt9pbelS','INSTRUCTOR',NULL,0,NULL,26),(64,'instructor16','$2a$10$AL9gtx0YfbrvjR8lHzDpuutqNmqzf88NLinOlCcDWX0MbVYaY7IgO','INSTRUCTOR',NULL,1,NULL,26),(65,'gv26','$2a$10$4Z7G8R6XHPB6zXNGiiwGP.QNC/T6TKJ07UmsnacxKsUioNh5VzF/2','TEACHER',NULL,1,NULL,26),(66,'student100','$2a$10$9W3GbjsnIBb2YRAQ1hANQOJyOCeLYXx4ZER0FkOM.zxhza/Wtk0xi','STUDENT',100,1,NULL,NULL),(67,'gv27','$2a$10$8yJfGVj3j3X4/vf.XhArnO4ylJnHiu78pOjGYFB/QembOAfSCkXMm','INSTRUCTOR',NULL,1,NULL,27);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-25  2:51:45
