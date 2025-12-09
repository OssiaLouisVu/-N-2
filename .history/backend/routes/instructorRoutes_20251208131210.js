// backend/routes/instructorRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Create mail transporter
const mailTransporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

/**
 * Gửi email thông tin tài khoản cho giảng viên
 */
async function sendCredentialsEmail({ to, fullName, username, tempPassword }) {
    if (!to) {
        console.log('No email provided for instructor, skipping sending credentials.');
        return { sent: false, message: 'No recipient email' };
    }

    const subject = `Tài khoản giảng viên - ${username}`;
    const text = `Xin chào ${fullName || ''},\n\n` +
        `Tài khoản giảng viên đã được tạo cho bạn:\n` +
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
 * GET /api/instructors
 * Query:
 *   - status: NEW | ACTIVE | INACTIVE | ON_LEAVE (tuỳ chọn)
 *   - keyword: tìm theo tên / sđt / email (tuỳ chọn)
 */
router.get("/", async(req, res) => {
    const { status, keyword } = req.query;

    let sql = `
        SELECT
            i.id,
            i.full_name,
            i.phone,
            i.email,
            i.specialization,
            i.level,
            i.experience_years,
            i.hourly_rate,
            i.status,
            i.note,
            i.created_at,
            i.updated_at,
            (SELECT COUNT(*) FROM class_teachers ct 
             INNER JOIN classes c ON ct.class_id = c.id 
             WHERE ct.teacher_id = i.id) as active_classes_count
        FROM instructors i
        WHERE 1 = 1
    `;
    const params = [];

    if (status) {
        sql += " AND i.status = ? ";
        params.push(status);
    }

    if (keyword && keyword.trim() !== "") {
        const kw = `%${keyword.trim()}%`;
        sql += " AND (i.full_name LIKE ? OR i.phone LIKE ? OR i.email LIKE ?)";
        params.push(kw, kw, kw);
    }

    sql += " ORDER BY i.created_at DESC";

    try {
        const [rows] = await db.query(sql, params);
        return res.json({ success: true, instructors: rows });
    } catch (err) {
        console.error("Error SELECT instructors:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách giảng viên.",
        });
    }
});

/**
 * GET /api/instructors/:id
 * Lấy chi tiết giảng viên
 */
router.get("/:id", async(req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT
                i.*,
                (SELECT COUNT(*) FROM class_teachers ct 
                 INNER JOIN classes c ON ct.class_id = c.id 
                 WHERE ct.teacher_id = i.id AND (c.end_date IS NULL OR c.end_date >= CURDATE())) as active_classes_count,
                (SELECT COUNT(*) FROM class_teachers ct 
                 WHERE ct.teacher_id = i.id) as total_classes_count
            FROM instructors i
            WHERE i.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giảng viên.",
            });
        }

        // Lấy lịch rảnh của giảng viên
        const [schedules] = await db.query(`
            SELECT * FROM instructor_schedules
            WHERE instructor_id = ? AND status = 'ACTIVE'
            ORDER BY day_of_week, time_start
        `, [id]);

        return res.json({
            success: true,
            instructor: {
                ...rows[0],
                schedules
            }
        });
    } catch (err) {
        console.error("Error SELECT instructor detail:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin giảng viên.",
        });
    }
});

/**
 * GET /api/instructors/:id/classes
 * Lấy danh sách lớp của giảng viên
 */
router.get("/:id/classes", async(req, res) => {
    const { id } = req.params;
    const { status } = req.query; // 'ACTIVE' | 'COMPLETED'

    let sql = `
        SELECT
            c.id,
            c.name,
            c.start_date,
            c.end_date,
            CASE 
                WHEN c.end_date IS NULL OR c.end_date >= CURDATE() THEN 'ACTIVE'
                ELSE 'COMPLETED'
            END as status,
            ct.role,
            ct.assigned_at,
            (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
        FROM class_teachers ct
        INNER JOIN classes c ON ct.class_id = c.id
        WHERE ct.teacher_id = ?
    `;
    const params = [id];

    if (status) {
        if (status === 'ACTIVE') {
            sql += " AND (c.end_date IS NULL OR c.end_date >= CURDATE())";
        } else if (status === 'COMPLETED') {
            sql += " AND c.end_date < CURDATE()";
        }
    }

    sql += " ORDER BY c.start_date DESC";

    try {
        const [rows] = await db.query(sql, params);
        return res.json({ success: true, classes: rows });
    } catch (err) {
        console.error("Error SELECT instructor classes:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách lớp của giảng viên.",
        });
    }
});

/**
 * POST /api/instructors
 * Body: { full_name, phone, email, specialization, level, experience_years, hourly_rate, bio, status, note }
 */
