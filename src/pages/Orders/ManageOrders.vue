<template>
  <MainLayout>
    <div class="p-6 h-full flex flex-col min-h-0">
      <div class="flex-1 min-h-0 flex flex-col">
        <!-- ── Top: title + controls ────────────────────────────────────────── -->
        <div class="space-y-4 shrink-0 pb-3">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {{ $t("order.title") }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-300">
                {{ $t("order.subtitle") }}
              </p>
            </div>

            <!-- Columns menu trigger -->
            <div class="relative" ref="colsMenuRef">
              <button class="input !py-2" @click="toggleColsMenu">
                Columns
                <svg
                  viewBox="0 0 20 20"
                  width="12"
                  height="12"
                  class="inline ml-2"
                >
                  <path d="M5 7l5 6 5-6" fill="currentColor" />
                </svg>
              </button>

              <!-- Columns dropdown -->
              <div
                v-if="showColsMenu"
                class="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10 p-2"
              >
                <div
                  class="text-xs px-2 py-1 mb-1 text-gray-500 dark:text-gray-400"
                >
                  Show/Hide Columns
                </div>
                <div
                  v-for="c in toggleableColumns"
                  :key="c.key"
                  class="flex items-center gap-2 px-2 py-1"
                >
                  <input
                    type="checkbox"
                    :id="`col-${c.key}`"
                    class="rounded"
                    :checked="visibleCols[c.key]"
                    @change="onToggleColumn(c.key, $event)"
                  />
                  <label
                    :for="`col-${c.key}`"
                    class="text-sm text-gray-700 dark:text-gray-200 select-none"
                  >
                    {{ c.label }}
                  </label>
                </div>
                <div
                  v-if="hiddenCount >= toggleableColumns.length - 1"
                  class="px-2 pt-2 text-[11px] text-amber-600"
                >
                  At least one column must stay visible.
                </div>
              </div>
            </div>
          </div>

          <!-- Filters row -->
          <div class="flex flex-wrap justify-between items-center gap-3">
            <div class="flex flex-wrap gap-2 items-center">
              <input
                v-model="search"
                type="text"
                class="input w-48"
                :placeholder="$t('order.search')"
              />
              <input v-model="filter.from" type="date" class="input" />
              <input v-model="filter.to" type="date" class="input" />
              <select v-model="filter.status" class="input">
                <option value="all">{{ $t("order.status.all") }}</option>
                <option value="pending">
                  {{ $t("order.status.pending") }}
                </option>
                <option value="completed">
                  {{ $t("order.status.completed") }}
                </option>
                <option value="cancelled">
                  {{ $t("order.status.cancelled") }}
                </option>
              </select>

              <!-- Per-page selector -->
              <select
                v-model.number="perPage"
                class="input"
                @change="onPerPageChange"
              >
                <option :value="10">10 / page</option>
                <option :value="20">20 / page</option>
                <option :value="50">50 / page</option>
                <option :value="100">100 / page</option>
              </select>
            </div>

            <div class="flex flex-wrap gap-2 items-center">
              <select v-model="filter.format" class="input">
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
              <button
                @click="downloadReport"
                class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-full shadow-sm text-sm transition"
              >
                {{ $t("order.download") }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Content: summary + table + pagination ─────────────────────────── -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <!-- Summary -->
          <div class="text-sm text-gray-600 dark:text-gray-300">
            {{ $t("order.showing") }}
            <strong class="text-purple-700 dark:text-purple-400">
              {{ pagination.total === 0 ? 0 : pageStart }}–{{ pageEnd }}
              {{ $t("order.of") }}
              {{ pagination.total }}
            </strong>
            {{ $t("order.orders") }}
          </div>

          <!-- Table -->
          <div
            class="flex-1 min-h-0 overflow-auto rounded-xl shadow no-scrollbar"
          >
            <table class="w-full text-sm text-left bg-white dark:bg-gray-800">
              <thead
                class="bg-gray-100 dark:bg-gray-700 sticky top-0 text-xs text-gray-700 dark:text-gray-300 font-semibold uppercase border-b dark:border-gray-600"
              >
                <tr>
                  <th class="px-4 py-3 w-12">No</th>

                  <th
                    v-if="visibleCols.order_code"
                    class="px-4 py-3 cursor-pointer select-none"
                    :class="isActive('order_code')"
                    :aria-sort="ariaSort('order_code')"
                    @click="setSort('order_code')"
                  >
                    {{ $t("order.code") }}
                    <SortIcon
                      :active="sort.by === 'order_code'"
                      :dir="sort.dir"
                    />
                  </th>

                  <th
                    v-if="visibleCols.user"
                    class="px-4 py-3 cursor-pointer select-none"
                    :class="isActive('user.name')"
                    :aria-sort="ariaSort('user.name')"
                    @click="setSort('user.name')"
                  >
                    {{ $t("order.user") }}
                    <SortIcon
                      :active="sort.by === 'user.name'"
                      :dir="sort.dir"
                    />
                  </th>

                  <th
                    v-if="visibleCols.discount"
                    class="px-4 py-3 cursor-pointer select-none"
                    :class="isActive('discount_amount')"
                    :aria-sort="ariaSort('discount_amount')"
                    @click="setSort('discount_amount')"
                  >
                    {{ $t("order.discount") }}
                    <SortIcon
                      :active="sort.by === 'discount_amount'"
                      :dir="sort.dir"
                    />
                  </th>

                  <th
                    v-if="visibleCols.promo"
                    class="px-4 py-3 cursor-pointer select-none"
                    :class="isActive('discount.code')"
                    :aria-sort="ariaSort('discount.code')"
                    @click="setSort('discount.code')"
                  >
                    {{ $t("order.promo") }}
                    <SortIcon
                      :active="sort.by === 'discount.code'"
                      :dir="sort.dir"
                    />
                  </th>

                  <th
                    v-if="visibleCols.payment"
                    class="px-4 py-3 cursor-pointer select-none"
                    :class="isActive('payment_method')"
                    :aria-sort="ariaSort('payment_method')"
                    @click="setSort('payment_method')"
                  >
                    {{ $t("order.payment") }}
                    <SortIcon
                      :active="sort.by === 'payment_method'"
                      :dir="sort.dir"
                    />
                  </th>

                  <th
                    v-if="visibleCols.total"
                    class="px-4 py-3 cursor-pointer select-none"
                    :class="isActive('total_amount')"
                    :aria-sort="ariaSort('total_amount')"
                    @click="setSort('total_amount')"
                  >
                    {{ $t("order.total") }}
                    <SortIcon
                      :active="sort.by === 'total_amount'"
                      :dir="sort.dir"
                    />
                  </th>

                  <th
                    v-if="visibleCols.status"
                    class="px-4 py-3 cursor-pointer select-none"
                    :class="isActive('status')"
                    :aria-sort="ariaSort('status')"
                    @click="setSort('status')"
                  >
                    {{ $t("order.status.all") }}
                    <SortIcon :active="sort.by === 'status'" :dir="sort.dir" />
                  </th>

                  <th
                    v-if="visibleCols.date"
                    class="px-4 py-3 cursor-pointer select-none"
                    :class="isActive('created_at')"
                    :aria-sort="ariaSort('created_at')"
                    @click="setSort('created_at')"
                  >
                    {{ $t("order.date") }}
                    <SortIcon
                      :active="sort.by === 'created_at'"
                      :dir="sort.dir"
                    />
                  </th>

                  <th class="px-4 py-3">{{ $t("order.action") }}</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr
                  v-for="(order, index) in orders"
                  :key="order.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td
                    class="px-4 py-3 text-center text-gray-600 dark:text-gray-300 font-semibold"
                  >
                    {{ absoluteIndex(index) }}
                  </td>

                  <td
                    v-if="visibleCols.order_code"
                    class="px-4 py-3 font-medium text-gray-800 dark:text-gray-100"
                  >
                    {{ order.order_code }}
                  </td>

                  <td
                    v-if="visibleCols.user"
                    class="px-4 py-3 text-gray-600 dark:text-gray-300"
                  >
                    {{ order.user?.name }}
                  </td>

                  <td
                    v-if="visibleCols.discount"
                    class="px-4 py-3 text-green-600 font-semibold"
                  >
                    ${{ format(order.discount_amount) }}
                  </td>

                  <td
                    v-if="visibleCols.promo"
                    class="px-4 py-3 text-gray-500 dark:text-gray-400"
                  >
                    {{ order.discount?.code || "—" }}
                  </td>

                  <td
                    v-if="visibleCols.payment"
                    class="px-4 py-3 capitalize text-gray-700 dark:text-gray-300"
                  >
                    {{ order.payment_method || "—" }}
                  </td>

                  <td
                    v-if="visibleCols.total"
                    class="px-4 py-3 font-bold text-gray-900 dark:text-white"
                  >
                    ${{ format(order.total_amount) }}
                  </td>

                  <td v-if="visibleCols.status" class="px-4 py-3">
                    <select
                      v-model="order.status"
                      @change="updateStatus(order)"
                      :class="[
                        'rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition',
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : order.status === 'completed'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-700 border border-red-300',
                      ]"
                    >
                      <option value="pending">
                        {{ $t("order.status.pending") }}
                      </option>
                      <option value="completed">
                        {{ $t("order.status.completed") }}
                      </option>
                      <option value="cancelled">
                        {{ $t("order.status.cancelled") }}
                      </option>
                    </select>
                  </td>

                  <td
                    v-if="visibleCols.date"
                    class="px-4 py-3 text-gray-500 dark:text-gray-400"
                  >
                    {{ formatDate(order.created_at) }}
                  </td>

                  <td class="px-4 py-3">
                    <RouterLink
                      :to="`/orders/${order.id}`"
                      class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-700 font-medium rounded-full text-xs transition"
                    >
                      {{ $t("order.view") }}
                    </RouterLink>
                  </td>
                </tr>

                <!-- Empty state -->
                <tr v-if="orders.length === 0">
                  <td
                    :colspan="safeColspan"
                    class="text-center text-gray-400 dark:text-gray-500 py-6"
                  >
                    {{ $t("order.no_orders") }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="pagination.last_page > 1"
            class="mt-3 flex flex-wrap items-center justify-between gap-3"
          >
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Page {{ pagination.current_page }} / {{ pagination.last_page }} •
              {{ pageStart }}–{{ pageEnd }} {{ $t("order.of") }}
              {{ pagination.total }}
            </div>

            <div class="flex items-center gap-1">
              <button
                class="pager-btn"
                :disabled="isFirstPage"
                @click="goToPage(1)"
              >
                « First
              </button>
              <button
                class="pager-btn"
                :disabled="isFirstPage"
                @click="goToPage(pagination.current_page - 1)"
              >
                ‹ Prev
              </button>

              <button
                v-for="p in visiblePages"
                :key="p"
                class="pager-num"
                :class="p === pagination.current_page ? 'active' : ''"
                @click="goToPage(p)"
              >
                {{ p }}
              </button>

              <button
                class="pager-btn"
                :disabled="isLastPage"
                @click="goToPage(pagination.current_page + 1)"
              >
                Next ›
              </button>
              <button
                class="pager-btn"
                :disabled="isLastPage"
                @click="goToPage(pagination.last_page)"
              >
                Last »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, h } from "vue";
import api from "@/plugins/axios";
import MainLayout from "@/components/Common/AppLayout.vue";
import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = createToastInterface();

/** Data & filters */
const orders = ref([]);
const search = ref("");
const filter = ref({ from: "", to: "", status: "all", format: "csv" });

/** Default + server-side sort state (tri-state) */
const defaultSort = { by: "created_at", dir: "desc" };
const sort = ref({ ...defaultSort }); // 'asc'|'desc'

/** Pagination */
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
});
const perPage = ref(10);

