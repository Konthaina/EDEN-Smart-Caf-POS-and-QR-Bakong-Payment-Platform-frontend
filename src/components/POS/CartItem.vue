<template>
  <div
    class="grid grid-cols-[48px,1fr] gap-3 items-start bg-white dark:bg-gray-800"
  >
    <!-- Image -->
    <img
      :src="getImageUrl(item.image)"
      alt="item"
      class="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
    />

    <!-- Right side -->
    <div class="flex flex-col gap-1 min-w-0">
      <!-- Title -->
      <div
        class="text-sm font-semibold text-gray-900 dark:text-white truncate"
        :title="item.name"
      >
        {{ item.name }}
      </div>

      <!-- Variant -->
      <div
        v-if="variantName"
        class="text-xs text-purple-600 truncate"
        :title="variantName"
      >
        {{ variantName }}
      </div>

      <!-- Price row -->
      <div
        class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap"
      >
        <span>{{ item.qty }} × ${{ formatPrice(unitPrice) }}</span>

        <span
          v-if="isDiscounted"
          class="line-through text-xs text-gray-400 dark:text-gray-400"
        >
          ${{ formatPrice(originalPrice) }}
        </span>

        <strong class="ml-auto text-gray-900 dark:text-white">
          ${{ formatPrice(lineTotal) }}
        </strong>
      </div>

      <!-- Customizations (excluding variant) -->
      <div
        v-if="customizationsText"
        class="text-xs text-purple-600 truncate"
        :title="customizationsText"
      >
        {{ customizationsText }}
      </div>

      <!-- Note -->
      <div
        v-if="item.note"
        class="text-xs text-gray-500 italic truncate"
        :title="item.note"
      >
        {{ item.note }}
      </div>
    </div>

    <!-- Controls -->
    <div class="col-span-2 flex items-center gap-2 mt-1 whitespace-nowrap">
      <button
        @click="$emit('decrease')"
        :disabled="item.qty <= 1"
        class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs font-bold text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="decrease"
        title="Decrease"
      >
        −
      </button>

      <input
        type="number"
        min="1"
        step="1"
        inputmode="numeric"
        :value="item.qty"
        @input="$emit('update-qty', $event.target.value)"
        class="w-10 h-8 text-center text-sm font-medium text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label="quantity"
      />

      <button
        @click="$emit('increase')"
        class="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
        aria-label="increase"
        title="Increase"
      >
        ＋
      </button>

      <button
        @click="$emit('remove')"
        class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
        :title="$t('cart.remove')"
        aria-label="remove"
      >
        🗑
      </button>

      <button
        @click="$emit('customize')"
        class="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200"
        :title="$t('cart.edit')"
        aria-label="customize"
      >
        ✎
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storageUrl } from "@/config/urls";

const props = defineProps({
  item: { type: Object, required: true },
});
defineEmits(["decrease", "increase", "update-qty", "remove", "customize"]);

/* ---------- Pricing ---------- */
// Original price should be the pre-discount price for the *selected variant* if present
const originalPrice = computed(() => {
  if (props.item?.variant_id && props.item?.variant_price != null) {
    return Number(props.item.variant_price);
  }
  return Number(props.item?.price || 0);
});

// Unit price (what we charge) – first prefer the snapshot set by Cart.vue
const unitPrice = computed(() => {
  const p = props.item || {};
  if (p.unit_price != null) return Number(p.unit_price);

  // (fallbacks – generally won't be hit because Cart.vue snapshots)
  if (p.variant_id) {
    if (p.variant_final_price != null) return Number(p.variant_final_price);
    if (p.variant_price != null) {
      const base = Number(p.variant_price);
      const t = p.discount_type,
        dv = p.discount_value;
      if (t && dv != null) {
        return t === "percent"
          ? Math.max(0, +(base - base * (Number(dv) / 100)).toFixed(2))
          : Math.max(0, +(base - Number(dv)).toFixed(2));
      }
      return base;
    }
  }
  if (p.has_active_discount && p.final_price != null)
    return Number(p.final_price);
  if (p.discount_type && p.discount_value != null) {
    const base = Number(p.price || 0);
    return p.discount_type === "percent"
      ? Math.max(
          0,
          +(base - base * (Number(p.discount_value) / 100)).toFixed(2)
        )
      : Math.max(0, +(base - Number(p.discount_value)).toFixed(2));
  }
  return Number(p.price || 0);
});

const isDiscounted = computed(
  () => unitPrice.value < originalPrice.value - 1e-9
);
const lineTotal = computed(
  () => Number(props.item.qty || 0) * unitPrice.value || 0
);

const formatPrice = (v) => {
  const n = Number(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

/* ---------- Variant label ---------- */
const variantName = computed(() => {
  if (props.item?.variant_name) return String(props.item.variant_name).trim();
  const found = (props.item?.customizations || []).find(
    (c) => String(c.type || "").toLowerCase() === "variant"
  );
  return found?.value ? String(found.value).trim() : "";
});

/* ---------- Customizations text (exclude variant) ---------- */
const customizationsText = computed(() => {
  const list = Array.isArray(props.item?.customizations)
    ? props.item.customizations
    : [];
  const seen = new Set();
  const parts = [];
  for (const c of list) {
    const typeRaw = String(c.type || "").trim();
    const type = typeRaw.toLowerCase();
    if (!type || type === "variant") continue;
    const value = String(c.value || "").trim();
    if (!value) continue;
    const key = `${type}|${value.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const label = typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1);
    parts.push(`${label}: ${value}`);
  }
  return parts.join(", ");
});

/* ---------- Image ---------- */
const getImageUrl = (img) => storageUrl(img, "menu.png");
</script>
