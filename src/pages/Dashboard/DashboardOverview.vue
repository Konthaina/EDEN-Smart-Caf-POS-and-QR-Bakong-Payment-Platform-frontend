<template>
  <MainLayout>
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div class="flex justify-between items-center">  
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ t("dashboard.title") }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">{{ t("dashboard.subtitle") }}</p>
        </div>
          <button
            @click="logout"
            class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded-full font-medium shadow transition"
          >
            <span>{{ $t('common.logout') }}</span>
            <LogOut class="w-4 h-4" />
          </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard :title="$t('dashboard.total_sales')" :value="formattedRevenue" icon="💵" color="green" />
        <StatsCard :title="$t('dashboard.total_orders')" :value="summary.order_count.toFixed(0)" icon="📦" color="blue" />
        <StatsCard :title="$t('dashboard.total_customers')" :value="totalCustomers.toFixed(0)" icon="👥" color="indigo" />
        <StatsCard :title="$t('dashboard.top_item')" :value="topItem" icon="🍽️" color="purple" />
      </div>

      <!-- Chart Section -->
      <div class="space-y-6 rounded-xl">
        <div v-if="topItemLabels.length && topItemValues.some(v => v > 0)">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DonutChart :labels="topItemLabels" :values="topItemValues" />
            <BarChart :labels="topItemLabels" :values="topItemValues" />
          </div>
        </div>

        <!-- No Data Message -->
        <p v-else class="text-center text-gray-500 text-sm mt-4">
          {{ $t('dashboard.no_data') }}
        </p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/plugins/axios'
import { LogOut } from 'lucide-vue-next'

import MainLayout from '@/components/Common/AppLayout.vue'
import StatsCard from '@/components/Dashboard/StatsCard.vue'
import BarChart from '@/components/Dashboard/BarChart.vue'
import DonutChart from '@/components/Dashboard/DonutChart.vue'

const { t } = useI18n()
const router = useRouter()

const logout = async () => {
  try {
    await api.post('/logout')
    localStorage.removeItem('token')
    router.push('/login')
  } catch (err) {
    console.error('Logout failed:', err)
  }
}

const summary = ref({
  total_revenue: 0,
  order_count: 0,
  date: ''
})

const stats = ref([])
const totalCustomers = ref(0)
const topItem = ref('N/A')
const topItemLabels = ref([])
const topItemValues = ref([])

const formattedRevenue = computed(() => {
  return `${Number(summary.value.total_revenue).toFixed(2)} USD`
})

onMounted(async () => {
  try {
    const [res1, res2, res3, res4] = await Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/stats'),
      api.get('/users/view'),
      api.get('/reports/top-items')
    ])

    summary.value = res1.data
    stats.value = Array.isArray(res2.data)
      ? res2.data.map(item => ({
          date: item.date ?? 'Unknown',
          total_revenue: item.total_revenue ?? 0
        }))
      : []

    totalCustomers.value = res3.data.filter(user => user.role_id === 4).length
    topItem.value = res4.data[0]?.name ?? 'N/A'
    topItemLabels.value = Array.isArray(res4.data) ? res4.data.map(item => item.name) : []
    topItemValues.value = Array.isArray(res4.data) ? res4.data.map(item => item.total_orders ?? 0) : []
  } catch (err) {
    console.error('Dashboard load error:', err)
  }
})
</script>