/** Columns visibility */
const visibleCols = ref({
  order_code: true,
  user: true,
  discount: true,
  promo: true,
  payment: true,
  total: true,
  status: true,
  date: true,
});
const toggleableColumns = [
  { key: "order_code", label: "Order Code" },
  { key: "user", label: "User" },
  { key: "discount", label: "Discount" },
  { key: "promo", label: "Promo Code" },
  { key: "payment", label: "Payment" },
  { key: "total", label: "Total Amount" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

/** Columns menu with safe click-outside */
const showColsMenu = ref(false);
const colsMenuRef = ref(null);
function toggleColsMenu() {
  showColsMenu.value = !showColsMenu.value;
}
function onDocClick(e) {
  if (!colsMenuRef.value) return;
  if (!colsMenuRef.value.contains(e.target)) showColsMenu.value = false;
}
onMounted(() => {
  document.addEventListener("mousedown", onDocClick, true);
  fetchOrders(1);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocClick, true);
});

/** Guard so at least one column stays visible */
const hiddenCount = computed(
  () => toggleableColumns.filter((c) => !visibleCols.value[c.key]).length
);
function onToggleColumn(key, evt) {
  const checked = evt.target.checked;
  const currentlyVisible = toggleableColumns.length - hiddenCount.value;
  if (!checked && currentlyVisible <= 1) {
    evt.preventDefault();
    evt.target.checked = true;
    return;
  }
  visibleCols.value[key] = checked;
}

/** API (server-side filtering + pagination) */
async function fetchOrders(page = pagination.value.current_page) {
  try {
    const params = {
      page,
      per_page: perPage.value,
      sort_by: sort.value.by,
      sort_dir: sort.value.dir,
    };

    // send filters to backend (so pagination happens AFTER filtering)
    if (search.value?.trim()) params.q = search.value.trim();
    if (filter.value.from) params.from = filter.value.from;
    if (filter.value.to) params.to = filter.value.to;
    if (filter.value.status && filter.value.status !== "all")
      params.status = filter.value.status;

    const { data } = await api.get("/orders", { params });

    orders.value = data.data || [];
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total,
    };
  } catch (err) {
    console.error(err);
    orders.value = [];
    pagination.value = {
      current_page: 1,
      last_page: 1,
      per_page: perPage.value,
      total: 0,
    };
    toast.error(t("order.toast.fetch_error") || "Failed to load orders");
  }
}

