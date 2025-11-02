<template>
  <div class="menu-bg min-h-screen">
    <!-- Topbar -->
    <div class="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-20">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <h1 class="text-xl font-bold text-brown-900">My Order History</h1>
          <button
            @click="$router.push('/customer')"
            class="text-sm font-semibold text-orange-700 hover:text-orange-500"
          >
            &larr; Back to Menu
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div v-if="isLoading" class="text-center py-16">
        <p class="text-gray-500">Loading your orders...</p>
      </div>

      <div
        v-else-if="!orders.length"
        class="text-center bg-white/50 rounded-2xl p-12"
      >
        <p class="text-2xl font-semibold text-brown-800">No Orders Yet</p>
        <p class="text-gray-600 mt-2">
          Looks like you haven't placed any orders with us. Time for a coffee
          run!
        </p>
        <button @click="$router.push('/customer')" class="mt-6 btn-primary">
          Browse Menu
        </button>
      </div>
      <div v-else class="space-y-3">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="p-5">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-lg text-brown-900">
                  Order {{ order.order_code }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatDate(order.created_at) }}
                </p>
              </div>
              <div class="status-badge" :class="getStatusClass(order.status)">
                {{ order.status }}
              </div>
            </div>

            <div v-if="order.items && order.items.length > 0">
              <hr class="my-4 border-gray-200" />
              <div class="space-y-2 text-sm">
                <div
                  v-for="item in order.items.slice(0, 2)"
                  :key="item.id"
                  class="flex justify-between"
                >
                  <span class="text-gray-700"
                    >{{ item.menu_item.name }}
                    <span class="text-gray-400"
                      >&times;{{ item.quantity }}</span
                    ></span
                  >
                  <span class="text-gray-500">{{
                    formatCurrency(item.price * item.quantity)
                  }}</span>
                </div>
                <div
                  v-if="order.items.length > 2"
                  class="text-center text-gray-400 pt-1"
                >
                  ...and {{ order.items.length - 2 }} more item(s)
                </div>
              </div>
            </div>

            <hr class="my-4 border-gray-200" />
            <div class="flex justify-between items-center">
              <div>
                <span class="text-gray-600">Total:</span>
                <span class="font-bold text-xl text-orange-700 ml-2">{{
                  formatCurrency(order.total_amount)
                }}</span>
              </div>
              <div class="flex gap-3">
                <button
                  @click="openReorderModal(order)"
                  class="btn-secondary"
                  :disabled="isProcessing && currentReorderId === order.id"
                >
                  {{
                    isProcessing && currentReorderId === order.id
                      ? "..."
                      : "Reorder"
                  }}
                </button>
                <button @click="viewOrderDetails(order)" class="btn-primary">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Order Details Modal -->
    <div
      v-if="showDetailModal"
      class="modal-backdrop"
      @click="showDetailModal = false"
    >
      <div class="modal-content" @click.stop>
        <div v-if="!selectedOrderDetails" class="text-center p-8">
          Loading details...
        </div>
        <div v-else>
          <div class="text-center">
            <h2 class="modal-title">Order Details</h2>
            <p class="text-sm text-gray-500 -mt-2 mb-4">
              {{ selectedOrderDetails.order_code }} •
              {{ formatDate(selectedOrderDetails.created_at) }}
            </p>
          </div>

          <!-- Cart Items -->
          <div class="cart-items-container">
            <div
              v-for="item in selectedOrderDetails.items"
              :key="item.id"
              class="cart-item"
            >
              <img
                :src="
                  getImageUrl(
                    item.menu_item?.image || item.menuItem?.image || ''
                  )
                "
                class="cart-item-img"
                alt="Item image"
              />
              <div class="flex-1">
                <div class="cart-item-name">
                  {{
                    item.menu_item?.name ||
                    item.menuItem?.name ||
                    "Unknown Item"
                  }}
                </div>
                <div class="cart-item-price">
                  {{ item.quantity }} × {{ formatCurrency(item.price) }}
                </div>
              </div>
              <div class="cart-item-total">
                {{ formatCurrency(item.quantity * item.price) }}
              </div>
            </div>

            <div
              v-if="!selectedOrderDetails.items?.length"
              class="text-sm text-gray-500 py-2 text-center"
            >
              No items found for this order.
            </div>
          </div>

          <!-- Summary -->
          <div class="cart-summary">
            <div class="summary-line">
              <span>Subtotal</span
              ><span>{{
                formatCurrency(selectedOrderDetails.total_amount)
              }}</span>
            </div>
            <div
              v-if="selectedOrderDetails.discount_amount > 0"
              class="summary-line text-green-600"
            >
              <span>Discount</span
              ><span
                >-{{
                  formatCurrency(selectedOrderDetails.discount_amount)
                }}</span
              >
            </div>
            <div class="summary-line font-bold border-t pt-2 mt-2">
              <span>Total</span
              ><span>{{
                formatCurrency(
                  selectedOrderDetails.total_amount -
                    selectedOrderDetails.discount_amount
                )
              }}</span>
            </div>
          </div>

          <div class="modal-actions justify-center">
            <button @click="showDetailModal = false" class="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reorder Confirmation Modal (Custom Popup) -->
    <div v-if="showReorderConfirmModal" class="modal-backdrop">
      <div class="modal-content max-w-xs mx-auto" @click.stop>
        <div class="text-center">
          <div class="text-3xl mb-3 text-orange-700">⏎</div>
          <div class="font-semibold text-lg mb-2 text-brown-900">
            Reorder & Pay?
          </div>
          <div class="text-gray-600 mb-4">
            Would you like to reorder and pay for this order again?
          </div>
          <div class="flex gap-3 justify-center mt-5">
            <button
              class="btn-secondary"
              @click="showReorderConfirmModal = false"
            >
              Cancel
            </button>
            <button class="btn-primary" @click="reorder(queuedOrder)">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- KHQR Payment Modal for Reorder -->
    <div v-if="showKHQRModal" class="modal-backdrop">
      <div class="khqr-modal-content">
        <div class="khqr-header">KHQR</div>
        <button @click="cancelReorderPayment" class="khqr-close-btn">
          &times;
        </button>
        <div class="p-6 text-center">
          <p class="font-bold text-lg text-gray-800">Eden Coffee</p>
          <p class="text-4xl font-bold text-black my-1">
            {{ reorderAmount > 0 ? formatCurrency(reorderAmount) : "" }}
          </p>
          <hr class="khqr-separator" />
          <div v-if="qrCodeString" class="qr-code-wrapper">
            <qrcode-vue :value="qrCodeString" :size="220" level="H" />
            <img
              src="/bakong-logo.png"
              class="qr-code-center-logo"
              alt="Bakong Logo"
            />
          </div>
          <div v-else class="py-10">Generating QR Code...</div>
          <p class="text-sm text-gray-600 mt-4">{{ paymentStatus }}</p>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-backdrop">
      <div class="modal-content max-w-xs mx-auto text-center">
        <div class="text-5xl mb-2">✅</div>
        <div class="font-semibold text-xl mb-3 text-brown-900">
          Order Placed!
        </div>
        <div class="text-gray-700 mb-4">
          Your reorder was placed successfully.
        </div>
        <button class="btn-primary" @click="closeSuccessModal">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";
