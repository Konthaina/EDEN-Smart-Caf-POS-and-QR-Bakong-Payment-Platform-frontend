import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login.vue";
import Dashboard from "@/views/Dashboard.vue";
import Register from "@/views/Register.vue";
import ForgotPassword from "@/views/ForgotPassword.vue";
import ResetPassword from "@/views/ResetPassword.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "/", component: Dashboard },
  { path: "/register", component: Register },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password", component: ResetPassword },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Allow guest access to login/register/reset
router.beforeEach((to, from, next) => {
  const publicPages = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem("token");

  if (authRequired && !token) return next("/login");
  if (to.path === "/login" && token) return next("/");
  next();
});

export default router;
