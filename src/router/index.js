import { createRouter, createWebHistory } from "vue-router";
import axios from "@/plugins/axios";

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

import Profile from "@/pages/Customer/Profile.vue";
const MarketingBanner = () => import("@/pages/Marketing/MarketingBanner.vue");
const NotificationManagement = () =>
  import("@/pages/Marketing/NotificationManagement.vue");

// Discounts (lazy-loaded)
const DiscountManagement = () =>
  import("@/pages/Discount/DiscountManagement.vue");

// Customer Home (NEW)
const CustomerHome = () => import("@/pages/Customer/Home.vue");

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: "Login - Cafe Eden" },
  },
  {
    path: "/marketing/banner",
    name: "MarketingBanner",
    component: MarketingBanner,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin"],
      title: "Banner Management - Cafe Eden",
    },
  },
  {
    path: "/marketing/notification",
    name: "NotificationManagement",
    component: NotificationManagement,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin"],
      title: "Notification Management - Cafe Eden",
    },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { title: "Register - Cafe Eden" },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { title: "Reset Password - Cafe Eden" },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { title: "Forgot Password - Cafe Eden" },
  },

  // Dashboard: all roles
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardOverview,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier"],
      title: "Dashboard - Cafe Eden",
    },
  },

  // POS: staff only
  {
    path: "/pos",
    name: "POS",
    component: POSIndex,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier"],
      title: "POS - Cafe Eden",
    },
  },

  // Orders: staff only
  {
    path: "/orders",
    name: "Orders",
    component: ManageOrders,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier"],
      title: "Orders - Cafe Eden",
    },
  },
  {
    path: "/orders/:id",
    name: "OrderDetail",
    component: () => import("@/pages/Orders/OrderDetail.vue"),
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier"],
      title: "Order Detail - Cafe Eden",
    },
  },

  // Menu Module: admin/staff only
  {
    path: "/menu/items",
    name: "MenuItems",
    component: MenuItems,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier"],
      title: "Menu Items - Cafe Eden",
    },
  },
  {
    path: "/menu/categories",
    name: "Categories",
    component: Categories,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier"],
      title: "Categories - Cafe Eden",
    },
  },

  // Inventory Module: admin only
  {
    path: "/inventory/stock",
    name: "Stock",
    component: Stock,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin"],
      title: "Stock - Cafe Eden",
    },
  },
  {
    path: "/inventory/recipe",
    name: "Recipe",
    component: Recipe,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin"],
      title: "Recipes - Cafe Eden",
    },
  },
  {
    path: "/inventory/ingredient",
    name: "Ingredient",
    component: Ingredient,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin"],
      title: "Ingredients - Cafe Eden",
    },
  },

  // Reports: admin/staff only
  {
    path: "/reports",
    name: "Reports",
    component: SalesReport,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier"],
      title: "Reports - Cafe Eden",
    },
  },

  // User Management: admin only
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin"],
      title: "User Management - Cafe Eden",
    },
  },

  // Analytics: admin only
  {
    path: "/analytics",
    name: "Analytics",
    component: Analytics,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin"],
      title: "Analytics - Cafe Eden",
    },
  },

  // Alerts: all roles
  {
    path: "/messages",
    name: "Message",
    component: Message,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier", "Customer", "Table"],
      title: "Messages - Cafe Eden",
    },
  },

  // Notifications: all roles (this is the *user-facing* notification center)
  {
    path: "/notifications",
    name: "Notifications",
    component: Notifications,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier", "Customer", "Table"],
      title: "Notifications - Cafe Eden",
    },
  },

  // Settings: all roles
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier", "Customer", "Table"],
      title: "Settings - Cafe Eden",
    },
  },

  // Discounts: all roles
  {
    path: "/discounts",
    name: "Discounts",
    component: DiscountManagement,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier", "Customer", "Table"],
      title: "Discounts - Cafe Eden",
    },
  },

  // Customer Home: customer only
  {
    path: "/customer",
    name: "CustomerHome",
    component: CustomerHome,
    meta: {
      requiresAuth: true,
      roles: ["Customer"],
      title: "My Account - Cafe Eden",
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      requiresAuth: true,
      roles: ["Super Admin", "Admin", "Cashier", "Customer", "Table"],
      title: "My Profile - Cafe Eden",
    },
  },

  // Not found page
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/components/Common/NotFound.vue"),
    meta: { title: "404 Not Found - Cafe Eden" },
  },

  // About
  {
    path: "/about",
    name: "About",
    component: About,
    meta: { title: "About Developer - Cafe Eden" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- Role-to-home function ---
function getHomeRouteByRole(role) {
  switch (role) {
    case "Super Admin":
    case "Admin":
    case "Cashier":
      return { name: "Dashboard" };
    case "Customer":
      return { name: "CustomerHome" };
    case "Table":
      return { name: "POS" };
    default:
      return { name: "Login" };
  }
}

// --- Navigation Guard ---
router.beforeEach(async (to, from, next) => {
  const defaultTitle = "Cafe Eden";
  document.title = to.meta.title || defaultTitle;

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Redirect authenticated users from login/register to their home page
  if ((to.name === "Login" || to.name === "Register") && isLoggedIn) {
    let userRole = localStorage.getItem("role");
    if (!userRole) {
      try {
        const res = await axios.get("/me");
        userRole = res.data.role?.name || res.data.role || "";
        localStorage.setItem("role", userRole);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        return next({ name: "Login" });
      }
    }
    return next(getHomeRouteByRole(userRole));
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: "Login" });
  }

  if (!to.meta.roles) return next();

  let userRole = localStorage.getItem("role");
  if (!userRole && isLoggedIn) {
    try {
      const res = await axios.get("/me");
      userRole = res.data.role?.name || res.data.role || "";
      localStorage.setItem("role", userRole);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return next({ name: "Login" });
    }
  }

  if (!userRole || !to.meta.roles.includes(userRole)) {
    if (window.$toast) window.$toast.error("No access permission!");
    const homeRoute = getHomeRouteByRole(userRole);
    if (to.name !== homeRoute.name) {
      return next(homeRoute);
    } else {
      // Already at home page, do nothing (avoid infinite redirect)
      return;
    }
  }

  next();
});

export default router;
