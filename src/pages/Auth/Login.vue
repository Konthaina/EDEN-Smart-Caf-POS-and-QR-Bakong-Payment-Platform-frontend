<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-md rounded-lg flex w-[900px] overflow-hidden">
      <!-- Left Image -->
      <div class="w-1/2 hidden md:block">
        <img
          src="/login-image.jpg"
          alt="POS"
          class="h-full w-full object-cover"
        />
      </div>

      <!-- Right Form -->
      <div class="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div class="text-center mb-6">
          <div
            class="w-12 h-12 bg-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-2xl font-bold"
          >
            ☕
          </div>
          <h1 class="text-2xl font-bold text-gray-700">Welcome to Eden</h1>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="w-full mt-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Password</label
            >
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full mt-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-full transition duration-200 font-semibold"
          >
            Login
          </button>
        </form>

        <div class="flex justify-between mt-4 text-sm">
          <router-link to="/register" class="text-indigo-500 hover:underline"
            >Create Account</router-link
          >
          <router-link
            to="/forgot-password"
            class="text-gray-500 hover:underline"
            >Forgot Password?</router-link
          >
        </div>
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
const router = useRouter();

const handleLogin = async () => {
  try {
    const res = await api.post("/login", {
      email: email.value,
      password: password.value,
    });

    const token = res.data.token;
    const user = res.data.user;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Redirect based on role (optional)
    router.push("/dashboard");
  } catch (err) {
    alert("Login failed. Please check your credentials.");
  }
};
</script>
