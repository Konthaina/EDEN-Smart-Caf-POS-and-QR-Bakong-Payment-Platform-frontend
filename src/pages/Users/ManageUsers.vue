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
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ $t('user.manage_users') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">{{ $t('user.subtitle') }}</p>
        </div>
        <button
          @click="openAddModal"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
        >
          <span>{{ $t('action.add_user') }}</span>
        </button>
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        {{ $t('user.total_users') }}: <strong>{{ users.length }}</strong>
      </div>

      <!-- User Table -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-x-auto max-h-[480px] overflow-y-scroll no-scrollbar">
        <table class="min-w-full text-sm text-left">
          <thead class="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs font-semibold z-10">
            <tr>
              <th class="px-6 py-4">{{ $t('form.name') }}</th>
              <th class="px-6 py-4">{{ $t('form.email') }}</th>
              <th class="px-6 py-4">{{ $t('form.role') }}</th>
              <th class="px-6 py-4">{{ $t('action.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <td class="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{{ user.name }}</td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-300">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span
                  :class="[ 'px-3 py-1 text-xs font-semibold rounded-full',
                    user.role?.name === 'Super Admin' ? 'bg-red-100 text-red-600 dark:bg-red-300/20 dark:text-red-400' :
                    user.role?.name === 'Admin' ? 'bg-blue-100 text-blue-600 dark:bg-blue-300/20 dark:text-blue-400' :
                    user.role?.name === 'Cashier' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-300/20 dark:text-yellow-400' :
                    user.role?.name === 'Customer' ? 'bg-green-100 text-green-600 dark:bg-green-300/20 dark:text-green-400' :
                    user.role?.name === 'Table' ? 'bg-gray-100 text-gray-600 dark:bg-gray-300/20 dark:text-gray-300' :
                    'bg-gray-50 text-gray-400 dark:bg-gray-700 dark:text-gray-400'
                  ]"
                >
                  {{ $t(`roles.${user.role?.name?.toLowerCase() || 'unknown'}`) }}
                </span>
              </td>
              <td class="px-6 py-4 space-x-2">
                <button @click="openEditModal(user)" class="bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium transition">
                  {{ $t('action.edit') }}
                </button>
                <button @click="confirmDelete(user)" class="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-600/10 dark:hover:bg-red-600/20 dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium transition">
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
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl w-full max-w-md space-y-5 animate-fadeIn text-gray-800 dark:text-gray-100">
          <h2 class="text-xl font-bold">
            {{ showAddModal ? $t('user.add_title') : $t('user.edit_title') }}
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{{ $t('form.name') }}</label>
              <input v-model="newUser.name" type="text" class="form-input" :placeholder="$t('form.name_placeholder')" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{{ $t('form.email') }}</label>
              <input v-model="newUser.email" type="email" class="form-input" :placeholder="$t('form.email_placeholder')" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{{ $t('form.password') }}</label>
              <input v-model="newUser.password" type="password" class="form-input" :placeholder="$t('form.password_placeholder')" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{{ $t('form.role') }}</label>
              <select v-model="newUser.role" class="form-input">
                <option v-for="role in roles" :key="role" :value="role">{{ $t(`roles.${role.toLowerCase()}`) }}</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button @click="closeModals" class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 text-sm rounded-full text-gray-700 dark:text-gray-200">
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
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-[90%] max-w-sm animate-fadeIn space-y-4 text-gray-800 dark:text-gray-100">
          <h3 class="text-lg font-bold text-center">{{ $t('user.confirm_delete_title') }}</h3>
          <p class="text-sm text-center">
            {{ $t('user.confirm_delete_text') }}
            <span class="font-semibold text-purple-600 dark:text-purple-400">{{ userToDelete?.name }}</span>
          </p>
          <div class="flex justify-center gap-3 pt-2">
            <button @click="cancelDelete" class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-full text-sm text-gray-700 dark:text-gray-200">
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
  @apply w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition;
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
