// src/composables/useNotificationCount.js
import { ref } from "vue";
import api from "@/plugins/axios"; // your Laravel API axios instance

const notificationCount = ref(0);
const lowStockItems = ref([]);
const loadingNotifications = ref(false);

function normalizeQty(qty) {
  const n = Number(qty);
  return isFinite(n) ? n : 0;
}

function safeMax(qty, ing) {
  const configured = Number(ing?.max_quantity ?? 0);
  if (isFinite(configured) && configured > 0) return configured;
  return Math.max(normalizeQty(qty), 100);
}

function lowThresholdFor(qty, ing) {
  const raw = Number(ing?.low_alert_qty);
  if (isFinite(raw) && raw >= 0) return raw;
  return 0.2 * safeMax(qty, ing);
}

function isLowQty(qty, ing) {
  return normalizeQty(qty) <= lowThresholdFor(qty, ing);
}

function mapStockToNotification(stock) {
  const qty = normalizeQty(stock?.quantity ?? 0);
  const ing = stock?.ingredient || {};

  return {
    ingredient: ing?.name || ing?.name_kh || "",
    current_stock: qty,
    stock_id: stock?.id ?? null,
    ingredient_id: ing?.id ?? null,
    unit: ing?.unit ?? null,
    days_left: null,
    daily_used: null,
  };
}

/** Public composable */
export function useNotificationCount() {
  // Only the count (fast - for the pill/badge)
  const fetchNotificationCount = async () => {
    try {
      const { data: stocks } = await api.get("/stocks");
      const lowCount = (stocks || []).filter((s) =>
        isLowQty(s?.quantity, s?.ingredient)
      ).length;
      notificationCount.value = lowCount;
    } catch {
      notificationCount.value = 0;
    }
  };

  // Full list + enrich with stock_id/unit so we can navigate
  const fetchLowStock = async () => {
    loadingNotifications.value = true;
    try {
      const { data: stocks } = await api.get("/stocks"); // [{ id, quantity, ingredient:{ id, name, name_kh, unit } }...]
      const low = (stocks || [])
        .filter((s) => isLowQty(s?.quantity, s?.ingredient))
        .map(mapStockToNotification)
        .sort((a, b) => a.current_stock - b.current_stock);

      lowStockItems.value = low;
      notificationCount.value = low.length;
      return low;
    } catch {
      lowStockItems.value = [];
      notificationCount.value = 0;
      return [];
    } finally {
      loadingNotifications.value = false;
    }
  };

  // Reusable click -> navigate helper
  const goToNotificationItem = async (router, item) => {
    if (!router || !item) return;
    if (item.stock_id) {
      await router.push({ name: "StockDetail", params: { id: item.stock_id } });
    } else {
      await router.push({ name: "Stock", query: { q: item.ingredient || "" } });
    }
  };

  return {
    // state
    notificationCount,
    lowStockItems,
    loadingNotifications,
    // actions
    fetchNotificationCount,
    fetchLowStock,
    goToNotificationItem,
  };
}
