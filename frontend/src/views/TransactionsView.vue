<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceStore } from '../stores/finance'
import { formatRupiah, formatDateIndo } from '../composables/useFormatCurrency'
import { useToast } from '../composables/useToast'

const router = useRouter()
const financeStore = useFinanceStore()
const { showToast } = useToast()

const activeTab = ref('all') // 'all' | 'income' | 'expense'
const searchQuery = ref('')

const filteredTransactions = computed(() => {
  return financeStore.transactions.filter((tx) => {
    // Type filter
    if (activeTab.value !== 'all' && tx.type !== activeTab.value) return false
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const desc = (tx.description || '').toLowerCase()
      const cat = financeStore.getCategoryById(tx.categoryId).name.toLowerCase()
      return desc.includes(q) || cat.includes(q)
    }
    return true
  }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
})

// Group by Date
const groupedTransactions = computed(() => {
  const groups = {}
  const todayStr = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  filteredTransactions.value.forEach((tx) => {
    const dStr = (tx.date || '').split('T')[0]
    let title = formatDateIndo(dStr)
    if (dStr === todayStr) title = 'Hari Ini'
    else if (dStr === yesterdayStr) title = 'Kemarin'

    if (!groups[title]) {
      groups[title] = {
        title,
        items: [],
        total: 0
      }
    }
    groups[title].items.push(tx)
    groups[title].total += tx.type === 'income' ? tx.amount : -tx.amount
  })

  return Object.values(groups)
})

async function handleDelete(id, desc) {
  if (confirm(`Yakin ingin menghapus transaksi "${desc}"?`)) {
    await financeStore.deleteTransaction(id)
    showToast('Transaksi berhasil dihapus', 'info')
  }
}
</script>

<template>
  <div class="transactions-page animate-fade-in">
    <!-- Header -->
    <header class="page-header">
      <h1 class="heading-lg">Riwayat Transaksi</h1>
      <button class="btn-primary add-btn" @click="router.push('/add-transaction')">
        ＋ Catat
      </button>
    </header>

    <!-- Search Input -->
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari transaksi atau kategori..."
        class="search-input"
      />
      <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">✕</button>
    </div>

    <!-- Filter Segmented Control -->
    <div class="filter-segments">
      <button
        class="segment-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        Semua ({{ financeStore.transactions.length }})
      </button>
      <button
        class="segment-btn"
        :class="{ active: activeTab === 'income' }"
        @click="activeTab = 'income'"
      >
        Pemasukan
      </button>
      <button
        class="segment-btn"
        :class="{ active: activeTab === 'expense' }"
        @click="activeTab = 'expense'"
      >
        Pengeluaran
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="groupedTransactions.length === 0" class="glow-card empty-box">
      <div class="empty-icon">📝</div>
      <h3>Tidak ada transaksi ditemukan</h3>
      <p class="body-text">Mulai catat transaksi pengeluaran atau pemasukan Anda.</p>
      <button class="btn-primary" style="margin-top: 16px;" @click="router.push('/add-transaction')">
        Tambah Transaksi
      </button>
    </div>

    <!-- Grouped Transactions List -->
    <div v-else class="groups-container">
      <div v-for="group in groupedTransactions" :key="group.title" class="date-group">
        <div class="group-header">
          <span class="caption-label">{{ group.title }}</span>
          <span
            class="group-net"
            :class="group.total >= 0 ? 'text-income' : 'text-expense'"
          >
            {{ group.total >= 0 ? '+' : '' }}{{ formatRupiah(group.total) }}
          </span>
        </div>

        <div class="group-items-list">
          <div
            v-for="tx in group.items"
            :key="tx.id"
            class="glow-card tx-item"
          >
            <div class="tx-left">
              <div class="tx-cat-badge">
                {{ financeStore.getCategoryById(tx.categoryId).emoji }}
              </div>
              <div class="tx-info">
                <span class="tx-title">{{ tx.description || financeStore.getCategoryById(tx.categoryId).name }}</span>
                <span class="tx-sub">{{ financeStore.getCategoryById(tx.categoryId).name }}</span>
              </div>
            </div>

            <div class="tx-right">
              <span
                class="tx-val"
                :class="tx.type === 'income' ? 'text-income' : 'text-expense'"
              >
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatRupiah(tx.amount) }}
              </span>
              <button
                class="delete-btn"
                title="Hapus Transaksi"
                @click="handleDelete(tx.id, tx.description || 'Transaksi')"
              >
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transactions-page {
  padding: 16px 16px 100px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-btn {
  padding: 8px 16px;
  min-height: 38px;
  font-size: 13px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 19px;
  padding: 10px 16px;
  border: 1px solid #b3b5b7;
  gap: 10px;
}

.search-icon {
  font-size: 14px;
}

.search-input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: #131517;
}

.clear-search {
  background: none;
  border: none;
  color: #737577;
  cursor: pointer;
  font-size: 14px;
}

.filter-segments {
  display: flex;
  background-color: #ffffff;
  border-radius: 19px;
  padding: 4px;
  border: 1px solid #b3b5b7;
}

.segment-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  color: #737577;
  cursor: pointer;
  transition: all 0.2s;
}

.segment-btn.active {
  background-color: #131517;
  color: #00FF00;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  margin-bottom: 8px;
}

.group-net {
  font-size: 12px;
  font-weight: 700;
}

.group-items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tx-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 24px;
}

.tx-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-cat-badge {
  width: 40px;
  height: 40px;
  background-color: #f4f5f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.tx-info {
  display: flex;
  flex-direction: column;
}

.tx-title {
  font-size: 14px;
  font-weight: 600;
  color: #131517;
}

.tx-sub {
  font-size: 11px;
  color: #737577;
}

.tx-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-val {
  font-size: 14px;
  font-weight: 700;
}

.delete-btn {
  background: none;
  border: none;
  color: #b3b5b7;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  transition: color 0.2s;
}

.delete-btn:hover {
  color: #e83b47;
}

.text-income {
  color: #0d8312;
}

.text-expense {
  color: #e83b47;
}

.empty-box {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}
</style>
