<template>
  <AppLayout>
    <div class="p-6 h-full flex flex-col min-h-0">
      <div class="flex-1 flex flex-col justify-between gap-6 min-h-0">
        <!-- Top -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ t("discounts.title") }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-300">
                {{ t("discounts.description") }}
              </p>
            </div>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 px-5 py-2 rounded-full shadow transition-all duration-200 text-sm"
            >
              {{ t("discounts.add_button") }}
            </button>
          </div>

          <!-- Search + Clear -->
          <div class="flex flex-wrap gap-3 items-center justify-between">
            <div class="relative w-72">
              <span
                class="absolute left-3 top-2.5 text-gray-400"
                aria-hidden="true"
              >
                <Search class="w-4 h-4 text-purple-400" />
              </span>
              <input
                v-model="search"
                :placeholder="t('discounts.search') || 'Search discount...'"
                class="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 transition"
                type="search"
                autocomplete="off"
                aria-label="Search discounts"
              />
            </div>

            <button
              class="border rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              @click="clearFilters"
            >
              {{ t("common.clear") || "Clear" }}
            </button>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap items-end gap-3">
            <div class="flex flex-col">
              <label class="text-xs text-gray-500 dark:text-gray-400">
                {{ t("discounts.filter.type") || "Type" }}
              </label>
              <select
                v-model="filters.type"
                class="input-mini"
                aria-label="Filter by type"
              >
                <option value="all">{{ t("common.all") || "All" }}</option>
                <option value="percent">
                  {{ t("discounts.percent") || "Percent" }}
                </option>
                <option value="fixed">
                  {{ t("discounts.fixed") || "Fixed" }}
                </option>
              </select>
            </div>

            <div class="flex flex-col">
              <label class="text-xs text-gray-500 dark:text-gray-400">
                {{ t("discounts.filter.status") || "Status" }}
              </label>
              <select
                v-model="filters.status"
                class="input-mini"
                aria-label="Filter by status"
              >
                <option value="all">{{ t("common.all") || "All" }}</option>
                <option value="active">
                  {{ t("common.active") || "Active" }}
                </option>
                <option value="inactive">
                  {{ t("common.inactive") || "Inactive/Expired" }}
                </option>
              </select>
            </div>

            <div class="flex flex-col">
              <label class="text-xs text-gray-500 dark:text-gray-400">
                {{ t("discounts.filter.from") || "Expiry From" }}
              </label>
              <input
                v-model="filters.from"
                type="date"
                class="input-mini"
                aria-label="Expiry from"
              />
            </div>

            <div class="flex flex-col">
              <label class="text-xs text-gray-500 dark:text-gray-400">
                {{ t("discounts.filter.to") || "Expiry To" }}
              </label>
              <input
                v-model="filters.to"
                type="date"
                class="input-mini"
                aria-label="Expiry to"
              />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="flex-1 min-h-0 flex flex-col space-y-3">
          <div class="text-sm font-semibold text-gray-800 dark:text-white">
            {{ t("discounts.total") }}:
            <span class="font-bold">{{
              loading ? "—" : filteredAndSorted.length
            }}</span>
            <span
              v-if="!loading && filteredAndSorted.length === 0"
              class="ml-2 text-gray-500 dark:text-gray-400"
            >
              · {{ t("discounts.no_data") }}
            </span>
          </div>

          <div
            class="flex-1 min-h-0 flex flex-col rounded-xl shadow bg-white dark:bg-gray-800 overflow-hidden"
          >
            <div class="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <table class="min-w-full text-sm text-left">
                <thead
                  class="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs font-semibold z-10"
                >
                  <tr>
                    <th class="px-4 py-3 w-12">No</th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('code')"
                      :aria-sort="ariaSort('code')"
                      @click="setSort('code')"
                    >
                      {{ t("discounts.code") }}
                      <SortIcon :active="sort.by === 'code'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('type')"
                      :aria-sort="ariaSort('type')"
                      @click="setSort('type')"
                    >
                      {{ t("discounts.type") }}
                      <SortIcon :active="sort.by === 'type'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('value')"
                      :aria-sort="ariaSort('value')"
                      @click="setSort('value')"
                    >
                      {{ t("discounts.value") }}
                      <SortIcon :active="sort.by === 'value'" :dir="sort.dir" />
                    </th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('expires_at')"
                      :aria-sort="ariaSort('expires_at')"
                      @click="setSort('expires_at')"
                    >
                      {{ t("discounts.expires") }}
                      <SortIcon
                        :active="sort.by === 'expires_at'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th
                      class="px-6 py-3 cursor-pointer select-none"
                      :class="isActive('active')"
                      :aria-sort="ariaSort('active')"
                      @click="setSort('active')"
                    >
                      {{ t("discounts.active") }}
                      <SortIcon
                        :active="sort.by === 'active'"
                        :dir="sort.dir"
                      />
                    </th>

                    <th class="px-6 py-3">{{ t("discounts.actions") }}</th>
                  </tr>
                </thead>

                <tbody>
                  <!-- Skeleton -->
                  <template v-if="loading">
                    <tr
                      v-for="n in 6"
                      :key="'sk' + n"
                      class="border-t dark:border-gray-700"
                    >
                      <td class="px-4 py-4">
                        <div
                          class="h-3 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div
                          class="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                        />
                      </td>
                    </tr>
                  </template>

                  <!-- Rows -->
                  <template v-else>
                    <tr
                      v-for="(d, idx) in filteredAndSorted"
                      :key="d.id"
                      class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td
                        class="px-4 py-4 font-mono text-gray-500 dark:text-gray-400 text-center"
                      >
                        {{ idx + 1 }}
                      </td>

                      <td
                        class="px-6 py-4 font-medium text-gray-700 dark:text-gray-100"
                      >
                        {{ d.code }}
                      </td>

                      <td class="px-6 py-4 text-gray-700 dark:text-gray-100">
                        {{
                          d.percentage != null
                            ? t("discounts.percent")
                            : t("discounts.fixed")
                        }}
                      </td>

                      <td class="px-6 py-4 text-gray-700 dark:text-gray-100">
                        {{
                          d.percentage != null
                            ? d.percentage + "%"
                            : "$" + d.amount
                        }}
                      </td>

                      <td class="px-6 py-4 text-gray-700 dark:text-gray-100">
                        <span :title="expiryHint(d)">{{
                          formatDateTime(d.expires_at)
                        }}</span>
                      </td>

                      <td class="px-6 py-4">
                        <span
                          :class="[
                            'px-2 py-1 rounded-full text-xs font-semibold',
                            d.active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200',
                          ]"
                        >
                          {{ d.active ? t("common.yes") : t("common.no") }}
                        </span>
                      </td>

                      <td class="px-6 py-4 flex gap-2">
                        <button
                          @click="editDiscount(d)"
                          class="border border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-800 transition"
                        >
                          {{ t("common.edit") }}
                        </button>
                        <button
                          @click="promptDelete(d.id)"
                          class="border border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 rounded-full px-3 py-1 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-800 transition"
                        >
                          {{ t("common.delete") }}
                        </button>
                      </td>
                    </tr>

                    <tr v-if="filteredAndSorted.length === 0">
                      <td
                        colspan="7"
                      class="text-center py-10 text-gray-500 dark:text-gray-400"
                    >
                      <div class="flex flex-col items-center gap-3">
                          <Receipt class="w-10 h-10 text-purple-500" />
                          <div>{{ t("discounts.no_data") }}</div>
                          <button
                            @click="openAddModal"
                            class="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm"
                          >
                            {{ t("discounts.add_button") }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- /Table -->
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      @keydown.esc="closeModal"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center"
        >
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            {{ form.id ? t("discounts.edit") : t("discounts.add") }}
          </h2>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-red-500 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label
              class="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              {{ t("discounts.code") }}
            </label>
            <input
              v-model.trim="form.code"
              @blur="form.code = (form.code || '').toUpperCase()"
              type="text"
              class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
              required
              :aria-invalid="!validCode"
            />
            <p v-if="!validCode" class="mt-1 text-xs text-red-500">
              {{
                t("discounts.validation.code_required") || "Code is required."
              }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="text-sm font-semibold text-gray-600 dark:text-gray-300"
              >
                {{ t("discounts.percentage") }}
              </label>
              <input
                v-model.number="form.percentage"
                @input="onPercentageInput"
                type="number"
                min="0"
                max="100"
                step="1"
                class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
                :aria-invalid="!validPercent"
              />
              <p
                v-if="form.percentage != null && !validPercent"
                class="mt-1 text-xs text-red-500"
              >
                {{
                  t("discounts.validation.percent_range") ||
                  "Percentage must be 0–100."
                }}
              </p>
            </div>
            <div>
              <label
                class="text-sm font-semibold text-gray-600 dark:text-gray-300"
              >
                {{ t("discounts.amount") }}
              </label>
              <input
                v-model.number="form.amount"
                @input="onAmountInput"
                type="number"
                min="0"
                step="0.01"
                class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
                :aria-invalid="!validAmount"
              />
              <p
                v-if="form.amount != null && !validAmount"
                class="mt-1 text-xs text-red-500"
              >
                {{
                  t("discounts.validation.amount_min") || "Amount must be ≥ 0."
                }}
              </p>
            </div>
          </div>

          <p v-if="!validOneValue" class="text-xs text-amber-600">
            {{
              t("discounts.validation.one_value") ||
              "Enter either Percentage or Amount (not both)."
            }}
          </p>

          <div>
            <label
              class="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              {{ t("discounts.expires_at") }}
            </label>
            <input
              v-model="form.expires_at"
              type="datetime-local"
              class="mt-1 w-full border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring focus:ring-purple-200"
            />
            <p v-if="isExpiredPreview" class="mt-1 text-xs text-amber-600">
              {{
                t("discounts.validation.expired_preview") ||
                "This time is in the past — the discount will be inactive."
              }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="form.active"
              class="h-4 w-4"
              id="activeChk"
            />
            <label
              for="activeChk"
              class="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {{ t("discounts.active") }}
            </label>
          </div>

          <div class="text-right pt-3">
            <button
              type="submit"
              :disabled="submitting || !formValid"
              class="bg-gradient-to-r from-purple-600 to-pink-500 disabled:opacity-60 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all inline-flex items-center gap-2"
            >
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              <span>{{
                form.id ? t("discounts.update") : t("discounts.create")
              }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :show="showDeleteModal"
      :message="t('discounts.delete_confirm')"
      :title="t('discounts.delete_title')"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import "dayjs/locale/km";
import api from "@/plugins/axios";
import AppLayout from "@/components/Common/AppLayout.vue";
import ConfirmModal from "@/components/Common/ConfirmModal.vue";
import { useToast } from "vue-toastification";
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2, Receipt, Search } from "lucide-vue-next";

const { t } = useI18n();
const toast = useToast();
dayjs.locale("km");

/* State */
const discounts = ref([]);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const deletingId = ref(null);

/* Prefs (persisted) */
const LS_KEY = "discounts_prefs_v1";
const persisted = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
const search = ref(persisted.search || "");
const filters = ref({
  type: persisted.filters?.type ?? "all",
  status: persisted.filters?.status ?? "all",
  from: persisted.filters?.from ?? "",
  to: persisted.filters?.to ?? "",
});
const sort = ref(persisted.sort || { by: "code", dir: "asc" }); // code|type|value|expires_at|active

watch(
  [search, filters, sort],
  () => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        search: search.value,
        filters: filters.value,
        sort: sort.value,
      })
    );
  },
  { deep: true }
);

