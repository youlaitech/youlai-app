<template>
  <view class="theme-settings-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">主题设置</text>
      <text class="page-subtitle">个性化您的应用外观</text>
    </view>

    <!-- 暗黑模式设置 -->
    <wd-card custom-class="setting-card">
      <view class="setting-item">
        <view class="setting-info">
          <wd-icon name="moon" size="20" :color="currentThemeColor" />
          <text class="setting-label">暗黑模式</text>
        </view>
        <wd-switch :model-value="theme === 'dark'" @change="toggleTheme" />
      </view>
    </wd-card>

    <!-- 主题色选择 -->
    <wd-card custom-class="setting-card">
      <view class="setting-header">
        <wd-icon name="palette" size="20" :color="currentThemeColor" />
        <text class="setting-title">主题色</text>
      </view>

      <view class="color-grid">
        <view
          v-for="item in colorColumns"
          :key="item.value"
          class="color-item"
          :class="{ active: currentThemeColor === item.value }"
          @click="setThemeColor(item.value)"
        >
          <view class="color-box" :style="{ backgroundColor: item.value }">
            <wd-icon v-if="currentThemeColor === item.value" name="check" size="16" color="#fff" />
          </view>
          <text class="color-label">{{ item.label }}</text>
        </view>
      </view>
    </wd-card>

    <!-- 自定义颜色 -->
    <wd-card custom-class="setting-card">
      <view class="setting-item" @click="showCustomColorPopup = true">
        <view class="setting-info">
          <wd-icon name="edit" size="20" :color="currentThemeColor" />
          <text class="setting-label">自定义颜色</text>
        </view>
        <view class="custom-color-preview">
          <view class="color-box small" :style="{ backgroundColor: currentThemeColor }"></view>
          <text class="color-value">{{ currentThemeColor }}</text>
          <wd-icon name="arrow-right" size="14" color="#999" />
        </view>
      </view>
    </wd-card>

    <!-- 预览效果 -->
    <wd-card custom-class="setting-card">
      <view class="preview-section">
        <text class="preview-title">预览效果</text>
        <view class="preview-items">
          <wd-button type="primary" size="small">主要按钮</wd-button>
          <wd-button type="primary" plain size="small">次要按钮</wd-button>
          <wd-tag type="primary">标签</wd-tag>
        </view>
      </view>
    </wd-card>

    <!-- 重置按钮 -->
    <view class="action-buttons">
      <wd-button block @click="handleReset">恢复默认</wd-button>
    </view>

    <!-- 自定义颜色弹窗 -->
    <wd-popup v-model="showCustomColorPopup" position="bottom" closeable>
      <view class="custom-color-popup">
        <view class="popup-header">
          <text class="popup-title">自定义主题色</text>
        </view>

        <view class="color-input-section">
          <view class="color-preview-large" :style="{ backgroundColor: customColor }"></view>
          <wd-input v-model="customColor" placeholder="请输入颜色值，如 #FF6B6B" clearable />
          <text class="input-tip">支持 HEX 格式颜色值</text>
        </view>

        <view class="popup-actions">
          <wd-button type="info" block @click="showCustomColorPopup = false">取消</wd-button>
          <wd-button type="primary" block @click="applyCustomColor">应用</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useTheme } from "@/composables/useTheme";

const { theme, currentThemeColor, colorColumns, toggleTheme, setThemeColor, resetTheme } =
  useTheme();

// 自定义颜色相关
const showCustomColorPopup = ref(false);
const customColor = ref(currentThemeColor.value);

// 应用自定义颜色
const applyCustomColor = () => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (!colorRegex.test(customColor.value)) {
    uni.showToast({
      title: "请输入正确的颜色格式",
      icon: "none",
    });
    return;
  }

  setThemeColor(customColor.value);
  showCustomColorPopup.value = false;
  uni.showToast({
    title: "主题色已更新",
    icon: "success",
  });
};

// 重置主题
const handleReset = () => {
  uni.showModal({
    title: "提示",
    content: "确定要恢复默认主题吗？",
    success: (res) => {
      if (res.confirm) {
        resetTheme();
        customColor.value = currentThemeColor.value;
        uni.showToast({
          title: "已恢复默认",
          icon: "success",
        });
      }
    },
  });
};

// 页面显示时更新自定义颜色值
onShow(() => {
  customColor.value = currentThemeColor.value;
});
</script>

<style lang="scss" scoped>
.theme-settings-container {
  min-height: 100vh;
  padding: 20rpx;
  background-color: var(--wot-color-bg-page);
}

.page-header {
  padding: 40rpx 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
  background: linear-gradient(135deg, var(--wot-color-theme) 0%, var(--primary-color-light) 100%);
  border-radius: 16rpx;

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
}

.setting-card {
  margin-bottom: 20rpx;
  background-color: var(--wot-color-bg-container) !important;
  border-radius: 16rpx !important;

  :deep(.wd-card__body) {
    padding: 30rpx !important;
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .setting-info {
    display: flex;
    gap: 20rpx;
    align-items: center;
  }

  .setting-label {
    font-size: 30rpx;
    color: var(--wot-color-text);
  }
}

.setting-header {
  display: flex;
  gap: 20rpx;
  align-items: center;
  margin-bottom: 30rpx;

  .setting-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--wot-color-text);
  }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  align-items: center;
  padding: 10rpx;
  cursor: pointer;

  &.active .color-box {
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
    transform: scale(1.1);
  }

  .color-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    border-radius: 12rpx;
    transition: all 0.3s ease;

    &.small {
      width: 40rpx;
      height: 40rpx;
    }
  }

  .color-label {
    font-size: 22rpx;
    color: var(--wot-color-text-secondary);
  }
}

.custom-color-preview {
  display: flex;
  gap: 15rpx;
  align-items: center;

  .color-value {
    font-size: 26rpx;
    color: var(--wot-color-text-secondary);
  }
}

.preview-section {
  .preview-title {
    display: block;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: var(--wot-color-text-secondary);
  }

  .preview-items {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    align-items: center;
  }
}

.action-buttons {
  padding: 0 20rpx;
  margin-top: 40rpx;
}

.custom-color-popup {
  padding: 40rpx 30rpx;
  background-color: var(--wot-color-bg-container);

  .popup-header {
    margin-bottom: 40rpx;
    text-align: center;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: var(--wot-color-text);
    }
  }

  .color-input-section {
    margin-bottom: 40rpx;

    .color-preview-large {
      width: 100%;
      height: 120rpx;
      margin-bottom: 30rpx;
      border: 2rpx solid var(--wot-color-border);
      border-radius: 16rpx;
    }

    .input-tip {
      display: block;
      margin-top: 15rpx;
      font-size: 24rpx;
      color: var(--wot-color-text-placeholder);
      text-align: center;
    }
  }

  .popup-actions {
    display: flex;
    gap: 20rpx;
  }
}
</style>
