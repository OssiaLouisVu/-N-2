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
router.post('/:id/assign', async(req, res) => {
    const classId = parseInt(req.params.id, 10);
    const { studentId } = req.body;
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        const [
            [cls]
        ] = await conn.query('SELECT capacity FROM classes WHERE id = ?', [classId]);
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