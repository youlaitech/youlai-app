import { defineStore } from "pinia";
import AuthAPI, { type LoginFormData } from "@/api/auth";
import UserAPI, { type UserInfo } from "@/api/user";
import { setAccessToken, clearTokens } from "@/utils/auth";
import { getUserInfo, setUserInfo } from "@/utils/storage";
import { USER_INFO_KEY } from "@/constants";
import { Storage } from "@/utils/storage";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfo | undefined>(getUserInfo());

  // 登录
  const login = (data: LoginFormData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.login(data)
        .then((data) => {
          setAccessToken(data.accessToken);
          resolve(data);
        })
        .catch((error) => {
          console.error("登录失败", error);
          reject(error);
        });
    });
  };

  // 微信登录
  const loginByWechat = (code: string) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatLogin(code)
        .then((data) => {
          setAccessToken(data.accessToken);
          resolve(data);
        })
        .catch((error) => {
          console.error("微信登录失败", error);
          reject(error);
        });
    });
  };

  // 微信小程序增强登录
  const loginByWechatMini = (data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatMiniLogin(data)
        .then((result) => {
          setAccessToken(result.accessToken);
          resolve(result);
        })
        .catch((error) => {
          console.error("微信小程序登录失败", error);
          reject(error);
        });
    });
  };

  // 获取用户信息
  const getInfo = () => {
    return new Promise((resolve, reject) => {
      UserAPI.getUserInfo()
        .then((data) => {
          setUserInfo(data);
          userInfo.value = data;
          resolve(data);
        })
        .catch((error) => {
          console.error("获取用户信息失败", error);
          reject(error);
        });
    });
  };

  // 登出
  const logout = async () => {
    try {
      await AuthAPI.logout(); // 调用后台注销接口
    } catch (error) {
      console.error("登出失败", error);
    } finally {
      clearTokens(); // 清除本地的 token
      Storage.remove(USER_INFO_KEY); // 清除用户信息缓存
      userInfo.value = undefined; // 清空用户信息
    }
  };

  // 判断用户信息是否完整
  const isUserInfoComplete = (): boolean => {
    if (!userInfo.value) return false;

    return !!(userInfo.value.nickname && userInfo.value.avatar);
  };

  return {
    userInfo,
    login,
    loginByWechat,
    loginByWechatMini,
    logout,
    getInfo,
    isUserInfoComplete,
  };
});
