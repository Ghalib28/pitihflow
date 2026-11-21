<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceStore } from '../stores/finance'
import { useSavingsStore } from '../stores/savings'
import { useSyncStore } from '../stores/sync'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '../stores/theme'
import { formatRupiah, formatDateIndo } from '../composables/useFormatCurrency'
import { useToast } from '../composables/useToast'
import DepositModal from '../components/DepositModal.vue'

const router = useRouter()
const financeStore = useFinanceStore()
const savingsStore = useSavingsStore()
const syncStore = useSyncStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { showToast } = useToast()

const animatedBalance = ref(0)
const selectedGoalForDeposit = ref(null)
const showDepositModal = ref(false)

const greeting = computed(() => {
  const hour = new Date().getHours()
  let timeStr = 'Selamat Malam'
  if (hour >= 4 && hour < 11) timeStr = 'Selamat Pagi'
  else if (hour >= 11 && hour < 15) timeStr = 'Selamat Siang'
  else if (hour >= 15 && hour < 18) timeStr = 'Selamat Sore'

  return `${timeStr}, ${userStore.username}`
})

const currentDateIndo = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

function animateValue(start, end, duration) {
  let startTimestamp = null
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    animatedBalance.value = Math.floor(progress * (end - start) + start)
    if (progress < 1) {
      window.requestAnimationFrame(step)
    } else {
      animatedBalance.value = end
    }
  }
  window.requestAnimationFrame(step)
}

onMounted(() => {
  animateValue(0, financeStore.balance, 700)
})

function openDeposit(goal) {
  selectedGoalForDeposit.value = goal
  showDepositModal.value = true
}

async function handleDepositConfirm({ amount, note }) {
  if (selectedGoalForDeposit.value) {
    await savingsStore.addDeposit(selectedGoalForDeposit.value.id, amount, note)
    showToast(`Berhasil menambah setoran ${formatRupiah(amount)}!`, 'success')
    showDepositModal.value = false
  }
}

async function triggerQuickSync() {
  if (!syncStore.isOnline) {
    showToast('Data tersimpan aman di perangkat Anda.', 'info')
    return
  }
  showToast('Menghubungkan ke Google Sheets...', 'info')
  const ok = await syncStore.syncToSheets()
  if (ok) {
    showToast('Sinkronisasi Google Sheets berhasil!', 'success')
  } else {
    showToast(syncStore.errorMessage || 'Periksa URL Google Sheets di Pengaturan.', 'error')
  }
}

function handleToggleTheme() {
  themeStore.toggleTheme()
  const modeName = themeStore.mode === 'dark' ? 'Mode Gelap (Obsidian Dark)' : 'Mode Terang (Porcelain Light)'
  showToast(`${modeName} aktif!`, 'info')
}

// Chart Calculations
const maxMonthlyValue = computed(() => {
  const max = Math.max(
    ...financeStore.monthlyTrend.map((m) => Math.max(m.income, m.expense)),
    1000000
  )
  return max * 1.15
})

const chartPoints = computed(() => {
  const list = financeStore.monthlyTrend
  const count = list.length
  if (count === 0) return { incomePath: '', expensePath: '', incCoords: [], expCoords: [], width: 360, height: 140 }

  const width = 360
  const height = 140
  const paddingX = 24
  const paddingY = 20

  const stepX = (width - paddingX * 2) / (count - 1 || 1)

  const incCoords = []
  const expCoords = []

  list.forEach((m, i) => {
    const x = paddingX + i * stepX
    const yInc = height - paddingY - (m.income / maxMonthlyValue.value) * (height - paddingY * 2)
    const yExp = height - paddingY - (m.expense / maxMonthlyValue.value) * (height - paddingY * 2)
    incCoords.push({ x, y: yInc, val: m.income, label: m.label })
    expCoords.push({ x, y: yExp, val: m.expense, label: m.label })
  })

  function createCurvePath(pts) {
    if (pts.length === 0) return ''
    let path = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i]
      const p1 = pts[i + 1]
      const mx = (p0.x + p1.x) / 2
      path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
    }
    return path
  }

  const incomeLine = createCurvePath(incCoords)
  const expenseLine = createCurvePath(expCoords)

  const incomeArea = `${incomeLine} L ${incCoords[incCoords.length - 1].x} ${height - paddingY} L ${incCoords[0].x} ${height - paddingY} Z`
  const expenseArea = `${expenseLine} L ${expCoords[expCoords.length - 1].x} ${height - paddingY} L ${expCoords[0].x} ${height - paddingY} Z`

  return {
    incomeLine,
    incomeArea,
    expenseLine,
    expenseArea,
    incCoords,
    expCoords,
    width,
    height
  }
})
</script>

