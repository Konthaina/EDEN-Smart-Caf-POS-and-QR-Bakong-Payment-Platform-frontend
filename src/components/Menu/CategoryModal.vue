<template>
    <div v-if="show" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-xl shadow w-full max-w-md">
            <h2 class="text-lg font-semibold mb-4">
                {{ category.id ? '✏️ Edit Category' : '➕ Add Category' }}
            </h2>
            <input v-model="form.name" type="text" placeholder="Category Name"
                class="w-full border px-4 py-2 rounded mb-4" />
            <div class="flex justify-end gap-3">
                <button @click="$emit('close')" class="px-4 py-2 text-sm bg-gray-200 rounded">Cancel</button>
                <button @click="submit" class="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                    Save
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
    show: Boolean,
    category: Object,
})
const emit = defineEmits(['close', 'saved'])

const form = reactive({
    name: '',
})

watch(
    () => props.category,
    (newVal) => {
        if (newVal) {
            form.name = newVal.name || ''
        }
    },
    { immediate: true }
)

const submit = () => {
    emit('saved', { ...props.category, ...form })
}
</script>
