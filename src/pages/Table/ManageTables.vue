<script setup>
import { ref, computed, onMounted, watch, h } from "vue";
import api from "@/plugins/axios";
import MainLayout from "@/components/Common/AppLayout.vue";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import QRCodeVue from "qrcode.vue";
import { saveAs } from "file-saver";

const toast = useToast();
const { t } = useI18n();

/* ── State ─────────────────────────────────────────────────────────────── */
const tables = ref([]);
const users = ref([]);
const isLoading = ref(false);

const showModal = ref(false);
const editingTable = ref(null);

const form = ref({ name: "", slug: "", user_id: "" });

/* ── Prefs (persist search/sort) ───────────────────────────────────────── */
const LS_KEY = "tables_prefs_v1";
const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
const search = ref(saved.search || "");
const sort = ref(saved.sort || { by: "name", dir: "asc" }); // name | slug | user

watch(
  [search, sort],
  () => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ search: search.value, sort: sort.value })
    );
  },
  { deep: true }
);

/* ── QR Modal ──────────────────────────────────────────────────────────── */
const showQRModal = ref(false);
const qrTable = ref(null);

function openQRModal(table) {
  qrTable.value = table;
  showQRModal.value = true;
}
function closeQRModal() {
  showQRModal.value = false;
  qrTable.value = null;
}

function downloadQR() {
  const svg = document.querySelector(".qr-modal-svg");
  if (!svg) {
    toast.error(t("table.qr_not_ready") || "QR not ready!");
    return;
  }
  const xml = new XMLSerializer().serializeToString(svg);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const imgSrc = `data:image/svg+xml;base64,${svg64}`;

  const img = new Image();
  img.src = imgSrc;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 90, 40, 220, 220);
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#444";
    ctx.textAlign = "center";
    ctx.fillText(qrTable.value?.name ?? "", canvas.width / 2, 295);
    canvas.toBlob((blob) =>
      saveAs(blob, `table_${qrTable.value?.slug}_qr.png`)
    );
  };
}

/* ── Table-user assignment filter ──────────────────────────────────────── */
const assignedUserIds = computed(() =>
  tables.value
    .filter(
      (t) =>
        t.user_id && (!editingTable.value || t.id !== editingTable.value.id)
    )
    .map((t) => t.user_id)
);

const availableTableUsers = computed(() => {
  return users.value.filter((u) => {
    const isTableRole =
      u.role && (u.role.name === "Table" || u.role === "Table");
    if (!isTableRole) return false;
    if (editingTable.value && u.id === editingTable.value.user_id) return true;
    return !assignedUserIds.value.includes(u.id);
  });
});

/* ── Search + Sorting (tri-state headers) ──────────────────────────────── */
const filteredAndSorted = computed(() => {
  const s = search.value.trim().toLowerCase();
  let arr = tables.value.filter((tb) => {
    const nm = (tb.name ?? "").toLowerCase();
    const sl = (tb.slug ?? "").toLowerCase();
    const un = (tb.user?.name ?? "").toLowerCase();
    return nm.includes(s) || sl.includes(s) || un.includes(s);
  });

  const dir = sort.value.dir === "asc" ? 1 : -1;
  arr.sort((a, b) => {
    switch (sort.value.by) {
      case "name": {
        return (a.name || "").localeCompare(b.name || "") * dir;
      }
      case "slug": {
        return (a.slug || "").localeCompare(b.slug || "") * dir;
      }
      case "user": {
        return (a.user?.name || "").localeCompare(b.user?.name || "") * dir;
      }
      default:
        return 0;
    }
  });

  return arr;
});

