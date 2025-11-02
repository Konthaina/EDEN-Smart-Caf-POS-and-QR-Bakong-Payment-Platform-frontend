<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 khmer-support"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-xl p-8 relative flex flex-col gap-5 text-gray-800 dark:text-gray-100"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t("recipeModal.title", { name: localizedMenuName(menuItem) }) }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-red-500 text-2xl font-bold"
          :disabled="loading"
          :aria-label="$t('recipeModal.close')"
        >
          &times;
        </button>
      </div>

      <!-- Scope selector -->
      <div class="flex flex-wrap items-center gap-3">
        <label class="inline-flex items-center gap-2">
          <input
            type="radio"
            class="accent-purple-600"
            value="item"
            v-model="scope"
            :disabled="loading"
          />
          <span>{{ $t("recipeModal.scope.item") || "Item (all sizes)" }}</span>
        </label>

        <label v-if="variants.length" class="inline-flex items-center gap-2">
          <input
            type="radio"
            class="accent-purple-600"
            value="variant"
            v-model="scope"
            :disabled="loading"
          />
          <span>{{ $t("recipeModal.scope.variant") || "Variant" }}</span>
        </label>

        <select
          v-if="scope === 'variant'"
          v-model="selectedVariantId"
          class="ml-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 rounded text-sm"
          :disabled="loading || !variants.length"
        >
          <option v-for="v in variants" :key="v.id" :value="v.id">
            {{ v.name }}
            <span v-if="v.is_active === false"
              >({{ $t("common.hidden") || "hidden" }})</span
            >
          </option>
        </select>
      </div>

      <!-- Table -->
      <table class="w-full mb-4">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-700">
            <th class="text-left px-3 py-2 text-gray-700 dark:text-gray-300">
              {{ $t("recipeModal.th.ingredient") }}
            </th>
            <th class="text-left px-3 py-2 text-gray-700 dark:text-gray-300">
              {{ $t("recipeModal.th.quantity") }}
            </th>
            <th class="text-left px-3 py-2 text-gray-700 dark:text-gray-300">
              {{ $t("recipeModal.th.unit") }}
            </th>
            <th class="text-center px-3 py-2 text-gray-700 dark:text-gray-300">
              {{ $t("recipeModal.th.action") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(r, i) in recipeList"
            :key="r.id || r.ingredient_id"
            class="border-t border-gray-200 dark:border-gray-700"
          >
            <td class="px-3 py-2">{{ displayIngredientName(r) }}</td>
            <td class="px-3 py-2">{{ r.quantity }}</td>
            <td class="px-3 py-2">{{ displayUnit(r) }}</td>
            <td class="px-3 py-2 flex gap-2 justify-center">
              <button
                @click="editIngredient(i)"
                class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded px-3 py-1 text-sm"
                :disabled="loading"
              >
                {{ $t("common.edit") }}
              </button>
              <button
                @click="removeIngredient(i)"
                class="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded px-3 py-1 text-sm"
                :disabled="loading"
              >
                {{ $t("common.delete") }}
              </button>
            </td>
          </tr>

          <tr v-if="!recipeList.length">
            <td
              colspan="4"
              class="text-center text-gray-400 dark:text-gray-500 py-4"
            >
              {{ $t("recipeModal.empty") }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Actions -->
      <div class="flex justify-between mt-4">
        <button
          @click="showAddModal = true"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold transition"
          :disabled="loading"
        >
          {{ $t("recipeModal.add") }}
        </button>
        <button
          @click="save"
          :disabled="!recipeList.length || loading"
          class="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded font-semibold transition disabled:opacity-60"
        >
          <span v-if="loading">{{ $t("recipeModal.saving") }}</span>
          <span v-else>{{ $t("recipeModal.save") }}</span>
        </button>
      </div>

      <!-- Ingredient Modal (Add/Edit) -->
      <IngredientModal
        v-if="showAddModal"
        :all-ingredients="allIngredients"
        :editing="
          ingredientEditIndex !== null ? recipeList[ingredientEditIndex] : null
        "
        @add="addIngredient"
        @update="updateIngredient"
        @close="closeIngredientModal"
        :existing-ids="recipeList.map((r) => r.ingredient_id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import IngredientModal from "./IngredientModal.vue";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";

const toast = createToastInterface();

const props = defineProps({
  menuItem: { type: Object, required: true }, // expect .variants[] if caller fetched include_variants=1
});
const emit = defineEmits(["close", "updated"]);

const { t, locale } = useI18n();

const allIngredients = ref([]);
const recipeList = ref([]);
const showAddModal = ref(false);
const ingredientEditIndex = ref(null);
const loading = ref(false);

/* NEW: scope & variant selection */
const scope = ref("item"); // 'item' | 'variant'
const selectedVariantId = ref(null);
const variants = computed(() =>
  Array.isArray(props.menuItem?.variants) ? props.menuItem.variants : []
);

/* Fetch ingredients once */
async function fetchIngredients() {
  try {
    const res = await api.get("/ingredients");
    allIngredients.value = res.data;
  } catch (err) {
    console.error("Failed to fetch ingredients:", err);
    toast.error(t("recipeModal.errors.loadIngredients"));
  }
}

/* Load recipe lines for current scope */
async function fetchRecipeForScope() {
  try {
    const res = await api.get("/recipes");
    const all = Array.isArray(res.data) ? res.data : res.data?.data || [];

    if (scope.value === "item") {
      recipeList.value = all.filter(
        (r) => r.menu_item_id === props.menuItem.id && !r.menu_item_variant_id
      );
    } else {
      const vid = Number(selectedVariantId.value);
      if (!vid) {
        recipeList.value = [];
        return;
      }
      recipeList.value = all.filter((r) => r.menu_item_variant_id === vid);
    }
  } catch (err) {
    console.error("Failed to fetch recipes:", err);
    toast.error(t("recipeModal.errors.loadRecipes"));
  }
}

/** Localized display helpers */
function localizedMenuName(item) {
  return locale.value === "km" ? item?.name_kh || item?.name : item?.name;
}
function findIngredient(r) {
  return allIngredients.value.find((i) => i.id === r.ingredient_id);
}
function displayIngredientName(r) {
  const ing = findIngredient(r);
  if (!ing) return `#${r.ingredient_id}`;
  return locale.value === "km" ? ing.name_kh || ing.name : ing.name;
}
function displayUnit(r) {
  const ing = findIngredient(r);
  return ing?.unit ?? r.unit ?? "";
}

/* CRUD in list */
function addIngredient(ingredient) {
  if (
    recipeList.value.some((r) => r.ingredient_id === ingredient.ingredient_id)
  ) {
    toast.warning(t("recipeModal.errors.duplicate"));
    return;
  }
  recipeList.value.push(ingredient);
  showAddModal.value = false;
  ingredientEditIndex.value = null;
}
function editIngredient(idx) {
  ingredientEditIndex.value = idx;
  showAddModal.value = true;
}
function updateIngredient(ingredient) {
  if (ingredientEditIndex.value !== null) {
    recipeList.value[ingredientEditIndex.value] = ingredient;
    ingredientEditIndex.value = null;
  }
  showAddModal.value = false;
}
async function removeIngredient(idx) {
  const removed = recipeList.value.splice(idx, 1)[0];
  if (removed && removed.id) {
    try {
      loading.value = true;
      await api.delete(`/recipes/${removed.id}`);
      toast.success(t("recipeModal.messages.removed"));
    } catch (error) {
      recipeList.value.splice(idx, 0, removed); // rollback
      toast.error(t("recipeModal.errors.delete"));
    } finally {
      loading.value = false;
    }
  }
}
function closeIngredientModal() {
  showAddModal.value = false;
  ingredientEditIndex.value = null;
}

/* Save only current scope */
async function save() {
  loading.value = true;
  try {
    // 1) Delete existing recipes for THIS scope only
    const resAll = await api.get("/recipes");
    const all = Array.isArray(resAll.data)
      ? resAll.data
      : resAll.data?.data || [];

    let toDelete = [];
    if (scope.value === "item") {
      toDelete = all.filter(
        (r) => r.menu_item_id === props.menuItem.id && !r.menu_item_variant_id
      );
    } else {
      const vid = Number(selectedVariantId.value);
      toDelete = vid ? all.filter((r) => r.menu_item_variant_id === vid) : [];
    }

    for (const r of toDelete) {
      await api.delete(`/recipes/${r.id}`);
    }

    // 2) Create the new list for this scope
    for (const r of recipeList.value) {
      const payload = {
        ingredient_id: r.ingredient_id,
        quantity: r.quantity,
      };
      if (scope.value === "item") {
        payload.menu_item_id = props.menuItem.id;
      } else {
        payload.menu_item_variant_id = Number(selectedVariantId.value);
      }
      await api.post("/recipes", payload);
    }

    toast.success(t("recipeModal.messages.saved"));
    emit("updated", { ...props.menuItem });
    showAddModal.value = false;
  } catch (err) {
    console.error(err);
    toast.error(t("recipeModal.errors.save"));
  } finally {
    loading.value = false;
  }
}

/* React to scope / variant changes */
watch(scope, async (val) => {
  if (val === "variant" && !selectedVariantId.value && variants.value.length) {
    selectedVariantId.value = variants.value[0].id;
  }
  await fetchRecipeForScope();
});
watch(selectedVariantId, fetchRecipeForScope);

/* bootstrap */
onMounted(async () => {
  await fetchIngredients();
  if (variants.value.length) {
    // Keep previous selection if exists; else choose first
    selectedVariantId.value = variants.value[0]?.id ?? null;
  }
  await fetchRecipeForScope();
});
watch(
  () => props.menuItem,
  async () => {
    // refresh variant list and current scope data when menu item changes
    if (scope.value === "variant" && variants.value.length) {
      selectedVariantId.value = variants.value[0]?.id ?? null;
    }
    await fetchRecipeForScope();
  },
  { immediate: false }
);
</script>

<style scoped>
/* Invisible scrollbar */
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
