import axios from "axios";
import router from "@/router"; // Make sure Vue Router is imported
import { useToast } from "vue-toastification"; // Optional: only if you're using toast

const toast = useToast();

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to request headers
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response error handling
instance.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    // 🔐 Handle deleted user (from CheckUserExists middleware)
    if (status === 403 && message.includes("User account no longer exists")) {
      toast.error("Your account has been deleted.");
      localStorage.removeItem("token");
      router.push("/login");
    }

    // 🔐 Handle expired or invalid token
    if (status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      router.push("/login");
    }

    return Promise.reject(error);
  }
);

export default instance;
