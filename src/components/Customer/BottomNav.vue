<template>
  <nav class="bottom-nav">
    <div class="bottom-nav-inner">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        class="nav-btn"
        :class="{ active: isActive(tab.path) }"
        @click="tab.emit ? $emit(tab.emit) : go(tab.path)"
      >
        <span class="nav-icon-wrap">
          <svg
            v-if="isActive(tab.path)"
            class="nav-spot"
            width="42"
            height="42"
          >
            <circle cx="21" cy="21" r="21" fill="#fffbe8" />
          </svg>
          <span class="icon-badge-container">
            <component
              :is="tab.icon"
              class="icon"
              :class="isActive(tab.path) ? 'text-orange-400' : 'text-gray-400'"
            />
            <!-- Notification Badge -->
            <span
              v-if="tab.label === 'Notifications' && unreadCount > 0"
              class="badge-spot"
            >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </span>
        </span>
        <span :class="isActive(tab.path) ? 'nav-label-active' : 'nav-label'">
          {{ tab.label }}
        </span>
        <transition name="underline">
          <span v-if="isActive(tab.path)" class="nav-underline"></span>
        </transition>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Home, Bell, Clock, User } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  unreadCount: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

const tabs = [
  { label: 'Home', path: '/customer', icon: Home },
  { label: 'Notifications', path: '/notificationscs', icon: Bell },
  { label: 'History', path: '/history', icon: Clock },
  { label: 'Profile', path: '/profile', icon: User },
]

const isActive = (path) =>
  path === '/profile'
    ? router.currentRoute.value.path.startsWith('/profile')
    : router.currentRoute.value.path === path

function go(path) {
  router.push(path)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');

.bottom-nav {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  width: 100vw;
  max-width: 480px;
  padding: 0 16px;
  box-sizing: border-box;
  pointer-events: none;
}
.bottom-nav-inner {
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 2.5rem;
  box-shadow: 0 8px 36px rgba(253, 186, 116, 0.2), 0 2px 8px rgba(253, 186, 116, 0.15);
  border: 2px solid #ffedd5;
  backdrop-filter: blur(12px);
  padding: 0.5rem 0.4rem;
  justify-content: space-around;
  align-items: center;
  pointer-events: auto;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 0.1rem 0.3rem 0.1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 1.8rem;
  position: relative;
  min-width: 0;
  outline: none;
  transition: background 0.18s ease-out;
}
.nav-btn:hover {
  background: #fffdf2;
}
.nav-btn:active,
.nav-btn:focus {
  background: #fffbe8;
}

.nav-icon-wrap {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-spot {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  filter: drop-shadow(0 4px 10px rgba(251, 191, 36, 0.25));
}
.icon-badge-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  position: relative;
  z-index: 1;
  width: 1.6rem;
  height: 1.6rem;
  transition: color 0.2s ease-in-out;
}
.badge-spot {
  position: absolute;
  top: -0.4rem;
  right: -0.6rem;
  background: #ff3838;
  color: #fff;
  font-size: 0.72rem;
  font-weight: bold;
  min-width: 1.15rem;
  height: 1.15rem;
  border-radius: 999px;
  padding: 0 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px #fb923c22;
  z-index: 2;
  pointer-events: none;
}

.nav-label,
.nav-label-active {
  font-family: 'Quicksand', sans-serif;
  font-size: 13.5px;
  margin-top: 3px;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: color 0.18s ease-out, font-weight 0.18s ease-out;
}
.nav-label {
  color: #a1a1aa;
}
.nav-label-active {
  color: #fb923c;
  font-weight: 700;
}

.nav-underline {
  width: 26px;
  height: 3.5px;
  background: linear-gradient(90deg, #fb923c 0%, #fdba74 100%);
  border-radius: 999px;
  margin-top: 4px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.underline-enter-active,
.underline-leave-active {
  transition: all 0.28s cubic-bezier(0.67, 0.01, 0.29, 1.01);
}
.underline-enter-from,
.underline-leave-to {
  opacity: 0;
  width: 0;
}
.underline-enter-to,
.underline-leave-from {
  opacity: 1;
  width: 26px;
}

@media (max-width: 640px) {
  .bottom-nav {
    max-width: 98vw;
    padding: 0 12px;
  }
  .nav-label,
  .nav-label-active {
    font-size: 12.5px;
  }
  .icon,
  .nav-icon-wrap {
    width: 1.5rem;
    height: 1.5rem;
  }
  .nav-spot {
    width: 38px;
    height: 38px;
    top: -5px;
  }
  .nav-underline {
    width: 22px;
  }
  .underline-enter-to,
  .underline-leave-from {
    width: 22px;
  }
}
</style>
