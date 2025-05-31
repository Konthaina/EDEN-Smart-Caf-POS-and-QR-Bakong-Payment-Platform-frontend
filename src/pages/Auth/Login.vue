<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-xl rounded-2xl flex w-full max-w-4xl overflow-hidden">
      
      <!-- Left Image -->
      <div class="w-1/2 hidden md:block">
        <img src="/login-image.jpg" alt="POS" class="h-full w-full object-cover" />
      </div>

      <!-- Right Form -->
      <div class="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-6">

        <!-- Logo -->
        <div class="text-center">
          <div class="w-14 h-14 bg-indigo-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
            ☕
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mt-2">{{ $t('login.welcome') }}</h1>
          <p class="text-sm text-gray-500">{{ $t('login.subtitle') }}</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('login.email') }}</label>
            <input
              v-model="email"
              type="email"
              :placeholder="$t('login.email_placeholder')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('login.password') }}</label>
            <input
              v-model="password"
              type="password"
              :placeholder="$t('login.password_placeholder')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {{ $t('login.signin') }}
          </button>
        </form>

        <!-- Links -->
        <div class="flex justify-between text-sm text-gray-600">
          <router-link to="/register" class="hover:text-indigo-600">{{ $t('login.create_account') }}</router-link>
          <router-link to="/forgot-password" class="hover:text-indigo-600">{{ $t('login.forgot_password') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/plugins/axios";

const { locale } = useI18n();
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

    router.push("/dashboard");
  } catch (err) {
    alert("Login failed. Please check your credentials.");
  }
};
</script>
