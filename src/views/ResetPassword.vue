<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Reset Password</h2>

      <form @submit.prevent="handleReset">
        <div class="mb-4">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label>Reset Token</label>
          <input
            v-model="token"
            type="text"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label>New Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label>Confirm Password</label>
          <input
            v-model="confirm"
            type="password"
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
          class="w-full bg-green-600 text-white py-2 rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "@/plugins/axios";
import { useRouter } from "vue-router";

const email = ref("");
const token = ref("");
const password = ref("");
const confirm = ref("");
const error = ref(null);
const message = ref(null);
const router = useRouter();

const handleReset = async () => {
  error.value = null;
  message.value = null;

  if (password.value !== confirm.value) {
    error.value = "Passwords do not match";
    return;
  }

  try {
    const res = await api.post("/reset-password", {
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: confirm.value,
    });

    message.value = res.data.message;
    setTimeout(() => router.push("/login"), 2000);
  } catch (err) {
    error.value = err.response?.data?.message || "Reset failed";
  }
};
</script>
