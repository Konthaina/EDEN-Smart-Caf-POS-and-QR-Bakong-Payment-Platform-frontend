<script setup>
import AppLayout from '@/components/Common/AppLayout.vue'
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'
import { createToastInterface } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toast = createToastInterface()

const users = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedUser = ref(null)
const showDeleteConfirm = ref(false)
const userToDelete = ref(null)

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'Customer',
})

const roles = ['Super Admin', 'Admin', 'Cashier', 'Customer', 'Table']
const roleMap = {
  'Super Admin': 1,
  'Admin': 2,
  'Cashier': 3,
  'Customer': 4,
  'Table': 5,
}

const fetchUsers = async () => {
  const res = await api.get('/users')
  users.value = res.data
}

const openAddModal = () => {
  newUser.value = { name: '', email: '', password: '', role: 'Customer' }
  showAddModal.value = true
}

const openEditModal = (user) => {
  selectedUser.value = user
  newUser.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role?.name || 'Customer'
  }
  showEditModal.value = true
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedUser.value = null
}

const addUser = async () => {
  try {
    const payload = {
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      role_id: roleMap[newUser.value.role],
    }

    await api.post('/users', payload)
    toast.success(t('user.created'))
    await fetchUsers()
    closeModals()
  } catch (err) {
    toast.error(err.response?.data?.message || t('user.add_failed'))
    console.error(err)
  }
}

const updateUser = async () => {
  try {
    const payload = {
      name: newUser.value.name,
      email: newUser.value.email,
      role_id: roleMap[newUser.value.role],
    }
    if (newUser.value.password) {
      payload.password = newUser.value.password
    }

    await api.put(`/users/${selectedUser.value.id}`, payload)
    toast.success(t('user.updated'))
    await fetchUsers()
    closeModals()
  } catch (err) {
    toast.error(err.response?.data?.message || t('user.update_failed'))
    console.error(err)
  }
}

const confirmDelete = (user) => {
  userToDelete.value = user
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  userToDelete.value = null
}

const performDelete = async () => {
  try {
    await api.delete(`/users/${userToDelete.value.id}`)
    toast.success(t('user.deleted'))
    await fetchUsers()
    cancelDelete()
  } catch (err) {
    toast.error(t('user.delete_failed'))
    console.error(err)
  }
}

onMounted(fetchUsers)
</script>

<template>
  <AppLayout>
    <template #header>
      <h1 class="text-2xl font-bold text-gray-800">{{ $t('user.manage_users') }}</h1>
    </template>

    <div class="p-6 space-y-6">
      <!-- Table Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">{{ $t('user.user_management') }}</h2>
        <button
          @click="openAddModal"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-full font-semibold shadow transition-all duration-200 flex items-center gap-2"
        >
          ➕ {{ $t('action.add_user') }}
        </button>
      </div>

      <!-- User Table -->
      <div class="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[500px] overflow-y-scroll no-scrollbar">
        <table class="min-w-full text-sm text-left">
          <thead class="sticky top-0 bg-gray-100 text-gray-600 uppercase text-xs font-semibold z-10">
            <tr>
              <th class="px-6 py-4">{{ $t('form.name') }}</th>
              <th class="px-6 py-4">{{ $t('form.email') }}</th>
              <th class="px-6 py-4">{{ $t('form.role') }}</th>
              <th class="px-6 py-4">{{ $t('action.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50 transition">
              <td class="px-6 py-4 font-medium text-gray-800">{{ user.name }}</td>
              <td class="px-6 py-4 text-gray-600">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-3 py-1 text-xs font-semibold rounded-full',
                    user.role?.name === 'Super Admin' ? 'bg-red-100 text-red-600' :
                    user.role?.name === 'Admin' ? 'bg-blue-100 text-blue-600' :
                    user.role?.name === 'Cashier' ? 'bg-yellow-100 text-yellow-600' :
                    user.role?.name === 'Customer' ? 'bg-green-100 text-green-600' :
                    user.role?.name === 'Table' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                  ]"
                >
                  {{ $t(`roles.${user.role?.name?.toLowerCase() || 'unknown'}`) }}
                </span>
              </td>
              <td class="px-6 py-4 space-x-2">
                <button @click="openEditModal(user)" class="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-full text-xs font-medium transition">
                  {{ $t('action.edit') }}
                </button>
                <button @click="confirmDelete(user)" class="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full text-xs font-medium transition">
                  {{ $t('action.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <teleport to="body">
      <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md space-y-5 animate-fadeIn">
          <h2 class="text-xl font-bold text-gray-800">
            {{ showAddModal ? $t('user.add_title') : $t('user.edit_title') }}
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ $t('form.name') }}</label>
              <input v-model="newUser.name" type="text" class="form-input" :placeholder="$t('form.name_placeholder')" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ $t('form.email') }}</label>
              <input v-model="newUser.email" type="email" class="form-input" :placeholder="$t('form.email_placeholder')" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ $t('form.password') }}</label>
              <input v-model="newUser.password" type="password" class="form-input" :placeholder="$t('form.password_placeholder')" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">{{ $t('form.role') }}</label>
              <select v-model="newUser.role" class="form-input">
                <option v-for="role in roles" :key="role" :value="role">{{ $t(`roles.${role.toLowerCase()}`) }}</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button @click="closeModals" class="bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm rounded-full text-gray-700">
              {{ $t('action.cancel') }}
            </button>
            <button @click="showAddModal ? addUser() : updateUser()" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm text-white rounded-full shadow">
              {{ showAddModal ? $t('action.create') : $t('action.update') }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-sm animate-fadeIn space-y-4">
          <h3 class="text-lg font-bold text-gray-800 text-center">{{ $t('user.confirm_delete_title') }}</h3>
          <p class="text-sm text-gray-600 text-center">
            {{ $t('user.confirm_delete_text') }}
            <span class="font-semibold text-purple-600">{{ userToDelete?.name }}</span>
          </p>
          <div class="flex justify-center gap-3 pt-2">
            <button @click="cancelDelete" class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm text-gray-700">
              {{ $t('action.cancel') }}
            </button>
            <button @click="performDelete" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm shadow">
              {{ $t('action.confirm_delete') }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </AppLayout>
</template>

<style scoped>
.form-input {
  @apply w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition;
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
