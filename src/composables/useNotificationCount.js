// src/composables/useNotificationCount.js
import { ref } from "vue";
import axios from "axios";
import api from "@/plugins/axios"; // your Laravel API axios instance

const notificationCount = ref(0);
const lowStockItems = ref([]);
const loadingNotifications = ref(false);

function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()\-_/]/g, "")
    .trim();
}

function dedupeByName(rows) {
  const seen = new Map();
  for (const r of rows || []) {
    const k = normalizeName(r.ingredient);
    if (!k) continue;
    if (!seen.has(k)) {
      seen.set(k, { ...r });
    } else {
      const prev = seen.get(k);
      const currStock = Number(r.current_stock ?? Infinity);
      const prevStock = Number(prev.current_stock ?? Infinity);
      if (currStock < prevStock) seen.set(k, { ...prev, ...r });
    }
  }
  return [...seen.values()];
}

/** Public composable */
export function useNotificationCount() {
  // Only the count (fast – for the pill/badge)
  const fetchNotificationCount = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5002/ai/inventory-stockout"
      );
      notificationCount.value = (data || []).length;
    } catch {
      notificationCount.value = 0;
    }
  };

  // Full list + enrich with stock_id/unit so we can navigate
  const fetchLowStock = async () => {
    loadingNotifications.value = true;
    try {
      // 1) AI service rows
      const { data: lowRaw } = await axios.get(
        "http://localhost:5002/ai/inventory-stockout"
      );
      const low = dedupeByName(lowRaw);

      // 2) Real stocks (so we know stock.id)
      const { data: stocks } = await api.get("/stocks"); // [{ id, quantity, ingredient:{ id, name, name_kh, unit } }...]

      const nameToStock = new Map();
      for (const s of stocks || []) {
        const en = normalizeName(s?.ingredient?.name);
        const km = normalizeName(s?.ingredient?.name_kh);
        if (en) nameToStock.set(en, s);
        if (km) nameToStock.set(km, s);
      }

      // 3) Enrich
      lowStockItems.value = (low || []).map((it) => {
        const match = nameToStock.get(normalizeName(it.ingredient));
        return {
          ...it,
          stock_id: match?.id ?? null,
          ingredient_id: match?.ingredient?.id ?? null,
          unit: match?.ingredient?.unit ?? null,
        };
      });

      notificationCount.value = lowStockItems.value.length;
      return lowStockItems.value;
    } catch {
      lowStockItems.value = [];
      notificationCount.value = 0;
      return [];
    } finally {
      loadingNotifications.value = false;
    }
  };

  // Reusable click → navigate helper
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
