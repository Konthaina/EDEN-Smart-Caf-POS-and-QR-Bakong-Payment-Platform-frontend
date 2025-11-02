<template>
  <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md px-6 py-5 flex flex-col space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-base font-semibold text-gray-800 dark:text-white">
          📈 {{ $t("revenue.title") }}
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-300">
          {{ $t("revenue.subtitle") }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <select v-model="selectedFilter" @change="fetchRevenue"
          class="text-sm text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="today">{{ $t("revenue.filter.today") }}</option>
          <option value="week">{{ $t("revenue.filter.week") }}</option>
          <option value="month">{{ $t("revenue.filter.month") }}</option>
          <option value="year">{{ $t("revenue.filter.year") }}</option>
        </select>

        <RouterLink :to="{ name: 'DashboardRevenueDetail', query: { period: selectedFilter } }"
          class="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-md border border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800/40 transition"
          :title="viewLabel">
          <span>{{ viewLabel }}</span>
          <span aria-hidden>›</span>
        </RouterLink>
      </div>
    </div>

    <!-- Chart -->
    <div class="relative h-[400px]">
      <Bar v-if="loaded" :data="chartData" :options="chartOptions" class="absolute inset-0" />
      <p v-else-if="error" class="text-red-500 text-center text-sm py-10">
        ⚠️ {{ error }}
      </p>
      <p v-else class="text-gray-400 dark:text-gray-300 text-center text-sm py-10">
        {{ $t("revenue.loading") }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Bar } from "vue-chartjs";
import { RouterLink } from "vue-router";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import api from "@/plugins/axios";

const { t } = useI18n();
const viewLabel = computed(() => {
  const k = t("common.view_details");
  return k === "common.view_details" ? "View details" : k;
});

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const selectedFilter = ref("month");
const labels = ref([]);
const values = ref([]);
const loaded = ref(false);
const error = ref(null);

// Colorful palette for pillars
const chartColors = [
  "#6366F1", // Indigo
  "#06B6D4", // Cyan
  "#F59E42", // Amber
  "#10B981", // Emerald
  "#F43F5E", // Rose
  "#A78BFA", // Violet
  "#FBBF24", // Yellow
  "#3B82F6", // Blue
  "#F472B6", // Pink
  "#34D399", // Green
];

// Khmer label helpers
const khmerDays = { Mon: "ចន្ទ", Tue: "អង្គារ", Wed: "ពុធ", Thu: "ព្រហស្បតិ៍", Fri: "សុក្រ", Sat: "សៅរ៍", Sun: "អាទិត្យ" };
const khmerMonths = { Jan: "មករា", Feb: "កម្ភៈ", Mar: "មីនា", Apr: "មេសា", May: "ឧសភា", Jun: "មិថុនា", Jul: "កក្កដា", Aug: "សីហា", Sep: "កញ្ញា", Oct: "តុលា", Nov: "វិច្ឆិកា", Dec: "ធ្នូ" };
function getKhmerLabel(filter, label) {
  if (filter === "week") return khmerDays[label] || label;
  if (filter === "year") return khmerMonths[label] || label;
  return label;
}

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: t("revenue.dataset_label"),
      data: values.value,
      backgroundColor: labels.value.map((_, i) => chartColors[i % chartColors.length]),
      borderRadius: 8,
      barThickness: 28,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#6B7280", font: { weight: "600", size: 12 } },
    },
    y: {
      grid: { display: false },
      ticks: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#10B981",
      bodyColor: "#F9FAFB",
      callbacks: {
        title: (items) => items[0]?.label || "",
        label: (ctx) => `📈 $${ctx.raw} ${t("revenue.tooltip")}`,
      },
    },
  },
}));

async function fetchRevenue() {
  loaded.value = false;
  error.value = null;
  try {
    const res = await api.get(`/reports/revenue?filter=${selectedFilter.value}`);
    const rawData = res.data || [];
    labels.value = rawData.map((item) => getKhmerLabel(selectedFilter.value, item.label));
    values.value = rawData.map((item) => item.revenue);
    loaded.value = true;
  } catch (err) {
    console.error(err);
    error.value = t("revenue.error");
  }
}

watch(selectedFilter, fetchRevenue);
onMounted(fetchRevenue);
</script>
