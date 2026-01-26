<template>
  <AppLayout>
    <!-- PAGE SHELL -->
    <div :lang="locale" class="p-6 h-full flex flex-col min-h-0 khmer-support">
      <!-- CONTENT AREA splits into top (header) and scrollable bottom -->
      <div class="flex-1 min-h-0 flex flex-col gap-4">
        <!-- ── Top cluster: back/breadcrumb + header (no scroll) ─────────── -->
        <div class="space-y-4 shrink-0">
          <!-- Back / Breadcrumb -->
          <div class="flex items-center gap-3">
            <button
              @click="$router.back()"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-700 dark:text-purple-300"
              title="Back"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>{{ $t("common.back") || "Back" }}</span>
            </button>

            <div class="text-xs text-gray-500 dark:text-gray-400">
              <RouterLink :to="stockListLink" class="hover:underline">
                {{ $t("stock.title") || "Stock" }}
              </RouterLink>
              <span>/</span>
              <span>{{ ingName || "Detail" }}</span>
            </div>
          </div>

          <!-- Header -->
          <div
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800/60 border border-indigo-100/70 dark:border-gray-700 shadow-sm"
          >
            <div class="p-5 sm:p-6 flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h1
                  class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
                >
                  {{ ingName }}
                </h1>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  {{
                    $t("stock.subtitle") ||
                    "Manage current stock and adjustments"
                  }}
                </p>
              </div>

              <div class="text-right">
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ $t("stock.unit") || "Unit" }}
                </div>
                <div
                  class="text-base font-semibold text-gray-800 dark:text-gray-100"
                >
                  {{ unit || "—" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Bottom cluster: SCROLLABLE content ────────────────────────── -->
        <div class="flex-1 min-h-0">
          <div v-if="stock" class="h-full min-h-0 overflow-y-auto no-scrollbar">
            <!-- The grid itself can be tall; this scroller will take over when height is short -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
              <!-- Left: Overview -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Current status card -->
                <div
                  class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow"
                >
                  <div
                    class="flex flex-wrap items-center justify-between gap-4"
                  >
                    <div class="space-y-1">
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ $t("stock.currentQty") || "Current Quantity" }}
                      </div>
                      <div
                        class="text-2xl font-bold text-gray-900 dark:text-white"
                      >
                        <span>{{ qtyDisplay }}</span>
                        <span
                          class="text-base font-semibold text-gray-600 dark:text-gray-300"
                        >
                          {{ unit }}
                        </span>
                      </div>
                      <!-- Low alert hint -->
                      <div
                        class="text-xs mt-1"
                        :class="
                          isLow
                            ? 'text-red-600'
                            : 'text-gray-500 dark:text-gray-400'
                        "
                      >
                        <AlertTriangle class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />
                        {{ $t("stock.low") || "Low" }}
                        {{ $t("stock.alertAt") || "alert at" }}:
                        <span class="font-semibold"
                          >{{ lowQtyDisplay }} {{ unit }}</span
                        >
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ $t("stock.updated") || "Updated" }}
                      </div>
                      <div
                        class="text-sm font-medium text-gray-800 dark:text-gray-200"
                      >
                        {{ updatedAt }}
                      </div>
                    </div>
                  </div>

                  <!-- Progress -->
                  <div class="mt-5">
                    <div class="flex items-center justify-between text-xs mb-2">
                      <span class="text-gray-500 dark:text-gray-400">
                        {{ $t("stock.level") || "Level" }}
                      </span>
                      <span
                        class="px-2 py-0.5 rounded-full"
                        :class="levelBadgeClass"
                      >
                        {{ levelLabel }}
                      </span>
                    </div>

                    <div
                      class="relative w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden"
                    >
                      <div
                        class="h-3 rounded-full absolute top-0 left-0 flex items-center justify-center text-[10px] font-medium transition-all duration-500"
                        :style="{ width: level + '%' }"
                        :class="levelClass"
                      >
                        {{ level }}%
                      </div>
                    </div>

                    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span class="font-medium"
                        >{{ $t("stock.max") || "Max" }}:</span
                      >
                      <span>{{ maxDisplay }}</span>
                    </div>
                  </div>
                </div>

                <!-- Ingredient info -->
                <div
                  class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow"
                >
                  <h3
                    class="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3"
                  >
                    {{ $t("ingredient.title") || "Ingredient" }}
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div class="text-gray-500 dark:text-gray-400">
                        {{ $t("ingredient.name") || "Name" }}
                      </div>
                      <div class="font-medium text-gray-800 dark:text-gray-100">
                        {{ ingName }}
                      </div>
                    </div>
                    <div>
                      <div class="text-gray-500 dark:text-gray-400">
                        {{ $t("ingredient.unit") || "Unit" }}
                      </div>
                      <div class="font-medium text-gray-800 dark:text-gray-100">
                        {{ unit || "—" }}
                      </div>
                    </div>
                    <div>
                      <div class="text-gray-500 dark:text-gray-400">
                        {{ $t("ingredient.createdAt") || "Created" }}
                      </div>
                      <div class="font-medium text-gray-800 dark:text-gray-100">
                        {{ createdAt }}
                      </div>
                    </div>
                    <div>
                      <div class="text-gray-500 dark:text-gray-400">
                        {{ $t("stock.updated") || "Updated" }}
                      </div>
                      <div class="font-medium text-gray-800 dark:text-gray-100">
                        {{ updatedAt }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Quick Adjustments -->
              <div class="space-y-6">
                <!-- Add quantity -->
                <div
                  class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow"
                >
                  <h3
                    class="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3"
                  >
                    {{ $t("stock.addQty") || "Add Quantity" }}
                  </h3>
                  <div class="space-y-3">
                    <input
                      v-model.number="addAmount"
                      type="number"
                      min="0"
                      class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      :placeholder="$t('stock.addQtyPlaceholder') || 'e.g. 10'"
                    />
                    <button
                      @click="handleAdd"
                      class="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      {{ $t("stock.add") || "Add" }}
                    </button>
                  </div>
                </div>

                <!-- Deduct quantity -->
                <div
                  class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow"
                >
                  <h3
                    class="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3"
                  >
                    {{ $t("stock.deductQty") || "Deduct Quantity" }}
                  </h3>
                  <div class="space-y-3">
                    <input
                      v-model.number="deductAmount"
                      type="number"
                      min="0"
                      class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      :placeholder="
                        $t('stock.deductQtyPlaceholder') || 'e.g. 5'
                      "
                    />
                    <button
                      @click="handleDeduct"
                      class="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      {{ $t("stock.deduct") || "Deduct" }}
                    </button>
                  </div>
                </div>

                <!-- Set exact quantity -->
                <div
                  class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow"
                >
                  <h3
                    class="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3"
                  >
                    {{ $t("stock.setExact") || "Set Exact Quantity" }}
                  </h3>
                  <div class="space-y-3">
                    <input
                      v-model.number="setAmount"
                      type="number"
                      min="0"
                      class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      :placeholder="
                        $t('stock.setExactPlaceholder') || 'e.g. 120'
                      "
                    />
                    <button
                      @click="handleSet"
                      class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      {{ $t("stock.update") || "Update" }}
                    </button>
                  </div>
                </div>

                <!-- Danger: Zero out -->
                <div
                  class="rounded-2xl border border-red-200 dark:border-red-400/40 bg-red-50 dark:bg-red-900/30 p-5 shadow"
                >
                  <h3
                    class="text-sm font-semibold text-red-800 dark:text-red-200 mb-3"
                  >
                    {{ $t("stock.zeroOut") || "Zero out stock" }}
                  </h3>
                  <p class="text-xs text-red-700 dark:text-red-300 mb-3">
                    {{
                      $t("stock.zeroOutHint") ||
                      "Sets quantity to 0. This action is immediate."
                    }}
                  </p>
                  <button
                    @click="handleZero"
                    class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                  >
                    {{ $t("stock.zeroOut") || "Zero Out" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-else class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t("stock.loading") || "Loading..." }}
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from "@/components/Common/AppLayout.vue";
import { ref, computed } from "vue";
import { useRouter, useRoute, onBeforeRouteUpdate } from "vue-router";
import { AlertTriangle, ArrowLeft } from "lucide-vue-next";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";
import { useI18n } from "vue-i18n";
import "vue-toastification/dist/index.css";

const toast = createToastInterface();
const router = useRouter();
const route = useRoute();
const { locale, t } = useI18n();

// Back to list (supports your current route: name 'Stock' at /inventory/stock)
const stockListLink = computed(() =>
  router.hasRoute("Stock") ? { name: "Stock" } : "/inventory/stock"
);

const stock = ref(null);
const addAmount = ref();
const deductAmount = ref();
const setAmount = ref();

async function loadStock(id = route.params.id) {
  try {
    const res = await api.get(`/stocks/${id}`);
    stock.value = res.data;
  } catch (e) {
    console.error(e);
    toast.error(t("stock.errorLoad") || "Failed to load stock.");
    setTimeout(() => router.push(stockListLink.value), 800);
  }
}

/* ===== Derived values ===== */
const qty = computed(() => parseFloat(stock.value?.quantity ?? 0));
const unit = computed(() => stock.value?.ingredient?.unit || "");
const ingName = computed(
  () =>
    (locale.value === "km"
      ? stock.value?.ingredient?.name_kh || stock.value?.ingredient?.name
      : stock.value?.ingredient?.name) || "—"
);
const createdAt = computed(() =>
  formatDate(stock.value?.ingredient?.created_at)
);
const updatedAt = computed(() => formatDate(stock.value?.updated_at));

function safeMax() {
  const m = parseFloat(stock.value?.ingredient?.max_quantity ?? 0);
  return !isFinite(m) || m <= 0 ? Math.max(qty.value, 100) : m;
}

const maxQty = computed(() => safeMax());

// NEW: per-ingredient low alert qty (fallback to 20% of max)
const lowQty = computed(() => {
  const raw = parseFloat(stock.value?.ingredient?.low_alert_qty ?? NaN);
  if (isFinite(raw) && raw >= 0) return raw;
  return 0.2 * maxQty.value;
});
const isLow = computed(() => qty.value <= lowQty.value);

const level = computed(() => {
  const pct = Math.round(
    Math.min(100, (qty.value / (maxQty.value || 1)) * 100)
  );
  return isFinite(pct) ? pct : 0;
});

// Keep the familiar traffic colors for the bar; use isLow for labels/badges
const levelClass = computed(() => {
  if (level.value < 20) return "bg-red-500 text-white";
  if (level.value < 50) return "bg-yellow-400 text-black";
  return "bg-green-500 text-white";
});
const levelBadgeClass = computed(() => {
  if (isLow.value)
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
  if (level.value < 50)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200";
  return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
});
const levelLabel = computed(() => {
  if (isLow.value) return t("stock.low") || "Low";
  if (level.value < 50) return t("stock.medium") || "Medium";
  return t("stock.ok") || "OK";
});

const qtyDisplay = computed(() => (isFinite(qty.value) ? qty.value : 0));
const maxDisplay = computed(() =>
  isFinite(maxQty.value) ? maxQty.value : "—"
);
const lowQtyDisplay = computed(() =>
  isFinite(lowQty.value) ? lowQty.value : "—"
);

function formatDate(date) {
  try {
    const loc = locale.value === "km" ? "km-KH" : undefined;
    return date ? new Date(date).toLocaleString(loc) : "—";
  } catch {
    return date ? new Date(date).toLocaleString() : "—";
  }
}

/* ===== Actions ===== */
async function postQuantity(newQuantity) {
  await api.post("/stocks", {
    ingredient_id: stock.value.ingredient.id,
    quantity: newQuantity < 0 ? 0 : newQuantity,
  });
  await loadStock(stock.value.id || route.params.id);
}

async function handleAdd() {
  if (!isFinite(addAmount.value) || addAmount.value <= 0) {
    return toast.error(t("stock.enterValidAmount") || "Enter a valid amount.");
  }
  try {
    await postQuantity(qty.value + addAmount.value);
    toast.success(t("stock.added") || "Added quantity!");
    addAmount.value = undefined;
  } catch (e) {
    console.error(e);
    toast.error(t("stock.errorUpdate") || "Failed to update.");
  }
}
async function handleDeduct() {
  if (!isFinite(deductAmount.value) || deductAmount.value <= 0) {
    return toast.error(t("stock.enterValidAmount") || "Enter a valid amount.");
  }
  try {
    await postQuantity(qty.value - deductAmount.value);
    toast.success(t("stock.deducted") || "Deducted quantity!");
    deductAmount.value = undefined;
  } catch (e) {
    console.error(e);
    toast.error(t("stock.errorUpdate") || "Failed to update.");
  }
}
async function handleSet() {
  if (!isFinite(setAmount.value) || setAmount.value < 0) {
    return toast.error(t("stock.enterValidAmount") || "Enter a valid amount.");
  }
  try {
    await postQuantity(setAmount.value);
    toast.success(t("stock.updated") || "Stock updated!");
    setAmount.value = undefined;
  } catch (e) {
    console.error(e);
    toast.error(t("stock.errorUpdate") || "Failed to update.");
  }
}
async function handleZero() {
  try {
    await postQuantity(0);
    toast.success(t("stock.updated") || "Stock updated!");
  } catch (e) {
    console.error(e);
    toast.error(t("stock.errorUpdate") || "Failed to update.");
  }
}

onBeforeRouteUpdate((to) => loadStock(to.params.id));
loadStock(route.params.id);
</script>

<style scoped>
/* Hide scrollbars but keep scrollability */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Khmer-friendly font stack */
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
