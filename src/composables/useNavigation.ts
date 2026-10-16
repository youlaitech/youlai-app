import { ensureAuthenticated } from "@/utils/auth";

// 导航目标：url 为空表示功能未开放
interface NavItem {
  url?: string;
}

/**
 * 业务菜单导航
 *
 * 站外地址在 H5 新开标签、其余端进内置 webview，站内地址走 navigateTo。
 */
export function useNavigation() {
  const toast = useToast();

  /**
   * 按菜单配置跳转
   *
   * 未登录先跳登录页并带上来路；地址缺失或页面不存在时给出提示。
   *
   * @param item - 菜单项，url 支持站内路径与 http(s) 地址
   */
  const navigate = (item: NavItem) => {
    if (!item.url) {
      toast.info("功能开发中");
      return;
    }

    if (!ensureAuthenticated()) return;

    if (item.url.startsWith("http://") || item.url.startsWith("https://")) {
      // #ifdef H5
      window.open(item.url, "_blank");
      // #endif
      // #ifndef H5
      uni.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(item.url)}`,
      });
      // #endif
      return;
    }

    uni.navigateTo({
      url: item.url,
      fail: () => {
        toast.info("页面不存在");
      },
    });
  };

  return { navigate };
}
