<template>
  <AppLayout>
    <!-- Topbar -->
    <div class="flex items-center px-6 pt-6 pb-3 gap-4">
      <h1
        class="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap"
      >
        {{ $t("pos.order_list") || "Order List" }}
      </h1>

      <div class="flex-1 max-w-md">
        <div class="relative">
          <input
            v-model="search"
            :placeholder="$t('pos.search')"
            class="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>

      <!-- Mobile cart button (opens drawer) -->
      <button
        class="ml-auto relative flex items-center md:hidden bg-purple-50 dark:bg-gray-900 hover:bg-purple-100 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-200 border border-transparent dark:border-gray-800 rounded-full px-6 py-2 shadow transition-all"
        type="button"
        @click="openMobileCart()"
      >
        <ShoppingCart class="w-6 h-6 mr-1" />
        <span>{{ t("pos.cart") || "Cart" }}</span>
        <span
          class="absolute -top-2 -right-2 bg-red-500 dark:bg-red-400 text-white dark:text-gray-900 text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900"
        >
          {{ totalQtyLocal }}
        </span>
      </button>

      <!-- Desktop toggle (cart) -->
      <button
        type="button"
        :aria-pressed="showCartPanel ? 'true' : 'false'"
        :aria-label="ariaToggleText"
        @click="toggleCartDesktop()"
        class="ml-auto hidden md:inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all border shadow-sm relative"
        :class="
          showCartPanel
            ? 'bg-purple-600 text-white border-transparent hover:bg-purple-700'
            : 'bg-purple-50 dark:bg-gray-900 text-purple-700 dark:text-purple-200 border-transparent dark:border-gray-800 hover:bg-purple-100 dark:hover:bg-gray-800'
        "
        :title="t('pos.cart') || 'Cart'"
      >
        <ShoppingCart class="w-5 h-5" />
        <span>{{ t("pos.cart") || "Cart" }}</span>
        <span
          v-if="totalQtyLocal > 0"
          class="absolute -top-2 -right-2 bg-red-500 dark:bg-red-400 text-white dark:text-gray-900 text-[11px] leading-none w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900"
        >
          {{ totalQtyLocal }}
        </span>
      </button>
    </div>

    <!-- Layout grid (products + cart) -->
    <div class="px-6 pb-0 h-full min-h-0 overflow-hidden">
      <div
        :class="['content-grid h-full', { 'cart-hidden': !showCartPanel }]"
        aria-label="Products and Cart"
      >
        <!-- LEFT: products -->
        <section class="min-h-0 flex flex-col overflow-hidden">
          <!-- Categories + view switches -->
          <div class="flex items-center mb-4 shrink-0 gap-4">
            <div
              ref="categoryScroll"
              class="max-w-[100%] min-w-[75%] overflow-x-auto no-scrollbar bg-white dark:bg-gray-800 rounded-full p-1"
              @wheel.prevent="handleWheelScroll"
            >
              <div class="inline-flex gap-2">
                <button
                  v-for="cat in categoriesWithAll"
                  :key="cat.id"
                  @click="activeCategory = cat.id"
                  :class="[
                    'px-4 py-1 rounded-full text-sm whitespace-nowrap transition-all',
                    activeCategory === cat.id
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
                  ]"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-gray-700 transition-all"
                :class="
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-purple-600 dark:text-white border border-gray-200 dark:border-gray-600'
                "
                @click="viewMode = 'grid'"
                aria-label="Grid view"
              >
                <LayoutGrid class="w-6 h-6" />
              </button>
              <button
                type="button"
                class="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-gray-700 transition-all"
                :class="
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-purple-600 dark:text-white border border-gray-200 dark:border-gray-600'
                "
                @click="viewMode = 'list'"
                aria-label="List view"
              >
                <List class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Scrollable products -->
          <div
            class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar"
          >
            <div
              v-if="isLoading"
              class="text-center text-gray-500 dark:text-gray-400 py-12"
            >
              {{ $t("pos.loading_menu") }}
            </div>

            <div v-else class="pb-4">
              <!-- Grid -->
              <div v-if="viewMode === 'grid'" class="product-grid">
                <ProductCard
                  v-for="item in filteredProducts"
                  :key="item.id"
                  :item="item"
                  @add-to-cart="handleAddToCart"
                />
              </div>

              <!-- List -->
              <div v-else class="space-y-2">
                <div
                  v-for="item in filteredProducts"
                  :key="item.id"
                  class="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3 flex items-center justify-between"
                >
                  <span class="font-semibold">{{ item.name }}</span>
                  <button
                    @click="handleAddToCart(item)"
                    class="bg-purple-600 text-white px-4 py-1 rounded-full text-sm"
                  >
                    {{ $t("pos.add") || "Add" }}
                  </button>
                </div>
              </div>

              <!-- Loading more / empty -->
              <div
                v-if="menuStore.loadingMore"
                class="flex justify-center my-2 text-gray-400"
              >
                {{ $t("loading") || "Loading more..." }}
              </div>
              <div
                v-if="!filteredProducts.length && !isLoading"
                class="text-center text-gray-400 py-12"
              >
                {{ $t("menu.empty") }}
              </div>
            </div>
          </div>
        </section>

        <!-- RIGHT: cart column -->
        <aside class="cart-sidebar" aria-label="Cart sidebar">
          <Cart @checkout="handleCheckout" @close="showCartPanel = false" />
        </aside>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <transition name="fade">
      <div
        v-if="showMobileDrawer"
        class="fixed inset-0 z-50"
        @keydown.esc="closeMobileCart"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="closeMobileCart"
        ></div>
        <div
          class="absolute right-0 top-0 h-full w-[92%] max-w-[420px] bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700"
        >
          <Cart @checkout="handleCheckout" @close="closeMobileCart" />
        </div>
      </div>
    </transition>

    <!-- Payment Modal -->
    <PaymentModal
      :visible="showModal"
      :key="cart.length"
      @close="handleModalClose"
      @success="handleSuccess"
    />

    <!-- Customize-first modal (ADD mode) with variants -->
    <CustomizeCartItemModal
      v-if="showAddModal && draftItem"
      mode="add"
      :item="draftItem"
      :max-qty="maxQtyFor(draftItem)"
      :initial-qty="1"
      @close="closeAddModal"
      @apply="onPreAddConfirm"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onDeactivated } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from "vue-i18n";
