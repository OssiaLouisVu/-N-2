const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/attendance?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, message: 'Thiếu tham số date (YYYY-MM-DD)' });
  }
  try {
    const [rows] = await db.execute(
      `SELECT a.id, a.employee_id, e.full_name, a.date, a.status, a.note
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       WHERE a.date = ?
       ORDER BY e.full_name ASC`,
      [date]
    );
    res.json({ success: true, records: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/attendance - bulk upsert
// Body: { date: 'YYYY-MM-DD', items: [{ employee_id, status, note }] }
router.post('/', async (req, res) => {
  const { date, items } = req.body || {};
  if (!date || !Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Thiếu date hoặc items' });
  }
  try {
    for (const it of items) {
      if (!it.employee_id || !it.status) continue;
      // Upsert: if record exists for (employee_id, date), update; else insert
      const [exists] = await db.execute(
        `SELECT id FROM attendance WHERE employee_id = ? AND date = ?`,
        [it.employee_id, date]
      );
      if (exists && exists.length > 0) {
        await db.execute(
          `UPDATE attendance SET status = ?, note = ? WHERE id = ?`,
          [it.status, it.note || null, exists[0].id]
        );
      } else {
        await db.execute(
          `INSERT INTO attendance (employee_id, date, status, note) VALUES (?, ?, ?, ?)`,
          [it.employee_id, date, it.status, it.note || null]
        );
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/attendance/:id - update single record
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { status, note } = req.body || {};
  if (!status) {
    return res.status(400).json({ success: false, message: 'Thiếu status' });
  }
  try {
    await db.execute(`UPDATE attendance SET status = ?, note = ? WHERE id = ?`, [status, note || null, id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
