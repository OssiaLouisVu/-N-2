#!/usr/bin/env node
const pool = require('../db');
(async function(){
  try {
    const [rows] = await pool.query("SELECT id, username, student_id, role, password IS NOT NULL AS has_password FROM users WHERE username = 'student1' LIMIT 1");
    console.log('user:', rows);
    await pool.end();
  } catch (e) {
    console.error(e);
    try{ await pool.end(); } catch(_){}
    process.exit(1);
  }
})();
