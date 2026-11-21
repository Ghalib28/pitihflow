import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, set } from 'idb-keyval'
import { sanitizeString, sanitizeNumeric } from '../utils/security'

const STORAGE_KEY = 'duitku_transactions_v2'

export const useFinanceStore = defineStore('finance', () => {
  // --- state ---
  // Started completely empty for new users as requested!
  const transactions = ref([])
  const isLoaded = ref(false)

  const categories = ref([
    { id: 'food', name: 'Makanan & Minuman', emoji: '🍔', color: '#ff6384', type: 'expense' },
    { id: 'transport', name: 'Transportasi', emoji: '🚗', color: '#36a2eb', type: 'expense' },
    { id: 'shopping', name: 'Belanja', emoji: '🛍️', color: '#ffce56', type: 'expense' },
    { id: 'bills', name: 'Tagihan & Utilitas', emoji: '💡', color: '#4bc0c0', type: 'expense' },
    { id: 'entertainment', name: 'Hiburan', emoji: '🎮', color: '#9966ff', type: 'expense' },
    { id: 'health', name: 'Kesehatan', emoji: '💊', color: '#e83b47', type: 'expense' },
    { id: 'education', name: 'Pendidikan', emoji: '📚', color: '#737577', type: 'expense' },
    { id: 'housing', name: 'Tempat Tinggal', emoji: '🏠', color: '#ec660d', type: 'expense' },
    { id: 'salary', name: 'Gaji Pokok', emoji: '💰', color: '#00FF00', type: 'income' },
    { id: 'freelance', name: 'Proyek / Freelance', emoji: '💻', color: '#18921a', type: 'income' },
    { id: 'investment', name: 'Hasil Investasi', emoji: '📈', color: '#00ff6a', type: 'income' },
    { id: 'gift', name: 'Hadiah / Bonus', emoji: '🎁', color: '#ff9f40', type: 'income' },
    { id: 'other', name: 'Lain-lain', emoji: '✨', color: '#b3b5b7', type: 'both' },
  ])

  // --- getters ---
  const totalIncome = computed(() =>
    transactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  )

  const balance = computed(() => totalIncome.value - totalExpense.value)

  const recentTransactions = computed(() => {
    return [...transactions.value]
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 5)
  })

  /** Monthly data for the last 6 months for chart */
  const monthlyTrend = computed(() => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const monthNum = String(d.getMonth() + 1).padStart(2, '0')
      const prefix = `${year}-${monthNum}`

      const txThisMonth = transactions.value.filter((t) => (t.date || '').startsWith(prefix))

      const inc = txThisMonth
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

      const exp = txThisMonth
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

      months.push({
        label: d.toLocaleDateString('id-ID', { month: 'short' }),
        fullKey: prefix,
        income: inc,
        expense: exp
      })
    }
    return months
  })

  /** Category breakdown for expenses */
  const expenseByCategory = computed(() => {
    const map = {}
    transactions.value
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catId = t.categoryId || 'other'
        map[catId] = (map[catId] || 0) + (Number(t.amount) || 0)
      })

    const totalExp = totalExpense.value || 1
    return categories.value
      .filter((c) => map[c.id] > 0)
      .map((c) => ({
        ...c,
        total: map[c.id],
        percentage: Math.round((map[c.id] / totalExp) * 100)
      }))
      .sort((a, b) => b.total - a.total)
  })

  function getCategoryById(id) {
    return categories.value.find((c) => c.id === id) || {
      id: 'other',
      name: 'Lain-lain',
      emoji: '✨',
      color: '#b3b5b7'
    }
  }

  // --- IndexedDB Offline Persistence ---
  async function loadData() {
    try {
      const saved = await get(STORAGE_KEY)
      if (saved && Array.isArray(saved)) {
        transactions.value = saved
      } else {
        // Starts empty! No mock seed data
        transactions.value = []
      }
    } catch (e) {
      console.warn('Gagal memuat data dari IndexedDB:', e)
      transactions.value = []
    } finally {
      isLoaded.value = true
    }
  }

  async function persist() {
    try {
      await set(STORAGE_KEY, JSON.parse(JSON.stringify(transactions.value)))
    } catch (e) {
      console.error('Gagal menyimpan ke IndexedDB:', e)
    }
  }

  async function addTransaction(tx) {
    // OWASP Sanitization of inputs
    const safeTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: tx.type === 'income' ? 'income' : 'expense',
      amount: sanitizeNumeric(tx.amount, 1),
      categoryId: sanitizeString(tx.categoryId || 'other', 40),
      description: sanitizeString(tx.description || '', 120),
      date: sanitizeString(tx.date || new Date().toISOString().split('T')[0], 20),
      createdAt: new Date().toISOString()
    }
    transactions.value.unshift(safeTx)
    await persist()
    return safeTx
  }

  async function deleteTransaction(id) {
    const idx = transactions.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      transactions.value.splice(idx, 1)
      await persist()
    }
  }

  async function clearAllData() {
    transactions.value = []
    await persist()
  }

  async function importData(importedTransactions) {
    if (Array.isArray(importedTransactions)) {
      // Validate and sanitize each imported row (OWASP A08)
      transactions.value = importedTransactions.map((t) => ({
        id: sanitizeString(t.id || 'tx_' + Date.now(), 50),
        type: t.type === 'income' ? 'income' : 'expense',
        amount: sanitizeNumeric(t.amount, 0),
        categoryId: sanitizeString(t.categoryId || 'other', 40),
        description: sanitizeString(t.description || '', 120),
        date: sanitizeString(t.date || '', 20),
        createdAt: t.createdAt || new Date().toISOString()
      }))
      await persist()
    }
  }

  // Load immediately on boot
  loadData()

  return {
    transactions,
    categories,
    isLoaded,
    totalIncome,
    totalExpense,
    balance,
    recentTransactions,
    monthlyTrend,
    expenseByCategory,
    getCategoryById,
    addTransaction,
    deleteTransaction,
    clearAllData,
    importData,
    loadData
  }
})
