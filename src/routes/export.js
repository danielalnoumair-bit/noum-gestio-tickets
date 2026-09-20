const express = require('express');
const ExcelJS = require('exceljs');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');
const { buildFilters } = require('../filters');

const router = express.Router();

const ESTADO_LABEL = {
  abierto: 'Abierto',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
};

router.get('/', requireAuth, async (req, res) => {
  const { where, params } = buildFilters(req.query);
  const tickets = db
    .prepare(
      `SELECT t.*, a.nombre AS aula_nombre
       FROM tickets t JOIN aulas a ON a.id = t.aula_id
       ${where}
       ORDER BY t.created_at DESC`
    )
    .all(...params);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tickets');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Fecha creación', key: 'created_at', width: 20 },
    { header: 'Reportado por', key: 'nombre_reportante', width: 22 },
    { header: 'Aula', key: 'aula_nombre', width: 18 },
    { header: 'Categoría', key: 'categoria', width: 16 },
    { header: 'Descripción', key: 'descripcion', width: 40 },
    { header: 'Estado', key: 'estado', width: 14 },
    { header: 'Nota interna', key: 'nota_interna', width: 30 },
    { header: 'Última actualización', key: 'updated_at', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const t of tickets) {
    sheet.addRow({ ...t, estado: ESTADO_LABEL[t.estado] || t.estado });
  }

  res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.set('Content-Disposition', 'attachment; filename="tickets.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
