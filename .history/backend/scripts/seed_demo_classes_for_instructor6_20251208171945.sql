-- Thêm 3 lớp test cho instructor6
-- Lấy user_id và instructor_id của instructor6
-- Giả sử user_id = 16, instructor_id = 6 (bạn kiểm tra lại nếu khác)

-- 1. Lớp sắp dạy (start_date > NOW)
INSERT INTO classes (name, level, start_date, end_date) VALUES
('Lớp Test Sắp Dạy', 'A1', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY));
SET @class_upcoming_id = LAST_INSERT_ID();

-- 2. Lớp đang dạy (start_date <= NOW() AND end_date >= NOW())
INSERT INTO classes (name, level, start_date, end_date) VALUES
('Lớp Test Đang Dạy', 'A2', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY));
SET @class_active_id = LAST_INSERT_ID();

-- 3. Lớp đã dạy (end_date < NOW())
INSERT INTO classes (name, level, start_date, end_date) VALUES
('Lớp Test Đã Dạy', 'A3', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));
SET @class_completed_id = LAST_INSERT_ID();

-- Gán instructor6 vào các lớp này (giả sử instructor_id = 6)
INSERT INTO class_teachers (class_id, teacher_id, role, assigned_at) VALUES
(@class_upcoming_id, 6, 'MAIN', NOW()),
(@class_active_id, 6, 'MAIN', NOW()),
(@class_completed_id, 6, 'MAIN', NOW());

-- Xong! Sau khi chạy, reload lại dashboard để test.