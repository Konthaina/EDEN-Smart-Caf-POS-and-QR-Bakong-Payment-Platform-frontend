<template>
  <div :class="locale === 'km' ? 'font-khmer' : 'font-poppins'">
    <GlobalNotificationBanner v-if="showBanner" :count="notificationCount" />
    <router-view />
  </div>
</template>

<script setup>
import { provide, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useNotificationCount } from "@/composables/useNotificationCount";
import GlobalNotificationBanner from "@/components/common/GlobalNotificationBanner.vue";

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
