# 🔧 DuitKu Backend - Golang & Google Sheets Sync

Backend API ringan berbasis Golang untuk menghubungkan aplikasi pencatatan keuangan **DuitKu** ke **Google Sheets** dan **Google Drive**.

## 🌟 Fitur Backend
1. **Google Sheets Integration**: Membuat spreadsheet otomatis bernama `DuitKu_Keuangan_Pribadi` dengan header berdesain rapi.
2. **Google Drive Integration**: Menaruh file sheet secara terorganisir di dalam folder `DuitKu` di Google Drive Anda.
3. **Rest API**:
   - `GET /api/health` - Cek kesehatan server dan status Google API.
   - `POST /api/sync/push` - Menerima data transaksi & tabungan dari frontend untuk disimpan ke Google Sheets.
   - `GET /api/sync/pull` - Mengambil data terbaru dari Google Sheets kembali ke frontend.
4. **Fallback & Offline Resilient**: Jika kredensial belum dipasang, server tetap merespons dengan aman tanpa crash.

---

## 🚀 Cara Menjalankan Backend

### 1. Menyiapkan Kredensial Google Cloud (Gratis)
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru (contoh: `DuitKu-Finance`).
3. Buka menu **APIs & Services** > **Library**, lalu aktifkan:
   - **Google Sheets API**
   - **Google Drive API**
4. Buka menu **Credentials** > **Create Credentials** > **Service Account**.
5. Setelah Service Account terbuat, klik akun tersebut > tab **Keys** > **Add Key** > **Create new key** (pilih tipe **JSON**).
6. File JSON akan terunduh. Ganti nama file tersebut menjadi `credentials.json` dan letakkan di folder `backend/`:
   ```
   d:\APP Finance\backend\credentials.json
   ```

### 2. Menjalankan Server Golang
Jika Go sudah terpasang di komputer Anda:
```powershell
cd "d:\APP Finance\backend"
go run main.go
```

Server akan aktif di `http://localhost:8080`.
Frontend Vue.js akan otomatis tersambung ke server ini saat Anda menekan tombol **"Simpan ke Google Sheets"**.
