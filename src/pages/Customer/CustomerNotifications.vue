<template>
  <div class="notif-bg min-h-screen pb-28">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-orange-100">
      <div class="max-w-md mx-auto flex items-center h-14 px-4">
        <span class="text-2xl font-bold text-brown-900 flex-1">Notifications</span>
        <button
          class="px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
          @click="fetchNotifications"
          :disabled="loading"
          aria-label="Refresh notifications"
        >
          <RefreshCw
            class="w-5 h-5"
            :class="loading ? 'animate-spin text-orange-400' : 'text-orange-500 hover:text-orange-700'"
          />
        </button>
      </div>
    </header>

    <main class="max-w-md mx-auto px-4 pb-8 pt-5">
      <!-- Loading -->
      <div v-if="loading" class="text-center pt-28 text-gray-400 flex flex-col items-center gap-2">
        <RefreshCw class="w-12 h-12 animate-spin text-orange-200" />
        <span class="font-semibold mt-4">Loading notifications...</span>
      </div>
      <!-- Empty state -->
      <div v-else-if="notifications.length === 0" class="bg-white/90 rounded-2xl p-12 text-center text-gray-400 font-semibold text-lg mt-12 shadow">
        <div class="text-4xl mb-3">🎉</div>
        No new notifications!
      </div>
      <!-- Notification List -->
      <div v-else class="space-y-5">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notification-card group flex items-start gap-4 px-5 py-4 bg-white border rounded-2xl shadow-md transition-all cursor-pointer relative"
          :class="notif.read ? 'border-green-200 opacity-70' : 'border-orange-200 hover:border-orange-300 active:bg-orange-50'"
          @click="openModal(notif)"
        >
          <div>
            <span class="ring-2 ring-orange-100 rounded-full flex items-center justify-center">
              <Gift v-if="notif.type === 'promotion'" class="icon-badge noti-badge-promo" />
              <AlarmClock v-else-if="notif.type === 'reminder'" class="icon-badge noti-badge-remind" />
              <Bell v-else class="icon-badge noti-badge" />
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="font-bold text-brown-900 text-base leading-tight break-words">
                {{ notif.title }}
              </span>
              <span v-if="notif.type" class="notif-pill">
                {{ notif.type }}
              </span>
            </div>
            <div class="text-gray-700 text-[15px] mb-0.5 leading-snug break-words line-clamp-2">
              {{ notif.message }}
            </div>
            <div class="text-xs text-gray-400 mt-0.5">
              {{ formatDate(notif.scheduled_at || notif.created_at) }}
            </div>
          </div>
          <div class="flex flex-col items-end">
            <button
              v-if="!notif.read"
              class="mark-read-btn"
              @click.stop="markAsRead(notif)"
              :disabled="isMarkingId === notif.id"
            >Mark as Read</button>
            <span
              v-else
              class="read-badge"
            >Read</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Notification Detail Modal -->
    <transition name="fade">
      <div v-if="showModal && selectedNotif" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-md p-6 relative">
          <button @click="closeModal" class="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 font-bold">&times;</button>
          <div class="mb-3 flex items-center gap-3">
            <span class="ring-2 ring-orange-100 rounded-full flex items-center justify-center">
              <Gift v-if="selectedNotif.type === 'promotion'" class="icon-badge noti-badge-promo" />
              <AlarmClock v-else-if="selectedNotif.type === 'reminder'" class="icon-badge noti-badge-remind" />
              <Bell v-else class="icon-badge noti-badge" />
            </span>
            <span class="text-lg font-bold text-brown-900">{{ selectedNotif.title }}</span>
            <span v-if="selectedNotif.type" class="notif-pill ml-1">{{ selectedNotif.type }}</span>
            <span v-if="selectedNotif.read" class="read-badge ml-1">Read</span>
          </div>
          <div class="text-gray-700 text-base mb-2 whitespace-pre-line break-words">{{ selectedNotif.message }}</div>
          <div class="text-xs text-gray-400 mb-3">
            {{ formatDate(selectedNotif.scheduled_at || selectedNotif.created_at) }}
          </div>
          <button
            v-if="!selectedNotif.read"
            class="mark-read-btn w-full mt-2"
            @click="markAsRead(selectedNotif)"
            :disabled="isMarkingId === selectedNotif.id"
          >Mark as Read</button>
        </div>
      </div>
    </transition>

    <!-- Bottom Navigation Bar -->
    <BottomNav
      class="fixed left-1/2 -translate-x-1/2 bottom-0 z-40"
      :unreadCount="unreadCount"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/plugins/axios'
