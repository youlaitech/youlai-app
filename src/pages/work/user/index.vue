<template>
  <view class="page page--padding">
    <view>
      <wd-search
        v-model="queryParams.keywords"
        placeholder="搜索用户名/手机号"
        hide-cancel
        @search="handleSearch"
      />
    </view>

    <!-- 排序筛选：搜索框→筛选 12rpx -->
    <view class="filter-bar" @click="closeOutside">
      <view class="flex-1">
        <wd-drop-menu>
          <wd-drop-menu-item
            v-model="sortValue"
            title="排序"
            :options="sortOptions"
            @change="handleSortChange"
          />
        </wd-drop-menu>
      </view>
      <wd-divider vertical />
      <view class="flex-1">
        <wd-drop-menu>
          <wd-drop-menu-item title="筛选" @open="handleFilterOpen">
            <view class="p-4">
              <wd-input
                v-model="queryParams.keywords"
                label="关键字"
                placeholder="用户名/昵称/手机号"
              />
              <cu-date-query v-model="queryParams.createTime" label="创建时间" />
              <view class="popup-actions">
                <wd-button type="info" plain @click="resetUserFilter">重置</wd-button>
                <wd-button type="primary" @click="applyUserFilter">查询</wd-button>
              </view>
            </view>
          </wd-drop-menu-item>
        </wd-drop-menu>
      </view>
    </view>

    <!-- 用户列表：筛选→列表 16rpx -->
    <view class="mt-16rpx">
      <wd-card
        v-for="item in pageData"
        :key="item.id"
        custom-class="item-card"
        @click="openUserDialog(item.id)"
      >
        <!-- 主信息行 -->
        <view class="flex-start">
          <image class="user-card__avatar" :src="item.avatar" mode="aspectFill" lazy-load />
          <view class="user-card__main">
            <view class="flex-start mt-12rpx">
              <text class="user-card__name">{{ item.nickname }}</text>
              <wd-icon
                v-if="item.gender === 1"
                name="gender-male"
                color="var(--color-primary)"
                class="ml-8rpx"
              />
              <wd-icon
                v-else-if="item.gender === 2"
                name="gender-female"
                color="var(--color-danger)"
                class="ml-8rpx"
              />
            </view>
            <text class="user-card__role">{{ item.roleNames }} · {{ item.deptName }}</text>
          </view>
          <wd-tag :type="item.status === 1 ? 'success' : 'danger'" plain>
            {{ item.status === 1 ? "正常" : "禁用" }}
          </wd-tag>
        </view>

        <!-- 辅助信息行 -->
        <view class="user-card__meta">
          <view v-if="item.mobile" class="user-card__contact">
            <wd-icon name="mobile" size="16" class="color-text-secondary" />
            <text class="user-card__contact-text">{{ item.mobile }}</text>
          </view>
          <view v-if="item.email" class="user-card__contact">
            <wd-icon name="mail" size="16" class="color-text-secondary" />
            <text class="user-card__contact-text">{{ item.email }}</text>
          </view>
        </view>

        <!-- 元信息行 -->
        <view class="user-card__footer">
          <text class="user-card__time">{{ item.createTime }}</text>
          <view
            class="user-card__action"
            hover-class="user-card__action--hover"
            @click.stop="showUserActions(item)"
          >
            <wd-icon name="more" size="18" class="color-text-secondary" />
          </view>
        </view>
      </wd-card>

      <wd-loadmore v-if="total > 0" :state="loadMoreState" @reload="fetchUserList" />
      <wd-status-tip v-else-if="total === 0" image="search" tip="暂无数据" />
    </view>

    <!-- 弹窗表单 -->
    <wd-popup
      v-model="dialog.visible"
      position="bottom"
      custom-class="popup-bottom"
      @close="closeUserDialog"
    >
      <view class="p-4">
        <view class="popup-title">
          {{ formData.id ? "编辑用户" : "新增用户" }}
        </view>
        <wd-form ref="formRef" :model="formData" :rules="rules">
          <wd-cell-group border>
            <wd-input
              v-model="formData.username"
              label="用户名"
              :readonly="!!formData.id"
              required
            />
            <wd-input v-model="formData.nickname" label="昵称" required />
            <wd-col-picker
              v-model="deptSelected"
              label="部门"
              :columns="deptColumns"
              :column-change="handleDeptColumnChange"
              required
              :display-format="displayDeptFormat"
              @confirm="handleDeptConfirm"
            />
            <wd-select-picker
              v-model="formData.roleIds"
              label="角色"
              :columns="roleOptions"
              required
            />
            <wd-input v-model="formData.mobile" label="手机号" />
            <wd-input v-model="formData.email" label="邮箱" />
            <wd-cell title="状态">
              <wd-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
            </wd-cell>
          </wd-cell-group>
        </wd-form>
        <view class="popup-actions">
          <wd-button type="info" plain @click="closeUserDialog">取消</wd-button>
          <wd-button type="primary" :loading="isSubmitting" @click="submitUserForm">保存</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 浮动新增按钮 -->
    <wd-fab v-if="hasPermission('sys:user:create') && !dialog.visible" @click="openUserDialog()" />

    <!-- 操作菜单 -->
    <wd-action-sheet
      v-model="actionSheetVisible"
      :actions="actionSheetActions"
      cancel-text="取消"
      @select="handleActionSelect"
    />

    <!-- 重置密码弹窗 -->
    <wd-popup v-model="resetPwdDialog.visible" position="bottom" custom-class="popup-bottom">
      <view class="p-4">
        <view class="popup-title">重置密码</view>
        <wd-form ref="resetPwdFormRef" :model="resetPwdForm">
          <wd-cell-group border>
            <wd-input
              v-model="resetPwdForm.password"
              label="新密码"
              placeholder="请输入新密码（至少6位）"
              prop="password"
              :rules="[
                { required: true, message: '请输入新密码' },
                { pattern: /^.{6,}$/, message: '密码至少需要6位字符' },
              ]"
            />
          </wd-cell-group>
        </wd-form>
        <view class="popup-actions">
          <wd-button type="info" plain @click="resetPwdDialog.visible = false">取消</wd-button>
          <wd-button
            type="primary"
            :loading="resetPwdDialog.isSubmitting"
            @click="handleResetPassword"
          >
            确认
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { FormRules } from "wot-design-uni/components/wd-form/types";
import { useQueue, useToast, useMessage } from "wot-design-uni";
import UserAPI, { type UserPageQuery, UserItem, UserForm } from "@/api/user";
import RoleAPI from "@/api/role";
import DeptAPI from "@/api/dept";
import { hasPermission } from "@/utils/permission";

