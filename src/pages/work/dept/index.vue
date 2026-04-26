<template>
  <view class="page page--padding">
    <view>
      <wd-search
        v-model="queryParams.keywords"
        placeholder="搜索部门名称"
        hide-cancel
        @search="handleSearch"
      />
    </view>

    <!-- 部门树形列表 -->
    <view class="mt-16rpx">
      <CustomTree
        :data="treeData"
        :default-expand-all="true"
        :show-action="true"
        @action="handleNodeAction"
      >
        <!-- 自定义节点内容：ID + 名称 + 状态 -->
        <template #content="{ node }">
          <view class="dept-node">
            <text class="dept-node__id">{{ node.id }}</text>
            <text class="dept-node__name">{{ node.name }}</text>
            <wd-tag :type="node.status === 1 ? 'success' : 'danger'" size="small">
              {{ node.status === 1 ? "正常" : "禁用" }}
            </wd-tag>
          </view>
        </template>
      </CustomTree>

      <wd-status-tip v-if="deptList.length === 0" image="search" tip="暂无数据" />
    </view>

    <!-- 弹窗表单 -->
    <wd-popup
      v-model="dialog.visible"
      position="bottom"
      custom-class="popup-bottom"
      @close="closeDeptDialog"
    >
      <view class="p-4">
        <view class="popup-title">
          {{ formData.id ? "编辑部门" : "新增部门" }}
        </view>
        <wd-form ref="formRef" :model="formData" :rules="rules">
          <wd-cell-group border>
            <wd-col-picker
              v-model="parentSelected"
              label="上级部门"
              :columns="parentColumns"
              :column-change="handleParentColumnChange"
              required
              :display-format="displayParentFormat"
              @confirm="handleParentConfirm"
            />
            <wd-input v-model="formData.name" label="部门名称" required />
            <wd-input v-model="formData.code" label="部门编号" required />
            <wd-cell title="排序">
              <wd-input-number v-model="formData.sort" :min="0" />
            </wd-cell>
            <wd-cell title="状态">
              <wd-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
            </wd-cell>
          </wd-cell-group>
        </wd-form>
        <view class="popup-actions">
          <wd-button type="info" plain @click="closeDeptDialog">取消</wd-button>
          <wd-button type="primary" :loading="isSubmitting" @click="submitDeptForm">保存</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 浮动新增按钮 -->
    <wd-fab v-if="hasPermission('sys:dept:create') && !dialog.visible" @click="openDeptDialog()" />

    <!-- 操作菜单 -->
    <wd-action-sheet
      v-model="actionSheetVisible"
      :actions="actionSheetActions"
      cancel-text="取消"
      @select="handleActionSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";
import { FormRules } from "wot-design-uni/components/wd-form/types";
import { useToast, useMessage } from "wot-design-uni";
import DeptAPI, { type DeptQuery, DeptItem, DeptForm } from "@/api/dept";
import { hasPermission } from "@/utils/permission";
import CustomTree from "@/components/custom-tree/index.vue";

const toast = useToast();
const { messageBox } = useMessage();
const formRef = ref();
const isSubmitting = ref(false);

const queryParams = reactive<DeptQuery>({ keywords: "" });
const deptList = ref<DeptItem[]>([]);
const dialog = reactive({ visible: false });

const actionSheetVisible = ref(false);
const actionSheetActions = ref<{ name: string; color?: string }[]>([]);
const currentActionItem = ref<any>(null);

const initialFormData: DeptForm = {
  id: undefined,
  parentId: 0,
  name: undefined,
  code: undefined,
  sort: 1,
  status: 1,
};

const formData = reactive<DeptForm>({ ...initialFormData });

// 转换为树组件数据格式
const treeData = computed(() => deptList.value.map((dept) => transformDeptToTree(dept)));

function transformDeptToTree(dept: DeptItem): any {
  return {
    value: String(dept.id),
    label: dept.name,
    id: dept.id,
    name: dept.name,
    status: dept.status,
    children: dept.children?.map((child) => transformDeptToTree(child)) || [],
  };
}

// 上级部门选择器
const parentSelected = ref<(string | number)[]>([]);
const parentColumns = ref<OptionType[][]>([]);
const parentOptions = ref<OptionType[]>([]);

// 格式化上级部门展示
const displayParentFormat = (selectedItems: OptionType[]) => {
  if (!selectedItems || selectedItems.length === 0) return "";
  return selectedItems
    .map((item) => item?.label)
    .filter((label) => !!label)
    .join("/");
};

