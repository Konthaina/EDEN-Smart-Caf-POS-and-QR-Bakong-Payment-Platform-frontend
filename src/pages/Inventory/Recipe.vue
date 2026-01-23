<template>
  <AppLayout>
    <div
      class="p-6 h-full flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900 rounded-xl khmer-support"
    >
      <div class="flex-1 flex flex-col justify-between gap-6 min-h-0">
        <!-- Header -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
                {{ $t("recipe.title") }}
              </h1>
              <p class="text-sm text-gray-400 dark:text-gray-300 mt-1">
                {{ $t("recipe.subtitle") }}
              </p>
            </div>

            <label
              class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
            >
              <input
                type="checkbox"
                v-model="showArchived"
                @change="fetchAllData"
                class="rounded border-gray-300 dark:border-gray-700"
              />
              <span>{{
                $t("recipe.showArchived") || "Show archived menu items"
              }}</span>
            </label>
          </div>

          <!-- Search / Filter -->
          <div class="flex justify-between items-center">
            <!-- Search -->
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
                :placeholder="$t('recipe.searchPlaceholder')"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
              />
            </div>

            <div class="flex gap-3 items-center">
              <!-- Filter by ingredient -->
              <select
                v-model="selectedIngredient"
                class="rounded-xl border border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
              >
                <option value="">
                  {{ $t("recipe.filters.allIngredients") }}
                </option>
                <option
                  v-for="ing in ingredients"
                  :key="ing.id"
                  :value="ing.id"
                >
                  {{ localizedIngredientName(ing) }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Count + Table -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <div class="font-semibold text-gray-800 dark:text-white">
            {{ $t("recipe.total") }}:
            <span class="font-bold">{{ filteredItems.length }}</span>
          </div>

          <div
            class="flex-1 min-h-0 flex flex-col rounded-2xl border bg-white dark:bg-gray-800 overflow-hidden border-gray-300 dark:border-gray-700"
          >
            <div class="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <table class="min-w-full text-sm">
                <thead
                  class="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-purple-300 sticky top-0 z-10 uppercase"
                >
                  <tr>
                    <th
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('id')"
                      :aria-sort="ariaSort('id')"
                      @click="setSort('id')"
                    >
                      {{ $t("recipe.th.id") }}
                      <SortIcon :active="sort.by === 'id'" :dir="sort.dir" />
                    </th>

                    <th class="px-2 py-3 text-left">
                      {{ $t("recipe.th.product") }}
                    </th>

                    <th
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('name')"
                      :aria-sort="ariaSort('name')"
                      @click="setSort('name')"
                    >
                      {{ $t("recipe.th.name") }}
                      <SortIcon :active="sort.by === 'name'" :dir="sort.dir" />
                    </th>

                    <th class="px-4 py-3 text-left">
                      {{ $t("recipe.th.ingredients") }}
                    </th>

                    <th
                      class="px-4 py-3 text-left cursor-pointer select-none"
                      :class="isActive('quantity')"
                      :aria-sort="ariaSort('quantity')"
                      @click="setSort('quantity')"
                    >
                      <!-- quantity = number of recipe lines (base + variants) -->
                      {{ $t("recipe.th.quantity") }}
                      <SortIcon
                        :active="sort.by === 'quantity'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th class="px-4 py-3 text-left">
                      {{ $t("recipe.th.actions") }}
                    </th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-if="isLoading">
                    <td
                      colspan="6"
                      class="text-center py-10 text-gray-400 dark:text-gray-500"
                    >
                      {{ $t("recipe.loading") }}
                    </td>
                  </tr>

                  <tr v-else-if="filteredItems.length === 0">
                    <td
                      colspan="6"
                      class="text-center py-10 text-gray-400 dark:text-gray-500"
                    >
                      {{ $t("recipe.noData") }}
                    </td>
                  </tr>

                  <tr
                    v-for="item in filteredItems"
                    :key="item.id"
                    class="hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                  >
                    <td
                      class="px-4 py-3 align-middle text-gray-600 dark:text-white font-mono font-bold"
                    >
                      {{ item.id }}
                    </td>

                    <td class="px-2 py-3 align-middle">
                      <img
                        :src="resolveImage(item.image)"
                        class="w-14 h-10 rounded-lg object-cover border dark:border-gray-700"
                        alt="product"
                      />
                    </td>

                    <td
                      class="px-4 py-3 font-semibold text-gray-700 dark:text-white align-middle"
                    >
                      {{ localizedMenuName(item) }}
                      <span
                        v-if="item.deleted_at"
                        class="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                      >
                        Archived
                      </span>
                      <span
                        v-if="(item.variants?.length || 0) > 0"
                        class="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                      >
                        {{ item.variants?.length }} variants
                      </span>
                    </td>

                    <td class="px-4 py-3 align-middle">
                      <!-- show top 3 from base recipe only (variants are edited inside modal) -->
                      <span
                        v-for="(ingName, i) in getIngredientNames(item).slice(
                          0,
                          3
                        )"
                        :key="ingName + i"
                        class="inline-block bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 mr-1 rounded text-xs mb-1"
                      >
                        {{ ingName
                        }}<span v-if="i < getIngredientNames(item).length - 1"
                          >/</span
                        >
                      </span>
                      <span
                        v-if="getIngredientNames(item).length > 3"
                        class="text-xs text-gray-400 dark:text-gray-300"
                        >...</span
                      >
                    </td>

                    <td
                      class="px-4 py-3 text-start font-bold align-middle text-gray-700 dark:text-white"
                    >
                      {{ totalRecipeLines(item) }}
                    </td>

                    <td class="px-4 py-3 align-middle">
                      <button
                        @click="openEdit(item)"
                        class="px-3 py-1 rounded-full bg-purple-100 dark:bg-blue-900 text-purple-600 dark:text-blue-300 text-xs font-semibold mr-2 hover:bg-purple-200"
                      >
                        {{ $t("common.edit") }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Edit Recipe Modal -->
          <RecipeEditModal
            v-if="showModal"
            :menu-item="activeMenuItem"
            @close="showModal = false"
            @updated="handleRecipeUpdate"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onDeactivated, h } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/plugins/axios";
