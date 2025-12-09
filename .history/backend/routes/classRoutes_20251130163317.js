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
// PUT /api/classes/:id/schedules
router.put('/:id/schedules', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { sessionDates, sessionTimeStart, sessionTimeEnd } = req.body || {};
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // Kiểm tra xem lớp có lịch lớp (class_schedules) chưa
        const [classSchedules] = await conn.query('SELECT * FROM class_schedules WHERE class_id = ?', [classId]);
        if (classSchedules.length === 0) {
            return res.status(404).json({ success: false, message: 'No class schedules found for this class.' });
        }

        // Cập nhật lịch lớp (class_schedules)
        const updatedSchedules = [];
        const currentDate = new Date();
        for (const date of sessionDates) {
            const d = new Date(date);
            if (isNaN(d.getTime())) continue; // Skip invalid dates

            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            const startTime = sessionTimeStart || null;
            const endTime = sessionTimeEnd || null;

            // Cập nhật lịch lớp trong class_schedules
            const [result] = await conn.query(
                `UPDATE class_schedules SET scheduled_at = ?, meta = ? WHERE class_id = ? AND date = ?`, [dateStr + ' ' + startTime, JSON.stringify({ providedSessionDate: dateStr, start: startTime, end: endTime }), classId, dateStr]
            );
            updatedSchedules.push(result);

            // Cập nhật lịch học viên (schedules)
            const [students] = await conn.query('SELECT student_id FROM class_students WHERE class_id = ? AND status = "ACTIVE"', [classId]);
            for (const student of students) {
                const metaObj = { providedSessionDate: dateStr, start: startTime, end: endTime };
                const metaStr = JSON.stringify(metaObj);

                // Cập nhật lịch học viên cho mỗi học viên liên quan
                await conn.query(
                    `UPDATE schedules SET scheduled_at = ?, meta = ? WHERE class_id = ? AND student_id = ? AND scheduled_at LIKE ?`, [dateStr + ' ' + startTime, metaStr, classId, student.student_id, `${dateStr}%`]
                );
            }
        }

        await conn.commit();
        res.json({ success: true, message: 'Class schedules and student schedules updated successfully.' });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('PUT /api/classes/:id/schedules error', err);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        if (conn) conn.release();
    }
});


// DELETE /api/classes/:id
// DELETE /api/classes/:id
router.delete('/:id', async(req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        await db.query('DELETE FROM classes WHERE id = ?', [id]);
        // Xóa tất cả các lịch học viên liên quan đến lớp này
        await db.query('DELETE FROM schedules WHERE class_id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/classes/:id error', err);
        res.status(500).json({ success: false });
    }
});


// POST /api/classes/:id/assign
// Optional body: { studentId, sessionDates: ['2025-12-01','2025-12-02', ...], sessionTimeStart: '09:00', sessionTimeEnd: '11:00' }
// POST /api/classes/:id/assign
// POST /api/classes/:id/assign
router.post('/:id/assign', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { studentId, sessionDates, sessionTimeStart, sessionTimeEnd } = req.body || {};
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // Kiểm tra xem lớp có lịch lớp chưa (class_schedules)
        const [classSchedules] = await conn.query('SELECT COUNT(*) AS count FROM class_schedules WHERE class_id = ?', [classId]);
        if (classSchedules[0].count === 0) {
            throw { code: 'SCHEDULE_REQUIRED', message: 'Class schedules must be created before assigning students' };
        }

        // Kiểm tra lớp và học viên
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

        // Thêm học viên vào lớp
        await conn.query('INSERT INTO class_students (class_id, student_id, status) VALUES (?, ?, "ACTIVE")', [classId, studentId]);
        await conn.query('INSERT INTO schedules (class_id, student_id, action) VALUES (?, ?, "ASSIGNED")', [classId, studentId]);
        await conn.query('UPDATE students SET status = "ACTIVE" WHERE id = ?', [studentId]);

        // Sao chép lịch lớp vào lịch của học viên
        const [classSchedulesToCopy] = await conn.query('SELECT * FROM class_schedules WHERE class_id = ?', [classId]);
        for (const cs of classSchedulesToCopy) {
            try {
                const metaObj = cs.meta ? (typeof cs.meta === 'string' ? JSON.parse(cs.meta) : cs.meta) : {};
                metaObj.classScheduleId = cs.id; // Lưu trữ classScheduleId trong meta
                const metaStr = JSON.stringify(metaObj);

                // Sao chép lịch cho học viên
                if (cs.scheduled_at) {
                    await conn.query('INSERT INTO schedules (class_id, student_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', cs.scheduled_at, metaStr]);
                } else {
                    await conn.query('INSERT INTO schedules (class_id, student_id, action, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, studentId, 'ASSIGNED', metaStr]);
                }
            } catch (e) {
                console.warn('Unable to copy class-level schedule to student on assign:', e && e.message ? e.message : e);
            }
        }

        // Phần tạo lịch học viên nếu có sessionDates...
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
        }

        await conn.commit();
        res.json({ success: true, message: 'Assigned student to class' });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('POST /api/classes/:id/assign error', err);
        if (err.code === 'CAPACITY' || err.code === 'DUPLICATE') return res.status(400).json({ success: false, message: err.message });
        if (err.code === 'SCHEDULE_REQUIRED') return res.status(400).json({ success: false, message: err.message });
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
        if (classId) {
            filters.push('class_id = ?');
            params.push(classId);
        }
        if (studentId) {
            filters.push('student_id = ?');
            params.push(studentId);
        }
        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const [rows] = await db.query(`SELECT * FROM schedules ${where} ORDER BY scheduled_at`, params);
        res.json({ success: true, schedules: rows });
    } catch (err) {
        console.error('GET /api/schedules error', err);
        res.status(500).json({ success: false, message: 'DB error' });
    }
});

