// scripts/runMigrations.js
// Run SQL files in backend/migrations in alphabetical order.
const fs = require('fs');
const path = require('path');
const db = require('../db');

async function run() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  console.log('Found migrations:', files);
  for (const file of files) {
    const p = path.join(migrationsDir, file);
    console.log('\n--- Running', file, '---');
    const sql = fs.readFileSync(p, 'utf8');
    try {
      const [res] = await db.query(sql);
      console.log('OK:', file);
    } catch (err) {
      console.error('Error running', file, err.message);
      process.exitCode = 2;
      return;
    }
  }
  console.log('\nAll migrations completed.');
  process.exit(0);
}

run().catch(err => {
  console.error('Migration script error:', err);
  process.exit(1);
});
