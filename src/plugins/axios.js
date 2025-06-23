import axios from "axios";
import router from "@/router";

import { useToast } from "vue-toastification";

const toast = typeof useToast === "function" ? useToast() : window.$toast;

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    if (status === 403 && message.includes("User account no longer exists")) {
      if (toast) toast.error("Your account has been deleted.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/login");
    }
    if (status === 401) {
      if (toast) toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/login");
    }
    if (status === 403 && message.includes("insufficient role")) {
      if (toast) toast.error("You do not have permission to access this page.");
      router.push("/dashboard");
    }

    return Promise.reject(error);
  }
);

export default instance;
