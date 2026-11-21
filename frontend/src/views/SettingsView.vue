<script setup>
import { ref } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useSavingsStore } from '../stores/savings'
import { useSyncStore } from '../stores/sync'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '../stores/theme'
import { formatRupiah, formatDateIndo } from '../composables/useFormatCurrency'
import { useToast } from '../composables/useToast'
import { sanitizeCsvCell, validateBackupPayload, sanitizeString } from '../utils/security'

const financeStore = useFinanceStore()
const savingsStore = useSavingsStore()
const syncStore = useSyncStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { showToast } = useToast()

const tempUsername = ref(userStore.username)
const fileInputRef = ref(null)
const showCodeSnippet = ref(false)

function saveProfileName() {
  const clean = sanitizeString(tempUsername.value, 40)
  if (!clean) {
    showToast('Nama pengguna tidak boleh kosong.', 'error')
    return
  }
  userStore.updateProfile({ newName: clean })
  showToast(`Nama profil berhasil diubah menjadi "${clean}"!`, 'success')
}

function selectBorder(borderId) {
  userStore.updateProfile({ newBorder: borderId })
  showToast(`Gaya border avatar diperbarui!`, 'success')
}

function selectAvatar3D(avatarId) {
  userStore.updateProfile({ newAvatarId: avatarId })
  showToast(`Avatar 3D berhasil dipilih!`, 'success')
}

function changeTheme(mode) {
  themeStore.setTheme(mode)
  showToast(mode === 'dark' ? 'Mode Gelap (Obsidian Dark) aktif!' : 'Mode Terang (Porcelain Light) aktif!', 'info')
}

// Google Apps Script template code
const gasScriptCode = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet Transaksi
  var txSheet = ss.getSheetByName("Transaksi") || ss.insertSheet("Transaksi");
  txSheet.clear();
  txSheet.appendRow(["ID", "Tipe", "Nominal (Rp)", "Kategori", "Keterangan", "Tanggal", "Dibuat"]);
  if (data.transactions && data.transactions.length > 0) {
    var rows = data.transactions.map(function(t) {
      return [t.id, t.type, t.amount, t.categoryId, t.description, t.date, t.createdAt];
    });
    txSheet.getRange(2, 1, rows.length, 7).setValues(rows);
  }
  
  // Sheet Tabungan
  var savSheet = ss.getSheetByName("Target_Tabungan") || ss.insertSheet("Target_Tabungan");
  savSheet.clear();
  savSheet.appendRow(["ID", "Ikon", "Nama", "Target (Rp)", "Terkumpul (Rp)", "Deadline", "Status"]);
  if (data.savings && data.savings.length > 0) {
    var sRows = data.savings.map(function(s) {
      return [s.id, s.icon, s.name, s.targetAmount, s.currentAmount, s.deadline, s.completed ? "Lunas" : "Berjalan"];
    });
    savSheet.getRange(2, 1, sRows.length, 7).setValues(sRows);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data berhasil disimpan!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var txSheet = ss.getSheetByName("Transaksi");
  var txs = [];
  if (txSheet && txSheet.getLastRow() > 1) {
    var vals = txSheet.getRange(2, 1, txSheet.getLastRow() - 1, 6).getValues();
    txs = vals.map(function(r) {
      return { id: r[0], type: r[1], amount: Number(r[2]), categoryId: r[3], description: r[4], date: r[5] };
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "success", transactions: txs }))
    .setMimeType(ContentService.MimeType.JSON);
}`

function copyGasCode() {
  navigator.clipboard.writeText(gasScriptCode)
  showToast('Kode Google Apps Script berhasil disalin!', 'success')
}

async function handleSyncNow() {
  if (!syncStore.isOnline) {
    showToast('Koneksi internet tidak terdeteksi. Data Anda tetap tersimpan aman.', 'error')
    return
  }

  showToast('Menyimpan ke Google Sheets...', 'info')
  const ok = await syncStore.syncToSheets()
  if (ok) {
    showToast('Data berhasil disimpan ke Google Sheets!', 'success')
  } else {
    showToast(syncStore.errorMessage || 'Periksa URL Web App Google Sheets Anda.', 'error')
  }
}

async function handlePullFromSheets() {
  if (!syncStore.isOnline) {
    showToast('Koneksi internet tidak terdeteksi.', 'error')
    return
  }

  showToast('Mengambil data dari Google Sheets...', 'info')
  const ok = await syncStore.syncFromSheets()
  if (ok) {
    showToast('Data berhasil dimuat dari Google Sheets!', 'success')
  } else {
    showToast(syncStore.errorMessage || 'Gagal mengambil data dari Google Sheets.', 'error')
  }
}

function exportToCSV() {
  const headers = ['ID', 'Tipe', 'Nominal', 'Kategori', 'Keterangan', 'Tanggal']
  const rows = financeStore.transactions.map((t) => [
    sanitizeCsvCell(t.id),
    sanitizeCsvCell(t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
    sanitizeCsvCell(t.amount),
    sanitizeCsvCell(financeStore.getCategoryById(t.categoryId).name),
    sanitizeCsvCell(t.description || ''),
    sanitizeCsvCell(t.date || '')
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `pitihflow_transaksi_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showToast('Berkas CSV berhasil diunduh!', 'success')
}

