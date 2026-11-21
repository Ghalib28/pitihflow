<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSavingsStore } from '../stores/savings'
import { formatRupiah, formatDateIndo } from '../composables/useFormatCurrency'
import { useToast } from '../composables/useToast'
import DepositModal from '../components/DepositModal.vue'

const router = useRouter()
const savingsStore = useSavingsStore()
const { showToast } = useToast()

const selectedGoal = ref(null)
const showModal = ref(false)

function openDeposit(goal) {
  selectedGoal.value = goal
  showModal.value = true
}

async function handleDeposit({ amount, note }) {
  if (selectedGoal.value) {
    await savingsStore.addDeposit(selectedGoal.value.id, amount, note)
    showToast(`Setoran ${formatRupiah(amount)} berhasil ditambahkan!`, 'success')
    showModal.value = false
  }
}

async function handleDelete(id, name) {
  if (confirm(`Hapus target tabungan "${name}"?`)) {
    await savingsStore.deleteGoal(id)
    showToast('Target tabungan dihapus', 'info')
  }
}
</script>

<template>
  <div class="savings-page animate-fade-in">
    <!-- Header -->
    <header class="page-header">
      <h1 class="heading-lg">Target Tabungan</h1>
      <button class="btn-primary add-btn" @click="router.push('/add-saving')">
        ＋ Target Baru
      </button>
    </header>

    <!-- Overall Summary Ring Card -->
    <div class="glow-card summary-card">
      <div class="summary-left">
        <span class="caption-label">TOTAL TERKUMPUL</span>
        <div class="total-saved-amt">{{ formatRupiah(savingsStore.totalSaved) }}</div>
        <div class="target-subtext">dari target total {{ formatRupiah(savingsStore.totalTarget) }}</div>
      </div>

      <!-- Circular SVG Progress Ring -->
      <div class="progress-ring-box">
        <svg class="progress-svg" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            class="circle-bg"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            class="circle-fill"
            :stroke-dasharray="251.2"
            :stroke-dashoffset="251.2 - (251.2 * savingsStore.overallProgress) / 100"
          />
        </svg>
        <div class="ring-center-text">
          <span class="percent-val">{{ savingsStore.overallProgress }}%</span>
          <span class="percent-sub">Tercapai</span>
        </div>
      </div>
    </div>

    <!-- Active Goals List -->
    <div class="section-title-row">
      <span class="caption-label">TARGET AKTIF ({{ savingsStore.activeGoals.length }})</span>
    </div>

    <div v-if="savingsStore.activeGoals.length === 0" class="glow-card empty-card">
      <div class="empty-icon">🎯</div>
      <h3 class="heading-sm">Belum ada target</h3>
      <p class="body-text">Buat target untuk tabungan kendaraan, rumah, liburan, atau dana darurat.</p>
      <button class="btn-primary" style="margin-top: 14px;" @click="router.push('/add-saving')">
        Buat Target Pertama
      </button>
    </div>

    <div v-else class="goals-list">
      <div
        v-for="goal in savingsStore.activeGoals"
        :key="goal.id"
        class="glow-card goal-card"
      >
        <div class="goal-header">
          <div class="goal-icon-badge">{{ goal.icon }}</div>
          <div class="goal-title-box">
            <h3 class="goal-name">{{ goal.name }}</h3>
            <span class="goal-deadline" v-if="goal.deadline">
              Target: {{ formatDateIndo(goal.deadline) }}
            </span>
          </div>
          <button class="delete-icon-btn" title="Hapus Target" @click="handleDelete(goal.id, goal.name)">
            ✕
          </button>
        </div>

        <div class="goal-numbers">
          <div>
            <span class="amount-current">{{ formatRupiah(goal.currentAmount) }}</span>
            <span class="amount-target"> / {{ formatRupiah(goal.targetAmount) }}</span>
          </div>
          <span class="percentage-pill">
            {{ Math.min(Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100), 100) }}%
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{
              width: `${Math.min(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100, 100)}%`,
              backgroundColor: goal.color || '#00FF00'
            }"
          ></div>
        </div>

        <!-- Action Row -->
        <div class="goal-card-actions">
          <button class="btn-primary deposit-btn" @click="openDeposit(goal)">
            ＋ Setor Dana
          </button>
          <span class="deposits-count body-text">
            {{ (goal.deposits || []).length }}x setoran
          </span>
        </div>
      </div>
    </div>

    <!-- Completed Goals Section (if any) -->
    <div v-if="savingsStore.completedGoals.length > 0" class="completed-section">
      <span class="caption-label">TARGET SUDAH TERCAPAI 🎉 ({{ savingsStore.completedGoals.length }})</span>
      <div class="goals-list" style="margin-top: 8px;">
        <div
          v-for="goal in savingsStore.completedGoals"
          :key="goal.id"
          class="glow-card goal-card completed-card"
        >
          <div class="goal-header">
            <div class="goal-icon-badge">{{ goal.icon }}</div>
            <div class="goal-title-box">
              <h3 class="goal-name">{{ goal.name }}</h3>
              <span class="badge-new" style="background-color: rgba(0, 255, 0, 0.2); color: #0d8312;">LUNAS / TERCAPAI</span>
            </div>
          </div>
          <div class="amount-current" style="margin-top: 8px;">{{ formatRupiah(goal.targetAmount) }}</div>
        </div>
      </div>
    </div>

    <!-- Deposit Modal -->
    <DepositModal
      v-if="selectedGoal"
      :show="showModal"
      :goal="selectedGoal"
      @close="showModal = false"
      @confirm="handleDeposit"
    />
  </div>
</template>

<style scoped>
.savings-page {
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

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
}

.total-saved-amt {
  font-size: 24px;
  font-weight: 700;
  color: #131517;
  margin: 6px 0 2px 0;
}

.target-subtext {
  font-size: 12px;
  color: #737577;
}

.progress-ring-box {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: #f4f5f6;
  stroke-width: 9;
}

.circle-fill {
  fill: none;
  stroke: #00FF00;
  stroke-width: 9;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s ease;
}

.ring-center-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.percent-val {
  font-size: 16px;
  font-weight: 700;
  color: #131517;
}

.percent-sub {
  font-size: 9px;
  color: #737577;
  text-transform: uppercase;
  font-weight: 600;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.goal-card {
  padding: 20px;
  border-radius: 32px;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.goal-icon-badge {
  width: 48px;
  height: 48px;
  background-color: #f4f5f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.goal-title-box {
  flex: 1;
}

.goal-name {
  font-size: 16px;
  font-weight: 700;
  color: #131517;
}

.goal-deadline {
  font-size: 11px;
  color: #737577;
}

.delete-icon-btn {
  background: none;
  border: none;
  color: #b3b5b7;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.goal-numbers {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 8px;
}

.amount-current {
  font-size: 15px;
  font-weight: 700;
  color: #131517;
}

.amount-target {
  font-size: 13px;
  color: #737577;
}

.percentage-pill {
  background-color: rgba(0, 255, 0, 0.2);
  color: #0d8312;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 100px;
}

.progress-track {
  height: 8px;
  background-color: #f4f5f6;
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s ease;
}

.goal-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deposit-btn {
  padding: 8px 18px;
  font-size: 13px;
  min-height: 38px;
}

.deposits-count {
  font-size: 12px;
}

.empty-card {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.completed-card {
  opacity: 0.8;
  border: 1px dashed #00FF00;
}
</style>
