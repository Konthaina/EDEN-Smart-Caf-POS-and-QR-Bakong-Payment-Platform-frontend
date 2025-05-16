<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Ingredient Management</h1>
          <p class="text-sm text-gray-500">Track and manage all ingredients in your stock.</p>
        </div>
        <button @click="openAddForm"
          class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm h-10">
          <span class="text-base">➕</span>
          <span class="text-sm">Add Ingredient</span>
        </button>
      </div>

      <!-- Table container -->
      <div class="rounded-xl shadow bg-white overflow-hidden">
        <!-- Sticky Table Header -->
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-purple-50 text-purple-800 font-semibold text-left sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Unit</th>
              <th class="px-4 py-3">Created At</th>
              <th class="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
        </table>

        <!-- Scrollable Body with Hidden Scrollbar -->
        <div class="max-h-[480px] overflow-y-auto custom-scroll">
          <table class="min-w-full text-sm text-gray-700">
            <tbody>
              <tr v-for="(ingredient, index) in ingredients" :key="ingredient.id" class="border-t hover:bg-gray-50">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3">{{ ingredient.name }}</td>
                <td class="px-4 py-3">{{ ingredient.unit }}</td>
                <td class="px-4 py-3">{{ formatDate(ingredient.created_at) }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      class="border border-blue-300 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full text-sm font-medium transition"
                      @click="editIngredient(ingredient)">
                      Edit
                    </button>
                    <button
                      class="border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded-full text-sm font-medium transition"
                      @click="deleteIngredient(ingredient.id)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="openModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4">
          <h2 class="text-lg font-bold text-gray-800">
            {{ isEditing ? '✏️ Edit Ingredient' : '➕ Add Ingredient' }}
          </h2>

          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="form.name" type="text"
              class="w-full border rounded px-3 py-2 focus:ring focus:border-purple-500"
              placeholder="e.g. Sugar, Milk" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Unit</label>
            <input v-model="form.unit" type="text"
              class="w-full border rounded px-3 py-2 focus:ring focus:border-purple-500"
              placeholder="e.g. kg, ml, pcs" />
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <button @click="closeModal" class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button @click="isEditing ? updateIngredient() : createIngredient()"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              {{ isEditing ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Common/AppLayout.vue'
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

const ingredients = ref([])
const openModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const form = ref({ name: '', unit: '' })

const loadIngredients = async () => {
  const res = await api.get('/ingredients')
  ingredients.value = res.data
}

function openAddForm() {
  form.value = { name: '', unit: '' }
  isEditing.value = false
  openModal.value = true
}

function editIngredient(item) {
  form.value = { name: item.name, unit: item.unit }
  isEditing.value = true
  editingId.value = item.id
  openModal.value = true
}

function closeModal() {
  openModal.value = false
  form.value = { name: '', unit: '' }
  isEditing.value = false
  editingId.value = null
}

async function createIngredient() {
  if (!form.value.name || !form.value.unit) {
    alert('Name and unit are required.')
    return
  }
  try {
    await api.post('/ingredients', form.value)
    closeModal()
    await loadIngredients()
  } catch (err) {
    console.error('Create failed:', err)
  }
}

async function updateIngredient() {
  try {
    await api.put(`/ingredients/${editingId.value}`, form.value)
    closeModal()
    await loadIngredients()
  } catch (err) {
    console.error('Update failed:', err)
  }
}

async function deleteIngredient(id) {
  if (confirm('Are you sure you want to delete this ingredient?')) {
    try {
      await api.delete(`/ingredients/${id}`)
      await loadIngredients()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

onMounted(loadIngredients)
</script>

<style>
.custom-scroll::-webkit-scrollbar {
  display: none;
}

.custom-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
