<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";

const { initTheme, toggleTheme } = useTheme();

onLaunch(() => {
  // 应用启动时初始化主题
  initTheme();

  // 监听系统主题变化
  uni.onThemeChange((res) => {
    toggleTheme(res.theme);
  });
});

onShow(() => {
  // 应用显示时确保主题同步
  initTheme();
});
</script>
