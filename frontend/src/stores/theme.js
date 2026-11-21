import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, set } from 'idb-keyval'

const THEME_STORAGE_KEY = 'pitihflow_theme_mode'

export const useThemeStore = defineStore('theme', () => {
  // 'light' | 'dark' | 'system'
  const mode = ref('light')

  async function initTheme() {
    try {
      const saved = await get(THEME_STORAGE_KEY)
      if (saved) {
        mode.value = saved
      } else {
        // Detect system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        mode.value = prefersDark ? 'dark' : 'light'
      }
    } catch {
      mode.value = 'light'
    }
    applyTheme()
  }

  function applyTheme() {
    const isDark = mode.value === 'dark'
    if (isDark) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }

  async function toggleTheme() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
    applyTheme()
    try {
      await set(THEME_STORAGE_KEY, mode.value)
    } catch (e) {
      console.error('Gagal menyimpan tema:', e)
    }
  }

  async function setTheme(newMode) {
    mode.value = newMode
    applyTheme()
    try {
      await set(THEME_STORAGE_KEY, mode.value)
    } catch (e) {
      console.error('Gagal menyimpan tema:', e)
    }
  }

  // Initialize immediately
  initTheme()

  return {
    mode,
    toggleTheme,
    setTheme,
    initTheme
  }
})
