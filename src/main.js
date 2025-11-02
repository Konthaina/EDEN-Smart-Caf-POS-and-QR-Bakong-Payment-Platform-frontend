import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "./style.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./assets/fonts.css";
// Khmer Unicode
import i18n from "./plugins/i18n";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

app.use(Toast, {
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  position: "top-right",
});

// ✅ Set locale after i18n is used
const savedLocale = localStorage.getItem("locale");
if (savedLocale) {
  i18n.global.locale.value = savedLocale;
}

app.mount("#app");
