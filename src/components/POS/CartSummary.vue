<template>
  <div class="w-96 p-6 bg-gray-50 overflow-y-auto no-scrollbar flex flex-col border-l">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-purple-700">
        🛒 {{ $t("payment.cart_items") }}
      </h2>
      <button @click="$emit('close')" class="text-2xl font-light hover:text-red-500">
        &times;
      </button>
    </div>

    <div class="flex-1 overflow-y-auto no-scrollbar pr-1 mb-4">
      <div v-if="cart.length === 0" class="text-gray-400 text-sm">
        {{ $t("payment.cart_empty") }}
      </div>
      <div v-for="item in cart" :key="item.id" class="flex gap-3 items-center mb-3">
        <img :src="getImage(item.image)" class="w-10 h-10 object-cover rounded-lg" />
        <div class="flex-1 text-sm">
          <div class="font-semibold text-gray-800">{{ item.name }}</div>
          <div class="text-gray-400 text-xs">{{ $t("cart.code") }}: {{ item.id }}</div>
          <div class="text-gray-600">{{ item.qty }} × ${{ format(item.price) }}</div>
        </div>
        <div class="text-sm font-semibold text-gray-700">{{ item.qty }}</div>
      </div>
    </div>

    <div class="mt-auto border-t pt-4 space-y-2 text-sm text-gray-700">
      <div v-if="discount">Promo Code: <span class="text-green-600">-{{ discountText }}</span></div>
      <div v-if="manualDiscount > 0">Manual Discount: <span class="text-green-600">-{{ manualDiscount }}%</span></div>
      <div v-if="total !== discountedTotal" class="text-red-600">
        Total Discount: ${{ format(total - discountedTotal) }}
      </div>
      <div class="flex justify-between text-base font-bold pt-2">
        <span>{{ $t("payment.total") }}:</span>
        <span>${{ format(discountedTotal) }}</span>
      </div>
    </div>

    <button
      @click="$emit('pay')"
      class="mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-full font-semibold text-sm"
    >
      {{ $t("payment.pay_now") }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  cart: Array,
  total: Number,
  discountedTotal: Number,
  discount: Object,
  manualDiscount: Number,
  discountText: String,
});

const format = (v) => parseFloat(v).toFixed(2);
const getImage = (img) =>
  img ? `http://127.0.0.1:8000/storage/${img}` : "/menu.png";
</script>
