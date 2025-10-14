<script lang="ts" setup>
import { useThemeStore } from "@/store";
import { storeToRefs } from "pinia";

const themeStore = useThemeStore();
const { theme, themeVars } = storeToRefs(themeStore);

// 获取系统状态栏高度
const statusBarHeight = ref(0);
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
});
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
    :theme-vars="themeVars"
    :theme="theme"
    :custom-class="`page-wraper ${theme}`"
    :style="{
      '--status-bar-height': statusBarHeight + 'px',
    }"
  >
    <slot />
    <wd-notify />
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>

<style lang="scss" scoped>
.page-wraper {
  box-sizing: border-box;
  min-height: calc(100vh - var(--window-top));
  background: var(--wot-color-bg);
}
</style>
