// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// Nếu dự án của bạn dùng file khác cho kết nối DB
// thì sửa lại đường dẫn dưới cho đúng (vd: "../db" hoặc "../config/db")
const db = require("../config/db");

// Lấy danh sách học viên (kèm username nếu có), có hỗ trợ tìm kiếm
router.get("/", (req, res) => {
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

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn students:", err);
            return res
                .status(500)
                .json({ message: "Lỗi khi lấy danh sách học viên" });
        }

        res.json(results);
    });
});

// Cập nhật thông tin học viên
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { full_name, phone, email, level, note } = req.body;

    const sql = `
    UPDATE students
    SET full_name = ?, phone = ?, email = ?, level = ?, note = ?
    WHERE id = ?
  `;
    const params = [full_name || "", phone || "", email || "", level || "", note || "", id];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Lỗi update student:", err);
            return res
                .status(500)
                .json({ message: "Lỗi khi cập nhật thông tin học viên" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy học viên" });
        }

        res.json({ success: true, message: "Cập nhật học viên thành công" });
    });
});

module.exports = router;