-- Migration: Create invoices table for fee management
-- Trạng thái: PENDING (chưa thanh toán), PAID (đã thanh toán)

CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID
    payment_method VARCHAR(50), -- cash, bank, card, other
    payment_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create indexes for better query performance
CREATE INDEX idx_invoices_student_status ON invoices(student_id, status);
CREATE INDEX idx_invoices_course_status ON invoices(course_id, status);
CREATE INDEX idx_invoices_paid_at ON invoices(paid_at);

-- Update students table to add payment status if not exists
ALTER TABLE students ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'NEW';

-- Create index for student payment status (skip if exists)
ALTER TABLE students ADD INDEX idx_students_payment_status (payment_status);
