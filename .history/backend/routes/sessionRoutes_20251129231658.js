const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper: check overlap for given date/time (returns conflicting sessions)
async function findConflicts(conn, { date, time_start, time_end, room, teacher_id, excludeSessionId }) {
  const params = [date, time_end, time_start];
  let sql = `SELECT * FROM class_sessions WHERE date = ? AND NOT (time_end <= ? OR time_start >= ?)`;
  if (room) {
    sql += ' AND room = ?';
    params.push(room);
  }
  if (teacher_id) {
    sql += ' AND teacher_id = ?';
    params.push(teacher_id);
  }
  if (excludeSessionId) {
    sql += ' AND id <> ?';
    params.push(excludeSessionId);
  }
  const [rows] = await conn.query(sql, params);
  return rows;
}

// POST /api/classes/:id/sessions -> create one session with conflict checks
router.post('/classes/:id/sessions', async (req, res) => {
  const classId = parseInt(req.params.id, 10);
  const { date, time_start, time_end, room, teacher_id, meta } = req.body;
  let conn;
  try {
    conn = await db.getConnection();
    // check class exists
    const [[cls]] = await conn.query('SELECT id FROM classes WHERE id = ?', [classId]);
    if (!cls) return res.status(404).json({ success:false, message: 'Class not found' });

    // check overlaps for room and teacher separately
    const conflicts = [];
    const roomConf = room ? await findConflicts(conn, { date, time_start, time_end, room }) : [];
    if (roomConf.length) conflicts.push({ type: 'room', items: roomConf });
    const teacherConf = teacher_id ? await findConflicts(conn, { date, time_start, time_end, teacher_id }) : [];
    if (teacherConf.length) conflicts.push({ type: 'teacher', items: teacherConf });

    if (conflicts.length) {
      return res.status(409).json({ success:false, message: 'Conflicts found', conflicts });
    }

    const [result] = await conn.query(
      'INSERT INTO class_sessions (class_id, date, time_start, time_end, room, teacher_id, meta) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [classId, date, time_start, time_end, room || null, teacher_id || null, meta ? JSON.stringify(meta) : null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('POST /classes/:id/sessions error', err);
    res.status(500).json({ success:false, message: 'Server error' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/classes/:id/sessions/:sessionId -> update session with conflict checks
router.put('/classes/:id/sessions/:sessionId', async (req, res) => {
  const classId = parseInt(req.params.id, 10);
  const sessionId = parseInt(req.params.sessionId, 10);
  const { date, time_start, time_end, room, teacher_id, status, meta } = req.body;
  let conn;
  try {
    conn = await db.getConnection();
    const [[sess]] = await conn.query('SELECT * FROM class_sessions WHERE id = ? AND class_id = ?', [sessionId, classId]);
    if (!sess) return res.status(404).json({ success:false, message: 'Session not found' });

    // conflict check
    const conflicts = [];
    const roomConf = room ? await findConflicts(conn, { date: date || sess.date, time_start: time_start || sess.time_start, time_end: time_end || sess.time_end, room, excludeSessionId: sessionId }) : [];
    if (roomConf.length) conflicts.push({ type: 'room', items: roomConf });
    const teacherConf = teacher_id ? await findConflicts(conn, { date: date || sess.date, time_start: time_start || sess.time_start, time_end: time_end || sess.time_end, teacher_id, excludeSessionId: sessionId }) : [];
    if (teacherConf.length) conflicts.push({ type: 'teacher', items: teacherConf });
    if (conflicts.length) return res.status(409).json({ success:false, message: 'Conflicts found', conflicts });

    const fields = [];
    const values = [];
    const allowed = ['date','time_start','time_end','room','teacher_id','status','meta'];
    for (const k of allowed) {
      if (k in req.body) {
        fields.push(`${k} = ?`);
        values.push(k === 'meta' ? JSON.stringify(req.body[k]) : req.body[k]);
      }
    }
    if (fields.length === 0) return res.json({ success:true });
    values.push(sessionId);
    await conn.query(`UPDATE class_sessions SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /classes/:id/sessions/:sessionId error', err);
    res.status(500).json({ success:false, message: 'Server error' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/classes/:id/sessions/:sessionId -> mark cancelled
router.delete('/classes/:id/sessions/:sessionId', async (req, res) => {
  const classId = parseInt(req.params.id, 10);
  const sessionId = parseInt(req.params.sessionId, 10);
  try {
    const [result] = await db.query('UPDATE class_sessions SET status = "CANCELLED" WHERE id = ? AND class_id = ?', [sessionId, classId]);
    if (result.affectedRows === 0) return res.status(404).json({ success:false, message: 'Session not found' });
    res.json({ success:true });
  } catch (err) {
    console.error('DELETE /classes/:id/sessions/:sessionId error', err);
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

// GET /api/sessions -> list sessions by filter
router.get('/sessions', async (req, res) => {
  const { dateFrom, dateTo, classId, teacherId, room } = req.query;
  try {
    const clauses = [];
    const params = [];
    if (dateFrom) { clauses.push('date >= ?'); params.push(dateFrom); }
    if (dateTo) { clauses.push('date <= ?'); params.push(dateTo); }
    if (classId) { clauses.push('class_id = ?'); params.push(classId); }
    if (teacherId) { clauses.push('teacher_id = ?'); params.push(teacherId); }
    if (room) { clauses.push('room = ?'); params.push(room); }
    const where = clauses.length ? ('WHERE ' + clauses.join(' AND ')) : '';
    const [rows] = await db.query(`SELECT * FROM class_sessions ${where} ORDER BY date, time_start`, params);
    res.json({ success: true, sessions: rows });
  } catch (err) {
    console.error('GET /sessions error', err);
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

module.exports = router;
