import { ref } from 'vue'

const toastState = ref({
  show: false,
  message: '',
  type: 'success', // 'success' | 'error' | 'info'
  timeoutId: null
})

export function useToast() {
  function showToast(message, type = 'success', duration = 3000) {
    if (toastState.value.timeoutId) {
      clearTimeout(toastState.value.timeoutId)
    }

    toastState.value = {
      show: true,
      message,
      type,
      timeoutId: setTimeout(() => {
        toastState.value.show = false
      }, duration)
    }
  }

  function hideToast() {
    toastState.value.show = false
  }

  return {
    toastState,
    showToast,
    hideToast
  }
}
