#!/usr/bin/env node
const pool = require('../db');

(async function main(){
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Find user 'student1'
    const [users] = await conn.query("SELECT * FROM users WHERE username = 'student1' LIMIT 1");
    if (!users || users.length === 0) {
      console.log("User 'student1' not found. Nothing to rollback.");
      await conn.commit();
      conn.release();
      await pool.end();
      return;
    }
    const user = users[0];
    const studentId = user.student_id;
    console.log('Found user:', { id: user.id, username: user.username, student_id: studentId });

    // Find demo classes created by assistant
    const [demoClasses] = await conn.query("SELECT id, name FROM classes WHERE name LIKE 'Demo class for student1' OR name LIKE 'Demo class for %student1%'");
    const classIds = demoClasses.map(c => c.id);
    console.log('Demo classes to remove:', demoClasses);

    // Delete class_sessions for these classes
    if (classIds.length > 0) {
      const [delSessions] = await conn.query('DELETE FROM class_sessions WHERE class_id IN (?)', [classIds]);
      console.log('Deleted class_sessions rows:', delSessions.affectedRows);
    }

    // Delete schedules for this student (only those likely created by the assistant)
    if (studentId) {
      const [delSch] = await conn.query("DELETE FROM schedules WHERE student_id = ? AND (meta LIKE '%Restored demo schedule by assistant%' OR class_id IN (?))", [studentId, classIds.length ? classIds : [0]]);
      console.log('Deleted schedules rows for student:', delSch.affectedRows);

      // Delete class_students entries for this student and demo classes (or any entries with this student)
      const [delCS] = await conn.query('DELETE FROM class_students WHERE student_id = ? AND (class_id IN (?) OR 1=1)', [studentId, classIds.length ? classIds : [0]]);
      // Note: above condition will delete any class_students for this student; that's intended for rollback of demo linking
      console.log('Deleted class_students rows for student:', delCS.affectedRows);

      // Delete the student record itself
      const [delStudent] = await conn.query('DELETE FROM students WHERE id = ?', [studentId]);
      console.log('Deleted student rows:', delStudent.affectedRows);

      // Unlink user.student_id
      const [updUser] = await conn.query("UPDATE users SET student_id = NULL WHERE username = 'student1'");
      console.log('Unlinked users.student_id for student1:', updUser.affectedRows);
    }

    // Delete demo classes
    if (classIds.length > 0) {
      const [delClasses] = await conn.query('DELETE FROM classes WHERE id IN (?)', [classIds]);
      console.log('Deleted classes rows:', delClasses.affectedRows);
    }

    await conn.commit();
    conn.release();
    await pool.end();
    console.log('Rollback complete.');
  } catch (err) {
    console.error('Error during rollback:', err);
    try { if (conn) { await conn.rollback(); conn.release(); } } catch(e){}
    try { await pool.end(); } catch(e){}
    process.exit(1);
  }
})();
