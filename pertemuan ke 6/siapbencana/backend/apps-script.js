// ================================================================
// SIAPBENCANA — apps-script.js (Versi Lengkap dengan Login & RBAC)
// ================================================================
// CARA UPDATE:
// 1. Buka Google Sheets → Extensions → Apps Script
// 2. Hapus kode lama, paste seluruh kode ini
// 3. Save (Ctrl+S)
// 4. Deploy → Manage Deployments → Edit → New Version → Deploy
// ================================================================

const SHEET_RELAWAN     = "Relawan";
const SHEET_KOORDINATOR = "Koordinator";
const HEADERS_RELAWAN   = ["Timestamp","Kode","Nama","Kota","Provinsi","Keahlian","Detail","Kontak","Status","Verified","Flags"];
const HEADERS_KOORD     = ["Timestamp","Kode","Nama","Instansi","Wilayah","Kontak"];

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    const headers = name === SHEET_RELAWAN ? HEADERS_RELAWAN : HEADERS_KOORD;
    sheet.appendRow(headers);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = String(row[i] || ""));
    return obj;
  });
}

function doGet(e) {
  try {
    const action   = e.parameter.action || 'get';
    const callback = e.parameter.callback;
    let result;

    if (action === 'get') {
      const data = sheetToObjects(getSheet(SHEET_RELAWAN));
      result = { success: true, data, total: data.length };

    } else if (action === 'login') {
      const kode = (e.parameter.kode || '').trim().toUpperCase();
      const relawan = sheetToObjects(getSheet(SHEET_RELAWAN));
      const found = relawan.find(r => r.Kode === kode);
      if (found) {
        result = { success: true, user: found, role: 'relawan' };
      } else {
        const koordinator = sheetToObjects(getSheet(SHEET_KOORDINATOR));
        const koord = koordinator.find(k => k.Kode === kode);
        if (koord) {
          result = { success: true, user: koord, role: 'koordinator' };
        } else {
          result = { success: false, message: 'Kode tidak ditemukan.' };
        }
      }

    } else if (action === 'stats') {
      const data = sheetToObjects(getSheet(SHEET_RELAWAN));
      result = {
        success: true,
        total: data.length,
        verified: data.filter(d => d.Verified === 'TRUE').length,
        aktif: data.filter(d => d.Status === 'Siap').length,
        kota: [...new Set(data.map(d => d.Kota))].length
      };

    } else {
      result = { success: false, message: 'Action tidak dikenali.' };
    }

    const jsonStr = JSON.stringify(result);
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + jsonStr + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(jsonStr)
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    const errJson = JSON.stringify({ success: false, error: err.toString() });
    const cb = e.parameter.callback;
    if (cb) return ContentService.createTextOutput(cb + '(' + errJson + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
    return ContentService.createTextOutput(errJson).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action  = payload.action;

    if (action === 'add') {
      const kode = 'SB-' + Math.floor(100000 + Math.random() * 900000);
      const sheet = getSheet(SHEET_RELAWAN);
      sheet.appendRow([
        new Date().toISOString(), kode,
        payload.Nama||"", payload.Kota||"", payload.Provinsi||"",
        payload.Keahlian||"", payload.Detail||"", payload.Kontak||"",
        payload.Status||"Siap", "FALSE", "0"
      ]);
      return jsonOut({ success: true, kode });

    } else if (action === 'update') {
      return updateMultiField(SHEET_RELAWAN, payload.kode,
        { Detail: payload.Detail, Kontak: payload.Kontak, Status: payload.Status });

    } else if (action === 'approve') {
      return updateField(SHEET_RELAWAN, payload.kode, 'Verified', 'TRUE');

    } else if (action === 'hapus') {
      const sheet = getSheet(SHEET_RELAWAN);
      const rows  = sheet.getDataRange().getValues();
      const kodeIdx = rows[0].indexOf('Kode');
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][kodeIdx] === payload.kode) {
          sheet.deleteRow(i + 1);
          return jsonOut({ success: true });
        }
      }
      return jsonOut({ success: false });

    } else if (action === 'toggleStatus') {
      return updateField(SHEET_RELAWAN, payload.kode, 'Status', payload.status);

    } else if (action === 'flag') {
      const sheet = getSheet(SHEET_RELAWAN);
      const rows  = sheet.getDataRange().getValues();
      const headers = rows[0];
      const kodeIdx = headers.indexOf('Kode');
      const flagIdx = headers.indexOf('Flags');
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][kodeIdx] === payload.kode) {
          const curr = parseInt(rows[i][flagIdx]||'0') + 1;
          sheet.getRange(i+1, flagIdx+1).setValue(String(curr));
          return jsonOut({ success: true, flags: curr });
        }
      }
      return jsonOut({ success: false });

    } else if (action === 'resetFlag') {
      return updateField(SHEET_RELAWAN, payload.kode, 'Flags', '0');

    } else if (action === 'addKoordinator') {
      const sheet = getSheet(SHEET_KOORDINATOR);
      sheet.appendRow([
        new Date().toISOString(),
        payload.kode||"",
        payload.nama||"",
        payload.instansi||"",
        payload.wilayah||"",
        payload.kontak||""
      ]);
      return jsonOut({ success: true });

    } else {
      return jsonOut({ success: false, message: 'Action tidak dikenali.' });
    }

  } catch(err) {
    return jsonOut({ success: false, error: err.toString() });
  }
}

function updateField(sheetName, kode, field, value) {
  const sheet = getSheet(sheetName);
  const rows  = sheet.getDataRange().getValues();
  const headers = rows[0];
  const kodeIdx  = headers.indexOf('Kode');
  const fieldIdx = headers.indexOf(field);
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][kodeIdx] === kode) {
      sheet.getRange(i+1, fieldIdx+1).setValue(value);
      return jsonOut({ success: true });
    }
  }
  return jsonOut({ success: false, message: 'Data tidak ditemukan.' });
}

function updateMultiField(sheetName, kode, fields) {
  const sheet = getSheet(sheetName);
  const rows  = sheet.getDataRange().getValues();
  const headers = rows[0];
  const kodeIdx = headers.indexOf('Kode');
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][kodeIdx] === kode) {
      Object.entries(fields).forEach(([field, value]) => {
        if (value !== undefined) {
          const col = headers.indexOf(field) + 1;
          if (col > 0) sheet.getRange(i+1, col).setValue(value);
        }
      });
      return jsonOut({ success: true });
    }
  }
  return jsonOut({ success: false });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function testSetup() {
  const r = getSheet(SHEET_RELAWAN);
  const k = getSheet(SHEET_KOORDINATOR);
  Logger.log("Relawan: " + (r.getLastRow()-1) + " data");
  Logger.log("Koordinator: " + (k.getLastRow()-1) + " data");
}