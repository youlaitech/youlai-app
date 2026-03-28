import { getAccessToken, clearTokens } from "./auth";

/**
 * 请求错误类
 */
export class RequestError extends Error {
  /** HTTP 状态码 */
  statusCode: number;
  /** 业务错误码 */
  code: number;

  constructor(message: string, statusCode: number, code?: number) {
    super(message);
    this.name = "RequestError";
    this.statusCode = statusCode;
    this.code = code ?? statusCode;
  }
}

// 请求配置
interface RequestOptions<T = any> {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: T;
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
function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
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
      data: options.data,
      header,
      timeout: options.timeout || 30000,
      responseType: options.responseType,
      success: (res: any) => {
        const serverMsg = res?.data?.msg || res?.data?.message;
        // 请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data.data);
        }
        // 未授权错误：清除 token 并跳转登录页
        else if (res.statusCode === 401) {
          clearTokens();
          uni.navigateTo({
            url: "/pages/login/index",
          });
          reject(new RequestError(serverMsg || "未授权，请重新登录", 401));
        }
        // 其他错误
        else {
          const errorCode = res?.data?.code || res.statusCode;
          reject(
            new RequestError(serverMsg || `请求失败: ${res.statusCode}`, res.statusCode, errorCode)
          );
        }
      },
      fail: (err) => {
        reject(new RequestError(err.errMsg || "网络请求失败", 0));
      },
    });
  });
}

export default request;

