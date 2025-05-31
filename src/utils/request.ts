import { getAccessToken } from "./auth";

// 请求配置
interface RequestOptions<T = any> {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: T;
  header?: Record<string, string>;
  timeout?: number;
  responseType?: "text" | "arraybuffer";
}

// 请求函数
function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // 添加授权头
    const token = getAccessToken();
    const header = Object.assign({}, options.header || {});

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
        // 请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data.data);
        }
        // 未授权错误
        else if (res.statusCode === 401) {
          // 直接跳转到登录页
          uni.redirectTo({
            url: "/pages/login/index",
          });
          reject(new Error("未授权，请重新登录"));
        }
        // 其他错误
        else {
          const errorMsg = res.data.message || `请求失败: ${res.statusCode}`;
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || "网络请求失败"));
      },
    });
  });
}

export default request;
