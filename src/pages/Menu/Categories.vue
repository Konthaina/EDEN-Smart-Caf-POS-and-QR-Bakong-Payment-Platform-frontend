<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ $t('categories.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">{{ $t('categories.subtitle') }}</p>
        </div>
        <button
          @click="openAdd"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          {{ $t('categories.add') }}
        </button>
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        {{ $t('categories.total') }}: {{ categories.length }}
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
        <div class="max-h-[480px] overflow-y-auto no-scrollbar">
          <table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead class="bg-purple-50 dark:bg-gray-700 text-xs uppercase font-semibold text-purple-800 dark:text-white sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3">{{ $t('categories.name') }}</th>
                <th class="px-6 py-3">{{ $t('categories.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="cat in categories"
                :key="cat.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td class="px-6 py-4 font-medium">{{ cat.name }}</td>
                <td class="px-6 py-4">
                  <div class="flex gap-3">
                    <button
                      @click="edit(cat)"
                      class="px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-full transition"
                    >
                      {{ $t('actions.edit') }}
                    </button>
                    <button
                      @click="askDelete(cat)"
                      class="px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded-full transition"
                    >
                      {{ $t('actions.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="categories.length === 0">
                <td colspan="2" class="px-6 py-6 text-center text-gray-400">
                  {{ $t('categories.empty') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modals -->
      <CategoryModal
        :show="showModal"
        :category="activeCategory"
        @close="closeModal"
        @saved="saveCategory"
      />
      <ConfirmModal
        :show="showConfirm"
        :message="$t('categories.confirmDelete', { name: activeCategory?.name })"
        @confirm="deleteCategory"
        @cancel="cancelDelete"
      />
      <Toast ref="toastRef" />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/Common/AppLayout.vue'
import ConfirmModal from '@/components/Common/ConfirmModal.vue'
import CategoryModal from '@/components/Menu/CategoryModal.vue'
import api from '@/plugins/axios'
import { createToastInterface } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const categories = ref([])
const showModal = ref(false)
const showConfirm = ref(false)
const activeCategory = ref(null)
const toast = createToastInterface()

const fetchCategories = async () => {
  const res = await api.get('/categories')
  categories.value = res.data
}

const openAdd = () => {
  activeCategory.value = {}
  showModal.value = true
}

const edit = (cat) => {
  activeCategory.value = { ...cat }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveCategory = async (cat) => {
  try {
    if (cat.id) {
      await api.put(`/categories/${cat.id}`, cat)
      toast.success('Category updated')
    } else {
      await api.post('/categories', cat)
      toast.success('Category added')
    }
    showModal.value = false
    fetchCategories()
  } catch (error) {
    toast.error('Failed to save category')
  }
}

const askDelete = (cat) => {
  activeCategory.value = cat
  showConfirm.value = true
}

const deleteCategory = async () => {
  try {
    await api.delete(`/categories/${activeCategory.value.id}`)
    toast.success('Category and related items deleted')
    showConfirm.value = false
    fetchCategories()
  } catch (error) {
    toast.error('Failed to delete category')
  }
}

const cancelDelete = () => {
  showConfirm.value = false
}

onMounted(fetchCategories)
</script>



