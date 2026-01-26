<template>
    <MainLayout>
        <div class="p-6 h-full min-h-0 flex flex-col space-y-6">
            <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <BackToDashboard />
                    <h1 class="text-2xl font-semibold">Revenue Detail</h1>
                </div>

                <!-- Period -->
                <div class="flex items-center gap-2">
                    <select
                        class="border rounded-lg px-3 py-2 bg-white text-gray-900 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700"
                        :value="period"
                        @change="onChangePeriod($event.target.value)"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="custom">Custom Range…</option>
                    </select>

                    <!-- Custom range -->
                    <template v-if="period === 'custom'">
                        <input
                            type="date"
                            class="border rounded-lg px-2 py-2 bg-white text-gray-900 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700"
                            v-model="from"
                        />
                        <input
                            type="date"
                            class="border rounded-lg px-2 py-2 bg-white text-gray-900 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700"
                            v-model="to"
                        />
                    </template>

                    <!-- Export -->
                    <div class="relative">
                        <button
                            @click="exportMenuOpen = !exportMenuOpen"
                            class="border rounded-lg px-3 py-2 text-sm bg-white text-gray-900 hover:bg-gray-50 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            Export
                        </button>
                        <div v-if="exportMenuOpen"
                            class="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0b1223] border rounded-lg shadow z-10"
                            @click.outside="exportMenuOpen = false">
                            <button class="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                @click="exportOrders('csv')">CSV</button>
                            <button class="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                @click="exportOrders('excel')">Excel</button>
                            <button class="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                @click="exportOrders('pdf')">PDF</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary cards -->
            <div class="grid md:grid-cols-4 gap-4">
                <StatsCard title="Total Revenue" :value="`${totalRevenue.toFixed(2)} USD`" :icon="DollarSign"
                    color="green" />
                <StatsCard title="Orders" :value="filtered.length" :icon="Receipt" color="indigo" />
                <StatsCard title="Avg Order" :value="`$${avgOrder.toFixed(2)}`" :icon="BarChart3" color="purple" />
                <StatsCard title="Completed" :value="completed.length" :icon="CheckCircle" color="blue" />
            </div>

            <!-- Filters -->
            <div class="bg-white dark:bg-[#181f35] border dark:border-transparent rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                <input v-model.trim="q" type="text" placeholder="Search order code / customer…"
                    class="border rounded-lg px-3 py-2 w-56 bg-white text-gray-900 placeholder-gray-400 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700 dark:placeholder-gray-500" />
                <select
                    v-model="status"
                    class="border rounded-lg px-3 py-2 bg-white text-gray-900 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700"
                >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    v-model="method"
                    class="border rounded-lg px-3 py-2 bg-white text-gray-900 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700"
                >
                    <option value="all">All Payments</option>
                    <option value="cash">Cash</option>
                    <option value="static_qr">Static QR</option>
                    <option value="khqr">KHQR</option>
                    <option value="aba">ABA</option>
                    <option value="card">Card</option>
                </select>
                <button class="ml-auto text-sm underline opacity-80 hover:opacity-100" @click="resetFilters">
                    Reset
                </button>
            </div>

            <!-- Payment method breakdown -->
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div v-for="pm in pmBreakdown" :key="pm.method"
                    class="bg-white dark:bg-[#181f35] border dark:border-transparent rounded-xl px-4 py-3 flex items-center justify-between">
                    <div class="text-sm text-gray-500 dark:text-gray-300 capitalize">{{ pm.method || 'unknown' }}</div>
                    <div class="text-right">
                        <div class="font-semibold">${{ pm.total.toFixed(2) }}</div>
                        <div class="text-xs opacity-70">{{ pm.count }} orders</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Orders table -->
        <div class="flex-1 min-h-0 bg-white dark:bg-[#181f35] border dark:border-transparent rounded-2xl overflow-hidden flex flex-col">
            <!-- Scrollable table area (vertical + horizontal) -->
            <div class="flex-1 min-h-0 overflow-auto no-scrollbar">
                <table class="min-w-full text-sm">
                    <thead class="sticky top-0 bg-gray-50/70 dark:bg-[#0b1223]/70 backdrop-blur">
                        <tr class="text-left">
                            <th class="px-4 py-3">Code</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('created_at')">
                                Date
                                <SortIcon :active="sort.key === 'created_at'" :desc="sort.desc" />
                            </th>
                            <th class="px-4 py-3">Customer</th>
                            <th class="px-4 py-3 cursor-pointer" @click="toggleSort('total_amount')">
                                Amount
                                <SortIcon :active="sort.key === 'total_amount'" :desc="sort.desc" />
                            </th>
                            <th class="px-4 py-3">Discount</th>
                            <th class="px-4 py-3">Tax</th>
                            <th class="px-4 py-3">Payment</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="o in paged" :key="o.id" class="border-t border-gray-100 dark:border-gray-700">
                            <td class="px-4 py-2">{{ o.order_code }}</td>
                            <td class="px-4 py-2 whitespace-nowrap">{{ fmtDate(o.created_at) }}</td>
                            <td class="px-4 py-2">{{ o.user?.name || '-' }}</td>
                            <td class="px-4 py-2 font-semibold">${{ num(o.total_amount) }}</td>
                            <td class="px-4 py-2">${{ num(o.discount_amount) }}</td>
                            <td class="px-4 py-2">${{ num(o.tax_amount) }}</td>
                            <td class="px-4 py-2 capitalize">{{ o.payment_method || '-' }}</td>
                            <td class="px-4 py-2">
                                <span :class="[
                                    'px-2 py-0.5 rounded-full text-xs capitalize',
                                    o.status === 'completed' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200',
                                    o.status === 'pending' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200',
                                    o.status === 'cancelled' && 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
                                ]">
                                    {{ o.status }}
                                </span>
                            </td>
                            <td class="px-4 py-2">
                                <RouterLink :to="{ name: 'OrderDetail', params: { id: o.id } }"
                                    class="text-indigo-600 hover:underline dark:text-indigo-300">
                                    View
                                </RouterLink>
                            </td>
                        </tr>

                        <tr v-if="!paged.length">
                            <td colspan="9" class="px-4 py-10 text-center text-gray-500">
                                No orders found for the selected filters.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination stays pinned below the scroll area -->
            <div class="shrink-0 flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
                <div class="text-xs opacity-70">
                    Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, filtered.length) }}
                    of {{ filtered.length }}
                </div>
                <div class="flex items-center gap-2">
                    <select
                        class="border rounded px-2 py-1 text-sm bg-white text-gray-900 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700"
                        v-model.number="pageSize"
                    >
                        <option :value="10">10</option>
                        <option :value="20">20</option>
                        <option :value="50">50</option>
                    </select>
                    <button
                        class="px-3 py-1 border rounded disabled:opacity-40 bg-white text-gray-900 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700"
                        :disabled="page === 1"
                        @click="page--"
                    >
                        Prev
                    </button>
                    <button
                        class="px-3 py-1 border rounded disabled:opacity-40 bg-white text-gray-900 dark:bg-[#0b1223] dark:text-gray-100 dark:border-gray-700"
                        :disabled="page >= maxPage"
                        @click="page++"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>

        </div>
    </MainLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import api from "@/plugins/axios";
