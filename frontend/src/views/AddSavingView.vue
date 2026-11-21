<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSavingsStore } from '../stores/savings'
import { formatRupiah, parseCurrencyInput } from '../composables/useFormatCurrency'
import { useToast } from '../composables/useToast'

const router = useRouter()
const savingsStore = useSavingsStore()
const { showToast } = useToast()

const name = ref('')
const selectedIcon = ref('🏠')
const targetRaw = ref('')
const initialRaw = ref('')
const deadline = ref('')
const selectedColor = ref('#00FF00')

const colors = [
  '#00FF00', // Pure Green
  '#ec660d', // Ember Orange
  '#36a2eb', // Blue
  '#9966ff', // Purple
  '#ff6384', // Pink
  '#00ff6a'  // Plasma Green
]

function onTargetInput(e) {
  const num = parseCurrencyInput(e.target.value)
  targetRaw.value = num > 0 ? num.toLocaleString('id-ID') : ''
}

function onInitialInput(e) {
  const num = parseCurrencyInput(e.target.value)
  initialRaw.value = num > 0 ? num.toLocaleString('id-ID') : ''
}

async function handleSave() {
  const targetAmount = parseCurrencyInput(targetRaw.value)
  const currentAmount = parseCurrencyInput(initialRaw.value)

  if (!name.value.trim()) {
    showToast('Nama target tabungan harus diisi.', 'error')
    return
  }

  if (targetAmount <= 0) {
    showToast('Nominal target tabungan harus lebih dari 0.', 'error')
    return
  }

  await savingsStore.addGoal({
    name: name.value.trim(),
    icon: selectedIcon.value,
    targetAmount,
    currentAmount,
    deadline: deadline.value,
    color: selectedColor.value
  })

  showToast(`Target tabungan "${name.value}" berhasil dibuat!`, 'success')
  router.push('/savings')
}
</script>

<template>
  <div class="add-saving-page animate-slide-up">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="router.back()">✕</button>
      <h2 class="heading-sm">Target Tabungan Baru</h2>
      <div style="width: 32px;"></div>
    </header>

    <!-- Icon Picker Grid -->
    <div class="form-section glow-card">
      <span class="caption-label" style="margin-bottom: 12px; display: block;">PILIH IKON TARGET</span>
      <div class="icons-grid">
        <button
          v-for="item in savingsStore.defaultIcons"
          :key="item.emoji"
          type="button"
          class="icon-option-btn"
          :class="{ selected: selectedIcon === item.emoji }"
          @click="selectedIcon = item.emoji"
        >
          <span class="icon-emoji">{{ item.emoji }}</span>
          <span class="icon-label">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <!-- Name & Target Amount -->
    <div class="form-section glow-card">
      <div class="input-group">
        <label class="caption-label">NAMA TARGET</label>
        <input
          v-model="name"
          type="text"
          placeholder="Contoh: DP Rumah, Liburan Akhir Tahun"
          class="text-field"
        />
      </div>

      <div class="input-group" style="margin-top: 14px;">
        <label class="caption-label">NOMINAL TARGET (RP)</label>
        <div class="amount-field">
          <span class="currency-tag">Rp</span>
          <input
            type="text"
            inputmode="numeric"
            :value="targetRaw"
            placeholder="0"
            class="amount-field-input"
            @input="onTargetInput"
          />
        </div>
      </div>

      <div class="input-group" style="margin-top: 14px;">
        <label class="caption-label">SETORAN AWAL (OPSIONAL)</label>
        <div class="amount-field">
          <span class="currency-tag">Rp</span>
          <input
            type="text"
            inputmode="numeric"
            :value="initialRaw"
            placeholder="0"
            class="amount-field-input"
            @input="onInitialInput"
          />
        </div>
      </div>
    </div>

    <!-- Deadline & Color -->
    <div class="form-section glow-card">
      <div class="input-group">
        <label class="caption-label">TARGET SELESAI / DEADLINE</label>
        <input
          v-model="deadline"
          type="date"
          class="text-field"
        />
      </div>

      <div class="input-group" style="margin-top: 14px;">
        <label class="caption-label">WARNA AKSEN</label>
        <div class="color-options-row">
          <button
            v-for="c in colors"
            :key="c"
            type="button"
            class="color-dot-btn"
            :style="{ backgroundColor: c }"
            :class="{ active: selectedColor === c }"
            @click="selectedColor = c"
          ></button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="bottom-action-wrapper">
      <button class="btn-primary full-width-btn" @click="handleSave">
        Buat Target Tabungan
      </button>
      <button class="btn-ghost full-width-btn" style="margin-top: 8px;" @click="router.back()">
        Batal
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-saving-page {
  padding: 16px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: #ffffff;
  border: 1px solid #b3b5b7;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.icon-option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: #f4f5f6;
  border: 1.5px solid transparent;
  padding: 10px 4px;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option-btn.selected {
  background: #ffffff;
  border-color: #00FF00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.25);
}

.icon-emoji {
  font-size: 24px;
}

.icon-label {
  font-size: 10px;
  font-weight: 600;
  color: #131517;
  text-align: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.text-field {
  background-color: #f4f5f6;
  border: 1px solid #b3b5b7;
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 14px;
  color: #131517;
}

.text-field:focus {
  border-color: #131517;
  background-color: #ffffff;
}

.amount-field {
  display: flex;
  align-items: center;
  background-color: #f4f5f6;
  border: 1px solid #b3b5b7;
  border-radius: 14px;
  padding: 10px 16px;
}

.currency-tag {
  font-size: 18px;
  font-weight: 700;
  color: #131517;
  margin-right: 8px;
}

.amount-field-input {
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  color: #131517;
  width: 100%;
}

.color-options-row {
  display: flex;
  gap: 12px;
  padding: 6px 0;
}

.color-dot-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-dot-btn.active {
  border-color: #131517;
  transform: scale(1.15);
}

.bottom-action-wrapper {
  margin-top: 8px;
}

.full-width-btn {
  width: 100%;
  justify-content: center;
}
</style>
