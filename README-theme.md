# Wot Design Uni 主题系统使用指南

## 概述

本项目基于 Wot Design Uni 的 CSS 变量系统实现了完整的主题定制功能，支持：

- 🌙 暗黑模式切换
- 🎨 12 种预设主题色
- 🎯 自定义主题色
- 💾 持久化存储
- 📱 多平台兼容（H5、小程序）

## 核心文件

### 1. 主题变量文件

- `src/styles/wot-theme.scss` - Wot Design Uni CSS 变量定制
- `src/uni.scss` - 引入主题变量文件

### 2. 主题 Composable

- `src/composables/useTheme.ts` - 主题状态管理和工具函数

### 3. 主题设置页面

- `src/pages/mine/settings/theme/index.vue` - 主题设置界面
- `src/pages/test-wot-theme.vue` - 主题测试页面

## 使用方法

### 1. 在组件中使用主题

```vue
<template>
  <view class="container">
    <!-- 暗黑模式切换 -->
    <wd-switch :model-value="theme === 'dark'" @change="toggleTheme" />

    <!-- 使用主题色 -->
    <wd-button type="primary">主要按钮</wd-button>

    <!-- 自定义样式使用 CSS 变量 -->
    <view class="custom-text">使用主题色的文本</view>
  </view>
</template>

<script setup>
import { useTheme } from "@/composables/useTheme";

const { theme, toggleTheme, setThemeColor } = useTheme();

// 切换到指定主题色
const changeColor = () => {
  setThemeColor("#ff6b6b");
};
</script>

<style scoped>
.container {
  background-color: var(--wot-color-bg, #fff);
  color: var(--wot-color-text, #333);
}

.custom-text {
  color: var(--wot-color-theme, #165dff);
}
</style>
```

### 2. 可用的 CSS 变量

#### 主题色系

- `--wot-color-theme` - 主题色
- `--wot-color-success` - 成功色
- `--wot-color-warning` - 警告色
- `--wot-color-danger` - 危险色
- `--wot-color-info` - 信息色

#### 文本颜色

- `--wot-color-text` - 主要文本色
- `--wot-color-text-secondary` - 次要文本色
- `--wot-color-text-placeholder` - 占位符文本色

#### 背景颜色

- `--wot-color-bg` - 主背景色
- `--wot-color-bg-light` - 浅背景色
- `--wot-card-bg-color` - 卡片背景色

#### 边框颜色

- `--wot-color-border` - 边框色
- `--wot-color-border-light` - 浅边框色

### 3. 预设主题色

项目提供 12 种预设主题色：

```javascript
const colorColumns = [
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
```

## 暗黑模式适配

### 自动适配

所有使用 Wot CSS 变量的组件都会自动适配暗黑模式。

### 手动适配

对于自定义组件，使用 CSS 变量即可：

```scss
.my-component {
  background-color: var(--wot-card-bg-color, #fff);
  color: var(--wot-color-text, #333);
  border: 1px solid var(--wot-color-border, #e5e6eb);
}
```

## 测试页面

访问 `/pages/test-wot-theme` 可以测试：

- 暗黑模式切换
- 主题色切换
- CSS 变量效果
- 各种 Wot 组件的主题适配

## 注意事项

1. **CSS 变量优先级**：使用 `var(--variable-name, fallback)` 格式提供回退值
2. **暗黑模式检测**：通过 `[data-theme="dark"]` 选择器自动切换
3. **持久化存储**：主题设置会自动保存到本地存储
4. **平台兼容**：H5 和小程序环境都有相应的适配处理

## 扩展主题

### 添加新的主题色

1. 在 `colorColumns` 数组中添加新颜色
2. 在 `wot-theme.scss` 中添加对应的 CSS 类

```scss
.theme-custom {
  --wot-color-theme: #your-color;
}
```

### 自定义 CSS 变量

在 `wot-theme.scss` 中添加新的变量：

```scss
:root {
  --wot-custom-color: #your-color;
}

[data-theme="dark"] {
  --wot-custom-color: #your-dark-color;
}
```

## 故障排除

1. **主题色不生效**：检查是否正确引入了 `wot-theme.scss`
2. **暗黑模式样式异常**：确认使用了正确的 CSS 变量
3. **小程序兼容问题**：检查条件编译是否正确

## 更新日志

- ✅ 修复了暗黑模式切换无效的问题
- ✅ 完善了 Wot Design Uni CSS 变量系统
- ✅ 优化了主题设置页面的 UI 组件
- ✅ 添加了完整的主题测试页面
