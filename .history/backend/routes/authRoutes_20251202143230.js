const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const router = express.Router();

// POST /api/auth/forgot-password - Gửi email reset password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập email" });
  }

  try {
    // 1) Tìm user theo email (kiểm tra cả employees, students, hoặc bất kỳ bảng nào có email)
    // Ưu tiên tìm trong employees trước
    const [empRows] = await db.execute(
      `SELECT e.id, e.full_name AS name, e.email, e.user_id, u.username 
       FROM employees e
       LEFT JOIN users u ON u.id = e.user_id
       WHERE e.email = ? AND e.active = TRUE AND e.user_id IS NOT NULL`,
      [email.trim()]
    );

    let user = null;
    if (empRows && empRows.length > 0) {
      user = empRows[0];
    } else {
      // Nếu không tìm thấy trong employees, tìm trong students
      const [stdRows] = await db.execute(
        `SELECT s.id, s.full_name AS name, s.email, s.user_id, u.username
         FROM students s
         LEFT JOIN users u ON u.id = s.user_id
         WHERE s.email = ? AND s.user_id IS NOT NULL`,
        [email.trim()]
      );
      if (stdRows && stdRows.length > 0) {
        user = stdRows[0];
      }
    }

    if (!user) {
      // Không tiết lộ email có tồn tại hay không (bảo mật)
      return res.json({ 
        success: true, 
        message: "Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu đến email của bạn" 
      });
    }

    // 2) Xóa các token cũ của user này
    await db.execute(
      `DELETE FROM password_reset_tokens WHERE user_id = ?`,
      [employee.user_id]
    );

    // 3) Tạo token reset (random 32 bytes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Hết hạn sau 1 giờ

    // 4) Lưu token vào DB
    await db.execute(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [employee.user_id, resetToken, expiresAt]
    );

    // 5) Gửi email với link reset
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: employee.email,
      subject: '🔐 Đặt lại mật khẩu - Trung tâm Tiếng Anh',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Đặt lại mật khẩu</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333;">Xin chào <strong>${employee.full_name}</strong>,</p>
            
            <p style="font-size: 16px; color: #333;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${employee.username}</strong>.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                🔓 Đặt lại mật khẩu
              </a>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                ⏰ <strong>Link này sẽ hết hạn sau 1 giờ</strong>
              </p>
            </div>

            <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <p style="margin: 0; color: #721c24; font-size: 14px;">
                ⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ quản lý ngay.
              </p>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Hoặc copy link sau vào trình duyệt:<br>
              <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2025 Trung tâm Tiếng Anh. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email reset password đến ${employee.email}`);

    res.json({ 
      success: true, 
      message: "Chúng tôi đã gửi link reset mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư." 
    });

  } catch (e) {
    console.error('❌ Lỗi forgot password:', e.message);
    res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại sau" });
  }
});

// POST /api/auth/reset-password - Đặt lại mật khẩu mới
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body || {};
  
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: "Thiếu token hoặc mật khẩu mới" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  try {
    // 1) Kiểm tra token có hợp lệ và chưa hết hạn
    const [tokenRows] = await db.execute(
      `SELECT id, user_id, expires_at FROM password_reset_tokens WHERE token = ?`,
      [token]
    );

    if (!tokenRows || tokenRows.length === 0) {
      return res.status(400).json({ success: false, message: "Link reset mật khẩu không hợp lệ" });
    }

    const resetRecord = tokenRows[0];
    const now = new Date();
    const expiresAt = new Date(resetRecord.expires_at);

    if (now > expiresAt) {
      // Token đã hết hạn, xóa nó
      await db.execute(`DELETE FROM password_reset_tokens WHERE id = ?`, [resetRecord.id]);
      return res.status(400).json({ success: false, message: "Link reset mật khẩu đã hết hạn. Vui lòng yêu cầu lại." });
    }

    // 2) Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3) Cập nhật mật khẩu mới cho user
    await db.execute(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, resetRecord.user_id]
    );

    // 4) Xóa token đã sử dụng
    await db.execute(
      `DELETE FROM password_reset_tokens WHERE id = ?`,
      [resetRecord.id]
    );

    console.log(`✅ User ${resetRecord.user_id} đã đổi mật khẩu thành công`);

    res.json({ success: true, message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới." });

  } catch (e) {
    console.error('❌ Lỗi reset password:', e.message);
    res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại sau" });
  }
});

module.exports = router;
