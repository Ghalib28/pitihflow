<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  autoDismiss: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 1800
  }
})

const emit = defineEmits(['finish'])

const isVisible = ref(true)
const isExiting = ref(false)

function dismiss() {
  if (isExiting.value) return
  isExiting.value = true
  setTimeout(() => {
    isVisible.value = false
    emit('finish')
  }, 450)
}

onMounted(() => {
  if (props.autoDismiss) {
    setTimeout(() => {
      dismiss()
    }, props.duration)
  }
})
</script>

<template>
  <div
    v-if="isVisible"
    class="glow-splash-screen"
    :class="{ 'splash-exit': isExiting }"
    @click="dismiss"
  >
    <!-- Ghosted Feature Text Wallpaper -->
    <div class="ghost-text-wallpaper">
      <div class="ghost-row">
        <span>PITIH FLOW</span>
        <span>GOOGLE SHEETS SYNC</span>
        <span>SAVINGS GOALS</span>
      </div>
      <div class="ghost-row">
        <span>ZERO ADS</span>
        <span>SMART BUDGETING</span>
        <span>DATA PRIVACY</span>
      </div>
      <div class="ghost-row">
        <span>AI CONCIERGE</span>
        <span>EDITORIAL LUXURY</span>
        <span>FAST MOTION</span>
      </div>
      <div class="ghost-row">
        <span>FINANCIAL FREEDOM</span>
        <span>MINANG HERITAGE</span>
        <span>SECURE STORAGE</span>
      </div>
    </div>

    <!-- Center Hero Identity Artifact -->
    <div class="splash-hero">
      <div class="plasma-logo-box animate-bloom">
        <svg viewBox="0 0 40 40" class="logo-glyph">
          <!-- Flowing 'P' monogram with Pure Green accent -->
          <path
            d="M12 9h10a8 8 0 0 1 8 8v1a8 8 0 0 1-8 8h-10V9z"
            fill="none"
            stroke="#ffffff"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 26 L12 33"
            stroke="#ffffff"
            stroke-width="3.5"
            stroke-linecap="round"
          />
          <path
            d="M12 18 Q20 18 24 23"
            fill="none"
            stroke="#00FF00"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <h1 class="splash-title">
        pitihflow<span class="dot-green">.</span>
      </h1>

      <div class="badge-peach-new">
        BEBAS IKLAN • EDITORIAL FINANCE
      </div>

      <p class="splash-tagline">
        Aliran Keuangan Pribadi Mewah & Mandiri
      </p>

      <div class="loading-pulse-ring">
        <div class="ring-pulse"></div>
        <span class="loading-label">Menyiapkan Neraca Keuangan...</span>
      </div>
    </div>

    <div class="skip-hint">
      Ketuk untuk langsung masuk →
    </div>
  </div>
</template>

<style scoped>
.glow-splash-screen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background-color: var(--bg-canvas, #0c0e12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.splash-exit {
  opacity: 0;
  transform: scale(1.04);
  pointer-events: none;
}

.ghost-text-wallpaper {
  position: absolute;
  inset: -20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  pointer-events: none;
  opacity: 0.07;
  transform: rotate(-8deg) scale(1.15);
}

.ghost-row {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  letter-spacing: 0.083em;
  white-space: nowrap;
}

.splash-hero {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 24px;
}

.plasma-logo-box {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: radial-gradient(86% 86% at 6% 9%, rgba(19, 255, 23, 0.73) 0%, rgba(24, 146, 26, 1) 51%, rgba(0, 255, 106, 1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 36px rgba(0, 255, 106, 0.35);
  margin-bottom: 18px;
  animation: bloomPulse 2s infinite ease-in-out;
}

.logo-glyph {
  width: 42px;
  height: 42px;
}

.splash-title {
  font-family: var(--font-serif, serif);
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary, #131517);
  line-height: 1;
  margin-bottom: 8px;
}

.dot-green {
  color: #00FF00;
}

.badge-peach-new {
  background-color: var(--color-peach, #fef0e8);
  color: var(--color-ember-orange, #ec660d);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.083em;
  text-transform: uppercase;
  border-radius: 4px;
  padding: 4px 10px;
  margin-bottom: 12px;
  display: inline-block;
}

.splash-tagline {
  font-size: 14px;
  color: var(--text-secondary, #737577);
  margin-bottom: 24px;
}

.loading-pulse-ring {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-card, #ffffff);
  border-radius: 100px;
  padding: 6px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.ring-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00FF00;
  animation: pulseDot 1s infinite alternate;
}

.loading-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary, #131517);
}

.skip-hint {
  position: absolute;
  bottom: 32px;
  font-size: 11px;
  color: var(--text-secondary, #b3b5b7);
  letter-spacing: 0.04em;
}

@keyframes bloomPulse {
  0% { transform: scale(0.96); box-shadow: 0 8px 24px rgba(0, 255, 106, 0.25); }
  50% { transform: scale(1.04); box-shadow: 0 16px 40px rgba(0, 255, 106, 0.45); }
  100% { transform: scale(0.96); box-shadow: 0 8px 24px rgba(0, 255, 106, 0.25); }
}

@keyframes pulseDot {
  from { transform: scale(0.8); opacity: 0.6; }
  to { transform: scale(1.4); opacity: 1; }
}
</style>
