<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useTheme } from "@/composables/useTheme";

// 使用主题 composable
const { initTheme } = useTheme();

onLaunch(() => {
  console.log("App Launch");
  // 初始化主题
  initTheme();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">
/* 导入暗黑模式修复样式 */
@import "./styles/dark-mode-fix';";
</style>
