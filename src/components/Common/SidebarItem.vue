<template>
  <RouterLink
    :to="to"
    class="flex items-center justify-between py-2 px-3 rounded transition-all text-sm font-medium hover:bg-purple-50 text-gray-700"
    active-class="bg-purple-200 font-semibold text-purple-700"
    :class="{ 'text-sm ml-4': small }"
  >
    <div class="flex items-center gap-2">
      <span class="text-lg">{{ icon }}</span>
      <span>{{ label }}</span>
    </div>
    <span
      v-if="badge"
      class="bg-red-500 text-white text-xs px-2 rounded-full"
    >
      {{ badge }}
    </span>
  </RouterLink>
</template>

<script setup>
defineProps({
  to: String,
  label: String,
  icon: String,
  badge: [String, Number],
  small: {
    type: Boolean,
    default: false,
  }
});
</script>
