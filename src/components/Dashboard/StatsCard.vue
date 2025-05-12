
<template>
  <div class="bg-white p-4 rounded shadow text-center">
    <div class="text-2xl">{{ icon }}</div>
    <div class="text-sm text-gray-500">{{ title }}</div>
    <div class="text-xl font-bold">{{ value }}</div>
  </div>
</template>

<script setup>
defineProps(['title', 'value', 'icon'])
</script>
