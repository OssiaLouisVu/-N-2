// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ======================= LIST + SEARCH =======================
// ?keyword=...   : tìm theo tên, sđt, email, username
// ?status=NEW    : lọc theo trạng thái (NEW/ACTIVE/COMPLETED/...)
router.get("/", (req, res) => {
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

    // lọc theo status nếu truyền
    if (status && status.trim() !== "") {
        sql += " AND s.status = ?";
        params.push(status.trim());
    }

    // tìm kiếm từ khoá
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

// ======================= HỌC VIÊN ĐÃ HỌC =======================
// status = COMPLETED + thống kê số lần thi thử, điểm TB
router.get("/completed", (req, res) => {
    const { keyword } = req.query;

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
      u.username,
      COUNT(r.id)  AS total_exams,
      AVG(r.score) AS avg_score
    FROM students s
    LEFT JOIN users u 
      ON u.student_id = s.id AND u.role = 'STUDENT'
    LEFT JOIN mock_exam_results r
      ON r.username = u.username
    WHERE s.status = 'COMPLETED'
  `;

    const params = [];

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

    sql += `
    GROUP BY
      s.id, s.full_name, s.phone, s.email, s.level,
      s.note, s.status, s.created_at, u.username
    ORDER BY s.id DESC
    LIMIT 200
  `;

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn students COMPLETED:", err);
            return res
                .status(500)
                .json({ message: "Lỗi khi lấy danh sách học viên đã học" });
        }

        res.json(results);
    });
});

// ======================= UPDATE THÔNG TIN + STATUS =======================
// Cho phép sửa full_name, phone, email, level, note, status
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { full_name, phone, email, level, note, status } = req.body;

    const sql = `
    UPDATE students
    SET full_name = ?, 
        phone     = ?, 
        email     = ?, 
        level     = ?, 
        note      = ?,
        status    = COALESCE(?, status)
    WHERE id = ?
  `;
    const params = [
        full_name || "",
        phone || "",
        email || "",
        level || "",
        note || "",
        status || null, // nếu không gửi lên thì giữ nguyên status cũ
        id,
    ];

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

// ======================= CHỈ ĐỔI STATUS (DÙNG SAU NÀY) =======================
// Ví dụ sau này khi: thêm lịch học -> gọi API này để chuyển NEW -> ACTIVE
// hoặc kết thúc lớp học -> chuyển ACTIVE -> COMPLETED
router.patch("/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Thiếu status" });
    }

    const sql = "UPDATE students SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error("Lỗi cập nhật trạng thái học viên:", err);
            return res
                .status(500)
                .json({ message: "Lỗi khi cập nhật trạng thái học viên" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy học viên" });
        }

        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    });
});

module.exports = router;