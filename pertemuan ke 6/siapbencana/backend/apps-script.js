// ================================================================
// SIAPBENCANA — Google Apps Script Backend (dengan JSONP support)
// ================================================================
//
// PENTING: Setelah update kode ini, harus RE-DEPLOY!
// Deploy → Manage Deployments → Edit (pensil) → Version: New Version → Deploy
// URL tidak berubah, tapi kode ter-update.
// ================================================================

const SHEET_NAME = "Relawan";
const HEADERS = [
  "Timestamp", "Nama", "Kota", "Provinsi",
  "Keahlian", "Detail", "Kontak", "Status", "Verified", "Flags"
];

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = String(row[i] || ""));
      return obj;
    });

    const result = JSON.stringify({ success: true, data: data, total: data.length });

    // Kalau ada callback parameter → JSONP (untuk GitHub Pages)
    // Kalau tidak ada → JSON biasa (untuk localhost)
    const callback = e.parameter.callback;
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + result + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(result)
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    const errResult = JSON.stringify({ success: false, error: err.toString() });
    const callback = e.parameter.callback;
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + errResult + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService
      .createTextOutput(errResult)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    if (!payload.Nama || !payload.Kota || !payload.Keahlian || !payload.Kontak) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: "Field wajib tidak lengkap" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([
      new Date().toISOString(),
      payload.Nama || "",
      payload.Kota || "",
      payload.Provinsi || "",
      payload.Keahlian || "",
      payload.Detail || "",
      payload.Kontak || "",
      payload.Status || "Siap",
      "FALSE",
      "0"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Berhasil ditambahkan" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testSetup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) { Logger.log("❌ Sheet '" + SHEET_NAME + "' tidak ditemukan!"); return; }
  Logger.log("✅ Sheet OK");
  Logger.log("📊 Data: " + (sheet.getLastRow() - 1) + " baris");
}