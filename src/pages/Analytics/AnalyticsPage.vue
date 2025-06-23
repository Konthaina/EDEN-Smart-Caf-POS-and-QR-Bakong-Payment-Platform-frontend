<template>
  <Applayout>
    <div class="px-6 py-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ $t('analysis.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">{{ $t('analysis.subtitle') }}</p>
        </div>
        <button
          @click="fetchAll"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          {{ $t('analysis.refresh') }}
        </button>
      </div>

      <div class="flex flex-col gap-10 text-sm text-gray-700 dark:text-gray-300">
        <!-- Sales Trend & Forecast -->
        <div class="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-semibold mb-4 tracking-tight flex items-center gap-2">
            <span>📈 {{ $t('analysis.sales_trend') }}</span>
            <span class="ml-2 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-600 dark:bg-blue-700/40 dark:text-blue-200">{{ $t('analysis.ai') }}</span>
          </h2>
          <canvas
            ref="salesChart"
            class="w-full max-w-full rounded-xl bg-transparent shadow-none border-0"
          ></canvas>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Top Sellers -->
          <div class="bg-white dark:bg-gray-800/90 rounded-2xl shadow p-7 overflow-x-auto min-w-[320px]">
            <h2 class="text-xl font-bold mb-3 text-indigo-700 dark:text-indigo-200">🏆 {{ $t('analysis.top_menu_items') }}</h2>
            <table class="w-full text-base rounded-xl overflow-hidden min-w-[320px]">
              <thead>
                <tr class="bg-indigo-100 dark:bg-indigo-900/60">
                  <th class="text-left py-3 px-3 w-3/4 font-semibold">{{ $t('analysis.menu_item') }}</th>
                  <th class="text-right py-3 px-3 w-1/4 font-semibold">{{ $t('analysis.sold') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in topSellers" :key="item.name"
                  :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-700/40'">
                  <td class="py-2 px-3 w-3/4">{{ item.name }}</td>
                  <td class="text-right py-2 px-3 w-1/4 font-semibold text-green-600 dark:text-green-400">{{ item.sold }}</td>
                </tr>
                <tr v-if="!Array.isArray(topSellers) || !topSellers.length">
                  <td colspan="2" class="text-center text-gray-400 py-7">{{ $t('analysis.no_data') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Peak Hours -->
          <div class="bg-white dark:bg-gray-800/90 rounded-2xl shadow p-7 overflow-x-auto min-w-[320px]">
            <h2 class="text-xl font-bold mb-3 text-pink-600 dark:text-pink-200">⏰ {{ $t('analysis.peak_hours') }}</h2>
            <canvas ref="peakChart" class="w-full"></canvas>
          </div>
        </div>
        <!-- Inventory Stockout -->
        <div class="bg-white dark:bg-gray-800/90 rounded-2xl shadow p-7 overflow-x-auto min-w-[320px]">
          <h2 class="text-xl font-bold mb-4 text-yellow-700 dark:text-yellow-200 flex items-center gap-2">
            <span>⚠️ {{ $t('analysis.low_stock_risk') }}</span>
            <span class="ml-2 px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-200">{{ $t('analysis.auto_detected') }}</span>
          </h2>
          <table class="w-full text-base rounded-xl overflow-hidden min-w-[320px] table-fixed">
            <thead>
              <tr class="bg-yellow-100 dark:bg-yellow-900/60">
                <th class="text-left py-3 px-3 w-2/6 font-semibold align-middle">{{ $t('analysis.ingredient') }}</th>
                <th class="text-right py-3 px-3 w-1/6 font-semibold align-middle">{{ $t('analysis.stock_left') }}</th>
                <th class="text-right py-3 px-3 w-1/6 font-semibold align-middle">{{ $t('analysis.used/perday') }}</th>
                <th class="text-right py-3 px-3 w-2/6 font-semibold align-middle">{{ $t('analysis.days_left') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in stockout"
                :key="item.ingredient"
                :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-700/40'"
              >
                <td class="py-2 gap-2 items-center w-2/6 align-middle">
                  <span class="px-2">{{ item.ingredient }}</span>
                  <span
                    v-if="item.days_left < 2"
                    class="px-2 py-0.5 rounded bg-red-200 text-xs font-semibold text-red-700 dark:bg-red-500/40 dark:text-red-200"
                  >{{ $t('analysis.critical') }}</span>
                  <span
                    v-else-if="item.days_left < 5"
                    class="ml-2 px-2 py-0.5 rounded bg-yellow-200 text-xs font-semibold text-yellow-800 dark:bg-yellow-500/40 dark:text-yellow-200"
                  >{{ $t('analysis.warning') }}</span>
                </td>
                <td class="text-right py-2 px-3 w-1/6 align-middle">
                  {{ Number(item.current_stock).toLocaleString() }}
                </td>
                <td class="text-right py-2 px-3 w-1/6 align-middle">
                  <span>
                    {{ item.daily_used ? Number(item.daily_used).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-' }}
                  </span>
                </td>
                <td class="text-right py-2 px-3 w-2/6 align-middle">
                  <span
                    :class="item.days_left < 2 ? 'text-red-600 dark:text-red-400 font-bold' : item.days_left < 5 ? 'text-yellow-700 dark:text-yellow-200 font-bold' : ''"
                  >
                    {{ item.days_left !== null ? item.days_left.toFixed(1) : '-' }}
                  </span>
                </td>
              </tr>
              <tr v-if="!Array.isArray(stockout) || !stockout.length">
                <td colspan="4" class="text-center text-gray-400 py-7 align-middle">
                  {{ $t('analysis.no_low_stock') }}
                </td>
              </tr>
            </tbody>

          </table>
        </div>
        <!-- Menu Recommendation -->
        <div class="bg-white dark:bg-gray-800/90 rounded-2xl shadow p-7 overflow-x-auto min-w-[320px]">
          <h2 class="text-xl font-bold mb-4 text-green-700 dark:text-green-200">🤝 {{ $t('analysis.frequently_bought') }}</h2>
          <table class="w-full text-base rounded-xl overflow-hidden min-w-[320px] table-fixed">
            <thead>
              <tr class="bg-green-100 dark:bg-green-900/60">
                <th class="py-3 px-3 w-2/5 text-left align-middle">{{ $t('analysis.buy_id') }}</th>
                <th class="py-3 px-3 w-2/5 text-left align-middle">{{ $t('analysis.recommend_id') }}</th>
                <th class="py-3 px-3 w-1/5 text-right align-middle">{{ $t('analysis.support') }}</th>
                <th class="py-3 px-3 w-1/5 text-right align-middle">{{ $t('analysis.confidence') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rule, i) in rules" :key="rule.item_from + '-' + rule.item_to"
                  :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-700/40'">
                <td class="py-2 px-3 w-2/5 text-left align-middle">{{ rule.item_from_name || '#' + rule.item_from }}</td>
                <td class="py-2 px-3 w-2/5 text-left align-middle">{{ rule.item_to_name || '#' + rule.item_to }}</td>
                <td class="py-2 px-3 w-1/5 text-right align-middle">{{ (rule.support * 100).toFixed(1) }}%</td>
                <td class="py-2 px-3 w-1/5 text-right align-middle">{{ (rule.confidence * 100).toFixed(1) }}%</td>
              </tr>
              <tr v-if="!rules.length">
                <td colspan="4" class="text-center text-gray-400 py-7 align-middle">{{ $t('analysis.no_recommendations') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Promotion & Customer Leaderboard -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Promotion Effectiveness -->
          <div class="bg-white dark:bg-gray-800/90 rounded-2xl shadow p-7 overflow-x-auto min-w-[320px]">
            <h2 class="text-xl font-bold mb-3 text-cyan-700 dark:text-cyan-200">🎟️ {{ $t('analysis.promotion_effect') }}</h2>
            <table class="w-full text-base rounded-xl overflow-hidden min-w-[320px] table-fixed">
              <thead>
                <tr class="bg-cyan-100 dark:bg-cyan-900/60">
                  <th class="py-3 px-3 w-2/5 text-left align-middle">{{ $t('analysis.promo_code') }}</th>
                  <th class="py-3 px-3 w-1/5 text-center align-middle">{{ $t('analysis.orders') }}</th>
                  <th class="py-3 px-3 w-2/5 text-right align-middle">{{ $t('analysis.sales') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(promo, i) in promotions"
                  :key="promo.code"
                  :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-700/40'"
                >
                  <td class="py-2 px-3 w-2/5 text-left align-middle">{{ promo.code }}</td>
                  <td class="py-2 px-3 w-1/5 text-center align-middle">{{ promo.used }}</td>
                  <td class="py-2 px-3 w-2/5 text-right align-middle">{{ Number(promo.total).toLocaleString() }}</td>
                </tr>
                <tr v-if="!promotions.length">
                  <td colspan="3" class="text-center text-gray-400 py-7 align-middle">{{ $t('analysis.no_promotions') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Top Customers -->
          <div class="bg-white dark:bg-gray-800/90 rounded-2xl shadow p-7 overflow-x-auto min-w-[320px]">
            <h2 class="text-xl font-bold mb-3 text-pink-700 dark:text-pink-200">👑 {{ $t('analysis.top_customers') }}</h2>
            <table class="w-full text-base rounded-xl overflow-hidden min-w-[320px] table-fixed">
              <thead>
                <tr class="bg-pink-100 dark:bg-pink-900/60">
                  <th class="py-3 px-3 w-2/5 text-left align-middle">{{ $t('analysis.customer') }}</th>
                  <th class="py-3 px-3 w-1/5 text-center align-middle">{{ $t('analysis.orders') }}</th>
                  <th class="py-3 px-3 w-2/5 text-right align-middle">{{ $t('analysis.spent') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(c, i) in leaderboard"
                  :key="c.name"
                  :class="i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-700/40'"
                >
                  <td class="py-2 px-3 w-2/5 text-left align-middle">{{ c.name }}</td>
                  <td class="py-2 px-3 w-1/5 text-center align-middle">{{ c.orders }}</td>
                  <td class="py-2 px-3 w-2/5 text-right align-middle">${{ Number(c.spent).toLocaleString() }}</td>
                </tr>
                <tr v-if="!leaderboard.length">
                  <td colspan="3" class="text-center text-gray-400 py-7 align-middle">{{ $t('analysis.no_data') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </Applayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Applayout from '@/components/common/Applayout.vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const salesChart = ref(null)
const peakChart = ref(null)
const salesChartInstance = ref(null)
const peakChartInstance = ref(null)

const topSellers = ref([])
const stockout = ref([])
const rules = ref([])
const promotions = ref([])
const leaderboard = ref([])

const drawSalesChart = (history, forecast) => {
  if (!salesChart.value) return

  if (salesChartInstance.value) {
    salesChartInstance.value.destroy()
    salesChartInstance.value = null
  }

  if (!history.length && !forecast.length) return

  const labels = [
    ...history.map(d => d.date || d.day),
    ...forecast.map(f => f.date)
  ]
  const actual = [
    ...history.map(d => d.total !== undefined ? d.total : d.total_sales),
    ...Array(forecast.length).fill(null)
  ]
  const predicted = [
    ...Array(history.length).fill(null),
    ...forecast.map(f => f.predicted_total)
  ]

  salesChartInstance.value = new Chart(salesChart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Actual Sales',
          data: actual,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96,165,250,0.1)',
          borderWidth: 3,
          tension: 0.4,
        },
        {
          label: 'Forecast',
          data: predicted,
          borderColor: '#f59e42',
          borderDash: [6, 6],
          backgroundColor: 'rgba(245,158,66,0.15)',
          borderWidth: 3,
          tension: 0.4,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  })
}

const drawPeakChart = (peaks) => {
  if (!peakChart.value) return

  if (peakChartInstance.value) {
    peakChartInstance.value.destroy()
    peakChartInstance.value = null
  }

  if (!Array.isArray(peaks) || !peaks.length) return

  const hours = Array.from({length: 24}, (_, i) => i)
  const salesPerHour = hours.map(h => {
    const found = peaks.find(x => parseInt(x.hour) === h)
    return found ? Number(found.sales) : 0
  })
  peakChartInstance.value = new Chart(peakChart.value, {
    type: 'bar',
    data: {
      labels: hours.map(h => h + ':00'),
      datasets: [{
        label: 'Sales',
        data: salesPerHour,
        backgroundColor: '#34d399',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  })
}

const fetchAll = async () => {
  const f1 = fetch('http://localhost:5002/ai/sales-forecast').then(r => r.json()).catch(() => ({}))
  const f2 = fetch('http://localhost:5002/ai/top-sellers').then(r => r.json()).catch(() => [])
  const f3 = fetch('http://localhost:5002/ai/peak-hours').then(r => r.json()).catch(() => [])
  const f4 = fetch('http://localhost:5002/ai/inventory-stockout').then(r => r.json()).catch(() => [])
  const f5 = fetch('http://localhost:5002/ai/menu-recommend').then(r => r.json()).catch(() => [])
  const f6 = fetch('http://localhost:5002/ai/promotion-effect').then(r => r.json()).catch(() => [])
  const f7 = fetch('http://localhost:5002/ai/customer-leaderboard').then(r => r.json()).catch(() => [])

  const [trend, sellers, peaks, stock, recs, promos, board] = await Promise.all([f1, f2, f3, f4, f5, f6, f7])

  if (trend && trend.history && trend.forecast) drawSalesChart(trend.history, trend.forecast)
  else drawSalesChart([], [])
  if (Array.isArray(peaks)) drawPeakChart(peaks)
  else drawPeakChart([])

  topSellers.value = sellers || []
  stockout.value = stock || []
  rules.value = recs || []
  promotions.value = promos || []
  leaderboard.value = board || []
}

onMounted(fetchAll)
</script>
