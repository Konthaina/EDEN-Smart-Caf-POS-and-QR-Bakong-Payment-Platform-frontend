<template>
    <MainLayout>
        <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <BackToDashboard />
                    <h1 class="text-2xl font-semibold">Top Selling Items</h1>
                </div>

                <div class="flex items-center gap-2">
                    <select class="border rounded-lg px-3 py-2" v-model="period">
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>

                    <button class="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        @click="exportCSV">
                        Export CSV
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white dark:bg-[#181f35] border rounded-2xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="sticky top-0 bg-gray-50/70 dark:bg-[#0b1223]/70 backdrop-blur">
                            <tr class="text-left">
                                <th class="px-4 py-3 w-16">#</th>
                                <th class="px-4 py-3">Item</th>
                                <th class="px-4 py-3">Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, idx) in items" :key="row.id || row.name + idx"
                                class="border-t border-gray-100 dark:border-gray-700">
                                <td class="px-4 py-2">{{ idx + 1 }}</td>
                                <td class="px-4 py-2">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">
                                            {{ initials(row.name) }}
                                        </div>
                                        <div class="font-medium">{{ row.name }}</div>
                                    </div>
                                </td>
                                <td class="px-4 py-2 font-semibold">
                                    {{ row.total_orders }}
                                </td>
                            </tr>

                            <tr v-if="!items.length">
                                <td colspan="3" class="px-4 py-10 text-center text-gray-500">
                                    No data for this period.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </MainLayout>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/plugins/axios";
import MainLayout from "@/components/Common/AppLayout.vue";
import BackToDashboard from "@/components/Common/BackToDashboard.vue";

const route = useRoute();
const router = useRouter();

const PERIODS = ["today", "week", "month", "year"];

const period = ref(
    PERIODS.includes(route.query.period) ? route.query.period : "month"
);
const items = ref([]);

function initials(n) {
    if (!n) return "?";
    const p = n.trim().split(" ");
    return (p[0]?.[0] || "") + (p[1]?.[0] || "");
}

async function load() {
    const res = await api.get(
        `/reports/top-items?filter=${encodeURIComponent(period.value)}`
    );
    items.value = (res.data || []).map(r => ({
        id: r.id,
        name: r.name,
        total_orders: Number(r.total_orders || 0),
    }));
}

// 🔁 single source of truth: run once now, then whenever period changes
watch(
    period,
    async (p, prev) => {
        // keep URL in sync without pushing history
        router.replace({ query: { period: p } });
        await load();
    },
    { immediate: true }
);

function exportCSV() {
    const rows = [
        ["Rank", "Item", "Orders"],
        ...items.value.map((r, i) => [i + 1, r.name, r.total_orders]),
    ]
        .map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top_items_${period.value}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
</script>
