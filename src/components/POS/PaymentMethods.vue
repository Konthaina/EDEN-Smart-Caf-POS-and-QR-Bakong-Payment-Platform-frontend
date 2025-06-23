<template>
  <div>
    <h2 class="text-lg font-semibold text-purple-700 mb-4">{{ $t("payment.methods") }}</h2>

    <!-- Cash Method (USD Only) -->
    <div :class="methodBox('cash')" @click="$emit('select', 'cash')">
      <div class="font-medium mb-2 text-sm text-gray-700">{{ $t("payment.cash") }}</div>

      <!-- USD Input (No decimals) -->
      <input
        v-model="localAmount"
        type="number"
        placeholder="$ Amount"
        class="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg outline-none text-sm focus:ring-2 focus:ring-purple-500"
        @input="updateAmount"
        step="1"
        min="0"
      />

      <!-- Change Info -->
      <div class="mt-4 text-sm text-green-600 font-medium" v-if="props.selectedMethod === 'cash' && +props.changeAmount > 0">
        Change (USD): {{ changeAmountUSD }} $
      </div>
    </div>

    <!-- KHQR Method -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <div :class="methodBox('khqr')" @click="$emit('select', 'khqr')">
        <img src="/src/assets/icons/khqr.png" class="h-10 mx-auto" />
        <p class="text-center text-sm mt-2">KHQR</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "@/plugins/axios";
import { useToast } from "vue-toastification";

const toast = useToast();

const props = defineProps({
  selectedMethod: String,
  amount: [Number, String],
  methodError: String,
  changeAmount: String,
  exchangeRate: Number,
});

const emit = defineEmits(["select", "update:amount", "bakongQr", "bakongSuccess"]);

const localAmount = ref(parseInt(props.amount || 0)); // Force integer display
const qrCode = ref(null);
let pollingInterval = null;

const updateAmount = () => {
  const input = parseInt(localAmount.value) || 0; // Force whole number only
  emit("update:amount", input); // Emit integer
};

const methodBox = (method) =>
  `cursor-pointer border rounded-xl p-4 transition ${
    props.selectedMethod === method ? "border-purple-600 bg-purple-50" : "hover:border-gray-300"
  }`;

const changeAmountUSD = computed(() => {
  return parseFloat(props.changeAmount || 0).toFixed(2);
});

const generateKHQR = async () => {
  if (pollingInterval) clearInterval(pollingInterval);
  qrCode.value = null;

  try {
    const res = await axios.post("/bakong/generate-qr", {
      amount: props.amount,
      currency: "USD",
    });
    qrCode.value = res.data.qr_string;
    emit("bakongQr", res.data.qr_string);
    toast.info("✅ KHQR generated. Waiting...");
    pollBakong(res.data.md5);
  } catch (err) {
    toast.error("❌ Failed to generate KHQR");
    console.error(err);
  }
};

const pollBakong = (md5) => {
  let attempts = 0;
  pollingInterval = setInterval(async () => {
    try {
      const res = await axios.get("/bakong/verify/md5", { params: { md5 } });
      const txn = res.data.results?.find(
        (t) => t.raw_response?.responseCode === 0 && t.raw_response?.data
      );
      if (txn) {
        clearInterval(pollingInterval);
        toast.success("🎉 KHQR payment confirmed");
        emit("bakongSuccess");
      } else if (++attempts > 60) {
        clearInterval(pollingInterval);
        toast.error("⏰ Payment timeout");
      }
    } catch (err) {
      console.warn("KHQR polling error:", err);
    }
  }, 3000);
};

watch(() => props.amount, (val) => {
  localAmount.value = parseInt(val || 0);
});

defineExpose({ generateKHQR });
</script>
