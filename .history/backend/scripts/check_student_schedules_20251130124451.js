const db = require('../db');

async function run() {
  try {
    const [rows] = await db.query('SELECT * FROM schedules WHERE student_id = ? ORDER BY scheduled_at', [1004]);
    console.log('schedules for student 1004:', rows);
    const [cs] = await db.query('SELECT * FROM class_schedules WHERE class_id = ?', [12]);
    console.log('class_schedules for class 12:', cs);
    process.exit(0);
  } catch (e) {
    console.error('error', e);
    process.exit(2);
  }
}
// helper script removed: check_student_schedules
// This script was used for debugging class_schedules propagation. The feature has been reverted
// and so this helper is now a no-op.
console.log('check_student_schedules helper is disabled.');
