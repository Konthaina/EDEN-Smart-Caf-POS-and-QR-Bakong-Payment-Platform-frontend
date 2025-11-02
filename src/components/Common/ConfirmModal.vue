<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div
      class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-100 dark:border-gray-700"
    >
      <h2
        class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"
      >
        ⚠️
        {{ title || ($t && $t("common.confirm_title")) || "Confirm Deletion" }}
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-300">{{ message }}</p>
      <div class="flex justify-end gap-3 pt-2">
        <button
          @click="emit('cancel')"
          class="px-4 py-2 rounded bg-gray-200 text-gray-800 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition"
        >
          {{ ($t && $t("common.cancel")) || "Cancel" }}
        </button>
        <button
          @click="emit('confirm')"
          class="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition font-semibold shadow"
        >
          {{ ($t && $t("common.yes_delete")) || "Yes, Delete" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  message: String,
  title: String, // 👈 Add this line
});
const emit = defineEmits(["confirm", "cancel"]);
</script>
