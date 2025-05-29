import { ref, watch } from "vue";
import type { ConfigProviderThemeVars } from "wot-design-uni";

/* 默认的主题色列表 */
export const colorColumns = [
  { value: "#165DFF", label: "蓝色" },
  { value: "#0FC6C2", label: "青绿色" },
  { value: "#722ED1", label: "紫色" },
  { value: "#F5222D", label: "红色" },
  { value: "#FA8C16", label: "橙色" },
  { value: "#FADB14", label: "黄色" },
  { value: "#52C41A", label: "绿色" },
  { value: "#EB2F96", label: "粉色" },
  { value: "#13C2C2", label: "青色" },
  { value: "#1890FF", label: "天蓝色" },
  { value: "#CD5C5C", label: "经典红" },
  { value: "#228B22", label: "自然绿" },
];

/* 存储键名 */
const THEME_STORAGE_KEY = "app_theme_mode";
const THEME_COLOR_STORAGE_KEY = "app_theme_color";

/* 从存储中获取主题模式 */
const getStoredTheme = (): "light" | "dark" => {
  try {
    const stored = uni.getStorageSync(THEME_STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

/* 从存储中获取主题色 */
const getStoredThemeColor = (): string => {
  try {
    const stored = uni.getStorageSync(THEME_COLOR_STORAGE_KEY);
    return stored || colorColumns[0].value;
  } catch {
    return colorColumns[0].value;
  }
};

/* 保存主题模式到存储 */
const saveThemeToStorage = (theme: "light" | "dark") => {
  try {
    uni.setStorageSync(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error("保存主题模式失败:", error);
  }
};

/* 保存主题色到存储 */
const saveThemeColorToStorage = (color: string) => {
  try {
    uni.setStorageSync(THEME_COLOR_STORAGE_KEY, color);
  } catch (error) {
    console.error("保存主题色失败:", error);
  }
};

/* 应用暗黑模式的 body 样式 */
const applyDarkModeBodyStyle = (isDark: boolean) => {
  // #ifdef H5
  if (typeof document !== "undefined") {
    const body = document.body;
    if (isDark) {
      body.style.backgroundColor = "#1a1a1a";
      body.style.color = "#f5f5f5";
      body.classList.add("wot-theme-dark");
    } else {
      body.style.backgroundColor = "#f8f8f8";
      body.style.color = "#333";
      body.classList.remove("wot-theme-dark");
    }
  }
  // #endif

  // #ifdef MP
  // 小程序环境中设置页面样式
  try {
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.$vm) {
        // 这里可以根据需要设置页面样式
        console.log("小程序暗黑模式:", isDark ? "开启" : "关闭");
      }
    }
  } catch (error) {
    console.error("设置小程序页面样式失败:", error);
  }
  // #endif
};

/* 主题状态 */
export const theme = ref<"light" | "dark">(getStoredTheme());

/* 主题变量 */
export const themeVars = ref<ConfigProviderThemeVars>({
  colorTheme: getStoredThemeColor(),
});

/* 监听主题模式变化，应用 body 样式 */
watch(
  theme,
  (newTheme) => {
    saveThemeToStorage(newTheme);
    applyDarkModeBodyStyle(newTheme === "dark");
  },
  { immediate: true }
);

/* 监听主题色变化，保存到存储 */
watch(
  () => themeVars.value.colorTheme,
  (newColor) => {
    if (newColor) {
      saveThemeColorToStorage(newColor);
    }
  },
  { immediate: true }
);

/* 切换主题模式 */
export const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
};

/* 设置主题色 */
export const setThemeColor = (color: string) => {
  themeVars.value = {
    ...themeVars.value,
    colorTheme: color,
  };
};

/* 重置主题 */
export const resetTheme = () => {
  theme.value = "light";
  setThemeColor(colorColumns[0].value);
};

/* 初始化主题 */
export const initTheme = () => {
  // 应用当前主题的 body 样式
  applyDarkModeBodyStyle(theme.value === "dark");

  // 确保主题变量已正确设置
  if (!themeVars.value.colorTheme) {
    themeVars.value.colorTheme = getStoredThemeColor();
  }

  console.log("主题初始化完成:", {
    mode: theme.value,
    color: themeVars.value.colorTheme,
  });
};

/* 导出主题相关的工具 */
export const useTheme = () => {
  return {
    theme,
    themeVars,
    toggleTheme,
    setThemeColor,
    resetTheme,
    initTheme,
    colorColumns,
  };
};
