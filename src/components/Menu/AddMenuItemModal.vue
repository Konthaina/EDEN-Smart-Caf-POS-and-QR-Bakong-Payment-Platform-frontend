<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6 space-y-6 text-gray-800 dark:text-gray-100"
    >
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
          {{ $t("add_menu.addTitle") || "Add Menu Item" }}
        </h2>
        <button @click="close" class="text-gray-400 hover:text-red-500 text-xl">
          ×
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Image -->
        <div>
          <label
            class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
          >
            {{ $t("add_menu.image") }}
          </label>
          <input
            type="file"
            @change="handleFileChange"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 rounded w-full text-gray-800 dark:text-white"
          />
          <div v-if="form.imagePreview" class="mt-2">
            <img
              :src="form.imagePreview"
              class="h-20 rounded object-cover border dark:border-gray-600"
            />
          </div>
        </div>

        <!-- Name -->
        <div>
          <label
            class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
          >
            {{ $t("add_menu.name") }}
          </label>
          <input
            v-model="form.name"
            type="text"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 rounded w-full text-gray-800 dark:text-white"
            required
          />
        </div>

        <!-- Price -->
        <div>
          <label
            class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
          >
            {{ $t("add_menu.price") }} ($)
          </label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            min="0"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 rounded w-full text-gray-800 dark:text-white"
            required
          />
        </div>

        <!-- Category -->
        <div>
          <label
            class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
          >
            {{ $t("add_menu.category") }}
          </label>
          <select
            v-model="form.category_id"
            class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 rounded w-full text-gray-800 dark:text-white"
          >
            <option value="">{{ $t("add_menu.selectCategory") }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Active -->
        <div class="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            v-model="form.is_active"
            class="rounded border-gray-300 dark:border-gray-600"
          />
          <label
            for="is_active"
            class="text-sm text-gray-700 dark:text-gray-300"
          >
            {{ $t("add_menu.isActive") || "Visible (active)" }}
          </label>
        </div>

        <!-- Discount block -->
        <div
          class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3"
        >
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t("add_menu.discount") || "Discount" }}
            </label>
            <select
              v-model="form.discount_type"
              class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 rounded text-gray-800 dark:text-white"
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
              step="0.01"
              min="0"
              class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 rounded w-32 text-gray-800 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-3" v-if="form.discount_type">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Starts</label>
              <input
                v-model="form.discount_starts_at"
                type="datetime-local"
                class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 rounded text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Ends</label>
              <input
                v-model="form.discount_ends_at"
                type="datetime-local"
                class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 rounded text-gray-800 dark:text-white"
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
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            {{ $t("common.save") }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import api from "@/plugins/axios";
import { createToastInterface } from "vue-toastification";

const toast = createToastInterface();

const props = defineProps({
  show: Boolean,
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

watch(
  () => props.show,
  (v) => {
    if (v) resetForm();
  }
);

function resetForm() {
  form.value = {
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
  };
}

function handleFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    form.value.image = file;
    form.value.imagePreview = URL.createObjectURL(file);
  }
}

function close() {
  emit("close");
}

async function submitForm() {
  try {
    const fd = new FormData();
    fd.append("name", form.value.name);
    fd.append("price", String(form.value.price ?? ""));
    if (form.value.category_id)
      fd.append("category_id", String(form.value.category_id));
    fd.append("is_active", form.value.is_active ? "1" : "0");

    if (form.value.discount_type) {
      fd.append("discount_type", form.value.discount_type);
      fd.append("discount_value", String(form.value.discount_value ?? ""));
      if (form.value.discount_starts_at)
        fd.append("discount_starts_at", form.value.discount_starts_at);
      if (form.value.discount_ends_at)
        fd.append("discount_ends_at", form.value.discount_ends_at);
    }

    if (form.value.image instanceof File) {
      fd.append("image", form.value.image);
    }

    await api.post("/menu-items", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Menu item added");
    emit("saved");
    close();
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to add item");
  }
}
</script>
