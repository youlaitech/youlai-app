<template>
  <view class="page page--padding">
    <view>
      <wd-search
        v-model="queryParams.keywords"
        placeholder="搜索菜单名称"
        hide-cancel
        @search="handleSearch"
      />
    </view>

    <!-- 菜单树形列表 -->
    <view class="mt-16rpx">
      <custom-tree
        :data="treeData"
        :default-expand-all="true"
        :show-action="true"
        @action="handleNodeAction"
      >
        <!-- 自定义节点内容：ID + 名称 + 状态 -->
        <template #content="{ node }">
          <view class="menu-node">
            <text class="w-120rpx text-24rpx color-text-secondary">{{ node.id }}</text>
            <wd-icon v-if="node.icon" :name="node.icon" size="16" class="color-primary" />
            <text class="flex-1 truncate">{{ node.name }}</text>
            <wd-tag class="flex-shrink-0" :type="getMenuTypeTag(node.type)" size="small">
              {{ getMenuTypeText(node.type) }}
            </wd-tag>
            <wd-tag
              class="flex-shrink-0"
              :type="node.visible === 1 ? 'success' : 'primary'"
              size="small"
            >
              {{ node.visible === 1 ? "显示" : "隐藏" }}
            </wd-tag>
          </view>
        </template>
      </custom-tree>

      <wd-status-tip v-if="menuList.length === 0" image="search" tip="暂无数据" />
    </view>

    <!-- 弹窗表单 -->
    <wd-popup
      v-model="dialog.visible"
      position="bottom"
      custom-class="popup-bottom-scroll"
      @close="closeMenuDialog"
    >
      <view class="p-4">
        <view class="popup-title">
          {{ formData.id ? "编辑菜单" : "新增菜单" }}
        </view>
        <scroll-view scroll-y class="max-h-60vh">
          <wd-form ref="formRef" :model="formData" :rules="rules">
            <wd-cell-group border>
              <wd-col-picker
                v-model="parentSelected"
                label="上级菜单"
                :columns="parentColumns"
                :column-change="handleParentColumnChange"
                required
                :display-format="displayParentFormat"
                @confirm="handleParentConfirm"
              />
              <wd-input v-model="formData.name" label="菜单名称" required />
              <wd-cell title="菜单类型" required>
                <wd-radio-group v-model="formData.type" size="smalll" shape="button" cell>
                  <wd-radio value="C">目录</wd-radio>
                  <wd-radio value="M">菜单</wd-radio>
                  <wd-radio value="B">按钮</wd-radio>
                </wd-radio-group>
              </wd-cell>
              <wd-input
                v-if="formData.type !== 'B'"
                v-model="formData.routePath"
                label="路由路径"
                placeholder="system 或 /system"
              />
              <wd-input
                v-if="formData.type === 'M'"
                v-model="formData.component"
                label="组件路径"
                placeholder="system/menu/index"
              />
              <wd-input
                v-if="formData.type === 'B'"
                v-model="formData.perm"
                label="权限标识"
                placeholder="sys:menu:create"
              />
              <wd-input v-model="formData.icon" label="图标" />
              <wd-cell title="排序">
                <wd-input-number v-model="formData.sort!" :min="0" />
              </wd-cell>
              <wd-cell title="状态">
                <wd-switch v-model="formData.visible" :active-value="1" :inactive-value="0" />
              </wd-cell>
            </wd-cell-group>
          </wd-form>
        </scroll-view>
        <view class="popup-actions">
          <wd-button type="info" plain @click="closeMenuDialog">取消</wd-button>
          <wd-button type="primary" :loading="isSubmitting" @click="submitMenuForm">保存</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 浮动新增按钮 -->
    <wd-fab v-if="hasPermission('sys:menu:create') && !dialog.visible" @click="openMenuDialog()" />

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
import MenuAPI, { type MenuQuery, MenuItem, MenuForm } from "@/api/menu";
import { hasPermission } from "@/utils/permission";
import CustomTree from "@/components/custom-tree/index.vue";

const toast = useToast();
const { messageBox } = useMessage();
const formRef = ref();
const isSubmitting = ref(false);

const queryParams = reactive<MenuQuery>({ keywords: "" });
const menuList = ref<MenuItem[]>([]);
const dialog = reactive({ visible: false });

const actionSheetVisible = ref(false);
const actionSheetActions = ref<{ name: string; color?: string }[]>([]);
const currentActionItem = ref<any>(null);

const initialFormData: MenuForm = {
  id: undefined,
  parentId: "0",
  name: undefined,
  type: "M",
  routePath: undefined,
  component: undefined,
  perm: undefined,
  icon: undefined,
  sort: 1,
  visible: 1,
};

const formData = reactive<MenuForm>({ ...initialFormData });

// 转换为树组件数据格式
const treeData = computed(() => menuList.value.map((menu) => transformMenuToTree(menu)));

function transformMenuToTree(menu: MenuItem): any {
  return {
    value: menu.id,
    label: menu.name,
    id: menu.id,
    name: menu.name,
    type: menu.type,
    icon: menu.icon,
    visible: menu.visible,
    perm: menu.perm,
    children: menu.children?.map((child) => transformMenuToTree(child)) || [],
  };
}

// 菜单类型标签
function normalizeMenuType(type?: string | number) {
  if (type === 1 || type === "1") return "C";
  if (type === 2 || type === "2") return "M";
  if (type === 3 || type === "3") return "B";
  return type;
}

