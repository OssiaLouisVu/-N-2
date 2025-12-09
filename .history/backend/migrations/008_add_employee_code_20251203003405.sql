-- Migration: Add employee_code column to employees table
-- Tạo mã nhân viên tự động (vd: NV001, NV002, ...)

USE english_center;

-- Thêm cột employee_code (unique, not null)
ALTER TABLE employees 
ADD COLUMN employee_code VARCHAR(20) UNIQUE NULL AFTER id;

-- Tạo index để tăng tốc query theo employee_code
CREATE INDEX idx_employee_code ON employees(employee_code);

-- Cập nhật employee_code cho các nhân viên hiện tại (nếu có)
UPDATE employees 
SET employee_code = CONCAT('NV', LPAD(id, 4, '0'))
WHERE employee_code IS NULL;

-- Sau khi cập nhật xong, set NOT NULL
ALTER TABLE employees 
MODIFY COLUMN employee_code VARCHAR(20) NOT NULL;
