// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // connection pool mysql2
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Cấu hình gửi mail
const mailTransporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Hàm gửi email thông tin tài khoản
async function sendCredentialsEmail({ to, fullName, username, tempPassword }) {
    if (!to) {
        console.log('No email provided for student, skipping sending credentials.');
        return { sent: false, message: 'No recipient email' };
    }

    const subject = `Tài khoản học viên - ${username}`;
    const text = `Xin chào ${fullName || ''},\n\n` +
        `Tài khoản học viên đã được tạo cho bạn:\n` +
        `- Username: ${username}\n` +
        `- Mật khẩu tạm thời: ${tempPassword}\n\n` +
        `Vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập.\n\nTrân trọng,\nTrung tâm`;

    try {
        await mailTransporter.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to,
            subject,
            text,
        });
        console.log(`Sent credentials email to ${to}`);
        return { sent: true };
    } catch (err) {
        console.error('Lỗi gửi email:', err);
        return { sent: false, message: err.message };
    }
}

// ============================================
// 1. API QUẢN LÝ HỌC VIÊN (CRUD)
// ============================================

// GET /api/students
router.get("/", async(req, res) => {
    const { status, keyword } = req.query;
    let sql = `SELECT * FROM students WHERE 1 = 1`;
    const params = [];

    if (status) {
        sql += " AND status = ? ";
        params.push(status);
    }
    if (keyword && keyword.trim() !== "") {
        const kw = `%${keyword.trim()}%`;
        sql += " AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?)";
        params.push(kw, kw, kw);
    }
    sql += " ORDER BY created_at DESC";

    try {
        const [rows] = await db.query(sql, params);
        return res.json({ success: true, students: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Lỗi server." });
    }
});

// POST /api/students (Tạo mới + Tạo User + Gửi Email)
router.post("/", async(req, res) => {
    const { full_name, phone, email, level, note, status } = req.body;

    if (!full_name || !phone) return res.status(400).json({ success: false, message: "Họ tên và SĐT là bắt buộc." });

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // Insert Student
        const [result] = await conn.query(
            `INSERT INTO students (full_name, phone, email, level, note, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`, [full_name, phone, email || null, level || null, note || null, status || 'NEW']
        );
        const studentId = result.insertId;

        // Create User Login
        const username = `student${studentId}`;
        const tempPassword = 'pass1234';
        const hashed = await bcrypt.hash(tempPassword, 10);

        await conn.query(
            'INSERT INTO users (username, password, role, student_id) VALUES (?, ?, ?, ?)', [username, hashed, 'STUDENT', studentId]
        );

        await conn.commit();

        // Gửi email sau khi commit thành công
        if (email) {
            sendCredentialsEmail({ to: email, fullName: full_name, username, tempPassword }).catch(console.error);
        }

        return res.json({ success: true, message: 'Đã tạo học viên và tài khoản.', id: studentId });
    } catch (err) {
        if (conn) await conn.rollback();
        return res.status(500).json({ success: false, message: 'Lỗi server khi thêm học viên.' });
    } finally {
        if (conn) conn.release();
    }
});

// PUT /api/students/:id
router.put("/:id", async(req, res) => {
    const studentId = req.params.id;
    const { full_name, phone, email, level, note, status } = req.body;
    // Logic update đơn giản
    try {
        await db.query(
            `UPDATE students SET full_name=?, phone=?, email=?, level=?, note=?, status=?, updated_at=NOW() WHERE id=?`, [full_name, phone, email, level, note, status, studentId]
        );
        res.json({ success: true, message: "Đã cập nhật." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi server." });
    }
});

// DELETE /api/students/delete/:id
router.delete('/delete/:id', async(req, res) => {
    const { id } = req.params;
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        await conn.query('DELETE FROM class_students WHERE student_id = ?', [id]);
        await conn.query('DELETE FROM users WHERE student_id = ?', [id]);
        await conn.query('DELETE FROM students WHERE id = ?', [id]);

        await conn.commit();
        res.json({ success: true, message: `Đã xoá học viên ID ${id}` });
    } catch (err) {
        if (conn) await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// ============================================
// 2. API XEM LỊCH HỌC (QUAN TRỌNG CHO HỌC VIÊN)
// ============================================

/**
 * GET /api/students/:id/my-schedule
 * Lấy lịch học từ các lớp mà học viên đang tham gia (ACTIVE)
 * Logic mới: Join class_students -> class_schedules
 */
// GET /api/students/:id - Lấy chi tiết học viên
// ============================================
// SỬA LẠI ĐOẠN NÀY TRONG studentRoutes.js
// ============================================

// GET /api/students/:id - Lấy chi tiết học viên + Lazy Check hoàn thành
router.get('/:id', async(req, res) => {
    const { id } = req.params;

    // SỬA LỖI: Dùng db thay vì pool
    let conn;
    try {
        conn = await db.getConnection(); // Lấy connection từ db pool

        // 1. Lấy thông tin học viên
        const [rows] = await conn.query(`SELECT * FROM students WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        let student = rows[0];

        // 2. LOGIC MỚI: Kiểm tra tự động hoàn thành (Lazy Check)
        // Chỉ kiểm tra nếu đang ACTIVE
        if (student.status === 'ACTIVE') {
            // Tìm ngày kết thúc của lớp mà học viên đang học
            const [classInfo] = await conn.query(`
                SELECT c.end_date 
                FROM classes c
                JOIN class_students cs ON c.id = cs.class_id
                WHERE cs.student_id = ? AND cs.status = 'ACTIVE'
                ORDER BY c.end_date DESC
                LIMIT 1
            `, [id]);

            if (classInfo.length > 0 && classInfo[0].end_date) {
                const endDate = new Date(classInfo[0].end_date);
                const today = new Date();

                // Nếu ngày hiện tại đã vượt quá ngày kết thúc
                if (today > endDate) {
                    // Update database sang COMPLETED
                    await conn.query(`UPDATE students SET status = 'COMPLETED' WHERE id = ?`, [id]);

                    // Update biến tạm để trả về client luôn cho đúng
                    student.status = 'COMPLETED';
                }
            }
        }

        res.json({ success: true, student });
    } catch (err) {
        console.error("Lỗi lấy chi tiết học viên:", err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (conn) conn.release(); // Quan trọng: Giải phóng connection
    }
});
// ============================================
// 2. API XEM LỊCH HỌC (FIX CHO FRONTEND CŨ)
// GET /api/students/:username/schedule
// ============================================
// ============================================
// 2. API XEM LỊCH HỌC (ĐÃ VÁ LỖI LAZY CHECK)
// GET /api/students/:username/schedule
// ============================================
router.get('/:username/schedule', async(req, res) => {
    const { username } = req.params;
    let conn;

    try {
        conn = await db.getConnection();

        // BƯỚC 1: Lấy ID và Status hiện tại của học viên
        const [users] = await conn.query(`
            SELECT s.id, s.status 
            FROM users u
            JOIN students s ON u.student_id = s.id
            WHERE u.username = ?
        `, [username]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const student = users[0];
        const studentId = student.id;

        // BƯỚC 2: (QUAN TRỌNG) Lazy Check - Kiểm tra xem lớp đã kết thúc chưa
        // Nếu đang ACTIVE mà ngày hiện tại > ngày kết thúc lớp -> Chuyển sang COMPLETED
        if (student.status === 'ACTIVE') {
            const [classInfo] = await conn.query(`
                SELECT c.end_date 
                FROM classes c
                JOIN class_students cs ON c.id = cs.class_id
                WHERE cs.student_id = ? AND cs.status = 'ACTIVE'
                ORDER BY c.end_date DESC
                LIMIT 1
            `, [studentId]);

            if (classInfo.length > 0 && classInfo[0].end_date) {
                const endDate = new Date(classInfo[0].end_date);
                const today = new Date();

                // Reset giờ về 00:00:00 để so sánh ngày cho chuẩn
                today.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                if (today > endDate) {
                    console.log(`[Auto-Complete] Student ${username} finished class. Updating to COMPLETED.`);

                    // Update DB ngay lập tức
                    await conn.query(`UPDATE students SET status = 'COMPLETED' WHERE id = ?`, [studentId]);

                    // Update status trong biến tạm để logic bên dưới biết là đã hết học
                    student.status = 'COMPLETED';
                }
            }
        }

        // BƯỚC 3: Nếu sau khi check mà Status đã là COMPLETED (hoặc NEW/DROPPED)
        // -> Trả về lịch trống luôn, không cần query nữa
        if (student.status !== 'ACTIVE') {
            return res.json({
                success: true,
                schedule: [],
                message: "Khoá học đã kết thúc hoặc chưa bắt đầu."
            });
        }

        // BƯỚC 4: Nếu vẫn ACTIVE -> Lấy lịch học bình thường
        const sql = `
            SELECT 
                cs.scheduled_at, 
                cs.meta, 
                c.name as class_name,
                c.level
            FROM class_students cst
            JOIN class_schedules cs ON cst.class_id = cs.class_id
            JOIN classes c ON c.id = cst.class_id
            WHERE cst.student_id = ? 
              AND cst.status = 'ACTIVE'
              AND cs.scheduled_at >= CURDATE()
            ORDER BY cs.scheduled_at ASC
        `;

        const [rows] = await conn.query(sql, [studentId]);

        // Format dữ liệu trả về cho Frontend
        const schedule = rows.map(row => {
            let meta = {};
            try { meta = JSON.parse(row.meta || '{}'); } catch (e) {}

            const tStart = meta.start ? meta.start.slice(0, 5) : '00:00';
            const tEnd = meta.end ? meta.end.slice(0, 5) : '00:00';

            return {
                date: row.scheduled_at,
                timeStart: tStart,
                timeEnd: tEnd,
                room: meta.room || 'Chưa xếp',
                className: row.class_name,
                level: row.level
            };
        });

        res.json({ success: true, schedule: schedule });

    } catch (err) {
        console.error("Lỗi lấy lịch:", err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        if (conn) conn.release();
    }
});


module.exports = router;