// ================================================================
// SIAPBENCANA — dashboard-admin.js
// Logika dashboard khusus untuk role: Admin
// ================================================================

let adminRelawanData = [];
let deleteTarget = null;

function initDashboardAdmin() {
  if (!requireLogin(['admin'])) return;
  loadAdminData();
}

// ── Load semua data ───────────────────────────────────────────────
function loadAdminData() {
  const containers = ['admin-table-body', 'pending-table-body', 'flag-table-body'];
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<tr><td colspan="8">${spinnerHTML('Memuat data...')}</td></tr>`;
  });

  apiGetRelawan((res) => {
    adminRelawanData = (res && res.data) ? res.data : [];
    renderAdminStats();
    renderAllTable();
    renderPendingTable();
    renderFlagTable();
  }, () => {
    showToast('Gagal memuat data dari Google Sheets.', 'error');
  });
}

// ── Stats ─────────────────────────────────────────────────────────
function renderAdminStats() {
  const total    = adminRelawanData.length;
  const verified = adminRelawanData.filter(d => d.Verified === 'TRUE').length;
  const pending  = adminRelawanData.filter(d => d.Verified !== 'TRUE').length;
  const flagged  = adminRelawanData.filter(d => parseInt(d.Flags||'0') >= 1).length;
  const aktif    = adminRelawanData.filter(d => d.Status === 'Siap').length;
  const kota     = new Set(adminRelawanData.map(d => d.Kota)).size;

  animateNum('as-total', total);
  animateNum('as-verified', verified);
  animateNum('as-pending', pending);
  animateNum('as-flagged', flagged);
  animateNum('as-aktif', aktif);
  animateNum('as-kota', kota);
}

// ── Tabel semua relawan ───────────────────────────────────────────
function renderAllTable(filter = '') {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  let data = adminRelawanData;
  if (filter) {
    const f = filter.toLowerCase();
    data = data.filter(d =>
      (d.Nama||'').toLowerCase().includes(f) ||
      (d.Kota||'').toLowerCase().includes(f) ||
      (d.Keahlian||'').toLowerCase().includes(f)
    );
  }

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--grey)">Tidak ada data</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((d, i) => {
    const isVerified = d.Verified === 'TRUE';
    const flags = parseInt(d.Flags || '0');
    return `
    <tr>
      <td><code style="font-size:0.78rem;background:var(--grey-light);padding:2px 6px;border-radius:4px">${d.Kode || '—'}</code></td>
      <td><strong>${d.Nama || '—'}</strong></td>
      <td><span class="badge skill-${skillClass(d.Keahlian)}">${d.Keahlian || '—'}</span></td>
      <td>${d.Kota || '—'}</td>
      <td><span class="badge ${isVerified ? 'badge-verified' : 'badge-unverified'}">${isVerified ? '✓ Verified' : '⏳ Pending'}</span></td>
      <td><span style="color:${d.Status==='Siap'?'var(--green)':d.Status==='Terbatas'?'var(--amber)':'var(--grey)'}">${d.Status||'—'}</span></td>
      <td><span style="color:${flags>0?'var(--red)':'var(--grey)'};font-weight:${flags>0?'600':'400'}">${flags} ${flags>0?'🚩':''}</span></td>
      <td>
        <div class="action-btns">
          ${!isVerified ? `<button class="btn-success" onclick="approveRelawan(${i})">✓ Approve</button>` : ''}
          <button class="btn-danger" onclick="confirmHapus(${i})">🗑 Hapus</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Tabel pending verifikasi ──────────────────────────────────────
function renderPendingTable() {
  const tbody = document.getElementById('pending-table-body');
  if (!tbody) return;

  const pending = adminRelawanData.filter(d => d.Verified !== 'TRUE');
  if (!pending.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--green)">✅ Semua relawan sudah terverifikasi!</td></tr>`;
    return;
  }

  tbody.innerHTML = pending.map((d, i) => {
    const realIdx = adminRelawanData.indexOf(d);
    return `
    <tr style="background:var(--amber-light)">
      <td><code style="font-size:0.78rem">${d.Kode || '—'}</code></td>
      <td><strong>${d.Nama || '—'}</strong></td>
      <td>${d.Keahlian || '—'}</td>
      <td>${d.Kota || '—'}, ${d.Provinsi || '—'}</td>
      <td>${d.Kontak || '—'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-success" onclick="approveRelawan(${realIdx})">✓ Approve</button>
          <button class="btn-danger" onclick="confirmHapus(${realIdx})">✗ Tolak</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Tabel relawan diflag ──────────────────────────────────────────
function renderFlagTable() {
  const tbody = document.getElementById('flag-table-body');
  if (!tbody) return;

  const flagged = adminRelawanData.filter(d => parseInt(d.Flags||'0') >= 1)
    .sort((a,b) => parseInt(b.Flags||'0') - parseInt(a.Flags||'0'));

  if (!flagged.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--green)">✅ Tidak ada laporan masuk saat ini.</td></tr>`;
    return;
  }

  tbody.innerHTML = flagged.map((d) => {
    const realIdx = adminRelawanData.indexOf(d);
    const flags = parseInt(d.Flags || '0');
    return `
    <tr style="background:${flags >= 3 ? 'var(--red-light)' : 'var(--amber-light)'}">
      <td><strong>${d.Nama || '—'}</strong></td>
      <td>${d.Keahlian || '—'}</td>
      <td>${d.Kota || '—'}</td>
      <td><span style="color:var(--red);font-weight:700;font-size:1.1rem">${flags} 🚩</span><br>
        <span style="font-size:0.75rem;color:var(--grey)">${flags >= 3 ? '⚠️ Perlu tindakan segera' : 'Pantau terus'}</span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-warning" onclick="resetFlag(${realIdx})">Reset Flag</button>
          <button class="btn-danger" onclick="confirmHapus(${realIdx})">🗑 Hapus</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Approve verifikasi ────────────────────────────────────────────
async function approveRelawan(idx) {
  const d = adminRelawanData[idx];
  if (!d) return;
  try {
    await apiApprove(d.Kode || idx);
    adminRelawanData[idx].Verified = 'TRUE';
    renderAdminStats();
    renderAllTable();
    renderPendingTable();
    showToast(`✅ ${d.Nama} berhasil diverifikasi!`, 'success');
  } catch {
    showToast('Gagal approve. Coba lagi.', 'error');
  }
}

// ── Hapus data ────────────────────────────────────────────────────
function confirmHapus(idx) {
  deleteTarget = idx;
  const d = adminRelawanData[idx];
  document.getElementById('hapus-nama').textContent = d?.Nama || 'data ini';
  document.getElementById('modal-hapus').classList.add('open');
}

function closeModalHapus() {
  deleteTarget = null;
  document.getElementById('modal-hapus').classList.remove('open');
}

async function doHapus() {
  if (deleteTarget === null) return;
  const d = adminRelawanData[deleteTarget];
  try {
    await apiHapus(d.Kode || deleteTarget);
    adminRelawanData.splice(deleteTarget, 1);
    renderAdminStats();
    renderAllTable();
    renderPendingTable();
    renderFlagTable();
    showToast(`🗑 Data ${d?.Nama || ''} berhasil dihapus.`, 'success');
  } catch {
    showToast('Gagal hapus. Coba lagi.', 'error');
  } finally {
    closeModalHapus();
  }
}

// ── Reset flag ────────────────────────────────────────────────────
async function resetFlag(idx) {
  const d = adminRelawanData[idx];
  try {
    await apiPost({ action: 'resetFlag', kode: d.Kode });
    adminRelawanData[idx].Flags = '0';
    renderFlagTable();
    renderAdminStats();
    showToast('Flag direset ke 0.', 'success');
  } catch {
    showToast('Gagal reset flag.', 'error');
  }
}

// ── Filter tabel semua ────────────────────────────────────────────
function filterAllTable() {
  const q = document.getElementById('admin-search')?.value || '';
  renderAllTable(q);
}

// ── Export CSV ────────────────────────────────────────────────────
function exportCSV() {
  const headers = ['Kode','Nama','Kota','Provinsi','Keahlian','Detail','Kontak','Status','Verified','Flags','Timestamp'];
  const rows = adminRelawanData.map(d =>
    headers.map(h => `"${(d[h]||'').toString().replace(/"/g,'""')}"`).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SiapBencana_Data_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast('📥 Data berhasil diexport!', 'success');
}