import { useRouter } from "vue-router";
import QrcodeVue from "qrcode.vue";

const router = useRouter();

const orders = ref([]);
const isLoading = ref(true);
const isReordering = ref(false);
const showDetailModal = ref(false);
const selectedOrderDetails = ref(null);
const currentUser = ref(null);

// --- KHQR Payment Modal State for Reorder ---
const showKHQRModal = ref(false);
const isProcessing = ref(false);
const qrCodeString = ref("");
const paymentStatus = ref("");
const currentReorderId = ref(null);
const reorderAmount = ref(0);
let pollingInterval = null;

// --- Confirmation and Success Modals ---
const showReorderConfirmModal = ref(false);
const showSuccessModal = ref(false);
const queuedOrder = ref(null);

// --- FETCH ORDERS ---
const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const [orderRes, userRes] = await Promise.all([
      axios.get("/orders"),
      axios.get("/me"),
    ]);
    currentUser.value = userRes.data.data || userRes.data;
    const allOrders = Array.isArray(orderRes.data.data)
      ? orderRes.data.data
      : orderRes.data;
    orders.value = allOrders
      .filter((order) => order.user_id === currentUser.value.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    orders.value = [];
  } finally {
    isLoading.value = false;
  }
};

const viewOrderDetails = async (order) => {
  selectedOrderDetails.value = null;
  showDetailModal.value = true;
  try {
    const orderRes = await axios.get(`/orders/${order.id}`);
    const orderData = orderRes.data.data || orderRes.data;
    const itemsRes = await axios.get("/order-items");
    const allItems = itemsRes.data.data || itemsRes.data;
    const items = allItems.filter((i) => i.order_id === order.id);
    orderData.items = items;
    selectedOrderDetails.value = orderData;
  } catch (error) {
    showDetailModal.value = false;
  }
};

// --- Custom Confirmation Modal logic ---
const openReorderModal = (order) => {
  queuedOrder.value = order;
  showReorderConfirmModal.value = true;
};

// --- REORDER (with KHQR payment first) ---
const reorder = async (order) => {
  showReorderConfirmModal.value = false;
  isProcessing.value = true;
  isReordering.value = true;
  currentReorderId.value = order.id;
  reorderAmount.value = order.total_amount;
  paymentStatus.value = "Generating QR Code...";
  showKHQRModal.value = true;

  try {
    const payload = { amount: order.total_amount, currency: "USD" };
    const { data } = await axios.post("/bakong/generate-qr", payload);
    qrCodeString.value = data.qr_string;
    paymentStatus.value = "Please scan the QR code to pay.";
    startPollingForReorderPayment(data.md5);
  } catch (error) {
    showKHQRModal.value = false;
    isProcessing.value = false;
    isReordering.value = false;
    // Optional: show fail modal or some error UI here
  }
};

