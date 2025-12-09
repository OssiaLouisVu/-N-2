const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();
const db = require('../db');

const router = express.Router();

// Create mail transporter using env config
const mailTransporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Health check
router.get('/health', (req, res) => {
    res.json({ success: true });
});

// POST /api/notify/email
// body: { employeeIds: number[], title: string, content: string }
router.post('/email', async(req, res) => {
    const { employeeIds = [], title = '', content = '' } = req.body || {};

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách nhân viên nhận thông báo trống' });
    }
    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề và nội dung' });
    }
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        return res.status(500).json({ success: false, message: 'Chưa cấu hình tài khoản email (MAIL_USER/MAIL_PASS)' });
    }

    try {
        // Lấy email của nhân viên theo id
        const placeholders = employeeIds.map(() => '?').join(',');
        const [rows] = await db.execute(
            `SELECT id, full_name, email FROM employees WHERE id IN (${placeholders})`,
            employeeIds
        );

        const recipients = rows
            .map(r => ({ to: r.email, name: r.full_name }))
            .filter(r => r.to && String(r.to).includes('@'));

        if (recipients.length === 0) {
            return res.status(400).json({ success: false, message: 'Không tìm thấy email hợp lệ của nhân viên' });
        }

        // Gửi từng email; có thể tối ưu bằng BCC nếu cần
        await Promise.all(
            recipients.map(r =>
                mailTransporter.sendMail({
                    from: `"Trung tâm tiếng Trung" <${process.env.MAIL_USER}>`,
                    to: r.to,
                    subject: title,
                    text: `Xin chào ${r.name || 'Anh/Chị'},\n\n${content}\n\nTrân trọng,\nTrung tâm tiếng Trung`,
                })
            )
        );

        return res.json({ success: true, sent: recipients.length });
    } catch (e) {
        console.error('Lỗi gửi email:', e);
        return res.status(500).json({ success: false, message: 'Lỗi khi gửi email' });
    }
});

// POST /api/notify/send-email
// body: { students: [{ id, full_name, email }], subject: string, body: string }
router.post('/send-email', async(req, res) => {
    const { students = [], subject = '', body = '' } = req.body || {};

    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách học viên trống' });
    }
    if (!subject || !body) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập chủ đề và nội dung' });
    }
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        return res.status(500).json({ success: false, message: 'Chưa cấu hình tài khoản email (MAIL_USER/MAIL_PASS)' });
    }

    try {
        // Filter students with valid email
        const recipients = students
            .filter(s => s.email && String(s.email).includes('@'))
            .map(s => ({ to: s.email, name: s.full_name }));

        if (recipients.length === 0) {
            return res.status(400).json({ success: false, message: 'Không tìm thấy email hợp lệ của học viên' });
        }

        // Send emails to all recipients
        await Promise.all(
            recipients.map(r =>
                mailTransporter.sendMail({
                    from: `"Trung tâm Tiếng Anh" <${process.env.MAIL_USER}>`,
                    to: r.to,
                    subject: subject,
                    text: `Xin chào ${r.name || 'Anh/Chị'},\n\n${body}\n\nTrân trọng,\nTrung tâm Tiếng Anh`,
                })
            )
        );

        return res.json({ success: true, sent: recipients.length });
    } catch (e) {
        console.error('Lỗi gửi email cho học viên:', e);
        return res.status(500).json({ success: false, message: 'Lỗi khi gửi email' });
    }
});

module.exports = router;