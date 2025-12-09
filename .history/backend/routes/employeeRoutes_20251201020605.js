const express = require("express");
const db = require("../db");
const router = express.Router();

// Lấy danh sách nhân viên
router.get("/", async (req, res) => {
  const { role, search } = req.query;
  let sql = "SELECT * FROM employees WHERE 1=1";
  const params = [];
  if (search) {
    sql += " AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += " ORDER BY id DESC";
  const [rows] = await db.execute(sql, params);
  res.json({ employees: rows });
});

// Thêm nhân viên mới
router.post("/", async (req, res) => {
  const { fullName, dob, gender, phone, email, address } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO employees (full_name, dob, gender, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)",
      [fullName, dob, gender, phone, email, address]
    );
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

// Cập nhật thông tin nhân viên
router.put("/:id", async (req, res) => {
  const { fullName, dob, gender, phone, email, address } = req.body;
  try {
    await db.execute(
      "UPDATE employees SET full_name=?, dob=?, gender=?, phone=?, email=?, address=? WHERE id=?",
      [fullName, dob, gender, phone, email, address, req.params.id]
    );
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

// API thống kê số buổi đi làm/nghỉ
router.get("/:id/attendance-summary", async (req, res) => {
  const employeeId = req.params.id;
  const [rows] = await db.execute(
    `SELECT status, COUNT(*) as count FROM attendance WHERE employee_id = ? GROUP BY status`,
    [employeeId]
  );
  // Mặc định 0 nếu không có
  const summary = { present: 0, leave: 0, sick: 0, absent: 0 };
  for (const r of rows) {
    summary[r.status] = r.count;
  }
  res.json(summary);
});

module.exports = router;
