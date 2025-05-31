<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ $t('ingredient.title') }}</h1>
          <p class="text-sm text-gray-500">{{ $t('ingredient.subtitle') }}</p>
        </div>
        <button
          @click="openAddForm"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          <span class="text-base">➕</span>
          <span>{{ $t('ingredient.addButton') }}</span>
        </button>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="bg-green-100 border border-green-300 text-green-800 rounded-xl px-4 py-3 flex justify-between items-center shadow max-w-xl"
      >
        <span class="text-sm">{{ $t(successMessage) }}</span>
        <button @click="successMessage = ''" class="text-green-800 hover:text-red-500 font-bold">✖</button>
      </div>

      <!-- Table Container -->
      <div class="rounded-xl shadow bg-white overflow-hidden">
        <div class="max-h-[480px] overflow-y-auto custom-scroll">
          <table class="min-w-full text-sm text-gray-700">
            <thead class="bg-purple-50 text-purple-800 font-semibold text-left sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 w-12">#</th>
                <th class="px-4 py-3">{{ $t('ingredient.name') }}</th>
                <th class="px-4 py-3">{{ $t('ingredient.unit') }}</th>
                <th class="px-4 py-3">{{ $t('ingredient.createdAt') }}</th>
                <th class="px-4 py-3 text-center w-40">{{ $t('ingredient.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(ingredient, index) in ingredients"
                :key="ingredient.id"
                class="border-t hover:bg-gray-50"
              >
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3">{{ locale === 'km' ? (ingredient.name_kh || ingredient.name) : ingredient.name }}</td>
                <td class="px-4 py-3">{{ ingredient.unit }}</td>
                <td class="px-4 py-3">{{ formatDate(ingredient.created_at) }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      class="border border-blue-300 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full text-sm font-medium transition"
                      @click="editIngredient(ingredient)"
                    >
                      {{ $t('common.edit') }}
                    </button>
                    <button
                      class="border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded-full text-sm font-medium transition"
                      @click="confirmDelete(ingredient.id)"
                    >
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="ingredients.length === 0">
                <td colspan="5" class="text-center py-6 text-gray-400">{{ $t('ingredient.noData') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <teleport to="body">
        <div v-if="openModal" class="fixed inset-0 z-[999] flex items-center justify-center">
          <div class="absolute inset-0 bg-black bg-opacity-50 z-[998]"></div>
          <div class="relative z-[999] bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4">
            <h2 class="text-lg font-bold text-gray-800">
              {{ isEditing ? $t('ingredient.editTitle') : $t('ingredient.addTitle') }}
            </h2>

            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('ingredient.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full border rounded-lg px-3 py-2 focus:ring focus:border-purple-500"
                :placeholder="$t('ingredient.namePlaceholder')"
              />
              <p v-if="nameError" class="text-sm text-red-500 mt-1">{{ $t(nameError) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('ingredient.unit') }}</label>
              <input
                v-model="form.unit"
                type="text"
                class="w-full border rounded-lg px-3 py-2 focus:ring focus:border-purple-500"
                :placeholder="$t('ingredient.unitPlaceholder')"
              />
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button
                @click="closeModal"
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                @click="isEditing ? updateIngredient() : createIngredient()"
                class="btn-primary px-4 py-2 rounded-full text-sm"
              >
                {{ isEditing ? $t('common.update') : $t('common.save') }}
              </button>
            </div>
          </div>
        </div>
      </teleport>

      <!-- Delete Confirm Modal -->
      <teleport to="body">
        <div v-if="showConfirm" class="fixed inset-0 z-[999] flex items-center justify-center">
          <div class="absolute inset-0 bg-black bg-opacity-50 z-[998]" />
          <div class="relative z-[999] bg-white p-6 rounded-xl shadow-xl space-y-4 w-full max-w-sm text-center">
            <h2 class="text-lg font-bold text-gray-800">{{ $t('ingredient.confirmDeleteTitle') }}</h2>
            <p class="text-sm text-gray-600">{{ $t('ingredient.confirmDeleteText') }}</p>
            <div class="flex justify-center gap-4 pt-4">
              <button
                @click="showConfirm = false"
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                @click="deleteIngredient(ingredientToDelete)"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm"
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/plugins/axios'

const { t, locale } = useI18n()

const ingredients = ref([])
const openModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const successMessage = ref('')
const showConfirm = ref(false)
const ingredientToDelete = ref(null)
const form = ref({ name: '', unit: '' })
const nameError = ref('')

const loadIngredients = async () => {
  const res = await api.get('/ingredients')
  ingredients.value = res.data
}

function openAddForm() {
  form.value = { name: '', unit: '' }
  isEditing.value = false
  openModal.value = true
  nameError.value = ''
}

function editIngredient(item) {
  form.value = { name: item.name, unit: item.unit }
  isEditing.value = true
  editingId.value = item.id
  openModal.value = true
  nameError.value = ''
}

function closeModal() {
  openModal.value = false
  form.value = { name: '', unit: '' }
  isEditing.value = false
  editingId.value = null
  nameError.value = ''
}

async function createIngredient() {
  nameError.value = ''
  const newName = form.value.name.trim().toLowerCase()

  if (!newName || !form.value.unit.trim()) {
    nameError.value = 'ingredient.errorRequired'
    return
  }

  const exists = ingredients.value.some(i => i.name.trim().toLowerCase() === newName)
  if (exists) {
    nameError.value = 'ingredient.errorExists'
    return
  }

  try {
    await api.post('/ingredients', form.value)
    successMessage.value = 'ingredient.successAdd'
    closeModal()
    await loadIngredients()
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error('Create failed:', err)
  }
}

async function updateIngredient() {
  nameError.value = ''
  const newName = form.value.name.trim().toLowerCase()

  const exists = ingredients.value.some(
    i => i.name.trim().toLowerCase() === newName && i.id !== editingId.value
  )
  if (exists) {
    nameError.value = 'ingredient.errorAnotherExists'
    return
  }

  try {
    await api.put(`/ingredients/${editingId.value}`, form.value)
    successMessage.value = 'ingredient.successUpdate'
    closeModal()
    await loadIngredients()
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error('Update failed:', err)
  }
}

function confirmDelete(id) {
  ingredientToDelete.value = id
  showConfirm.value = true
}

async function deleteIngredient(id) {
  showConfirm.value = false
  try {
    await api.delete(`/ingredients/${id}`)
    successMessage.value = 'ingredient.successDelete'
    await loadIngredients()
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

onMounted(loadIngredients)
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  display: none;
}
.custom-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.btn-primary {
  @apply bg-purple-600 hover:bg-purple-700 text-white font-medium shadow transition;
}
</style>
