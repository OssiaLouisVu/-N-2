// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// Dùng chung kết nối DB như server.js
const db = require("../db");

/**
 * GET /api/students
 * ?keyword=...&status=NEW/ACTIVE/COMPLETED/...
 * Trả về danh sách học viên (dùng cho:
 * - Tìm kiếm & cập nhật thông tin học viên
 * - Học viên đang học (lọc status = ACTIVE)
 * - Học viên đã học (status = COMPLETED/INACTIVE)
 */
router.get("/", async(req, res) => {
    const { keyword = "", status = "" } = req.query;

    try {
        let sql = `
      SELECT
        s.id,
        s.full_name,
        s.phone,
        s.email,
        s.level,
        s.note,
        s.status,
        DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(s.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM students s
      WHERE 1 = 1
    `;
        const params = [];

        if (keyword) {
            sql += `
        AND (
          s.full_name LIKE ?
          OR s.phone LIKE ?
          OR s.email LIKE ?
        )
      `;
            const kw = `%${keyword}%`;
            params.push(kw, kw, kw);
        }

        if (status) {
            sql += " AND s.status = ?";
            params.push(status);
        }

        sql += " ORDER BY s.created_at DESC";

        const [rows] = await db.execute(sql, params);

        return res.json({
            success: true,
            students: rows,
        });
    } catch (err) {
        console.error("Lỗi GET /api/students:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách học viên",
        });
    }
});

/**
 * POST /api/students
 * Tạo mới học viên (use case: Học viên đăng ký mới)
 * Body: { fullName, phone, email, level, note, status? }
 * status mặc định: NEW
 */
router.post("/", async(req, res) => {
    const { fullName, phone, email, level, note, status } = req.body;

    if (!fullName) {
        return res.status(400).json({
            success: false,
            message: "Thiếu họ tên học viên",
        });
    }

    const finalStatus = status || "NEW";

    try {
        const [result] = await db.execute(
            `
      INSERT INTO students (full_name, phone, email, level, note, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [fullName, phone || null, email || null, level || null, note || null, finalStatus]
        );

        const [rows] = await db.execute(
            "SELECT * FROM students WHERE id = ?", [result.insertId]
        );

        return res.status(201).json({
            success: true,
            student: rows[0],
        });
    } catch (err) {
        console.error("Lỗi POST /api/students:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo học viên",
        });
    }
});

/**
 * PUT /api/students/:id
 * Cập nhật thông tin + trạng thái học viên
 * Body: { fullName, phone, email, level, note, status }
 */
router.put("/:id", async(req, res) => {
    const { id } = req.params;
    const { fullName, phone, email, level, note, status } = req.body;

    try {
        const [result] = await db.execute(
            `
      UPDATE students
      SET
        full_name = ?,
        phone = ?,
        email = ?,
        level = ?,
        note = ?,
        status = ?
      WHERE id = ?
    `, [
                fullName,
                phone || null,
                email || null,
                level || null,
                note || null,
                status || "NEW",
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy học viên để cập nhật",
            });
        }

        const [rows] = await db.execute(
            "SELECT * FROM students WHERE id = ?", [id]
        );

        return res.json({
            success: true,
            student: rows[0],
        });
    } catch (err) {
        console.error("Lỗi PUT /api/students/:id:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật học viên",
        });
    }
});

module.exports = router;