import BottomNav from '@/components/Customer/BottomNav.vue'
import { Bell, Gift, AlarmClock, RefreshCw } from 'lucide-vue-next'

const notifications = ref([])
const loading = ref(true)
const isMarkingId = ref(null)
const showModal = ref(false)
const selectedNotif = ref(null)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

async function fetchNotifications() {
  loading.value = true
  try {
    const { data } = await axios.get('/notifications/active')
    notifications.value = Array.isArray(data.data) ? data.data : data
  } catch {
    notifications.value = []
  }
  loading.value = false
}

async function markAsRead(notif) {
  if (notif.read) return
  isMarkingId.value = notif.id
  try {
    await axios.put(`/notifications/${notif.id}/read`)
    notif.read = true
  } catch {}
  isMarkingId.value = null
}

function openModal(notif) {
  selectedNotif.value = notif
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedNotif.value = null
}

onMounted(fetchNotifications)
</script>

<style scoped>
.notif-bg {
  background: linear-gradient(120deg, #fef6e4 0%, #f3e8ff 100%);
  min-height: 100vh;
}
.text-brown-900 { color: #4F311C; }

.notification-card {
  border-width: 2px;
  box-shadow: 0 4px 18px rgba(253,186,116,0.10), 0 2px 8px rgba(253,186,116,0.07);
  transition: box-shadow 0.13s, border-color 0.13s, opacity 0.18s, background 0.13s;
  background: #fff;
}
.notification-card:hover {
  box-shadow: 0 10px 28px rgba(251,146,60,0.11), 0 4px 15px rgba(253,186,116,0.06);
  background: #fffdfa;
}

.icon-badge, .noti-badge, .noti-badge-promo, .noti-badge-remind {
  font-size: 1.45rem;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 1.4rem;
  background: #fff8ed;
  box-shadow: 0 1px 6px #fb923c18;
  display: flex;
  align-items: center;
  justify-content: center;
}

.noti-badge-promo { background: #fffaeb; color: #eab308 }
.noti-badge-remind { background: #e0f2fe; color: #0ea5e9 }
.noti-badge { background: #fff8ed; color: #fb923c }

.notif-pill {
  background: linear-gradient(90deg, #ffe6b3 0%, #ffd8d8 100%);
  color: #fb923c;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.07em;
  border-radius: 999px;
  padding: 2px 10px;
  text-transform: uppercase;
  box-shadow: 0 1px 4px #fff6e0a6;
  border: 1.5px solid #ffedd5;
  margin-top: 1px;
}

.mark-read-btn {
  background: linear-gradient(90deg, #ffb769 0%, #ff7b54 100%);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  border-radius: 999px;
  padding: 6px 20px;
  border: none;
  outline: none;
  transition: background 0.14s;
  box-shadow: 0 1px 6px #fdba7422;
  margin-top: 3px;
  margin-bottom: 2px;
}
.mark-read-btn:active, .mark-read-btn:focus {
  background: #fb923c;
}

.read-badge {
  background: #e7ffe9;
  color: #14b85a;
  font-size: 13px;
  border-radius: 999px;
  padding: 5px 16px;
  border: 1.5px solid #c2ffd7;
  font-weight: 700;
  margin-top: 3px;
  margin-bottom: 2px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.18s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
