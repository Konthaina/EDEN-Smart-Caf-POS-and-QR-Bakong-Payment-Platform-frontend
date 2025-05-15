<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar (hide on /pos) -->
      <header
        v-if="!isPOSPage"
        class="bg-white shadow px-6 py-4 flex justify-between items-center"
      >
        <h1 class="text-xl font-bold text-gray-800">{{ pageTitle }}</h1>
        <button
          @click="handleLogout"
          class="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import Sidebar from './Sidebar.vue';
import api from '@/plugins/axios';

const router = useRouter();
const route = useRoute();

const isPOSPage = computed(() => route.path === '/pos');

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/menu': 'Menu Management',
  '/orders': 'Order History',
  '/inventory': 'Inventory',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/settings': 'Settings',
};

const pageTitle = computed(() => routeTitles[route.path] || 'Eden Cafe');

const handleLogout = async () => {
  await api.post('/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
  router.push('/login');
};
</script>
