-- Migration: create class_schedules table to store schedules that apply to whole class
CREATE TABLE IF NOT EXISTS class_schedules (
	id INT AUTO_INCREMENT PRIMARY KEY,
	class_id INT NOT NULL,
	action VARCHAR(50) DEFAULT 'ASSIGNED',
	scheduled_at TIMESTAMP NULL,
	meta JSON NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_csched_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);
