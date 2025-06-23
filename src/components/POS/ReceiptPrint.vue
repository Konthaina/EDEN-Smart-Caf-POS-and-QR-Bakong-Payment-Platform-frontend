<template>
  <div class="top-0 bottom-0 print-area hidden print:flex justify-center w-full bg-white">
    <div class="w-[280px] p-4 text-[13px] font-mono text-black">
      <!-- Logo and Cafe Name -->
      <div class="text-center mb-2">
        <img src="/logo.png" alt="Cafe Logo" class="mx-auto h-12 mb-1" />
        <h2 class="text-lg font-bold uppercase tracking-wide">Eden Coffee</h2>
        <p class="text-xs text-gray-500">Fresh. Fast. Friendly.</p>
      </div>

      <!-- Order Info -->
      <div class="text-center text-xs mb-2">
        <p>{{ $t("receipt.order_id") }}: #{{ String(orderId).padStart(3, "0") }}</p>
        <p>{{ new Date().toLocaleString() }}</p>
      </div>

      <div class="border-t border-b border-gray-300 py-1 text-sm font-semibold mb-1 flex justify-between">
        <span>Qty</span>
        <span>Item</span>
        <span class="text-right">Amount</span>
      </div>

      <!-- Item List -->
      <div v-for="item in cart" :key="item.id" class="text-sm mb-1">
        <div class="flex justify-between">
          <span>x{{ item.qty }}</span>
          <span class="text-left truncate w-[120px]">{{ item.name }}</span>
          <span class="text-right">${{ format(item.price * item.qty) }}</span>
        </div>
        <div class="text-xs text-gray-500 flex justify-between mb-1 pl-2">
          <span class="italic">@ ${{ format(item.price) }}</span>
          <span class="text-right">Subtotal</span>
        </div>
      </div>

      <hr class="my-2 border-dashed border-gray-400" />

      <!-- Totals -->
      <div class="flex justify-between text-sm">
        <span>{{ $t("receipt.subtotal") }}</span>
        <span>${{ format(total) }} USD</span>
      </div>

      <div v-if="discount && discount.value" class="flex justify-between text-green-700 text-sm">
        <span>{{ $t("receipt.promo_discount") }}</span>
        <span>-{{ discountText }}</span>
      </div>

      <div v-if="manualDiscount > 0" class="flex justify-between text-green-700 text-sm">
        <span>{{ $t("receipt.manual_discount") }}</span>
        <span>-{{ manualDiscount }}%</span>
      </div>

      <div class="flex justify-between font-bold text-base border-t border-black mt-2 pt-2">
        <span>{{ $t("receipt.total") }}</span>
        <span>${{ format(discountedTotal) }} USD</span>
      </div>

      <!-- Footer Info -->
      <div class="mt-4 text-xs text-center text-gray-700">
        <p>{{ $t("receipt.pay_by") }}: <span class="capitalize">{{ selectedMethod }}</span></p>
        <p>{{ $t("receipt.cashier") }}: {{ user?.name || $t("receipt.unknown") }}</p>
      </div>

      <div class="mt-3 text-xs text-center text-black font-medium tracking-wide">
        {{ $t("receipt.thanks") }} ❤️
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  cart: Array,
  user: Object,
  selectedMethod: String,
  orderId: Number,
  total: Number,
  discount: Object,
  manualDiscount: Number,
  discountedTotal: Number,
});

const format = (v) => parseFloat(v).toFixed(2);

const discountText = computed(() => {
  if (!props.discount || !props.discount.value) return "";
  return props.discount.type === "percent"
    ? `${props.discount.value}%`
    : `$${props.discount.value}`;
});
</script>

<style scoped>
@media print {
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  /* Hide everything on the page by default when printing */
  body * {
    visibility: hidden !important;
  }

  /* Make only the print-area and its children visible when printing */
  .print-area,
  .print-area * {
    visibility: visible !important;
  }

  .print-area {
    position: fixed !important; /* Fix its position for printing */
    inset: 0; /* Cover the whole viewport */
    background: white;
    width: 100%;
    justify-content: center;
    align-items: start;
    padding-top: 20px;
    z-index: 9999; /* Ensure it's on top */
  }

  @page {
    size: auto; /* Let the printer determine page size, or specify (e.g., 'A7 landscape') */
    margin: 0; /* Remove default page margins */
  }

  html,
  body {
    height: auto !important; /* Allow content to dictate height */
    overflow: visible !important; /* Ensure all content is visible */
  }
}
</style>