function getMenuTypeTag(type?: string | number): "primary" | "success" | "warning" | "danger" {
  const map: Record<string, "primary" | "success" | "warning" | "danger"> = {
    C: "warning",
    M: "success",
    B: "danger",
  };
  const key = String(normalizeMenuType(type) || "M");
  return map[key] || "primary";
}

function getMenuTypeText(type?: string | number) {
  const map: Record<string, string> = { C: "目录", M: "菜单", B: "按钮" };
  const key = String(normalizeMenuType(type) || "M");
  return map[key] || "菜单";
}

// 上级菜单选择器
const parentSelected = ref<(string | number)[]>([]);
const parentColumns = ref<OptionType[][]>([]);
const parentOptions = ref<OptionType[]>([]);

const displayParentFormat = (selectedItems: Record<string, any>[]) => {
  if (!selectedItems || selectedItems.length === 0) return "";
  return selectedItems
    .map((item) => item?.label)
    .filter((label) => !!label)
    .join("/");
};

function findMenuPath(
  data: Record<string, any>[],
  targetId: string,
  path: (string | number)[] = []
): (string | number)[] | null {
  for (const item of data) {
    const currentPath = [...path, item.value];
    if (String(item.value) === targetId) {
      return currentPath;
    }
    if (item.children && item.children.length > 0) {
      const found = findMenuPath(item.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
}

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

const handleParentConfirm = ({ value }: any) => {
  parentSelected.value = value;
  formData.parentId = String(value[value.length - 1]) || "0";
};

const rules: FormRules = {
  name: [{ required: true, message: "请输入菜单名称" }],
  type: [{ required: true, message: "请选择菜单类型" }],
  parentId: [{ required: true, message: "请选择上级菜单" }],
};

const handleSearch = () => loadMenuList();

function loadMenuList() {
  MenuAPI.getList(queryParams).then((data) => {
    menuList.value = data;
  });
}

// 操作菜单分发
function handleActionSelect({ value }: { value: string }) {
  const menu = currentActionItem.value;
  if (value === "新增子菜单") {
    handleAddChild(menu);
  } else if (value === "编辑") {
    openMenuDialog(menu);
  } else if (value === "删除") {
    messageBox({
      title: "确认删除",
      msg: `确定要删除菜单「${menu.name}」吗？`,
      type: "warning",
    }).then(async () => {
      await MenuAPI.deleteById(menu.id!);
      toast.success("删除成功");
      loadMenuList();
    });
  }
}

// 处理节点操作按钮点击
function handleNodeAction(node: any) {
  const menu: MenuItem = {
    id: node.id,
    name: node.label,
    type: node.type,
    visible: node.visible,
    children: node.children,
  } as MenuItem;

  const actions: { name: string; color?: string }[] = [];

  if (hasPermission("sys:menu:create") && node.type !== 3) {
    actions.push({ name: "新增子菜单" });
  }

  if (hasPermission("sys:menu:update")) {
    actions.push({ name: "编辑" });
  }

  if (hasPermission("sys:menu:delete")) {
    actions.push({ name: "删除", color: "var(--color-danger)" });
  }

  if (actions.length === 0) {
    toast.warning("暂无操作权限");
    return;
  }

  currentActionItem.value = menu;
  actionSheetActions.value = actions;
  actionSheetVisible.value = true;
}

// 打开弹窗（新增/编辑）
async function openMenuDialog(menu?: MenuItem) {
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
  parentSelected.value = [];
  dialog.visible = true;

  const data = await MenuAPI.getOptions(true);
  parentOptions.value = data;
  const firstColumn: OptionType[] = [{ value: "0", label: "顶级菜单" }, ...data];
  parentColumns.value = [firstColumn];

  if (menu) {
    formData.id = menu.id;
    const form = await MenuAPI.getFormData(menu.id!);
    Object.assign(formData, form, { id: menu.id });

    if (form.parentId && String(form.parentId) !== "0") {
      const path = findMenuPath(data, String(form.parentId));
      if (path) {
        parentSelected.value = path;
        const columns: OptionType[][] = [firstColumn];
        let currentLevel = data;
        for (let i = 0; i < path.length - 1; i++) {
          const found = currentLevel.find((item) => String(item.value) === String(path[i]));
          if (found && found.children && found.children.length > 0) {
            columns.push(found.children);
            currentLevel = found.children;
          } else {
            break;
          }
        }
        parentColumns.value = columns;
      } else {
        parentSelected.value = [String(form.parentId)];
      }
    }
  }
}

// 新增子菜单
function handleAddChild(menu: MenuItem) {
  openMenuDialog({ id: undefined, parentId: menu.id } as MenuItem);
  formData.parentId = menu.id!;
  parentSelected.value = [menu.id!];
}

// 提交表单
function submitMenuForm() {
  formRef.value.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;
    isSubmitting.value = true;
    const action = formData.id ? MenuAPI.update(formData.id, formData) : MenuAPI.add(formData);
    action
      .then(() => {
        toast.success("操作成功");
        closeMenuDialog();
        loadMenuList();
      })
      .finally(() => {
        isSubmitting.value = false;
      });
  });
}

// 关闭弹窗
function closeMenuDialog() {
  dialog.visible = false;
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
}

onLoad(() => {
  loadMenuList();
});
</script>

<script lang="ts">
export default { options: { styleIsolation: "shared" } };
</script>

<route lang="json">
{
  "name": "menu",
  "style": {
    "navigationBarTitleText": "菜单管理"
  }
}
</route>

<style lang="scss" scoped>
.menu-node {
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  gap: 16rpx;
  align-items: center;
}
</style>
