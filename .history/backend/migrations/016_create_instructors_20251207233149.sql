-- Migration: Tạo bảng instructors (giảng viên) và instructor_schedules
-- Run: mysql -u root -p english_center < backend/migrations/016_create_instructors.sql

-- Tạo bảng instructors (giảng viên)
CREATE TABLE IF NOT EXISTS instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    date_of_birth DATE,
    address TEXT,
    
    -- Thông tin chuyên môn
    specialization VARCHAR(100), -- IELTS, TOEIC, Giao tiếp, Thiếu nhi, etc.
    level VARCHAR(50), -- Junior, Senior, Expert
    experience_years INT DEFAULT 0,
    bio TEXT,
    certifications TEXT, -- JSON hoặc text lưu các chứng chỉ
    
    -- Thông tin tài chính
    hourly_rate DECIMAL(10,2) DEFAULT 0, -- Lương theo giờ
    payment_method VARCHAR(50) DEFAULT 'cash', -- cash, bank_transfer
    bank_account VARCHAR(100),
    bank_name VARCHAR(100),
    
    -- Trạng thái
    status ENUM('NEW', 'ACTIVE', 'INACTIVE', 'ON_LEAVE') DEFAULT 'NEW',
    note TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tạo bảng instructor_schedules (lịch rảnh của giảng viên - lịch có thể dạy)
CREATE TABLE IF NOT EXISTS instructor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    day_of_week INT NOT NULL, -- 0=CN, 1=T2, ..., 6=T7
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    note TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE
);

-- Cập nhật bảng class_teachers để link với instructors
-- (Giữ nguyên cấu trúc cũ nhưng thêm foreign key nếu cần)
ALTER TABLE class_teachers 
    ADD CONSTRAINT fk_ct_instructor 
    FOREIGN KEY (teacher_id) REFERENCES instructors(id) 
    ON DELETE CASCADE;

-- Index tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_instructors_status ON instructors(status);
CREATE INDEX IF NOT EXISTS idx_instructors_email ON instructors(email);
CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_schedules_instructor_id ON instructor_schedules(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_schedules_day_of_week ON instructor_schedules(day_of_week);

-- Tạo bảng instructor_class_history (lịch sử giảng dạy)
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
    rating DECIMAL(3,2), -- Đánh giá từ học viên (0-5)
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_instructor_class_history_instructor_id ON instructor_class_history(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_class_history_class_id ON instructor_class_history(class_id);
