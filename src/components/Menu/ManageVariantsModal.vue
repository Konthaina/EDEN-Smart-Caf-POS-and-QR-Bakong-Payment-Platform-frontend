<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[70] flex items-center justify-center bg-black/60"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative text-gray-800 dark:text-gray-100"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-bold">
          Manage Variants — <span class="opacity-80">{{ menuItem?.name }}</span>
        </h2>
        <button
          @click="onClose"
          class="text-gray-400 hover:text-red-500 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <!-- Create / Edit Variant (top) -->
      <div
        class="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-semibold">
            {{ editingId ? "Edit Variant" : "Create Variant" }}
          </div>
          <button
            v-if="editingId"
            class="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700"
            @click="resetForm()"
          >
            + New
          </button>
        </div>

        <form
          @submit.prevent="submit"
          class="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <!-- Size -->
          <div>
            <label class="block text-sm mb-1">Size</label>
            <input
              v-model.trim="form.size"
              type="text"
              placeholder="e.g. Small / Medium / Large"
              class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <p v-if="serverErrors?.size" class="text-xs text-red-500 mt-1">
              {{ serverErrors.size[0] }}
            </p>
          </div>

          <!-- Price -->
          <div>
            <label class="block text-sm mb-1">Price ($)</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <p v-if="serverErrors?.price" class="text-xs text-red-500 mt-1">
              {{ serverErrors.price[0] }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-end">
            <button
              type="submit"
              :disabled="submitting"
              class="w-full md:w-auto px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60"
            >
              <span v-if="submitting">Saving…</span>
              <span v-else>{{
                editingId ? "Save changes" : "Add variant"
              }}</span>
            </button>
          </div>

          <!-- Preview (full width) -->
          <div class="md:col-span-3 text-xs text-gray-500">
            Variant name will be:
            <strong>{{ previewName }}</strong>
          </div>

          <!-- NEW: Variant-level discount fields (full width) -->
          <div class="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label class="block text-sm mb-1">Discount</label>
              <select
                v-model="form.discount_type"
                class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
              >
                <option value="">None</option>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm mb-1">Value</label>
              <input
                :disabled="!form.discount_type"
                v-model.number="form.discount_value"
                :placeholder="form.discount_type === 'percent' ? '10' : '1.50'"
                type="number"
                min="0"
                step="0.01"
                class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50"
              />
              <p
                v-if="form.discount_type === 'percent'"
                class="text-xs text-gray-500 mt-1"
              >
                Max 100%.
              </p>
              <p
                v-if="form.discount_type === 'fixed'"
                class="text-xs text-gray-500 mt-1"
              >
                Cannot exceed price.
              </p>
            </div>
            <div>
              <label class="block text-sm mb-1">Starts</label>
              <input
                :disabled="!form.discount_type"
                v-model="form.discount_starts_at"
                type="datetime-local"
                class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">Ends</label>
              <input
                :disabled="!form.discount_type"
                v-model="form.discount_ends_at"
                type="datetime-local"
                class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div
            v-if="serverMessage"
            class="md:col-span-3 text-xs mt-1"
            :class="serverErrors ? 'text-red-500' : 'text-gray-500'"
          >
            {{ serverMessage }}
          </div>
        </form>
      </div>

      <!-- Table -->
      <div
        class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div
          class="px-4 py-3 text-sm font-semibold border-b dark:border-gray-700 flex items-center justify-between"
        >
          <span
            >Variants
            <span class="opacity-70">({{ variants.length }})</span></span
          >
          <span v-if="loading" class="text-xs text-gray-400">Loading…</span>
        </div>

        <div class="max-h-[55vh] overflow-y-auto no-scrollbar">
          <table class="min-w-full text-sm table-fixed">
            <colgroup>
              <col class="w-[38%]" />
              <col class="w-[12%]" />
              <col class="w-[14%]" />
              <col class="w-[14%]" />
              <col class="w-[22%]" />
            </colgroup>
            <thead
              class="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <tr>
                <th class="px-3 py-2 text-left">Name</th>
                <th class="px-3 py-2 text-left">Size</th>
                <th class="px-3 py-2 text-left">Price</th>
                <th class="px-3 py-2 text-left">Final</th>
                <th class="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-if="!loading && !variants.length">
                <td colspan="5" class="px-3 py-6 text-center text-gray-400">
                  No variants yet
                </td>
              </tr>

              <tr
                v-for="v in variants"
                :key="v.id"
                class="hover:bg-purple-50/40 dark:hover:bg-gray-700/40"
              >
                <td class="px-3 py-2 align-middle">
                  <div class="truncate" :title="v.name">
                    {{ v.name }}
                    <span
                      v-if="variantHasOwnDiscount(v)"
                      class="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200"
                      title="This variant has its own discount"
                      >own discount</span
                    >
                  </div>
                </td>
                <td class="px-3 py-2 align-middle">
                  <div class="truncate" :title="v.sku || '—'">
                    {{ v.sku ?? "—" }}
                  </div>
                </td>
                <td class="px-3 py-2 align-middle whitespace-nowrap">
                  {{ money(v.price) }}
                </td>

                <!-- Final: show ONLY when discount actually changes the price -->
                <td class="px-3 py-2 align-middle whitespace-nowrap">
                  <template v-if="hasDiscount(v)">
                    <span class="line-through opacity-60 mr-1">
                      {{ money(v.price) }}
                    </span>
                    <span class="font-semibold">
                      {{ money(v.final_price) }}
                    </span>
                  </template>
                  <template v-else>—</template>
                </td>

                <td class="px-3 py-2 align-middle">
                  <div class="flex items-center gap-2 whitespace-nowrap">
                    <button
                      class="px-3 py-1 rounded-full bg-purple-100 dark:bg-blue-900 text-purple-700 dark:text-blue-200 text-xs"
                      @click="startEdit(v)"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      class="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs"
                      @click="permanentlyDelete(v)"
                      title="Delete permanently"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useMenuStore } from "@/store/menu";

