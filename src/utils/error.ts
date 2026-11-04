/**
 * 提取错误提示文案，无有效信息时返回默认文案
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
