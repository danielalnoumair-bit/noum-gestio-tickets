const form = document.getElementById('form-ticket');
const aulaSelect = document.getElementById('aula');
const errorEl = document.getElementById('error');
const btnEnviar = document.getElementById('btn-enviar');
const confirmacion = document.getElementById('confirmacion');
const refTicket = document.getElementById('ref-ticket');

const aulaIdFromQr = new URLSearchParams(window.location.search).get('aula');

async function cargarAulas() {
  const res = await fetch('/api/aulas');
  const aulas = await res.json();

  aulaSelect.innerHTML = '<option value="">Selecciona un aula...</option>';
  for (const aula of aulas) {
    const opt = document.createElement('option');
    opt.value = aula.id;
    opt.textContent = aula.nombre;
    aulaSelect.appendChild(opt);
  }

  if (aulaIdFromQr && aulas.some((a) => String(a.id) === aulaIdFromQr)) {
    aulaSelect.value = aulaIdFromQr;
    aulaSelect.disabled = true;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';

  try {
    const formData = new FormData(form);
    if (aulaSelect.disabled) {
      formData.set('aula_id', aulaSelect.value);
    }

    const res = await fetch('/api/tickets', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'No se ha podido enviar el aviso');
    }

    refTicket.textContent = `#${data.id}`;
    form.hidden = true;
    confirmacion.hidden = false;
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar aviso';
  }
});

document.getElementById('btn-nuevo').addEventListener('click', () => {
  window.location.reload();
});

cargarAulas();