<template>
  <div class="dashboard-page animate-fade-in">
    <!-- Top Bar with 3D Avatar & Luxury Editorial Sapaan -->
    <header class="dashboard-header">
      <div class="header-profile-group" @click="router.push('/settings')">
        <div class="user-avatar-frame" :class="`border-${userStore.avatarBorder}`">
          <div class="avatar-svg-container" v-html="userStore.currentAvatarSvg"></div>
        </div>
        <div class="header-text-group">
          <div class="greeting-text editorial-serif">{{ greeting }} 👋</div>
          <div class="date-text">{{ currentDateIndo }}</div>
        </div>
      </div>

      <!-- Header Action Controls: Dark/Light Mode Toggle & Google Sheets Pill -->
      <div class="header-right-actions">
        <!-- User-friendly Dark/Light Mode Quick Switch -->
        <button
          class="theme-toggle-btn"
          :title="themeStore.mode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'"
          @click="handleToggleTheme"
        >
          <span v-if="themeStore.mode === 'dark'">☀️</span>
          <span v-else>🌙</span>
        </button>

        <!-- Google Sheets Cloud Status -->
        <button class="sync-pill-btn" @click="triggerQuickSync">
          <span
            class="status-dot"
            :class="{
              'dot-synced': syncStore.googleConnected,
              'dot-standby': !syncStore.googleConnected
            }"
          ></span>
          <span class="sync-label">
            {{ syncStore.googleConnected ? 'Sheets Terhubung' : 'Google Sheets' }}
          </span>
        </button>
      </div>
    </header>

    <!-- Hero Balance Card (Editorial Luxury Theme) -->
    <section class="glow-card hero-card animate-slide-up">
      <div class="hero-top">
        <span class="caption-label">NERACA PITIH KESELURUHAN</span>
        <span class="badge-new">PITIHFLOW</span>
      </div>

      <div class="balance-amount display-text">
        {{ formatRupiah(animatedBalance) }}
      </div>

      <div class="hero-stats-row">
        <div class="stat-pill stat-income">
          <div class="pill-icon-circle income-circle">↗</div>
          <div class="pill-info">
            <span class="pill-label">Pemasukan</span>
            <span class="pill-value">{{ formatRupiah(financeStore.totalIncome) }}</span>
          </div>
        </div>

        <div class="stat-pill stat-expense">
          <div class="pill-icon-circle expense-circle">↘</div>
          <div class="pill-info">
            <span class="pill-label">Pengeluaran</span>
            <span class="pill-value">{{ formatRupiah(financeStore.totalExpense) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Action Circles -->
    <section class="quick-actions-grid">
      <button class="action-item" @click="router.push('/add-transaction?type=income')">
        <div class="action-icon-circle bg-green">＋</div>
        <span class="action-text">Pemasukan</span>
      </button>

      <button class="action-item" @click="router.push('/add-transaction?type=expense')">
        <div class="action-icon-circle bg-red">－</div>
        <span class="action-text">Pengeluaran</span>
      </button>

      <button class="action-item" @click="router.push('/add-saving')">
        <div class="action-icon-circle bg-orange">🎯</div>
        <span class="action-text">Target Baru</span>
      </button>

      <button class="action-item" @click="router.push('/settings')">
        <div class="action-icon-circle bg-dark">📊</div>
        <span class="action-text">Google Sheet</span>
      </button>
    </section>

    <!-- Monthly Trend Chart Card -->
    <section class="glow-card chart-card">
      <div class="card-section-header">
        <div>
          <span class="caption-label">STATISTIK ALIRAN</span>
          <h3 class="heading-sm">Tren 6 Bulan Terakhir</h3>
        </div>
        <div class="chart-legend-row">
          <span class="legend-item"><span class="dot-inc"></span> Masuk</span>
          <span class="legend-item"><span class="dot-exp"></span> Keluar</span>
        </div>
      </div>

      <div class="svg-chart-container">
        <svg
          :viewBox="`0 0 ${chartPoints.width} ${chartPoints.height}`"
          class="trend-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00FF00" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#00FF00" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e83b47" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#e83b47" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <line x1="20" y1="30" x2="340" y2="30" stroke="rgba(128,128,128,0.2)" stroke-dasharray="3 3" />
          <line x1="20" y1="70" x2="340" y2="70" stroke="rgba(128,128,128,0.2)" stroke-dasharray="3 3" />
          <line x1="20" y1="110" x2="340" y2="110" stroke="rgba(128,128,128,0.2)" stroke-dasharray="3 3" />

          <path :d="chartPoints.incomeArea" fill="url(#incGrad)" />
          <path :d="chartPoints.expenseArea" fill="url(#expGrad)" />

          <path :d="chartPoints.incomeLine" fill="none" stroke="#00FF00" stroke-width="3" stroke-linecap="round" />
          <path :d="chartPoints.expenseLine" fill="none" stroke="#e83b47" stroke-width="2.5" stroke-linecap="round" />

          <circle
            v-for="(p, i) in chartPoints.incCoords"
            :key="'inc-' + i"
            :cx="p.x"
            :cy="p.y"
            r="4"
            fill="#131517"
            stroke="#00FF00"
            stroke-width="2"
          />
          <circle
            v-for="(p, i) in chartPoints.expCoords"
            :key="'exp-' + i"
            :cx="p.x"
            :cy="p.y"
            r="3"
            fill="#ffffff"
            stroke="#e83b47"
            stroke-width="2"
          />
        </svg>

        <div class="chart-month-labels">
          <span v-for="m in financeStore.monthlyTrend" :key="m.label" class="month-label-text">
            {{ m.label }}
          </span>
        </div>
      </div>
    </section>

    <!-- Expense by Category Breakdown -->
    <section class="glow-card category-breakdown-card">
      <div class="card-section-header">
        <div>
          <span class="caption-label">PENGELUARAN TERBESAR</span>
          <h3 class="heading-sm">Distribusi Kategori</h3>
        </div>
      </div>

      <div v-if="financeStore.expenseByCategory.length === 0" class="empty-state-box">
        <p class="body-text" style="font-size: 13.5px; text-align: center; padding: 12px 0;">
          Belum ada catatan pengeluaran.
        </p>
      </div>

      <div v-else class="category-bars-list">
        <div
          v-for="cat in financeStore.expenseByCategory.slice(0, 4)"
          :key="cat.id"
          class="category-bar-item"
        >
          <div class="cat-bar-header">
            <span class="cat-bar-name">
              <span class="cat-emoji">{{ cat.emoji }}</span> {{ cat.name }}
            </span>
            <span class="cat-bar-amount">{{ formatRupiah(cat.total) }} ({{ cat.percentage }}%)</span>
          </div>
          <div class="cat-bar-track">
            <div
              class="cat-bar-fill"
              :style="{ width: `${cat.percentage}%`, backgroundColor: cat.color || '#ec660d' }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Savings Goals Section -->
    <section class="savings-preview-section">
      <div class="section-title-row">
        <div>
          <span class="caption-label">RENCANA MASA DEPAN</span>
          <h3 class="heading-sm">Target Tabungan</h3>
        </div>
        <button class="view-all-link" @click="router.push('/savings')">Lihat Semua →</button>
      </div>

      <div v-if="savingsStore.activeGoals.length === 0" class="glow-card empty-state-card">
        <div class="empty-icon">🎯</div>
        <p class="body-text">Belum ada target tabungan dibuat.</p>
        <button class="btn-primary" style="margin-top: 12px;" @click="router.push('/add-saving')">
          Buat Target Sekarang
        </button>
      </div>

      <div v-else class="savings-cards-scroll">
        <div
          v-for="goal in savingsStore.activeGoals"
          :key="goal.id"
          class="glow-card saving-mini-card"
        >
          <div class="goal-top-row">
            <div class="goal-icon-badge">{{ goal.icon }}</div>
            <span class="goal-percent-tag">
              {{ Math.min(Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100), 100) }}%
            </span>
          </div>

          <div class="goal-card-name">{{ goal.name }}</div>

          <div class="goal-amount-display">
            <span class="current-amt">{{ formatRupiah(goal.currentAmount) }}</span>
            <span class="target-amt">/ {{ formatRupiah(goal.targetAmount) }}</span>
          </div>

          <div class="goal-progress-track">
            <div
              class="goal-progress-fill"
              :style="{
                width: `${Math.min(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100, 100)}%`,
                backgroundColor: goal.color || '#00FF00'
              }"
            ></div>
          </div>

          <button class="btn-ghost deposit-action-btn" @click="openDeposit(goal)">
            + Setor Dana
          </button>
        </div>
      </div>
    </section>

    <!-- Recent Transactions List -->
    <section class="recent-tx-section">
      <div class="section-title-row">
        <div>
          <span class="caption-label">AKTIVITAS TERAKHIR</span>
          <h3 class="heading-sm">Transaksi Terbaru</h3>
        </div>
        <button class="view-all-link" @click="router.push('/transactions')">Semua Transaksi →</button>
      </div>

      <div v-if="financeStore.recentTransactions.length === 0" class="glow-card empty-state-card">
        <p class="body-text">Belum ada transaksi tercatat.</p>
        <button class="btn-primary" style="margin-top: 12px;" @click="router.push('/add-transaction')">
          Catat Transaksi Pertama
        </button>
      </div>

      <div v-else class="transactions-list-container">
        <div
          v-for="tx in financeStore.recentTransactions"
          :key="tx.id"
          class="tx-card-item glow-card"
        >
          <div class="tx-left">
            <div class="tx-emoji-bubble">
              {{ financeStore.getCategoryById(tx.categoryId).emoji }}
            </div>
            <div class="tx-details">
              <span class="tx-desc">{{ tx.description || financeStore.getCategoryById(tx.categoryId).name }}</span>
              <span class="tx-date">{{ formatDateIndo(tx.date) }}</span>
            </div>
          </div>

          <div
            class="tx-amount"
            :class="tx.type === 'income' ? 'tx-amount-income' : 'tx-amount-expense'"
          >
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatRupiah(tx.amount) }}
          </div>
        </div>
      </div>
    </section>

    <!-- Deposit Modal -->
    <DepositModal
      v-if="selectedGoalForDeposit"
      :show="showDepositModal"
      :goal="selectedGoalForDeposit"
      @close="showDepositModal = false"
      @confirm="handleDepositConfirm"
    />
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 16px 16px 100px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 2px;
}

