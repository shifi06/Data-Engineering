"""
╔══════════════════════════════════════════════════════╗
║     CAFE SALES SMART DATA CLEANER — FINAL VERSION    ║
║     Tugas Data Engineering                           ║
║                                                      ║
║     Dataset : dirty_cafe_sales.csv (Kaggle)          ║
║     Jalankan: py -m streamlit run demo_app.py        ║
╚══════════════════════════════════════════════════════╝

Install library:
    py -m pip install streamlit pandas numpy plotly openpyxl
"""

# ═══════════════════════════════════════════════════════
# IMPORT
# ═══════════════════════════════════════════════════════
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import io
import time

# ═══════════════════════════════════════════════════════
# KONFIGURASI HALAMAN
# ═══════════════════════════════════════════════════════
st.set_page_config(
    page_title="☕ Cafe Data Cleaner",
    page_icon="☕",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ═══════════════════════════════════════════════════════
# CSS — TEMA KOPI PREMIUM
# ═══════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');

html, body, [class*="css"] {
    font-family: 'Lato', sans-serif;
}
.stApp {
    background: #1a0a00;
    background-image:
        radial-gradient(ellipse at 20% 50%, rgba(139,69,19,0.18) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(210,105,30,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 90%, rgba(80,40,10,0.2) 0%, transparent 60%);
}

/* ── HERO ── */
.hero-wrap    { padding: 3rem 0 0.5rem; text-align: center; }
.hero-emoji   { font-size: 4rem; }
.hero-title   {
    font-family: 'Playfair Display', serif;
    font-size: 3.6rem; font-weight: 900;
    color: #f5deb3;
    text-shadow: 0 0 50px rgba(210,140,30,0.5);
    margin: 0;
}
.hero-sub     {
    font-size: 0.82rem; color: #a0856a;
    letter-spacing: 5px; text-transform: uppercase;
    margin-top: 0.4rem;
}
.hero-desc    {
    font-size: 0.98rem; color: #c4a882;
    max-width: 580px; margin: 0.8rem auto 0; line-height: 1.8;
}
.divider      {
    text-align: center; color: #6b3d1e;
    font-size: 1.1rem; letter-spacing: 12px;
    margin: 1.8rem 0;
}

/* ── METRIC CARD ── */
.mcard {
    background: linear-gradient(135deg,rgba(28,12,2,0.97),rgba(45,22,5,0.98));
    border: 1px solid rgba(210,140,30,0.22);
    border-radius: 18px; padding: 1.4rem;
    text-align: center; position: relative; overflow: hidden;
}
.mcard::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background: linear-gradient(90deg, #8b4513, #f4a460, #8b4513);
}
.mcard-icon   { font-size: 1.7rem; margin-bottom: 0.35rem; }
.mcard-val    {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 700; color: #f4a460;
}
.mcard-lbl    {
    font-size: 0.7rem; color: #8a6a50;
    text-transform: uppercase; letter-spacing: 2px; margin-top: 0.25rem;
}

/* ── SECTION HEADER ── */
.sec-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.65rem; color: #f5deb3; margin-bottom: 0.2rem;
}
.sec-line {
    width: 48px; height: 3px;
    background: linear-gradient(90deg,#d2691e,#f4a460);
    border-radius: 2px; margin-bottom: 1.3rem;
}

/* ── BADGE ── */
.badge-dirty {
    background: rgba(200,40,40,0.18);
    border: 1px solid rgba(220,60,60,0.45);
    color: #ff8888; padding: 3px 12px;
    border-radius: 20px; font-size: 0.8rem; font-weight: 700;
}
.badge-clean {
    background: rgba(40,180,80,0.18);
    border: 1px solid rgba(60,200,90,0.45);
    color: #7fff90; padding: 3px 12px;
    border-radius: 20px; font-size: 0.8rem; font-weight: 700;
}

/* ── INFO BOX ── */
.ibox {
    background: rgba(120,55,10,0.18);
    border-left: 4px solid #c8601a;
    border-radius: 0 12px 12px 0;
    padding: 0.85rem 1.3rem; margin: 0.7rem 0;
    color: #e0cbb5; font-size: 0.93rem; line-height: 1.65;
}

/* ── TABS ── */
.stTabs [data-baseweb="tab-list"] {
    background: rgba(25,10,0,0.88); border-radius: 12px; padding: 4px; gap: 4px;
}
.stTabs [data-baseweb="tab"] {
    background: transparent; color: #907060;
    border-radius: 8px; font-family: 'Lato', sans-serif; font-size: 0.88rem;
}
.stTabs [aria-selected="true"] {
    background: linear-gradient(135deg,#7a3810,#c8601a) !important;
    color: #fff5e6 !important;
}

/* ── BUTTON ── */
.stDownloadButton > button, .stButton > button {
    background: linear-gradient(135deg,#7a3810,#c8601a);
    color: #fff5e6; border: none; border-radius: 9px;
    font-family: 'Lato', sans-serif; font-weight: 700;
    letter-spacing: 1px; padding: 0.55rem 1.8rem;
    transition: all 0.25s;
}
.stDownloadButton > button:hover, .stButton > button:hover {
    background: linear-gradient(135deg,#c8601a,#f0a050);
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(200,96,26,0.4);
}

/* ── MISC ── */
p, li        { color: #c4a882; }
h1,h2,h3     { color: #f5deb3; font-family: 'Playfair Display', serif; }
.stDataFrame { border-radius: 12px; overflow: hidden; }
</style>
""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════
# KONSTANTA & HELPERS
# ═══════════════════════════════════════════════════════
CAFE_COLORS = ['#d2691e','#f4a460','#8b4513','#deb887',
               '#cd853f','#a0522d','#bc8f5f','#d2b48c']

PLOT_BASE = dict(
    plot_bgcolor  = 'rgba(18,7,0,0.65)',
    paper_bgcolor = 'rgba(0,0,0,0)',
    font_color    = '#c4a882',
    title_font    = dict(family='Playfair Display', size=16, color='#f5deb3'),
    legend        = dict(bgcolor='rgba(0,0,0,0)', font_color='#c4a882')
)

# Kolom asli dataset (8 kolom)
KOLOM_ASLI = [
    'Transaction ID', 'Item', 'Quantity',
    'Price Per Unit', 'Total Spent',
    'Payment Method', 'Location', 'Transaction Date'
]

def adalah_kotor(val):
    """Cek apakah satu nilai dianggap kotor."""
    return pd.isna(val) or str(val).strip().upper() in ['ERROR', 'UNKNOWN', 'NONE', '']

def hitung_kotor_df(df):
    """Hitung total sel kotor di seluruh dataframe."""
    return int(sum(df[c].apply(adalah_kotor).sum() for c in df.columns))

def highlight_kotor(val):
    """CSS untuk highlight sel kotor di tabel."""
    if adalah_kotor(val):
        return 'background-color:rgba(220,40,40,0.22);color:#ff8080;font-weight:700'
    return 'color:#d4b896'


# ═══════════════════════════════════════════════════════
# PROSES DATA CLEANING
# ═══════════════════════════════════════════════════════
def bersihkan_data(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Pipeline data cleaning lengkap:
    1. Hapus kolom ekstra (Bulan/Hari dari proses sebelumnya)
    2. Ambil hanya 8 kolom asli dataset
    3. Bersihkan kolom Item  → Title Case, isi modus
    4. Bersihkan kolom numerik → isi median
    5. Validasi Total Spent  = Qty × Price
    6. Bersihkan Payment Method & Location → Title Case, isi modus
    7. Bersihkan Transaction Date → format YYYY-MM-DD
    8. Tambah kolom Bulan & Hari
    9. Hapus duplikat
    """
    df = df_raw.copy()

    # ── 1. Pastikan hanya kolom asli ──────────────────
    kolom_ada = [c for c in KOLOM_ASLI if c in df.columns]
    df = df[kolom_ada]

    # ── 2. Kolom ITEM ──────────────────────────────────
    if 'Item' in df.columns:
        df['Item'] = df['Item'].apply(
            lambda x: np.nan if adalah_kotor(x) else str(x).strip().title()
        )
        modus_item = df['Item'].mode()[0] if df['Item'].notna().any() else 'Coffee'
        df['Item'] = df['Item'].fillna(modus_item)

    # ── 3. Kolom NUMERIK ───────────────────────────────
    for col in ['Quantity', 'Price Per Unit', 'Total Spent']:
        if col not in df.columns:
            continue
        df[col] = df[col].apply(lambda x: np.nan if adalah_kotor(x) else x)
        df[col] = pd.to_numeric(df[col], errors='coerce')
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)
        if col == 'Quantity':
            df[col] = df[col].round().astype(int)
        else:
            df[col] = df[col].round(2)

    # ── 4. Validasi TOTAL SPENT ────────────────────────
    if all(c in df.columns for c in ['Quantity', 'Price Per Unit', 'Total Spent']):
        df['Total Spent'] = (df['Quantity'] * df['Price Per Unit']).round(2)

    # ── 5. Kolom KATEGORIKAL ───────────────────────────
    for col in ['Payment Method', 'Location']:
        if col not in df.columns:
            continue
        df[col] = df[col].apply(
            lambda x: np.nan if adalah_kotor(x) else str(x).strip().title()
        )
        modus = df[col].mode()[0] if df[col].notna().any() else 'Unknown'
        df[col] = df[col].fillna(modus)

    # ── 6. Kolom TANGGAL ───────────────────────────────
    if 'Transaction Date' in df.columns:
        df['Transaction Date'] = pd.to_datetime(df['Transaction Date'], errors='coerce')
        # Kolom turunan (untuk analisis)
        df['Bulan'] = df['Transaction Date'].dt.month
        df['Hari']  = df['Transaction Date'].dt.day_name()
        # Format string rapi YYYY-MM-DD
        df['Transaction Date'] = df['Transaction Date'].dt.strftime('%Y-%m-%d')

    # ── 7. Hapus duplikat ─────────────────────────────
    df = df.drop_duplicates().reset_index(drop=True)

    return df


def pisahkan_baris_kotor(df_raw: pd.DataFrame) -> pd.DataFrame:
    """Kembalikan hanya baris yang ada nilai kotor (untuk tabel perbandingan kiri)."""
    kolom_ada = [c for c in KOLOM_ASLI if c in df_raw.columns]
    df_8 = df_raw[kolom_ada]
    mask = df_8.apply(lambda row: row.apply(adalah_kotor).any(), axis=1)
    return df_8[mask].reset_index(drop=True)


def buat_laporan_txt(df_raw, df_bersih, stats):
    """Buat isi laporan .txt untuk didownload."""
    return f"""
╔══════════════════════════════════════════════════════╗
║        LAPORAN DATA CLEANING — CAFE SALES            ║
╚══════════════════════════════════════════════════════╝

▸ SEBELUM CLEANING
  Total baris          : {len(df_raw):,}
  Total sel kotor      : {stats['kotor_awal']:,}
  Baris bermasalah     : {stats['baris_kotor']:,} ({stats['pct_baris_kotor']:.1f}%)
  Duplikat             : {stats['duplikat']}
  Tanggal tidak valid  : {stats['tgl_invalid']}

▸ SETELAH CLEANING
  Total baris bersih   : {len(df_bersih):,}
  Sel kotor tersisa    : {stats['kotor_akhir']}
  Tingkat kebersihan   : {stats['pct_bersih']:.1f}%

▸ TEKNIK DATA ENGINEERING YANG DIGUNAKAN
  1. Deteksi nilai ERROR / UNKNOWN / NULL / NONE
  2. Normalisasi teks → Title Case & hapus spasi berlebih
  3. Konversi tipe data (string → numerik / datetime)
  4. Imputasi nilai kosong:
       • Numerik  : diisi dengan nilai MEDIAN
       • Kategori : diisi dengan nilai MODUS (terbanyak)
  5. Validasi logika bisnis: Total Spent = Qty × Price Per Unit
  6. Penghapusan baris duplikat
  7. Feature Engineering: ekstrak kolom Bulan & Hari dari Tanggal

▸ DETAIL MASALAH PER KOLOM
""" + "\n".join(
        f"  {col:20s}: {stats['per_kolom'].get(col, 0):>5,} sel kotor"
        for col in KOLOM_ASLI
    ) + f"""

▸ KESIMPULAN
  Program ini menerapkan konsep DATA PIPELINE dalam Data Engineering:
  Input (data kotor) → Proses (deteksi + cleaning + transformasi)
  → Output (data bersih + laporan + grafik analisis bisnis)

  Manfaat nyata:
  • Owner  : laporan penjualan akurat untuk keputusan bisnis
  • Staff  : tidak perlu cek 10.000 baris manual (hemat berhari-hari)
  • Analis : data terjamin valid sebelum dianalisis lebih lanjut

{'═'*54}
"""


# ═══════════════════════════════════════════════════════
# KOMPONEN UI
# ═══════════════════════════════════════════════════════
def render_hero():
    st.markdown("""
    <div class="hero-wrap">
        <div class="hero-emoji">☕</div>
        <div class="hero-title">Cafe Sales Data Cleaner</div>
        <div class="hero-sub">Tugas Data Engineering</div>
        <div class="hero-desc">
            Sistem otomatis untuk mendeteksi, membersihkan,
            dan menganalisis data penjualan cafe yang kotor —
            dari ERROR & UNKNOWN menjadi insight bisnis yang bisa dipercaya.
        </div>
    </div>
    <div class="divider">✦ ✦ ✦</div>
    """, unsafe_allow_html=True)


def render_landing():
    """Tampilan sebelum upload."""
    c1, c2, c3 = st.columns(3)
    items = [
        ("🔍", "Deteksi Otomatis",
         "Temukan semua ERROR, UNKNOWN, NONE, dan nilai kosong — langsung di-highlight merah"),
        ("🧹", "Pipeline Cleaning",
         "7 tahap cleaning: normalisasi, imputasi median/modus, validasi logika bisnis, hapus duplikat"),
        ("📊", "Dashboard Interaktif",
         "6 grafik Plotly interaktif — hover, zoom, filter — langsung dari data yang sudah bersih"),
    ]
    for col, (icon, title, desc) in zip([c1, c2, c3], items):
        with col:
            st.markdown(f"""
            <div class="mcard" style="padding:2rem;">
                <div style="font-size:2.3rem;margin-bottom:0.9rem;">{icon}</div>
                <div style="font-family:'Playfair Display',serif;font-size:1.15rem;
                     color:#f5deb3;margin-bottom:0.7rem;">{title}</div>
                <div style="font-size:0.87rem;color:#907060;line-height:1.65;">{desc}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("""
    <div style="text-align:center;color:#3d1e08;font-size:0.78rem;
         letter-spacing:3px;padding:2.5rem 0 1rem;">
        TUGAS DATA ENGINEERING ✦ CAFE SALES DATASET ✦ KAGGLE
    </div>""", unsafe_allow_html=True)


def render_metrics(stats, n_raw, n_bersih):
    st.markdown('<div class="sec-title">📊 Ringkasan Hasil</div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-line"></div>', unsafe_allow_html=True)

    cols = st.columns(5)
    data = [
        ("📋", f"{n_raw:,}",                   "Total Baris"),
        ("🦠", f"{stats['kotor_awal']:,}",      "Sel Kotor Ditemukan"),
        ("🗑️", f"{stats['duplikat']}",          "Duplikat Dihapus"),
        ("📅", f"{stats['tgl_invalid']}",        "Tanggal Tidak Valid"),
        ("✨", f"{stats['pct_bersih']:.1f}%",   "Tingkat Kebersihan"),
    ]
    for col, (icon, val, lbl) in zip(cols, data):
        with col:
            st.markdown(f"""
            <div class="mcard">
                <div class="mcard-icon">{icon}</div>
                <div class="mcard-val">{val}</div>
                <div class="mcard-lbl">{lbl}</div>
            </div>""", unsafe_allow_html=True)


def render_tab_perbandingan(df_raw, df_bersih, df_kotor_saja, stats):
    """Tab 1: Sebelum vs Sesudah."""
    st.markdown('<div class="sec-title">Perbandingan: Kotor vs Bersih</div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-line"></div>', unsafe_allow_html=True)

    st.markdown(f"""
    <div class="ibox">
        💡 <strong>Cara baca tabel ini:</strong><br>
        • <span style="color:#ff8080;font-weight:700;">Kolom kiri</span> — hanya baris yang bermasalah
        (<strong style="color:#f4a460">{len(df_kotor_saja):,} baris</strong> dari {len(df_raw):,} total).
        Sel merah = nilai kotor (ERROR / UNKNOWN / kosong).<br>
        • <span style="color:#7fff90;font-weight:700;">Kolom kanan</span> — semua
        <strong style="color:#f4a460">{len(df_bersih):,} baris</strong> sudah diperbaiki.
        Jumlahnya lebih banyak karena menampilkan <em>seluruh</em> data, bukan hanya yang bermasalah.
    </div>
    """, unsafe_allow_html=True)

    l, r = st.columns(2)
    with l:
        st.markdown(
            f'<span class="badge-dirty">❌ BARIS BERMASALAH — {len(df_kotor_saja):,} baris</span>',
            unsafe_allow_html=True
        )
        st.caption("Sel merah = nilai ERROR / UNKNOWN / kosong / None")
        st.dataframe(
            df_kotor_saja.style.map(highlight_kotor),
            use_container_width=True, height=420
        )

    with r:
        st.markdown(
            f'<span class="badge-clean">✅ DATA BERSIH — {len(df_bersih):,} baris (semua data)</span>',
            unsafe_allow_html=True
        )
        st.caption("Semua nilai sudah diperbaiki — format seragam, tidak ada ERROR/UNKNOWN")
        st.dataframe(
            df_bersih.drop(columns=['Bulan','Hari'], errors='ignore'),
            use_container_width=True, height=420
        )

    # Bar chart masalah per kolom
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="sec-title">Jumlah Data Kotor per Kolom</div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-line"></div>', unsafe_allow_html=True)

    detail = []
    kolom_ada = [c for c in KOLOM_ASLI if c in df_raw.columns]
    for col in kolom_ada:
        n = int(df_raw[col].apply(adalah_kotor).sum())
        detail.append({'Kolom': col, 'Jumlah Kotor': n,
                       'Status': '⚠️ Bermasalah' if n > 0 else '✅ Bersih'})
    fig = px.bar(
        pd.DataFrame(detail), x='Kolom', y='Jumlah Kotor',
        color='Jumlah Kotor',
        color_continuous_scale=['#2a0d00', '#c8601a', '#ff7733'],
        text='Jumlah Kotor',
        title='Berapa Banyak Nilai Kotor di Setiap Kolom?',
        template='plotly_dark'
    )
    fig.update_traces(textposition='outside', textfont_color='#f4a460')
    fig.update_layout(**PLOT_BASE, coloraxis_showscale=False,
                      xaxis_tickangle=-30)
    st.plotly_chart(fig, use_container_width=True)


def render_tab_bermasalah(df_raw):
    """Tab 2: Detail baris bermasalah."""
    st.markdown('<div class="sec-title">Detail Baris Bermasalah</div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-line"></div>', unsafe_allow_html=True)

    kolom_ada = [c for c in KOLOM_ASLI if c in df_raw.columns]
    df_8 = df_raw[kolom_ada]
    mask = df_8.apply(lambda row: row.apply(adalah_kotor).any(), axis=1)
    bm   = df_8[mask].reset_index(drop=True)

    if len(bm) == 0:
        st.success("Tidak ada baris bermasalah ditemukan!")
        return

    pct = round(len(bm) / len(df_raw) * 100, 1)
    st.markdown(f"""
    <div class="ibox">
        🔍 Ditemukan <strong style="color:#f4a460">{len(bm):,} baris bermasalah</strong>
        dari total {len(df_raw):,} baris ({pct}%).<br>
        Sel yang <span style="color:#ff8080;font-weight:700;">berwarna merah</span>
        adalah nilai yang dianggap kotor: <code>ERROR</code>, <code>UNKNOWN</code>,
        <code>NONE</code>, atau kosong.
    </div>
    """, unsafe_allow_html=True)

    st.dataframe(
        bm.style.map(highlight_kotor),
        use_container_width=True, height=380
    )

    # Pie chart jenis masalah
    jenis = {'NULL / Kosong': 0, 'ERROR': 0, 'UNKNOWN': 0, 'NONE': 0}
    for col in kolom_ada:
        for v in df_raw[col]:
            s = str(v).strip().upper()
            if pd.isna(v) or s == '':
                jenis['NULL / Kosong'] += 1
            elif s == 'ERROR':
                jenis['ERROR'] += 1
            elif s == 'UNKNOWN':
                jenis['UNKNOWN'] += 1
            elif s == 'NONE':
                jenis['NONE'] += 1

    jenis = {k: v for k, v in jenis.items() if v > 0}

    col_a, col_b = st.columns(2)
    with col_a:
        fig_pie = px.pie(
            values=list(jenis.values()), names=list(jenis.keys()),
            title='Distribusi Jenis Data Kotor',
            color_discrete_sequence=['#d2691e','#ff5533','#f4a460','#aa3311'],
            template='plotly_dark', hole=0.44
        )
        fig_pie.update_layout(**PLOT_BASE)
        fig_pie.update_traces(textfont_color='white')
        st.plotly_chart(fig_pie, use_container_width=True)

    with col_b:
        st.markdown('<div class="ibox" style="margin-top:3rem;">', unsafe_allow_html=True)
        st.markdown("**Penjelasan jenis data kotor:**")
        st.markdown("""
        - **NULL / Kosong** — sel tidak diisi sama sekali
        - **ERROR** — sistem gagal merekam nilai, ditulis 'ERROR'
        - **UNKNOWN** — nilai tidak diketahui saat input
        - **NONE** — nilai None dari sistem
        """)
        st.markdown('</div>', unsafe_allow_html=True)


def render_tab_dashboard(df_bersih):
    """Tab 3: Dashboard analisis bisnis."""
    st.markdown('<div class="sec-title">Dashboard Analisis Bisnis</div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-line"></div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="ibox">📊 Semua grafik menggunakan '
        '<strong style="color:#f4a460">data yang sudah bersih</strong> — '
        'hover untuk detail, scroll untuk zoom.</div>',
        unsafe_allow_html=True
    )
    st.markdown("<br>", unsafe_allow_html=True)

    # ── Baris 1: Produk Terlaris + Metode Bayar ────────
    c1, c2 = st.columns(2)
    with c1:
        if 'Item' in df_bersih.columns:
            ic = df_bersih['Item'].value_counts().reset_index()
            ic.columns = ['Item', 'Transaksi']
            fig = px.bar(ic, x='Transaksi', y='Item', orientation='h',
                         title='☕ Produk Terlaris',
                         color='Transaksi',
                         color_continuous_scale=['#3d1a00','#c8601a','#f4a460'],
                         text='Transaksi', template='plotly_dark')
            fig.update_traces(textposition='outside', textfont_color='#f4a460')
            fig.update_layout(**PLOT_BASE, coloraxis_showscale=False,
                              yaxis={'categoryorder': 'total ascending'})
            st.plotly_chart(fig, use_container_width=True)

    with c2:
        if 'Payment Method' in df_bersih.columns:
            pm = df_bersih['Payment Method'].value_counts().reset_index()
            pm.columns = ['Metode', 'Jumlah']
            fig = px.pie(pm, values='Jumlah', names='Metode',
                         title='💳 Metode Pembayaran',
                         color_discrete_sequence=CAFE_COLORS,
                         template='plotly_dark', hole=0.44)
            fig.update_layout(**PLOT_BASE)
            fig.update_traces(textfont_color='white')
            st.plotly_chart(fig, use_container_width=True)

    # ── Baris 2: Tren Penjualan per Bulan ─────────────
    if 'Bulan' in df_bersih.columns and 'Total Spent' in df_bersih.columns:
        mn = df_bersih.groupby('Bulan')['Total Spent'].sum().reset_index()
        mn.columns = ['Bulan', 'Total Penjualan']
        fig = go.Figure(go.Scatter(
            x=mn['Bulan'], y=mn['Total Penjualan'],
            mode='lines+markers+text',
            text=mn['Total Penjualan'].apply(lambda x: f"${x:,.0f}"),
            textposition='top center',
            textfont=dict(color='#f4a460', size=10),
            line=dict(color='#f4a460', width=3),
            marker=dict(size=11, color='#c8601a',
                        line=dict(color='#f4a460', width=2)),
            fill='tozeroy', fillcolor='rgba(200,96,26,0.1)'
        ))
        fig.update_layout(
            title='📅 Tren Total Penjualan per Bulan',
            xaxis=dict(tickmode='linear', tickvals=list(range(1,13)),
                       gridcolor='rgba(120,55,10,0.18)'),
            yaxis=dict(gridcolor='rgba(120,55,10,0.18)'),
            hovermode='x unified', **PLOT_BASE
        )
        st.plotly_chart(fig, use_container_width=True)

    # ── Baris 3: Revenue Lokasi + Revenue Produk ──────
    c3, c4 = st.columns(2)
    with c3:
        if 'Location' in df_bersih.columns and 'Total Spent' in df_bersih.columns:
            lr = df_bersih.groupby('Location')['Total Spent'].sum().reset_index()
            lr.columns = ['Lokasi', 'Revenue']
            fig = px.bar(lr, x='Lokasi', y='Revenue',
                         title='📍 Revenue per Lokasi',
                         color='Revenue',
                         color_continuous_scale=['#3d1a00','#c8601a','#f4a460'],
                         text='Revenue', template='plotly_dark')
            fig.update_traces(
                texttemplate='$%{text:,.0f}',
                textposition='outside', textfont_color='#f4a460'
            )
            fig.update_layout(**PLOT_BASE, coloraxis_showscale=False)
            st.plotly_chart(fig, use_container_width=True)

    with c4:
        if 'Item' in df_bersih.columns and 'Total Spent' in df_bersih.columns:
            ir = df_bersih.groupby('Item')['Total Spent'].sum().reset_index()
            ir.columns = ['Item', 'Revenue']
            fig = px.pie(ir, values='Revenue', names='Item',
                         title='💰 Revenue per Produk',
                         color_discrete_sequence=CAFE_COLORS,
                         template='plotly_dark', hole=0.32)
            fig.update_layout(**PLOT_BASE)
            fig.update_traces(textfont_color='white')
            st.plotly_chart(fig, use_container_width=True)

    # ── Baris 4: Heatmap Hari vs Item ─────────────────
    if 'Hari' in df_bersih.columns and 'Item' in df_bersih.columns:
        pv  = df_bersih.groupby(['Hari', 'Item']).size().reset_index(name='n')
        pw  = pv.pivot(index='Hari', columns='Item', values='n').fillna(0)
        ord = [h for h in
               ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
               if h in pw.index]
        pw  = pw.reindex(ord)
        fig = px.imshow(
            pw, title='🗓️ Heatmap — Produk vs Hari (Jumlah Transaksi)',
            color_continuous_scale=['#1a0800','#8b4513','#f4a460'],
            template='plotly_dark', aspect='auto',
            text_auto=True
        )
        fig.update_layout(**PLOT_BASE)
        fig.update_traces(textfont_color='white')
        st.plotly_chart(fig, use_container_width=True)


def render_tab_download(df_bersih, df_kotor_saja, laporan_txt):
    """Tab 4: Download semua output."""
    st.markdown('<div class="sec-title">Download Hasil</div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-line"></div>', unsafe_allow_html=True)

    c1, c2, c3 = st.columns(3)

    with c1:
        csv_bersih = df_bersih.to_csv(index=False).encode('utf-8')
        st.download_button(
            "⬇️ Data Bersih (CSV)",
            data=csv_bersih,
            file_name="cafe_sales_BERSIH.csv",
            mime="text/csv",
            use_container_width=True
        )
        st.markdown(
            '<div class="ibox">Semua 10.000 baris sudah bersih — '
            'siap untuk analisis lanjutan atau dimasukkan ke database.</div>',
            unsafe_allow_html=True
        )

    with c2:
        csv_kotor = df_kotor_saja.to_csv(index=False).encode('utf-8')
        st.download_button(
            "⬇️ Baris Bermasalah (CSV)",
            data=csv_kotor,
            file_name="cafe_sales_BERMASALAH.csv",
            mime="text/csv",
            use_container_width=True
        )
        st.markdown(
            '<div class="ibox">Hanya baris yang mengandung ERROR/UNKNOWN — '
            'berguna untuk audit atau laporan ke atasan.</div>',
            unsafe_allow_html=True
        )

    with c3:
        st.download_button(
            "⬇️ Laporan Cleaning (TXT)",
            data=laporan_txt.encode('utf-8'),
            file_name="laporan_data_cleaning.txt",
            mime="text/plain",
            use_container_width=True
        )
        csv_bersih = df_bersih.to_csv(index=False, sep=';').encode('utf-8')
        st.download_button(
             "⬇️ Data Bersih (CSV)",
            data=csv_bersih,
            file_name="cafe_sales_BERSIH.csv",
            mime="text/csv"
        )
        st.markdown(
            '<div class="ibox">Laporan lengkap proses cleaning — '
            'lampirkan saat presentasi ke dosen.</div>',
            unsafe_allow_html=True
        )

    # Preview laporan
    with st.expander("👁️ Preview laporan"):
        st.text(laporan_txt)


# ═══════════════════════════════════════════════════════
# MAIN APP
# ═══════════════════════════════════════════════════════
def main():
    render_hero()

    # ── Upload section ─────────────────────────────────
    st.markdown('<div class="sec-title">📂 Upload Dataset</div>', unsafe_allow_html=True)
    st.markdown('<div class="sec-line"></div>', unsafe_allow_html=True)

    uploaded = st.file_uploader(
        "Upload **dirty_cafe_sales.csv** — file asli dari Kaggle (yang BELUM dibersihkan)",
        type=['csv'],
        help="Harus file CSV asli dari Kaggle, bukan hasil export sebelumnya"
    )

    if not uploaded:
        render_landing()
        return

    # ── Proses data ────────────────────────────────────
    with st.spinner("☕ Menyeduh data... tunggu sebentar..."):
        time.sleep(0.5)
        df_raw    = pd.read_csv(uploaded)
        df_bersih = bersihkan_data(df_raw)
        df_kotor_saja = pisahkan_baris_kotor(df_raw)

    # ── Hitung statistik ──────────────────────────────
    kolom_ada = [c for c in KOLOM_ASLI if c in df_raw.columns]
    stats = {
        'kotor_awal'     : hitung_kotor_df(df_raw[kolom_ada]),
        'kotor_akhir'    : hitung_kotor_df(
                               df_bersih.drop(columns=['Bulan','Hari'], errors='ignore')),
        'duplikat'       : int(df_raw.duplicated().sum()),
        'tgl_invalid'    : int(pd.to_datetime(
                               df_raw.get('Transaction Date', pd.Series()),
                               errors='coerce').isna().sum()),
        'baris_kotor'    : len(df_kotor_saja),
        'pct_baris_kotor': round(len(df_kotor_saja) / len(df_raw) * 100, 1),
        'pct_bersih'     : 0.0,
        'per_kolom'      : {c: int(df_raw[c].apply(adalah_kotor).sum())
                            for c in kolom_ada}
    }
    total_sel = df_raw[kolom_ada].size
    stats['pct_bersih'] = round(
        (1 - stats['kotor_akhir'] / max(total_sel, 1)) * 100, 1
    )

    laporan_txt = buat_laporan_txt(df_raw, df_bersih, stats)

    st.success(f"✅ {len(df_raw):,} baris berhasil diproses!")
    st.markdown("<br>", unsafe_allow_html=True)

    # ── Metrics ───────────────────────────────────────
    render_metrics(stats, len(df_raw), len(df_bersih))
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="divider">✦ ✦ ✦</div>', unsafe_allow_html=True)

    # ── Tabs ──────────────────────────────────────────
    t1, t2, t3, t4 = st.tabs([
        "🔍 Sebelum vs Sesudah",
        "🦠 Data Bermasalah",
        "📈 Dashboard Analisis",
        "💾 Download"
    ])

    with t1:
        render_tab_perbandingan(df_raw, df_bersih, df_kotor_saja, stats)
    with t2:
        render_tab_bermasalah(df_raw)
    with t3:
        render_tab_dashboard(df_bersih)
    with t4:
        render_tab_download(df_bersih, df_kotor_saja, laporan_txt)

    # Footer
    st.markdown("""
    <div style="text-align:center;color:#2d1205;font-size:0.75rem;
         letter-spacing:3px;padding:3rem 0 1rem;">
        TUGAS DATA ENGINEERING ✦ CAFE SALES DIRTY DATASET ✦ KAGGLE
    </div>""", unsafe_allow_html=True)


if __name__ == "__main__":
    main()