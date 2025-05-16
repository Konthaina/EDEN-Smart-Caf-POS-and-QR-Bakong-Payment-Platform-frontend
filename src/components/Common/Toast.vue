<template>
    <transition name="fade">
        <div v-if="visible" class="fixed bottom-6 right-6 z-50">
            <div class="bg-green-500 text-white px-4 py-2 rounded shadow-lg text-sm">
                {{ message }}
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')

const showToast = (text, duration = 3000) => {
    message.value = text
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
