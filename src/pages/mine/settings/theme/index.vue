<template>
  <view class="page-container dark:text-[var(--wot-color-text)]">
    <!-- 暗黑模式设置 -->
    <wd-card custom-class="mx-30rpx my-20rpx">
      <template #header>
        <view class="flex-start">
          <wd-icon name="moon" size="20" />
          <text class="ml-12rpx text-28rpx font-600">外观模式</text>
        </view>
      </template>

      <wd-cell title="暗黑模式" :value="isDarkMode ? '已开启' : '已关闭'">
        <wd-switch :model-value="isDarkMode" @change="handleToggleDarkMode" />
      </wd-cell>
    </wd-card>

    <!-- 主题色设置 -->
    <wd-card custom-class="mx-30rpx my-20rpx">
      <template #header>
        <view class="flex-start">
          <wd-icon name="palette" size="20" />
          <text class="ml-12rpx text-28rpx font-600">主题色彩</text>
        </view>
      </template>

      <!-- 预设颜色选择 -->
      <view class="theme-colors">
        <view class="theme-colors__label">预设主题色</view>
        <wd-grid :column="3" border>
          <wd-grid-item
            v-for="(color, index) in themeColorOptions"
            :key="index"
            @click="handleSelectColor(color)"
          >
            <view class="theme-colors__item">
              <view
                class="theme-colors__preview"
                :class="{ 'theme-colors__preview--active': currentThemeColor === color.primary }"
                :style="{ backgroundColor: color.primary }"
              >
                <text v-if="currentThemeColor === color.primary" class="theme-colors__check">
                  ✓
                </text>
              </view>
              <text class="theme-colors__name">{{ color.name }}</text>
            </view>
          </wd-grid-item>
        </wd-grid>
      </view>

      <!-- 当前主题色显示 -->
      <view class="current-theme">
        <view class="current-theme__item">
          <view class="current-theme__info">
            <view
              class="current-theme__preview"
              :style="{ backgroundColor: currentThemeColor }"
            ></view>
            <text class="current-theme__label">当前主题色</text>
          </view>
          <text class="current-theme__value">{{ currentThemeColor }}</text>
        </view>
      </view>

      <!-- 自定义颜色 -->
      <wd-cell title="自定义颜色" is-link @click="showCustomInput">
        <template #icon>
          <wd-icon name="edit" size="16" />
        </template>
      </wd-cell>
    </wd-card>

    <!-- 效果预览 -->
    <wd-card title="效果预览" custom-class="mx-30rpx my-20rpx">
      <wd-grid :column="3" border>
        <wd-grid-item>
          <view class="flex-col-center py-20rpx">
            <wd-button type="primary" size="small">主要按钮</wd-button>
          </view>
        </wd-grid-item>
        <wd-grid-item>
          <view class="flex-col-center py-20rpx">
            <text class="text-28rpx font-500" :style="{ color: currentThemeColor }">
              主题色文本
            </text>
          </view>
        </wd-grid-item>
        <wd-grid-item>
          <view class="flex-col-center py-20rpx">
            <wd-tag type="primary" size="small">标签</wd-tag>
          </view>
        </wd-grid-item>
      </wd-grid>
    </wd-card>

    <!-- 操作按钮 -->
    <view class="p-30rpx">
      <wd-button type="info" size="large" block @click="handleResetTheme">重置为默认主题</wd-button>
    </view>

    <!-- 自定义颜色输入弹窗 -->
    <wd-popup v-model="showCustomColorInput" position="bottom" :safe-area-inset-bottom="true">
      <view class="custom-color-popup">
        <view class="custom-color-popup__header">
          <text class="custom-color-popup__title">自定义主题色</text>
          <wd-icon name="close" size="20" @click="showCustomColorInput = false" />
        </view>

        <view class="custom-color-popup__content">
          <text class="custom-color-popup__label">请输入十六进制颜色值</text>
          <view class="custom-color-popup__input-row">
            <view
              class="custom-color-popup__preview"
              :style="{ backgroundColor: customColor || '#FF4757' }"
            ></view>
            <wd-input
              v-model="customColor"
              placeholder="例如: #FF4757"
              :maxlength="7"
              custom-class="custom-color-popup__input"
            />
          </view>
          <text class="custom-color-popup__tip">支持格式：#RGB 或 #RRGGBB</text>
        </view>

        <view class="custom-color-popup__actions">
          <wd-button type="info" size="large" @click="showCustomColorInput = false">取消</wd-button>
          <wd-button type="primary" size="large" @click="applyCustomColor">应用</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { useTheme } from "@/composables/useTheme";

