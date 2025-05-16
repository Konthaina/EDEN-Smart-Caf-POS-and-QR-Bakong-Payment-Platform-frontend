<template>
  <aside class="bg-white shadow h-full flex flex-col justify-between w-60">
    <!-- Top logo -->
    <div>
      <div class="p-4 text-xl font-bold text-purple-700">☕ Eden POS</div>

      <!-- Management Section -->
      <div class="px-3 mb-1 text-gray-500 text-xs font-semibold uppercase tracking-wide">Management</div>
      <nav class="space-y-0.5 px-3">
        <SidebarItem to="/dashboard" label="Dashboard" icon="📊" />
        <SidebarItem to="/pos" label="POS" icon="🛒" />
        <SidebarItem to="/orders" label="Orders" icon="📦" />

        <!-- Menu Dropdown -->
        <div>
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="flex items-center justify-between w-full py-2 px-3 rounded hover:bg-purple-50 text-sm font-medium text-gray-700"
          >
            <span class="flex items-center gap-2">
              <span class="text-lg">🍔</span>
              <span>Menu</span>
            </span>
            <svg
              :class="{ 'rotate-180': isMenuOpen }"
              class="w-4 h-4 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="isMenuOpen" class="ml-6 space-y-0.5">
            <SidebarItem to="/menu/items" label="Menu Items" icon="📋" small />
            <SidebarItem to="/menu/categories" label="Categories" icon="🗂️" small />
          </div>
        </div>

        <!-- Inventory Dropdown -->
<div>
  <button
    @click="isInventoryOpen = !isInventoryOpen"
    class="flex items-center justify-between w-full py-2 px-3 rounded hover:bg-purple-50 text-sm font-medium text-gray-700"
  >
    <span class="flex items-center gap-2">
      <span class="text-lg">📦</span>
      <span>Inventory</span>
    </span>
    <svg
      :class="{ 'rotate-180': isInventoryOpen }"
      class="w-4 h-4 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  <div v-if="isInventoryOpen" class="ml-6 space-y-0.5">
    <SidebarItem to="/inventory/stock" label="Stock" icon="📦" small />
    <SidebarItem to="/inventory/recipe" label="Recipe" icon="🧪" small />
    <SidebarItem to="/inventory/ingredient" label="Ingredient" icon="🥬" small />
  </div>
</div>

        <SidebarItem to="/reports" label="Analytic" icon="📈" />
      </nav>

      <!-- Personal Section -->
      <div class="px-3 mt-4 text-gray-500 text-xs font-semibold uppercase tracking-wide">Personal</div>
      <nav class="space-y-0.5 px-3">
        <SidebarItem to="/messages" label="Messages" icon="💬" badge="99+" />
        <SidebarItem to="/Notifications" label="Notifications" icon="🔔" badge="9" />
        <SidebarItem to="/Setting" label="Setting" icon="⚙️" />
      </nav>
    </div>

    <!-- Profile Footer -->
    <div class="p-3 border-t">
      <div class="flex items-center gap-2">
        <img src="https://i.pravatar.cc/100?img=3" class="w-9 h-9 rounded-full" />
        <div class="leading-tight text-sm">
          <p class="font-semibold">POMO store 2</p>
          <p class="text-xs text-gray-500">pomostore201@eu.co</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'

const isMenuOpen = ref(false)
const isInventoryOpen = ref(false)
const route = useRoute()

// Keep dropdown open when child route is active
watchEffect(() => {
  const path = route.path
  isMenuOpen.value = path.startsWith('/menu/')
  isInventoryOpen.value = path.startsWith('/inventory/')
})
</script>


