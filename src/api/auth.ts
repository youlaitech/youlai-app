import request, { publicRequest } from "@/utils/request";

const AUTH_BASE_URL = "/api/v1/auth";
const WECHAT_MINIAPP_AUTH_BASE_URL = "/api/v1/wechat/miniapp/auth";

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
  smsCode: string;
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
   * 
   * 演示环境说明：短信服务未配置，验证码固定为 123456
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
   * 微信小程序静默登录
   * 
   * 适用场景：个人小程序
   * - 已绑定手机号的用户：直接返回 token，登录成功
   * - 未绑定手机号的用户：返回 openid，需调用绑定手机号接口
   */
  wechatMiniappSilentLogin(code: string): Promise<WechatMiniappLoginResult> {
    return publicRequest<WechatMiniappLoginResult>({
      url: `${WECHAT_MINIAPP_AUTH_BASE_URL}/silent-login?code=${encodeURIComponent(code)}`,
      method: "POST",
    });
  },

  /**
   * 微信小程序手机号快捷登录
   * 
   * 适用场景：企业认证小程序（已开通手机号快捷登录权限）
   * 一步完成登录，无需绑定流程，自动创建新用户
   */
  wechatMiniappPhoneLogin(data: WechatMiniappPhoneLoginData): Promise<LoginResult> {
    const loginCodeSafe = encodeURIComponent(data.loginCode);
    const phoneCodeSafe = encodeURIComponent(data.phoneCode);
    return publicRequest<LoginResult>({
      url: `${WECHAT_MINIAPP_AUTH_BASE_URL}/phone-login?loginCode=${loginCodeSafe}&phoneCode=${phoneCodeSafe}`,
      method: "POST",
    });
  },

  /**
   * 微信小程序绑定手机号
   * 
   * 演示环境说明：短信服务未配置，验证码固定为 123456
   */
  wechatMiniappBindMobile(data: WechatMiniappBindMobileData): Promise<LoginResult> {
    const openidSafe = encodeURIComponent(data.openid);
    const mobileSafe = encodeURIComponent(data.mobile);
    const smsCodeSafe = encodeURIComponent(data.smsCode);
    return publicRequest<LoginResult>({
      url: `${WECHAT_MINIAPP_AUTH_BASE_URL}/bind-mobile?openid=${openidSafe}&mobile=${mobileSafe}&smsCode=${smsCodeSafe}`,
      method: "POST",
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
