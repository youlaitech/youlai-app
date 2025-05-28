<template>
  <view class="theme-settings-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">主题设置</text>
      <text class="page-subtitle">个性化您的应用外观</text>
    </view>

    <!-- 暗黑模式设置 -->
    <view class="setting-section">
      <view class="section-header">
        <wd-icon name="moon" size="20" :color="isDark ? '#FFD700' : '#666'" />
        <text class="section-title">外观模式</text>
      </view>
      <wd-cell title="暗黑模式" :value="isDark ? '已开启' : '已关闭'">
        <wd-switch v-model="isDark" @change="toggleDarkMode" />
      </wd-cell>
    </view>

    <!-- 主题色设置 -->
    <view class="setting-section">
      <view class="section-header">
        <wd-icon name="palette" size="20" color="#666" />
        <text class="section-title">主题色彩</text>
      </view>

      <!-- 预设颜色选择 -->
      <view class="color-section">
        <view class="color-label">预设主题色</view>
        <view class="color-grid">
          <view
            v-for="(color, index) in extendedThemeColors"
            :key="index"
            class="color-item"
            :class="{ active: currentThemeColor === color.value }"
            :style="{ backgroundColor: color.value }"
            @click="handleSelectColor(color.value)"
          >
            <wd-icon v-if="currentThemeColor === color.value" name="check" color="#fff" size="16" />
          </view>
        </view>
      </view>

      <!-- 当前主题色显示 -->
      <wd-cell title="当前主题色" :value="currentThemeColor">
        <view class="current-color-preview" :style="{ backgroundColor: currentThemeColor }"></view>
      </wd-cell>

      <!-- 自定义颜色 -->
      <wd-cell title="自定义颜色" is-link @click="showCustomInput">
        <wd-icon name="edit" size="16" color="#999" />
      </wd-cell>
    </view>

    <!-- 预览区域 -->
    <view class="setting-section">
      <view class="section-header">
        <wd-icon name="eye" size="20" color="#666" />
        <text class="section-title">效果预览</text>
      </view>

      <view class="preview-container">
        <view class="preview-item">
          <wd-button type="primary" size="small">主要按钮</wd-button>
        </view>
        <view class="preview-item">
          <text class="preview-text" :style="{ color: currentThemeColor }">主题色文本</text>
        </view>
        <view class="preview-item">
          <view class="preview-border" :style="{ borderColor: currentThemeColor }">主题色边框</view>
        </view>
        <view class="preview-item">
          <wd-tag type="primary" size="small">标签</wd-tag>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <wd-button type="info" size="large" block @click="resetTheme">重置为默认主题</wd-button>
    </view>

    <!-- 自定义颜色输入弹窗 -->
    <wd-popup v-model="showCustomColorInput" position="bottom" :safe-area-inset-bottom="true">
      <view class="custom-color-popup">
        <view class="popup-header">
          <text class="popup-title">自定义主题色</text>
          <wd-icon name="close" size="20" color="#999" @click="showCustomColorInput = false" />
        </view>

        <view class="color-input-section">
          <view class="input-label">请输入十六进制颜色值</view>
          <view class="input-container">
            <view class="color-preview-small" :style="{ backgroundColor: customColor }"></view>
            <input
              v-model="customColor"
              type="text"
              placeholder="例如: #165DFF"
              class="color-input"
              maxlength="7"
            />
          </view>
          <view class="input-tip">支持格式：#RGB 或 #RRGGBB</view>
        </view>

        <view class="popup-actions">
          <wd-button type="info" size="large" @click="showCustomColorInput = false">取消</wd-button>
          <wd-button type="primary" size="large" @click="applyCustomColor">应用</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useTheme } from "@/composables/useTheme";
import { useThemeStore } from "@/store/modules/theme.store";
import { applyThemeOnPageShow } from "@/utils/theme";
import { ref, computed, watch, onMounted } from "vue";

const { toggleTheme, themeVars, themeState, setThemeColor } = useTheme();
const themeStore = useThemeStore();

// 暗黑模式状态
const isDark = ref(false);

// 自定义颜色输入
const customColor = ref("");
const showCustomColorInput = ref(false);

