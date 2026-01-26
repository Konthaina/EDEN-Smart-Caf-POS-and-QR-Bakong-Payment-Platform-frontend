<template>
  <MainLayout>
    <div class="p-6 h-full min-h-0 flex flex-col space-y-6">
      <!-- Header -->
      <!-- Top cluster: header + KPIs + filters -->

      <div class="space-y-6">

        <!-- Header -->

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <BackToDashboard />
            <h1 class="text-2xl font-semibold">Customers</h1>
          </div>

          <div class="flex items-center gap-2">
            <select class="border rounded-lg px-3 py-2" :value="period" @change="onChangePeriod($event.target.value)">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>

            <button class="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              @click="exportCSV">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="grid md:grid-cols-3 gap-4">
        <StatsCard title="Total" :value="totalCount" :icon="Users" color="indigo" />
        <StatsCard title="New in Period" :value="newInPeriodCount" :icon="UserPlus" color="green" />
        <StatsCard title="Returning (rough)" :value="returningCount" :icon="Repeat" color="purple" />
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-[#181f35] border rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <input v-model.trim="q" type="text" placeholder="Search name or email…"
          class="border rounded-lg px-3 py-2 w-64" />
        <select v-model="minOrders" class="border rounded-lg px-3 py-2">
          <option :value="0">All customers</option>
          <option :value="1">≥ 1 order</option>
          <option :value="5">≥ 5 orders</option>
          <option :value="10">≥ 10 orders</option>
        </select>
        <select v-model="sortKey" class="border rounded-lg px-3 py-2">
          <option value="name">Name (A→Z)</option>
          <option value="orders">Orders (high)</option>
          <option value="spent">Total Spent (high)</option>
          <option value="last">Last Order (new)</option>
          <option value="created_at">Joined (new)</option>
        </select>
        <button class="ml-auto text-sm underline opacity-80 hover:opacity-100" @click="resetFilters">
          Reset
        </button>
      </div>

      <!-- Table -->
      <div class="flex-1 min-h-0 bg-white dark:bg-[#181f35] border rounded-2xl overflow-hidden flex flex-col">
        <div class="flex-1 min-h-0 overflow-auto no-scrollbar">
          <table class="min-w-full text-sm">
            <thead class="sticky top-0 bg-gray-50/70 dark:bg-[#0b1223]/70 backdrop-blur z-10">
              <tr class="text-left">
                <th class="px-4 py-3">Name</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Joined</th>
                <th class="px-4 py-3">Orders</th>
                <th class="px-4 py-3">Total Spent</th>
                <th class="px-4 py-3">Last Order</th>
                <th class="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in paged" :key="c.id" class="border-t border-gray-100 dark:border-gray-700">
                <td class="px-4 py-2">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                      {{ initials(c.name) }}
                    </div>
                    <div class="font-medium">{{ c.name || "-" }}</div>
                  </div>
                </td>
                <td class="px-4 py-2">{{ c.email || "-" }}</td>
                <td class="px-4 py-2 whitespace-nowrap">
                  {{ fmtDate(c.created_at) }}
                </td>
                <td class="px-4 py-2">{{ c.stats.orders }}</td>
                <td class="px-4 py-2 font-semibold">
                  ${{ num(c.stats.spent) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  {{ c.stats.last ? fmtDate(c.stats.last) : "—" }}
                </td>
                <td class="px-4 py-2">
                  <RouterLink :to="{ name: 'Orders', query: { q: c.name } }" class="text-indigo-600 hover:underline">
                    View Orders
                  </RouterLink>
                </td>
              </tr>

              <tr v-if="!paged.length">
                <td colspan="7" class="px-4 py-10 text-center text-gray-500">
                  No customers
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="shrink-0 flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
          <div class="text-xs opacity-70">
            Showing {{ (page - 1) * pageSize + 1 }}–{{
              Math.min(page * pageSize, view.length)
            }}
            of {{ view.length }}
          </div>
          <div class="flex items-center gap-2">
            <select class="border rounded px-2 py-1 text-sm" v-model.number="pageSize">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <button class="px-3 py-1 border rounded disabled:opacity-40" :disabled="page === 1" @click="page--">
              Prev
            </button>
            <button class="px-3 py-1 border rounded disabled:opacity-40" :disabled="page >= maxPage" @click="page++">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import api from "@/plugins/axios";
import MainLayout from "@/components/Common/AppLayout.vue";
import BackToDashboard from "@/components/Common/BackToDashboard.vue";
import StatsCard from "@/components/Dashboard/StatsCard.vue";
import { Repeat, UserPlus, Users } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const period = ref(route.query.period || "today");
function onChangePeriod(v) {
  period.value = v;
  router.replace({ query: { period: v } });
}

const users = ref([]);
const orders = ref([]);

const q = ref("");
const minOrders = ref(0);
const sortKey = ref("name");

const page = ref(1);
const pageSize = ref(20);

async function load() {
  const [uRes, oRes] = await Promise.all([
    api.get("/users"),
    api.get("/orders"),
  ]);
  users.value = uRes.data || [];
  orders.value = oRes.data || [];
}
onMounted(load);

function isCustomer(u) {
  const roleName = (u.role?.name || u.role || "").toString().toLowerCase();
  return u.role_id === 4 || roleName === "customer";
}
function withinPeriod(date) {
  if (period.value === "all") return true;
  const dt = new Date(date);
  const now = new Date();
  const y = now.getFullYear(),
    m = now.getMonth();
  if (period.value === "today") return dt.toDateString() === now.toDateString();
  if (period.value === "week") {
    const s = new Date(now);
    s.setDate(now.getDate() - 6);
    s.setHours(0, 0, 0, 0);
    const e = new Date(now);
    e.setHours(23, 59, 59, 999);
    return dt >= s && dt <= e;
  }
  if (period.value === "month")
    return dt.getFullYear() === y && dt.getMonth() === m;
  if (period.value === "year") return dt.getFullYear() === y;
  return true;
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleString() : "";
}
function num(x) {
  return Number(x || 0).toFixed(2);
}
function initials(n) {
  if (!n) return "?";
  const parts = n.trim().split(" ");
  return (parts[0][0] || "") + ((parts[1] || "")[0] || "");
}

const customersRaw = computed(() => {
  const cs = users.value.filter(isCustomer);
  const map = new Map();
  for (const o of orders.value) {
    if (!o.user_id || o.status !== "completed") continue;
    const rec = map.get(o.user_id) || {
      orders: 0,
      spent: 0,
      last: null,
      first: null,
    };
    rec.orders += 1;
    rec.spent += Number(o.total_amount || 0);
    const t = new Date(o.created_at);
    rec.last = !rec.last || t > new Date(rec.last) ? t : rec.last;
    rec.first = !rec.first || t < new Date(rec.first) ? t : rec.first;
    map.set(o.user_id, rec);
  }
  return cs.map((u) => ({
    ...u,
    stats: map.get(u.id) || { orders: 0, spent: 0, last: null, first: null },
  }));
});

const totalCount = computed(() => customersRaw.value.length);
const newInPeriod = computed(() =>
  customersRaw.value.filter((c) => withinPeriod(c.created_at))
);
const newInPeriodCount = computed(() => newInPeriod.value.length);
const returningRough = computed(() =>
  customersRaw.value.filter((c) => c.stats.orders > 1)
);
const returningCount = computed(() => returningRough.value.length);

const view = computed(() => {
  let list = customersRaw.value.slice();
  if (q.value) {
    const s = q.value.toLowerCase();
    list = list.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(s) ||
        (c.email || "").toLowerCase().includes(s)
    );
  }
  if (minOrders.value > 0)
    list = list.filter((c) => c.stats.orders >= minOrders.value);

  list.sort((a, b) => {
    if (sortKey.value === "name")
      return (a.name || "").localeCompare(b.name || "");
    if (sortKey.value === "orders") return b.stats.orders - a.stats.orders;
    if (sortKey.value === "spent") return b.stats.spent - a.stats.spent;
    if (sortKey.value === "last")
      return new Date(b.stats.last || 0) - new Date(a.stats.last || 0);
    if (sortKey.value === "created_at")
      return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  page.value = 1;
  return list;
});

const maxPage = computed(() =>
  Math.max(1, Math.ceil(view.value.length / pageSize.value))
);
const paged = computed(() =>
  view.value.slice(
    (page.value - 1) * pageSize.value,
    page.value * pageSize.value
  )
);

function resetFilters() {
  q.value = "";
  minOrders.value = 0;
  sortKey.value = "name";
}

function exportCSV() {
  const rows = [
    ["Name", "Email", "Joined", "Orders", "Total Spent", "Last Order"],
    ...view.value.map((c) => [
      c.name || "",
      c.email || "",
      fmtDate(c.created_at),
      c.stats.orders,
      num(c.stats.spent),
      c.stats.last ? fmtDate(c.stats.last) : "",
    ]),
  ]
    .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.csv";
  a.click();
  URL.revokeObjectURL(url);
}
</script>
