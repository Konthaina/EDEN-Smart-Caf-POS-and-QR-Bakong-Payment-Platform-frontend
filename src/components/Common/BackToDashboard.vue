<template>
    <button :aria-label="ariaLabel" @click="goBack" :class="[
        'inline-flex items-center gap-2 rounded-xl transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        'active:translate-y-[1px]',
        sizeClasses[size],
        variantClasses[variant],
    ]">
        <span class="relative inline-flex" :class="iconWrap[variant]">
            <ArrowLeft class="w-4 h-4 shrink-0" />
            <!-- subtle animated chevron tail -->
            <span
                class="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-[2px] bg-current opacity-0 group-hover:opacity-60 group-hover:w-2 transition-all duration-300" />
        </span>
        <span class="font-medium">{{ label }}</span>
        <kbd v-if="showHint"
            class="ml-1 text-[10px] px-1.5 py-0.5 rounded border border-current/20 opacity-70">Esc</kbd>
    </button>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";

const props = defineProps({
    label: { type: String, default: "Back to Dashboard" },
    /** 'soft' (default), 'solid', or 'ghost' */
    variant: { type: String, default: "soft" },
    /** 'sm' | 'md' */
    size: { type: String, default: "md" },
    /** if true, go -1 first, else push to Dashboard */
    preferHistory: { type: Boolean, default: true },
    /** show Esc hint */
    showHint: { type: Boolean, default: true },
});

const router = useRouter();
const ariaLabel = "Back to Dashboard";

async function goBack() {
    // try history back; if it lands outside app or fails, push to Dashboard
    if (props.preferHistory && window.history.length > 1) {
        router.back();
        // fallback in 350ms if route didn’t change
        const before = router.currentRoute.value.fullPath;
        setTimeout(() => {
            if (router.currentRoute.value.fullPath === before) {
                router.push({ name: "Dashboard" });
            }
        }, 350);
    } else {
        router.push({ name: "Dashboard" });
    }
}

// Esc to go back
function onKey(e) {
    if (e.key === "Escape") goBack();
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3.5 py-2 text-sm",
};

const variantClasses = {
    soft:
        "group border border-indigo-200/60 dark:border-indigo-800/60 " +
        "bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-transparent " +
        "text-indigo-700 dark:text-indigo-200 hover:shadow-sm hover:bg-white/70 dark:hover:bg-indigo-900/40",
    solid:
        "group bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm",
    ghost:
        "group text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent",
};

const iconWrap = {
    soft: "text-indigo-600 dark:text-indigo-300",
    solid: "text-white",
    ghost: "text-current",
};
</script>
