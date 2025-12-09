const express = require("express");
const db = require("../db");
const router = express.Router();

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

// GET /api/employees?active=true|false|all&role=...&search=...
router.get("/", async (req, res) => {
  const { active = "true", role, search } = req.query;
  const where = [];
  const params = [];

  // active filter on employees
  if (active === "true") where.push("e.active = TRUE");
  else if (active === "false") where.push("e.active = FALSE");

  // role filter: match either users.role or employees.role
  if (role && role !== "ALL") {
    where.push("(COALESCE(u.role, e.role) = ?)");
    params.push(role);
  }

  if (search && search.trim()) {
    where.push("(e.full_name LIKE ? OR e.phone LIKE ? OR e.email LIKE ?)");
    const q = `%${search.trim()}%`;
    params.push(q, q, q);
  }

  const sqlWithEmployeeRole = `SELECT 
      e.id, e.full_name, e.dob, e.gender, e.phone, e.email, e.address, e.role AS employee_role, e.active, e.created_at, e.updated_at,
      u.username, COALESCE(u.role, e.role) AS role
    FROM employees e
    LEFT JOIN users u ON u.id = e.user_id` + (where.length ? " WHERE " + where.join(" AND ") : "") + " ORDER BY e.id DESC";

  const sqlWithoutEmployeeRole = `SELECT 
      e.id, e.full_name, e.dob, e.gender, e.phone, e.email, e.address, e.active, e.created_at, e.updated_at,
      u.username, u.role
    FROM employees e
    LEFT JOIN users u ON u.id = e.user_id` + (where.length ? " WHERE " + where.join(" AND ") : "") + " ORDER BY e.id DESC";

  try {
    const [rows] = await db.execute(sqlWithEmployeeRole, params);
    return res.json({ success: true, employees: rows });
  } catch (e) {
    // Fallback when employees.role column doesn't exist
    if (String(e.message || '').includes('Unknown column') && String(e.message).includes('e.role')) {
      try {
        const [rows2] = await db.execute(sqlWithoutEmployeeRole, params);
        return res.json({ success: true, employees: rows2 });
      } catch (e2) {
        return res.status(500).json({ success: false, message: e2.message });
      }
    }
    return res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/employees - create new employee
router.post("/", async (req, res) => {
  const { fullName, dob, gender, phone, email, address, role } = req.body || {};
  try {
    // Check if role column exists by attempting insert with it; fallback if not
    try {
      const [result] = await db.execute(
        `INSERT INTO employees (full_name, dob, gender, phone, email, address, role, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [fullName || null, dob || null, gender || null, phone || null, email || null, address || null, role || null]
      );
      return res.json({ success: true, id: result.insertId });
    } catch (err) {
      // If role column doesn't exist, insert without it
      if (String(err.message || '').includes('Unknown column') && String(err.message).includes('role')) {
        const [result] = await db.execute(
          `INSERT INTO employees (full_name, dob, gender, phone, email, address, active)
           VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
          [fullName || null, dob || null, gender || null, phone || null, email || null, address || null]
        );
        return res.json({ success: true, id: result.insertId });
      }
      throw err;
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/employees/:id - update employee
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { fullName, dob, gender, phone, email, address, role } = req.body || {};
  try {
    // 1) Cập nhật thông tin nhân viên
    const dobVal = (dob === '' || dob === undefined) ? null : dob;
    
    // Try with role column first, fallback if column doesn't exist
    try {
      await db.execute(
        `UPDATE employees SET full_name=?, dob=?, gender=?, phone=?, email=?, address=?, role=? WHERE id=?`,
        [fullName || null, dobVal, gender || null, phone || null, email || null, address || null, role || null, id]
      );
    } catch (err) {
      if (String(err.message || '').includes('Unknown column') && String(err.message).includes('role')) {
        await db.execute(
          `UPDATE employees SET full_name=?, dob=?, gender=?, phone=?, email=?, address=? WHERE id=?`,
          [fullName || null, dobVal, gender || null, phone || null, email || null, address || null, id]
        );
      } else {
        throw err;
      }
    }

    // 2) Nếu có truyền vai trò và nhân viên có tài khoản liên kết, cập nhật role ở bảng users
    if (role) {
      const [rows] = await db.execute(`SELECT user_id FROM employees WHERE id = ?`, [id]);
      if (rows && rows.length && rows[0].user_id) {
        await db.execute(`UPDATE users SET role = ? WHERE id = ?`, [role, rows[0].user_id]);
      }
    }

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
