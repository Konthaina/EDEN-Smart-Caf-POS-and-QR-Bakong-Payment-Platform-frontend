<template>
  <teleport to="body">
    <div
      v-show="visible"
      :lang="locale"
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center khmer-support"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-[90%] max-w-6xl h-[90%] flex overflow-hidden relative text-gray-800 dark:text-gray-100"
      >
        <!-- Left: Payment Methods + Discounts -->
        <div class="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6">
          <!-- Settings Summary -->
          <div
            class="mb-4 flex flex-col gap-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2 text-[15px] text-gray-700 dark:text-gray-200 shadow-sm"
          >
            <div>
              <span class="font-semibold">{{ $t("pos.taxRate") }}:</span>
              <span>{{ taxRate }}%</span>
            </div>
            <div>
              <span class="font-semibold">{{ $t("pos.exchangeRate") }}:</span>
              <span> 1 USD = {{ formatNumber(exchangeRate) }} ៛ </span>
            </div>
          </div>

          <PaymentMethods
            ref="paymentMethodRef"
            :selected-method="selectedMethod"
            v-model:amount="amount"
            v-model:currency="selectedCurrency"
            :exchange-rate="exchangeRate"
            :method-error="methodError"
            :change-amount="changeAmountUSD"
            :due-usd="discountedTotal"
            @select="selectMethod"
            @bakongQr="handleQrPopup"
            @bakongSuccess="handlePaymentSuccess"
          />

          <DiscountSection
            :promoCode="promoCode"
            :discount="discount"
            :discountError="discountError"
            :canManual="canManualDiscount"
            @apply="applyDiscount"
            @clear="clearDiscount"
          />
        </div>

        <!-- Right: Cart Summary -->
        <CartSummary
          :cart="cart"
          :total="total"
          :discount="discount"
          :discountedTotal="discountedTotal"
          :discountText="discountText"
          :taxAmount="taxAmount"
          :taxRate="taxRate"
          :totalKhr="totalKhr"
          :selected-method="selectedMethod"
          :tendered-amount="displayTenderedForSummary"
          @close="close"
          @pay="submitPayment"
        />

        <!-- Receipt Print (only when orderId is set) -->
        <ReceiptPrint
          v-if="orderId"
          :cart="cart"
          :user="user"
          :selectedMethod="selectedMethod"
          :orderId="orderId"
          :total="total"
          :discount="discount"
          :discountedTotal="discountedTotal"
          :taxAmount="taxAmount"
          :taxRate="taxRate"
          :exchangeRate="exchangeRate"
          :totalKhr="totalKhr"
        />

        <!-- KHQR Modal -->
        <div
          v-if="showQrPopup && qrCode"
          :lang="locale"
          class="fixed inset-0 z-[60] bg-black bg-opacity-70 flex items-center justify-center khmer-support"
        >
          <div
            class="bg-white dark:bg-gray-900 w-[300px] rounded-[20px] overflow-hidden shadow-xl text-center relative"
          >
            <div
              class="bg-[#D00000] dark:bg-[#8d1717] text-white text-[20px] font-bold py-3 px-4"
            >
              KHQR
            </div>

            <div class="px-12 pt-4 pb-2 text-left">
              <p class="font-bold text-[16px] text-gray-900 dark:text-gray-100">
                Eden Coffee
              </p>
              <p class="text-[25px] font-medium text-black dark:text-white">
                {{ formatNumber(discountedTotal) }}
                <span class="text-[16px] text-gray-600 dark:text-gray-300 ml-1">
                  {{ selectedCurrency }}
                </span>
              </p>
              <p
                v-if="discount && discountText"
                class="text-xs text-gray-500 mt-1"
              >
                {{ $t("pos.discount") || "Discount" }}: {{ discountText }}
              </p>
            </div>

            <div
              class="border-t border-dashed border-gray-300 dark:border-gray-600 mx-6 my-2"
            ></div>

            <div class="pt-4 pb-2 px-4 relative w-fit mx-auto">
              <QrcodeVue :value="qrCode" :size="200" />
              <img
                :src="currencyLogo"
                class="w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-full shadow-md border dark:border-gray-800"
              />
            </div>

            <p class="text-[13px] text-gray-600 dark:text-gray-300 pt-2 pb-5">
              {{ $t("pos.scanToPay") }}
            </p>

            <button
              @click="cancelQr"
              class="absolute top-3 right-3 w-7 h-7 text-white font-bold"
              style="background: transparent"
            >
              &times;
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import api from "@/plugins/axios";
import { usePOSStore } from "@/store/pos";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import QrcodeVue from "qrcode.vue";
import PaymentMethods from "@/components/POS/PaymentMethods.vue";
import DiscountSection from "@/components/POS/DiscountSection.vue";
import CartSummary from "@/components/POS/CartSummary.vue";
import ReceiptPrint from "@/components/POS/ReceiptPrint.vue";
import useSettings from "@/composables/useSettings";
import { publicUrl } from "@/config/urls";

