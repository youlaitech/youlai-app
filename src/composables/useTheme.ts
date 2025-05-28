import { ref, computed } from "vue";
import type { ConfigProviderThemeVars } from "wot-design-uni";

/* 默认的主题list */
export const colorColumns = [
  {
    value: "#0055FE",
    label: "蓝色",
  },
  {
    value: "#CD5C5C",
    label: "红色",
  },
  {
    value: "#228B22",
    label: "绿色",
  },
];

/* 默认的主题 */
export const initThemState = "light";

/* 默认的主题变量 - 只使用wot-design-uni支持的变量 */
export const initThemeVars: ConfigProviderThemeVars = {
  colorTheme: colorColumns[0].value,
};

/* 暗黑模式主题变量 */
export const darkThemeVars: ConfigProviderThemeVars = {
  colorTheme: colorColumns[0].value,
};

/* 主题状态 */
export const themeState = ref(initThemState);

/* 主题变量 */
export const themeVars = ref<ConfigProviderThemeVars>(initThemeVars);

/* 计算属性：根据主题状态返回对应的主题变量 */
export const computedThemeVars = computed(() => {
  const baseVars = themeState.value === "dark" ? darkThemeVars : initThemeVars;
  return {
    ...baseVars,
    ...themeVars.value,
  };
});

/* 切换主题 */
export const toggleTheme = () => {
  themeState.value = themeState.value === "light" ? "dark" : "light";
  // 更新主题变量
  const newBaseVars = themeState.value === "dark" ? darkThemeVars : initThemeVars;
  themeVars.value = {
    ...newBaseVars,
    colorTheme: themeVars.value.colorTheme, // 保持用户选择的主题色
  };
};

/* 设置主题色 */
export const setThemeColor = (color: string) => {
  themeVars.value = {
    ...themeVars.value,
    colorTheme: color,
  };
};

/* 导出主题相关的工具 */
export const useTheme = () => {
  return {
    themeState,
    themeVars: computedThemeVars,
    toggleTheme,
    setThemeColor,
    colorColumns,
  };
};
