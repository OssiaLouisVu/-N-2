// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // cùng thư mục với server.js

/**
 * Helper: build câu WHERE theo keyword + status
 */
function buildWhereClause(keyword, status, params) {
    const where = [];

    if (keyword) {
        where.push(
            "(s.full_name LIKE ? OR s.phone LIKE ? OR s.email LIKE ?)"
        );
        const kw = `%${keyword}%`;
        params.push(kw, kw, kw);
    }

    if (status) {
        where.push("s.status = ?");
        params.push(status);
    }

    if (where.length === 0) return "";
    return "WHERE " + where.join(" AND ");
}

/**
 * GET /api/students
 * Lấy danh sách học viên (có thể filter theo keyword + status)
 * Ví dụ:
 *   /api/students?status=NEW
 *   /api/students?keyword=Nguyen&status=ACTIVE
 */
router.get("/", async(req, res) => {
    const { keyword, status } = req.query;

    let params = [];
    const whereSql = buildWhereClause(keyword, status, params);

    const sql = `
    SELECT
      s.id,
      s.full_name,
      s.phone,
      s.email,
      s.level,
      s.status,
      s.note,
      DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
      DATE_FORMAT(s.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
    FROM students s
    ${whereSql}
    ORDER BY s.created_at DESC
  `;

    try {
        const [rows] = await db.execute(sql, params);
        res.json({ success: true, students: rows });
    } catch (err) {
        console.error("GET /api/students error:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách học viên." });
    }
});

/**
 * POST /api/students
 * Tạo mới học viên (thường status = NEW)
 */
router.post("/", async(req, res) => {
    // chấp nhận cả full_name hoặc fullName từ frontend
    const fullName = req.body.full_name || req.body.fullName;
    const phone = req.body.phone || null;
    const email = req.body.email || null;
    const level = req.body.level || null;
    const note = req.body.note || null;
    const status = req.body.status || "NEW";

    if (!fullName || fullName.trim() === "") {
        return res.json({ success: false, message: "Họ tên học viên là bắt buộc." });
    }

    const sql = `
    INSERT INTO students (full_name, phone, email, level, note, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    const params = [fullName.trim(), phone, email, level, note, status];

    try {
        const [result] = await db.execute(sql, params);
        res.json({
            success: true,
            message: "Đã lưu thông tin học viên (mới đăng ký).",
            id: result.insertId,
        });
    } catch (err) {
        console.error("POST /api/students error:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi lưu học viên." });
    }
});

/**
 * PUT /api/students/:id
 * Cập nhật thông tin học viên (dùng cho form sửa)
 */
router.put("/:id", async(req, res) => {
    const { id } = req.params;

    const fullName = req.body.full_name || req.body.fullName;
    const phone = req.body.phone || null;
    const email = req.body.email || null;
    const level = req.body.level || null;
    const note = req.body.note || null;
    const status = req.body.status || "NEW";

    if (!fullName || fullName.trim() === "") {
        return res.json({ success: false, message: "Họ tên học viên là bắt buộc." });
    }

    const sql = `
    UPDATE students
    SET full_name = ?, phone = ?, email = ?, level = ?, note = ?, status = ?
    WHERE id = ?
  `;
    const params = [fullName.trim(), phone, email, level, note, status, id];

    try {
        const [result] = await db.execute(sql, params);
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Không tìm thấy học viên để cập nhật." });
        }
        res.json({
            success: true,
            message: "Đã cập nhật thông tin học viên.",
        });
    } catch (err) {
        console.error("PUT /api/students/:id error:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật học viên." });
    }
});

/**
 * GET /api/students/ongoing
 * Lấy học viên đang học (status = ACTIVE)
 */
router.get("/ongoing/list", async(req, res) => {
    const sql = `
    SELECT
      s.id,
      s.full_name,
      s.phone,
      s.email,
      s.level,
      s.status
    FROM students s
    WHERE s.status = 'ACTIVE'
    ORDER BY s.created_at DESC
  `;
    try {
        const [rows] = await db.execute(sql);
        res.json({ success: true, students: rows });
    } catch (err) {
        console.error("GET /api/students/ongoing/list error:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy học viên đang học." });
    }
});

/**
 * GET /api/students/completed/list
 * Lấy học viên đã học (status = COMPLETED)
 */
router.get("/completed/list", async(req, res) => {
    const sql = `
    SELECT
      s.id,
      s.full_name,
      s.phone,
      s.email,
      s.level,
      s.status
    FROM students s
    WHERE s.status = 'COMPLETED'
    ORDER BY s.created_at DESC
  `;
    try {
        const [rows] = await db.execute(sql);
        res.json({ success: true, students: rows });
    } catch (err) {
        console.error("GET /api/students/completed/list error:", err);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy học viên đã học." });
    }
});

module.exports = router;