const { t, locale } = useI18n();
const toast = useToast();

/** ------- RULES ------- **
 * Max tendered per order = max(MIN_CAP, 2 × order_due)
 * MIN_CAP: $100 or ៛100,000
 */
const USD_MIN_CAP = 100;
const KHR_MIN_CAP = 100_000;
const CHANGE_FACTOR = 2;

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["close", "success"]);

const { cart, clearCart } = usePOSStore();

const user = ref(null);
const selectedMethod = ref(null);
/** Parent canonical tendered amount (USD) */
const amount = ref(""); // always USD
const promoCode = ref("");
const discount = ref(null);
const discountError = ref("");
const methodError = ref("");
const orderId = ref(null);
const selectedCurrency = ref("USD"); // 'USD' | 'KHR'

const qrCode = ref(null);
const showQrPopup = ref(false);
const polling = ref(null);
const bakongMd5 = ref(null);

/** ensure we print only once */
const hasPrinted = ref(false);

const { settings, fetchSettings } = useSettings();

const taxRate = computed(() => parseFloat(settings.value.tax_rate) || 0);
const exchangeRate = computed(
  () => parseFloat(settings.value.exchange_rate_usd_khr) || 4100
);
const currencyLogo = computed(() =>
  selectedCurrency.value === "KHR"
    ? publicUrl("khr-logo.png")
    : publicUrl("usd-logo.png")
);

/* who can use manual discount (UI hint only; server must enforce) */
const canManualDiscount = computed(() => {
  const r = String(
    user.value?.role?.name || user.value?.role || ""
  ).toLowerCase();
  return r === "admin" || r === "super admin" || r === "super_admin";
});

/* ---------- PRICE HELPERS ---------- */
function effectivePrice(p) {
  if (p?.has_active_discount && p?.final_price != null)
    return Number(p.final_price);
  if (p?.discount_type && p?.discount_value != null) {
    const base = Number(p?.price || 0);
    if (p.discount_type === "percent") {
      return Math.max(
        0,
        +(base - base * (Number(p.discount_value) / 100)).toFixed(2)
      );
    }
    return Math.max(0, +(base - Number(p.discount_value)).toFixed(2));
  }
  return Number(p?.price || 0);
}
function linePrice(item) {
  if (item?.unit_price != null) return Number(item.unit_price);
  return effectivePrice(item);
}

/* ---------- TOTALS ---------- */
const total = computed(() =>
  cart.reduce((sum, item) => sum + (item.qty || 0) * linePrice(item), 0)
);

const discountAmount = computed(() => {
  const val = total.value;
  if (!discount.value) return 0;
  if (discount.value.type === "percent") {
    const pct = Math.min(Math.max(Number(discount.value.value) || 0, 0), 100);
    return +(val * (pct / 100)).toFixed(2);
  }
  if (discount.value.type === "amount") {
    const flat = Math.max(Number(discount.value.value) || 0, 0);
    return Math.min(flat, val);
  }
  return 0;
});

