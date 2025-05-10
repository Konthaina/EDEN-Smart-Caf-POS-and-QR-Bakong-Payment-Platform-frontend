<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Create an Account</h2>

      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label>Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="Your full name"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label>Password</label>
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

        <div v-if="error" class="text-red-600 text-sm mb-4">{{ error }}</div>
        <div v-if="success" class="text-green-600 text-sm mb-4">
          {{ success }}
        </div>

        <button
          type="submit"
          class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Register
        </button>

        <div class="text-sm text-center mt-4">
          Already have an account?
          <router-link to="/login" class="text-blue-600 hover:underline"
            >Login</router-link
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "@/plugins/axios";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref(null);
const success = ref(null);
const router = useRouter();

const handleRegister = async () => {
  error.value = null;
  success.value = null;

  if (password.value !== confirm.value) {
    error.value = "Passwords do not match";
    return;
  }

  try {
    const res = await api.post("/register", {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirm.value,
    });

    localStorage.setItem("token", res.data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

    success.value = "Registration successful! Redirecting...";
    setTimeout(() => router.push("/"), 1500);
  } catch (err) {
    console.error("Registration error:", err);
    error.value = err.response?.data?.message || "Registration failed";
  }
};
</script>
