<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl p-6 relative text-gray-800 dark:text-gray-100"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">
          {{ $t("add_menu.editTitle") || "Edit Menu Item" }}
        </h2>
        <button
          @click="close"
          class="text-gray-400 hover:text-red-500 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-5">
        <!-- Image -->
        <div>
          <label class="block text-sm font-medium mb-1">{{
            $t("add_menu.image")
          }}</label>
          <input
            type="file"
            @change="handleFileChange"
            class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
          />
          <img
            v-if="form.imagePreview"
            :src="form.imagePreview"
            class="h-20 mt-2 rounded object-cover border dark:border-gray-600"
          />
        </div>

        <!-- Name + Price -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">{{
              $t("add_menu.name")
            }}</label>
            <input
              v-model.trim="form.name"
              type="text"
              required
              class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >{{ $t("add_menu.price") }} ($)</label
            >
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required
              class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
            />
          </div>
        </div>

        <!-- Category + Active -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">{{
              $t("add_menu.category")
            }}</label>
            <select
              v-model="form.category_id"
              class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
            >
              <option value="">{{ $t("add_menu.selectCategory") }}</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="flex items-center gap-2 pt-6 sm:pt-0">
            <input
              id="is_active_edit"
              type="checkbox"
              v-model="form.is_active"
              class="rounded border-gray-300 dark:border-gray-600"
            />
            <label for="is_active_edit" class="text-sm">{{
              $t("add_menu.isActive") || "Visible (active)"
            }}</label>
          </div>
        </div>

        <!-- Discount -->
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-3"
        >
          <div class="flex flex-wrap items-center gap-3">
            <label class="text-sm font-medium">{{
              $t("add_menu.discount") || "Discount"
            }}</label>
            <select
              v-model="form.discount_type"
              class="border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
            >
              <option value="">{{ $t("add_menu.none") || "None" }}</option>
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
            <input
              v-if="form.discount_type"
              v-model.number="form.discount_value"
              :placeholder="form.discount_type === 'percent' ? '10' : '1.50'"
              type="number"
              min="0"
              step="0.01"
              class="w-32 border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-3" v-if="form.discount_type">
            <div>
              <label class="block text-xs mb-1">Starts</label>
              <input
                v-model="form.discount_starts_at"
                type="datetime-local"
                class="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
              />
            </div>
            <div>
              <label class="block text-xs mb-1">Ends</label>
              <input
                v-model="form.discount_ends_at"
                type="datetime-local"
                class="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
              />
            </div>
          </div>

          <p
            v-if="form.discount_type === 'percent'"
            class="text-xs text-gray-500"
          >
            Max 100%.
          </p>
          <p
            v-if="form.discount_type === 'fixed'"
            class="text-xs text-gray-500"
          >
            Cannot exceed price.
          </p>

          <!-- NEW: Apply this discount to variants -->
          <div v-if="form.discount_type" class="pt-2 space-y-2">
            <div class="flex items-center gap-2">
              <input
                id="apply_variants_toggle"
                type="checkbox"
                v-model="applyToVariants"
                class="rounded border-gray-300 dark:border-gray-600"
              />
              <label for="apply_variants_toggle" class="text-sm font-medium">
                Apply this discount to selected variants
              </label>
            </div>

            <div
              v-if="applyToVariants"
              class="rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div
                class="flex items-center justify-between px-3 py-2 border-b dark:border-gray-700"
              >
                <div class="text-xs opacity-70">Select variants</div>
                <label
                  class="text-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    @change="toggleSelectAll"
                  />
                  <span>Select all</span>
                </label>
              </div>

              <div class="max-h-44 overflow-auto">
                <div
                  v-for="v in variants"
                  :key="v.id"
                  class="flex items-center gap-2 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    :value="v.id"
                    v-model="selectedVariantIds"
                    class="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span class="truncate">
                    {{ v.name }}
                    <span class="opacity-60">( {{ v.sku || "—" }} )</span>
                  </span>
                  <span class="ml-auto text-xs opacity-70">{{
                    money(v.price)
                  }}</span>
                </div>
              </div>

              <div class="px-3 py-2 text-xs text-gray-500">
                Selected variants will get the same discount (variant-level) and
                will override parent discount.
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row justify-between gap-2 pt-2">
          <div>
            <button
              type="button"
              @click="openVariantManager"
              class="px-4 py-2 text-sm rounded bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {{ $t("menu.manageVariants") || "Manage Variants" }}
            </button>
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {{ $t("common.cancel") }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm rounded bg-purple-600 hover:bg-purple-700 text-white"
            >
              {{ $t("add_menu.saveEdit") || "Save changes" }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Variant Manager overlay as portal -->
    <ManageVariantsModal
      v-if="item"
      :show="showVariantModal"
      :menu-item="item"
      @close="showVariantModal = false"
      @changed="onVariantsChanged"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import api from "@/plugins/axios";
import ManageVariantsModal from "@/components/Menu/ManageVariantsModal.vue";
import { createToastInterface } from "vue-toastification";
import { useMenuStore } from "@/store/menu";

const toast = createToastInterface();
const menu = useMenuStore();

const props = defineProps({
  show: Boolean,
  item: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
});
const emit = defineEmits(["close", "saved"]);

const form = ref({
  name: "",
  price: "",
  category_id: "",
  image: null,
  imagePreview: null,
  is_active: true,
  discount_type: "",
  discount_value: "",
  discount_starts_at: "",
  discount_ends_at: "",
});

const variants = ref([]);
const showVariantModal = ref(false);

// NEW: state for applying item discount to variants
const applyToVariants = ref(false);
const selectedVariantIds = ref([]);
const selectAll = ref(false);

const money = (n) => `${Number(n ?? 0).toFixed(2)} $`;

watch(
  () => props.item,
  async (val) => {
    if (!val) return;
    form.value.name = val.name ?? "";
    form.value.price = val.price ?? "";
    form.value.category_id = val.category_id ?? "";
    form.value.is_active = !!val.is_active;
    form.value.discount_type = val.discount_type ?? "";
    form.value.discount_value = val.discount_value ?? "";
    form.value.discount_starts_at = toLocalDT(val.discount_starts_at);
    form.value.discount_ends_at = toLocalDT(val.discount_ends_at);
    form.value.image = null;
    form.value.imagePreview = previewFromPath(val.image);

    // load variants list (for the checkbox section)
    if (val?.id) {
      const list = await menu.refreshVariants(val.id);
      variants.value = Array.isArray(list) ? list : [];
      // reset apply selections
      applyToVariants.value = false;
      selectedVariantIds.value = [];
      selectAll.value = false;
    }
  },
  { immediate: true }
);

function toggleSelectAll() {
  if (selectAll.value) {
    selectedVariantIds.value = variants.value.map((v) => v.id);
  } else {
    selectedVariantIds.value = [];
  }
}

function previewFromPath(path) {
  if (!path) return null;
  const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/storage/${path}`;
}
function toLocalDT(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function handleFileChange(e) {
  const f = e.target.files?.[0];
  if (f) {
    form.value.image = f;
    form.value.imagePreview = URL.createObjectURL(f);
  }
}
function close() {
  emit("close");
}

async function submitForm() {
  try {
    // 1) update the menu item itself
    const fd = new FormData();
    fd.append("name", form.value.name);
    fd.append("price", String(form.value.price ?? ""));
    if (form.value.category_id)
      fd.append("category_id", String(form.value.category_id));
    else fd.append("category_id", "");
    fd.append("is_active", form.value.is_active ? "1" : "0");

    fd.append("discount_type", form.value.discount_type || "");
    if (form.value.discount_type) {
      if (
        form.value.discount_value !== "" &&
        form.value.discount_value !== null
      ) {
        fd.append("discount_value", String(form.value.discount_value));
      }
      if (form.value.discount_starts_at)
        fd.append("discount_starts_at", form.value.discount_starts_at);
      if (form.value.discount_ends_at)
        fd.append("discount_ends_at", form.value.discount_ends_at);
    } else {
      fd.append("discount_value", "");
      fd.append("discount_starts_at", "");
      fd.append("discount_ends_at", "");
    }

    if (form.value.image instanceof File) fd.append("image", form.value.image);

    fd.append("_method", "PUT");
    await api.post(`/menu-items/${props.item.id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 2) optionally apply same discount to selected variants
    if (
      form.value.discount_type &&
      applyToVariants.value &&
      selectedVariantIds.value.length
    ) {
      const payload = {
        discount_type: form.value.discount_type,
        discount_value: form.value.discount_value,
        discount_starts_at: form.value.discount_starts_at || null,
        discount_ends_at: form.value.discount_ends_at || null,
      };
      // use the shallow variant update route
      await Promise.all(
        selectedVariantIds.value.map((id) =>
          api.patch(`/variants/${id}`, payload)
        )
      );
    }

    toast.success("Menu item updated");
    emit("saved", { id: props.item.id, name: form.value.name });

    // refresh variants (in case we changed them)
    await onVariantsChanged();
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to update item");
  }
}

function openVariantManager() {
  if (!props.item?.id) return;
  showVariantModal.value = true;
}

async function onVariantsChanged() {
  if (props.item?.id) {
    const list = await menu.refreshVariants(props.item.id);
    variants.value = Array.isArray(list) ? list : [];
  }
}
</script>
