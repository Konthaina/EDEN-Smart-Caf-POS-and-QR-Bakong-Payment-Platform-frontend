<template>
  <div class="w-80 bg-white rounded-xl p-4 shadow flex flex-col h-fit max-h-[calc(100vh-100px)]">
    <h2 class="text-xl font-bold text-gray-800 mb-2">Your cart</h2>

    <!-- Scrollable item list -->
    <div
      class="flex-1 space-y-3 overflow-y-auto pr-2 no-scrollbar"
    >
      <div v-if="cart.length === 0" class="text-gray-500">No items.</div>

      <div
        v-for="item in cart"
        :key="item.id"
        class="flex gap-3 items-center"
      >
        <!-- Image -->
        <img
          :src="getImageUrl(item.image)"
          alt="item"
          class="w-12 h-12 rounded object-cover"
        />

        <!-- Info -->
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-800">{{ item.name }}</div>
          <div class="text-xs text-gray-400">Code: {{ item.id }}</div>
          <div class="text-sm text-gray-600">
            {{ item.qty }} × ${{ formatPrice(item.price) }}
          </div>
        </div>

        <!-- Qty Controls -->
        <div class="flex items-center gap-1">
          <button
            @click="decrease(item.id)"
            class="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
          >−</button>
          <button
            @click="increase(item.id)"
            class="w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >＋</button>
        </div>

        <!-- Remove -->
        <button
          @click="remove(item.id)"
          class="ml-2 text-gray-400 hover:text-red-500 text-lg"
          title="Remove"
        >
          🗑
        </button>
      </div>
    </div>

    <!-- Divider -->
    <hr class="my-3" />

    <!-- Footer -->
    <div class="space-y-3">
      <div class="flex justify-between items-center text-base font-semibold">
        <span>Total:</span>
        <span>${{ formatPrice(total) }}</span>
      </div>

      <button
        @click="$emit('checkout')"
        class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-full"
      >
        Continue to check out
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePOSStore } from '@/store/pos';

const {
  cart,
  removeFromCart,
  increaseQty,
  decreaseQty,
} = usePOSStore();

const formatPrice = (value) => {
  const p = parseFloat(value);
  return isNaN(p) ? '0.00' : p.toFixed(2);
};

const getImageUrl = (img) =>
  img ? `http://localhost:8000/storage/${img}` : 'https://via.placeholder.com/100';

const total = computed(() =>
  cart.reduce((sum, item) => sum + item.qty * parseFloat(item.price), 0)
);

const increase = (id) => {
  increaseQty(id);
};

const decrease = (id) => {
  const index = cart.findIndex((i) => i.id === id);
  if (index === -1) return;

  if (cart[index].qty <= 1) {
    cart.splice(index, 1); 
  } else {
    cart[index].qty -= 1;
  }
};

const remove = (id) => {
  const index = cart.findIndex((i) => i.id === id);
  if (index !== -1) {
    cart.splice(index, 1); 
  }
};

</script>