const subtotalAfterDiscount = computed(
  () => total.value - discountAmount.value
);
const taxAmount = computed(
  () => +(subtotalAfterDiscount.value * (taxRate.value / 100)).toFixed(2)
);
const discountedTotal = computed(
  () => +(subtotalAfterDiscount.value + taxAmount.value).toFixed(2)
);
const totalKhr = computed(() =>
  exchangeRate.value && discountedTotal.value
    ? Math.round(discountedTotal.value * exchangeRate.value)
    : 0
);

/** Derived displays for CartSummary */
const displayTenderedForSummary = computed(() => {
  if (selectedCurrency.value === "USD")
    return Number(amount.value || 0).toFixed(2);
  const khr = Math.round((Number(amount.value) || 0) * exchangeRate.value);
  return khr.toLocaleString("en-US") + " ៛";
});

/** USD change (canonical). Child will convert to KHR for display if needed. */
const changeAmountUSD = computed(() => {
  if (selectedMethod.value !== "cash") return "0.00";
  const paidUSD = Number(amount.value || 0);
  return paidUSD > discountedTotal.value
    ? (paidUSD - discountedTotal.value).toFixed(2)
    : "0.00";
});

const discountText = computed(() => {
  if (!discount.value) return "";
  if (discount.value.type === "percent") return `${discount.value.value}%`;
  if (discount.value.type === "amount") return `$${discount.value.value}`;
  return "";
});

/* ---------- Dynamic per-order maxima (must mirror child) ---------- */
const maxUsdAllowed = computed(() =>
  Math.max(USD_MIN_CAP, +(discountedTotal.value * CHANGE_FACTOR).toFixed(2))
);
const maxKhrAllowed = computed(() =>
  Math.max(KHR_MIN_CAP, Math.round(totalKhr.value * CHANGE_FACTOR))
);

/* init */
onMounted(async () => {
  await fetchSettings();
  try {
    const res = await api.get("/me");
    user.value = res.data;
  } catch (e) {
    console.error("Load user failed", e);
  }
});
watch(cart, (val) => val.length === 0 && close());
watch(showQrPopup, (v) => (document.body.style.overflow = v ? "hidden" : ""));

const close = () => {
  emit("close");
  orderId.value = null;
};

const selectMethod = (m) => {
  selectedMethod.value = m;
  methodError.value = "";
};

/* discounts */
const applyDiscount = async (payload) => {
  discountError.value = "";

  if (typeof payload === "string") {
    const code = (payload || "").trim();
    promoCode.value = code;
    if (!code) {
      discount.value = null;
      return;
    }
    try {
      const res = await api.get(`/discounts/validate?code=${code}`);
      discount.value = {
        mode: "code",
        type: res.data.type,
        value: res.data.value,
        code,
      };
    } catch {
      discount.value = null;
      discountError.value = t("pos.invalidCode");
    }
    return;
  }

  if (!payload || !payload.mode) return;

  if (payload.mode === "code") {
    const code = (payload.code || "").trim();
    promoCode.value = code;
    if (!code) {
      discount.value = null;
      return;
    }
    try {
      const res = await api.get(`/discounts/validate?code=${code}`);
      discount.value = {
        mode: "code",
        type: res.data.type,
        value: res.data.value,
        code,
      };
    } catch {
      discount.value = null;
      discountError.value = t("pos.invalidCode");
    }
    return;
  }

  if (
    (payload.mode === "percent" || payload.mode === "amount") &&
    !canManualDiscount.value
  ) {
    discountError.value =
      t("pos.unauthorized") || "You are not allowed to apply manual discount.";
    return;
  }

  if (payload.mode === "percent") {
    const v = Number(payload.value);
    if (isNaN(v) || v < 0 || v > 100) {
      discountError.value =
        t("pos.invalidPercent") || "Invalid percent (0–100).";
      return;
    }
    promoCode.value = "";
    discount.value = { mode: "manual", type: "percent", value: v };
    return;
  }

  if (payload.mode === "amount") {
    const v = Number(payload.value);
    if (isNaN(v) || v < 0) {
      discountError.value = t("pos.invalidAmount") || "Invalid amount.";
      return;
    }
    promoCode.value = "";
    discount.value = { mode: "manual", type: "amount", value: +v.toFixed(2) };
    return;
  }
};

