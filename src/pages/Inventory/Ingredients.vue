<template>
  <AppLayout>
    <!-- PAGE SHELL -->
    <div :lang="locale" class="p-6 h-full flex flex-col min-h-0 khmer-support">
      <!-- CONTENT AREA distributes space between top and bottom clusters -->
      <div class="flex-1 min-h-0 flex flex-col">
        <!-- ── Top cluster: header + search ─────────────────────────── -->
        <div class="space-y-4 shrink-0 pb-3">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ $t("ingredient.title") }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-300">
                {{ $t("ingredient.subtitle") }}
              </p>
            </div>
            <button
              @click="openAddForm"
              class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-5 py-2 rounded-full shadow flex items-center gap-2 text-sm transition"
            >
              {{ $t("ingredient.addButton") }}
            </button>
          </div>

          <!-- Search -->
          <div class="flex justify-between items-center">
            <div class="relative w-72">
              <span class="absolute left-3 top-2.5 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M13.5 13.5L17 17M9 15a6 6 0 100-12 6 6 0 000 12z"
                    stroke="#a78bfa"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                v-model="search"
                :placeholder="$t('ingredient.search')"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
              />
            </div>
            <div class="flex gap-3 items-center"></div>
          </div>
        </div>

        <!-- ── Bottom cluster: summary + table ───────────────────────── -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <!-- Summary -->
          <div class="text-sm font-semibold text-gray-800 dark:text-white">
            {{ $t("ingredient.total") }}:
            <span class="font-bold">{{ filteredIngredients.length }}</span>
          </div>

          <!-- Table -->
          <div
            class="flex-1 min-h-0 flex flex-col rounded-xl shadow bg-white dark:bg-gray-800 overflow-hidden"
          >
            <div class="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <table
                class="min-w-full text-sm text-gray-700 dark:text-gray-200"
              >
                <thead
                  class="bg-purple-50 dark:bg-gray-700 text-purple-800 dark:text-purple-300 font-semibold text-left sticky top-0 z-10"
                >
                  <tr>
                    <th class="px-4 py-3 w-12">No</th>

                    <th
                      class="px-4 py-3 cursor-pointer select-none"
                      :class="isActive('name')"
                      :aria-sort="ariaSort('name')"
                      @click="setSort('name')"
                    >
                      {{ $t("ingredient.name") }}
                      <SortIcon :active="sort.by === 'name'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-4 py-3 cursor-pointer select-none"
                      :class="isActive('unit')"
                      :aria-sort="ariaSort('unit')"
                      @click="setSort('unit')"
                    >
                      {{ $t("ingredient.unit") }}
                      <SortIcon :active="sort.by === 'unit'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-4 py-3 cursor-pointer select-none"
                      :class="isActive('low')"
                      :aria-sort="ariaSort('low')"
                      @click="setSort('low')"
                    >
                      {{ $t("ingredient.lowAlertAt") || "Low Alert At" }}
                      <SortIcon :active="sort.by === 'low'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-4 py-3 cursor-pointer select-none"
                      :class="isActive('created')"
                      :aria-sort="ariaSort('created')"
                      @click="setSort('created')"
                    >
                      {{ $t("ingredient.createdAt") }}
                      <SortIcon
                        :active="sort.by === 'created'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th class="px-4 py-3 text-center w-40">
                      {{ $t("ingredient.actions") }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(ingredient, index) in filteredIngredients"
                    :key="ingredient.id"
                    class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td class="px-4 py-3">{{ index + 1 }}</td>
                    <td class="px-4 py-3">{{ localizedName(ingredient) }}</td>
                    <td class="px-4 py-3">{{ ingredient.unit }}</td>
                    <td class="px-4 py-3">
                      <span v-if="ingredient.low_alert_qty != null">
                        {{ ingredient.low_alert_qty }} {{ ingredient.unit }}
                      </span>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="px-4 py-3">
                      {{ formatDate(ingredient.created_at) }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex justify-center gap-2">
                        <button
                          class="border border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900 px-3 py-1 rounded-full text-sm font-medium transition"
                          @click="editIngredient(ingredient)"
                        >
                          {{ $t("common.edit") }}
                        </button>
                        <button
                          class="border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-800 px-3 py-1 rounded-full text-sm font-medium transition"
                          @click="confirmDelete(ingredient.id)"
                        >
                          {{ $t("common.delete") }}
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="filteredIngredients.length === 0">
                    <td
                      colspan="6"
                      class="text-center py-6 text-gray-400 dark:text-gray-500"
                    >
                      {{ $t("ingredient.noData") }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Add/Edit Modal -->
          <teleport to="body">
            <div
              v-if="openModal"
              :lang="locale"
              class="fixed inset-0 z-[999] flex items-center justify-center khmer-support"
            >
              <div
                class="absolute inset-0 bg-black bg-opacity-50 z-[998]"
              ></div>
              <div
                class="relative z-[999] bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-lg p-6 space-y-4 text-gray-800 dark:text-gray-100"
              >
                <h2 class="text-lg font-bold text-gray-800 dark:text-white">
                  {{
                    isEditing
                      ? $t("ingredient.editTitle")
                      : $t("ingredient.addTitle")
                  }}
                </h2>

                <div>
                  <label
                    class="block text-sm font-medium mb-1 dark:text-gray-300"
                  >
                    {{ $t("ingredient.name") }}
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="w-full border dark:border-gray-600 rounded-lg px-3 py-2 focus:ring focus:border-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                    :placeholder="$t('ingredient.namePlaceholder')"
                  />
                  <p v-if="nameError" class="text-sm text-red-500 mt-1">
                    {{ $t(nameError) }}
                  </p>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium mb-1 dark:text-gray-300"
                  >
                    {{ $t("ingredient.unit") }}
                  </label>
                  <input
                    v-model="form.unit"
                    type="text"
                    class="w-full border dark:border-gray-600 rounded-lg px-3 py-2 focus:ring focus:border-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                    :placeholder="$t('ingredient.unitPlaceholder')"
                  />
                </div>

                <!-- Low alert quantity -->
                <div>
                  <label
                    class="block text-sm font-medium mb-1 dark:text-gray-300"
                  >
                    {{ $t("ingredient.lowAlertAt") || "Low Alert At" }}
                    <span class="opacity-60 text-xs"
                      >({{ form.unit || $t("ingredient.unit") }})</span
                    >
                  </label>
                  <input
                    v-model.number="form.low_alert_qty"
                    type="number"
                    min="0"
                    step="0.001"
                    class="w-full border dark:border-gray-600 rounded-lg px-3 py-2 focus:ring focus:border-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                    :placeholder="
                      $t('ingredient.lowAlertPlaceholder') || 'e.g. 500'
                    "
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    {{
                      $t("ingredient.lowAlertHint") ||
                      "Alert when stock is at or below this amount. Leave empty to use default threshold."
                    }}
                  </p>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                  <button
                    @click="closeModal"
                    class="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-full text-sm"
                  >
                    {{ $t("common.cancel") }}
                  </button>
                  <button
                    @click="isEditing ? updateIngredient() : createIngredient()"
                    class="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow px-4 py-2 rounded-full text-sm transition"
                  >
                    {{ isEditing ? $t("common.update") : $t("common.save") }}
                  </button>
                </div>
              </div>
            </div>
          </teleport>

          <!-- Delete Confirm Modal -->
          <teleport to="body">
            <div
              v-if="showConfirm"
              :lang="locale"
              class="fixed inset-0 z-[999] flex items-center justify-center khmer-support"
            >
              <div class="absolute inset-0 bg-black bg-opacity-50 z-[998]" />
              <div
                class="relative z-[999] bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl space-y-4 w-full max-w-sm text-center text-gray-800 dark:text-gray-100"
              >
                <h2 class="text-lg font-bold text-gray-800 dark:text-white">
                  {{ $t("ingredient.confirmDeleteTitle") }}
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  {{ $t("ingredient.confirmDeleteText") }}
                </p>
                <div class="flex justify-center gap-4 pt-4">
                  <button
                    @click="showConfirm = false"
                    class="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-full text-sm"
                  >
                    {{ $t("common.cancel") }}
                  </button>
                  <button
                    @click="deleteIngredient(ingredientToDelete)"
                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm"
                  >
                    {{ $t("common.confirmDelete") }}
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
import { ref, computed, onMounted, h } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";

const toast = createToastInterface();
const { t, locale } = useI18n();

const ingredients = ref([]);
const openModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const showConfirm = ref(false);
const ingredientToDelete = ref(null);

// include low_alert_qty in the form
const form = ref({ name: "", unit: "", low_alert_qty: null });
const nameError = ref("");

// Search
const search = ref("");

// ===== Locale-aware name & collator =====
function localizedName(ing) {
  return locale.value === "km" ? ing?.name_kh || ing?.name : ing?.name;
}
const collator = computed(
  () => new Intl.Collator(locale.value || undefined, { sensitivity: "base" })
);

// ===== Tri-state sorting (like Stock page) =====
const defaultSort = { by: "name", dir: "asc" }; // 'asc' | 'desc'
const sort = ref({ ...defaultSort });

function setSort(by) {
  if (sort.value.by !== by) {
    sort.value.by = by;
    // sensible defaults for first click on each column
    sort.value.dir = by === "created" ? "desc" : by === "low" ? "asc" : "asc";
  } else {
    if (sort.value.dir === "asc") sort.value.dir = "desc";
    else if (sort.value.dir === "desc")
      sort.value = { ...defaultSort }; // reset to default
    else sort.value.dir = "asc";
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

// helper for numeric with null handling
function numVal(v, nullAs = Infinity) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : nullAs;
}

// ===== Derived list (search + sort) =====
const filteredIngredients = computed(() => {
  let arr = ingredients.value || [];

  // search
  if (search.value) {
    const s = search.value.toLowerCase();
    arr = arr.filter(
      (ing) =>
        (ing.name && ing.name.toLowerCase().includes(s)) ||
        (ing.name_kh && ing.name_kh.toLowerCase().includes(s))
    );
  }

  // sort
  const by = sort.value.by;
  const dir = sort.value.dir;
  const mul = dir === "asc" ? 1 : -1;

  return [...arr].sort((a, b) => {
    if (by === "name") {
      const an = (localizedName(a) || "").toString();
      const bn = (localizedName(b) || "").toString();
      return collator.value.compare(an, bn) * mul;
    }
    if (by === "unit") {
      const au = (a.unit || "").toString();
      const bu = (b.unit || "").toString();
      return collator.value.compare(au, bu) * mul;
    }
    if (by === "low") {
      // nulls last on asc, first on desc
      const na = numVal(a.low_alert_qty, dir === "asc" ? Infinity : -Infinity);
      const nb = numVal(b.low_alert_qty, dir === "asc" ? Infinity : -Infinity);
      return (na - nb) * mul;
    }
    if (by === "created") {
      const ta = new Date(a.created_at).getTime() || 0;
      const tb = new Date(b.created_at).getTime() || 0;
      return (ta - tb) * mul;
    }
    return 0;
  });
});

// API & CRUD
const loadIngredients = async () => {
  const res = await api.get("/ingredients");
  ingredients.value = res.data || [];
};

function openAddForm() {
  form.value = { name: "", unit: "", low_alert_qty: null };
  isEditing.value = false;
  openModal.value = true;
  nameError.value = "";
}

function editIngredient(item) {
  form.value = {
    name: item.name,
    unit: item.unit,
    low_alert_qty: item.low_alert_qty ?? null,
  };
  isEditing.value = true;
  editingId.value = item.id;
  openModal.value = true;
  nameError.value = "";
}

function closeModal() {
  openModal.value = false;
  form.value = { name: "", unit: "", low_alert_qty: null };
  isEditing.value = false;
  editingId.value = null;
  nameError.value = "";
}

async function createIngredient() {
  nameError.value = "";
  const newName = (form.value.name || "").trim().toLowerCase();

  if (!newName || !(form.value.unit || "").trim()) {
    nameError.value = "ingredient.errorRequired";
    return;
  }

  const exists = (ingredients.value || []).some(
    (i) => (i.name || "").trim().toLowerCase() === newName
  );
  if (exists) {
    nameError.value = "ingredient.errorExists";
    return;
  }

  try {
    await api.post("/ingredients", form.value);
    toast.success(t("ingredient.successAdd"));
    closeModal();
    await loadIngredients();
  } catch (err) {
    console.error("Create failed:", err);
    toast.error(t("ingredient.errorAdd") || "❌ Failed to add ingredient.");
  }
}

async function updateIngredient() {
  nameError.value = "";
  const newName = (form.value.name || "").trim().toLowerCase();

  const exists = (ingredients.value || []).some(
    (i) =>
      (i.name || "").trim().toLowerCase() === newName &&
      i.id !== editingId.value
  );
  if (exists) {
    nameError.value = "ingredient.errorAnotherExists";
    return;
  }

  try {
    await api.put(`/ingredients/${editingId.value}`, form.value);
    toast.success(t("ingredient.successUpdate"));
    closeModal();
    await loadIngredients();
  } catch (err) {
    console.error("Update failed:", err);
    toast.error(
      t("ingredient.errorUpdate") || "❌ Failed to update ingredient."
    );
  }
}

function confirmDelete(id) {
  ingredientToDelete.value = id;
  showConfirm.value = true;
}

async function deleteIngredient(id) {
  showConfirm.value = false;
  try {
    await api.delete(`/ingredients/${id}`);
    toast.success(t("ingredient.successDelete"));
    await loadIngredients();
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error(
      t("ingredient.errorDelete") || "❌ Failed to delete ingredient."
    );
  }
}

// Localized date
function formatDate(date) {
  try {
    const loc = locale.value === "km" ? "km-KH" : undefined;
    return new Date(date).toLocaleDateString(loc);
  } catch {
    return new Date(date).toLocaleDateString();
  }
}

// ===== Sort icon (functional, same as Stock) =====
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
      [
        h("svg", { width: 12, height: 12, viewBox: "0 0 20 20" }, [
          h("path", {
            d: "M7 7l3-3 3 3H7zM7 13h6l-3 3-3-3z",
            fill: "currentColor",
          }),
        ]),
      ]
    );
  }
  return h(
    "span",
    {
      class:
        "inline-block ml-1 align-middle text-purple-600 dark:text-purple-300",
      "aria-hidden": "true",
    },
    [
      h("svg", { width: 12, height: 12, viewBox: "0 0 20 20" }, [
        h("path", {
          d: dir === "asc" ? "M10 5l5 7H5l5-7z" : "M10 15l-5-7h10l-5 7z",
          fill: "currentColor",
        }),
      ]),
    ]
  );
};

onMounted(loadIngredients);
</script>

<style scoped>
/* Invisible scrollbar (same pattern as Orders) */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Khmer-friendly font stack applied to page & teleported modals */
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
