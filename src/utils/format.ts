/**
 * 把字节数格式化为带单位的文本，KB 及以上保留两位小数
 */
export function formatBytes(size: number): string {
  if (size < 1024) {
    return size + "B";
  }
  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + "KB";
  }
  return (size / 1024 / 1024).toFixed(2) + "MB";
}
