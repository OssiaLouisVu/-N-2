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
 * Gửi email thông tin tài khoản cho giảng viên với link đổi mật khẩu
 */
async function sendCredentialsEmail({ to, fullName, username, tempPassword }) {
    if (!to) {
        console.log('No email provided for instructor, skipping sending credentials.');
        return { sent: false, message: 'No recipient email' };
    }

    const subject = `🎓 Chào mừng bạn đến với Trung tâm - Tài khoản giảng viên`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🎓 Chào mừng giảng viên mới!</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333;">Xin chào <strong>${fullName || 'bạn'}</strong>,</p>
                
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Chúc mừng bạn đã trở thành giảng viên của trung tâm! Tài khoản của bạn đã được tạo thành công.
                </p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                    <h3 style="margin-top: 0; color: #667eea;">📋 Thông tin đăng nhập</h3>
                    <p style="margin: 10px 0; color: #333;">
                        <strong>👤 Tên đăng nhập:</strong> <code style="background-color: #e9ecef; padding: 5px 10px; border-radius: 4px; font-size: 16px; color: #667eea;">${username}</code>
                    </p>
                    <p style="margin: 10px 0; color: #333;">
                        <strong>🔑 Mật khẩu tạm thời:</strong> <code style="background-color: #e9ecef; padding: 5px 10px; border-radius: 4px; font-size: 16px; color: #667eea;">${tempPassword}</code>
                    </p>
                </div>

                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        ⚠️ <strong>Quan trọng:</strong> Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu để bảo mật tài khoản.
                    </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173/login" 
                       style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                        🚀 Đăng nhập ngay
                    </a>
                </div>

                <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                    <h4 style="margin-top: 0; color: #2196f3;">💡 Hướng dẫn đổi mật khẩu</h4>
                    <ol style="color: #333; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                        <li>Đăng nhập với tài khoản và mật khẩu tạm thời ở trên</li>
                        <li>Click vào avatar/tên của bạn ở góc trên bên phải</li>
                        <li>Chọn "Đổi mật khẩu"</li>
                        <li>Nhập mật khẩu mới và xác nhận</li>
                    </ol>
                    <p style="margin: 15px 0 0 0; color: #555; font-size: 14px;">
                        💌 Hoặc bạn có thể <a href="http://localhost:5173/forgot-password" style="color: #2196f3; text-decoration: none; font-weight: bold;">đặt lại mật khẩu qua email</a> nếu cần.
                    </p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef;">
                    <p style="color: #666; font-size: 14px; margin: 5px 0;">
                        📞 Nếu cần hỗ trợ, vui lòng liên hệ quản lý hoặc bộ phận IT.
                    </p>
                    <p style="color: #666; font-size: 14px; margin: 5px 0;">
                        ✉️ Email này được gửi tự động, vui lòng không trả lời.
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p style="margin: 5px 0;">Trân trọng,</p>
                <p style="margin: 5px 0; font-weight: bold; color: #667eea;">Trung tâm Tiếng Anh</p>
                <p style="margin: 5px 0;">© 2025 All rights reserved.</p>
            </div>
        </div>
    `;

    try {
        await mailTransporter.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to,
            subject,
            html,
        });
        console.log(`✅ Sent welcome email with password reset link to ${to}`);
        return { sent: true };
    } catch (err) {
        console.error('❌ Error sending credentials email:', err && err.message ? err.message : err);
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
  WHEN c.start_date > CURDATE() THEN 'UPCOMING'
  WHEN c.start_date <= CURDATE()
       AND (c.end_date IS NULL OR c.end_date >= CURDATE())
       THEN 'ONGOING'
  WHEN c.end_date < CURDATE() THEN 'FINISHED'
END AS status

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
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashed, 'TEACHER']
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
 * Xóa giảng viên và vô hiệu hóa tài khoản đăng nhập
 */
router.delete("/:id", async(req, res) => {
    const instructorId = req.params.id;

    try {
        // 1. Lấy thông tin instructor để biết user_id
        const [instructors] = await db.query(
            "SELECT id, full_name, user_id FROM instructors WHERE id = ?", [instructorId]
        );

        if (instructors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giảng viên để xóa.",
            });
        }

        const instructor = instructors[0];

        // 2. Check if instructor is assigned to active classes
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

        // 3. Vô hiệu hóa tài khoản user (không cho đăng nhập nữa)
        if (instructor.user_id) {
            await db.query(
                "UPDATE users SET active = FALSE WHERE id = ?", [instructor.user_id]
            );
            console.log(`✅ Đã vô hiệu hóa tài khoản user_id=${instructor.user_id} của giảng viên ${instructor.full_name}`);
        }

        // 4. HARD DELETE: Xóa hẳn khỏi database
        const [result] = await db.query("DELETE FROM instructors WHERE id = ?", [instructorId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giảng viên để xóa.",
            });
        }

        console.log(`✅ Đã xóa giảng viên ID=${instructorId} (${instructor.full_name}) khỏi database`);

        return res.json({
            success: true,
            message: "Đã xóa giảng viên và vô hiệu hóa tài khoản đăng nhập.",
        });
    } catch (err) {
        console.error("❌ Error DELETE instructor:", err);
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
// Xoá toàn bộ dữ liệu giảng viên demo (không xoá schema, chỉ xoá record)
router.delete('/cleanup-demo-data', async(req, res) => {
    try {
        // Xoá trước các bản ghi liên kết để tránh lỗi khoá ngoại
        await db.query('DELETE FROM class_teachers'); // phân công lớp cho giảng viên

        // Xoá user role INSTRUCTOR
        await db.query('DELETE FROM users WHERE role = "INSTRUCTOR"');

        // Xoá giảng viên
        await db.query('DELETE FROM instructors');

        return res.json({
            success: true,
            message: 'Đã xoá toàn bộ dữ liệu giảng viên và phân công lớp giảng viên.',
        });
    } catch (err) {
        console.error('Error cleanup instructors demo data:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xoá dữ liệu giảng viên.',
        });
    }
});

module.exports = router;