ALTER TABLE employees ADD COLUMN user_id INT NULL;

-- Thêm ràng buộc khóa ngoại tới users(id)
ALTER TABLE employees
  ADD CONSTRAINT fk_employees_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE SET NULL;

