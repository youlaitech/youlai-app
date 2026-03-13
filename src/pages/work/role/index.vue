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
          <view class="flex-1">
            <view class="flex-start mt-12rpx">
              <text class="font-bold text-32rpx">{{ item.name }}</text>
            </view>
            <text class="text-24rpx color-text-secondary">{{ item.code }}</text>
          </view>
          <wd-tag :type="item.status === 1 ? 'success' : 'danger'" plain>
            {{ item.status === 1 ? "正常" : "禁用" }}
          </wd-tag>
        </view>

        <!-- 辅助信息行 -->
        <view class="flex gap-24rpx mt-12rpx">
          <view class="flex-start min-w-0">
            <wd-icon name="view" size="16" class="color-text-secondary" />
            <text class="ml-8rpx text-24rpx color-text-secondary">{{ item.dataScopeLabel }}</text>
          </view>
          <view class="flex-start min-w-0">
            <wd-icon name="sort" size="16" class="color-text-secondary" />
            <text class="ml-8rpx text-24rpx color-text-secondary">排序: {{ item.sort }}</text>
          </view>
        </view>

        <!-- 元信息行 -->
        <view class="flex-between mt-16rpx">
          <text class="text-24rpx color-text-placeholder">{{ item.createTime }}</text>
          <view
            class="w-88rpx h-88rpx flex-center rounded-full"
            hover-class="bg-[var(--color-text-placeholder)]/16"
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
      custom-style="border-radius: 24rpx 24rpx 0 0"
      @close="closeRoleDialog"
    >
      <view class="p-4">
        <view class="text-center font-bold text-32rpx mb-4">
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
          <wd-button type="primary" :loading="submitting" @click="submitRoleForm">保存</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 浮动新增按钮 -->
    <view
      v-if="hasPermission('sys:role:create') && !dialog.visible"
      class="fab-add"
      hover-class="fab-add:active"
      @click.stop="openRoleDialog()"
    >
      <wd-icon name="add" size="44rpx" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { FormRules } from "wot-design-uni/components/wd-form/types";
import { useToast } from "wot-design-uni";
import RoleAPI, { type RolePageQuery, RolePageVO, RoleForm } from "@/api/role";
import { hasPermission } from "@/utils/permission";

const toast = useToast();
const loadMoreState = ref<LoadMoreState>("loading");
const formRef = ref();
const submitting = ref(false);

const queryParams = reactive<RolePageQuery>({ pageNum: 1, pageSize: 10, keywords: "" });
const total = ref(0);
const pageData = ref<RolePageVO[]>([]);
const dialog = reactive({ visible: false });

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
    submitting.value = true;
    const action = formData.id ? RoleAPI.update(formData.id, formData) : RoleAPI.add(formData);
    action
      .then(() => {
        toast.success("操作成功");
        closeRoleDialog();
        loadRoleList();
      })
      .finally(() => {
        submitting.value = false;
      });
  });
}

// 关闭弹窗
function closeRoleDialog() {
  dialog.visible = false;
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
}

// 更多操作
function showRoleActions(item: RolePageVO) {
  const actions: string[] = [];
  const actionMap: Record<string, () => void> = {};

  // 编辑
  if (hasPermission("sys:role:update")) {
    actions.push("编辑");
    actionMap["编辑"] = () => openRoleDialog(item.id);
  }

  // 分配权限
  if (hasPermission("sys:role:assign")) {
    actions.push("分配权限");
    actionMap["分配权限"] = () => handleAssignPerm(item.id);
  }

  // 删除
  if (hasPermission("sys:role:delete")) {
    actions.push("删除");
    actionMap["删除"] = async () => {
      const { confirm } = await uni.showModal({
        title: "确认删除",
        content: `确定要删除角色「${item.name}」吗？`,
      });
      if (confirm) {
        await RoleAPI.deleteByIds(String(item.id));
        toast.success("删除成功");
        loadRoleList();
      }
    };
  }

  if (actions.length === 0) {
    toast.warning("暂无操作权限");
    return;
  }

  uni.showActionSheet({
    itemList: actions,
    success: ({ tapIndex }) => {
      const action = actions[tapIndex];
      actionMap[action]?.();
    },
  });
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
