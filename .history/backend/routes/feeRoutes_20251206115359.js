
const express = require('express');
const router = express.Router();
const db = require('../db');

// Lấy danh sách học viên chưa nộp học phí (chưa có payment)
router.get('/students/unpaid', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.name, s.phone, s.email, e.id AS enrollment_id
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN payments p ON e.id = p.enrollment_id
      WHERE p.id IS NULL
      GROUP BY s.id, e.id
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