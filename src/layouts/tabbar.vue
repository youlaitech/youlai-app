<template>
  <wd-config-provider :theme-vars="themeVars" :custom-class="`page-wraper ${theme}`" :theme="theme">
    <slot />
    <wd-tabbar
      :model-value="activeTabbar.name"
      placeholder
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
    <wd-message-box />
  </wd-config-provider>
</template>

<script setup lang="ts">
import { useThemeStore } from "@/store";
import { useTabbar } from "@/composables/useTabbar";
import { useRouter, useRoute } from "uni-mini-router";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();
const { themeVars, theme } = storeToRefs(themeStore);
const { activeTabbar, getTabbarItemValue, setTabbarItemActive, tabbarList } = useTabbar();

function handleTabbarChange({ value }: { value: string }) {
  setTabbarItemActive(value);
  router.pushTab({ name: value });
}

onMounted(() => {
  // #ifdef APP-PLUS
  uni.hideTabBar();
  // #endif
  nextTick(() => {
    if (route.name && route.name !== activeTabbar.value.name) {
      setTabbarItemActive(route.name);
    }
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

<style lang="scss">
.page-wraper {
  box-sizing: border-box;

  // 页面最小高度 = 视窗高度 - 状态栏高度
  // --window-top: uni-app提供的状态栏高度CSS变量(包含状态栏+导航栏)
  min-height: calc(100vh - var(--window-top));

  background: var(--wot-color-bg);
}
</style>