import AppLayout from "@/components/Common/AppLayout.vue";
import ProductCard from "@/components/POS/ProductCard.vue";
import Cart from "@/components/POS/Cart.vue";
import { LayoutGrid, List, ShoppingCart } from "lucide-vue-next";
import PaymentModal from "@/components/POS/PaymentModal.vue";
import CustomizeCartItemModal from "@/components/POS/CustomizeCartItemModal.vue";
import { usePOSStore } from "@/store/pos";
import { useMenuStore } from "@/store/menu";

const { t } = useI18n();

const { cart, clearCart } = usePOSStore(); // we'll push line objects directly
const menuStore = useMenuStore();

const showModal = ref(false);
const showCartPanel = ref(true);
const showMobileDrawer = ref(false);
const search = ref("");
const viewMode = ref("grid");
const activeCategory = ref(0);

/* customize-first flow */
const showAddModal = ref(false);
const draftItem = ref(null);

const totalQtyLocal = computed(() =>
  cart.reduce((sum, it) => sum + (it.qty || 0), 0)
);
const isLoading = computed(() => menuStore.isLoading);

/* Categories */
const categoriesWithAll = computed(() => [
  { id: 0, name: t("pos.all") },
  ...(menuStore.categories || []),
]);

/* a11y text for cart toggle */
const ariaToggleText = computed(() => {
  const action = showCartPanel.value
    ? t("pos.hide_card") || t("pos.hide_cart") || "Hide"
    : t("pos.show_card") || t("pos.open_cart") || "Open";
  const base = t("pos.cart") || "Cart";
  const count = totalQtyLocal.value
    ? `, ${totalQtyLocal.value} ${t("pos.items") || "items"}`
    : "";
  return `${action}: ${base}${count}`;
});

const categoryScroll = ref(null);
const handleWheelScroll = (e) => {
  const el = categoryScroll.value;
  if (el) el.scrollLeft += e.deltaY;
};

/* ---------- EFFECTIVE UNIT PRICE HELPERS ---------- */
// For menu items (no variant selected yet)
function effectiveItemPrice(p) {
  if (p?.has_active_discount && p?.final_price != null)
    return Number(p.final_price);
  const base = Number(p?.price || 0);
  if (p?.discount_type && p?.discount_value != null) {
    if (p.discount_type === "percent") {
      return Math.max(
        0,
        +(base - base * (Number(p.discount_value) / 100)).toFixed(2)
      );
    }
    return Math.max(0, +(base - Number(p.discount_value)).toFixed(2));
  }
  return base;
}
// For a variant (preferred if provided)
function effectiveVariantPrice(v) {
  if (!v) return null;
  const base = Number(v?.price || 0);
  if (v?.final_price != null) return Number(v.final_price);
  return base;
}

