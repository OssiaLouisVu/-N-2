-- Migration: Create attendance table
-- Description: Bảng lưu dữ liệu chấm công nhân viên theo ngày

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  is_present BOOLEAN DEFAULT TRUE,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE KEY unique_employee_date (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_employee_id (employee_id),
  INDEX idx_date (date),
  INDEX idx_employee_date (employee_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: ON DELETE RESTRICT để bảo vệ dữ liệu chấm công
-- Không cho phép xóa nhân viên nếu đã có dữ liệu chấm công
