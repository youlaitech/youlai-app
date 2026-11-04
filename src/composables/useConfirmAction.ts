import { useDialog, useToast } from "@wot-ui/ui";
import { getErrorMessage } from "@/utils/error";

/**
 * 危险操作确认流程
 *
 * 确认弹窗 → 执行 → 结果提示，与操作菜单、表单弹窗等界面无关
 */
export function useConfirmAction() {
  const toast = useToast();
  const { confirm } = useDialog();

  /**
   * 确认后执行操作
   *
   * 用户取消时静默结束；执行结果由本方法提示，调用方无需处理异常
   *
   * @param options.msg - 确认弹窗的提示文案
   * @param options.action - 确认后执行的操作
   * @param options.title - 确认弹窗标题，默认「确认删除」
   * @param options.successText - 成功提示文案，默认「删除成功」
   * @param options.errorText - 失败提示文案，默认「操作失败」
   */
  async function confirmAction(options: {
    msg: string;
    action: () => Promise<void>;
    title?: string;
    successText?: string;
    errorText?: string;
  }): Promise<void> {
    const {
      msg,
      action,
      title = "确认删除",
      successText = "删除成功",
      errorText = "操作失败",
    } = options;

    try {
      await confirm({ title, msg, headerImage: "warning" });
    } catch {
      // 用户取消确认弹窗
      return;
    }

    try {
      await action();
      toast.success(successText);
    } catch (error) {
      toast.error(getErrorMessage(error, errorText));
    }
  }

  return { confirmAction };
}
