<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">➕ Add Menu Item</h2>
        <button @click="close" class="text-gray-400 hover:text-red-500 text-xl">×</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Image -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Image</label>
          <input type="file" @change="handleFileChange" class="border rounded px-3 py-2 w-full" />
        </div>

        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input v-model="form.name" type="text" class="border rounded px-3 py-2 w-full" required />
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Price ($)</label>
          <input v-model="form.price" type="number" step="0.01" class="border rounded px-3 py-2 w-full" required />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Category</label>
          <select v-model="form.category_id" class="border rounded px-3 py-2 w-full" required>
            <option value="">-- Select Category --</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-4">
          <button type="button" @click="close" class="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
            Save
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
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
  name: '',
  price: '',
  category_id: '',
  image: null,
})

const categories = ref([])

const fetchCategories = async () => {
  const res = await api.get('/categories')
  categories.value = res.data
}

onMounted(fetchCategories)

const handleFileChange = (e) => {
  form.value.image = e.target.files[0]
}

const close = () => emit('close')

const submitForm = async () => {
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('price', form.value.price)
  formData.append('category_id', form.value.category_id)
  if (form.value.image) {
    formData.append('image', form.value.image)
  }

  await api.post('/menu-items', formData)
  emit('saved')
  close()
}
</script>
