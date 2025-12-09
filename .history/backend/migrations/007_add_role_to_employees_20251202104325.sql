-- Add role column to employees to reflect position even without login account
ALTER TABLE employees
  ADD COLUMN role VARCHAR(32) NULL AFTER address;