// 使用主题组合函数
const { isDark, themeVars, themeColorOptions, toggleTheme, setThemeColor } = useTheme();

// 创建响应式的计算属性
const isDarkMode = computed(() => isDark.value);

// 自定义颜色输入
const customColor = ref("");
const showCustomColorInput = ref(false);

// 当前选中的主题色
const currentThemeColor = computed(() => {
  return themeVars.value.colorTheme || themeColorOptions[0].primary;
});

// 选择预设颜色
const handleSelectColor = (color: (typeof themeColorOptions)[0]) => {
  setThemeColor(color);
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

  setThemeColor(customColorOption);
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
        setThemeColor(themeColorOptions[0]);
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
      title: `已切换到${isDarkMode.value ? "暗黑" : "浅色"}模式`,
      icon: "success",
      duration: 1500,
    });
  });
};

onLoad(() => {
  customColor.value = currentThemeColor.value;
});

onMounted(() => {
  customColor.value = currentThemeColor.value;
});

// 页面显示时确保主题色同步
onShow(() => {
  customColor.value = currentThemeColor.value;
});
</script>

<route lang="json">
{
  "name": "theme",
  "style": {
    "navigationBarTitleText": "主题设置"
  }
}
</route>

<style lang="scss" scoped>
// 主题颜色选择区域
.theme-colors {
  padding: 30rpx;

  &__label {
    display: block;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: var(--wot-color-text-secondary);
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10rpx;
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    margin-bottom: 8rpx;
    border: 2rpx solid var(--wot-color-border);
    border-radius: 12rpx;
    transition: all 0.3s ease;

    &--active {
      border-color: var(--wot-color-theme);
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
      transform: scale(1.05);
    }
  }

  &__check {
    font-size: 24rpx;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
  }

  &__name {
    font-size: 22rpx;
    color: var(--wot-color-text-secondary);
    text-align: center;
  }
}

// 当前主题色显示区域
.current-theme {
  padding: 30rpx;
  border-bottom: 1rpx solid var(--wot-color-border);

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__info {
    display: flex;
    align-items: center;
  }

  &__preview {
    width: 40rpx;
    height: 40rpx;
    margin-right: 12rpx;
    border: 2rpx solid var(--wot-color-border);
    border-radius: 8rpx;
  }

  &__label {
    font-size: 28rpx;
    color: var(--wot-color-text);
  }

  &__value {
    font-size: 28rpx;
    font-weight: 500;
    color: var(--wot-color-text-secondary);
  }
}

// 自定义颜色弹窗
.custom-color-popup {
  min-height: 400rpx;
  background-color: var(--wot-color-bg);
  border-radius: 20rpx 20rpx 0 0;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid var(--wot-color-border);
  }

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--wot-color-text);
  }

  &__content {
    padding: 40rpx 30rpx;
  }

  &__label {
    display: block;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: var(--wot-color-text);
  }

  &__input-row {
    display: flex;
    gap: 20rpx;
    align-items: center;
    margin-bottom: 20rpx;
  }

  &__preview {
    flex-shrink: 0;
    width: 60rpx;
    height: 60rpx;
    border: 2rpx solid var(--wot-color-border);
    border-radius: 8rpx;
  }

  &__input {
    flex: 1;
  }

  &__tip {
    font-size: 24rpx;
    color: var(--wot-color-text-placeholder);
  }

  &__actions {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 30rpx 30rpx;
    border-top: 1rpx solid var(--wot-color-border);
  }
}
</style>
