<template>
  <AppLayout>
    <div class="flex h-[calc(100vh-32px)] overflow-hidden px-6 py-4">
      <!-- Main Section (Left) -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header: Categories + Search -->
        <div class="flex justify-between items-center mb-4 shrink-0">
          <div class="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              :class="[
                'px-4 py-1 rounded-full text-sm whitespace-nowrap',
                activeCategory === cat.id
                  ? 'bg-purple-100 text-purple-700 font-semibold'
                  : 'hover:bg-gray-200 text-gray-600'
              ]"
            >
              {{ cat.name }}
            </button>
          </div>

          <input
            v-model="search"
            placeholder="Search..."
            class="border px-3 py-2 rounded w-64"
          />
        </div>

        <!-- Product Grid Scrollable -->
        <div class="overflow-y-auto pr-2 no-scrollbar">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <ProductCard
              v-for="item in filteredProducts"
              :key="item.id"
              :item="item"
              @add-to-cart="addToCart"
            />
          </div>
        </div>
      </div>

      <!-- Cart Panel (Right) -->
      <div class="ml-6 shrink-0">
        <Cart @checkout="handleCheckout" />
      </div>
    </div>

    <!-- Always render PaymentModal -->
    <PaymentModal
      :visible="showModal"
      :key="cart.length"  
      @close="handleModalClose"
      @success="handleModalClose"
    />
  </AppLayout>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import AppLayout from '@/components/Common/AppLayout.vue';
import ProductCard from '@/components/POS/ProductCard.vue';
import Cart from '@/components/POS/Cart.vue';
import PaymentModal from '@/components/POS/PaymentModal.vue';
import api from '@/plugins/axios';
import { usePOSStore } from '@/store/pos';

const showModal = ref(false);
const { cart, addToCart, clearCart } = usePOSStore();

const products = ref([]);
const categories = ref([{ id: 0, name: 'All' }]);
const activeCategory = ref(0);
const search = ref('');

const filteredProducts = computed(() =>
  products.value.filter((p) => {
    const matchCategory = activeCategory.value === 0 || p.category_id === activeCategory.value;
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase());
    return matchCategory && matchSearch;
  })
);

const handleCheckout = () => {
  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }
  showModal.value = true;
};

const handleModalClose = () => {
  showModal.value = false;
};

const handleSuccess = () => {
  clearCart(); // ✅ Make sure to clear after success
  showModal.value = false;
};

onMounted(async () => {
  const [menuRes, catRes] = await Promise.all([
    api.get('/menu-items'),
    api.get('/categories'),
  ]);

  products.value = menuRes.data;
  categories.value.push(...catRes.data);
});
</script>

<!-- Template -->
<PaymentModal
  :visible="showModal"
  :key="cart.length"
  @close="handleModalClose"
  @success="handleSuccess"
/>
