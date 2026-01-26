<template>
  <AppLayout>
    <div :lang="locale" class="p-6 h-full flex flex-col min-h-0 khmer-support">
      <div class="flex-1 min-h-0 flex flex-col">
        <!-- ── Top: title + actions ───────────────────────────────────── -->
        <div class="space-y-4 shrink-0 pb-3">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {{ $t("user.manage_users") || "Manage Users" }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-300">
                {{
                  $t("user.subtitle") || "Create, edit and manage users & roles"
                }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <!-- Tabs -->
              <div class="bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex">
                <button :class="[
                  'px-4 py-1.5 text-sm rounded-full transition',
                  activeTab === 'active'
                    ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow'
                    : 'text-gray-600 dark:text-gray-300',
                ]" @click="switchTab('active')">
                  {{ $t("user.active") || "Active" }}
                  <span
                    class="ml-1 inline-flex items-center justify-center min-w-[1.5rem] px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">{{
                      totalActive }}</span>
                </button>

                <button :class="[
                  'px-4 py-1.5 text-sm rounded-full transition',
                  activeTab === 'trash'
                    ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow'
                    : 'text-gray-600 dark:text-gray-300',
                ]" @click="switchTab('trash')">
                  {{ $t("user.trash") || "Trash" }}
                  <span
                    class="ml-1 inline-flex items-center justify-center min-w-[1.5rem] px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">{{
                      totalTrashed }}</span>
                </button>
              </div>

              <button @click="openAddModal"
                class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm">
                {{ $t("action.add_user") || "Add User" }}
              </button>
            </div>
          </div>

          <!-- Filters row -->
          <div class="flex flex-wrap justify-between items-center gap-3">
            <div class="flex flex-wrap items-center gap-2">
            <div class="relative w-72">
              <span class="absolute left-3 top-2.5 text-gray-400">
                <Search class="w-4 h-4 text-purple-400" />
              </span>
                <input v-model="search" :placeholder="$t('user.search') || 'Search users...'"
                  class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition" />
              </div>

              <!-- Per-page selector -->
              <select v-model.number="perPage" class="input" @change="onPerPageChange">
                <option :value="10">10 / page</option>
                <option :value="20">20 / page</option>
                <option :value="50">50 / page</option>
                <option :value="100">100 / page</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ── Content: summary + table + pagination ───────────────────── -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <!-- Summary -->
          <div class="text-sm text-gray-600 dark:text-gray-300">
            {{ $t("user.showing") || "Showing" }}
            <strong class="text-purple-700 dark:text-purple-400">
              {{ pageStart }}–{{ pageEnd }} {{ $t("order.of") || "of" }}
              {{ filteredCount }}
            </strong>
            {{ $t("user.users") || "users" }}
          </div>

          <!-- Table -->
          <div class="flex-1 min-h-0 overflow-auto rounded-xl shadow bg-white dark:bg-gray-800 no-scrollbar">
            <table class="min-w-full text-sm text-left">
              <thead
                class="bg-gray-100 dark:bg-gray-700 sticky top-0 text-xs text-gray-700 dark:text-gray-300 font-semibold uppercase border-b dark:border-gray-600 z-10">
                <tr>
                  <th class="px-4 py-3 w-12">No</th>

                  <th class="px-6 py-3 cursor-pointer select-none" :class="isActive('name')"
                    :aria-sort="ariaSort('name')" @click="setSort('name')">
                    {{ $t("form.name") || "Name" }}
                    <SortIcon :active="sort.by === 'name'" :dir="sort.dir" />
                  </th>

                  <th class="px-6 py-3 cursor-pointer select-none" :class="isActive('email')"
                    :aria-sort="ariaSort('email')" @click="setSort('email')">
                    {{ $t("form.email") || "Email" }}
                    <SortIcon :active="sort.by === 'email'" :dir="sort.dir" />
                  </th>

                  <th class="px-6 py-3 cursor-pointer select-none" :class="isActive('role')"
                    :aria-sort="ariaSort('role')" @click="setSort('role')">
                    {{ $t("form.role") || "Role" }}
                    <SortIcon :active="sort.by === 'role'" :dir="sort.dir" />
                  </th>

                  <th v-if="activeTab === 'trash'" class="px-6 py-3 cursor-pointer select-none"
                    :class="isActive('deleted_at')" :aria-sort="ariaSort('deleted_at')" @click="setSort('deleted_at')">
                    {{ $t("user.deleted_at") || "Deleted at" }}
                    <SortIcon :active="sort.by === 'deleted_at'" :dir="sort.dir" />
                  </th>

                  <th class="px-6 py-3">
                    {{ $t("action.actions") || "Actions" }}
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr v-for="(user, idx) in paginatedRows" :key="user.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-300 font-semibold">
                    {{ absoluteIndex(idx) }}
                  </td>

                  <td class="px-6 py-3 font-medium text-gray-800 dark:text-gray-100">
                    {{ user.name }}
                  </td>

                  <td class="px-6 py-3 text-gray-600 dark:text-gray-300">
                    {{ user.email }}
                  </td>

                  <td class="px-6 py-3">
                    <span :class="[
                      'px-3 py-1 text-xs font-semibold rounded-full',
                      user.role?.name === 'Super Admin'
                        ? 'bg-red-100 text-red-600 dark:bg-red-300/20 dark:text-red-400'
                        : user.role?.name === 'Admin'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-300/20 dark:text-blue-400'
                          : user.role?.name === 'Cashier'
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-300/20 dark:text-yellow-400'
                            : user.role?.name === 'Customer'
                              ? 'bg-green-100 text-green-600 dark:bg-green-300/20 dark:text-green-400'
                              : user.role?.name === 'Table'
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-300/20 dark:text-gray-300'
                                : 'bg-gray-50 text-gray-400 dark:bg-gray-700 dark:text-gray-400',
                    ]">
                      {{
                        $t(
                          `roles.${(
                            user.role?.name || "unknown"
                          ).toLowerCase()}`
                        ) ||
                        user.role?.name ||
                        "—"
                      }}
                    </span>
                  </td>

                  <td v-if="activeTab === 'trash'" class="px-6 py-3 text-gray-500 dark:text-gray-400">
                    {{
                      user.deleted_at
                        ? new Date(user.deleted_at).toLocaleString()
                        : "-"
                    }}
                  </td>

                  <td class="px-6 py-3 space-x-2">
                    <template v-if="activeTab === 'active'">
                      <button @click="openEditModal(user)"
                        class="bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium transition">
                        {{ $t("action.edit") || "Edit" }}
                      </button>
                      <button @click="confirmDelete(user, 'soft')"
                        class="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-600/10 dark:hover:bg-red-600/20 dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium transition">
                        {{ $t("action.delete") || "Delete" }}
                      </button>
                    </template>
                    <template v-else>
                      <button @click="restoreUser(user)"
                        class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-600/10 dark:hover:bg-emerald-600/20 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-medium transition">
                        {{ $t("action.restore") || "Restore" }}
                      </button>
                      <button @click="confirmDelete(user, 'force')"
                        class="bg-rose-100 hover:bg-rose-200 text-rose-600 dark:bg-rose-600/10 dark:hover:bg-rose-600/20 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-medium transition">
                        {{ $t("action.delete_forever") || "Delete Forever" }}
                      </button>
                    </template>
                  </td>
                </tr>

                <tr v-if="!loading && !paginatedRows.length">
                  <td :colspan="activeTab === 'trash' ? 6 : 5"
                    class="text-center py-6 text-gray-400 dark:text-gray-500">
                    {{ $t("user.no_data") || "No users found." }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="loading" class="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
              {{ $t("common.loading") || "Loading..." }}
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Page {{ currentPage }} / {{ totalPages }} • {{ pageStart }}–{{
                pageEnd
              }}
              {{ $t("order.of") || "of" }} {{ filteredCount }}
            </div>

            <div class="flex items-center gap-1">
              <button class="pager-btn" :disabled="isFirstPage" @click="goToPage(1)">
                « First
              </button>
              <button class="pager-btn" :disabled="isFirstPage" @click="goToPage(currentPage - 1)">
                ‹ Prev
              </button>

              <button v-for="p in visiblePages" :key="p" class="pager-num" :class="p === currentPage ? 'active' : ''"
                @click="goToPage(p)">
                {{ p }}
              </button>

              <button class="pager-btn" :disabled="isLastPage" @click="goToPage(currentPage + 1)">
                Next ›
              </button>
              <button class="pager-btn" :disabled="isLastPage" @click="goToPage(totalPages)">
                Last »
              </button>
            </div>
          </div>
        </div>

        <!-- Create / Edit Modal -->
        <teleport to="body">
          <div v-if="showAddModal || showEditModal" :lang="locale"
            class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center khmer-support">
            <div
              class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl w-full max-w-md space-y-5 animate-fadeIn text-gray-800 dark:text-gray-100">
              <h2 class="text-xl font-bold">
                {{
                  showAddModal
                    ? $t("user.add_title") || "Add User"
                    : $t("user.edit_title") || "Edit User"
                }}
              </h2>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-1 dark:text-gray-300">{{ $t("form.name") || "Name"
                  }}</label>
                  <input v-model="form.name" type="text" class="form-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 dark:text-gray-300">{{ $t("form.email") || "Email"
                  }}</label>
                  <input v-model="form.email" type="email" class="form-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 dark:text-gray-300">
                    {{
                      showAddModal
                        ? $t("form.password") || "Password"
                        : $t("form.new_password_optional") ||
                        "New Password (optional)"
                    }}
                  </label>
                  <input v-model="form.password" type="password" class="form-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 dark:text-gray-300">
                    {{ $t("form.confirm_password") || "Confirm Password" }}
                  </label>
                  <input v-model="form.password_confirmation" type="password" class="form-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 dark:text-gray-300">{{ $t("form.role") || "Role"
                  }}</label>
                  <select v-model="form.role" class="form-input">
                    <option v-for="r in roles" :key="r" :value="r">
                      {{ $t(`roles.${r.toLowerCase()}`) || r }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end gap-2">
                <button @click="closeModals"
                  class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 text-sm rounded-full text-gray-700 dark:text-gray-200">
                  {{ $t("action.cancel") || "Cancel" }}
                </button>
                <button @click="showAddModal ? createUser() : saveUser()"
                  class="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm text-white rounded-full shadow">
                  {{
                    showAddModal
                      ? $t("action.create") || "Create"
                      : $t("action.update") || "Update"
                  }}
                </button>
              </div>
            </div>
          </div>
        </teleport>

        <!-- Delete Confirmation Modal -->
        <teleport to="body">
          <div v-if="showDeleteConfirm" :lang="locale"
            class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center khmer-support">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-[90%] max-w-sm animate-fadeIn space-y-4">
              <h3 class="text-lg font-bold text-center">
                {{
                  deleteMode === "soft"
                    ? $t("user.confirm_delete_title") || "Delete user?"
                    : $t("user.confirm_force_title") || "Delete forever?"
                }}
              </h3>
              <p class="text-sm text-center text-gray-700 dark:text-gray-300">
                {{
                  deleteMode === "soft"
                    ? $t("user.confirm_delete_text") ||
                    "This will move the user to Trash:"
                    : $t("user.confirm_force_text") ||
                    "This will permanently delete the user:"
                }}
                <span class="font-semibold text-purple-600 dark:text-purple-400">{{ userToDelete?.name }}</span>
              </p>
              <div class="flex justify-center gap-3 pt-2">
                <button @click="cancelDelete"
                  class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-full text-sm text-gray-700 dark:text-gray-200">
                  {{ $t("action.cancel") || "Cancel" }}
                </button>
                <button @click="performDelete" :class="[
                  'px-4 py-2 rounded-full text-sm text-white shadow',
                  deleteMode === 'soft'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-rose-600 hover:bg-rose-700',
                ]">
                  {{
                    deleteMode === "soft"
                      ? $t("action.confirm_delete") || "Delete"
                      : $t("action.delete_forever") || "Delete Forever"
                  }}
                </button>
              </div>
            </div>
          </div>
        </teleport>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from "@/components/Common/AppLayout.vue";
