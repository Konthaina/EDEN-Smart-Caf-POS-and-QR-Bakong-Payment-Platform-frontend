<template>
  <div
    class="w-[370px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 flex flex-col h-fit max-h-[calc(100vh-150px)] relative"
  >
    <!-- Close Button -->
    <button
      class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition z-20"
      @click="$emit('close')"
      title="Close"
      type="button"
    >
      <svg
        viewBox="0 0 20 20"
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 6l8 8M6 14L14 6"
        />
      </svg>
    </button>

    <!-- Header -->
    <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-3 pr-10">
      🛒 {{ $t("cart.title") }}
    </h2>

    <!-- Item List -->
    <div class="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-hide">
      <div
        v-if="cart.length === 0"
        class="text-gray-500 dark:text-gray-400 text-sm"
      >
        {{ $t("cart.empty") }}
      </div>

      <CartItem
        v-for="(item, idx) in cart"
        :key="cartKey(item)"
        :item="item"
        @decrease="decrease(idx)"
        @increase="increase(idx)"
        @update-qty="updateQty(idx, $event)"
        @remove="remove(idx)"
        @customize="() => openCustomizeModal(item, idx)"
      />
    </div>

    <hr class="my-4 border-gray-200 dark:border-gray-700" />

    <!-- Footer -->
    <div class="space-y-3">
      <div
        class="flex justify-between items-center text-base font-semibold text-gray-800 dark:text-white"
      >
        <span>{{ $t("cart.total") }}</span>
        <span>${{ formatPrice(total) }}</span>
      </div>
      <button
        @click="$emit('checkout')"
        :disabled="cart.length === 0"
        class="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-full shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t("cart.checkout") }}
      </button>
    </div>

    <!-- Customization Modal -->
    <CustomizeCartItemModal
      v-if="showModal && editingItem"
      :mode="'edit'"
      :item="editingItem"
      :max-qty="editingItem?.qty || 1"
      :initial-qty="1"
      @close="closeCustomize()"
      @apply="onEditConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePOSStore } from "@/store/pos";
import CartItem from "./CartItem.vue";
import CustomizeCartItemModal from "./CustomizeCartItemModal.vue";

useI18n();
const { cart } = usePOSStore();

/* ---------------- Helpers ---------------- */
const norm = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

function moneyNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

/** Compute price that should be charged for a given variant object. */
function unitFromVariant(variant, parentLine) {
  if (!variant) return null;
  // Prefer backend-computed final_price if present
  const vf = Number(variant.final_price);
  if (Number.isFinite(vf)) return vf;

  // Else compute from variant's own fields (fall back to parent discount if needed)
  const base = moneyNum(variant.price);
  const t = variant.discount_type || parentLine?.discount_type || "";
  const v = variant.discount_value ?? parentLine?.discount_value ?? null;
  if (t && v != null) {
    if (t === "percent")
      return Math.max(0, +(base - base * (Number(v) / 100)).toFixed(2));
    return Math.max(0, +(base - Number(v)).toFixed(2));
  }
  return base;
}

/** Compute unit price for a line if no snapshot exists yet. */
function computeUnitFromLine(line) {
  // If the line already carries variant *price* fields but no snapshot, use them
  if (line?.variant_id) {
    const vFinal = Number(line.variant_final_price);
    const vPrice = Number(line.variant_price);
    if (Number.isFinite(vFinal)) return vFinal;
    if (Number.isFinite(vPrice)) {
      // Try to apply parent discount if line carries it
      const t = line?.discount_type;
      const val = line?.discount_value;
      if (t && val != null) {
        if (t === "percent")
          return Math.max(
            0,
            +(vPrice - vPrice * (Number(val) / 100)).toFixed(2)
          );
        return Math.max(0, +(vPrice - Number(val)).toFixed(2));
      }
      return vPrice;
    }
  }

  // Non-variant fallback: use item final_price/discount if present
  if (line?.has_active_discount && line?.final_price != null)
    return Number(line.final_price);
  const base = moneyNum(line?.price);
  const type = line?.discount_type;
  const val = line?.discount_value;
  if (type && val != null) {
    if (type === "percent")
      return Math.max(0, +(base - base * (Number(val) / 100)).toFixed(2));
    return Math.max(0, +(base - Number(val)).toFixed(2));
  }
  return base;
}

/** Public getter used across file: snapshot > compute */
function getUnitPrice(line) {
  if (line?.unit_price != null) return Number(line.unit_price);
  return computeUnitFromLine(line);
}

