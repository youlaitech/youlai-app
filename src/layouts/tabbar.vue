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
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
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

const { theme, themeVars } = useTheme();

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
  console.log(`设置 tabbar 激活状态: ${name}`);
  tabbarItems.value.forEach((item) => {
    if (item.name === name) {
      item.active = true;
    } else {
      item.active = false;
    }
  });
};

// 根据当前路由更新 tabbar 激活状态
const updateTabbarByRoute = () => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    const route = currentPage.route;

    console.log("=== Tabbar 路由更新 ===");
    console.log("当前路由:", route);
    console.log("当前激活的 tabbar:", activeTabbar.value.name);

    // 根据当前路由设置活跃的 tabbar
    if (route === "pages/index/index") {
      console.log("设置首页为激活状态");
      setTabbarItemActive("index");
    } else if (route === "pages/mine/index") {
      console.log("设置我的页面为激活状态");
      setTabbarItemActive("mine");
    } else {
      console.log("非 tabbar 页面，保持当前状态");
    }

    console.log("更新后激活的 tabbar:", activeTabbar.value.name);
    console.log("=== 更新完成 ===");
  }
};

function handleTabbarChange({ value }: { value: string }) {
  console.log(`用户点击 tabbar: ${value}`);
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

// 监听页面栈变化
const currentRoute = ref("");

const updateCurrentRoute = () => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    const newRoute = currentPage.route || "";

    if (newRoute !== currentRoute.value) {
      currentRoute.value = newRoute;
      console.log("页面路由发生变化:", newRoute);
      updateTabbarByRoute();
    }
  }
};

onMounted(() => {
  nextTick(() => {
    updateTabbarByRoute();
    updateCurrentRoute();
  });

  // 监听页面发出的 tabbar 更新事件
  uni.$on("updateTabbar", (tabName: string) => {
    console.log("收到 tabbar 更新事件:", tabName);
    setTabbarItemActive(tabName);
  });
});

// 页面显示时更新 tabbar 状态
onShow(() => {
  nextTick(() => {
    updateCurrentRoute();
  });

  // #ifdef APP-PLUS
  uni.hideTabBar();
  // #endif
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  uni.$off("updateTabbar");
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
    custom-style="min-height: 100vh"
    :class="{ 'wot-theme-dark': theme === 'dark' }"
  >
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

<style lang="scss" scoped>
/* 暗黑模式样式 */
.wot-theme-dark {
  color: #f5f5f5;
  background-color: #1a1a1a;

  :deep(.wd-navbar) {
    color: #f5f5f5;
    background-color: #2a2a2a;
  }

  :deep(.wd-tabbar) {
    background-color: #2a2a2a;
    border-top-color: #404040;
  }
}
</style>
