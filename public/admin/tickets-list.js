const tbody = document.getElementById('tbody-tickets');
const sinResultados = document.getElementById('sin-resultados');
const fAula = document.getElementById('f-aula');

function buildQuery() {
  const params = new URLSearchParams();
  const estado = document.getElementById('f-estado').value;
  const categoria = document.getElementById('f-categoria').value;
  const aula_id = fAula.value;
  const q = document.getElementById('f-q').value.trim();
  const desde = document.getElementById('f-desde').value;
  const hasta = document.getElementById('f-hasta').value;

  if (estado) params.set('estado', estado);
  if (categoria) params.set('categoria', categoria);
  if (aula_id) params.set('aula_id', aula_id);
  if (q) params.set('q', q);
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);

  return params;
}

function formatFecha(iso) {
  return iso ? iso.replace('T', ' ').slice(0, 16) : '';
}

async function cargarAulasFiltro() {
  const res = await apiFetch('/api/aulas');
  const aulas = await res.json();
  for (const aula of aulas) {
    const opt = document.createElement('option');
    opt.value = aula.id;
    opt.textContent = aula.nombre;
    fAula.appendChild(opt);
  }
}

async function cargarTickets() {
  const params = buildQuery();
  document.getElementById('btn-exportar').href = `/api/export?${params.toString()}`;

  const res = await apiFetch(`/api/tickets?${params.toString()}`);
  const tickets = await res.json();

  tbody.innerHTML = '';
  sinResultados.hidden = tickets.length > 0;

  for (const t of tickets) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${t.id}</td>
      <td>${formatFecha(t.created_at)}</td>
      <td>${escapeHtml(t.aula_nombre)}</td>
      <td>${escapeHtml(t.categoria)}</td>
      <td>${escapeHtml(t.nombre_reportante)}</td>
      <td><span class="badge ${t.estado}">${ESTADO_LABEL[t.estado]}</span></td>
      <td><a class="btn" href="/admin/ticket.html?id=${t.id}">Ver</a></td>
    `;
    tbody.appendChild(tr);
  }
}

document.getElementById('btn-filtrar').addEventListener('click', cargarTickets);

cargarAulasFiltro().then(cargarTickets);
