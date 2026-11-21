import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFinanceStore } from './finance'
import { useSavingsStore } from './savings'
import { get, set } from 'idb-keyval'

const SYNC_SETTINGS_KEY = 'duitku_sync_settings_v3'

export const useSyncStore = defineStore('sync', () => {
  const isOnline = ref(navigator.onLine)
  const isSyncing = ref(false)
  const lastSyncTime = ref(null)
  const syncStatus = ref('idle') // 'idle' | 'syncing' | 'success' | 'error'
  const errorMessage = ref('')
  
  // Pure Google Sheets Cloud Sync (via Google Apps Script Web App)
  const gasWebAppUrl = ref('')
  const googleConnected = ref(false)

  // Listen to network status
  window.addEventListener('online', () => { isOnline.value = true })
  window.addEventListener('offline', () => { isOnline.value = false })

  async function loadSettings() {
    try {
      const saved = await get(SYNC_SETTINGS_KEY)
      if (saved) {
        gasWebAppUrl.value = saved.gasWebAppUrl || ''
        lastSyncTime.value = saved.lastSyncTime || null
        googleConnected.value = !!saved.googleConnected
      }
    } catch (e) {
      console.warn('Gagal memuat setting sync:', e)
    }
  }

  async function saveSettings() {
    try {
      await set(SYNC_SETTINGS_KEY, {
        gasWebAppUrl: gasWebAppUrl.value,
        lastSyncTime: lastSyncTime.value,
        googleConnected: googleConnected.value
      })
    } catch (e) {
      console.error('Gagal menyimpan setting sync:', e)
    }
  }

  /**
   * Sync data directly to Google Sheets Cloud
   */
  async function syncToSheets() {
    if (!isOnline.value) {
      syncStatus.value = 'error'
      errorMessage.value = 'Koneksi internet tidak tersedia. Data Anda tetap tersimpan aman di perangkat.'
      return false
    }

    if (!gasWebAppUrl.value.trim()) {
      syncStatus.value = 'error'
      errorMessage.value = 'Silakan masukkan URL Web App Google Sheets di menu Pengaturan.'
      return false
    }

    isSyncing.value = true
    syncStatus.value = 'syncing'
    errorMessage.value = ''

    const financeStore = useFinanceStore()
    const savingsStore = useSavingsStore()

    const payload = {
      action: 'push',
      transactions: financeStore.transactions,
      savings: savingsStore.goals,
      updatedAt: new Date().toISOString()
    }

    try {
      const response = await fetch(gasWebAppUrl.value.trim(), {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      })

      const result = await response.json().catch(() => ({}))
      if (result.status === 'success' || response.ok) {
        googleConnected.value = true
        lastSyncTime.value = new Date().toISOString()
        syncStatus.value = 'success'
        await saveSettings()
        return true
      } else {
        throw new Error(result.message || 'Gagal menyimpan ke Google Sheets.')
      }
    } catch (err) {
      console.warn('Gagal sync ke Google Sheets:', err)
      syncStatus.value = 'error'
      errorMessage.value = err.message || 'Gagal terhubung. Pastikan URL Web App Google Sheets Anda benar.'
      return false
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * Pull data from Google Sheets Cloud into local storage
   */
  async function syncFromSheets() {
    if (!isOnline.value) {
      errorMessage.value = 'Sedang offline. Menggunakan data tersimpan di perangkat.'
      return false
    }

    if (!gasWebAppUrl.value.trim()) {
      errorMessage.value = 'URL Web App Google Sheets belum diatur.'
      return false
    }

    isSyncing.value = true
    syncStatus.value = 'syncing'

    try {
      const url = `${gasWebAppUrl.value.trim()}?action=pull`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)

      const data = await res.json()
      const financeStore = useFinanceStore()
      const savingsStore = useSavingsStore()

      if (data.transactions && Array.isArray(data.transactions)) {
        await financeStore.importData(data.transactions)
      }
      if (data.savings && Array.isArray(data.savings)) {
        savingsStore.goals = data.savings
        await savingsStore.loadData()
      }

      lastSyncTime.value = new Date().toISOString()
      syncStatus.value = 'success'
      googleConnected.value = true
      await saveSettings()
      return true
    } catch (e) {
      syncStatus.value = 'error'
      errorMessage.value = e.message || 'Gagal mengambil data dari Google Sheets.'
      return false
    } finally {
      isSyncing.value = false
    }
  }

  loadSettings()

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncStatus,
    gasWebAppUrl,
    errorMessage,
    googleConnected,
    syncToSheets,
    syncFromSheets,
    saveSettings
  }
})
