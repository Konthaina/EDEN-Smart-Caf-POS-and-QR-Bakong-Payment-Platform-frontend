<template>
    <AppLayout>
        <div class="p-6 space-y-6">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold text-gray-800">🧾 Order Detail</h1>
                <button @click="$router.back()" class="text-sm text-purple-600 hover:underline">← Back to
                    Orders</button>
            </div>

            <div v-if="order" class="space-y-4">
                <!-- Order Meta -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                    <div><b>Order Code:</b> {{ order.order_code }}</div>
                    <div><b>User ID:</b> {{ order.user_id }}</div>
                    <div><b>Status:</b> {{ order.status }}</div>
                    <div><b>Date:</b> {{ formatDate(order.created_at) }}</div>
                    <div><b>Discount:</b> ${{ order.discount_amount }}</div>
                    <div><b>Promo Code:</b> {{ order.promo_code || '-' }}</div>
                    <div><b>Payment Type:</b> {{ order.payment_method }}</div>
                    <div><b>Total Amount:</b> ${{ order.total_amount }}</div>
                </div>

                <!-- Order Items Table -->
                <div class="bg-white shadow rounded-xl overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50 text-left text-gray-600">
                            <tr>
                                <th class="px-6 py-3 font-semibold">Item</th>
                                <th class="px-6 py-3 font-semibold">Qty</th>
                                <th class="px-6 py-3 font-semibold">Price</th>
                                <th class="px-6 py-3 font-semibold">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="item in order.order_items" :key="item.id">
                                <td class="px-6 py-3">{{ item.menu_item?.name || '-' }}</td>
                                <td class="px-6 py-3">{{ item.quantity }}</td>
                                <td class="px-6 py-3">${{ item.price }}</td>
                                <td class="px-6 py-3">${{ (item.quantity * item.price).toFixed(2) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-else class="text-gray-500 text-sm">Loading order details...</div>
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

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString()

onMounted(fetchOrder)
</script>
