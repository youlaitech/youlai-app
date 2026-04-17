import { defineStore } from "pinia";
import { Storage } from "@/utils/storage";
import { THEME_MODE_KEY, THEME_COLOR_KEY } from "@/constants";
import type { ThemeColorOption, ThemeMode } from "@/composables/types/theme";
import { themeColorOptions } from "@/composables/types/theme";

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

  /** 主题变量（响应式对象） */
  const themeVars = reactive({
    darkBackground: "#1f2937",
    darkBackground2: "#111827",
    darkBackground3: "#1e293b",
    darkBackground4: "#374151",
    darkBackground5: "#4b5563",
    darkBackground6: "#6b7280",
    darkBackground7: "#9ca3af",
    darkColor: "#f9fafb",
    darkColor2: "#9ca3af",
    darkColor3: "#6b7280",
    colorTheme: currentThemeColor.value.primary,
  });

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
    themeVars.colorTheme = color.primary;
  };

  /**
   * 初始化主题
   */
  const initTheme = () => {
    // 更新主题变量中的颜色
    themeVars.colorTheme = currentThemeColor.value.primary;

    // 设置导航栏颜色
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
