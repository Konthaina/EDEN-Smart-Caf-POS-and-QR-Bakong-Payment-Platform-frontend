import { ref, watchEffect, onMounted } from 'vue'

const dark = ref(localStorage.getItem('theme') === 'dark')

export function useDarkMode() {
  const toggle = () => {
    dark.value = !dark.value
    update()
  }

  const update = () => {
    const html = document.documentElement
    if (dark.value) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  onMounted(update)
  watchEffect(update)

  return { dark, toggle }
}
