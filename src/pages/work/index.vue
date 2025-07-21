<template>
  <view class="app-container">
    <wd-navbar title="设置" left-arrow @click-left="handleBack" />

    <wd-status-tip type="search" tip="建设中..." />
  </view>
</template>

<script setup lang="ts">
const handleBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss"></style>
