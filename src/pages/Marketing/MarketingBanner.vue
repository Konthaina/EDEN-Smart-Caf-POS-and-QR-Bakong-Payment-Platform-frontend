<template>
  <AppLayout>
    <div class="p-6 h-full flex flex-col min-h-0">
      <div class="flex-1 flex flex-col justify-between gap-6 min-h-0">
        <!-- ── Top cluster: header + search/clear + filters ───────────── -->
        <div class="space-y-4">
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

          <!-- Search + Clear -->
          <div class="flex flex-wrap gap-3 items-center justify-between">
            <div class="relative w-72">
              <span
                class="absolute left-3 top-2.5 text-gray-400"
                aria-hidden="true"
              >
                <svg width="18" height="18" viewBox="0 0 20 20">
                  <path
                    d="M13.5 13.5 17 17M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
                    fill="none"
                    stroke="#a78bfa"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                v-model="search"
                :placeholder="t('banners.search') || 'Search banner...'"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
                type="search"
                autocomplete="off"
                aria-label="Search banners"
              />
            </div>

            <div class="flex items-end gap-3">
              <!-- Status filter -->
              <div class="flex flex-col">
                <label class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t("banners.filter.status") || "Status" }}
                </label>
                <select
                  v-model="filters.status"
                  class="input-mini"
                  aria-label="Filter by status"
                >
                  <option value="all">{{ t("common.all") || "All" }}</option>
                  <option value="active">
                    {{ t("common.active") || "Active" }}
                  </option>
                  <option value="inactive">
                    {{ t("common.inactive") || "Inactive/Hidden" }}
                  </option>
                </select>
              </div>

              <button
                class="border rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="clearFilters"
              >
                {{ t("common.clear") || "Clear" }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Bottom cluster: summary + table ─────────────────────────── -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <div class="text-sm font-semibold text-gray-800 dark:text-white">
            {{ t("banners.total") }}:
            <span class="font-bold">{{
              loading ? "—" : filteredAndSorted.length
            }}</span>
            <span
              v-if="!loading && filteredAndSorted.length === 0"
              class="ml-2 text-gray-500 dark:text-gray-400"
            >
              · {{ t("banners.empty") }}
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

                    <th class="px-6 py-3">{{ t("banners.image") }}</th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('title')"
                      :aria-sort="ariaSort('title')"
                      @click="setSort('title')"
                    >
                      {{ t("banners.title_col") }}
                      <SortIcon :active="sort.by === 'title'" :dir="sort.dir" />
                    </th>

                    <th class="px-6 py-3">
                      {{ t("banners.description_col") }}
                    </th>

                    <th class="px-6 py-3">{{ t("banners.link") }}</th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('is_active')"
                      :aria-sort="ariaSort('is_active')"
                      @click="setSort('is_active')"
                    >
                      {{ t("banners.active") }}
                      <SortIcon
                        :active="sort.by === 'is_active'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('display_order')"
                      :aria-sort="ariaSort('display_order')"
                      @click="setSort('display_order')"
                    >
                      {{ t("banners.display_order") }}
                      <SortIcon
                        :active="sort.by === 'display_order'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th class="px-6 py-3">{{ t("banners.actions") }}</th>
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
                          class="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
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
                          class="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
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

                  <!-- Rows -->
                  <template v-else>
                    <tr v-if="filteredAndSorted.length === 0">
                      <td
                        colspan="8"
                        class="text-center py-10 text-gray-500 dark:text-gray-400"
                      >
                        <div class="flex flex-col items-center gap-3">
                          <div class="text-3xl">🖼️</div>
                          <div class="font-semibold">
                            {{ t("banners.empty_title") || t("banners.empty") }}
                          </div>
                          <div class="text-sm">
                            {{ t("banners.empty_help") || "" }}
                          </div>
                          <button
                            @click="openAddModal"
                            class="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm"
                          >
                            {{ t("banners.add_button") }}
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      v-for="(banner, idx) in filteredAndSorted"
                      :key="banner.id"
                      class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td
                        class="px-4 py-4 font-mono text-gray-500 dark:text-gray-400 text-center"
                      >
                        {{ idx + 1 }}
                      </td>

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
                        class="px-6 py-4 text-gray-700 dark:text-gray-100 max-w-[260px] truncate"
                      >
                        {{ banner.description }}
                      </td>

                      <td class="px-6 py-4">
                        <a
                          v-if="banner.link"
                          :href="banner.link"
                          target="_blank"
                          class="text-blue-600 underline text-sm"
                        >
                          {{ banner.link }}
                        </a>
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
                          {{
                            banner.is_active ? t("common.yes") : t("common.no")
                          }}
                        </span>
                      </td>

                      <td class="px-6 py-4">
                        {{ banner.display_order }}
                      </td>

                      <td class="px-6 py-4 flex gap-2">
                        <button
                          @click="editBanner(banner)"
                          class="border border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-800 transition"
                        >
                          {{ t("common.edit") }}
                        </button>
                        <button
                          @click="promptDelete(banner.id)"
                          class="border border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 rounded-full px-3 py-1 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-800 transition"
                        >
                          {{ t("common.delete") }}
                        </button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Add/Edit Modal -->
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
                    >{{ t("banners.title_col") }}</label
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
                    >{{ t("banners.description_col") }}</label
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
                    >{{ t("banners.link") }}</label
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
                    >{{ t("banners.image") }}</label
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

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      class="text-sm font-semibold text-gray-600 dark:text-gray-300"
                      >{{ t("banners.display_order") }}</label
                    >
                    <input
                      v-model.number="form.display_order"
                      type="number"
                      min="0"
                      class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
                      required
                    />
                  </div>

                  <div class="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      v-model="form.is_active"
                      class="h-4 w-4"
                      id="bActive"
                    />
                    <label
                      for="bActive"
                      class="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      {{ t("banners.active") }}
                    </label>
                  </div>
                </div>

                <div class="flex justify-end pt-3 gap-3">
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
                    class="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all inline-flex items-center"
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
            :title="t('banners.delete_title')"
            @confirm="confirmDelete"
            @cancel="showDeleteModal = false"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/plugins/axios";
import AppLayout from "@/components/Common/AppLayout.vue";
import ConfirmModal from "@/components/Common/ConfirmModal.vue";
import { useToast } from "vue-toastification";

const { t } = useI18n();
const toast = useToast();

/* ── State ─────────────────────────────────────────────────────────────── */
const banners = ref([]);
const loading = ref(false);
const isSubmitting = ref(false);

const showModal = ref(false);
const showDeleteModal = ref(false);
const deletingId = ref(null);
const previewImage = ref(null);

/* ── Form ──────────────────────────────────────────────────────────────── */
const form = ref({
  id: null,
  title: "",
  description: "",
  link: "",
  image: null,
  display_order: 0,
  is_active: true,
});

/* ── Persisted search/sort & filters ───────────────────────────────────── */
const LS_KEY = "banners_prefs_v1";
const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");

const search = ref(saved.search || "");
const filters = ref({
  status: saved.filters?.status ?? "all", // all | active | inactive
});
const sort = ref(saved.sort || { by: "title", dir: "asc" }); // title | is_active | display_order

watch(
  [search, filters, sort],
  () => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        search: search.value,
        filters: filters.value,
        sort: sort.value,
      })
    );
  },
  { deep: true }
);

