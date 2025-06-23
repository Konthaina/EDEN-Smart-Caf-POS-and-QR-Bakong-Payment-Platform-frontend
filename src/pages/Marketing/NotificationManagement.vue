<script setup>
import AppLayout from "@/components/Common/AppLayout.vue";
import { ref, onMounted, watch } from "vue";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

const { t } = useI18n();
const toast = createToastInterface();

const notifications = ref([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const notificationToDelete = ref(null);
const selectedNotification = ref(null);

const isSubmitting = ref(false);

const recurringTypes = [
  { value: "", label: t("notifications.none") },
  { value: "daily", label: t("notifications.daily") },
  { value: "weekly", label: t("notifications.weekly") },
  { value: "monthly", label: t("notifications.monthly") },
];

const weekdays = [
  { value: "monday", label: t("notifications.monday") },
  { value: "tuesday", label: t("notifications.tuesday") },
  { value: "wednesday", label: t("notifications.wednesday") },
  { value: "thursday", label: t("notifications.thursday") },
  { value: "friday", label: t("notifications.friday") },
  { value: "saturday", label: t("notifications.saturday") },
  { value: "sunday", label: t("notifications.sunday") },
];

const daysInMonth = Array.from({ length: 31 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
}));

const newNotification = ref({
  title: "",
  message: "",
  type: "",
  scheduled_at: "",
  recurring: false,
  recurring_type: "",
  recurring_value: "",
});

const fetchNotifications = async () => {
  const res = await api.get("/notifications");
  notifications.value = res.data;
};

const openAddModal = () => {
  resetNotificationForm();
  showAddModal.value = true;
};

const openEditModal = (notification) => {
  selectedNotification.value = notification;
  newNotification.value = {
    title: notification.title,
    message: notification.message,
    type: notification.type,
    scheduled_at: notification.scheduled_at
      ? dayjs(notification.scheduled_at).format("YYYY-MM-DDTHH:mm")
      : "",
    recurring: !!notification.recurring,
    recurring_type: notification.recurring_type || "",
    recurring_value: notification.recurring_value || "",
  };
  showEditModal.value = true;
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  selectedNotification.value = null;
  isSubmitting.value = false;
};

const resetNotificationForm = () => {
  newNotification.value = {
    title: "",
    message: "",
    type: "",
    scheduled_at: "",
    recurring: false,
    recurring_type: "",
    recurring_value: "",
  };
};

const addNotification = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const payload = { ...newNotification.value };
    if (!payload.recurring) {
      payload.recurring_type = "";
      payload.recurring_value = "";
    } else if (
      payload.recurring_type === "weekly" &&
      !payload.recurring_value
    ) {
      toast.error(t("notifications.please_select_weekday"));
      isSubmitting.value = false;
      return;
    } else if (
      payload.recurring_type === "monthly" &&
      !payload.recurring_value
    ) {
      toast.error(t("notifications.please_select_day_of_month"));
      isSubmitting.value = false;
      return;
    }
    await api.post("/notifications", payload);
    toast.success(t("notifications.created"));
    await fetchNotifications();
    closeModals();
  } catch (err) {
    toast.error(err.response?.data?.message || t("notifications.add_failed"));
    isSubmitting.value = false;
    console.error(err);
  }
  isSubmitting.value = false;
};

const updateNotification = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const payload = { ...newNotification.value };
    if (!payload.recurring) {
      payload.recurring_type = "";
      payload.recurring_value = "";
    } else if (
      payload.recurring_type === "weekly" &&
      !payload.recurring_value
    ) {
      toast.error(t("notifications.please_select_weekday"));
      isSubmitting.value = false;
      return;
    } else if (
      payload.recurring_type === "monthly" &&
      !payload.recurring_value
    ) {
      toast.error(t("notifications.please_select_day_of_month"));
      isSubmitting.value = false;
      return;
    }
    await api.put(`/notifications/${selectedNotification.value.id}`, payload);
    toast.success(t("notifications.updated"));
    await fetchNotifications();
    closeModals();
  } catch (err) {
    toast.error(
      err.response?.data?.message || t("notifications.update_failed")
    );
    isSubmitting.value = false;
    console.error(err);
  }
  isSubmitting.value = false;
};

const confirmDelete = (notification) => {
  notificationToDelete.value = notification;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  notificationToDelete.value = null;
};

const performDelete = async () => {
  try {
    await api.delete(`/notifications/${notificationToDelete.value.id}`);
    toast.success(t("notifications.deleted"));
    await fetchNotifications();
    cancelDelete();
  } catch (err) {
    toast.error(t("notifications.delete_failed"));
    console.error(err);
  }
};

watch(
  () => newNotification.value.recurring_type,
  (val) => {
    if (val !== "weekly" && val !== "monthly") {
      newNotification.value.recurring_value = "";
    }
  }
);

onMounted(fetchNotifications);
</script>

