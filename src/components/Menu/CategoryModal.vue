<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center khmer-support"
    >
      <div
        :lang="locale"
        class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-full max-w-md text-gray-800 dark:text-gray-100"
      >
        <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          {{ category.id ? $t("category.editTitle") : $t("category.addTitle") }}
        </h2>

        <input
          v-model="form.name"
          type="text"
          :placeholder="$t('category.placeholder')"
          class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg mb-4"
          @keyup.enter="submit"
        />

        <div class="flex justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            @click="submit"
            class="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            {{ $t("common.save") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  show: Boolean,
  category: Object,
});
const emit = defineEmits(["close", "saved"]);

const { locale } = useI18n();

const form = reactive({ name: "" });

watch(
  () => props.category,
  (newVal) => {
    form.name = newVal?.name || "";
  },
  { immediate: true }
);

const submit = () => {
  emit("saved", { ...props.category, ...form });
};
</script>

<style scoped>
/* Smooth theme transitions */
input {
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Local Khmer-friendly font stack (safe even if global fonts already set) */
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
