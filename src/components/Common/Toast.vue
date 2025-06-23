<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed top-6 right-6 z-50 w-fit max-w-md px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-white"
      :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'"
    >
      <!-- Icon -->
      <svg
        v-if="toastType === 'success'"
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>

      <!-- Message -->
      <span class="text-sm font-medium break-words">{{ message }}</span>

      <!-- Close button -->
      <button @click="visible = false" class="ml-auto text-white hover:text-gray-200 transition text-lg leading-none">
        ×
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const toastType = ref('success') // or 'error'

const showToast = (text, type = 'success', duration = 3000) => {
  message.value = text
  toastType.value = type
  visible.value = true
  setTimeout(() => {
    visible.value = false
  }, duration)
}

defineExpose({ showToast })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
