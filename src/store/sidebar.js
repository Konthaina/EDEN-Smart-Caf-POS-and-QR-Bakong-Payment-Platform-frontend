// src/store/sidebar.js
import { defineStore } from "pinia";

export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    collapsed: false,
  }),
  actions: {
    toggle() {
      this.collapsed = !this.collapsed;
    },
    setCollapsed(val) {
      this.collapsed = val;
    },
  },
});