const startPollingForReorderPayment = (md5) => {
  let attempts = 0;
  pollingInterval = setInterval(async () => {
    try {
      const { data } = await axios.get(`/bakong/verify/md5?md5=${md5}`);
      const txn = data.result;
      if (txn && txn.raw_response?.responseCode === 0) {
        handleReorderPaymentSuccess(txn);
      } else if (++attempts > 150) {
        cancelReorderPayment();
        // Optional: show payment timeout error modal here
      }
    } catch (error) {}
  }, 2000);
};

const handleReorderPaymentSuccess = async (txn) => {
  clearInterval(pollingInterval);
  paymentStatus.value = "Payment confirmed! Placing your order...";
  try {
    await axios.post("/orders/ai-reorder", {
      order_id: currentReorderId.value,
      transaction_id: txn.bill || `MD5-${txn.md5}`,
      payment_method: "khqr",
      status: "completed",
    });
    showKHQRModal.value = false;
    isProcessing.value = false;
    isReordering.value = false;
    showSuccessModal.value = true;
  } catch (error) {
    showKHQRModal.value = false;
    isProcessing.value = false;
    isReordering.value = false;
    // Optional: show fail modal or some error UI here
  }
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  router.push("/customer");
};

const cancelReorderPayment = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = null;
  isProcessing.value = false;
  showKHQRModal.value = false;
  qrCodeString.value = "";
  isReordering.value = false;
};

// --- UTILS ---
const getImageUrl = (img) => {
  if (!img) return "/menu.png";
  return img.startsWith("http") ? img : `http://127.0.0.1:8000/storage/${img}`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return (
    "$ " +
    (Number(amount) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const getStatusClass = (status) => {
  if (!status) return "status-default";
  const s = status.toLowerCase();
  if (s === "completed" || s === "paid") return "status-completed";
  if (s === "cancelled" || s === "failed") return "status-cancelled";
  if (s === "pending") return "status-pending";
  return "status-default";
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:wght@400;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap");

.menu-bg {
  background-color: #fdf9f4;
  font-family: "Quicksand", sans-serif;
}
.font-display {
  font-family: "Playfair Display", serif;
}
.font-serif {
  font-family: "Lora", serif;
}
.text-brown-900 {
  color: #4f311c;
}
.text-brown-800 {
  color: #6f4a2e;
}
.text-orange-700 {
  color: #c2410c;
}

.order-card {
  background-color: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 30px rgba(149, 119, 92, 0.1);
}
.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(149, 119, 92, 0.15);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}
.status-completed {
  background-color: #dcfce7;
  color: #166534;
}
.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}
.status-pending {
  background-color: #fef9c3;
  color: #854d0e;
}
.status-default {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-primary,
.btn-secondary {
  padding: 0.6rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}
.btn-primary {
  background-color: #f97316;
  color: white;
}
.btn-primary:hover {
  background-color: #ea580c;
}
.btn-secondary {
  background-color: #fff8ed;
  color: #f97316;
  border-color: #fdba74;
}
.btn-secondary:hover {
  background-color: #ffedd5;
}
.btn-secondary:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  border-color: #d1d5db;
  cursor: not-allowed;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}
.modal-content {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.modal-title {
  font-family: "Playfair Display", serif;
  font-size: 1.8rem;
  color: #4f311c;
}

.cart-items-container {
  overflow-y: auto;
  flex-shrink: 1;
  padding: 0.5rem;
  background-color: #fcf8f5;
  border-radius: 0.75rem;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
}
.cart-item:not(:last-child) {
  border-bottom: 1px solid #f3e5d8;
}
.cart-item-img {
  width: 50px;
  height: 50px;
  border-radius: 0.75rem;
  object-fit: cover;
}
.cart-item-name {
  font-weight: 600;
  color: #4f311c;
}
.cart-item-price {
  font-size: 0.9rem;
  color: #a1887f;
}
.cart-item-total {
  font-weight: 700;
  color: #4f311c;
  margin-left: auto;
}

.cart-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3e5d8;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

/* KHQR Modal Styles (same as in menu/modal) */
.khqr-modal-content {
  position: relative;
  background: #f7f8f9;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 340px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}
.khqr-header {
  background-color: #d00000;
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 0.75rem;
}
.khqr-close-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 48px;
  color: white;
  font-size: 28px;
  font-weight: 300;
  line-height: 48px;
  text-align: center;
  cursor: pointer;
  background: none;
  border: none;
}
.khqr-separator {
  border: none;
  border-top: 2px dashed #d1d5db;
  margin: 1.25rem 0;
}
.qr-code-wrapper {
  position: relative;
  display: inline-block;
  margin-top: 0.5rem;
}
.qr-code-center-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