const toast = useToast();
const { messageBox } = useMessage();
const { closeOutside } = useQueue();
const loadMoreState = ref<LoadMoreState>("loading");
const formRef = ref();
const isSubmitting = ref(false);

const sortValue = ref(0);
const sortOptions = ref([
  { label: "默认排序", value: 0 },
  { label: "最近创建", value: 1 },
  { label: "最近更新", value: 2 },
]);

const queryParams = reactive<UserPageQuery>({ pageNum: 1, pageSize: 10, keywords: "" });
const total = ref(0);
const pageData = ref<UserItem[]>([]);
const dialog = reactive({ visible: false });

const initialFormData: UserForm = {
  id: undefined,
  roleIds: [],
  username: undefined,
  nickname: undefined,
  deptId: undefined,
  mobile: undefined,
  email: undefined,
  status: 1,
};

const formData = reactive<UserForm>({ ...initialFormData });
const roleOptions = ref<Record<string, any>[]>([]);
const deptOptions = ref<OptionType[]>([]);

// 部门多列选择器数据
const deptSelected = ref<(string | number)[]>([]);
const deptColumns = ref<Record<string, any>[][]>([]);

// 格式化部门展示
const displayDeptFormat = (selectedItems: Record<string, any>[]) => {
  return selectedItems.map((item) => item.label).join("/");
};

