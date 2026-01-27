<template>
  <AppLayout>
    <!-- Low Stock Alert Popup -->
    <transition name="fade">
      <div
        v-if="showLowStockAlert"
        class="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 dark:bg-red-300 border border-red-300 dark:border-red-400 text-red-800 px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-lg khmer-support"
        :lang="locale"
      >
        <AlertTriangle class="w-5 h-5 text-red-600" />
        <div class="text-sm">
          {{ $t("stock.lowStockAlert") }}:
          <strong>
            {{
              lowStockItems
                .map((i) => localizedIngName(i.ingredient))
                .join(", ")
            }}
          </strong>
        </div>
        <button
          @click="showLowStockAlert = false"
          class="ml-auto text-red-600 hover:text-red-800 text-sm font-bold"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition>

    <!-- PAGE SHELL -->
    <div :lang="locale" class="p-6 h-full flex flex-col min-h-0 khmer-support">
      <div class="flex-1 flex flex-col gap-4 min-h-0">
        <!-- ── Top cluster: header + search ─────────────────────────── -->
        <div class="space-y-4">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ $t("stock.title") || "Stock" }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-300">
                {{ $t("stock.subtitle") || "Manage ingredient stock levels" }}
              </p>
            </div>
            <button
              @click="openAddForm"
              class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-5 py-2 rounded-full shadow flex items-center gap-2 text-sm transition"
            >
              {{ $t("stock.add") || "Add" }}
            </button>
          </div>

          <!-- Search -->
          <div class="flex justify-between items-center">
            <div class="relative w-72">
              <span class="absolute left-3 top-2.5 text-gray-400">
                <Search class="w-4 h-4 text-purple-400" />
              </span>
              <input
                v-model="search"
                :placeholder="$t('stock.search') || 'Search ingredient'"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
              />
            </div>
            <div class="flex gap-3 items-center"></div>
          </div>
        </div>

        <!-- ── Bottom cluster: summary + table ───────────────────────── -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <div class="text-sm font-semibold text-gray-800 dark:text-white">
            {{ $t("stock.total") || "Total" }}:
            <span class="font-bold">{{ filteredStocks.length }}</span>
          </div>

          <!-- Stock Table -->
          <div
            class="flex-1 min-h-0 flex flex-col rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
          >
            <div class="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <table
                class="min-w-full text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                <thead
                  class="bg-purple-50 dark:bg-gray-700 text-purple-800 dark:text-purple-300 text-left font-semibold sticky top-0 z-10"
                >
                  <tr>
                    <th class="px-4 py-3">No</th>

                    <th
                      class="px-4 py-3 cursor-pointer select-none"
                      :class="isActive('ingredient')"
                      :aria-sort="ariaSort('ingredient')"
                      @click="setSort('ingredient')"
                    >
                      {{ $t("stock.ingredient") || "Ingredient" }}
                      <SortIcon
                        :active="sort.by === 'ingredient'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th
                      class="px-4 py-3 cursor-pointer select-none"
                      :class="isActive('quantity')"
                      :aria-sort="ariaSort('quantity')"
                      @click="setSort('quantity')"
                    >
                      {{ $t("stock.quantity") || "Quantity" }}
                      <SortIcon
                        :active="sort.by === 'quantity'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th
                      class="px-4 py-3 cursor-pointer select-none"
                      :class="isActive('level')"
                      :aria-sort="ariaSort('level')"
                      @click="setSort('level')"
                    >
                      {{ $t("stock.level") || "Level" }}
                      <SortIcon :active="sort.by === 'level'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-4 py-3 cursor-pointer select-none"
                      :class="isActive('updated')"
                      :aria-sort="ariaSort('updated')"
                      @click="setSort('updated')"
                    >
                      {{ $t("stock.updated") || "Updated" }}
                      <SortIcon
                        :active="sort.by === 'updated'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th class="px-4 py-3 text-center">
                      {{ $t("stock.action") || "Action" }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(stock, index) in filteredStocks"
                    :key="stock.id"
                    class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td class="px-4 py-3">{{ index + 1 }}</td>

                    <td class="px-4 py-3 font-medium">
                      {{ localizedIngName(stock.ingredient) }}
                    </td>

                    <td class="px-4 py-3">
                      {{ stock.quantity }} {{ stock.ingredient.unit }}
                    </td>

                    <td class="px-4 py-3">
                      <div
                        class="relative w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden"
                      >
                        <div
                          class="h-3 rounded-full absolute top-0 left-0 flex items-center justify-center text-[10px] font-medium transition-all duration-500"
                          :style="{ width: getStockLevel(stock) + '%' }"
                          :class="[
                            getStockLevel(stock) < 20
                              ? 'bg-red-500 text-white'
                              : getStockLevel(stock) < 50
                              ? 'bg-yellow-400 text-black'
                              : 'bg-green-500 text-white',
                          ]"
                        >
                          {{ getStockLevel(stock) }}%
                        </div>
                      </div>
                      <!-- Use per-ingredient threshold for 'Low' -->
                      <span
                        v-if="isLow(stock)"
                        class="text-[11px] text-red-600 font-medium mt-1 inline-block"
                      >
                        <AlertTriangle class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />
                        {{ $t("stock.low") || "Low" }}
                      </span>
                    </td>

                    <td class="px-4 py-3">
                      {{ formatDate(stock.updated_at) }}
                    </td>

                    <td class="px-4 py-3">
                      <div class="flex items-center justify-center gap-2">
                        <RouterLink
                          :to="{
                            name: 'StockDetail',
                            params: { id: stock.id },
                          }"
                          class="px-4 py-1 text-indigo-600 border border-indigo-200 dark:border-indigo-400 dark:text-indigo-300 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900 text-xs"
                        >
                          {{ $t("common.view") || "View" }}
                        </RouterLink>

                        <button
                          class="px-4 py-1 text-blue-600 border border-blue-200 dark:border-blue-400 dark:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900 text-xs"
                          @click="editStock(stock)"
                        >
                          {{ $t("stock.update") || "Update" }}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="filteredStocks.length === 0">
                    <td
                      colspan="6"
                      class="text-center text-gray-400 dark:text-gray-500 py-6"
                    >
                      {{ $t("stock.noRecord") || "No records" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Add/Edit Modal -->
          <teleport to="body">
            <div
              v-if="openModal"
              :lang="locale"
              class="fixed inset-0 z-[999] flex items-center justify-center khmer-support"
            >
              <div
                class="absolute inset-0 bg-black bg-opacity-50 z-[998]"
              ></div>
              <div
                class="relative z-[999] bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-lg p-6 space-y-4 text-gray-800 dark:text-gray-100"
              >
                <h2 class="text-lg font-bold text-gray-800 dark:text-white">
                  {{
                    isEditing
                      ? $t("stock.update") || "Update"
                      : $t("stock.add") || "Add"
                  }}
                </h2>

                <div class="space-y-3">
                  <div>
                    <label
                      class="block text-sm font-medium mb-1 dark:text-gray-300"
                    >
                      {{ $t("stock.selectIngredient") || "Select ingredient" }}
                    </label>

                    <!-- When editing, show locked ingredient -->
                    <input
                      v-if="isEditing"
                      v-model="selectedIngredientName"
                      disabled
                      class="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-600 dark:text-white"
                    />

                    <!-- When adding, choose from ingredients that don't have stock yet -->
                    <select
                      v-else
                      v-model="form.ingredient_id"
                      class="w-full border rounded px-3 py-2 focus:ring focus:border-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option disabled value="">
                        {{ $t("stock.selectPlaceholder") || "Select..." }}
                      </option>
                      <option
                        v-for="ingredient in availableIngredients"
                        :key="ingredient.id"
                        :value="ingredient.id"
                      >
                        {{ localizedIngName(ingredient) }} ({{
                          ingredient.unit
                        }})
                      </option>
                    </select>
                  </div>

                  <div v-if="isEditing">
                    <label
                      class="block text-sm font-medium mb-1 dark:text-gray-300"
                    >
                      {{ $t("stock.currentQty") || "Current quantity" }}
                    </label>
                    <input
                      v-model="form.current_quantity"
                      disabled
                      class="w-full border rounded px-3 py-2 bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium mb-1 dark:text-gray-300"
                    >
                      {{ $t("stock.addQty") || "Add quantity" }}
                    </label>
                    <input
                      type="number"
                      v-model="form.addQuantity"
                      class="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      :placeholder="$t('stock.addQtyPlaceholder') || 'e.g. 10'"
                    />
                  </div>
                </div>

                <div class="flex justify-end pt-4 space-x-2">
                  <button
                    @click="closeModal"
                    class="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-full text-sm"
                  >
                    {{ $t("common.cancel") || "Cancel" }}
                  </button>
                  <button
                    @click="updateStock"
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm"
                  >
                    {{
                      isEditing
                        ? $t("stock.update") || "Update"
                        : $t("stock.add") || "Add"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </teleport>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from "@/components/Common/AppLayout.vue";
import { ref, computed, onMounted, onUnmounted, onDeactivated, h } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { useI18n } from "vue-i18n";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  X,
} from "lucide-vue-next";

const { locale } = useI18n();
const toast = createToastInterface();

/* ===== Data ===== */
const stocks = ref([]);
const ingredients = ref([]);
const openModal = ref(false);
const isEditing = ref(false);
const showLowStockAlert = ref(false);
const lowStockItems = ref([]);

const form = ref({ ingredient_id: "", current_quantity: "", addQuantity: "" });

/* ===== Search ===== */
const search = ref("");

/* ===== Tri-state sorting ===== */
const defaultSort = { by: "ingredient", dir: "asc" }; // 'asc' | 'desc'
const sort = ref({ ...defaultSort });

function setSort(by) {
  if (sort.value.by !== by) {
    sort.value.by = by;
    sort.value.dir =
      by === "quantity" || by === "level" || by === "updated" ? "desc" : "asc";
  } else {
    if (sort.value.dir === "asc") sort.value.dir = "desc";
    else if (sort.value.dir === "desc")
      sort.value = { ...defaultSort }; // reset to default
    else sort.value.dir = "asc";
  }
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

/* ===== Abort-on-navigate ===== */
let _runId = 0;
const _controllers = ref([]);
const _cancelled = ref(false);

function _startNewRun() {
  _cancelled.value = false;
  _runId += 1;
  return _runId;
}
function _isStale(runId) {
  return _cancelled.value || runId !== _runId;
}
function _track(ctrl) {
  _controllers.value.push(ctrl);
}
function _untrack(ctrl) {
  _controllers.value = _controllers.value.filter((c) => c !== ctrl);
}
function cancelAll() {
  _cancelled.value = true;
  for (const c of _controllers.value) {
    try {
      c.abort();
    } catch {}
  }
  _controllers.value = [];
}

async function _get(url, config = {}) {
  const controller = new AbortController();
  _track(controller);
  try {
    return await api.get(url, { ...config, signal: controller.signal });
  } finally {
    _untrack(controller);
  }
}

/* ===== Helpers ===== */
function localizedIngName(ing) {
  return locale.value === "km" ? ing?.name_kh || ing?.name : ing?.name;
}
const collator = computed(
  () => new Intl.Collator(locale.value || undefined, { sensitivity: "base" })
);

function formatDate(dateTime) {
  const loc = locale.value === "km" ? "km-KH" : undefined;
  try {
    return new Date(dateTime).toLocaleString(loc);
  } catch {
    return new Date(dateTime).toLocaleString();
  }
}

/* ==== NEW: threshold-aware helpers ==== */
function maxFor(stock) {
  // keep existing behavior; ensure max isn't less than current qty
  const configuredMax = parseFloat(stock?.ingredient?.max_quantity ?? 0);
  const qty = parseFloat(stock?.quantity ?? 0);
  return isFinite(configuredMax) && configuredMax > 0
    ? configuredMax
    : Math.max(qty, 100);
}

function lowThreshold(stock) {
  const t = parseFloat(stock?.ingredient?.low_alert_qty ?? NaN);
  if (isFinite(t) && t >= 0) return t;
  // fallback to 20% of max when not configured
  return 0.2 * maxFor(stock);
}

const getStockLevel = (stock) => {
  const qty = parseFloat(stock.quantity);
  const pct = Math.round((qty / maxFor(stock)) * 100);
  return Math.min(100, Math.max(0, isFinite(pct) ? pct : 0));
};

function isLow(stock) {
  const qty = parseFloat(stock?.quantity ?? 0);
  return qty <= lowThreshold(stock);
}

/* ===== Low-stock banner ===== */
function checkLowStock() {
  lowStockItems.value = (stocks.value || []).filter(isLow);
  if (lowStockItems.value.length > 0) {
    showLowStockAlert.value = true;
    setTimeout(() => (showLowStockAlert.value = false), 6000);
  }
}

/* ===== Derived list (search + sort) ===== */
const filteredStocks = computed(() => {
  let arr = stocks.value || [];

  if (search.value) {
    const s = search.value.toLowerCase();
    arr = arr.filter((stock) => {
      const en = stock.ingredient?.name?.toLowerCase() || "";
      const km = stock.ingredient?.name_kh?.toLowerCase() || "";
      return en.includes(s) || km.includes(s);
    });
  }

  const by = sort.value.by;
  const dir = sort.value.dir;
  const mul = dir === "asc" ? 1 : -1;

  return [...arr].sort((a, b) => {
    if (by === "ingredient") {
      const an = localizedIngName(a.ingredient) || "";
      const bn = localizedIngName(b.ingredient) || "";
      return collator.value.compare(an, bn) * mul;
    }
    if (by === "quantity") {
      const qa = parseFloat(a.quantity) || 0;
      const qb = parseFloat(b.quantity) || 0;
      return (qa - qb) * mul;
    }
    if (by === "level") {
      const la = getStockLevel(a);
      const lb = getStockLevel(b);
      return (la - lb) * mul;
    }
    if (by === "updated") {
      const ta = new Date(a.updated_at).getTime() || 0;
      const tb = new Date(b.updated_at).getTime() || 0;
      return (ta - tb) * mul;
    }
    return 0;
  });
});

/* ===== Modal & CRUD ===== */
const selectedIngredientName = computed(() => {
  const match = ingredients.value.find(
    (i) => i.id === form.value.ingredient_id
  );
  return match ? `${localizedIngName(match)} (${match.unit})` : "";
});
const availableIngredients = computed(() => {
  const existingIds = (stocks.value || []).map((s) => s.ingredient.id);
  return (ingredients.value || []).filter((i) => !existingIds.includes(i.id));
});

function closeModal() {
  form.value = { ingredient_id: "", current_quantity: "", addQuantity: "" };
  openModal.value = false;
  isEditing.value = false;
}
function openAddForm() {
  form.value = { ingredient_id: "", addQuantity: "" };
  isEditing.value = false;
  openModal.value = true;
}
function editStock(stock) {
  form.value = {
    ingredient_id: stock.ingredient.id,
    current_quantity: stock.quantity,
    addQuantity: "",
  };
  isEditing.value = true;
  openModal.value = true;
}
async function updateStock() {
  try {
    let newQuantity = 0;
    if (isEditing.value) {
      const currentStock = stocks.value.find(
        (s) => s.ingredient.id === form.value.ingredient_id
      );
      const currentQty = parseFloat(currentStock?.quantity ?? 0);
      const additionalQty = parseFloat(form.value.addQuantity || 0);
      newQuantity = currentQty + additionalQty;
    } else {
      newQuantity = parseFloat(form.value.addQuantity || 0);
    }
    if (!isFinite(newQuantity) || newQuantity < 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    await api.post("/stocks", {
      ingredient_id: form.value.ingredient_id,
      quantity: newQuantity,
    });
    toast.success(
      isEditing.value
        ? "Stock updated successfully!"
        : "Stock added successfully!"
    );
    closeModal();
    await fetchAll(); // refresh using abort-safe fetch
  } catch (err) {
    console.error("Update Error:", err);
    toast.error("Failed to update stock.");
  }
}

/* ===== Fetch (abort-safe) ===== */
async function fetchAll() {
  const rid = _startNewRun();
  try {
    const [stocksRes, ingredientsRes] = await Promise.allSettled([
      _get("/stocks"),
      _get("/ingredients"),
    ]);
    if (_isStale(rid)) return;

    if (stocksRes.status === "fulfilled") {
      stocks.value = stocksRes.value.data || [];
      checkLowStock();
    }
    if (ingredientsRes.status === "fulfilled") {
      ingredients.value = ingredientsRes.value.data || [];
    }
  } catch (e) {
    if (!_isStale(rid)) console.error("Fetch failed", e);
  }
}

/* ===== Sort icon (functional) ===== */
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
      [h(ChevronsUpDown, { class: "w-3 h-3" })]
    );
  }
  return h(
    "span",
    {
      class:
        "inline-block ml-1 align-middle text-purple-600 dark:text-purple-300",
      "aria-hidden": "true",
    },
    [h(dir === "asc" ? ChevronUp : ChevronDown, { class: "w-3 h-3" })]
  );
};

/* ===== Lifecycle & cancellation ===== */
onMounted(fetchAll);
onBeforeRouteLeave(() => {
  cancelAll();
});
onDeactivated(() => {
  cancelAll();
});
onUnmounted(() => {
  cancelAll();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
