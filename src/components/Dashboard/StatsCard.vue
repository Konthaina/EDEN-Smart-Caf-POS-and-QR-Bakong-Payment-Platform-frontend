<template>
  <component :is="to ? RouterLink : 'div'" :to="to" :class="[
    base.bg,
    base.border,
    'group p-6 rounded-2xl shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer',
    'flex items-center justify-between gap-4',
  ]">
    <!-- Left: Title & Value -->
    <div class="space-y-1">
      <div class="text-sm text-gray-500 dark:text-gray-300">{{ title }}</div>
      <div :class="[base.text, 'text-2xl font-bold leading-snug']">
        {{ formattedValue }}
      </div>
    </div>

    <!-- Right: Icon in a colored circle -->
    <div :class="[
      base.iconBg,
      'w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200',
    ]">
      <div :class="[base.iconColor, 'text-2xl']">
        <component v-if="icon && typeof icon !== 'string'" :is="icon" class="w-6 h-6" />
        <span v-else>{{ icon }}</span>
      </div>
    </div>
  </component>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: [Object, Function, String],
  color: { type: String, default: "purple" },
  /** Optional: vue-router LocationObject, e.g. { name:'RevenueDetail', query:{ period:'today' } } */
  to: { type: [String, Object], default: null },
});

const colorMap = {
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800",
    border: "border border-purple-200 dark:border-purple-700",
    text: "text-purple-700 dark:text-purple-200",
    iconColor: "text-purple-600 dark:text-purple-300",
    iconBg: "bg-purple-200 dark:bg-purple-700",
  },
  green: {
    bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800",
    border: "border border-green-200 dark:border-green-700",
    text: "text-green-700 dark:text-green-200",
    iconColor: "text-green-600 dark:text-green-300",
    iconBg: "bg-green-200 dark:bg-green-700",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800",
    border: "border border-blue-200 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-200",
    iconColor: "text-blue-600 dark:text-blue-300",
    iconBg: "bg-blue-200 dark:bg-blue-700",
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800",
    border: "border border-red-200 dark:border-red-700",
    text: "text-red-700 dark:text-red-200",
    iconColor: "text-red-600 dark:text-red-300",
    iconBg: "bg-red-200 dark:bg-red-700",
  },
  yellow: {
    bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800",
    border: "border border-yellow-200 dark:border-yellow-700",
    text: "text-yellow-700 dark:text-yellow-200",
    iconColor: "text-yellow-600 dark:text-yellow-300",
    iconBg: "bg-yellow-200 dark:bg-yellow-700",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800",
    border: "border border-indigo-200 dark:border-indigo-700",
    text: "text-indigo-700 dark:text-indigo-200",
    iconColor: "text-indigo-600 dark:text-indigo-300",
    iconBg: "bg-indigo-200 dark:bg-indigo-700",
  },
};

const base = colorMap[props.color] || colorMap.purple;

const formattedValue = computed(() => {
  if (typeof props.value === "number") return props.value.toFixed(2);
  return props.value;
});
</script>
