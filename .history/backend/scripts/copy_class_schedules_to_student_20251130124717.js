const db = require('../db');

async function run() {
    const classId = 12;
    const studentId = 1004;
    try {
        const [classSchedules] = await db.query('SELECT * FROM class_schedules WHERE class_id = ?', [classId]);
        for (const cs of classSchedules) {
            const metaObj = cs.meta ? (typeof cs.meta === 'string' ? JSON.parse(cs.meta) : cs.meta) : {};
            metaObj.classScheduleId = cs.id;
            const metaStr = JSON.stringify(metaObj);
            if (cs.scheduled_at) {
                await db.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', cs.scheduled_at, metaStr]);
            } else {
                await db.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', metaStr]);
            }
        }
        const [rows] = await db.query('SELECT * FROM schedules WHERE student_id = ? ORDER BY scheduled_at', [studentId]);
        console.log('after copy, schedules for student', studentId, rows);
    } catch (e) {
        console.error('error', e);
    } finally {
        process.exit(0);
    }
}
run();

console.log('copy_class_schedules_to_student helper is disabled.');