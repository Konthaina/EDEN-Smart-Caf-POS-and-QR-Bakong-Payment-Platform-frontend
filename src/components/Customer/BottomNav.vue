<template>
  <nav
    class="fixed bottom-1 left-1/2 z-50 transform -translate-x-1/2 w-[97vw] max-w-sm"
  >
    <div
      class="flex justify-between items-end bg-white rounded-3xl shadow-xl border-[3px] border-[#a78bfa] px-3 py-2"
      style="box-shadow: 0 4px 24px #a78bfa22"
    >
      <button
        class="nav-btn"
        :class="{ active: isActive('/customer') }"
        @click="go('/customer')"
      >
        <div class="nav-icon">
          <svg v-if="isActive('/customer')" width="44" height="44" class="nav-spot"><circle cx="22" cy="22" r="22" fill="#f4f0ff"/></svg>
          <svg class="icon" fill="none" :stroke="isActive('/customer') ? '#a78bfa' : '#bdbdbd'" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 11.5l9-7 9 7M4 10v10h6v-6h4v6h6V10"/>
          </svg>
        </div>
        <span :class="isActive('/customer') ? 'nav-label-active' : 'nav-label'">Home</span>
        <span v-if="isActive('/customer')" class="nav-underline"></span>
      </button>
      <button
        class="nav-btn"
        :class="{ active: isActive('/search') }"
        @click="go('/search')"
      >
        <div class="nav-icon">
          <svg v-if="isActive('/search')" width="44" height="44" class="nav-spot"><circle cx="22" cy="22" r="22" fill="#f4f0ff"/></svg>
          <svg class="icon" fill="none" :stroke="isActive('/search') ? '#a78bfa' : '#bdbdbd'" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <span :class="isActive('/search') ? 'nav-label-active' : 'nav-label'">Search</span>
        <span v-if="isActive('/search')" class="nav-underline"></span>
      </button>
      <button
        class="nav-btn"
        :class="{ active: isActive('/history') }"
        @click="$emit('openHistory')"
      >
        <div class="nav-icon">
          <svg v-if="isActive('/history')" width="44" height="44" class="nav-spot"><circle cx="22" cy="22" r="22" fill="#f4f0ff"/></svg>
          <svg class="icon" fill="none" :stroke="isActive('/history') ? '#a78bfa' : '#bdbdbd'" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 3"/>
          </svg>
        </div>
        <span :class="isActive('/history') ? 'nav-label-active' : 'nav-label'">History</span>
        <span v-if="isActive('/history')" class="nav-underline"></span>
      </button>
      <button
        class="nav-btn"
        :class="{ active: isActive('/profile') }"
        @click="go('/profile')"
      >
        <div class="nav-icon">
          <svg v-if="isActive('/profile')" width="44" height="44" class="nav-spot"><circle cx="22" cy="22" r="22" fill="#f4f0ff"/></svg>
          <svg class="icon" fill="none" :stroke="isActive('/profile') ? '#a78bfa' : '#bdbdbd'" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
          </svg>
        </div>
        <span :class="isActive('/profile') ? 'nav-label-active' : 'nav-label'">Profile</span>
        <span v-if="isActive('/profile')" class="nav-underline"></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const isActive = (path) =>
  path === '/profile'
    ? router.currentRoute.value.path.startsWith('/profile')
    : router.currentRoute.value.path === path
function go(path) {
  router.push(path)
}
</script>

<style scoped>
.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 0.2rem 0.5rem 0.4rem 0.5rem;
  border-radius: 1.5rem;
  transition: background 0.18s;
  outline: none;
}
.nav-icon {
  position: relative;
  width: 2.4rem;
  height: 2.4rem;
  margin-bottom: 0.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-spot {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  filter: drop-shadow(0 3px 8px #a78bfa40);
}
.icon {
  position: relative;
  z-index: 1;
  width: 1.55rem;
  height: 1.55rem;
}
.nav-label {
  font-size: 13px;
  color: #bdbdbd;
  font-weight: 500;
  margin-top: 2px;
  transition: color 0.18s;
}
.nav-label-active {
  font-size: 13px;
  color: #a78bfa;
  font-weight: 600;
  margin-top: 2px;
  transition: color 0.18s;
}
.nav-underline {
  width: 30px;
  height: 3px;
  background: linear-gradient(90deg, #a78bfa 0%, #c4b5fd 100%);
  border-radius: 999px;
  margin-top: 3px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  animation: underlinePop .2s;
}
@keyframes underlinePop {
  from { width: 0; opacity: 0; }
  to   { width: 30px; opacity: 1; }
}
</style>