import { ref, reactive, computed, watch, onMounted, h } from "vue";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { useI18n } from "vue-i18n";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-vue-next";

const { t, locale } = useI18n();
const toast = createToastInterface();

/* -------------------- State -------------------- */
const activeTab = ref("active"); // 'active' | 'trash'
const loading = ref(false);
const search = ref("");
const perPage = ref(10);
const currentPage = ref(1);

/* Arrays returned by your controller */
const allActive = ref([]); // GET /users
const allTrashed = ref([]); // GET /users/trashed

/* Totals (raw) */
const totalActive = computed(() => allActive.value.length);
const totalTrashed = computed(() => allTrashed.value.length);

/* Tri-state sorting */
const defaultSort = { by: "created_at", dir: "desc" }; // default neutral
const sort = ref({ ...defaultSort });

function setSort(by) {
  if (sort.value.by !== by) {
    sort.value.by = by;
    sort.value.dir = ["created_at", "role", "deleted_at"].includes(by)
      ? "desc"
      : "asc";
  } else {
    if (sort.value.dir === "asc") sort.value.dir = "desc";
    else if (sort.value.dir === "desc") sort.value = { ...defaultSort };
    else sort.value.dir = "asc";
  }
  currentPage.value = 1;
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

/* Collator for name/email */
const collator = computed(
  () => new Intl.Collator(locale.value || undefined, { sensitivity: "base" })
);

/* Filtering + sorting (client, because API returns arrays) */
const workingSet = computed(() =>
  activeTab.value === "active" ? allActive.value : allTrashed.value
);

const filteredSorted = computed(() => {
  let arr = workingSet.value.slice();

  // filter
  if (search.value) {
    const s = (search.value || "").toLowerCase();
    arr = arr.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        (u.role?.name || "").toLowerCase().includes(s)
    );
  }

  // sort
  const by = sort.value.by;
  const dir = sort.value.dir;
  const mul = dir === "asc" ? 1 : -1;

  function v(u) {
    if (by === "name") return (u.name || "").toLowerCase();
    if (by === "email") return (u.email || "").toLowerCase();
    if (by === "role") {
      // map role name to rank for stable ordering
      const rank = {
        "Super Admin": 1,
        Admin: 2,
        Cashier: 3,
        Customer: 4,
        Table: 5,
      };
      return rank[u.role?.name] || 999;
    }
    if (by === "deleted_at")
      return u.deleted_at ? new Date(u.deleted_at).getTime() : 0;
    if (by === "created_at")
      return u.created_at ? new Date(u.created_at).getTime() : 0;
    return 0;
  }

  return arr.sort((a, b) => {
    const va = v(a);
    const vb = v(b);
    if (typeof va === "string" && typeof vb === "string")
      return collator.value.compare(va, vb) * mul;
    if (va < vb) return -1 * mul;
    if (va > vb) return 1 * mul;
    return 0;
  });
});

