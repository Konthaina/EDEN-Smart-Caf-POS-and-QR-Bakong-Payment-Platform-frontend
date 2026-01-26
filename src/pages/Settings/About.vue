<template>
  <AppLayout>
    <div class="p-8 max-w-5xl mx-auto space-y-10">
      <!-- Header -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-3">
          <Code2 class="w-9 h-9 text-purple-600" />
          <h1
            class="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
          >
            Meet the Developers
          </h1>
        </div>
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
              <Send class="w-4 h-4" />
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
import { Code2, Send } from "lucide-vue-next";

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
