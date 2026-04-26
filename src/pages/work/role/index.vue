<template>
  <view class="page page--padding">
    <view>
      <wd-search
        v-model="queryParams.keywords"
        placeholder="搜索角色名称/编码"
        hide-cancel
        @search="handleSearch"
      />
    </view>

    <!-- 角色列表 -->
    <view class="mt-16rpx">
      <wd-card
        v-for="item in pageData"
        :key="item.id"
        custom-class="item-card"
        @click="openRoleDialog(item.id)"
      >
        <!-- 主信息行 -->
        <view class="flex-start">
          <view class="role-card__main">
            <view class="flex-start mt-12rpx">
              <text class="role-card__name">{{ item.name }}</text>
            </view>
            <text class="role-card__code">{{ item.code }}</text>
          </view>
          <wd-tag :type="item.status === 1 ? 'success' : 'danger'" plain>
            {{ item.status === 1 ? "正常" : "禁用" }}
          </wd-tag>
        </view>

        <!-- 辅助信息行 -->
        <view class="role-card__meta">
          <view class="role-card__detail">
            <wd-icon name="view" size="16" class="color-text-secondary" />
            <text class="role-card__detail-text">{{ item.dataScopeLabel }}</text>
          </view>
          <view class="role-card__detail">
            <wd-icon name="sort" size="16" class="color-text-secondary" />
            <text class="role-card__detail-text">排序: {{ item.sort }}</text>
          </view>
        </view>

        <!-- 元信息行 -->
        <view class="role-card__footer">
          <text class="role-card__time">{{ item.createTime }}</text>
          <view
            class="role-card__action"
            hover-class="role-card__action--hover"
            @click.stop="showRoleActions(item)"
          >
            <wd-icon name="more" size="18" class="color-text-secondary" />
          </view>
        </view>
      </wd-card>

      <wd-loadmore v-if="total > 0" :state="loadMoreState" @reload="fetchRoleList" />
      <wd-status-tip v-else-if="total === 0" image="search" tip="暂无数据" />
    </view>

    <!-- 弹窗表单 -->
    <wd-popup
      v-model="dialog.visible"
      position="bottom"
      custom-class="popup-bottom"
      @close="closeRoleDialog"
    >
      <view class="p-4">
        <view class="popup-title">
          {{ formData.id ? "编辑角色" : "新增角色" }}
        </view>
        <wd-form ref="formRef" :model="formData" :rules="rules">
          <wd-cell-group border>
            <wd-input v-model="formData.name" label="角色名称" required />
            <wd-input v-model="formData.code" label="角色编码" required />
            <wd-select-picker
              v-model="formData.dataScope"
              label="数据权限"
              :columns="dataScopeOptions"
              required
            />
            <wd-cell title="状态">
              <wd-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
            </wd-cell>
            <wd-cell title="排序">
              <wd-input-number v-model="formData.sort" :min="0" />
            </wd-cell>
          </wd-cell-group>
        </wd-form>
        <view class="popup-actions">
          <wd-button type="info" plain @click="closeRoleDialog">取消</wd-button>
          <wd-button type="primary" :loading="isSubmitting" @click="submitRoleForm">保存</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 浮动新增按钮 -->
    <wd-fab v-if="hasPermission('sys:role:create') && !dialog.visible" @click="openRoleDialog()" />

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
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { FormRules } from "wot-design-uni/components/wd-form/types";
import { useToast, useMessage } from "wot-design-uni";
import RoleAPI, { type RolePageQuery, RoleItem, RoleForm } from "@/api/role";
import { hasPermission } from "@/utils/permission";

const toast = useToast();
const { messageBox } = useMessage();
const loadMoreState = ref<LoadMoreState>("loading");
const formRef = ref();
const isSubmitting = ref(false);

const queryParams = reactive<RolePageQuery>({ pageNum: 1, pageSize: 10, keywords: "" });
const total = ref(0);
const pageData = ref<RoleItem[]>([]);
const dialog = reactive({ visible: false });

const actionSheetVisible = ref(false);
const actionSheetActions = ref<{ name: string; color?: string }[]>([]);
const currentActionItem = ref<any>(null);