const props = defineProps({
  show: { type: Boolean, default: false },
  menuItem: { type: Object, required: true },
});
const emit = defineEmits(["close", "changed"]);

const menu = useMenuStore();

const variants = ref([]);
const loading = ref(false);
const submitting = ref(false);
const editingId = ref(null);
const serverErrors = ref(null);
const serverMessage = ref("");

const form = ref({
  size: "",
  price: null,

  // NEW: variant-level discount
  discount_type: "",
  discount_value: null,
  discount_starts_at: "",
  discount_ends_at: "",
});

function money(n) {
  const num = Number(n ?? 0);
  return `${num.toFixed(2)} $`;
}

/** Only show discount UI when final_price exists AND differs from price */
function hasDiscount(v) {
  const p = Number(v?.price);
  const f = Number(v?.final_price);
  if (!Number.isFinite(f)) return false;
  if (!Number.isFinite(p)) return false;
  return f !== p;
}

function variantHasOwnDiscount(v) {
  // If the backend sends these fields, consider "own discount" when either type/value exists
  return !!(v?.discount_type && v?.discount_value != null);
}

const previewName = computed(() => {
  const base = (props.menuItem?.name || "").trim();
  const size = (form.value.size || "").trim();
  return base && size ? `${base} (${size})` : "(name will appear here)";
});

async function fetchVariants() {
  if (!props.menuItem?.id) return;
  loading.value = true;
  try {
    const list = await menu.refreshVariants(props.menuItem.id);
    variants.value = Array.isArray(list) ? list : [];
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  editingId.value = null;
  form.value = {
    size: "",
    price: null,
    discount_type: "",
    discount_value: null,
    discount_starts_at: "",
    discount_ends_at: "",
  };
  serverErrors.value = null;
  serverMessage.value = "";
}

function startEdit(v) {
  editingId.value = v.id;
  form.value = {
    size: v.sku ?? "",
    price: Number(v.price ?? 0),
    discount_type: v.discount_type || "",
    discount_value: v.discount_value != null ? Number(v.discount_value) : null,
    discount_starts_at: toLocalDT(v.discount_starts_at),
    discount_ends_at: toLocalDT(v.discount_ends_at),
  };
  serverErrors.value = null;
  serverMessage.value = "";
}

function validate() {
  const size = (form.value.size || "").trim();
  const price = Number(form.value.price);
  if (!size) return "Size is required.";
  if (!Number.isFinite(price) || price < 0)
    return "Price must be a number ≥ 0.";

  // simple guards to match backend
  const t = form.value.discount_type;
  const dv = form.value.discount_value;
  if (t) {
    if (!Number.isFinite(Number(dv)) || Number(dv) < 0)
      return "Discount value must be ≥ 0.";
    if (t === "percent" && Number(dv) > 100)
      return "Percent cannot exceed 100.";
    if (t === "fixed" && Number(dv) > price)
      return "Fixed discount cannot exceed price.";
  }
  return "";
}

function toLocalDT(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

async function submit() {
  serverErrors.value = null;
  serverMessage.value = "";
  const err = validate();
  if (err) {
    serverErrors.value = { _all: [err] };
    serverMessage.value = err;
    return;
  }

  submitting.value = true;
  try {
    const size = (form.value.size || "").trim();
    const payload = {
      menu_item_id: props.menuItem.id,
      name: `${(props.menuItem.name || "").trim()} (${size})`, // auto-generate
      price: Number(form.value.price),
      sku: size, // map Size -> sku

      // NEW: include variant discount fields if type selected
      discount_type: form.value.discount_type || null,
      discount_value:
        form.value.discount_type && form.value.discount_value !== null
          ? Number(form.value.discount_value)
          : null,
      discount_starts_at: form.value.discount_type
        ? form.value.discount_starts_at || null
        : null,
      discount_ends_at: form.value.discount_type
        ? form.value.discount_ends_at || null
        : null,
    };

    if (!editingId.value) {
      await menu.createVariant(props.menuItem.id, payload);
      serverMessage.value = "Variant created.";
    } else {
      await menu.updateVariant(props.menuItem.id, editingId.value, payload);
      serverMessage.value = "Variant updated.";
    }

    await fetchVariants();
    emit("changed");
    resetForm();
  } catch (e) {
    const data = e?.response?.data;
    if (data?.errors) {
      serverErrors.value = data.errors;
      serverMessage.value = data.message || "Validation failed.";
    } else {
      serverMessage.value = data?.message || "Failed to save variant.";
    }
  } finally {
    submitting.value = false;
  }
}

async function permanentlyDelete(v) {
  if (!confirm(`Permanently delete "${v.name}"? This cannot be undone.`))
    return;
  try {
    await menu.forceDeleteVariant(props.menuItem.id, v.id);
    await fetchVariants();
    emit("changed");
  } catch (e) {
    serverMessage.value =
      e?.response?.data?.message || "Failed to delete variant.";
  }
}

function onClose() {
  resetForm();
  emit("close");
}

watch(
  () => [props.show, props.menuItem?.id],
  async ([s]) => {
    if (s) await fetchVariants();
  },
  { immediate: true }
);
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
