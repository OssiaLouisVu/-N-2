-- Migration 016: Create instructors tables (Safe version)
-- Chạy trực tiếp trong MySQL hoặc MySQL Workbench

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

-- Thêm foreign key nếu bảng users tồn tại
-- ALTER TABLE instructors ADD CONSTRAINT fk_instructor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

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

-- Thêm foreign key cho class_id nếu bảng classes tồn tại
-- ALTER TABLE instructor_class_history ADD CONSTRAINT fk_history_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_instructors_status ON instructors(status);
CREATE INDEX IF NOT EXISTS idx_instructors_email ON instructors(email);
CREATE INDEX IF NOT EXISTS idx_instructor_schedules_instructor_id ON instructor_schedules(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_class_history_instructor_id ON instructor_class_history(instructor_id);

SELECT 'Migration 016 completed successfully!' AS Status;
