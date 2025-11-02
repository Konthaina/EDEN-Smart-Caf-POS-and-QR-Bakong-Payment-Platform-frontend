<template>
  <div :lang="locale" class="khmer-support font-sans">
    <h2 class="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-4">
      {{ $t("payment.methods") }}
    </h2>

    <!-- Cash Method (USD or KHR) -->
    <div :class="methodBox('cash')" @click="$emit('select', 'cash')">
      <div class="flex items-center justify-between mb-2">
        <div class="font-medium text-sm text-gray-700 dark:text-gray-200">
          {{ $t("payment.cash") }}
        </div>

        <!-- Currency toggle -->
        <div
          class="inline-flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full p-1"
        >
          <button
            type="button"
            class="px-3 py-1 text-xs rounded-full"
            :class="
              cashCurrency === 'USD'
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-200'
            "
            @click.stop="selectCurrency('USD')"
          >
            USD $
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs rounded-full"
            :class="
              cashCurrency === 'KHR'
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-200'
            "
            @click.stop="selectCurrency('KHR')"
          >
            ៛ KHR
          </button>
        </div>
      </div>

      <!-- USD Input -->
      <div v-if="cashCurrency === 'USD'">
        <input
          v-model="localUsd"
          type="number"
          :placeholder="$t('payment.cash_amount_placeholder') || '$ Amount'"
          class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg outline-none text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 transition"
          @input="updateAmountUSD"
          step="1"
          min="0"
          inputmode="numeric"
        />
        <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          {{ $t("payment.max_for_order") || "Max for this order" }}:
          <strong>\${{ maxUSDAllowed.toFixed(2) }}</strong>
          <span class="ml-1 text-gray-400">
            ({{ $t("payment.min_cap") || "min cap" }} ${{ USD_MIN_CAP }})
          </span>
        </p>

        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          ≈ {{ previewKHR.toLocaleString("en-US") }} ៛
          <span v-if="exchangeRateValid" class="ml-2">
            • {{ $t("payment.rate_hint") || "Rate" }}: 1$ =
            {{ props.exchangeRate.toLocaleString("en-US") }} ៛
          </span>
        </p>
      </div>

      <!-- KHR Input -->
      <div v-else>
        <input
          v-model="localKhrStr"
          type="number"
          :placeholder="$t('payment.cash_amount_khr_placeholder') || '៛ Amount'"
          class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg outline-none text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 transition"
          @focus="isEditingKHR = true"
          @blur="onKhrBlur"
          @input="updateAmountKHR"
          step="1"
          min="0"
          inputmode="numeric"
        />
        <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          {{ $t("payment.max_for_order") || "Max for this order" }}:
          <strong>{{ maxKHRAllowed.toLocaleString("en-US") }} ៛</strong>
          <span class="ml-1 text-gray-400">
            ({{ $t("payment.min_cap") || "min cap" }}
            {{ KHR_MIN_CAP.toLocaleString("en-US") }} ៛)
          </span>
        </p>

        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          ≈ {{ previewUSDFromKHR }} $
          <span v-if="exchangeRateValid" class="ml-2">
            • {{ $t("payment.rate_hint") || "Rate" }}: 1$ =
            {{ props.exchangeRate.toLocaleString("en-US") }} ៛
          </span>
        </p>
        <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          {{
            $t("payment.khr_round_hint") ||
            "KHR will be rounded to the nearest 100 on blur."
          }}
        </p>
      </div>

      <!-- Change -->
      <div
        class="mt-4 text-sm font-medium"
        v-if="props.selectedMethod === 'cash' && +props.changeAmount > 0"
      >
        <template v-if="cashCurrency === 'USD'">
          <span class="text-green-600 dark:text-green-400">
            {{ $t("payment.change_usd") || "Change (USD)" }}:
          </span>
          {{ changeAmountUSD }} $
        </template>
        <template v-else>
          <span class="text-green-600 dark:text-green-400">
            {{ $t("payment.change_khr") || "Change (KHR)" }}:
          </span>
          {{ changeAmountKHR.toLocaleString("en-US") }} ៛
        </template>
      </div>
    </div>

    <!-- KHQR -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <div :class="methodBox('khqr')" @click="$emit('select', 'khqr')">
        <img src="/src/assets/icons/khqr.png" class="h-10 mx-auto" alt="KHQR" />
        <p class="text-center text-sm text-gray-700 dark:text-gray-200 mt-2">
          KHQR
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import axios from "@/plugins/axios";
import { useToast } from "vue-toastification";

