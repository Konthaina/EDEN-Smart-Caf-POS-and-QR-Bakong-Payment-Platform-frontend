<template>
  <AppLayout>
    <!-- PAGE SHELL -->
    <div class="p-6 flex-1 min-h-0 flex flex-col bg-gray-50 dark:bg-gray-900 rounded-xl">
      <!-- CONTENT AREA -->
      <div class="flex-1 min-h-0 flex flex-col">
        <!-- ── Top cluster: header + search ─────────────────────────── -->
        <div class="space-y-4 shrink-0 pb-3">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
                {{ $t("categories.title") }}
              </h1>
              <p class="text-sm text-gray-400 dark:text-gray-300 mt-1">
                {{ $t("categories.subtitle") }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <!-- Show archived toggle -->
              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
                <input
                  type="checkbox"
                  v-model="showArchived"
                  @change="fetchCategories"
                  class="rounded border-gray-300 dark:border-gray-700"
                />
                <span>{{ $t("categories.showArchived") || "Show archived" }}</span>
              </label>
              <button
                @click="openAdd"
                class="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-xl font-medium shadow transition-all duration-200 text-sm"
              >
                {{ $t("categories.add") }}
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="flex justify-between items-center">
            <div class="relative w-72">
              <span class="absolute left-3 top-2.5 text-gray-400">
                <Search class="w-4 h-4 text-purple-400" />
              </span>
              <input
                v-model="search"
                :placeholder="$t('categories.search')"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
              />
            </div>
            <div />
          </div>
        </div>

        <!-- ── Bottom cluster: count + table ─────────────────────────────── -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <!-- Count -->
          <div class="shrink-0 font-semibold text-gray-800 dark:text-white">
            {{ $t("categories.total") }}:
            <span class="font-bold">{{ sortedCategories.length }}</span>
          </div>

          <!-- Table -->
          <div class="flex-1 min-h-0 flex flex-col rounded-2xl border bg-white dark:bg-gray-800 overflow-hidden border-gray-300 dark:border-gray-700">
            <div class="flex-1 min-h-0 overflow-auto no-scrollbar">
              <table class="min-w-full text-sm">
                <thead class="bg-purple-50 dark:bg-gray-700 text-xs uppercase font-semibold text-purple-800 dark:text-purple-300 sticky top-0 z-10">
                  <tr>
                    <!-- ID (display only, NOT sortable) -->
                    <th class="px-4 py-3 text-left">ID</th>

                    <!-- Name (sortable) -->
                    <th
                      class="px-6 py-3 text-left select-none cursor-pointer group"
                      :aria-sort="ariaSort('name')"
                      @click="setSort('name')"
                    >
                      <span class="inline-flex items-center gap-1">
                        {{ $t("categories.name") }}
                        <span v-if="sortKey==='name'" class="ml-1 opacity-70 text-purple-600 dark:text-purple-300">
                          <ChevronUp v-if="sortDir==='asc'" class="w-3 h-3" />
                          <ChevronDown v-else class="w-3 h-3" />
                        </span>
                        <ChevronsUpDown v-else class="ml-1 w-3.5 h-3.5 inline text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                      </span>
                    </th>

                    <!-- Items (sortable) -->
                    <th
                      class="px-4 py-3 text-left select-none cursor-pointer group"
                      :aria-sort="ariaSort('items')"
                      @click="setSort('items')"
                    >
                      <span class="inline-flex items-center gap-1">
                        Items
                        <span v-if="sortKey==='items'" class="ml-1 opacity-70 text-purple-600 dark:text-purple-300">
                          <ChevronUp v-if="sortDir==='asc'" class="w-3 h-3" />
                          <ChevronDown v-else class="w-3 h-3" />
                        </span>
                        <ChevronsUpDown v-else class="ml-1 w-3.5 h-3.5 inline text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                      </span>
                    </th>

                    <!-- Status (sortable) -->
                    <th
                      class="px-4 py-3 text-left select-none cursor-pointer group"
                      :aria-sort="ariaSort('status')"
                      @click="setSort('status')"
                    >
                      <span class="inline-flex items-center gap-1">
                        Status
                        <span v-if="sortKey==='status'" class="ml-1 opacity-70 text-purple-600 dark:text-purple-300">
                          <ChevronUp v-if="sortDir==='asc'" class="w-3 h-3" />
                          <ChevronDown v-else class="w-3 h-3" />
                        </span>
                        <ChevronsUpDown v-else class="ml-1 w-3.5 h-3.5 inline text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                      </span>
                    </th>

                    <!-- Actions -->
                    <th class="px-6 py-3 text-left">
                      {{ $t("categories.actions") }}
                    </th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr
                    v-for="cat in sortedCategories"
                    :key="cat.id"
                    class="hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                  >
                    <td class="px-4 py-4 align-middle text-left text-gray-700 dark:text-white">
                      {{ cat.id }}
                    </td>
                    <td class="px-6 py-4 align-middle text-left font-medium text-gray-700 dark:text-white">
                      {{ cat.name }}
                    </td>
                    <td class="px-4 py-4 align-middle text-left text-gray-700 dark:text-white">
                      {{ Number(cat.menu_items_count ?? 0) }}
                    </td>
                    <td class="px-4 py-4">
                      <span
                        v-if="cat.deleted_at"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                      >Archived</span>
                      <span
                        v-else
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100"
                      >Active</span>
                    </td>
                    <td class="px-6 py-4 align-middle text-left">
                      <div class="flex gap-3">
                        <button
                          @click="edit(cat)"
                          class="px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-600 dark:hover:bg-blue-700 hover:text-white border border-blue-200 dark:border-blue-800 rounded-full transition"
                        >
                          {{ $t("actions.edit") }}
                        </button>

                        <button
                          v-if="!cat.deleted_at"
                          @click="askDelete(cat)"
                          class="px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-300 hover:bg-red-600 dark:hover:bg-red-700 hover:text-white border border-red-200 dark:border-red-800 rounded-full transition"
                        >
                          {{ $t("actions.delete") || "Delete" }}
                        </button>

                        <button
                          v-else
                          @click="restoreCategory(cat)"
                          class="px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 dark:hover:bg-emerald-700 hover:text-white border border-emerald-200 dark:border-emerald-800 rounded-full transition"
                        >
                          {{ $t("actions.restore") || "Restore" }}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="!loading && sortedCategories.length === 0">
                    <td :colspan="COLSPAN" class="px-6 py-6 text-center text-gray-400 dark:text-gray-300">
                      {{ $t("categories.empty") }}
                    </td>
                  </tr>

                  <tr v-if="loading">
                    <td :colspan="COLSPAN" class="px-6 py-6 text-center text-gray-400 dark:text-gray-300">
                      {{ $t("loading") || "Loading..." }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modals -->
        <CategoryModal :show="showModal" :category="activeCategory" @close="closeModal" @saved="saveCategory" />

        <!-- Delete Options Modal (Archive / Reassign / Uncategorized) -->
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40" @click="closeDeleteModal"></div>
          <div class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {{ $t("categories.confirmDeleteTitle") || "Delete Category" }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {{ $t("categories.confirmDelete", { name: activeCategory?.name }) }}
            </p>

            <div class="space-y-3">
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input type="radio" value="archive" v-model="deleteMode" class="text-purple-600" />
                <span>{{ $t("categories.mode.archive") || "Archive (soft-delete)" }}</span>
              </label>

              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input type="radio" value="uncategorize" v-model="deleteMode" class="text-purple-600" />
                <span>{{ $t("categories.mode.uncategorize") || "Delete & set items to Uncategorized" }}</span>
              </label>

              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input type="radio" value="reassign" v-model="deleteMode" class="text-purple-600" />
                  <span>{{ $t("categories.mode.reassign") || "Delete & move items to another category" }}</span>
                </label>

                <select
                  v-if="deleteMode === 'reassign'"
                  v-model="reassignTargetId"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-800 dark:text-gray-100"
                >
                  <option :value="null" disabled>
                    {{ $t("categories.selectTarget") || "Select target category" }}
                  </option>
                  <option v-for="c in categoriesForReassign" :key="'target-' + c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                @click="closeDeleteModal"
                class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 text-sm"
              >
                {{ $t("actions.cancel") || "Cancel" }}
              </button>
              <button @click="confirmDelete" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm">
                {{ $t("actions.confirm") || "Confirm" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AppLayout from "@/components/Common/AppLayout.vue";
import CategoryModal from "@/components/Menu/CategoryModal.vue";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-vue-next";

const COLSPAN = 5;

const categories = ref([]);
const loading = ref(false);
const showModal = ref(false);

// Delete modal state
const showDeleteModal = ref(false);
const deleteMode = ref("archive"); // 'archive' | 'reassign' | 'uncategorize'
const reassignTargetId = ref(null);

const activeCategory = ref(null);
const toast = createToastInterface();

const search = ref("");
const showArchived = ref(false);

/* ----- Sorting (name | items | status) ----- */
const sortKey = ref("name");
const sortDir = ref("asc");
function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}
function ariaSort(key) {
  if (sortKey.value !== key) return "none";
  return sortDir.value === "asc" ? "ascending" : "descending";
}
function statusRank(cat) {
  return cat.deleted_at ? 0 : 2;
}

/* ----- Search filter ----- */
const filtered = computed(() => {
  let arr = categories.value || [];
  if (search.value) {
    const s = search.value.toLowerCase();
    arr = arr.filter((c) => (c.name || "").toLowerCase().includes(s));
  }
  return arr;
});

/* ----- Sorted list ----- */
const sortedCategories = computed(() => {
  const dir = sortDir.value === "asc" ? 1 : -1;
  const arr = filtered.value.slice();
  arr.sort((a, b) => {
    let va, vb;
    switch (sortKey.value) {
      case "items":
        va = Number(a.menu_items_count ?? 0);
        vb = Number(b.menu_items_count ?? 0);
        break;
      case "status":
        va = statusRank(a);
        vb = statusRank(b);
        break;
      case "name":
      default:
        va = (a.name || "").toLowerCase();
        vb = (b.name || "").toLowerCase();
    }

    const cmp = String(va).localeCompare(String(vb));
    if (cmp !== 0) return cmp * dir;

    // Stable tie-breaker (by id ascending) without exposing id sort in UI
    return (Number(a.id || 0) - Number(b.id || 0)) * 1;
  });
  return arr;
});

/* ----- Reassign target list (exclude current + archived) ----- */
const categoriesForReassign = computed(() =>
  (categories.value || []).filter((c) => c.id !== activeCategory.value?.id && !c.deleted_at)
);

/* ----- API ----- */
async function fetchCategories() {
  try {
    loading.value = true;
    const params = showArchived.value ? { with_trashed: 1 } : { visible_only: 1 };
    const res = await api.get("/categories", { params });
    categories.value = res.data || [];
  } catch (e) {
    toast.error("Failed to load categories");
  } finally {
    loading.value = false;
  }
}

/* ----- Modal helpers ----- */
function openAdd() {
  activeCategory.value = {};
  showModal.value = true;
}
function edit(cat) {
  activeCategory.value = { ...cat };
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}
async function saveCategory(cat) {
  try {
    if (cat.id) {
      await api.put(`/categories/${cat.id}`, cat);
      toast.success("Category updated");
    } else {
      await api.post("/categories", cat);
      toast.success("Category added");
    }
    showModal.value = false;
    await fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to save category");
  }
}

/* ----- Delete flow ----- */
function askDelete(cat) {
  activeCategory.value = cat;
  deleteMode.value = "archive";
  reassignTargetId.value = null;
  showDeleteModal.value = true;
}
function closeDeleteModal() {
  showDeleteModal.value = false;
}
async function confirmDelete() {
  if (!activeCategory.value) return;
  try {
    const id = activeCategory.value.id;
    const params = { mode: deleteMode.value };

    if (deleteMode.value === "reassign") {
      if (!reassignTargetId.value) {
        toast.error("Please select a target category");
        return;
      }
      params.target_id = reassignTargetId.value;
    }

    await api.delete(`/categories/${id}`, { params });
    const msg =
      deleteMode.value === "archive"
        ? "Category archived"
        : deleteMode.value === "uncategorize"
        ? "Category deleted. Items set to Uncategorized"
        : "Category merged and deleted";
    toast.success(msg);
    showDeleteModal.value = false;
    await fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to delete category");
  }
}

/* ----- Restore ----- */
async function restoreCategory(cat) {
  try {
    await api.post(`/categories/${cat.id}/restore`, { reactivate: 1 });
    toast.success("Category restored");
    await fetchCategories();
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to restore category");
  }
}

onMounted(fetchCategories);
</script>

<style scoped>
/* Invisible scrollbar like Orders page */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
