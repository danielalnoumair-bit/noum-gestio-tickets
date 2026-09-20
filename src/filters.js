const { CATEGORIAS, ESTADOS } = require('./constants');

function buildFilters(query) {
  const clauses = [];
  const params = [];

  if (query.estado && ESTADOS.includes(query.estado)) {
    clauses.push('t.estado = ?');
    params.push(query.estado);
  }
  if (query.categoria && CATEGORIAS.includes(query.categoria)) {
    clauses.push('t.categoria = ?');
    params.push(query.categoria);
  }
  if (query.aula_id) {
    clauses.push('t.aula_id = ?');
    params.push(query.aula_id);
  }
  if (query.desde) {
    clauses.push('date(t.created_at) >= date(?)');
    params.push(query.desde);
  }
  if (query.hasta) {
    clauses.push('date(t.created_at) <= date(?)');
    params.push(query.hasta);
  }
  if (query.q) {
    clauses.push('(t.nombre_reportante LIKE ? OR t.descripcion LIKE ?)');
    const like = `%${query.q}%`;
    params.push(like, like);
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

module.exports = { buildFilters };
