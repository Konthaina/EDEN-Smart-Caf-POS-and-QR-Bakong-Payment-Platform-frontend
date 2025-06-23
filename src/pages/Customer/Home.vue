<template>
  <div class="min-h-screen bg-[#FAF7F3] pb-24 relative">

    <!-- Promo Banner -->
    <div class="mx-3 mt-4 mb-4">
      <div class="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-r from-yellow-100 to-orange-200 shadow">
        <div>
          <div class="font-semibold text-base text-orange-800">Welcome to</div>
          <div class="font-bold text-2xl text-brown-800 mb-1">Eden Coffee</div>
          <div class="text-xs text-gray-600">
            All Beverage • <span class="text-orange-600 font-bold">No minimum purchase</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="mx-3 mb-3 flex items-center gap-2">
      <input
        v-model="search"
        type="text"
        class="flex-1 px-4 py-2 rounded-full border border-gray-300 shadow focus:outline-none text-sm"
        placeholder="What would you like to drink today?"
      />
    </div>

    <!-- Category Tabs -->
    <div class="mx-3 flex gap-2 mb-3 overflow-x-auto custom-scrollbar">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCategory = cat"
        class="flex-1 whitespace-nowrap py-2 px-3 rounded-full font-semibold text-xs transition-all duration-150"
        :class="activeCategory === cat ? 'bg-orange-400 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-orange-100'"
      >{{ cat }}</button>
    </div>

    <!-- Product List -->
    <div class="mx-3 mb-24">
      <div
        v-for="item in filteredMenu"
        :key="item.id"
        class="flex items-center gap-4 bg-white mb-4 p-3 rounded-2xl shadow hover:scale-[1.01] transition"
      >
        <img :src="item.imageUrl" alt="" class="w-16 h-16 rounded-xl object-cover" />
        <div class="flex-1">
          <div class="font-bold text-brown-800 text-base">{{ item.name }}</div>
          <div class="text-xs text-gray-500 mb-1 truncate">{{ item.description }}</div>
          <div class="flex items-center gap-2">
            <span class="text-brown-700 font-semibold">{{ formatCurrency(item.price) }}</span>
          </div>
        </div>
      </div>
      <div v-if="filteredMenu.length === 0" class="text-center text-gray-400 py-8">
        No menu found.
      </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <BottomNav
      @openHistory="openHistory"
      @showLogout="showLogout = true"
    />

    <!-- Logout Confirm Modal -->
    <div v-if="showLogout" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-lg w-10/12 max-w-xs p-6 relative">
        <div class="font-semibold text-lg mb-3">Confirm Logout</div>
        <div class="text-sm text-gray-500 mb-4">Are you sure you want to log out?</div>
        <div class="flex gap-3 justify-end">
          <button @click="showLogout = false" class="px-4 py-1 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
          <button @click="logout" class="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600">Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/Customer/BottomNav.vue'

const router = useRouter()
const categories = ref(['All'])
const activeCategory = ref('All')
const search = ref('')
const menu = ref([])
const showLogout = ref(false)

// Generate the correct image url for Laravel
const getImageUrl = (img) => {
  if (!img) return '/img/default-menu.jpg'
  return img.startsWith('http') ? img : `http://127.0.0.1:8000/storage/${img}`
}

const fetchCategories = async () => {
  try {
    const { data } = await axios.get('/categories')
    categories.value = ['All', ...data.map(cat => cat.name)]
  } catch {
    categories.value = ['All']
  }
}

const fetchMenu = async () => {
  try {
    const { data } = await axios.get('/menu-items')
    menu.value = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: getImageUrl(item.image),
      price: item.price,
      category: item.category?.name || 'Other'
    }))
  } catch {
    menu.value = []
  }
}

const filteredMenu = computed(() =>
  menu.value.filter(m =>
    (activeCategory.value === 'All' || m.category === activeCategory.value) &&
    (
      !search.value ||
      (m.name || '').toLowerCase().includes(search.value.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(search.value.toLowerCase())
    )
  )
)

function formatCurrency(amount) {
  return "$ " + (Number(amount) || 0).toLocaleString("km-KH")
}
function openHistory() {
  alert('History feature coming soon!')
}
async function logout() {
  try { await axios.post('/logout') } catch {}
  localStorage.clear()
  router.push('/login')
}

onMounted(async () => {
  await fetchCategories()
  await fetchMenu()
})
</script>

<style>
.text-brown-700 { color: #7B4F27; }
.text-brown-800 { color: #6C3B16; }
.bg-brown-800 { background-color: #6C3B16; }
.input { @apply w-full rounded border px-3 py-2 text-sm mb-1; }
.custom-scrollbar::-webkit-scrollbar { display: none; }
.custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