.header-profile-group {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.avatar-svg-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text-group {
  display: flex;
  flex-direction: column;
}

.editorial-serif {
  font-family: var(--font-serif);
  font-size: 21px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  line-height: 1.1;
}

.date-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bg-card);
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s;
}

.theme-toggle-btn:active {
  transform: scale(0.9);
}

.sync-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 100px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-synced {
  background-color: #00FF00;
  box-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
}

.dot-standby {
  background-color: #ec660d;
}

/* Hero Balance Card */
.hero-card {
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-card);
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.balance-amount {
  margin-bottom: 20px;
  word-break: break-all;
}

.hero-stats-row {
  display: flex;
  gap: 12px;
}

.stat-pill {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 19px;
}

.stat-income {
  background-color: rgba(0, 255, 0, 0.12);
}

.stat-expense {
  background-color: rgba(232, 59, 71, 0.12);
}

.pill-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.income-circle {
  background-color: #00FF00;
  color: #131517;
}

.expense-circle {
  background-color: #e83b47;
  color: #ffffff;
}

.pill-info {
  display: flex;
  flex-direction: column;
}

.pill-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.pill-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 4px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
}

.action-icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-item:active .action-icon-circle {
  transform: scale(0.9);
}

.bg-green {
  background-color: #00FF00;
  color: #131517;
}

