<template>
  <teleport to="body">
    <div v-show="visible" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-xl w-[90%] max-w-6xl h-[90%] flex overflow-hidden relative">
        <!-- Left Side: Payment -->
        <div class="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6">
          <h2 class="text-lg font-semibold text-purple-700 mb-4">{{ $t('payment.methods') }}</h2>

          <!-- Cash Input -->
          <div :class="methodBox('cash')" @click="selectMethod('cash')">
            <div class="font-medium mb-2">{{ $t('payment.cash') }}</div>
            <input
              v-model="amount"
              type="number"
              :placeholder="$t('payment.enter_amount')"
              class="w-full bg-gray-100 px-4 py-2 rounded-lg outline-none text-sm"
            />
          </div>

          <!-- Payment Method Icons -->
          <div class="grid grid-cols-3 gap-4 mt-6">
            <div :class="methodBox('card')" @click="selectMethod('card')">
              <img src="/src/assets/icons/card.png" class="h-10 mx-auto" />
              <p class="text-center text-sm mt-2">Card</p>
            </div>
            <div :class="methodBox('aba')" @click="selectMethod('aba')">
              <img src="/src/assets/icons/aba.png" class="h-10 mx-auto" />
              <p class="text-center text-sm mt-2">ABA</p>
            </div>
            <div :class="methodBox('khqr')" @click="selectMethod('khqr')">
              <img src="/src/assets/icons/khqr.png" class="h-10 mx-auto" />
              <p class="text-center text-sm mt-2">KHQR</p>
            </div>
          </div>
          <div v-if="methodError" class="text-red-500 text-sm mt-2">{{ methodError }}</div>

          <!-- Discount Section -->
          <div class="space-y-4 mt-6">
            <div>
              <p class="text-sm font-medium mb-1">{{ $t('payment.promo_code') }}</p>
              <div class="flex gap-2">
                <input v-model="promoCode" type="text" :placeholder="$t('payment.enter_code')"
                  class="bg-gray-100 px-4 py-2 rounded-lg w-full outline-none text-sm" />
                <button @click="applyDiscount"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                  {{ $t('common.apply') }}
                </button>
              </div>
              <div v-if="discount" class="text-green-600 text-sm mt-1">{{ discountSummary }}</div>
              <div v-if="discountError" class="text-red-500 text-sm mt-1">{{ discountError }}</div>
            </div>

            <div>
              <p class="text-sm font-medium mb-1">{{ $t('payment.manual_discount') }}</p>
              <input v-model.number="manualDiscount" type="number" min="0" max="100"
                class="bg-gray-100 px-4 py-2 rounded-lg w-full outline-none text-sm" />
            </div>

            <div v-if="selectedMethod === 'cash'">
              <p class="text-sm font-medium mb-1">{{ $t('payment.change') }}</p>
              <div class="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 text-sm font-medium">
                ${{ changeAmount }}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Cart Summary -->
        <div class="w-96 p-6 bg-gray-50 overflow-y-auto no-scrollbar flex flex-col border-l">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-purple-700">🛒 {{ $t('payment.cart_items') }}</h2>
            <button @click="close" class="text-2xl font-light hover:text-red-500">&times;</button>
          </div>

          <div class="flex-1 overflow-y-auto no-scrollbar pr-1 mb-4">
            <div v-if="cart.length === 0" class="text-gray-400 text-sm">{{ $t('payment.cart_empty') }}</div>
            <div v-for="item in cart" :key="item.id" class="flex gap-3 items-center mb-3">
              <img :src="getImage(item.image)" class="w-10 h-10 object-cover rounded-lg" />
              <div class="flex-1 text-sm">
                <div class="font-semibold text-gray-800">{{ item.name }}</div>
                <div class="text-gray-400 text-xs">{{ $t('cart.code') }}: {{ item.id }}</div>
                <div class="text-gray-600">{{ item.qty }} × ${{ format(item.price) }}</div>
              </div>
              <div class="text-sm font-semibold text-gray-700">{{ item.qty }}</div>
            </div>
          </div>

          <div class="mt-auto border-t pt-4 space-y-2 text-sm text-gray-700">
            <div v-if="discount">Promo Code: <span class="text-green-600">-{{ discountText }}</span></div>
            <div v-if="manualDiscount > 0">Manual Discount: <span class="text-green-600">-{{ manualDiscount }}%</span></div>
            <div v-if="total !== discountedTotal" class="text-red-600">
              Total Discount: ${{ format(total - discountedTotal) }}
            </div>
            <div class="flex justify-between text-base font-bold pt-2">
              <span>{{ $t('payment.total') }}:</span>
              <span>${{ format(discountedTotal) }}</span>
            </div>
          </div>

          <button @click="submitPayment"
            class="mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-full font-semibold text-sm">
            {{ $t('payment.pay_now') }}
          </button>
        </div>

        <!-- Receipt -->
        <div class="top-2 bottom-2 print-area hidden print:flex justify-center w-full bg-white">
          <div class="w-[280px] p-4 text-[13px] font-mono text-black">
            <h2 class="text-center text-lg font-bold mb-1">{{ $t('receipt.header') }}</h2>
            <p class="text-center text-xs mb-1">{{ $t('receipt.thanks') }}</p>
            <p class="text-center text-xs mb-3">{{ $t('receipt.order_id') }}: #{{ String(orderId).padStart(3, '0') }}</p>

            <div class="flex justify-between font-semibold border-b border-gray-400 pb-1 mb-1">
              <span class="w-1/2">Item</span>
              <span class="w-1/4 text-center">Qty</span>
              <span class="w-1/4 text-right">Amount</span>
            </div>

            <div v-for="item in cart" :key="item.id" class="flex justify-between mb-1">
              <span class="w-1/2 truncate">{{ item.name }}</span>
              <span class="w-1/4 text-center">x{{ item.qty }}</span>
              <span class="w-1/4 text-right">${{ format(item.price * item.qty) }}</span>
            </div>

            <hr class="my-2 border-dashed border-gray-400" />
            <div class="flex justify-between"><span>{{ $t('receipt.subtotal') }}</span><span>${{ format(total) }}</span></div>
            <div v-if="discount" class="flex justify-between text-green-700">
              <span>{{ $t('receipt.promo_discount') }}</span><span>-{{ discountText }}</span>
            </div>
            <div v-if="manualDiscount > 0" class="flex justify-between text-green-700">
              <span>{{ $t('receipt.manual_discount') }}</span><span>-{{ manualDiscount }}%</span>
            </div>
            <div class="flex justify-between font-bold text-base border-t border-black mt-2 pt-2">
              <span>{{ $t('receipt.total') }}</span><span>${{ format(discountedTotal) }}</span>
            </div>

            <div class="flex justify-between text-xs mt-1">
              <span>{{ $t('receipt.pay_by') }}</span>
              <span class="capitalize">{{ selectedMethod }}</span>
            </div>

            <div class="text-xs mt-4 text-gray-500 text-center">
              <p>{{ $t('receipt.cashier') }}: {{ user?.name || $t('receipt.unknown') }}</p>
              <p>{{ $t('receipt.printed') }}: {{ new Date().toLocaleString() }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </teleport>
</template>


<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import api from '@/plugins/axios'
import { usePOSStore } from '@/store/pos'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

const user = ref(null)
const { cart, clearCart } = usePOSStore()

const selectedMethod = ref(null) // 🔄 Changed from 'cash' to null
const amount = ref('')
const promoCode = ref('')
const discount = ref(null)
const discountError = ref('')
const manualDiscount = ref(0)
const orderId = ref(null)
const methodError = ref('') // ⚠️ Error message

onMounted(async () => {
  try {
    const res = await api.get('/me')
    user.value = res.data
  } catch (e) {
    console.error('Failed to load user', e)
  }

  window.onafterprint = () => location.reload()
})

watch(cart, val => {
  if (val.length === 0) close()
})

const close = () => emit('close')

const total = computed(() =>
  cart.reduce((sum, i) => sum + i.qty * parseFloat(i.price), 0)
)

const discountedTotal = computed(() => {
  let result = total.value
  if (discount.value?.type === 'percent') result *= (1 - discount.value.value / 100)
  else if (discount.value?.value) result = Math.max(result - discount.value.value, 0)
  if (manualDiscount.value > 0) result *= (1 - manualDiscount.value / 100)
  return parseFloat(result.toFixed(2))
})

const changeAmount = computed(() => {
  if (selectedMethod.value !== 'cash') return '0.00'
  const paid = parseFloat(amount.value || 0)
  return paid > discountedTotal.value ? (paid - discountedTotal.value).toFixed(2) : '0.00'
})

const format = v => parseFloat(v).toFixed(2)
const getImage = img => img ? `http://188.166.196.32/storage/${img}` : 'https://via.placeholder.com/100'
const methodBox = m => `cursor-pointer border rounded-xl p-4 transition ${selectedMethod.value === m ? 'border-purple-600 bg-purple-50' : 'hover:border-gray-300'}`
const selectMethod = m => {
  selectedMethod.value = m.toLowerCase()
  methodError.value = '' // Clear error on select
}

const applyDiscount = async () => {
  discountError.value = ''
  try {
    const res = await api.get(`/discounts/validate?code=${promoCode.value}`)
    discount.value = res.data
  } catch {
    discount.value = null
    discountError.value = 'Invalid or expired code'
  }
}

const discountSummary = computed(() =>
  !discount.value ? '' :
    discount.value.type === 'percent' ? `${discount.value.value}% off` :
      `$${discount.value.value} off`
)

const discountText = computed(() =>
  discount.value?.type === 'percent' ? `${discount.value.value}%` : `$${discount.value.value}`
)

const submitPayment = async () => {
  methodError.value = ''
  if (!selectedMethod.value) {
    methodError.value = 'Please select a payment method.'
    return
  }

  try {
    const orderRes = await api.post('/orders', {
      items: cart.map(i => ({ menu_item_id: i.id, quantity: i.qty })),
      code: promoCode.value || null
    })

    const rawOrderId = orderRes.data.id
    orderId.value = ((rawOrderId - 1) % 200) + 1

    await api.post('/payments', {
      order_id: rawOrderId,
      method: selectedMethod.value,
      amount: discountedTotal.value,
      transaction_id: selectedMethod.value === 'cash' ? null : `TXN-${Date.now()}`,
      note: `Paid via ${selectedMethod.value}${promoCode.value ? ` (Code: ${promoCode.value})` : ''}`
    })

    clearCart()
    await nextTick()
    setTimeout(() => window.print(), 200)
  } catch (err) {
    console.error(err)
    alert('Payment failed')
  }
}
</script>


<style scoped>
@media print {
  body {
    background: white !important;
    margin: 0;
    padding: 0;
  }

  body * {
    visibility: hidden !important;
    font-size: 13px !important;
  }

  .print-area,
  .print-area * {
    visibility: visible !important;
  }

  .print-area {
    position: fixed !important;
    inset: 0;
    width: 100%;
    background: white !important;
    display: flex !important;
    justify-content: center;
    z-index: 9999;
    padding: 0;
  }

  @page {
    size: auto;
    margin: 0;
  }

  html, body {
    height: auto !important;
    overflow: visible !important;
  }
}
</style>