// 查找部门在树中的完整路径
function findDeptPath(data: any[], targetId: string, path: string[] = []): string[] | null {
  for (const item of data) {
    const currentPath = [...path, item.value];
    if (item.value === targetId) {
      return currentPath;
    }
    if (item.children && item.children.length > 0) {
      const found = findDeptPath(item.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
}

// 部门列变化（动态加载子部门）
const handleDeptColumnChange = ({ selectedItem, resolve, finish }: any) => {
  const children = selectedItem.children;
  if (children && children.length > 0) {
    resolve(children);
  } else {
    finish();
  }
};

// 部门确认选择
const handleDeptConfirm = ({ value, selectedItems }: any) => {
  deptSelected.value = value;
  // 取最后一个选中的部门ID
  formData.deptId = value[value.length - 1];
};

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户名" }],
  nickname: [{ required: true, message: "请输入昵称" }],
  roleIds: [{ required: true, message: "请选择角色" }],
  deptId: [{ required: true, message: "请选择部门" }],
};

// 排序切换
const handleSortChange = ({ value }: { value: string | number }) => {
  const num = Number(value);
  if (num === 1) {
    queryParams.field = "create_time";
    queryParams.direction = "desc";
  } else if (num === 2) {
    queryParams.field = "update_time";
    queryParams.direction = "desc";
  } else {
    queryParams.field = "";
    queryParams.direction = "";
  }
  loadUserList();
};

const handleFilterOpen = () => {};

// 搜索触发
const handleSearch = () => loadUserList();

// 加载列表
function loadUserList() {
  queryParams.pageNum = 1;
  fetchUserList();
}
// 应用筛选并刷新
function applyUserFilter() {
  closeOutside();
  loadUserList();
}
// 重置筛选并刷新
function resetUserFilter() {
  queryParams.keywords = "";
  delete queryParams.createTime;
  queryParams.field = "";
  queryParams.direction = "";
  sortValue.value = 0;
  applyUserFilter();
}

// 分页加载列表
function fetchUserList() {
  loadMoreState.value = "loading";
  UserAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
      queryParams.pageNum++;
    })
    .catch(() => {
      pageData.value = [];
    })
    .finally(() => {
      loadMoreState.value = "finished";
    });
}

// 打开弹窗（新增/编辑）
async function openUserDialog(id?: number) {
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
  deptSelected.value = [];
  dialog.visible = true;
  roleOptions.value = await RoleAPI.getOptions();
  const deptData = await DeptAPI.getOptions();
  deptOptions.value = deptData;

  if (id) {
    formData.id = id;
    const data = await UserAPI.getFormData(id);
    Object.assign(formData, data, { id });
    // 编辑时回显部门选择（需要完整路径和预加载所有层级数据）
    if (data.deptId) {
      const path = findDeptPath(deptData, String(data.deptId));
      if (path) {
        deptSelected.value = path;
        // 预加载所有层级的 columns
        const columns: any[] = [deptData];
        let currentLevel = deptData;
        for (let i = 0; i < path.length - 1; i++) {
          const found = currentLevel.find((item: any) => item.value === path[i]);
          if (found && found.children) {
            columns.push(found.children);
            currentLevel = found.children;
          }
        }
        deptColumns.value = columns;
      } else {
        deptSelected.value = [String(data.deptId)];
        deptColumns.value = [deptData];
      }
    } else {
      deptColumns.value = [deptData];
    }
  } else {
    deptColumns.value = [deptData];
  }
}

// 提交表单
function submitUserForm() {
  formRef.value.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;
    isSubmitting.value = true;
    const action = formData.id ? UserAPI.update(formData.id, formData) : UserAPI.add(formData);
    action
      .then(() => {
        toast.success("操作成功");
        closeUserDialog();
        loadUserList();
      })
      .finally(() => {
        isSubmitting.value = false;
      });
  });
}

