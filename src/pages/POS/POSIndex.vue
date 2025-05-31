<template>
  <AppLayout>
    <div class="flex h-[calc(97vh-32px)] overflow-hidden px-6 py-6 dark:bg-gray-900">
      <!-- Main Section (Left) -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header: Scrollable Categories + Search -->
        <div class="flex justify-between items-center mb-4 shrink-0 gap-4">
          <!-- Scrollable Categories with mouse wheel scroll -->
          <div
            ref="categoryScroll"
            class="flex-1 overflow-x-auto no-scrollbar"
            @wheel.prevent="handleWheelScroll"
          >
            <div class="inline-flex gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                @click="activeCategory = cat.id"
                :class="[
                  'px-4 py-1 rounded-full text-sm whitespace-nowrap transition-all',
                  activeCategory === cat.id
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                ]"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- Search Input -->
          <input
            v-model="search"
            :placeholder="$t('pos.search')"
            class="mt-1 mr-1 border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-2 rounded-xl w-64 shadow-sm focus:ring-purple-500"
          />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-12">
          {{ $t('pos.loading_menu') }}
        </div>

        <!-- Product Grid Scrollable -->
        <div v-else class="overflow-y-auto pr-2 no-scrollbar flex-1">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            <ProductCard
              v-for="item in filteredProducts"
              :key="item.id"
              :item="item"
              @add-to-cart="addToCart"
            />
          </div>
        </div>
      </div>

      <!-- Sticky Cart Panel (Right) -->
      <div class="ml-6 w-80 shrink-0 sticky self-start">
        <Cart @checkout="handleCheckout" />
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :visible="showModal"
      :key="cart.length"
      @close="handleModalClose"
      @success="handleSuccess"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppLayout from '@/components/Common/AppLayout.vue';
import ProductCard from '@/components/POS/ProductCard.vue';
import Cart from '@/components/POS/Cart.vue';
import PaymentModal from '@/components/POS/PaymentModal.vue';
import api from '@/plugins/axios';
import { usePOSStore } from '@/store/pos';

const { t } = useI18n();

const showModal = ref(false);
const loading = ref(true);
const { cart, addToCart, clearCart } = usePOSStore();

const products = ref([]);
const categories = ref([{ id: 0, name: t('pos.all') }]);
const activeCategory = ref(0);
const search = ref('');

const categoryScroll = ref(null);

const handleWheelScroll = (e) => {
  const el = categoryScroll.value;
  if (el) {
    el.scrollLeft += e.deltaY;
  }
};

const filteredProducts = computed(() =>
  products.value.filter((p) => {
    const matchCategory = activeCategory.value === 0 || p.category_id === activeCategory.value;
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase());
    return matchCategory && matchSearch;
  })
);

watch(cart, (newVal) => {
  if (newVal.length === 0 && showModal.value) {
    showModal.value = false;
  }
});

const handleCheckout = () => {
  if (cart.length === 0) {
    alert(t('pos.empty_cart'));
    return;
  }
  showModal.value = true;
};

const handleModalClose = () => {
  showModal.value = false;
};

const handleSuccess = () => {
  clearCart();
  showModal.value = false;
};

onMounted(async () => {
  try {
    const [menuRes, catRes] = await Promise.all([
      api.get('/menu-items'),
      api.get('/categories'),
    ]);
    products.value = menuRes.data;
    categories.value.push(...catRes.data);
  } catch (e) {
    console.error('Failed to load menu or categories:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Optional no-scrollbar style */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