/* Form */
const form = ref({
  id: null,
  code: "",
  percentage: null,
  amount: null,
  expires_at: null,
  active: true,
});
const resetForm = () => {
  form.value = {
    id: null,
    code: "",
    percentage: null,
    amount: null,
    expires_at: null,
    active: true,
  };
};

/* Fetch */
const fetchDiscounts = async () => {
  loading.value = true;
  try {
    const res = await api.get("/discounts");
    const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
    discounts.value = (data || []).map((d) => ({
      ...d,
      active:
        d.expires_at && new Date(d.expires_at) < new Date() ? false : d.active,
    }));
  } catch (e) {
    discounts.value = [];
    toast.error(t("discounts.error") || "Failed to load discounts");
    console.error(e);
  } finally {
    loading.value = false;
  }
};

/* Derived */
const filteredAndSorted = computed(() => {
  let arr = discounts.value.slice();
  const s = search.value.trim().toLowerCase();

  if (s) {
    arr = arr.filter((d) => {
      const typeStr = d.percentage != null ? "percent" : "fixed";
      const valueStr =
        d.percentage != null ? String(d.percentage) : String(d.amount ?? "");
      return (
        d.code?.toLowerCase().includes(s) ||
        typeStr.includes(s) ||
        valueStr.includes(s)
      );
    });
  }

  if (filters.value.type !== "all") {
    const wantPercent = filters.value.type === "percent";
    arr = arr.filter((d) => (d.percentage != null) === wantPercent);
  }

  if (filters.value.status !== "all") {
    const wantActive = filters.value.status === "active";
    arr = arr.filter((d) => Boolean(d.active) === wantActive);
  }

  if (filters.value.from) {
    const fromDate = dayjs(filters.value.from, "YYYY-MM-DD").startOf("day");
    arr = arr.filter(
      (d) =>
        !d.expires_at ||
        dayjs(d.expires_at).isAfter(fromDate) ||
        dayjs(d.expires_at).isSame(fromDate)
    );
  }
  if (filters.value.to) {
    const toDate = dayjs(filters.value.to, "YYYY-MM-DD").endOf("day");
    arr = arr.filter(
      (d) =>
        !d.expires_at ||
        dayjs(d.expires_at).isBefore(toDate) ||
        dayjs(d.expires_at).isSame(toDate)
    );
  }

  const dir = sort.value.dir === "asc" ? 1 : -1;
  arr.sort((a, b) => {
    switch (sort.value.by) {
      case "code":
        return (a.code || "").localeCompare(b.code || "") * dir;
      case "type":
        return (
          ((a.percentage != null ? 1 : 0) - (b.percentage != null ? 1 : 0)) *
          dir
        );
      case "value": {
        const va = a.percentage != null ? +a.percentage : +(a.amount || 0);
        const vb = b.percentage != null ? +b.percentage : +(b.amount || 0);
        return (
          (va === vb ? (a.code || "").localeCompare(b.code || "") : va - vb) *
          dir
        );
      }
      case "expires_at": {
        const da = a.expires_at ? new Date(a.expires_at).getTime() : 0;
        const db = b.expires_at ? new Date(b.expires_at).getTime() : 0;
        return (da - db) * dir;
      }
      case "active":
        return ((a.active ? 1 : 0) - (b.active ? 1 : 0)) * dir;
      default:
        return 0;
    }
  });

  return arr;
});

