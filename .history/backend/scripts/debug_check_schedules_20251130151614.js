const db = require('../db');

async function run() {
    try {
        const classId = process.argv[2] || '12';
        const studentId = process.argv[3] || null;

        console.log('Checking class_schedules for classId =', classId);
        try {
            const [cs] = await db.query('SELECT * FROM class_schedules WHERE class_id = ?', [classId]);
            console.log('class_schedules rows:', cs.length);
            console.log(JSON.stringify(cs, null, 2));
        } catch (e) {
            console.error('Error reading class_schedules (table may not exist?):', e.message || e);
        }

        console.log('\nChecking schedules for classId =', classId);
        try {
            const [srows] = await db.query('SELECT * FROM schedules WHERE class_id = ? ORDER BY scheduled_at', [classId]);
            console.log('schedules rows for class:', srows.length);
            console.log(JSON.stringify(srows, null, 2));
        } catch (e) {
            console.error('Error reading schedules:', e.message || e);
        }

        if (studentId) {
            console.log('\nChecking schedules for studentId =', studentId);
            try {
                const [stud] = await db.query('SELECT * FROM schedules WHERE student_id = ? ORDER BY scheduled_at', [studentId]);
                console.log('schedules rows for student:', stud.length);
                console.log(JSON.stringify(stud, null, 2));
            } catch (e) {
                console.error('Error reading schedules for student:', e.message || e);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Fatal error', err);
        process.exit(2);
    }
}

run();