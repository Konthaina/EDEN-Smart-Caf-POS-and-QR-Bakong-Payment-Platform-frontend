<template>
  <AppLayout>
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">📂 {{ $t('categories.title') }}</h1>
        <button
          @click="openAdd"
          class="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition duration-200"
        >
          ➕ {{ $t('categories.add') }}
        </button>
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-600">
        {{ $t('categories.total') }}:
        <span class="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
          {{ categories.length }}
        </span>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-purple-50 text-purple-800 text-xs font-semibold uppercase">
            <tr>
              <th class="px-6 py-3 text-left">📁 {{ $t('categories.name') }}</th>
              <th class="px-6 py-3 text-left">⚙️ {{ $t('categories.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="cat in categories"
              :key="cat.id"
              class="hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 font-medium text-gray-800">{{ cat.name }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-4">
                  <button
                    @click="edit(cat)"
                    class="px-3 py-1 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 rounded-full transition"
                  >
                    {{ $t('actions.edit') }}
                  </button>
                  <button
                    @click="askDelete(cat)"
                    class="px-3 py-1 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-full transition"
                  >
                    {{ $t('actions.delete') }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="2" class="text-center text-gray-400 py-6">
                {{ $t('categories.empty') }}
              </td>
            </tr>
          </tbody>
        </table>
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
import Toast from '@/components/Common/Toast.vue'
import api from '@/plugins/axios'

const categories = ref([])
const showModal = ref(false)
const showConfirm = ref(false)
const activeCategory = ref(null)
const toastRef = ref(null)

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
  if (cat.id) {
    await api.put(`/categories/${cat.id}`, cat)
    toastRef.value?.showToast('✅ Category updated')
  } else {
    await api.post('/categories', cat)
    toastRef.value?.showToast('✅ Category added')
  }
  showModal.value = false
  fetchCategories()
}

const askDelete = (cat) => {
  activeCategory.value = cat
  showConfirm.value = true
}

const deleteCategory = async () => {
  await api.delete(`/categories/${activeCategory.value.id}`)
  toastRef.value?.showToast('🗑️ Category and related items deleted')
  showConfirm.value = false
  fetchCategories()
}

const cancelDelete = () => {
  showConfirm.value = false
}

onMounted(fetchCategories)
</script>
