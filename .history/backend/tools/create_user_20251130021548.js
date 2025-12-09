// Simple helper to create or update a user in the `users` table with a bcrypt-hashed password.
// Usage: node backend/tools/create_user.js <username> <password> <ROLE> [student_id]
// Example: node backend/tools/create_user.js teacher1 pass1234 TEACHER

const db = require('../db');
const bcrypt = require('bcryptjs');

async function main() {
  const [, , username, password, role, studentIdArg] = process.argv;
  if (!username || !password || !role) {
    console.error('Usage: node backend/tools/create_user.js <username> <password> <ROLE> [student_id]');
    process.exit(1);
  }

  const student_id = studentIdArg ? Number(studentIdArg) : null;

  try {
    const hashed = await bcrypt.hash(password, 10);

    // Check if users table exists and insert/update accordingly
    const conn = await db.getConnection();
    try {
      // Try update first
      const [rows] = await conn.execute('SELECT id FROM users WHERE username = ?', [username]);
      if (rows && rows.length) {
        await conn.execute('UPDATE users SET password = ?, role = ?, student_id = ? WHERE username = ?', [hashed, role, student_id, username]);
        console.log(`Updated existing user '${username}' with role=${role}`);
      } else {
        await conn.execute('INSERT INTO users (username, password, role, student_id) VALUES (?, ?, ?, ?)', [username, hashed, role, student_id]);
        console.log(`Inserted user '${username}' with role=${role}`);
      }
    } finally {
      conn.release();
    }
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err.message || err);
    process.exit(2);
  }
}

main();
