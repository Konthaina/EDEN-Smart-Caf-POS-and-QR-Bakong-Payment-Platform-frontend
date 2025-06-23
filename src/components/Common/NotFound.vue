<!-- src/pages/NotFound.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-[#FAF7F3]">
    <img src="/404-coffee.png" alt="404" class="h-20 mb-6" />
    <p class="text-orange-600 text-lg mb-4">Oops! Page not found</p>
    <router-link
      to="/"
      class="px-4 py-2 bg-[#f59e42] text-white rounded-full hover:bg-orange-600 transition font-bold shadow"
    >
      Go Home
    </router-link>
  </div>
</template>
