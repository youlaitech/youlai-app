import { getAccessToken, getRefreshToken, setAccessToken } from "./auth";

// 刷新令牌的锁，防止多个请求同时刷新令牌
let isRefreshing = false;
// 请求队列，存储需要等待令牌刷新的请求
let refreshSubscribers: Array<(token: string) => void> = [];

// 添加订阅者
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// 执行所有订阅者
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * 刷新令牌
 * @returns 新的访问令牌
 */
const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("刷新令牌不存在");
    }

    const response = await uni.request({
      url: "/api/v1/auth/refresh-token",
      method: "POST",
      data: { refreshToken },
      header: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data as any;
    if (data.code !== 200 || !data.data.accessToken) {
      throw new Error("刷新令牌失败");
    }

    const newToken = data.data.accessToken;
    setAccessToken(newToken);
    return newToken;
  } catch (error) {
    console.error("刷新令牌失败:", error);
    throw error;
  }
};

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

    // 统一处理请求
    const handleRequest = () => {
      uni.request({
        url: options.url,
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
            // 尝试刷新令牌
            if (!isRefreshing) {
              isRefreshing = true;

              refreshToken()
                .then((newToken) => {
                  // 令牌刷新成功，通知所有等待的请求
                  onRefreshed(newToken);
                  // 重新发起请求
                  header["Authorization"] = `Bearer ${newToken}`;
                  handleRequest();
                })
                .catch((err) => {
                  console.error("令牌刷新失败:", err);
                  // 刷新失败，清除订阅者
                  refreshSubscribers = [];
                  // 重定向到登录页
                  uni.redirectTo({
                    url: "/pages/login/index",
                  });
                  reject(err);
                })
                .finally(() => {
                  isRefreshing = false;
                });
            } else {
              // 当前已有刷新令牌的请求，将此请求加入队列
              subscribeTokenRefresh((newToken) => {
                header["Authorization"] = `Bearer ${newToken}`;
                handleRequest();
              });
            }
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
    };

    // 检查令牌是否过期
    if (token) {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshToken()
          .then((newToken) => {
            // 令牌刷新成功，通知所有等待的请求
            onRefreshed(newToken);
            // 重新发起请求
            header["Authorization"] = `Bearer ${newToken}`;
            handleRequest();
          })
          .catch((err) => {
            console.error("令牌刷新失败:", err);
            // 刷新失败，清除订阅者
            refreshSubscribers = [];
            // 重定向到登录页
            uni.redirectTo({
              url: "/pages/login/index",
            });
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        // 当前已有刷新令牌的请求，将此请求加入队列
        subscribeTokenRefresh((newToken) => {
          header["Authorization"] = `Bearer ${newToken}`;
          handleRequest();
        });
      }
    } else {
      // 令牌有效或无需令牌，直接发起请求
      handleRequest();
    }
  });
}

export default request;
