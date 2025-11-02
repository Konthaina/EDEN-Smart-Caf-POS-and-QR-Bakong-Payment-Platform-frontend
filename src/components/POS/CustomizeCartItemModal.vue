<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
    @keydown.esc="$emit('close')"
    @click.self="$emit('close')"
  >
    <!-- Card -->
    <div
      class="w-[94vw] max-w-lg md:max-w-xl lg:max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 grid grid-rows-[auto,1fr,auto] max-h-[92vh] overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <h3
          class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
        >
          {{
            mode === "edit"
              ? $t("cart.edit_item") || "Edit Item"
              : $t("cart.customize_add") || "Customize & Add"
          }}
        </h3>
        <button
          class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="$emit('close')"
          aria-label="Close"
          title="Close"
        >
          ✕
        </button>
      </div>

      <!-- Body (scrolls, hidden scrollbar) -->
      <div class="p-5 space-y-6 overflow-y-auto no-scrollbar">
        <!-- Item summary -->
        <div class="flex items-center gap-3">
          <img
            :src="imageUrl"
            class="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
            alt=""
          />
          <div class="min-w-0">
            <div
              class="text-sm font-semibold text-gray-900 dark:text-white truncate"
              :title="item?.name"
            >
              {{ item?.name }}
            </div>
            <div class="text-xs text-gray-500">
              {{ $t("cart.code") }}: {{ item?.id }}
            </div>
          </div>

          <!-- Price & subtotal on one line -->
          <div class="ml-auto text-right">
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {{ $t("cart.subtotal") || "Subtotal" }}
            </div>
            <div
              class="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap"
            >
              {{ format(unitPrice) }}$ × {{ localQty }} =
              {{ format(subtotal) }}$
            </div>
          </div>

          <div v-if="showMax" class="ml-4 text-xs sm:text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-200">
              {{ $t("cart.max") || "Max" }}:
            </span>
            <span class="font-semibold">{{ maxQty }}</span>
          </div>
        </div>

        <!-- VARIANTS -->
        <!-- Show the selector only if there are variants; the first pill is always "Default" (base) -->
        <div class="space-y-2" v-if="variantOptions.length">
          <div class="text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ $t("cart.variant") || $t("cart.level") || "Variant" }}
          </div>
          <div class="flex flex-wrap gap-2">
            <!-- Base / Default option -->
            <button
              type="button"
              :key="BASE_ID"
              @click="selectedVariantId = BASE_ID"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition"
              :class="
                selectedVariantId === BASE_ID
                  ? 'bg-purple-600 text-white border-transparent'
                  : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              "
              :aria-pressed="selectedVariantId === BASE_ID ? 'true' : 'false'"
              :title="`${$t('cart.default') || 'Default'} • $${format(
                itemUnitPrice
              )}`"
            >
              {{ $t("cart.default") || "Default" }} · ${{
                format(itemUnitPrice)
              }}
            </button>

            <!-- Real variants -->
            <button
              v-for="v in variantOptions"
              :key="v.id"
              type="button"
              @click="selectedVariantId = v.id"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition"
              :class="
                selectedVariantId === v.id
                  ? 'bg-purple-600 text-white border-transparent'
                  : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              "
              :aria-pressed="selectedVariantId === v.id ? 'true' : 'false'"
              :title="`${vLabel(v)} • $${format(variantUnit(v))}`"
            >
              {{ vLabel(v) }} · ${{ format(variantUnit(v)) }}
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
            {{ $t("cart.quantity") || "Quantity" }}
          </label>
          <div class="inline-flex items-center gap-2">
            <button
              type="button"
              class="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              @click="decQty"
              :disabled="localQty <= 1"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              :max="maxOrFallback"
              v-model.number="localQty"
              class="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center"
            />
            <button
              type="button"
              class="w-9 h-9 rounded-full flex items-center justify-center bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              @click="incQty"
              :disabled="localQty >= maxOrFallback"
            >
              ＋
            </button>
          </div>
          <p class="text-xs text-gray-500">
            {{
              mode === "edit"
                ? $t("cart.qty_help_edit") ||
                  "If less than current qty, a new line will be created."
                : $t("cart.qty_help_add") || "Choose how many to add."
            }}
          </p>
        </div>

        <!-- ICE -->
        <div class="space-y-2">
          <div class="text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ $t("cart.ice") || "Ice" }}
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="v in iceOptions"
              :key="v"
              type="button"
              @click="selectedIce = v"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition"
              :class="
                selectedIce === v
                  ? 'bg-purple-600 text-white border-transparent'
                  : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              "
              :aria-pressed="selectedIce === v ? 'true' : 'false'"
            >
              {{ v }}
            </button>
          </div>
        </div>

        <!-- SUGAR -->
        <div class="space-y-2">
          <div class="text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ $t("cart.sugar") || "Sugar" }}
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="v in sugarOptions"
              :key="v"
              type="button"
              @click="selectedSugar = v"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition"
              :class="
                selectedSugar === v
                  ? 'bg-purple-600 text-white border-transparent'
                  : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              "
              :aria-pressed="selectedSugar === v ? 'true' : 'false'"
            >
              {{ v }}
            </button>
          </div>
        </div>

        <!-- Quick Notes (deduped) -->
        <div class="space-y-2" v-if="filteredQuickNotes.length">
          <div class="text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ $t("cart.quick_notes") || "Quick notes" }}
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="note in filteredQuickNotes"
              :key="note"
              type="button"
              @click="toggleNote(note)"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition"
              :class="
                isSelected(note)
                  ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-gray-900'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              "
              :aria-pressed="isSelected(note) ? 'true' : 'false'"
            >
              {{ note }}
            </button>
          </div>
        </div>

        <!-- Note -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
            {{ $t("cart.note") || "Note" }}
          </label>
          <textarea
            v-model.trim="localNote"
            rows="3"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            :placeholder="$t('cart.note_placeholder') || 'Less sugar, no ice…'"
            @change="syncTokensFromText"
          />
          <div class="flex gap-2">
            <button
              type="button"
              class="px-2.5 py-1 rounded-md text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="clearNotes"
            >
              {{ $t("common.clear") || "Clear" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2"
      >
        <button
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          @click="$emit('close')"
        >
          {{ $t("common.cancel") || "Cancel" }}
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700"
          @click="apply"
        >
          {{
            mode === "edit"
              ? $t("common.apply") || "Apply"
              : $t("cart.add_to_cart") || "Add to cart"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  mode: { type: String, default: "add" },
  item: { type: Object, required: true },
  maxQty: { type: Number, default: null },
  initialQty: { type: Number, default: 1 },
  iceOptions: {
    type: Array,
    default: () => ["No ice", "Less ice", "Regular", "Extra ice"],
  },
  sugarOptions: {
    type: Array,
    default: () => ["No sugar", "Less sugar", "Regular", "Extra sweet"],
  },
  levelOptions: { type: Array, default: () => ["Mild", "Regular", "Large"] },
  suggestedNotes: {
    type: Array,
    default: () => [
      "No ice",
      "Less ice",
      "Extra ice",
      "No sugar",
      "Less sugar",
      "Extra sweet",
      "Hot",
      "Iced",
      "To go",
      "Dine in",
      "Extra shot",
      "Oat milk",
      "Almond milk",
    ],
  },
});
const emit = defineEmits(["close", "apply"]);

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const imageUrl = computed(() => {
  const img = props.item?.image;
  if (!img) return "/menu.png";
  if (/^https?:\/\//i.test(img)) return img;
  return `${API_BASE}/storage/${img}`;
});

/* ---------- VARIANTS ---------- */
const BASE_ID = "__base__";

const rawVariants = computed(() =>
  (props.item?.variants || []).filter(
    (v) =>
      !v?.deleted_at &&
      (v?.is_active === true ||
        v?.is_active === 1 ||
        v?.is_active === undefined)
  )
);

const variantOptions = computed(() => {
  const list = [...rawVariants.value];
  list.sort((a, b) => {
    const pa = Number(a.position ?? 0);
    const pb = Number(b.position ?? 0);
    if (pa !== pb) return pa - pb;
    return Number(a.id) - Number(b.id);
  });
  return list;
});

function vLabel(v) {
  // Prefer size code (SKU) if present; fallback to name
  return String(v?.sku || v?.name || "").trim();
}

function variantUnit(v) {
  if (!v) return 0;
  if (v.final_price != null) return Number(v.final_price);
  return Number(v.price || 0);
}

function itemEffectiveUnit(item) {
  if (item?.has_active_discount && item?.final_price != null)
    return Number(item.final_price);
  const base = Number(item?.price || 0);
  if (item?.discount_type && item?.discount_value != null) {
    if (item.discount_type === "percent") {
      return Math.max(
        0,
        +(base - base * (Number(item.discount_value) / 100)).toFixed(2)
      );
    }
    return Math.max(0, +(base - Number(item.discount_value)).toFixed(2));
  }
  return base;
}

// The base (default) unit price for the item
const itemUnitPrice = computed(() => itemEffectiveUnit(props.item));

/** Initial selection:
 * - If the cart line had a specific variant (id or name), preselect it.
 * - Otherwise, select BASE_ID (default/base).
 */
function findInitialVariantId() {
  const byId = props.item?.variant_id;
  if (byId && variantOptions.value.some((v) => v.id === byId)) return byId;

  const variantNameFromLine =
    (props.item?.customizations || []).find(
      (c) => String(c.type || "").toLowerCase() === "variant"
    )?.value || null;

  if (variantNameFromLine) {
    const v = variantOptions.value.find(
      (x) =>
        String(x.name).toLowerCase() ===
        String(variantNameFromLine).toLowerCase()
    );
    if (v) return v.id;
  }

  // Default = base
  return BASE_ID;
}

const selectedVariantId = ref(findInitialVariantId());
watch(
  () => props.item,
  () => (selectedVariantId.value = findInitialVariantId())
);

const selectedVariant = computed(() =>
  selectedVariantId.value === BASE_ID
    ? null
    : variantOptions.value.find((v) => v.id === selectedVariantId.value) || null
);

const unitPrice = computed(() =>
  selectedVariant.value
    ? variantUnit(selectedVariant.value)
    : itemUnitPrice.value
);

/* Quantity */
const localQty = ref(Math.max(1, props.initialQty));
const maxOrFallback = computed(() => (props.maxQty ? props.maxQty : 9999));
const showMax = computed(
  () => Number.isFinite(props.maxQty) && props.maxQty > 0
);
const incQty = () =>
  (localQty.value = Math.min(localQty.value + 1, maxOrFallback.value));
const decQty = () => (localQty.value = Math.max(localQty.value - 1, 1));
watch(
  () => [props.item, props.initialQty],
  () => {
    localQty.value = Math.max(1, props.initialQty);
  },
  { immediate: true }
);

/* subtotal (live) */
const subtotal = computed(
  () => +(Number(unitPrice.value || 0) * Number(localQty.value || 0)).toFixed(2)
);

/* Existing selections (for edit mode) */
const existing = computed(() =>
  (props.item?.customizations || []).map((c) => ({
    type: String(c.type || "").toLowerCase(),
    value: c.value,
  }))
);
const selectedIce = ref(
  existing.value.find((c) => c.type === "ice")?.value || null
);
const selectedSugar = ref(
  existing.value.find((c) => c.type === "sugar")?.value || null
);
watch(existing, (e) => {
  if (props.mode === "edit") {
    selectedIce.value = e.find((c) => c.type === "ice")?.value || null;
    selectedSugar.value = e.find((c) => c.type === "sugar")?.value || null;
  } else {
    selectedIce.value = null;
    selectedSugar.value = null;
  }
});

/* Quick notes (dedupe) */
const lc = (s) => String(s || "").toLowerCase();
const optionSet = computed(() => {
  const variantNames = variantOptions.value.map((v) => lc(v.name));
  return new Set([
    ...props.iceOptions.map(lc),
    ...props.sugarOptions.map(lc),
    ...props.levelOptions.map(lc),
    ...variantNames,
  ]);
});
const filteredQuickNotes = computed(() =>
  props.suggestedNotes.filter((n) => !optionSet.value.has(lc(n)))
);

/* Notes */
const localNote = ref(props.item?.note || "");
const tokensFromText = (text) =>
  new Set(
    (text || "")
      .split(/[,|·•;]+|\s{2,}/g)
      .map((s) => s.trim())
      .filter(Boolean)
  );
const textFromTokens = (set) => Array.from(set).join(", ");
const selectedNotes = ref(tokensFromText(localNote.value));
const isSelected = (n) => selectedNotes.value.has(n);
const toggleNote = (n) => {
  if (selectedNotes.value.has(n)) selectedNotes.value.delete(n);
  else selectedNotes.value.add(n);
  localNote.value = textFromTokens(selectedNotes.value);
};
const syncTokensFromText = () =>
  (selectedNotes.value = tokensFromText(localNote.value));
const clearNotes = () => {
  selectedNotes.value.clear();
  localNote.value = "";
};

/* Build customizations (do NOT add variant tag for base) */
function buildCustomizations() {
  const others = (props.item?.customizations || []).filter((c) => {
    const t = String(c.type || "").toLowerCase();
    return t !== "ice" && t !== "sugar" && t !== "level" && t !== "variant";
  });
  const out = [...others];
  if (selectedIce.value) out.push({ type: "ice", value: selectedIce.value });
  if (selectedSugar.value)
    out.push({ type: "sugar", value: selectedSugar.value });
  if (selectedVariant.value?.name) {
    out.push({ type: "variant", value: selectedVariant.value.name });
  }
  return out;
}

/* Emit */
function apply() {
  emit("apply", {
    qty: Math.min(Math.max(localQty.value, 1), maxOrFallback.value),
    customizations: buildCustomizations(),
    note: localNote.value.trim(),
    variant: selectedVariant.value || null, // null when base/default is selected
  });
}

/* utils */
const format = (v) => {
  const n = Number(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
