<template>
  <AppLayout>
    <div class="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center px-4">
      <div class="text-6xl mb-4">📊</div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
      <p class="text-gray-500 mb-6">This feature is under development and will be available soon.</p>
      <button
        @click="$router.back()"
        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full shadow transition"
      >
        ← Back to Dashboard
      </button>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Common/AppLayout.vue'
</script>