import MainLayout from "@/components/Common/AppLayout.vue";
import BackToDashboard from "@/components/Common/BackToDashboard.vue";
import StatsCard from "@/components/Dashboard/StatsCard.vue";
import { BarChart3, CheckCircle, ChevronDown, ChevronUp, DollarSign, Receipt } from "lucide-vue-next";

/* tiny sort icon */
const SortIcon = {
    props: { active: Boolean, desc: Boolean },
    components: { ChevronDown, ChevronUp },
    template: `
    <span class="inline-block ml-1 align-middle opacity-60" v-if="active">
      <ChevronDown v-if="desc" class="w-3 h-3" />
      <ChevronUp v-else class="w-3 h-3" />
    </span>
  `
};

const route = useRoute();
const router = useRouter();

const period = ref(route.query.period || "today");
const from = ref("");
const to = ref("");

const q = ref("");
const status = ref("all");
const method = ref("all");

const orders = ref([]);
const loading = ref(false);
const exportMenuOpen = ref(false);

// pagination + sort
const page = ref(1);
const pageSize = ref(20);
const sort = ref({ key: "created_at", desc: true });

function toggleSort(key) {
    if (sort.value.key === key) sort.value.desc = !sort.value.desc;
    else { sort.value.key = key; sort.value.desc = true; }
}

function onChangePeriod(v) {
    period.value = v;
    router.replace({ query: { period: v } });
}

function resetFilters() {
    q.value = "";
    status.value = "all";
    method.value = "all";
}

async function load() {
    loading.value = true;
    try {
        const res = await api.get("/orders");
        orders.value = res.data || [];
    } finally {
        loading.value = false;
    }
}

