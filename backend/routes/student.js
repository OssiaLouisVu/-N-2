const express = require('express');
const router = express.Router();
const db = require('../db'); // Kết nối MySQL

// Thêm học viên mới (status = 'NEW')
router.post('/add', async(req, res) => {
    const { full_name, phone, email, level, note } = req.body;
    try {
        await db.query(
            'INSERT INTO students (full_name, phone, email, level, note, status) VALUES (?, ?, ?, ?, ?, ?)', [full_name, phone, email, level, note, 'NEW']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách học viên theo trạng thái
router.get('/list', async(req, res) => {
    const { status } = req.query;
    try {
        const [rows] = await db.query(
            'SELECT * FROM students WHERE status = ? ORDER BY id DESC', [status]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật trạng thái học viên (ví dụ: NEW -> ACTIVE, ACTIVE -> COMPLETED)
router.post('/update-status', async(req, res) => {
    const { id, status } = req.body;
    try {
        await db.query(
            'UPDATE students SET status = ? WHERE id = ?', [status, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/delete/:id', async(req, res) => {
    const { id } = req.params;
    try {
        await db.query(`DELETE FROM accounting WHERE student_id = ?`, [id]); // nếu có bảng liên quan
        await db.query(`DELETE FROM students WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;