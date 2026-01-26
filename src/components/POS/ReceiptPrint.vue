<template>
  <div
    :lang="locale"
    class="top-0 bottom-0 print-area hidden print:flex justify-center w-full bg-white"
  >
    <div
      class="w-[280px] p-4 text-[13px] text-black khmer-support receipt-digits"
    >
      <!-- Logo + name -->
      <div class="text-center mb-2">
        <img
          :src="shopLogoUrl"
          alt="Cafe Logo"
          class="mx-auto h-12 mb-1"
          @error="onLogoError"
        />
        <h2 class="text-lg font-bold uppercase tracking-wide">
          {{ settings.shop_name || "Eden Coffee" }}
        </h2>
        <p class="text-xs text-gray-500">Fresh. Fast. Friendly.</p>
      </div>

      <!-- Order info -->
      <div class="text-center text-xs mb-2">
        <p>
          {{ $t("receipt.order_id") }}: #{{ String(orderId).padStart(3, "0") }}
        </p>
        <p>{{ new Date().toLocaleString() }}</p>
      </div>

      <!-- Header -->
      <div
        class="border-t border-b border-gray-300 py-1 text-sm font-semibold mb-1 flex justify-between"
      >
        <span>Qty</span><span>Item</span><span class="text-right">Amount</span>
      </div>

      <!-- Lines -->
      <div
        v-for="item in cart"
        :key="item.id + JSON.stringify(item.customizations) + (item.note || '')"
        class="text-sm mb-1"
      >
        <div class="flex justify-between">
          <span>x{{ item.qty }}</span>
          <span class="text-left truncate w-[120px]">{{ item.name }}</span>
          <span class="text-right"
            >${{ format(unitPrice(item) * (item.qty || 0)) }}</span
          >
        </div>

        <!-- per-line price (show original if discounted) -->
        <div
          class="text-xs text-gray-500 flex justify-between mb-1 pl-2 items-center gap-2"
        >
          <span class="italic">
            @ ${{ format(unitPrice(item)) }}
            <span v-if="isDiscounted(item)" class="line-through ml-1">
              ${{ format(originalPrice(item)) }}
            </span>
          </span>
          <span class="text-right">Subtotal</span>
        </div>

        <!-- Variant (single, no brackets) -->
        <div v-if="variantName(item)" class="text-xs text-purple-700 pl-2">
          {{ $t("menu.variant") || "Variant" }}: {{ variantName(item) }}
        </div>

        <!-- Customizations (comma separated, variant excluded) -->
        <div
          v-if="prettyCustomizations(item)"
          class="text-xs text-purple-700 pl-2"
        >
          {{ prettyCustomizations(item) }}
        </div>

        <div v-if="item.note" class="text-xs text-gray-500 pl-2 italic">
          {{ $t("receipt.note") }}: {{ item.note }}
        </div>
      </div>

      <hr class="my-2 border-dashed border-gray-400" />

      <!-- Totals -->
      <div class="flex justify-between text-sm">
        <span>{{ $t("receipt.subtotal") }}</span>
        <span>${{ format(total) }} USD</span>
      </div>

      <div
        v-if="discount && discount.value"
        class="flex justify-between text-green-700 text-sm"
      >
        <span>{{ $t("receipt.promo_discount") }}</span>
        <span>- ${{ format(discountAmount) }} USD</span>
      </div>

      <div v-if="taxRate > 0" class="flex justify-between text-sm">
        <span>Tax ({{ taxRate }}%)</span>
        <span>${{ format(taxAmount) }} USD</span>
      </div>

      <div v-if="exchangeRate" class="flex justify-between text-sm">
        <span>{{ $t("receipt.exchange_rate") || "Exchange Rate" }}</span>
        <span>1 USD = {{ exchangeRate.toLocaleString() }} ៛</span>
      </div>

      <div v-if="totalKhr" class="flex justify-between text-sm">
        <span>{{ $t("receipt.total_khr") || "Total in KHR" }}</span>
        <span>{{ totalKhr.toLocaleString() }} ៛</span>
      </div>

      <div
        class="flex justify-between font-bold text-base border-t border-black mt-2 pt-2"
      >
        <span>{{ $t("receipt.total") }}</span>
        <span>${{ format(discountedTotal) }} USD</span>
      </div>

      <!-- Footer -->
      <div class="mt-4 text-xs text-center text-gray-700">
        <p>
          {{ $t("receipt.pay_by") }}:
          <span class="capitalize">{{ selectedMethod }}</span>
        </p>
        <p>
          {{ $t("receipt.cashier") }}: {{ user?.name || $t("receipt.unknown") }}
        </p>
      </div>

      <div
        class="mt-3 text-xs text-center text-black font-medium tracking-wide"
      >
        <span class="inline-flex items-center gap-1">
          {{ $t("receipt.thanks") }}
          <Heart class="w-3.5 h-3.5 text-red-500" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Heart } from "lucide-vue-next";
