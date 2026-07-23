<template>
  <view class="qr-confirm">
    <view class="qr-confirm__navbar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="qr-confirm__navbar-bar" :style="{ height: `${navBarHeight}px` }">
        <view class="qr-confirm__navbar-btn" hover-class="qr-confirm__navbar-btn--active" @click="handleBack">
          <text class="qr-confirm__navbar-icon">‹</text>
        </view>
        <text class="qr-confirm__navbar-title">扫码登录确认</text>
        <view class="qr-confirm__navbar-placeholder" />
      </view>
    </view>

    <view class="qr-confirm__body" :style="{ paddingTop: `${statusBarHeight + navBarHeight + 24}px` }">
      <view class="qr-confirm__card">
        <image class="qr-confirm__logo" src="/logo.png" mode="aspectFit" />
        <text class="qr-confirm__tip">PC 端扫码登录</text>
        <text class="qr-confirm__user">{{ scanResult?.nickname || "未知用户" }}</text>
        <text class="qr-confirm__hint">是否确认在 PC 端登录？</text>

        <view class="qr-confirm__actions">
          <wd-button type="error" plain block @click="handleCancel">取消登录</wd-button>
          <wd-button type="primary" block :loading="isLoading" @click="handleConfirm">确认登录</wd-button>
        </view>
      </view>
    </view>

    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";
import { useToast } from "@wot-ui/ui";
import { useUserStore } from "@/store/modules/user";
import type { QrCodeScanResult } from "@/api/auth";

definePage({
  name: "qr-code-confirm",
  style: { navigationStyle: "custom", navigationBarTitleText: "" },
});

const toast = useToast();
const userStore = useUserStore();

// 状态栏高度（px），自定义导航栏按它下压内容避免被遮挡
const statusBarHeight = ref(20);
// 导航栏高度（px），小程序按胶囊按钮尺寸计算，其余平台固定 44
const navBarHeight = ref(44);
// 确认按钮 loading 态，防止连点重复确认
const isLoading = ref(false);
// 从扫码入口经 query 传入的票据
const ticket = ref("");
// scan 接口返回的脱敏用户信息，用于确认页展示
const scanResult = ref<QrCodeScanResult | null>(null);

// 进入页面先标记已扫码，让 PC 端立即显示「已扫码」并展示头像/昵称
const handleScan = async (t: string) => {
  try {
    scanResult.value = await userStore.qrScan(t);
  } catch (error: any) {
    toast.error(error?.message || "二维码无效或已过期");
    setTimeout(() => uni.navigateBack(), 800);
  }
};

// 用户点击「确认登录」：授权 PC 端用该票据换取会话
const handleConfirm = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await userStore.qrConfirm(ticket.value);
    toast.success("已确认登录");
    setTimeout(() => uni.navigateBack(), 800);
  } catch (error: any) {
    toast.error(error?.message || "确认失败");
  } finally {
    isLoading.value = false;
  }
};

// 用户点击「取消登录」：撤回扫码，PC 端状态变为 CANCELED
const handleCancel = async () => {
  try {
    await userStore.qrCancel(ticket.value);
    toast.info("已取消登录");
  } catch {
    // 取消失败不影响返回
  } finally {
    setTimeout(() => uni.navigateBack(), 400);
  }
};

const handleBack = () => uni.navigateBack();

onLoad((options: any) => {
  const t = options?.ticket ? decodeURIComponent(options.ticket) : "";
  if (!t) {
    toast.error("二维码无效");
    setTimeout(() => uni.navigateBack(), 800);
    return;
  }
  ticket.value = t;
  const sys = uni.getSystemInfoSync();
  statusBarHeight.value = sys.statusBarHeight || 20;
  navBarHeight.value = 44;
  // #ifdef MP-WEIXIN
  const menu = uni.getMenuButtonBoundingClientRect();
  navBarHeight.value = menu.height + (menu.top - statusBarHeight.value) * 2;
  // #endif
  handleScan(t);
});
</script>

<style lang="scss" scoped>
.qr-confirm {
  min-height: 100vh;
  background: var(--color-bg);

  &__navbar {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: var(--z-navbar);
    padding: 0 32rpx;
  }

  &__navbar-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__navbar-btn,
  &__navbar-placeholder {
    position: absolute;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    transform: translateY(-50%);
  }

  &__navbar-btn {
    left: 0;
    background: var(--color-glass);
    border: 2rpx solid var(--color-border-glass);
    border-radius: 999rpx;
  }

  &__navbar-icon {
    margin-top: -4rpx;
    font-size: 44rpx;
    color: var(--color-text);
  }

  &__navbar-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--color-text);
  }

  &__navbar-placeholder {
    right: 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 64rpx;
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 64rpx 48rpx;
    background: var(--color-bg);
    border: 2rpx solid var(--color-border-light);
    border-radius: 32rpx;
    box-shadow: 0 20rpx 50rpx -10rpx rgba(0, 0, 0, 0.08);
  }

  &__logo {
    width: 96rpx;
    height: 96rpx;
    margin-bottom: 24rpx;
  }

  &__tip {
    font-size: 28rpx;
    color: var(--color-text-secondary);
  }

  &__user {
    margin: 16rpx 0;
    font-size: 40rpx;
    font-weight: 700;
    color: var(--color-text);
  }

  &__hint {
    margin-bottom: 48rpx;
    font-size: 26rpx;
    color: var(--color-text-placeholder);
  }

  &__actions {
    display: flex;
    gap: 24rpx;
    width: 100%;
  }
}
</style>
