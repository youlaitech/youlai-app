<template>
  <view class="theme-settings-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">主题设置</text>
      <text class="page-subtitle">个性化您的应用外观</text>
    </view>

    <!-- 暗黑模式设置 -->
    <wd-card class="setting-section">
      <view class="section-header">
        <wd-icon name="moon" size="20" :color="theme === 'dark' ? '#FFD700' : '#666'" />
        <text class="section-title">外观模式</text>
      </view>
      <wd-cell title="暗黑模式" :value="theme === 'dark' ? '已开启' : '已关闭'">
        <wd-switch :model-value="theme === 'dark'" @change="handleToggleDarkMode" />
      </wd-cell>
    </wd-card>

    <!-- 主题色设置 -->
    <wd-card class="setting-section">
      <view class="section-header">
        <wd-icon name="palette" size="20" color="#666" />
        <text class="section-title">主题色彩</text>
      </view>

      <!-- 预设颜色选择 -->
      <view class="color-section">
        <text class="color-label">预设主题色</text>
        <view class="color-grid">
          <view
            v-for="(color, index) in themeColorOptions"
            :key="index"
            class="color-item"
            :class="{ active: currentThemeColor === color.primary }"
            @click="handleSelectColor(color)"
          >
            <view
              class="color-preview"
              :style="{
                backgroundColor: color.primary,
                border:
                  currentThemeColor === color.primary ? '3px solid #fff' : '1px solid #e0e0e0',
              }"
            >
              <text v-if="currentThemeColor === color.primary" class="check-icon">✓</text>
            </view>
            <text class="color-name">{{ color.name }}</text>
          </view>
        </view>
      </view>

      <!-- 当前主题色显示 -->
      <view class="current-theme-section">
        <view class="current-theme-item">
          <text class="current-theme-label">当前主题色</text>
          <view class="current-theme-value">
            <view
              class="current-color-preview"
              :style="{ backgroundColor: currentThemeColor }"
            ></view>
            <text class="current-color-text">{{ currentThemeColor }}</text>
          </view>
        </view>
      </view>

      <!-- 自定义颜色 -->
      <wd-cell title="自定义颜色" is-link @click="showCustomInput">
        <wd-icon name="edit" size="16" color="#999" />
      </wd-cell>
    </wd-card>

    <!-- 预览区域 -->
    <wd-card class="setting-section">
      <view class="section-header">
        <wd-icon name="eye" size="20" color="#666" />
        <text class="section-title">效果预览</text>
      </view>

      <wd-divider />

      <wd-grid :column="2" border>
        <wd-grid-item>
          <wd-button type="primary" size="small">主要按钮</wd-button>
        </wd-grid-item>
        <wd-grid-item>
          <text class="preview-text" :style="{ color: currentThemeColor }">主题色文本</text>
        </wd-grid-item>
        <wd-grid-item>
          <view class="preview-border" :style="{ borderColor: currentThemeColor }">主题色边框</view>
        </wd-grid-item>
        <wd-grid-item>
          <wd-tag type="primary" size="small">标签</wd-tag>
        </wd-grid-item>
      </wd-grid>
    </wd-card>

    <!-- 操作按钮 -->
    <wd-card class="action-section">
      <wd-button type="info" size="large" block @click="handleResetTheme">重置为默认主题</wd-button>
    </wd-card>

    <!-- 自定义颜色输入弹窗 -->
    <wd-popup v-model="showCustomColorInput" position="bottom" :safe-area-inset-bottom="true">
      <view class="custom-color-popup">
        <view class="popup-header">
          <text class="popup-title">自定义主题色</text>
          <wd-icon name="close" size="20" color="#999" @click="showCustomColorInput = false" />
        </view>

        <wd-divider />

        <view class="color-input-section">
          <view class="input-label">请输入十六进制颜色值</view>
          <view class="input-container">
            <view class="color-preview-small" :style="{ backgroundColor: customColor }"></view>
            <wd-input
              v-model="customColor"
              placeholder="例如: #165DFF"
              :maxlength="7"
              class="color-input"
            />
          </view>
          <view class="input-tip">支持格式：#RGB 或 #RRGGBB</view>
        </view>

        <wd-divider />

        <view class="popup-actions">
          <wd-button type="info" size="large" @click="showCustomColorInput = false">取消</wd-button>
          <wd-button type="primary" size="large" @click="applyCustomColor">应用</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { useTheme, themeColorOptions } from "@/composables/useTheme";

const { theme, themeVars, toggleTheme, selectThemeColor } = useTheme();

// 自定义颜色输入
const customColor = ref("");
const showCustomColorInput = ref(false);

// 当前选中的主题色
const currentThemeColor = computed(() => {
  return themeVars.colorTheme || themeColorOptions[0].primary;
});

