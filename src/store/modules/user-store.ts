import { defineStore } from "pinia";
import AuthAPI, {
  type LoginData,
  type SmsLoginData,
  type WechatMiniappPhoneLoginData,
  type WechatMiniappBindMobileData,
} from "@/api/auth";
import UserAPI, { type UserInfo } from "@/api/user";
import { setAccessToken, clearTokens } from "@/utils/auth";
import { getUserInfo, setUserInfo } from "@/utils/storage";
import { USER_INFO_KEY } from "@/constants";
import { Storage } from "@/utils/storage";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfo | undefined>(getUserInfo());

  // 账号密码登录
  const login = (data: LoginData) => {
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

  // 短信验证码登录
  const loginBySms = (data: SmsLoginData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.loginBySms(data)
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

  // 微信小程序登录（个人小程序）
  const loginByWechatMiniapp = (code: string) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatMiniappLogin(code)
        .then((data) => {
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
          resolve(data);
        })
        .catch((error) => {
          console.error("微信小程序登录失败", error);
          reject(error);
        });
    });
  };

  // 微信小程序一键登录（企业小程序）
  const loginByWechatMiniappPhone = (data: WechatMiniappPhoneLoginData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatMiniappPhoneLogin(data)
        .then((data) => {
          setAccessToken(data.accessToken);
          resolve(data);
        })
        .catch((error) => {
          console.error("微信小程序一键登录失败", error);
          reject(error);
        });
    });
  };

  // 微信小程序绑定手机号
  const bindMobileForWechatMiniapp = (data: WechatMiniappBindMobileData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatMiniappBindMobile(data)
        .then((data) => {
          setAccessToken(data.accessToken);
          resolve(data);
        })
        .catch((error) => {
          console.error("绑定手机号失败", error);
          reject(error);
        });
    });
  };

  // 检查会话状态
  const checkSession = (): Promise<boolean> => {
    return new Promise((resolve) => {
      AuthAPI.checkSession()
        .then((result) => {
          resolve(result.valid);
        })
        .catch(() => {
          resolve(false);
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
      await AuthAPI.logout();
    } catch (error) {
      console.error("登出失败", error);
    } finally {
      clearTokens();
      Storage.remove(USER_INFO_KEY);
      userInfo.value = undefined;
      uni.reLaunch({ url: "/pages/login/index" });
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
    loginBySms,
    loginByWechatMiniapp,
    loginByWechatMiniappPhone,
    bindMobileForWechatMiniapp,
    logout,
    getInfo,
    checkSession,
    isUserInfoComplete,
  };
});
