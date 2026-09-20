const express = require('express');
const QRCode = require('qrcode');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', (req, res) => {
  const aulas = db.prepare('SELECT * FROM aulas ORDER BY nombre').all();
  res.json(aulas);
});

router.post('/', requireAuth, (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del aula es obligatorio' });
  }
  try {
    const result = db.prepare('INSERT INTO aulas (nombre) VALUES (?)').run(nombre);
    const aula = db.prepare('SELECT * FROM aulas WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(aula);
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ya existe un aula con ese nombre' });
    }
    throw err;
  }
});

router.put('/:id', requireAuth, (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del aula es obligatorio' });
  }
  const aula = db.prepare('SELECT * FROM aulas WHERE id = ?').get(req.params.id);
  if (!aula) return res.status(404).json({ error: 'Aula no encontrada' });

  db.prepare('UPDATE aulas SET nombre = ? WHERE id = ?').run(nombre, req.params.id);
  res.json(db.prepare('SELECT * FROM aulas WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  const enUso = db.prepare('SELECT COUNT(*) AS n FROM tickets WHERE aula_id = ?').get(req.params.id);
  if (enUso.n > 0) {
    return res.status(400).json({ error: 'No se puede borrar: hay tickets asociados a esta aula' });
  }
  db.prepare('DELETE FROM aulas WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/:id/qr', requireAuth, async (req, res) => {
  const aula = db.prepare('SELECT * FROM aulas WHERE id = ?').get(req.params.id);
  if (!aula) return res.status(404).json({ error: 'Aula no encontrada' });

  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${base.replace(/\/$/, '')}/nuevo/?aula=${aula.id}`;
  const png = await QRCode.toBuffer(url, { width: 400, margin: 2 });
  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', `inline; filename="qr-aula-${aula.id}.png"`);
  res.send(png);
});

module.exports = router;
