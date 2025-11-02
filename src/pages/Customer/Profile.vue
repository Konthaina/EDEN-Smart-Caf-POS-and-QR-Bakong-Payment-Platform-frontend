<template>
  <div class="profile-bg min-h-screen flex items-center justify-center py-8 px-2 sm:px-0">
    <button
      @click="goBack"
      class="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 bg-white/80 border border-gray-200 hover:bg-orange-50 rounded-full p-2 shadow-md transition"
      title="Back"
    >
      <ArrowLeft class="w-6 h-6 text-red-500" />
    </button>

    <div class="w-full max-w-md md:max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 relative flex flex-col items-center">
      <span class="mb-3 text-xl font-extrabold tracking-tight text-gray-800">Your Account</span>

      <div class="mt-4 mb-7 flex justify-center w-full">
        <div class="relative">
          <label v-if="editMode" class="cursor-pointer group" title="Change Avatar">
            <img
              :src="avatarPreview || profile.profile?.avatar_url || '/default-avatar.png'"
              class="avatar-img group-hover:ring-3 group-hover:ring-orange-300 transition-all duration-200"
              alt="avatar"
            />
            <input type="file" accept="image/*" @change="onAvatarChange" class="hidden" />
            <span class="avatar-edit-icon">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4l4 4z"></path>
              </svg>
            </span>
          </label>
          <img v-else
            :src="avatarPreview || profile.profile?.avatar_url || '/default-avatar.png'"
            class="avatar-img"
            alt="avatar"
          />
        </div>
      </div>

      <div class="w-full">
        <form
          v-if="editMode"
          @submit.prevent="submitProfile"
          class="bg-gray-50/70 rounded-2xl shadow-inner px-5 py-6 sm:p-7 space-y-5 border border-gray-100"
        >
          <div class="font-bold text-center text-xl text-gray-700 mb-2">Edit Profile Details</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="profile-label" for="edit-name">Name</label>
              <input v-model="editForm.name" id="edit-name" type="text" class="profile-input" placeholder="Your Name" required />
            </div>
            <div>
              <label class="profile-label" for="edit-email">Email</label>
              <input v-model="editForm.email" id="edit-email" type="email" class="profile-input" placeholder="Your Email" required />
            </div>
            <div>
              <label class="profile-label" for="edit-phone">Phone</label>
              <input v-model="editForm.phone" id="edit-phone" type="text" class="profile-input" placeholder="Phone Number" />
            </div>
            <div>
              <label class="profile-label" for="edit-gender">Gender</label>
              <select v-model="editForm.gender" id="edit-gender" class="profile-input">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="profile-label" for="edit-birthdate">Birthdate</label>
              <input v-model="editForm.birthdate" id="edit-birthdate" type="date" class="profile-input" placeholder="Birthdate" />
            </div>
            <div>
              <label class="profile-label" for="edit-address">Address</label>
              <input v-model="editForm.address" id="edit-address" type="text" class="profile-input" placeholder="Your Address" />
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 mt-5">
            <button type="button" @click="cancelEdit" class="profile-btn-cancel">Cancel</button>
            <button type="submit" class="profile-btn-save">Save Changes</button>
          </div>
        </form>

        <div v-else class="flex flex-col items-center w-full">
          <div class="font-bold text-xl text-gray-900 mt-2 break-words text-center">{{ profile.name }}</div>
          <div class="text-gray-500 text-sm mb-6 font-medium">{{ profile.role ? formatRole(profile.role) : 'Customer' }}</div>
          <div class="w-full space-y-3">
            <ProfileField label="Your Email" :value="profile.email" />
            <ProfileField label="Phone Number" :value="profile.profile?.phone" />
            <ProfileField label="Gender" :value="profile.profile?.gender" />
            <ProfileField label="Birthdate" :value="profile.profile?.birthdate ? formatDate(profile.profile.birthdate) : '-'" />
            <ProfileField label="Address" :value="profile.profile?.address" />
            <ProfileField label="Joined" :value="formatDate(profile.created_at)" />
          </div>
          <button class="profile-btn-edit mt-4" @click="showChangePasswordModal = true">Change Password</button>
          <button class="profile-btn-edit" @click="startEditProfile">Edit Profile</button>
          <button @click="showLogoutModal = true" class="logout-profile-btn">Log Out</button>
        </div>
      </div>
    </div>

    <teleport to="body">
        <div v-if="showLogoutModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
        <div class="logout-modal w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 relative">
            <div class="font-bold text-xl mb-3 text-gray-800 text-center">Confirm Logout</div>
            <div class="text-base text-gray-600 mb-7 text-center">Are you sure you want to log out from your account?</div>
            <div class="flex gap-3 justify-center">
            <button @click="showLogoutModal = false" class="logout-btn-cancel">Cancel</button>
            <button @click="logout" class="logout-btn">Logout</button>
            </div>
        </div>
        </div>
    </teleport>

    <teleport to="body">
        <div v-if="showChangePasswordModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
        <div class="logout-modal w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 relative">
            <div class="font-bold text-xl mb-3 text-gray-800 text-center">Change Password</div>
            <form @submit.prevent="submitChangePassword">
            <div class="mb-4">
                <label class="profile-label">Current Password</label>
                <input v-model="changePassForm.current_password" type="password" class="profile-input" required autocomplete="current-password"/>
            </div>
            <div class="mb-4">
                <label class="profile-label">New Password</label>
                <input v-model="changePassForm.new_password" type="password" class="profile-input" required autocomplete="new-password"/>
            </div>
            <div class="mb-4">
                <label class="profile-label">Confirm New Password</label>
                <input v-model="changePassForm.new_password_confirmation" type="password" class="profile-input" required autocomplete="new-password"/>
            </div>
            <div class="flex gap-3 justify-center mt-6">
                <button type="button" @click="showChangePasswordModal = false" class="logout-btn-cancel">Cancel</button>
                <button type="submit" class="logout-btn">Save</button>
            </div>
            </form>
        </div>
        </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'
