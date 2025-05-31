// src/composables/baseStyle.js
export const baseStyle = {
  card: {
    bg: 'bg-white',
    border: 'border border-gray-200',
    rounded: 'rounded-2xl',
    padding: 'p-6',
    shadow: 'shadow hover:shadow-md transition-all duration-200 ease-in-out',
  },
  text: {
    heading: 'text-2xl font-bold text-gray-800',
    subheading: 'text-sm text-gray-500',
    label: 'text-sm font-medium text-gray-700',
    input: 'text-sm text-gray-800 placeholder-gray-400',
  },
  input: 'border border-gray-300 rounded-lg px-4 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-purple-500',
  button: {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow',
    subtle: 'text-gray-600 hover:text-gray-900 text-sm',
  },
  icon: {
    base: 'w-10 h-10 flex items-center justify-center rounded-full',
    color: {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
    },
  },
}
