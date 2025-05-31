<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-xl rounded-2xl flex w-full max-w-4xl overflow-hidden">
      
      <!-- Left Image -->
      <div class="w-1/2 hidden md:block">
        <img src="/login-image.jpg" alt="Reset" class="h-full w-full object-cover" />
      </div>

      <!-- Right Form -->
      <div class="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-6">

        <!-- Logo and Heading -->
        <div class="text-center">
          <div class="w-14 h-14 bg-indigo-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
            ☕
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mt-2">{{ $t('forgot.title') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('forgot.subtitle') }}</p>
        </div>

        <!-- Reset Form -->
        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('forgot.email_label') }}</label>
            <input
              v-model="email"
              type="email"
              :placeholder="$t('forgot.email_placeholder')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
          >
            {{ $t('forgot.send_button') }}
          </button>
        </form>

        <!-- Feedback -->
        <p v-if="successMessage" class="text-green-600 text-center text-sm mt-2">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="text-red-600 text-center text-sm mt-2">
          {{ errorMessage }}
        </p>

        <!-- Back Link -->
        <div class="text-center mt-2 text-sm">
          <router-link to="/login" class="text-indigo-600 hover:underline">
            {{ $t('forgot.back_to_login') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'

const { t } = useI18n()
const email = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const submit = async () => {
  try {
    await axios.post('/forgot-password', { email: email.value })
    successMessage.value = t('forgot.success')
    errorMessage.value = ''
  } catch (err) {
    successMessage.value = ''
    errorMessage.value = err.response?.data?.message || t('forgot.failed')
  }
}
</script>
