<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-xl w-[90%] max-w-6xl h-[90%] flex overflow-hidden relative">
      <!-- Payment Methods (Left) -->
      <div class="flex-1 p-6 overflow-y-auto">
        <div class="text-lg font-semibold text-purple-600 mb-4">Payment methods</div>

        <!-- Cash -->
        <div :class="methodBox('cash')" @click="selectMethod('cash')">
          <div class="font-semibold mb-2">Cash Payment</div>
          <input v-model="amount" type="number" placeholder="Enter Amount"
            class="w-full bg-gray-100 px-4 py-2 rounded outline-none" />
        </div>

        <!-- Other Methods -->
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div :class="methodBox('card')" @click="selectMethod('card')">
            <img src="/src/assets/icons/card.png" class="h-10 mx-auto" />
            <p class="text-center mt-2 text-sm">Card</p>
          </div>
          <div :class="methodBox('aba')" @click="selectMethod('aba')">
            <img src="/src/assets/icons/aba.png" class="h-10 mx-auto" />
            <p class="text-center mt-2 text-sm">ABA</p>
          </div>
          <div :class="methodBox('khqr')" @click="selectMethod('khqr')">
            <img src="/src/assets/icons/khqr.png" class="h-10 mx-auto" />
            <p class="text-center mt-2 text-sm">KHQR</p>
          </div>
        </div>

        <!-- Discounts -->
        <div class="mt-6 space-y-4">
          <div>
            <p class="text-sm font-medium mb-1">Promo Code</p>
            <div class="flex gap-2">
              <input v-model="promoCode" type="text" placeholder="Enter code"
                class="bg-gray-100 px-4 py-2 rounded w-full outline-none" />
              <button @click="applyDiscount" class="bg-purple-600 text-white px-4 py-2 rounded">Apply</button>
            </div>
            <div v-if="discount" class="text-green-600 text-sm mt-1">{{ discountSummary }}</div>
            <div v-if="discountError" class="text-red-500 text-sm mt-1">{{ discountError }}</div>
          </div>

          <div>
            <p class="text-sm font-medium mb-1">Manual Discount (%)</p>
            <div class="flex gap-2">
              <input v-model.number="manualDiscountInput" type="number" min="0" max="100"
                class="bg-gray-100 px-4 py-2 rounded w-full outline-none" />
              <button @click="applyManualDiscount" class="bg-purple-600 text-white px-4 py-2 rounded">Apply</button>
            </div>
          </div>

          <div v-if="selectedMethod === 'cash'">
            <p class="text-sm font-medium mb-1">Cash Back (Change)</p>
            <div class="bg-gray-100 px-4 py-2 rounded text-gray-500">${{ changeAmount }}</div>
          </div>
        </div>
      </div>

      <!-- Cart Summary (Right) -->
      <div class="w-96 p-6 bg-gray-50 overflow-y-auto flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-purple-700">Your Items</h2>
          <button @click="close" class="text-xl">&times;</button>
        </div>

        <div v-if="cart.length === 0" class="text-gray-400">Cart is empty</div>

        <div v-for="item in cart" :key="item.id" class="flex gap-3 items-center mb-3">
          <img :src="getImage(item.image)" class="w-10 h-10 object-cover rounded" />
          <div class="flex-1 text-sm">
            <div class="font-semibold text-gray-700">{{ item.name }}</div>
            <div class="text-gray-400 text-xs">Code: {{ item.id }}</div>
            <div>{{ item.qty }} × ${{ format(item.price) }}</div>
          </div>
          <div class="text-sm font-semibold text-gray-700">{{ item.qty }}</div>
        </div>

        <div class="mt-auto border-t pt-4 space-y-2 text-sm text-gray-700">
          <div v-if="discount">Promo Code: <span class="text-green-600">
              -{{ discount.type === 'percent' ? discount.value + '%' : '$' + discount.value }}</span></div>
          <div v-if="manualDiscount > 0">Manual Discount: <span class="text-green-600">-{{ manualDiscount }}%</span></div>
          <div v-if="total !== discountedTotal" class="text-red-600">Total Discount: ${{ format(total - discountedTotal) }}
          </div>
          <div class="flex justify-between text-base font-semibold text-gray-800 pt-2">
            <span>Total:</span>
            <span>${{ format(discountedTotal) }}</span>
          </div>
        </div>

        <button @click="submitPayment"
          class="mt-4 bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700">Pay Now</button>
      </div>

      <!-- Receipt Popup Inline -->
      <div v-if="showReceipt"
        class="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center p-8 z-50">
        <h2 class="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
        <p class="text-gray-700 mb-4">Order has been recorded successfully.</p>
        <div class="flex gap-4">
          <button @click="printReceipt" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Print Receipt</button>
          <button @click="redirectToOrders"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">View Orders</button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/plugins/axios';
