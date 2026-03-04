import request, { publicRequest } from "@/utils/request";

const AUTH_BASE_URL = "/api/v1/auth";

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  isNewUser?: boolean;
  needBindMobile?: boolean;
  openid?: string;
}

export interface SmsLoginData {
  mobile: string;
  code: string;
}

export interface WechatMiniappLoginResult {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  isNewUser: boolean;
  needBindMobile: boolean;
  openid?: string;
}

export interface WechatMiniappPhoneLoginData {
  loginCode: string;
  phoneCode: string;
}

export interface WechatMiniappBindMobileData {
  openid: string;
  mobile: string;
  code: string;
}

const AuthAPI = {
  /**
   * 账号密码登录
   */
  login(data: LoginData): Promise<LoginResult> {
    return publicRequest<LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "POST",
      data: data,
    });
  },

  /**
   * 发送短信验证码
   */
  sendSmsLoginCode(mobile: string): Promise<void> {
    const mobileSafe = encodeURIComponent(mobile);
    return publicRequest<void>({
      url: `${AUTH_BASE_URL}/sms/code?mobile=${mobileSafe}`,
      method: "POST",
    });
  },

  /**
   * 短信验证码登录
   */
  loginBySms(data: SmsLoginData): Promise<LoginResult> {
    const mobileSafe = encodeURIComponent(data.mobile);
    const codeSafe = encodeURIComponent(data.code);
    return publicRequest<LoginResult>({
      url: `${AUTH_BASE_URL}/login/sms?mobile=${mobileSafe}&code=${codeSafe}`,
      method: "POST",
    });
  },

  /**
   * 微信小程序登录（个人小程序）
   */
  wechatMiniappLogin(code: string): Promise<WechatMiniappLoginResult> {
    return publicRequest<WechatMiniappLoginResult>({
      url: `${AUTH_BASE_URL}/wechat-miniapp/login?code=${encodeURIComponent(code)}`,
      method: "POST",
    });
  },

  /**
   * 微信小程序一键登录（企业小程序）
   */
  wechatMiniappPhoneLogin(data: WechatMiniappPhoneLoginData): Promise<LoginResult> {
    return publicRequest<LoginResult>({
      url: `${AUTH_BASE_URL}/wechat-miniapp/phone-login`,
      method: "POST",
      data,
    });
  },

  /**
   * 微信小程序绑定手机号
   */
  wechatMiniappBindMobile(data: WechatMiniappBindMobileData): Promise<LoginResult> {
    return publicRequest<LoginResult>({
      url: `${AUTH_BASE_URL}/wechat-miniapp/bind-mobile`,
      method: "POST",
      data,
    });
  },

  /**
   * 检查会话有效性
   */
  checkSession(): Promise<{ valid: boolean }> {
    return request<{ valid: boolean }>({
      url: `${AUTH_BASE_URL}/check-session`,
      method: "GET",
    });
  },

  /**
   * 登出
   */
  logout(): Promise<any> {
    return request<any>({
      url: `${AUTH_BASE_URL}/logout`,
      method: "POST",
    });
  },

  /**
   * 刷新令牌
   */
  refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    return publicRequest<{ accessToken: string; expiresIn: number }>({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "POST",
      data: { refreshToken },
    });
  },
};

export default AuthAPI;
