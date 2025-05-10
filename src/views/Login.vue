<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full border px-3 py-2 rounded"
            @input="error = null"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full border px-3 py-2 rounded"
            @input="error = null"
            required
          />
        </div>

        <div v-if="error" class="text-sm text-red-600 mb-4">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <div class="text-sm text-center mt-4 space-y-2">
        <p>
          <router-link
            to="/forgot-password"
            class="text-blue-600 hover:underline"
          >
            Forgot Password?
          </router-link>
        </p>
        <p>
          Don't have an account?
          <router-link to="/register" class="text-blue-600 hover:underline">
            Register
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/plugins/axios";

const email = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  error.value = null;
  loading.value = true;

  try {
    const res = await api.post("/login", {
      email: email.value,
      password: password.value,
    });

    const token = res.data.token;
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    router.push("/");
  } catch (err) {
    console.error("Login error:", err.response);
    error.value = err.response?.data?.message || "Login failed";
  } finally {
    loading.value = false;
  }
};
</script>
