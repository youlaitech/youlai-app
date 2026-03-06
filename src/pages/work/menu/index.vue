<template>
  <view class="page">
    <wd-cell-group border>
      <wd-cell title="菜单管理" is-link to="/pages/work/menu/index" />
    </wd-cell-group>
    <view class="placeholder">
      <text class="placeholder__text">菜单管理功能开发中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<route lang="json">
{
  "name": "menu",
  "style": { "navigationBarTitleText": "菜单管理" }
}
</route>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;

  &__text {
    font-size: 14px;
    color: #94a3b8;
  }
}
</style>
