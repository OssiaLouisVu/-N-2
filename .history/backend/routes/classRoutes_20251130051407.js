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
        // Instead, insert per-student schedules for the provided dates (two times per day: 09:00 and 14:00)
        // so that the assigned student's personal schedule is updated without altering the class session list.
        try {
            if (Array.isArray(sessionDates) && sessionDates.length > 0) {
                // If sessionTimeStart provided, create a single schedule per date using that start time and store end time in meta.
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
                            // If no startTime provided, fallback to inserting a generic ASSIGNED row without scheduled_at but include meta
                            await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', meta]);
                        }
                    } catch (e) {
                        console.warn('Unable to insert per-date schedule for provided sessionDates:', e && e.message ? e.message : e);
                    }
                }
                // Also, copy any existing class-level schedules into this student's personal schedules
                try {
                    const [classSchedules] = await conn.query('SELECT * FROM schedules WHERE class_id = ? AND student_id IS NULL', [classId]);
                    for (const cs of classSchedules) {
                        try {
                            // for each class-level schedule, insert a per-student copy and reference the class schedule id in meta
                            const metaObj = cs.meta ? (typeof cs.meta === 'string' ? JSON.parse(cs.meta) : cs.meta) : {};
                            metaObj.classScheduleId = cs.id;
                            const metaStr = JSON.stringify(metaObj);
                            if (cs.scheduled_at) {
                                await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, cs.action || 'ASSIGNED', cs.scheduled_at, metaStr]);
                            } else {
                                await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, studentId, cs.action || 'ASSIGNED', metaStr]);
                            }
                        } catch (e) {
                            console.warn('Unable to copy class-level schedule to student on assign:', e && e.message ? e.message : e);
                        }
                    }
                } catch (e) {
                    console.warn('Error copying existing class schedules on assign:', e && e.message ? e.message : e);
                }
            } else {
                // Fallback to previous behavior: if no explicit sessionDates provided, ensure class_sessions exist
                // (generate from class start/end if empty) and create per-session schedules for the student.
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

                // Fetch sessions and insert schedules per session
                let dateFrom = null;
                let dateTo = null;
                if (cls && cls.start_date && cls.end_date) {
                    dateFrom = cls.start_date;
                    dateTo = cls.end_date;
                }

                const sessionsQuery = dateFrom && dateTo ?
                    ['SELECT id, date, time_start FROM class_sessions WHERE class_id = ? AND date BETWEEN ? AND ? ORDER BY date, time_start', [classId, dateFrom, dateTo]] :
                    ['SELECT id, date, time_start FROM class_sessions WHERE class_id = ? ORDER BY date, time_start', [classId]];

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
router.get('/schedules', async (req, res) => {
    const { classId, studentId } = req.query;
    try {
        const filters = [];
        const params = [];
        if (classId) { filters.push('class_id = ?'); params.push(classId); }
        if (studentId) { filters.push('student_id = ?'); params.push(studentId); }
        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const [rows] = await db.query(`SELECT * FROM schedules ${where} ORDER BY scheduled_at` , params);
        res.json({ success: true, schedules: rows });
    } catch (err) {
        console.error('GET /api/schedules error', err);
        res.status(500).json({ success: false, message: 'DB error' });
    }
});

// POST /api/classes/:id/schedules
// Create schedules for a student (studentId provided) OR create class-level schedules (studentId omitted/null).
// If creating class-level schedules, also create per-student copies for existing ACTIVE students and link them via meta.classScheduleId.
router.post('/:id/schedules', async (req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { studentId, sessionDates, sessionTimeStart, sessionTimeEnd } = req.body || {};
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) return res.status(400).json({ success: false, message: 'sessionDates required' });
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();
        const created = [];

        if (studentId) {
            // per-student schedules (existing behavior)
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
        } else {
            // class-level schedules: create schedule rows with student_id = NULL, then create per-student copies for existing students
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
                    const [r] = await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, NULL, ?, ?, ?, NOW())', [classId, 'CLASS_SCHEDULE', scheduledAt, meta]);
                    const classScheduleId = r.insertId;
                    created.push({ id: classScheduleId, scheduled_at: scheduledAt, meta: metaObj, classLevel: true });

                    // copy to existing active students in class
                    const [students] = await conn.query('SELECT student_id FROM class_students WHERE class_id = ? AND status = "ACTIVE"', [classId]);
                    for (const st of students) {
                        try {
                            const metaCopy = Object.assign({}, metaObj, { classScheduleId });
                            const metaCopyStr = JSON.stringify(metaCopy);
                            await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, st.student_id, 'ASSIGNED', scheduledAt, metaCopyStr]);
                        } catch (e) {
                            console.warn('Unable to create per-student copy of class schedule:', e && e.message ? e.message : e);
                        }
                    }
                } else {
                    const [r] = await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, NULL, ?, ?, NOW())', [classId, 'CLASS_SCHEDULE', meta]);
                    const classScheduleId = r.insertId;
                    created.push({ id: classScheduleId, scheduled_at: null, meta: metaObj, classLevel: true });
                    const [students] = await conn.query('SELECT student_id FROM class_students WHERE class_id = ? AND status = "ACTIVE"', [classId]);
                    for (const st of students) {
                        try {
                            const metaCopy = Object.assign({}, metaObj, { classScheduleId });
                            const metaCopyStr = JSON.stringify(metaCopy);
                            await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, st.student_id, 'ASSIGNED', metaCopyStr]);
                        } catch (e) {
                            console.warn('Unable to create per-student copy of class schedule:', e && e.message ? e.message : e);
                        }
                    }
                }
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
router.put('/schedules/:id', async (req, res) => {
    const scheduleId = parseInt(req.params.id, 10);
    const { scheduled_at, meta } = req.body || {};
    try {
        // determine if this schedule is a class-level schedule (student_id IS NULL)
        const [[orig]] = await db.query('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
        if (!orig) return res.status(404).json({ success: false, message: 'Schedule not found' });

        const fields = [];
        const vals = [];
        if (scheduled_at !== undefined) { fields.push('scheduled_at = ?'); vals.push(scheduled_at); }
        if (meta !== undefined) { fields.push('meta = ?'); vals.push(typeof meta === 'string' ? meta : JSON.stringify(meta)); }
        if (fields.length === 0) return res.json({ success: true });
        vals.push(scheduleId);
        await db.query(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`, vals);

        // If this is a class-level schedule, propagate updates to per-student copies that reference it via meta.classScheduleId
        if (orig.student_id === null) {
            try {
                const metaStr = typeof meta === 'string' ? meta : JSON.stringify(meta || {});
                // Update per-student schedules whose meta contains classScheduleId
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
        }

        res.json({ success: true });
    } catch (err) {
        console.error('PUT /api/schedules/:id error', err);
        res.status(500).json({ success: false, message: 'DB error' });
    }
});

// DELETE /api/schedules/:id
router.delete('/schedules/:id', async (req, res) => {
    const scheduleId = parseInt(req.params.id, 10);
    try {
        // If deleting a class-level schedule, also delete per-student copies that reference it
        const [[orig]] = await db.query('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
        if (!orig) return res.status(404).json({ success: false, message: 'Schedule not found' });
        if (orig.student_id === null) {
            try {
                const pattern = `%"classScheduleId":${scheduleId}%`;
                await db.query('DELETE FROM schedules WHERE class_id = ? AND student_id IS NOT NULL AND meta LIKE ?', [orig.class_id, pattern]);
            } catch (e) {
                console.warn('Unable to delete per-student copies of class schedule:', e && e.message ? e.message : e);
            }
        }
        await db.query('DELETE FROM schedules WHERE id = ?', [scheduleId]);
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/schedules/:id error', err);
        res.status(500).json({ success: false, message: 'DB error' });
    }
});