router.post("/", async(req, res) => {
    const {
        full_name,
        phone,
        email,
        date_of_birth,
        address,
        specialization,
        level,
        experience_years,
        bio,
        certifications,
        hourly_rate,
        payment_method,
        bank_account,
        bank_name,
        status,
        note
    } = req.body;

    // Log request
    console.log('[CREATE INSTRUCTOR] Request body:', {
        full_name,
        email,
        phone,
        specialization,
        level,
        experience_years,
        hourly_rate
    });

    if (!full_name || !email) {
        console.log('[CREATE INSTRUCTOR] Missing required fields');
        return res.status(400).json({
            success: false,
            message: "Họ tên và email là bắt buộc.",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
        console.log('[CREATE INSTRUCTOR] Invalid email format:', email);
        return res.status(400).json({
            success: false,
            message: "Email không hợp lệ. Vui lòng nhập email đúng định dạng.",
        });
    }

    // Validate phone if provided
    if (phone && !/^[0-9]{10,11}$/.test(String(phone).trim())) {
        console.log('[CREATE INSTRUCTOR] Invalid phone format:', phone);
        return res.status(400).json({
            success: false,
            message: "Số điện thoại phải có 10-11 chữ số.",
        });
    }

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // Check email exists
        const [existingEmail] = await conn.query(
            'SELECT id FROM instructors WHERE email = ?', [email]
        );
        if (existingEmail.length > 0) {
            await conn.rollback();
            console.log('[CREATE INSTRUCTOR] Email already exists:', email);
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại trong hệ thống.",
            });
        }

        // Insert instructor
        const insertSql = `
            INSERT INTO instructors (
                full_name, phone, email, date_of_birth, address,
                specialization, level, experience_years, bio, certifications,
                hourly_rate, payment_method, bank_account, bank_name,
                status, note, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const params = [
            full_name,
            phone || null,
            email,
            date_of_birth || null,
            address || null,
            specialization || null,
            level || null,
            experience_years || 0,
            bio || null,
            certifications || null,
            hourly_rate || 0,
            payment_method || 'cash',
            bank_account || null,
            bank_name || null,
            status || 'NEW',
            note || null
        ];
        const [result] = await conn.query(insertSql, params);
        const instructorId = result.insertId;

        console.log('[CREATE INSTRUCTOR] Instructor created with ID:', instructorId);

        // Create login account: username = instructor<id>, password = 'pass1234'
        const username = `instructor${instructorId}`;
        const tempPassword = 'pass1234';
        const hashed = await bcrypt.hash(tempPassword, 10);

        await conn.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashed, 'INSTRUCTOR']
        );

        console.log('[CREATE INSTRUCTOR] User account created:', username);

        // Update instructor with user_id
        const [userRows] = await conn.query(
            'SELECT id FROM users WHERE username = ?', [username]
        );
        if (userRows.length > 0) {
            await conn.query(
                'UPDATE instructors SET user_id = ? WHERE id = ?', [userRows[0].id, instructorId]
            );
        }

        await conn.commit();

        console.log('[CREATE INSTRUCTOR] Transaction committed successfully');

        // Send credentials email
        let emailResult = { sent: false, message: 'No email' };
        try {
            emailResult = await sendCredentialsEmail({
                to: email,
                fullName: full_name,
                username,
                tempPassword,
            });
            console.log('[CREATE INSTRUCTOR] Email send result:', emailResult);
        } catch (e) {
            console.error('[CREATE INSTRUCTOR] Unexpected error when sending credentials email:', e);
            emailResult = { sent: false, message: e && e.message ? e.message : String(e) };
        }

        return res.json({
            success: true,
            message: 'Đã lưu thông tin giảng viên và tạo tài khoản.',
            id: instructorId,
            username,
            tempPassword,
            email,
            emailResult,
        });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('[CREATE INSTRUCTOR] Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm giảng viên: ' + (err.message || String(err)),
        });
    } finally {
        if (conn) conn.release && conn.release();
    }
});

/**
 * PUT /api/instructors/:id
 * Cập nhật thông tin giảng viên
 */
router.put("/:id", async(req, res) => {
    const instructorId = req.params.id;
    const {
        full_name,
        phone,
        email,
        date_of_birth,
        address,
        specialization,
        level,
        experience_years,
        bio,
        certifications,
        hourly_rate,
        payment_method,
        bank_account,
        bank_name,
        status,
        note
    } = req.body;

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
    if (date_of_birth !== undefined) {
        fields.push("date_of_birth = ?");
        params.push(date_of_birth);
    }
    if (address !== undefined) {
        fields.push("address = ?");
        params.push(address);
    }
    if (specialization !== undefined) {
        fields.push("specialization = ?");
        params.push(specialization);
    }
    if (level !== undefined) {
        fields.push("level = ?");
        params.push(level);
    }
    if (experience_years !== undefined) {
        fields.push("experience_years = ?");
        params.push(experience_years);
    }
    if (bio !== undefined) {
        fields.push("bio = ?");
        params.push(bio);
    }
    if (certifications !== undefined) {
        fields.push("certifications = ?");
        params.push(certifications);
    }
    if (hourly_rate !== undefined) {
        fields.push("hourly_rate = ?");
        params.push(hourly_rate);
    }
    if (payment_method !== undefined) {
        fields.push("payment_method = ?");
        params.push(payment_method);
    }
    if (bank_account !== undefined) {
        fields.push("bank_account = ?");
        params.push(bank_account);
    }
    if (bank_name !== undefined) {
        fields.push("bank_name = ?");
        params.push(bank_name);
    }
    if (status !== undefined) {
        fields.push("status = ?");
        params.push(status);
    }
    if (note !== undefined) {
        fields.push("note = ?");
        params.push(note);
    }

    if (fields.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Không có trường nào để cập nhật.",
        });
    }

    const sql = `
        UPDATE instructors
        SET ${fields.join(", ")}, updated_at = NOW()
        WHERE id = ?
    `;
    params.push(instructorId);

    try {
        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giảng viên để cập nhật.",
            });
        }

        return res.json({
            success: true,
            message: "Đã cập nhật thông tin giảng viên.",
        });
    } catch (err) {
        console.error("Error UPDATE instructor:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật giảng viên.",
        });
    }
});

/**
 * DELETE /api/instructors/:id
 * Xóa giảng viên (soft delete hoặc hard delete tùy yêu cầu)
 */
router.delete("/:id", async(req, res) => {
    const instructorId = req.params.id;

    try {
        // Check if instructor is assigned to active classes
        const [activeClasses] = await db.query(`
            SELECT COUNT(*) as count
            FROM class_teachers ct
            INNER JOIN classes c ON ct.class_id = c.id
            WHERE ct.teacher_id = ? AND (c.end_date IS NULL OR c.end_date >= CURDATE())
        `, [instructorId]);

        if (activeClasses[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa giảng viên đang có lớp đang học.",
            });
        }

        // Delete instructor (cascade will handle related records)
        const [result] = await db.query("DELETE FROM instructors WHERE id = ?", [instructorId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giảng viên để xóa.",
            });
        }

        return res.json({
            success: true,
            message: "Đã xóa giảng viên.",
        });
    } catch (err) {
        console.error("Error DELETE instructor:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa giảng viên.",
        });
    }
});

/**
 * POST /api/instructors/:id/schedules
 * Thêm lịch rảnh cho giảng viên
 */
router.post("/:id/schedules", async(req, res) => {
    const instructorId = req.params.id;
    const { schedules } = req.body; // Array of {day_of_week, time_start, time_end, note}

    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp danh sách lịch rảnh.",
        });
    }

    try {
        // Delete old schedules
        await db.query("DELETE FROM instructor_schedules WHERE instructor_id = ?", [instructorId]);

        // Insert new schedules
        const values = schedules.map(s => [
            instructorId,
            s.day_of_week,
            s.time_start,
            s.time_end,
            s.note || null,
            'ACTIVE'
        ]);

        await db.query(
            `INSERT INTO instructor_schedules 
            (instructor_id, day_of_week, time_start, time_end, note, status) 
            VALUES ?`, [values]
        );

        return res.json({
            success: true,
            message: "Đã cập nhật lịch rảnh cho giảng viên.",
        });
    } catch (err) {
        console.error("Error INSERT instructor schedules:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật lịch rảnh.",
        });
    }
});

/**
 * GET /api/instructors/:id/statistics
 * Thống kê giảng viên
 */
router.get("/:id/statistics", async(req, res) => {
    const { id } = req.params;

    try {
        // Total classes taught
        const [totalClasses] = await db.query(`
            SELECT COUNT(*) as total
            FROM class_teachers
            WHERE teacher_id = ?
        `, [id]);

        // Active classes
        const [activeClasses] = await db.query(`
            SELECT COUNT(*) as total
            FROM class_teachers ct
            INNER JOIN classes c ON ct.class_id = c.id
            WHERE ct.teacher_id = ? AND (c.end_date IS NULL OR c.end_date >= CURDATE())
        `, [id]);

        // Completed classes
        const [completedClasses] = await db.query(`
            SELECT COUNT(*) as total
            FROM class_teachers ct
            INNER JOIN classes c ON ct.class_id = c.id
            WHERE ct.teacher_id = ? AND c.end_date < CURDATE()
        `, [id]);

        // Total students taught
        const [totalStudents] = await db.query(`
            SELECT COUNT(DISTINCT cs.student_id) as total
            FROM class_teachers ct
            INNER JOIN class_students cs ON ct.class_id = cs.class_id
            WHERE ct.teacher_id = ?
        `, [id]);

        return res.json({
            success: true,
            statistics: {
                total_classes: totalClasses[0].total,
                active_classes: activeClasses[0].total,
                completed_classes: completedClasses[0].total,
                total_students: totalStudents[0].total,
            }
        });
    } catch (err) {
        console.error("Error getting instructor statistics:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thống kê giảng viên.",
        });
    }
});

module.exports = router;