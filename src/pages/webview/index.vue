<template>
  <view class="page">
    <web-view :src="url" />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const url = ref("");

onLoad((query: any) => {
  if (query.url) {
    url.value = decodeURIComponent(query.url);
  }
});
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;
}
</style>

<route lang="json">
{
  "name": "webview",
  "style": { "navigationBarTitleText": "网页" }
}
</route>
