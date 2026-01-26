<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed top-6 right-6 z-50 w-fit max-w-md px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-white"
      :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'"
    >
      <!-- Icon -->
      <Check v-if="toastType === 'success'" class="w-5 h-5" />
      <X v-else class="w-5 h-5" />

      <!-- Message -->
      <span class="text-sm font-medium break-words">{{ message }}</span>

      <!-- Close button -->
      <button @click="visible = false" class="ml-auto text-white hover:text-gray-200 transition leading-none">
        <X class="w-4 h-4" />
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { Check, X } from 'lucide-vue-next'

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
