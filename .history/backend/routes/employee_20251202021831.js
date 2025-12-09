// DELETE /api/employees/:id - xóa nhân viên thật khỏi CSDL
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const conn = db;
  try {
    // Xóa user liên kết nếu có
    const [rows] = await conn.execute('SELECT user_id FROM employees WHERE id = ?', [id]);
    if (rows && rows.length && rows[0].user_id) {
      await conn.execute('DELETE FROM users WHERE id = ?', [rows[0].user_id]);
    }
    // Xóa nhân viên
    await conn.execute('DELETE FROM employees WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/employees?active=true|false|all&role=...&search=...
router.get("/", async (req, res) => {
  const { active = "true", role, search } = req.query;
  const where = [];
  const params = [];

  // active filter on employees
  if (active === "true") where.push("e.active = TRUE");
  else if (active === "false") where.push("e.active = FALSE");

  // role filter on users table (via LEFT JOIN)
  if (role && role !== "ALL") {
    where.push("(u.role = ?)");
    params.push(role);
  }

  if (search && search.trim()) {
    where.push("(e.full_name LIKE ? OR e.phone LIKE ? OR e.email LIKE ?)");
    const q = `%${search.trim()}%`;
    params.push(q, q, q);
  }

  let sql = `SELECT 
      e.id, e.full_name, e.dob, e.gender, e.phone, e.email, e.address, e.active, e.created_at, e.updated_at,
      u.username, u.role
    FROM employees e
    LEFT JOIN users u ON u.id = e.user_id`;
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY e.id DESC";

  try {
    const [rows] = await db.execute(sql, params);
    res.json({ success: true, employees: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/employees - create new employee
router.post("/", async (req, res) => {
  const { fullName, dob, gender, phone, email, address } = req.body || {};
  try {
    const [result] = await db.execute(
      `INSERT INTO employees (full_name, dob, gender, phone, email, address, active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [fullName || null, dob || null, gender || null, phone || null, email || null, address || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/employees/:id - update employee
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { fullName, dob, gender, phone, email, address } = req.body || {};
  try {
    await db.execute(
      `UPDATE employees SET full_name=?, dob=?, gender=?, phone=?, email=?, address=? WHERE id=?`,
      [fullName || null, dob || null, gender || null, phone || null, email || null, id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/employees/:id/deactivate - mark employee as resigned
router.put("/:id/deactivate", async (req, res) => {
  const id = req.params.id;
  const conn = db; // using pool/connection from db.js
  try {
    // Find linked user_id
    const [rows] = await conn.execute(`SELECT user_id FROM employees WHERE id = ?`, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
    }
    const userId = rows[0].user_id;

    // Delete user account if exists, then mark employee inactive and unlink
    if (userId) {
      await conn.execute(`DELETE FROM users WHERE id = ?`, [userId]);
    }
    await conn.execute(`UPDATE employees SET active = FALSE, user_id = NULL WHERE id = ?`, [id]);

    res.json({ success: true, message: "Đã cho nhân viên nghỉ việc và xoá tài khoản đăng nhập" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/employees/:id/attendance-summary
router.get("/:id/attendance-summary", async (req, res) => {
  const employeeId = req.params.id;
  try {
    const [rows] = await db.execute(
      `SELECT status, COUNT(*) AS cnt FROM attendance WHERE employee_id = ? GROUP BY status`,
      [employeeId]
    );
    const summary = { present: 0, leave: 0, sick: 0, absent: 0 };
    (rows || []).forEach((r) => {
      if (summary.hasOwnProperty(r.status)) summary[r.status] = Number(r.cnt) || 0;
    });
    res.json({ success: true, summary });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
