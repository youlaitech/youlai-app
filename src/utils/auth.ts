import { useUserStore } from "@/store/modules/user";
import { Storage } from "./storage";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";

/**
 * 获取访问令牌
 * @returns 返回访问令牌，如果不存在则返回null
 */
export function getAccessToken(): string | null {
  return Storage.get<string>(ACCESS_TOKEN_KEY) || null;
}

/**
 * 设置访问令牌
 * @param token 访问令牌
 */
export function setAccessToken(token: string): void {
  Storage.set(ACCESS_TOKEN_KEY, token);
}

/**
 * 获取刷新令牌
 * @returns 返回刷新令牌，如果不存在则返回null
 */
export function getRefreshToken(): string | null {
  return Storage.get<string>(REFRESH_TOKEN_KEY) || null;
}

/**
 * 设置刷新令牌
 * @param token 刷新令牌
 */
export function setRefreshToken(token: string): void {
  Storage.set(REFRESH_TOKEN_KEY, token);
}

/**
 * 清除所有令牌
 */
export function clearTokens(): void {
  Storage.remove(ACCESS_TOKEN_KEY);
  Storage.remove(REFRESH_TOKEN_KEY);
}

/**
 * 检查用户登录状态，未登录则跳转到登录页面
 * @returns 返回用户是否已登录
 */
export function checkLogin(): boolean {
  const userStore = useUserStore();

  if (!userStore.userInfo) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentPagePath = `/${currentPage.route}`;

    uni.navigateTo({
      url: `/pages/login/index?redirect=${encodeURIComponent(currentPagePath)}`,
    });
    return false;
  }

  return true;
}
