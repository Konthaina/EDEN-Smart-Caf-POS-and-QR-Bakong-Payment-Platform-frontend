<template>
  <router-link
    :to="to"
    class="block"
    :title="collapsed && label ? label : ''"
    :class="[
      collapsed
        ? 'flex items-center justify-center px-2 py-2'
        : 'flex items-center gap-3 px-4 py-2',
      small ? 'text-xs' : 'text-base',
      active
        ? 'bg-purple-50 text-purple-700 font-semibold dark:bg-purple-900 dark:text-purple-200'
        : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white',
      'rounded-lg transition-colors duration-150 cursor-pointer select-none',
    ]"
  >
    <component :is="icon" class="w-5 h-5" />
    <span v-if="!collapsed" class="whitespace-nowrap">{{ label }}</span>
  </router-link>
</template>

<script setup>
defineProps({
  to: { type: [String, Object], required: true },
  label: String,
  icon: [Object, Function],
  collapsed: Boolean,
  active: Boolean,
  small: Boolean,
});
</script>
