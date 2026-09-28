const ticketId = new URLSearchParams(window.location.search).get('id');
const detalle = document.getElementById('detalle');

function formatFecha(iso) {
  return iso ? iso.replace('T', ' ').slice(0, 16) : '';
}

function renderDetalleTab(t, canEdit) {
  return `
    <p><strong>Fecha:</strong> ${formatFecha(t.created_at)}</p>
    <p><strong>Aula:</strong> ${escapeHtml(t.aula_nombre)}</p>
    <p><strong>Categoría:</strong> ${escapeHtml(t.categoria)}</p>
    ${canEdit ? `<p><strong>Reportado por:</strong> ${escapeHtml(t.nombre_reportante)}</p>` : ''}
    <p><strong>Descripción:</strong><br>${escapeHtml(t.descripcion)}</p>
    ${t.foto_filename ? `<img class="foto-preview" src="/api/tickets/${t.id}/foto" alt="Foto del aviso" />` : ''}

    ${canEdit ? `
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

      <hr style="margin: 20px 0;" />
      <button class="btn danger" id="btn-eliminar">Eliminar ticket</button>
      <p id="eliminar-error" class="error" hidden></p>
    ` : '<p><strong>Modo consulta:</strong> no puedes modificar este ticket.</p>'}
  `;
}

function renderComentario(c) {
  return `
    <div class="comentario">
      <div class="comentario-meta"><strong>${escapeHtml(c.autor)}</strong> · ${formatFecha(c.created_at)}</div>
      <div class="comentario-texto">${escapeHtml(c.texto)}</div>
    </div>
  `;
}

function renderComentariosTab(comentarios, canEdit) {
  const lista = comentarios.length
    ? comentarios.map(renderComentario).join('')
    : '<p class="sin-comentarios">Todavía no hay comentarios.</p>';

  return `
    <div id="lista-comentarios">${lista}</div>
    ${canEdit ? `
      <div class="nuevo-comentario">
        <label for="texto_comentario">Añadir comentario</label>
        <textarea id="texto_comentario" rows="3" placeholder="Escribe una nota para el equipo..."></textarea>
        <button class="btn" id="btn-comentar" style="margin-top: 10px;">Publicar comentario</button>
        <p id="comentario-error" class="error" hidden></p>
      </div>
    ` : ''}
  `;
}

let tabActiva = 'detalle';

async function cargarTicket() {
  const [ticketRes, user] = await Promise.all([
    apiFetch(`/api/tickets/${ticketId}`),
    getCurrentUser(),
  ]);

  if (!ticketRes.ok) {
    detalle.innerHTML = '<p class="error">Ticket no encontrado.</p>';
    return;
  }

  const t = await ticketRes.json();
  const canEdit = user.role === 'editor';

  const comentariosRes = await apiFetch(`/api/tickets/${ticketId}/comentarios`);
  const comentarios = comentariosRes.ok ? await comentariosRes.json() : [];

  detalle.innerHTML = `
    <h2>Ticket #${t.id} <span class="badge ${t.estado}">${ESTADO_LABEL[t.estado]}</span></h2>

    <div class="tabs">
      <button class="tab-btn ${tabActiva === 'detalle' ? 'active' : ''}" data-tab="detalle">Detalle</button>
      <button class="tab-btn ${tabActiva === 'comentarios' ? 'active' : ''}" data-tab="comentarios">Comentarios (${comentarios.length})</button>
    </div>

    <div class="tab-panel" id="tab-detalle" ${tabActiva !== 'detalle' ? 'hidden' : ''}>${renderDetalleTab(t, canEdit)}</div>
    <div class="tab-panel" id="tab-comentarios" ${tabActiva !== 'comentarios' ? 'hidden' : ''}>${renderComentariosTab(comentarios, canEdit)}</div>
  `;

  detalle.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabActiva = btn.dataset.tab;
      detalle.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      detalle.querySelectorAll('.tab-panel').forEach((p) => (p.hidden = true));
      document.getElementById(`tab-${btn.dataset.tab}`).hidden = false;
    });
  });

  if (canEdit) {
    document.getElementById('btn-guardar')?.addEventListener('click', async () => {
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

    document.getElementById('btn-eliminar')?.addEventListener('click', async () => {
      if (!confirm(`¿Seguro que quieres eliminar el ticket #${ticketId}? Esta acción no se puede deshacer.`)) {
        return;
      }

      const res = await apiFetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });

      if (res.ok) {
        window.location.href = '/admin/';
      } else {
        const data = await res.json().catch(() => ({}));
        const errorEl = document.getElementById('eliminar-error');
        errorEl.textContent = data.error || 'No se ha podido eliminar el ticket';
        errorEl.hidden = false;
      }
    });

    document.getElementById('btn-comentar')?.addEventListener('click', async () => {
      const texto = document.getElementById('texto_comentario').value;
      const errorEl = document.getElementById('comentario-error');
      errorEl.hidden = true;

      const res = await apiFetch(`/api/tickets/${ticketId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      });

      if (res.ok) {
        cargarTicket();
      } else {
        const data = await res.json().catch(() => ({}));
        errorEl.textContent = data.error || 'No se ha podido publicar el comentario';
        errorEl.hidden = false;
      }
    });
  }
}

cargarTicket();
