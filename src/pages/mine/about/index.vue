<template>
  <view class="page dark:text-[var(--wot-color-text)]">
    <wd-card>
      <view class="about-header">
        <wd-img
          width="120rpx"
          height="120rpx"
          src="/static/logo.png"
          mode="aspectFit"
          class="about-logo"
        />
        <view class="about-meta">
          <text class="app-title">vue-uniapp-template</text>
          <text class="app-version">版本 {{ version }}</text>
        </view>
      </view>
    </wd-card>

    <!-- 公司信息区域 -->
    <wd-card custom-style="margin-top: 20rpx">
      <view class="company-section">
        <view class="section-title">
          <wd-icon name="company" size="18" />
          <text>有来开源组织</text>
        </view>
        <text class="section-subtitle">专注于快速构建和高效开发的应用解决方案</text>
      </view>
    </wd-card>

    <!-- 项目列表 -->
    <wd-card title="优质项目" custom-style="margin-top: 20rpx">
      <wd-cell-group border>
        <wd-cell title="vue3-element-admin" icon="desktop">
          <view slot="label" class="project-desc">
            基于 Vue3 + Vite7 + TypeScript5 + Element-Plus + Pinia 构建的中后台管理模板
          </view>
        </wd-cell>

        <wd-cell title="vue-uniapp-template" icon="mobile">
          <view slot="label" class="project-desc">
            基于 uni-app + Vue 3 + TypeScript，集成多种工具的移动端应用模板
          </view>
        </wd-cell>

        <wd-cell title="youlai-boot" icon="server">
          <view slot="label" class="project-desc">
            基于 Spring Boot 3 + Vue 3 构建的前后端分离单体权限管理系统
          </view>
        </wd-cell>
      </wd-cell-group>
    </wd-card>

    <!-- 联系方式 -->
    <wd-card title="联系我们" custom-style="margin-top: 20rpx">
      <wd-cell-group border>
        <wd-cell title="官方网站" value="www.youlai.tech" icon="link" />
        <wd-cell title="GitHub" value="github.com/youlaitech" icon="github" />
        <wd-cell title="联系邮箱" value="youlaitech@163.com" icon="mail" />
      </wd-cell-group>
    </wd-card>

    <!-- 底部版权信息 -->
    <view class="about-footer">
      <text class="copyright">Copyright © {{ getYear() }} 有来开源组织</text>
      <text class="copyright copyright-sub">All Rights Reserved</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
const version = ref("1.0.0");
const getYear = () => {
  return new Date().getFullYear();
};

onMounted(() => {
  // #ifdef MP-WEIXIN
  version.value = uni.getSystemInfoSync().appVersion;
  // #endif
});
</script>

<style lang="scss" scoped>
.about-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
}

.about-logo {
  margin-right: 16rpx;
}

.about-meta {
  flex: 1;
}

.app-title {
  display: block;
  margin-bottom: 8rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.app-version {
  font-size: 24rpx;
  color: #6b7280;
}

.company-section {
  padding: 24rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  font-weight: 500;

  :deep(.wd-icon) {
    margin-right: 12rpx;
  }
}

.section-subtitle {
  display: block;
  padding-left: 32rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.project-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.about-footer {
  padding: 32rpx 0;
  text-align: center;
}

.copyright {
  display: block;
  font-size: 24rpx;
  color: #9ca3af;
}

.copyright-sub {
  margin-top: 8rpx;
}
</style>
