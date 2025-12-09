-- Add user_id column to employees to link with users table
ALTER TABLE employees
	ADD COLUMN IF NOT EXISTS user_id INT NULL;

-- Add FK constraint if not exists (idempotent)
SET @fk_exists := (
	SELECT COUNT(*)
	FROM information_schema.REFERENTIAL_CONSTRAINTS
	WHERE CONSTRAINT_SCHEMA = DATABASE()
		AND CONSTRAINT_NAME = 'fk_employees_user_id'
);
SET @ddl := IF(
	@fk_exists = 0,
	'ALTER TABLE employees ADD CONSTRAINT fk_employees_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL',
	'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

