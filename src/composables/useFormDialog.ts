import { reactive, ref, type Ref } from "vue";
import { useToast } from "@wot-ui/ui";
import type { WdFormRef } from "@/utils/form-schema";
import { getErrorMessage } from "@/utils/error";

/**
 * 表单弹窗依赖的表单引用、数据与接口
 */
interface FormDialogOptions<F extends { id?: string }> {
  /** 表单组件引用，用于校验与重置 */
  formRef: Ref<WdFormRef | undefined>;
  /** 表单数据，关闭时原地重置为初始值 */
  formData: F;
  /** 新增时的初始值 */
  initialFormData: F;
  /** 按 id 拉取详情，返回值合并进表单 */
  loadDetail: (id: string) => Promise<Partial<F>>;
  /** 新增提交 */
  create: (data: F) => Promise<unknown>;
  /** 修改提交 */
  update: (id: string, data: F) => Promise<unknown>;
  /** 弹窗打开后、加载详情前的补充初始化 */
  onOpen?: () => void;
  /** 提交前的业务校验，返回 false 中止提交 */
  beforeSubmit?: () => boolean;
  /** 提交成功后刷新列表 */
  onSubmitted?: () => void;
}

/**
 * 表单弹窗的开关、提交与重置，收敛列表页重复的分页表单流程
 */
export function useFormDialog<F extends { id?: string }>(options: FormDialogOptions<F>) {
  const {
    formRef,
    formData,
    initialFormData,
    loadDetail,
    create,
    update,
    onOpen,
    beforeSubmit,
    onSubmitted,
  } = options;
  const toast = useToast();
  const dialog = reactive({ visible: false });
  const isSubmitting = ref(false);

  /**
   * 打开弹窗，传入 id 时加载详情回填
   */
  async function open(id?: string) {
    formRef.value?.reset();
    Object.assign(formData, initialFormData);
    dialog.visible = true;
    onOpen?.();

    if (!id) return;

    formData.id = id;
    try {
      const detail = await loadDetail(id);
      // 连续打开不同记录时，只回填最后一次请求的数据
      if (formData.id !== id) return;
      Object.assign(formData, detail, { id });
    } catch (error) {
      toast.error(getErrorMessage(error, "加载失败"));
      close();
    }
  }

  /**
   * 校验通过后按 id 判断新增或修改，成功后关闭弹窗并刷新列表
   */
  function submit() {
    formRef.value?.validate().then(({ valid }: { valid: boolean }) => {
      if (!valid) return;
      if (beforeSubmit && !beforeSubmit()) return;

      isSubmitting.value = true;
      const id = formData.id;
      const action = id ? update(id, formData) : create(formData);

      action
        .then(() => {
          toast.success("操作成功");
          close();
          onSubmitted?.();
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, "保存失败"));
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    });
  }

  /**
   * 关闭弹窗并清空表单，避免下次打开残留上次输入
   */
  function close() {
    dialog.visible = false;
    formRef.value?.reset();
    Object.assign(formData, initialFormData);
  }

  return { dialog, isSubmitting, open, submit, close };
}
