/**
 * 防抖函数
 * @param fn 函数
 * @param delay 延迟时间
 * @returns
 */
const debounce = <T extends (...args: any[]) => unknown>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

export { debounce };

/**
 * 从 catch 捕获的 unknown 错误中提取提示文案
 * @param error catch 捕获的错误对象
 * @param fallback 无有效信息时的兜底文案
 * @returns 错误提示文案
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  if (typeof error === "object" && error !== null) {
    const { message, msg, errMsg } = error as {
      message?: unknown;
      msg?: unknown;
      errMsg?: unknown;
    };
    if (typeof message === "string" && message) return message;
    if (typeof msg === "string" && msg) return msg;
    if (typeof errMsg === "string" && errMsg) return errMsg;
  }
  return fallback;
}