const clearDiscount = () => {
  promoCode.value = "";
  discount.value = null;
  discountError.value = "";
};

const cancelQr = () => {
  showQrPopup.value = false;
  if (polling.value) clearInterval(polling.value);
  polling.value = null;
};

const handleQrPopup = (qr) => {
  qrCode.value = qr;
  showQrPopup.value = true;
};

const handlePaymentSuccess = () => {
  showQrPopup.value = false;
  emit("success");
};

/* formatting */
function formatNumber(num) {
  try {
    const loc = locale.value === "km" ? "km-KH" : undefined;
    return Number(num).toLocaleString(loc);
  } catch {
    return Number(num).toLocaleString();
  }
}

/* ---------- order payload (INCLUDES VARIANT) ---------- */
function buildOrderBody() {
  const items = cart.map((i) => {
    const menu_item_id = Number(i.id);
    const quantity = parseInt(i.qty, 10) || 1;

    const base = {
      menu_item_id,
      quantity,
      customizations: Array.isArray(i.customizations) ? i.customizations : [],
      note: typeof i.note === "string" ? i.note : "",
    };

    if (i.variant_id != null && i.variant_id !== "") {
      base.menu_item_variant_id = Number(i.variant_id);
    }
    return base;
  });

  const body = { items };

  if (discount.value?.mode === "code" && promoCode.value) {
    body.code = promoCode.value;
  } else if (discount.value?.mode === "manual") {
    if (discount.value.type === "percent") {
      body.rt_discount_percent = Number(discount.value.value);
    } else if (discount.value.type === "amount") {
      body.rt_discount_amount = Number(discount.value.value);
    }
  }

  return body;
}

/* payment payload (legacy for KHQR -> /payments) */
function getPaymentPayload(orderId, method, transaction_id = null) {
  return {
    order_id: orderId,
    method,
    amount: discountedTotal.value,
    tax_amount: taxAmount.value,
    exchange_rate: exchangeRate.value,
    total_khr: totalKhr.value,
    transaction_id,
    note: `Paid via ${method.toUpperCase()}${
      discount.value?.mode === "code" && promoCode.value
        ? ` (Code: ${promoCode.value})`
        : ""
    }`,
  };
}

/* ---- helpful extractor so the toast shows the real backend reason ---- */
function extractServerMessage(err, fallback = "Payment failed.") {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) {
    if (data?.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first[0]) {
        return `${data.message}: ${first[0]}`;
      }
    }
    return data.message;
  }
  return err?.message || fallback;
}

/* ===== Validation helpers ===== */
const dueUSD = computed(() => discountedTotal.value);
const dueKHR = computed(() => totalKhr.value);

/** check sufficient cash against selected currency */
function hasSufficientCash(paidUSD) {
  if (selectedCurrency.value === "USD") {
    return paidUSD + 1e-9 >= dueUSD.value;
  } else {
    const paidKHR = Math.round((paidUSD || 0) * exchangeRate.value);
    return paidKHR >= dueKHR.value;
  }
}

function exceedsPerOrderMax(paidUSD) {
  if (selectedCurrency.value === "USD") return paidUSD > maxUsdAllowed.value;
  const paidKHR = Math.round((paidUSD || 0) * exchangeRate.value);
  return paidKHR > maxKhrAllowed.value;
}

