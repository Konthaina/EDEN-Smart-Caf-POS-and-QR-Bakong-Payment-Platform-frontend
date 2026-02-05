// src/store/sidebar.js
import { defineStore } from "pinia";

const STORAGE_KEY = "sidebar_collapsed";

const readInitialCollapsed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return false;
    return raw === "true";
  } catch {
    return false;
  }
};

const persistCollapsed = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
  } catch {
    // ignore storage failures (e.g., privacy mode)
  }
};

export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    collapsed: readInitialCollapsed(),
  }),
  actions: {
    toggle() {
      this.collapsed = !this.collapsed;
      persistCollapsed(this.collapsed);
    },
    setCollapsed(val) {
      this.collapsed = val;
      persistCollapsed(this.collapsed);
    },
  },
});
