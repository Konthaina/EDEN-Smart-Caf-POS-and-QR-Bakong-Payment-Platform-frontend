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
          >{{ displayAppName }}</span
        >
      </div>

      <div class="flex items-center gap-3">
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
            alt="Preview"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- Right form -->
        <div class="p-8 md:p-10 flex flex-col justify-center gap-6">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-3">
              {{
                step === 1
                  ? $t("reset.title") || "Reset your password"
                  : $t("reset.enter_code") || "Verify code & set new password"
              }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{
                step === 1
                  ? $t("reset.subtitle") ||
                    "We’ll send a 6-digit code to your email"
                  : $t("reset.sent_to") ||
                    "We sent a 6-digit code to your email"
              }}
            </p>
          </div>

          <!-- Step 1: Email -->
          <form
            v-if="step === 1"
            @submit.prevent="sendCode"
            class="space-y-5"
            :aria-busy="loading"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >{{ $t("login.email") || "Email" }}</label
              >
              <input
                v-model.trim="email"
                type="email"
                autocomplete="email"
                class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:border-gray-600"
                :placeholder="
                  $t('login.email_placeholder') || 'you@example.com'
                "
                required
                :disabled="loading"
              />
            </div>

            <button
              type="submit"
              class="w-full py-2.5 rounded-lg font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
              <span>{{
                loading
                  ? $t("common.loading") || "Loading..."
                  : $t("reset.send_code") || "Send code"
              }}</span>
            </button>

            <p class="text-center text-sm text-gray-600 dark:text-gray-400">
              <router-link
                to="/login"
                class="text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                {{ $t("reset.back_to_login") || "Back to login" }}
              </router-link>
            </p>
          </form>

          <!-- Step 2: Verify first, then show password -->
          <div v-else class="space-y-5">
            <!-- Email (read-only) -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >{{ $t("login.email") || "Email" }}</label
              >
              <input
                :value="email"
                type="email"
                disabled
                class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              />
            </div>

            <!-- 2A: OTP verify -->
            <form
              v-if="!otpVerified"
              @submit.prevent="verifyCode"
              class="space-y-5"
              :aria-busy="loading"
            >
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >{{ $t("otp.code") || "6-digit code" }}</label
                >
                <input
                  v-model="code"
                  inputmode="numeric"
                  maxlength="6"
                  class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:border-gray-600"
                  :placeholder="$t('otp.placeholder') || 'Enter code'"
                  required
                  :disabled="loading"
                />
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="submit"
                  class="flex-1 py-2.5 rounded-lg font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  :disabled="loading"
                >
                  <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
                  <span>{{ $t("otp.verify") || "Verify code" }}</span>
                </button>

                <button
                  type="button"
                  @click="resend"
                  :disabled="loading || resendCooldown > 0"
                  class="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                >
                  {{ $t("otp.resend") || "Resend" }}
                  <span v-if="resendCooldown > 0">({{ resendCooldown }}s)</span>
                </button>
              </div>
            </form>

            <!-- Verified indicator -->
            <div
              v-else
              class="flex items-center gap-2 text-green-600 dark:text-green-400"
            >
              <CheckCircle class="w-5 h-5" />
              <span>{{ $t("otp.verified") || "Code verified" }}</span>
              <span v-if="ttlLeftSec > 0" class="text-xs text-gray-500"
                >• {{ Math.ceil(ttlLeftSec / 60) }} min left</span
              >
            </div>

            <!-- 2B: Password fields (only after verified) -->
            <form
              v-if="otpVerified"
              @submit.prevent="submitReset"
              class="space-y-5"
              :aria-busy="loading"
            >
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >{{ $t("register.password") || "New password" }}</label
                >
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:border-gray-600 pr-10"
                    :placeholder="
                      $t('register.password_placeholder') ||
                      'Create a strong password'
                    "
                    required
                    :disabled="loading"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    :disabled="loading"
                  >
                    <Eye v-if="!showPassword" class="w-5 h-5" />
                    <EyeOff v-else class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >{{
                    $t("register.confirm_password") || "Confirm password"
                  }}</label
                >
                <input
                  v-model="password_confirmation"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full px-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:border-gray-600"
                  :placeholder="
                    $t('register.confirm_placeholder') || 'Repeat password'
                  "
                  required
                  :disabled="loading"
                />
              </div>

              <button
                type="submit"
                class="w-full py-2.5 rounded-lg font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                :disabled="loading"
              >
                <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
                <span>{{ $t("reset.reset_btn") || "Reset password" }}</span>
              </button>
            </form>

            <p class="text-center text-sm text-gray-600 dark:text-gray-400">
              <button
                type="button"
                @click="step = 1"
                class="text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                {{ $t("reset.change_email") || "Use a different email" }}
              </button>
            </p>
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
import { CheckCircle, Eye, EyeOff, Loader2, Moon, Sun } from "lucide-vue-next";
import useSettings from "@/composables/useSettings";
import { publicUrl, storageUrl } from "@/config/urls";

