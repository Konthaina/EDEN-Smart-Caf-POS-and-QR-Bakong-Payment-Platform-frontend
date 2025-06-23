<template>
  <div
    class="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden print:block"
  >
    <!-- Sidebar (hidden on print) -->
    <div class="print:hidden">
      <Sidebar />
    </div>

    <!-- Main Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6 text-gray-800 dark:text-white">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import Sidebar from "./Sidebar.vue";

const darkMode = ref(localStorage.getItem("theme") === "dark");

const applyDarkMode = () => {
  document.documentElement.classList.toggle("dark", darkMode.value);
  localStorage.setItem("theme", darkMode.value ? "dark" : "light");
};

watch(darkMode, applyDarkMode);
onMounted(applyDarkMode);
</script>
