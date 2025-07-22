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
        :value="item.value"
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
const { theme, themeVars } = useTheme();

const { activeTabbar, getTabbarItemValue, setTabbarItemActive, tabbarList } = useTabbar();

// 生命周期
onMounted(() => {
  // #ifdef APP-PLUS
  uni.hideTabBar();
  // #endif
  nextTick(() => {
    const pages = getCurrentPages();
    if (!pages.length) return;

    const route = pages[pages.length - 1].route;
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
  min-height: calc(100vh - var(--window-top));
  background: #f9f9f9;
}

.wot-theme-dark.page-wraper {
  background: #222;
}
</style>
