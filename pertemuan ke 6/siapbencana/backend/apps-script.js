// ================================================================
// SIAPBENCANA — Google Apps Script Backend
// Paste kode ini di Extensions → Apps Script di Google Sheets kamu
// ================================================================
//
// LANGKAH SETUP:
// 1. Buka Google Sheets kamu
// 2. Klik Extensions → Apps Script
// 3. Hapus kode yang ada, paste seluruh kode ini
// 4. Klik Save (Ctrl+S)
// 5. Klik Deploy → New Deployment
// 6. Pilih Type: Web App
// 7. Execute as: Me
// 8. Who has access: Anyone
// 9. Klik Deploy → Copy URL yang muncul
// 10. Paste URL itu ke file siapbencana.html (ganti PASTE_URL_APPS_SCRIPT_KAMU_DISINI)
// ================================================================

const SHEET_NAME = "Relawan";

// Header kolom — pastikan sheet kamu punya header ini di baris 1
const HEADERS = [
  "Timestamp", "Nama", "Kota", "Provinsi",
  "Keahlian", "Detail", "Kontak", "Status",
  "Verified", "Flags"
];

// ── GET: Ambil semua data relawan ──────────────────────────────
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // Buat header kalau belum ada
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }
    
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    
    // Skip baris header (index 0), convert ke array of objects
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || "");
      return obj;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: data, total: data.length }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── POST: Tambah relawan baru ──────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // Buat header kalau belum ada
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }
    
    // Validasi field wajib
    if (!payload.Nama || !payload.Kota || !payload.Keahlian || !payload.Kontak) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: "Field wajib tidak lengkap" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Tambah baris baru
    const newRow = [
      new Date().toISOString(),  // Timestamp
      payload.Nama || "",
      payload.Kota || "",
      payload.Provinsi || "",
      payload.Keahlian || "",
      payload.Detail || "",
      payload.Kontak || "",
      payload.Status || "Siap",
      "FALSE",                   // Verified: default belum terverifikasi
      "0"                        // Flags: default 0
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Relawan berhasil ditambahkan" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── TEST: Jalankan ini untuk cek koneksi sheet ─────────────────
function testSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    Logger.log("❌ Sheet '" + SHEET_NAME + "' tidak ditemukan! Buat sheet dengan nama itu dulu.");
    return;
  }
  
  Logger.log("✅ Sheet ditemukan: " + sheet.getName());
  Logger.log("📊 Jumlah baris data: " + (sheet.getLastRow() - 1));
  Logger.log("🔗 Spreadsheet URL: " + ss.getUrl());
  Logger.log("✅ Setup berhasil! Sekarang bisa Deploy sebagai Web App.");
}
