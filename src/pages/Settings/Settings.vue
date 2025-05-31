<template>
  <AppLayout>
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
          {{ $t('profile.title') }}
        </h2>
        <div class="flex gap-3 items-center">
          <!-- 🌐 Single Language Toggle Button -->
          <button
            @click="toggleLanguage"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-inner transition-all text-sm font-semibold
                  bg-white text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <img
              :src="locale === 'en' ? '/flags/en.png' : '/flags/kh.png'"
              class="w-5 h-5 rounded-full shadow"
            />
            {{ locale === 'en' ? 'EN' : 'ខ្មែរ' }}
          </button>

          <!-- 🌙 Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="w-14 h-8 rounded-full relative bg-gray-200 dark:bg-gray-600 transition-colors duration-300"
          >
            <!-- Sliding ball -->
            <span
              class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 z-10"
              :class="darkMode ? 'translate-x-6' : 'translate-x-0'"
            ></span>
            <!-- ☀️ Sun icon (light mode) -->
            <Sun
              v-if="!darkMode"
              class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 z-20"
            />
            <!-- 🌙 Moon icon (dark mode) -->
            <Moon
              v-if="darkMode"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-300 z-20"
            />
          </button>

        </div>
      </div>

      <!-- Skeleton Loader -->
      <div v-if="loading" class="animate-pulse bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="flex flex-col items-center justify-center text-center space-y-4 md:pr-6">
          <div class="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div class="w-2/3 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div class="w-1/2 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="i in 6" :key="i" class="space-y-1">
              <div class="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Info -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        <!-- Profile Summary -->
        <div class="flex flex-col items-center justify-center text-center space-y-4 border-r border-gray-200 dark:border-gray-700 md:pr-6">
          <img
            :src="preview || profile.avatar_url || defaultAvatar"
            class="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover ring ring-purple-300 dark:ring-purple-500"
          />
          <div class="space-y-1">
            <p class="text-xl font-semibold text-gray-800 dark:text-white">{{ profile.name }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-300">{{ profile.email }}</p>
            <p class="text-sm pt-2">
              <span class="text-xs font-medium text-white bg-purple-600 px-3 py-1 rounded-full capitalize">
                {{ profile.role }}
              </span>
            </p>
          </div>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
          <button @click="$refs.fileInput.click()" class="btn-secondary text-sm">{{ $t('profile.change_avatar') }}</button>
        </div>

        <!-- Profile Fields -->
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label">{{ $t('profile.name') }}</label>
              <input v-model="form.name" type="text" class="input" disabled />
            </div>
            <div>
              <label class="label">{{ $t('profile.phone') }}</label>
              <input v-model="form.phone" type="text" class="input" disabled />
            </div>
            <div>
              <label class="label">{{ $t('profile.gender') }}</label>
              <input :value="$t(`profile.${form.gender || 'unknown'}`)" type="text" class="input" disabled />
            </div>
            <div>
              <label class="label">{{ $t('profile.birthdate') }}</label>
              <input v-model="form.birthdate" type="date" class="input" disabled />
            </div>
            <div class="col-span-2">
              <label class="label">{{ $t('profile.address') }}</label>
              <textarea v-model="form.address" rows="3" class="input resize-none w-full" disabled></textarea>
            </div>
            <div class="col-span-2">
              <label class="label">{{ $t('profile.email') }}</label>
              <input v-model="form.email" type="email" class="input" disabled />
            </div>
          </div>
          <button @click="showEditModal = true" class="btn-primary text-sm">{{ $t('profile.edit_profile') }}</button>
        </div>
      </div>

      <!-- Edit Modal -->
      <teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl space-y-4 relative">
          <h2 class="text-xl font-semibold text-purple-700 dark:text-purple-300">{{ $t('profile.edit_profile') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label">{{ $t('profile.name') }}</label>
              <input v-model="form.name" type="text" class="input" />
            </div>
            <div>
              <label class="label">{{ $t('profile.phone') }}</label>
              <input v-model="form.phone" type="text" class="input" />
            </div>
            <div>
              <label class="label">{{ $t('profile.gender') }}</label>
              <select v-model="form.gender" class="input">
                <option value="">{{ $t('profile.select') }}</option>
                <option value="male">{{ $t('profile.male') }}</option>
                <option value="female">{{ $t('profile.female') }}</option>
                <option value="other">{{ $t('profile.other') }}</option>
              </select>
            </div>
            <div>
              <label class="label">{{ $t('profile.birthdate') }}</label>
              <input v-model="form.birthdate" type="date" class="input" />
            </div>
            <div class="col-span-2">
              <label class="label">{{ $t('profile.address') }}</label>
              <textarea v-model="form.address" rows="3" class="input resize-none w-full"></textarea>
            </div>
            <div class="col-span-2">
              <label class="label">{{ $t('profile.email') }}</label>
              <input v-model="form.email" type="email" class="input" />
            </div>
          </div>
          <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button @click="showPasswordModal = true" class="text-sm text-red-600 hover:underline">
              🔒 {{ $t('profile.change_password') }}
            </button>
            <div class="flex gap-3">
              <button @click="cancelEdit(); showEditModal = false" class="btn-secondary">
                {{ $t('common.cancel') }}
              </button>
              <button @click="submitForm(); showEditModal = false" class="btn-primary">
                {{ $t('common.save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      </teleport>

      <!-- Change Password Modal -->
      <teleport to="body">
      <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md space-y-4 relative">
          <h2 class="text-xl font-semibold text-purple-700 dark:text-purple-300">{{ $t('profile.change_password') }}</h2>
          <input v-model="passwordForm.current" type="password" :placeholder="$t('profile.current_password')" class="input" />
          <input v-model="passwordForm.new" type="password" :placeholder="$t('profile.new_password')" class="input" />
          <input v-model="passwordForm.confirm" type="password" :placeholder="$t('profile.confirm_password')" class="input" />
          <div class="flex justify-end gap-2 pt-2">
            <button class="btn-secondary" @click="showPasswordModal = false">{{ $t('common.cancel') }}</button>
            <button class="btn-primary" @click="updatePassword">{{ $t('common.update') }}</button>
          </div>
        </div>
      </div>
      </teleport>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import api from '@/plugins/axios'
import AppLayout from '@/components/Common/AppLayout.vue'
import { Sun, Moon } from 'lucide-vue-next'

const { locale } = useI18n()
const toast = useToast()

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
const toggleLanguage = () => {
  const newLang = locale.value === 'en' ? 'km' : 'en'
  changeLanguage(newLang)
}
const langBtnClass = (lang) =>
  [
    'flex items-center gap-2 px-4 py-1.5 rounded-full shadow-inner transition-all border text-sm font-semibold',
    locale.value === lang
      ? 'bg-white text-gray-800 border-gray-300'
      : 'bg-gray-100 text-gray-500 hover:text-gray-800 border-gray-200',
  ]

const darkMode = ref(localStorage.getItem('theme') === 'dark')
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}
const applyDarkMode = () => {
  document.documentElement.classList.toggle('dark', darkMode.value)
  localStorage.setItem('theme', darkMode.value ? 'dark' : 'light')
}
watch(darkMode, applyDarkMode)

const loading = ref(true)
const profile = ref({})
const form = ref({})
const preview = ref(null)
const defaultAvatar = '/images/default-avatar.png'

const showEditModal = ref(false)
const showPasswordModal = ref(false)
const passwordForm = ref({ current: '', new: '', confirm: '' })

const fetchProfile = async () => {
  loading.value = true
  try {
    const userRes = await api.get('/me')
    const profileRes = await api.get('/profile')
    profile.value = {
      name: userRes.data.name,
      email: userRes.data.email,
      role: userRes.data.role?.name || 'User',
      ...profileRes.data.profile,
      avatar_url: profileRes.data.profile?.avatar_url,
    }
    form.value = { ...profile.value }
  } catch (err) {
    toast.error('Failed to load profile')
  } finally {
    loading.value = false
  }
}

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => (preview.value = e.target.result)
  reader.readAsDataURL(file)

  const fd = new FormData()
  fd.append('avatar', file)
  try {
    const res = await api.post('/profile/avatar', fd)
    toast.success('Avatar updated')
    profile.value.avatar_url = res.data.avatar_url
    preview.value = null
  } catch {
    toast.error('Failed to upload avatar')
  }
}

const submitForm = async () => {
  try {
    await api.put('/me', { name: form.value.name, email: form.value.email })
    await api.put('/profile', {
      phone: form.value.phone,
      gender: form.value.gender,
      birthdate: form.value.birthdate,
      address: form.value.address,
    })
    toast.success('Profile updated successfully')
    fetchProfile()
  } catch {
    toast.error('Failed to update profile')
  }
}

const cancelEdit = () => {
  form.value = { ...profile.value }
}

const updatePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    return toast.error("Passwords don't match")
  }
  try {
    await api.post('/profile/password', {
      current_password: passwordForm.value.current,
      new_password: passwordForm.value.new,
      new_password_confirmation: passwordForm.value.confirm,
    })
    toast.success('Password updated')
    showPasswordModal.value = false
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch {
    toast.error('Failed to update password')
  }
}

onMounted(() => {
  applyDarkMode()
  fetchProfile()
})
</script>

<style scoped>
.label {
  @apply text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block;
}
.input {
  @apply border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400;
}
.btn-primary {
  @apply bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition;
}
.btn-secondary {
  @apply bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition;
}
</style>
