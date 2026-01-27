<template>
  <aside :class="[
    'transition-all duration-200 border h-screen flex flex-col shadow-md rounded-tr-xl rounded-br-xl overflow-hidden',
    'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800',
    collapsed ? 'w-[90px]' : 'w-[235px]',
  ]">
    <!-- Header -->
    <div :class="[
      'flex items-center border-b min-h-[64px]',
      'border-gray-200 dark:border-gray-800',
      collapsed ? 'px-3 py-4 justify-center' : 'pl-5 pr-4 py-4 justify-between',
    ]">
      <div
        v-if="!collapsed"
        class="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
        <img :src="appLogoUrl" alt="Logo" class="w-full h-full object-cover rounded-lg" @error="onLogoError" />
      </div>
      <span v-if="!collapsed"
        class="ml-4 min-w-0 max-w-[140px] truncate font-bold text-lg bg-gradient-to-r from-purple-500 via-pink-400 to-purple-700 bg-clip-text text-transparent select-none">
        {{ settings.shop_name || t('sidebar.app_name') }}
      </span>
      <button @click="toggleSidebar" :title="t('sidebar.collapse')" :class="[
        'p-2 rounded-lg transition-all duration-150 outline-none',
        collapsed ? '' : 'ml-auto',
      ]">
        <component
          :is="collapsed ? PanelRightClose : PanelLeftClose"
          class="w-6 h-6 text-purple-500 transition-transform duration-300"
        />
      </button>
    </div>

    <!-- Scrollable menu area -->
    <div class="flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar">
      <div class="pt-4 pb-4">
        <!-- Management -->
        <div v-if="
          !collapsed &&
          (showKey('dashboard') ||
            showKey('pos') ||
            showKey('orders') ||
            showKey('menu') ||
            !isCashier)
        " class="px-6 mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ t('sidebar.management') }}
        </div>

        <nav class="flex flex-col gap-1 px-2">
          <!-- Dashboard -->
          <SidebarItem v-if="showKey('dashboard')" to="/dashboard" :label="t('sidebar.dashboard')" :icon="BarChart2"
            :collapsed="collapsed" :active="route.path === '/dashboard' || route.path.startsWith('/dashboard')" />

          <!-- POS -->
          <SidebarItem v-if="showKey('pos')" to="/pos" :label="t('sidebar.pos')" :icon="ShoppingCart"
            :collapsed="collapsed" :active="route.path.startsWith('/pos')" />

          <!-- Orders -->
          <SidebarItem v-if="showKey('orders')" to="/orders" :label="t('sidebar.orders')" :icon="FileText"
            :collapsed="collapsed" :active="route.path.startsWith('/orders')" />

          <!-- Menu -->
          <div v-if="showKey('menu')">
            <button @click="isMenuOpen = !isMenuOpen" :title="collapsed ? t('sidebar.menu') : ''" :class="[
              route.path.startsWith('/menu/')
                ? 'bg-purple-50 text-purple-700 font-semibold dark:bg-purple-900 dark:text-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white',
              collapsed
                ? 'flex items-center justify-center w-full px-2 py-2 rounded-lg text-sm font-medium'
                : 'flex items-center w-full px-3 justify-between gap-2 py-2 rounded-lg text-sm font-medium',
              'transition-colors duration-150 cursor-pointer select-none',
            ]">
              <span class="flex items-center gap-2">
                <component :is="Utensils" class="w-5 h-5" />
                <span v-if="!collapsed">{{ t('sidebar.menu') }}</span>
              </span>
              <ChevronDown v-if="!collapsed" :class="[
                'w-4 h-4 ml-1 transition-transform',
                { 'rotate-180': isMenuOpen },
              ]" />
            </button>

            <div v-if="isMenuOpen" :class="[
              collapsed
                ? 'ml-0 mt-1 flex flex-col gap-1 items-center bg-gray-50 dark:bg-gray-800/40 rounded-lg p-1'
                : 'ml-6 mt-1 flex flex-col gap-1 bg-gray-50 dark:bg-gray-800/40 rounded-lg px-2 py-1',
            ]">
              <SidebarItem to="/menu/items" :label="t('sidebar.menu_items')" :icon="List" :collapsed="collapsed" small
                :active="route.path.startsWith('/menu/items')" />
              <SidebarItem to="/menu/categories" :label="t('sidebar.categories')" :icon="FolderOpen"
                :collapsed="collapsed" small :active="route.path.startsWith('/menu/categories')" />
            </div>
          </div>

          <!-- Inventory -->
          <div v-if="showKey('inventory')">
            <button @click="isInventoryOpen = !isInventoryOpen" :title="collapsed ? t('sidebar.inventory') : ''" :class="[
              route.path.startsWith('/inventory/')
                ? 'bg-purple-50 text-purple-700 font-semibold dark:bg-purple-900 dark:text-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white',
              collapsed
                ? 'flex items-center justify-center w-full px-2 py-2 rounded-lg text-sm font-medium'
                : 'flex items-center w-full px-3 justify-between gap-2 py-2 rounded-lg text-sm font-medium',
              'transition-colors duration-150 cursor-pointer select-none',
            ]">
              <span class="flex items-center gap-2">
                <component :is="Boxes" class="w-5 h-5" />
                <span v-if="!collapsed">{{ t('sidebar.inventory') }}</span>
              </span>
              <ChevronDown v-if="!collapsed" :class="[
                'w-4 h-4 ml-1 transition-transform',
                { 'rotate-180': isInventoryOpen },
              ]" />
            </button>
            <div v-if="isInventoryOpen" :class="[
              collapsed
                ? 'ml-0 mt-1 flex flex-col gap-1 items-center bg-gray-50 dark:bg-gray-800/40 rounded-lg p-1'
                : 'ml-6 mt-1 flex flex-col gap-1 bg-gray-50 dark:bg-gray-800/40 rounded-lg px-2 py-1',
            ]">
              <SidebarItem to="/inventory/stock" :label="t('sidebar.stock')" :icon="Box" :collapsed="collapsed" small
                :active="route.path.startsWith('/inventory/stock')" />
              <SidebarItem v-if="!isCashier" to="/inventory/recipe" :label="t('sidebar.recipe')" :icon="FlaskConical"
                :collapsed="collapsed" small :active="route.path.startsWith('/inventory/recipe')" />
              <SidebarItem to="/inventory/ingredient" :label="t('sidebar.ingredient')" :icon="Leaf"
                :collapsed="collapsed" small :active="route.path.startsWith('/inventory/ingredient')" />
            </div>
          </div>

          <!-- Users -->
          <SidebarItem v-if="showKey('users')" to="/users" :label="t('sidebar.users')" :icon="Users"
            :collapsed="collapsed" :active="route.path.startsWith('/users')" />

          <!-- Discounts -->
          <SidebarItem v-if="showKey('discounts')" to="/discounts" :label="t('sidebar.discounts')" :icon="Percent"
            :collapsed="collapsed" :active="route.path.startsWith('/discounts')" />

          <!-- Customer section -->
          <div v-if="!collapsed && (showKey('tables') || showKey('marketing'))"
            class="px-6 mt-6 mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ tt('sidebar.customer', 'roles.customer') }}
          </div>

          <!-- Tables -->
          <SidebarItem v-if="showKey('tables')" to="/tables" :label="t('sidebar.tables')" :icon="List"
            :collapsed="collapsed" :active="route.path.startsWith('/tables')" />

          <!-- Marketing -->
          <div v-if="showKey('marketing')">
            <button @click="isMarketingOpen = !isMarketingOpen" :title="collapsed ? t('sidebar.marketing') : ''" :class="[
              route.path.startsWith('/marketing/')
                ? 'bg-purple-50 text-purple-700 font-semibold dark:bg-purple-900 dark:text-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white',
              collapsed
                ? 'flex items-center justify-center w-full px-2 py-2 rounded-lg text-sm font-medium'
                : 'flex items-center w-full px-3 justify-between gap-2 py-2 rounded-lg text-sm font-medium',
              'transition-colors duration-150 cursor-pointer select-none',
            ]">
              <span class="flex items-center gap-2">
                <component :is="Megaphone" class="w-5 h-5" />
                <span v-if="!collapsed">{{ t('sidebar.marketing') }}</span>
              </span>
              <ChevronDown v-if="!collapsed" :class="[
                'w-4 h-4 ml-1 transition-transform',
                { 'rotate-180': isMarketingOpen },
              ]" />
            </button>
            <div v-if="isMarketingOpen" :class="[
              collapsed
                ? 'ml-0 mt-1 flex flex-col gap-1 items-center bg-gray-50 dark:bg-gray-800/40 rounded-lg p-1'
                : 'ml-6 mt-1 flex flex-col gap-1 bg-gray-50 dark:bg-gray-800/40 rounded-lg px-2 py-1',
            ]">
              <SidebarItem to="/marketing/banner" :label="t('sidebar.banner')" :icon="Image" :collapsed="collapsed"
                small :active="route.path.startsWith('/marketing/banner')" />
              <SidebarItem to="/marketing/notification" :label="t('sidebar.notification')" :icon="Bell"
                :collapsed="collapsed" small :active="route.path.startsWith('/marketing/notification')" />
            </div>
          </div>
        </nav>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800 relative">
      <div class="flex items-center gap-3 cursor-pointer justify-center" @click="toggleProfileMenu">
        <img :src="currentUser?.profile?.avatar_url || defaultAvatar" @error="onAvatarError"
          class="w-10 h-10 shrink-0 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md ring-2 ring-purple-300"
          alt="User Avatar" />
        <div v-if="!collapsed" class="min-w-0 text-sm leading-tight">
          <p class="truncate font-semibold text-gray-800 dark:text-white">
            {{ currentUser?.name || t('sidebar.loading') }}
          </p>
          <p class="truncate text-xs text-gray-500 dark:text-gray-400">
            {{ currentUser?.email || '' }}
          </p>
        </div>
      </div>

      <transition name="fade">
        <div v-if="showProfileMenu" :class="[
          'absolute z-50 shadow-md border rounded-lg flex flex-col transition-all duration-200',
          'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800',
          collapsed
            ? 'bottom-[110px] left-1/2 -translate-x-1/2 w-14 py-1 mt-4 px-1'
            : 'bottom-[110px] left-4 right-4 w-auto py-2',
        ]">
          <button
            :class="[
              'flex w-full items-center rounded transition',
              collapsed ? 'justify-center px-0 py-2' : 'flex-row px-2 py-2 gap-2',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            :title="collapsed ? t('sidebar.profile_settings') : ''"
            @click="goToSettings">
            <Settings class="w-5 h-5 text-gray-600 dark:text-gray-200" />
            <span v-if="!collapsed" class="ml-2 text-sm text-gray-700 dark:text-gray-200">
              {{ t('sidebar.profile_settings') }}
            </span>
          </button>
          <button
            :class="[
              'flex w-full items-center rounded transition',
              collapsed ? 'justify-center px-0 py-2' : 'flex-row px-2 py-2 gap-2',
              'hover:bg-red-50 dark:hover:bg-red-900',
            ]"
            :title="collapsed ? t('sidebar.logout') : ''"
            @click="logout">
            <LogOut class="w-5 h-5 text-red-600" />
            <span v-if="!collapsed" class="ml-2 text-sm text-red-600 dark:text-red-400">
              {{ t('sidebar.logout') }}
            </span>
          </button>
        </div>
      </transition>

      <div class="text-center text-[11px] text-gray-500 dark:text-gray-400 py-3 flex items-center justify-center gap-2">
        <Zap class="w-4 h-4 text-purple-500" />
        <span v-if="!collapsed">
          {{ t('sidebar.powered_by') }}
          <RouterLink
            to="/about"
            class="ml-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 hover:underline"
          >
            Thesis Developer
          </RouterLink>
        </span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import SidebarItem from './SidebarItem.vue';
