-- Migration for MySQL: Create courses and related tables

-- 1. Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    level VARCHAR(50),
    short_description TEXT,
    detailed_description TEXT,
    duration_weeks INT,
    sessions_per_week INT,
    hours_per_session DECIMAL(3,1),
    tuition_fee DECIMAL(10,2),
    requirements TEXT,
    objectives TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT
    -- FOREIGN KEY (created_by) REFERENCES employees(id)
);

-- 2. Create course_lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    lesson_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, lesson_number),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 3. Create course_sub_lessons table
CREATE TABLE IF NOT EXISTS course_sub_lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT,
    sub_lesson_number INT,
    title VARCHAR(200),
    type VARCHAR(50), -- Exercise, Quiz, Practice
    content TEXT,
    answer_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
);

-- 4. Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    lesson_id INT,
    title VARCHAR(200),
    type VARCHAR(50),
    file_path VARCHAR(500),
    url TEXT,
    description TEXT,
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE SET NULL
);

-- 5. Create course_history table
CREATE TABLE IF NOT EXISTS course_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    action VARCHAR(50),
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 6. Add course_id to classes table (if not exists)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS course_id INT;
-- Nếu báo lỗi do đã có cột này thì bỏ qua
-- Nếu muốn ràng buộc: FOREIGN KEY (course_id) REFERENCES courses(id)

-- Insert sample data
INSERT IGNORE INTO courses (course_code, name, level, short_description, tuition_fee, duration_weeks, sessions_per_week, hours_per_session, status, created_by) VALUES
('ENG-BEG-001', 'English for Beginners', 'Beginner', 'Khóa học dành cho người mới bắt đầu học tiếng Anh', 5000000, 12, 3, 1.5, 'ACTIVE', 1),
('ENG-INT-001', 'Intermediate English', 'Intermediate', 'Khóa học tiếng Anh trung cấp', 7000000, 16, 3, 2.0, 'ACTIVE', 1),
('ENG-ADV-001', 'Advanced English', 'Advanced', 'Khóa học tiếng Anh nâng cao', 9000000, 20, 3, 2.0, 'ACTIVE', 1);