/* Pagination (client) */
const filteredCount = computed(() => filteredSorted.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCount.value / perPage.value))
);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredSorted.value.slice(start, start + perPage.value);
});

const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= totalPages.value);

function goToPage(p) {
  currentPage.value = Math.min(Math.max(1, p), totalPages.value);
}
function onPerPageChange() {
  currentPage.value = 1;
}

/* Page ranges for summary */
const pageStart = computed(() =>
  filteredCount.value === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1
);
const pageEnd = computed(() =>
  Math.min(currentPage.value * perPage.value, filteredCount.value)
);

/* Visible page numbers */
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, Math.min(start, end - windowSize + 1));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
function absoluteIndex(localIdx) {
  return (currentPage.value - 1) * perPage.value + (localIdx + 1);
}

/* CRUD + actions */
const roles = ["Super Admin", "Admin", "Cashier", "Customer", "Table"];
const roleMap = {
  "Super Admin": 1,
  Admin: 2,
  Cashier: 3,
  Customer: 4,
  Table: 5,
};

const showAddModal = ref(false);
const showEditModal = ref(false);
const form = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "Customer",
});
const selectedUser = ref(null);

function openAddModal() {
  form.value = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "Customer",
  };
  showAddModal.value = true;
}
function openEditModal(user) {
  selectedUser.value = user;
  form.value = {
    name: user.name,
    email: user.email,
    password: "",
    password_confirmation: "",
    role: user.role?.name || "Customer",
  };
  showEditModal.value = true;
}
function closeModals() {
  showAddModal.value = false;
  showEditModal.value = false;
  selectedUser.value = null;
}

