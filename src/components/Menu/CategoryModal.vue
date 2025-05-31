<template>
  <Teleport to="body">
  <div v-if="show" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-xl shadow w-full max-w-md">
      <h2 class="text-lg font-semibold mb-4">
        {{ category.id ? '✏️ ' + $t('category.editTitle') : '➕ ' + $t('category.addTitle') }}
      </h2>
      <input
        v-model="form.name"
        type="text"
        :placeholder="$t('category.placeholder')"
        class="w-full border px-4 py-2 rounded mb-4"
      />
      <div class="flex justify-end gap-3">
        <button @click="$emit('close')" class="px-4 py-2 text-sm bg-gray-200 rounded">
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="submit"
          class="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {{ $t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</Teleport>
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
