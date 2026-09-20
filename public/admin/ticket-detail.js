const ticketId = new URLSearchParams(window.location.search).get('id');
const detalle = document.getElementById('detalle');

function formatFecha(iso) {
  return iso ? iso.replace('T', ' ').slice(0, 16) : '';
}

async function cargarTicket() {
  const res = await apiFetch(`/api/tickets/${ticketId}`);
  if (!res.ok) {
    detalle.innerHTML = '<p class="error">Ticket no encontrado.</p>';
    return;
  }
  const t = await res.json();

  detalle.innerHTML = `
    <h2>Ticket #${t.id} <span class="badge ${t.estado}">${ESTADO_LABEL[t.estado]}</span></h2>
    <p><strong>Fecha:</strong> ${formatFecha(t.created_at)}</p>
    <p><strong>Aula:</strong> ${escapeHtml(t.aula_nombre)}</p>
    <p><strong>Categoría:</strong> ${escapeHtml(t.categoria)}</p>
    <p><strong>Reportado por:</strong> ${escapeHtml(t.nombre_reportante)}</p>
    <p><strong>Descripción:</strong><br>${escapeHtml(t.descripcion)}</p>
    ${t.foto_filename ? `<img class="foto-preview" src="/api/tickets/${t.id}/foto" alt="Foto del aviso" />` : ''}

    <hr style="margin: 20px 0;" />

    <label for="estado">Cambiar estado</label>
    <select id="estado">
      <option value="abierto" ${t.estado === 'abierto' ? 'selected' : ''}>Abierto</option>
      <option value="en_proceso" ${t.estado === 'en_proceso' ? 'selected' : ''}>En proceso</option>
      <option value="resuelto" ${t.estado === 'resuelto' ? 'selected' : ''}>Resuelto</option>
    </select>

    <label for="nota_interna">Nota interna</label>
    <textarea id="nota_interna" rows="4">${escapeHtml(t.nota_interna)}</textarea>

    <button class="btn" id="btn-guardar" style="margin-top: 14px;">Guardar cambios</button>
    <p id="guardado-ok" style="display:none; color:#16a34a; font-weight:600;">Cambios guardados.</p>
  `;

  document.getElementById('btn-guardar').addEventListener('click', async () => {
    const estado = document.getElementById('estado').value;
    const nota_interna = document.getElementById('nota_interna').value;

    const res = await apiFetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, nota_interna }),
    });

    if (res.ok) {
      document.getElementById('guardado-ok').style.display = 'block';
      cargarTicket();
    }
  });
}

cargarTicket();
