// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// 1) POST /api/staff/students
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

            // Kiểm tra trùng username
            const [userRows] = await conn.query(
                "SELECT id FROM users WHERE username = ?", [username]
            );
            if (userRows.length > 0) {
                await conn.rollback();
                return res
                    .status(409)
                    .json({ success: false, message: "Username đã tồn tại" });
            }

            // Thêm học viên
            const [studentResult] = await conn.query(
                `INSERT INTO students (full_name, phone, email, level, note)
         VALUES (?, ?, ?, ?, ?)`, [fullName, phone || null, email || null, level || null, note || null]
            );
            const studentId = studentResult.insertId;

            // TODO: sau này hash mật khẩu bằng bcrypt
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

// 2) GET /api/staff/students?keyword=...
// Tìm kiếm học viên
router.get("/staff/students/search", async(req, res) => {
    const { keyword = "" } = req.query;
    const conn = await db.getConnection();
    try {
        const kw = `%${keyword}%`;
        const [rows] = await conn.query(
            `SELECT s.id,
              s.full_name,
              s.phone,
              s.email,
              s.level,
              s.note,
              u.username
       FROM students s
       LEFT JOIN users u ON u.student_id = s.id
       WHERE s.full_name LIKE ?
          OR s.phone LIKE ?
          OR s.email LIKE ?
          OR s.level LIKE ?
       ORDER BY s.id DESC
       LIMIT 50`, [kw, kw, kw, kw]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Error in GET /staff/students/search:", err);
        res.status(500).json({ success: false, message: "Lỗi tìm kiếm", error: err.message });
    } finally {
        conn.release();
    }
});

// Cập nhật thông tin học viên
router.put("/staff/students/:id", async(req, res) => {
    const { id } = req.params;
    const { fullName, phone, email, level, note } = req.body;
    const conn = await db.getConnection();

    try {
        await conn.query(
            `UPDATE students
       SET full_name = ?,
           phone = ?,
           email = ?,
           level = ?,
           note = ?
       WHERE id = ?`, [fullName, phone || null, email || null, level || null, note || null, id]
        );
        res.json({ success: true, message: "Cập nhật học viên thành công" });
    } catch (err) {
        console.error("Error in PUT /staff/students/:id:", err);
        res.status(500).json({ success: false, message: "Lỗi cập nhật", error: err.message });
    } finally {
        conn.release();
    }
});


// 3) PUT /api/staff/students/:id
router.put("/staff/students/:id", async(req, res) => {
    try {
        const studentId = req.params.id;
        const { fullName, phone, email, level, note } = req.body;

        if (!fullName) {
            return res.status(400).json({
                success: false,
                message: "fullName là bắt buộc khi cập nhật",
            });
        }

        await db.query(
            `
      UPDATE students
      SET full_name = ?, phone = ?, email = ?, level = ?, note = ?
      WHERE id = ?
    `, [fullName, phone || null, email || null, level || null, note || null, studentId]
        );

        return res.json({
            success: true,
            message: "Cập nhật thông tin học viên thành công",
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