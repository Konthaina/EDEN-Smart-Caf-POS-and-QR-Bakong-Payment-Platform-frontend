<template>
  <div class="w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 flex flex-col h-fit max-h-[calc(100vh-100px)]">
    <!-- Header -->
    <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-3">🛒 {{ $t('cart.title') }}</h2>

    <!-- Item List -->
    <div class="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-hide">
      <div v-if="cart.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('cart.empty') }}
      </div>

      <div
        v-for="item in cart"
        :key="item.id"
        class="flex items-center gap-3 bg-white dark:bg-gray-800"
      >
        <!-- Image -->
        <img
          :src="getImageUrl(item.image)"
          alt="item"
          class="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
        />

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 dark:text-white truncate" :title="item.name">{{ item.name }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-300 truncate" :title="`${$t('cart.code')}: ${item.id}`">{{ $t('cart.code') }}: {{ item.id }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-200">{{ item.qty }} × ${{ formatPrice(item.price) }}</p>
        </div>

        <!-- Qty Controls -->
        <div class="flex items-center gap-1">
          <button
            @click="decrease(item.id)"
            :disabled="item.qty <= 1"
            class="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs font-bold text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >−</button>

          <input
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            :value="item.qty"
            @input="updateQty(item.id, $event.target.value)"
            class="w-10 h-7 text-center text-sm font-medium text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            @click="increase(item.id)"
            class="w-7 h-7 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
          >＋</button>
        </div>

        <!-- Remove -->
        <button
          @click="remove(item.id)"
          class="ml-1 text-gray-400 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-full p-1 transition"
          :title="$t('cart.remove')"
        >
          🗑
        </button>
      </div>
    </div>

    <!-- Divider -->
    <hr class="my-4 border-gray-200 dark:border-gray-700" />

    <!-- Footer -->
    <div class="space-y-3">
      <div class="flex justify-between items-center text-base font-semibold text-gray-800 dark:text-white">
        <span>{{ $t('cart.total') }}</span>
        <span>${{ formatPrice(total) }}</span>
      </div>

      <button
        @click="$emit('checkout')"
        class="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-full shadow transition duration-150"
      >
        {{ $t('cart.checkout') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePOSStore } from '@/store/pos'

const { t } = useI18n()

const {
  cart,
  removeFromCart,
  increaseQty,
  decreaseQty,
} = usePOSStore()

const updateQty = (id, value) => {
  const qty = parseInt(value)
  const index = cart.findIndex(i => i.id === id)
  if (index === -1 || isNaN(qty) || qty < 1) return
  cart[index].qty = qty
}

const formatPrice = (value) => {
  const p = parseFloat(value)
  return isNaN(p) ? '0.00' : p.toFixed(2)
}

const getImageUrl = (img) =>
  img ? `http://188.166.196.32/storage/${img}` : 'https://via.placeholder.com/100'

const total = computed(() =>
  cart.reduce((sum, item) => sum + item.qty * parseFloat(item.price), 0)
)

const increase = (id) => {
  increaseQty(id)
}

const decrease = (id) => {
  const index = cart.findIndex((i) => i.id === id)
  if (index === -1) return

  if (cart[index].qty <= 1) {
    cart.splice(index, 1)
  } else {
    cart[index].qty -= 1
  }
}

const remove = (id) => {
  const index = cart.findIndex((i) => i.id === id)
  if (index !== -1) {
    cart.splice(index, 1)
  }
}
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
