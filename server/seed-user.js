/**
 * seed-user.js
 * Run once: node server/seed-user.js
 * Creates the default author account in the users table.
 * Safe to re-run — uses INSERT OR IGNORE.
 *
 * Default credentials:
 *   username : admin
 *   password : admin123
 *
 * Change the values below before running in production.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const USERNAME = process.env.AUTHOR_USERNAME || 'admin';
const PASSWORD = process.env.AUTHOR_PASSWORD || 'admin123';

(async () => {
  const hash = await bcrypt.hash(PASSWORD, 12);

  const stmt = db.prepare(
    'INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)'
  );
  const result = stmt.run(USERNAME, hash);

  if (result.changes > 0) {
    console.log(`✅  User "${USERNAME}" created successfully.`);
    console.log(`    Password: ${PASSWORD}`);
    console.log(`\n    Change your password after first login!`);
  } else {
    console.log(`ℹ️  User "${USERNAME}" already exists — no changes made.`);
  }

  process.exit(0);
})();
