-- Add user_id to employees to link with users table for account management
ALTER TABLE employees
  ADD COLUMN user_id INT NULL AFTER active,
  ADD CONSTRAINT fk_employees_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL;
