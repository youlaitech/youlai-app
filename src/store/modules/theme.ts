import { defineStore } from "pinia";
import { Storage } from "@/utils/storage";
import { THEME_MODE_KEY, THEME_COLOR_KEY } from "@/constants";
import type { ConfigProviderThemeVars } from "@wot-ui/ui";

/** 主题色选项 */
export interface ThemeColorOption {
  name: string;
  value: string;
  primary: string;
}

/** 主题类型 */
export type ThemeMode = "light" | "dark";

/** 预定义的主题色选项 */
export const themeColorOptions: ThemeColorOption[] = [
  { name: "默认蓝", value: "blue", primary: "#4d80f0" },
  { name: "活力橙", value: "orange", primary: "#FF7D00" },
  { name: "薄荷绿", value: "green", primary: "#07C160" },
  { name: "樱花粉", value: "pink", primary: "#FF69B4" },
  { name: "紫罗兰", value: "purple", primary: "#8A2BE2" },
  { name: "朱砂红", value: "red", primary: "#FF4757" },
];

interface ProviderThemeVars extends ConfigProviderThemeVars {
  colorTheme: string;
}

/**
 * 主题状态管理 Store
 *
 * 功能说明：
 * - 主题模式切换（明/暗）
 * - 主题色定制
 * - 导航栏颜色同步
 */

export const useThemeStore = defineStore("theme", () => {
  // ==========================================================================
  // 状态
  // ==========================================================================

  /** 当前主题模式 */
  const theme = ref<ThemeMode>(Storage.get<ThemeMode>(THEME_MODE_KEY, "light"));

  /** 当前主题色 */
  const currentThemeColor = ref<ThemeColorOption>(
    Storage.get<ThemeColorOption>(THEME_COLOR_KEY, themeColorOptions[0])
  );

  /**
   * 主题变量：Wot UI v2 内置完整暗黑模式（ConfigProvider theme="dark" + 官方主题 SCSS），
   * 无需手动覆盖组件变量，这里只注入主题色
   */
  const themeVars = computed<ProviderThemeVars>(() => ({
    colorTheme: currentThemeColor.value.primary,
  }));

  // ==========================================================================
  // 计算属性
  // ==========================================================================

  /** 是否为暗黑模式 */
  const isDark = computed(() => theme.value === "dark");

  // ==========================================================================
  // 方法
  // ==========================================================================

  /**
   * 设置导航栏颜色
   */
  const setNavigationBarColor = () => {
    uni.setNavigationBarColor({
      frontColor: theme.value === "light" ? "#000000" : "#ffffff",
      backgroundColor: theme.value === "light" ? "#ffffff" : "#1f2937",
    });
  };

  /**
   * 切换主题
   * @param mode 指定主题模式，不传则自动切换
   */
  const toggleTheme = (mode?: ThemeMode) => {
    theme.value = mode || (theme.value === "light" ? "dark" : "light");
    Storage.set(THEME_MODE_KEY, theme.value);
    setNavigationBarColor();
  };

  /**
   * 设置主题色
   * @param color 主题色选项
   */
  const setCurrentThemeColor = (color: ThemeColorOption) => {
    currentThemeColor.value = color;
    Storage.set(THEME_COLOR_KEY, color);
  };

  /**
   * 初始化主题
   */
  const initTheme = () => {
    nextTick(() => {
      setNavigationBarColor();
    });
  };

  // ==========================================================================
  // 导出
  // ==========================================================================

  return {
    // 状态
    theme,
    currentThemeColor,
    themeVars,

    // 计算属性
    isDark,

    // 方法
    toggleTheme,
    setCurrentThemeColor,
    setNavigationBarColor,
    initTheme,
  };
});
