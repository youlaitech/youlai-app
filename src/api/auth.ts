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
  isProfileComplete?: boolean;
}

export interface SmsLoginData {
  mobile: string;
  code: string;
}

const AuthAPI = {
  /**
   * 账号密码登录
   * @param data 登录表单数据
   * @returns 登录结果
   */
  login(data: LoginData): Promise<LoginResult> {
    return publicRequest<LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "POST",
      data: data, // 发送JSON格式的请求体
    });
  },

  sendSmsLoginCode(mobile: string): Promise<void> {
    const mobileSafe = encodeURIComponent(mobile);
    return publicRequest<void>({
      url: `${AUTH_BASE_URL}/sms/code?mobile=${mobileSafe}`,
      method: "POST",
    });
  },

  loginBySms(data: SmsLoginData): Promise<LoginResult> {
    const mobileSafe = encodeURIComponent(data.mobile);
    const codeSafe = encodeURIComponent(data.code);
    return publicRequest<LoginResult>({
      url: `${AUTH_BASE_URL}/login/sms?mobile=${mobileSafe}&code=${codeSafe}`,
      method: "POST",
    });
  },

  /**
   * 检查会话有效性
   * @returns 会话是否有效
   */
  checkSession(): Promise<{ valid: boolean }> {
    return request<{ valid: boolean }>({
      url: `${AUTH_BASE_URL}/check-session`,
      method: "GET",
    });
  },

  /**
   * 登出
   * @returns 登出结果
   */
  logout(): Promise<any> {
    return request<any>({
      url: `${AUTH_BASE_URL}/logout`,
      method: "POST",
    });
  },

  /**
   * 刷新令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌
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
