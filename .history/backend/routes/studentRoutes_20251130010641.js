// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // connection pool mysql2
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// create a mail transporter using env vars (server.js loads dotenv)
const mailTransporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

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
        console.error('Error sending credentials email:', err && err.message ? err.message : err);
        return { sent: false, message: err && err.message ? err.message : String(err) };
    }
}

/**
 * GET /api/students
 * Query:
 *   - status: NEW | ACTIVE | COMPLETED (tuỳ chọn)
 *   - keyword: tìm theo tên / sđt / email (tuỳ chọn)
 */
router.get("/", async(req, res) => {
    const { status, keyword } = req.query;

    let sql = `
    SELECT
      s.id,
      s.full_name,
      s.phone,
      s.email,
      s.level,
      s.note,
      s.status,
      s.created_at,
      s.updated_at
    FROM students s
    WHERE 1 = 1
  `;
    const params = [];

    if (status) {
        sql += " AND s.status = ? ";
        params.push(status);
    }

    if (keyword && keyword.trim() !== "") {
        const kw = `%${keyword.trim()}%`;
        sql += " AND (s.full_name LIKE ? OR s.phone LIKE ? OR s.email LIKE ?)";
        params.push(kw, kw, kw);
    }

    sql += " ORDER BY s.created_at DESC";

    try {
        const [rows] = await db.query(sql, params);
        return res.json({ success: true, students: rows });
    } catch (err) {
        console.error("Error SELECT students:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách học viên.",
        });
    }
});

/**
 * POST /api/students
 * Body: { full_name, phone, email, level, note, status }
 * status mặc định 'NEW' nếu không truyền.
 */
router.post("/", async (req, res) => {
    const { id: providedId, full_name, phone, email, level, note, status } = req.body;

    if (!full_name || !phone) {
        return res.status(400).json({
            success: false,
            message: "Họ tên và SĐT là bắt buộc.",
        });
    }

    let conn;
    try {
            conn = await db.getConnection();
            await conn.beginTransaction();

            let studentId;

            if (providedId !== undefined && providedId !== null && String(providedId).trim() !== '') {
                // Client provided an explicit id. Ensure it doesn't exist yet.
                const pid = Number(providedId);
                if (!Number.isInteger(pid) || pid <= 0) {
                    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
                }
                const [existing] = await conn.query('SELECT id FROM students WHERE id = ?', [pid]);
                if (existing.length > 0) {
                    return res.status(400).json({ success: false, message: 'ID đã tồn tại, vui lòng chọn ID khác' });
                }

                const insertSql = `
                    INSERT INTO students (id, full_name, phone, email, level, note, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;
                const params = [pid, full_name, phone, email || null, level || null, note || null, status || 'NEW'];
                await conn.query(insertSql, params);
                studentId = pid;
            } else {
                const insertSql = `
                    INSERT INTO students (full_name, phone, email, level, note, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;
                const params = [full_name, phone, email || null, level || null, note || null, status || 'NEW'];
                const [result] = await conn.query(insertSql, params);
                studentId = result.insertId;
            }

            // Create login account automatically: username = student<id>, password = 'pass1234'
            const username = `student${studentId}`;
            const tempPassword = 'pass1234';
            const hashed = await bcrypt.hash(tempPassword, 10);

            await conn.query(
                'INSERT INTO users (username, password, role, student_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
                [username, hashed, 'STUDENT', studentId]
            );

        await conn.commit();

        // After commit, attempt to send credentials email (if email provided)
        let emailResult = { sent: false, message: 'No email' };
        try {
            emailResult = await sendCredentialsEmail({
                to: email || null,
                fullName: full_name,
                username,
                tempPassword,
            });
        } catch (e) {
            console.error('Unexpected error when sending credentials email:', e);
            emailResult = { sent: false, message: e && e.message ? e.message : String(e) };
        }

        return res.json({
            success: true,
            message: 'Đã lưu thông tin học viên và tạo tài khoản.',
            id: studentId,
            username,
            tempPassword,
            email: email || null,
            emailResult,
        });
        } catch (err) {
            if (conn) await conn.rollback();
            console.error('Error INSERT student and create user:', err);
            return res.status(500).json({ success: false, message: 'Lỗi server khi thêm học viên.' });
        } finally {
            if (conn) conn.release && conn.release();
        }
});

/**
 * PUT /api/students/:id
 * Body cho phép truyền 1 phần:
 *   { full_name?, phone?, email?, level?, note?, status? }
 * Chỉ update các field có trong body.
 */
router.put("/:id", async(req, res) => {
    const studentId = req.params.id;
    const { full_name, phone, email, level, note, status } = req.body;

    const fields = [];
    const params = [];

    if (full_name !== undefined) {
        fields.push("full_name = ?");
        params.push(full_name);
    }
    if (phone !== undefined) {
        fields.push("phone = ?");
        params.push(phone);
    }
    if (email !== undefined) {
        fields.push("email = ?");
        params.push(email);
    }
    if (level !== undefined) {
        fields.push("level = ?");
        params.push(level);
    }
    if (note !== undefined) {
        fields.push("note = ?");
        params.push(note);
    }
    if (status !== undefined) {
        fields.push("status = ?");
        params.push(status);
    }

    if (fields.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Không có trường nào để cập nhật.",
        });
    }

    const sql = `
    UPDATE students
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = ?
  `;
    params.push(studentId);

    try {
        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy học viên để cập nhật.",
            });
        }

        return res.json({
            success: true,
            message: "Đã cập nhật thông tin học viên.",
        });
    } catch (err) {
        console.error("Error UPDATE student:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật học viên.",
        });
    }
});

module.exports = router;