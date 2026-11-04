import { Storage } from "./storage";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";

let sessionRevision = 0;
/**
 * 获取会话版本，用于识别登录状态切换
 */
export function getAuthSessionRevision(): number {
  return sessionRevision;
}

/**
 * 获取访问令牌
 *
 * @returns 访问令牌，未登录时为 null
 */
export function getAccessToken(): string | null {
  return Storage.get<string>(ACCESS_TOKEN_KEY) || null;
}

/**
 * 保存成对凭证；正常续期保留会话版本，避免打断同账号的在途请求
 */
export function setTokens(accessToken: string, refreshToken: string, renewing = false): void {
  Storage.set(ACCESS_TOKEN_KEY, accessToken);
  Storage.set(REFRESH_TOKEN_KEY, refreshToken);
  if (!renewing) sessionRevision += 1;
}

/**
 * 读取已保存的刷新令牌，缺失时返回 null
 */
export function getRefreshToken(): string | null {
  return Storage.get<string>(REFRESH_TOKEN_KEY) || null;
}

/**
 * 清除全部令牌
 */
export function clearTokens(): void {
  Storage.remove(ACCESS_TOKEN_KEY);
  Storage.remove(REFRESH_TOKEN_KEY);
  sessionRevision += 1;
}

/**
 * 获取含查询参数的当前页面路径
 */
function getCurrentPagePath(): string {
  const pages = getCurrentPages();
  if (pages.length === 0) return "/pages/index/index";

  const currentPage = pages[pages.length - 1];
  const route = currentPage.route || "";
  const options = (currentPage as { options?: Record<string, string> }).options || {};

  const query = Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return query ? `/${route}?${query}` : `/${route}`;
}

/**
 * 确保已登录
 *
 * 缺少令牌时跳转登录页并带上来路地址，navigateTo 失败（页面栈已满）时改用 reLaunch
 *
 * @returns 是否已登录
 */
export function ensureAuthenticated(): boolean {
  if (getAccessToken()) return true;

  const redirect = encodeURIComponent(getCurrentPagePath());
  uni.navigateTo({
    url: `/pages/login/index?redirect=${redirect}`,
    fail: () => {
      // 页面栈已满时改用 reLaunch，回跳地址同样带上
      uni.reLaunch({ url: `/pages/login/index?redirect=${redirect}` });
    },
  });

  return false;
}
