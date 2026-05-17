# Cara Setup Backend Google Sheets

## Langkah 1 — Buat Google Sheets
1. Buka sheets.google.com
2. Buat spreadsheet baru, beri nama: SiapBencana_DB
3. Rename tab pertama menjadi: Relawan
4. Isi baris 1 (header): Timestamp | Nama | Kota | Provinsi | Keahlian | Detail | Kontak | Status | Verified | Flags

## Langkah 2 — Setup Apps Script
1. Klik Extensions → Apps Script
2. Hapus kode default
3. Copy paste isi file: backend/apps-script.js
4. Klik Save (Ctrl+S)
5. Jalankan fungsi testSetup() untuk cek koneksi

## Langkah 3 — Deploy Web App
1. Klik Deploy → New Deployment
2. Pilih Type: Web App
3. Execute as: Me
4. Who has access: Anyone
5. Klik Deploy
6. Copy URL yang muncul

## Langkah 4 — Sambungkan ke Website
1. Buka file index.html
2. Cari baris: const APPS_SCRIPT_URL = "PASTE_URL_APPS_SCRIPT_KAMU_DISINI"
3. Ganti dengan URL yang kamu copy tadi
4. Simpan file

## Langkah 5 — Upload ke GitHub
1. Buat repository baru di github.com
2. Upload seluruh folder siapbencana/
3. Settings → Pages → Branch: main → Save
4. Website live di: https://namakamu.github.io/namarepository