// 查找部门在树中的完整路径
function findDeptPath(data: OptionType[], targetId: string, path: string[] = []): string[] | null {
  for (const item of data) {
    const currentPath = [...path, String(item.value)];
    if (String(item.value) === targetId) {
      return currentPath;
    }
    if (item.children && item.children.length > 0) {
      const found = findDeptPath(item.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
}

// 上级部门列变化
const handleParentColumnChange = ({ selectedItem, resolve, finish }: any) => {
  if (String(selectedItem?.value) === "0") {
    finish();
    return;
  }
  const children = selectedItem.children;
  if (children && children.length > 0) {
    resolve(children);
  } else {
    finish();
  }
};

// 上级部门确认选择
const handleParentConfirm = ({ value }: any) => {
  parentSelected.value = value;
  formData.parentId = Number(value[value.length - 1]) || 0;
};

const rules: FormRules = {
  name: [{ required: true, message: "请输入部门名称" }],
  code: [{ required: true, message: "请输入部门编号" }],
  parentId: [{ required: true, message: "请选择上级部门" }],
};

// 搜索触发
const handleSearch = () => loadDeptList();

// 加载列表
function loadDeptList() {
  DeptAPI.getList(queryParams)
    .then((data) => {
      deptList.value = data;
    })
    .catch(() => {
      // API 层已处理错误提示
    });
}

// 操作菜单分发
function handleActionSelect({ value }: { value: string }) {
  const dept = currentActionItem.value;
  if (value === "新增子部门") {
    handleAddChild(dept);
  } else if (value === "编辑") {
    openDeptDialog(dept);
  } else if (value === "删除") {
    messageBox({
      title: "确认删除",
      msg: `确定要删除部门「${dept.name}」吗？`,
      type: "warning",
    }).then(async () => {
      await DeptAPI.deleteByIds(String(dept.id));
      toast.success("删除成功");
      loadDeptList();
    });
  }
}

// 处理节点操作按钮点击
function handleNodeAction(node: any) {
  const dept: DeptItem = {
    id: node.id,
    name: node.label,
    status: node.status,
    children: node.children,
  } as DeptItem;

  const actions: { name: string; color?: string }[] = [];

  if (hasPermission("sys:dept:create")) {
    actions.push({ name: "新增子部门" });
  }

  if (hasPermission("sys:dept:update")) {
    actions.push({ name: "编辑" });
  }

  if (hasPermission("sys:dept:delete")) {
    actions.push({ name: "删除", color: "var(--color-danger)" });
  }

  if (actions.length === 0) {
    toast.warning("暂无操作权限");
    return;
  }

  currentActionItem.value = dept;
  actionSheetActions.value = actions;
  actionSheetVisible.value = true;
}

// 打开弹窗（新增/编辑）
async function openDeptDialog(dept?: DeptItem) {
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
  parentSelected.value = [];
  dialog.visible = true;

  const data = await DeptAPI.getOptions();
  parentOptions.value = data;
  const firstColumn: OptionType[] = [{ value: "0", label: "顶级部门" }, ...data];
  parentColumns.value = [firstColumn];

  if (dept) {
    formData.id = dept.id;
    const form = await DeptAPI.getFormData(dept.id!);
    Object.assign(formData, form, { id: dept.id });

    if (form.parentId && form.parentId !== 0) {
      const path = findDeptPath(data, String(form.parentId));
      if (path) {
        parentSelected.value = path;
        const columns: OptionType[][] = [firstColumn];
        let currentLevel = data;
        for (let i = 0; i < path.length - 1; i++) {
          const found = currentLevel.find((item) => String(item.value) === path[i]);
          if (found && found.children) {
            columns.push(found.children);
            currentLevel = found.children;
          }
        }
        parentColumns.value = columns;
      } else {
        parentSelected.value = [String(form.parentId)];
      }
    }
  }
}

// 新增子部门
function handleAddChild(dept: DeptItem) {
  openDeptDialog({ id: undefined, parentId: dept.id } as DeptItem);
  formData.parentId = dept.id!;
  parentSelected.value = [String(dept.id)];
}

// 提交表单
function submitDeptForm() {
  formRef.value.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;
    isSubmitting.value = true;
    const action = formData.id ? DeptAPI.update(formData.id, formData) : DeptAPI.add(formData);
    action
      .then(() => {
        toast.success("操作成功");
        closeDeptDialog();
        loadDeptList();
      })
      .finally(() => {
        isSubmitting.value = false;
      });
  });
}

// 关闭弹窗
function closeDeptDialog() {
  dialog.visible = false;
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
}

onLoad(() => {
  loadDeptList();
});
</script>

<script lang="ts">
export default { options: { styleIsolation: "shared" } };
</script>

<route lang="json">
{
  "name": "dept",
  "style": {
    "navigationBarTitleText": "部门管理"
  }
}
</route>

<style lang="scss" scoped>
.dept-node {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 16rpx;
}

.dept-node__id {
  width: 120rpx;
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

.dept-node__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
