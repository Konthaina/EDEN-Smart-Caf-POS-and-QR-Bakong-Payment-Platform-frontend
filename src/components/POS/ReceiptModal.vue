<template>
  <!-- Receipt Success Modal -->
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div class="bg-white p-6 rounded shadow w-[350px] text-sm">
      <h2 class="text-center text-lg font-bold mb-1">Cafe Eden</h2>
      <p class="text-xs text-center mb-3">{{ currentTime }}</p>
      <hr />

      <div v-for="item in cart" :key="item.id" class="flex justify-between mt-1">
        <span>{{ item.name }} × {{ item.qty }}</span>
        <span>${{ format(item.qty * item.price) }}</span>
      </div>

      <hr class="my-2" />
      <div class="flex justify-between">
        <span>Subtotal</span>
        <span>${{ format(total) }}</span>
      </div>
      <div v-if="discountAmount > 0" class="flex justify-between text-green-600">
        <span>Discount</span>
        <span>-${{ format(discountAmount) }}</span>
      </div>
      <div class="flex justify-between font-bold">
        <span>Total</span>
        <span>${{ format(discountedTotal) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Payment Method</span>
        <span class="capitalize">{{ method }}</span>
      </div>
      <div v-if="method === 'cash'" class="flex justify-between">
        <span>Change</span>
        <span>${{ format(change) }}</span>
      </div>

      <hr class="my-3" />
      <p class="text-xs text-center">Thank you for your purchase!</p>

      <div class="flex justify-center mt-4">
        <button @click="printReceipt" class="bg-purple-600 text-white px-4 py-1 rounded">Print</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: Boolean,
  cart: Array,
  total: Number,
  discountedTotal: Number,
  discountAmount: Number,
  method: String,
  change: Number,
});

const emit = defineEmits(['close']);

const currentTime = computed(() => new Date().toLocaleString());
const format = (v) => parseFloat(v).toFixed(2);

const printReceipt = () => {
  const current = currentTime.value;

  let itemsHtml = '';
  cart.forEach(item => {
    itemsHtml += `
      <div class="row">
        <span>${item.name} × ${item.qty}</span>
        <span>$${format(item.qty * item.price)}</span>
      </div>`;
  });

  const html = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; color: #000; }
          .center { text-align: center; font-weight: bold; font-size: 16px; }
          .row { display: flex; justify-content: space-between; margin-top: 4px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="center">Cafe Eden</div>
        <div class="center" style="font-size: 11px; margin-bottom: 10px;">${current}</div>
        <div class="divider"></div>
        ${itemsHtml}
        <div class="divider"></div>
        <div class="row"><span>Subtotal</span><span>$${format(total)}</span></div>
        ${discountAmount > 0 ? `<div class="row"><span>Discount</span><span>-$${format(discountAmount)}</span></div>` : ''}
        <div class="row" style="font-weight: bold;"><span>Total</span><span>$${format(discountedTotal)}</span></div>
        <div class="row"><span>Paid by</span><span>${method}</span></div>
        ${method === 'cash' ? `<div class="row"><span>Change</span><span>$${format(change)}</span></div>` : ''}
        <div class="divider"></div>
        <div class="center" style="font-size: 11px;">Thank you — visit again!</div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
      emit('close');
    };
  } else {
    alert('Popup blocked! Please allow popups for this site.');
  }
};
</script>

<style scoped>
/* Optional cleanup */
</style>



<style scoped>
/* Force only the inline receipt to be printed */
@media print {
  body * {
    display: none !important;
  }

  #inline-receipt,
  #inline-receipt * {
    display: block !important;
  }

  #inline-receipt {
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    background: white;
    font-family: Arial, sans-serif;
    padding: 20px;
    font-size: 14px;
  }
}
</style>
