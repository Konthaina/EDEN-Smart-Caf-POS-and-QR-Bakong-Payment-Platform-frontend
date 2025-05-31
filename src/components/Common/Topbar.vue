<!-- src/components/Common/Topbar.vue -->
<template>
  <header class="bg-white shadow px-6 py-4 flex justify-between items-center">
    <h1 class="text-xl font-semibold text-gray-800">{{ title }}</h1>
    <button
      @click="handleLogout"
      class="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-1 rounded-full text-sm font-medium transition"
    >
      Logout
    </button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'

const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    default: 'Eden Cafe',
  },
})

const handleLogout = async () => {
  await api.post('/logout')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete api.defaults.headers.common['Authorization']
  router.push('/login')
}
</script>
