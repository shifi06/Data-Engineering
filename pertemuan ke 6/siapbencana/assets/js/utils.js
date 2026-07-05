// ================================================================
// SIAPBENCANA — utils.js
// Fungsi-fungsi helper yang dipakai di semua halaman
// ================================================================

// ── String helpers ───────────────────────────────────────────────
function toTitleCase(str) {
  if (!str) return '';
  return str.trim().replace(/\w\S*/g, w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
}

function toNameCase(str) {
  if (!str) return '';
  return str.trim().replace(/\w\S*/g, w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  );
}

// ── Generate kode unik relawan: SB-XXXXXX ───────────────────────
function generateKodeRelawan() {
  const angka = Math.floor(100000 + Math.random() * 900000);
  return 'SB-' + angka;
}

// ── Toast notification ───────────────────────────────────────────
function showToast(msg, type = 'default') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  const colors = {
    default: '#0D0D0D',
    success: '#1A7A4A',
    error:   '#CC3300',
    warning: '#C47B00',
  };
  toast.style.background = colors[type] || colors.default;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Animasi angka (counter) ──────────────────────────────────────
function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  let curr = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const iv = setInterval(() => {
    curr = Math.min(curr + step, target);
    el.textContent = curr;
    if (curr >= target) clearInterval(iv);
  }, 35);
}

// ── Format tanggal ISO ke readable ──────────────────────────────
function formatTanggal(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d)) return isoStr;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── Skill helpers ────────────────────────────────────────────────
const SKILL_CLASS = {
  Medis: 'medis', Logistik: 'logistik', Teknik: 'teknik',
  Komunikasi: 'komunikasi', Psikologi: 'psikologi'
};
const SKILL_EMOJI = {
  Medis: '🏥', Logistik: '🚛', Teknik: '🔧',
  Komunikasi: '📻', Psikologi: '🧠'
};
function skillClass(skill) { return SKILL_CLASS[skill] || 'lainnya'; }
function skillEmoji(skill) { return (SKILL_EMOJI[skill] || '🤝') + ' ' + skill; }

// ── Spinner HTML ─────────────────────────────────────────────────
function spinnerHTML(msg = 'Memuat...') {
  return `<div class="loading"><div class="spinner"></div> ${msg}</div>`;
}

// ── Empty state HTML ─────────────────────────────────────────────
function emptyStateHTML(icon = '🔍', title = 'Tidak ada data', sub = '') {
  return `<div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <h3>${title}</h3>
    ${sub ? `<p>${sub}</p>` : ''}
  </div>`;
}

// ── Redirect helper ──────────────────────────────────────────────
function redirectTo(path) {
  window.location.href = path;
}

// ── Get base path (untuk GitHub Pages yang punya subfolder) ─────
function basePath() {
  // Deteksi apakah di GitHub Pages atau localhost
  const host = window.location.hostname;
  if (host === '127.0.0.1' || host === 'localhost') return './';
  // GitHub Pages: ambil path sampai folder siapbencana
  const parts = window.location.pathname.split('/');
  const idx = parts.indexOf('siapbencana');
  if (idx !== -1) return parts.slice(0, idx + 1).join('/') + '/';
  return './';
}