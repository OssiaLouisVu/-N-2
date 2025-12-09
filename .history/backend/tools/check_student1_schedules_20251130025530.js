#!/usr/bin/env node
const pool = require('../db');
(async function(){
  try {
    const [u] = await pool.query("SELECT id, username, student_id FROM users WHERE username = 'student1' LIMIT 1");
    console.log('user:', u);

    if (!u || u.length === 0) {
      console.log('No user student1 found');
      await pool.end();
      return;
    }
    const user = u[0];

    if (user.student_id) {
      const sid = user.student_id;
      const [student] = await pool.query('SELECT * FROM students WHERE id = ?', [sid]);
      console.log('student:', student);

      const [cs] = await pool.query('SELECT * FROM class_students WHERE student_id = ?', [sid]);
      console.log('class_students:', cs);

      const [schedules] = await pool.query('SELECT * FROM schedules WHERE student_id = ?', [sid]);
      console.log('schedules:', schedules);

      // join class_sessions for classes the student belongs to
      const classIds = cs.map(r => r.class_id);
      if (classIds.length > 0) {
        const [sessions] = await pool.query('SELECT * FROM class_sessions WHERE class_id IN (?) ORDER BY date', [classIds]);
        console.log('class_sessions for classes:', sessions);
      } else {
        console.log('No class_students entries found for this student.');
      }
    } else {
      console.log('User student1 has no linked student_id.');
      // show any schedules referencing username? (unlikely)
      const [schedules] = await pool.query("SELECT * FROM schedules WHERE student_id IS NULL AND meta LIKE '%student1%'");
      console.log('schedules (no student_id, meta match):', schedules);
    }

    await pool.end();
  } catch (err) {
    console.error('Error checking student1 schedules:', err);
    try { await pool.end(); } catch(e){}
    process.exit(1);
  }
})();
