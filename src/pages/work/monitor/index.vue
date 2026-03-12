<template>
  <view class="page">
    <web-view :src="monitorUrl" />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

// SpringBoot Admin 监控地址
const monitorUrl = ref("http://localhost:9090/wallboard");
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;
}
</style>

<route lang="json">
{
  "name": "monitor",
  "style": { "navigationBarTitleText": "应用监控" }
}
</route>
