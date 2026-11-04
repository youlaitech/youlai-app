import { useThemeStore, themeColorOptions } from "@/store/modules/theme";
import { storeToRefs } from "pinia";

/**
 * 提供响应式主题状态、主题选项及设置方法
 */
export function useTheme() {
  const store = useThemeStore();
  const { themeMode, isDark, selectedThemeColor, themeVars } = storeToRefs(store);

  return {
    themeMode,
    isDark,
    selectedThemeColor,
    themeVars,
    themeColorOptions,
    initTheme: store.initTheme,
    setThemeMode: store.setThemeMode,
    toggleThemeMode: store.toggleThemeMode,
    setThemeColor: store.setThemeColor,
  };
}

export type { ThemeColorOption, ThemeMode } from "@/store/modules/theme";
