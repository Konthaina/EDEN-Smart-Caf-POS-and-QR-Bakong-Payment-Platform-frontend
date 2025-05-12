import { createRouter, createWebHistory } from "vue-router";

// Pages
import DashboardOverview from "@/pages/Dashboard/DashboardOverview.vue";
import Login from "@/pages/Auth/Login.vue";
// Optionally import Register, ForgotPassword later

const routes = [
  { path: "/", redirect: "/login" }, // redirect root to login (optional)
  { path: "/login", component: Login },
  { path: "/dashboard", component: DashboardOverview },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
