import { getAccessToken, clearTokens } from "./auth";
import { Storage } from "./storage";
import { USER_INFO_KEY } from "@/constants";
import { ApiCode } from "@/enums/api-code-enum";

// 401 跳转防抖锁，避免并发请求多次跳转登录页
let isRedirecting401 = false;

/**
 * 请求错误类
 */
export class RequestError extends Error {
  /** HTTP 状态码 */
  statusCode: number;
  /** 业务错误码 */
  code: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = "RequestError";
    this.statusCode = statusCode;
    this.code = code ?? String(statusCode);
  }
}

// 请求配置：TData 为请求体数据类型，响应类型由 request 的泛型指定
interface RequestOptions<TData = unknown> {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: TData;
  header?: Record<string, string>;
  timeout?: number;
  responseType?: "text" | "arraybuffer";
}

/**
 * 请求函数
 * - 有 token 则自动添加 Authorization 头
 * - 无 token 则直接发送请求，由后端判断是否需要认证
 * - 401 时清除 token 并跳转登录页
 */
function request<TResponse = any, TData = unknown>(
  options: RequestOptions<TData>
): Promise<TResponse> {
  return new Promise<TResponse>((resolve, reject) => {
    // 构建请求头
    const header = Object.assign({}, options.header || {});

    // 有 token 则添加认证头，无 token 则不添加（由后端判断）
    const token = getAccessToken();
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }

    // 根据平台决定URL前缀
    let requestUrl = options.url;
    // #ifdef MP-WEIXIN
    // 微信小程序环境，使用完整URL
    requestUrl = `${import.meta.env.VITE_APP_API_URL}${options.url}`;
    // #endif

    // #ifndef MP-WEIXIN
    // 非微信小程序环境，使用代理前缀
    requestUrl = `${import.meta.env.VITE_APP_BASE_API}${options.url}`;
    // #endif

    // 统一处理请求
    uni.request({
      url: requestUrl,
      method: options.method,
      data: options.data as Record<string, any> | string | ArrayBuffer | undefined,
      header,
      timeout: options.timeout || 30000,
      responseType: options.responseType,
      success: (res: UniApp.RequestSuccessCallbackResult) => {
        // 后端统一响应体：只取业务层字段
        const body = res?.data as
          | { code?: string; msg?: string; message?: string; data?: unknown }
          | undefined;
        const serverCode = body?.code;
        const serverMsg = body?.msg || body?.message;

        // 令牌无效/过期（业务码 A0230/A0231 或 HTTP 401）：清除会话并跳转登录页（防抖）
        const isTokenError =
          (res.statusCode >= 200 &&
            res.statusCode < 300 &&
            (serverCode === ApiCode.ACCESS_TOKEN_INVALID ||
              serverCode === ApiCode.REFRESH_TOKEN_INVALID)) ||
          res.statusCode === 401;
        if (isTokenError) {
          clearTokens();
          Storage.remove(USER_INFO_KEY);
          if (!isRedirecting401) {
            isRedirecting401 = true;
            uni.navigateTo({
              url: "/pages/login/index",
              complete: () => {
                isRedirecting401 = false;
              },
            });
          }
          reject(
            new RequestError(
              serverMsg || "未授权，请重新登录",
              401,
              serverCode || ApiCode.ACCESS_TOKEN_INVALID
            )
          );
          return;
        }

        // HTTP 成功：校验业务码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (!serverCode || serverCode === ApiCode.SUCCESS) {
            resolve(body?.data as TResponse);
          } else {
            reject(new RequestError(serverMsg || "请求失败", res.statusCode, serverCode));
          }
          return;
        }

        // 其他 HTTP 错误
        reject(
          new RequestError(serverMsg || `请求失败: ${res.statusCode}`, res.statusCode, serverCode)
        );
      },
      fail: (err) => {
        reject(new RequestError(err.errMsg || "网络请求失败", 0));
      },
    });
  });
}

export default request;
