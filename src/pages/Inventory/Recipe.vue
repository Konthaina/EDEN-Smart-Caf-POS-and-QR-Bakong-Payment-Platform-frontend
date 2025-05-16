<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">📋 Recipe Management</h1>
          <p class="text-sm text-gray-500">Manage how each menu item is composed from ingredients.</p>
        </div>
        <button @click="openAddModal"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow">
          ➕ Add Recipe
        </button>
      </div>

      <!-- Alert Box -->
      <transition name="fade">
        <div v-if="successMessage"
          class="flex items-center justify-between bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded shadow">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium">{{ successMessage }}</span>
          </div>
          <button @click="successMessage = ''" class="text-green-600 hover:text-green-800 text-sm font-bold">
            ✖
          </button>
        </div>
      </transition>

      <!-- Menu Item Selector -->
      <div class="bg-white p-4 rounded-xl shadow w-full max-w-md">
        <label class="block text-sm font-medium text-gray-600 mb-1">Select Menu Item</label>
        <select v-model="selectedMenuItemId" @change="filterRecipes"
          class="w-full border px-3 py-2 rounded focus:ring focus:ring-purple-300">
          <option disabled value="">-- Choose Menu Item --</option>
          <option v-for="item in menuItems" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>

      <!-- Recipe Table -->
      <div v-if="filteredRecipes.length > 0" class="bg-white rounded-xl shadow overflow-x-auto">
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-purple-50 text-purple-800 font-semibold text-left">
            <tr>
              <th class="px-4 py-3">Ingredient</th>
              <th class="px-4 py-3">Quantity</th>
              <th class="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="recipe in filteredRecipes" :key="recipe.id" class="border-t hover:bg-gray-50 transition">
              <td class="px-4 py-2 font-medium">{{ recipe.ingredient.name }}</td>
              <td class="px-4 py-2">{{ recipe.quantity }} {{ recipe.ingredient.unit }}</td>
              <td class="px-4 py-2 text-center">
                <button class="text-red-600 hover:bg-red-50 px-3 py-1 text-xs rounded-full border border-red-100"
                  @click="promptDelete(recipe.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Modal -->
      <div v-if="openModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white w-full max-w-md p-6 rounded-xl shadow space-y-4">
          <h2 class="text-lg font-bold text-gray-700">➕ Add Ingredient to Recipe</h2>

          <div class="space-y-3">
            <div>
              <label class="text-sm block mb-1">Ingredient</label>
              <select v-model="form.ingredient_id" class="w-full border px-3 py-2 rounded">
                <option disabled value="">-- Select Ingredient --</option>
                <option v-for="ingredient in ingredients" :key="ingredient.id" :value="ingredient.id">
                  {{ ingredient.name }} ({{ ingredient.unit }})
                </option>
              </select>
            </div>

            <div>
              <label class="text-sm block mb-1">Quantity</label>
              <input type="number" step="0.01" v-model="form.quantity"
                class="w-full border px-3 py-2 rounded focus:ring-purple-300" placeholder="e.g. 0.5" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button @click="closeModal" class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
            <button @click="submitRecipe"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white w-full max-w-sm p-6 rounded-xl shadow space-y-4 text-center">
          <h2 class="text-lg font-semibold text-gray-800">Confirm Deletion</h2>
          <p class="text-sm text-gray-600">
            Are you sure you want to remove this ingredient from the recipe?
          </p>
          <div class="flex justify-center gap-4 pt-4">
            <button @click="cancelDelete" class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button @click="confirmDelete" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Yes, Delete
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

const menuItems = ref([])
const ingredients = ref([])
const recipes = ref([])

const selectedMenuItemId = ref('')
const filteredRecipes = ref([])

const openModal = ref(false)
const successMessage = ref('')
const showConfirm = ref(false)
const confirmRecipeId = ref(null)

const form = ref({
  ingredient_id: '',
  quantity: ''
})

const loadAll = async () => {
  const [menuRes, ingRes, recipeRes] = await Promise.all([
    api.get('/menu-items'),
    api.get('/ingredients'),
    api.get('/recipes')
  ])
  menuItems.value = menuRes.data
  ingredients.value = ingRes.data
  recipes.value = recipeRes.data
}

function filterRecipes() {
  filteredRecipes.value = recipes.value.filter(
    r => r.menu_item_id === selectedMenuItemId.value
  )
}

function openAddModal() {
  if (!selectedMenuItemId.value) {
    alert('Please select a menu item first.')
    return
  }
  form.value = { ingredient_id: '', quantity: '' }
  openModal.value = true
}

function closeModal() {
  openModal.value = false
}

async function submitRecipe() {
  try {
    await api.post('/recipes', {
      menu_item_id: selectedMenuItemId.value,
      ingredient_id: form.value.ingredient_id,
      quantity: parseFloat(form.value.quantity)
    })
    await refreshRecipes()
    successMessage.value = '✅ Ingredient added to recipe!'
    setTimeout(() => (successMessage.value = ''), 3000)
    closeModal()
  } catch (err) {
    console.error('Failed to save recipe:', err)
  }
}

function promptDelete(id) {
  confirmRecipeId.value = id
  showConfirm.value = true
}

function cancelDelete() {
  confirmRecipeId.value = null
  showConfirm.value = false
}

async function confirmDelete() {
  try {
    await api.delete(`/recipes/${confirmRecipeId.value}`)
    successMessage.value = '✅ Ingredient removed from recipe!'
    setTimeout(() => (successMessage.value = ''), 3000)
    await refreshRecipes()
  } catch (err) {
    console.error('Delete failed:', err)
  } finally {
    showConfirm.value = false
    confirmRecipeId.value = null
  }
}

async function refreshRecipes() {
  const res = await api.get('/recipes')
  recipes.value = res.data
  filterRecipes()
}

onMounted(loadAll)
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
