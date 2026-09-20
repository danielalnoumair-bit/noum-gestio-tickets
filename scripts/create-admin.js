const bcrypt = require('bcryptjs');
const db = require('../src/db');

const [, , username, password] = process.argv;

if (!username || !password) {
  console.log('Uso: npm run create-admin -- <usuario> <contraseña>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
const existing = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(username);

if (existing) {
  db.prepare('UPDATE usuarios SET password_hash = ? WHERE username = ?').run(hash, username);
  console.log(`Contraseña actualizada para el usuario "${username}".`);
} else {
  db.prepare('INSERT INTO usuarios (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log(`Usuario "${username}" creado correctamente.`);
}
