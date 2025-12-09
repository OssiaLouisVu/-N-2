
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy danh sách học viên chưa nộp học phí (chưa có payment)
// Theo quy trình: Staff tạo học viên -> học viên xuất hiện ở đây
router.get('/students/unpaid', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.name, s.phone, s.email, s.created_at
      FROM students s
      LEFT JOIN payments p ON s.id = p.student_id
      WHERE p.id IS NULL
      ORDER BY s.created_at DESC
    `);
    res.json({ success: true, students: rows });
  } catch (error) {
    console.error('Error fetching unpaid students:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách học viên chưa nộp học phí' });
  }
});

// 2. Lấy danh sách khóa học (để kế toán chọn khóa học khi ghi nhận thanh toán)
router.get('/courses', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, tuition_fee, duration
      FROM courses
      WHERE status = 'ACTIVE'
      ORDER BY name
    `);
    res.json({ success: true, courses: rows });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách khóa học' });
  }
});

// 3. Ghi nhận thanh toán học phí (payment)
// Theo quy trình: Kế toán thu học phí -> tạo payment (student_id + course_id)
router.post('/payments', async (req, res) => {
  try {
    const { student_id, course_id, amount, method, note } = req.body;
    
    if (!student_id || !course_id || !amount) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin (student_id, course_id, amount)' });
    }

    // Kiểm tra học viên đã nộp học phí cho khóa này chưa
    const [existing] = await db.query(
      'SELECT id FROM payments WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Học viên đã nộp học phí cho khóa học này' });
    }

    // Tạo payment
    await db.query(
      'INSERT INTO payments (student_id, course_id, amount, paid_at, method, note, status) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
      [student_id, course_id, amount, method || 'cash', note || '', 'PAID']
    );
    
    res.json({ success: true, message: 'Đã ghi nhận thanh toán học phí' });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Lỗi ghi nhận thanh toán' });
  }
});

// 4. Lấy danh sách học viên đã nộp học phí (cho staff gán lớp)
router.get('/students/paid', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.name, s.phone, s.email, 
             c.id AS course_id, c.name AS course_name,
             p.amount, p.paid_at, p.id AS payment_id
      FROM students s
      INNER JOIN payments p ON s.id = p.student_id
      INNER JOIN courses c ON p.course_id = c.id
      LEFT JOIN enrollments e ON s.id = e.student_id AND c.id = e.course_id
      WHERE e.id IS NULL
      ORDER BY p.paid_at DESC
    `);
    res.json({ success: true, students: rows });
  } catch (error) {
    console.error('Error fetching paid students:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách học viên đã nộp học phí' });
  }
});

module.exports = router;