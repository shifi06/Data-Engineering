// ================================================================
// SIAPBENCANA — dashboard-relawan.js
// Logika dashboard khusus untuk role: Relawan
// ================================================================

let relawanData = null; // data relawan yang sedang login

// ── Init ─────────────────────────────────────────────────────────
function initDashboardRelawan() {
  if (!requireLogin(['relawan'])) return;
  const session = getSession();
  relawanData = session;

  renderProfileCard(session);
  renderBadgeLevel(session);
  renderStatusCard(session);
  loadTab('profil');
}

// ── Tab navigation ────────────────────────────────────────────────
function loadTab(tab) {
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.dash-panel').forEach(p => p.style.display = 'none');
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
  const panel = document.getElementById('panel-' + tab);
  if (panel) panel.style.display = 'block';
}

// ── Profile Card ──────────────────────────────────────────────────
function renderProfileCard(data) {
  const sc = skillClass(data.Keahlian);
  const initials = (data.Nama || 'R').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const isVerified = data.Verified === 'TRUE';

  document.getElementById('profile-avatar').className = `profile-avatar avatar-${sc}`;
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-name').textContent = data.Nama || '—';
  document.getElementById('profile-kode').textContent = data.kode || '—';
  document.getElementById('profile-verify-badge').className = `badge ${isVerified ? 'badge-verified' : 'badge-unverified'}`;
  document.getElementById('profile-verify-badge').textContent = isVerified ? '✓ Terverifikasi' : '⏳ Belum Diverifikasi';

  // Isi field info
  const fields = {
    'pf-keahlian': skillEmoji(data.Keahlian),
    'pf-detail':   data.Detail || '—',
    'pf-kota':     `${data.Kota || '—'}, ${data.Provinsi || '—'}`,
    'pf-kontak':   data.Kontak || '—',
    'pf-status':   data.Status || '—',
    'pf-terdaftar': formatTanggal(data.Timestamp),
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

// ── Badge Level (gamifikasi) ──────────────────────────────────────
function renderBadgeLevel(data) {
  const flags = parseInt(data.Flags || '0');
  const isVerified = data.Verified === 'TRUE';

  // Hitung level
  const levels = [
    { name: 'Relawan Baru',    icon: '🌱', earned: true },
    { name: 'Sudah Daftar',    icon: '📝', earned: true },
    { name: 'Terverifikasi',   icon: '✅', earned: isVerified },
    { name: 'Relawan Aktif',   icon: '⚡', earned: data.Status === 'Siap' && isVerified },
    { name: 'Relawan Andalan', icon: '🏆', earned: data.Status === 'Siap' && isVerified && parseInt(data.Flags||'0') === 0 },
  ];

  const wrap = document.getElementById('badge-levels');
  if (!wrap) return;
  wrap.innerHTML = levels.map(l => `
    <div class="badge-level-item ${l.earned ? 'earned' : ''}">
      <div class="badge-level-icon">${l.icon}</div>
      <div class="badge-level-name">${l.name}</div>
    </div>
  `).join('');
}

// ── Status Card ───────────────────────────────────────────────────
function renderStatusCard(data) {
  const el = document.getElementById('current-status');
  if (!el) return;
  const statusColor = {
    'Siap': 'var(--green)',
    'Terbatas': 'var(--amber)',
    'Tidak Aktif': 'var(--grey)'
  };
  el.textContent = data.Status || 'Siap';
  el.style.color = statusColor[data.Status] || 'var(--grey)';
}

// ── Edit Profile ──────────────────────────────────────────────────
function enableEditMode() {
  const session = getSession();
  document.getElementById('edit-detail').value  = session.Detail || '';
  document.getElementById('edit-kontak').value  = session.Kontak || '';
  document.getElementById('edit-status').value  = session.Status || 'Siap';
  document.getElementById('view-mode').style.display = 'none';
  document.getElementById('edit-mode').style.display = 'block';
}

function cancelEdit() {
  document.getElementById('view-mode').style.display = 'block';
  document.getElementById('edit-mode').style.display = 'none';
}

async function saveProfile() {
  const session = getSession();
  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  const updateData = {
    Detail: document.getElementById('edit-detail').value.trim(),
    Kontak: document.getElementById('edit-kontak').value.trim(),
    Status: document.getElementById('edit-status').value,
  };

  try {
    await apiUpdateRelawan(session.kode, updateData);
    // Update session lokal
    const updated = { ...session, ...updateData };
    setSession(updated);
    relawanData = updated;
    renderProfileCard(updated);
    renderBadgeLevel(updated);
    renderStatusCard(updated);
    cancelEdit();
    showToast('✅ Profil berhasil diupdate!', 'success');
  } catch {
    showToast('❌ Gagal update. Coba lagi.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simpan Perubahan';
  }
}

// ── Toggle Status Aktif ───────────────────────────────────────────
async function setStatus(statusBaru) {
  const session = getSession();
  try {
    await apiToggleStatus(session.kode, statusBaru);
    const updated = { ...session, Status: statusBaru };
    setSession(updated);
    relawanData = updated;
    renderProfileCard(updated);
    renderStatusCard(updated);
    renderBadgeLevel(updated);
    showToast(`Status diubah ke: ${statusBaru}`, 'success');
  } catch {
    showToast('Gagal mengubah status.', 'error');
  }
}