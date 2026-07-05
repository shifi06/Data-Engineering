// ================================================================
// SIAPBENCANA — dashboard-koordinator.js
// Logika dashboard khusus untuk role: Koordinator
// ================================================================

let allRelawan = [];

function initDashboardKoordinator() {
  if (!requireLogin(['koordinator'])) return;
  const session = getSession();

  document.getElementById('koord-nama').textContent  = session.nama || 'Koordinator';
  document.getElementById('koord-kode').textContent  = session.kode || '—';
  document.getElementById('koord-wilayah').textContent = session.Wilayah || 'Seluruh Indonesia';

  loadRelawanKoord();
}

// ── Load data relawan ─────────────────────────────────────────────
function loadRelawanKoord() {
  const container = document.getElementById('koord-cards');
  if (container) container.innerHTML = spinnerHTML('Memuat direktori relawan...');

  apiGetRelawan((res) => {
    allRelawan = (res && res.data) ? res.data : [];
    updateKoordStats();
    populateKoordFilter();
    renderKoordCards(allRelawan);
  }, () => {
    if (container) container.innerHTML = emptyStateHTML('⚠️', 'Gagal memuat data', 'Coba refresh halaman.');
  });
}

// ── Stats ─────────────────────────────────────────────────────────
function updateKoordStats() {
  const aktif = allRelawan.filter(d => d.Status === 'Siap').length;
  const verified = allRelawan.filter(d => d.Verified === 'TRUE').length;
  const kota = new Set(allRelawan.map(d => d.Kota)).size;

  animateNum('ks-total', allRelawan.length);
  animateNum('ks-aktif', aktif);
  animateNum('ks-verified', verified);
  animateNum('ks-kota', kota);
}

// ── Filter dropdown kota ──────────────────────────────────────────
function populateKoordFilter() {
  const sel = document.getElementById('koord-filter-kota');
  if (!sel) return;
  const kotas = [...new Set(allRelawan.map(d => d.Kota))].filter(Boolean).sort();
  sel.innerHTML = '<option value="">Semua Kota</option>';
  kotas.forEach(k => sel.innerHTML += `<option value="${k}">${k}</option>`);
}

// ── Filter cards ──────────────────────────────────────────────────
function filterKoord() {
  const nama  = (document.getElementById('koord-search')?.value || '').toLowerCase().trim();
  const kota  = document.getElementById('koord-filter-kota')?.value || '';
  const skill = document.getElementById('koord-filter-skill')?.value || '';
  const status = document.getElementById('koord-filter-status')?.value || '';

  const filtered = allRelawan.filter(d =>
    (!nama  || (d.Nama||'').toLowerCase().includes(nama) || (d.Keahlian||'').toLowerCase().includes(nama) || (d.Detail||'').toLowerCase().includes(nama)) &&
    (!kota  || d.Kota === kota) &&
    (!skill || d.Keahlian === skill) &&
    (!status || d.Status === status)
  );

  document.getElementById('koord-result-count').textContent = `${filtered.length} relawan ditemukan`;
  renderKoordCards(filtered);
}

