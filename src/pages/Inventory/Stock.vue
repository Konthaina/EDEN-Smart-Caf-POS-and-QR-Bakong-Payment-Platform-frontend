<template>
  <AppLayout>
    <!-- Low Stock Alert Popup -->
    <transition name="fade">
      <div
        v-if="showLowStockAlert"
        class="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-300 text-red-800 px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-lg"
      >
        <span class="text-xl">⚠️</span>
        <div class="text-sm">
          {{ $t('stock.lowStockAlert') }}: <strong>{{ lowStockItems.map(i => i.ingredient.name).join(', ') }}</strong>
        </div>
        <button @click="showLowStockAlert = false" class="ml-auto text-red-600 hover:text-red-800 text-sm font-bold">✖</button>
      </div>
    </transition>

    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          📦 {{ $t('stock.title') }}
        </h1>
        <button
          @click="openAddForm"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-5 py-2 rounded-full shadow flex items-center gap-2 text-sm transition"
        >
          ➕ {{ $t('stock.add') }}
        </button>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl flex justify-between items-center shadow max-w-xl"
      >
        <span class="text-sm">{{ successMessage }}</span>
        <button @click="successMessage = ''" class="text-green-700 hover:text-red-500 font-bold text-sm">✖</button>
      </div>

      <!-- Stock Summary -->
      <div class="text-sm text-gray-600">
        {{ $t('stock.total') }}: <strong>{{ stocks.length }}</strong>
      </div>

      <!-- Stock Table -->
      <div class="max-h-[490px] overflow-y-auto custom-scroll rounded-xl shadow-lg">
        <table class="min-w-full text-sm bg-white">
          <thead class="bg-purple-50 text-purple-800 text-left font-semibold sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">{{ $t('stock.ingredient') }}</th>
              <th class="px-4 py-3">{{ $t('stock.quantity') }}</th>
              <th class="px-4 py-3">{{ $t('stock.level') }}</th>
              <th class="px-4 py-3">{{ $t('stock.updated') }}</th>
              <th class="px-4 py-3 text-center">{{ $t('stock.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(stock, index) in stocks" :key="stock.id" class="border-t hover:bg-gray-50 transition">
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3 font-medium">{{ stock.ingredient.name }}</td>
              <td class="px-4 py-3">{{ stock.quantity }} {{ stock.ingredient.unit }}</td>
              <td class="px-4 py-3">
                <div class="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-3 rounded-full absolute top-0 left-0 flex items-center justify-center text-[10px] font-medium transition-all duration-500"
                    :style="{ width: getStockLevel(stock) + '%' }"
                    :class="[
                      getStockLevel(stock) < 20
                        ? 'bg-red-500 text-white'
                        : getStockLevel(stock) < 50
                        ? 'bg-yellow-400 text-black'
                        : 'bg-green-500 text-white'
                    ]"
                  >
                    {{ getStockLevel(stock) }}%
                  </div>
                </div>
                <span
                  v-if="getStockLevel(stock) < 20"
                  class="text-[11px] text-red-600 font-medium mt-1 inline-block"
                >
                  ⚠️ {{ $t('stock.low') }}
                </span>
              </td>
              <td class="px-4 py-3">{{ formatDate(stock.updated_at) }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  class="px-4 py-1 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 text-xs"
                  @click="editStock(stock)"
                >
                  {{ $t('stock.update') }}
                </button>
              </td>
            </tr>
            <tr v-if="stocks.length === 0">
              <td colspan="6" class="text-center text-gray-400 py-6">{{ $t('stock.noRecord') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <teleport to="body">
        <div v-if="openModal" class="fixed inset-0 z-[999] flex items-center justify-center">
          <div class="absolute inset-0 bg-black bg-opacity-50 z-[998]"></div>

          <div class="relative z-[999] bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4">
            <h2 class="text-lg font-bold text-gray-800">
              {{ isEditing ? '🖊️ ' + $t('stock.update') : '➕ ' + $t('stock.add') }}
            </h2>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('stock.selectIngredient') }}</label>
                <input
                  v-if="isEditing"
                  v-model="selectedIngredientName"
                  disabled
                  class="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
                <select
                  v-else
                  v-model="form.ingredient_id"
                  class="w-full border rounded px-3 py-2 focus:ring focus:border-purple-500"
                >
                  <option disabled value="">{{ $t('stock.selectPlaceholder') }}</option>
                  <option v-for="ingredient in availableIngredients" :key="ingredient.id" :value="ingredient.id">
                    {{ ingredient.name }} ({{ ingredient.unit }})
                  </option>
                </select>
              </div>

              <div v-if="isEditing">
                <label class="block text-sm font-medium mb-1">{{ $t('stock.currentQty') }}</label>
                <input
                  v-model="form.current_quantity"
                  disabled
                  class="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('stock.addQty') }}</label>
                <input
                  type="number"
                  v-model="form.addQuantity"
                  class="w-full border rounded px-3 py-2"
                  :placeholder="$t('stock.addQtyPlaceholder')"
                />
              </div>
            </div>

            <div class="flex justify-end pt-4 space-x-2">
              <button
                @click="closeModal"
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                @click="updateStock"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm"
              >
                {{ isEditing ? $t('stock.update') : $t('stock.add') }}
              </button>
            </div>
          </div>
        </div>
      </teleport>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Common/AppLayout.vue'
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'


const stocks = ref([])
const ingredients = ref([])
const openModal = ref(false)
const isEditing = ref(false)
const successMessage = ref('')
const showLowStockAlert = ref(false)
const lowStockItems = ref([])

const form = ref({
  ingredient_id: '',
  current_quantity: '',
  addQuantity: ''
})

const selectedIngredientName = computed(() => {
  const match = ingredients.value.find(i => i.id === form.value.ingredient_id)
  return match ? `${match.name} (${match.unit})` : ''
})

const availableIngredients = computed(() => {
  const existingIds = stocks.value.map(s => s.ingredient.id)
  return ingredients.value.filter(i => !existingIds.includes(i.id))
})

const formatDate = (dateTime) => {
  return new Date(dateTime).toLocaleString()
}

const getStockLevel = (stock) => {
  const max = stock.ingredient?.max_quantity || 100
  const qty = parseFloat(stock.quantity)
  return Math.min(100, Math.round((qty / max) * 100))
}

function checkLowStock() {
  lowStockItems.value = stocks.value.filter(stock => getStockLevel(stock) < 20)
  if (lowStockItems.value.length > 0) {
    showLowStockAlert.value = true
    setTimeout(() => {
      showLowStockAlert.value = false
    }, 6000)
  }
}

function closeModal() {
  form.value = { ingredient_id: '', current_quantity: '', addQuantity: '' }
  openModal.value = false
  isEditing.value = false
}

function openAddForm() {
  form.value = { ingredient_id: '', addQuantity: '' }
  isEditing.value = false
  openModal.value = true
}

function editStock(stock) {
  form.value = {
    ingredient_id: stock.ingredient.id,
    current_quantity: stock.quantity,
    addQuantity: ''
  }
  isEditing.value = true
  openModal.value = true
}

async function updateStock() {
  try {
    let newQuantity = 0
    if (isEditing.value) {
      const currentStock = stocks.value.find(s => s.ingredient.id === form.value.ingredient_id)
      const currentQty = parseFloat(currentStock?.quantity ?? 0)
      const additionalQty = parseFloat(form.value.addQuantity || 0)
      newQuantity = currentQty + additionalQty
    } else {
      newQuantity = parseFloat(form.value.addQuantity || 0)
    }

    await api.post('/stocks', {
      ingredient_id: form.value.ingredient_id,
      quantity: newQuantity
    })

    successMessage.value = isEditing.value ? '✅ Stock updated successfully!' : '✅ Stock added successfully!'
    closeModal()
    await loadStocks()
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error('Update Error:', err)
  }
}

const loadStocks = async () => {
  const res = await api.get('/stocks')
  stocks.value = res.data
  checkLowStock()
}

const loadIngredients = async () => {
  const res = await api.get('/ingredients')
  ingredients.value = res.data
}

onMounted(async () => {
  await loadStocks()
  await loadIngredients()
})
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  display: none;
}
.custom-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
