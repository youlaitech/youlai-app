<template>
  <view :class="`wot-theme-${theme}`" :style="themeCSSVars">
    <wd-config-provider :theme-vars="themeVars" :theme="theme === 'dark' ? 'dark' : ''">
      <slot />
      <wd-tabbar
        :model-value="activeTabbar.name"
        bordered
        safe-area-inset-bottom
        fixed
        @change="handleTabbarChange"
      >
      <wd-tabbar-item
        v-for="(item, index) in tabbarList"
        :key="index"
        :name="item.name"
        :value="getTabbarItemValue(item.name)"
        :title="item.title"
        :icon="item.icon"
      />
    </wd-tabbar>
      <wd-notify />
      <wd-toast />
      <wd-dialog />
    </wd-config-provider>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from "@/store";
import { useTabbar } from "@/composables/useTabbar";
import { useRouter } from "uni-mini-router";
import { storeToRefs } from "pinia";

const router = useRouter();
const themeStore = useThemeStore();
const { themeVars, theme, themeCSSVars } = storeToRefs(themeStore);
const { activeTabbar, getTabbarItemValue, setTabbarItemActive, tabbarList } = useTabbar();

/** 页面路径 -> tabbar name 映射（兼容带/不带前缀） */
const ROUTE_TO_TABBAR_NAME: Record<string, string> = {
  "/pages/index/index": "home",
  "/pages/work/index": "work",
  "/pages/mine/index": "mine",
  "pages/index/index": "home",
  "pages/work/index": "work",
  "pages/mine/index": "mine",
};

function handleTabbarChange({ value }: { value: string }) {
  setTabbarItemActive(value);
  router.pushTab({ name: value });
}

/** 根据当前页面路径同步 tabbar 激活状态 */
function syncTabbarActive() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentRoute = (currentPage?.route as string) || "";

  if (!currentRoute) return;

  const tabName = ROUTE_TO_TABBAR_NAME[currentRoute];
  if (tabName && tabName !== activeTabbar.value.name) {
    setTabbarItemActive(tabName);
  }
}

onMounted(() => {
  syncTabbarActive();

  // 小程序 switchTab 时 layout 组件被复用，onMounted 不会再次触发
  // 使用定时轮询兜底，确保 tabbar 激活状态始终与当前页面一致
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ || MP-KUAISHOU || MP-LARK || MP-XHS || MP-JD
  const timer = setInterval(syncTabbarActive, 300);
  onUnmounted(() => clearInterval(timer));
  // #endif

  // #ifdef APP-PLUS
  uni.hideTabBar();
  // #endif
});
</script>

<script lang="ts">
export default {
  options: {
    addGlobalClass: true,
    virtualHost: false,
    styleIsolation: "shared",
  },
};
</script>
