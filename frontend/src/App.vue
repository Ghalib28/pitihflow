<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ToastNotification from './components/ToastNotification.vue'
import GlowSplash from './components/GlowSplash.vue'
import AiChatBot from './components/AiChatBot.vue'

const route = useRoute()
const router = useRouter()

const showSplash = ref(true)

function onSplashFinish() {
  showSplash.value = false
}

// Hide bottom nav on modal-like add views for immersive form filling
const showBottomNav = computed(() => {
  return !['AddTransaction', 'AddSaving'].includes(route.name)
})
</script>

<template>
  <div class="app-layout">
    <!-- Glow Animated Interactive Entry Splash (DESIGN.md specification) -->
    <GlowSplash v-if="showSplash" @finish="onSplashFinish" />

    <!-- Global Toast Alert -->
    <ToastNotification />

    <!-- Free Financial AI Chatbot Popup Modal (Accessible anywhere) -->
    <AiChatBot />

    <!-- Main View with smooth fade-scale transition -->
    <main class="app-main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Navigation Bar (Glow Theme: Ink Black surface with Pure Green accents) -->
    <nav v-if="showBottomNav" class="bottom-nav-bar">
      <div class="nav-content">
        <button
          class="nav-tab"
          :class="{ active: route.path === '/' }"
          @click="router.push('/')"
        >
          <div class="nav-icon-box">
            <svg viewBox="0 0 24 24" class="nav-svg">
              <path
                d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 13 20v-5h-2v5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 3 20v-9.5z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="nav-label">Beranda</span>
        </button>

        <button
          class="nav-tab"
          :class="{ active: route.path.startsWith('/transactions') }"
          @click="router.push('/transactions')"
        >
          <div class="nav-icon-box">
            <svg viewBox="0 0 24 24" class="nav-svg">
              <rect x="2" y="5" width="20" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
              <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <span class="nav-label">Transaksi</span>
        </button>

        <button
          class="nav-tab"
          :class="{ active: route.path.startsWith('/savings') }"
          @click="router.push('/savings')"
        >
          <div class="nav-icon-box">
            <svg viewBox="0 0 24 24" class="nav-svg">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
              <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span class="nav-label">Tabungan</span>
        </button>

        <button
          class="nav-tab"
          :class="{ active: route.path.startsWith('/settings') }"
          @click="router.push('/settings')"
        >
          <div class="nav-icon-box">
            <svg viewBox="0 0 24 24" class="nav-svg">
              <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <span class="nav-label">Pengaturan</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main-content {
  flex: 1;
  width: 100%;
}

/* Fixed Bottom Navigation Bar */
.bottom-nav-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background-color: var(--bg-card);
  padding: 8px 16px calc(var(--safe-bottom, 12px) + 8px) 16px;
  z-index: 999999 !important;
  border-radius: 28px 28px 0 0;
  border-top: 1px solid var(--border-subtle);
  box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.nav-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.nav-tab {
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #737577;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.nav-icon-box {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-svg {
  width: 22px;
  height: 22px;
  transition: transform 0.2s;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.nav-tab.active {
  color: #00FF00;
}

.nav-tab.active .nav-svg {
  transform: translateY(-2px);
}

/* Page Transition Animations */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