const { locale } = useI18n();
const toast = useToast();

/** ------- RULES ------- **
 * Max tendered per order = max(MIN_CAP, 2 × order_due)
 * MIN_CAP: $100 or ៛100,000
 */
const USD_MIN_CAP = 100;
const KHR_MIN_CAP = 100_000;
const CHANGE_FACTOR = 2;

const props = defineProps({
  selectedMethod: String,
  /** parent canonical amount in USD (tendered) */
  amount: [Number, String],
  methodError: String,
  /** change in USD (computed by parent) */
  changeAmount: [Number, String],
  /** USD -> KHR exchange rate */
  exchangeRate: Number,
  /** v-model:currency */
  currency: { type: String, default: "USD" },
  /** Order due in USD (after discounts + tax) */
  dueUsd: { type: Number, required: true },
});

const emit = defineEmits([
  "select",
  "update:amount", // always emit USD
  "update:currency", // sync currency with modal
  "bakongQr",
  "bakongSuccess",
]);

/** ---------- Local state ---------- */
const cashCurrency = ref(props.currency || "USD");
const localUsd = ref(parseInt(props.amount || 0));
const localKhrStr = ref("");
const isEditingKHR = ref(false);
const qrCode = ref(null);
let pollingInterval = null;

/** ---------- Helpers ---------- */
const exchangeRateValid = computed(() => Number(props.exchangeRate) > 0);
const toInt = (v) => parseInt(v || 0) || 0;
const roundRiel = (v, step = 100) => {
  const n = Math.max(0, Number(v) || 0);
  return Math.round(n / step) * step;
};
const digitsOnly = (s) => (s || "").toString().replace(/\D/g, "");

/** ---------- Dynamic maxima ---------- */
const maxUSDAllowed = computed(() => {
  const due = Math.max(0, Number(props.dueUsd) || 0);
  return Math.max(USD_MIN_CAP, +(due * CHANGE_FACTOR).toFixed(2));
});
const maxKHRAllowed = computed(() => {
  if (!exchangeRateValid.value) return KHR_MIN_CAP;
  const dueKHR = Math.round((Number(props.dueUsd) || 0) * props.exchangeRate);
  const dyn = roundRiel(dueKHR * CHANGE_FACTOR);
  return Math.max(KHR_MIN_CAP, dyn);
});

/** ---------- Conversions & Previews ---------- */
const previewKHR = computed(() => {
  if (!exchangeRateValid.value) return 0;
  return roundRiel(localUsd.value * props.exchangeRate);
});
const previewUSDFromKHR = computed(() => {
  if (!exchangeRateValid.value) return "0.00";
  const n = Number(digitsOnly(localKhrStr.value) || 0);
  const usd = n / props.exchangeRate;
  return usd.toFixed(2);
});

/** ---------- Change display ---------- */
const changeAmountUSD = computed(() =>
  Number(props.changeAmount || 0).toFixed(2)
);
const changeAmountKHR = computed(() => {
  if (!exchangeRateValid.value) return 0;
  const usdChange = Number(props.changeAmount || 0);
  return roundRiel(usdChange * props.exchangeRate);
});

/** ---------- UI helpers ---------- */
const methodBox = (method) => {
  const base =
    "cursor-pointer border rounded-xl p-4 transition select-none bg-gray-50 dark:bg-gray-800";
  const active =
    "border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-900 shadow";
  const hover =
    "hover:border-purple-400 hover:bg-purple-100 dark:hover:border-purple-400 dark:hover:bg-gray-700";
  return [base, props.selectedMethod === method ? active : hover].join(" ");
};