import ProfileField from '@/components/Customer/ProfileField.vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const profile = ref({})
const editMode = ref(false)
const editForm = ref({ name: '', email: '', phone: '', gender: '', birthdate: '', address: '' })
const avatarFile = ref(null)
const avatarPreview = ref('')

const showLogoutModal = ref(false)
const showChangePasswordModal = ref(false)
const changePassForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const fetchProfile = async () => {
  try {
    const { data } = await axios.get('/profile')
    profile.value = data
    // Set the form data for editing
    editForm.value = {
      name: data.name || '',
      email: data.email || '',
      phone: data.profile?.phone || '',
      gender: data.profile?.gender || '',
      birthdate: data.profile?.birthdate || '',
      address: data.profile?.address || ''
    }
    // Reset avatar previews
    avatarPreview.value = ''
    avatarFile.value = null
  } catch (error) {
    console.error('Error fetching profile:', error);
    toast.error('Failed to load profile. Please try again.');
    // Set a default profile state on failure
    profile.value = { name: 'Guest', email: 'N/A', role: 'Customer' }
    editForm.value = { name: '', email: '', phone: '', gender: '', birthdate: '', address: '' }
  }
}

function goBack() {
  router.back()
}

function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return;

  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = ev => avatarPreview.value = ev.target.result
  reader.readAsDataURL(file)
}

function startEditProfile() {
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
  // Reset form to original profile data
  editForm.value = {
    name: profile.value.name || '',
    email: profile.value.email || '',
    phone: profile.value.profile?.phone || '',
    gender: profile.value.profile?.gender || '',
    birthdate: profile.value.profile?.birthdate || '',
    address: profile.value.profile?.address || ''
  }
  // Reset any selected avatar file
  avatarFile.value = null
  avatarPreview.value = ''
}

async function submitProfile() {
  try {
    // 1. Update text-based profile details in a single request
    const profileUpdateData = {
        name: editForm.value.name,
        email: editForm.value.email,
        phone: editForm.value.phone,
        gender: editForm.value.gender,
        birthdate: editForm.value.birthdate,
        address: editForm.value.address,
    };
    await axios.put('/profile', profileUpdateData);

    // 2. If a new avatar exists, upload it
    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('avatar', avatarFile.value)
      await axios.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }

    // 3. Re-fetch all profile data to ensure UI is in sync with the database
    await fetchProfile()
    toast.success('Profile updated successfully!')
    editMode.value = false

  } catch (e) {
    console.error('Profile update error:', e);
    const errorMessage = e.response?.data?.message || 'Could not update profile. Please try again.';
    toast.error(errorMessage);
  }
}

async function logout() {
  try {
    await axios.post('/logout');
    toast.success('Logged out successfully.');
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout API fails, we clear client-side data
  } finally {
    localStorage.clear();
    router.push('/login');
  }
}

// ----- CHANGE PASSWORD -----
async function submitChangePassword() {
  if (changePassForm.value.new_password !== changePassForm.value.new_password_confirmation) {
    toast.error("New password and confirmation do not match.");
    return
  }

  try {
    // FIX: Use the correct endpoint for changing password for a logged-in user
    await axios.post('/profile/password', {
      current_password: changePassForm.value.current_password,
      new_password: changePassForm.value.new_password,
      new_password_confirmation: changePassForm.value.new_password_confirmation
    })

    toast.success('Password changed successfully!')
    showChangePasswordModal.value = false
    changePassForm.value = { current_password: '', new_password: '', new_password_confirmation: '' }

  } catch (e) {
    console.error('Change password error:', e)
    let errorMessage = 'Could not change password.';
    if (e.response?.data?.message) {
      errorMessage = e.response.data.message
    } else if (e.response?.data?.errors) {
      errorMessage = Object.values(e.response.data.errors).flat().join(' ')
    }
    toast.error(errorMessage);
  }
}

