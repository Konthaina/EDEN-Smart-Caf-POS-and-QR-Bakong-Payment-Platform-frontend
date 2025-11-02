<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
    <!-- Topbar -->
    <header
      class="w-full px-4 md:px-8 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur"
    >
      <div class="flex items-center gap-3 min-w-0">
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
        >
          <img
            :src="locale === 'en' ? '/flags/en.png' : '/flags/kh.png'"
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
        <!-- Left Image -->
        <div class="hidden md:block">
          <img
            src="/login-image.jpg"
            alt="Reset Password"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- Right Form -->
        <div class="p-8 md:p-10 flex flex-col justify-center gap-6">
          <!-- Heading -->
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ pageTitle }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ pageSubtitle }}
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="submit" class="space-y-4">
            <!-- New Password -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ $t("profile.new_password") || "New Password" }}
              </label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="$t('profile.new_password') || 'New password'"
                  class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 pr-10"
                  required
                  minlength="8"
                  autocomplete="new-password"
                  :disabled="isSubmitting"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  :title="showPassword ? 'Hide password' : 'Show password'"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {{ $t("profile.confirm_password") || "Confirm New Password" }}
              </label>
              <div class="relative">
                <input
                  v-model="passwordConfirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :placeholder="
                    $t('profile.confirm_password') || 'Confirm password'
                  "
                  class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 pr-10"
                  required
                  minlength="8"
                  autocomplete="new-password"
                  :disabled="isSubmitting"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  :title="
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  "
                >
                  <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            >
              {{
                isSubmitting
                  ? mode === "register"
                    ? "Setting…"
                    : "Resetting…"
                  : submitLabel
              }}
            </button>
          </form>

          <!-- Feedback -->
          <p
            v-if="successMessage"
            class="text-green-600 dark:text-green-400 mt-2 text-center text-sm"
          >
            {{ successMessage }}
          </p>
          <p
            v-if="errorMessage"
            class="text-red-600 dark:text-red-400 mt-2 text-center text-sm"
          >
            {{ errorMessage }}
          </p>

          <!-- Back -->
          <div class="text-center mt-1 text-sm">
            <router-link
              to="/login"
              class="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              {{ $t("forgot.back_to_login") || "← Back to Login" }}
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/plugins/axios";
import { Sun, Moon, Eye, EyeOff } from "lucide-vue-next";
import useSettings from "@/composables/useSettings";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

/* ---------- Settings (dynamic logo + app name) ---------- */
const { settings, fetchSettings } = useSettings();
const appLogoUrl = computed(() => {
  if (!settings.value?.shop_logo) return "/logo.png";
  if (/^https?:\/\//.test(settings.value.shop_logo))
    return settings.value.shop_logo;
  return settings.value.shop_logo.startsWith("/storage/")
    ? settings.value.shop_logo
    : `/storage/${settings.value.shop_logo.replace(/^public\//, "")}`;
});
const displayAppName = computed(
  () => settings.value?.shop_name || t("sidebar.app_name")
);
function onLogoError(e) {
  if (e?.target) e.target.src = "/logo.png";
}

/* ---------- Mode from URL (register / forgot) ---------- */
const mode = computed(() =>
  route.query.mode === "register" ? "register" : "forgot"
);

const pageTitle = computed(() =>
  mode.value === "register"
    ? t("reset.title_register") || "Set your password"
    : t("reset.title_forgot") || "Reset your password"
);

const pageSubtitle = computed(() =>
  mode.value === "register"
    ? t("reset.subtitle_register") ||
      "Create a password to activate your account."
    : t("reset.subtitle_forgot") || "Choose a new password for your account."
);

const submitLabel = computed(() =>
  mode.value === "register"
    ? t("reset.submit_register") || "Set Password"
    : t("reset.submit_forgot") || "Reset Password"
);

/* ---------- Form state ---------- */
const email = ref("");
const token = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

/* ---------- Theme (dark / light) ---------- */
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

/* ---------- Language ---------- */
const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
};
const toggleLanguage = () =>
  changeLanguage(locale.value === "en" ? "km" : "en");

/* ---------- Submit ---------- */
const submit = async () => {
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value =
      (t("profile.confirm_password") || "Confirm Password") + ": mismatch";
    successMessage.value = "";
    return;
  }
  isSubmitting.value = true;
  try {
    await api.post("/reset-password", {
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    successMessage.value =
      mode.value === "register"
        ? t("reset.success_register") || "Password set! You can now log in."
        : t("reset.success_forgot") || "Password has been reset successfully!";
    errorMessage.value = "";
    setTimeout(() => router.push("/login"), 1200);
  } catch (err) {
    successMessage.value = "";
    errorMessage.value =
      err?.response?.data?.message ||
      t("reset.error_generic") ||
      "Reset failed. Try again.";
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  applyDarkMode();
  const saved = localStorage.getItem("locale");
  if (saved && saved !== locale.value) locale.value = saved;

  token.value = String(route.query.token || "");
  email.value = String(route.query.email || "");

  await fetchSettings();
});
</script>
