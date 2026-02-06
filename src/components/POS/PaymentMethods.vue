<template>
  <div :lang="locale" class="khmer-support font-sans">
    <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
      {{ $t("payment.methods") }}
    </h2>

    <!-- Cash Method (USD or KHR) -->
    <div :class="methodBox('cash')" @click="$emit('select', 'cash')">
      <div class="flex items-center justify-between mb-3">
        <div
          class="font-medium text-base"
          :class="
            isCashSelected
              ? 'text-white'
              : 'text-gray-800 dark:text-gray-100'
          "
        >
          {{ $t("payment.cash") }}
        </div>

        <!-- Currency toggle -->
        <div
          class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1"
        >
          <button
            type="button"
            class="px-3 py-1 text-[11px] rounded-full"
            :class="
              cashCurrency === 'USD'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-700 dark:text-gray-200'
            "
            @click.stop="selectCurrency('USD')"
          >
            USD $
          </button>
          <button
            type="button"
            class="px-3 py-1 text-[11px] rounded-full"
            :class="
              cashCurrency === 'KHR'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
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
          class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg outline-none text-base text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition"
          @input="updateAmountUSD"
          step="1"
          min="0"
          inputmode="numeric"
        />
        <div
          class="mt-2 space-y-1 text-xs leading-snug"
          :class="
            isCashSelected
              ? 'text-white/80'
              : 'text-gray-500 dark:text-gray-400'
          "
        >
          <div>
            ≈ {{ previewKHR.toLocaleString("en-US") }} ៛
            <span v-if="exchangeRateValid" class="ml-2">
              • {{ $t("payment.rate_hint") || "Rate" }}: 1$ =
              {{ props.exchangeRate.toLocaleString("en-US") }} ៛
            </span>
          </div>
          <div>
            {{
              $t("payment.usd_round_hint") ||
              "Round cash amount to nearest $1."
            }}
          </div>
        </div>
      </div>

      <!-- KHR Input -->
      <div v-else>
        <input
          v-model="localKhrStr"
          type="number"
          :placeholder="$t('payment.cash_amount_khr_placeholder') || '៛ Amount'"
          class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg outline-none text-base text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition"
          @focus="isEditingKHR = true"
          @blur="onKhrBlur"
          @input="updateAmountKHR"
          step="1"
          min="0"
          inputmode="numeric"
        />
        <div
          class="mt-2 space-y-1 text-xs leading-snug"
          :class="
            isCashSelected
              ? 'text-white/80'
              : 'text-gray-500 dark:text-gray-400'
          "
        >
          <div>
            ≈ {{ previewUSDFromKHR }} $
            <span v-if="exchangeRateValid" class="ml-2">
              • {{ $t("payment.rate_hint") || "Rate" }}: 1$ =
              {{ props.exchangeRate.toLocaleString("en-US") }} ៛
            </span>
          </div>
          <div>
            {{
              $t("payment.khr_round_hint") ||
              "KHR will be rounded to the nearest 100 on blur."
            }}
          </div>
        </div>
      </div>

    </div>

    <!-- KHQR -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <div :class="methodBox('khqr')" @click="$emit('select', 'khqr')">
        <img :src="khqrIcon" class="h-10 mx-auto" alt="KHQR" />
        <p
          class="text-center text-sm mt-2"
          :class="
            props.selectedMethod === 'khqr'
              ? 'text-white'
              : 'text-gray-700 dark:text-gray-200'
          "
        >
          KHQR
        </p>
        <div class="mt-3 flex items-center justify-center">
          <div
            class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1"
          >
            <button
              type="button"
              class="px-3 py-1 text-xs rounded-full"
              :class="
                cashCurrency === 'USD'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
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
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-700 dark:text-gray-200'
              "
              @click.stop="selectCurrency('KHR')"
            >
              ៛ KHR
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="showChangeCard"
        class="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300"
      >
        <div class="text-[11px] uppercase tracking-wide text-emerald-700/80">
          {{ $t("payment.change") || "Change" }}
        </div>
      <div class="mt-1 text-lg font-semibold">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">USD:</span>
          <span>{{ changeAmountUSD }} $</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">KHR:</span>
          <span>{{ changeAmountKHR.toLocaleString("en-US") }} ៛</span>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import khqrIcon from "@/assets/icons/khqr.png";

const { locale } = useI18n();

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
]);

/** ---------- Local state ---------- */
const cashCurrency = ref(props.currency || "USD");
const localUsd = ref(parseInt(props.amount || 0));
const localKhrStr = ref("");
const isEditingKHR = ref(false);

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

const showChangeCard = computed(
  () =>
    props.selectedMethod === "cash" &&
    Number(props.changeAmount || 0) > 0
);
const isCashSelected = computed(() => props.selectedMethod === "cash");

/** ---------- UI helpers ---------- */
const methodBox = (method) => {
  const base =
    "cursor-pointer rounded-xl p-4 transition select-none bg-gray-50 dark:bg-gray-800/60";
  const active =
    "bg-purple-600 text-white dark:bg-purple-600 dark:text-white shadow-sm";
  const hover =
    "hover:bg-gray-100 dark:hover:bg-gray-800/80";
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

/* Hide number input spinners */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
