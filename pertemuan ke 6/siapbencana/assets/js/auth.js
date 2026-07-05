// ================================================================
// SIAPBENCANA — auth.js
// Sistem login, logout, dan manajemen role
// ================================================================

// Kode khusus admin (hardcoded, ganti sesuai keinginan)
const ADMIN_CODES = ['ADMIN-2025', 'SBADMIN-9999'];
// Prefix kode koordinator
const KOORDINATOR_PREFIX = 'KOORD-';
// Prefix kode relawan
const RELAWAN_PREFIX = 'SB-';

// ── Simpan session ke sessionStorage ────────────────────────────
function setSession(user) {
  sessionStorage.setItem('sb_user', JSON.stringify(user));
}

// ── Ambil session ────────────────────────────────────────────────
function getSession() {
  try {
    const raw = sessionStorage.getItem('sb_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Cek apakah sudah login ───────────────────────────────────────
function isLoggedIn() {
  return getSession() !== null;
}

// ── Ambil role user saat ini ─────────────────────────────────────
function getRole() {
  const s = getSession();
  return s ? s.role : null;
}

// ── Logout ───────────────────────────────────────────────────────
function logout() {
  sessionStorage.removeItem('sb_user');
  window.location.href = basePath() + 'index.html';
}

// ── Deteksi role dari kode ───────────────────────────────────────
function detectRole(kode) {
  const k = kode.trim().toUpperCase();
  if (ADMIN_CODES.includes(k)) return 'admin';
  if (k.startsWith(KOORDINATOR_PREFIX)) return 'koordinator';
  if (k.startsWith(RELAWAN_PREFIX)) return 'relawan';
  return null;
}

// ── Proses login ─────────────────────────────────────────────────
function doLogin(kode, onSuccess, onError) {
  const k = kode.trim().toUpperCase();
  const role = detectRole(k);

  if (!role) {
    onError('Format kode tidak dikenali. Pastikan kode lo benar.');
    return;
  }

  // Admin langsung masuk tanpa cek Google Sheets
  if (role === 'admin') {
    setSession({ kode: k, role: 'admin', nama: 'Administrator', verified: true });
    onSuccess({ role: 'admin' });
    return;
  }

  // Relawan & Koordinator: cek ke Google Sheets
  apiLogin(k, (res) => {
    if (res && res.success && res.user) {
      setSession({ ...res.user, kode: k, role });
      onSuccess({ role, user: res.user });
    } else {
      onError(res?.message || 'Kode tidak ditemukan. Pastikan kode lo benar.');
    }
  }, () => {
    onError('Koneksi gagal. Coba lagi beberapa saat.');
  });
}

// ── Guard: redirect jika belum login ─────────────────────────────
function requireLogin(allowedRoles = []) {
  const session = getSession();
  if (!session) {
    window.location.href = basePath() + 'login.html';
    return false;
  }
  if (allowedRoles.length && !allowedRoles.includes(session.role)) {
    showToast('Akses ditolak — role kamu tidak punya izin ke halaman ini.', 'error');
    setTimeout(() => window.location.href = basePath() + 'index.html', 1500);
    return false;
  }
  return true;
}

// ── Update nav berdasarkan status login ──────────────────────────
function updateNav() {
  const session = getSession();
  const navLogin = document.getElementById('nav-login');
  const navDashboard = document.getElementById('nav-dashboard');
  const navLogout = document.getElementById('nav-logout');

  if (!session) {
    if (navLogin) navLogin.style.display = '';
    if (navDashboard) navDashboard.style.display = 'none';
    if (navLogout) navLogout.style.display = 'none';
    return;
  }

  if (navLogin) navLogin.style.display = 'none';
  if (navDashboard) {
    navDashboard.style.display = '';
    navDashboard.textContent = session.role === 'admin'
      ? '⚙️ Admin'
      : session.role === 'koordinator'
      ? '🗺️ Koordinator'
      : '👤 ' + (session.nama || 'Dashboard');
  }
  if (navLogout) navLogout.style.display = '';
}