function setSort(by) {
  if (sort.value.by !== by) {
    sort.value = { by, dir: "asc" };
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

/* Tri-state icon: neutral chevrons when unsorted, solid ▲/▼ when active */
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

/* ── CRUD ──────────────────────────────────────────────────────────────── */
function openAddModal() {
  editingTable.value = null;
  form.value = { name: "", slug: "", user_id: "" };
  showModal.value = true;
}
function openEditModal(table) {
  editingTable.value = table;
  form.value = { name: table.name, slug: table.slug, user_id: table.user_id };
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  editingTable.value = null;
}

async function submitTable() {
  try {
    if (editingTable.value) {
      await api.put(`/tables/${editingTable.value.id}`, form.value);
      toast.success(t("table.updated") || "Table updated!");
    } else {
      await api.post("/tables", form.value);
      toast.success(t("table.added") || "Table added!");
    }
    showModal.value = false;
    fetchTables();
  } catch (err) {
    toast.error(
      err?.response?.data?.message || t("table.save_failed") || "Save failed"
    );
  }
}

async function deleteTable(id) {
  if (!confirm(t("table.confirm_delete") || "Delete this table?")) return;
  try {
    await api.delete(`/tables/${id}`);
    toast.success(t("table.deleted") || "Table deleted");
    fetchTables();
  } catch (e) {
    toast.error(t("table.save_failed") || "Operation failed");
  }
}

/* ── Data fetch ────────────────────────────────────────────────────────── */
onMounted(() => {
  fetchTables();
  fetchUsers();
});

async function fetchTables() {
  isLoading.value = true;
  try {
    const res = await api.get("/tables");
    tables.value = Array.isArray(res.data?.data) ? res.data.data : res.data;
  } catch (e) {
    tables.value = [];
    toast.error(t("table.fetch_failed") || "Failed to load tables");
  } finally {
    isLoading.value = false;
  }
}
async function fetchUsers() {
  try {
    const res = await api.get("/users");
    users.value = Array.isArray(res.data?.data) ? res.data.data : res.data;
  } catch {
    // ignore
  }
}
</script>

<template>
  <MainLayout>
    <div class="p-6 h-full flex flex-col min-h-0">
      <div class="flex-1 flex flex-col justify-between gap-6 min-h-0">
        <!-- ── Top cluster: header + search + clear ───────────────────── -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ t("table.manage_tables") }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-300">
                {{ t("table.subtitle") }}
              </p>
            </div>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
            >
              {{ t("table.add_table") }}
            </button>
          </div>

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
                :placeholder="t('table.search')"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
                type="search"
                autocomplete="off"
                aria-label="Search tables"
              />
            </div>

            <button
              class="border rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              @click="search = ''"
            >
              {{ t("common.clear") || "Clear" }}
            </button>
          </div>
        </div>

        <!-- ── Bottom cluster: summary + table ─────────────────────────── -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <div class="text-sm font-semibold text-gray-800 dark:text-white">
            {{ t("table.total") }}
            <span class="font-bold">{{
              isLoading ? "—" : filteredAndSorted.length
            }}</span>
            <span
              v-if="!isLoading && filteredAndSorted.length === 0"
              class="ml-2 text-gray-500 dark:text-gray-400"
            >
              · {{ t("table.no_tables") }}
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
                      :class="isActive('name')"
                      :aria-sort="ariaSort('name')"
                      @click="setSort('name')"
                    >
                      {{ t("table.name") }}
                      <SortIcon :active="sort.by === 'name'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('slug')"
                      :aria-sort="ariaSort('slug')"
                      @click="setSort('slug')"
                    >
                      {{ t("table.slug") }}
                      <SortIcon :active="sort.by === 'slug'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('user')"
                      :aria-sort="ariaSort('user')"
                      @click="setSort('user')"
                    >
                      {{ t("table.table_user") }}
                      <SortIcon :active="sort.by === 'user'" :dir="sort.dir" />
                    </th>

                    <th class="px-6 py-3">{{ t("table.qr_code") }}</th>
                    <th class="px-6 py-3">{{ t("table.actions") }}</th>
                  </tr>
                </thead>

                <tbody>
                  <!-- Loading skeleton -->
                  <template v-if="isLoading">
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
                          class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                        />
                      </td>
                    </tr>
                  </template>

                  <!-- Data rows -->
                  <template v-else>
                    <tr v-if="filteredAndSorted.length === 0">
                      <td
                        colspan="6"
                        class="text-center py-10 text-gray-500 dark:text-gray-400"
                      >
                        <div class="flex flex-col items-center gap-3">
                          <div class="text-3xl">🪑</div>
                          <div class="font-semibold">
                            {{ t("table.empty_title") || t("table.no_tables") }}
                          </div>
                          <div class="text-sm">
                            {{ t("table.empty_help") || "" }}
                          </div>
                          <button
                            @click="openAddModal"
                            class="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm"
                          >
                            {{ t("table.add_table") }}
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      v-for="(table, index) in filteredAndSorted"
                      :key="table.id"
                      class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td
                        class="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 text-center"
                      >
                        {{ index + 1 }}
                      </td>

                      <td
                        class="px-6 py-3 font-medium text-gray-700 dark:text-gray-100"
                      >
                        {{ table.name }}
                      </td>

                      <td class="px-6 py-3 text-gray-600 dark:text-gray-300">
                        {{ table.slug }}
                      </td>

                      <td class="px-6 py-3 text-gray-700 dark:text-gray-100">
                        <span v-if="table.user">{{ table.user.name }}</span>
                        <span
                          v-else
                          class="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200"
                        >
                          {{ t("table.no_user") }}
                        </span>
                      </td>

                      <td class="px-6 py-3">
                        <div class="flex items-center gap-3">
                          <QRCodeVue
                            :value="table.qr_link"
                            :size="40"
                            level="M"
                            render-as="svg"
                            class="shrink-0"
                          />
                          <button
                            @click="openQRModal(table)"
                            class="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            {{ t("table.view_qr") }}
                          </button>
                        </div>
                      </td>

                      <td class="px-6 py-3">
                        <div class="flex gap-2">
                          <button
                            @click="openEditModal(table)"
                            class="border border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-800 transition"
                          >
                            {{ t("table.edit") }}
                          </button>
                          <button
                            @click="deleteTable(table.id)"
                            class="border border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 rounded-full px-3 py-1 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-800 transition"
                          >
                            {{ t("table.delete") }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- /Bottom cluster -->
      </div>

      <!-- Add/Edit Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-lg shadow-lg"
        >
          <h2 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            {{ editingTable ? t("table.edit_title") : t("table.add_title") }}
          </h2>
          <form @submit.prevent="submitTable" class="space-y-4">
            <div>
              <label
                class="font-medium block mb-1 text-gray-700 dark:text-gray-200"
                >{{ t("table.name") }}</label
              >
              <input v-model="form.name" class="input w-full" required />
            </div>
            <div>
              <label
                class="font-medium block mb-1 text-gray-700 dark:text-gray-200"
                >{{ t("table.slug") }}</label
              >
              <input v-model="form.slug" class="input w-full" required />
            </div>
            <div>
              <label
                class="font-medium block mb-1 text-gray-700 dark:text-gray-200"
                >{{ t("table.assign_table_user") }}</label
              >
              <select v-model="form.user_id" class="input w-full" required>
                <option disabled value="">{{ t("table.select_user") }}</option>
                <option
                  v-for="user in availableTableUsers"
                  :key="user.id"
                  :value="user.id"
                >
                  {{ user.name }}
                </option>
              </select>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
              >
                {{ t("actions.cancel") }}
              </button>
              <button
                type="submit"
                class="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 dark:bg-purple-700 text-white transition"
              >
                {{ editingTable ? t("actions.update") : t("actions.create") }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- QR Modal -->
      <div
        v-if="showQRModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div
          class="rounded-2xl p-8 w-full max-w-xs shadow-lg flex flex-col items-center bg-white dark:bg-gray-800"
        >
          <h2 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            {{ t("table.qr_for") }} {{ qrTable?.name }}
          </h2>
          <QRCodeVue
            :value="qrTable?.qr_link"
            :size="220"
            level="H"
            render-as="svg"
            class="qr-modal-svg"
          />
          <div
            class="text-center text-gray-700 dark:text-gray-300 mt-4 break-all"
          >
            {{ qrTable?.qr_link }}
          </div>
          <div class="flex gap-2 mt-4 justify-center">
            <button
              @click="downloadQR"
              class="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 dark:bg-purple-700 text-white transition"
            >
              {{ t("actions.download") || "Download QR" }}
            </button>
            <button
              @click="closeQRModal"
              class="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
            >
              {{ t("actions.close") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.input {
  @apply border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500;
}
/* Minimal, modern scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