// 关闭弹窗
function closeUserDialog() {
  dialog.visible = false;
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
}

const actionSheetVisible = ref(false);
const actionSheetActions = ref<{ name: string; color?: string }[]>([]);
const pendingAction = ref<Record<string, () => void>>({});

const resetPwdDialog = reactive({
  visible: false,
  isSubmitting: false,
  userId: undefined as number | undefined,
});
const resetPwdForm = reactive({ password: "" });
const resetPwdFormRef = ref();

// 更多操作
function showUserActions(item: UserItem) {
  const actions: { name: string; color?: string }[] = [];
  const actionMap: Record<string, () => void> = {};

  // 重置密码
  if (hasPermission("sys:user:reset-password")) {
    actions.push({ name: "重置密码" });
    actionMap["重置密码"] = () => openResetPwdDialog(item);
  }

  // 编辑
  if (hasPermission("sys:user:update")) {
    actions.push({ name: "编辑" });
    actionMap["编辑"] = () => openUserDialog(item.id);
  }

  // 删除
  if (hasPermission("sys:user:delete")) {
    actions.push({ name: "删除", color: "var(--color-danger)" });
    actionMap["删除"] = async () => {
      try {
        await messageBox({
          title: "确认删除",
          msg: `确定要删除用户「${item.nickname}」吗？`,
          type: "warning",
        });
        await UserAPI.deleteByIds(String(item.id));
        toast.success("删除成功");
        loadUserList();
      } catch {
        // 用户取消操作
      }
    };
  }

  if (actions.length === 0) {
    toast.warning("暂无操作权限");
    return;
  }

  actionSheetActions.value = actions;
  pendingAction.value = actionMap;
  actionSheetVisible.value = true;
}

function handleActionSelect({ value }: { value: string }) {
  pendingAction.value[value]?.();
}

// 打开重置密码弹窗
function openResetPwdDialog(item: UserItem) {
  resetPwdForm.password = "";
  resetPwdDialog.userId = item.id;
  resetPwdDialog.visible = true;
  nextTick(() => {
    resetPwdFormRef.value?.reset();
  });
}

// 重置密码
async function handleResetPassword() {
  const valid = await resetPwdFormRef.value?.validate();
  if (!valid || valid.valid === false) return;
  if (!resetPwdDialog.userId) return;

  resetPwdDialog.isSubmitting = true;
  try {
    await UserAPI.resetPassword(resetPwdDialog.userId, resetPwdForm.password);
    toast.success("密码重置成功");
    resetPwdDialog.visible = false;
  } catch (error) {
    // API 已处理错误提示
  } finally {
    resetPwdDialog.isSubmitting = false;
  }
}

onReachBottom(() => {
  if (queryParams.pageNum * queryParams.pageSize < total.value) {
    fetchUserList();
  } else {
    loadMoreState.value = "finished";
  }
});

onLoad(() => {
  loadUserList();
});
</script>

<script lang="ts">
export default { options: { styleIsolation: "shared" } };
</script>

<route lang="json">
{
  "name": "user",
  "style": {
    "navigationBarTitleText": "用户管理"
  }
}
</route>

<style lang="scss" scoped>
.user-card__avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.user-card__main {
  flex: 1;
  margin-left: 16rpx;
}

.user-card__name {
  font-weight: 700;
  font-size: 32rpx;
}

.user-card__role {
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

.user-card__meta {
  display: flex;
  gap: 24rpx;
  margin-top: 12rpx;
}

.user-card__contact {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

.user-card__contact-text {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.user-card__time {
  font-size: 24rpx;
  color: var(--color-text-placeholder);
}

.user-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
}

.user-card__action--hover {
  background: rgba(var(--color-text-placeholder-rgb, 148, 163, 184), 0.16);
}
</style>
