<template>
  <view class="app-container">
    <wd-navbar title="设置" left-arrow @click-left="handleBack" />

    <wd-status-tip type="search" tip="建设中..." />
  </view>
</template>

<route lang="json">
{
  "name": "work",
  "meta": {
    "requireAuth": true,
    "title": "需要登录的页面"
  }
}
</route>

<script setup lang="ts">
const handleBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss"></style>
