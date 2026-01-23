<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
    <!-- Topbar -->
    <header
      class="w-full px-4 md:px-8 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur"
    >
      <div class="flex items-center gap-3 min-w-0">
        <!-- Dynamic logo -->
        <div
          class="w-9 h-9 rounded-lg overflow-hidden shadow bg-white dark:bg-gray-900 flex items-center justify-center"
        >
          <img
            :src="appLogoUrl"
            alt="Logo"
            class="w-full h-full object-cover"
            @error="onLogoError"
          />
        </div>
        <span
          class="font-bold text-gray-900 dark:text-white text-base md:text-lg truncate"
        >
          {{ displayAppName }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Language switch -->
        <button
          @click="toggleLanguage"
          type="button"
          class="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-inner transition text-sm font-semibold bg-white text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          :title="locale === 'en' ? 'Switch to Khmer' : 'Switch to English'"
          :disabled="loading"
        >
          <img
            :src="
              locale === 'en'
                ? publicUrl('flags/en.png')
                : publicUrl('flags/kh.png')
            "
            class="w-5 h-5 rounded-full shadow"
          />
          {{ locale === "en" ? "EN" : "ខ្មែរ" }}
        </button>

        <!-- Theme switch -->
        <button
          @click="toggleDarkMode"
          type="button"
          class="w-14 h-8 rounded-full relative bg-gray-200 dark:bg-gray-600 transition-colors duration-300"
          :title="darkMode ? 'Light mode' : 'Dark mode'"
          :disabled="loading"
        >
          <span
            class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 z-10"
            :class="darkMode ? 'translate-x-6' : 'translate-x-0'"
          />
          <Sun
            v-if="!darkMode"
            class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500 z-20"
          />
          <Moon
            v-else
            class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-300 z-20"
          />
        </button>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 flex items-center justify-center p-4 md:p-8">
      <div
        class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
      >
        <!-- Left image -->
        <div class="hidden md:block">
          <img
            :src="publicUrl('login-image.jpg')"
            alt="POS preview"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- Right form -->
        <div class="p-8 md:p-10 flex flex-col justify-center gap-6">
          <!-- Brand mark -->
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-3">
              {{ $t("login.welcome") }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t("login.subtitle") }}
            </p>
          </div>

          <!-- Login form -->
          <form
            @submit.prevent="handleLogin"
            class="space-y-5"
            :aria-busy="loading"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ $t("login.email") }}
              </label>
              <input
                v-model="email"
                type="email"
                :placeholder="$t('login.email_placeholder')"
                class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:border-gray-600"
                required
                autocomplete="username"
                :disabled="loading"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ $t("login.password") }}
              </label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="$t('login.password_placeholder')"
                  class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 pr-10"
                  required
                  autocomplete="current-password"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                  :title="showPassword ? 'Hide password' : 'Show password'"
                  :disabled="loading"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 rounded-lg font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="loading"
              :aria-busy="loading"
            >
              <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
              <span>{{
                loading
                  ? $t("login.signing_in") || "Signing in..."
                  : $t("login.signin")
              }}</span>
            </button>
          </form>

          <!-- Links -->
          <div
            class="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm"
          >
            <router-link
              to="/register"
              class="text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              {{ $t("login.create_account") }}
            </router-link>
            <router-link
              to="/forgot-password"
              class="text-gray-600 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-300"
            >
              {{ $t("login.forgot_password") }}
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/plugins/axios";
import { useToast } from "vue-toastification";
import { Sun, Moon, Eye, EyeOff, Loader2 } from "lucide-vue-next";
import useSettings from "@/composables/useSettings";
import { publicUrl, storageUrl } from "@/config/urls";

const { t, locale } = useI18n();
const toast = useToast();
const router = useRouter();

/* Settings (same logic as Sidebar) */
const { settings, fetchSettings } = useSettings();
const appLogoUrl = computed(() =>
  storageUrl(settings.value?.shop_logo, "logo.png")
);
const displayAppName = computed(
  () => settings.value?.shop_name || t("sidebar.app_name")
);

function onLogoError(e) {
  if (e?.target) e.target.src = publicUrl("logo.png");
}

/* Auth state */
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);

/* Toast queue: dedupe + spacing so it never spams */
const toastQueue = ref([]);
let isShowingToast = false;
let lastToastKey = "";
let lastToastAt = 0;
const TOAST_GAP = 900; // ms gap between toasts
const TOAST_DEDUP_MS = 2500; // ignore identical msg within this window

function enqueueToast(type, message, options = {}) {
  const key = `${type}:${message}`;
  const now = Date.now();
  if (key === lastToastKey && now - lastToastAt < TOAST_DEDUP_MS) return;
  lastToastKey = key;
  lastToastAt = now;
  toastQueue.value.push({ type, message, options });
  if (!isShowingToast) processToastQueue();
}

function processToastQueue() {
  if (toastQueue.value.length === 0) {
    isShowingToast = false;
    return;
  }
  isShowingToast = true;
  const { type, message, options } = toastQueue.value.shift();
  (toast[type] || toast)(message, options);
  setTimeout(processToastQueue, TOAST_GAP);
}

const notifyError = (msg) => enqueueToast("error", msg, { timeout: 3000 });

/* Theme */
const prefersDark = () =>
  localStorage.getItem("theme")
    ? localStorage.getItem("theme") === "dark"
    : window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

const darkMode = ref(prefersDark());
const applyDarkMode = () => {
  document.documentElement.classList.toggle("dark", darkMode.value);
  localStorage.setItem("theme", darkMode.value ? "dark" : "light");
};
const toggleDarkMode = () => (darkMode.value = !darkMode.value);
watch(darkMode, applyDarkMode);

/* Language */
const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
};
const toggleLanguage = () =>
  changeLanguage(locale.value === "en" ? "km" : "en");

/* Login */
const handleLogin = async () => {
  if (loading.value) return; // prevent double submit
  loading.value = true;
  try {
    const res = await api.post("/login", {
      email: email.value,
      password: password.value,
    });
    const token = res.data.token;

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const me = await api.get("/me");
    const user = me.data;
    localStorage.setItem("user", JSON.stringify(user));
    if (user.role && user.role.name)
      localStorage.setItem("role", user.role.name);

    // Optional: welcome toast (queued, not spammy)
    // enqueueToast("success", t("login.welcome_back") || "Welcome back!", { timeout: 2000 });

    await router.push("/dashboard");
  } catch (err) {
    notifyError(
      t("login.error_invalid") || "Login failed. Please check your credentials."
    );
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  applyDarkMode();
  const saved = localStorage.getItem("locale");
  if (saved && saved !== locale.value) locale.value = saved;
  await fetchSettings(); // load logo + name
});
</script>