// 选择预设颜色
const handleSelectColor = (color: (typeof themeColorOptions)[0]) => {
  selectThemeColor(color);
  customColor.value = color.primary;

  // 提示
  uni.showToast({
    title: "主题色已更新",
    icon: "success",
    duration: 1500,
  });
};

// 显示自定义颜色输入
const showCustomInput = () => {
  showCustomColorInput.value = true;
  customColor.value = currentThemeColor.value;
};

// 应用自定义颜色
const applyCustomColor = () => {
  // 验证颜色格式
  const colorRegex = /^#([0-9A-F]{6}|[0-9A-F]{3})$/i;
  if (!colorRegex.test(customColor.value)) {
    uni.showToast({
      title: "请输入有效的颜色值",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  // 转换3位颜色值为6位
  let color = customColor.value;
  if (color.length === 4) {
    color = "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  // 创建自定义主题色选项
  const customColorOption = {
    name: "自定义",
    value: "custom",
    primary: color,
  };

  selectThemeColor(customColorOption);
  showCustomColorInput.value = false;

  // 提示
  uni.showToast({
    title: "自定义主题色已应用",
    icon: "success",
    duration: 1500,
  });
};

// 重置为默认主题
const handleResetTheme = () => {
  uni.showModal({
    title: "确认重置",
    content: "确定要重置为默认主题吗？",
    success: (res) => {
      if (res.confirm) {
        selectThemeColor(themeColorOptions[0]);
        customColor.value = themeColorOptions[0].primary;

        uni.showToast({
          title: "已重置为默认主题",
          icon: "success",
          duration: 1500,
        });
      }
    },
  });
};

// 切换暗黑模式
const handleToggleDarkMode = () => {
  toggleTheme();
  nextTick(() => {
    uni.showToast({
      title: `已切换到${theme.value === "dark" ? "暗黑" : "浅色"}模式`,
      icon: "success",
      duration: 1500,
    });
  });
};

onLoad(() => {
  // 初始化自定义颜色输入框
  customColor.value = currentThemeColor.value;
});

onMounted(() => {
  // 初始化自定义颜色输入框
  customColor.value = currentThemeColor.value;
});

// 页面显示时确保主题色同步
onShow(() => {
  customColor.value = currentThemeColor.value;
  console.log("主题设置页面显示，当前主题:", {
    mode: theme.value,
    color: currentThemeColor.value,
  });
});
</script>

<style lang="scss" scoped>
.theme-settings-container {
  min-height: 100vh;
  padding: 20rpx;
  background-color: var(--wot-color-bg-light, #f8f9fa);
  transition: background-color 0.3s ease;

  // 强制 Wot 组件应用暗黑模式样式
  :deep(.wd-card) {
    background: var(--wot-card-bg-color, #fff);
    border-radius: 16rpx;
    box-shadow: var(--wot-card-shadow, 0 2rpx 12rpx rgba(0, 0, 0, 0.05));
    transition: background-color 0.3s ease;
  }

  :deep(.wd-cell) {
    color: var(--wot-color-text, #333);
    background-color: var(--wot-card-bg-color, #fff);

    .wd-cell__title {
      color: var(--wot-color-text, #333) !important;
    }

    .wd-cell__value {
      color: var(--wot-color-text-secondary, #666) !important;
    }

    .wd-cell__right-icon {
      color: var(--wot-color-text-secondary, #999) !important;
    }
  }

  :deep(.wd-grid-item) {
    color: var(--wot-color-text, #333) !important;
    background-color: var(--wot-card-bg-color, #fff) !important;
  }

  // 专门为颜色预览块重置背景色
  :deep(.color-item) {
    background-color: transparent !important;

    .color-preview {
      background-color: inherit !important;
    }
  }

  :deep(.wd-button) {
    &[type="primary"] {
      color: #fff !important;
      background-color: var(--wot-color-theme, #165dff) !important;
    }

    &[type="info"] {
      color: #fff !important;
      background-color: var(--wot-color-info, #909399) !important;
    }
  }

  :deep(.wd-input) {
    color: var(--wot-color-text, #333) !important;
    background-color: var(--wot-card-bg-color, #fff) !important;
  }

  :deep(.wd-popup) {
    background-color: var(--wot-popup-bg-color, #fff) !important;
  }

  .custom-color-popup {
    padding: 40rpx 30rpx;
    background: var(--wot-popup-bg-color, #fff);
    border-radius: 20rpx 20rpx 0 0;
  }
}

.page-header {
  padding: 40rpx 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
  background: linear-gradient(135deg, var(--wot-color-theme, #165dff) 0%, #667eea 100%);
  border-radius: 16rpx;
}

.page-title {
  display: block;
  margin-bottom: 10rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.page-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.setting-section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid var(--wot-color-border, #f0f0f0);
}

.section-title {
  margin-left: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--wot-color-text, #333);
}

.color-section {
  padding: 30rpx;
}

.color-label {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: var(--wot-color-text-secondary, #666);
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: space-between;
}

.color-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(25% - 15rpx);
  padding: 10rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  .color-preview {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    margin-bottom: 8rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .check-icon {
    font-size: 24rpx;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
  }

  .color-name {
    font-size: 22rpx;
    line-height: 1.2;
    color: var(--wot-color-text-secondary, #666);
    text-align: center;
  }

  &.active .color-preview {
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }

  &:active .color-preview {
    transform: scale(0.95);
  }
}

.current-theme-section {
  padding: 30rpx;
}

.current-theme-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-theme-label {
  font-size: 28rpx;
  color: var(--wot-color-text-secondary, #666);
}

.current-theme-value {
  display: flex;
  align-items: center;
}

.current-color-preview {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid var(--wot-color-border, #f0f0f0);
  border-radius: 8rpx;
}

.current-color-text {
  margin-left: 10rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.preview-text {
  font-size: 28rpx;
  font-weight: 500;
}

.preview-border {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 60rpx;
  font-size: 26rpx;
  color: var(--wot-color-text-secondary, #666);
  border: 2rpx solid;
  border-radius: 8rpx;
}

.action-section {
  :deep(.wd-card) {
    padding: 30rpx;
    background: var(--wot-card-bg-color, #fff);
    border-radius: 16rpx;
    box-shadow: var(--wot-card-shadow, 0 2rpx 12rpx rgba(0, 0, 0, 0.05));
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--wot-color-text, #333);
}

.color-input-section {
  margin-bottom: 40rpx;
}

.input-label {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: var(--wot-color-text-secondary, #666);
}

.input-container {
  display: flex;
  gap: 20rpx;
  align-items: center;
  margin-bottom: 10rpx;
}

.color-preview-small {
  flex-shrink: 0;
  width: 60rpx;
  height: 60rpx;
  border: 2rpx solid var(--wot-color-border, #f0f0f0);
  border-radius: 8rpx;
}

.color-input {
  flex: 1;
}

.input-tip {
  margin-left: 80rpx;
  font-size: 24rpx;
  color: var(--wot-color-text-placeholder, #999);
}

.popup-actions {
  display: flex;
  gap: 20rpx;
}

/* 响应式布局 */
@media (max-width: 750rpx) {
  .color-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600rpx) {
  .color-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// 全局暗黑模式适配（针对当前页面）
:global([data-theme="dark"]) .theme-settings-container {
  color: var(--wot-color-text, #fff) !important;
  background-color: var(--wot-color-bg, #1a1a1a) !important;

  .page-header {
    background: linear-gradient(135deg, var(--wot-color-theme, #165dff) 0%, #4a5568 100%);
  }

  .section-title {
    color: var(--wot-color-text, #fff) !important;
  }

  .color-label {
    color: var(--wot-color-text-secondary, #d1d5db) !important;
  }

  .preview-text {
    color: var(--wot-color-text, #fff) !important;
  }

  .preview-border {
    color: var(--wot-color-text-secondary, #d1d5db) !important;
  }

  .popup-title {
    color: var(--wot-color-text, #fff) !important;
  }

  .input-label {
    color: var(--wot-color-text-secondary, #d1d5db) !important;
  }

  .input-tip {
    color: var(--wot-color-text-placeholder, #9ca3af) !important;
  }

  :deep(.wd-card) {
    background: var(--wot-card-bg-color, #2a2a2a) !important;
  }

  :deep(.wd-cell) {
    color: var(--wot-color-text, #fff) !important;
    background-color: var(--wot-card-bg-color, #2a2a2a) !important;

    .wd-cell__title {
      color: var(--wot-color-text, #fff) !important;
    }

    .wd-cell__value {
      color: var(--wot-color-text-secondary, #d1d5db) !important;
    }

    .wd-cell__right-icon {
      color: var(--wot-color-text-secondary, #9ca3af) !important;
    }
  }

  :deep(.wd-grid-item) {
    color: var(--wot-color-text, #fff) !important;
    background-color: var(--wot-card-bg-color, #2a2a2a) !important;
  }

  // 专门为颜色预览块重置背景色
  :deep(.color-item) {
    background-color: transparent !important;
  }

  :deep(.wd-input) {
    color: var(--wot-color-text, #fff) !important;
    background-color: var(--wot-card-bg-color, #2a2a2a) !important;
  }

  :deep(.wd-popup) {
    background-color: var(--wot-popup-bg-color, #2a2a2a) !important;
  }

  .custom-color-popup {
    background: var(--wot-popup-bg-color, #2a2a2a) !important;
  }
}
</style>
