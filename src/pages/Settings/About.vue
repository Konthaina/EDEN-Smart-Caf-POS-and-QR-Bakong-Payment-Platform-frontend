<template>
  <AppLayout>
    <div class="p-8 max-w-5xl mx-auto space-y-10">
      <!-- Header -->
      <div class="text-center">
        <h1
          class="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
        >
          👨‍💻 Meet the Developers
        </h1>
        <p
          class="text-gray-500 dark:text-gray-300 mt-2 max-w-2xl mx-auto text-sm"
        >
          This POS system was developed by a passionate team as part of a
          real-world thesis project focused on optimizing cafe operations.
        </p>
      </div>

      <!-- Developer Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <article
          v-for="dev in developers"
          :key="dev.name"
          class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-4 hover:shadow-lg transition"
        >
          <img
            :src="dev.avatar"
            :alt="`Photo of ${dev.name}`"
            class="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
              {{ dev.name }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {{ dev.role }}
            </p>
            <a
              :href="dev.contact"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 240 240"
                fill="none"
              >
                <circle cx="120" cy="120" r="120" fill="#37AEE2" />
                <path
                  d="M98.2 156.8l-.3.3-.2.2v.1l-8.3 27.2c1.2 0 1.8-.5 2.4-1l19.9-14.6 27.5 20.1c5 2.7 8.6 1.3 9.9-4.6l18-84.7c1.8-7.2-2.7-10.5-7.3-8.6L49 125.4c-7 2.7-7 6.5-1.2 8.2l35.5 11 82.3-51.8c3.9-2.4 7.5-1.1 4.6 1.5l-66.7 60.1z"
                  fill="white"
                />
              </svg>
              Telegram
            </a>
          </div>
        </article>
      </section>

      <!-- version -->
      <div class="text-center">
        <p class="text-gray-500 dark:text-gray-300 text-sm">
          Version 0.1.1 - Smart Café POS
        </p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from "@/components/Common/AppLayout.vue";
import { publicUrl } from "@/config/urls";

const developers = [
  {
    name: "Kon Thaina",
    role: "Frontend Developer & UI/UX Designer",
    avatar: publicUrl("images/thaina.jpg"),
    contact: "https://t.me/konthaina",
  },
  {
    name: "Koy Hokleng",
    role: "Team Leader & Full-stack Developer",
    avatar: publicUrl("images/hokleng.jpg"),
    contact: "https://t.me/Stephen2606",
  },
  {
    name: "Yem Mai",
    role: "Frontend Developer & DB Administrator",
    avatar: publicUrl("images/mai.jpg"),
    contact: "https://t.me/Yem_Mike",
  },
  {
    name: "Sruoy Veasna",
    role: "Backend Developer & API Specialist",
    avatar: publicUrl("images/veasna.jpg"),
    contact: "https://t.me/veasnasruoy",
  },
];
</script>