import { storageUrl } from "@/config/urls";
import AppLayout from "@/components/Common/AppLayout.vue";
import RecipeEditModal from "@/components/Menu/RecipeEditModal.vue";

const { locale } = useI18n();

/* ===== Data ===== */
const menuItems = ref([]);
const ingredients = ref([]);
const isLoading = ref(true);

const search = ref("");
const selectedIngredient = ref("");
const showArchived = ref(true); // default true so edits don't hide rows

/* ===== Tri-state sorting ===== */
const defaultSort = { by: "name", dir: "asc" };
const sort = ref({ ...defaultSort });

function setSort(by) {
  if (sort.value.by !== by) {
    sort.value.by = by;
    sort.value.dir = by === "quantity" || by === "id" ? "desc" : "asc";
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
function getSortValue(item, by) {
  switch (by) {
    case "id":
      return Number(item.id || 0);
    case "name":
      return (localizedMenuName(item) || "").toLowerCase();
    case "quantity":
      return Number(totalRecipeLines(item));
    default:
      return 0;
  }
}

/* ===== Abort-on-navigate ===== */
let _runId = 0;
const _controllers = ref([]);
const _cancelled = ref(false);
function _startNewRun() {
  _cancelled.value = false;
  _runId += 1;
  return _runId;
}
function _isStale(runId) {
  return _cancelled.value || runId !== _runId;
}
function _track(ctrl) {
  _controllers.value.push(ctrl);
}
function _untrack(ctrl) {
  _controllers.value = _controllers.value.filter((c) => c !== ctrl);
}
function cancelAll() {
  _cancelled.value = true;
  for (const c of _controllers.value) {
    try {
      c.abort();
    } catch {}
  }
  _controllers.value = [];
  isLoading.value = false;
}
async function _get(url, config = {}) {
  const controller = new AbortController();
  _track(controller);
  try {
    return await api.get(url, { ...config, signal: controller.signal });
  } finally {
    _untrack(controller);
  }
}

/* ===== Utils ===== */
function resolveImage(img) {
  return storageUrl(img, "menu.png");
}
function localizedMenuName(item) {
  return locale.value === "km" ? item.name_kh || item.name : item.name;
}
function localizedIngredientName(ing) {
  return locale.value === "km" ? ing.name_kh || ing.name : ing.name;
}
function getIngredientNames(item) {
  if (!item.recipes) return [];
  return item.recipes.map((r) => {
    const joined = r.ingredient?.name_kh || r.ingredient?.name;
    if (joined) return joined;
    const ing = ingredients.value.find((i) => i.id === r.ingredient_id);
    return ing ? localizedIngredientName(ing) : `#${r.ingredient_id}`;
  });
}

/* NEW: base + variant recipe line count */
function totalRecipeLines(item) {
  const base = item.recipes?.length || 0;
  const vs = Array.isArray(item.variants) ? item.variants : [];
  const sumVar = vs.reduce((s, v) => s + (v.recipes?.length || 0), 0);
  return base + sumVar;
}

/* ===== Filter + Sort pipeline ===== */
const filteredItems = computed(() => {
  let result = menuItems.value || [];

  // filter visibility
  if (!showArchived.value) {
    // visible_only = active & not deleted (we fetch that way below)
    // locally we still guard, in case data was cached
    result = result.filter((i) => !i.deleted_at && i.is_active);
  }

  // Search across name + base ingredients
  if (search.value) {
    const s = search.value.toLowerCase();
    result = result.filter((item) => {
      const corpus = [
        item.name || "",
        item.name_kh || "",
        ...(getIngredientNames(item) || []),
      ]
        .join("|")
        .toLowerCase();
      return corpus.includes(s);
    });
  }

  // Ingredient filter (base recipe only in list)
  if (selectedIngredient.value) {
    result = result.filter(
      (item) =>
        item.recipes &&
        item.recipes.some(
          (r) => String(r.ingredient_id) === String(selectedIngredient.value)
        )
    );
  }

  const by = sort.value.by,
    dir = sort.value.dir;
  const mul = dir === "asc" ? 1 : -1;

  return [...result].sort((a, b) => {
    const va = getSortValue(a, by);
    const vb = getSortValue(b, by);
    if (typeof va === "string" && typeof vb === "string")
      return va.localeCompare(vb) * mul;
    if (va < vb) return -1 * mul;
    if (va > vb) return 1 * mul;
    return 0;
  });
});

/* ===== Modal ===== */
const showModal = ref(false);
const activeMenuItem = ref(null);
function openEdit(item) {
  activeMenuItem.value = item; // includes variants (we fetched with include_variants=1)
  showModal.value = true;
}
async function handleRecipeUpdate() {
  await fetchAllData();
  showModal.value = false;
}

/* ===== Data fetch (includes variants + recipes) ===== */
async function fetchAllData() {
  const rid = _startNewRun();
  isLoading.value = true;
  try {
    const params = { per_page: 1000, include_recipes: 1, include_variants: 1 };
    if (showArchived.value) params.with_trashed = 1;
    else params.visible_only = 1;

    const [ingRes, menuRes] = await Promise.allSettled([
      _get("/ingredients"),
      _get("/menu-items", { params }),
    ]);

    if (_isStale(rid)) return;

    if (ingRes.status === "fulfilled") {
      ingredients.value = ingRes.value.data || [];
    }
    if (menuRes.status === "fulfilled") {
      const data = menuRes.value.data;
      menuItems.value = Array.isArray(data?.data) ? data.data : data;
    }
  } catch (e) {
    if (!_isStale(rid)) console.error("Failed to fetch data", e);
  } finally {
    if (!_isStale(rid)) isLoading.value = false;
  }
}

/* ===== Sort icon (functional) ===== */
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

/* ===== Lifecycle & cancellation ===== */
onMounted(fetchAllData);
onBeforeRouteLeave(() => {
  cancelAll();
});
onDeactivated(() => {
  cancelAll();
});
onUnmounted(() => {
  cancelAll();
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

.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
