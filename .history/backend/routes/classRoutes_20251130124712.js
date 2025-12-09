const express = require('express');
const router = express.Router();
const db = require('../db'); // mysql2/promise pool

// GET /api/classes
router.get('/', async(req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM classes ORDER BY id DESC');
        res.json({ success: true, classes: rows });
    } catch (err) {
        console.error('GET /api/classes error', err);
        res.status(500).json({ success: false, message: 'DB error' });
    }
});

// POST /api/classes
router.post('/', async(req, res) => {
    try {
        const { name, teacher_id, capacity, level, start_date, end_date, note } = req.body;
        const [result] = await db.query(
            `INSERT INTO classes (name, teacher_id, capacity, level, start_date, end_date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, teacher_id || null, capacity || 20, level || null, start_date || null, end_date || null, note || null]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('POST /api/classes error', err);
        res.status(500).json({ success: false });
    }
});

// GET /api/classes/:id
router.get('/:id', async(req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const [
            [cls]
        ] = await db.query('SELECT * FROM classes WHERE id = ?', [id]);
        if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

        const [students] = await db.query(
            `SELECT s.* FROM class_students cs JOIN students s ON cs.student_id = s.id WHERE cs.class_id = ?`, [id]
        );

        res.json({ success: true, class: cls, students });
    } catch (err) {
        console.error('GET /api/classes/:id error', err);
        res.status(500).json({ success: false });
    }
});

// PUT /api/classes/:id
router.put('/:id', async(req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const fields = [];
        const values = [];
        const allowed = ['name', 'teacher_id', 'capacity', 'level', 'start_date', 'end_date', 'note'];
        for (const k of allowed) {
            if (k in req.body) {
                fields.push(`${k} = ?`);
                values.push(req.body[k]);
            }
        }
        if (fields.length === 0) return res.json({ success: true });
        values.push(id);
        await db.query(`UPDATE classes SET ${fields.join(', ')} WHERE id = ?`, values);
        res.json({ success: true });
    } catch (err) {
        console.error('PUT /api/classes/:id error', err);
        res.status(500).json({ success: false });
    }
    const express = require('express');
    const router = express.Router();
    const db = require('../db'); // mysql2/promise pool

    // GET /api/classes
    router.get('/', async(req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM classes ORDER BY id DESC');
            res.json({ success: true, classes: rows });
        } catch (err) {
            console.error('GET /api/classes error', err);
            res.status(500).json({ success: false, message: 'DB error' });
        }
    });

    // POST /api/classes
    router.post('/', async(req, res) => {
        try {
            const { name, teacher_id, capacity, level, start_date, end_date, note } = req.body;
            const [result] = await db.query(
                `INSERT INTO classes (name, teacher_id, capacity, level, start_date, end_date, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, teacher_id || null, capacity || 20, level || null, start_date || null, end_date || null, note || null]
            );
            res.json({ success: true, id: result.insertId });
        } catch (err) {
            console.error('POST /api/classes error', err);
            res.status(500).json({ success: false });
        }
    });

    // GET /api/classes/:id
    router.get('/:id', async(req, res) => {
        const id = parseInt(req.params.id, 10);
        try {
            const [
                [cls]
            ] = await db.query('SELECT * FROM classes WHERE id = ?', [id]);
            if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

            const [students] = await db.query(`SELECT s.* FROM class_students cs JOIN students s ON cs.student_id = s.id WHERE cs.class_id = ?`, [id]);

            res.json({ success: true, class: cls, students });
        } catch (err) {
            console.error('GET /api/classes/:id error', err);
            res.status(500).json({ success: false });
        }
    });

    // PUT /api/classes/:id
    router.put('/:id', async(req, res) => {
        const id = parseInt(req.params.id, 10);
        try {
            const fields = [];
            const values = [];
            const allowed = ['name', 'teacher_id', 'capacity', 'level', 'start_date', 'end_date', 'note'];
            for (const k of allowed) {
                if (k in req.body) {
                    fields.push(`${k} = ?`);
                    values.push(req.body[k]);
                }
            }
            if (fields.length === 0) return res.json({ success: true });
            values.push(id);
            await db.query(`UPDATE classes SET ${fields.join(', ')} WHERE id = ?`, values);
            res.json({ success: true });
        } catch (err) {
            console.error('PUT /api/classes/:id error', err);
            res.status(500).json({ success: false });
        }
    });

    // DELETE /api/classes/:id
    router.delete('/:id', async(req, res) => {
        const id = parseInt(req.params.id, 10);
        try {
            await db.query('DELETE FROM classes WHERE id = ?', [id]);
            res.json({ success: true });
        } catch (err) {
            console.error('DELETE /api/classes/:id error', err);
            res.status(500).json({ success: false });
        }
    });

    // POST /api/classes/:id/assign
    // Optional body: { studentId, sessionDates: ['2025-12-01','2025-12-02', ...], sessionTimeStart: '09:00', sessionTimeEnd: '11:00' }
    router.post('/:id/assign', async(req, res) => {
        const classId = parseInt(req.params.id, 10);
        const { studentId, sessionDates, sessionTimeStart, sessionTimeEnd } = req.body || {};
        let conn;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();

            const [
                [cls]
            ] = await conn.query('SELECT id, capacity, start_date, end_date FROM classes WHERE id = ?', [classId]);
            if (!cls) throw { code: 'NOT_FOUND', message: 'Class not found' };

            const [
                [cnt]
            ] = await conn.query('SELECT COUNT(*) AS cnt FROM class_students WHERE class_id = ? AND status = "ACTIVE"', [classId]);
            if (cnt.cnt >= cls.capacity) throw { code: 'CAPACITY', message: 'Class is full' };

            const [existing] = await conn.query('SELECT id FROM class_students WHERE class_id = ? AND student_id = ?', [classId, studentId]);
            if (existing.length > 0) throw { code: 'DUPLICATE', message: 'Student already assigned' };

            await conn.query('INSERT INTO class_students (class_id, student_id, status) VALUES (?, ?, "ACTIVE")', [classId, studentId]);
            await conn.query('INSERT INTO schedules (class_id, student_id, action) VALUES (?, ?, "ASSIGNED")', [classId, studentId]);
            await conn.query('UPDATE students SET status = "ACTIVE" WHERE id = ?', [studentId]);

            // Session/sessionDates handling:
            // If caller provided explicit `sessionDates` (array of YYYY-MM-DD), do NOT create/modify class_sessions.
            // Instead, insert per-student schedules for the provided dates (one time per date if sessionTimeStart provided)
            try {
                if (Array.isArray(sessionDates) && sessionDates.length > 0) {
                    const startTime = sessionTimeStart || null;
                    const endTime = sessionTimeEnd || null;
                    for (const raw of sessionDates) {
                        if (!raw) continue;
                        const d = new Date(raw);
                        if (isNaN(d.getTime())) continue;
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const dateStr = `${yyyy}-${mm}-${dd}`;
                        try {
                            const scheduledAt = startTime ? `${dateStr} ${startTime}` : null;
                            const metaObj = { providedSessionDate: dateStr };
                            if (startTime) metaObj.start = startTime;
                            if (endTime) metaObj.end = endTime;
                            const meta = JSON.stringify(metaObj);
                            if (scheduledAt) {
                                await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', scheduledAt, meta]);
                            } else {
                                await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', meta]);
                            }
                        } catch (e) {
                            console.warn('Unable to insert per-date schedule for provided sessionDates:', e && e.message ? e.message : e);
                        }
                    }
                } else {
                    // Fallback: ensure class_sessions exist (generate from class start/end if empty) and create per-session schedules
                    const [cntRows] = await conn.query('SELECT COUNT(*) AS cnt FROM class_sessions WHERE class_id = ?', [classId]);
                    const sessCnt = (cntRows && cntRows[0] && cntRows[0].cnt) ? cntRows[0].cnt : 0;

                    if (sessCnt === 0 && cls && cls.start_date && cls.end_date) {
                        const start = new Date(cls.start_date);
                        const end = new Date(cls.end_date);
                        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                            const yyyy = d.getFullYear();
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const dd = String(d.getDate()).padStart(2, '0');
                            const dateStr = `${yyyy}-${mm}-${dd}`;
                            await conn.query('INSERT INTO class_sessions (class_id, date, time_start, time_end, room, teacher_id, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [classId, dateStr, '09:00', '11:00', null, null, null]);
                            await conn.query('INSERT INTO class_sessions (class_id, date, time_start, time_end, room, teacher_id, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [classId, dateStr, '14:00', '16:00', null, null, null]);
                        }
                    }

                    let dateFrom = null;
                    let dateTo = null;
                    if (cls && cls.start_date && cls.end_date) {
                        dateFrom = cls.start_date;
                        dateTo = cls.end_date;
                    }

                    const sessionsQuery = dateFrom && dateTo ? ['SELECT id, date, time_start FROM class_sessions WHERE class_id = ? AND date BETWEEN ? AND ? ORDER BY date, time_start', [classId, dateFrom, dateTo]] : ['SELECT id, date, time_start FROM class_sessions WHERE class_id = ? ORDER BY date, time_start', [classId]];

                    const [sessions] = await conn.query(sessionsQuery[0], sessionsQuery[1]);
                    for (const s of sessions) {
                        try {
                            const scheduledAt = `${s.date} ${s.time_start}`;
                            const meta = JSON.stringify({ sessionId: s.id });
                            await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', scheduledAt, meta]);
                        } catch (e) {
                            console.warn('Unable to insert per-session schedule:', e && e.message ? e.message : e);
                        }
                    }
                }
            } catch (e) {
                console.warn('Error generating sessions/schedules on assign:', e && e.message ? e.message : e);
            }

            await conn.commit();
            res.json({ success: true, message: 'Assigned student to class' });
        } catch (err) {
            if (conn) await conn.rollback();
            console.error('POST /api/classes/:id/assign error', err);
            if (err.code === 'CAPACITY' || err.code === 'DUPLICATE') return res.status(400).json({ success: false, message: err.message });
            if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, message: err.message });
            res.status(500).json({ success: false, message: 'Server error' });
        } finally {
            if (conn) conn.release();
        }
    });

    // POST /api/classes/:id/finish
    router.post('/:id/finish', async(req, res) => {
        const classId = parseInt(req.params.id, 10);
        const { studentId } = req.body;
        let conn;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();

            const [updateRes] = await conn.query('UPDATE class_students SET status = "COMPLETED", left_at = NOW() WHERE class_id = ? AND student_id = ?', [classId, studentId]);
            if (updateRes.affectedRows === 0) throw { code: 'NOT_FOUND' };

            await conn.query('INSERT INTO schedules (class_id, student_id, action) VALUES (?, ?, "FINISHED")', [classId, studentId]);
            await conn.query('UPDATE students SET status = "COMPLETED" WHERE id = ?', [studentId]);

            await conn.commit();
            res.json({ success: true, message: 'Student marked completed for class' });
        } catch (err) {
            if (conn) await conn.rollback();
            console.error('POST /api/classes/:id/finish error', err);
            if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Relation not found' });
            res.status(500).json({ success: false, message: 'Server error' });
        } finally {
            if (conn) conn.release();
        }
    });

    module.exports = router;

    // ----- Additional schedule management endpoints -----
    // GET /api/schedules?classId=&studentId=
    router.get('/schedules', async(req, res) => {
        const { classId, studentId } = req.query;
        try {
            const filters = [];
            const params = [];
            if (classId) { filters.push('class_id = ?');
                params.push(classId); }
            if (studentId) { filters.push('student_id = ?');
                params.push(studentId); }
            const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
            const [rows] = await db.query(`SELECT * FROM schedules ${where} ORDER BY scheduled_at`, params);
            res.json({ success: true, schedules: rows });
        } catch (err) {
            console.error('GET /api/schedules error', err);
            res.status(500).json({ success: false, message: 'DB error' });
        }
    });

    // POST /api/classes/:id/schedules  (create schedules for a student for given dates)
    router.post('/:id/schedules', async(req, res) => {
        const classId = parseInt(req.params.id, 10);
        const { studentId, sessionDates, sessionTimeStart, sessionTimeEnd } = req.body || {};
        if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });
        if (!Array.isArray(sessionDates) || sessionDates.length === 0) return res.status(400).json({ success: false, message: 'sessionDates required' });
        let conn;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();
            const created = [];
            for (const raw of sessionDates) {
                if (!raw) continue;
                const d = new Date(raw);
                if (isNaN(d.getTime())) continue;
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}-${mm}-${dd}`;
                const start = sessionTimeStart || null;
                const metaObj = { providedSessionDate: dateStr };
                if (start) metaObj.start = start;
                if (sessionTimeEnd) metaObj.end = sessionTimeEnd;
                const meta = JSON.stringify(metaObj);
                if (start) {
                    const scheduledAt = `${dateStr} ${start}`;
                    const [r] = await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', scheduledAt, meta]);
                    created.push({ id: r.insertId, scheduled_at: scheduledAt, meta: metaObj });
                } else {
                    const [r] = await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', meta]);
                    created.push({ id: r.insertId, scheduled_at: null, meta: metaObj });
                }
            }
            await conn.commit();
            res.json({ success: true, created });
        } catch (err) {
            if (conn) await conn.rollback();
            console.error('POST /api/classes/:id/schedules error', err);
            res.status(500).json({ success: false, message: 'DB error' });
        } finally {
            if (conn) conn.release();
        }
    });

    // PUT /api/schedules/:id  (update scheduled_at and meta)
    router.put('/schedules/:id', async(req, res) => {
        const scheduleId = parseInt(req.params.id, 10);
        const { scheduled_at, meta } = req.body || {};
        try {
            const fields = [];
            const vals = [];
            if (scheduled_at !== undefined) { fields.push('scheduled_at = ?');
                vals.push(scheduled_at); }
            if (meta !== undefined) { fields.push('meta = ?');
                vals.push(typeof meta === 'string' ? meta : JSON.stringify(meta)); }
            if (fields.length === 0) return res.json({ success: true });
            vals.push(scheduleId);
            await db.query(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`, vals);
            res.json({ success: true });
        } catch (err) {
            console.error('PUT /api/schedules/:id error', err);
            res.status(500).json({ success: false, message: 'DB error' });
        }
    });

    // DELETE /api/schedules/:id
    router.delete('/schedules/:id', async(req, res) => {
        const scheduleId = parseInt(req.params.id, 10);
        try {
            await db.query('DELETE FROM schedules WHERE id = ?', [scheduleId]);
            res.json({ success: true });
        } catch (err) {
            console.error('DELETE /api/schedules/:id error', err);
            res.status(500).json({ success: false, message: 'DB error' });
        }
    });
    if (scheduled_at !== undefined) { fields.push('scheduled_at = ?');
        vals.push(scheduled_at); }
    if (meta !== undefined) { fields.push('meta = ?');
        vals.push(typeof meta === 'string' ? meta : JSON.stringify(meta)); }
    if (fields.length === 0) return res.json({ success: true });
    vals.push(scheduleId);
    await db.query(`UPDATE class_schedules SET ${fields.join(', ')} WHERE id = ?`, vals);

    // propagate updates to per-student copies that reference it via meta.classScheduleId
    try {
        const metaStr = typeof meta === 'string' ? meta : JSON.stringify(meta || {});
        const pattern = `%"classScheduleId":${scheduleId}%`;
        if (scheduled_at !== undefined && meta !== undefined) {
            await db.query('UPDATE schedules SET scheduled_at = ?, meta = ? WHERE class_id = ? AND student_id IS NOT NULL AND meta LIKE ?', [scheduled_at, metaStr, orig.class_id, pattern]);
        } else if (scheduled_at !== undefined) {
            await db.query('UPDATE schedules SET scheduled_at = ? WHERE class_id = ? AND student_id IS NOT NULL AND meta LIKE ?', [scheduled_at, orig.class_id, pattern]);
        } else if (meta !== undefined) {
            await db.query('UPDATE schedules SET meta = ? WHERE class_id = ? AND student_id IS NOT NULL AND meta LIKE ?', [metaStr, orig.class_id, pattern]);
        }
    } catch (e) {
        console.warn('Unable to propagate class-level schedule update to student schedules:', e && e.message ? e.message : e);
    }

    res.json({ success: true });
} catch (err) {
    console.error('PUT /api/schedules/:id error', err);
    res.status(500).json({ success: false, message: 'DB error' });
}
});

// DELETE /api/schedules/:id
router.delete('/schedules/:id', async(req, res) => {
    const scheduleId = parseInt(req.params.id, 10);
    try {
        // Try deleting from per-student schedules first
        const [
            [origSched]
        ] = await db.query('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
        if (origSched) {
            await db.query('DELETE FROM schedules WHERE id = ?', [scheduleId]);
            return res.json({ success: true });
        }

        // Otherwise check class_schedules
        const [
            [orig]
        ] = await db.query('SELECT * FROM class_schedules WHERE id = ?', [scheduleId]);
        if (!orig) return res.status(404).json({ success: false, message: 'Schedule not found' });
        try {
            const pattern = `%"classScheduleId":${scheduleId}%`;
            await db.query('DELETE FROM schedules WHERE class_id = ? AND student_id IS NOT NULL AND meta LIKE ?', [orig.class_id, pattern]);
        } catch (e) {
            console.warn('Unable to delete per-student copies of class schedule:', e && e.message ? e.message : e);
        }
        await db.query('DELETE FROM class_schedules WHERE id = ?', [scheduleId]);
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/schedules/:id error', err);
        res.status(500).json({ success: false, message: 'DB error' });
    }
});