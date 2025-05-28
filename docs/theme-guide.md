# 主题设置功能指南

## 功能概述

本项目提供了完整的主题设置功能，支持暗黑模式切换和主题色自定义，让用户可以个性化应用的外观。

## 功能特性

### 1. 暗黑模式

- 支持浅色/暗黑模式切换
- 自动保存用户偏好设置
- 平滑的过渡动画效果
- 导航栏颜色自动适配

### 2. 主题色设置

- 12种预设主题色可选
- 支持自定义十六进制颜色值
- 实时预览效果
- 主题色持久化存储

### 3. 效果预览

- 按钮样式预览
- 文本颜色预览
- 标签组件预览
- 实时更新显示

## 文件结构

```
src/
├── composables/
│   └── theme/
│       ├── theme.ts          # 主题管理核心逻辑
│       └── rootTheme.ts      # 主题配置和默认值
├── store/
│   └── modules/
│       └── theme.ts          # 主题状态管理
├── pages/
│   └── setting.vue           # 主题设置页面
├── utils/
│   ├── theme.ts              # 主题工具函数
│   └── colorUtils.ts         # 颜色处理工具
└── styles/
    └── global.scss           # 全局主题样式
```

## 核心组件说明

### 1. useTheme Composable

位置：`src/composables/theme/theme.ts`

主要功能：

- 主题模式切换（浅色/暗黑）
- 主题色设置和保存
- 导航栏颜色适配
- 本地存储管理

```typescript
const {
  theme, // 当前主题模式
  themeVars, // 主题变量
  toggleTheme, // 切换主题模式
  setThemeColor, // 设置主题色
  initTheme, // 初始化主题
} = useTheme();
```

### 2. useThemeStore

位置：`src/store/modules/theme.ts`

主要功能：

- 主题色状态管理
- CSS变量动态设置
- 多平台兼容处理

```typescript
const themeStore = useThemeStore();

// 设置主题色
themeStore.setPrimaryColor("#165DFF");

// 初始化主题
themeStore.initTheme();
```

### 3. 主题设置页面

位置：`src/pages/setting.vue`

功能模块：

- 暗黑模式开关
- 预设主题色选择
- 自定义颜色输入
- 效果实时预览
- 重置默认主题

## 使用方法

### 1. 基础使用

在页面中引入主题功能：

```vue
<script setup>
import { useTheme } from "@/composables/theme/theme";
import { useThemeStore } from "@/store/modules/theme";

const { theme, themeVars, toggleTheme } = useTheme();
const themeStore = useThemeStore();

// 切换暗黑模式
function switchTheme() {
  toggleTheme();
}

// 设置主题色
function changeThemeColor(color) {
  themeStore.setPrimaryColor(color);
}
</script>

<template>
  <wd-config-provider :theme-vars="themeVars" :theme="theme">
    <!-- 你的页面内容 -->
  </wd-config-provider>
</template>
```

### 2. 在布局中使用

在 `src/layouts/tabbar.vue` 中已经集成了主题功能：

```vue
<template>
  <wd-config-provider :theme-vars="themeVars" :theme="theme">
    <!-- 布局内容 -->
  </wd-config-provider>
</template>
```

### 3. 自定义主题色

支持的颜色格式：

- 6位十六进制：`#165DFF`
- 3位十六进制：`#16F`（会自动转换为6位）

```javascript
// 设置自定义主题色
const customColor = "#FF6B6B";
themeStore.setPrimaryColor(customColor);
```

## 预设主题色

项目提供了12种预设主题色：

| 颜色名称 | 颜色值  | 说明       |
| -------- | ------- | ---------- |
| 蓝色     | #0055FE | 默认主题色 |
| 红色     | #CD5C5C | 经典红色   |
| 绿色     | #228B22 | 自然绿色   |
| 紫色     | #722ED1 | 优雅紫色   |
| 橙色     | #FA8C16 | 活力橙色   |
| 黄色     | #FADB14 | 明亮黄色   |
| 青色     | #13C2C2 | 清新青色   |
| 粉色     | #EB2F96 | 温馨粉色   |
| 天蓝色   | #1890FF | 科技蓝色   |
| 深红色   | #F5222D | 警示红色   |

