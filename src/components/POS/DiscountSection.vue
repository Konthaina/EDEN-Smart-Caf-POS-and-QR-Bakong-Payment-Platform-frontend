<template>
  <div :lang="locale" class="space-y-4 mt-6 khmer-support">
    <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
      {{ $t("payment.discount") || "Discount" }}
    </p>

    <!-- Mode selector -->
    <div class="flex flex-wrap gap-2">
      <button
        class="px-3 py-1 rounded-full text-sm"
        :class="
          mode === 'code'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
        "
        @click="mode = 'code'"
        type="button"
      >
        {{ $t("payment.promo_code") || "Promo Code" }}
      </button>

      <button
        v-if="canManual"
        class="px-3 py-1 rounded-full text-sm"
        :class="
          mode === 'percent'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
        "
        @click="mode = 'percent'"
        type="button"
      >
        {{ $t("payment.percent_off") || "% Off" }}
      </button>

      <button
        v-if="canManual"
        class="px-3 py-1 rounded-full text-sm"
        :class="
          mode === 'amount'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
        "
        @click="mode = 'amount'"
        type="button"
      >
        {{ $t("payment.amount_off") || "$ Off" }}
      </button>

      <button
        v-if="hasAnyValue"
        class="ml-auto px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        @click="$emit('clear')"
        type="button"
      >
        {{ $t("common.clear") || "Clear" }}
      </button>
    </div>

    <!-- Inputs -->
    <div v-if="mode === 'code'" class="flex gap-2">
      <input
        v-model="localPromoCode"
        type="text"
        :placeholder="$t('payment.enter_code') || 'Enter code'"
        class="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg w-full outline-none text-sm transition-colors"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      />
      <button
        @click="applyCode"
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition"
        type="button"
      >
        {{ $t("common.apply") }}
      </button>
    </div>

    <div v-else-if="mode === 'percent'" class="flex gap-2">
      <input
        v-model.number="percent"
        type="number"
        min="0"
        max="100"
        step="0.1"
        :placeholder="$t('payment.enter_percent') || 'Percent (0-100)'"
        class="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg w-full outline-none text-sm transition-colors"
        inputmode="decimal"
      />
      <button
        @click="applyPercent"
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition"
        type="button"
      >
        {{ $t("common.apply") }}
      </button>
    </div>

    <div v-else-if="mode === 'amount'" class="flex gap-2">
      <input
        v-model.number="amount"
        type="number"
        min="0"
        step="0.01"
        :placeholder="$t('payment.enter_amount') || 'Amount (e.g. 2.00)'"
        class="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg w-full outline-none text-sm transition-colors"
        inputmode="decimal"
      />
      <button
        @click="applyAmount"
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition"
        type="button"
      >
        {{ $t("common.apply") }}
      </button>
    </div>

    <!-- Active discount summary -->
    <div
      v-if="discount && discount.value"
      class="text-green-600 dark:text-green-400 text-sm"
    >
      {{ discountSummary }}
      <span v-if="discount.mode === 'manual'" class="text-xs text-gray-500">
        ({{ $t("payment.manual") || "manual" }})
      </span>
    </div>

    <div v-if="discountError" class="text-red-500 dark:text-red-400 text-sm">
      {{ discountError }}
    </div>

    <!-- Manual-not-allowed hint -->
    <div v-if="!canManual" class="text-xs text-gray-500 dark:text-gray-400">
      {{
        $t("payment.manual_disabled_hint") ||
        "Manual discounts may be restricted to managers."
      }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
const { locale } = useI18n();

const props = defineProps({
  promoCode: String,
  discount: Object, // { mode:'code'|'manual', type:'percent'|'amount', value:number, code?:string }
  discountError: String,
  canManual: { type: Boolean, default: true },
});
const emit = defineEmits(["apply", "clear"]);

const mode = ref("code"); // 'code' | 'percent' | 'amount'

// Local inputs
const localPromoCode = ref(props.promoCode || "");
const percent = ref(null);
const amount = ref(null);

// Sync promo code from parent
watch(
  () => props.promoCode,
  (v) => (localPromoCode.value = v || "")
);

// Helper: any active value present?
const hasAnyValue = computed(() => {
  if (mode.value === "code") return !!localPromoCode.value?.trim();
  if (mode.value === "percent")
    return percent.value != null && percent.value !== "";
  if (mode.value === "amount")
    return amount.value != null && amount.value !== "";
  return false;
});

// Display summary
const discountSummary = computed(() => {
  if (!props.discount) return "";
  if (props.discount.type === "percent") return `${props.discount.value}% off`;
  if (props.discount.type === "amount") return `$${props.discount.value} off`;
  return "";
});

// Emitters
const applyCode = () => {
  const code = (localPromoCode.value || "").trim();
  emit("apply", { mode: "code", code });
};

const applyPercent = () => {
  const v = Number(percent.value);
  emit("apply", { mode: "percent", value: v });
};

const applyAmount = () => {
  const v = Number(amount.value);
  emit("apply", { mode: "amount", value: v });
};
</script>

<style scoped>
/* Khmer-friendly font stack for this section */
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>
