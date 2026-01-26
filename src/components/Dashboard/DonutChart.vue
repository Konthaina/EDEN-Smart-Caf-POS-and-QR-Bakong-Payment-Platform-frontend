<template>
  <div class="w-full h-full rounded-2xl flex flex-col space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <PieChart class="w-5 h-5 text-indigo-500" />
          <span>{{ $t("top_items.title") }}</span>
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-300">
          {{ $t("top_items.subtitle") }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <select v-model="selectedFilter" @change="fetchTopItems"
          class="text-sm text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="today">{{ $t("revenue.filter.today") }}</option>
          <option value="week">{{ $t("revenue.filter.week") }}</option>
          <option value="month">{{ $t("revenue.filter.month") }}</option>
          <option value="year">{{ $t("revenue.filter.year") }}</option>
        </select>

        <RouterLink :to="{ name: 'DashboardTopItemsDetail', query: { period: selectedFilter } }"
          class="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-md border border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800/40 transition"
          :title="viewLabel">
          <span>{{ viewLabel }}</span>
          <ChevronRight class="w-4 h-4" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>

    <!-- Chart -->
    <div class="relative h-[300px]">
      <Doughnut v-if="hasData" :data="chartData" :options="chartOptions" class="absolute inset-0" />
      <p v-else class="text-gray-400 dark:text-gray-300 text-sm text-center pt-12 flex items-center justify-center gap-2">
        <AlertTriangle class="w-4 h-4" />
        <span>{{ $t("top_items.no_data") }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import api from "@/plugins/axios";
import { AlertTriangle, ChevronRight, PieChart } from "lucide-vue-next";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const { t } = useI18n();
const viewLabel = computed(() => {
  const k = t("common.view_details");
  // graceful fallback if key not defined
  return k === "common.view_details" ? "View details" : k;
});

const selectedFilter = ref("month");
const labels = ref([]);
const values = ref([]);

const hasData = computed(
  () => labels.value.length > 0 && values.value.some((v) => v > 0)
);

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: t("top_items.dataset_label"),
      data: values.value,
      backgroundColor: [
        "#6366F1",
        "#8B5CF6",
        "#EC4899",
        "#F59E0B",
        "#10B981",
        "#3B82F6",
        "#F87171",
        "#FBBF24",
        "#34D399",
        "#60A5FA",
      ],
      borderColor: "#ffffff",
      borderWidth: 2,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  plugins: {
    legend: {
      position: "right",
      labels: {
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#374151",
        usePointStyle: true,
        padding: 14,
        boxWidth: 12,
        font: { size: 12, weight: "500" },
      },
    },
    tooltip: {
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#1F2937"
        : "#F9FAFB",
      titleColor: document.documentElement.classList.contains("dark")
        ? "#F9FAFB"
        : "#111827",
      bodyColor: document.documentElement.classList.contains("dark")
        ? "#D1D5DB"
        : "#374151",
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.raw} ${t("top_items.orders")}`,
      },
    },
  },
}));

async function fetchTopItems() {
  labels.value = [];
  values.value = [];
  try {
    const res = await api.get(`/reports/top-items?filter=${selectedFilter.value}`);
    const items = res.data || [];
    labels.value = items.map((i) => i.name);
    values.value = items.map((i) => i.total_orders);
  } catch {
    labels.value = [];
    values.value = [];
  }
}

onMounted(fetchTopItems);
</script>
