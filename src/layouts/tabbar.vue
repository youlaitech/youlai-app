<template>
  <wd-config-provider :theme-vars="themeVars" :custom-class="theme" :theme="theme">
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

// 监听路由变化更新 tabbar 激活状态
watch(
  () => route.name,
  (name) => {
    if (name && name !== activeTabbar.value.name) {
      setTabbarItemActive(name);
    }
  },
  { immediate: true }
);

onMounted(() => {
  // #ifdef APP-PLUS
  uni.hideTabBar();
  // #endif
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
