<template>
  <div
    class="bg-white dark:bg-[#181f35] border border-gray-100 dark:border-[#26335A] rounded-2xl p-5 shadow"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40"
        >
          <Egg class="w-4 h-4 text-emerald-600 dark:text-emerald-200" />
        </span>
        <h3 class="font-semibold text-gray-800 dark:text-white">
          Low Stock Alerts
        </h3>
      </div>

      <RouterLink
        :to="{ name: 'Stock' }"
        class="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        Manage stock
      </RouterLink>
    </div>

    <div class="overflow-x-auto -mx-3 sm:mx-0">
      <table class="min-w-full text-sm">
        <thead class="text-gray-500">
          <tr class="text-left">
            <th class="px-3 sm:px-4 py-2 w-1/2">Ingredient</th>
            <th class="px-3 sm:px-4 py-2 w-24">Qty</th>
            <th class="px-3 sm:px-4 py-2 w-32">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in lowList"
            :key="s.id"
            class="border-t border-gray-100 dark:border-gray-700"
          >
            <td class="px-3 sm:px-4 py-2">
              <div class="flex items-center gap-2">
                <span
                  class="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold"
                >
                  {{ initials(s.ingredient?.name) }}
                </span>
                <span class="font-medium">{{ s.ingredient?.name }}</span>
              </div>
            </td>
            <td class="px-3 sm:px-4 py-2 tabular-nums">
              {{ s.quantity }}
              <span class="text-xs text-gray-400">/ {{ s.unit }}</span>
            </td>
            <td class="px-3 sm:px-4 py-2">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                  s.badgeClass,
                ]"
                :title="`Alert at ≤ ${s.lowThresholdDisplay} ${s.unit}`"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                {{ s.statusLabel }}
              </span>
            </td>
          </tr>

          <tr v-if="!lowList.length">
            <td colspan="3" class="px-3 sm:px-4 py-8 text-center text-gray-500">
              All good — no low stock items.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/plugins/axios";
import { Egg } from "lucide-vue-next";

// Optional prop kept for backwards compatibility (used only if nothing else is available)
const props = defineProps({
  lowThreshold: {
    type: Number,
    default: 10,
  },
});

const stocks = ref([]);

/* === UI helpers === */
function initials(n) {
  if (!n) return "?";
  const p = n.trim().split(" ");
  return (p[0][0] || "").toUpperCase() + ((p[1] || "")[0] || "").toUpperCase();
}

/* === Stock math with per-ingredient thresholds === */
function safeMax(qty, ing) {
  const configured = Number(ing?.max_quantity ?? 0);
  return isFinite(configured) && configured > 0
    ? configured
    : Math.max(Number(qty) || 0, 100);
}
function lowThresholdFor(qty, ing) {
  const raw = Number(ing?.low_alert_qty);
  if (isFinite(raw) && raw >= 0) return raw; // explicit per-ingredient threshold
  return 0.2 * safeMax(qty, ing); // fallback: 20% of max
}
function isLowQty(qty, ing) {
  return Number(qty) <= lowThresholdFor(qty, ing);
}

/* === Fetch + normalize rows === */
async function fetchStocks() {
  const res = await api.get("/stocks"); // returns Stock with ingredient
  const rows = res.data || [];

  stocks.value = rows.map((r) => {
    const qty = Number(r.quantity ?? 0);
    const ing = r.ingredient || {};
    const unit = ing.unit || "";
    const lowT = lowThresholdFor(qty, ing);

    let statusLabel = "OK";
    let badgeClass = "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30";

    if (qty === 0) {
      statusLabel = "Out of stock";
      badgeClass = "text-rose-600 bg-rose-100 dark:bg-rose-900/30";
    } else if (isLowQty(qty, ing)) {
      statusLabel = "Low";
      badgeClass = "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
    }

    return {
      ...r,
      quantity: qty,
      unit,
      statusLabel,
      badgeClass,
      _lowT: lowT, // keep numeric for sorting/filtering
      lowThresholdDisplay: isFinite(lowT) ? lowT : props.lowThreshold,
    };
  });
}

/* === List: items that are 0 or below the per-ingredient low threshold === */
const lowList = computed(() =>
  stocks.value
    .filter((s) => s.quantity === 0 || s.quantity <= s._lowT)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 6)
);

onMounted(fetchStocks);
</script>
