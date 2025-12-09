// routes/feeRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Lấy danh sách học viên chưa nộp học phí (chưa có payment)
router.get('/students/unpaid', async (req, res) => {
  try {
    // Lấy học viên đã tạo nhưng chưa có payment nào
    const [rows] = await db.query(`
      SELECT s.id, s.name, s.phone, s.email
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN payments p ON e.id = p.enrollment_id
      WHERE p.id IS NULL
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    res.json({ success: true, students: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách học viên chưa nộp học phí' });
  }
});

// Tạo hóa đơn và ghi nhận thanh toán học phí (payment)
router.post('/payments', async (req, res) => {
  try {
    const { enrollment_id, amount, method, note } = req.body;
    await db.query(
      'INSERT INTO payments (enrollment_id, amount, paid_at, method, note) VALUES (?, ?, NOW(), ?, ?)',
      [enrollment_id, amount, method, note]
    );
    res.json({ success: true, message: 'Đã ghi nhận thanh toán' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi ghi nhận thanh toán' });
  }
});

// Đăng ký học viên vào khoá học
router.post('/enroll', async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    // Kiểm tra đã đăng ký chưa
    const [exist] = await db.query('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [student_id, course_id]);
    if (exist.length > 0) return res.status(400).json({ success: false, message: 'Học viên đã đăng ký khoá học này' });
    await db.query('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student_id, course_id]);
    res.json({ success: true, message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi đăng ký học viên' });
  }
});

// Gửi thông báo cho học viên (giả lập)
router.post('/notify', async (req, res) => {

  const express = require('express');
  const router = express.Router();
  const db = require('../db');

  // Lấy danh sách học viên chưa nộp học phí (chưa có payment)
  router.get('/students/unpaid', async (req, res) => {
    try {
      // Lấy học viên đã tạo nhưng chưa có payment nào
      const [rows] = await db.query(`
        SELECT s.id, s.name, s.phone, s.email
        FROM students s
        LEFT JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN payments p ON e.id = p.enrollment_id
        WHERE p.id IS NULL
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `);
      res.json({ success: true, students: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lấy danh sách học viên chưa nộp học phí' });
    }
  });

  // Tạo hóa đơn và ghi nhận thanh toán học phí (payment)
  router.post('/payments', async (req, res) => {
    try {
      const { enrollment_id, amount, method, note } = req.body;
      if (!enrollment_id || !amount) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
      await db.query(
        'INSERT INTO payments (enrollment_id, amount, paid_at, method, note) VALUES (?, ?, NOW(), ?, ?)',
        [enrollment_id, amount, method, note]
      );
      res.json({ success: true, message: 'Đã ghi nhận thanh toán' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi ghi nhận thanh toán' });
    }
  });

  module.exports = router;
    if (!enrollment_id || !amount) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
