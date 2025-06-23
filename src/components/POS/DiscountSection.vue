<template>
  <div class="space-y-4 mt-6">
    <div>
      <p class="text-sm font-medium mb-1">{{ $t("payment.promo_code") }}</p>
      <div class="flex gap-2">
        <input
          v-model="promoCode"
          type="text"
          :placeholder="$t('payment.enter_code')"
          class="bg-gray-100 px-4 py-2 rounded-lg w-full outline-none text-sm"
        />
        <button
          @click="$emit('apply', promoCode)"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          {{ $t("common.apply") }}
        </button>
      </div>
      <div v-if="discount" class="text-green-600 text-sm mt-1">
        {{ discountSummary }}
      </div>
      <div v-if="discountError" class="text-red-500 text-sm mt-1">
        {{ discountError }}
      </div>
    </div>

    <div>
      <p class="text-sm font-medium mb-1">Manual Discount %</p>
      <input
        v-model="localManual"
        type="number"
        class="bg-gray-100 px-4 py-2 rounded-lg w-full outline-none text-sm"
        @input="$emit('update:manualDiscount', parseFloat(localManual) || 0)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  promoCode: String,
  discount: Object,
  discountError: String,
  manualDiscount: Number,
});

const promoCode = ref(props.promoCode || "");
const localManual = ref(props.manualDiscount || 0);
watch(() => props.manualDiscount, (val) => localManual.value = val);

const discountSummary = computed(() =>
  !props.discount
    ? ""
    : props.discount.type === "percent"
    ? `${props.discount.value}% off`
    : `$${props.discount.value} off`
);
</script>
