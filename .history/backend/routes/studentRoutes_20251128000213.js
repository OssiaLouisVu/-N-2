// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// Sửa path này cho đúng với file kết nối DB của bạn
// Ví dụ nếu bạn đang dùng backend/db.js thì require("../db");
const db = require("../db");

// POST /api/staff/students
// Body: { fullName, phone, email, level, note, username, password }
router.post("/staff/students", async(req, res) => {
    try {
        const {
            fullName,
            phone,
            email,
            level,
            note,
            username,
            password,
        } = req.body;

        if (!fullName || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "fullName, username, password là bắt buộc",
            });
        }

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // 1. Kiểm tra trùng username
            const [userRows] = await conn.query(
                "SELECT id FROM users WHERE username = ?", [username]
            );
            if (userRows.length > 0) {
                await conn.rollback();
                return res
                    .status(409)
                    .json({ success: false, message: "Username đã tồn tại" });
            }

            // 2. Thêm học viên vào bảng students
            const [studentResult] = await conn.query(
                `INSERT INTO students (full_name, phone, email, level, note)
         VALUES (?, ?, ?, ?, ?)`, [fullName, phone || null, email || null, level || null, note || null]
            );
            const studentId = studentResult.insertId;

            // TODO: nếu sau này dùng bcrypt thì hash password trước khi insert
            // const hash = await bcrypt.hash(password, 10);

            // 3. Thêm tài khoản user với role = STUDENT
            const [userResult2] = await conn.query(
                `INSERT INTO users (username, password, role, student_id)
         VALUES (?, ?, 'STUDENT', ?)`, [username, password, studentId]
            );

            await conn.commit();

            return res.json({
                success: true,
                message: "Tạo học viên & tài khoản thành công",
                data: {
                    studentId,
                    userId: userResult2.insertId,
                },
            });
        } catch (err) {
            await conn.rollback();
            console.error("Error in /staff/students:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi tạo học viên",
                error: err.message,
            });
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error("Error (outer) in /staff/students:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: err.message,
        });
    }
});

module.exports = router;