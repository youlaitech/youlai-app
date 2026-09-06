import {
  useThemeStore,
  themeColorOptions,
  type ThemeColorOption,
  type ThemeMode,
} from "@/store/modules/theme";

export function useTheme() {
  const store = useThemeStore();

  /**
   * 切换暗黑模式
   * @param mode 指定主题模式，不传则自动切换
   */
  function toggleTheme(mode?: ThemeMode) {
    store.toggleTheme(mode);
  }

  /**
   * 设置主题色
   * @param option 主题色选项
   */
  function setThemeColor(option: ThemeColorOption) {
    store.setCurrentThemeColor(option);
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    store.initTheme();
  }

  // 全局主题初始化已在 App.vue onLaunch 中完成（导航栏颜色同步），
  // 组件中一般无需再调用 initTheme()

  return {
    theme: computed(() => store.theme),
    isDark: computed(() => store.isDark),
    currentThemeColor: computed(() => store.currentThemeColor),
    themeVars: store.themeVars,

    themeColorOptions,

    initTheme,
    toggleTheme,
    setThemeColor,
  };
}

export type { ThemeColorOption, ThemeMode };
