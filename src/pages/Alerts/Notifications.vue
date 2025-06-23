<template>
  <Applayout>
    <div class="py-10 px-2">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-3 mb-8">
          <div class="text-3xl">🔔</div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            {{ $t('notifications.title') }}
          </h1>
        </div>

        <!-- Low Stock Alerts -->
        <div v-if="lowStock.length" class="mb-10">
          <!-- <div class="flex items-center gap-2 mb-4">
            <div class="text-xl">⚠️</div>
            <h2 class="text-lg font-bold text-red-700 dark:text-red-300 tracking-tight">
              {{ $t('notifications.low_stock_alerts') }}
            </h2>
          </div> -->
          <div class="divide-y divide-orange-200 dark:divide-orange-800/30">
            <div
              v-for="item in lowStock"
              :key="item.ingredient"
              class="group flex items-center justify-between mb-0 p-4 rounded-xl bg-gradient-to-tr from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 shadow-sm transition-all duration-150 hover:shadow-lg hover:scale-[1.025] border border-orange-100 dark:border-orange-800/50 mt-4 first:mt-0"
            >
              <div>
                <div class="font-bold text-red-700 dark:text-red-200 text-base mb-1">
                  {{ item.ingredient }}
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-2 gap-y-1">
                  <span>
                    {{ $t('notifications.current_stock') }}:
                    <span class="font-semibold">{{ item.current_stock }}</span>
                  </span>
                  <template v-if="item.current_stock == 0">
                    · <span class="font-bold text-red-600 dark:text-red-300">{{ $t('notifications.out_of_stock') }}</span>
                  </template>
                  <template v-else>
                    <span v-if="item.days_left">
                      · {{ $t('notifications.estimated_days_left') }}
                      <span class="font-semibold">{{ Math.round(item.days_left) }}</span>
                    </span>
                    <span v-if="item.daily_used">
                      · {{ $t('notifications.used_per_day') }}
                      <span class="font-semibold">{{ Number(item.daily_used).toFixed(2) }}</span>
                    </span>
                  </template>
                </div>
              </div>
              <span
                v-if="item.current_stock == 0"
                class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-700 text-white dark:bg-red-900 shadow animate-bounce"
              >
                <svg class="h-3 w-3 mr-1 fill-white dark:fill-red-200" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"/></svg>
                {{ $t('notifications.out_of_stock') }}
              </span>
              <span
                v-else
                class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100 shadow-sm group-hover:bg-orange-200 group-hover:text-orange-900 transition"
              >
                <svg class="h-3 w-3 mr-1 fill-orange-400 dark:fill-orange-200" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"/></svg>
                {{ $t('notifications.low') }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="!loading && !lowStock.length"
          class="flex flex-col items-center gap-2 py-10 text-gray-500 dark:text-gray-300"
        >
          <div class="text-4xl">🥳</div>
          <div class="font-semibold text-lg">
            {{ $t('notifications.all_caught_up') }}
          </div>
          <div class="text-xs">
            {{ $t('notifications.no_notifications') }}
          </div>
        </div>

        <div v-if="loading" class="text-center py-12 text-gray-400">
          <span class="animate-pulse">{{ $t('notifications.loading') }}</span>
        </div>
      </div>
    </div>
  </Applayout>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import Applayout from '@/components/common/Applayout.vue'
import { useNotificationCount } from '@/composables/useNotificationCount'
const { fetchNotificationCount } = useNotificationCount()

fetchNotificationCount()

const lowStock = ref([])
const loading = ref(true)

const fetchNotifications = async () => {
  loading.value = true
  try {
    const lowStockRes = await axios.get('http://localhost:5002/ai/inventory-stockout')
    lowStock.value = lowStockRes.data
  } catch (e) {
    // Optionally: handle error silently or show nothing
  } finally {
    loading.value = false
  }
}

fetchNotifications()
</script>

<style scoped>
.bg-gradient-to-br {
  min-height: 100vh;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
@media (max-width: 600px) {
  .max-w-2xl {
    max-width: 100%;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