/* Sort controls */
function setSort(by) {
  if (sort.value.by !== by) {
    sort.value = {
      by,
      dir: by === "value" || by === "expires_at" ? "desc" : "asc",
    };
  } else {
    sort.value.dir = sort.value.dir === "asc" ? "desc" : "asc";
  }
}
function isActive(col) {
  return sort.value.by === col ? "text-purple-700 dark:text-purple-300" : "";
}
function ariaSort(col) {
  return sort.value.by === col
    ? sort.value.dir === "asc"
      ? "ascending"
      : "descending"
    : "none";
}

/* Tri-state SortIcon: neutral (unsorted) chevrons, then chevron when active */
const SortIcon = ({ active, dir }) =>
  h(
    "span",
    {
      class:
        "inline ml-1 " +
        (active
          ? "text-purple-600 dark:text-purple-300"
          : "text-gray-400 dark:text-gray-500"),
      "aria-hidden": "true",
    },
    [
      h(active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown, {
        class: "w-3 h-3",
      }),
    ]
  );

/* Helpers */
const expiryHint = (d) => {
  if (!d.expires_at) return t("discounts.never");
  return dayjs(d.expires_at).isBefore(dayjs())
    ? t("discounts.expired") || "Expired"
    : t("discounts.valid") || "Valid";
};
const formatDateTime = (datetime) =>
  !datetime
    ? t("discounts.never")
    : dayjs(datetime).format("DD-MM-YYYY hh:mm A");