## 样式变量

主题系统使用CSS变量来实现动态主题切换：

```scss
:root {
  /* 主色调 */
  --primary-color: #165dff;
  --primary-color-light: #94bfff;
  --primary-color-dark: #0e3c9b;

  /* 功能色 */
  --success-color: #0fc6c2;
  --warning-color: #ff7d00;
  --danger-color: #f5222d;
  --info-color: #86909c;
}
```

在组件中使用：

```scss
.my-button {
  background-color: var(--primary-color);
  color: #fff;

  &:hover {
    background-color: var(--primary-color-dark);
  }
}
```

## 平台兼容性

### H5平台

- 使用CSS变量动态设置主题
- 支持所有现代浏览器
- 平滑的过渡动画

### 小程序平台

- 使用原生API设置TabBar样式
- 通过工具函数处理样式应用
- 兼容微信、支付宝等小程序

### APP平台

- 支持原生导航栏颜色设置
- 状态栏颜色自动适配
- 性能优化处理

## 最佳实践

### 1. 主题初始化

在应用启动时初始化主题：

```typescript
// src/App.vue
import { useThemeStore } from "@/store/modules/theme";

const themeStore = useThemeStore();

onLaunch(() => {
  // 初始化主题
  themeStore.initTheme();
});
```

### 2. 组件中使用主题

```vue
<template>
  <view class="my-component">
    <text class="title">标题</text>
    <button class="primary-btn">按钮</button>
  </view>
</template>

<style lang="scss" scoped>
.my-component {
  .title {
    color: var(--primary-color);
  }

  .primary-btn {
    background: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 8rpx;

    &:active {
      background: var(--primary-color-dark);
    }
  }
}
</style>
```

### 3. 暗黑模式适配

```scss
// 暗黑模式样式
:deep(.wd-config-provider[data-theme="dark"]) {
  .my-component {
    background: #2a2a2a;
    color: #fff;

    .title {
      color: var(--primary-color);
    }
  }
}
```

## 注意事项

1. **性能优化**：主题切换时避免频繁的DOM操作
2. **兼容性**：小程序环境下某些CSS特性可能不支持
3. **用户体验**：提供平滑的过渡动画效果
4. **持久化**：确保用户设置能够正确保存和恢复
5. **响应式**：在不同屏幕尺寸下保持良好的显示效果

## 故障排除

### 1. 主题色不生效

- 检查CSS变量是否正确设置
- 确认组件是否在 `wd-config-provider` 包裹内
- 验证颜色值格式是否正确

### 2. 暗黑模式切换异常

- 检查 `theme` 状态是否正确更新
- 确认暗黑模式样式是否正确编写
- 验证导航栏颜色设置是否生效

### 3. 设置不持久化

- 检查本地存储权限
- 确认存储key是否正确
- 验证初始化逻辑是否执行

## 扩展开发

### 1. 添加新的预设主题色

在 `src/composables/theme/rootTheme.ts` 中添加：

```typescript
export const colorColumns = [
  // 现有颜色...
  {
    value: "#YOUR_COLOR",
    label: "你的颜色名称",
  },
];
```

### 2. 自定义主题变量

在 `src/composables/theme/rootTheme.ts` 中扩展：

```typescript
export const initThemeVars: ConfigProviderThemeVars = {
  colorTheme: colorColumns[0].value,
  // 添加更多主题变量
  colorSuccess: "#52c41a",
  colorWarning: "#faad14",
  colorDanger: "#ff4d4f",
};
```

### 3. 添加主题切换动画

```scss
.theme-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

通过以上指南，你可以充分利用项目的主题设置功能，为用户提供个性化的应用体验。