function selectCurrency(cur) {
  if (cur === cashCurrency.value) return;
  cashCurrency.value = cur;
  emit("update:currency", cur);

  if (cur === "KHR") {
    let usd = Number(props.amount || 0);
    usd = Math.min(usd, maxUSDAllowed.value);
    if (exchangeRateValid.value) {
      const khr = Math.min(
        Math.floor(usd * props.exchangeRate),
        maxKHRAllowed.value
      );
      localKhrStr.value = String(khr);
    } else {
      localKhrStr.value = "";
    }
  } else {
    const usdInt = Math.min(
      toInt(props.amount),
      Math.floor(maxUSDAllowed.value)
    );
    localUsd.value = usdInt;
    emit("update:amount", usdInt);
  }
}

/** ---------- Emitters with quiet clamping ---------- */
function updateAmountUSD() {
  let usdInt = toInt(localUsd.value);
  if (usdInt > maxUSDAllowed.value) usdInt = Math.floor(maxUSDAllowed.value);
  if (usdInt < 0) usdInt = 0;
  localUsd.value = usdInt;
  emit("update:amount", usdInt);
}

function updateAmountKHR() {
  if (!exchangeRateValid.value) return;
  localKhrStr.value = digitsOnly(localKhrStr.value);
  let khr = Number(localKhrStr.value || 0);
  if (khr > maxKHRAllowed.value) khr = maxKHRAllowed.value;
  if (khr < 0) khr = 0;
  localKhrStr.value = String(khr);

  const usd = Number((khr / props.exchangeRate).toFixed(2));
  emit("update:amount", usd);
}

function onKhrBlur() {
  isEditingKHR.value = false;
  let n = Number(digitsOnly(localKhrStr.value) || 0);
  if (n > maxKHRAllowed.value) n = maxKHRAllowed.value;
  const rounded = roundRiel(n);
  localKhrStr.value = rounded ? String(rounded) : "";
  const usd = exchangeRateValid.value
    ? Number((rounded / props.exchangeRate).toFixed(2))
    : 0;
  emit("update:amount", usd);
}

/** ---------- KHQR (optional trigger) ---------- */
const generateKHQR = async () => {
  if (pollingInterval) clearInterval(pollingInterval);
  qrCode.value = null;

  try {
    const res = await axios.post("/bakong/generate-qr", {
      amount: props.dueUsd, // Pay exactly the due
      currency: cashCurrency.value,
    });
    qrCode.value = res.data.qr_string;
    emit("bakongQr", res.data.qr_string);
  } catch {
    toast.error("❌ Failed to generate KHQR");
  }
};

/** ---------- Sync from parent ---------- */
watch(
  () => props.amount,
  (val) => {
    if (cashCurrency.value === "USD") {
      let next = Math.min(toInt(val), Math.floor(maxUSDAllowed.value));
      if (next < 0) next = 0;
      localUsd.value = next;
    } else {
      if (isEditingKHR.value) return;
      if (exchangeRateValid.value) {
        let khr = Math.floor(
          Math.max(0, Number(val || 0) * props.exchangeRate)
        );
        if (khr > maxKHRAllowed.value) khr = maxKHRAllowed.value;
        localKhrStr.value = String(khr);
      }
    }
  },
  { immediate: true }
);

watch(
  () => [props.dueUsd, props.exchangeRate, cashCurrency.value],
  () => {
    if (cashCurrency.value === "USD") {
      let next = Math.min(
        toInt(localUsd.value),
        Math.floor(maxUSDAllowed.value)
      );
      if (next < 0) next = 0;
      localUsd.value = next;
      emit("update:amount", next);
    } else if (exchangeRateValid.value && !isEditingKHR.value) {
      let khr = Math.floor(
        Math.max(0, Number(props.amount || 0) * props.exchangeRate)
      );
      if (khr > maxKHRAllowed.value) khr = maxKHRAllowed.value;
      localKhrStr.value = String(khr);
      emit("update:amount", Number((khr / props.exchangeRate).toFixed(2)));
    }
  },
  { immediate: true }
);

watch(
  () => props.currency,
  (cur) => {
    if (cur && cur !== cashCurrency.value) {
      selectCurrency(cur);
    }
  },
  { immediate: true }
);

defineExpose({
  generateKHQR,
  USD_MIN_CAP,
  KHR_MIN_CAP,
  maxUSDAllowed,
  maxKHRAllowed,
});
</script>

<style scoped>
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
