<template>
  <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2">
    <!-- Item Info -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-gray-800 dark:text-white truncate" :title="item.name">{{ item.name }}</p>
      <p class="text-xs text-gray-500 dark:text-gray-300">{{ item.qty }} × ${{ formatPrice(item.price) }}</p>
    </div>

    <!-- Remove Button -->
    <button
      @click="$emit('remove', item.id)"
      class="ml-4 text-red-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium transition"
    >
      ✕ Remove
    </button>
  </div>
</template>

<script setup>
const props = defineProps({ item: Object })
defineEmits(['remove'])

const formatPrice = (price) => {
  const p = parseFloat(price)
  return isNaN(p) ? '0.00' : p.toFixed(2)
}
</script>
