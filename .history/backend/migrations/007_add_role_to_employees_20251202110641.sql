-- Add role column to employees to reflect position even without login account
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS role VARCHAR(32) NULL AFTER address;
