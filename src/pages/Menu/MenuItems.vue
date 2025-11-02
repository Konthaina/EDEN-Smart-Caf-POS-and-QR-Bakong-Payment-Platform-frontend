<template>
  <AppLayout>
    <div
      class="p-6 flex-1 min-h-0 flex flex-col bg-gray-50 dark:bg-gray-900 rounded-xl"
    >
      <div class="flex-1 min-h-0 flex flex-col">
        <!-- Header + actions -->
        <div class="space-y-4 shrink-0 pb-3">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
                {{ $t("menu.title") }}
              </h1>
              <p class="text-sm text-gray-400 dark:text-gray-300 mt-1">
                {{ $t("menu.subtitle") }}
              </p>
            </div>

            <div class="flex items-center gap-4">
              <label
                class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  v-model="showArchived"
                  class="rounded border-gray-300 dark:border-gray-700"
                />
                <span>{{
                  showArchived
                    ? $t("menu.showingDeleted") || "Showing deleted"
                    : $t("menu.showActive") || "Showing active"
                }}</span>
              </label>

              <button
                @click="openAddModal"
                class="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-xl font-medium shadow-sm transition"
              >
                <span class="text-lg font-bold">+</span>
                <span>{{ $t("menu.add") }}</span>
              </button>
            </div>
          </div>

          <!-- Search / Filter / Columns -->
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
                :placeholder="$t('menu.search')"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
              />
            </div>

            <div class="flex gap-3 items-center">
              <select
                v-model="selectedCategory"
                class="rounded-xl border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
              >
                <option value="">
                  {{ $t("menu.allCategories") || "All" }}
                </option>
                <option
                  v-for="cat in categoriesForFilter"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>

              <!-- Columns menu trigger -->
              <div class="relative" ref="colsMenuRef">
                <button
                  class="border rounded-xl px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 text-sm flex items-center gap-2 shadow-sm transition"
                  @click="toggleColsMenu"
                >
                  {{ $t("columns") || "Columns" }}
                  <svg
                    viewBox="0 0 20 20"
                    width="12"
                    height="12"
                    class="inline ml-1"
                  >
                    <path d="M5 7l5 6 5-6" fill="currentColor" />
                  </svg>
                </button>

                <!-- Columns dropdown -->
                <div
                  v-if="showColsMenu"
                  class="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10 p-2"
                >
                  <div
                    class="text-xs px-2 py-1 mb-1 text-gray-500 dark:text-gray-400"
                  >
                    {{ $t("show_hide_columns") || "Show/Hide Columns" }}
                  </div>

                  <div
                    v-for="c in toggleableColumns"
                    :key="c.key"
                    class="flex items-center gap-2 px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      :id="`col-${c.key}`"
                      class="rounded"
                      :checked="visibleCols[c.key]"
                      @change="onToggleColumn(c.key, $event)"
                    />
                    <label
                      :for="`col-${c.key}`"
                      class="text-sm text-gray-700 dark:text-gray-200 select-none"
                    >
                      {{ c.label }}
                    </label>
                  </div>

                  <div
                    v-if="hiddenCount >= toggleableColumns.length - 1"
                    class="px-2 pt-2 text-[11px] text-amber-600"
                  >
                    {{
                      $t("at_least_one_visible") ||
                      "At least one column must stay visible."
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Count + Table -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <div class="shrink-0 font-semibold text-gray-800 dark:text-white">
            {{ $t("menu.total") }}:
            <span class="font-bold">{{ filteredItems.length }}</span>
          </div>

          <div
            class="flex-1 min-h-0 flex flex-col rounded-2xl border bg-white dark:bg-gray-800 overflow-hidden border-gray-300 dark:border-gray-700"
          >
            <div class="flex-1 min-h-0 overflow-auto no-scrollbar">
              <!-- STABLE TABLE LAYOUT -->
              <table class="min-w-full text-sm table-fixed">
                <colgroup>
                  <col style="width: 52px" />
                  <col v-if="visibleCols.image" style="width: 92px" />
                  <col v-if="visibleCols.name" style="width: 260px" />
                  <col v-if="visibleCols.variants" style="width: 240px" />
                  <col v-if="visibleCols.price" style="width: 140px" />
                  <col v-if="visibleCols.available" style="width: 120px" />
                  <col v-if="visibleCols.discount" style="width: 140px" />
                  <col v-if="visibleCols.status" style="width: 140px" />
                  <col v-if="visibleCols.category" style="width: 160px" />
                  <col style="width: 300px" />
                </colgroup>

                <thead
                  class="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-purple-300 sticky top-0 z-10"
                >
                  <tr>
                    <th class="px-3 py-3 text-left">#</th>
                    <th v-if="visibleCols.image" class="px-2 py-3 text-left">
                      {{ $t("menu.image") }}
                    </th>

                    <th
                      v-if="visibleCols.name"
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('name')"
                      :aria-sort="ariaSort('name')"
                      @click="setSort('name')"
                    >
                      {{ $t("menu.name") }}
                      <SortIcon :active="sort.by === 'name'" :dir="sort.dir" />
                    </th>

                    <!-- SIZES header (was Variants) -->
                    <th
                      v-if="visibleCols.variants"
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('variants')"
                      :aria-sort="ariaSort('variants')"
                      @click="setSort('variants')"
                    >
                      {{ $t("menu.sizes") || "Sizes" }}
                      <SortIcon
                        :active="sort.by === 'variants'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th
                      v-if="visibleCols.price"
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('price')"
                      :aria-sort="ariaSort('price')"
                      @click="setSort('price')"
                    >
                      {{ $t("menu.price") }}
                      <SortIcon :active="sort.by === 'price'" :dir="sort.dir" />
                    </th>

                    <th
                      v-if="visibleCols.available"
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('available')"
                      :aria-sort="ariaSort('available')"
                      @click="setSort('available')"
                    >
                      {{ $t("menu.available") || "Available" }}
                      <SortIcon
                        :active="sort.by === 'available'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th
                      v-if="visibleCols.discount"
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('discount')"
                      :aria-sort="ariaSort('discount')"
                      @click="setSort('discount')"
                    >
                      {{ $t("menu.discount") || "Discount" }}
                      <SortIcon
                        :active="sort.by === 'discount'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th
                      v-if="visibleCols.status"
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('status')"
                      :aria-sort="ariaSort('status')"
                      @click="setSort('status')"
                    >
                      {{ $t("menu.status") || "Status" }}
                      <SortIcon
                        :active="sort.by === 'status'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th
                      v-if="visibleCols.category"
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('category')"
                      :aria-sort="ariaSort('category')"
                      @click="setSort('category')"
                    >
                      {{ $t("menu.category") }}
                      <SortIcon
                        :active="sort.by === 'category'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th class="px-4 py-3 text-left w-[300px]">
                      {{ $t("menu.actions") }}
                    </th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr
                    v-for="(item, idx) in filteredItems"
                    :key="item.id"
                    class="hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                  >
                    <td class="px-3 py-3 align-middle">{{ idx + 1 }}</td>

                    <td v-if="visibleCols.image" class="px-2 py-3 align-middle">
                      <img
                        :src="fullImageUrl(item.image)"
                        alt="item image"
                        class="w-14 h-10 rounded-lg object-cover border dark:border-gray-700"
                        @error="onImgError"
                      />
                    </td>

                    <td
                      v-if="visibleCols.name"
                      class="px-4 py-3 align-middle font-semibold text-gray-700 dark:text-white"
                    >
                      <div class="truncate" :title="item.name">
                        {{ item.name }}
                      </div>
                      <div
                        v-if="sizesList(item).count > 0"
                        class="mt-1 text-xs text-gray-400"
                      >
                        {{ sizesList(item).count }}
                        {{ $t("menu.sizes") || "sizes" }}
                      </div>
                    </td>

                    <!-- SIZES CELL (was VARIANTS) -->
                    <td
                      v-if="visibleCols.variants"
                      class="px-4 py-3 align-middle"
                    >
                      <div class="truncate" :title="sizesList(item).full">
                        <span class="text-xs text-gray-700 dark:text-gray-200">
                          {{ sizesList(item).display || "—" }}
                        </span>
                      </div>
                    </td>

                    <td v-if="visibleCols.price" class="px-4 py-3 align-middle">
                      <div class="flex items-center gap-2">
                        <span
                          v-if="item.has_active_discount"
                          class="line-through opacity-60"
                          >{{ money(item.price) }}</span
                        >
                        <span class="font-semibold">{{
                          money(item.final_price ?? item.price)
                        }}</span>
                      </div>
                    </td>

                    <td
                      v-if="visibleCols.available"
                      class="px-4 py-3 align-middle"
                    >
                      <span
                        class="text-xs font-semibold px-2 py-1 rounded-full"
                        :class="
                          menu.getAvailable(item) > 0
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900 text-red-500 dark:text-red-300'
                        "
                      >
                        {{ menu.getAvailable(item) }}
                      </span>
                    </td>

                    <td
                      v-if="visibleCols.discount"
                      class="px-4 py-3 align-middle"
                    >
                      <span
                        v-if="item.has_active_discount"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200"
                      >
                        <template v-if="item.discount_type === 'percent'">
                          -{{ Number(item.discount_value).toFixed(0) }}%
                        </template>
                        <template v-else>
                          -{{ money(item.discount_value) }}
                        </template>
                      </span>
                      <span v-else class="text-xs text-gray-400">—</span>
                    </td>

                    <td
                      v-if="visibleCols.status"
                      class="px-4 py-3 align-middle"
                    >
                      <span
                        v-if="item.deleted_at"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                      >
                        Deleted
                      </span>
                      <span
                        v-else-if="item.is_active"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100"
                      >
                        Active
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-100"
                      >
                        Hidden
                      </span>
                    </td>

                    <td
                      v-if="visibleCols.category"
                      class="px-4 py-3 align-middle"
                    >
                      <div class="truncate" :title="item.category?.name || '—'">
                        <span
                          class="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs font-semibold"
                        >
                          {{ item.category?.name || "—" }}
                        </span>
                      </div>
                    </td>

                    <td class="px-4 py-3 align-middle">
                      <div class="flex flex-wrap gap-2">
                        <template v-if="!showArchived">
                          <!-- Normal view: Edit + Delete (soft) -->
                          <button
                            class="px-3 py-1 rounded-full bg-purple-100 dark:bg-blue-900 text-purple-600 dark:text-blue-300 text-xs font-semibold hover:bg-purple-200"
                            @click="editItem(item)"
                          >
                            {{ $t("actions.edit") }}
                          </button>
                          <button
                            class="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs font-semibold hover:bg-red-200"
                            @click="askDelete(item)"
                          >
                            {{ $t("actions.delete") || "Delete" }}
                          </button>
                        </template>

                        <template v-else>
                          <!-- Deleted view: Restore + Delete permanently -->
                          <button
                            class="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold hover:bg-green-200"
                            @click="restoreItem(item)"
                          >
                            {{ $t("menu.restore") || "Restore" }}
                          </button>

                          <button
                            class="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs font-semibold hover:bg-red-200"
                            @click="askDelete(item)"
                          >
                            {{
                              $t("actions.deleteForever") ||
                              "Delete permanently"
                            }}
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="!menu.isLoading && filteredItems.length === 0">
                    <td
                      :colspan="safeColspan"
                      class="py-8 text-center text-gray-400 dark:text-gray-500"
                    >
                      {{ $t("menu.empty") }}
                    </td>
                  </tr>

                  <tr v-if="menu.isLoading">
                    <td
                      :colspan="safeColspan"
                      class="py-8 text-center text-gray-400 dark:text-gray-300"
                    >
                      {{ $t("loading") || "Loading..." }}
                    </td>
                  </tr>

                  <tr v-if="menu.loadingMore && !menu.isLoading">
                    <td
                      :colspan="safeColspan"
                      class="py-4 text-center text-gray-400 dark:text-gray-300"
                    >
                      {{ $t("loading") || "Loading more..." }}
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
          :categories="menu.categories"
          @close="closeAddModal"
          @saved="handleSaved"
        />
        <EditMenuItemModal
          :show="showEditModal"
          :item="selectedItem"
          :categories="menu.categories"
          @close="closeEditModal"
          @saved="handleSaved"
        />

        <!-- Confirm (soft/permanent) -->
        <ConfirmModal
          :show="showConfirm"
          :message="confirmMessage"
          @confirm="confirmDelete"
          @cancel="cancelDelete"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from "vue";
import { useMenuStore } from "@/store/menu";
import AppLayout from "@/components/Common/AppLayout.vue";
import ConfirmModal from "@/components/Common/ConfirmModal.vue";
import AddMenuItemModal from "@/components/Menu/AddMenuItemModal.vue";
import EditMenuItemModal from "@/components/Menu/EditMenuItemModal.vue";
import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";

const toast = createToastInterface();
const menu = useMenuStore();

/** local UI state only */
const search = ref("");
const selectedCategory = ref("");
const showArchived = ref(false);

const showAddModal = ref(false);
const showEditModal = ref(false);
const showConfirm = ref(false);
const selectedItem = ref(null);
const deleteMode = ref("soft"); // 'soft' | 'permanent'

/** sorting (tri-state) */
const defaultSort = { by: "name", dir: "asc" };
const sort = ref({ ...defaultSort });

function setSort(by) {
  if (sort.value.by !== by) {
    sort.value.by = by;
    sort.value.dir = ["price", "available", "discount", "variants"].includes(by)
      ? "desc"
      : "asc";
  } else {
    if (sort.value.dir === "asc") sort.value.dir = "desc";
    else if (sort.value.dir === "desc") sort.value = { ...defaultSort };
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

/** columns visibility */
const visibleCols = ref({
  image: true,
  name: true,
  variants: true, // kept key, but labeled "Sizes" in UI
  price: true,
  available: true,
  discount: true,
  status: true,
  category: true,
});
const toggleableColumns = [
  { key: "image", label: "Image" },
  { key: "name", label: "Name" },
  { key: "variants", label: "Sizes" }, // renamed label
  { key: "price", label: "Price" },
  { key: "available", label: "Available" },
  { key: "discount", label: "Discount" },
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
];
const showColsMenu = ref(false);
const colsMenuRef = ref(null);
function toggleColsMenu() {
  showColsMenu.value = !showColsMenu.value;
}
function onDocClick(e) {
  if (!colsMenuRef.value) return;
  if (!colsMenuRef.value.contains(e.target)) showColsMenu.value = false;
}
const hiddenCount = computed(
  () => toggleableColumns.filter((c) => !visibleCols.value[c.key]).length
);
function onToggleColumn(key, evt) {
  const checked = evt.target.checked;
  const currentlyVisible = toggleableColumns.length - hiddenCount.value;
  if (!checked && currentlyVisible <= 1) {
    evt.preventDefault();
    evt.target.checked = true;
    return;
  }
  visibleCols.value[key] = checked;
}
const safeColspan = computed(() => {
  const middle = Object.values(visibleCols.value).filter(Boolean).length;
  return Math.max(1 + middle + 1, 2);
});

/** formatting helpers */
const DEFAULT_IMG = `${import.meta.env.BASE_URL}menu.png`;
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
function fullImageUrl(path) {
  if (!path) return DEFAULT_IMG;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/storage/${path}`;
}
function onImgError(ev) {
  const el = ev.target;
  if (el.dataset.fallbackApplied) return;
  el.dataset.fallbackApplied = "1";
  el.src = DEFAULT_IMG;
}
function money(n) {
  const num = Number(n ?? 0);
  return `${num.toFixed(2)} $`;
}

/** size helpers */
function extractSizeFromName(name) {
  const m = String(name || "").match(/\(([^)]+)\)\s*$/);
  return m ? m[1] : "";
}
function sizeTokenFromVariant(v) {
  return (v?.sku || v?.size || extractSizeFromName(v?.name) || "")
    .toString()
    .trim();
}
function sizesForItem(item) {
  const list = Array.isArray(item?.variants) ? item.variants : [];
  const tokens = [];
  const seen = new Set();
  for (const v of list) {
    if (v?.deleted_at) continue; // hide deleted variants in active view
    const t = sizeTokenFromVariant(v);
    if (!t) continue;
    const key = t.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      tokens.push(t);
    }
  }
  return tokens;
}
function sizesList(item) {
  const tokens = sizesForItem(item);
  const limit = 6; // show up to 6 sizes inline; rest collapsed
  const shown = tokens.slice(0, limit);
  const extra = Math.max(tokens.length - shown.length, 0);
  return {
    display: shown.join(", ") + (extra > 0 ? ` +${extra}` : ""),
    full: tokens.join(", "),
    count: tokens.length,
  };
}

/** filter + sort */
const categoriesForFilter = computed(() =>
  (menu.categories || []).filter((c) => !c.deleted_at && c.is_active !== false)
);
function statusRank(item) {
  if (item.deleted_at) return 2;
  if (item.is_active) return 0;
  return 1;
}
function discountStrengthPct(item) {
  if (!item.has_active_discount) return 0;
  const price = Number(item.price || 0);
  if (item.discount_type === "percent") return Number(item.discount_value || 0);
  const fixed = Number(item.discount_value || 0);
  return price > 0 ? (fixed / price) * 100 : 0;
}
function getSortValue(item, by) {
  switch (by) {
    case "name":
      return (item.name || "").toString().toLowerCase();
    case "price":
      return Number(item.final_price ?? item.price ?? 0);
    case "available":
      return Number(menu.getAvailable(item));
    case "discount":
      return Number(discountStrengthPct(item));
    case "status":
      return statusRank(item);
    case "category":
      return (item.category?.name || "").toString().toLowerCase();
    case "variants":
      return Number(item.variants?.length || 0); // sorting by count still OK
    default:
      return 0;
  }
}

const filteredItems = computed(() => {
  let result = showArchived.value ? menu.archivedItems : menu.nonArchivedItems;

  if (search.value) {
    const s = search.value.toLowerCase();
    result = result.filter((i) => {
      const nameHit = (i.name || "").toLowerCase().includes(s);
      const catHit = (i.category?.name || "").toLowerCase().includes(s);
      const sizeHit = (i.variants || []).some((v) => {
        const fields = [
          v?.sku,
          v?.size,
          extractSizeFromName(v?.name),
          v?.name, // last fallback
        ];
        return fields.some((x) => (x || "").toLowerCase().includes(s));
      });
      return nameHit || catHit || sizeHit;
    });
  }

  if (selectedCategory.value) {
    result = result.filter(
      (i) => String(i.category_id) === String(selectedCategory.value)
    );
  }

  const by = sort.value.by,
    dir = sort.value.dir,
    mul = dir === "asc" ? 1 : -1;
  result = [...result].sort((a, b) => {
    const va = getSortValue(a, by),
      vb = getSortValue(b, by);
    if (typeof va === "string" && typeof vb === "string")
      return va.localeCompare(vb) * mul;
    if (va < vb) return -1 * mul;
    if (va > vb) return 1 * mul;
    return 0;
  });

  return result;
});

/** Row actions */
function openAddModal() {
  showAddModal.value = true;
}
function closeAddModal() {
  showAddModal.value = false;
}
function editItem(item) {
  selectedItem.value = item;
  showEditModal.value = true;
}
function closeEditModal() {
  selectedItem.value = null;
  showEditModal.value = false;
}

function askDelete(item) {
  selectedItem.value = item;
  deleteMode.value = item.deleted_at ? "permanent" : "soft";
  showConfirm.value = true;
}
const confirmMessage = computed(() => {
  if (!selectedItem.value) return "";
  return deleteMode.value === "soft"
    ? `Move "${selectedItem.value.name}" to trash? You can restore it later.`
    : `Permanently delete "${selectedItem.value.name}"? This cannot be undone.`;
});
async function confirmDelete() {
  if (!selectedItem.value) return;
  try {
    if (deleteMode.value === "soft") {
      await menu.archiveMenuItem(selectedItem.value.id);
      toast.success("Item moved to trash");
    } else {
      await menu.forceDeleteMenuItem(selectedItem.value.id);
      toast.success("Item permanently deleted");
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to delete item");
  } finally {
    showConfirm.value = false;
    selectedItem.value = null;
  }
}
function cancelDelete() {
  showConfirm.value = false;
  selectedItem.value = null;
}

async function restoreItem(item) {
  try {
    await menu.restoreMenuItem(item.id);
    toast.success("Item restored");
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to restore item");
  }
}

/** After add/edit saved: upsert or refresh once */
async function handleSaved(itemMaybe) {
  showAddModal.value = false;
  showEditModal.value = false;
  if (itemMaybe && itemMaybe.id) {
    menu.upsertMenuItem(itemMaybe); // optimistic
    if (menu.refreshVariants) await menu.refreshVariants(itemMaybe.id);
  } else {
    await menu.init(true); // fallback refresh
  }
}

/** Sort icon */
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

/** lifecycle */
onMounted(async () => {
  document.addEventListener("mousedown", onDocClick, true);
  await menu.ensureLoaded(); // initial load
});
onUnmounted(() => {
  document.removeEventListener("mousedown", onDocClick, true);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
tbody td,
thead th {
  transition: opacity 0.15s ease;
}
</style>
