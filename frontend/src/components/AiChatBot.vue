<script setup>
import { ref, nextTick } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useSavingsStore } from '../stores/savings'
import { useUserStore } from '../stores/user'
import { formatRupiah } from '../composables/useFormatCurrency'

const financeStore = useFinanceStore()
const savingsStore = useSavingsStore()
const userStore = useUserStore()

const isOpen = ref(false)
const inputMessage = ref('')
const isTyping = ref(false)
const chatBodyRef = ref(null)

const messages = ref([
  {
    sender: 'bot',
    text: `Salam hangat, ${userStore.username}. Saya Pitihflow AI Concierge pribadi Anda. Ada evaluasi aliran kas, strategi alokasi pitih, atau target impian yang ingin Anda diskusikan hari ini?`
  }
])

const quickChips = [
  '📊 Analisis Keuangan',
  '💡 Tips Alokasi Bijak',
  '🎯 Estimasi Target',
  '📐 Formula 50-30-20'
]

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

function handleChipClick(chip) {
  inputMessage.value = chip
  sendMessage()
}

function sendMessage() {
  const text = inputMessage.value.trim()
  if (!text) return

  messages.value.push({
    sender: 'user',
    text
  })
  inputMessage.value = ''
  scrollToBottom()

  isTyping.value = true

  setTimeout(() => {
    const reply = generateAiResponse(text)
    messages.value.push({
      sender: 'bot',
      text: reply
    })
    isTyping.value = false
    scrollToBottom()
  }, 550)
}

