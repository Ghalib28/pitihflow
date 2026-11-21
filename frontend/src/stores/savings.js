import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, set } from 'idb-keyval'
import { sanitizeString, sanitizeNumeric } from '../utils/security'

const STORAGE_KEY = 'duitku_savings_v2'

export const useSavingsStore = defineStore('savings', () => {
  // Starts completely empty for new users as requested!
  const goals = ref([])
  const isLoaded = ref(false)

  const defaultIcons = [
    { emoji: '🏠', label: 'Rumah Impian' },
    { emoji: '🚗', label: 'Kendaraan' },
    { emoji: '📱', label: 'Gadget Baru' },
    { emoji: '✈️', label: 'Liburan & Healing' },
    { emoji: '🎓', label: 'Pendidikan' },
    { emoji: '💍', label: 'Pernikahan' },
    { emoji: '🛡️', label: 'Dana Darurat' },
    { emoji: '🕋', label: 'Ibadah / Umroh' },
    { emoji: '📈', label: 'Modal Usaha' },
    { emoji: '👶', label: 'Keluarga' },
    { emoji: '🎯', label: 'Target Lainnya' },
  ]

  const totalSaved = computed(() =>
    goals.value.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0)
  )

  const totalTarget = computed(() =>
    goals.value.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0)
  )

  const overallProgress = computed(() => {
    if (totalTarget.value <= 0) return 0
    return Math.min(Math.round((totalSaved.value / totalTarget.value) * 100), 100)
  })

  const activeGoals = computed(() => goals.value.filter((g) => !g.completed))
  const completedGoals = computed(() => goals.value.filter((g) => g.completed))

  async function loadData() {
    try {
      const saved = await get(STORAGE_KEY)
      if (saved && Array.isArray(saved)) {
        goals.value = saved
      } else {
        // Starts empty! No seed goals
        goals.value = []
      }
    } catch (e) {
      console.warn('Gagal memuat target tabungan dari IndexedDB:', e)
      goals.value = []
    } finally {
      isLoaded.value = true
    }
  }

  async function persist() {
    try {
      await set(STORAGE_KEY, JSON.parse(JSON.stringify(goals.value)))
    } catch (e) {
      console.error('Gagal menyimpan target tabungan ke IndexedDB:', e)
    }
  }

  async function addGoal(goalData) {
    const targetAmount = sanitizeNumeric(goalData.targetAmount, 1)
    const currentAmount = sanitizeNumeric(goalData.currentAmount, 0)
    
    const newGoal = {
      id: 'goal_' + Date.now(),
      name: sanitizeString(goalData.name, 60),
      icon: sanitizeString(goalData.icon || '🎯', 10),
      targetAmount,
      currentAmount,
      deadline: sanitizeString(goalData.deadline || '', 20),
      color: sanitizeString(goalData.color || '#00FF00', 20),
      completed: currentAmount >= targetAmount,
      createdAt: new Date().toISOString(),
      deposits: currentAmount > 0 ? [
        {
          id: 'dep_' + Date.now(),
          amount: currentAmount,
          date: new Date().toISOString().split('T')[0],
          note: 'Setoran Awal'
        }
      ] : []
    }
    goals.value.push(newGoal)
    await persist()
    return newGoal
  }

  async function addDeposit(goalId, amount, note = '') {
    const goal = goals.value.find((g) => g.id === goalId)
    if (!goal) return

    const numAmount = sanitizeNumeric(amount, 1)
    goal.currentAmount = (Number(goal.currentAmount) || 0) + numAmount
    if (goal.currentAmount >= goal.targetAmount) {
      goal.completed = true
    }

    if (!goal.deposits) goal.deposits = []
    goal.deposits.unshift({
      id: 'dep_' + Date.now(),
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      note: sanitizeString(note || 'Tambah Setoran', 100)
    })

    await persist()
  }

  async function deleteGoal(id) {
    const idx = goals.value.findIndex((g) => g.id === id)
    if (idx !== -1) {
      goals.value.splice(idx, 1)
      await persist()
    }
  }

  async function clearAllGoals() {
    goals.value = []
    await persist()
  }

  loadData()

  return {
    goals,
    defaultIcons,
    isLoaded,
    totalSaved,
    totalTarget,
    overallProgress,
    activeGoals,
    completedGoals,
    addGoal,
    addDeposit,
    deleteGoal,
    clearAllGoals,
    loadData,
    persist
  }
})
