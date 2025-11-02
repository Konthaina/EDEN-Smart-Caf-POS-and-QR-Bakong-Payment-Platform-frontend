\
<template>
  <AppLayout>
    <div
      class="min-h-screen p-4 sm:p-6 space-y-4 sm:space-y-6 print:p-0 print:bg-white dark:bg-gray-900"
    >
      <!-- ===== Back row (always on top) ===== -->
      <div class="print:hidden flex items-center">
        <button
          @click="$router.back()"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-700 dark:text-purple-300"
          title="Back (Esc)"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ $t("order.detail.back") || "Back" }}</span>
        </button>
      </div>

      <!-- ===== Header ===== -->
      <div
        class="print:hidden relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800/60 border border-indigo-100/70 dark:border-gray-700 shadow-sm"
      >
        <div class="p-5 sm:p-6 flex items-start justify-between gap-4">
          <div class="space-y-2">
            <div
              class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
            >
              <RouterLink :to="{ name: 'Orders' }" class="hover:underline"
                >Orders</RouterLink
              >
              <span>/</span>
              <span>Detail</span>
            </div>

            <div class="flex items-center gap-3">
              <h1
                class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
              >
                Order
                <span
                  v-if="order?.order_code"
                  class="text-indigo-600 dark:text-indigo-300"
                  >#{{ order.order_code }}</span
                >
              </h1>

              <!-- Status chip -->
              <span
                v-if="order"
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
                :class="statusChipClass(order.status)"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="dotClass(order.status)"
                ></span>
                {{ friendlyStatus(order.status) }}
              </span>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-300">
              Review items, totals, and take actions.
            </p>

            <div
              v-if="order"
              class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400"
            >
              <div class="inline-flex items-center gap-2">
                <CalendarIcon class="w-4 h-4" />
                <span>{{ formatDate(order.created_at) }}</span>
              </div>
              <div class="inline-flex items-center gap-2">
                <UserIcon class="w-4 h-4" />
                <span>{{ order.user?.name || "—" }}</span>
              </div>
              <div class="inline-flex items-center gap-2">
                <CreditCardIcon class="w-4 h-4" />
                <span>{{ capitalize(order.payment_method) || "—" }}</span>
              </div>
            </div>
          </div>

          <!-- Header actions (desktop) -->
          <div class="hidden md:flex items-center gap-2">
            <button
              v-if="order && order.status === 'pending'"
              :disabled="acting"
              @click="openConfirm('accept')"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-sm shadow"
              title="Accept (A)"
            >
              <CheckIcon class="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              v-if="order && canCancel(order.status)"
              :disabled="acting"
              @click="openConfirm('cancel')"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-sm shadow"
              title="Cancel (C)"
            >
              <XMarkIcon class="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              @click="printReceipt"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              title="Print (P)"
            >
              <PrinterIcon class="w-4 h-4" />
              <span>{{ $t("order.detail.print") || "Print" }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ===== Loading ===== -->
      <div v-if="loading" class="print:hidden grid gap-4 md:grid-cols-3">
        <div
          class="md:col-span-2 h-64 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse"
        ></div>
        <div
          class="h-64 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse"
        ></div>
      </div>

      <!-- ===== Content ===== -->
      <div v-else-if="order" class="print:hidden grid gap-4 md:grid-cols-3">
        <!-- Items card -->
        <div
          class="md:col-span-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div
            class="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between"
          >
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              Items
            </h2>
            <span class="text-xs text-gray-500 dark:text-gray-400"
              >{{ order.order_items?.length || 0 }} item(s)</span
            >
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr class="text-gray-600 dark:text-gray-200 text-left">
                  <th class="px-5 py-3 font-semibold">Item</th>
                  <th class="px-5 py-3 font-semibold">Qty</th>
                  <th class="px-5 py-3 font-semibold">Price</th>
                  <th class="px-5 py-3 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr v-if="order.order_items?.length === 0">
                  <td
                    colspan="4"
                    class="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    No items in this order.
                  </td>
                </tr>
                <tr
                  v-for="item in order.order_items"
                  :key="item.id"
                  class="bg-white dark:bg-gray-800 even:bg-gray-50 dark:even:bg-gray-800/70"
                >
                  <td class="px-5 py-3 text-gray-800 dark:text-gray-100">
                    <div class="font-medium">
                      {{ item.menu_item?.name || "-" }}
                    </div>
                    <div
                      v-if="item.note"
                      class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                    >
                      Note: {{ item.note }}
                    </div>
                  </td>
                  <td class="px-5 py-3 text-gray-800 dark:text-gray-100">
                    {{ item.quantity }}
                  </td>
                  <td class="px-5 py-3 text-gray-800 dark:text-gray-100">
                    {{ money(item.price) }}
                  </td>
                  <td
                    class="px-5 py-3 font-semibold text-gray-900 dark:text-white"
                  >
                    {{ money(item.quantity * item.price) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals / info -->
        <div class="space-y-4">
          <!-- Totals panel -->
          <div
            class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div class="p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                Summary
              </h2>
            </div>
            <div class="p-4 space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">
                  {{ money(subtotalUSD) }}
                </span>
              </div>
              <div
                class="flex items-center justify-between"
                v-if="discountUSD > 0"
              >
                <span class="text-gray-500 dark:text-gray-400">Discount</span>
                <span class="font-medium text-rose-600"
                  >- {{ money(discountUSD) }}</span
                >
              </div>
              <div
                class="flex items-center justify-between"
                v-if="taxUSD > 0 || taxRate > 0"
              >
                <span class="text-gray-500 dark:text-gray-400">
                  Tax <span v-if="taxRate">({{ taxRate }}%)</span>
                </span>
                <span class="font-medium text-gray-900 dark:text-gray-100"
                  >+ {{ money(taxUSD) }}</span
                >
              </div>
              <div
                class="pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between"
              >
                <span class="text-gray-700 dark:text-gray-200 font-semibold"
                  >Total</span
                >
                <span class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ money(totalUSD) }}
                </span>
              </div>

              <div
                v-if="totalKHR"
                class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
              >
                <span>KHR (rate {{ exchangeRate || 0 }})</span>
                <span class="font-medium text-gray-800 dark:text-gray-200"
                  >{{ khr(totalKHR) }} ៛</span
                >
              </div>
            </div>
          </div>

          <!-- Quick info -->
          <div
            class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div class="p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                Details
              </h2>
            </div>
            <div class="p-4 grid grid-cols-1 gap-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Promo code</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{
                  order.promo_code || "-"
                }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Payment</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{
                  capitalize(order.payment_method) || "-"
                }}</span>
              </div>

              <!-- Cash-specific: tendered + change + paid_at -->
              <template v-if="isCash">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400"
                    >Tendered currency</span
                  >
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{
                    tenderedCurrency || "-"
                  }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400"
                    >Cash tendered</span
                  >
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{
                    hasCashData ? tenderedDisplay : "-"
                  }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Change</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{
                    hasCashData ? changeDisplay : "-"
                  }}</span>
                </div>

                <div
                  v-if="order.paid_at"
                  class="flex items-center justify-between"
                >
                  <span class="text-gray-500 dark:text-gray-400">Paid at</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{
                    formatDateTime(order.paid_at)
                  }}</span>
                </div>
              </template>

              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Created</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{
                  formatDate(order.created_at)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Receipt for print ===== -->
      <div v-if="order" class="hidden print:block print-area">
        <ReceiptPrint
          :cart="receiptCart"
          :user="user"
          :selectedMethod="order.payment_method"
          :orderId="order.id"
          :total="subtotalUSD"
          :discount="discountObj"
          :discountedTotal="totalUSD"
          :taxAmount="taxUSD"
          :taxRate="taxRate"
          :exchangeRate="exchangeRate"
          :totalKhr="totalKHR"
        />
      </div>

      <!-- ===== Empty / error fallback ===== -->
      <div
        v-else
        class="print:hidden text-center py-20 text-gray-500 dark:text-gray-400"
      >
        {{ $t("order.detail.loading") || "Loading…" }}
      </div>

      <!-- ===== Sticky mobile actions ===== -->
      <div
        class="md:hidden fixed bottom-3 left-3 right-3 z-40 print:hidden"
        v-if="order"
      >
        <div
          class="rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-lg p-2 flex gap-2"
        >
          <button
            @click="$router.back()"
            class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-700 dark:text-purple-300"
            title="Back (Esc)"
          >
            <ArrowLeftIcon class="w-5 h-5" /><span>Back</span>
          </button>
          <button
            @click="printReceipt"
            class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            title="Print (P)"
          >
            <PrinterIcon class="w-5 h-5" /><span>Print</span>
          </button>
          <button
            v-if="order.status === 'pending'"
            :disabled="acting"
            @click="openConfirm('accept')"
            class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-sm shadow"
            title="Accept (A)"
          >
            <CheckIcon class="w-5 h-5" /><span>Accept</span>
          </button>
          <button
            v-if="canCancel(order.status)"
            :disabled="acting"
            @click="openConfirm('cancel')"
            class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-sm shadow"
            title="Cancel (C)"
          >
            <XMarkIcon class="w-5 h-5" /><span>Cancel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Confirm Modal ===== -->
    <transition name="fade">
      <div
        v-if="confirm.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden"
      >
        <div class="absolute inset-0 bg-black/40"></div>
        <div
          class="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md p-5 shadow-xl"
        >
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            {{ confirm.type === "accept" ? "Accept Order" : "Cancel Order" }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-5">
            {{
              confirm.type === "accept"
                ? "Are you sure you want to accept this pending order?"
                : "Are you sure you want to cancel this order?"
            }}
          </p>
          <div class="flex items-center justify-end gap-2">
            <button
              @click="closeConfirm"
              class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Close
            </button>
            <button
              :disabled="acting"
              @click="confirm.type === 'accept' ? acceptOrder() : cancelOrder()"
              class="px-3 py-2 rounded-xl text-white text-sm shadow disabled:opacity-60"
              :class="
                confirm.type === 'accept'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              "
            >
              {{ confirm.type === "accept" ? "Accept" : "Cancel" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useRoute, RouterLink, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/plugins/axios";
import AppLayout from "@/components/Common/AppLayout.vue";
import ReceiptPrint from "@/components/POS/ReceiptPrint.vue";

/* Heroicons */
import {
  PrinterIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  CreditCardIcon,
} from "@heroicons/vue/24/outline";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const orderId = route.params.id;
const order = ref(null);
const user = ref(null);
const acting = ref(false);
const loading = ref(true);

/* Confirm modal state */
const confirm = ref({ open: false, type: "accept" });
const openConfirm = (type) => {
  confirm.value = { open: true, type };
};
const closeConfirm = () => {
  confirm.value.open = false;
};

/* Fetch order */
const fetchOrder = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/orders/${orderId}`);
    order.value = res.data;
    if (order.value?.user_id) {
      try {
        const userRes = await api.get(`/users/${order.value.user_id}`);
        user.value = userRes.data;
      } catch {
        user.value = null;
      }
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || "Failed to load order");
  } finally {
    loading.value = false;
  }
};
onMounted(fetchOrder);

/* ===== Actions ===== */
const updateStatus = async (newStatus, successMsg) => {
  acting.value = true;
  try {
    await api.put(`/orders/${orderId}`, { status: newStatus });
    if (order.value) order.value.status = newStatus;
    toast.success(successMsg || "Status updated");
    closeConfirm();
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to update status");
  } finally {
    acting.value = false;
  }
};
const acceptOrder = async () => {
  if (!order.value || order.value.status !== "pending") return;
  await updateStatus("completed", "Order accepted (completed)");
};
const cancelOrder = async () => {
  if (!order.value || order.value.status !== "pending") return;
  await updateStatus("cancelled", "Order cancelled");
};
const canCancel = (status) => status === "pending";

/* ===== Helpers ===== */
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
const money = (n) => usd.format(Number(n || 0));
const khr = (n) => Number(n || 0).toLocaleString("en-KH");
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

/* ===== Receipt data ===== */
const receiptCart = computed(() =>
  order.value?.order_items
    ? order.value.order_items.map((item) => ({
        id: item.id,
        name: item.menu_item?.name || "-",
        qty: item.quantity,
        price: item.price,
        customizations: item.customizations || [],
        note: item.note || "",
      }))
    : []
);
const discountObj = computed(() => {
  if (!order.value) return {};
  return {
    value: Number(order.value.discount_amount || 0),
    type:
      order.value.discount_type ||
      (Number(order.value.discount_amount || 0) > 0 ? "fixed" : null),
  };
});

/* ===== Amounts (computed safely) ===== */
const itemsSubtotal = computed(() => {
  const items = order.value?.order_items || [];
  return items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.price || 0),
    0
  );
});
const discountUSD = computed(() => Number(order.value?.discount_amount || 0));
const taxRate = computed(() => {
  const r = Number(order.value?.tax_rate ?? 0);
  return isNaN(r) ? 0 : r;
});
const taxUSD = computed(() => {
  const backend = order.value?.tax_amount;
  if (backend !== undefined && backend !== null) return Number(backend) || 0;
  const base = Math.max(0, itemsSubtotal.value - discountUSD.value);
  return +(base * (taxRate.value / 100)).toFixed(2);
});
const subtotalUSD = computed(() => +itemsSubtotal.value.toFixed(2));
const totalUSD = computed(() => {
  const backend = order.value?.total_amount;
  if (backend !== undefined && backend !== null) return Number(backend) || 0;
  return +(
    Math.max(0, itemsSubtotal.value - discountUSD.value) + taxUSD.value
  ).toFixed(2);
});
// Support both naming styles from backend
const exchangeRate = computed(() => {
  const v =
    order.value?.exchange_rate ?? order.value?.exchange_rate_usd_khr ?? 0;
  return Number(v) || 0;
});
const totalKHR = computed(() => {
  const v = order.value?.total_khr ?? order.value?.total_in_khr;
  if (v !== undefined && v !== null) return Number(v) || 0;
  return Math.round(totalUSD.value * exchangeRate.value) || 0;
});

/* ===== Cash fields from backend (tendered + change) ===== */
const isCash = computed(() => {
  const m = String(order.value?.payment_method || "").toLowerCase();
  return m === "cash";
});
const tenderedCurrency = computed(() => order.value?.tendered_currency || null);
const tenderedUSD = computed(() => Number(order.value?.cash_tendered_usd ?? 0));
const tenderedKHR = computed(() => Number(order.value?.cash_tendered_khr ?? 0));
const changeUSD = computed(() => Number(order.value?.change_usd ?? 0));
const changeKHR = computed(() => Number(order.value?.change_khr ?? 0));
const hasCashData = computed(
  () =>
    isCash.value &&
    ((tenderedCurrency.value === "USD" && tenderedUSD.value > 0) ||
      (tenderedCurrency.value === "KHR" && tenderedKHR.value > 0))
);
const tenderedDisplay = computed(() => {
  if (!hasCashData.value) return "-";
  return tenderedCurrency.value === "USD"
    ? money(tenderedUSD.value)
    : `${khr(tenderedKHR.value)} ៛`;
});
const changeDisplay = computed(() => {
  if (!hasCashData.value) return "-";
  return tenderedCurrency.value === "USD"
    ? money(changeUSD.value)
    : `${khr(changeKHR.value)} ៛`;
});
const formatDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso || "-";
  }
};

/* Status visuals */
const statusChipClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/40";
    case "completed":
      return "bg-white dark:bg-gray-800 text-emerald-800 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/40";
    case "cancelled":
      return "bg-white dark:bg-gray-800 text-rose-800 dark:text-rose-300 border-rose-200/70 dark:border-rose-900/40";
    default:
      return "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  }
};
const dotClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-500";
    case "completed":
      return "bg-emerald-500";
    case "cancelled":
      return "bg-rose-500";
    default:
      return "bg-gray-400";
  }
};
const friendlyStatus = (s) => {
  if (s === "pending") return "Pending";
  if (s === "completed") return "Completed";
  if (s === "cancelled") return "Cancelled";
  return capitalize(s);
};

/* Print */
const printReceipt = () => window.print();

/* ===== Keyboard shortcuts =====
   A: accept, C: cancel, P: print, Esc: back
*/
const handleKeys = (e) => {
  if (e.key === "Escape") {
    router.back();
    return;
  }
  if (!order.value) return;
  const k = e.key.toLowerCase();
  if (k === "p") {
    printReceipt();
  } else if (k === "a" && order.value.status === "pending" && !acting.value) {
    openConfirm("accept");
  } else if (k === "c" && canCancel(order.value.status) && !acting.value) {
    openConfirm("cancel");
  }
};
onMounted(() => window.addEventListener("keydown", handleKeys));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKeys));
</script>

<style scoped>
/* modal fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* print styles */
@media print {
  .print\:hidden {
    display: none !important;
  }
  .print\:block {
    display: block !important;
  }

  html,
  body {
    background: white !important;
    margin: 0;
    padding: 0;
    font-size: 12px !important;
    font-family: monospace !important;
    width: 100% !important;
    height: auto !important;
  }
  body * {
    visibility: hidden;
  }

  .print-area,
  .print-area * {
    visibility: visible !important;
  }

  .print-area {
    width: 280px;
    margin: 0 auto;
    padding: 4px 12px;
    box-sizing: border-box;
  }

  @page {
    size: 80mm auto;
    margin: 0;
  }
}
</style>
