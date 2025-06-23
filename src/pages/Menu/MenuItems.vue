<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ $t("menu.title") }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">
            {{ $t("menu.subtitle") }}
          </p>
        </div>
        <button
          @click="openAddModal"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          <span>{{ $t("menu.add") }}</span>
        </button>
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        {{ $t("menu.total") }}: <strong>{{ menuItems.length }}</strong>
      </div>

      <!-- Table -->
      <div class="rounded-xl shadow bg-white dark:bg-gray-800 overflow-hidden">
        <div class="max-h-[480px] overflow-y-auto no-scrollbar">
          <table class="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead
              class="bg-purple-50 dark:bg-gray-700 text-purple-800 dark:text-purple-300 font-semibold text-left sticky top-0 z-10"
            >
              <tr>
                <th class="px-4 py-3">{{ $t("menu.image") }}</th>
                <th class="px-4 py-3">{{ $t("menu.name") }}</th>
                <th class="px-4 py-3">{{ $t("menu.price") }}</th>
                <th class="px-4 py-3">{{ $t("menu.available") }}</th>
                <th class="px-4 py-3">{{ $t("menu.category") }}</th>
                <th class="px-4 py-3">{{ $t("menu.actions") }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="item in menuItems"
                :key="item.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td class="px-4 py-3 align-middle">
                  <img
                    :src="`http://127.0.0.1:8000/storage/${item.image}`"
                    alt="item image"
                    class="w-12 h-12 rounded-lg object-cover border dark:border-gray-700"
                  />
                </td>
                <td
                  class="px-4 py-3 font-medium text-gray-800 dark:text-white align-middle"
                >
                  {{ item.name }}
                </td>
                <td
                  class="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold align-middle"
                >
                  ${{ item.price }}
                </td>
                <td class="px-4 py-3 align-middle">
                  <span
                    v-if="item.available_quantity !== null"
                    class="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  >
                    {{ item.available_quantity }}
                  </span>
                  <span v-else class="text-xs font-medium text-gray-400 italic">
                    N/A
                  </span>
                </td>
                <td class="px-4 py-3 align-middle">
                  <span
                    class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ item.category?.name || "—" }}
                  </span>
                </td>
                <td class="px-4 py-3 space-x-2 align-middle">
                  <button
                    class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                    @click="editItem(item)"
                  >
                    {{ $t("actions.edit") }}
                  </button>
                  <button
                    class="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-1 rounded-full text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800 transition"
                    @click="askDelete(item)"
                  >
                    {{ $t("actions.delete") }}
                  </button>
                </td>
              </tr>
              <tr v-if="menuItems.length === 0">
                <td
                  colspan="6"
                  class="text-center py-8 text-gray-400 dark:text-gray-500 align-middle"
                >
                  {{ $t("menu.empty") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddMenuItemModal
      :show="showAddModal"
      @close="closeAddModal"
      @saved="handleSaved"
    />
    <EditMenuItemModal
      :show="showEditModal"
      :item="selectedItem"
      @close="closeEditModal"
      @saved="handleSaved"
    />
    <Toast ref="toastRef" />
    <ConfirmModal
      :show="showConfirm"
      :message="$t('menu.confirmDelete', { name: selectedItem?.name })"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </AppLayout>
</template>

<script setup>
import AppLayout from "@/components/Common/AppLayout.vue";
import AddMenuItemModal from "@/components/Menu/AddMenuItemModal.vue";
import EditMenuItemModal from "@/components/Menu/EditMenuItemModal.vue";
import ConfirmModal from "@/components/Common/ConfirmModal.vue";
import { ref, onMounted } from "vue";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";

const toast = createToastInterface();

const menuItems = ref([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showConfirm = ref(false);
const selectedItem = ref(null);

const fetchMenuItems = async () => {
  const res = await api.get("/menu-items");

  // Fetch available quantity for each item
  menuItems.value = await Promise.all(
    res.data.map(async (item) => {
      try {
        const availabilityRes = await api.get(
          `/menu-items/${item.id}/availability`
        );
        item.available_quantity = availabilityRes.data.available;
      } catch (e) {
        item.available_quantity = null; // fallback
      }
      return item;
    })
  );
};

const openAddModal = () => {
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const editItem = (item) => {
  selectedItem.value = item;
  showEditModal.value = true;
};

const closeEditModal = () => {
  selectedItem.value = null;
  showEditModal.value = false;
};

const askDelete = (item) => {
  selectedItem.value = item;
  showConfirm.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/menu-items/${selectedItem.value.id}`);
    toast.success(`${selectedItem.value.name} deleted successfully!`);
    fetchMenuItems();
  } catch (error) {
    toast.error("Failed to delete item.");
  } finally {
    showConfirm.value = false;
    selectedItem.value = null;
  }
};

const cancelDelete = () => {
  showConfirm.value = false;
  selectedItem.value = null;
};

const handleSaved = () => {
  fetchMenuItems();
  toast.success("Item saved successfully!");
};

onMounted(fetchMenuItems);
</script>