/* ── Image URL helper ──────────────────────────────────────────────────── */
const bannerImageUrl = (path) => {
  const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (!path) return `${import.meta.env.BASE_URL}banner.png`;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/storage")) return `${API_BASE}${path}`;
  if (path.startsWith("storage/")) return `${API_BASE}/${path}`;
  return `${API_BASE}/storage/${path}`;
};

/* ── Data fetch ────────────────────────────────────────────────────────── */
const fetchBanners = async () => {
  loading.value = true;
  try {
    const res = await api.get("/banners");
    banners.value = Array.isArray(res.data?.data) ? res.data.data : res.data;
  } catch {
    banners.value = [];
    toast.error(t("banners.fetch_error"));
  } finally {
    loading.value = false;
  }
};
onMounted(fetchBanners);

/* ── Filters + Search + Sorting ───────────────────────────────────────── */
const filteredAndSorted = computed(() => {
  let arr = banners.value.slice();

  // Search
  const s = search.value.trim().toLowerCase();
  if (s) {
    arr = arr.filter(
      (b) =>
        (b.title || "").toLowerCase().includes(s) ||
        (b.description || "").toLowerCase().includes(s) ||
        (b.link || "").toLowerCase().includes(s)
    );
  }

  // Status filter
  if (filters.value.status !== "all") {
    const wantActive = filters.value.status === "active";
    arr = arr.filter((b) => Boolean(b.is_active) === wantActive);
  }

  // Sort
  const dir = sort.value.dir === "asc" ? 1 : -1;
  arr.sort((a, b) => {
    switch (sort.value.by) {
      case "title": {
        return (a.title || "").localeCompare(b.title || "") * dir;
      }
      case "is_active": {
        return ((a.is_active ? 1 : 0) - (b.is_active ? 1 : 0)) * dir;
      }
      case "display_order": {
        return ((+a.display_order || 0) - (+b.display_order || 0)) * dir;
      }
      default:
        return 0;
    }
  });

  return arr;
});

