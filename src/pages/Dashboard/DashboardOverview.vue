
<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <div class="grid grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" :value="summary?.total_revenue" icon="💰" />
        <StatsCard title="Total Orders" :value="summary?.order_count" icon="🧾" />
        <StatsCard title="Total Clients" :value="clients?.length" icon="👥" />
        <StatsCard title="Total Menus" :value="menus?.length" icon="🍽️" />
      </div>

      <BarChart :data="chartData" />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/Common/AppLayout.vue'
import StatsCard from '@/components/Dashboard/StatsCard.vue'
import BarChart from '@/components/Dashboard/BarChart.vue'
import useDashboard from '@/composables/useDashboard'

const { summary, clients, menus, chartData, loadDashboard } = useDashboard()

onMounted(() => {
  loadDashboard()
})
</script>
