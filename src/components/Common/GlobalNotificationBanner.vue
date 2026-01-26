<template>
  <!-- Top-center pill -->
  <transition name="fade">
    <div
      v-if="pillVisible && countToUse > 0"
      class="fixed z-50 top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce-in cursor-pointer"
      @click="openList"
      title="View low stock"
    >
      <Bell class="w-5 h-5" />
      <span class="font-semibold">
        {{
          countToUse === 1
            ? "You have 1 low-stock item"
            : `You have ${countToUse} low-stock items`
        }}
      </span>
      <button
        @click.stop="pillVisible = false"
        class="ml-2 px-2 text-white/80 hover:text-white focus:outline-none text-lg"
        aria-label="Dismiss"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </transition>

  <!-- Modal with list (teleported to body so it sits above everything) -->
  <teleport to="body">
    <div v-if="panelOpen" class="fixed inset-0 z-[1000]">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="closeList" />
      <!-- panel -->
      <div
        class="absolute left-1/2 top-16 -translate-x-1/2 w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200/60 dark:border-gray-700 overflow-hidden"
        @click.stop
      >
        <div
          class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-amber-500" />
            <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Low stock items
            </h3>
          </div>
          <button
            class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="closeList"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div
          v-if="loadingNotifications"
          class="p-6 text-center text-gray-500 dark:text-gray-300"
        >
          <span class="animate-pulse">Loading…</span>
        </div>

        <div
          v-else-if="!lowStockItems.length"
          class="p-8 text-center text-gray-500 dark:text-gray-300"
        >
          No low-stock notifications.
        </div>

        <div v-else class="max-h-[60vh] overflow-y-auto">
          <div
            v-for="it in lowStockItems"
            :key="it.ingredient"
            class="flex items-center justify-between p-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 cursor-pointer"
            @click="go(it)"
          >
            <div class="min-w-0">
              <div
                class="font-semibold text-sm text-red-700 dark:text-red-200 truncate"
              >
                {{ it.ingredient }}
              </div>
              <div class="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                Current: <b>{{ it.current_stock }}</b>
                <span v-if="it.unit" class="opacity-70"> {{ it.unit }}</span>
                <template v-if="Number(it.current_stock) === 0">
                  · <b class="text-red-600 dark:text-red-300">Out of stock</b>
                </template>
                <template v-else>
                  <span v-if="it.days_left">
                    · Days left: <b>{{ Math.round(it.days_left) }}</b></span
                  >
                  <span v-if="it.daily_used">
                    · Used/day:
                    <b>{{ Number(it.daily_used).toFixed(2) }}</b></span
                  >
                </template>
              </div>
            </div>

            <div class="shrink-0 flex items-center gap-2">
              <span
                v-if="Number(it.current_stock) === 0"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-700 text-white dark:bg-red-900"
              >
                Out
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
              >
                Low
              </span>
              <button
                class="px-3 py-1 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-500 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition"
                @click.stop="go(it)"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        <div
          class="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-right text-xs"
        >
          <RouterLink
            :to="stockListLink"
            @click.native="closeList"
            class="border rounded-lg px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Open Stock page
          </RouterLink>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useNotificationCount } from "@/composables/useNotificationCount";
import { AlertTriangle, Bell, X } from "lucide-vue-next";

const props = defineProps({
  /** Optional: parent can pass a count; if omitted we use the composable's count */
  count: { type: Number, default: null },
});

const router = useRouter();
const {
  notificationCount,
  lowStockItems,
  loadingNotifications,
  fetchNotificationCount,
  fetchLowStock,
  goToNotificationItem,
} = useNotificationCount();

const countToUse = computed(() =>
  typeof props.count === "number" ? props.count : notificationCount.value
);

const pillVisible = ref(false);
const panelOpen = ref(false);

// show pill when count increases (> 0)
let lastCount = 0;
watch(
  () => countToUse.value,
  (newCount) => {
    if (newCount > 0 && newCount !== lastCount) {
      pillVisible.value = true;
      lastCount = newCount;
    }
  },
  { immediate: true }
);

const stockListLink = computed(() =>
  router.hasRoute("Stock") ? { name: "Stock" } : "/inventory/stock"
);

async function openList() {
  panelOpen.value = true;
  pillVisible.value = false;
  await fetchLowStock();
}

function closeList() {
  panelOpen.value = false;
}

async function go(item) {
  await goToNotificationItem(router, item);
  closeList();
}

onMounted(async () => {
  // keep count in sync even if parent doesn't pass a prop
  await fetchNotificationCount();
});
</script>

<style scoped>
/* fade for pill */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* pill entrance */
.animate-bounce-in {
  animation: bounce-in 0.7s;
}
@keyframes bounce-in {
  0% {
    transform: scale(0.8) translateY(-40px);
    opacity: 0;
  }
  60% {
    transform: scale(1.05) translateY(10px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