<template>
  <AppLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ $t("notifications.manage_notifications") }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">
            {{ $t("notifications.subtitle") }}
          </p>
        </div>
        <button
          @click="openAddModal"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          <span>{{ $t("notifications.add_button") }}</span>
        </button>
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        {{ $t("notifications.total") }}:
        <strong>{{ notifications.length }}</strong>
      </div>

      <!-- Notification Table -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-x-auto max-h-[480px] overflow-y-scroll no-scrollbar"
      >
        <table class="min-w-full text-sm text-left">
          <thead
            class="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs font-semibold z-10"
          >
            <tr>
              <th class="px-6 py-4">{{ $t("notifications.title_col") }}</th>
              <th class="px-6 py-4">{{ $t("notifications.type") }}</th>
              <th class="px-6 py-4">{{ $t("notifications.message") }}</th>
              <th class="px-6 py-4">{{ $t("notifications.scheduled_at") }}</th>
              <th class="px-6 py-4">
                {{ $t("notifications.recurring_type") }}
              </th>
              <th class="px-6 py-4">
                {{ $t("notifications.recurring_value") }}
              </th>
              <th class="px-6 py-4">{{ $t("notifications.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="n in notifications"
              :key="n.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <td
                class="px-6 py-4 font-medium text-gray-800 dark:text-gray-100"
              >
                {{ n.title }}
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                {{ n.type }}
              </td>
              <td
                class="px-6 py-4 text-gray-700 dark:text-gray-300 max-w-[160px] truncate"
              >
                {{ n.message }}
              </td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                <span v-if="n.scheduled_at">
                  {{ dayjs(n.scheduled_at).format("YYYY-MM-DD HH:mm") }}
                </span>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4">
                <span v-if="n.recurring">
                  {{ $t("notifications." + n.recurring_type) }}
                </span>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="
                    n.recurring &&
                    n.recurring_type === 'weekly' &&
                    n.recurring_value
                  "
                >
                  {{ $t("notifications." + n.recurring_value) }}
                </span>
                <span
                  v-else-if="
                    n.recurring &&
                    n.recurring_type === 'monthly' &&
                    n.recurring_value
                  "
                >
                  {{ n.recurring_value }}
                </span>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 space-x-2">
                <button
                  @click="openEditModal(n)"
                  class="bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium transition"
                >
                  {{ $t("action.edit") }}
                </button>
                <button
                  @click="confirmDelete(n)"
                  class="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-600/10 dark:hover:bg-red-600/20 dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium transition"
                >
                  {{ $t("action.delete") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <teleport to="body">
      <div
        v-if="showAddModal || showEditModal"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl w-full max-w-md space-y-5 animate-fadeIn text-gray-800 dark:text-gray-100"
        >
          <h2 class="text-xl font-bold">
            {{
              showAddModal
                ? $t("notifications.add_title")
                : $t("notifications.edit_title")
            }}
          </h2>
          <div class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
              >
                {{ $t("notifications.title_col") }}
              </label>
              <input
                v-model="newNotification.title"
                type="text"
                class="form-input"
                :placeholder="$t('notifications.title_placeholder')"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
              >
                {{ $t("notifications.message") }}
              </label>
              <textarea
                v-model="newNotification.message"
                rows="2"
                class="form-input"
                :placeholder="$t('notifications.message_placeholder')"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
              >
                {{ $t("notifications.type") }}
              </label>
              <input
                v-model="newNotification.type"
                type="text"
                class="form-input"
                :placeholder="$t('notifications.type_placeholder')"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
              >
                {{ $t("notifications.scheduled_at") }}
              </label>
              <input
                v-model="newNotification.scheduled_at"
                type="datetime-local"
                class="form-input"
              />
            </div>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="newNotification.recurring"
                class="h-4 w-4"
              />
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {{ $t("notifications.recurring") }}
              </label>
            </div>
            <div v-if="newNotification.recurring">
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
              >
                {{ $t("notifications.recurring_type") }}
              </label>
              <select
                v-model="newNotification.recurring_type"
                class="form-input"
              >
                <option
                  v-for="opt in recurringTypes"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div
              v-if="
                newNotification.recurring &&
                newNotification.recurring_type === 'weekly'
              "
            >
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
              >
                {{ $t("notifications.recurring_value_week") }}
              </label>
              <select
                v-model="newNotification.recurring_value"
                class="form-input"
              >
                <option
                  v-for="wd in weekdays"
                  :key="wd.value"
                  :value="wd.value"
                >
                  {{ wd.label }}
                </option>
              </select>
            </div>
            <div
              v-if="
                newNotification.recurring &&
                newNotification.recurring_type === 'monthly'
              "
            >
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
              >
                {{ $t("notifications.recurring_value_month") }}
              </label>
              <select
                v-model="newNotification.recurring_value"
                class="form-input"
              >
                <option
                  v-for="d in daysInMonth"
                  :key="d.value"
                  :value="d.value"
                >
                  {{ d.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button
              @click="closeModals"
              class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 text-sm rounded-full text-gray-700 dark:text-gray-200"
            >
              {{ $t("action.cancel") }}
            </button>
            <button
              v-if="showAddModal"
              :disabled="isSubmitting"
              @click="addNotification"
              class="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm text-white rounded-full shadow"
            >
              <span v-if="!isSubmitting">{{ $t("action.create") }}</span>
              <span v-else>{{ $t("action.processing") }}</span>
            </button>
            <button
              v-else
              :disabled="isSubmitting"
              @click="updateNotification"
              class="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm text-white rounded-full shadow"
            >
              <span v-if="!isSubmitting">{{ $t("action.update") }}</span>
              <span v-else>{{ $t("action.processing") }}</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-[90%] max-w-sm animate-fadeIn space-y-4 text-gray-800 dark:text-gray-100"
        >
          <h3 class="text-lg font-bold text-center">
            {{ $t("notifications.confirm_delete_title") }}
          </h3>
          <p class="text-sm text-center">
            {{ $t("notifications.confirm_delete_text") }}
            <span class="font-semibold text-purple-600 dark:text-purple-400">{{
              notificationToDelete?.title
            }}</span>
          </p>
          <div class="flex justify-center gap-3 pt-2">
            <button
              @click="cancelDelete"
              class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-full text-sm text-gray-700 dark:text-gray-200"
            >
              {{ $t("action.cancel") }}
            </button>
            <button
              @click="performDelete"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm shadow"
            >
              {{ $t("action.confirm_delete") }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </AppLayout>
</template>

<style scoped>
.form-input {
  @apply w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition;
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
