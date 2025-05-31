import { createRouter, createWebHistory } from "vue-router";

// Auth
import Login from "@/pages/Auth/Login.vue";
import Register from "@/pages/Auth/Register.vue";
import ResetPassword from "@/pages/Auth/ResetPassword.vue";
import ForgotPassword from "@/pages/Auth/ForgotPassword.vue";

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

// User Management
import Users from "@/pages/Users/ManageUsers.vue";

// Analytics
import Analytics from "@/pages/Analytics/AnalyticsPage.vue";

// Message
import Message from "@/pages/Alerts/Messages.vue";

// Notifications
import Notifications from "@/pages/Alerts/Notifications.vue";

// Settings
import Settings from "@/pages/Settings/Settings.vue";

// About Developer
import About from "@/pages/Settings/About.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "Login", component: Login, meta: { title: "Login - Cafe Eden" } },
  { path: "/register", name: "Register", component: Register, meta: { title: "Register - Cafe Eden" } },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword, meta: { title: "Reset Password - Cafe Eden" } },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword, meta: { title: "Forgot Password - Cafe Eden" } },

  // Protected Routes
  { path: "/dashboard", name: "Dashboard", component: DashboardOverview, meta: { requiresAuth: true, title: "Dashboard - Cafe Eden" } },
  { path: "/pos", name: "POS", component: POSIndex, meta: { requiresAuth: true, title: "POS - Cafe Eden" } },
  { path: "/orders", name: "Orders", component: ManageOrders, meta: { requiresAuth: true, title: "Orders - Cafe Eden" } },
  { path: "/orders/:id", name: "OrderDetail", component: () => import("@/pages/Orders/OrderDetail.vue"), meta: { requiresAuth: true, title: "Order Detail - Cafe Eden" } },

  // Menu Module
  { path: "/menu/items", name: "MenuItems", component: MenuItems, meta: { requiresAuth: true, title: "Menu Items - Cafe Eden" } },
  { path: "/menu/categories", name: "Categories", component: Categories, meta: { requiresAuth: true, title: "Categories - Cafe Eden" } },

  // Inventory Module
  { path: "/inventory/stock", name: "Stock", component: Stock, meta: { requiresAuth: true, title: "Stock - Cafe Eden" } },
  { path: "/inventory/recipe", name: "Recipe", component: Recipe, meta: { requiresAuth: true, title: "Recipes - Cafe Eden" } },
  { path: "/inventory/ingredient", name: "Ingredient", component: Ingredient, meta: { requiresAuth: true, title: "Ingredients - Cafe Eden" } },

  // Reports
  { path: "/reports", name: "Reports", component: SalesReport, meta: { requiresAuth: true, title: "Reports - Cafe Eden" } },

  // User Management
  { path: "/users", name: "Users", component: Users, meta: { requiresAuth: true, title: "User Management - Cafe Eden" } },

  // Analytics
  { path: "/analytics", name: "Analytics", component: Analytics, meta: { requiresAuth: true, title: "Analytics - Cafe Eden" } },

  // Alerts
  { path: "/messages", name: "Message", component: Message, meta: { requiresAuth: true, title: "Messages - Cafe Eden" } },

  // Notifications
  { path: "/notifications", name: "Notifications", component: Notifications, meta: { requiresAuth: true, title: "Notifications - Cafe Eden" } },

  // Settings
  { path: "/settings", name: "Settings", component: Settings, meta: { requiresAuth: true, title: "Settings - Cafe Eden" } },

  // Discounts
  {
    path: "/discounts",
    name: "Discounts",
    component: () => import("@/pages/Discount/DiscountManagement.vue"),
    meta: { requiresAuth: true, title: "Discounts - Cafe Eden" },
  },

  // About Developer
  { path: "/about", name: "About", component: About, meta: { title: "About Developer - Cafe Eden" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Set document title and check auth before each route
router.beforeEach((to, from, next) => {
  const defaultTitle = "Cafe Eden";
  document.title = to.meta.title || defaultTitle;

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: "Login" });
  }

  if ((to.name === "Login" || to.name === "Register") && isLoggedIn) {
    return next({ name: "Dashboard" });
  }

  next();
});

export default router;
