<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useThemeStore } from "@/store";

/**
 * 全局应用容器（主题配置唯一来源）
 *
 * wd-config-provider 自身会渲染 wot-theme-{light|dark} 类，并把 themeVars
 * 全量映射为 --wot-* 内联变量，页面内容与全局弹层（notify/toast/dialog）
 * 统一从这里继承主题。default 与 tabbar 两个 layout 共用，保证配置同源。
 */
const themeStore = useThemeStore();
const { theme, themeVars } = storeToRefs(themeStore);

// 主题色双通道同步：themeVars 只覆盖 --wot-* 组件变量，页面自定义样式的
// var(--color-primary) 依赖这里内联注入跟随用户选中色，否则换色时两套蓝割裂
// （wot v2 的 customStyle 为字符串拼接，不接受对象）
const providerStyle = computed(() => `--color-primary: ${themeStore.currentThemeColor.primary};`);
</script>

<script lang="ts">
export default {
  name: "AppProvider",
  options: {
    virtualHost: true,
    styleIsolation: "shared",
  },
};
</script>

<template>
  <wd-config-provider
    :theme="theme"
    :theme-vars="themeVars"
    :custom-style="providerStyle"
    :button="{ type: 'primary' }"
    :tag="{ variant: 'plain' }"
  >
    <slot />
    <wd-notify />
    <wd-toast />
    <wd-dialog />
  </wd-config-provider>
</template>
