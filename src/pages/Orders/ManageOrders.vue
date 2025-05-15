<template>
  <MainLayout>
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Order Management</h1>
        <div class="flex items-center gap-2">
          <input v-model="filter.from" type="date" class="border rounded px-2 py-1" />
          <input v-model="filter.to" type="date" class="border rounded px-2 py-1" />
          <select v-model="filter.status" class="border rounded px-2 py-1">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select v-model="filter.format" class="border rounded px-2 py-1">
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
          <button @click="downloadReport" class="bg-purple-600 text-white px-4 py-2 rounded">
            Download Report
          </button>
        </div>
      </div>

      <div class="text-sm text-gray-600">Total Orders: <strong>{{ filteredOrders.length }}</strong></div>

      <div class="overflow-y-auto max-h-[500px] hide-scrollbar">
        <table class="w-full text-sm border-collapse mt-4">
          <thead class="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th class="px-3 py-2">
                <input type="checkbox" v-model="selectAll" @change="toggleAll" />
              </th>
              <th class="px-3 py-2">Order Code</th>
              <th class="px-3 py-2">User ID</th>
              <th class="px-3 py-2">Discount</th>
              <th class="px-3 py-2">Promo</th>
              <th class="px-3 py-2">Payment Type</th>
              <th class="px-3 py-2">Total Amt</th>
              <th class="px-3 py-2">Status</th>
              <th class="px-3 py-2">Date</th>
              <th class="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" class="border-b hover:bg-gray-50">
              <td class="px-3 py-2">
                <input type="checkbox" v-model="selectedIds" :value="order.id" />
              </td>
              <td class="px-3 py-2 font-semibold text-gray-800">{{ order.order_code }}</td>
              <td class="px-3 py-2">{{ order.user_id }}</td>
              <td class="px-3 py-2">${{ format(order.discount_amount) }}</td>
              <td class="px-3 py-2">{{ order.discount?.code || '-' }}</td>
              <td class="px-3 py-2">{{ order.payment_method ? capitalize(order.payment_method) : '-' }}</td>
              <td class="px-3 py-2 font-bold text-gray-800">${{ format(order.total_amount) }}</td>
              <td class="px-3 py-2">
                <select v-model="order.status" @change="updateStatus(order)" class="border rounded px-2 py-1">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td class="px-3 py-2">{{ formatDate(order.created_at) }}</td>
              <td class="px-3 py-2">
                <router-link :to="`/orders/${order.id}`" class="text-purple-600 hover:underline">View</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <transition name="fade">
        <div v-if="successMessage" class="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded shadow">
          {{ successMessage }}
        </div>
      </transition>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/plugins/axios';
import MainLayout from '@/components/Common/AppLayout.vue';

const orders = ref([]);
const selectedIds = ref([]);
const selectAll = ref(false);
const successMessage = ref('');

const filter = ref({
  from: '',
  to: '',
  status: 'all',
  format: 'csv', // 👈 added default format
});

onMounted(fetchOrders);

async function fetchOrders() {
  const res = await api.get('/orders');
  orders.value = res.data;
}

function toggleAll() {
  selectedIds.value = selectAll.value ? orders.value.map(o => o.id) : [];
}

function format(n) {
  return parseFloat(n).toFixed(2);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const date = new Date(order.created_at);
    const from = filter.value.from ? new Date(filter.value.from) : null;
    const to = filter.value.to ? new Date(filter.value.to) : null;
    const statusMatch = filter.value.status === 'all' || order.status === filter.value.status;
    const dateMatch = (!from || date >= from) && (!to || date <= to);
    return statusMatch && dateMatch;
  });
});

async function updateStatus(order) {
  try {
    await api.put(`/orders/${order.id}`, { status: order.status });
    successMessage.value = 'Order status updated!';
    setTimeout(() => successMessage.value = '', 2000);
  } catch (err) {
    console.error(err);
  }
}

async function downloadReport() {
  const query = new URLSearchParams();
  if (filter.value.from) query.append('from', filter.value.from);
  if (filter.value.to) query.append('to', filter.value.to);
  if (filter.value.status !== 'all') query.append('status', filter.value.status);
  if (filter.value.format) query.append('format', filter.value.format); // ✅ added format param

  try {
    const res = await api.get(`/orders/export?${query.toString()}`, {
      responseType: 'blob',
    });

    const type = res.headers['content-type'];
    const fileExt = filter.value.format === 'pdf' ? 'pdf'
                   : filter.value.format === 'excel' ? 'xlsx'
                   : 'csv';

    const blob = new Blob([res.data], { type });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `order_report.${fileExt}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('❌ Download failed', err);
    alert('Download failed. Please try again or check permissions.');
  }
}
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
