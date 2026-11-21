import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, set } from 'idb-keyval'
import { sanitizeString } from '../utils/security'
import { AVATARS_3D } from '../utils/avatars'

const USER_STORAGE_KEY = 'duitku_user_profile_v2'

export const useUserStore = defineStore('user', () => {
  const username = ref('Kawan DuitKu')
  const avatarBorder = ref('glow') // 'glow' | 'plasma' | 'gold' | 'cyber' | 'minimal'
  const selectedAvatarId = ref('3d-sultan')
  const isLoaded = ref(false)

  const borderStyles = [
    { id: 'glow', name: 'Pure Green', class: 'border-glow', color: '#00FF00' },
    { id: 'plasma', name: 'Plasma Gradient', class: 'border-plasma', color: '#00ff6a' },
    { id: 'gold', name: 'Gold Luxury', class: 'border-gold', color: '#ffd700' },
    { id: 'cyber', name: 'Cyber Neon', class: 'border-cyber', color: '#00e5ff' },
    { id: 'minimal', name: 'Minimalist', class: 'border-minimal', color: '#131517' },
  ]

  const avatarsList = AVATARS_3D

  const currentAvatarSvg = computed(() => {
    const found = avatarsList.find((a) => a.id === selectedAvatarId.value)
    return found ? found.svg : avatarsList[0].svg
  })

  async function loadProfile() {
    try {
      const saved = await get(USER_STORAGE_KEY)
      if (saved && typeof saved === 'object') {
        if (saved.username) username.value = sanitizeString(saved.username, 40)
        if (saved.avatarBorder) avatarBorder.value = saved.avatarBorder
        if (saved.selectedAvatarId) selectedAvatarId.value = saved.selectedAvatarId
      }
    } catch (e) {
      console.warn('Gagal memuat profil pengguna:', e)
    } finally {
      isLoaded.value = true
    }
  }

  async function updateProfile({ newName, newBorder, newAvatarId }) {
    if (newName != null) username.value = sanitizeString(newName, 40) || 'Kawan DuitKu'
    if (newBorder != null) avatarBorder.value = newBorder
    if (newAvatarId != null) selectedAvatarId.value = newAvatarId

    try {
      await set(USER_STORAGE_KEY, {
        username: username.value,
        avatarBorder: avatarBorder.value,
        selectedAvatarId: selectedAvatarId.value
      })
    } catch (e) {
      console.error('Gagal menyimpan profil:', e)
    }
  }

  loadProfile()

  return {
    username,
    avatarBorder,
    selectedAvatarId,
    avatarsList,
    currentAvatarSvg,
    borderStyles,
    isLoaded,
    updateProfile,
    loadProfile
  }
})
