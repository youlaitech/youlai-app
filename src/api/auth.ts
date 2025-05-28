import request from "@/utils/request";

const AuthAPI = {
  /**
   * 登录接口
   *
   * @param username 用户名
   * @param password 密码
   * @returns 返回 token
   */
  login(data: LoginFormData): Promise<LoginResult> {
    return request<LoginResult>({
      url: "/api/v1/auth/login",
      method: "POST",
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /**
   * 微信登录接口
   *
   * @param code 微信登录code
   * @returns 返回 token
   */
  wechatLogin(code: string): Promise<LoginResult> {
    return request<LoginResult>({
      url: "/api/v1/auth/wechat-login",
      method: "POST",
      data: { code },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /**
   * 微信小程序登录接口（增强版）
   *
   * @param data 微信登录数据
   * @returns 返回 token 和用户信息
   */
  wechatMiniLogin(data: WechatMiniLoginData): Promise<WechatLoginResult> {
    return request<WechatLoginResult>({
      url: "/api/v1/auth/wechat-mini-login",
      method: "POST",
      data: data,
      header: {
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * 登出接口
   */
  logout(): Promise<void> {
    return request({
      url: "/api/v1/auth/logout",
      method: "DELETE",
    });
  },
};

export default AuthAPI;

/** 登录响应 */
export interface LoginResult {
  /** 访问token */
  accessToken: string;
  /** token 类型 */
  tokenType?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

/** 微信小程序登录数据 */
export interface WechatMiniLoginData {
  /** 微信登录code */
  code: string;
  /** 用户信息（可选） */
  userInfo?: {
    /** 昵称 */
    nickName?: string;
    /** 头像URL */
    avatarUrl?: string;
    /** 性别 */
    gender?: number;
    /** 国家 */
    country?: string;
    /** 省份 */
    province?: string;
    /** 城市 */
    city?: string;
  };
  /** 手机号授权数据（可选） */
  phoneData?: {
    /** 手机号授权code */
    code: string;
    /** 加密数据 */
    encryptedData?: string;
    /** 初始向量 */
    iv?: string;
  };
}

/** 微信登录结果 */
export interface WechatLoginResult extends LoginResult {
  /** 是否为新用户 */
  isNewUser?: boolean;
  /** 用户信息是否完整 */
  isProfileComplete?: boolean;
  /** 用户基本信息 */
  userInfo?: {
    userId?: number;
    username?: string;
    nickname?: string;
    avatar?: string;
    mobile?: string;
  };
}
