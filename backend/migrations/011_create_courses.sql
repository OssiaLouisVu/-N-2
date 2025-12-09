-- Migration 011: Create courses and related tables

-- 1. Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
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
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ARCHIVED
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INT REFERENCES employees(id)
);

-- 2. Create course_lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    lesson_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(course_id, lesson_number)
);

-- 3. Create course_sub_lessons table
CREATE TABLE IF NOT EXISTS course_sub_lessons (
    id SERIAL PRIMARY KEY,
    lesson_id INT REFERENCES course_lessons(id) ON DELETE CASCADE,
    sub_lesson_number INT,
    title VARCHAR(200),
    type VARCHAR(50), -- Exercise, Quiz, Practice
    content TEXT,
    answer_key TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES course_lessons(id) ON DELETE SET NULL,
    title VARCHAR(200),
    type VARCHAR(50), -- Syllabus, Slide, Video, Exercise, Reference
    file_path VARCHAR(500),
    url TEXT,
    description TEXT,
    uploaded_by INT REFERENCES employees(id),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create course_history table
CREATE TABLE IF NOT EXISTS course_history (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    action VARCHAR(50), -- CREATE, UPDATE, DELETE
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    changed_by INT REFERENCES employees(id),
    changed_at TIMESTAMP DEFAULT NOW()
);

-- 6. Add course_id to classes table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='classes' AND column_name='course_id'
    ) THEN
        ALTER TABLE classes ADD COLUMN course_id INT REFERENCES courses(id);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_history_course_id ON course_history(course_id);

-- Insert sample data
INSERT INTO courses (course_code, name, level, short_description, tuition_fee, duration_weeks, sessions_per_week, hours_per_session, status, created_by) VALUES
('ENG-BEG-001', 'English for Beginners', 'Beginner', 'Khóa học dành cho người mới bắt đầu học tiếng Anh', 5000000, 12, 3, 1.5, 'ACTIVE', 1),
('ENG-INT-001', 'Intermediate English', 'Intermediate', 'Khóa học tiếng Anh trung cấp', 7000000, 16, 3, 2.0, 'ACTIVE', 1),
('ENG-ADV-001', 'Advanced English', 'Advanced', 'Khóa học tiếng Anh nâng cao', 9000000, 20, 3, 2.0, 'ACTIVE', 1)
ON CONFLICT (course_code) DO NOTHING;
