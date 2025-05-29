<script lang="ts" setup>
import { useTheme } from "@/composables/useTheme";

const { theme, themeVars } = useTheme();
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
  <wd-config-provider
    :theme="theme"
    :theme-vars="themeVars"
    custom-style="background-color: #f5f5f5;min-height: 100vh"
    :class="{ 'wot-theme-dark': theme === 'dark' }"
  >
    <slot />
    <wd-notify />
    <wd-toast />
    <wd-message-box />
    <privacy-popup />
  </wd-config-provider>
</template>

<style lang="scss" scoped>
/* 暗黑模式样式 */
.wot-theme-dark {
  color: #f5f5f5 !important;
  background-color: #1a1a1a !important;
}
</style>