function generateAiResponse(query) {
  const q = query.toLowerCase()
  const balance = financeStore.balance
  const income = financeStore.totalIncome
  const expense = financeStore.totalExpense
  const topCategories = financeStore.expenseByCategory
  const goals = savingsStore.activeGoals

  if (q.includes('analisis') || q.includes('keuangan') || q.includes('kondisi') || q.includes('evaluasi') || q.includes('pitih')) {
    if (income === 0 && expense === 0) {
      return `Saat ini neraca pitih masih kosong, ${userStore.username}. Catat pemasukan pertama Anda untuk memulai kalkulasi editorial portofolio Anda.`
    }

    let status = 'Kondisi Prima: Surplus likuiditas terjaga dengan baik.'
    if (balance < 0) {
      status = 'Peringatan Defisit: Pengeluaran melampaui arus masuk kas.'
    } else if (expense > income * 0.8) {
      status = 'Hati-hati: Pengeluaran menyentuh 80%+ dari pendapatan.'
    }

    let topCatText = 'Belum ada pengeluaran.'
    if (topCategories.length > 0) {
      const top = topCategories[0]
      topCatText = `${top.emoji} ${top.name} senilai ${formatRupiah(top.total)} (${top.percentage}% dari total belanja).`
    }

    return `📊 **Ikhtisar Neraca Pitihflow:**\n\n` +
      `• **Saldo Kas Bersih:** ${formatRupiah(balance)}\n` +
      `• **Total Pemasukan:** ${formatRupiah(income)}\n` +
      `• **Total Pengeluaran:** ${formatRupiah(expense)}\n` +
      `• **Alokasi Terbesar:** ${topCatText}\n\n` +
      `⚜️ **Diagnosa:** ${status}`
  }

  if (q.includes('tips') || q.includes('alokasi') || q.includes('hemat') || q.includes('boros')) {
    if (topCategories.length > 0) {
      const top = topCategories[0]
      return `💡 **Catatan Strategis Aliran Kas:**\n\n` +
        `Pos pengeluaran paling dominan saat ini adalah **${top.name}** (${formatRupiah(top.total)}).\n\n` +
        `Rekomendasi bijak Pitihflow:\n` +
        `1. Beri jeda 48 jam untuk pembelian impulsif di luar kebutuhan primer.\n` +
        `2. Alihkan 10% sisa alokasi belanja langsung ke pos tabungan impian.\n` +
        `3. Pertahankan pencatatan rapi untuk visibilitas arus kas Anda.`
    }
    return `💡 **Prinsip Utama Aliran Pitih Sehat:**\n\n` +
      `1. **Dahulukan Menabung**: Sisihkan minimal 15-20% pitih masuk sebelum belanja dimulai.\n` +
      `2. **Mindful Spending**: Bedakan antara *value-driven purchases* dan *status-driven purchases*.\n` +
      `3. **Disiplin**: Catat transaksi secara konsisten setiap hari di Pitihflow.`
  }

  if (q.includes('tabung') || q.includes('target') || q.includes('estimasi') || q.includes('goal')) {
    if (goals.length === 0) {
      return `Belum ada target tabungan yang didaftarkan. Kunjungi tab **Tabungan** untuk merencanakan sasaran aset baru Anda!`
    }
    const totalSaved = savingsStore.totalSaved
    const totalTarget = savingsStore.totalTarget
    const percent = savingsStore.overallProgress

    return `🎯 **Progres Sasaran Tabungan:**\n\n` +
      `• Total Terkumpul: **${formatRupiah(totalSaved)}** dari target **${formatRupiah(totalTarget)}** (${percent}%)\n` +
      `• Target Berjalan: **${goals.length} target**\n\n` +
      `Pertahankan ritme setoran untuk memastikan setiap tujuan tercapai tepat waktu.`
  }

  if (q.includes('50') || q.includes('30') || q.includes('20') || q.includes('formula') || q.includes('rumus')) {
    const inc = income > 0 ? income : 5000000
    const needs = inc * 0.5
    const wants = inc * 0.3
    const savings = inc * 0.2

    return `📐 **Formula Alokasi Klasik (50/30/20):**\n\n` +
      `Berdasarkan estimasi pemasukan (${formatRupiah(inc)}):\n` +
      `• **50% Kebutuhan Esensial:** ${formatRupiah(needs)} (Sewa, utilitas, logistik)\n` +
      `• **30% Keinginan & Rekreasi:** ${formatRupiah(wants)} (Lifestyle, hobi, dining)\n` +
      `• **20% Pembangunan Aset:** ${formatRupiah(savings)} (Dana darurat & investasi)\n\n` +
      `Kerangka ini menjamin gaya hidup seimbang tanpa mengorbankan masa depan finansial.`
  }

  return `Tentu, ${userStore.username}. Sebagai Pitihflow Concierge pribadi Anda, saya siap memberikan analisis neraca, tips alokasi bijak, atau evaluasi target tabungan kapan saja. Ada hal lain yang ingin Anda telaah?`
}
</script>

<template>
  <div class="ai-bot-wrapper">
    <!-- Floating Launcher with Pure Green Subtle Glow -->
    <button
      class="ai-floating-trigger"
      :class="{ active: isOpen }"
      title="Konsultasi AI Asisten Keuangan"
      @click="toggleChat"
    >
      <div class="ai-sparkle-glow"></div>
      <span class="ai-icon">✨</span>
      <span class="ai-label-pill">Pitihflow AI</span>
    </button>

    <!-- Chat Popup Sheet -->
    <Transition name="chat-slide">
      <div v-if="isOpen" class="ai-chat-sheet">
        <!-- Luxury Editorial Header -->
        <div class="ai-header">
          <div class="ai-header-left">
            <div class="ai-avatar-icon">🏛️</div>
            <div class="ai-info-meta">
              <div class="ai-title-row">
                <span class="ai-title editorial-serif">Pitihflow AI Concierge</span>
                <span class="ai-badge-free">GRATIS</span>
              </div>
              <span class="ai-subtitle">Penasihat Keuangan Cerdas & Elegan</span>
            </div>
          </div>
          <button class="ai-close-btn" @click="isOpen = false">✕</button>
        </div>

        <!-- Chat Body Message List -->
        <div ref="chatBodyRef" class="ai-chat-body">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="chat-bubble-row"
            :class="msg.sender === 'user' ? 'bubble-user-row' : 'bubble-bot-row'"
          >
            <div
              class="chat-bubble"
              :class="msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'"
            >
              <div style="white-space: pre-line;">{{ msg.text }}</div>
            </div>
          </div>

          <div v-if="isTyping" class="typing-indicator-row">
            <div class="typing-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Quick Suggestions Chips -->
        <div class="ai-quick-chips">
          <button
            v-for="chip in quickChips"
            :key="chip"
            type="button"
            class="chip-button"
            @click="handleChipClick(chip)"
          >
            {{ chip }}
          </button>
        </div>

        <!-- Input Bar -->
        <div class="ai-input-bar">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Tanyakan analisis finansial atau alokasi budget..."
            class="ai-text-input"
            @keyup.enter="sendMessage"
          />
          <button
            class="ai-send-btn"
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
          >
            ➔
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ai-bot-wrapper {
  position: relative;
  z-index: 950;
}

