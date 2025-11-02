<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-60 khmer-support"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md min-h-[420px] p-8 relative flex flex-col gap-6 text-gray-800 dark:text-gray-100"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{
            props.editing
              ? $t("ingredientModal.titleEdit")
              : $t("ingredientModal.titleAdd")
          }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-red-500 text-2xl font-bold"
          :aria-label="$t('ingredientModal.close')"
        >
          &times;
        </button>
      </div>

      <!-- Search/Dropdown -->
      <div class="relative">
        <div
          class="flex items-center border border-blue-400 dark:border-blue-500 rounded-xl px-3 py-2 focus-within:ring-2 ring-blue-400 dark:ring-blue-500 bg-white dark:bg-gray-700"
        >
          <svg
            class="w-4 h-4 mr-2 text-gray-400 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103 10.5a7.5 7.5 0 0013.15 6.15z"
            />
          </svg>

          <input
            v-model="search"
            @focus="dropdownOpen = true"
            @input="dropdownOpen = true"
            @keydown.down.prevent="focusNext"
            @keydown.up.prevent="focusPrev"
            @keydown.enter.prevent="selectActive"
            type="text"
            :placeholder="$t('ingredientModal.searchPlaceholder')"
            class="flex-1 outline-none bg-transparent text-gray-800 dark:text-gray-100"
            :disabled="!!props.editing"
          />

          <button
            @click="dropdownOpen = !dropdownOpen"
            type="button"
            class="ml-2"
            :disabled="!!props.editing"
            :aria-label="$t('ingredientModal.toggleList')"
          >
            <svg
              :class="{ 'rotate-180': dropdownOpen }"
              class="w-4 h-4 text-gray-400 dark:text-gray-300 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <!-- Dropdown list -->
        <ul
          v-show="dropdownOpen && filteredIngredients.length"
          class="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded-xl shadow-lg max-h-52 overflow-y-auto py-1"
        >
          <li
            v-for="(ing, i) in filteredIngredients"
            :key="ing.id"
            :class="[
              'px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 rounded text-gray-800 dark:text-gray-100',
              activeIndex === i ? 'bg-blue-100 dark:bg-blue-900' : '',
            ]"
            @mouseenter="activeIndex = i"
            @mouseleave="activeIndex = -1"
            @mousedown.prevent="selectIngredient(ing)"
          >
            <div class="flex items-center justify-between">
              <span>{{ localizedIngredientName(ing) }}</span>
              <span class="text-xs text-gray-400 dark:text-gray-300">{{
                ing.unit || t("ingredientModal.unitGeneric")
              }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Ingredient Field (readonly) -->
      <div>
        <label
          class="block font-semibold mb-1 text-gray-700 dark:text-gray-300"
        >
          {{ $t("ingredientModal.labels.ingredient") }}
        </label>
        <input
          class="w-full border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          type="text"
          :value="
            selectedIngredient
              ? localizedIngredientName(selectedIngredient)
              : ''
          "
          :placeholder="$t('ingredientModal.noSelected')"
          readonly
        />
      </div>

      <!-- Quantity Field with dynamic unit -->
      <div>
        <label
          class="block font-semibold mb-1 text-gray-700 dark:text-gray-300"
        >
          {{ $t("ingredientModal.labels.quantity") }}
        </label>
        <div
          class="flex items-center border border-blue-300 dark:border-blue-700 rounded-lg px-3 bg-white dark:bg-gray-700"
        >
          <input
            class="flex-1 py-2 bg-transparent outline-none text-gray-800 dark:text-gray-100"
            v-model.number="quantity"
            type="number"
            min="0.01"
            step="0.01"
            :placeholder="quantityPlaceholder"
          />
          <span
            v-if="selectedIngredient"
            class="ml-1 text-gray-400 dark:text-gray-300"
          >
            ({{ selectedIngredient.unit || $t("ingredientModal.unitGeneric") }})
          </span>
        </div>
        <p v-if="qtyError" class="text-sm text-red-500 mt-1">{{ qtyError }}</p>
      </div>

      <!-- Submit Button -->
      <button
        @click="handleSubmit"
        :disabled="!selectedIngredient || !quantity"
        class="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-2 text-base font-semibold mt-2 disabled:opacity-60 w-full"
      >
        {{
          props.editing
            ? $t("ingredientModal.update")
            : $t("ingredientModal.add")
        }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  nextTick,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useI18n } from "vue-i18n";
import { createToastInterface } from "vue-toastification";
// api not needed here; parent handles persistence
// import api from "@/plugins/axios";

const props = defineProps({
  allIngredients: { type: Array, required: true },
  editing: { type: Object, default: null }, // { ingredient_id, name(_kh), unit, quantity, id? }
  existingIds: { type: Array, default: () => [] },
});
const emit = defineEmits(["add", "update", "close"]);

const { t, locale } = useI18n();
const toast = createToastInterface();

const search = ref("");
const dropdownOpen = ref(false);
const selectedIngredient = ref(null);
const quantity = ref("");
const activeIndex = ref(-1);

const qtyError = computed(() => {
  if (!quantity.value && quantity.value !== 0) return "";
  const q = Number(quantity.value);
  if (Number.isNaN(q)) return t("ingredientModal.errors.invalidQty");
  if (q <= 0) return t("ingredientModal.errors.invalidQty");
  return "";
});

function localizedIngredientName(ing) {
  return locale.value === "km" ? ing.name_kh || ing.name : ing.name;
}

watch(
  () => props.editing,
  (val) => {
    if (val) {
      selectedIngredient.value = {
        id: val.ingredient_id,
        name: val.name, // original English name (fallback)
        name_kh: val.name_kh, // if provided upstream
        unit: val.unit,
      };
      quantity.value = val.quantity;
      search.value = localizedIngredientName(selectedIngredient.value);
      dropdownOpen.value = false;
    } else {
      selectedIngredient.value = null;
      quantity.value = "";
      search.value = "";
      dropdownOpen.value = false;
    }
  },
  { immediate: true }
);

const filteredIngredients = computed(() => {
  const s = (search.value || "").toLowerCase();
  return props.allIngredients.filter((ing) => {
    // Exclude existing IDs when adding (not when editing)
    if (!props.editing && props.existingIds.includes(ing.id)) return false;
    const en = (ing.name || "").toLowerCase();
    const kh = (ing.name_kh || "").toLowerCase();
    return !s || en.includes(s) || kh.includes(s);
  });
});

const quantityPlaceholder = computed(() => {
  if (!selectedIngredient.value) return t("ingredientModal.labels.quantity");
  const u = selectedIngredient.value.unit || t("ingredientModal.unitGeneric");
  return `${t("ingredientModal.labels.quantity")} (${u})`;
});

function selectIngredient(ing) {
  selectedIngredient.value = ing;
  dropdownOpen.value = false;
  search.value = localizedIngredientName(ing);
  nextTick(() => {
    // Focus quantity input by placeholder start
    const qtyInput = document.querySelector(
      'input[placeholder^="' + t("ingredientModal.labels.quantity") + '"]'
    );
    if (qtyInput) qtyInput.focus();
  });
}

function focusNext() {
  if (!dropdownOpen.value) dropdownOpen.value = true;
  if (activeIndex.value < filteredIngredients.value.length - 1)
    activeIndex.value++;
}
function focusPrev() {
  if (!dropdownOpen.value) dropdownOpen.value = true;
  if (activeIndex.value > 0) activeIndex.value--;
}
function selectActive() {
  if (
    dropdownOpen.value &&
    activeIndex.value >= 0 &&
    filteredIngredients.value[activeIndex.value]
  ) {
    selectIngredient(filteredIngredients.value[activeIndex.value]);
    activeIndex.value = -1;
  }
}

async function handleSubmit() {
  if (!selectedIngredient.value) {
    toast.warning(t("ingredientModal.errors.notSelected"));
    return;
  }
  if (qtyError.value) {
    toast.error(qtyError.value);
    return;
  }
  try {
    if (props.editing) {
      emit("update", {
        ...props.editing,
        // keep same ingredient, only update quantity
        quantity: Number(quantity.value),
      });
    } else {
      emit("add", {
        ingredient_id: selectedIngredient.value.id,
        name: selectedIngredient.value.name,
        name_kh: selectedIngredient.value.name_kh,
        unit: selectedIngredient.value.unit,
        quantity: Number(quantity.value),
      });
    }
    // Reset after submit (keep modal open for multiple adds if desired)
    search.value = "";
    selectedIngredient.value = null;
    quantity.value = "";
    activeIndex.value = -1;
  } catch (error) {
    console.error("Failed to save ingredient:", error);
    toast.error(t("ingredientModal.errors.saveFailed"));
  }
}

// Close dropdown on outside click (only if outside modal inner card)
function handleClickOutside(e) {
  if (!e.target.closest(".max-w-md")) dropdownOpen.value = false;
}
onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped>
/* Khmer-friendly font stack (fallback if global not set) */
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
