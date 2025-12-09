const express = require("express");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");

// Lấy cấu hình email từ biến môi trường
const mailTransporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Gửi email cho 1 người
async function sendEmail({ to, subject, text }) {
  await mailTransporter.sendMail({
    from: `"Trung tâm tiếng Trung" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  });
}

// POST /api/notify/email
// Body: { employeeIds: [id1, id2, ...], title, content }
router.post("/email", async (req, res) => {
  const { employeeIds, title, content } = req.body;
  if (!employeeIds || !Array.isArray(employeeIds) || !title || !content) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin" });
  }
  try {
    // Lấy email các nhân viên
    const placeholders = employeeIds.map(() => "?").join(",");
    const [rows] = await db.execute(
      `SELECT email, full_name FROM employees WHERE id IN (${placeholders}) AND active = TRUE AND email IS NOT NULL`,
      employeeIds
    );
    for (const emp of rows) {
      await sendEmail({
        to: emp.email,
        subject: title,
        text: `${content}\n\nTrân trọng,\nTrung tâm tiếng Trung`,
      });
    }
    res.json({ success: true, sent: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