/* ---------------- Build a stable key so different variants don’t merge ---------------- */
function normalizedCustomizationsForKey(line) {
  const seen = new Set();
  const out = [];
  const list = Array.isArray(line?.customizations) ? line.customizations : [];

  for (const c of list) {
    const type = norm(c.type);
    const value = norm(c.value);
    if (!type || !value) continue;
    const key = `${type}|${value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ type, value });
  }

  // Ensure variant identity participates in the key
  const hasVariantCust = out.some((c) => c.type === "variant");
  if (!hasVariantCust && (line?.variant_id != null || line?.variant_name)) {
    const vKey = norm(String(line?.variant_id ?? line?.variant_name));
    if (vKey) out.push({ type: "variant", value: vKey });
  }

  out.sort((a, b) =>
    a.type === b.type
      ? a.value.localeCompare(b.value)
      : a.type.localeCompare(b.type)
  );
  return out;
}

function lineKeyOf(line) {
  const unit = getUnitPrice(line);
  const noteKey = norm(line?.note);
  const custKey = JSON.stringify(normalizedCustomizationsForKey(line));
  return `${line.id}|${unit.toFixed(2)}|${noteKey}|${custKey}`;
}

function cartKey(item) {
  return lineKeyOf(item);
}

/* ---------------- Merge cart lines ---------------- */
function buildMerged(items) {
  const out = [];
  const idxMap = new Map();
  let changed = false;

  for (const src of items) {
    const key = lineKeyOf(src);
    const pos = idxMap.get(key);
    if (pos != null) {
      out[pos].qty = Number(out[pos].qty || 0) + Number(src.qty || 0);
      changed = true;
    } else {
      out.push({ ...src, qty: Number(src.qty || 0) });
      idxMap.set(key, out.length - 1);
    }
  }
  const filtered = out.filter((l) => Number(l.qty) > 0);
  if (filtered.length !== out.length) changed = true;
  return { items: filtered, changed };
}

let merging = false;
function mergeCartInPlace() {
  if (merging) return;
  const { items, changed } = buildMerged(cart);
  if (!changed) return;
  merging = true;
  cart.splice(0, cart.length, ...items);
  merging = false;
}

watch(cart, () => mergeCartInPlace(), { deep: true });

/* ---------------- Customize modal ---------------- */
const showModal = ref(false);
const editingItem = ref(null);
const editingIdx = ref(null);

function openCustomizeModal(item, idx) {
  editingItem.value = { ...item };
  editingIdx.value = idx;
  showModal.value = true;
}
function closeCustomize() {
  showModal.value = false;
  editingItem.value = null;
  editingIdx.value = null;
}

/**
 * When user applies changes from Customize:
 * - If a variant is chosen, snapshot its price into `unit_price`
 * - Persist helper fields: variant_price / variant_final_price for correct display
 */
function onEditConfirm({ qty, customizations, note, variant }) {
  if (editingIdx.value === null) return;
  const orig = cart[editingIdx.value];
  if (!orig) return;

  // Decide the new unit price (variant wins)
  const unit = variant
    ? unitFromVariant(variant, orig)
    : computeUnitFromLine(orig);

  const setVariantFields = (line) => {
    if (variant) {
      line.variant_name = variant.name || null;
      line.variant_id = variant.id ?? null;
      line.variant_price = variant.price != null ? Number(variant.price) : null;
      line.variant_final_price =
        variant.final_price != null ? Number(variant.final_price) : null;
    } else {
      line.variant_name = null;
      line.variant_id = null;
      line.variant_price = null;
      line.variant_final_price = null;
    }
  };

  if (qty >= orig.qty) {
    // Replace current line
    orig.customizations = customizations;
    orig.note = note;
    setVariantFields(orig);
    orig.unit_price = unit; // snapshot!
  } else {
    // Split line
    orig.qty -= qty;
    const newLine = {
      ...orig,
      qty,
      customizations,
      note,
      unit_price: unit, // snapshot!
    };
    setVariantFields(newLine);
    cart.splice(editingIdx.value + 1, 0, newLine);
  }

  closeCustomize();
  mergeCartInPlace();
}

/* ---------------- Qty & totals ---------------- */
const updateQty = (idx, value) => {
  const qty = parseInt(value);
  if (isNaN(qty) || qty < 1) return;
  cart[idx].qty = qty;
  mergeCartInPlace();
};

const total = computed(() =>
  cart.reduce(
    (sum, line) => sum + Number(line.qty || 0) * getUnitPrice(line),
    0
  )
);

const increase = (idx) => {
  cart[idx].qty += 1;
  mergeCartInPlace();
};
const decrease = (idx) => {
  cart[idx].qty <= 1 ? cart.splice(idx, 1) : (cart[idx].qty -= 1);
  mergeCartInPlace();
};
const remove = (idx) => {
  cart.splice(idx, 1);
  mergeCartInPlace();
};

const formatPrice = (v) => {
  const n = Number(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
