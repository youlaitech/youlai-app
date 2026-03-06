import { defineStore } from "pinia"
import AuthAPI, {
  type LoginData,
  type SmsLoginData,
  type WechatMiniappPhoneLoginData,
  type WechatMiniappBindMobileData,
} from "@/api/auth"
import UserAPI, { type UserInfo } from "@/api/user"
import { setAccessToken, clearTokens } from "@/utils/auth"
import { getUserInfo, setUserInfo } from "@/utils/storage"
import { USER_INFO_KEY } from "@/constants"
import { Storage } from "@/utils/storage"

/**
 * 用户状态管理 Store
 *
 * 功能说明：
 * - 用户登录/登出
 * - 用户信息管理
 * - 多种登录方式支持（密码、短信、微信小程序）
 * - 会话状态检查
 */

export const useUserStore = defineStore("user", () => {
  // ==========================================================================
  // 状态
  // ==========================================================================

  /** 用户信息 */
  const userInfo = ref<UserInfo | undefined>(getUserInfo())

  // ==========================================================================
  // 登录方法
  // ==========================================================================

  /**
   * 账号密码登录
   * @param data 登录数据
   */
  const login = (data: LoginData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.login(data)
        .then((data) => {
          setAccessToken(data.accessToken)
          resolve(data)
        })
        .catch((error) => {
          console.error("登录失败", error)
          reject(error)
        })
    })
  }

  /**
   * 短信验证码登录
   * @param data 短信登录数据
   */
  const loginBySms = (data: SmsLoginData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.loginBySms(data)
        .then((data) => {
          setAccessToken(data.accessToken)
          resolve(data)
        })
        .catch((error) => {
          console.error("登录失败", error)
          reject(error)
        })
    })
  }

  /**
   * 微信小程序静默登录
   * @param code 微信登录码
   */
  const loginByWechatMiniapp = (code: string) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatMiniappSilentLogin(code)
        .then((data) => {
          if (data.accessToken) {
            setAccessToken(data.accessToken)
          }
          resolve(data)
        })
        .catch((error) => {
          console.error("微信小程序登录失败", error)
          reject(error)
        })
    })
  }

  /**
   * 微信小程序一键登录（企业小程序）
   * @param data 微信手机号登录数据
   */
  const loginByWechatMiniappPhone = (data: WechatMiniappPhoneLoginData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatMiniappPhoneLogin(data)
        .then((data) => {
          setAccessToken(data.accessToken)
          resolve(data)
        })
        .catch((error) => {
          console.error("微信小程序一键登录失败", error)
          reject(error)
        })
    })
  }

  /**
   * 微信小程序绑定手机号
   * @param data 绑定手机号数据
   */
  const bindMobileForWechatMiniapp = (data: WechatMiniappBindMobileData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatMiniappBindMobile(data)
        .then((data) => {
          setAccessToken(data.accessToken)
          resolve(data)
        })
        .catch((error) => {
          console.error("绑定手机号失败", error)
          reject(error)
        })
    })
  }

  // ==========================================================================
  // 用户信息方法
  // ==========================================================================

  /**
   * 检查会话状态
   * @returns 会话是否有效
   */
  const checkSession = (): Promise<boolean> => {
    return new Promise((resolve) => {
      AuthAPI.checkSession()
        .then((result) => {
          resolve(result.valid)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  /**
   * 获取用户信息
   */
  const getInfo = () => {
    return new Promise((resolve, reject) => {
      UserAPI.getUserInfo()
        .then((data) => {
          setUserInfo(data)
          userInfo.value = data
          resolve(data)
        })
        .catch((error) => {
          console.error("获取用户信息失败", error)
          reject(error)
        })
    })
  }

  /**
   * 登出
   */
  const logout = async () => {
    try {
      await AuthAPI.logout()
    } catch (error) {
      console.error("登出失败", error)
    } finally {
      clearTokens()
      Storage.remove(USER_INFO_KEY)
      userInfo.value = undefined
      uni.reLaunch({ url: "/pages/login/index" })
    }
  }

  /**
   * 判断用户信息是否完整
   * @returns 用户信息是否完整
   */
  const isUserInfoComplete = (): boolean => {
    if (!userInfo.value) return false
    return !!(userInfo.value.nickname && userInfo.value.avatar)
  }

  // ==========================================================================
  // 导出
  // ==========================================================================

  return {
    // 状态
    userInfo,

    // 登录方法
    login,
    loginBySms,
    loginByWechatMiniapp,
    loginByWechatMiniappPhone,
    bindMobileForWechatMiniapp,

    // 用户信息方法
    logout,
    getInfo,
    checkSession,
    isUserInfoComplete,
  }
})
