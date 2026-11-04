<template>
  <web-view :src="monitorUrl" />
</template>

<script setup lang="ts">
definePage({
  name: "monitor",
  style: { navigationBarTitleText: "应用监控" },
  layout: "blank",
});
// SpringBoot Admin 监控地址，可用 VITE_APP_MONITOR_URL 覆盖
const monitorUrl = import.meta.env.VITE_APP_MONITOR_URL || "http://localhost:9090/wallboard";
</script>