import { useUserStore } from '@/store/user';
import api from '@/plugins/axios';
import defaultAvatar from '@/assets/default-avatar.png';
import useSettings from '@/composables/useSettings';
import { useSidebarStore } from '@/store/sidebar';
import { publicUrl, storageUrl } from '@/config/urls';
import {
  BarChart2,
  ShoppingCart,
  FileText,
  Users,
  Utensils,
  List,
  FolderOpen,
  ChevronDown,
  Megaphone,
  Image,
  Bell,
  Boxes,
  Box,
  FlaskConical,
  Leaf,
  Settings,
  LogOut,
  Percent,
  PanelLeftClose,
  PanelRightClose,
  Zap,
} from 'lucide-vue-next';

const { t } = useI18n();
const { settings, fetchSettings } = useSettings();

/** helper: translated text with fallback keys (returns first real translation) */
const tt = (...keys) => {
  for (const k of keys) {
    const v = t(k);
    if (v && v !== k) return v;
  }
  return keys[keys.length - 1];
};

/* Logo URL handling */
const appLogoUrl = computed(() =>
  storageUrl(settings.value.shop_logo, "logo.png")
);
function onLogoError(e) {
  if (e?.target) e.target.src = publicUrl("logo.png");
}
onMounted(fetchSettings);

