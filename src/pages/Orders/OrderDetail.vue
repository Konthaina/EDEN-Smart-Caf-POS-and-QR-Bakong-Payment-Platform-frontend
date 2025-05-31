<template>
  <AppLayout>
    <div class="p-6 space-y-8 print:p-0 print:bg-white print:w-full print-area">
      <!-- Screen Header -->
      <div class="flex justify-between items-center print:hidden">
        <h1 class="text-2xl font-bold text-gray-800">🧾 {{ $t('order.detail.title') }}</h1>
        <div class="flex items-center gap-4">
          <button @click="printReceipt" class="text-sm text-green-600 hover:underline">🖨️ {{ $t('order.detail.print') }}</button>
          <button @click="$router.back()" class="text-sm text-purple-600 hover:underline">← {{ $t('order.detail.back') }}</button>
        </div>
      </div>

      <!-- Printable Receipt -->
      <div v-if="order" class="hidden print:block font-mono text-sm text-black print-area">
        <div>
          <p class="text-center font-bold text-lg">Cafe Eden</p>
          <p class="text-center text-xs mb-2">{{ formatDate(order.created_at) }}</p>
          <p>-------------------------------</p>

          <div
            v-for="item in order.order_items"
            :key="item.id"
            class="flex justify-between whitespace-nowrap text-sm"
          >
            <span class="w-[120px]">{{ item.menu_item?.name || '-' }}</span>
            <span>x{{ item.quantity }}</span>
            <span>${{ format(item.price * item.quantity) }}</span>
          </div>

          <p>-------------------------------</p>
          <div class="flex justify-between">
            <span>{{ $t('order.detail.subtotal') }}</span>
            <span>${{ format(order.total_amount + order.discount_amount) }}</span>
          </div>
          <div v-if="order.discount_amount > 0" class="flex justify-between">
            <span>{{ $t('order.detail.discount') }}</span>
            <span>- ${{ format(order.discount_amount) }}</span>
          </div>
          <div class="flex justify-between font-bold">
            <span>{{ $t('order.detail.total') }}</span>
            <span>${{ format(order.total_amount) }}</span>
          </div>
          <div class="flex justify-between mt-1">
            <span>{{ $t('order.detail.payment') }}</span>
            <span>{{ capitalize(order.payment_method) }}</span>
          </div>
          <p>-------------------------------</p>
          <p class="text-center text-xs mt-2">{{ $t('order.detail.thanks') }}</p>
          <p class="text-center text-xs">{{ $t('order.detail.printed') }} {{ formatDate(new Date()) }}</p>
        </div>
      </div>

      <!-- Screen View -->
      <div v-if="order" class="print:hidden space-y-4">
        <div class="bg-white p-4 rounded-xl shadow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div><span class="text-gray-500">{{ $t('order.code') }}:</span> {{ order.order_code }}</div>
          <div><span class="text-gray-500">{{ $t('order.user') }}:</span> {{ order.user?.name }}</div>
          <div><span class="text-gray-500">{{ $t('order.status.all') }}:</span> <span class="capitalize">{{ order.status }}</span></div>
          <div><span class="text-gray-500">{{ $t('order.date') }}:</span> {{ formatDate(order.created_at) }}</div>
          <div><span class="text-gray-500">{{ $t('order.discount') }}:</span> ${{ format(order.discount_amount) }}</div>
          <div><span class="text-gray-500">{{ $t('order.promo') }}:</span> {{ order.promo_code || '-' }}</div>
          <div><span class="text-gray-500">{{ $t('order.payment') }}:</span> {{ capitalize(order.payment_method) }}</div>
          <div><span class="text-gray-500">{{ $t('order.total') }}:</span> <b>${{ format(order.total_amount) }}</b></div>
        </div>

        <div class="bg-white rounded-xl shadow overflow-hidden">
          <table class="w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-100 text-left text-gray-600">
              <tr>
                <th class="px-6 py-3 font-semibold">{{ $t('order.item') }}</th>
                <th class="px-6 py-3 font-semibold">{{ $t('order.qty') }}</th>
                <th class="px-6 py-3 font-semibold">{{ $t('order.price') }}</th>
                <th class="px-6 py-3 font-semibold">{{ $t('order.subtotal') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="item in order.order_items" :key="item.id">
                <td class="px-6 py-3">{{ item.menu_item?.name || '-' }}</td>
                <td class="px-6 py-3">{{ item.quantity }}</td>
                <td class="px-6 py-3">${{ format(item.price) }}</td>
                <td class="px-6 py-3 font-medium">${{ format(item.quantity * item.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="text-gray-500 text-sm">{{ $t('order.detail.loading') }}</div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios'
import AppLayout from '@/components/Common/AppLayout.vue'

const route = useRoute()
const orderId = route.params.id
const order = ref(null)

const fetchOrder = async () => {
  const res = await api.get(`/orders/${orderId}`)
  order.value = res.data
}

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

const format = (num) => parseFloat(num).toFixed(2)
const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1)
const printReceipt = () => window.print()

onMounted(fetchOrder)
</script>

<style scoped>
@media print {
  .print\:hidden {
    display: none !important;
  }

  .print\:block {
    display: block !important;
  }

  html, body {
    background: white !important;
    margin: 0;
    padding: 0;
    font-size: 12px !important;
    font-family: monospace !important;
    width: 100% !important;
    height: auto !important;
  }

  body * {
    visibility: hidden;
  }

  .print-area, .print-area * {
    visibility: visible !important;
  }

  .print-area {
    width: 280px;
    margin: 0 auto;
    padding: 4px 12px;
    box-sizing: border-box;
  }

  @page {
    size: 80mm auto;
    margin: 0;
  }
}
</style>
