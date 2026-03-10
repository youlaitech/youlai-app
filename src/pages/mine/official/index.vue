<template>
  <view class="page dark:text-[var(--wot-color-text)]">
    <view class="page-content">
      <view class="header">
        <image class="logo" src="/static/logo.png" mode="aspectFill" />
        <view class="header-info">
          <view class="title">有来技术</view>
          <view class="sub-title">关注公众号获取更多技术干货</view>
        </view>
      </view>

      <view class="qr-card">
        <image
          class="qr-image"
          src="/static/images/qrcode-official.png"
          mode="widthFix"
          show-menu-by-longpress
        />
        <view class="qr-tip">长按识别二维码关注公众号</view>

        <view class="group-tip">
          如需加入技术交流群，请添加微信 haoxianrui 并备注「前端/后端/全栈」，邀您入群。
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json">
{
  "name": "official",
  "style": {
    "navigationBarTitleText": "有来技术"
  }
}
</route>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.page-content {
  padding: 28rpx;
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
}

.header {
  display: flex;
  gap: 20rpx;
  align-items: center;
  padding: 28rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.logo {
  width: 96rpx;
  height: 96rpx;
  border-radius: 20rpx;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
}

.sub-title {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.group-tip {
  padding: 20rpx;
  margin-top: 20rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #374151;
  background: #f9fafb;
  border-radius: 16rpx;
}

.qr-card {
  padding: 28rpx;
  margin-top: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.qr-image {
  width: 100%;
  border-radius: 16rpx;
}

.qr-tip {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #6b7280;
  text-align: center;
}
</style>
