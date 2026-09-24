const bcrypt = require('bcryptjs');
const db = require('./db');

function seedUser(username, password, role) {
  const existing = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(username);
  const hash = bcrypt.hashSync(password, 10);

  if (existing) {
    db.prepare('UPDATE usuarios SET password_hash = ?, rol = ? WHERE username = ?').run(hash, role, username);
    return;
  }

  db.prepare('INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, ?)').run(username, hash, role);
  console.log(`Usuario "${username}" creado con rol ${role}.`);
}

seedUser('admin', 'admin', 'editor');
seedUser('consulta', 'consulta', 'viewer');

const configuredAdmin = process.env.ADMIN_USERNAME;
const configuredAdminPassword = process.env.ADMIN_PASSWORD;
if (configuredAdmin && configuredAdminPassword && configuredAdmin !== 'admin') {
  seedUser(configuredAdmin, configuredAdminPassword, 'editor');
}

const configuredViewer = process.env.VIEWER_USERNAME;
const configuredViewerPassword = process.env.VIEWER_PASSWORD;
if (configuredViewer && configuredViewerPassword && configuredViewer !== 'consulta') {
  seedUser(configuredViewer, configuredViewerPassword, 'viewer');
}
