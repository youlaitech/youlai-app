// pages.config.ts
import { defineUniPages } from "@uni-helper/vite-plugin-uni-pages";

export default defineUniPages({
  // 你也可以定义 pages 字段，它具有最高的优先级。
  pages: [
    {
      path: "pages/index/index",
      layout: "tabbar",
    },
    {
      path: "pages/mine/index",
      layout: "tabbar",
    },
  ],
  globalStyle: {
    navigationStyle: "custom",
    navigationBarTextStyle: "black",
    navigationBarTitleText: "youlai-mall-app",
    navigationBarBackgroundColor: "#F8F8F8",
    backgroundColor: "#F8F8F8",
  },

  tabBar: {
    custom: true,
    height: "0px",
    color: "#00000000",
    selectedColor: "#00000000",
    backgroundColor: "#00000000",
    list: [
      {
        text: "首页",
        pagePath: "pages/index/index",
      },
      {
        text: "我的",
        pagePath: "pages/mine/index",
      },
    ],
  },
});
