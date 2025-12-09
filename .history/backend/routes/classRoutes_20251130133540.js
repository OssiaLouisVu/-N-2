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

                // Copy existing class-level schedules (if any) into this newly assigned student's schedules
                try {
                    const [classSchedules] = await conn.query('SELECT * FROM class_schedules WHERE class_id = ?', [classId]);
                    for (const cs of classSchedules) {
                        const metaObj = cs.meta ? (typeof cs.meta === 'string' ? JSON.parse(cs.meta) : cs.meta) : {};
                        metaObj.classScheduleId = cs.id;
                        const metaStr = JSON.stringify(metaObj);
                        if (cs.scheduled_at) {
                            await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', cs.scheduled_at, metaStr]);
                        } else {
                            await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', metaStr]);
                        }
                    }
                } catch (e) {
                    console.warn('Unable to copy class_schedules to newly assigned student:', e && e.message ? e.message : e);
                }

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

// ----- Class-level schedules endpoints -----
// POST /api/classes/:id/schedules
// Body options:
// - studentId (optional) : if provided, create per-student schedules only
// - sessionDates: array of 'YYYY-MM-DD'
// - sessionTimeStart: 'HH:MM'
// - sessionTimeEnd: 'HH:MM'
router.post('/:id/schedules', async (req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { studentId, sessionDates, sessionTimeStart, sessionTimeEnd } = req.body || {};
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // If no studentId: create class-level schedules (class_schedules) and copy to ACTIVE students
        if (!studentId) {
            if (!Array.isArray(sessionDates) || sessionDates.length === 0) {
                await conn.rollback();
                return res.status(400).json({ success: false, message: 'sessionDates required for class-level schedule' });
            }
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
                const scheduledAt = start ? `${dateStr} ${start}` : null;
                // --- Remove any existing class-level schedule for this class+date (or meta providedSessionDate) ---
                try {
                    // Find existing class_schedules that match this class and date (either scheduled_at date or meta.providedSessionDate)
                    const [existingCS] = await conn.query(
                        `SELECT id, scheduled_at, meta FROM class_schedules WHERE class_id = ? AND (DATE(scheduled_at) = ? OR meta LIKE ?)`,
                        [classId, dateStr, `%"providedSessionDate":"${dateStr}"%`]
                    );
                    if (existingCS && existingCS.length > 0) {
                        const ids = existingCS.map(r => r.id);
                        // delete class_schedules rows
                        await conn.query(`DELETE FROM class_schedules WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
                        // delete copied schedules for students that reference these classScheduleId in meta
                        for (const delId of ids) {
                            // remove schedules with explicit classScheduleId marker
                            await conn.query('DELETE FROM schedules WHERE class_id = ? AND meta LIKE ?', [classId, `%"classScheduleId":${delId}%`]);
                            // also remove schedules that have the same date and meta.providedSessionDate (fallback)
                            await conn.query('DELETE FROM schedules WHERE class_id = ? AND DATE(scheduled_at) = ? AND (meta LIKE ? OR meta LIKE ?)', [classId, dateStr, `%"providedSessionDate":"${dateStr}"%`, `%${dateStr}%`]);
                        }
                    }
                } catch (e) {
                    console.warn('Unable to cleanup existing class_schedules for date', dateStr, e && e.message ? e.message : e);
                }

                // Insert new class_schedule for this date
                const [r] = scheduledAt
                    ? await conn.query('INSERT INTO class_schedules (class_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, 'ASSIGNED', scheduledAt, meta])
                    : await conn.query('INSERT INTO class_schedules (class_id, action, meta, created_at) VALUES (?, ?, ?, NOW())', [classId, 'ASSIGNED', meta]);
                const csId = r.insertId;
                created.push({ id: csId, scheduled_at: scheduledAt, meta: metaObj });

                // Copy to active students in this class (create fresh per-student schedule entries)
                const [students] = await conn.query('SELECT student_id FROM class_students WHERE class_id = ? AND status = "ACTIVE"', [classId]);
                for (const s of students) {
                    const metaCopy = { ...metaObj, classScheduleId: csId };
                    const metaStr = JSON.stringify(metaCopy);
                    if (scheduledAt) {
                        await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, s.student_id, 'ASSIGNED', scheduledAt, metaStr]);
                    } else {
                        await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, s.student_id, 'ASSIGNED', metaStr]);
                    }
                }
            }
            await conn.commit();
            return res.json({ success: true, created });
        }

        // If studentId provided: create per-student schedules (legacy behavior)
        if (!Array.isArray(sessionDates) || sessionDates.length === 0) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'sessionDates required' });
        }
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
        return res.json({ success: true, created });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('POST /api/classes/:id/schedules error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Enhance assign endpoint: after assigning, copy any existing class_schedules into student's schedules
// (This keeps student calendar in sync if class schedules already existed)
// We'll patch assign behavior by intercepting class_schedules copying after adding class_students
// NOTE: The existing assign route above already exists; to avoid duplicating logic here, the assign route
// includes copying class_schedules into per-student schedules when present.