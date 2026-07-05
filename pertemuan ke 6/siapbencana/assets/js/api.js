// ================================================================
// SIAPBENCANA — api.js
// Semua komunikasi dengan Google Sheets via Apps Script
// GANTI URL DI BAWAH dengan URL Apps Script kamu!
// ================================================================

const API_URL = "https://script.google.com/macros/s/AKfycbxlDMncmReEDRAeNyIGi8v1qv4g_oBfqLNIfxY2iz_10uUdFno6Lo1fke058DZNcoxx/exec";

// ── JSONP fetch (bypass CORS dari GitHub Pages) ──────────────────
function apiFetch(params, onSuccess, onError) {
  const cbName = 'cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const script = document.createElement('script');
  const timeout = setTimeout(() => {
    cleanup();
    if (onError) onError(new Error('Timeout'));
  }, 10000);

  window[cbName] = function(data) { cleanup(); onSuccess(data); };

  function cleanup() {
    clearTimeout(timeout);
    delete window[cbName];
    if (script.parentNode) script.parentNode.removeChild(script);
  }

  const qs = new URLSearchParams({ ...params, callback: cbName }).toString();
  script.src = API_URL + '?' + qs;
  script.onerror = () => { cleanup(); if (onError) onError(new Error('Script error')); };
  document.head.appendChild(script);
}

// ── POST request ─────────────────────────────────────────────────
async function apiPost(payload) {
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'no-cors'
  });
}

// ── Public methods ────────────────────────────────────────────────
function apiGetRelawan(onSuccess, onError) {
  apiFetch({ action: 'get' }, onSuccess, onError);
}

async function apiAddRelawan(data) {
  return apiPost({ action: 'add', ...data });
}

function apiLogin(kode, onSuccess, onError) {
  apiFetch({ action: 'login', kode }, onSuccess, onError);
}

async function apiUpdateRelawan(kode, data) {
  return apiPost({ action: 'update', kode, ...data });
}

async function apiApprove(kode) {
  return apiPost({ action: 'approve', kode });
}

async function apiHapus(kode) {
  return apiPost({ action: 'hapus', kode });
}

async function apiToggleStatus(kode, status) {
  return apiPost({ action: 'toggleStatus', kode, status });
}

async function apiFlag(kode) {
  return apiPost({ action: 'flag', kode });
}