/* Validation */
const validCode = computed(() => Boolean((form.value.code || "").trim()));
const validPercent = computed(
  () =>
    form.value.percentage == null ||
    (form.value.percentage >= 0 && form.value.percentage <= 100)
);
const validAmount = computed(
  () => form.value.amount == null || form.value.amount >= 0
);
const validOneValue = computed(() => {
  const hasP = form.value.percentage != null && form.value.percentage !== "";
  const hasA = form.value.amount != null && form.value.amount !== "";
  return (hasP && !hasA) || (!hasP && hasA);
});
const isExpiredPreview = computed(() =>
  form.value.expires_at ? dayjs(form.value.expires_at).isBefore(dayjs()) : false
);
const formValid = computed(
  () =>
    validCode.value &&
    validPercent.value &&
    validAmount.value &&
    validOneValue.value
);

/* Mutually exclusive inputs */
function onPercentageInput() {
  if (
    form.value.percentage !== null &&
    form.value.percentage !== "" &&
    form.value.amount != null
  )
    form.value.amount = null;
}
function onAmountInput() {
  if (
    form.value.amount !== null &&
    form.value.amount !== "" &&
    form.value.percentage != null
  )
    form.value.percentage = null;
}

/* CRUD */
const openAddModal = () => {
  resetForm();
  showModal.value = true;
};
const editDiscount = (item) => {
  form.value = { ...item };
  if (item.expires_at)
    form.value.expires_at = dayjs(item.expires_at).format("YYYY-MM-DDTHH:mm");
  showModal.value = true;
};
const closeModal = () => {
  if (!submitting.value) {
    showModal.value = false;
    resetForm();
  }
};
const submitForm = async () => {
  if (!formValid.value) return;
  const data = {
    ...form.value,
    code: (form.value.code || "").trim().toUpperCase(),
  };
  submitting.value = true;
  try {
    if (data.id) {
      await api.put(`/discounts/${data.id}`, data);
      toast.success(t("discounts.update_success"));
    } else {
      await api.post(`/discounts`, data);
      toast.success(t("discounts.create_success"));
    }
    await fetchDiscounts();
    closeModal();
  } catch (error) {
    toast.error(t("discounts.error") || "Something went wrong");
    console.error(error);
  } finally {
    submitting.value = false;
  }
};
const promptDelete = (id) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};
const confirmDelete = async () => {
  try {
    await api.delete(`/discounts/${deletingId.value}`);
    toast.success(t("discounts.delete_success"));
    showDeleteModal.value = false;
    await fetchDiscounts();
  } catch (error) {
    toast.error(t("discounts.delete_error"));
    console.error(error);
  }
};

onMounted(fetchDiscounts);
</script>

<style scoped>
.input-mini {
  @apply border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