/* Sidebar collapse */
const sidebarStore = useSidebarStore();
const collapsed = computed({
  get: () => sidebarStore.collapsed,
  set: (val) => sidebarStore.setCollapsed(val),
});
function toggleSidebar() {
  sidebarStore.toggle();
}

/* Role-based visibility */
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);
onMounted(() => userStore.fetchUser());

function normalizeRoleName(user) {
  if (!user) return '';
  const r = user.role?.name || user.role || user.roles?.[0]?.name || '';
  return String(r).toLowerCase();
}
const roleName = computed(() => normalizeRoleName(currentUser.value));
const isCashier = computed(() => roleName.value === 'cashier');

/**
 * Cashier whitelist:
 * Add "inventory" so cashiers see Stock + Ingredient in the sidebar.
 * (Recipe remains hidden below with v-if="!isCashier")
 */
const cashierWhitelist = new Set(['dashboard', 'pos', 'orders', 'menu', 'inventory']);
function showKey(key) {
  return isCashier.value ? cashierWhitelist.has(key) : true;
}

/* Dropdowns */
const route = useRoute();
const isMenuOpen = ref(false);
const isInventoryOpen = ref(false);
const isMarketingOpen = ref(false);
watchEffect(() => {
  isMenuOpen.value = route.path.startsWith('/menu/');
  isInventoryOpen.value = route.path.startsWith('/inventory/');
  isMarketingOpen.value = route.path.startsWith('/marketing/');
});

/* Profile actions */
const showProfileMenu = ref(false);
const toggleProfileMenu = () => (showProfileMenu.value = !showProfileMenu.value);
const router = useRouter();
const goToSettings = () => {
  showProfileMenu.value = false;
  router.push('/settings');
};
const logout = async () => {
  try {
    await api.post('/logout');
    localStorage.removeItem('token');
    userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
const onAvatarError = (e) => {
  if (e?.target) {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