.ai-floating-trigger {
  position: fixed;
  right: 18px;
  bottom: calc(var(--safe-bottom, 16px) + 72px);
  z-index: 960;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #131517;
  color: #00FF00;
  border: 1.5px solid #00FF00;
  border-radius: 100px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 255, 0, 0.25);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.ai-floating-trigger:active {
  transform: scale(0.92);
}

.ai-sparkle-glow {
  position: absolute;
  inset: -3px;
  border-radius: 100px;
  background: radial-gradient(circle, rgba(0, 255, 0, 0.4) 0%, transparent 70%);
  opacity: 0.6;
  animation: pulseSparkle 2s infinite;
  pointer-events: none;
}

.ai-icon {
  font-size: 16px;
}

.ai-label-pill {
  color: #ffffff;
  font-size: 12.5px;
  letter-spacing: -0.2px;
}

/* Chat Popup Sheet */
.ai-chat-sheet {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 520px;
  background-color: var(--bg-card, #ffffff);
  border-radius: 36px 36px 0 0;
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  border-top: 2px solid #00FF00;
}

/* Header */
.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--bg-secondary, #f4f5f6);
  border-bottom: 1px solid var(--border-subtle, #b3b5b7);
}

.ai-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--text-primary, #131517);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.ai-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editorial-serif {
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.ai-badge-free {
  background-color: rgba(0, 255, 0, 0.2);
  color: #00FF00;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.ai-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
}

.ai-close-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat Body */
.ai-chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--bg-canvas, #fafbfc);
}

.chat-bubble-row {
  display: flex;
  width: 100%;
}

.bubble-user-row {
  justify-content: flex-end;
}

.bubble-bot-row {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 84%;
  padding: 13px 17px;
  font-size: 13.5px;
  line-height: 1.5;
  border-radius: 20px;
}

.bubble-user {
  background-color: var(--color-pure-green);
  color: #131517;
  font-weight: 600;
  border-bottom-right-radius: 4px;
}

.bubble-bot {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Quick Chips */
.ai-quick-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 16px;
  background: var(--bg-card);
  border-top: 1px solid var(--bg-secondary);
}

.chip-button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 100px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  cursor: pointer;
}

.chip-button:hover,
.chip-button:active {
  background-color: var(--color-pure-green);
  color: #131517;
}

/* Input Bar */
.ai-input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px calc(var(--safe-bottom, 16px) + 6px) 16px;
  background-color: var(--bg-card);
  border-top: 1px solid var(--border-subtle);
}

.ai-text-input {
  flex: 1;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 100px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text-primary);
}

.ai-text-input:focus {
  border-color: var(--color-pure-green);
  background-color: var(--bg-card);
}

.ai-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-pure-green);
  color: #131517;
  border: none;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ai-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Typing Indicator */
.typing-bubble {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  padding: 10px 16px;
  border-radius: 18px;
  display: inline-flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-pure-green);
  border-radius: 50%;
  animation: typingBounce 1.2s infinite ease-in-out;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

@keyframes pulseSparkle {
  0% { transform: scale(0.9); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(0.9); opacity: 0.3; }
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}
</style>
