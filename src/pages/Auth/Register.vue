<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-xl rounded-2xl flex w-full max-w-4xl overflow-hidden">
      
      <!-- Left Image -->
      <div class="w-1/2 hidden md:block">
        <img src="/login-image.jpg" alt="Cafe" class="h-full w-full object-cover" />
      </div>

      <!-- Right Register Form -->
      <div class="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-6">

        <!-- Logo & Heading -->
        <div class="text-center">
          <div class="w-14 h-14 bg-indigo-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
            ☕
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mt-2">{{ $t('register.title') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('register.subtitle') }}</p>
        </div>

        <!-- Register Form -->
        <form @submit.prevent="register" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('register.name') }}</label>
            <input
              v-model="form.name"
              type="text"
              :placeholder="$t('register.name_placeholder')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('register.email') }}</label>
            <input
              v-model="form.email"
              type="email"
              :placeholder="$t('register.email_placeholder')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('register.password') }}</label>
            <input
              v-model="form.password"
              type="password"
              :placeholder="$t('register.password_placeholder')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('register.confirm_password') }}</label>
            <input
              v-model="form.password_confirmation"
              type="password"
              :placeholder="$t('register.confirm_password_placeholder')"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
          >
            {{ $t('register.register_button') }}
          </button>
        </form>

        <!-- Error Message -->
        <p v-if="errorMessage" class="text-red-600 text-center text-sm mt-2">
          {{ errorMessage }}
        </p>

        <!-- Login Link -->
        <div class="text-center mt-2">
          <router-link to="/login" class="text-sm text-indigo-600 hover:underline">
            {{ $t('register.already_have_account') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/plugins/axios'

const { t } = useI18n()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errorMessage = ref('')

const register = async () => {
  try {
    const response = await api.post('/register', form.value)

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = err.response?.data?.message || t('register.failed')
  }
}
</script>