function inPeriod(d) {
    const dt = new Date(d);
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    if (period.value === "today") return dt.toDateString() === now.toDateString();
    if (period.value === "week") { const s = new Date(now); s.setDate(now.getDate() - 6); s.setHours(0, 0, 0, 0); const e = new Date(now); e.setHours(23, 59, 59, 999); return dt >= s && dt <= e; }
    if (period.value === "month") return dt.getFullYear() === y && dt.getMonth() === m;
    if (period.value === "year") return dt.getFullYear() === y;
    if (period.value === "custom" && from.value && to.value) {
        const s = new Date(from.value); s.setHours(0, 0, 0, 0);
        const e = new Date(to.value); e.setHours(23, 59, 59, 999);
        return dt >= s && dt <= e;
    }
    return true;
}

const filtered = computed(() => {
    let list = orders.value.filter(o => inPeriod(o.created_at));
    if (status.value !== "all") list = list.filter(o => o.status === status.value);
    if (method.value !== "all") list = list.filter(o => (o.payment_method || "") === method.value);
    if (q.value) {
        const s = q.value.toLowerCase();
        list = list.filter(o =>
            (o.order_code || "").toLowerCase().includes(s) ||
            (o.user?.name || "").toLowerCase().includes(s)
        );
    }
    // sort
    list = list.slice().sort((a, b) => {
        const ka = a[sort.value.key] ?? 0;
        const kb = b[sort.value.key] ?? 0;
        if (ka < kb) return sort.value.desc ? 1 : -1;
        if (ka > kb) return sort.value.desc ? -1 : 1;
        return 0;
    });
    // reset page when filters change
    page.value = 1;
    return list;
});

const completed = computed(() => filtered.value.filter(o => o.status === "completed"));
const totalRevenue = computed(() => filtered.value.reduce((sum, o) => sum + Number(o.total_amount || 0), 0));
const avgOrder = computed(() => filtered.value.length ? (totalRevenue.value / filtered.value.length) : 0);

const pmBreakdown = computed(() => {
    const map = new Map();
    for (const o of filtered.value) {
        const k = o.payment_method || "unknown";
        const rec = map.get(k) || { method: k, total: 0, count: 0 };
        rec.total += Number(o.total_amount || 0);
        rec.count += 1;
        map.set(k, rec);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
});

// pagination
const maxPage = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));

// export via backend (Admin‑guarded)
async function exportOrders(format) {
    try {
        exportMenuOpen.value = false;
        // build params
        const params = new URLSearchParams();
        params.set("format", format); // csv|excel|pdf
        // server expects from/to (YYYY-MM-DD). compute if not custom:
        const now = new Date();
        let s = null, e = null;
        if (period.value === "today") {
            s = new Date(now); s.setHours(0, 0, 0, 0);
            e = new Date(now); e.setHours(23, 59, 59, 999);
        } else if (period.value === "week") {
            s = new Date(now); s.setDate(now.getDate() - 6); s.setHours(0, 0, 0, 0);
            e = new Date(now); e.setHours(23, 59, 59, 999);
        } else if (period.value === "month") {
            s = new Date(now.getFullYear(), now.getMonth(), 1);
            e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (period.value === "year") {
            s = new Date(now.getFullYear(), 0, 1);
            e = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else if (period.value === "custom" && from.value && to.value) {
            s = new Date(from.value); s.setHours(0, 0, 0, 0);
            e = new Date(to.value); e.setHours(23, 59, 59, 999);
        }
        if (s && e) {
            params.set("from", s.toISOString().slice(0, 10));
            params.set("to", e.toISOString().slice(0, 10));
        }
        if (status.value !== "all") params.set("status", status.value);

        // open in new tab to trigger download
        const token = localStorage.getItem("token");
        const url = `${import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api"}/orders/export?${params.toString()}`;
        const w = window.open("", "_blank");
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.blob())
            .then(blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `order_report.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
                link.click();
                w && w.close();
            })
            .catch(() => { w && w.close(); });
    } catch (e) {
        (window.$toast || console).error?.("Export failed or not permitted.");
    }
}

function fmtDate(d) { return new Date(d).toLocaleString(); }
function num(x) { return Number(x || 0).toFixed(2); }

watch(() => route.query.period, (v) => { period.value = v || "today"; }, { immediate: true });
watch([period, from, to, q, status, method, pageSize], () => { page.value = 1; });

onMounted(load);
</script>
