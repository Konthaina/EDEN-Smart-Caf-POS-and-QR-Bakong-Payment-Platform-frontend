<template>
  <transition name="fade">
    <div v-if="visible" class="global-loading">
      <div class="bouncing-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="loading-text">{{ message }}<span class="dots"></span></div>
      <div class="loading-tip">{{ tip }}</div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  visible: Boolean,
  message: {
    type: String,
    default: "Loading...",
  },
  tip: {
    type: String,
    default: "",
  },
});

// Animated dots logic
let dotTimer = null;
onMounted(() => {
  let dotCount = 0;
  dotTimer = setInterval(() => {
    const dots = document.querySelector(".loading-text .dots");
    if (dots) {
      dots.textContent = ".".repeat(dotCount % 4);
      dotCount++;
    }
  }, 340);
});
onUnmounted(() => clearInterval(dotTimer));
</script>

<style scoped>
.global-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(32, 32, 48, 0.18);
  backdrop-filter: blur(8px) saturate(130%);
  opacity: 1;
  transition: opacity 0.3s;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.bouncing-loader {
  display: flex;
  gap: 14px;
  margin-bottom: 30px;
  height: 32px;
  align-items: flex-end;
}
.bouncing-loader span {
  display: block;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #a855f7 60%, #ec4899 100%);
  border-radius: 50%;
  animation: bounce 0.7s infinite alternate;
}
.bouncing-loader span:nth-child(2) {
  animation-delay: 0.15s;
  background: linear-gradient(135deg, #ec4899 30%, #a855f7 90%);
}
.bouncing-loader span:nth-child(3) {
  animation-delay: 0.32s;
}
@keyframes bounce {
  to {
    transform: translateY(-25px) scale(1.13);
    box-shadow: 0 16px 40px #a855f733;
  }
}
.loading-text {
  color: #fff;
  font-size: 1.35rem;
  font-weight: 600;
  text-shadow: 0 2px 8px #0002;
  letter-spacing: 0.02em;
  margin-bottom: 18px;
}
.loading-text .dots {
  display: inline-block;
  width: 1.6em;
  text-align: left;
}
.loading-tip {
  color: #e0e0e7;
  font-size: 1rem;
  font-weight: 400;
  text-align: center;
  max-width: 360px;
  margin: 0 auto;
  opacity: 0.82;
  letter-spacing: 0.01em;
  margin-top: 0.2em;
}
</style>
