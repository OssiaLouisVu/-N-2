// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// Kết nối DB dùng chung (mysql2.promise)
const db = require("../db");

/**
 * GET /api/students
 * Lấy danh sách học viên, có hỗ trợ tìm kiếm theo:
 * - full_name
 * - phone
 * - email
 * - username (bảng users, role = 'STUDENT')
 */
router.get("/", async(req, res) => {
    const { keyword } = req.query;

    let sql = `
    SELECT 
      s.id,
      s.full_name,
      s.phone,
      s.email,
      s.level,
      s.note,
      DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
      u.username
    FROM students s
    LEFT JOIN users u 
      ON u.student_id = s.id AND u.role = 'STUDENT'
  `;

    const params = [];

    if (keyword && keyword.trim() !== "") {
        const kw = `%${keyword.trim()}%`;
        sql += `
      WHERE 
        s.full_name LIKE ? 
        OR s.phone LIKE ? 
        OR s.email LIKE ? 
        OR u.username LIKE ?
    `;
        params.push(kw, kw, kw, kw);
    }

    sql += " ORDER BY s.id DESC LIMIT 200";

    try {
        const [rows] = await db.execute(sql, params);
        return res.json(rows);
    } catch (err) {
        console.error("Lỗi truy vấn students:", err);
        return res
            .status(500)
            .json({ message: "Lỗi khi lấy danh sách học viên" });
    }
});

/**
 * PUT /api/students/:id
 * Cập nhật thông tin cơ bản của học viên
 */
router.put("/:id", async(req, res) => {
    const { id } = req.params;
    const { full_name, phone, email, level, note } = req.body;

    const sql = `
    UPDATE students
    SET full_name = ?, phone = ?, email = ?, level = ?, note = ?
    WHERE id = ?
  `;
    const params = [
        full_name || "",
        phone || "",
        email || "",
        level || "",
        note || "",
        id,
    ];

    try {
        const [result] = await db.execute(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy học viên" });
        }

        return res.json({
            success: true,
            message: "Cập nhật học viên thành công",
        });
    } catch (err) {
        console.error("Lỗi update student:", err);
        return res
            .status(500)
            .json({ message: "Lỗi khi cập nhật thông tin học viên" });
    }
});

module.exports = router;