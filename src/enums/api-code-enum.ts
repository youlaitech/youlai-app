/**
 * 客户端使用的后端业务响应码
 */
export const enum ApiCode {
  /** 成功 */
  SUCCESS = "00000",

  /** 访问令牌无效或已过期 */
  ACCESS_TOKEN_INVALID = "A0230",

  /** 刷新令牌无效或已过期 */
  REFRESH_TOKEN_INVALID = "A0231",

  /** 实时通信未启用 */
  REALTIME_DISABLED = "B0102",
}
