// src/plugins/axios.js
import axios from "axios";
import router from "@/router";
import { useToast } from "vue-toastification";

const toast = typeof useToast === "function" ? useToast() : window.$toast;

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// -------- Options you can tweak --------
// If you want to show the toast ONLY ONCE per page load, set this to true.
// If you never want the toast, leave it false (default).
const SHOW_SESSION_TOAST_ONCE = false;
// --------------------------------------

let hasShownSessionExpired = false;
let isRedirectingForAuth = false;

// Helper: current context is guest-order?
function isGuestOrderRoute() {
  const path = window.location.pathname;
  return /^\/guest-order(\/|$)/.test(path);
}

instance.interceptors.request.use((config) => {
  let token = isGuestOrderRoute()
    ? localStorage.getItem("table_token")
    : localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // You can opt-in to show toast for this request:
  // api.get('/something', { meta: { showAuthToast: true } })
  // By default we keep it silent.
  config.meta = config.meta || {};
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const cfg = error.config || {};
    const isGuest = isGuestOrderRoute();

    const isSessionExpired =
      status === 401 ||
      (status === 403 && message.includes("User account no longer exists"));

    const isInsufficientRole =
      status === 403 && message.includes("insufficient role");

    // Helper: show toast if allowed
    const maybeToast = (text) => {
      // If request opted-in, always show. Otherwise respect global setting.
      const wantToast = cfg.meta?.showAuthToast
        ? true
        : SHOW_SESSION_TOAST_ONCE && !hasShownSessionExpired;

      if (toast && wantToast) {
        toast.error(text);
        hasShownSessionExpired = true;
      }
    };

    if (isSessionExpired) {
      // Remove only the relevant token
      if (isGuest) {
        localStorage.removeItem("table_token");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }

      // Optional toast (default silent)
      maybeToast("Session expired. Please log in again.");

      // Avoid double redirects
      if (!isRedirectingForAuth) {
        isRedirectingForAuth = true;
        if (isGuest) {
          router.push("/guest-order-expired");
        } else {
          router.push("/login");
        }
      }
    } else if (isInsufficientRole) {
      // Keep this quiet too unless request opted-in
      const wantToast =
        cfg.meta?.showAuthToast || (!SHOW_SESSION_TOAST_ONCE && false); // default: no toast
      if (toast && wantToast) {
        toast.error("You do not have permission to access this page.");
      }
      router.push("/dashboard");
    }

    return Promise.reject(error);
  }
);

export default instance;