async function createUser() {
  try {
    if (
      !form.value.password ||
      form.value.password !== form.value.password_confirmation
    ) {
      toast.error(t("user.password_mismatch") || "Passwords do not match.");
      return;
    }
    await api.post("/users", {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      role_id: roleMap[form.value.role],
    });
    toast.success(t("user.created") || "User created.");
    closeModals();
    await fetchActive();
    if (activeTab.value === "active") currentPage.value = 1;
  } catch (e) {
    toast.error(
      e.response?.data?.message ||
      t("user.add_failed") ||
      "Failed to create user."
    );
  }
}

async function saveUser() {
  try {
    const id = selectedUser.value.id;
    await api.put(`/users/${id}`, {
      name: form.value.name,
      email: form.value.email,
      role_id: roleMap[form.value.role],
    });
    if (form.value.password) {
      if (form.value.password !== form.value.password_confirmation) {
        toast.error(t("user.password_mismatch") || "Passwords do not match.");
        return;
      }
      // Matches your controller method name: resetPassword()
      // If your route path is different, change the URL below.
      await api.put(`/users/${id}/password`, {
        new_password: form.value.password,
        new_password_confirmation: form.value.password_confirmation || form.value.password,
      });

    }
    toast.success(t("user.updated") || "User updated.");
    closeModals();
    await refreshCurrentTab();
  } catch (e) {
    toast.error(
      e.response?.data?.message ||
      t("user.update_failed") ||
      "Failed to update user."
    );
  }
}

