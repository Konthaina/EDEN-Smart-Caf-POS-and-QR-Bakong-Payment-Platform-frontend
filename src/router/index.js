import { createRouter, createWebHistory } from "vue-router";

// Auth
import Login from "@/pages/Auth/Login.vue";

// Main Pages
import DashboardOverview from "@/pages/Dashboard/DashboardOverview.vue";
import POSIndex from "@/pages/POS/POSIndex.vue";
import ManageOrders from "@/pages/Orders/ManageOrders.vue";

// Menu
import MenuItems from "@/pages/Menu/MenuItems.vue";
import Categories from "@/pages/Menu/Categories.vue";

// Inventory
import Stock from "@/pages/Inventory/Stock.vue";
import Recipe from "@/pages/Inventory/Recipe.vue";
import Ingredient from "@/pages/Inventory/Ingredients.vue";

// Reports
import SalesReport from "@/pages/Reports/SalesReport.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },

  // Protected Routes
  {
    path: "/dashboard",
    component: DashboardOverview,
    meta: { requiresAuth: true },
  },
  { path: "/pos", component: POSIndex, meta: { requiresAuth: true } },
  { path: "/orders", component: ManageOrders, meta: { requiresAuth: true } },
  {
    path: "/orders/:id",
    component: () => import("@/pages/Orders/OrderDetail.vue"),
    meta: { requiresAuth: true },
  },

  // Menu Module
  { path: "/menu/items", component: MenuItems, meta: { requiresAuth: true } },
  {
    path: "/menu/categories",
    component: Categories,
    meta: { requiresAuth: true },
  },

  // Inventory Module
  { path: "/inventory/stock", component: Stock, meta: { requiresAuth: true } },
  {
    path: "/inventory/recipe",
    component: Recipe,
    meta: { requiresAuth: true },
  },
  {
    path: "/inventory/ingredient",
    component: Ingredient,
    meta: { requiresAuth: true },
  },

  // Reports
  { path: "/reports", component: SalesReport, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
