<template>
  <div
    class="group w-full h-full rounded-2xl overflow-hidden border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200"
  >
    <!-- Image -->
    <div class="relative">
      <img
        :src="imageUrl"
        :alt="item.name || 'Product Image'"
        loading="lazy"
        class="w-full aspect-[16/10] object-cover"
      />
      <div
        v-if="showOriginal"
        class="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow"
      >
        {{ $t("menu.sale") || "Sale" }}
      </div>
    </div>

    <!-- Info -->
    <div class="p-3 space-y-2">
      <!-- Name (alone) -->
      <div
        class="text-[15px] sm:text-[16px] font-semibold text-gray-900 dark:text-white truncate"
        :title="item.name"
      >
        {{ item.name }}
      </div>

      <!-- Details row: LEFT (column: Size then Price) ...... RIGHT (+) -->
      <div class="flex items-center justify-between gap-3">
        <!-- Left column -->
        <div class="min-w-0 flex flex-col gap-1">
          <!-- Size -->
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t("menu.size") || "Size" }}:
            <span class="font-medium">M</span>
            <!-- Replace with dynamic size if you have it, e.g.:
                 <span class="font-medium">{{ item.size_label || 'M' }}</span> -->
          </div>

          <!-- Price (stacked) -->
          <div class="leading-tight">
            <div
              v-if="showOriginal"
              class="text-[12px] text-gray-400 line-through"
            >
              ${{ originalPrice }}
            </div>
            <div
              class="text-[15px] sm:text-[16px] font-extrabold text-[#de3b40]"
            >
              ${{ formattedPrice }}
            </div>
          </div>
        </div>

        <!-- Right: add button -->
        <button
          @click="$emit('add-to-cart', item)"
          :title="$t('menu.add_to_cart')"
          class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[#7f55e0] text-white shadow-sm hover:bg-[#6c3bd7] active:bg-[#7148c6] transition"
          aria-label="Add to cart"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="7" y="3" width="2" height="10" rx="1"></rect>
            <rect x="3" y="7" width="10" height="2" rx="1"></rect>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storageUrl } from "@/config/urls";

const { item } = defineProps({
  item: { type: Object, required: true },
});

/* Image URL */
const imageUrl = computed(() => storageUrl(item?.image, "menu.png"));

/* Price helpers */
const showOriginal = computed(() => !!item?.has_active_discount);
const originalPrice = computed(() => Number(item?.price || 0).toFixed(2));

const effectivePrice = computed(() => {
  if (item?.has_active_discount && item?.final_price != null) {
    return Number(item.final_price);
  }
  if (item?.discount_type && item?.discount_value != null) {
    const base = Number(item?.price || 0);
    if (item.discount_type === "percent") {
      const v = base - base * (Number(item.discount_value) / 100);
      return Math.max(0, +v.toFixed(2));
    }
    const v = base - Number(item.discount_value);
    return Math.max(0, +v.toFixed(2));
  }
  return Number(item?.price || 0);
});

const formattedPrice = computed(() => effectivePrice.value.toFixed(2));
</script>
