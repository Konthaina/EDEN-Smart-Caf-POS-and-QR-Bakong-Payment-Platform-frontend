<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      <button
        @click="handleLogout"
        class="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Loading user info...</div>

    <div v-else-if="user" class="bg-white p-6 rounded shadow max-w-xl">
      <h2 class="text-xl font-semibold mb-2">Welcome, {{ user.name }}</h2>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Role:</strong> {{ user.role?.name || "Customer" }}</p>
    </div>

    <div v-else class="text-red-600">Failed to load user info.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/plugins/axios";

const router = useRouter();
const user = ref(null);
const loading = ref(true);

const fetchUser = async () => {
  try {
    const res = await api.get("/me");
    user.value = res.data;
  } catch (err) {
    console.error("Failed to fetch user:", err);
    localStorage.removeItem("token");
    router.push("/login");
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await api.post("/logout");
  } catch (e) {
    console.warn("Logout failed (maybe already logged out)", e);
  }
  localStorage.removeItem("token");
  delete api.defaults.headers.common["Authorization"];
  router.push("/login");
};

onMounted(fetchUser);
</script>
