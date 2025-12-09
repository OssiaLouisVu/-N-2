// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// db.js đặt ở gốc backend: /backend/db.js
const db = require("../db");

// =========================
// GET /api/students
//   ?status=NEW|ACTIVE|COMPLETED (optional)
//   ?keyword=...
// Dùng chung cho: mới, đang học, đã học
// =========================
router.get("/", async(req, res) => {
    const { status, keyword } = req.query;

    let sql = `
    SELECT 
      s.id,
      s.full_name,
      s.phone,
      s.email,
      s.level,
      s.status,
      DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
      DATE_FORMAT(s.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
    FROM students s
    WHERE 1 = 1
  `;
    const params = [];

    // filter theo trạng thái nếu có
    if (status) {
        sql += " AND s.status = ? ";
        params.push(status);
    }

    // filter theo từ khóa nếu có
    if (keyword && keyword.trim() !== "") {
        const kw = `%${keyword.trim()}%`;
        sql += `
      AND (
        s.full_name LIKE ?
        OR s.phone LIKE ?
        OR s.email LIKE ?
      )
    `;
        params.push(kw, kw, kw);
    }

    sql += " ORDER BY s.created_at DESC";

    try {
        const [rows] = await db.query(sql, params);
        return res.json({ success: true, students: rows });
    } catch (err) {
        console.error("Error GET /api/students:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách học viên.",
        });
    }
});

// =========================
// POST /api/students
// Tạo học viên mới (status mặc định: NEW)
// =========================
router.post("/", async(req, res) => {
    const { full_name, phone, email, level, note, status } = req.body;

    if (!full_name || !phone) {
        return res.status(400).json({
            success: false,
            message: "Thiếu họ tên hoặc số điện thoại.",
        });
    }

    // Nếu không gửi status thì mặc định NEW
    const finalStatus = status || "NEW";

    const sql = `
    INSERT INTO students (full_name, phone, email, level, note, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    const params = [
        full_name.trim(),
        phone.trim(),
        email || null,
        level || null,
        note || null,
        finalStatus,
    ];

    try {
        const [result] = await db.query(sql, params);
        return res.json({
            success: true,
            message: "Đã tạo học viên mới.",
            id: result.insertId,
        });
    } catch (err) {
        console.error("Error POST /api/students:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo học viên mới.",
        });
    }
});

// =========================
// PUT /api/students/:id
// Cập nhật thông tin + TRẠNG THÁI (NEW / ACTIVE / COMPLETED)
// Dùng chung cho:
//  - Học viên mới (NEW) => sửa, chuyển sang ACTIVE
//  - Học viên đang học (ACTIVE) => sửa, chuyển sang COMPLETED
//  - Học viên đã học (COMPLETED) => sửa thông tin
// =========================
router.put("/:id", async(req, res) => {
    const { id } = req.params;
    const { full_name, phone, email, level, note, status } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Thiếu id học viên.",
        });
    }

    // kiểm soát giá trị status hợp lệ
    const allowedStatus = ["NEW", "ACTIVE", "COMPLETED"];
    let finalStatus = status;
    if (finalStatus && !allowedStatus.includes(finalStatus)) {
        return res.status(400).json({
            success: false,
            message: "Trạng thái học viên không hợp lệ.",
        });
    }

    const sql = `
    UPDATE students
    SET
      full_name = ?,
      phone = ?,
      email = ?,
      level = ?,
      note = ?,
      ${finalStatus ? "status = ?," : ""}
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

    const params = [
        full_name,
        phone,
        email || null,
        level || null,
        note || null,
    ];

    if (finalStatus) params.push(finalStatus);
    params.push(id);

    try {
        const [result] = await db.query(sql, params);
        return res.json({
            success: true,
            message: "Đã cập nhật thông tin học viên.",
            affectedRows: result.affectedRows,
        });
    } catch (err) {
        console.error("Error PUT /api/students/:id:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật học viên.",
        });
    }
});

module.exports = router;