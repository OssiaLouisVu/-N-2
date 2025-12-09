#!/usr/bin/env node
/**
 * Cleanup historical duplicate class schedules and their per-student copies.
 *
 * Definition of duplicate:
 *  Same class_id AND same meta.providedSessionDate AND meta.start AND meta.end
 *
 * Strategy:
 *  - Group all rows in class_schedules by (date,start,end)
 *  - Keep ONE (the oldest by id) per group, delete the others
 *  - For each deleted class_schedules.id, delete schedules rows whose meta.classScheduleId matches
 *
 * Usage:
 *  node scripts/cleanup_duplicates.js <classId> [--dry]
 *
 * Example:
 *  node scripts/cleanup_duplicates.js 10 --dry   # Show what would be deleted
 *  node scripts/cleanup_duplicates.js 10         # Perform deletion
 */

// Use existing pool configuration (db.js) to keep credentials centralized
const pool = require('../db');

function buildKey(meta) {
  if (!meta) return null;
  return [meta.providedSessionDate, meta.start, meta.end].join('|');
}

async function cleanup(classId, dryRun=false) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT id, meta, scheduled_at FROM class_schedules WHERE class_id = ?',
      [classId]
    );

    if (!rows.length) {
      console.log(`No class_schedules rows found for class ${classId}`);
      return;
    }

    // Group rows
    const groups = new Map();
    for (const row of rows) {
      let meta = row.meta;
      // mysql2 returns JSON column already parsed; if string, try parse
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch (e) { /* ignore */ }
      }
      const key = buildKey(meta);
      if (!key || !meta.providedSessionDate || !meta.start || !meta.end) {
        // Skip rows missing required meta pieces
        continue;
      }
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ id: row.id, meta });
    }

    const toDeleteIds = [];
    const keepMap = new Map();
    for (const [key, list] of groups.entries()) {
      if (list.length <= 1) continue; // not duplicate
      // Sort ascending id, keep oldest (id smallest) for stability
      list.sort((a,b)=> a.id - b.id);
      const keep = list[0];
      keepMap.set(key, keep.id);
      const duplicates = list.slice(1);
      duplicates.forEach(d => toDeleteIds.push(d.id));
    }

    if (!toDeleteIds.length) {
      console.log('No historical duplicates detected. Nothing to do.');
      return;
    }

    console.log('Duplicate groups detected:');
    for (const [key, keepId] of keepMap.entries()) {
      const parts = key.split('|');
      const kept = keepId;
      const deleted = groups.get(key).filter(r => r.id !== keepId).map(r => r.id);
      if (deleted.length) {
        console.log(`  ${parts[0]} ${parts[1]}-${parts[2]} -> keep #${kept}, delete [${deleted.join(', ')}]`);
      }
    }

    if (dryRun) {
      console.log('\nDry run mode: no deletions executed.');
      return;
    }

    await conn.beginTransaction();
    // Delete class_schedules duplicates
    const chunkSize = 50;
    for (let i=0; i<toDeleteIds.length; i+=chunkSize) {
      const chunk = toDeleteIds.slice(i, i+chunkSize);
      await conn.query(
        `DELETE FROM class_schedules WHERE id IN (${chunk.map(()=>'?').join(',')})`,
        chunk
      );
    }

    // Delete per-student schedules referencing deleted classScheduleId
    // meta.classScheduleId stored inside JSON meta
    const [scheduleRows] = await conn.query(
      'SELECT id, meta FROM schedules WHERE class_id = ?',
      [classId]
    );
    const perStudentDeleteIds = [];
    for (const s of scheduleRows) {
      let meta = s.meta;
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch (e) { /* ignore */ }
      }
      if (meta && toDeleteIds.includes(meta.classScheduleId)) {
        perStudentDeleteIds.push(s.id);
      }
    }

    for (let i=0; i<perStudentDeleteIds.length; i+=chunkSize) {
      const chunk = perStudentDeleteIds.slice(i, i+chunkSize);
      await conn.query(
        `DELETE FROM schedules WHERE id IN (${chunk.map(()=>'?').join(',')})`,
        chunk
      );
    }

    await conn.commit();
    console.log(`Deleted ${toDeleteIds.length} duplicate class_schedules rows and ${perStudentDeleteIds.length} per-student schedules.`);
  } catch (err) {
    console.error('Cleanup failed:', err);
    try { await conn.rollback(); } catch (_) { /* ignore */ }
  } finally {
    conn.release();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log('Usage: node scripts/cleanup_duplicates.js <classId> [--dry]');
    process.exit(1);
  }
  const classId = parseInt(args[0], 10);
  if (isNaN(classId)) {
    console.error('classId must be a number');
    process.exit(1);
  }
  const dryRun = args.includes('--dry');
  await cleanup(classId, dryRun);
}

main();
