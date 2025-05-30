<script lang="ts" setup>
import { useTheme } from "@/composables/useTheme";
import { onLoad } from "@dcloudio/uni-app";

const { theme, themeVars } = useTheme();

// 页面标题
const pageTitle = ref("");
// 是否显示返回按钮
const showBackButton = ref(false);
// 是否显示导航栏
const showNavbar = ref(true);

// 获取当前页面路由信息
const getCurrentPageRoute = () => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    return currentPage.route || "";
  }
  return "";
};

// 处理返回按钮点击
const handleBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: "/pages/index/index" });
    },
  });
};

// 页面加载时处理导航栏配置
onLoad(() => {
  const route = getCurrentPageRoute();

  // 获取当前页面实例
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];

    // 尝试获取页面的navigationBarTitleText
    const navigationBarTitleText = currentPage.$page?.style?.navigationBarTitleText || "";
    pageTitle.value = navigationBarTitleText;

    // 如果是首页或tabbar页面，不显示返回按钮
    showBackButton.value = pages.length > 1;

    // 某些页面可能不需要显示导航栏
    if (route.includes("/index/index") || route.includes("/login")) {
      showNavbar.value = false;
    }
  }
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
    <!-- 顶部导航栏 -->
    <wd-navbar :title="pageTitle" :border="false" @click-left="handleBack">
      <template #left>
        <wd-icon name="arrow-left" size="20" />
      </template>
    </wd-navbar>

    <!-- 内容区域 -->
    <slot />

    <wd-notify />
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>

<style lang="scss" scoped></style>
