<div align="center">

# 🌿 Pitihflow
**Aplikasi Pencatatan Aliran Keuangan Pribadi Mewah, Mandiri & Aman**

[![Vue 3](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android%20%2F%20iOS-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Security](https://img.shields.io/badge/OWASP-Top%2010%20Hardened-green?style=for-the-badge&logo=owasp&logoColor=white)](https://owasp.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

*Pencatatan kas pribadi berkelas editorial tanpa langganan, tanpa iklan, dan tanpa server backend rumit.*

</div>

---

## 📖 Filosofi & Konsep

Nama **Pitihflow** menggabungkan dua akar kata:
- **Pitih** *(Bahasa Minangkabau)*: Uang / harta / rezeki berharga.
- **Flow** *(Bahasa Inggris)*: Aliran kas (*cashflow*) yang lancar, terarah, dan terkontrol.

Pitihflow diciptakan untuk menjawab keresahan aplikasi finansial modern yang dipenuhi iklan, meminta izin data pribadi berlebihan, atau memungut biaya langganan bulanan. Dengan Pitihflow, **data Anda adalah milik Anda sepenuhnya**, tersimpan aman di perangkat (*IndexedDB*) dan dapat dicadangkan ke **Google Sheets pribadi Anda sendiri**.

---

## ✨ Karakteristik Desain & Keunggulan

### 1. ✒️ Tipografi Editorial Mewah (*Anti AI-Slop*)
Menghindari kesan template murahan generik (*AI slop*). Pitihflow memadukan:
- **Cormorant Garamond** (Editorial Serif): Digunakan untuk sapaan personal, angka saldo utama (*hero card*), dan kartu tabungan untuk memberikan aura kemewahan klasik ala majalah finansial bergengsi.
- **Inter** (Grotesque Clean Sans): Digunakan untuk tabel data, input formulir, dan navigasi agar angka transaksi tetap terbaca tajam dan presisi.

### 2. 🌓 Dual-Theme: Obsidian Dark & Porcelain Light
- **Obsidian Dark (`#0c0e12`)**: Nuansa hitam pekat OLED dengan aksen bercahaya hijau zamrud (*Pure Green* `#00FF00` / `#00E676`). Nyaman di mata dan hemat baterai di layar AMOLED.
- **Porcelain Light (`#f4f5f6`)**: Latar porselen putih lembut yang elegan, dengan kartu putih bersih dan kontras teks yang ramah pengguna.
- Tersedia tombol cepat ganti tema (☀️ / 🌙) di Beranda dan menu Pengaturan.

### 3. 🎭 Koleksi Avatar 3D Open-Source
Pengguna dapat memilih identitas profil berupa avatar 3D vektor beresolusi tinggi tanpa perlu koneksi internet:
- 👑 **Sultan Executive**
- 👸 **Royal Empress**
- 💻 **Tech Innovator**
- 🤖 **Cyber Sentinel**
- 📈 **Wall Street Pro**
- 🐱 **Golden Fortune Cat**
- Dilengkapi pilihan **Bingkai Bercahaya** (*Glow Pure Green, Plasma Gradient, Gold Luxury, Cyber Cyan, Minimalist*).

### 4. 🏛️ Pitihflow AI Concierge
Asisten konsultan finansial cerdas yang melayang di pojok layar:
- Berjalan langsung di peramban pengguna (*zero-cost* & hemat kuota).
- Memberikan saran budgeting berbasis formula **50/30/20** (Kebutuhan / Keinginan / Tabungan).
- Menganalisis rasio tabungan, tren pengeluaran, dan memberikan evaluasi kesehatan finansial langsung dari kas Anda.

### 5. 🛡️ Pengamanan Standar OWASP Top 10
- **Anti-XSS**: Sanitasi ketat terhadap seluruh input nama transaksi, target tabungan, dan catatan menggunakan DOMPurify.
- **Anti-CSV Formula Injection**: Seluruh ekspor file CSV diamankan dari eksploitasi formula Excel/Sheets (`=`, `+`, `-`, `@`, `\t`, `\r`).
- **Verifikasi Integritas Data**: Cadangan file JSON diverifikasi strukturnya sebelum proses pemulihan (*restore*) untuk mencegah injeksi skrip berbahaya.

### 6. 📊 Cloud Database Mandiri via Google Sheets (Bebas Server)
Tidak perlu menyewa VPS atau server backend yang harus dinyalakan 24 jam. Pitihflow dapat terhubung langsung ke **Google Sheets** menggunakan **Google Apps Script Web App** gratis yang berjalan di infrastruktur Google Cloud.

---

## 🛠️ Tech Stack Arsitektur

```
┌────────────────────────────────────────────────────────┐
│                      PITIHFLOW UI                      │
│     Vue 3 (Composition API) + Cormorant Garamond Serif │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
┌──────────────┐                          ┌──────────────┐
│ Pinia Stores │                          │ AI Concierge │
│  & Router 4  │                          │ Rule Engine  │
└──────┬───────┘                          └──────────────┘
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
┌──────────────┐                          ┌──────────────┐
│  IndexedDB   │                          │ Google Apps  │
│ (idb-keyval) │                          │ Script Sync  │
│ Offline-1st  │                          └──────┬───────┘
└──────────────┘                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ Google Sheet │
                                          │  (Cloud DB)  │
                                          └──────────────┘
```

| Lapisan | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework** | **Vue 3** (`<script setup>`) | Reaktivitas modern, performa tinggi, modular |
| **Build Tool** | **Vite 6** | Bundler kilat generasi terbaru dengan Hot Module Replacement (HMR) |
| **State Management** | **Pinia** | Store terstruktur untuk Keuangan, Tabungan, Profil Pengguna, dan Tema |
| **Penyimpanan Lokal** | **idb-keyval (IndexedDB)** | Basis data NoSQL lokal di peramban; data tidak hilang saat aplikasi ditutup |
| **Cloud Sync** | **Google Apps Script** | Jembatan REST API gratis ke Google Sheets pribadi |
| **Mobile App** | **Capacitor 6 (Android)** | Membungkus Web App menjadi native Android APK |
| **PWA Engine** | **vite-plugin-pwa (Workbox)** | Dukungan instalasi langsung di ponsel (*Add to Home Screen*) |
| **Keamanan** | **DOMPurify** | Sanitasi input data dari serangan Cross-Site Scripting (XSS) |

---

## 📁 Struktur Direktori Proyek

```text
APP Finance/
├── .gitignore                      # Konfigurasi file yang diabaikan Git
├── Design.md                       # Spesifikasi desain dan antarmuka
├── README.md                       # Dokumentasi resmi proyek
│
├── frontend/                       # Aplikasi Utama (Vue 3 + Vite)
│   ├── public/                     # Aset publik statis
│   │   ├── favicon.svg             # Ikon P Pitihflow (background putih)
│   │   ├── apple-touch-icon.png    # Ikon PWA iOS Safari
│   │   └── icons/                  # Ikon PWA 192x192 & 512x512
│   ├── src/
│   │   ├── assets/
│   │   │   └── main.css            # Variabel CSS tema, tipografi & animasi
│   │   ├── components/
│   │   │   ├── AiChatBot.vue       # Pitihflow AI Concierge floating popup
│   │   │   ├── DepositModal.vue    # Modal setor dana tabungan
│   │   │   ├── GlowSplash.vue      # Animasi interaktif layar pembuka
│   │   │   └── ToastNotification.vue # Notifikasi pop-up global
│   │   ├── stores/
│   │   │   ├── finance.js          # Store transaksi & saldo (IndexedDB)
│   │   │   ├── savings.js          # Store target tabungan (IndexedDB)
│   │   │   ├── sync.js             # Sinkronisasi Google Sheets
│   │   │   ├── theme.js            # Switcher Obsidian Dark / Porcelain Light
│   │   │   └── user.js             # Profil pengguna & avatar 3D
│   │   ├── utils/
│   │   │   ├── avatars.js          # 6 Vektor avatar 3D & frame cahaya
│   │   │   └── security.js         # Pengamanan OWASP Top 10 (Anti-XSS & Anti-CSV)
│   │   ├── views/
│   │   │   ├── DashboardView.vue   # Halaman utama, sapaan, saldo & chart ringkas
│   │   │   ├── TransactionsView.vue# Riwayat & filter transaksi
│   │   │   ├── AddTransactionView.vue # Formulir pemasukan/pengeluaran
│   │   │   ├── SavingsView.vue     # Daftar impian & celengan digital
│   │   │   ├── AddSavingView.vue   # Formulir tambah target tabungan
│   │   │   └── SettingsView.vue    # Pengaturan avatar, tema, sync sheets & ekspor
│   │   ├── App.vue                 # Layout induk & bottom navbar responsif
│   │   └── main.js                 # Inisialisasi Vue & PWA registration
│   ├── android/                    # Proyek native Android (Capacitor)
│   ├── netlify.toml                # Konfigurasi deploy Netlify
│   └── vite.config.js              # Konfigurasi Vite & PWA manifest
│
└── backend/                        # (Opsional) Referensi skrip Go legacy
```

---

## 🚀 Panduan Memulai (Local Development)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 ke atas
- Terminal PowerShell / Bash

### 1. Kloning Repository
```bash
git clone https://github.com/USERNAME/pitihflow.git
cd pitihflow/frontend
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di `http://localhost:3000`.

### 4. Build untuk Produksi
```bash
npm run build
```
Hasil build siap pakai akan tersedia di folder `frontend/dist/`.

---

## 🌐 Panduan Deploy

### Opsi A: Deploy ke Cloudflare Pages (Rekomendasi — 100% Bersih & Gratis)
1. Buka [Cloudflare Pages Dashboard](https://dash.cloudflare.com/).
2. Pilih **Workers & Pages** > **Create application** > **Pages** > **Upload assets**.
3. Masukkan nama proyek (misal: `pitihflow`).
4. Seret (*drag & drop*) seluruh folder `frontend/dist/`.
5. Klik **Deploy site**. Aplikasi Anda langsung online via HTTPS (contoh: `https://pitihflow.pages.dev`).

### Opsi B: Deploy ke Netlify
1. Buka [app.netlify.com](https://app.netlify.com).
2. Drag-and-drop folder `frontend/dist/` ke area deploy.
3. *Tips*: Masuk ke **Site settings** > **Build & deploy** > **Deploy Previews**, lalu matikan opsi **Collaborative deploy previews** agar tidak ada badge bawaan Netlify di layar HP.

---

## 📱 Panduan Pasang di Handphone (PWA)

Setelah aplikasi di-deploy:
- **Android (Google Chrome)**:
  Buka URL aplikasi Anda > Ketuk titik tiga (⋮) di pojok kanan atas > Pilih **Install app** atau **Tambahkan ke Layar Utama**.
- **iOS (Apple Safari)**:
  Buka URL aplikasi Anda > Ketuk tombol **Share** di bilah bawah > Pilih **Add to Home Screen** (*Tambahkan ke Layar Utama*).

---

## 🔒 Privasi & Keamanan Data
- **Tanpa Pelacakan**: Aplikasi ini tidak menggunakan tracker pihak ketiga, cookies iklan, atau analitik tersembunyi.
- **Penyimpanan Lokal Penuh**: Seluruh data tersimpan secara lokal di perangkat Anda. Jika Anda tidak mengaktifkan fitur Google Sheets, data tidak pernah keluar dari gawai Anda.

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi **MIT**. Silakan gunakan, pelajari, dan kembangkan untuk kebutuhan pengelolaan finansial Anda secara bebas.

<div align="center">
<i>"Atur Pitih Sanak, Raih Katangan Hidup."</i> 🌾
</div>
