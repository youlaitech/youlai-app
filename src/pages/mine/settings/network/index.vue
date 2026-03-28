<template>
  <view class="page">
    <view class="page-content dark:text-[var(--wot-color-text)]">
      <view class="flex items-center p-20rpx text-sm mr-10">
        <text class="text-gray-500">温馨提示：点击下方「开始测试」按钮，即可自动检测当前网络延迟。</text>
      </view>
      <view class="p-20rpx">
        <wd-button block plain @click="startTest">开始测试</wd-button>
      </view>
      <view v-if="isTesting" class="flex flex-col-center p-20rpx">
        <wd-loading color="var(--wot-color-theme)" />
        <text class="mt-10rpx text-sm">正在测试中...</text>
      </view>
      <view v-if="result !== null" class="p-20rpx">
        <view class="result-card">
          <view class="result-card__header">测试结果</view>
          <view class="result-card__content">
            <view class="result-card__item">
              <text class="result-card__label">网络延迟</text>
              <text :class="['result-card__value', getStatusClass]">{{ result }}ms</text>
            </view>
            <view class="result-card__item">
              <text class="result-card__label">网络状态</text>
              <text :class="['result-card__status', getStatusClass]">{{ getStatusText }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";

const result = ref<number | null>(null);
const isTesting = ref(false);

const getStatusText = computed(() => {
  if (result.value === null) return "";
  if (result.value < 100) return "优秀";
  if (result.value < 300) return "良好";
  if (result.value < 500) return "一般";
  return "较差";
});

const getStatusClass = computed(() => {
  if (result.value === null) return "";
  if (result.value < 100) return "result-card--success";
  if (result.value < 300) return "result-card--good";
  if (result.value < 500) return "result-card--warning";
  return "result-card--danger";
});

const startTest = async () => {
  isTesting.value = true;
  result.value = null;
  try {
    const startTime = Date.now();
    // #ifdef MP-WEIXIN
    await new Promise<void>((resolve) => {
      wx.request({
        url: "https://www.baidu.com",
        method: "GET",
        success: () => resolve(),
        fail: () => resolve(),
      });
    });
    // #endif
    // #ifdef H5
    await fetch("https://www.baidu.com", { mode: "no-cors" });
    // #endif
    const endTime = Date.now();
    result.value = endTime - startTime;
  } catch {
    result.value = 9999;
  } finally {
    isTesting.value = false;
  }
};

onLoad(() => {
  uni.setNavigationBarTitle({ title: "网络测试" });
});
</script>

<route lang="json">
{
  "name": "network",
  "style": {
    "navigationBarTitleText": "网络测试"
  }
}
</route>

<style lang="scss" scoped>
.text-gray-500 {
  color: var(--color-text-placeholder);
}

.result-card {
  background: var(--color-bg);
  border-radius: 16rpx;
  border: 1px solid var(--color-border);

  &__header {
    padding: 24rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: var(--color-text);
    border-bottom: 1px solid var(--color-border);
  }

  &__content {
    padding: 24rpx;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;

    &:first-child {
      border-bottom: 1px solid var(--color-border-light);
    }
  }

  &__label {
    font-size: 28rpx;
    color: var(--color-text-secondary);
  }

  &__value {
    font-size: 36rpx;
    font-weight: 600;
  }

  &__status {
    font-size: 28rpx;
    font-weight: 500;
  }

  &--success {
    color: var(--color-success);
  }

  &--good {
    color: var(--color-primary);
  }

  &--warning {
    color: var(--color-warning);
  }

  &--danger {
    color: var(--color-danger);
  }
}
</style>
