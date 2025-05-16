<template>
    <AppLayout>
        <div class="p-6 space-y-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Categories</h1>
                    <p class="text-sm text-gray-500">Manage menu item categories.</p>
                </div>
                <button @click="openAdd" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    ➕ Add Category
                </button>
            </div>

            <div class="bg-white shadow rounded-xl overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th class="px-6 py-3 font-semibold">Name</th>
                            <th class="px-6 py-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="cat in categories" :key="cat.id">
                            <td class="px-6 py-3 font-medium">{{ cat.name }}</td>
                            <td class="px-6 py-3">
                                <button @click="edit(cat)" class="text-blue-600 hover:underline mr-3">Edit</button>
                                <button @click="askDelete(cat)" class="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modals -->
        <CategoryModal :show="showModal" :category="activeCategory" @close="closeModal" @saved="saveCategory" />
        <ConfirmModal :show="showConfirm"
            :message="`Are you sure you want to delete '${activeCategory?.name}'? All menu items in this category will also be deleted.`"
            @confirm="deleteCategory" @cancel="cancelDelete" />
        <Toast ref="toastRef" />
    </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Common/AppLayout.vue'
import ConfirmModal from '@/components/Common/ConfirmModal.vue'
import CategoryModal from '@/components/Menu/CategoryModal.vue'
import Toast from '@/components/Common/Toast.vue'
import { ref, onMounted } from 'vue'
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
    showConfirm.value = false
    toastRef.value?.showToast('🗑️ Category and related items deleted')
    fetchCategories()
}

const cancelDelete = () => {
    showConfirm.value = false
}

onMounted(fetchCategories)
</script>