// ----- UTILITY FUNCTIONS -----
function formatDate(dt) {
  if (!dt) return '-'
  const date = new Date(dt)
  if (isNaN(date)) return '-'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatRole(role) {
  if (!role) return 'Customer'
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ')
}

onMounted(fetchProfile)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
body { font-family: 'Inter', sans-serif; }
.profile-bg {
  background: linear-gradient(135deg, #fefbf6 0%, #fff4ed 100%);
  min-height: 100vh;
}
.back-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;
}
.back-btn:hover {
  background: #fff8f0;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.max-w-md { max-width: 28rem; }
.max-w-2xl { max-width: 42rem; }
.bg-white {
  background: #ffffff;
  border-radius: 2rem;
  box-shadow: 0 10px 40px rgba(253, 186, 116, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 2.5rem 2rem;
}
.avatar-img {
  width: 110px;
  height: 110px;
  border-radius: 9999px;
  object-fit: cover;
  border: 4px solid #fbd38d;
  background: #fff;
  transition: all 0.25s ease-in-out;
  box-shadow: 0 4px 15px rgba(255, 184, 114, 0.15);
}
.avatar-edit-icon {
  position: absolute;
  right: -5px;
  bottom: -5px;
  background: #fff7ed;
  border-radius: 9999px;
  border: 2px solid #ffedd5;
  padding: 4px;
  box-shadow: 0 3px 8px rgba(255, 184, 114, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0.98;
  width: 32px;
  height: 32px;
}
.text-orange-500 { color: #f97316; }
.profile-label {
  display: block;
  font-size: 0.8rem;
  color: #78716c;
  margin-bottom: 4px;
  font-weight: 600;
}
.profile-input {
  width: 100%;
  border-radius: 0.8rem;
  border: 1.5px solid #f3f4f6;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  background: #fff;
  margin-bottom: 0.5rem;
  outline: none;
  transition: border 0.2s, background 0.2s, box-shadow 0.2s;
}
.profile-input:focus {
  border: 1.5px solid #fb923c;
  background: #fffdfa;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.1);
}
.profile-btn-edit {
  margin-top: 1rem;
  width: 100%;
  background: linear-gradient(90deg, #fb923c 0%, #fdba74 100%);
  color: #fff;
  font-weight: 700;
  border-radius: 1rem;
  padding: 0.8rem 0;
  font-size: 1.05rem;
  box-shadow: 0 4px 15px rgba(251, 146, 60, 0.2);
  transition: all 0.2s ease-in-out;
}
.profile-btn-edit:hover {
  background: linear-gradient(90deg, #fdba74 0%, #fb923c 100%);
  box-shadow: 0 6px 20px rgba(251, 146, 60, 0.3);
  transform: translateY(-1px);
}
.profile-btn-cancel {
  flex: 1;
  background: #fff;
  color: #fb923c;
  border: 2px solid #fb923c;
  border-radius: 1rem;
  padding: 0.75rem 0;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.2s ease-in-out;
}
.profile-btn-cancel:hover {
  background: #fff7ed;
  border-color: #f97316;
  transform: translateY(-1px);
}
.profile-btn-save {
  flex: 1;
  background: linear-gradient(90deg, #f97316 0%, #fb923c 100%);
  color: #fff;
  border: none;
  border-radius: 1rem;
  padding: 0.75rem 0;
  font-weight: 700;
  font-size: 1.05rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
}
.profile-btn-save:hover {
  background: linear-gradient(90deg, #fb923c 0%, #f97316 100%);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}
.logout-profile-btn {
  margin-top: 1.5rem;
  width: 100%;
  background: #fef2f2;
  color: #ef4444;
  font-weight: 600;
  border-radius: 1rem;
  padding: 0.7rem 0;
  font-size: 1rem;
  border: 1px solid #fecaca;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.08);
  transition: all 0.2s ease-in-out;
}
.logout-profile-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.15);
  transform: translateY(-1px);
}
.logout-modal {
  animation: modalFadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(60px) scale(0.95);}
  to { opacity: 1; transform: none;}
}
.logout-btn {
  background: linear-gradient(90deg, #f97316 0%, #fb923c 100%);
  color: #fff;
  font-weight: 700;
  border-radius: 1.25rem;
  padding: 0.7rem 1.6rem;
  font-size: 1.05rem;
  border: none;
  box-shadow: 0 4px 12px rgba(253, 186, 116, 0.3);
  transition: all 0.2s ease-in-out;
}
.logout-btn:hover {
  background: linear-gradient(90deg, #fb923c 0%, #f97316 100%);
  box-shadow: 0 6px 16px rgba(253, 186, 116, 0.4);
  transform: translateY(-1px);
}
.logout-btn-cancel {
  background: #fff8ed;
  color: #f97316;
  border-radius: 1.25rem;
  padding: 0.7rem 1.5rem;
  font-size: 1.05rem;
  border: 2px solid #fdba74;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
}
.logout-btn-cancel:hover {
  background: #ffedd5;
  color: #e65100;
  border-color: #f97316;
  transform: translateY(-1px);
}
@media (min-width: 640px) {
  .avatar-img {
    width: 130px;
    height: 130px;
  }
  .avatar-edit-icon {
    width: 36px;
    height: 36px;
    right: -8px;
    bottom: -8px;
  }
  .profile-btn-edit, .profile-btn-save, .profile-btn-cancel, .logout-profile-btn {
    font-size: 1.05rem;
    padding: 0.8rem 0;
  }
}
@media (min-width: 768px) {
  .profile-bg {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
}
</style>