// 扩展的预设主题色
const extendedThemeColors = [
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

// 当前选中的主题色
const currentThemeColor = computed(() => {
  return themeVars.value.colorTheme || themeStore.primaryColor || extendedThemeColors[0].value;
});

// 监听暗黑模式变化
watch(themeState, (newTheme) => {
  isDark.value = newTheme === "dark";
});

// 暗黑模式切换
const toggleDarkMode = () => {
  toggleTheme();
};

// 选择预设颜色
const handleSelectColor = (color: string) => {
  // 同时更新两个store的主题色
  if (setThemeColor) {
    setThemeColor(color);
  } else {
    themeVars.value.colorTheme = color;
  }
  themeStore.setPrimaryColor(color);
  customColor.value = color;

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

  // 同时更新两个store的主题色
  if (setThemeColor) {
    setThemeColor(color);
  } else {
    themeVars.value.colorTheme = color;
  }
  themeStore.setPrimaryColor(color);
  showCustomColorInput.value = false;

  // 提示
  uni.showToast({
    title: "自定义主题色已应用",
    icon: "success",
    duration: 1500,
  });
};

// 重置为默认主题
const resetTheme = () => {
  uni.showModal({
    title: "确认重置",
    content: "确定要重置为默认主题吗？",
    success: (res) => {
      if (res.confirm) {
        const defaultColor = extendedThemeColors[0].value;

        // 同时更新两个store的主题色
        if (setThemeColor) {
          setThemeColor(defaultColor);
        } else {
          themeVars.value.colorTheme = defaultColor;
        }
        themeStore.setPrimaryColor(defaultColor);
        customColor.value = defaultColor;

        // 重置为浅色模式
        if (themeState.value === "dark") {
          toggleTheme();
        }

        uni.showToast({
          title: "已重置为默认主题",
          icon: "success",
          duration: 1500,
        });
      }
    },
  });
};

onLoad(() => {
  // 初始化自定义颜色输入框
  customColor.value = currentThemeColor.value;
});

onMounted(() => {
  // 初始化暗黑模式状态
  isDark.value = themeState.value === "dark";
  customColor.value = currentThemeColor.value;
});

// 页面显示时重新应用主题（解决小程序环境问题）
onShow(() => {
  // 在小程序环境中，页面显示时重新应用主题
  if (typeof document === "undefined") {
    applyThemeOnPageShow(currentThemeColor.value);

    // 为了确保样式应用，我们可以在页面中设置内联样式
    // 这样可以绕过小程序的CSS变量限制
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage) {
      console.log("当前页面重新应用主题色");
    }
  }
});
</script>

<style lang="scss" scoped>
.theme-settings-container {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f9fa;
  transition: background-color 0.3s ease;
}

.page-header {
  padding: 40rpx 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
  background: linear-gradient(135deg, #165dff 0%, #667eea 100%);
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
  overflow: hidden;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  margin-left: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.color-section {
  padding: 30rpx;
}

.color-label {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #666;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.color-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  cursor: pointer;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.color-item.active {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.color-item:active {
  transform: scale(0.95);
}

.current-color-preview {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 8rpx;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 30rpx;
}

.preview-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
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
  color: #666;
  border: 2rpx solid;
  border-radius: 8rpx;
}

.action-section {
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.custom-color-popup {
  padding: 40rpx 30rpx;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
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
  color: #333;
}

.color-input-section {
  margin-bottom: 40rpx;
}

.input-label {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #666;
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
  border: 2rpx solid #f0f0f0;
  border-radius: 8rpx;
}

.color-input {
  flex: 1;
  height: 60rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
}

.color-input:focus {
  border-color: #165dff;
}

.input-tip {
  margin-left: 80rpx;
  font-size: 24rpx;
  color: #999;
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

/* 暗黑模式适配 */
:deep(.wd-config-provider[data-theme="dark"]) {
  .theme-settings-container {
    background-color: #1a1a1a;
  }

  .setting-section {
    background: #2a2a2a;

    .section-header {
      border-bottom-color: #404040;

      .section-title {
        color: #fff;
      }
    }
  }

  .preview-container .preview-item {
    background: #404040;
  }

  .action-section {
    background: #2a2a2a;
  }

  .custom-color-popup {
    background: #2a2a2a;

    .popup-title {
      color: #fff;
    }

    .input-label {
      color: #ccc;
    }

    .color-input {
      color: #fff;
      background: #404040;
      border-color: #606060;

      &:focus {
        border-color: #165dff;
      }
    }
  }
}
</style>
