const ESTADO_PRESUPUESTO_LABEL = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

const tbodyPresupuestos = document.getElementById('tbody-presupuestos');
const sinPresupuestos = document.getElementById('sin-presupuestos');
const errorPresupuesto = document.getElementById('error-presupuesto');
let canEdit = false;

function formatFecha(iso) {
  return iso ? iso.replace('T', ' ').slice(0, 16) : '';
}

function formatImporte(valor) {
  return Number(valor).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

async function cargarPresupuestos() {
  const res = await apiFetch('/api/presupuestos');
  const presupuestos = await res.json();

  sinPresupuestos.hidden = presupuestos.length > 0;
  tbodyPresupuestos.innerHTML = '';

  for (const p of presupuestos) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatFecha(p.created_at)}</td>
      <td>${escapeHtml(p.concepto)}</td>
      <td>${escapeHtml(p.proveedor || '—')}</td>
      <td>${formatImporte(p.importe)}</td>
      <td>
        ${canEdit
          ? `<select class="estado-select" data-id="${p.id}">
              ${Object.entries(ESTADO_PRESUPUESTO_LABEL)
                .map(([valor, label]) => `<option value="${valor}" ${p.estado === valor ? 'selected' : ''}>${label}</option>`)
                .join('')}
            </select>`
          : `<span class="badge ${p.estado}">${ESTADO_PRESUPUESTO_LABEL[p.estado] || p.estado}</span>`}
      </td>
      <td>${canEdit ? `<button class="btn danger" data-id="${p.id}">Borrar</button>` : ''}</td>
    `;

    if (canEdit) {
      tr.querySelector('.estado-select').addEventListener('change', (e) => cambiarEstado(p.id, e.target.value));
      tr.querySelector('.danger').addEventListener('click', () => borrarPresupuesto(p.id));
    }

    tbodyPresupuestos.appendChild(tr);
  }
}

async function cambiarEstado(id, estado) {
  await apiFetch(`/api/presupuestos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  cargarPresupuestos();
}

async function borrarPresupuesto(id) {
  if (!confirm('¿Borrar este presupuesto?')) return;
  const res = await apiFetch(`/api/presupuestos/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    alert('No se ha podido borrar');
    return;
  }
  cargarPresupuestos();
}

async function configurarPermisos() {
  const user = await getCurrentUser();
  canEdit = user.role === 'editor';
  if (!canEdit) {
    document.getElementById('panel-nuevo-presupuesto').hidden = true;
  }
}

document.getElementById('form-nuevo-presupuesto').addEventListener('submit', async (e) => {
  e.preventDefault();
  errorPresupuesto.hidden = true;

  const concepto = document.getElementById('p-concepto').value.trim();
  const proveedor = document.getElementById('p-proveedor').value.trim();
  const importe = document.getElementById('p-importe').value;

  const res = await apiFetch('/api/presupuestos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concepto, proveedor, importe }),
  });
  const data = await res.json();

  if (!res.ok) {
    errorPresupuesto.textContent = data.error || 'Error al crear el presupuesto';
    errorPresupuesto.hidden = false;
    return;
  }

  document.getElementById('form-nuevo-presupuesto').reset();
  cargarPresupuestos();
});

configurarPermisos().then(cargarPresupuestos);
