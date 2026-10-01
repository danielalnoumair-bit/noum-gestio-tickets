const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');
const requireEditor = require('../middleware/requireEditor');
const { ESTADOS_PRESUPUESTO } = require('../constants');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const presupuestos = db.prepare('SELECT * FROM presupuestos ORDER BY created_at DESC').all();
  res.json(presupuestos);
});

router.post('/', requireEditor, (req, res) => {
  const { concepto, proveedor, importe } = req.body || {};

  if (!concepto?.trim() || importe === undefined || importe === null || isNaN(Number(importe))) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const result = db
    .prepare('INSERT INTO presupuestos (concepto, proveedor, importe) VALUES (?, ?, ?)')
    .run(concepto.trim(), proveedor?.trim() || null, Number(importe));

  res.status(201).json(db.prepare('SELECT * FROM presupuestos WHERE id = ?').get(result.lastInsertRowid));
});

router.patch('/:id', requireEditor, (req, res) => {
  const presupuesto = db.prepare('SELECT * FROM presupuestos WHERE id = ?').get(req.params.id);
  if (!presupuesto) return res.status(404).json({ error: 'Presupuesto no encontrado' });

  const concepto = req.body?.concepto?.trim() || presupuesto.concepto;
  const proveedor = req.body?.proveedor !== undefined ? req.body.proveedor?.trim() || null : presupuesto.proveedor;
  const importe = req.body?.importe !== undefined ? Number(req.body.importe) : presupuesto.importe;
  const estado = req.body?.estado ?? presupuesto.estado;

  if (!ESTADOS_PRESUPUESTO.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }
  if (isNaN(importe)) {
    return res.status(400).json({ error: 'Importe no válido' });
  }

  db.prepare(
    `UPDATE presupuestos SET concepto = ?, proveedor = ?, importe = ?, estado = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(concepto, proveedor, importe, estado, req.params.id);

  res.json(db.prepare('SELECT * FROM presupuestos WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireEditor, (req, res) => {
  const presupuesto = db.prepare('SELECT id FROM presupuestos WHERE id = ?').get(req.params.id);
  if (!presupuesto) return res.status(404).json({ error: 'Presupuesto no encontrado' });

  db.prepare('DELETE FROM presupuestos WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
