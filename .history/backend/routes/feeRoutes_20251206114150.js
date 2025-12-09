// routes/feeRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Lấy danh sách học viên chưa nộp học phí (chưa có payment)
router.get('/students/unpaid', async(req, res) => {
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
router.post('/payments', async(req, res) => {
    try {
        const { enrollment_id, amount, method, note } = req.body;
        if (!enrollment_id || !amount) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        await db.query(
            'INSERT INTO payments (enrollment_id, amount, paid_at, method, note) VALUES (?, ?, NOW(), ?, ?)', [enrollment_id, amount, method, note]
        );
        res.json({ success: true, message: 'Đã ghi nhận thanh toán' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi ghi nhận thanh toán' });
    }
});

// Đăng ký học viên vào khoá học
router.post('/enroll', async(req, res) => {
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
router.post('/notify', async(req, res) => {
    try {
        const { student_id, message } = req.body;
        if (!student_id || !message) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        // Ở đây chỉ giả lập gửi thông báo
        res.json({ success: true, message: `Đã gửi thông báo cho học viên ${student_id}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi gửi thông báo' });
    }
});

// 1. Lấy danh sách khoá học đang hoạt động
router.get('/courses', async(req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, tuition_fee FROM courses WHERE status = ? ORDER BY name', ['ACTIVE']);
        res.json({ success: true, courses: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách khoá học' });
    }
});

// 2. Lấy danh sách học viên đã đăng ký khoá học
router.get('/courses/:id/students', async(req, res) => {
    try {
        const courseId = req.params.id;
        const [rows] = await db.query(`
      SELECT s.id, s.name, s.phone, e.id AS enrollment_id
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.course_id = ?
    `, [courseId]);
        res.json({ success: true, students: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách học viên' });
    }
});

// 3. Ghi nhận thanh toán học phí
router.post('/payments', async(req, res) => {
    try {
        const { enrollment_id, amount, method, note } = req.body;
        if (!enrollment_id || !amount) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        await db.query(
            'INSERT INTO payments (enrollment_id, amount, paid_at, method, note) VALUES (?, ?, NOW(), ?, ?)', [enrollment_id, amount, method, note]
        );
        res.json({ success: true, message: 'Đã ghi nhận thanh toán' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi ghi nhận thanh toán' });
    }
});

// 4. Xem lịch sử thu học phí của học viên/khoá học
router.get('/payments', async(req, res) => {
    try {
        const { course_id, student_id } = req.query;
        let sql = `
      SELECT p.*, s.name AS student_name, c.name AS course_name
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `;
        const params = [];
        if (course_id) { sql += ' AND c.id = ?';
            params.push(course_id); }
        if (student_id) { sql += ' AND s.id = ?';
            params.push(student_id); }
        sql += ' ORDER BY p.paid_at DESC';
        const [rows] = await db.query(sql, params);
        res.json({ success: true, payments: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử thanh toán' });
    }
});

// 5. Thống kê tổng số tiền đã thu cho từng khoá học
router.get('/summary', async(req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT c.id, c.name, SUM(p.amount) AS total_paid
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      JOIN payments p ON e.id = p.enrollment_id
      WHERE c.status = 'ACTIVE'
      GROUP BY c.id, c.name
    `);
        res.json({ success: true, summary: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi thống kê' });
    }
});

module.exports = router;