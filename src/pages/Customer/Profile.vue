<template>
  <div class="flex flex-col items-center justify-center bg-gray-50 min-h-screen relative">

    <!-- Back Home Icon Button -->
    <button
      @click="goBack"
      class="absolute top-4 left-4 z-10 transition hover:bg-orange-100"
      title="Back"
    >
      <ArrowLeft class="w-6 h-6" stroke="#ef4444" />
    </button>

    <!-- Account Title -->
    <div class="mt-4">
      <span class="text-lg font-bold text-gray-700">Account</span>
    </div>

    <div class="w-full max-w-xl bg-white overflow-hidden mt-4">

      <!-- Avatar -->
      <div class="flex justify-center mt-10">
        <div class="relative">
          <label v-if="editMode" class="cursor-pointer" title="Change Avatar">
            <img :src="avatarPreview || profile.profile?.avatar_url || '/default-avatar.png'" class="w-24 h-24 rounded-full object-cover border-2 border-gray-200 bg-white" alt="avatar" />
            <input type="file" accept="image/*" @change="onAvatarChange" class="hidden" />
          </label>
          <img v-else :src="avatarPreview || profile.profile?.avatar_url || '/default-avatar.png'" class="w-24 h-24 rounded-full object-cover border-2 border-gray-200 bg-white" alt="avatar" />
        </div>
      </div>

      <!-- Card Body -->
      <div class="pt-8 pb-8 px-6">
        <!-- Edit Profile Form -->
        <form
          v-if="editMode"
          @submit.prevent="submitProfile"
          class="max-w-md mx-auto bg-gray-50 rounded-2xl shadow px-5 py-6 space-y-4 border border-gray-200"
        >
          <div class="font-bold text-center text-lg text-gray-700 mb-2">Edit Profile</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1" for="edit-name">Name</label>
              <input v-model="editForm.name" id="edit-name" type="text" class="input-min" placeholder="Name" required />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1" for="edit-email">Email</label>
              <input v-model="editForm.email" id="edit-email" type="email" class="input-min" placeholder="Email" required />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1" for="edit-phone">Phone</label>
              <input v-model="editForm.phone" id="edit-phone" type="text" class="input-min" placeholder="Phone" />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1" for="edit-gender">Gender</label>
              <select v-model="editForm.gender" id="edit-gender" class="input-min">
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1" for="edit-birthdate">Birthdate</label>
              <input v-model="editForm.birthdate" id="edit-birthdate" type="date" class="input-min" placeholder="Birthdate" />
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1" for="edit-address">Address</label>
              <input v-model="editForm.address" id="edit-address" type="text" class="input-min" placeholder="Address" />
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <button type="button" @click="cancelEdit" class="flex-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" class="flex-1 px-3 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">Save</button>
          </div>
        </form>

        <!-- View Profile Fields -->
        <div v-else class="flex flex-col items-center w-full">
          <div class="font-bold text-lg text-gray-800 mt-2">{{ profile.name }}</div>
          <div class="text-gray-400 text-xs mb-6">{{ profile.role ? formatRole(profile.role) : 'Customer' }}</div>
          <ProfileField label="Your Email" :value="profile.email" />
          <ProfileField label="Phone Number" :value="profile.profile?.phone" />
          <ProfileField label="Gender" :value="profile.profile?.gender" />
          <ProfileField label="Birthdate" :value="profile.profile?.birthdate ? formatDate(profile.profile.birthdate) : '-'" />
          <ProfileField label="Address" :value="profile.profile?.address" />
          <ProfileField label="Joined" :value="formatDate(profile.created_at)" />
          <button class="mt-6 w-full px-3 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-600" @click="startEditProfile">Edit Profile</button>
        </div>

        <div v-if="profileSuccess" class="text-green-600 text-xs mt-2 text-center">{{ profileSuccess }}</div>
        <div v-if="profileError" class="text-red-600 text-xs mt-2 text-center">{{ profileError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'
import ProfileField from '@/components/Customer/ProfileField.vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const profile = ref({})
const editMode = ref(false)
const editForm = ref({ name: '', email: '', phone: '', gender: '', birthdate: '', address: '' })
const profileSuccess = ref('')
const profileError = ref('')
const avatarFile = ref(null)
const avatarPreview = ref('')

const fetchProfile = async () => {
  try {
    const { data } = await axios.get('/profile')
    profile.value = data
    editForm.value = {
      name: data.name || '',
      email: data.email || '',
      phone: data.profile?.phone || '',
      gender: data.profile?.gender || '',
      birthdate: data.profile?.birthdate || '',
      address: data.profile?.address || ''
    }
    avatarPreview.value = ''
    avatarFile.value = null
  } catch {
    profile.value = { name: '-', email: '-', role: '-' }
    editForm.value = { name: '', email: '', phone: '', gender: '', birthdate: '', address: '' }
  }
}

function goBack() {
  router.back()
}

function onAvatarChange(e) {
  const file = e.target.files[0]
  avatarFile.value = file
  if (file) {
    const reader = new FileReader()
    reader.onload = ev => avatarPreview.value = ev.target.result
    reader.readAsDataURL(file)
  } else {
    avatarPreview.value = ''
  }
}

function startEditProfile() {
  editMode.value = true
  profileSuccess.value = ''
  profileError.value = ''
}

function cancelEdit() {
  editMode.value = false
  editForm.value = {
    name: profile.value.name || '',
    email: profile.value.email || '',
    phone: profile.value.profile?.phone || '',
    gender: profile.value.profile?.gender || '',
    birthdate: profile.value.profile?.birthdate || '',
    address: profile.value.profile?.address || ''
  }
  avatarFile.value = null
  avatarPreview.value = ''
}

async function submitProfile() {
  profileSuccess.value = ''
  profileError.value = ''
  try {
    await axios.put('/profile', { ...editForm.value })
    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('avatar', avatarFile.value)
      await axios.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    await fetchProfile()
    profileSuccess.value = 'Profile updated!'
    editMode.value = false
    avatarFile.value = null
    avatarPreview.value = ''
  } catch (e) {
    profileError.value = e.response?.data?.message || 'Could not update profile'
  }
}

function formatDate(dt) {
  if (!dt) return '-'
  const date = new Date(dt)
  if (isNaN(date)) return '-'
  return date.toLocaleDateString()
}
function formatRole(role) {
  if (!role) return '-'
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

onMounted(fetchProfile)
</script>

<style>
.input-min {
  @apply w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-gray-50 mb-1 focus:ring-2 focus:ring-orange-200 focus:outline-none;
}
</style>
