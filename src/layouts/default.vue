<script lang="ts" setup>
import { useThemeStore } from "@/store";
import { storeToRefs } from "pinia";

const themeStore = useThemeStore();
const { theme, themeVars } = storeToRefs(themeStore);
</script>

<script lang="ts">
export default {
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: "shared",
  },
};
</script>

<template>
  <wd-config-provider :theme-vars="themeVars" :custom-class="theme" :theme="theme">
    <slot />
    <wd-notify />
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>
