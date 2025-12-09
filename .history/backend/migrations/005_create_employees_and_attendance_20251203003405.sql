-- Tạo bảng employees
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  dob DATE,
  gender VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  address VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng attendance
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  date DATE,
  status VARCHAR(20),
  note VARCHAR(255),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);c