const submitPayment = async () => {
  if (!selectedMethod.value) {
    methodError.value = t("pos.selectMethod");
    return;
  }

  const totalDueUSD = Number(dueUSD.value) || 0;
  if (!(totalDueUSD > 0)) {
    toast.error(t("pos.invalidAmount"));
    return;
  }

  if (String(selectedMethod.value).toLowerCase() === "cash") {
    const paidUSD = Number(amount.value) || 0;

    // Per-order cap check
    if (exceedsPerOrderMax(paidUSD)) {
      if (selectedCurrency.value === "USD") {
        toast.error(
          `Max for this order is $${maxUsdAllowed.value.toFixed(
            2
          )} (min cap $${USD_MIN_CAP}).`
        );
      } else {
        toast.error(
          `Max for this order is ${maxKhrAllowed.value.toLocaleString(
            "en-US"
          )} ៛ (min cap ${KHR_MIN_CAP.toLocaleString("en-US")} ៛).`
        );
      }
      return;
    }

    // Sufficient cash?
    if (!hasSufficientCash(paidUSD)) {
      toast.error(
        t("payment.insufficient_cash") || "Insufficient cash provided."
      );
      return;
    }

    return handleCashPayment();
  }

  if (String(selectedMethod.value).toLowerCase() === "khqr") {
    try {
      const qrRes = await api.post("/bakong/generate-qr", {
        amount: totalDueUSD, // pay exactly the due
        currency: selectedCurrency.value,
      });
      qrCode.value = qrRes.data.qr_string;
      bakongMd5.value = qrRes.data.md5;
      showQrPopup.value = true;
      startPollingBakong(qrRes.data.md5);
    } catch (error) {
      console.error("KHQR generation failed:", error);
      toast.error(extractServerMessage(error, t("pos.khqrFailed")));
    }
    return;
  }

  toast.error(t("pos.methodNotSupported") || "Payment method not supported.");
};

/** CASH: create pending order, then finalize with /orders/{id}/pay-cash */
const handleCashPayment = async () => {
  try {
    // 1) Create the order (PENDING)
    const orderRes = await api.post("/orders", buildOrderBody());
    const created = orderRes.data;
    const rawOrderId = created.id;
    orderId.value = ((rawOrderId - 1) % 200) + 1;

    // 2) Finalize with cash (server computes & stores tendered/change)
    const paidUSD = Number(amount.value || 0);
    const tendered =
      selectedCurrency.value === "USD"
        ? paidUSD
        : Math.round(paidUSD * exchangeRate.value);

    await api.post(`/orders/${rawOrderId}/pay-cash`, {
      tendered_amount: tendered,
      currency: selectedCurrency.value, // 'USD' or 'KHR'
    });

    // 3) Print receipt, clear cart, done (guard against double print)
    await nextTick();
    setTimeout(() => {
      if (hasPrinted.value) return;
      hasPrinted.value = true;

      clearCart();
      window.onafterprint = () => {
        location.reload();
        orderId.value = null;
      };
      window.print();
    }, 200);
  } catch (error) {
    console.error("Cash payment failed:", error?.response?.data || error);
    toast.error(extractServerMessage(error, t("pos.paymentFailed")));
  }
};

const startPollingBakong = (md5) => {
  if (polling.value) clearInterval(polling.value);
  let attempts = 0;

  polling.value = setInterval(async () => {
    try {
      const res = await api.get("/bakong/verify/md5", { params: { md5 } });
      const txn = res.data.result;

      if (
        txn &&
        txn.md5 === md5 &&
        txn.raw_response?.responseCode === 0 &&
        txn.raw_response?.data
      ) {
        clearInterval(polling.value);
        polling.value = null;

        const orderRes = await api.post("/orders", buildOrderBody());
        const rawOrderId = orderRes.data.id;
        orderId.value = ((rawOrderId - 1) % 200) + 1;

        await api.post(
          "/payments",
          getPaymentPayload(rawOrderId, "khqr", txn.bill || `TXN-${Date.now()}`)
        );

        // Print (guard)
        await nextTick();
        setTimeout(() => {
          if (hasPrinted.value) return;
          hasPrinted.value = true;

          window.onafterprint = () => {
            location.reload();
            orderId.value = null;
          };
          window.print();
          clearCart();
          emit("success");
        }, 300);
      } else if (++attempts > 300) {
        clearInterval(polling.value);
        polling.value = null;
        toast.error(t("pos.paymentTimeout"));
      }
    } catch (err) {
      console.warn("Polling failed:", err?.response?.data || err.message);
    }
  }, 2000);
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang",
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.6;
}
</style>

<!-- global (not scoped) print CSS to hide toast UIs while printing -->
<style>
@media print {
  .Vue-Toastification__container,
  .Vue-Toastification__toast,
  #toast-container {
    display: none !important;
  }
}
</style>
