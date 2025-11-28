const API_ROOT = window.API_ROOT || location.origin;

function fmtJson(obj) { return JSON.stringify(obj, null, 2); }

function fmtRncDisplay(r) {
  const s = String(r || '');
  if (!/^[0-9]{9}$/.test(s)) return s;
  return `${s.substring(0,3)}-${s.substring(3,8)}-${s.substring(8)}`;
}

function renderDetailed(record){
  if (!record) return `<div>Registro no encontrado</div>`;
  const fields = {
    rnc: record.rnc || '',
    cedulaRnc: record.rnc || '',
    razonSocial: record.razonSocial || 'N/A',
    nombreComercial: record.nombreComercial || 'N/A',
    categoria: record.categoria || record.actividadEconomica || 'N/A',
    regimenPagos: record.regimenPagos || 'N/A',
    estado: record.estado || 'N/A',
    actividadEconomica: record.actividadEconomica || 'N/A',
    administracionLocal: record.administracionLocal || record.administracion || 'N/A',
    facturadorElectronico: record.facturadorElectronico || record.ei || 'N/A',
    licenciasVHM: record.licenciasVHM || 'N/A'
  };

  return `
    <div class="detail-table">
      <div class="row"><div class="label">Cédula/RNC</div><div class="value">${fmtRncDisplay(fields.cedulaRnc)}</div></div>
      <div class="row"><div class="label">Nombre/Razón Social</div><div class="value">${fields.razonSocial}</div></div>
      <div class="row"><div class="label">Nombre Comercial</div><div class="value">${fields.nombreComercial}</div></div>
      <div class="row"><div class="label">Categoría</div><div class="value">${fields.categoria}</div></div>
      <div class="row"><div class="label">Régimen de pagos</div><div class="value">${fields.regimenPagos}</div></div>
      <div class="row"><div class="label">Estado</div><div class="value">${fields.estado}</div></div>
      <div class="row"><div class="label">Actividad Económica</div><div class="value">${fields.actividadEconomica}</div></div>
      <div class="row"><div class="label">Administración Local</div><div class="value">${fields.administracionLocal}</div></div>
      <div class="row"><div class="label">Facturador Electrónico</div><div class="value">${fields.facturadorElectronico}</div></div>
      <div class="row"><div class="label">Licencias de Comercialización de VHM</div><div class="value">${fields.licenciasVHM}</div></div>
    </div>
  `;
}

async function doExact(rnc) {
  const url = `${API_ROOT}/api/rnc/${encodeURIComponent(rnc)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function doSearch(q, limit) {
  const url = `${API_ROOT}/api/search?query=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function doBulk(list) {
  throw new Error('Bulk API removed; use the unified search input to query single RNC or name');
}

const setBackendStatus = (ok, info) => {
  const el = document.getElementById('backendStatus');
  if (!el) return;
  if (ok) {
    el.classList.remove('offline'); el.classList.add('online');
    el.textContent = `Estado backend: conectado (${info})`;
  } else {
    el.classList.remove('online'); el.classList.add('offline');
    el.textContent = `Estado backend: desconectado`;
  }
};

// perform an initial health-check at page load
let backoff = 5000; // ms
let backoffAttempts = 0;
const MAX_BACKOFF = 60000; // 1 minute

async function checkHealthNow() {
  const lastEl = document.getElementById('lastCheck');
  try {
    const r = await fetch(`${API_ROOT}/api/health`, { method: 'GET' , cache: 'no-store'});
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const j = await r.json();
    setBackendStatus(true, `pid:${j.pid}`);
    backoffAttempts = 0; backoff = 5000; // reset
    if (lastEl) lastEl.textContent = `última comprobación: ${new Date().toLocaleTimeString()}`;
    return true;
  } catch (err) {
    backoffAttempts++;
    backoff = Math.min(MAX_BACKOFF, backoff * 1.8);
    setBackendStatus(false);
    if (lastEl) lastEl.textContent = `última comprobación: ${new Date().toLocaleTimeString()} (falló)`;
    console.warn('Backend health check failed:', err.message);
    return false;
  }
}

// initial call
checkHealthNow();

// auto poll loop that respects the current backoff delay
;(async function pollLoop(){
  while(true) {
    await new Promise(r => setTimeout(r, backoff));
    await checkHealthNow();
  }
})();

// manual button hook
document.getElementById('checkHealthBtn').addEventListener('click', async () => {
  document.getElementById('checkHealthBtn').disabled = true;
  try { await checkHealthNow(); } finally { document.getElementById('checkHealthBtn').disabled = false; }
});

// Unified search form (search by RNC or by name)
document.getElementById('searchFormUnified').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const query = document.getElementById('searchQueryUnified').value.trim();
  const limit = document.getElementById('searchLimitUnified').value || '10';
  const out = document.getElementById('searchResultUnified');
  out.textContent = 'Cargando...';

  // helper to detect RNC (9 digits) even with formatting
  const digits = String(query).replace(/\D/g, '');
  try {
    if (/^[0-9]{9}$/.test(digits)) {
      // exact RNC lookup
      const data = await doExact(digits);
      out.innerHTML = renderDetailed(data);
    } else {
      // name / partial search
      const data = await doSearch(query, limit);
      if (!data || !data.results || data.results.length === 0) {
        out.innerHTML = '<div>Sin resultados</div>';
      } else {
        // render full detailed view for each hit (no inner scroll)
        out.innerHTML = data.results.map(rec => `
          <div class="card-row" data-rnc="${rec.rnc}">
            ${renderDetailed(rec)}
          </div>
        `).join('\n');
      }
    }
  } catch (err) {
    console.error('Unified search failed', err);
    out.textContent = 'Error de red: no se pudo conectar con el servidor. Revisa que el backend esté corriendo en la misma máquina y puerto.';
    setBackendStatus(false);
  }
});

// old search form removed — unified handler above used instead

// bulk form removed per UX request

// small convenience: populate example
// set a helpful placeholder example in unified search
const uq = document.getElementById('searchQueryUnified');
if (uq) uq.value = '100022768';