// ── Render cards (nomor HP VISIBLE untuk koordinator) ─────────────
function renderKoordCards(data) {
  const container = document.getElementById('koord-cards');
  if (!container) return;

  if (!data.length) {
    container.innerHTML = emptyStateHTML('🔍', 'Tidak ada relawan ditemukan', 'Coba ubah filter pencarian.');
    return;
  }

  container.innerHTML = `<div class="koord-cards">` +
    data.map(d => {
      const sc = skillClass(d.Keahlian);
      const initials = (d.Nama||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
      const isVerified = d.Verified === 'TRUE';
      const statusColor = d.Status === 'Siap' ? 'var(--green)' : d.Status === 'Terbatas' ? 'var(--amber)' : 'var(--grey)';
      return `
      <div class="koord-card">
        <div class="koord-card-head">
          <div class="koord-avatar avatar-${sc}">${initials}</div>
          <div>
            <div class="koord-card-name">${d.Nama || '—'}</div>
            <div class="koord-card-skill">${skillEmoji(d.Keahlian)}</div>
          </div>
          <span class="badge ${isVerified ? 'badge-verified' : 'badge-unverified'}" style="margin-left:auto">
            ${isVerified ? '✓' : '⏳'}
          </span>
        </div>
        <div class="koord-card-info">
          ${d.Detail ? `📋 ${d.Detail}<br>` : ''}
          📍 ${d.Kota || '—'}, ${d.Provinsi || '—'}<br>
          <span style="color:${statusColor};font-weight:500">⏱ ${d.Status || '—'}</span>
        </div>
        <div class="koord-card-kontak">
          <span>📞 ${d.Kontak || '—'}</span>
          <div style="display:flex;gap:6px">
            <button class="btn-success" onclick="window.open('tel:${d.Kontak}')">Telepon</button>
            <button class="btn-primary" style="padding:5px 10px;font-size:0.78rem"
              onclick="window.open('https://wa.me/62${(d.Kontak||'').replace(/^0/,'')}?text=Halo%20${encodeURIComponent(d.Nama||'')},%20saya%20koordinator%20dari%20SiapBencana.%20Kami%20membutuhkan%20bantuan%20darurat%20di%20wilayah%20kamu.%20Apakah%20kamu%20bisa%20dihubungi%20sekarang?')">
              WhatsApp
            </button>
          </div>
        </div>
      </div>`;
    }).join('') + '</div>';
}

// ── Dispatch / Permintaan Bantuan ─────────────────────────────────
async function kirimPermintaan() {
  const lokasi   = document.getElementById('dispatch-lokasi')?.value.trim();
  const jenis    = document.getElementById('dispatch-jenis')?.value;
  const deskripsi = document.getElementById('dispatch-deskripsi')?.value.trim();
  const jumlah   = document.getElementById('dispatch-jumlah')?.value;

  if (!lokasi || !jenis) {
    showToast('Isi lokasi dan jenis bantuan dulu.', 'error');
    return;
  }

  // Filter relawan yang sesuai
  const targetRelawan = allRelawan.filter(d =>
    d.Keahlian === jenis && d.Status === 'Siap'
  );

  if (targetRelawan.length === 0) {
    showToast('Tidak ada relawan aktif untuk keahlian ini.', 'warning');
    return;
  }

  // Tampilkan hasil
  const session = getSession();
  document.getElementById('dispatch-result').innerHTML = `
    <div style="background:var(--green-light);border:1px solid #9FD4B8;border-radius:10px;padding:1rem;margin-top:1rem">
      <div style="font-weight:600;color:var(--green);margin-bottom:0.5rem">
        ✅ Ditemukan ${targetRelawan.length} relawan ${jenis} aktif
      </div>
      <div style="font-size:0.85rem;color:var(--green);margin-bottom:0.75rem">
        Hubungi mereka via WhatsApp dengan pesan otomatis:
      </div>
      ${targetRelawan.slice(0,5).map(r => `
        <div style="display:flex;align-items:center;justify-content:space-between;background:white;border-radius:8px;padding:8px 12px;margin-bottom:6px">
          <span style="font-size:0.875rem;font-weight:500">${r.Nama} — 📍 ${r.Kota}</span>
          <button class="btn-primary" style="padding:5px 10px;font-size:0.78rem"
            onclick="window.open('https://wa.me/62${(r.Kontak||'').replace(/^0/,'')}?text=${encodeURIComponent(`Halo ${r.Nama}, saya ${session.nama||'Koordinator'} dari SiapBencana. Kami membutuhkan bantuan ${jenis} SEGERA di ${lokasi}. ${deskripsi||''} Apakah kamu bisa membantu sekarang?`)}')">
            WA Sekarang
          </button>
        </div>
      `).join('')}
      ${targetRelawan.length > 5 ? `<div style="font-size:0.8rem;color:var(--green);margin-top:4px">...dan ${targetRelawan.length - 5} relawan lainnya</div>` : ''}
    </div>
  `;
}