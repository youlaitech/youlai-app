import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, THEME_MODE_KEY, THEME_COLOR_KEY } from "@/constants";

// 清理业务缓存时保留登录凭证和主题设置
const PRESERVED_KEYS = [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, THEME_MODE_KEY, THEME_COLOR_KEY];

/**
 * 将值序列化为 JSON 后同步保存
 */
function set<T>(key: string, value: T): void {
  uni.setStorageSync(key, JSON.stringify(value));
}

/**
 * 读取 JSON 缓存，缺失时返回默认值
 */
function get<T>(key: string, defaultValue?: T): T {
  const value = uni.getStorageSync(key);
  // 只把空值视为缺失，避免把 0、false 这类合法缓存当成未写入
  if (value === "" || value === null || value === undefined) return defaultValue as T;

  try {
    return JSON.parse(value);
  } catch {
    // 兼容未序列化的旧缓存，解析失败时保留原值
    return value as unknown as T;
  }
}

/**
 * 删除指定缓存项
 */
function remove(key: string): void {
  uni.removeStorageSync(key);
}

/**
 * 按 UTF-8 估算文本字节数
 */
function byteLength(value: string): number {
  let bytes = 0;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : 3;
  }
  return bytes;
}

/**
 * 估算可清理缓存内容的字节数，不含登录凭证与主题设置
 */
function getClearableBytes(): number {
  const { keys } = uni.getStorageInfoSync();
  return keys.reduce((total, key) => {
    if (PRESERVED_KEYS.includes(key)) {
      return total;
    }
    const value = uni.getStorageSync(key);
    if (value === null || value === undefined || value === "") {
      return total;
    }
    const text = typeof value === "string" ? value : JSON.stringify(value) || "";
    return total + byteLength(text);
  }, 0);
}

/**
 * 清理业务缓存，保留登录凭证与主题设置，用户信息等缓存一并清除
 *
 * @returns 删除的缓存项数
 */
function clearCache(): number {
  const { keys } = uni.getStorageInfoSync();
  let removed = 0;
  keys.forEach((key) => {
    if (PRESERVED_KEYS.includes(key)) {
      return;
    }
    uni.removeStorageSync(key);
    removed += 1;
  });
  return removed;
}

/**
 * 本地 JSON 存储与业务缓存清理
 */
export const Storage = {
  set,
  get,
  remove,
  getClearableBytes,
  clearCache,
};
