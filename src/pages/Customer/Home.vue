<template>
  <div class="menu-bg min-h-screen pb-28 relative flex flex-col">
    <!-- Slide Banner Section -->
    <div class="mt-6 mb-6 px-4">
      <div
        v-if="banners.length === 0"
        class="text-center text-sm text-gray-400"
      >
        No active banners available.
      </div>
      <Swiper
        :modules="[Autoplay, Pagination]"
        :slides-per-view="1"
        :loop="banners.length > 1"
        :autoplay="{ delay: 4000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="rounded-3xl overflow-hidden shadow-lg"
      >
        <SwiperSlide v-for="banner in banners" :key="banner.id">
          <div class="relative">
            <img
              :src="getImageUrl(banner.image)"
              alt="Banner Image"
              class="w-full h-40 sm:h-64 object-cover"
            />
            <div
              class="absolute bottom-0 w-full bg-gradient-to-t from-white via-white/80 to-transparent p-4"
            >
              <h3 class="text-xl font-semibold text-brown-900 truncate">
                {{ banner.title }}
              </h3>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                {{ banner.description }}
              </p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- Search -->
    <div class="flex justify-center px-4 mb-5">
      <input
        v-model="search"
        type="text"
        class="search-bar"
        placeholder="What would you like to drink today?"
      />
    </div>

    <!-- Category + Menu -->
    <div class="w-full flex justify-center px-4">
      <div class="w-full max-w-6xl">
        <div class="flex mb-5">
          <div class="flex gap-3 overflow-x-auto category-scroll pb-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.name"
              class="category-btn"
              :class="{ active: activeCategory === cat.name }"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <div
          v-if="filteredMenu.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          <div
            v-for="item in filteredMenu"
            :key="item.id"
            class="menu-card"
            @click="addToCart(item)"
          >
            <img :src="item.imageUrl" :alt="item.name" class="menu-card-img" />
            <div class="menu-card-body">
              <div class="menu-card-name">{{ item.name }}</div>
              <div class="menu-card-description" :title="item.description">
                {{ item.description }}
              </div>
              <span class="menu-card-price">{{
                formatCurrency(item.price)
              }}</span>
            </div>
            <button class="add-to-cart-btn">+</button>
          </div>
        </div>

        <div
          v-else
          class="text-center text-gray-400 py-16 text-lg font-semibold tracking-wide"
        >
          No menu items found for your selection.
        </div>
      </div>
    </div>

    <!-- Bottom nav -->
    <BottomNav
      :unreadCount="unreadCount"
      class="fixed left-1/2 -translate-x-1/2 bottom-0 z-40"
    />

    <!-- Logout modal -->
    <div v-if="showLogout" class="modal-backdrop">
      <div
        class="logout-modal w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 relative"
      >
        <div class="font-bold text-xl mb-3 text-brown-900 text-center">
          Confirm Logout
        </div>
        <div class="text-base text-gray-600 mb-7 text-center">
          Are you sure you want to log out from Eden Coffee?
        </div>
        <div class="flex gap-3 justify-center">
          <button @click="showLogout = false" class="logout-btn-cancel">
            Cancel
          </button>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>

    <!-- Cart FAB -->
    <div
      v-if="cartTotalQuantity > 0"
      @click="showOrderSummary = true"
      class="cart-fab"
    >
      🛒 <span class="cart-badge">{{ cartTotalQuantity }}</span>
    </div>

    <!-- Order Summary modal -->
    <div v-if="showOrderSummary" class="modal-backdrop">
      <div class="modal-content">
        <h2 class="modal-title">Your Order</h2>
        <div class="cart-items-container">
          <div v-if="cart.length === 0" class="text-center text-gray-500 py-4">
            Your cart is empty.
          </div>

          <div v-for="item in cart" :key="item.id" class="cart-item">
            <img :src="item.imageUrl" :alt="item.name" class="cart-item-img" />
            <div class="flex-1">
              <div class="cart-item-name">{{ item.name }}</div>
              <div class="cart-item-price">
                {{ formatCurrency(item.price) }}
              </div>
            </div>
            <div class="cart-item-controls">
              <button @click="updateQuantity(item.id, item.qty - 1)">-</button>
              <input
                type="number"
                :value="item.qty"
                @input="
                  updateQuantity(item.id, parseInt($event.target.value) || 1)
                "
              />
              <button @click="updateQuantity(item.id, item.qty + 1)">+</button>
            </div>
            <div class="cart-item-total">
              {{ formatCurrency(item.price * item.qty) }}
            </div>
          </div>
        </div>

        <div class="cart-summary">
          Total: <span>{{ formatCurrency(cartTotal) }}</span>
        </div>

        <div class="modal-actions">
          <button @click="showOrderSummary = false" class="btn-secondary">
            Close
          </button>
          <button
            @click="placeOrder"
            class="btn-primary"
            :disabled="isProcessing || cart.length === 0"
          >
            {{ isProcessing ? "Placing..." : "Place Order" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Order success modal -->
    <div v-if="orderSuccess" class="modal-backdrop">
      <div class="modal-content text-center">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="modal-title">Order Placed!</h2>
        <p class="text-gray-600 mb-1">
          Your order has been sent to the counter.
        </p>
        <p v-if="lastOrder?.order_code" class="text-gray-500 mb-6">
          Order Code:
          <span class="font-semibold">{{ lastOrder.order_code }}</span>
        </p>
        <button @click="closeSuccessModal" class="btn-primary">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import axios from "@/plugins/axios";
import { storageUrl } from "@/config/urls";
import { useRoute, useRouter } from "vue-router";
import BottomNav from "@/components/Customer/BottomNav.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

// Routing / auth bootstrap (Table auto-login still supported)
const route = useRoute();
const router = useRouter();
const ready = ref(false);

onMounted(async () => {
  if (!localStorage.getItem("token") && route.query.slug) {
    try {
      const { data } = await axios.post("/table-login", {
        table_slug: route.query.slug,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "Table");
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      router.replace({ path: "/customer" });
      ready.value = true;
    } catch (err) {
      alert("QR login failed. Please contact staff.");
      router.push("/login");
      return;
    }
  } else if (localStorage.getItem("token")) {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;
    ready.value = true;
  } else {
    ready.value = false;
    router.push("/login");
    return;
  }
});

// Notifications (unchanged)
const notifications = ref([]);
const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read).length
);
async function fetchNotifications() {
  try {
    const { data } = await axios.get("/notifications/active");
    notifications.value = Array.isArray(data.data) ? data.data : data;
  } catch {
    notifications.value = [];
  }
}

// Banners
const banners = ref([]);
const fetchBanners = async () => {
  try {
    const res = await axios.get("/banners?status=active");
    banners.value = res.data.data || res.data;
  } catch {
    banners.value = [];
  }
};

// Menu + categories
const categories = ref([]);
const activeCategory = ref("All");
const search = ref("");
const menu = ref([]);
const showLogout = ref(false);

// Cart
const cart = ref([]);
const showOrderSummary = ref(false);

// Place order state
const isProcessing = ref(false);
const orderSuccess = ref(false);
const lastOrder = ref(null);

// Computed
const filteredMenu = computed(() => {
  const q = search.value.trim().toLowerCase();
  const active = activeCategory.value.trim().toLowerCase();
  if (active === "all")
    return menu.value.filter((m) => m.name.toLowerCase().includes(q));
  return menu.value.filter(
    (m) =>
      (m.category || "").trim().toLowerCase() === active &&
      m.name.toLowerCase().includes(q)
  );
});
const cartTotal = computed(() =>
  cart.value.reduce((t, i) => t + i.price * i.qty, 0)
);
const cartTotalQuantity = computed(() =>
  cart.value.reduce((t, i) => t + i.qty, 0)
);

// Fetch helpers
const getImageUrl = (img) => storageUrl(img, "menu.png");
const fetchCategories = async () => {
  try {
    const { data } = await axios.get("/categories");
    categories.value = [{ id: 0, name: "All" }, ...data];
  } catch {}
};
const fetchMenu = async () => {
  try {
    const res = await axios.get("/menu-items?per_page=999");
    const itemsArray = Array.isArray(res.data) ? res.data : res.data.data;
    menu.value = Array.isArray(itemsArray)
      ? itemsArray.map((item) => ({
          ...item,
          price: parseFloat(item.price),
          imageUrl: getImageUrl(item.image),
          category: item.category?.name?.trim() || "Other",
        }))
      : [];
  } catch {
    menu.value = [];
  }
};

// Trigger fetches when ready
watch(
  ready,
  (v) => {
    if (v) {
      fetchCategories();
      fetchMenu();
      fetchNotifications();
      fetchBanners();
    }
  },
  { immediate: true }
);

// UI helpers
const formatCurrency = (amount) =>
  "$ " +
  (Number(amount) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const logout = async () => {
  try {
    await axios.post("/logout");
  } catch {}
  localStorage.clear();
  router.push("/login");
};

// Cart ops
const addToCart = (item) => {
  const exist = cart.value.find((i) => i.id === item.id);
  if (exist) exist.qty++;
  else cart.value.push({ ...item, qty: 1 });
};
const updateQuantity = (id, qty) => {
  const it = cart.value.find((i) => i.id === id);
  if (!it) return;
  const n = isNaN(qty) ? 1 : qty;
  if (n > 0) it.qty = n;
  else cart.value = cart.value.filter((i) => i.id !== id);
};

// MAIN: Place order (no payment here)
const placeOrder = async () => {
  if (!cart.value.length) return;

  isProcessing.value = true;

  try {
    const payload = {
      items: cart.value.map((i) => ({
        menu_item_id: i.id,
        quantity: i.qty,
        // customizations: i.customizations ?? null,
        // note: i.note ?? null,
      })),
      // code: promoCode.value || null
    };

    const { data } = await axios.post("/orders", payload);

    // Success
    lastOrder.value = data;
    orderSuccess.value = true;
    showOrderSummary.value = false;
    cart.value = [];

    // (Optional) small pause for animation consistency
    await nextTick();
  } catch (err) {
    // Show API message if present (e.g., 429 from anti-spam)
    const msg =
      err?.response?.data?.message ||
      "Failed to place order. Please try again.";
    alert(msg);
  } finally {
    isProcessing.value = false;
  }
};

const closeSuccessModal = () => {
  orderSuccess.value = false;
};
</script>

<style scoped>
/* All styles are the same as before */
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:wght@400;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap");

.menu-bg {
  background: linear-gradient(135deg, #fdf9f4 0%, #fae8e1 100%);
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
.text-orange-900 {
  color: #9a3412;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}
.category-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.promo-banner {
  background: linear-gradient(90deg, #fff7eb 0%, #ffeace 100%);
  border-radius: 2.5rem;
  padding: 1.5rem 2rem;
}

.search-bar {
  width: 100%;
  border-radius: 999px;
  border: 2px solid #ffeace;
  background: #fff;
  padding: 0.8rem 1.8rem;
  font-size: 1rem;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.08);
  transition: all 0.2s;
  outline: none;
  color: #4f311c;
}
.search-bar:focus {
  border-color: #fb923c;
  box-shadow: 0 5px 20px rgba(253, 186, 116, 0.25);
}

.category-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  background-color: #fff;
  border: 2px solid #ffeace;
  color: #8b5e3c;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}
.category-btn.active,
.category-btn:hover {
  background-color: #f97316;
  color: #fff;
  border-color: #f97316;
}

.menu-card {
  position: relative;
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 30px rgba(253, 186, 116, 0.1),
    0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease-in-out;
  display: flex;
  flex-direction: column;
  border: 1px solid #ffeace;
  cursor: pointer;
}
.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(253, 186, 116, 0.2),
    0 4px 15px rgba(0, 0, 0, 0.08);
}
.menu-card-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 1.5rem 1.5rem 0 0;
}

.menu-card-body {
  padding: 1rem;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.menu-card-name {
  font-family: "Quicksand", sans-serif;
  font-weight: 700;
  color: #4f311c;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}
.menu-card-description {
  font-family: "Lora", serif;
  font-size: 0.85rem;
  color: #78716c;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  flex-grow: 1;
}
.menu-card-price {
  font-family: "Quicksand", sans-serif;
  font-weight: 700;
  color: #c2410c;
  font-size: 1.25rem;
  margin-top: auto;
}

.add-to-cart-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f97316, #fb923c);
  color: white;
  font-size: 24px;
  border: 2px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.add-to-cart-btn:hover {
  transform: scale(1.1);
}

.cart-fab {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #4f311c, #8b5e3c);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  z-index: 40;
  transition: transform 0.2s;
}
.cart-fab:hover {
  transform: scale(1.1);
}
.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f97316;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #4f311c;
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
.modal-content,
.logout-modal {
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
  margin-bottom: 1rem;
  text-align: center;
}
.cart-items-container {
  overflow-y: auto;
  flex-grow: 1;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
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
.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.cart-item-controls input {
  width: 40px;
  text-align: center;
  border: 1px solid #f3e5d8;
  border-radius: 0.5rem;
  padding: 4px;
}
.cart-item-controls button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: #f3e5d8;
  color: #4f311c;
  font-weight: bold;
  cursor: pointer;
}
.cart-item-total {
  font-weight: 700;
  color: #c2410c;
  width: 80px;
  text-align: right;
}
.cart-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #f3e5d8;
  text-align: right;
  font-size: 1.2rem;
  font-weight: bold;
  color: #4f311c;
}
.cart-summary span {
  font-size: 1.5rem;
  color: #c2410c;
  margin-left: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary,
.logout-btn,
.logout-btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary,
.logout-btn {
  background-color: #f97316;
  color: white;
}
.btn-primary:disabled {
  background-color: #fcd9be;
  cursor: not-allowed;
}
.btn-secondary,
.logout-btn-cancel {
  background-color: #fff8ed;
  color: #f97316;
  border: 2px solid #fdba74;
}
.btn-secondary:hover,
.logout-btn-cancel:hover {
  background-color: #ffedd5;
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