function setSort(by) {
  if (sort.value.by !== by) {
    const defaultDir = by === "display_order" ? "asc" : "asc";
    sort.value = { by, dir: defaultDir };
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

/* Tri-state icon (neutral chevrons when unsorted; ▲/▼ when active) */
const SortIcon = ({ active, dir }) =>
  h(
    "svg",
    {
      width: 12,
      height: 12,
      viewBox: "0 0 20 20",
      class:
        "inline ml-1 " +
        (active
          ? "text-purple-600 dark:text-purple-300"
          : "text-gray-400 dark:text-gray-500"),
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: active
          ? dir === "asc"
            ? "M10 5l5 7H5l5-7z"
            : "M10 15l-5-7h10l-5 7z"
          : "M7 7l3-3 3 3H7zM7 13l3 3 3-3H7z",
        fill: "currentColor",
      }),
    ]
  );

/* ── Image upload & form actions ───────────────────────────────────────── */
const resetForm = () => {
  form.value = {
    id: null,
    title: "",
    description: "",
    link: "",
    image: null,
    display_order: 0,
    is_active: true,
  };
  previewImage.value = null;
};
const openAddModal = () => {
  resetForm();
  showModal.value = true;
};
const editBanner = (item) => {
  form.value = { ...item, image: null };
  previewImage.value = bannerImageUrl(item.image);
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
  resetForm();
  isSubmitting.value = false;
};

const onImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  form.value.image = file;
  const reader = new FileReader();
  reader.onload = (ev) => (previewImage.value = ev.target.result);
  reader.readAsDataURL(file);
};

const submitForm = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  const fd = new FormData();
  fd.append("title", form.value.title || "");
  fd.append("description", form.value.description || "");
  fd.append("link", form.value.link || "");
  fd.append("is_active", form.value.is_active ? 1 : 0);
  fd.append("display_order", form.value.display_order ?? 0);
  if (form.value.image instanceof File) fd.append("image", form.value.image);

  try {
    if (form.value.id) {
      fd.append("_method", "PUT");
      await api.post(`/banners/${form.value.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("banners.update_success"));
    } else {
      await api.post(`/banners`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("banners.create_success"));
    }
    await fetchBanners();
    closeModal();
  } catch {
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
  } catch {
    toast.error(t("banners.delete_error"));
  }
};

/* ── Clear helpers ────────────────────────────────────────────────────── */
const clearFilters = () => {
  search.value = "";
  filters.value.status = "all";
};
</script>

<style scoped>
.input-mini {
  @apply border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500;
}
/* Invisible scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
