-- Migration: Thêm role INSTRUCTOR vào bảng users
-- Run: mysql -u root -p123456789 english_center < backend/migrations/017_add_instructor_role.sql

USE english_center;

-- Thêm INSTRUCTOR vào ENUM role
ALTER TABLE users 
MODIFY COLUMN role ENUM('STUDENT','TEACHER','STAFF','ACCOUNTANT','MANAGER','INSTRUCTOR') NOT NULL;

-- Verify
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'english_center' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';
