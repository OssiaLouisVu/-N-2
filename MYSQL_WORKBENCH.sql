-- ========================================
-- COPY TOÀN BỘ ĐOẠN NÀY VÀO MYSQL WORKBENCH
-- Sau đó nhấn nút Execute (⚡)
-- ========================================

USE english_center;

-- Tạo bảng instructors
CREATE TABLE IF NOT EXISTS instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    date_of_birth DATE,
    address TEXT,
    specialization VARCHAR(100),
    level VARCHAR(50),
    experience_years INT DEFAULT 0,
    bio TEXT,
    certifications TEXT,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'cash',
    bank_account VARCHAR(100),
    bank_name VARCHAR(100),
    status ENUM('NEW', 'ACTIVE', 'INACTIVE', 'ON_LEAVE') DEFAULT 'NEW',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng instructor_schedules
CREATE TABLE IF NOT EXISTS instructor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    day_of_week INT NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    note TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE
);

-- Tạo bảng instructor_class_history
CREATE TABLE IF NOT EXISTS instructor_class_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    class_id INT NOT NULL,
    role ENUM('MAIN', 'ASSISTANT') DEFAULT 'MAIN',
    start_date DATE,
    end_date DATE,
    total_sessions INT DEFAULT 0,
    total_hours DECIMAL(10,2) DEFAULT 0,
    total_payment DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(3,2),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE
);

-- Tạo indexes để tối ưu (bỏ qua lỗi nếu đã tồn tại)
CREATE INDEX idx_instructors_status ON instructors(status);
CREATE INDEX idx_instructors_email ON instructors(email);
CREATE INDEX idx_instructor_schedules_instructor_id ON instructor_schedules(instructor_id);
CREATE INDEX idx_instructor_class_history_instructor_id ON instructor_class_history(instructor_id);

-- Kiểm tra kết quả
SELECT 'Hoàn thành! Bảng instructors đã được tạo.' AS Message;
SHOW TABLES LIKE '%instructor%';
