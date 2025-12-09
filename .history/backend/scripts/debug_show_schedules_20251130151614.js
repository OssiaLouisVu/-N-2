const db = require('../db');

async function run() {
    try {
        console.log('=== Last 50 class_schedules ===');
        const [cs] = await db.query('SELECT id, class_id, action, scheduled_at, meta, created_at FROM class_schedules ORDER BY id DESC LIMIT 50');
        console.log(cs);

        console.log('\n=== Last 100 schedules ===');
        const [s] = await db.query('SELECT id, class_id, student_id, action, scheduled_at, meta, created_at FROM schedules ORDER BY id DESC LIMIT 100');
        console.log(s);

        // show recent classes and their active students
        console.log('\n=== Classes with active students ===');
        const [cls] = await db.query(`SELECT c.id, c.name, cs.student_id
      FROM classes c
      LEFT JOIN class_students cs ON c.id = cs.class_id AND cs.status = 'ACTIVE'
      ORDER BY c.id LIMIT 50`);
        console.log(cls);

        process.exit(0);
    } catch (e) {
        console.error('error querying DB:', e.message || e);
        process.exit(2);
    }
}

run();