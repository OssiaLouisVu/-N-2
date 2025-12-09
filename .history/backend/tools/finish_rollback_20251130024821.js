#!/usr/bin/env node

const pool = require('../db');
(async function() {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Find any student id that looks like demo (student1 mapping)
        const [users] = await conn.query("SELECT * FROM users WHERE username = 'student1' LIMIT 1");
        if (!users || users.length === 0) {
            console.log("User student1 not found");
            await conn.commit();
            conn.release();
            await pool.end();
            return;
        }
        const user = users[0];
        const studentId = user.student_id;
        console.log('user', user);

        if (studentId) {
            // unlink user first to avoid FK issues
            const [u] = await conn.query('UPDATE users SET student_id = NULL WHERE id = ?', [user.id]);
            console.log('Unlinked user.student_id rows:', u.affectedRows);

            // delete dependent rows safely
            const [delCS] = await conn.query('DELETE FROM class_students WHERE student_id = ?', [studentId]);
            console.log('Deleted class_students rows:', delCS.affectedRows);
            const [delSch] = await conn.query('DELETE FROM schedules WHERE student_id = ?', [studentId]);
            console.log('Deleted schedules rows:', delSch.affectedRows);
            const [delStudent] = await conn.query('DELETE FROM students WHERE id = ?', [studentId]);
            console.log('Deleted students rows:', delStudent.affectedRows);
        } else {
            console.log('No student_id linked to user student1');
        }

        // Delete classes with demo name just in case
        const [demoClasses] = await conn.query("SELECT id FROM classes WHERE name LIKE 'Demo class for student1'");
        const ids = demoClasses.map(c => c.id);
        if (ids.length > 0) {
            const [delSessions] = await conn.query('DELETE FROM class_sessions WHERE class_id IN (?)', [ids]);
            console.log('Deleted class_sessions rows:', delSessions.affectedRows);
            const [delClasses] = await conn.query('DELETE FROM classes WHERE id IN (?)', [ids]);
            console.log('Deleted classes rows:', delClasses.affectedRows);
        } else {
            console.log('No demo classes found to delete');
        }

        await conn.commit();
        conn.release();
        await pool.end();
        console.log('Finish rollback completed');
    } catch (err) {
        console.error('Error finishing rollback:', err);
        try { if (conn) { await conn.rollback();
                conn.release(); } } catch (e) {}
        try { await pool.end(); } catch (e) {}
        process.exit(1);
    }
})();