function exportToJSON() {
  const backup = {
    app: 'Pitihflow',
    version: '1.3.0',
    exportedAt: new Date().toISOString(),
    transactions: financeStore.transactions,
    savings: savingsStore.goals
  }
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2))
  const link = document.createElement('a')
  link.setAttribute('href', dataStr)
  link.setAttribute('download', `pitihflow_backup_${new Date().toISOString().split('T')[0]}.json`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showToast('Cadangan JSON berhasil diunduh!', 'success')
}

function triggerFileInput() {
  if (fileInputRef.value) fileInputRef.value.click()
}

function handleFileImport(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (evt) => {
    try {
      const data = JSON.parse(evt.target.result)
      if (!validateBackupPayload(data) && data.app !== 'Pitihflow') {
        showToast('Validasi gagal: Struktur data backup tidak sah atau rusak.', 'error')
        return
      }

      if (data.transactions && Array.isArray(data.transactions)) {
        await financeStore.importData(data.transactions)
      }
      if (data.savings && Array.isArray(data.savings)) {
        savingsStore.goals = data.savings
        await savingsStore.persist()
      }
      showToast('Data cadangan terverifikasi dan berhasil diimpor!', 'success')
    } catch (err) {
      showToast('Format file backup tidak valid.', 'error')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

async function handleResetAll() {
  if (confirm('PERINGATAN: Semua data transaksi dan target tabungan akan dibersihkan. Lanjutkan?')) {
    await financeStore.clearAllData()
    await savingsStore.clearAllGoals()
    showToast('Semua data berhasil dibersihkan.', 'info')
  }
}
</script>

<template>
  <div class="settings-page animate-fade-in">
    <header class="page-header">
      <h1 class="heading-lg">Pengaturan</h1>
    </header>

    <!-- Theme Mode Switcher Card -->
    <section class="glow-card settings-card">
      <div class="card-title-row">
        <div class="sync-icon-circle" style="background-color: var(--bg-secondary); color: var(--text-primary);">🎨</div>
        <div>
          <h2 class="heading-sm">Tampilan & Tema</h2>
          <span class="caption-label">PILIHAN MODE TERANG & GELAP</span>
        </div>
      </div>

      <div class="theme-mode-grid" style="margin-top: 14px;">
        <button
          type="button"
          class="theme-choice-card"
          :class="{ active: themeStore.mode === 'light' }"
          @click="changeTheme('light')"
        >
          <div class="theme-preview-box light-preview">
            <span class="theme-icon-indicator">☀️</span>
          </div>
          <span class="theme-name-label">Mode Terang</span>
          <span class="theme-desc-label">Porcelain White</span>
        </button>

        <button
          type="button"
          class="theme-choice-card"
          :class="{ active: themeStore.mode === 'dark' }"
          @click="changeTheme('dark')"
        >
          <div class="theme-preview-box dark-preview">
            <span class="theme-icon-indicator">🌙</span>
          </div>
          <span class="theme-name-label">Mode Gelap</span>
          <span class="theme-desc-label">Obsidian OLED</span>
        </button>
      </div>
    </section>

    <!-- Profile & 3D Avatar Selection Section -->
    <section class="glow-card settings-card">
      <div class="card-title-row">
        <div class="user-avatar-frame" :class="`border-${userStore.avatarBorder}`">
          <div class="avatar-svg-container" v-html="userStore.currentAvatarSvg"></div>
        </div>
        <div>
          <h2 class="heading-sm">Profil Pemilik</h2>
          <span class="caption-label">PERSONALISASI NAMA & AVATAR 3D</span>
        </div>
      </div>

      <!-- Username Input -->
      <div class="input-group" style="margin-top: 18px;">
        <label class="caption-label">NAMA PANGGILAN DI HOME</label>
        <div class="username-edit-row">
          <input
            v-model="tempUsername"
            type="text"
            maxlength="30"
            placeholder="Masukkan nama Anda"
            class="text-field"
            @keyup.enter="saveProfileName"
          />
          <button class="btn-primary save-name-btn" @click="saveProfileName">
            Simpan
          </button>
        </div>
      </div>

      <!-- 3D Open Source Avatar Gallery -->
      <div class="input-group" style="margin-top: 18px;">
        <label class="caption-label">PILIH AVATAR 3D BERKARAKTER</label>
        <div class="avatars-3d-grid">
          <button
            v-for="av in userStore.avatarsList"
            :key="av.id"
            type="button"
            class="avatar-3d-card"
            :class="{ active: userStore.selectedAvatarId === av.id }"
            @click="selectAvatar3D(av.id)"
          >
            <div class="avatar-mini-render" v-html="av.svg"></div>
            <span class="avatar-name-label">{{ av.name }}</span>
          </button>
        </div>
      </div>

      <!-- Avatar Border Style Selector -->
      <div class="input-group" style="margin-top: 18px;">
        <label class="caption-label">GAYA BORDER BERCELOP</label>
        <div class="border-choices-grid">
          <button
            v-for="b in userStore.borderStyles"
            :key="b.id"
            type="button"
            class="border-choice-pill"
            :class="{ selected: userStore.avatarBorder === b.id }"
            @click="selectBorder(b.id)"
          >
            <span class="border-sample-dot" :style="{ backgroundColor: b.color }"></span>
            <span class="border-choice-label">{{ b.name }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Google Sheets Pure Cloud Database (No Server Required) -->
    <section class="glow-card settings-card">
      <div class="card-title-row">
        <div class="sync-icon-circle">📊</div>
        <div>
          <h2 class="heading-sm">Google Sheets Cloud Database</h2>
          <span class="caption-label">PENYIMPANAN CLOUD PRIBADI & MANDIRI</span>
        </div>
      </div>

      <p class="body-text" style="margin: 12px 0;">
        Hubungkan langsung ke Google Sheet pribadi Anda. Data otomatis tersimpan 24/7 tanpa perlu menyalakan komputer atau server lokal!
      </p>

      <div class="sync-meta-box">
        <div class="meta-item">
          <span class="meta-label">Status Jaringan:</span>
          <span class="meta-val" :class="syncStore.isOnline ? 'text-green' : 'text-red'">
            {{ syncStore.isOnline ? 'Online 🌐' : 'Offline 📴' }}
          </span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Terakhir Sinkron:</span>
          <span class="meta-val">
            {{ syncStore.lastSyncTime ? formatDateIndo(syncStore.lastSyncTime) : 'Belum pernah' }}
          </span>
        </div>
      </div>

      <div class="input-group">
        <label class="caption-label">URL WEB APP GOOGLE SHEETS</label>
        <input
          v-model="syncStore.gasWebAppUrl"
          type="text"
          placeholder="https://script.google.com/macros/s/.../exec"
          class="text-field"
          @change="syncStore.saveSettings"
        />
        <span class="field-hint">
          URL Web App dari Google Sheets Anda (Extensions > Apps Script).
        </span>
      </div>

      <!-- Quick 3-Step Tutorial Box -->
      <div class="gas-tutorial-box">
        <button class="toggle-script-btn" @click="showCodeSnippet = !showCodeSnippet">
          {{ showCodeSnippet ? '▲ Sembunyikan Panduan Kode' : '▼ Panduan Pasang Script di Google Sheet (Gratis & Cepat)' }}
        </button>

        <div v-if="showCodeSnippet" class="script-instructions animate-fade-in">
          <ol class="steps-list body-text">
            <li>Buka dokumen <b>Google Sheets</b> baru di akun Google Anda.</li>
            <li>Klik menu <b>Ekstensi (Extensions)</b> > <b>Apps Script</b>.</li>
            <li>Hapus kode bawaan, lalu salin dan tempel kode berikut:</li>
          </ol>
          <div class="code-copy-row">
            <button class="btn-primary copy-code-btn" @click="copyGasCode">
              📋 Salin Kode Script Google Sheets
            </button>
          </div>
          <ol class="steps-list body-text" start="4" style="margin-top: 8px;">
            <li>Klik tombol <b>Terapkan (Deploy)</b> > <b>Deployment baru (New deployment)</b>.</li>
            <li>Pilih tipe <b>Aplikasi Web (Web App)</b>, setel <i>Akses</i> ke <b>"Siapa saja" (Anyone)</b>.</li>
            <li>Salin <b>URL Aplikasi Web</b> yang diberikan dan tempelkan ke kolom input di atas! Selesai 🚀</li>
          </ol>
        </div>
      </div>

      <div class="sync-actions-row">
        <button
          class="btn-primary"
          style="flex: 1;"
          :disabled="syncStore.isSyncing"
          @click="handleSyncNow"
        >
          <span v-if="syncStore.isSyncing">Menyimpan...</span>
          <span v-else>Simpan ke Google Sheets</span>
        </button>

        <button
          class="btn-ghost"
          :disabled="syncStore.isSyncing"
          @click="handlePullFromSheets"
        >
          Tarik Data
        </button>
      </div>
    </section>

    <!-- Secure Storage & Backup Section -->
    <section class="glow-card settings-card">
      <div class="card-title-row">
        <div class="sync-icon-circle" style="background-color: rgba(236, 102, 13, 0.15); color: #ec660d;">🛡️</div>
        <div>
          <h2 class="heading-sm">Penyimpanan & Cadangan</h2>
          <span class="caption-label">INTEGRITAS & PERLINDUNGAN DATA</span>
        </div>
      </div>

      <p class="body-text" style="margin: 12px 0;">
        Data tersimpan dengan aman di perangkat Anda. Dilengkapi proteksi sanitasi injeksi formula CSV dan verifikasi integritas berkas.
      </p>

      <div class="backup-actions-grid">
        <button class="btn-ghost" @click="exportToCSV">
          📄 Unduh CSV Aman (Excel)
        </button>
        <button class="btn-ghost" @click="exportToJSON">
          📦 Cadangkan Berkas JSON
        </button>
        <button class="btn-ghost" @click="triggerFileInput">
          📥 Pulihkan / Impor JSON
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          style="display: none;"
          @change="handleFileImport"
        />
      </div>
    </section>

    <!-- Danger Zone -->
    <section class="glow-card settings-card">
      <h2 class="heading-sm" style="color: #e83b47;">Zona Reset</h2>
      <p class="body-text" style="margin: 8px 0 16px 0;">
        Membersihkan seluruh riwayat transaksi dan target tabungan dari perangkat ini.
      </p>
      <button class="btn-danger" @click="handleResetAll">
        Bersihkan Semua Data Aplikasi
      </button>
    </section>

    <!-- Brand Footer: Pitihflow -->
    <section class="app-info-footer">
      <div class="app-brand-row">
        <div class="app-logo-box">P</div>
        <div>
          <h4 class="heading-sm">Pitihflow Finance</h4>
          <span class="caption-label">VERSI 1.3.0 • MINANG & GLOBAL CASHFLOW</span>
        </div>
      </div>
      <p class="body-text" style="text-align: center; margin-top: 12px; font-size: 13px;">
        Terinspirasi dari filosofi Minang (Pitih = Uang) & Aliran Kas Global (Flow). Cepat, elegan, dan tanpa biaya bulanan.
      </p>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 16px 16px 100px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  padding: 4px 0;
}

.settings-card {
  padding: 24px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Theme Chooser Grid */
.theme-mode-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.theme-choice-card {
  background-color: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.theme-choice-card:active {
  transform: scale(0.96);
}

.theme-choice-card.active {
  background-color: var(--bg-card);
  border-color: #00FF00;
  box-shadow: 0 4px 16px rgba(0, 255, 0, 0.25);
}

.theme-preview-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 2px;
}

.light-preview {
  background-color: #ffffff;
  border: 1px solid #b3b5b7;
  color: #131517;
}

.dark-preview {
  background-color: #131517;
  border: 1px solid #333537;
  color: #00FF00;
}

.theme-name-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.theme-desc-label {
  font-size: 10.5px;
  color: var(--text-secondary);
}

.avatar-svg-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.username-edit-row {
  display: flex;
  gap: 8px;
}

.save-name-btn {
  padding: 8px 16px;
  font-size: 13px;
  min-height: 42px;
  flex-shrink: 0;
}

/* 3D Avatars Grid */
.avatars-3d-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.avatar-3d-card {
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.avatar-3d-card:active {
  transform: scale(0.94);
}

.avatar-3d-card.active {
  background: var(--bg-card);
  border-color: #00FF00;
  box-shadow: 0 4px 16px rgba(0, 255, 0, 0.25);
}

.avatar-mini-render {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-name-label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.2;
}

/* Border Styles */
.border-choices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.border-choice-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-secondary);
  border: 1.5px solid transparent;
  border-radius: 14px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.border-choice-pill.selected {
  background-color: var(--bg-card);
  border-color: var(--text-primary);
}

.border-sample-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.border-choice-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.sync-icon-circle {
  width: 44px;
  height: 44px;
  background-color: rgba(0, 255, 0, 0.15);
  color: #00FF00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.sync-meta-box {
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.meta-label {
  color: var(--text-secondary);
}

.meta-val {
  font-weight: 600;
}

.text-green {
  color: #00FF00;
}

.text-red {
  color: #e83b47;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-hint {
  font-size: 11px;
  color: var(--text-secondary);
}

.gas-tutorial-box {
  margin-top: 12px;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 14px;
}

.toggle-script-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.steps-list {
  padding-left: 20px;
  font-size: 12px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.code-copy-row {
  margin: 10px 0 6px 0;
}

.copy-code-btn {
  padding: 8px 16px;
  font-size: 12px;
  min-height: 36px;
}

.sync-actions-row {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.backup-actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 8px;
}

.btn-danger {
  background-color: rgba(232, 59, 71, 0.12);
  color: #e83b47;
  border: 1.5px solid #e83b47;
  border-radius: 19px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
}

.app-info-footer {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--color-plasma-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 800;
}
</style>
