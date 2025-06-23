<template>
  <MainLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ $t('order.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">{{ $t('order.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <input v-model="filter.from" type="date" class="input" />
          <input v-model="filter.to" type="date" class="input" />
          <select v-model="filter.status" class="input">
            <option value="all">{{ $t('order.status.all') }}</option>
            <option value="pending">{{ $t('order.status.pending') }}</option>
            <option value="completed">{{ $t('order.status.completed') }}</option>
            <option value="cancelled">{{ $t('order.status.cancelled') }}</option>
          </select>
          <select v-model="filter.format" class="input">
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            @click="downloadReport"
            class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-full shadow-sm text-sm transition"
          >
            {{ $t('order.download') }}
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        {{ $t('order.showing') }}
        <strong class="text-purple-700 dark:text-purple-400">{{ filteredOrders.length }}</strong>
        {{ $t('order.orders') }}
      </div>

      <!-- Table -->
      <div class="overflow-y-auto max-h-[480px] rounded-xl shadow no-scrollbar">
        <table class="w-full text-sm text-left bg-white dark:bg-gray-800">
          <thead class="bg-gray-100 dark:bg-gray-700 sticky top-0 text-xs text-gray-700 dark:text-gray-300 font-semibold uppercase border-b dark:border-gray-600">
            <tr>
              <th class="px-4 py-3">{{ $t('order.code') }}</th>
              <th class="px-4 py-3">{{ $t('order.user') }}</th>
              <th class="px-4 py-3">{{ $t('order.discount') }}</th>
              <th class="px-4 py-3">{{ $t('order.promo') }}</th>
              <th class="px-4 py-3">{{ $t('order.payment') }}</th>
              <th class="px-4 py-3">{{ $t('order.total') }}</th>
              <th class="px-4 py-3">{{ $t('order.status.all') }}</th>
              <th class="px-4 py-3">{{ $t('order.date') }}</th>
              <th class="px-4 py-3">{{ $t('order.action') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{{ order.order_code }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ order.user?.name }}</td>
              <td class="px-4 py-3 text-green-600 font-semibold">${{ format(order.discount_amount) }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ order.discount?.code || '—' }}</td>
              <td class="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">{{ order.payment_method || '—' }}</td>
              <td class="px-4 py-3 font-bold text-gray-900 dark:text-white">${{ format(order.total_amount) }}</td>
              <td class="px-4 py-3">
                <select
                  v-model="order.status"
                  @change="updateStatus(order)"
                  :class="[
                    'rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition',
                    order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : order.status === 'completed'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                  ]"
                >
                  <option value="pending">{{ $t('order.status.pending') }}</option>
                  <option value="completed">{{ $t('order.status.completed') }}</option>
                  <option value="cancelled">{{ $t('order.status.cancelled') }}</option>
                </select>
              </td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ formatDate(order.created_at) }}</td>
              <td class="px-4 py-3">
                <RouterLink
                  :to="`/orders/${order.id}`"
                  class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-700 font-medium rounded-full text-xs transition"
                >
                  {{ $t('order.view') }}
                </RouterLink>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="9" class="text-center text-gray-400 dark:text-gray-500 py-6">
                {{ $t('order.no_orders') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'
import MainLayout from '@/components/Common/AppLayout.vue'
import { createToastInterface } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toast = createToastInterface()


const orders = ref([])

const filter = ref({
  from: '',
  to: '',
  status: 'all',
  format: 'csv',
})

onMounted(fetchOrders)

async function fetchOrders() {
  const res = await api.get('/orders')
  orders.value = res.data
}

function format(n) {
  return parseFloat(n).toFixed(2)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB')
}

const filteredOrders = computed(() => {
  return orders.value
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter(order => {
      const date = new Date(order.created_at)
      const from = filter.value.from ? new Date(filter.value.from) : null
      const to = filter.value.to ? new Date(filter.value.to) : null
      const statusMatch = filter.value.status === 'all' || order.status === filter.value.status
      const dateMatch = (!from || date >= from) && (!to || date <= to)
      return statusMatch && dateMatch
    })
})

async function updateStatus(order) {
  try {
    await api.put(`/orders/${order.id}`, { status: order.status })
    toast.success(t('order.toast.update_success'))
  } catch (err) {
    console.error(err)
    toast.error(t('order.toast.update_error'))
  }
}

async function downloadReport() {
  const query = new URLSearchParams()
  if (filter.value.from) query.append('from', filter.value.from)
  if (filter.value.to) query.append('to', filter.value.to)
  if (filter.value.status !== 'all') query.append('status', filter.value.status)
  if (filter.value.format) query.append('format', filter.value.format)

  try {
    const res = await api.get(`/orders/export?${query.toString()}`, { responseType: 'blob' })
    const type = res.headers['content-type']
    const ext =
      filter.value.format === 'pdf'
        ? 'pdf'
        : filter.value.format === 'excel'
        ? 'xlsx'
        : 'csv'
    const blob = new Blob([res.data], { type })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `order_report.${ext}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(t('order.toast.export_success'))
  } catch (err) {
    toast.error(t('order.toast.export_error'))
    console.error(err)
  }
}
</script>

<style scoped>
.input {
  @apply border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
