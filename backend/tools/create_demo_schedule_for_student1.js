#!/usr/bin/env node
const pool = require('../db');

(async function main(){
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Ensure user student1 exists
    const [users] = await conn.query("SELECT * FROM users WHERE username = 'student1' LIMIT 1");
    if (!users || users.length === 0) {
      console.log("User 'student1' not found. Creating a user row...");
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash('pass12345', 10);
      const [r] = await conn.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['student1', hashed, 'STUDENT']);
      users[0] = { id: r.insertId, username: 'student1' };
      console.log('Created user student1 id=', r.insertId);
    }
    const user = users[0];

    // Create student row if not linked
    let studentId = user.student_id;
    if (!studentId) {
      const [sres] = await conn.query('INSERT INTO students (full_name, phone, email, level, note, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        ['Demo Student 1', '0900000000', 'student1@example.com', 'Demo', 'Recreated demo', 'NEW']);
      studentId = sres.insertId;
      console.log('Inserted student id=', studentId);
      await conn.query('UPDATE users SET student_id = ? WHERE id = ?', [studentId, user.id]);
      console.log('Linked user.student1 -> student_id=', studentId);
    } else {
      console.log('User already linked to student_id=', studentId);
    }

    // Create demo class
    const [classRes] = await conn.query('INSERT INTO classes (name, teacher_id, capacity, level, start_date, end_date, note, created_at, updated_at) VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), ?, NOW(), NOW())',
      [`Demo class for student1`, null, 10, 'Demo', 'Auto-created demo for student1']);
    const classId = classRes.insertId;
    console.log('Created class id=', classId);

    // Assign student to class
    await conn.query('INSERT INTO class_students (class_id, student_id, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [classId, studentId, 'ACTIVE']);
    console.log('Assigned student to class');

    // Insert schedule
    const meta = JSON.stringify({ note: 'Demo schedule recreated' });
    const [schRes] = await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, NOW(), ?, NOW())', [classId, studentId, 'ASSIGNED', meta]);
    console.log('Inserted schedules id=', schRes.insertId);

    // Create 3 sessions
    const sessIds = [];
    for (let i=1;i<=3;i++){
      const [sres] = await conn.query('INSERT INTO class_sessions (class_id, date, time_start, time_end, room, teacher_id, status, created_at, updated_at) VALUES (?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?, ?, ?, NOW(), NOW())',
        [classId, i*7, '09:00:00', '10:30:00', 'Demo-Room', null, 'SCHEDULED']);
      sessIds.push(sres.insertId);
    }
    console.log('Created class_sessions ids=', sessIds);

    await conn.commit();

    // Verification selects
    const [urow] = await pool.query('SELECT id, username, student_id FROM users WHERE username = ?', ['student1']);
    const [srow] = await pool.query('SELECT * FROM students WHERE id = ?', [studentId]);
    const [crow] = await pool.query('SELECT * FROM classes WHERE id = ?', [classId]);
    const [csrows] = await pool.query('SELECT * FROM class_students WHERE student_id = ?', [studentId]);
    const [schrows] = await pool.query('SELECT * FROM schedules WHERE student_id = ?', [studentId]);
    const [sessrows] = await pool.query('SELECT * FROM class_sessions WHERE class_id = ?', [classId]);

    console.log('\nVerification: user', JSON.stringify(urow, null, 2));
    console.log('\nVerification: student', JSON.stringify(srow, null, 2));
    console.log('\nVerification: class', JSON.stringify(crow, null, 2));
    console.log('\nVerification: class_students', JSON.stringify(csrows, null, 2));
    console.log('\nVerification: schedules', JSON.stringify(schrows, null, 2));
    console.log('\nVerification: sessions', JSON.stringify(sessrows, null, 2));

    await pool.end();
    console.log('\nDone.');
  } catch (err) {
    console.error('Error creating demo schedule:', err);
    try { if (conn) { await conn.rollback(); conn.release(); } } catch(e){}
    try { await pool.end(); } catch(e){}
    process.exit(1);
  }
})();
