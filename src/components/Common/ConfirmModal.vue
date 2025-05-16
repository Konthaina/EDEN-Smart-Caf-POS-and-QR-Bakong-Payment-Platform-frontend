<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 class="text-lg font-semibold text-gray-800">⚠️ Confirm Deletion</h2>
            <p class="text-sm text-gray-600">{{ message }}</p>
            <div class="flex justify-end gap-3 pt-2">
                <button @click="emit('cancel')"
                    class="px-4 py-2 rounded bg-gray-200 text-sm hover:bg-gray-300">Cancel</button>
                <button @click="emit('confirm')"
                    class="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700">Yes, Delete</button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    show: Boolean,
    message: String,
})
const emit = defineEmits(['confirm', 'cancel'])
</script>
