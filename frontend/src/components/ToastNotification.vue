<script setup>
import { useToast } from '../composables/useToast'

const { toastState, hideToast } = useToast()
</script>

<template>
  <Transition name="toast">
    <div
      v-if="toastState.show"
      class="toast-wrapper"
      :class="`toast-${toastState.type}`"
      @click="hideToast"
    >
      <div class="toast-content">
        <span class="toast-icon">
          <span v-if="toastState.type === 'success'">✓</span>
          <span v-else-if="toastState.type === 'error'">✕</span>
          <span v-else>ℹ</span>
        </span>
        <span class="toast-message">{{ toastState.message }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: calc(100% - 32px);
  max-width: 440px;
  border-radius: 19px;
  padding: 12px 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
}

.toast-success {
  background-color: #131517;
  color: #00FF00;
  border: 1px solid rgba(0, 255, 0, 0.4);
}

.toast-error {
  background-color: #131517;
  color: #e83b47;
  border: 1px solid rgba(232, 59, 71, 0.4);
}

.toast-info {
  background-color: #131517;
  color: #ffffff;
  border: 1px solid #333537;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}
</style>