const { t, locale } = useI18n();
const toast = useToast();
const router = useRouter();

/* Settings / branding */
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

/* UI state */
const step = ref(1);
const loading = ref(false);
const showPassword = ref(false);
const resendCooldown = ref(0);
const otpVerified = ref(false);
const ttlLeftSec = ref(0);
let timer;

/* Form state */
const email = ref("");
const code = ref("");
const password = ref("");
const password_confirmation = ref("");

/* Toast queue */
const toastQueue = ref([]);
let isShowingToast = false,
  lastToastKey = "",
  lastToastAt = 0;
const TOAST_GAP = 900,
  TOAST_DEDUP_MS = 2500;
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
const notifyOk = (m) => enqueueToast("success", m, { timeout: 2500 });
const notifyError = (m) => enqueueToast("error", m, { timeout: 3000 });

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

/* Lang */
const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
};
const toggleLanguage = () =>
  changeLanguage(locale.value === "en" ? "km" : "en");

/* Helpers */
function startCooldown() {
  resendCooldown.value = 60;
  clearInterval(timer);
  timer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0) clearInterval(timer);
  }, 1000);
}

/* Actions */
async function sendCode() {
  if (loading.value) return;
  loading.value = true;
  try {
    await api.post("/auth/password/otp/request", { email: email.value });
    notifyOk(t("reset.sent") || "If the email exists, we sent a code.");
    step.value = 2;
    startCooldown();
  } catch (e) {
    notifyError(
      e?.response?.data?.message ||
        t("reset.send_error") ||
        "Failed to send code."
    );
  } finally {
    loading.value = false;
  }
}

async function verifyCode() {
  if (loading.value) return;
  loading.value = true;
  try {
    const r = await api.post("/auth/password/otp/verify", {
      email: email.value,
      code: code.value,
    });
    otpVerified.value = true;
    ttlLeftSec.value = r?.data?.ttl_seconds ?? 0;
    notifyOk(t("otp.verified") || "Code verified");
  } catch (e) {
    notifyError(
      e?.response?.data?.message ||
        t("otp.invalid") ||
        "Invalid or expired code."
    );
  } finally {
    loading.value = false;
  }
}

async function resend() {
  if (loading.value || resendCooldown.value > 0) return;
  loading.value = true;
  try {
    await api.post("/auth/password/otp/resend", { email: email.value });
    notifyOk(t("otp.resent") || "Code resent.");
    startCooldown();
  } catch (e) {
    notifyError(
      e?.response?.data?.message || t("otp.resend_error") || "Failed to resend."
    );
  } finally {
    loading.value = false;
  }
}

async function submitReset() {
  if (!otpVerified.value) {
    notifyError(t("otp.verify_first") || "Please verify the code first.");
    return;
  }
  if (loading.value) return;
  loading.value = true;
  try {
    await api.post("/auth/password/otp/reset", {
      email: email.value,
      code: code.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    });
    notifyOk(
      t("reset.success") || "Password reset successful. Please sign in."
    );
    await router.push("/login");
  } catch (e) {
    notifyError(
      e?.response?.data?.message ||
        t("reset.error") ||
        "Invalid or expired code."
    );
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  applyDarkMode();
  const saved = localStorage.getItem("locale");
  if (saved && saved !== locale.value) locale.value = saved;
  await fetchSettings();
});
</script>
