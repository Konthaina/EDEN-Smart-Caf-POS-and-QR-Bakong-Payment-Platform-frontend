<template>
  <div class="flex items-center gap-3">
    <!-- Pill -->
    <button
      class="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
      :title="
        canEdit
          ? t('setting.exchange_rate_click_to_change') ||
            'Click to change the exchange rate'
          : t('setting.exchange_rate_view_only') || 'View only'
      "
      :aria-label="
        canEdit
          ? t('setting.exchange_rate_click_to_change') ||
            'Click to change the exchange rate'
          : t('setting.exchange_rate_view_only') || 'View only'
      "
      :aria-disabled="!canEdit"
      @click="canEdit ? (show = true) : null"
      @keydown.enter.prevent="canEdit ? (show = true) : null"
      type="button"
    >
      <span
        class="text-xs rounded-full px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200"
        >៛</span
      >
      <span class="font-semibold">{{ displayRate }}</span>

      <span v-if="canEdit" class="inline-flex items-center gap-1 opacity-90">
        <span>·</span>
        <span class="hidden sm:inline px-2">{{
          t("setting.change_rate_here") || "Change rate here"
        }}</span>
        <Pencil class="h-4 w-4" aria-hidden="true" />
      </span>
      <span v-else class="inline-flex items-center gap-1 opacity-70">
        <span>·</span>
        <span class="hidden sm:inline">{{
          t("setting.view_only") || "View only"
        }}</span>
        <Lock class="h-4 w-4" aria-hidden="true" />
      </span>
    </button>

    <!-- Modal -->
    <teleport to="body">
      <div
        v-if="show"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      >
        <div
          class="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-lg p-5 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{
                t("setting.exchange_rate_change_title") ||
                "Change Exchange Rate (USD → KHR)"
              }}
            </h3>
            <button
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              @click="show = false"
              type="button"
              :title="t('common.close') || 'Close'"
            >
              ✕
            </button>
          </div>

          <!-- Info line -->
          <div
            class="text-xs rounded-lg px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200"
          >
            {{
              t("setting.exchange_rate_effect") ||
              "Changing this rate applies instantly across the system (POS totals, receipts, and KHR displays)."
            }}
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("setting.exchange_rate") || "Exchange Rate" }}
            </label>
            <input
              v-model.number="draft"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              :placeholder="String(settings.value?.exchange_rate_usd_khr || '')"
              @keyup.enter="isValid && canEdit ? onSave() : null"
            />
            <p class="text-xs text-gray-500">
              {{
                t("setting.exchange_rate_cashier_hint") ||
                "Admins and Cashiers can edit here."
              }}
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              @click="onReset"
              type="button"
            >
              {{ t("common.reset") || "Reset" }}
            </button>
            <button
              class="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              :disabled="saving || !isValid || !canEdit"
              @click="onSave"
              type="button"
            >
              {{
                saving
                  ? t("common.saving") || "Saving…"
                  : t("setting.save_apply") || "Save & Apply"
              }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { Pencil, Lock } from "lucide-vue-next";
import api from "@/plugins/axios";
import useSettings from "@/composables/useSettings";

const { t } = useI18n();
const toast = useToast();
const { settings, fetchSettings, updateSettings } = useSettings();

const show = ref(false);
const saving = ref(false);
const draft = ref("");

const profileRole = ref(""); // 'Super Admin' | 'Admin' | 'Cashier' | ...

// Allow Cashier to edit (along with Admin / Super Admin)
const canEdit = computed(() => {
  const r = String(profileRole.value || "").toLowerCase();
  const allowed = ["super admin", "superadmin", "admin", "cashier"];
  return allowed.includes(r);
});

const displayRate = computed(() => {
  const v = Number(settings.value?.exchange_rate_usd_khr || 0);
  return v > 0 ? `${v.toLocaleString()} KHR` : "—";
});

const isValid = computed(() => {
  const v = Number(draft.value);
  return !Number.isNaN(v) && v > 0;
});

async function loadRole() {
  try {
    const me = await api.get("/me");
    profileRole.value = me.data?.role?.name || me.data?.role || "";
  } catch {
    // ignore
  }
}

function onReset() {
  draft.value = settings.value?.exchange_rate_usd_khr ?? "";
}

async function onSave() {
  try {
    if (!canEdit.value) return;
    saving.value = true;
    await updateSettings({ exchange_rate_usd_khr: Number(draft.value) });
    toast.success(t("common.saved") || "Saved");
    show.value = false;
    await fetchSettings();
  } catch (e) {
    // If backend denies cashier, you’ll get 403 here.
    // Update your policy/permission to allow 'cashier' to update settings.
    toast.error(t("common.error") || "Something went wrong");
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await fetchSettings();
  await loadRole();
  onReset();
});
</script>
