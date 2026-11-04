import { defineStore } from "pinia";
import AuthAPI, {
  type PasswordLoginParams,
  type SmsLoginParams,
  type WxMaPhoneLoginParams,
  type WxMaBindMobileParams,
  type LoginResult,
} from "@/api/auth";
import UserAPI, { type UserInfo } from "@/api/user";
import {
  setTokens as persistTokens,
  getAccessToken,
  getRefreshToken,
  getAuthSessionRevision,
  clearTokens,
} from "@/utils/auth";
import { RequestError } from "@/utils/request";
import { Storage } from "@/utils/storage";
import { USER_INFO_KEY } from "@/constants";

/**
 * 管理用户资料、登录凭证与会话续期
 */
export const useUserStore = defineStore("user", () => {
  // 从持久化缓存恢复的访问令牌
  const accessToken = ref<string>(getAccessToken() || "");

  // 用户信息
  const userInfo = ref<UserInfo | undefined>(Storage.get<UserInfo>(USER_INFO_KEY));

  const isAuthenticated = computed(() => !!accessToken.value);

  // 必填资料是否完善（昵称与头像齐备）
  const isProfileComplete = computed(() => !!(userInfo.value?.nickname && userInfo.value?.avatar));

  /**
   * 成对保存凭证并同步响应式登录状态
   */
  function setTokens(
    tokens: Pick<LoginResult, "accessToken" | "refreshToken">,
    renewing = false,
  ): void {
    persistTokens(tokens.accessToken, tokens.refreshToken, renewing);
    accessToken.value = tokens.accessToken;
  }

  let refreshTask: { revision: number; promise: Promise<void> } | null = null;

  /**
   * 同一账号的并发请求共用续期任务，切换账号后丢弃旧结果
   */
  function refreshTokenOnce(): Promise<void> {
    const revision = getAuthSessionRevision();
    if (refreshTask?.revision === revision) return refreshTask.promise;
    const refreshToken = getRefreshToken();
    if (!refreshToken) return Promise.reject(new RequestError("请重新登录", 401));
    const promise = AuthAPI.refreshToken(refreshToken)
      .then((tokens) => {
        if (revision !== getAuthSessionRevision()) throw new RequestError("登录会话已切换", 0);
        setTokens(tokens, true);
      })
      .finally(() => {
        if (refreshTask?.promise === promise) refreshTask = null;
      });
    refreshTask = { revision, promise };
    return promise;
  }

  /**
   * 清除内存与持久化中的登录会话
   */
  function resetSession(): void {
    clearTokens();
    refreshTask = null;
    accessToken.value = "";
    userInfo.value = undefined;
    Storage.remove(USER_INFO_KEY);
  }

  /**
   * 账号密码登录
   */
  const loginByPassword = async (data: PasswordLoginParams) => {
    const result = await AuthAPI.loginByPassword(data);
    setTokens(result);
    return result;
  };

  /**
   * 短信验证码登录
   */
  const loginBySms = async (data: SmsLoginParams) => {
    const result = await AuthAPI.loginBySms(data);
    setTokens(result);
    return result;
  };

  /**
   * 微信小程序静默登录
   */
  const loginByWxMa = async (code: string) => {
    const result = await AuthAPI.wxMaSilentLogin(code);
    if (result.accessToken && result.refreshToken) {
      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    }
    return result;
  };

  /**
   * 微信小程序一键登录（企业小程序）
   */
  const loginByWxMaPhone = async (data: WxMaPhoneLoginParams) => {
    const result = await AuthAPI.wxMaPhoneLogin(data);
    setTokens(result);
    return result;
  };

  /**
   * 微信小程序绑定手机号
   */
  const bindMobileForWxMa = async (data: WxMaBindMobileParams) => {
    const result = await AuthAPI.wxMaBindMobile(data);
    setTokens(result);
    return result;
  };

  /**
   * 加载并缓存当前用户资料，忽略旧会话响应
   */
  const loadUserInfo = async () => {
    const revision = getAuthSessionRevision();
    const data = await UserAPI.getCurrentUser();
    if (revision !== getAuthSessionRevision()) throw new RequestError("登录会话已切换", 0);
    Storage.set(USER_INFO_KEY, data);
    userInfo.value = data;
    return data;
  };

  /**
   * 退出远端会话后清理本地状态并进入登录页
   */
  const logout = async () => {
    const revision = getAuthSessionRevision();
    try {
      await AuthAPI.logout();
    } catch {
      // 登出失败静默处理，继续清理本地状态
    } finally {
      if (revision === getAuthSessionRevision()) {
        resetSession();
        uni.reLaunch({ url: "/pages/login/index" });
      }
    }
  };

  return {
    // 状态与会话
    accessToken,
    userInfo,
    isAuthenticated,
    isProfileComplete,
    setTokens,
    refreshTokenOnce,
    resetSession,
    // 登录
    loginByPassword,
    loginBySms,
    loginByWxMa,
    loginByWxMaPhone,
    bindMobileForWxMa,
    // 用户信息
    logout,
    loadUserInfo,
  };
});
