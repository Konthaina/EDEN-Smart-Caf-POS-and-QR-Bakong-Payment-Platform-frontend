<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md p-4 flex flex-col transition-all duration-200"
  >
    <!-- Product Image -->
    <div class="w-full h-32 rounded-xl overflow-hidden mb-3">
      <img
        :src="imageUrl"
        alt="Product Image"
        class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>

    <!-- Product Info -->
    <h3 class="font-semibold text-sm text-gray-800 dark:text-white truncate" :title="item.name">
      {{ item.name }}
    </h3>
    <p class="text-sm text-gray-500 dark:text-gray-300 mb-1">${{ formattedPrice }}</p>

    <!-- Add to Cart Button -->
    <div class="mt-auto flex justify-end">
      <button
        @click="$emit('add-to-cart', item)"
        class="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold flex items-center justify-center shadow transition"
        title="Add to cart"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { item } = defineProps({
  item: Object
})

const imageUrl = computed(() =>
  item?.image
    ? `http://188.166.196.32/storage/${item.image}`
    : 'https://via.placeholder.com/150?text=No+Image'
)

const formattedPrice = computed(() => {
  const price = parseFloat(item.price)
  return isNaN(price) ? '0.00' : price.toFixed(2)
})
</script>
