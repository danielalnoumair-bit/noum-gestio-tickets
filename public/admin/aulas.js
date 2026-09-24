const tbodyAulas = document.getElementById('tbody-aulas');
const errorAula = document.getElementById('error-aula');
let canEdit = false;

async function cargarAulas() {
  const res = await apiFetch('/api/aulas');
  const aulas = await res.json();

  tbodyAulas.innerHTML = '';
  for (const aula of aulas) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(aula.nombre)}</td>
      <td><img src="/api/aulas/${aula.id}/qr" width="80" height="80" alt="QR ${escapeHtml(aula.nombre)}" /></td>
      <td>
        <a class="btn secondary" href="/api/aulas/${aula.id}/qr" download="qr-${aula.id}.png">Descargar QR</a>
        ${canEdit ? `<button class="btn danger" data-id="${aula.id}">Borrar</button>` : ''}
      </td>
    `;
    if (canEdit) {
      tr.querySelector('.danger').addEventListener('click', () => borrarAula(aula.id));
    }
    tbodyAulas.appendChild(tr);
  }
}

async function configurarPermisos() {
  const user = await getCurrentUser();
  canEdit = user.role === 'editor';
  if (user.role !== 'editor') {
    document.getElementById('form-nueva-aula').closest('.panel').hidden = true;
  }
}

async function borrarAula(id) {
  if (!confirm('¿Borrar esta aula? Solo se puede borrar si no tiene tickets asociados.')) return;
  const res = await apiFetch(`/api/aulas/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || 'No se ha podido borrar');
    return;
  }
  cargarAulas();
}

document.getElementById('form-nueva-aula').addEventListener('submit', async (e) => {
  e.preventDefault();
  errorAula.hidden = true;
  const nombre = document.getElementById('nombre-aula').value.trim();

  const res = await apiFetch('/api/aulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  const data = await res.json();

  if (!res.ok) {
    errorAula.textContent = data.error || 'Error al crear el aula';
    errorAula.hidden = false;
    return;
  }

  document.getElementById('nombre-aula').value = '';
  cargarAulas();
});

configurarPermisos().then(cargarAulas);
