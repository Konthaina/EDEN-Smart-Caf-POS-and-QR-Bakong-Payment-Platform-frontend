<template>
  <RouterLink
    :to="to"
    class="flex items-center py-2 px-3 rounded-lg transition-all text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-300 text-gray-700 dark:text-white"
    active-class="bg-purple-100 font-semibold text-purple-700 dark:bg-purple-800 dark:text-purple-200"
    :class="[{ 'ml-5 text-sm': small }, collapsed ? 'justify-center' : 'justify-between']"
    :title="collapsed ? label : ''"
  >
    <!-- Left Side: Icon + Label -->
    <div class="flex items-center gap-2">
      <component :is="icon" class="w-4 h-4" />
      <span v-if="!collapsed" class="truncate">{{ label }}</span>
    </div>

    <!-- Badge -->
    <span
      v-if="badge && !collapsed"
      class="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm"
    >
      {{ badge }}
    </span>
  </RouterLink>
</template>

<script setup>
defineProps({
  to: String,
  label: String,
  icon: [Object, Function], // Use component object, not string
  badge: [String, Number],
  small: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
});
</script>
