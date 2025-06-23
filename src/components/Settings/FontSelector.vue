<template>
  <div class="flex items-center gap-2 mt-2">
    <label class="text-sm font-semibold">
      {{
        locale === "km" ? $t("profile.khmer_font") : $t("profile.english_font")
      }}:
    </label>
    <select
      :value="currentFont"
      @change="onFontChange($event.target.value)"
      class="input w-auto"
    >
      <option v-for="font in fontOptions" :key="font.value" :value="font.value">
        {{ font.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

// Font options per language
const khmerFonts = [
  { label: "Noto Sans Khmer", value: "noto" },
  { label: "Battambang", value: "battambang" },
  { label: "Siemreap", value: "siemreap" },
];

const englishFonts = [
  { label: "Poppins", value: "poppins" },
  { label: "Sans-serif", value: "sans" },
  { label: "Serif", value: "serif" },
];

const fontOptions = computed(() =>
  locale.value === "km" ? khmerFonts : englishFonts
);

const khmerFont = ref(localStorage.getItem("khmerFont") || "noto");
const englishFont = ref(localStorage.getItem("englishFont") || "poppins");

const currentFont = computed(() =>
  locale.value === "km" ? khmerFont.value : englishFont.value
);

const applyFont = () => {
  const fontClass = `font-${
    locale.value === "km" ? khmerFont.value : englishFont.value
  }`;
  const allFontClasses = [
    "font-noto",
    "font-battambang",
    "font-siemreap",
    "font-poppins",
    "font-sans",
    "font-serif",
  ];
  document.body.classList.remove(...allFontClasses);
  document.body.classList.add(fontClass);
};

const onFontChange = (value) => {
  if (locale.value === "km") {
    khmerFont.value = value;
    localStorage.setItem("khmerFont", value);
  } else {
    englishFont.value = value;
    localStorage.setItem("englishFont", value);
  }
  applyFont();
};

watch(locale, () => applyFont());
onMounted(() => applyFont());
</script>
