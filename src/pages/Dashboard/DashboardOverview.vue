<template>
  <MainLayout>
    <!-- PAGE SHELL (fixed viewport height + invisible inner scroll) -->
    <div class="h-[100vh] flex flex-col min-h-0">
      <div class="px-2 sm:px-4 md:px-6 pt-6 pb-6 flex-1 overflow-y-auto no-scrollbar">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              {{ $t('dashboard.title') }}
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-300 mt-2">
              {{ $t('dashboard.subtitle') }}
            </p>
          </div>

          <!-- Right cluster: Exchange Rate quick control + Logout -->
          <div class="flex items-center gap-2">
            <ExchangeRateQuick />
            <button @click="showLogoutConfirm = true"
              class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium shadow transition w-full sm:w-auto justify-center">
              <span>{{ $t('common.logout') }}</span>
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="dashboard-stats-grid mt-6">
          <StatsCard :title="$t('dashboard.total_sales')" :value="formattedRevenue" :icon="DollarSign" color="green"
            :to="{ name: 'DashboardRevenueDetail', query: { period: 'today' } }" />

          <StatsCard :title="$t('dashboard.total_orders')" :value="Number(summary.order_count || 0).toFixed(0)"
            :icon="Package" color="blue" :to="{ name: 'DashboardOrdersDetail', query: { period: 'today' } }" />

          <StatsCard :title="$t('dashboard.total_customers')" :value="Number(totalCustomers).toFixed(0)" :icon="Users"
            color="indigo" :to="{ name: 'DashboardCustomersDetail', query: { period: 'today' } }" />

          <StatsCard :title="$t('dashboard.top_item')" :value="topItem" :icon="Utensils" color="purple"
            :to="{ name: 'DashboardTopItemsDetail', query: { period: 'month' } }" />
        </div>

        <!-- MIDDLE ROW (between stats & charts) -->
        <div class="dashboard-quick-grid mt-6">
          <LowStockTable :limit="5" />
          <PendingOrdersTable :limit="6" />
        </div>

        <!-- Charts -->
        <div class="dashboard-chart-grid mt-8">
          <div
            class="dashboard-chart-card bg-white dark:bg-[#181f35] border border-gray-100 dark:border-[#26335A] shadow">
            <DonutChart :labels="topItemLabels" :values="topItemValues" />
          </div>
          <div
            class="dashboard-chart-card bg-white dark:bg-[#181f35] border border-gray-100 dark:border-[#26335A] shadow">
            <BarChart :labels="topItemLabels" :values="topItemValues" />
          </div>
        </div>

        <p v-if="!topItemLabels.length || !topItemValues.some((v) => v > 0)"
          class="text-center text-gray-500 text-sm mt-4">
          {{ $t('dashboard.no_data') }}
        </p>
      </div>
    </div>

    <ConfirmModal
      :show="showLogoutConfirm"
      :title="$t('common.logout_confirm_title') || 'Confirm Logout'"
      :message="$t('common.logout_confirm_message') || 'Are you sure you want to log out?'"
      :confirm-text="$t('common.logout') || 'Logout'"
      :cancel-text="$t('common.cancel') || 'Cancel'"
      @confirm="confirmLogout"
      @cancel="showLogoutConfirm = false"
    />
  </MainLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/store/dashboard'
import api from '@/plugins/axios'
import { DollarSign, LogOut, Package, Users, Utensils } from 'lucide-vue-next'

import MainLayout from '@/components/Common/AppLayout.vue'
import ConfirmModal from '@/components/Common/ConfirmModal.vue'
import StatsCard from '@/components/Dashboard/StatsCard.vue'
import BarChart from '@/components/Dashboard/BarChart.vue'
import DonutChart from '@/components/Dashboard/DonutChart.vue'
import ExchangeRateQuick from '@/components/Dashboard/ExchangeRateQuick.vue'  // << NEW

/* Middle row widgets */
import LowStockTable from '@/components/Dashboard/LowStockTable.vue'
import PendingOrdersTable from '@/components/Dashboard/PendingOrdersTable.vue'

const { t } = useI18n()
const router = useRouter()
const dashboard = useDashboardStore()
const showLogoutConfirm = ref(false)

const logout = async () => {
  try {
    await api.post('/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    router.push('/login')
  } catch (err) {
    console.error('Logout failed:', err)
  }
}

const confirmLogout = async () => {
  showLogoutConfirm.value = false
  await logout()
}

onMounted(async () => {
  await dashboard.loadDashboard()
})

const summary = computed(() => dashboard.summary || {})
const totalCustomers = computed(() => dashboard.clients?.length || 0)
const formattedRevenue = computed(() => `${Number(summary.value.total_revenue || 0).toFixed(2)} USD`)
const topItem = computed(() => dashboard.topItems?.[0]?.name || 'N/A')
const topItemLabels = computed(() => (dashboard.topItems || []).map((item) => item.name))
const topItemValues = computed(() => (dashboard.topItems || []).map((item) => item.total_orders ?? 0))
</script>

<style scoped>
/* (unchanged styles) */
.dashboard-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem
}

@media (min-width:640px) {
  .dashboard-stats-grid {
    grid-template-columns: repeat(2, 1fr)
  }
}

@media (min-width:1024px) {
  .dashboard-stats-grid {
    grid-template-columns: repeat(4, 1fr)
  }
}

.dashboard-quick-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem
}

@media (min-width:1024px) {
  .dashboard-quick-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem
  }
}

.dashboard-chart-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem
}

@media (min-width:1024px) {
  .dashboard-chart-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: stretch
  }
}

.dashboard-chart-card {
  height: 100%;
  min-height: 350px;
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center
}

.no-scrollbar::-webkit-scrollbar {
  display: none
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none
}
</style>
