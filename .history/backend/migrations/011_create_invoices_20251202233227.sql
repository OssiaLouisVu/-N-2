-- Migration: Tạo bảng invoices (Hoá đơn học phí)
-- Chức năng: Tạo hoá đơn học phí

CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_code VARCHAR(20) UNIQUE NOT NULL,
  student_id INT NOT NULL,
  class_id INT,
  invoice_type ENUM('TUITION', 'MATERIAL', 'EXAM', 'CERTIFICATE', 'OTHER') DEFAULT 'TUITION',
  amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'PENDING',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  note TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger tự động tạo invoice_code
DELIMITER $$
CREATE TRIGGER before_invoice_insert
BEFORE INSERT ON invoices
FOR EACH ROW
BEGIN
  IF NEW.invoice_code IS NULL OR NEW.invoice_code = '' THEN
    SET NEW.invoice_code = CONCAT('INV-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD((SELECT IFNULL(MAX(id), 0) + 1 FROM invoices), 4, '0'));
  END IF;
END$$
DELIMITER ;
