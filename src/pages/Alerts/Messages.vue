<template>
  <AppLayout>
    <div class="p-6 space-y-8 max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="text-3xl">💬</div>
        <h1 class="text-2xl font-bold text-gray-800">Messages</h1>
      </div>

      <!-- Under Construction Card -->
      <div class="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300 rounded-2xl shadow-md p-6 text-center">
        <div class="text-xl font-semibold text-yellow-800 mb-2">🚧 Feature Under Development</div>
        <p class="text-sm text-yellow-700">
          We’re currently working on the messaging system. You’ll be able to send and receive messages soon.
        </p>
      </div>

      <!-- Placeholder UI (mock chat box) -->
      <div class="bg-white rounded-2xl shadow p-6 space-y-6 border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-700">Sample Messages</h2>

        <div class="space-y-4">
          <!-- Message 1 -->
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">A</div>
            <div class="bg-gray-100 rounded-lg p-3 text-sm text-gray-800 max-w-md">
              Hello! Just checking in on today’s orders. 😊
            </div>
          </div>

          <!-- Message 2 -->
          <div class="flex items-start gap-4 flex-row-reverse text-right">
            <div class="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">U</div>
            <div class="bg-green-50 rounded-lg p-3 text-sm text-gray-800 max-w-md">
              Hi! Everything looks great. We’re ready for the lunch crowd!
            </div>
          </div>

          <!-- Message 3 -->
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">A</div>
            <div class="bg-gray-100 rounded-lg p-3 text-sm text-gray-800 max-w-md">
              Great! Don’t forget to restock the espresso beans later.
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Common/AppLayout.vue'
</script>
