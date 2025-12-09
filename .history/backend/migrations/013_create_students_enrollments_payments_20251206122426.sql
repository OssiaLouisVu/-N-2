-- Migration: Cấu trúc đúng quy trình thu học phí
-- Students -> Payments -> Enrollments

-- Tạo bảng courses (khóa học)
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tuition_fee DECIMAL(10,2) NOT NULL,
    duration INT, -- Số buổi học
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng students (học viên)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng payments (thanh toán học phí - liên kết trực tiếp với student)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) DEFAULT 'cash', -- cash, bank_transfer
    note TEXT,
    status VARCHAR(20) DEFAULT 'PAID',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tạo bảng enrollments (gán lớp - chỉ tạo SAU khi đã có payment)
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    class_id INT,
    payment_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ENROLLED',
    UNIQUE(student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Index tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_id ON enrollments(payment_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- Tạo bảng student_schedules (lịch học của học viên)
CREATE TABLE IF NOT EXISTS student_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_schedules_student_id ON student_schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_student_schedules_class_id ON student_schedules(class_id);

-- Tạo bảng attendance_log (điểm danh chi tiết)
CREATE TABLE IF NOT EXISTS attendance_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    session_id INT,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LATE, EXCUSED
    note TEXT,
    recorded_by INT, -- employee_id
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_attendance_log_student_id ON attendance_log(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_log_class_id ON attendance_log(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_log_date ON attendance_log(date);

-- Thêm dữ liệu mẫu courses
INSERT INTO courses (name, description, tuition_fee, duration) VALUES
('IELTS Foundation', 'Khóa học IELTS cơ bản cho người mới bắt đầu', 5000000, 40),
('IELTS Intermediate', 'Khóa học IELTS trung cấp, mục tiêu 5.5-6.5', 6000000, 40),
('IELTS Advanced', 'Khóa học IELTS nâng cao, mục tiêu 7.0+', 7000000, 40),
('TOEIC 450+', 'Khóa học TOEIC cơ bản, mục tiêu 450+', 4000000, 30),
('TOEIC 650+', 'Khóa học TOEIC trung cấp, mục tiêu 650+', 4500000, 30),
('English Communication', 'Khóa học giao tiếp tiếng Anh thực tế', 3500000, 30),
('Business English', 'Tiếng Anh thương mại cho người đi làm', 5500000, 35),
('TOEFL iBT', 'Khóa học luyện thi TOEFL iBT', 6500000, 40)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Thêm dữ liệu mẫu students
INSERT INTO students (name, phone, email, address, status) VALUES
('Nguyễn Văn A', '0901234567', 'nva@email.com', '123 Nguyễn Huệ, Q1, TPHCM', 'ACTIVE'),
('Trần Thị B', '0902345678', 'ttb@email.com', '456 Lê Lợi, Q3, TPHCM', 'ACTIVE'),
('Lê Văn C', '0903456789', 'lvc@email.com', '789 Trần Hưng Đạo, Q5, TPHCM', 'ACTIVE'),
('Phạm Thị D', '0904567890', 'ptd@email.com', '321 Võ Văn Tần, Q10, TPHCM', 'ACTIVE'),
('Hoàng Văn E', '0905678901', 'hve@email.com', '654 Cách Mạng Tháng 8, Q3, TPHCM', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Thêm dữ liệu mẫu payments (ví dụ học viên đã đóng học phí)
INSERT INTO payments (student_id, course_id, amount, method, note) VALUES
(1, 1, 5000000, 'bank_transfer', 'Đóng học phí khóa IELTS Foundation'),
(2, 2, 6000000, 'cash', 'Đóng học phí khóa IELTS Intermediate'),
(3, 3, 7000000, 'bank_transfer', 'Đóng học phí khóa IELTS Advanced'),
(4, 4, 4000000, 'cash', 'Đóng học phí khóa TOEIC 450+'),
(5, 6, 3500000, 'bank_transfer', 'Đóng học phí khóa English Communication')
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- View: Thông tin đầy đủ học viên và khóa học
CREATE OR REPLACE VIEW v_student_enrollments AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    s.phone,
    s.email,
    c.name as course_name,
    c.tuition_fee,
    p.amount as paid_amount,
    p.paid_at,
    p.method as payment_method,
    e.enrolled_at,
    e.status as enrollment_status,
    cl.name as class_name
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN courses c ON e.course_id = c.id
LEFT JOIN payments p ON e.payment_id = p.id
LEFT JOIN classes cl ON e.class_id = cl.id
WHERE s.status = 'ACTIVE';

-- View: Thống kê thanh toán theo khóa học
CREATE OR REPLACE VIEW v_course_revenue AS
SELECT 
    c.id as course_id,
    c.name as course_name,
    c.tuition_fee,
    COUNT(DISTINCT p.id) as total_payments,
    COUNT(DISTINCT e.student_id) as total_students,
    SUM(p.amount) as total_revenue
FROM courses c
LEFT JOIN payments p ON c.id = p.course_id
LEFT JOIN enrollments e ON p.id = e.payment_id
WHERE c.status = 'ACTIVE'
GROUP BY c.id, c.name, c.tuition_fee;

-- View: Lịch học của học viên
CREATE OR REPLACE VIEW v_student_schedule_detail AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    ss.day_of_week,
    ss.start_time,
    ss.end_time,
    ss.room,
    c.name as class_name,
    co.name as course_name,
    ss.status
FROM students s
JOIN student_schedules ss ON s.id = ss.student_id
JOIN classes c ON ss.class_id = c.id
LEFT JOIN courses co ON c.course_id = co.id
WHERE s.status = 'ACTIVE' AND ss.status = 'ACTIVE'
ORDER BY s.id, ss.day_of_week, ss.start_time;

-- View: Thống kê điểm danh
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    c.id as class_id,
    c.name as class_name,
    COUNT(CASE WHEN al.status = 'PRESENT' THEN 1 END) as present_count,
    COUNT(CASE WHEN al.status = 'ABSENT' THEN 1 END) as absent_count,
    COUNT(CASE WHEN al.status = 'LATE' THEN 1 END) as late_count,
    COUNT(CASE WHEN al.status = 'EXCUSED' THEN 1 END) as excused_count,
    COUNT(al.id) as total_sessions
FROM students s
JOIN attendance_log al ON s.id = al.student_id
JOIN classes c ON al.class_id = c.id
GROUP BY s.id, s.name, c.id, c.name;
