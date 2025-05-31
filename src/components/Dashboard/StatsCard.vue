<template>
  <div
    :class="[
      base.bg,
      base.border,
      'group p-6 rounded-2xl shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer',
      'flex items-center justify-between gap-4'
    ]"
  >
    <!-- Left: Title & Value -->
    <div class="space-y-1">
      <div class="text-sm text-gray-500">{{ title }}</div>
      <div :class="[base.text, 'text-2xl font-bold leading-snug']">
        {{ formattedValue }}
      </div>
    </div>

    <!-- Right: Icon in a colored circle -->
    <div
      :class="[base.iconBg, 'w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200']"
    >
      <div :class="[base.iconColor, 'text-2xl']">
        {{ icon }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: {
    type: String,
    default: 'purple'
  }
})

// Tailwind-safe color palette
const colorMap = {
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border border-purple-200',
    text: 'text-purple-700',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-200'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border border-green-200',
    text: 'text-green-700',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-200'
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border border-blue-200',
    text: 'text-blue-700',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-200'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border border-red-200',
    text: 'text-red-700',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-200'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    border: 'border border-yellow-200',
    text: 'text-yellow-700',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-200'
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    border: 'border border-indigo-200',
    text: 'text-indigo-700',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-200'
  }
}

const base = colorMap[props.color] || colorMap.purple

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toFixed(2)
  }
  return props.value
})
</script>
