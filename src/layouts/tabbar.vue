<!--
 * @Author: weisheng
 * @Date: 2024-11-01 12:31:47
 * @LastEditTime: 2024-11-14 19:02:06
 * @LastEditors: weisheng
 * @Description:
 * @FilePath: \wot-demo\src\layouts\tabbar.vue
 * 记得注释
-->
<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useTheme } from "@/composables/useTheme";

// 定义 TabbarItem 接口
interface TabbarItem {
  name: string;
  value: number | null;
  active: boolean;
  title: string;
  icon: string;
}

// 根据 pages.json 配置的 tabbar 项目
const tabbarItems = ref<TabbarItem[]>([
  { name: "index", value: null, active: true, title: "首页", icon: "home" },
  { name: "mine", value: null, active: false, title: "我的", icon: "user" },
]);

const { themeVars } = useTheme();

// 计算属性
const tabbarList = computed(() => tabbarItems.value);

const activeTabbar = computed(() => {
  const item = tabbarItems.value.find((item) => item.active);
  return item || tabbarItems.value[0];
});

// 方法
const getTabbarItemValue = (name: string) => {
  const item = tabbarItems.value.find((item) => item.name === name);
  return item && item.value ? item.value : null;
};

const setTabbarItemActive = (name: string) => {
  tabbarItems.value.forEach((item) => {
    if (item.name === name) {
      item.active = true;
    } else {
      item.active = false;
    }
  });
};

function handleTabbarChange({ value }: { value: string }) {
  setTabbarItemActive(value);

  // 根据 tabbar 项目导航到对应页面
  if (value === "index") {
    uni.switchTab({
      url: "/pages/index/index",
    });
  } else if (value === "mine") {
    uni.switchTab({
      url: "/pages/mine/index",
    });
  }
}

onMounted(() => {
  nextTick(() => {
    // 获取当前页面路径
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const route = currentPage.route;

      // 根据当前路由设置活跃的 tabbar
      if (route?.includes("pages/index/index")) {
        setTabbarItemActive("index");
      } else if (route?.includes("pages/mine/index")) {
        setTabbarItemActive("mine");
      }
    }
  });
});

onShow(() => {
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

<template>
  <wd-config-provider :theme-vars="themeVars" custom-style="min-height: 100vh" theme="dark">
    <wd-navbar
      :title="activeTabbar.title"
      safe-area-inset-top
      placeholder
      fixed
      :bordered="false"
    />

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
