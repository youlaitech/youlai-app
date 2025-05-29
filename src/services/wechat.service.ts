/**
 * 微信授权服务
 * 处理微信登录授权、获取用户信息等功能
 */

import { ref } from "vue";
import { getAccessToken } from "@/utils/auth";

// 定义微信授权状态
export const wxAuthState = ref({
  isLogining: false,
  authDenied: false,
});

/**
 * 获取微信登录凭证
 * @returns Promise 返回登录凭证code
 */
export function getWxLoginCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: "weixin",
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error("获取微信登录凭证失败"));
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
    // #endif

    // #ifndef MP-WEIXIN
    reject(new Error("当前环境不支持微信登录"));
    // #endif
  });
}

/**
 * 获取微信用户手机号
 * @param e 微信授权返回的事件对象
 * @returns Promise 返回包含加密数据的对象
 */
export function getWxPhoneNumber(
  e: any
): Promise<{ code: string; encryptedData?: string; iv?: string }> {
  return new Promise((resolve, reject) => {
    wxAuthState.value.isLogining = true;

    // 判断授权是否成功
    if (e.detail.errMsg !== "getPhoneNumber:ok") {
      wxAuthState.value.isLogining = false;
      wxAuthState.value.authDenied = true;
      reject(new Error("用户拒绝授权"));
      return;
    }

    // 获取登录凭证code
    getWxLoginCode()
      .then((code) => {
        // 在微信小程序环境下，可以获取encryptedData和iv
        // #ifdef MP-WEIXIN
        resolve({
          code,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
        });
        // #endif

        // 其他环境或新版本接口
        // #ifndef MP-WEIXIN
        resolve({
          code,
          // 新版本接口在e.detail.code中包含手机号获取凭证
          ...(e.detail.code ? { phoneCode: e.detail.code } : {}),
        });
        // #endif
      })
      .catch((err) => {
        reject(err);
      })
      .finally(() => {
        wxAuthState.value.isLogining = false;
      });
  });
}

/**
 * 检查微信会话有效性
 * 检查本地token是否存在，如存在则检查其有效性
 */
export function checkWxSession(): Promise<boolean> {
  return new Promise((resolve) => {
    const token = getAccessToken();

    if (!token) {
      resolve(false);
      return;
    }

    // 调用后端接口验证token有效性
    uni.request({
      url: "/api/v1/auth/check-session",
      method: "GET",
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res: any) => {
        if (res.statusCode === 200 && res.data.valid) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: () => {
        resolve(false);
      },
    });
  });
}

/**
 * 获取微信用户信息（如头像、昵称等）
 * 注意：此接口在2021年4月后的小程序新版本中需要额外授权
 */
export function getWxUserProfile(): Promise<any> {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.getUserProfile({
      desc: "用于完善用户资料",
      success: (res) => {
        resolve(res.userInfo);
      },
      fail: (err) => {
        reject(err);
      },
    });
    // #endif

    // #ifndef MP-WEIXIN
    reject(new Error("当前环境不支持获取用户信息"));
    // #endif
  });
}
