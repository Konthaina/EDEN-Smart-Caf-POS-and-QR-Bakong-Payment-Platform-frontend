// src/store/dashboard.js
import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/plugins/axios";

export const useDashboardStore = defineStore("dashboard", () => {
  // State
  const summary = ref({
    total_revenue: 0,
    order_count: 0,
    date: "",
  });
  const stats = ref([]);
  const clients = ref([]);
  const menus = ref([]);
  const topItems = ref([]);
  const chartData = ref({ labels: [], values: [] });
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const loadDashboard = async () => {
    loading.value = true;
    error.value = null;
    try {
      // Parallel API calls
      const [summaryRes, usersRes, menuRes, statsRes, topItemsRes] =
        await Promise.all([
          api.get("/reports/summary"),
          api.get("/users/view"),
          api.get("/menu-items"),
          api.get("/reports/stats"),
          api.get("/reports/top-items"),
        ]);

      summary.value = summaryRes.data;
      clients.value = Array.isArray(usersRes.data)
        ? usersRes.data.filter((u) => u.role_id === 4)
        : [];
      menus.value = menuRes.data;

      // Stats for line/bar chart (revenue per date)
      stats.value = Array.isArray(statsRes.data)
        ? statsRes.data.map((e) => ({
            date: e.date,
            revenue: e.total_revenue,
          }))
        : [];

      // Top items for donut/bar chart
      topItems.value = Array.isArray(topItemsRes.data) ? topItemsRes.data : [];

      chartData.value = {
        labels: stats.value.map((e) => e.date),
        values: stats.value.map((e) => e.revenue),
      };
    } catch (e) {
      error.value = e;
      console.error("DashboardStore error:", e);
    } finally {
      loading.value = false;
    }
  };

  return {
    summary,
    stats,
    clients,
    menus,
    topItems,
    chartData,
    loading,
    error,
    loadDashboard,
  };
});
