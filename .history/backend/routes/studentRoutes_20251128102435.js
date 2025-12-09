// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// Gọi đúng file db.js ở gốc backend (giống server.js)
const db = require("../db");

// ==============================================
// Lấy danh sách học viên (có tìm kiếm + status)
// GET /api/students?keyword=...&status=ACTIVE
// ==============================================
router.get("/", async(req, res) => {
    const { keyword, status } = req.query;

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
      u.username
    FROM students s
    LEFT JOIN users u 
      ON u.student_id = s.id AND u.role = 'STUDENT'
    WHERE 1 = 1
  `;
    const params = [];

    // Tìm theo tên / sđt / email / username
    if (keyword && keyword.trim() !== "") {
        const kw = `%${keyword.trim()}%`;
        sql += `
      AND (
        s.full_name LIKE ?
        OR s.phone LIKE ?
        OR s.email LIKE ?
        OR u.username LIKE ?
      )
    `;
        params.push(kw, kw, kw, kw);
    }

    // Lọc theo trạng thái nếu có
    if (status && ["NEW", "ACTIVE", "COMPLETED", "INACTIVE"].includes(status)) {
        sql += " AND s.status = ?";
        params.push(status);
    }

    sql += " ORDER BY s.id DESC LIMIT 200";

    try {
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Lỗi truy vấn students:", err);
        res.status(500).json({ message: "Lỗi khi lấy danh sách học viên" });
    }
});

// ==================================================
// Lấy danh sách học viên đã học xong (COMPLETED)
// GET /api/students/completed/list
// ==================================================
router.get("/completed/list", async(req, res) => {
    try {
        const [rows] = await db.execute(
            `
      SELECT 
        s.id,
        s.full_name,
        s.phone,
        s.email,
        s.level,
        s.note,
        s.status,
        DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        u.username
      FROM students s
      LEFT JOIN users u 
        ON u.student_id = s.id AND u.role = 'STUDENT'
      WHERE s.status = 'COMPLETED'
      ORDER BY s.id DESC
      LIMIT 200
    `
        );
        res.json(rows);
    } catch (err) {
        console.error("Lỗi /students/completed/list:", err);
        res.status(500).json({ message: "Lỗi khi lấy học viên đã học" });
    }
});

// ==============================================
// Cập nhật thông tin học viên
// PUT /api/students/:id
// ==============================================
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

        res.json({ success: true, message: "Cập nhật học viên thành công" });
    } catch (err) {
        console.error("Lỗi update student:", err);
        res.status(500).json({ message: "Lỗi khi cập nhật thông tin học viên" });
    }
});

// ==============================================
// Cập nhật trạng thái học viên (NEW / ACTIVE / COMPLETED / INACTIVE)
// PATCH /api/students/:id/status
// ==============================================
router.patch("/:id/status", async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["NEW", "ACTIVE", "COMPLETED", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    try {
        const [result] = await db.execute(
            "UPDATE students SET status = ? WHERE id = ?", [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy học viên" });
        }

        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (err) {
        console.error("Lỗi PATCH /students/:id/status:", err);
        res.status(500).json({ message: "Lỗi khi cập nhật trạng thái học viên" });
    }
});

module.exports = router;