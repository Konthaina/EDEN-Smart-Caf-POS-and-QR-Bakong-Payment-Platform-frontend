// src/store/user.js
import { defineStore } from "pinia";
import api from "@/plugins/axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    currentUser: null,
  }),
  getters: {
    userRole: (state) =>
      state.currentUser?.role?.name || localStorage.getItem("role") || "",
  },
  actions: {
    async fetchUser() {
      if (!this.currentUser) {
        try {
          const res = await api.get("/profile");
          this.currentUser = res.data;
          if (res.data.role?.name) {
            localStorage.setItem("role", res.data.role.name);
          }
        } catch (err) {
          console.error("Failed to fetch user info", err);
        }
      }
    },
    logout() {
      this.currentUser = null;
      localStorage.removeItem("role");
    },
  },
});
