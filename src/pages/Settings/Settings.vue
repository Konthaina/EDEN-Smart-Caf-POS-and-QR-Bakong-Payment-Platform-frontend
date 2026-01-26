<template>
  <AppLayout>
    <!-- PAGE SHELL -->
    <div
      class="p-6 pt-16 h-full flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900 rounded-xl khmer-support"
    >
      <!-- Top cluster: header + tabs -->
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {{ $t("setting.title") || "Settings" }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-300">
              {{
                $t("setting.subtitle") || "Manage your account and app settings"
              }}
            </p>
          </div>

          <div class="flex gap-3 items-center">
            <!-- Language toggle -->
            <button
              @click="toggleLanguage"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-inner transition-all text-sm font-semibold bg-white text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              :aria-label="$t('setting.switch_language') || 'Switch language'"
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

            <!-- Dark mode -->
            <button
              @click="toggleDarkMode"
              class="w-14 h-8 rounded-full relative bg-gray-200 dark:bg-gray-600 transition-colors duration-300"
              aria-label="Toggle dark mode"
            >
              <span
                class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 z-10"
                :class="darkMode ? 'translate-x-6' : 'translate-x-0'"
              />
              <Sun
                v-if="!darkMode"
                class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 z-20"
              />
              <Moon
                v-else
                class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-300 z-20"
              />
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            :class="[
              'px-6 py-2 rounded-t-lg font-semibold transition-all focus:outline-none',
              activeTab === 'profile'
                ? 'bg-white dark:bg-gray-800 text-purple-600 border-x border-t border-gray-200 dark:border-gray-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-purple-600',
            ]"
            @click="activeTab = 'profile'"
          >
            {{ $t("sidebar.profile_settings") || "Profile Settings" }}
          </button>

          <!-- App Settings tab: HIDDEN for cashiers -->
          <button
            v-if="canEditApp"
            :class="[
              'px-6 py-2 rounded-t-lg font-semibold transition-all focus:outline-none',
              activeTab === 'app'
                ? 'bg-white dark:bg-gray-800 text-purple-600 border-x border-t border-gray-200 dark:border-gray-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-purple-600',
            ]"
            @click="activeTab = 'app'"
          >
            {{ $t("setting.app_setting") || "App Settings" }}
          </button>
        </div>
      </div>

      <!-- Bottom cluster: scrollable content -->
      <div
        class="mt-4 min-h-0 rounded-xl shadow bg-white dark:bg-gray-800 overflow-hidden"
      >
        <div
          class="h-[clamp(420px,60vh,900px)] overflow-y-auto no-scrollbar p-6"
        >
          <!-- Loader -->
          <div
            v-if="loading"
            class="animate-pulse bg-white dark:bg-gray-800 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            <div
              class="flex flex-col items-center justify-center text-center space-y-4 md:pr-6"
            >
              <div
                class="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-700"
              />
              <div class="w-2/3 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
              <div class="w-1/2 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="i in 6" :key="i" class="space-y-1">
                  <div class="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs Content -->
          <div v-else>
            <!-- Profile Setting Tab -->
            <div v-if="activeTab === 'profile'">
              <div
                class="bg-white dark:bg-gray-800 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
              >
                <!-- Profile Summary -->
                <div
                  class="flex flex-col items-center justify-center text-center space-y-4 border-r border-gray-200 dark:border-gray-700 md:pr-6"
                >
                  <img
                    :src="preview || profile.avatar_url || defaultAvatar"
                    class="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover ring ring-purple-300 dark:ring-purple-500 dark:border-gray-700"
                  />
                  <div class="space-y-1">
                    <p
                      class="text-xl font-semibold text-gray-800 dark:text-white"
                    >
                      {{ profile.name }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-300">
                      {{ profile.email }}
                    </p>
                    <p class="text-sm pt-2">
                      <span
                        class="text-xs font-medium text-white bg-purple-600 px-3 py-1 rounded-lg capitalize"
                      >
                        {{ profile.role }}
                      </span>
                    </p>
                  </div>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileChange"
                  />
                  <button
                    @click="$refs.fileInput.click()"
                    class="btn-secondary text-sm"
                  >
                    {{ $t("profile.change_avatar") }}
                  </button>
                </div>

                <!-- Profile Fields -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="label">{{ $t("profile.name") }}</label>
                      <input
                        v-model="form.name"
                        type="text"
                        class="input"
                        disabled
                      />
                    </div>
                    <div>
                      <label class="label">{{ $t("profile.phone") }}</label>
                      <input
                        v-model="form.phone"
                        type="text"
                        class="input"
                        disabled
                      />
                    </div>
                    <div>
                      <label class="label">{{ $t("profile.gender") }}</label>
                      <input
                        :value="$t(`profile.${form.gender || 'unknown'}`)"
                        type="text"
                        class="input"
                        disabled
                      />
                    </div>
                    <div>
                      <label class="label">{{ $t("profile.birthdate") }}</label>
                      <input
                        v-model="form.birthdate"
                        type="date"
                        class="input"
                        disabled
                      />
                    </div>
                    <div class="col-span-2">
                      <label class="label">{{ $t("profile.address") }}</label>
                      <textarea
                        v-model="form.address"
                        rows="3"
                        class="input resize-none w-full"
                        disabled
                      />
                    </div>
                    <div class="col-span-2">
                      <label class="label">{{ $t("profile.email") }}</label>
                      <input
                        v-model="form.email"
                        type="email"
                        class="input"
                        disabled
                      />
                    </div>

                    <!-- READ-ONLY Exchange Rate for Cashier -->
                    <div v-if="isCashier" class="col-span-2">
                      <label class="label">
                        {{
                          $t("setting.exchange_rate") ||
                          "Exchange Rate (USD → KHR)"
                        }}
                      </label>
                      <input
                        :value="settings.exchange_rate_usd_khr"
                        type="text"
                        class="input"
                        disabled
                      />
                      <p class="text-xs text-gray-500 mt-1">
                        {{
                          $t("setting.exchange_rate_cashier_hint") ||
                          "Cashiers can edit this inside Edit Profile."
                        }}
                      </p>
                    </div>
                  </div>

                  <button
                    @click="showEditModal = true"
                    class="btn-primary text-sm"
                  >
                    {{ $t("profile.edit_profile") }}
                  </button>
                </div>
              </div>
            </div>

            <!-- App Setting Tab (guarded) -->
            <div v-else-if="activeTab === 'app' && canEditApp">
              <div
                class="bg-white dark:bg-gray-800 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
              >
                <!-- Shop Logo + Name -->
                <div
                  class="flex flex-col items-center justify-center text-center space-y-4 border-r border-gray-200 dark:border-gray-700 md:pr-6"
                >
                  <img
                    :src="appLogoPreview || appLogoUrl"
                    class="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover ring ring-blue-300 dark:ring-blue-500 dark:border-gray-700"
                    alt="Shop Logo"
                    @error="onLogoError"
                  />
                  <div class="space-y-1">
                    <p
                      class="text-xl font-semibold text-gray-800 dark:text-white"
                    >
                      {{ settings.shop_name || "Shop Name" }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-300">
                      {{
                        $t("setting.app_setting_subtitle") ||
                        "Manage your shop appearance & policy"
                      }}
                    </p>
                  </div>
                  <button class="btn-primary" @click="openAppSettings">
                    {{ $t("setting.edit_app_setting") || "Edit App Settings" }}
                  </button>
                </div>

                <!-- App setting details -->
                <div class="flex flex-col gap-6 justify-center">
                  <div class="flex items-center gap-3">
                    <span class="font-semibold"
                      >{{ $t("setting.shop_name") || "Shop Name" }}:</span
                    >
                    <span>{{ settings.shop_name }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-semibold"
                      >{{ $t("setting.tax_rate") || "Tax Rate" }}:</span
                    >
                    <span>{{ settings.tax_rate }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-semibold"
                      >{{
                        $t("setting.exchange_rate") || "Exchange Rate"
                      }}:</span
                    >
                    <span>{{ settings.exchange_rate_usd_khr }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-semibold"
                      >{{ $t("setting.merchant_id") || "Merchant ID" }}:</span
                    >
                    <span>{{ settings.bakong_machine_id || "-" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- /not loading -->
        </div>
      </div>
    </div>

    <!-- Profile Edit Modal -->
    <teleport to="body">
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center khmer-support"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl space-y-4 relative"
        >
          <h2
            class="text-xl font-semibold text-purple-700 dark:text-purple-300"
          >
            {{ $t("profile.edit_profile") }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label">{{ $t("profile.name") }}</label>
              <input v-model="form.name" type="text" class="input" />
            </div>
            <div>
              <label class="label">{{ $t("profile.phone") }}</label>
              <input v-model="form.phone" type="text" class="input" />
            </div>
            <div>
              <label class="label">{{ $t("profile.gender") }}</label>
              <select v-model="form.gender" class="input">
                <option value="">{{ $t("profile.select") }}</option>
                <option value="male">{{ $t("profile.male") }}</option>
                <option value="female">{{ $t("profile.female") }}</option>
                <option value="other">{{ $t("profile.other") }}</option>
              </select>
            </div>
            <div>
              <label class="label">{{ $t("profile.birthdate") }}</label>
              <input v-model="form.birthdate" type="date" class="input" />
            </div>
            <div class="col-span-2">
              <label class="label">{{ $t("profile.address") }}</label>
              <textarea
                v-model="form.address"
                rows="3"
                class="input resize-none w-full"
              />
            </div>
            <div class="col-span-2">
              <label class="label">{{ $t("profile.email") }}</label>
              <input v-model="form.email" type="email" class="input" />
            </div>

            <!-- EDITABLE Exchange Rate only for Cashier -->
            <div v-if="isCashier" class="col-span-2">
              <label class="label">
                {{ $t("setting.exchange_rate") || "Exchange Rate (USD → KHR)" }}
              </label>
              <div class="flex gap-2">
                <input
                  v-model.number="cashierExchange"
                  type="number"
                  step="0.01"
                  class="input flex-1"
                  :placeholder="$t('setting.exchange_rate') || 'e.g. 4100'"
                />
                <button
                  type="button"
                  class="btn-secondary"
                  @click="resetCashierExchange"
                >
                  {{ $t("common.reset") || "Reset" }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{
                  $t("setting.exchange_rate_cashier_edit_hint") ||
                  "This field is shown here for Cashier. Admins edit it in App Settings."
                }}
              </p>
            </div>
          </div>

          <div
            class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              @click="showPasswordModal = true"
              class="inline-flex items-center gap-2 text-sm text-red-600 hover:underline"
            >
              <Lock class="w-4 h-4" />
              <span>{{ $t("profile.change_password") }}</span>
            </button>
            <div class="flex gap-3">
              <button
                @click="
                  cancelEdit();
                  showEditModal = false;
                "
                class="btn-secondary"
              >
                {{ $t("common.cancel") }}
              </button>
              <button
                @click="
                  submitForm();
                  showEditModal = false;
                "
                class="btn-primary"
              >
                {{ $t("common.save") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Profile Password Modal -->
    <teleport to="body">
      <div
        v-if="showPasswordModal"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center khmer-support"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md space-y-4 relative"
        >
          <h2
            class="text-xl font-semibold text-purple-700 dark:text-purple-300"
          >
            {{ $t("profile.change_password") }}
          </h2>
          <input
            v-model="passwordForm.current"
            type="password"
            :placeholder="$t('profile.current_password')"
            class="input"
          />
          <input
            v-model="passwordForm.new"
            type="password"
            :placeholder="$t('profile.new_password')"
            class="input"
          />
          <input
            v-model="passwordForm.confirm"
            type="password"
            :placeholder="$t('profile.confirm_password')"
            class="input"
          />
          <div class="flex justify-end gap-2 pt-2">
            <button class="btn-secondary" @click="showPasswordModal = false">
              {{ $t("common.cancel") }}
            </button>
            <button class="btn-primary" @click="updatePassword">
              {{ $t("common.update") }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- App Settings Edit Modal -->
    <teleport to="body">
      <div
        v-if="showAppSettingModal"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center khmer-support"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-xl space-y-4 relative"
        >
          <h2 class="text-xl font-semibold text-blue-700 dark:text-blue-300">
            {{ $t("setting.edit_app_setting") || "Edit App Settings" }}
          </h2>

          <form
            @submit.prevent="saveSettings"
            class="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div
              class="flex flex-col items-center justify-center text-center gap-2 col-span-2"
            >
              <img
                :src="appLogoPreview || appLogoUrl"
                class="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover ring ring-blue-300 dark:ring-blue-500 dark:border-gray-700 mb-2"
                alt="Shop Logo"
                @error="onLogoError"
              />
              <input
                ref="logoInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAppLogoChange"
              />
              <button
                @click.prevent="logoInput.click()"
                class="btn-secondary text-sm"
                type="button"
              >
                {{ $t("setting.change_logo") || "Change Logo" }}
              </button>
            </div>

            <div>
              <label class="label">{{
                $t("setting.shop_name") || "Shop Name"
              }}</label>
              <input
                v-model="appForm.shop_name"
                type="text"
                class="input"
                :placeholder="$t('setting.shop_name') || 'Shop Name'"
              />
            </div>

            <div>
              <label class="label">{{
                $t("setting.tax_rate") || "Tax Rate (%)"
              }}</label>
              <input
                v-model="appForm.tax_rate"
                type="number"
                class="input"
                :placeholder="$t('setting.tax_rate')"
              />
            </div>

            <div>
              <label class="label">{{
                $t("setting.exchange_rate") || "Exchange Rate (USD → KHR)"
              }}</label>
              <input
                v-model="appForm.exchange_rate_usd_khr"
                type="number"
                class="input"
                :placeholder="$t('setting.exchange_rate')"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="label">{{
                $t("setting.merchant_id") || "Merchant ID"
              }}</label>
              <input
                v-model="appForm.bakong_machine_id"
                type="text"
                class="input"
                placeholder="e.g. your_merchant@bank"
                autocomplete="off"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{
                  $t("setting.merchant_id_help") ||
                  "Used for Bakong / PSP integration."
                }}
              </p>
            </div>

            <div
              class="flex gap-3 col-span-2 justify-end pt-3 border-t border-gray-100 dark:border-gray-700"
            >
              <button
                @click="showAppSettingModal = false"
                type="button"
                class="btn-secondary"
              >
                {{ $t("common.cancel") }}
              </button>
              <button type="submit" class="btn-primary">
                {{ $t("common.save") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import api from "@/plugins/axios";
import { publicUrl, storageUrl } from "@/config/urls";
import useSettings from "@/composables/useSettings";
import AppLayout from "@/components/Common/AppLayout.vue";
import { Lock, Moon, Sun } from "lucide-vue-next";

// i18n / toast / tab
const { locale } = useI18n();
const toast = useToast();
const activeTab = ref("profile");

// Keep <html lang="…"> in sync so fonts can react globally
watch(
  () => locale.value,
  (lang) => document.documentElement.setAttribute("lang", lang),
  { immediate: true }
);

// Dark mode
const darkMode = ref(localStorage.getItem("theme") === "dark");
const toggleDarkMode = () => (darkMode.value = !darkMode.value);
const applyDarkMode = () => {
  document.documentElement.classList.toggle("dark", darkMode.value);
  localStorage.setItem("theme", darkMode.value ? "dark" : "light");
};
watch(darkMode, applyDarkMode);

// Language toggle
const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
};
const toggleLanguage = () => {
  const newLang = locale.value === "en" ? "km" : "en";
  changeLanguage(newLang);
};

// Profile logic
const loading = ref(true);
const profile = ref({});
const form = ref({});
const preview = ref(null);
const defaultAvatar = publicUrl("default-avatar.png");
const showEditModal = ref(false);
const showPasswordModal = ref(false);
const passwordForm = ref({ current: "", new: "", confirm: "" });

// Settings (for exchange rate etc.)
const { settings, fetchSettings, updateSettings } = useSettings();

// Cashier-only exchange field state
const cashierExchange = ref("");

// reflect settings → cashierExchange whenever settings loaded/changed
watch(
  () => settings.value?.exchange_rate_usd_khr,
  (val) => {
    // use string to avoid uncontrolled number edge-cases in input
    cashierExchange.value = val ?? "";
  },
  { immediate: true }
);

const fetchProfile = async () => {
  loading.value = true;
  try {
    const userRes = await api.get("/me");
    const profileRes = await api.get("/profile");
    profile.value = {
      name: userRes.data.name,
      email: userRes.data.email,
      role: userRes.data.role?.name || "User",
      ...profileRes.data.profile,
      avatar_url: profileRes.data.profile?.avatar_url,
    };
    form.value = { ...profile.value };
  } catch (err) {
    toast.error("Failed to load profile");
  } finally {
    loading.value = false;
  }
};

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => (preview.value = ev.target.result);
  reader.readAsDataURL(file);

  const fd = new FormData();
  fd.append("avatar", file);
  try {
    const res = await api.post("/profile/avatar", fd);
    toast.success("Avatar updated");
    profile.value.avatar_url = res.data.avatar_url;
    preview.value = null;
  } catch {
    toast.error("Failed to upload avatar");
  }
};

const submitForm = async () => {
  try {
    // 1) Update user/profile
    await api.put("/me", { name: form.value.name, email: form.value.email });
    await api.put("/profile", {
      phone: form.value.phone,
      gender: form.value.gender,
      birthdate: form.value.birthdate,
      address: form.value.address,
    });

    // 2) If Cashier, and exchange changed → update settings (exchange only)
    if (isCashier.value) {
      const current = settings.value?.exchange_rate_usd_khr ?? "";
      const next = cashierExchange.value;

      // basic validation
      const num = Number(next);
      if (!next || Number.isNaN(num) || num <= 0) {
        toast.error("Please enter a valid exchange rate (number > 0).");
      } else if (String(current) !== String(next)) {
        try {
          await updateSettings({ exchange_rate_usd_khr: num });
          toast.success("Exchange rate updated");
          await loadAppSettings(); // refresh local settings state
        } catch (e) {
          toast.error("Failed to update exchange rate");
        }
      }
    }

    toast.success("Profile updated successfully");
    fetchProfile();
  } catch {
    toast.error("Failed to update profile");
  }
};

const cancelEdit = () => {
  form.value = { ...profile.value };
  // reset cashier exchange to server value
  cashierExchange.value = settings.value?.exchange_rate_usd_khr ?? "";
};

const updatePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    return toast.error("Passwords don't match");
  }
  try {
    await api.post("/profile/password", {
      current_password: passwordForm.value.current,
      new_password: passwordForm.value.new,
      new_password_confirmation: passwordForm.value.confirm,
    });
    toast.success("Password updated");
    showPasswordModal.value = false;
    passwordForm.value = { current: "", new: "", confirm: "" };
  } catch {
    toast.error("Failed to update password");
  }
};

// Role guard
const isCashier = computed(
  () => String(profile.value.role || "").toLowerCase() === "cashier"
);
const canEditApp = computed(() => !isCashier.value);

watch([isCashier, activeTab], () => {
  if (isCashier.value && activeTab.value === "app") activeTab.value = "profile";
});

// App Settings logic
const appForm = ref({
  shop_name: "",
  shop_logo: null,
  tax_rate: "",
  exchange_rate_usd_khr: "",
  bakong_machine_id: "",
});
const appLogoPreview = ref(null);
const showAppSettingModal = ref(false);
const logoInput = ref();

const appLogoUrl = computed(() =>
  storageUrl(settings.value.shop_logo, "logo.png")
);

const handleAppLogoChange = (e) => {
  const file = e.target.files[0];
  appForm.value.shop_logo = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => (appLogoPreview.value = ev.target.result);
    reader.readAsDataURL(file);
  }
};

const onLogoError = (e) => {
  e.target.src = publicUrl("logo.png");
};

function openAppSettings() {
  if (!canEditApp.value) {
    toast.error("You don't have permission to edit App Settings");
    return;
  }
  showAppSettingModal.value = true;
}

const saveSettings = async () => {
  if (!canEditApp.value) {
    toast.error("You don't have permission to edit App Settings");
    return;
  }
  try {
    await updateSettings(appForm.value);
    toast.success("Settings updated!");
    showAppSettingModal.value = false;
    await loadAppSettings();
  } catch {
    toast.error("Failed to update settings");
  }
};

const resetCashierExchange = () => {
  cashierExchange.value = settings.value?.exchange_rate_usd_khr ?? "";
};

const loadAppSettings = async () => {
  await fetchSettings();
  appForm.value = {
    shop_name: settings.value.shop_name || "",
    shop_logo: null,
    tax_rate: settings.value.tax_rate || "",
    exchange_rate_usd_khr: settings.value.exchange_rate_usd_khr || "",
    bakong_machine_id: settings.value.bakong_machine_id || "",
  };
  // sync cashier field as well
  cashierExchange.value = settings.value?.exchange_rate_usd_khr ?? "";
  appLogoPreview.value = null;
};

onMounted(async () => {
  applyDarkMode();
  await fetchProfile();
  await loadAppSettings();
});
</script>

<style scoped>
/* Khmer-friendly font stack for this page & its teleported modals */
.khmer-support {
  font-family: "Kantumruy Pro", "Noto Sans Khmer", "Khmer OS Battambang", Inter,
    ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  line-height: 1.55;
}

.label {
  @apply text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block;
}
.input {
  @apply border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400;
}
.btn-primary {
  @apply bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition;
}
.btn-secondary {
  @apply bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition;
}
/* Invisible scrollbar for inner content */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
