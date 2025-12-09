#!/usr/bin/env node
const pool = require('../db');

(async function(){
  try {
    console.log('=== students (limit 50) ===');
    const [students] = await pool.query('SELECT id, full_name, phone, email, status, created_at FROM students ORDER BY id DESC LIMIT 50');
    console.log(JSON.stringify(students, null, 2));

    console.log('\n=== users (student mapping) ===');
    const [users] = await pool.query("SELECT id, username, role, student_id, created_at FROM users ORDER BY id ASC LIMIT 50");
    console.log(JSON.stringify(users, null, 2));

    console.log('\n=== class_students ===');
    const [cs] = await pool.query('SELECT * FROM class_students ORDER BY id DESC LIMIT 50');
    console.log(JSON.stringify(cs, null, 2));

    console.log('\n=== classes ===');
    const [classes] = await pool.query('SELECT * FROM classes ORDER BY id DESC LIMIT 50');
    console.log(JSON.stringify(classes, null, 2));

    console.log('\n=== schedules ===');
    const [schedules] = await pool.query('SELECT * FROM schedules ORDER BY id DESC LIMIT 100');
    console.log(JSON.stringify(schedules, null, 2));

    console.log('\n=== class_sessions ===');
    const [sessions] = await pool.query('SELECT * FROM class_sessions ORDER BY id DESC LIMIT 100');
    console.log(JSON.stringify(sessions, null, 2));

    await pool.end();
  } catch (err) {
    console.error('Error inspecting schedules:', err);
    try { await pool.end(); } catch(e){}
    process.exit(1);
  }
})();
