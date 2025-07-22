import { createSSRApp } from "vue";
import App from "./App.vue";

import "uno.css";
import "@/styles/index.scss";

import { setupStore } from "@/store";
export function createApp() {
  const app = createSSRApp(App);

  setupStore(app);

  return {
    app,
  };
}
