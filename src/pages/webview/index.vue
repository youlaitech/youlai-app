<template>
  <view class="page">
    <web-view :src="url" />
  </view>
</template>

<script setup lang="ts">
definePage({
  name: "webview",
  style: { navigationBarTitleText: "网页" },
});

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


