<template>
  <AppLayout>
    <div
      :lang="locale"
      class="p-6 h-full flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900 rounded-xl khmer-support"
    >
      <div class="flex-1 flex flex-col justify-between gap-6 min-h-0">
        <!-- ── Top: header + search + clear ───────────────────────────── -->
        <div class="space-y-4">
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
              {{ $t("notifications.add_button") }}
            </button>
          </div>

          <!-- Search + Clear -->
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div class="relative w-72">
              <span
                class="absolute left-3 top-2.5 text-gray-400"
                aria-hidden="true"
              >
                <Search class="w-4 h-4 text-purple-400" />
              </span>
              <input
                v-model="search"
                :placeholder="$t('notifications.search') || 'Search…'"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
                type="search"
                autocomplete="off"
                aria-label="Search notifications"
              />
            </div>

            <button
              class="border rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              @click="clearFilters"
            >
              {{ $t("common.clear") || "Clear" }}
            </button>
          </div>
        </div>

        <!-- ── Bottom: summary + table ────────────────────────────────── -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <div class="text-sm font-semibold text-gray-800 dark:text-white">
            {{ $t("notifications.total") }}:
            <span class="font-bold">{{
              loading ? "—" : filteredAndSorted.length
            }}</span>
            <span
              v-if="!loading && filteredAndSorted.length === 0"
              class="ml-2 text-gray-500 dark:text-gray-400"
            >
              · {{ $t("notifications.no_data") }}
            </span>
          </div>

          <div
            class="flex-1 min-h-0 flex flex-col rounded-xl shadow bg-white dark:bg-gray-800 overflow-hidden"
          >
            <div class="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <table class="min-w-full text-sm text-left">
                <thead
                  class="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs font-semibold z-10"
                >
                  <tr>
                    <th class="px-4 py-3 w-12">No</th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('title')"
                      :aria-sort="ariaSort('title')"
                      @click="setSort('title')"
                    >
                      {{ $t("notifications.title_col") }}
                      <SortIcon :active="sort.by === 'title'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('type')"
                      :aria-sort="ariaSort('type')"
                      @click="setSort('type')"
                    >
                      {{ $t("notifications.type") }}
                      <SortIcon :active="sort.by === 'type'" :dir="sort.dir" />
                    </th>

                    <th class="px-6 py-3">{{ $t("notifications.message") }}</th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('scheduled_at')"
                      :aria-sort="ariaSort('scheduled_at')"
                      @click="setSort('scheduled_at')"
                    >
                      {{ $t("notifications.scheduled_at") }}
                      <SortIcon
                        :active="sort.by === 'scheduled_at'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th class="px-6 py-3">
                      {{ $t("notifications.recurring_type") }}
                    </th>
                    <th class="px-6 py-3">
                      {{ $t("notifications.recurring_value") }}
                    </th>
                    <th class="px-6 py-3">{{ $t("notifications.actions") }}</th>
                  </tr>
                </thead>

                <tbody>
                  <!-- Loading skeleton -->
                  <template v-if="loading">
                    <tr
                      v-for="n in 6"
                      :key="'sk' + n"
                      class="border-t dark:border-gray-700"
                    >
                      <td class="px-4 py-4">
                        <div
                          class="h-3 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                        />
                      </td>
                    </tr>
                  </template>

                  <!-- Empty state -->
                  <tr v-else-if="filteredAndSorted.length === 0">
                    <td
                      colspan="8"
                      class="text-center py-10 text-gray-500 dark:text-gray-400"
                    >
                      <div class="flex flex-col items-center gap-3">
                        <Bell class="w-10 h-10 text-purple-500" />
                        <div
                          class="font-semibold text-gray-700 dark:text-gray-200"
                        >
                          {{
                            $t("notifications.empty_title") ||
                            "No notifications yet"
                          }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {{
                            $t("notifications.empty_help") ||
                            "Click the button to add your first notification."
                          }}
                        </div>
                        <button
                          @click="openAddModal"
                          class="mt-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium px-5 py-2 rounded-full shadow transition-all text-sm"
                        >
                          {{ $t("notifications.add_button") }}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Data rows -->
                  <tr
                    v-else
                    v-for="(n, idx) in filteredAndSorted"
                    :key="n.id"
                    class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td
                      class="px-4 py-4 font-mono text-gray-500 dark:text-gray-400 text-center"
                    >
                      {{ idx + 1 }}
                    </td>

                    <td
                      class="px-6 py-4 font-medium text-gray-800 dark:text-gray-100"
                    >
                      {{ n.title }}
                    </td>

                    <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {{ n.type }}
                    </td>

                    <td
                      class="px-6 py-4 text-gray-700 dark:text-gray-300 max-w-[260px] truncate"
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
                      <span v-if="n.recurring">{{
                        $t("notifications." + n.recurring_type)
                      }}</span>
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
                        class="border border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-800 px-3 py-1 rounded-full text-xs font-medium transition"
                      >
                        {{ $t("action.edit") }}
                      </button>
                      <button
                        @click="confirmDelete(n)"
                        class="border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-800 px-3 py-1 rounded-full text-xs font-medium transition"
                      >
                        {{ $t("action.delete") }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Add/Edit Modal -->
          <teleport to="body">
            <div
              v-if="showAddModal || showEditModal"
              :lang="locale"
              class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center khmer-support"
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
                      >{{ $t("notifications.title_col") }}</label
                    >
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
                      >{{ $t("notifications.message") }}</label
                    >
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
                      >{{ $t("notifications.type") }}</label
                    >
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
                      >{{ $t("notifications.scheduled_at") }}</label
                    >
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
                      id="recurringChk"
                    />
                    <label
                      for="recurringChk"
                      class="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      {{ $t("notifications.recurring") }}
                    </label>
                  </div>

                  <div v-if="newNotification.recurring">
                    <label
                      class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
                      >{{ $t("notifications.recurring_type") }}</label
                    >
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
                      >{{ $t("notifications.recurring_value_week") }}</label
                    >
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
                      >{{ $t("notifications.recurring_value_month") }}</label
                    >
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

          <!-- Delete Confirmation -->
          <teleport to="body">
            <div
              v-if="showDeleteConfirm"
              :lang="locale"
              class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center khmer-support"
            >
              <div
                class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-[90%] max-w-sm animate-fadeIn space-y-4 text-gray-800 dark:text-gray-100"
              >
                <h3 class="text-lg font-bold text-center">
                  {{ $t("notifications.confirm_delete_title") }}
                </h3>
                <p class="text-sm text-center">
                  {{ $t("notifications.confirm_delete_text") }}
                  <span
                    class="font-semibold text-purple-600 dark:text-purple-400"
                    >{{ notificationToDelete?.title }}</span
                  >
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
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from "@/components/Common/AppLayout.vue";
import { ref, onMounted, watch, computed, h } from "vue";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { Bell, ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-vue-next";

const { t, locale } = useI18n();
const toast = createToastInterface();

/* state */
const notifications = ref([]);
const search = ref("");
const loading = ref(false);
const isSubmitting = ref(false);

const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const notificationToDelete = ref(null);
const selectedNotification = ref(null);

/* persisted prefs like Discounts */
const LS_KEY = "notifications_prefs_v1";
const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
const sort = ref(saved.sort || { by: "title", dir: "asc" });

watch(
  [search, sort],
  () => {
    localStorage.setItem(LS_KEY, JSON.stringify({ sort: sort.value }));
  },
  { deep: true }
);

/* select options (reactive to locale) */
const recurringTypes = computed(() => [
  { value: "", label: t("notifications.none") },
  { value: "daily", label: t("notifications.daily") },
  { value: "weekly", label: t("notifications.weekly") },
  { value: "monthly", label: t("notifications.monthly") },
]);
const weekdays = computed(() => [
  { value: "monday", label: t("notifications.monday") },
  { value: "tuesday", label: t("notifications.tuesday") },
  { value: "wednesday", label: t("notifications.wednesday") },
  { value: "thursday", label: t("notifications.thursday") },
  { value: "friday", label: t("notifications.friday") },
  { value: "saturday", label: t("notifications.saturday") },
  { value: "sunday", label: t("notifications.sunday") },
]);
const daysInMonth = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

/* form */
const newNotification = ref({
  title: "",
  message: "",
  type: "",
  scheduled_at: "",
  recurring: false,
  recurring_type: "",
  recurring_value: "",
});

/* fetch */
const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await api.get("/notifications");
    notifications.value = Array.isArray(res.data?.data)
      ? res.data.data
      : res.data;
  } catch (err) {
    toast.error(
      t("notifications.fetch_failed") || "Failed to fetch notifications"
    );
    console.error(err);
  } finally {
    loading.value = false;
  }
};
onMounted(fetchNotifications);

/* derived list (search + sort) */
const filteredAndSorted = computed(() => {
  const list = Array.isArray(notifications.value) ? notifications.value : [];
  let arr = list.slice();

  const s = search.value.trim().toLowerCase();
  if (s) {
    arr = arr.filter(
      (n) =>
        (n.title || "").toLowerCase().includes(s) ||
        (n.message || "").toLowerCase().includes(s) ||
        (n.type || "").toLowerCase().includes(s)
    );
  }

  const dir = sort.value.dir === "asc" ? 1 : -1;
  arr.sort((a, b) => {
    switch (sort.value.by) {
      case "title":
        return (a.title || "").localeCompare(b.title || "") * dir;
      case "type":
        return (a.type || "").localeCompare(b.type || "") * dir;
      case "scheduled_at": {
        const ta = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0;
        const tb = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0;
        return (ta - tb) * dir;
      }
      default:
        return 0;
    }
  });

  return arr;
});

/* sort helpers (like Discounts) */
function setSort(by) {
  if (sort.value.by !== by) {
    sort.value = { by, dir: by === "scheduled_at" ? "desc" : "asc" };
  } else {
    sort.value.dir = sort.value.dir === "asc" ? "desc" : "asc";
  }
}
function isActive(col) {
  return sort.value.by === col ? "text-purple-700 dark:text-purple-300" : "";
}
function ariaSort(col) {
  return sort.value.by === col
    ? sort.value.dir === "asc"
      ? "ascending"
      : "descending"
    : "none";
}

/* compact chevron icon */
const SortIcon = (props) =>
  h(
    "span",
    {
      class:
        (props.active
          ? "text-purple-600 dark:text-purple-300"
          : "text-gray-400 dark:text-gray-500") +
        " inline-block ml-1 align-middle",
      "aria-hidden": "true",
    },
    [
      h(
        props.active
          ? props.dir === "asc"
            ? ChevronUp
            : ChevronDown
          : ChevronsUpDown,
        { class: "w-3 h-3" }
      ),
    ]
  );

/* UI actions */
const clearFilters = () => {
  search.value = "";
};

/* modal controls */
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

/* CRUD */
const addNotification = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const payload = normalizedPayload(newNotification.value);
    await api.post("/notifications", payload);
    toast.success(t("notifications.created"));
    await fetchNotifications();
    closeModals();
  } catch (err) {
    toast.error(err.response?.data?.message || t("notifications.add_failed"));
    console.error(err);
  } finally {
    isSubmitting.value = false;
  }
};

const updateNotification = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const payload = normalizedPayload(newNotification.value);
    await api.put(`/notifications/${selectedNotification.value.id}`, payload);
    toast.success(t("notifications.updated"));
    await fetchNotifications();
    closeModals();
  } catch (err) {
    toast.error(
      err.response?.data?.message || t("notifications.update_failed")
    );
    console.error(err);
  } finally {
    isSubmitting.value = false;
  }
};

function normalizedPayload(src) {
  const p = { ...src };
  if (!p.recurring) {
    p.recurring_type = "";
    p.recurring_value = "";
  } else if (p.recurring_type === "weekly" && !p.recurring_value) {
    toast.error(t("notifications.please_select_weekday"));
    throw new Error("validation");
  } else if (p.recurring_type === "monthly" && !p.recurring_value) {
    toast.error(t("notifications.please_select_day_of_month"));
    throw new Error("validation");
  }
  return p;
}

/* delete */
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
</script>

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

/* Invisible scrollbar like Discounts */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Khmer-friendly font stack */
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
