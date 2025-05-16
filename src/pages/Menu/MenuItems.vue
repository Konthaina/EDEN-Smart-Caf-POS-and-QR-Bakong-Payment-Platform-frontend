<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Menu Items</h1>
          <p class="text-sm text-gray-500">Manage food and drink offerings.</p>
        </div>
        <button @click="openAddModal"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2">
          ➕ Add Item
        </button>
      </div>

      <!-- Table Container -->
      <div class="bg-white rounded-xl shadow overflow-hidden flex flex-col" style="height: calc(100vh - 200px)">
        <!-- Table Header (non-scrollable) -->
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 text-left text-sm text-gray-600 sticky top-0 z-10">
            <tr>
              <th class="px-6 py-3 font-semibold">Image</th>
              <th class="px-6 py-3 font-semibold">Name</th>
              <th class="px-6 py-3 font-semibold">Price</th>
              <th class="px-6 py-3 font-semibold">Category</th>
              <th class="px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
        </table>

        <!-- Scrollable Body -->
        <div class="overflow-y-auto flex-1 custom-scroll">
          <table class="min-w-full divide-y divide-gray-200">
            <tbody class="divide-y divide-gray-100 text-sm">
              <tr v-for="item in menuItems" :key="item.id">
                <td class="px-6 py-4">
                  <img :src="`/storage/${item.image}`" class="w-10 h-10 rounded object-cover" />
                </td>
                <td class="px-6 py-4 font-medium text-gray-800">{{ item.name }}</td>
                <td class="px-6 py-4">${{ item.price }}</td>
                <td class="px-6 py-4">{{ item.category?.name }}</td>
                <td class="px-6 py-4">
                  <button class="text-blue-600 hover:underline mr-2" @click="editItem(item)">Edit</button>
                  <button class="text-red-600 hover:underline" @click="askDelete(item)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddMenuItemModal :show="showAddModal" @close="closeAddModal" @saved="handleSaved" />
    <EditMenuItemModal :show="showEditModal" :item="selectedItem" @close="closeEditModal" @saved="handleSaved" />
    <Toast ref="toastRef" />
    <ConfirmModal :show="showConfirm" :message="`Are you sure you want to delete '${selectedItem?.name}'?`"
      @confirm="confirmDelete" @cancel="cancelDelete" />

  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Common/AppLayout.vue';
import AddMenuItemModal from '@/components/Menu/AddMenuItemModal.vue';
import EditMenuItemModal from '@/components/Menu/EditMenuItemModal.vue';
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import Toast from '@/components/Common/Toast.vue'
import ConfirmModal from '@/components/Common/ConfirmModal.vue'

const showConfirm = ref(false)
const toastRef = ref(null)
const menuItems = ref([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedItem = ref(null);

const fetchMenuItems = async () => {
  const res = await api.get('/menu-items');
  menuItems.value = res.data;
};

const openAddModal = () => {
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};
const askDelete = (item) => {
  selectedItem.value = item
  showConfirm.value = true
}

const editItem = (item) => {
  selectedItem.value = item;
  showEditModal.value = true;
};

const closeEditModal = () => {
  selectedItem.value = null;
  showEditModal.value = false;
};

const handleSaved = () => {
  fetchMenuItems()
  toastRef.value?.showToast('✅ Item saved successfully!')
}


const deleteItem = async (id) => {
  await api.delete(`/menu-items/${id}`)
  fetchMenuItems()
  toastRef.value?.showToast('🗑️ Item deleted successfully!')
}
const confirmDelete = async () => {
  await api.delete(`/menu-items/${selectedItem.value.id}`)
  fetchMenuItems()
  showConfirm.value = false
  toastRef.value?.showToast(`🗑️ ${selectedItem.value.name} deleted successfully!`)
}

const cancelDelete = () => {
  showConfirm.value = false
  selectedItem.value = null
}


onMounted(fetchMenuItems);
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