// POST /api/classes/:id/schedules
// Create schedules for a student (studentId provided) OR create class-level schedules (studentId omitted/null).
// If creating class-level schedules, also create per-student copies for existing ACTIVE students and link them via meta.classScheduleId.
router.post('/:id/schedules', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { studentId, sessionDates, sessionTimeStart, sessionTimeEnd, replaceAll } = req.body || {};
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) return res.status(400).json({ success: false, message: 'sessionDates required' });
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();
        // If creating class-level schedules with replaceAll=true, wipe old class schedules and student copies first
        if (!studentId && String(replaceAll || 'false').toLowerCase() === 'true') {
            try {
                // Delete per-student copies for this class
                await conn.query(
                    `DELETE FROM schedules 
                     WHERE class_id = ? 
                       AND action = 'ASSIGNED' 
                       AND meta IS NOT NULL`,
                    [classId]
                );
                // Delete class-level schedules
                await conn.query(
                    `DELETE FROM class_schedules 
                     WHERE class_id = ?`,
                    [classId]
                );
            } catch (wipeErr) {
                console.warn('replaceAll wipe failed:', wipeErr && wipeErr.message ? wipeErr.message : wipeErr);
            }
        }
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
                    // insert into class_schedules
                    const [r] = await conn.query('INSERT INTO class_schedules (class_id, action, scheduled_at, meta, created_at) VALUES (?, ?, ?, ?, NOW())', [classId, 'CLASS_SCHEDULE', scheduledAt, meta]);
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
                    const [r] = await conn.query('INSERT INTO class_schedules (class_id, action, meta, created_at) VALUES (?, ?, ?, NOW())', [classId, 'CLASS_SCHEDULE', meta]);
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
        res.json({ success: true, created, replaced: Boolean(!studentId && String(replaceAll || 'false').toLowerCase() === 'true') });
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
        // Try to find schedule in per-student schedules table
        const [
            [origSched]
        ] = await db.query('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
        if (origSched) {
            // update per-student schedule
            const fields = [];
            const vals = [];
            if (scheduled_at !== undefined) {
                fields.push('scheduled_at = ?');
                vals.push(scheduled_at);
            }
            if (meta !== undefined) {
                fields.push('meta = ?');
                vals.push(typeof meta === 'string' ? meta : JSON.stringify(meta));
            }
            if (fields.length === 0) return res.json({ success: true });
            vals.push(scheduleId);
            await db.query(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`, vals);
            return res.json({ success: true });
        }

        // If not found, maybe it's a class-level schedule stored in class_schedules
        const [
            [orig]
        ] = await db.query('SELECT * FROM class_schedules WHERE id = ?', [scheduleId]);
        if (!orig) return res.status(404).json({ success: false, message: 'Schedule not found' });

        const fields = [];
        const vals = [];
        if (scheduled_at !== undefined) {
            fields.push('scheduled_at = ?');
            vals.push(scheduled_at);
        }
        if (meta !== undefined) {
            fields.push('meta = ?');
            vals.push(typeof meta === 'string' ? meta : JSON.stringify(meta));
        }
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