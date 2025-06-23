<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ t("banners.title") }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">
            {{ t("banners.description") }}
          </p>
        </div>
        <button
          @click="openAddModal"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          {{ t("banners.add_button") }}
        </button>
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        {{ t("banners.total") }}: <strong>{{ banners.length }}</strong>
      </div>

      <!-- Banner Table -->
      <div
        class="overflow-y-auto max-h-[480px] rounded-xl shadow no-scrollbar bg-white dark:bg-gray-800"
      >
        <table
          class="w-full text-sm text-left bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        >
          <thead
            class="bg-gray-100 dark:bg-gray-700 sticky top-0 text-xs text-gray-700 dark:text-gray-200 font-semibold uppercase border-b dark:border-gray-600"
          >
            <tr>
              <th class="px-6 py-3 font-semibold">{{ t("banners.image") }}</th>
              <th class="px-6 py-3 font-semibold">
                {{ t("banners.title_col") }}
              </th>
              <th class="px-6 py-3 font-semibold">
                {{ t("banners.description_col") }}
              </th>
              <th class="px-6 py-3 font-semibold">{{ t("banners.link") }}</th>
              <th class="px-6 py-3 font-semibold">{{ t("banners.active") }}</th>
              <th class="px-6 py-3 font-semibold">
                {{ t("banners.display_order") }}
              </th>
              <!-- ORDER -->
              <th class="px-6 py-3 font-semibold">
                {{ t("banners.actions") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="banner in banners"
              :key="banner.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
            >
              <td class="px-6 py-4">
                <img
                  :src="bannerImageUrl(banner.image)"
                  class="h-12 w-32 object-cover rounded-xl border shadow"
                  :alt="banner.title"
                />
              </td>
              <td
                class="px-6 py-4 font-medium text-gray-700 dark:text-gray-100"
              >
                {{ banner.title }}
              </td>
              <td
                class="px-6 py-4 text-gray-700 dark:text-gray-100 max-w-[200px] truncate"
              >
                {{ banner.description }}
              </td>
              <td class="px-6 py-4">
                <a
                  v-if="banner.link"
                  :href="banner.link"
                  target="_blank"
                  class="text-blue-600 underline text-sm"
                  >{{ banner.link }}</a
                >
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    banner.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200',
                  ]"
                >
                  {{ banner.is_active ? t("common.yes") : t("common.no") }}
                </span>
              </td>
              <td class="px-6 py-4">{{ banner.display_order }}</td>
              <!-- ORDER -->
              <td class="px-6 py-4 flex gap-2">
                <button
                  @click="editBanner(banner)"
                  class="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-600 rounded-full px-2 py-1"
                >
                  {{ t("common.edit") }}
                </button>
                <button
                  @click="promptDelete(banner.id)"
                  class="text-red-600 hover:text-red-800 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-600 rounded-full px-2 py-1"
                >
                  {{ t("common.delete") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="banners.length === 0" class="text-center text-gray-400 py-8">
          {{ t("banners.empty") }}
        </div>
      </div>
    </div>

    <!-- Add/Edit Banner Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6"
      >
        <div
          class="mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center"
        >
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            {{ form.id ? t("banners.edit") : t("banners.add") }}
          </h2>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-red-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label
              class="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              {{ t("banners.title_col") }}</label
            >
            <input
              v-model="form.title"
              type="text"
              class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
              required
            />
          </div>
          <div>
            <label
              class="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              {{ t("banners.description_col") }}</label
            >
            <textarea
              v-model="form.description"
              class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
              rows="2"
            />
          </div>
          <div>
            <label
              class="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              {{ t("banners.link") }}</label
            >
            <input
              v-model="form.link"
              type="url"
              class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
            />
          </div>
          <div>
            <label
              class="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              {{ t("banners.image") }}</label
            >
            <input
              type="file"
              @change="onImageChange"
              :required="!form.id"
              class="input mt-1"
              accept="image/*"
            />
            <div v-if="previewImage" class="mt-2">
              <img
                :src="previewImage"
                alt="Preview"
                class="h-24 w-full object-contain rounded-xl border shadow"
              />
            </div>
          </div>
          <!-- ORDER INPUT -->
          <div>
            <label
              class="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              {{ t("banners.display_order") }}</label
            >
            <input
              v-model.number="form.display_order"
              type="number"
              min="0"
              class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
              required
            />
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="form.is_active" class="h-4 w-4" />
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
              {{ t("banners.active") }}</label
            >
          </div>
          <div class="flex justify-end pt-3 gap-3">
            <!-- Cancel Button - customized color -->
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-5 py-2 text-sm rounded-lg text-gray-800 dark:text-gray-100 font-medium shadow"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all flex items-center justify-center"
            >
              <svg
                v-if="isSubmitting"
                class="animate-spin mr-2 w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              {{ form.id ? t("banners.update") : t("banners.create") }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      :message="t('banners.delete_confirm')"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/plugins/axios";
import AppLayout from "@/components/Common/AppLayout.vue";
import ConfirmModal from "@/components/Common/ConfirmModal.vue";
import { useToast } from "vue-toastification";

const { t } = useI18n();
const toast = useToast();

const banners = ref([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const deletingId = ref(null);
const previewImage = ref(null);
const isSubmitting = ref(false);

const form = ref({
  id: null,
  title: "",
  description: "",
  link: "",
  image: null,
  display_order: 0, // ORDER
  is_active: true,
});

const resetForm = () => {
  form.value = {
    id: null,
    title: "",
    description: "",
    link: "",
    image: null,
    display_order: 0, // ORDER
    is_active: true,
  };
  previewImage.value = null;
};

const bannerImageUrl = (path) => {
  return path?.startsWith("http")
    ? path
    : `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }/storage/${path}`;
};

const fetchBanners = async () => {
  try {
    const res = await api.get("/banners");
    banners.value = res.data;
  } catch (error) {
    toast.error(t("banners.fetch_error"));
  }
};

const openAddModal = () => {
  resetForm();
  showModal.value = true;
};

const editBanner = (item) => {
  form.value = { ...item };
  previewImage.value = bannerImageUrl(item.image);
  form.value.image = null;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
  isSubmitting.value = false; // Always reset submit state
};

const onImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  form.value.image = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const submitForm = async () => {
  if (isSubmitting.value) return; // Prevent double submit
  isSubmitting.value = true;

  const formData = new FormData();
  formData.append("title", form.value.title || "");
  formData.append("description", form.value.description || "");
  formData.append("link", form.value.link || "");
  formData.append("is_active", form.value.is_active ? 1 : 0);
  formData.append("display_order", form.value.display_order ?? 0); // ORDER

  if (form.value.image instanceof File) {
    formData.append("image", form.value.image);
  }

  try {
    if (form.value.id) {
      await api.post(`/banners/${form.value.id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("banners.update_success"));
    } else {
      await api.post("/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("banners.create_success"));
    }
    await fetchBanners();
    closeModal();
  } catch (error) {
    toast.error(t("banners.save_error"));
  } finally {
    isSubmitting.value = false;
  }
};

const promptDelete = (id) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/banners/${deletingId.value}`);
    toast.success(t("banners.delete_success"));
    showDeleteModal.value = false;
    await fetchBanners();
  } catch (error) {
    toast.error(t("banners.delete_error"));
  }
};

onMounted(fetchBanners);
</script>