const initialFormData: RoleForm = {
  id: undefined,
  name: undefined,
  code: undefined,
  dataScope: 1,
  status: 1,
  sort: 1,
};

const formData = reactive<RoleForm>({ ...initialFormData });

const dataScopeOptions = ref<Record<string, any>[]>([
  { label: "全部数据", value: 1 },
  { label: "部门及子部门数据", value: 2 },
  { label: "本部门数据", value: 3 },
  { label: "本人数据", value: 4 },
  { label: "自定义部门数据", value: 5 },
]);

const rules: FormRules = {
  name: [{ required: true, message: "请输入角色名称" }],
  code: [{ required: true, message: "请输入角色编码" }],
  dataScope: [{ required: true, message: "请选择数据权限" }],
};

// 搜索触发
const handleSearch = () => loadRoleList();

// 加载列表
function loadRoleList() {
  queryParams.pageNum = 1;
  fetchRoleList();
}

// 分页加载列表
function fetchRoleList() {
  loadMoreState.value = "loading";
  RoleAPI.getPage(queryParams)
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
async function openRoleDialog(id?: number) {
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
  dialog.visible = true;
  if (id) {
    formData.id = id;
    const data = await RoleAPI.getFormData(id);
    Object.assign(formData, data, { id });
  }
}

// 提交表单
function submitRoleForm() {
  formRef.value.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;
    isSubmitting.value = true;
    const action = formData.id ? RoleAPI.update(formData.id, formData) : RoleAPI.add(formData);
    action
      .then(() => {
        toast.success("操作成功");
        closeRoleDialog();
        loadRoleList();
      })
      .finally(() => {
        isSubmitting.value = false;
      });
  });
}

// 关闭弹窗
function closeRoleDialog() {
  dialog.visible = false;
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
}

// 操作菜单分发
function handleActionSelect({ value }: { value: string }) {
  const item = currentActionItem.value;
  if (value === "编辑") {
    openRoleDialog(item.id);
  } else if (value === "分配权限") {
    handleAssignPerm(item.id);
  } else if (value === "删除") {
    messageBox({
      title: "确认删除",
      msg: `确定要删除角色「${item.name}」吗？`,
      type: "warning",
    }).then(async () => {
      await RoleAPI.deleteByIds(String(item.id));
      toast.success("删除成功");
      loadRoleList();
    });
  }
}

// 更多操作
function showRoleActions(item: RoleItem) {
  const actions: { name: string; color?: string }[] = [];

  if (hasPermission("sys:role:update")) {
    actions.push({ name: "编辑" });
  }

  if (hasPermission("sys:role:assign")) {
    actions.push({ name: "分配权限" });
  }

  if (hasPermission("sys:role:delete")) {
    actions.push({ name: "删除", color: "var(--color-danger)" });
  }

  if (actions.length === 0) {
    toast.warning("暂无操作权限");
    return;
  }

  currentActionItem.value = item;
  actionSheetActions.value = actions;
  actionSheetVisible.value = true;
}

// 分配权限
function handleAssignPerm(id: number) {
  uni.navigateTo({
    url: "/pages/work/role/assign-perm?id=" + id,
  });
}

onReachBottom(() => {
  if (queryParams.pageNum * queryParams.pageSize < total.value) {
    fetchRoleList();
  } else {
    loadMoreState.value = "finished";
  }
});

onLoad(() => {
  loadRoleList();
});
</script>

<script lang="ts">
export default { options: { styleIsolation: "shared" } };
</script>

<route lang="json">
{
  "name": "role",
  "style": {
    "navigationBarTitleText": "角色管理"
  }
}
</route>

<style lang="scss" scoped>
.role-card__main {
  flex: 1;
}

.role-card__name {
  font-weight: 700;
  font-size: 32rpx;
}

.role-card__code {
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

.role-card__meta {
  display: flex;
  gap: 24rpx;
  margin-top: 12rpx;
}

.role-card__detail {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

.role-card__detail-text {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

.role-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.role-card__time {
  font-size: 24rpx;
  color: var(--color-text-placeholder);
}

.role-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
}

.role-card__action--hover {
  background: rgba(var(--color-text-placeholder-rgb, 148, 163, 184), 0.16);
}
</style>
