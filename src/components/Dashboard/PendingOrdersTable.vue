<template>
    <div class="bg-white dark:bg-[#181f35] border border-gray-100 dark:border-[#26335A] rounded-2xl p-5 shadow">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
                <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
                    <Hourglass class="w-4 h-4 text-violet-600 dark:text-violet-200" />
                </span>
                <h3 class="text-sm font-semibold text-gray-800 dark:text-white">Recent Pending Orders</h3>
            </div>

            <RouterLink :to="{ name: 'Orders', query: { status: 'pending' } }"
                class="text-xs px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                See all
            </RouterLink>
        </div>

        <div class="overflow-x-auto -mx-3 sm:mx-0">
            <table class="min-w-full text-sm">
                <thead class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">
                    <tr>
                        <th class="px-3 py-2 text-left">Code</th>
                        <th class="px-3 py-2 text-right">Items</th>
                        <th class="px-3 py-2 text-right">Total</th>
                        <th class="px-3 py-2 text-right">Date</th>
                        <th class="px-3 py-2 text-right">Action</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="o in rows" :key="o.id ?? o.order_code ?? o.code"
                        class="border-t border-gray-100 dark:border-[#26335A]">
                        <td class="px-3 py-2 font-medium">
                            {{ o.order_code ?? o.code ?? ('#' + (o.id ?? '')) }}
                        </td>
                        <td class="px-3 py-2 text-right">{{ o.itemCount }}</td>
                        <td class="px-3 py-2 text-right">{{ formatUSD(o.total_amount) }}</td>
                        <td class="px-3 py-2 text-right">{{ o.created_at_fmt }}</td>
                        <td class="px-3 py-2 text-right">
                            <RouterLink :to="detailTo(o)"
                                class="text-xs px-2 py-1 rounded-md border border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800/40">
                                View
                            </RouterLink>
                        </td>
                    </tr>

                    <tr v-if="!rows.length">
                        <td colspan="5" class="px-3 py-8 text-center text-gray-500 dark:text-gray-300">
                            No pending orders.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/plugins/axios'
import { Hourglass } from 'lucide-vue-next'

const props = defineProps({ limit: { type: Number, default: 6 } })
const orders = ref([])

/* ---------- helpers to normalize API differences ---------- */
const usd = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })
function formatUSD(n) { return usd.format(Number(n || 0)) }

function extractRows(payload) {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data         // Laravel pagination
    if (Array.isArray(payload?.orders)) return payload.orders
    return []
}
function statusOf(o) {
    return String(
        o?.status ?? o?.order_status ?? o?.state ?? o?.orderStatus ?? ''
    ).trim().toLowerCase()
}
function itemsCountOf(o) {
    const arr = o?.order_items ?? o?.orderItems ?? o?.items ?? []
    return Array.isArray(arr) ? arr.length : Number(arr?.length ?? 0)
}
function totalOf(o) {
    return Number(o?.total_amount ?? o?.total ?? o?.amount ?? 0)
}
function createdAtOf(o) {
    return o?.created_at ?? o?.date ?? o?.ordered_at ?? null
}
function fmtDate(iso) {
    if (!iso) return ''
    try { return new Date(iso).toLocaleString() } catch { return String(iso) }
}
function detailTo(o) {
    return o?.id != null
        ? { name: 'OrderDetail', params: { id: o.id } }
        : { name: 'Orders', query: { code: o?.order_code ?? o?.code ?? '' } }
}
/* --------------------------------------------------------- */

const rows = computed(() =>
    orders.value
        .filter(o => statusOf(o) === 'pending')
        .map(o => {
            const dt = createdAtOf(o)
            return {
                ...o,
                itemCount: itemsCountOf(o),
                total_amount: totalOf(o),
                created_at_value: dt ? new Date(dt).getTime() : 0,
                created_at_fmt: fmtDate(dt)
            }
        })
        .sort((a, b) => b.created_at_value - a.created_at_value)
        .slice(0, props.limit)
)

onMounted(async () => {
    const res = await api.get('/orders')
    orders.value = extractRows(res.data)
})
</script>
