import { pages, subPackages } from "virtual:uni-pages";
import { getAccessToken, isLoggedIn } from "@/utils/auth";
import { createRouter } from "uni-mini-router";
import { useUserStore } from "@/store";

// 生成路由配置
function generateRoutes() {
  const routes = pages.map((page: { path: string; [key: string]: any }) => {
    const newPath = `/${page.path}`;
    // 透传 meta 字段（如果 pages.json 中定义了）
    const meta = page.meta ?? undefined;
    return { ...page, path: newPath, meta };
  });

  // 处理分包路由
  if (subPackages && subPackages.length > 0) {
    subPackages.forEach((subPackage: { root: string; pages: any[] }) => {
      const subRoutes = subPackage.pages.map((page: any) => {
        const newPath = `/${subPackage.root}/${page.path}`;
        const meta = page.meta ?? undefined;
        return { ...page, path: newPath, meta };
      });
      routes.push(...subRoutes);
    });
  }
  return routes;
}

// 创建路由实例
const router = createRouter({
  routes: generateRoutes(),
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  if (to.meta && to.meta.requireAuth && !isLoggedIn()) {
    const redirectPath = (to.path || "/pages/index/index") as string;
    // 先取消本次导航，避免在异步对话框中遗漏 next 导致报错
    next(false);
    uni.showModal({
      title: "提示",
      content: "该功能需要登录后使用",
      confirmText: "去登录",
      cancelText: "返回",
      success: (res) => {
        if (res.confirm) {
          router.push({
            path: "/pages/login/index",
            query: { redirect: encodeURIComponent(redirectPath) },
          });
        }
      },
    });
    return;
  }

  if (to.meta && to.meta.requireAuth) {
    const token = getAccessToken();
    const userStore = useUserStore();

    if (!token) {
      next(false);
      router.push({ path: "/pages/login/index" });
      return;
    }

    if (!userStore.userInfo) {
      try {
        await userStore.getInfo();
      } catch {
        next(false);
        userStore.logout();
        return;
      }
    }
  }

  next();
});

router.afterEach((to, from) => {
  // 路由跳转日志（生产环境可通过 vite 配置自动移除）
});

export default router;