import { usePOSStore } from '@/store/pos';

const router = useRouter();
const showReceipt = ref(false);
const selectedMethod = ref('cash');
const amount = ref('');
const promoCode = ref('');
const discount = ref(null);
const discountError = ref('');
const manualDiscount = ref(0);
const manualDiscountInput = ref(0);

const { cart, clearCart } = usePOSStore();

const props = defineProps({ visible: Boolean });
const emit = defineEmits(['close', 'success']);

const close = () => emit('close');

const total = computed(() => cart.reduce((sum, item) => sum + item.qty * parseFloat(item.price), 0));

const discountedTotal = computed(() => {
  let result = total.value;
  if (discount.value?.type === 'percent') result *= (1 - discount.value.value / 100);
  else if (discount.value?.value) result = Math.max(result - discount.value.value, 0);
  if (manualDiscount.value > 0) result *= (1 - manualDiscount.value / 100);
  return result;
});

const changeAmount = computed(() => {
  if (selectedMethod.value !== 'cash') return '0.00';
  const paid = parseFloat(amount.value || 0);
  return paid - discountedTotal.value > 0 ? (paid - discountedTotal.value).toFixed(2) : '0.00';
});

const format = (v) => parseFloat(v).toFixed(2);
const getImage = (img) => img ? `http://localhost:8000/storage/${img}` : 'https://via.placeholder.com/100';
const methodBox = (m) => `cursor-pointer border rounded-xl p-4 transition ${selectedMethod.value === m ? 'border-purple-600 bg-purple-50' : 'hover:border-gray-300'}`;

const selectMethod = (m) => selectedMethod.value = m.toLowerCase();

const applyDiscount = async () => {
  discountError.value = '';
  try {
    const res = await api.get(`/discounts/validate?code=${promoCode.value}`);
    discount.value = res.data;
  } catch {
    discount.value = null;
    discountError.value = 'Invalid or expired code';
  }
};

const applyManualDiscount = () => {
  if (manualDiscountInput.value >= 0 && manualDiscountInput.value <= 100)
    manualDiscount.value = manualDiscountInput.value;
};

const discountSummary = computed(() =>
  !discount.value ? '' : discount.value.type === 'percent'
    ? `${discount.value.value}% off`
    : `$${discount.value.value} off`
);

const submitPayment = async () => {
  try {
    const orderRes = await api.post('/orders', {
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.qty,
      })),
      code: promoCode.value || null,
    });

    await api.post('/payments', {
      order_id: orderRes.data.id,
      method: selectedMethod.value,
      amount: discountedTotal.value,
      transaction_id: selectedMethod.value === 'cash' ? null : `TXN-${Date.now()}`,
      note: `Paid via ${selectedMethod.value}${promoCode.value ? ` (Code: ${promoCode.value})` : ''}`
    });

    clearCart();
    showReceipt.value = true;
  } catch (err) {
    console.error(err);
    alert('Payment failed');
  }
};

const printReceipt = () => {
  window.print();
};

const redirectToOrders = () => {
  router.push('/orders');
};
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}
</style>
