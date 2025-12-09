// backend/tools/reset_manager_password.js
// Đặt lại mật khẩu cho tài khoản manager1 về 'pass1234' (băm bcryptjs)

const bcrypt = require('bcryptjs');
const db = require('../db');

(async function() {
  const username = 'manager1';
  const newPassword = 'pass1234';
  const hashed = bcrypt.hashSync(newPassword, 10);
  try {
    const [rows] = await db.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (!rows.length) {
      console.log('Không tìm thấy tài khoản manager1 trong bảng users.');
      process.exit(1);
    }
    await db.execute('UPDATE users SET password = ? WHERE username = ?', [hashed, username]);
    console.log('Đã đặt lại mật khẩu cho manager1 thành công!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi đặt lại mật khẩu:', err.message);
    process.exit(1);
  }
})();