/** Helpers */
function format(n) {
  return parseFloat(n ?? 0).toFixed(2);
}
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB");
}

/** Tri-state sorting: asc -> desc -> reset(default) */
function setSort(by) {
  if (sort.value.by !== by) {
    sort.value.by = by;
    sort.value.dir = ["total_amount", "discount_amount", "created_at"].includes(
      by
    )
      ? "desc"
      : "asc";
  } else {
    if (sort.value.dir === "asc") sort.value.dir = "desc";
    else if (sort.value.dir === "desc")
      sort.value = { ...defaultSort }; // reset
    else sort.value.dir = "asc";
  }
  pagination.value.current_page = 1;
  fetchOrders(1);
}
function isActive(col) {
  return sort.value.by === col ? "text-purple-700 dark:text-purple-300" : "";
}
function ariaSort(col) {
  return sort.value.by === col
    ? sort.value.dir === "asc"
      ? "ascending"
      : "descending"
    : "none";
}

/** Status update (unchanged) */
async function updateStatus(order) {
  try {
    await api.put(`/orders/${order.id}`, { status: order.status });
    toast.success(t("order.toast.update_success"));
  } catch (err) {
    console.error(err);
    toast.error(t("order.toast.update_error"));
  }
}

/** Export (sends same filters) */
async function downloadReport() {
  const q = new URLSearchParams();
  if (filter.value.from) q.append("from", filter.value.from);
  if (filter.value.to) q.append("to", filter.value.to);
  if (filter.value.status !== "all") q.append("status", filter.value.status);
  if (filter.value.format) q.append("format", filter.value.format);
  try {
    const res = await api.get(`/orders/export?${q.toString()}`, {
      responseType: "blob",
    });
    const type = res.headers["content-type"];
    const ext =
      filter.value.format === "pdf"
        ? "pdf"
        : filter.value.format === "excel"
        ? "xlsx"
        : "csv";
    const blob = new Blob([res.data], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `order_report.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("order.toast.export_success"));
  } catch (err) {
    toast.error(t("order.toast.export_error"));
    console.error(err);
  }
}

/** Pagination utils */
const isFirstPage = computed(() => pagination.value.current_page <= 1);
const isLastPage = computed(
  () => pagination.value.current_page >= pagination.value.last_page
);
function goToPage(p) {
  const next = Math.min(Math.max(1, p), pagination.value.last_page || 1);
  pagination.value.current_page = next;
  fetchOrders(next);
}
function onPerPageChange() {
  pagination.value.current_page = 1;
  fetchOrders(1);
}
const visiblePages = computed(() => {
  const total = pagination.value.last_page || 1;
  const current = pagination.value.current_page || 1;
  const windowSize = 5,
    half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half),
    end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, Math.min(start, end - windowSize + 1));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
const pageStart = computed(() =>
  pagination.value.total === 0
    ? 0
    : (pagination.value.current_page - 1) * pagination.value.per_page + 1
);
const pageEnd = computed(() =>
  Math.min(
    pagination.value.current_page * pagination.value.per_page,
    pagination.value.total
  )
);
function absoluteIndex(localIdx) {
  return (
    (pagination.value.current_page - 1) * pagination.value.per_page +
    (localIdx + 1)
  );
}

/** ---- SortIcon: functional, no runtime template ---- */
const SortIcon = (props) => {
  const { active, dir } = props;
  if (!active) {
    return h(
      "span",
      {
        class:
          "inline-block ml-1 align-middle text-gray-400 dark:text-gray-500",
        "aria-hidden": "true",
      },
      [
        h("svg", { width: 12, height: 12, viewBox: "0 0 20 20" }, [
          h("path", {
            d: "M7 7l3-3 3 3H7zM7 13h6l-3 3-3-3z",
            fill: "currentColor",
          }),
        ]),
      ]
    );
  }
  return h(
    "span",
    {
      class:
        "inline-block ml-1 align-middle text-purple-600 dark:text-purple-300",
      "aria-hidden": "true",
    },
    [
      h("svg", { width: 12, height: 12, viewBox: "0 0 20 20" }, [
        h("path", {
          d: dir === "asc" ? "M10 5l5 7H5l5-7z" : "M10 15l-5-7h10l-5 7z",
          fill: "currentColor",
        }),
      ]),
    ]
  );
};

/** Safe colspan: 1 (No) + visible toggled columns + 1 (Action) */
const safeColspan = computed(() => {
  const middle = Object.values(visibleCols.value).filter(Boolean).length;
  const cols = 1 + middle + 1;
  return Math.max(cols, 2);
});

/** Debounced refetch on filter/search changes */
function debounce(fn, delay = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
const refetchDebounced = debounce(() => {
  pagination.value.current_page = 1;
  fetchOrders(1);
}, 350);

watch(search, refetchDebounced);
watch(() => filter.value.from, refetchDebounced);
watch(() => filter.value.to, refetchDebounced);
watch(() => filter.value.status, refetchDebounced);
</script>

<style scoped>
.input {
  @apply border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500;
}

/* Minimal, modern scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Pager styles */
.pager-btn {
  @apply px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
.pager-num {
  @apply px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700;
}
.pager-num.active {
  @apply bg-purple-600 text-white border-purple-600 hover:bg-purple-600;
}
</style>
