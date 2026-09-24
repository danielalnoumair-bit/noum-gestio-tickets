const express = require('express');
const path = require('node:path');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');
const requireEditor = require('../middleware/requireEditor');
const upload = require('../upload');
const { CATEGORIAS, ESTADOS } = require('../constants');
const { buildFilters } = require('../filters');

const router = express.Router();

router.post('/', upload.single('foto'), (req, res) => {
  const { nombre_reportante, aula_id, categoria, descripcion } = req.body || {};

  if (!nombre_reportante?.trim() || !aula_id || !categoria || !descripcion?.trim()) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  if (!CATEGORIAS.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría no válida' });
  }
  const aula = db.prepare('SELECT id FROM aulas WHERE id = ?').get(aula_id);
  if (!aula) {
    return res.status(400).json({ error: 'Aula no válida' });
  }

  const result = db
    .prepare(
      `INSERT INTO tickets (nombre_reportante, aula_id, categoria, descripcion, foto_filename)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      nombre_reportante.trim(),
      aula_id,
      categoria,
      descripcion.trim(),
      req.file ? req.file.filename : null
    );

  res.status(201).json({ id: result.lastInsertRowid });
});

router.get('/', requireAuth, (req, res) => {
  const { where, params } = buildFilters(req.query);
  const tickets = db
    .prepare(
      `SELECT t.*, a.nombre AS aula_nombre
       FROM tickets t
       JOIN aulas a ON a.id = t.aula_id
       ${where}
       ORDER BY t.created_at DESC`
    )
    .all(...params);
  res.json(tickets);
});

router.get('/:id', requireAuth, (req, res) => {
  const ticket = db
    .prepare(
      `SELECT t.*, a.nombre AS aula_nombre
       FROM tickets t JOIN aulas a ON a.id = t.aula_id
       WHERE t.id = ?`
    )
    .get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
  res.json(ticket);
});

router.patch('/:id', requireEditor, (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

  const estado = req.body?.estado ?? ticket.estado;
  const nota_interna = req.body?.nota_interna ?? ticket.nota_interna;

  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  db.prepare(
    `UPDATE tickets SET estado = ?, nota_interna = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(estado, nota_interna, req.params.id);

  res.json(db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id));
});

router.get('/:id/foto', requireAuth, (req, res) => {
  const ticket = db.prepare('SELECT foto_filename FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket || !ticket.foto_filename) return res.status(404).end();
  res.sendFile(path.join(__dirname, '..', '..', 'data', 'uploads', ticket.foto_filename));
});

module.exports = router;
