<template>
  <div class="w-full">
    <div class="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3 mb-2 border border-gray-100">
      <span class="text-xl text-gray-400 w-7 flex justify-center items-center">
        <component v-if="icon" :is="icon" class="w-5 h-5" />
      </span>
      <div class="flex-1">
        <div class="text-xs text-gray-400 font-medium">{{ label }}</div>
        <div class="font-semibold text-gray-800 text-base leading-6 truncate">{{ value || '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '' },
  icon: { type: [Object, Function], default: null },
});
</script>
