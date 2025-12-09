#!/usr/bin/env node

const pool = require('../db');

(async function() {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // find user student1
        const [urows] = await conn.query("SELECT id, username, student_id FROM users WHERE username = 'student1' LIMIT 1");
        if (!urows || urows.length === 0) throw new Error('User student1 not found');
        const user = urows[0];

        // create students entry if missing
        let studentId = user.student_id;
        if (!studentId) {
            const full_name = 'Demo Student 1';
            const phone = '0900000001';
            const email = null;
            const [res] = await conn.query('INSERT INTO students (full_name, phone, email, level, note, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', [full_name, phone, email, null, 'Demo seeded', 'NEW']);
            studentId = res.insertId;
            await conn.query('UPDATE users SET student_id = ? WHERE id = ?', [studentId, user.id]);
            console.log('Inserted student id=', studentId);
        } else {
            console.log('User already linked to student id=', studentId);
        }

        // create a demo class
        const today = new Date();
        const start = new Date(today);
        const end = new Date(today);
        end.setDate(end.getDate() + 4); // 5 days

        const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const start_date = fmt(start);
        const end_date = fmt(end);

        const [clsRes] = await conn.query('INSERT INTO classes (name, teacher_id, capacity, level, start_date, end_date, note) VALUES (?, ?, ?, ?, ?, ?, ?)', [`Demo class for student1 ${start_date}`, null, 20, null, start_date, end_date, 'Auto-seeded demo class']);
        const classId = clsRes.insertId;
        console.log('Inserted class id=', classId, 'start=', start_date, 'end=', end_date);

        // generate two sessions per day
        const sessionIds = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = fmt(d);
            const [m1] = await conn.query('INSERT INTO class_sessions (class_id, date, time_start, time_end, room, teacher_id, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [classId, dateStr, '09:00', '11:00', null, null, null]);
            sessionIds.push(m1.insertId);
            const [m2] = await conn.query('INSERT INTO class_sessions (class_id, date, time_start, time_end, room, teacher_id, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [classId, dateStr, '14:00', '16:00', null, null, null]);
            sessionIds.push(m2.insertId);
        }
        console.log('Inserted class_sessions ids=', sessionIds);

        // assign student to class
        await conn.query('INSERT INTO class_students (class_id, student_id, status) VALUES (?, ?, "ACTIVE")', [classId, studentId]);
        console.log('Inserted class_students for student=', studentId);

        // insert schedules per session
        for (const sid of sessionIds) {
            const [srow] = await conn.query('SELECT date, time_start FROM class_sessions WHERE id = ?', [sid]);
            if (srow && srow.length > 0) {
                const scheduledAt = `${srow[0].date} ${srow[0].time_start}`;
                const meta = JSON.stringify({ sessionId: sid });
                await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', scheduledAt, meta]);
            }
        }
        console.log('Inserted schedules for each session');

        // update student status active
        await conn.query('UPDATE students SET status = ?, updated_at = NOW() WHERE id = ?', ['ACTIVE', studentId]);

        await conn.commit();
        console.log('Demo seed completed. classId=', classId, 'studentId=', studentId);
        await conn.release();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding demo:', err && err.message ? err.message : err);
        try {
            if (conn) {
                await conn.rollback();
                await conn.release();
            }
        } catch (e) {}
        process.exit(1);
    }
})();