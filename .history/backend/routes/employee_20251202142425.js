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
    // 1) Tạo mã nhân viên tự động (NV0001, NV0002, ...)
    const [maxCode] = await db.execute(
      `SELECT employee_code FROM employees ORDER BY id DESC LIMIT 1`
    );
    let nextCode = 'NV0001';
    if (maxCode && maxCode.length > 0 && maxCode[0].employee_code) {
      const lastCode = maxCode[0].employee_code;
      const num = parseInt(lastCode.replace(/\D/g, '')) || 0;
      nextCode = `NV${String(num + 1).padStart(4, '0')}`;
    }

    // 2) Check if role and employee_code columns exist by attempting insert with them; fallback if not
    try {
      const [result] = await db.execute(
        `INSERT INTO employees (employee_code, full_name, dob, gender, phone, email, address, role, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [nextCode, fullName || null, dob || null, gender || null, phone || null, email || null, address || null, role || null]
      );
      return res.json({ success: true, id: result.insertId, employeeCode: nextCode });
    } catch (err) {
      // If employee_code column doesn't exist, try without it
      if (String(err.message || '').includes('Unknown column') && String(err.message).includes('employee_code')) {
        try {
          const [result] = await db.execute(
            `INSERT INTO employees (full_name, dob, gender, phone, email, address, role, active)
             VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [fullName || null, dob || null, gender || null, phone || null, email || null, address || null, role || null]
          );
          return res.json({ success: true, id: result.insertId });
        } catch (err2) {
          // If role column also doesn't exist, insert without role
          if (String(err2.message || '').includes('Unknown column') && String(err2.message).includes('role')) {
            const [result] = await db.execute(
              `INSERT INTO employees (full_name, dob, gender, phone, email, address, active)
               VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
              [fullName || null, dob || null, gender || null, phone || null, email || null, address || null]
            );
            return res.json({ success: true, id: result.insertId });
          }
          throw err2;
        }
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

// POST /api/employees/:id/create-account - tạo tài khoản đăng nhập cho nhân viên
router.post("/:id/create-account", async (req, res) => {
  const employeeId = req.params.id;
  const { username, password } = req.body || {};
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Thiếu username hoặc password" });
  }

  try {
    // 1) Kiểm tra nhân viên có tồn tại và chưa có tài khoản
    const [empRows] = await db.execute(
      `SELECT id, user_id, role, full_name, email FROM employees WHERE id = ?`,
      [employeeId]
    );
    if (!empRows || empRows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
    }
    if (empRows[0].user_id) {
      return res.status(400).json({ success: false, message: "Nhân viên đã có tài khoản rồi" });
    }

    const employee = empRows[0];

    // 2) Kiểm tra username đã tồn tại chưa
    const [existingUser] = await db.execute(
      `SELECT id FROM users WHERE username = ?`,
      [username]
    );
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ success: false, message: "Username đã tồn tại" });
    }

    // 3) Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) Tạo user mới với role từ employees
    const employeeRole = employee.role || 'STAFF';
    const [userResult] = await db.execute(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      [username, hashedPassword, employeeRole]
    );
    const newUserId = userResult.insertId;

    // 5) Liên kết user với employee
    await db.execute(
      `UPDATE employees SET user_id = ? WHERE id = ?`,
      [newUserId, employeeId]
    );

    // 6) Gửi email thông báo tài khoản mới cho nhân viên
    if (employee.email && employee.email.trim()) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.MAIL_USER,
          to: employee.email,
          subject: '🎉 Tài khoản đăng nhập đã được tạo - Trung tâm Tiếng Anh',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🎉 Chào mừng ${employee.full_name}!</h1>
              </div>
              <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333;">Tài khoản đăng nhập hệ thống của bạn đã được tạo thành công!</p>
                
                <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 0 0 10px 0; color: #555;"><strong>📧 Tên đăng nhập:</strong></p>
                  <p style="font-size: 18px; font-weight: bold; color: #667eea; margin: 0 0 15px 0;">${username}</p>
                  
                  <p style="margin: 0 0 10px 0; color: #555;"><strong>🔑 Mật khẩu:</strong></p>
                  <p style="font-size: 18px; font-weight: bold; color: #667eea; margin: 0;">${password}</p>
                </div>

                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p style="margin: 0; color: #856404;">⚠️ <strong>Lưu ý bảo mật:</strong> Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để đảm bảo an toàn tài khoản.</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="http://localhost:5173/login" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">🚀 Đăng nhập ngay</a>
                </div>

                <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ bộ phận quản lý.</p>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>© 2025 Trung tâm Tiếng Anh. All rights reserved.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Đã gửi email thông báo tài khoản đến ${employee.email}`);
      } catch (emailErr) {
        console.error('❌ Lỗi gửi email:', emailErr.message);
        // Không throw lỗi, vẫn trả về success vì tài khoản đã tạo thành công
      }
    }

    res.json({ success: true, message: "Tạo tài khoản thành công và đã gửi thông tin đến email nhân viên", userId: newUserId });
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
