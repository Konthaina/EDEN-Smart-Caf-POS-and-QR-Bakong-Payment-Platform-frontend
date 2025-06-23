<template>
  <AppLayout>
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ $t('recipe.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('recipe.subtitle') }}</p>
        </div>
        <button
          @click="openAddModal"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          {{ $t('recipe.addButton') }}
        </button>
      </div>

      <!-- Menu Item Selector -->
      <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow max-w-md w-full">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">{{ $t('recipe.selectMenu') }}</label>
        <select
          v-model="selectedMenuItemId"
          @change="filterRecipes"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 px-4 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
        >
          <option disabled value="">{{ $t('recipe.selectMenuPlaceholder') }}</option>
          <option v-for="item in menuItems" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </div>

      <!-- Recipe Table -->
      <div v-if="filteredRecipes.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table class="min-w-full text-sm text-gray-800 dark:text-gray-100">
          <thead class="bg-purple-100 dark:bg-gray-700 text-purple-700 dark:text-purple-300 font-semibold text-left">
            <tr>
              <th class="px-6 py-3">{{ $t('recipe.table.ingredient') }}</th>
              <th class="px-6 py-3">{{ $t('recipe.table.quantity') }}</th>
              <th class="px-6 py-3 text-center">{{ $t('recipe.table.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="recipe in filteredRecipes"
              :key="recipe.id"
              class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <td class="px-6 py-3 font-medium">{{ recipe.ingredient.name }}</td>
              <td class="px-6 py-3">{{ recipe.quantity }} {{ recipe.ingredient.unit }}</td>
              <td class="px-6 py-3 text-center">
                <button
                  @click="promptDelete(recipe.id)"
                  class="text-red-600 dark:text-red-400 hover:text-white hover:bg-red-500 border border-red-300 dark:border-red-400 px-3 py-1 rounded-full text-xs font-medium transition"
                >
                  {{ $t('recipe.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Recipe Modal -->
      <teleport to="body">
        <div v-if="openModal" class="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black bg-opacity-40"></div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg z-[1000] max-w-md w-full space-y-5">
            <h2 class="text-lg font-bold text-gray-700 dark:text-white">{{ $t('recipe.addModal.title') }}</h2>

            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">{{ $t('recipe.addModal.ingredient') }}</label>
                <select
                  v-model="form.ingredient_id"
                  class="w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 px-4 py-2 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option disabled value="">{{ $t('recipe.selectMenuPlaceholder') }}</option>
                  <option
                    v-for="ingredient in availableIngredients"
                    :key="ingredient.id"
                    :value="ingredient.id"
                  >
                    {{ ingredient.name }} ({{ ingredient.unit }})
                  </option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">{{ $t('recipe.addModal.quantity') }}</label>
                <input
                  type="number"
                  step="0.01"
                  v-model="form.quantity"
                  class="w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 px-4 py-2 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. 0.5"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button @click="closeModal" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-sm text-gray-800 dark:text-white">
                {{ $t('common.cancel') }}
              </button>
              <button
                @click="submitRecipe"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition"
              >
                {{ $t('common.save') }}
              </button>
            </div>
          </div>
        </div>
      </teleport>

      <!-- Confirm Delete Modal -->
      <teleport to="body">
        <div v-if="showConfirm" class="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black bg-opacity-40"></div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg z-[1000] max-w-sm w-full text-center space-y-5">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">{{ $t('recipe.confirm.title') }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ $t('recipe.confirm.body') }}</p>
            <div class="flex justify-center gap-3 pt-2">
              <button @click="cancelDelete" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-sm text-gray-800 dark:text-white">
                {{ $t('common.cancel') }}
              </button>
              <button
                @click="confirmDelete"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                {{ $t('common.confirmDelete') }}
              </button>
            </div>
          </div>
        </div>
      </teleport>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Common/AppLayout.vue'
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/plugins/axios'
import { createToastInterface } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const { t } = useI18n()
const toast = createToastInterface()

const menuItems = ref([])
const ingredients = ref([])
const recipes = ref([])

const selectedMenuItemId = ref('')
const filteredRecipes = ref([])

const openModal = ref(false)
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
  if (!selectedMenuItemId.value && menuItems.value.length > 0) {
    selectedMenuItemId.value = menuItems.value[0].id
    filterRecipes()
  }
}

const availableIngredients = computed(() => {
  const usedIds = filteredRecipes.value.map(r => r.ingredient_id)
  return ingredients.value.filter(i => !usedIds.includes(i.id))
})

function filterRecipes() {
  filteredRecipes.value = recipes.value.filter(
    r => r.menu_item_id === selectedMenuItemId.value
  )
}

function openAddModal() {
  if (!selectedMenuItemId.value) {
    toast.warning(t('recipe.selectMenu'))
    return
  }
  form.value = {
    ingredient_id: availableIngredients.value.length > 0 ? availableIngredients.value[0].id : '',
    quantity: ''
  }
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
    toast.success(t('recipe.successAdd'))
    closeModal()
  } catch (err) {
    console.error('Failed to save recipe:', err)
    toast.error(t('recipe.errorAdd') || '❌ Failed to add recipe.')
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
    toast.success(t('recipe.successDelete'))
    await refreshRecipes()
  } catch (err) {
    console.error('Delete failed:', err)
    toast.error(t('recipe.errorDelete') || '❌ Failed to delete recipe.')
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
