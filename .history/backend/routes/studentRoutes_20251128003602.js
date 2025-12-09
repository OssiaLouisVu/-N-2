// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // pool mysql2

// ===============================
// 1) TẠO HỌC VIÊN + CẤP TÀI KHOẢN
// POST /api/staff/students
// Body: { fullName, phone, email, level, note, username, password }
// ===============================
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

            // 3. Thêm user với role STUDENT
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
            console.error("Error in POST /staff/students:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi tạo học viên",
                error: err.message,
            });
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error("Error (outer) in POST /staff/students:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: err.message,
        });
    }
});


// ===============================
// 2) TÌM KIẾM THÔNG TIN HỌC VIÊN
// GET /api/staff/students?keyword=...
// keyword: tìm theo tên / phone / email
// ===============================
router.get("/staff/students", async(req, res) => {
    const { keyword } = req.query;

    try {
        let sql =
            "SELECT id, full_name, phone, email, level, note FROM students";
        const params = [];

        if (keyword && keyword.trim()) {
            const kw = `%${keyword.trim()}%`;
            sql +=
                " WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR level LIKE ?";
            params.push(kw, kw, kw, kw);
        }

        const [rows] = await db.query(sql, params);

        return res.json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Error in GET /staff/students:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tìm kiếm học viên",
            error: err.message,
        });
    }
});


// ===============================
// 3) CẬP NHẬT THÔNG TIN HỌC VIÊN
// PUT /api/staff/students/:id
// Body: { fullName, phone, email, level, note }
// ===============================
router.put("/staff/students/:id", async(req, res) => {
    const { id } = req.params;
    const {
        fullName,
        phone,
        email,
        level,
        note,
    } = req.body;

    if (!fullName) {
        return res.status(400).json({
            success: false,
            message: "fullName là bắt buộc",
        });
    }

    try {
        const [result] = await db.query(
            `UPDATE students
       SET full_name = ?, phone = ?, email = ?, level = ?, note = ?
       WHERE id = ?`, [fullName, phone || null, email || null, level || null, note || null, id]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy học viên" });
        }

        return res.json({
            success: true,
            message: "Cập nhật học viên thành công",
        });
    } catch (err) {
        console.error("Error in PUT /staff/students/:id:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật học viên",
            error: err.message,
        });
    }
});

module.exports = router;