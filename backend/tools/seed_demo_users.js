// backend/tools/seed_demo_users.js
// Insert demo users with unified password `pass1234` if they do not already exist.
// Usage: npm run seed:demo-users
// Safe: only inserts missing accounts, does not overwrite existing passwords.

const bcrypt = require('bcryptjs');
const db = require('../db');

const DEMO_USERS = [
  { username: 'student1', role: 'STUDENT' },
  { username: 'teacher1', role: 'TEACHER' },
  { username: 'staff1', role: 'STAFF' },
  { username: 'accountant1', role: 'ACCOUNTANT' },
  { username: 'manager1', role: 'MANAGER' },
];

const PASSWORD_PLAIN = 'pass1234';

async function ensureUsers() {
  const hashed = bcrypt.hashSync(PASSWORD_PLAIN, 10);
  for (const u of DEMO_USERS) {
    try {
      const [rows] = await db.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [u.username]);
      if (rows.length > 0) {
        console.log(`✔ User ${u.username} already exists (id=${rows[0].id}) – skipping.`);
        continue;
      }
      const [res] = await db.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [u.username, hashed, u.role]
      );
      console.log(`➕ Inserted user ${u.username} (role=${u.role}, id=${res.insertId})`);
    } catch (err) {
      console.error(`❌ Error processing user ${u.username}:`, err.message);
    }
  }
  console.log('\nDone. Demo password for ALL accounts:', PASSWORD_PLAIN);
  process.exit(0);
}

ensureUsers().catch(err => {
  console.error('Fatal error seeding demo users:', err);
  process.exit(1);
});
