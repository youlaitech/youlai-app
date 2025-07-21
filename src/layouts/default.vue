<script lang="ts" setup>
import { useTheme } from "@/composables/useTheme";

const { theme, themeVars } = useTheme();

// 状态栏高度
const statusBarHeight = ref(0);

// 获取状态栏高度
onMounted(() => {
  uni.getSystemInfo({
    success: (res) => {
      statusBarHeight.value = res.statusBarHeight || 20;
    },
    fail: () => {
      statusBarHeight.value = 20;
    },
  });
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
    :theme="theme"
    :theme-vars="themeVars"
    custom-style="background-color: #f5f5f5;min-height: 100vh"
    :class="{ 'wot-theme-dark': theme === 'dark' }"
  >
    <view class="box-border w-full min-h-screen" :style="{ paddingTop: statusBarHeight + 'px' }">
      <slot />
    </view>
    <wd-notify />
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>

<style lang="scss" scoped></style>