.bg-red {
  background-color: rgba(232, 59, 71, 0.18);
  color: #e83b47;
}

.bg-orange {
  background-color: rgba(236, 102, 13, 0.18);
  color: #ec660d;
}

.bg-dark {
  background-color: var(--bg-secondary);
  color: #00FF00;
  border: 1px solid var(--border-subtle);
}

.action-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Chart Card */
.card-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.chart-legend-row {
  display: flex;
  gap: 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot-inc {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00FF00;
}

.dot-exp {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e83b47;
}

.svg-chart-container {
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: 140px;
  overflow: visible;
}

.chart-month-labels {
  display: flex;
  justify-content: space-between;
  padding: 6px 12px 0 12px;
}

.month-label-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Category Breakdown */
.category-bars-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cat-bar-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.cat-bar-name {
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-bar-amount {
  color: var(--text-secondary);
}

.cat-bar-track {
  height: 6px;
  background-color: var(--bg-secondary);
  border-radius: 100px;
  overflow: hidden;
}

.cat-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s ease;
}

/* Savings Section */
.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 12px;
  padding: 0 4px;
}

.view-all-link {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.savings-cards-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.saving-mini-card {
  min-width: 210px;
  max-width: 210px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  flex-shrink: 0;
}

.goal-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.goal-icon-badge {
  font-size: 24px;
}

.goal-percent-tag {
  background: rgba(0, 255, 0, 0.2);
  color: #00FF00;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
}

.goal-card-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-amount-display {
  font-size: 12px;
  margin-bottom: 10px;
}

.current-amt {
  font-weight: 700;
  color: var(--text-primary);
}

.target-amt {
  color: var(--text-secondary);
}

.goal-progress-track {
  height: 6px;
  background-color: var(--bg-secondary);
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 14px;
}

.goal-progress-fill {
  height: 100%;
  border-radius: 100px;
}

.deposit-action-btn {
  font-size: 12px;
  padding: 6px 12px;
  min-height: 32px;
  border-radius: 14px;
}

/* Recent Transactions */
.transactions-list-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tx-card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 24px;
}

.tx-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tx-emoji-bubble {
  width: 44px;
  height: 44px;
  background-color: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.tx-details {
  display: flex;
  flex-direction: column;
}

.tx-desc {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.tx-date {
  font-size: 11px;
  color: var(--text-secondary);
}

.tx-amount {
  font-size: 14px;
  font-weight: 700;
}

.tx-amount-income {
  color: #00FF00;
}

.tx-amount-expense {
  color: #e83b47;
}

.empty-state-card {
  text-align: center;
  padding: 32px 20px;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
</style>
