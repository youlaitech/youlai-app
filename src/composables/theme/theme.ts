import { colorColumns, initThemState, initThemeVars } from "./rootTheme";
/* 暗黑模式切换 */
const theme = ref<"light" | "dark">(initThemState);
/* 组件库的主题色 */
const themeVars = ref({ ...initThemeVars });

// 从本地存储恢复主题设置
function loadThemeFromStorage() {
  try {
    const savedTheme = uni.getStorageSync("app_theme_mode");
    const savedThemeColor = uni.getStorageSync("app_theme_color");

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      theme.value = savedTheme;
    }

    if (savedThemeColor) {
      themeVars.value.colorTheme = savedThemeColor;
    }
  } catch (error) {
    console.error("加载主题设置失败:", error);
  }
}

// 保存主题设置到本地存储
function saveThemeToStorage() {
  try {
    uni.setStorageSync("app_theme_mode", theme.value);
    uni.setStorageSync("app_theme_color", themeVars.value.colorTheme);
  } catch (error) {
    console.error("保存主题设置失败:", error);
  }
}

export function useTheme() {
  /* 切换暗黑模式 */
  function toggleTheme(mode?: "light" | "dark") {
    theme.value = mode || (theme.value === "light" ? "dark" : "light");
    setNavigationBarColor();
    saveThemeToStorage();
  }

  /* 设置主题色 */
  function setThemeColor(color: string) {
    themeVars.value.colorTheme = color;
    saveThemeToStorage();
  }

  /* 初始化theme */
  function initTheme() {
    loadThemeFromStorage();
    setNavigationBarColor();
  }

  function setNavigationBarColor() {
    uni.setNavigationBarColor({
      frontColor: theme.value === "light" ? "#000000" : "#ffffff",
      backgroundColor: theme.value === "light" ? "#ffffff" : "#000000",
      animation: {
        duration: 400,
        timingFunc: "easeIn",
      },
    });
  }

  return {
    theme,
    themeVars,
    initTheme,
    colorColumns,
    toggleTheme,
    setThemeColor,
  };
}
