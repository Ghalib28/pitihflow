<script setup>
import { ref, computed } from 'vue'
import { formatRupiah, parseCurrencyInput } from '../composables/useFormatCurrency'

const props = defineProps({
  goal: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const amountRaw = ref('')
const note = ref('')

const depositAmount = computed(() => parseCurrencyInput(amountRaw.value))

const previewTotal = computed(() => {
  return (Number(props.goal.currentAmount) || 0) + depositAmount.value
})

const currentPercent = computed(() => {
  if (!props.goal.targetAmount) return 0
  return Math.min(Math.round(((props.goal.currentAmount || 0) / props.goal.targetAmount) * 100), 100)
})

const previewPercent = computed(() => {
  if (!props.goal.targetAmount) return 0
  return Math.min(Math.round((previewTotal.value / props.goal.targetAmount) * 100), 100)
})

function onAmountInput(e) {
  const val = e.target.value
  const num = parseCurrencyInput(val)
  amountRaw.value = num > 0 ? num.toLocaleString('id-ID') : ''
}

function handleConfirm() {
  if (depositAmount.value <= 0) return
  emit('confirm', {
    amount: depositAmount.value,
    note: note.value.trim()
  })
  amountRaw.value = ''
  note.value = ''
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-sheet">
        <div class="modal-handle"></div>

        <div class="modal-header">
          <div class="goal-tag">
            <span class="goal-icon">{{ goal.icon }}</span>
            <span class="goal-name">{{ goal.name }}</span>
          </div>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <div class="caption-label" style="margin-bottom: 8px;">NOMINAL SETORAN</div>
          <div class="amount-field-wrapper">
            <span class="currency-prefix">Rp</span>
            <input
              type="text"
              inputmode="numeric"
              :value="amountRaw"
              placeholder="0"
              class="amount-input"
              autofocus
              @input="onAmountInput"
            />
          </div>

          <!-- Quick deposit buttons -->
          <div class="quick-chips">
            <button
              v-for="val in [50000, 100000, 500000, 1000000]"
              :key="val"
              type="button"
              class="chip-btn"
              @click="amountRaw = val.toLocaleString('id-ID')"
            >
              +{{ formatRupiah(val).replace('Rp ', '') }}
            </button>
          </div>

          <!-- Progress Preview -->
          <div class="progress-preview-box">
            <div class="progress-labels">
              <span>Progres Tabungan</span>
              <span class="highlight-percent">{{ previewPercent }}%</span>
            </div>
            <div class="progress-track">
              <!-- Current progress -->
              <div class="progress-bar-current" :style="{ width: `${currentPercent}%` }"></div>
              <!-- Preview new progress addition -->
              <div class="progress-bar-added" :style="{ width: `${previewPercent}%` }"></div>
            </div>
            <div class="progress-amounts">
              <span>{{ formatRupiah(previewTotal) }}</span>
              <span class="target-amount">dari {{ formatRupiah(goal.targetAmount) }}</span>
            </div>
          </div>

          <!-- Optional note -->
          <div class="note-box">
            <input
              v-model="note"
              type="text"
              placeholder="Catatan (contoh: Sisa uang jajan, bonus)"
              class="note-input"
            />
          </div>

          <!-- Action buttons -->
          <div class="action-buttons">
            <button
              class="btn-primary"
              style="width: 100%; justify-content: center;"
              :disabled="depositAmount <= 0"
              @click="handleConfirm"
            >
              Setor Dana Sekarang
            </button>
            <button
              class="btn-ghost"
              style="width: 100%; justify-content: center; margin-top: 10px;"
              @click="emit('close')"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(19, 21, 23, 0.6);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-sheet {
  background-color: #ffffff;
  border-radius: 40px 40px 0 0;
  width: 100%;
  max-width: 480px;
  padding: 20px 24px 36px 24px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-handle {
  width: 40px;
  height: 5px;
  background-color: #b3b5b7;
  border-radius: 10px;
  margin: 0 auto 16px auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.goal-tag {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goal-icon {
  font-size: 26px;
}

.goal-name {
  font-size: 18px;
  font-weight: 700;
  color: #131517;
}

.close-btn {
  background: #f4f5f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  color: #737577;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.amount-field-wrapper {
  display: flex;
  align-items: center;
  background-color: #f4f5f6;
  border-radius: 19px;
  padding: 12px 18px;
  margin-bottom: 12px;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.amount-field-wrapper:focus-within {
  border-color: #00FF00;
  background-color: #ffffff;
}

.currency-prefix {
  font-size: 24px;
  font-weight: 700;
  color: #131517;
  margin-right: 8px;
}

.amount-input {
  border: none;
  background: transparent;
  font-size: 28px;
  font-weight: 700;
  color: #131517;
  width: 100%;
}

.quick-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
  padding-bottom: 4px;
}

.chip-btn {
  background: #f4f5f6;
  border: 1px solid #b3b5b7;
  border-radius: 100px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #131517;
  white-space: nowrap;
  cursor: pointer;
}

.chip-btn:active {
  background: #00FF00;
}

.progress-preview-box {
  background: #f4f5f6;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #737577;
  margin-bottom: 8px;
}

.highlight-percent {
  color: #0d8312;
  font-weight: 700;
}

.progress-track {
  height: 10px;
  background-color: #b3b5b7;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
  margin-bottom: 8px;
}

.progress-bar-added {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #00FF00;
  border-radius: 100px;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-bar-current {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #18921a;
  border-radius: 100px;
  z-index: 1;
}

.progress-amounts {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #131517;
}

.target-amount {
  color: #737577;
}

.note-box {
  margin-bottom: 24px;
}

.note-input {
  width: 100%;
  border: 1px solid #b3b5b7;
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
}

.note-input:focus {
  border-color: #131517;
}

.action-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
