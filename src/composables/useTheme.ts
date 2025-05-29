import { ref, watch, computed } from "vue";
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

/* 主题状态 */
export const theme = ref<"light" | "dark">(getStoredTheme());
export const currentThemeColor = ref<string>(getStoredThemeColor());

/* 主题变量（供 ConfigProvider 使用） */
export const themeVars = computed<ConfigProviderThemeVars>(() => ({
  colorTheme: currentThemeColor.value,
  // 按钮颜色
  buttonPrimaryBgColor: currentThemeColor.value,
  buttonPrimaryColor: "#ffffff",
  // 开关颜色
  switchOnBgColor: currentThemeColor.value,
  // 其他组件颜色
  cellIconColor: currentThemeColor.value,
  tagPrimaryBgColor: currentThemeColor.value,
  tagPrimaryColor: "#ffffff",
}));

/* 应用主题到根元素 */
const applyThemeToRoot = () => {
  // 获取根元素
  const root = document.documentElement;
  const body = document.body;

  // #ifdef H5
  // 应用暗黑模式
  if (theme.value === "dark") {
    root.setAttribute("data-theme", "dark");
    body.classList.add("wot-theme-dark");
  } else {
    root.removeAttribute("data-theme");
    body.classList.remove("wot-theme-dark");
  }

  // 应用主题色类
  // 移除所有主题色类
  root.className = root.className.replace(/theme-color-\w+/g, "").trim();
  // 添加当前主题色类
  const colorClass = `theme-color-${currentThemeColor.value.replace("#", "")}`;
  root.classList.add(colorClass);
  // #endif

  // #ifdef MP
  // 小程序环境下通过设置页面的 data-theme 属性
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1] as any;
    if (currentPage) {
      currentPage.setData?.({
        "data-theme": theme.value,
        themeColor: currentThemeColor.value,
      });
    }
  }
  // #endif
};

/* 监听主题模式变化 */
watch(
  theme,
  (newTheme) => {
    uni.setStorageSync(THEME_STORAGE_KEY, newTheme);
    applyThemeToRoot();
  },
  { immediate: true }
);

/* 监听主题色变化 */
watch(
  currentThemeColor,
  (newColor) => {
    uni.setStorageSync(THEME_COLOR_STORAGE_KEY, newColor);
    applyThemeToRoot();
  },
  { immediate: true }
);

/* 切换主题模式 */
export const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
};

/* 设置主题色 */
export const setThemeColor = (color: string) => {
  currentThemeColor.value = color;
};

/* 重置主题 */
export const resetTheme = () => {
  theme.value = "light";
  currentThemeColor.value = colorColumns[0].value;
};

/* 初始化主题 */
export const initTheme = () => {
  applyThemeToRoot();
  console.log("主题初始化完成:", {
    mode: theme.value,
    color: currentThemeColor.value,
  });
};

/* 导出主题相关的工具 */
export const useTheme = () => {
  return {
    theme,
    themeVars,
    currentThemeColor,
    toggleTheme,
    setThemeColor,
    resetTheme,
    initTheme,
    colorColumns,
  };
};
