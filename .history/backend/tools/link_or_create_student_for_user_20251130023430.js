#!/usr/bin/env node
// Create a students row for username 'student1' if none linked, and update users.student_id
const pool = require('../db');

(async function main(){
  try {
    const username = process.argv[2] || 'student1';
    // find user
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    if (!users || users.length === 0) {
      console.error('User not found:', username);
      await pool.end();
      process.exit(1);
    }
    const user = users[0];
    if (user.student_id) {
      console.log(`User ${username} already linked to student_id=${user.student_id}`);
      await pool.end();
      return;
    }

    // Create a new student
    const fullName = process.argv[3] || 'Demo Student 1';
    const phone = process.argv[4] || '0900000001';
    const email = process.argv[5] || 'student1@example.com';

    const [res] = await pool.query(
      'INSERT INTO students (full_name, phone, email, level, note, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [fullName, phone, email, 'Demo', 'Auto-created for linking', 'NEW']
    );
    const studentId = res.insertId;
    console.log('Inserted student id=', studentId);

    // Update users.student_id
    await pool.query('UPDATE users SET student_id = ? WHERE id = ?', [studentId, user.id]);
    console.log(`Linked user ${username} -> student_id=${studentId}`);

    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    try { await pool.end(); } catch(e){}
    process.exit(1);
  }
})();
