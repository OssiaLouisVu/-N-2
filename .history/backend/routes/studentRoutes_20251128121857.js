// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // connection pool mysql2

/**
 * GET /api/students
 * Query:
 *   - status: NEW | ACTIVE | COMPLETED (tuỳ chọn)
 *   - keyword: tìm theo tên / sđt / email (tuỳ chọn)
 */
router.get("/", (req, res) => {
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

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error("Error SELECT students:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách học viên.",
            });
        }
        return res.json({ success: true, students: rows });
    });
});

/**
 * POST /api/students
 * Body: { full_name, phone, email, level, note, status }
 * status mặc định 'NEW' nếu không truyền.
 */
router.post("/", (req, res) => {
    const { full_name, phone, email, level, note, status } = req.body;

    if (!full_name || !phone) {
        return res.status(400).json({
            success: false,
            message: "Họ tên và SĐT là bắt buộc.",
        });
    }

    const sql = `
    INSERT INTO students (full_name, phone, email, level, note, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
    const params = [
        full_name,
        phone,
        email || null,
        level || null,
        note || null,
        status || "NEW",
    ];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error INSERT student:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi thêm học viên.",
            });
        }

        return res.json({
            success: true,
            message: "Đã lưu thông tin học viên.",
            id: result.insertId,
        });
    });
});

/**
 * PUT /api/students/:id
 * Body cho phép truyền 1 phần:
 *   { full_name?, phone?, email?, level?, note?, status? }
 * Chỉ update các field có trong body.
 */
router.put("/:id", (req, res) => {
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

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error UPDATE student:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi cập nhật học viên.",
            });
        }

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
    });
});

module.exports = router;