const showDeleteConfirm = ref(false);
const userToDelete = ref(null);
const deleteMode = ref("soft"); // 'soft' | 'force'

function confirmDelete(user, mode = "soft") {
  userToDelete.value = user;
  deleteMode.value = mode;
  showDeleteConfirm.value = true;
}
function cancelDelete() {
  showDeleteConfirm.value = false;
  userToDelete.value = null;
  deleteMode.value = "soft";
}

async function performDelete() {
  if (!userToDelete.value) return;
  try {
    if (deleteMode.value === "soft") {
      await api.delete(`/users/${userToDelete.value.id}`);
      toast.success(t("user.deleted") || "User deleted.");
      await Promise.all([fetchActive(), fetchTrashed()]);
    } else {
      await api.delete(`/users/${userToDelete.value.id}/force`);
      toast.success(t("user.deleted_forever") || "User permanently deleted.");
      await fetchTrashed();
    }
  } catch (e) {
    toast.error(
      e.response?.data?.message ||
      (deleteMode.value === "soft"
        ? t("user.delete_failed") || "Failed to delete user."
        : t("user.force_delete_failed") || "Failed to permanently delete.")
    );
  } finally {
    cancelDelete();
  }
}

async function restoreUser(user) {
  try {
    await api.patch(`/users/${user.id}/restore`);
    toast.success(t("user.restored") || "User restored.");
    await Promise.all([fetchActive(), fetchTrashed()]);
    activeTab.value = "active";
    currentPage.value = 1;
  } catch (e) {
    toast.error(
      e.response?.data?.message ||
      t("user.restore_failed") ||
      "Failed to restore user."
    );
  }
}

/* Fetch (arrays) */
async function fetchActive() {
  loading.value = true;
  try {
    const { data } = await api.get("/users");
    allActive.value = Array.isArray(data) ? data : data?.data ?? [];
  } catch (e) {
    toast.error(t("user.fetch_failed") || "Failed to load users.");
  } finally {
    loading.value = false;
  }
}
async function fetchTrashed() {
  loading.value = true;
  try {
    const { data } = await api.get("/users/trashed");
    allTrashed.value = Array.isArray(data) ? data : data?.data ?? [];
  } catch (e) {
    toast.error(t("user.fetch_failed") || "Failed to load trash.");
  } finally {
    loading.value = false;
  }
}

/* Tab + search behavior */
async function switchTab(tab) {
  activeTab.value = tab;
  currentPage.value = 1;
  sort.value = { ...defaultSort };
  if (tab === "trash" && allTrashed.value.length === 0) await fetchTrashed();
}
async function refreshCurrentTab() {
  if (activeTab.value === "active") await fetchActive();
  else await fetchTrashed();
}

/* Debounce search */
let _timer;
watch(search, () => {
  clearTimeout(_timer);
  _timer = setTimeout(() => {
    currentPage.value = 1;
  }, 300);
});

/* Mount */
onMounted(async () => {
  await Promise.all([fetchActive(), fetchTrashed()]);
});

/* Sort icon component (functional) */
const SortIcon = (props) => {
  const { active, dir } = props;
  if (!active) {
    return h(
      "span",
      {
        class:
          "inline-block ml-1 align-middle text-gray-400 dark:text-gray-500",
        "aria-hidden": "true",
      },
      [h(ChevronsUpDown, { class: "w-3 h-3" })]
    );
  }
  return h(
    "span",
    {
      class:
        "inline-block ml-1 align-middle text-purple-600 dark:text-purple-300",
      "aria-hidden": "true",
    },
    [h(dir === "asc" ? ChevronUp : ChevronDown, { class: "w-3 h-3" })]
  );
};
</script>

<style scoped>
.input {
  @apply border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.pager-btn {
  @apply px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.pager-num {
  @apply px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700;
}

.pager-num.active {
  @apply bg-purple-600 text-white border-purple-600 hover:bg-purple-600;
}

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

.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
