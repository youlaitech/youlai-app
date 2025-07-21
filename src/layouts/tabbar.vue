<!--
 * @Author: Ray.Hao
 * @Date: 2025-05-01 12:31:47
 * @LastEditTime: 2025-05-01 12:31:47
 * @LastEditors: Ray.Hao
 * @Description: Tabbar 布局组件
-->

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
    <view class="box-border w-full min-h-screen" :style="{ paddingTop: statusBarHeight + 'px' }">
      <slot />
    </view>
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

const { theme, themeVars } = useTheme();

// 状态栏高度
const statusBarHeight = ref(0);

// tabbar 配置
const tabbarItems = ref<TabbarItem[]>([
  { name: "index", value: null, active: true, title: "首页", icon: "home" },
  { name: "mine", value: null, active: false, title: "我的", icon: "user" },
]);

// 计算属性
const tabbarList = computed(() => tabbarItems.value);
const activeTabbar = computed(
  () => tabbarItems.value.find((item) => item.active) || tabbarItems.value[0]
);

// 更新 tabbar 状态
const updateTabbarState = () => {
  const pages = getCurrentPages();
  if (!pages.length) return;

  const route = pages[pages.length - 1].route;

  if (route === "pages/index/index") {
    setTabbarActive("index");
  } else if (route === "pages/mine/index") {
    setTabbarActive("mine");
  }
};

// 设置激活状态
const setTabbarActive = (name: string) => {
  tabbarItems.value.forEach((item) => {
    item.active = item.name === name;
  });
};

// 处理点击事件
const handleTabbarChange = ({ value }: { value: string }) => {
  setTabbarActive(value);

  const url = value === "index" ? "/pages/index/index" : "/pages/mine/index";
  uni.reLaunch({ url });
};

// 生命周期
onMounted(() => {
  // 获取状态栏高度（改为异步方法）
  uni.getSystemInfo({
    success: (res) => {
      statusBarHeight.value = res.statusBarHeight || 20;
    },
    fail: () => {
      statusBarHeight.value = 20;
    },
  });

  // 初始化状态
  nextTick(updateTabbarState);

  // 监听事件
  uni.$on("updateTabbar", setTabbarActive);
});

onShow(() => {
  nextTick(updateTabbarState);

  // #ifdef APP-PLUS
  uni.hideTabBar();
  // #endif
});

onUnmounted(() => {
  uni.$off("updateTabbar");
});
</script>
