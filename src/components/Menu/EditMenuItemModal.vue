<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6 space-y-6 text-gray-800 dark:text-gray-100">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">{{ $t('add_menu.editTitle') }}</h2>
        <button @click="close" class="text-gray-400 hover:text-red-500 text-xl">×</button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Image Upload + Preview -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {{ $t('add_menu.image') }}
          </label>
          <input
            type="file"
            @change="handleFileChange"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm rounded w-full text-gray-800 dark:text-white"
          />
          <div v-if="form.imagePreview" class="mt-2">
            <img :src="form.imagePreview" class="h-20 rounded object-cover border dark:border-gray-600" />
          </div>
        </div>

        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {{ $t('add_menu.name') }}
          </label>
          <input
            v-model="form.name"
            type="text"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm rounded w-full text-gray-800 dark:text-white"
            required
          />
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {{ $t('add_menu.price') }} ($)
          </label>
          <input
            v-model="form.price"
            type="number"
            step="0.01"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm rounded w-full text-gray-800 dark:text-white"
            required
          />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {{ $t('add_menu.category') }}
          </label>
          <select
            v-model="form.category_id"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm rounded w-full text-gray-800 dark:text-white"
            required
          >
            <option value="">{{ $t('add_menu.selectCategory') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-4">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            {{ $t('add_menu.saveEdit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/plugins/axios'

const props = defineProps({
  show: Boolean,
  item: Object,
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
  name: '',
  price: '',
  category_id: '',
  image: null,
  imagePreview: null,
})

const categories = ref([])

watch(
  () => props.item,
  (val) => {
    if (val) {
      form.value.name = val.name
      form.value.price = val.price
      form.value.category_id = val.category_id
      form.value.imagePreview = `/storage/${val.image}`
    }
  },
  { immediate: true }
)

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.value.image = file
    form.value.imagePreview = URL.createObjectURL(file)
  }
}

const close = () => emit('close')

const fetchCategories = async () => {
  const res = await api.get('/categories')
  categories.value = res.data
}

onMounted(fetchCategories)

const submitForm = async () => {
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('price', form.value.price)
    formData.append('category_id', form.value.category_id)
    formData.append('_method', 'PUT') // Laravel expects this override

    if (form.value.image instanceof File) {
      formData.append('image', form.value.image)
    }

    await api.post(`/menu-items/${props.item.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    emit('saved')
    close()
  } catch (err) {
    console.error('❌ Edit failed:', err)
  }
}
</script>
