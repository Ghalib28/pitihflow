<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFinanceStore } from '../stores/finance'
import { formatRupiah, parseCurrencyInput } from '../composables/useFormatCurrency'
import { useToast } from '../composables/useToast'

const router = useRouter()
const route = useRoute()
const financeStore = useFinanceStore()
const { showToast } = useToast()

const txType = ref(route.query.type === 'income' ? 'income' : 'expense')
const amountRaw = ref('')
const selectedCategoryId = ref('food')
const description = ref('')
const txDate = ref(new Date().toISOString().split('T')[0])

// Filter available categories based on type
const availableCategories = computed(() => {
  return financeStore.categories.filter(
    (c) => c.type === txType.value || c.type === 'both'
  )
})

// Default category selection
if (txType.value === 'income') {
  selectedCategoryId.value = 'salary'
}

function selectType(type) {
  txType.value = type
  const firstMatch = financeStore.categories.find(
    (c) => c.type === type || c.type === 'both'
  )
  if (firstMatch) {
    selectedCategoryId.value = firstMatch.id
  }
}

function onAmountInput(e) {
  const val = e.target.value
  const num = parseCurrencyInput(val)
  amountRaw.value = num > 0 ? num.toLocaleString('id-ID') : ''
}

async function handleSave() {
  const amount = parseCurrencyInput(amountRaw.value)
  if (amount <= 0) {
    showToast('Silakan masukkan nominal transaksi.', 'error')
    return
  }

  await financeStore.addTransaction({
    type: txType.value,
    amount,
    categoryId: selectedCategoryId.value,
    description: description.value.trim() || financeStore.getCategoryById(selectedCategoryId.value).name,
    date: txDate.value
  })

  showToast(`Berhasil menyimpan transaksi ${formatRupiah(amount)}!`, 'success')
  router.push('/transactions')
}
</script>

<template>
  <div class="add-tx-page animate-slide-up">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="router.back()">✕</button>
      <h2 class="heading-sm">Catat Transaksi</h2>
      <div style="width: 32px;"></div>
    </header>

    <!-- Type Switcher (Income / Expense) -->
    <div class="type-toggle-container">
      <button
        class="type-btn"
        :class="{ 'active-expense': txType === 'expense' }"
        @click="selectType('expense')"
      >
        Pengeluaran
      </button>
      <button
        class="type-btn"
        :class="{ 'active-income': txType === 'income' }"
        @click="selectType('income')"
      >
        Pemasukan
      </button>
    </div>

    <!-- Amount Input Display -->
    <div class="amount-hero-box glow-card">
      <span class="caption-label">NOMINAL TRANSAKSI</span>
      <div class="amount-display-row">
        <span class="currency-tag">Rp</span>
        <input
          type="text"
          inputmode="numeric"
          :value="amountRaw"
          placeholder="0"
          class="amount-big-input"
          autofocus
          @input="onAmountInput"
        />
      </div>

      <!-- Quick Preset Amounts -->
      <div class="preset-chips">
        <button
          v-for="val in [20000, 50000, 100000, 250000, 500000]"
          :key="val"
          type="button"
          class="preset-chip"
          @click="amountRaw = val.toLocaleString('id-ID')"
        >
          {{ formatRupiah(val).replace('Rp ', '') }}
        </button>
      </div>
    </div>

    <!-- Category Selector Grid -->
    <div class="form-section glow-card">
      <span class="caption-label" style="margin-bottom: 12px; display: block;">PILIH KATEGORI</span>
      <div class="categories-grid">
        <button
          v-for="cat in availableCategories"
          :key="cat.id"
          type="button"
          class="category-pill-btn"
          :class="{ selected: selectedCategoryId === cat.id }"
          @click="selectedCategoryId = cat.id"
        >
          <span class="cat-pill-icon">{{ cat.emoji }}</span>
          <span class="cat-pill-label">{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Additional Fields (Description & Date) -->
    <div class="form-section glow-card">
      <div class="input-group">
        <label class="caption-label">CATATAN / KETERANGAN</label>
        <input
          v-model="description"
          type="text"
          placeholder="Contoh: Makan Siang Nasi Padang"
          class="text-field"
        />
      </div>

      <div class="input-group" style="margin-top: 14px;">
        <label class="caption-label">TANGGAL TRANSAKSI</label>
        <input
          v-model="txDate"
          type="date"
          class="text-field"
        />
      </div>
    </div>

    <!-- Save Action Button -->
    <div class="bottom-action-wrapper">
      <button class="btn-primary full-width-btn" @click="handleSave">
        Simpan Transaksi
      </button>
      <button class="btn-ghost full-width-btn" style="margin-top: 8px;" @click="router.back()">
        Batal
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-tx-page {
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
  color: #131517;
}

.type-toggle-container {
  display: flex;
  background-color: #ffffff;
  border-radius: 19px;
  padding: 4px;
  border: 1px solid #b3b5b7;
}

.type-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 700;
  color: #737577;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active-expense {
  background-color: #e83b47;
  color: #ffffff;
}

.type-btn.active-income {
  background-color: #00FF00;
  color: #131517;
}

.amount-hero-box {
  text-align: center;
  padding: 24px 20px;
}

.amount-display-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 16px 0;
}

.currency-tag {
  font-size: 28px;
  font-weight: 700;
  color: #131517;
}

.amount-big-input {
  border: none;
  background: transparent;
  font-size: 38px;
  font-weight: 700;
  color: #131517;
  max-width: 260px;
  text-align: left;
}

.preset-chips {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-chip {
  background: #f4f5f6;
  border: 1px solid #b3b5b7;
  border-radius: 100px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #131517;
  cursor: pointer;
}

.preset-chip:active {
  background: #00FF00;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.category-pill-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f4f5f6;
  border: 1.5px solid transparent;
  padding: 10px 14px;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.category-pill-btn.selected {
  background: #ffffff;
  border-color: #00FF00;
  box-shadow: 0 0 12px rgba(0, 255, 0, 0.2);
}

.cat-pill-icon {
  font-size: 20px;
}

.cat-pill-label {
  font-size: 13px;
  font-weight: 600;
  color: #131517;
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

.bottom-action-wrapper {
  margin-top: 8px;
}

.full-width-btn {
  width: 100%;
  justify-content: center;
}
</style>
