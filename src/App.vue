<template>
  <div :class="locale === 'km' ? 'font-khmer' : 'font-poppins'">
    <GlobalNotificationBanner v-if="showBanner" :count="notificationCount" />
    <GlobalLoading
      :visible="loadingStore.loading"
      :message="loadingStore.message"
      :tip="loadingStore.tip"
    />
    <router-view />
  </div>
</template>
 //test
 
<script setup>
import { provide, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useNotificationCount } from "@/composables/useNotificationCount";
import GlobalNotificationBanner from "@/components/common/GlobalNotificationBanner.vue";

// --- Add these two lines ---
import GlobalLoading from "@/components/Common/GlobalLoading.vue";
import { useLoadingStore } from "@/store/loading";
const loadingStore = useLoadingStore();
// ---------------------------

const { locale } = useI18n();
const { notificationCount, fetchNotificationCount } = useNotificationCount();
const route = useRoute();

onMounted(() => {
  fetchNotificationCount();
  setInterval(fetchNotificationCount, 60000);
});

provide("notificationCount", notificationCount);

const hiddenPages = [
  "Login",
  "Register",
  "ForgotPassword",
  "ResetPassword",
  "CustomerHome",
  "Profile",
  "NotFound",
];
const showBanner = computed(() => !hiddenPages.includes(route.name));
</script>
