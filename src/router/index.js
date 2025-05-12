
import { createRouter, createWebHistory } from 'vue-router'
import DashboardOverview from '@/pages/Dashboard/DashboardOverview.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: DashboardOverview },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
