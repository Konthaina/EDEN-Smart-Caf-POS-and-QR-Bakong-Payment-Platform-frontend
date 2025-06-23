<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ t("discounts.title") }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">{{ t("discounts.description") }}</p>
        </div>
        <button
          @click="openAddModal"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          {{ t("discounts.add_button") }}
        </button>
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        {{ $t('discounts.total') }}: <strong>{{ discounts.length }}</strong>
      </div>

      <!-- Table -->
      <div class="overflow-y-auto max-h-[480px] rounded-xl shadow no-scrollbar bg-white dark:bg-gray-800">
        <table class="w-full text-sm text-left bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
          <thead class="bg-gray-100 dark:bg-gray-700 sticky top-0 text-xs text-gray-700 dark:text-gray-200 font-semibold uppercase border-b dark:border-gray-600">
            <tr>
              <th class="px-6 py-3 font-semibold">{{ t("discounts.code") }}</th>
              <th class="px-6 py-3 font-semibold">{{ t("discounts.type") }}</th>
              <th class="px-6 py-3 font-semibold">{{ t("discounts.value") }}</th>
              <th class="px-6 py-3 font-semibold">{{ t("discounts.expires") }}</th>
              <th class="px-6 py-3 font-semibold">{{ t("discounts.active") }}</th>
              <th class="px-6 py-3 font-semibold">{{ t("discounts.actions") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="d in discounts" :key="d.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150">
              <td class="px-6 py-4 font-medium text-gray-700 dark:text-gray-100">{{ d.code }}</td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-100">{{ d.percentage ? t("discounts.percent") : t("discounts.fixed") }}</td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-100">
                {{ d.percentage ? d.percentage + "%" : "$" + d.amount }}
              </td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-100">{{ formatDateTime(d.expires_at) }}</td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    d.active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
                  ]"
                >
                  {{ d.active ? t("common.yes") : t("common.no") }}
                </span>
              </td>
              <td class="px-6 py-4 flex gap-2">
                <button @click="editDiscount(d)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-600 rounded-full px-2 py-1">
                  {{ t("common.edit") }}
                </button>
                <button @click="promptDelete(d.id)" class="text-red-600 hover:text-red-800 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-600 rounded-full px-2 py-1">
                  {{ t("common.delete") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Discount Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div class="mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            {{ form.id ? t("discounts.edit") : t("discounts.add") }}
          </h2>
          <button @click="closeModal" class="text-gray-500 hover:text-red-500 text-2xl leading-none">×</button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">{{ t("discounts.code") }}</label>
            <input
              v-model="form.code"
              type="text"
              class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">{{ t("discounts.percentage") }}</label>
              <input
                v-model.number="form.percentage"
                type="number"
                min="0"
                max="100"
                class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">{{ t("discounts.amount") }}</label>
              <input
                v-model.number="form.amount"
                type="number"
                min="0"
                class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
              />
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">{{ t("discounts.expires_at") }}</label>
            <input
              v-model="form.expires_at"
              type="datetime-local"
              class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
            />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="form.active" class="h-4 w-4" />
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t("discounts.active") }}</label>
          </div>

          <div class="text-right pt-3">
            <button
              type="submit"
              class="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all"
            >
              {{ form.id ? t("discounts.update") : t("discounts.create") }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      :message="t('discounts.delete_confirm')"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import "dayjs/locale/km";
import api from "@/plugins/axios";
import AppLayout from "@/components/Common/AppLayout.vue";
import ConfirmModal from "@/components/Common/ConfirmModal.vue";
import { useToast } from "vue-toastification";

const { t } = useI18n();
const toast = useToast();
dayjs.locale("km");

const discounts = ref([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const deletingId = ref(null);

const form = ref({
  id: null,
  code: "",
  percentage: null,
  amount: null,
  expires_at: null,
  active: true,
});

const resetForm = () => {
  form.value = {
    id: null,
    code: "",
    percentage: null,
    amount: null,
    expires_at: null,
    active: true,
  };
};

const fetchDiscounts = async () => {
  const res = await api.get("/discounts");
  discounts.value = res.data.map(d => ({
    ...d,
    active: d.expires_at && new Date(d.expires_at) < new Date() ? false : d.active,
  }));
};

const openAddModal = () => {
  resetForm();
  showModal.value = true;
};

const editDiscount = (item) => {
  form.value = { ...item };
  if (item.expires_at) {
    form.value.expires_at = dayjs(item.expires_at).format("YYYY-MM-DDTHH:mm");
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const submitForm = async () => {
  const data = { ...form.value };
  data.code = data.code.trim().toUpperCase();

  try {
    if (data.id) {
      await api.put(`/discounts/${data.id}`, data);
      toast.success(t("discounts.update_success"));
    } else {
      await api.post("/discounts", data);
      toast.success(t("discounts.create_success"));
    }
    await fetchDiscounts();
    closeModal();
  } catch (error) {
    toast.error(t("discounts.error"));
  }
};

const promptDelete = (id) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/discounts/${deletingId.value}`);
    toast.success(t("discounts.delete_success"));
    showDeleteModal.value = false;
    await fetchDiscounts();
  } catch (error) {
    toast.error(t("discounts.delete_error"));
  }
};

const formatDateTime = (datetime) => {
  if (!datetime) return t("discounts.never");
  return dayjs(datetime).format("DD-MM-YYYY hh:mm A");
};

onMounted(fetchDiscounts);
</script>
