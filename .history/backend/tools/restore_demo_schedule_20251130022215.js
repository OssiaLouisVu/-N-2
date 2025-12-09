#!/usr/bin/env node
// Small helper: inspect DB for 'student1' demo schedule and create one if missing.
const pool = require('../db');

(async function main(){
  try {
    const username = 'student1';

    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!users || users.length === 0) {
      console.log(`User '${username}' not found in users table. Aborting.`);
      await pool.end();
      return;
    }

    const user = users[0];
    const studentId = user.student_id;
    console.log('Found user:', { id: user.id, username: user.username, student_id: studentId });

    if (!studentId) {
      console.log("User has no linked student_id. Please link the user to a student record first or provide the student id.");
      await pool.end();
      return;
    }

    // Check existing class assignments
    const [csRows] = await pool.query('SELECT * FROM class_students WHERE student_id = ?', [studentId]);
    if (csRows && csRows.length > 0) {
      console.log(`Student ${studentId} already assigned to ${csRows.length} class(es). Showing one record:`);
      console.log(csRows[0]);
      // Also check schedules
      const [sRows] = await pool.query('SELECT * FROM schedules WHERE student_id = ? ORDER BY created_at DESC LIMIT 5', [studentId]);
      console.log('Recent schedules for student:', sRows);
      await pool.end();
      return;
    }

    console.log('No class assignment found for student. Creating demo class, assignment, schedule and 3 sessions...');

    // Try to find teacher1 user id
    const [tUsers] = await pool.query("SELECT * FROM users WHERE username = 'teacher1' LIMIT 1");
    const teacherUser = tUsers && tUsers[0] ? tUsers[0] : null;
    const teacherIdForClass = teacherUser ? teacherUser.id : null;

    // Insert demo class
    const [classRes] = await pool.query(
      'INSERT INTO classes (name, teacher_id, capacity, level, start_date, end_date, note) VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), ?)',
      [`Demo class for ${username}`, teacherIdForClass, 10, 'Demo', 'Auto-created demo for student1']
    );

    const classId = classRes.insertId;
    console.log('Created class id=', classId);

    // Assign student to class
    const [assignRes] = await pool.query(
      'INSERT INTO class_students (class_id, student_id, status) VALUES (?, ?, ?)',
      [classId, studentId, 'ACTIVE']
    );
    console.log('Inserted class_students id=', assignRes.insertId);

    // Create a schedule entry
    const meta = JSON.stringify({ note: 'Restored demo schedule by assistant' });
    const [schRes] = await pool.query(
      'INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta) VALUES (?, ?, ?, NOW(), ?)',
      [classId, studentId, 'ASSIGNED', meta]
    );
    console.log('Inserted schedules id=', schRes.insertId);

    // Create three sessions (one per week)
    const sessIds = [];
    for (let i=1;i<=3;i++){
      const [sres] = await pool.query(
        'INSERT INTO class_sessions (class_id, date, time_start, time_end, room, teacher_id, status) VALUES (?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?, ?, ?)',
        [classId, i*7, '09:00:00', '10:30:00', 'Demo-Room', teacherIdForClass, 'SCHEDULED']
      );
      sessIds.push(sres.insertId);
    }
    console.log('Created class_sessions ids=', sessIds);

    // Final verification selects
    const [finalCs] = await pool.query('SELECT * FROM class_students WHERE student_id = ?', [studentId]);
    const [finalSch] = await pool.query('SELECT * FROM schedules WHERE student_id = ?', [studentId]);
    const [finalSessions] = await pool.query('SELECT * FROM class_sessions WHERE class_id = ?', [classId]);

    console.log('Verification — class_students:', finalCs);
    console.log('Verification — schedules:', finalSch);
    console.log('Verification — class_sessions:', finalSessions);

    await pool.end();
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    try { await pool.end(); } catch(e){}
    process.exit(1);
  }
})();
