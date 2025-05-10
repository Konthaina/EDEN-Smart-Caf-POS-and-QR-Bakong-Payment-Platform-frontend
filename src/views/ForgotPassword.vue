<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

      <form @submit.prevent="handleForgot">
        <div class="mb-4">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div v-if="message" class="text-green-600 text-sm mb-4">
          {{ message }}
        </div>
        <div v-if="error" class="text-red-600 text-sm mb-4">{{ error }}</div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded"
        >
          Send Reset Token
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "@/plugins/axios";

const email = ref("");
const message = ref(null);
const error = ref(null);

const handleForgot = async () => {
  error.value = null;
  message.value = null;
  try {
    const res = await api.post("/send-reset-token", { email: email.value });
    message.value = res.data.message;
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to send token";
  }
};
</script>
