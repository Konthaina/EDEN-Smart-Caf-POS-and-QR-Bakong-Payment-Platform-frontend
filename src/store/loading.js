import { defineStore } from "pinia";
import { ref } from "vue";

const funTips = [
  "Pro Tip: You can search orders by customer name!",
  "Did you know? You can use keyboard shortcuts in the POS.",
  "Try dark mode for a better late-night café vibe!",
  "You can print daily sales reports from the dashboard.",
  "Tip: Manage your menu in real time with just one click.",
  "Cashier shortcuts make your workflow faster!",
  "Double-click an order to view details instantly.",
  "POS works smoothly even on a tablet!",
  "Bakong KHQR payments are supported for customers.",
  "Edit user roles in the User Management module.",
  "Customize your cafe logo in settings.",
  "Track low-stock ingredients automatically.",
  "Loyalty points encourage customer returns.",
  "Did you backup your sales data this week?",
  "Stay hydrated! (and so should your coffee beans!)",
];

export const useLoadingStore = defineStore("loading", () => {
  const loading = ref(false);
  const message = ref("Loading...");
  const tip = ref("");

  function show(msg = "Loading...") {
    loading.value = true;
    message.value = msg;
    tip.value = funTips[Math.floor(Math.random() * funTips.length)];
  }
  function hide() {
    loading.value = false;
  }

  return { loading, message, tip, show, hide };
});