/* ===== ADD FLOW ===== */
function handleAddToCart(item) {
  // item should have item.variants (you already preload them in store)
  draftItem.value = { ...item };
  showAddModal.value = true;
}
function closeAddModal() {
  showAddModal.value = false;
  draftItem.value = null;
}
function maxQtyFor(item) {
  const n = Number(item?.stock_available ?? item?.max_qty);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * The customize modal emits: { qty, customizations, note, variant }
 * We snapshot the price from the chosen variant if present.
 */
function onPreAddConfirm({ qty, customizations, note, variant }) {
  const src = draftItem.value;
  if (!src) return;

  // Unit price snapshot
  const unit = variant
    ? effectiveVariantPrice(variant)
    : effectiveItemPrice(src);

  // Compose the line
  const line = {
    id: src.id,
    name: src.name,
    image: src.image,
    category_id: src.category_id,

    // base item pricing snapshot (for reference)
    price: src.price,
    has_active_discount: src.has_active_discount,
    discount_type: src.discount_type,
    discount_value: src.discount_value,
    final_price: src.final_price,

    // chosen variant snapshot (used by UI/back-end)
    variant_id: variant?.id ?? null,
    variant_name: variant?.name ?? null,
    variant_price: variant?.price ?? null,
    variant_final_price: variant?.final_price ?? null,

    unit_price: Number(unit || 0),
    qty,

    // Ensure the chosen variant is visible in the line
    customizations: [
      ...(customizations || []),
      ...(variant?.name ? [{ type: "variant", value: variant.name }] : []),
    ],
    note,
  };

  // Push directly to the cart store (we want full control over the line)
  cart.push(line);

  closeAddModal();
  if (window.innerWidth < 768) openMobileCart();
  else showCartPanel.value = true;
}

/* Filtering — POS shows ACTIVE only */
const filteredProducts = computed(() => {
  // active-only getter; fallback to inline filter
  let list =
    menuStore.itemsForPOS ??
    (menuStore.items || []).filter(
      (i) => !i?.deleted_at && (i?.is_active === true || i?.is_active === 1)
    );

  if (activeCategory.value !== 0)
    list = list.filter((p) => p.category_id === activeCategory.value);

  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter((p) => (p.name || "").toLowerCase().includes(q));
  }
  return list;
});

/* checkout flow */
const handleCheckout = () => {
  if (!cart.length) return alert(t("pos.empty_cart"));
  showModal.value = true;
};
const handleModalClose = () => (showModal.value = false);
const handleSuccess = () => {
  clearCart();
  showModal.value = false;
};

/* desktop toggle + persistence */
const CART_HIDDEN_KEY = "posCartHidden";
function toggleCartDesktop() {
  showCartPanel.value = !showCartPanel.value;
  localStorage.setItem(CART_HIDDEN_KEY, showCartPanel.value ? "0" : "1");
}
function initCartFromStorage() {
  const saved = localStorage.getItem(CART_HIDDEN_KEY);
  if (saved === "1") showCartPanel.value = false;
}

/* mobile drawer helpers */
function openMobileCart() {
  showMobileDrawer.value = true;
  document.body.style.overflow = "hidden";
}
function closeMobileCart() {
  showMobileDrawer.value = false;
  document.body.style.overflow = "";
}

/* bootstrap */
onMounted(async () => {
  initCartFromStorage();
  await menuStore.ensureLoaded(); // variants are preloaded via include_variants=1
  window.addEventListener("resize", onResize);
});

onBeforeRouteLeave(() => {
  menuStore.cancelAll();
  document.body.style.overflow = "";
});
onDeactivated(() => {
  menuStore.cancelAll();
});
onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  menuStore.cancelAll();
  document.body.style.overflow = "";
});

function onResize() {
  if (window.innerWidth >= 768) closeMobileCart();
}
</script>

<style scoped>
/* ---------- utilities ---------- */
.no-scrollbar::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ---------- product grid sizing var (SCOPED SAFE) ---------- */
.product-grid {
  --card-min: 200px;
}
@media (min-width: 1280px) {
  .product-grid {
    --card-min: 220px;
  }
}
@media (min-width: 1536px) {
  .product-grid {
    --card-min: 240px;
  }
}

/* ---------- grid shell ---------- */
.content-grid {
  --cart-col: 370px;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  min-height: 0;
}
@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr var(--cart-col);
  }
  .content-grid.cart-hidden {
    grid-template-columns: 1fr !important;
  }
  .content-grid.cart-hidden .cart-sidebar {
    display: none !important;
  }
}

/* ---------- product grid ---------- */
.product-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr));
}

/* Mid-desktop 1024–1279: 3 with cart / 4 without */
@media (min-width: 1024px) and (max-width: 1279.98px) {
  .content-grid:not(.cart-hidden) .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .content-grid.cart-hidden .product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* ≥1280px default */
@media (min-width: 1280px) {
  .content-grid:not(.cart-hidden) .product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .content-grid.cart-hidden .product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* >1380px: allow 5 columns when cart is hidden */
@media (min-width: 1380px) {
  .content-grid.cart-hidden .product-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

/* 1280–1450px => force 3 columns when cart is OPEN (desktop) */
@media (min-width: 1280px) and (max-width: 1449.98px), (width: 1450px) {
  .content-grid:not(.cart-hidden) .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* NEW: 1020–1200px => 2 columns WHEN CART IS OPEN */
@media (min-width: 1020px) and (max-width: 1200px) {
  .content-grid:not(.cart-hidden) .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ---------- desktop cart column ---------- */
.cart-sidebar {
  display: none;
}
@media (min-width: 768px) {
  .cart-sidebar {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

/* iPad ranges */
@media (min-width: 744px) and (max-width: 829.98px) {
  .content-grid.cart-hidden .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 830px) and (max-width: 1024.98px) {
  .content-grid.cart-hidden .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
