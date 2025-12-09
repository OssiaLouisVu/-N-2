-- Migration 011: Tạo bảng quản lý học phí và thanh toán

-- Bảng hoá đơn học phí
CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT,
  invoice_type ENUM('TUITION', 'MATERIAL', 'EXAM', 'OTHER') DEFAULT 'TUITION' COMMENT 'Loại hoá đơn: Học phí, Tài liệu, Thi, Khác',
  amount DECIMAL(10,2) NOT NULL COMMENT 'Số tiền gốc',
  discount DECIMAL(10,2) DEFAULT 0 COMMENT 'Giảm giá',
  final_amount DECIMAL(10,2) NOT NULL COMMENT 'Số tiền sau giảm giá',
  paid_amount DECIMAL(10,2) DEFAULT 0 COMMENT 'Số tiền đã thanh toán',
  status ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'PENDING' COMMENT 'Trạng thái: Chưa thanh toán, Thanh toán 1 phần, Đã thanh toán, Quá hạn, Đã huỷ',
  due_date DATE COMMENT 'Hạn thanh toán',
  invoice_date DATE NOT NULL COMMENT 'Ngày tạo hoá đơn',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT COMMENT 'ID kế toán tạo hoá đơn',
  note TEXT COMMENT 'Ghi chú',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date),
  INDEX idx_invoice_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng thanh toán
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL COMMENT 'Số tiền thanh toán',
  payment_method ENUM('CASH', 'BANK_TRANSFER', 'CARD', 'MOMO', 'VNPAY', 'OTHER') DEFAULT 'CASH' COMMENT 'Phương thức thanh toán',
  payment_date DATE NOT NULL COMMENT 'Ngày thanh toán',
  transaction_ref VARCHAR(100) COMMENT 'Mã giao dịch (nếu chuyển khoản)',
  note TEXT COMMENT 'Ghi chú',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT COMMENT 'ID kế toán ghi nhận thanh toán',
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_invoice (invoice_id),
  INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng nhắc nở thanh toán
CREATE TABLE IF NOT EXISTS payment_reminders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  reminder_date DATE NOT NULL COMMENT 'Ngày nhắc nở',
  reminder_type ENUM('EMAIL', 'SMS', 'NOTIFICATION') DEFAULT 'EMAIL' COMMENT 'Loại nhắc nở',
  status ENUM('SENT', 'FAILED', 'PENDING') DEFAULT 'PENDING' COMMENT 'Trạng thái gửi',
  sent_at TIMESTAMP COMMENT 'Thời gian gửi',
  error_message TEXT COMMENT 'Lỗi nếu gửi thất bại',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  INDEX idx_invoice (invoice_id),
  INDEX idx_status (status),
  INDEX idx_reminder_date (reminder_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger tự động cập nhật paid_amount và status khi có thanh toán mới
DELIMITER $$

CREATE TRIGGER after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  DECLARE total_paid DECIMAL(10,2);
  DECLARE invoice_final_amount DECIMAL(10,2);
  
  -- Tính tổng đã thanh toán
  SELECT SUM(amount) INTO total_paid
  FROM payments
  WHERE invoice_id = NEW.invoice_id;
  
  -- Lấy final_amount của hoá đơn
  SELECT final_amount INTO invoice_final_amount
  FROM invoices
  WHERE id = NEW.invoice_id;
  
  -- Cập nhật paid_amount và status
  UPDATE invoices
  SET paid_amount = total_paid,
      status = CASE
        WHEN total_paid >= invoice_final_amount THEN 'PAID'
        WHEN total_paid > 0 THEN 'PARTIAL'
        ELSE 'PENDING'
      END
  WHERE id = NEW.invoice_id;
END$$

-- Trigger tự động cập nhật khi xoá thanh toán
CREATE TRIGGER after_payment_delete
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
  DECLARE total_paid DECIMAL(10,2);
  DECLARE invoice_final_amount DECIMAL(10,2);
  
  -- Tính tổng đã thanh toán
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM payments
  WHERE invoice_id = OLD.invoice_id;
  
  -- Lấy final_amount của hoá đơn
  SELECT final_amount INTO invoice_final_amount
  FROM invoices
  WHERE id = OLD.invoice_id;
  
  -- Cập nhật paid_amount và status
  UPDATE invoices
  SET paid_amount = total_paid,
      status = CASE
        WHEN total_paid >= invoice_final_amount THEN 'PAID'
        WHEN total_paid > 0 THEN 'PARTIAL'
        ELSE 'PENDING'
      END
  WHERE id = OLD.invoice_id;
END$$

DELIMITER ;
