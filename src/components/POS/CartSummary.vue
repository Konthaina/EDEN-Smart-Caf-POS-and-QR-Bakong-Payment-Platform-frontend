<!-- PaymentCartItems.vue -->
<template>
  <div
    :lang="locale"
    class="w-96 p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto no-scrollbar flex flex-col border-l border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 khmer-support"
  >
    <!-- Header -->
    <div class="flex items-center mb-4">
      <h2 class="text-lg font-semibold text-purple-700 dark:text-purple-400">
        🛒 {{ $t("payment.cart_items") }}
      </h2>
    </div>

    <!-- Item List -->
    <div class="flex-1 overflow-y-auto no-scrollbar pr-1 mb-4">
      <div
        v-if="cart.length === 0"
        class="text-gray-400 dark:text-gray-500 text-sm"
      >
        {{ $t("payment.cart_empty") }}
      </div>

      <div
        v-for="(item, idx) in cart"
        :key="idx"
        class="flex gap-3 items-center mb-3"
      >
        <img
          :src="getImage(item.image)"
          class="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-800"
          alt=""
        />

        <div class="flex-1 text-sm min-w-0">
          <div class="font-semibold text-gray-800 dark:text-gray-100 truncate">
            {{ item.name }}
          </div>

          <!-- Variant (single line, no brackets) -->
          <div
            v-if="variantName(item)"
            class="text-xs text-purple-700 dark:text-purple-300"
          >
            {{ $t("menu.variant") || "Variant" }}: {{ variantName(item) }}
          </div>

          <div class="text-gray-400 dark:text-gray-500 text-xs">
            {{ $t("cart.code") }}: {{ item.id }}
          </div>

          <!-- Discount-aware price row (variant-first) -->
          <div class="text-gray-600 dark:text-gray-300 flex items-center gap-2">
            {{ item.qty }} × ${{ format(unitPrice(item)) }}
            <span
              v-if="isDiscounted(item)"
              class="line-through text-xs text-gray-400"
            >
              ${{ format(originalPrice(item)) }}
            </span>
          </div>

          <!-- Customizations (comma separated, variant excluded) -->
          <div
            v-if="prettyCustomizations(item)"
            class="text-xs text-purple-700 dark:text-purple-300 mt-1 truncate"
            :title="prettyCustomizations(item)"
          >
            {{ prettyCustomizations(item) }}
          </div>

          <!-- Note -->
          <div
            v-if="item.note"
            class="text-xs text-gray-500 dark:text-gray-400 italic"
          >
            {{ $t("receipt.note") }}: {{ item.note }}
          </div>
        </div>

        <!-- Line total -->
        <div
          class="text-sm font-semibold text-gray-700 dark:text-gray-100 whitespace-nowrap"
        >
          ${{ format(unitPrice(item) * (item.qty || 0)) }}
        </div>
      </div>
    </div>

    <!-- Totals / Summary -->
    <div
      class="mt-auto border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200"
    >
      <div class="flex justify-between">
        <span>Subtotal:</span>
        <span>${{ format(total) }}</span>
      </div>

      <div
        v-if="discount && discount.value"
        class="flex justify-between text-green-600 dark:text-green-400"
      >
        <span>Promo Discount:</span>
        <span>- ${{ format(discountAmount) }}</span>
      </div>

      <div v-if="taxAmount > 0" class="flex justify-between">
        <span>Tax ({{ taxRate }}%):</span>
        <span>${{ format(taxAmount) }}</span>
      </div>

      <div
        class="flex justify-between text-base font-bold pt-2 text-purple-700 dark:text-purple-400"
      >
        <span>{{ $t("payment.total") }}:</span>
        <span>${{ format(discountedTotal) }}</span>
      </div>

      <div
        v-if="isCash && !canPay"
        class="text-xs text-red-600 dark:text-red-400 mt-1"
      >
        {{ $t("payment.insufficient_cash") || "Insufficient cash provided." }}
        <span> ({{ $t("payment.need") || "Need" }} ${{ shortage }}) </span>
      </div>
    </div>

    <!-- Bottom actions: spaced apart + red Close -->
    <div class="mt-6 flex items-center justify-between gap-4">
      <button
        type="button"
        @click="$emit('close')"
        class="px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm"
      >
        {{ $t("common.close") || "Close" }}
      </button>

      <button
        type="button"
        @click="$emit('pay')"
        :disabled="!canPay"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:dark:bg-gray-700 disabled:dark:text-gray-300 disabled:cursor-not-allowed"
      >
        {{ $t("payment.pay_now") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { storageUrl } from "@/config/urls";

const { locale } = useI18n();

const props = defineProps({
  cart: Array,
  total: Number,
  discountedTotal: Number,
  discount: Object,
  discountText: String,
  taxAmount: Number,
  taxRate: Number,
  selectedMethod: String,
  tenderedAmount: { type: [Number, String], default: 0 },
});

/* ---------------- helpers ---------------- */
const getImage = (img) => storageUrl(img, "menu.png");

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/* Variant-aware original price (used for strike-through) */
const originalPrice = (it) => {
  if (it?.variant_id && it?.variant_price != null) return num(it.variant_price);
  return num(it?.price);
};

/* Variant-aware unit price (what we charge) */
const unitPrice = (it) => {
  // Snapshot set by cart (authoritative)
  if (it?.unit_price != null) return num(it.unit_price);

  // Fallbacks (usually not hit if cart set snapshot)
  if (it?.variant_id) {
    if (it?.variant_final_price != null) return num(it.variant_final_price);
    if (it?.variant_price != null) {
      const base = num(it.variant_price);
      const t = it?.discount_type;
      const dv = it?.discount_value;
      if (t && dv != null) {
        return t === "percent"
          ? Math.max(0, +(base - base * (Number(dv) / 100)).toFixed(2))
          : Math.max(0, +(base - Number(dv)).toFixed(2));
      }
      return base;
    }
  }
  if (it?.has_active_discount && it?.final_price != null)
    return num(it.final_price);
  if (it?.discount_type && it?.discount_value != null) {
    const base = num(it.price);
    return it.discount_type === "percent"
      ? Math.max(
          0,
          +(base - base * (Number(it.discount_value) / 100)).toFixed(2)
        )
      : Math.max(0, +(base - Number(it.discount_value)).toFixed(2));
  }
  return num(it?.price);
};

const isDiscounted = (it) => unitPrice(it) < originalPrice(it) - 1e-9;

const format = (v) => (isNaN(v) ? "0.00" : Number(v).toFixed(2));

/* ---------------- variant & customization display ---------------- */
const lc = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase();
function variantName(item) {
  if (item?.variant_name) return item.variant_name;
  const v = (item?.customizations || []).find((c) => lc(c.type) === "variant");
  return v?.value || null;
}
function prettyCustomizations(item) {
  const list = Array.isArray(item?.customizations) ? item.customizations : [];
  const seen = new Set();
  const parts = [];
  for (const c of list) {
    const type = lc(c.type);
    const value = String(c.value ?? "").trim();
    if (!type || !value || type === "variant") continue;
    const key = `${type}|${value.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    parts.push(`${label}: ${value}`);
  }
  return parts.join(", ");
}

/* ---------------- totals & payment ---------------- */
const discountAmount = computed(() => {
  if (!props.discount || !props.discount.value) return 0;
  return props.discount.type === "percent"
    ? (props.total || 0) * (props.discount.value / 100)
    : Math.min(props.discount.value, props.total || 0);
});

const isCash = computed(
  () => String(props.selectedMethod || "").toLowerCase() === "cash"
);
const tendered = computed(() => parseFloat(props.tenderedAmount || 0) || 0);
const needed = computed(() => parseFloat(props.discountedTotal || 0) || 0);
const canPay = computed(() => !isCash.value || tendered.value >= needed.value);
const shortage = computed(() =>
  Math.max(0, needed.value - tendered.value).toFixed(2)
);
</script>

<style scoped>
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
