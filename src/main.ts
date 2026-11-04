import { createSSRApp } from "vue";
import App from "./App.vue";

import "uno.css";
import "@/styles/index.scss";

import { setupPinia, useUserStore } from "@/store";
import { setUnauthorizedHandler, setRefreshHandler } from "@/utils/request";

/**
 * 创建应用并注册会话处理回调
 */
export function createApp() {
  const app = createSSRApp(App);

  setupPinia(app);
  // 注册会话失效回调：401 时由 store 统一清理内存与持久化登录态
  setUnauthorizedHandler(() => useUserStore().resetSession());
  setRefreshHandler(() => useUserStore().refreshTokenOnce());

  return {
    app,
  };
}
