<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed z-50 top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce-in"
    >
      <span class="text-xl">🔔</span>
      <span class="font-semibold">{{ message }}</span>
      <button
        @click="visible = false"
        class="ml-2 px-2 text-white/80 hover:text-white focus:outline-none text-lg"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  count: Number,
})

const visible = ref(false)
const message = ref('You have new notifications!')

// Watch for new notifications (count increases)
let lastCount = 0
watch(
  () => props.count,
  (newCount, oldCount) => {
    if (newCount > 0 && newCount !== lastCount) {
      visible.value = true
      message.value =
        newCount === 1
          ? 'You have 1 notification!'
          : `You have ${newCount} notifications!`
      lastCount = newCount
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-bounce-in {
  animation: bounce-in 0.7s;
}
@keyframes bounce-in {
  0% {
    transform: scale(0.8) translateY(-40px);
    opacity: 0;
  }
  60% {
    transform: scale(1.05) translateY(10px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