import useSettings from "@/composables/useSettings";
import { publicUrl, storageUrl } from "@/config/urls";

const { locale } = useI18n();
const { settings } = useSettings();

/* ---------- logo ---------- */
const shopLogoUrl = computed(() =>
  storageUrl(settings.value.shop_logo, "logo.png")
);
function onLogoError(e) {
  e.target.src = publicUrl("logo.png");
}

/* ---------- props ---------- */
const props = defineProps({
  cart: Array,
  user: Object,
  selectedMethod: String,
  orderId: Number,
  total: Number,
  discount: Object,
  discountedTotal: Number,
  taxAmount: Number,
  taxRate: Number,
  exchangeRate: Number,
  totalKhr: Number,
});

/* ---------- price helpers (variant-aware) ---------- */
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Strike-through price: prefer variant's original price when selected */
const originalPrice = (it) => {
  if (it?.variant_id && it?.variant_price != null) return num(it.variant_price);
  return num(it?.price);
};

/** Unit price: snapshot > variant final > variant base (+parent discount) > item final/base */
const unitPrice = (it) => {
  // Snapshot set by cart during selection (authoritative)
  if (it?.unit_price != null) return num(it.unit_price);

  // Variant path
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

  // Item path
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

const format = (v) =>
  isNaN(v)
    ? "0.00"
    : Number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

/* ---------- variant & customizations ---------- */
const lc = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase();
/** Prefer field, fallback to customization */
function variantName(item) {
  if (item?.variant_name) return item.variant_name;
  const v = (item?.customizations || []).find((c) => lc(c.type) === "variant");
  return v?.value || null;
}
function prettyCustomizations(item) {
  const list = Array.isArray(item?.customizations) ? item.customizations : [];
  const seen = new Set();
  const out = [];
  for (const c of list) {
    const type = lc(c.type);
    const value = String(c.value ?? "").trim();
    if (!type || !value || type === "variant") continue;
    const key = `${type}|${value.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    out.push(`${label}: ${value}`);
  }
  return out.join(", ");
}

/* ---------- order-level discount ---------- */
const discountAmount = computed(() => {
  const d = props.discount;
  if (!d || !d.value) return 0;
  return d.type === "percent"
    ? (props.total || 0) * (d.value / 100)
    : Math.min(d.value, props.total || 0);
});
</script>

<style scoped>
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
.receipt-digits {
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}

@media print {
  body {
    margin: 0;
    padding: 0;
    background: white;
  }
  body * {
    visibility: hidden !important;
  }
  .print-area,
  .print-area * {
    visibility: visible !important;
  }
  .print-area {
    position: fixed !important;
    inset: 0;
    background: white;
    width: 100%;
    justify-content: center;
    align-items: start;
    padding-top: 20px;
    z-index: 9999;
  }
  @page {
    size: auto;
    margin: 0;
  }
  html,
  body {
    height: auto !important;
    overflow: visible !important;
  }
}
</style>
