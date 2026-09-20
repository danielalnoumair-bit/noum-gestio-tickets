const bcrypt = require('bcryptjs');
const db = require('./db');

const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

if (ADMIN_USERNAME && ADMIN_PASSWORD) {
  const existing = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(ADMIN_USERNAME);
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

  if (existing) {
    db.prepare('UPDATE usuarios SET password_hash = ? WHERE username = ?').run(hash, ADMIN_USERNAME);
  } else {
    db.prepare('INSERT INTO usuarios (username, password_hash) VALUES (?, ?)').run(ADMIN_USERNAME, hash);
    console.log(`Usuario de IT "${ADMIN_USERNAME}" creado a partir de ADMIN_USERNAME/ADMIN_PASSWORD.`);
  }
}
