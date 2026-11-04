import { getAccessToken, clearTokens, getAuthSessionRevision } from "./auth";
import { Storage } from "./storage";
import { USER_INFO_KEY } from "@/constants";
import { ApiCode } from "@/enums/api-code-enum";

let isRedirecting401 = false;
let unauthorizedHandler: (() => void) | null = null;
let refreshHandler: (() => Promise<void>) | null = null;

/**
 * 由启动入口注入，避免请求模块与用户 store 循环依赖
 */
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

/**
 * 注册会话续期回调，避免请求模块依赖用户 store
 */
export function setRefreshHandler(handler: () => Promise<void>): void {
  refreshHandler = handler;
}

/**
 * HTTP、业务或网络请求失败信息
 */
export class RequestError extends Error {
  /**
   * 保存响应状态与业务码；网络失败的状态为 0
   */
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code = String(statusCode),
  ) {
    super(message);
    this.name = "RequestError";
  }
}

interface RequestOptions<TData = unknown> {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: TData;
  header?: Record<string, string>;
  timeout?: number;
  responseType?: "text" | "arraybuffer";
  anonymous?: boolean;
}

interface ApiResponse {
  code?: string;
  msg?: string;
  message?: string;
  data?: unknown;
}

/**
 * 访问令牌过期时合并续期并重试一次；匿名接口由调用方处理错误
 */
async function request<TResponse = unknown, TData = unknown>(
  options: RequestOptions<TData>,
  retried = false,
): Promise<TResponse> {
  const revision = getAuthSessionRevision();
  const token = options.anonymous ? null : getAccessToken();
  const res = await send(options, token);
  if (revision !== getAuthSessionRevision()) throw new RequestError("登录会话已切换", 0);

  const body = res.data as ApiResponse | undefined;
  const code = body?.code;
  const message = body?.msg || body?.message || "请求失败";
  const tokenInvalid =
    res.statusCode === 401 ||
    code === ApiCode.ACCESS_TOKEN_INVALID ||
    code === ApiCode.REFRESH_TOKEN_INVALID;

  if (tokenInvalid) {
    if (options.anonymous) throw new RequestError(message, 401, code);
    if (!retried && token && refreshHandler) {
      try {
        // 较早发出的请求可能晚于续期返回，此时直接使用已更新的凭证
        if (getAccessToken() === token) await refreshHandler();
      } catch (error) {
        if (revision !== getAuthSessionRevision()) throw new RequestError("登录会话已切换", 0);
        // 网络或服务故障不清空登录态，用户可稍后重试
        if (!(error instanceof RequestError) || error.statusCode !== 401) throw error;
        expireSession();
        throw error;
      }
      if (revision !== getAuthSessionRevision()) throw new RequestError("登录会话已切换", 0);
      return request<TResponse, TData>(options, true);
    }
    expireSession();
    throw new RequestError(message, 401, code || ApiCode.ACCESS_TOKEN_INVALID);
  }

  if (res.statusCode < 200 || res.statusCode >= 300 || (code && code !== ApiCode.SUCCESS)) {
    throw new RequestError(message, res.statusCode, code);
  }
  return body?.data as TResponse;
}

/**
 * 按当前平台发送 HTTP 请求并附加访问令牌
 */
function send<TData>(
  options: RequestOptions<TData>,
  token: string | null,
): Promise<UniApp.RequestSuccessCallbackResult> {
  const header = { ...options.header };
  if (token) header.Authorization = `Bearer ${token}`;
  if (options.anonymous) delete header.Authorization;

  let url: string;
  // #ifdef H5
  url = `${import.meta.env.VITE_API_BASE}${options.url}`;
  // #endif
  // #ifndef H5
  url = `${import.meta.env.VITE_API_URL}${options.url}`;
  // #endif

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: options.method,
      data: options.data as Record<string, unknown> | string | ArrayBuffer | undefined,
      header,
      timeout: options.timeout ?? 30_000,
      responseType: options.responseType,
      success: resolve,
      fail: (error) => reject(new RequestError(error.errMsg || "网络请求失败", 0)),
    });
  });
}

/**
 * 清理失效会话并合并登录页跳转
 */
function expireSession(): void {
  if (unauthorizedHandler) unauthorizedHandler();
  else {
    clearTokens();
    Storage.remove(USER_INFO_KEY);
  }
  if (isRedirecting401) return;
  isRedirecting401 = true;
  uni.navigateTo({
    url: "/pages/login/index",
    complete: () => {
      isRedirecting401 = false;
    },
  });
}

export default request;
