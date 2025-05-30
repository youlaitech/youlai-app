import { createSSRApp } from "vue";
import App from "./App.vue";

import "uno.css";
import "@/styles/index.scss";

import { setupStore } from "@/store";
// 可选：导入业务组件
// import BusinessComponents from '@/components/business';

export function createApp() {
  const app = createSSRApp(App);

  setupStore(app);

  // 可选：全局注册业务组件
  // Object.entries(BusinessComponents).forEach(([name, component]) => {
  //   app.component(name, component);
  // });

  return {
    app,
  };
}
