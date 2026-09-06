import { useToast } from "@wot-ui/ui";
import { useCountdown } from "@/composables/useCountdown";
import { getErrorMessage } from "@/utils";
import AuthAPI from "@/api/auth";

/** 手机号格式校验 */
export function isValidMobile(mobile: string): boolean {
  return /^1\d{10}$/.test((mobile || "").trim());
}

/**
 * 短信验证码发送（含 60s 倒计时）
 *
 * @param options.sentDelay 发送成功后延时毫秒数，默认 0
 * @returns countdown 剩余秒数、send 发送函数、reset 重置倒计时
 */
export function useSmsCode() {
  const toast = useToast();
  const { countdown, start, stop } = useCountdown(60);

  /** 发送验证码，失败提示由这里统一处理 */
  async function send(mobile: string, fallback = "发送失败"): Promise<boolean> {
    if (countdown.value > 0) return false;
    if (!isValidMobile(mobile)) {
      toast.error("请输入正确的手机号");
      return false;
    }
    try {
      await AuthAPI.sendSmsLoginCode(mobile.trim());
      toast.success("验证码已发送");
      start();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, fallback));
      return false;
    }
  }

  function reset() {
    stop();
  }

  return { countdown, send, reset };
}
