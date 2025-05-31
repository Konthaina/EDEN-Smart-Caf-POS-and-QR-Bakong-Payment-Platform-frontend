<template>
  <AppLayout>
    <div class="h-auto min-h-[calc(100vh-80px)] flex flex-col items-center justify-start text-center px-6 py-10 space-y-10">
      <!-- Coming Soon Icon -->
      <div class="text-6xl text-purple-500 animate-bounce mb-2">🔔</div>

      <!-- Title -->
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Notifications Coming Soon</h1>
        <p class="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
          We're working on delivering personalized notifications so you never miss an update.
        </p>
      </div>

      <!-- Sample Notification Preview -->
      <div class="bg-white shadow-md rounded-xl max-w-xl w-full p-6 space-y-4 text-left border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-700">📥 Sample Notifications</h2>

        <ul class="divide-y divide-gray-100 text-sm text-gray-600">
          <li class="py-3">
            <div class="flex items-start gap-2">
              <span class="text-purple-500 text-lg">✅</span>
              <div>
                <p><strong>Order #12345</strong> has been successfully completed.</p>
                <span class="text-xs text-gray-400">2 mins ago</span>
              </div>
            </div>
          </li>
          <li class="py-3">
            <div class="flex items-start gap-2">
              <span class="text-yellow-500 text-lg">⚠️</span>
              <div>
                <p><strong>Low stock alert:</strong> Milk is running low. Restock soon!</p>
                <span class="text-xs text-gray-400">10 mins ago</span>
              </div>
            </div>
          </li>
          <li class="py-3">
            <div class="flex items-start gap-2">
              <span class="text-blue-500 text-lg">📢</span>
              <div>
                <p><strong>New feature:</strong> Manual discounts are now available in POS checkout.</p>
                <span class="text-xs text-gray-400">Today, 9:00 AM</span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Back Button -->
      <RouterLink
        to="/dashboard"
        class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium shadow transition"
      >
        🔙 Back to Dashboard
      </RouterLink>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Common/AppLayout.vue'
</script>
