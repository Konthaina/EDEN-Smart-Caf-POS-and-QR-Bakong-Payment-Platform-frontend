<template>
  <AppLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-purple-700 flex items-center gap-2">
          📦 Stock Management
        </h1>
        <button @click="openAddForm"
          class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm shadow transition">
          ➕ Add Stock
        </button>
      </div>

      <!-- Table Container with Sticky Header + Scrollable Body -->
      <div class="rounded-xl shadow border border-gray-100 overflow-hidden">
        <table class="min-w-full text-sm bg-white">
          <thead class="bg-purple-50 text-purple-800 text-left text-sm font-semibold sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Ingredient</th>
              <th class="px-4 py-3">Quantity</th>
              <th class="px-4 py-3">Last Updated</th>
              <th class="px-4 py-3">Action</th>
            </tr>
          </thead>
        </table>

        <div class="max-h-[500px] overflow-y-auto custom-scroll">
          <table class="min-w-full text-sm text-gray-700">
            <tbody>
              <tr v-for="(stock, index) in stocks" :key="stock.id" class="border-t hover:bg-gray-50 transition">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3 font-medium">{{ stock.ingredient.name }}</td>
                <td class="px-4 py-3">{{ stock.quantity }} {{ stock.ingredient.unit }}</td>
                <td class="px-4 py-3">{{ formatDate(stock.updated_at) }}</td>
                <td class="px-4 py-3 text-center whitespace-nowrap">
                  <div class="flex justify-center gap-2">
                    <button class="px-3 py-1 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 text-xs"
                      @click="editStock(stock)">
                      Edit
                    </button>
                    <button class="px-3 py-1 text-red-600 border border-red-200 rounded-full hover:bg-red-50 text-xs"
                      @click="deleteStock(stock.id)">
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
            {{ isEditing ? '✏️ Edit Stock' : '➕ Add Stock' }}
          </h2>

          <div class="space-y-3">
            <!-- Ingredient Selection -->
            <div>
              <label class="block text-sm font-medium mb-1">Ingredient</label>
              <select v-model="form.ingredient_id" class="w-full border rounded px-3 py-2" :disabled="isEditing">
                <option disabled value="">-- Select Ingredient --</option>
                <option v-for="ingredient in ingredients" :key="ingredient.id" :value="ingredient.id">
                  {{ ingredient.name }} ({{ ingredient.unit }})
                </option>
              </select>
            </div>

            <!-- Quantity Input -->
            <div>
              <label class="block text-sm font-medium mb-1">Quantity</label>
              <input type="number" v-model="form.quantity" class="w-full border rounded px-3 py-2"
                placeholder="Enter quantity" />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end pt-4 space-x-2">
            <button @click="closeModal"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition">
              Cancel
            </button>
            <button @click="isEditing ? updateStock() : submitStock()"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
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

const stocks = ref([])
const ingredients = ref([])
const openModal = ref(false)
const isEditing = ref(false)
const form = ref({
  ingredient_id: '',
  quantity: ''
})

const loadStocks = async () => {
  const res = await api.get('/stocks')
  stocks.value = res.data
}

const loadIngredients = async () => {
  const res = await api.get('/ingredients')
  ingredients.value = res.data
}

function formatDate(dateTime) {
  return new Date(dateTime).toLocaleString()
}

function openAddForm() {
  form.value = { ingredient_id: '', quantity: '' }
  isEditing.value = false
  openModal.value = true
}

function closeModal() {
  form.value = { ingredient_id: '', quantity: '' }
  openModal.value = false
  isEditing.value = false
}

async function submitStock() {
  if (!form.value.ingredient_id || form.value.quantity === '') {
    alert('Please fill in all fields.')
    return
  }
  try {
    await api.post('/stocks', {
      ingredient_id: form.value.ingredient_id,
      quantity: parseFloat(form.value.quantity),
    })
    await loadStocks()
    closeModal()
  } catch (err) {
    console.error('Submit Error:', err)
  }
}

function editStock(stock) {
  form.value = {
    ingredient_id: stock.ingredient.id,
    quantity: stock.quantity
  }
  isEditing.value = true
  openModal.value = true
}

async function updateStock() {
  try {
    await api.post('/stocks', {
      ingredient_id: form.value.ingredient_id,
      quantity: parseFloat(form.value.quantity),
    })
    await loadStocks()
    closeModal()
  } catch (err) {
    console.error('Update Error:', err)
  }
}

async function deleteStock(id) {
  if (confirm('Are you sure you want to delete this stock entry?')) {
    try {
      await api.delete(`/stocks/${id}`)
      await loadStocks()
    } catch (err) {
      console.error('Delete Error:', err)
    }
  }
}

onMounted(() => {
  loadStocks()
  loadIngredients()
})
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
