<template>
  <view class="page page--padding page--pt">
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
        custom-class="list-card"
        @click="openUserDialog(item.id)"
      >
        <!-- 主信息行 -->
        <view class="flex-start">
          <wd-img :src="item.avatar" width="80rpx" height="80rpx" round />
          <view class="flex-1 ml-16rpx">
            <view class="flex-start mt-12rpx">
              <text class="font-bold text-32rpx">{{ item.nickname }}</text>
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
            <text class="text-24rpx color-text-secondary">
              {{ item.roleNames }} · {{ item.deptName }}
            </text>
          </view>
          <wd-tag :type="item.status === 1 ? 'success' : 'danger'" plain>
            {{ item.status === 1 ? "正常" : "禁用" }}
          </wd-tag>
        </view>

        <!-- 辅助信息行 -->
        <view class="flex gap-24rpx mt-12rpx">
          <view v-if="item.mobile" class="flex-start min-w-0">
            <wd-icon name="mobile" size="16" class="color-text-secondary" />
            <text class="ml-8rpx text-24rpx color-text-secondary truncate">{{ item.mobile }}</text>
          </view>
          <view v-if="item.email" class="flex-start min-w-0">
            <wd-icon name="mail" size="16" class="color-text-secondary" />
            <text class="ml-8rpx text-24rpx color-text-secondary truncate">{{ item.email }}</text>
          </view>
        </view>

        <!-- 元信息行 -->
        <view class="flex-between mt-16rpx">
          <text class="text-24rpx color-text-placeholder">{{ item.createTime }}</text>
          <view
            class="w-88rpx h-88rpx flex-center rounded-full"
            hover-class="bg-[var(--color-text-placeholder)]/16"
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
      custom-style="border-radius: 24rpx 24rpx 0 0"
      @close="closeUserDialog"
    >
      <view class="p-4">
        <view class="text-center font-bold text-32rpx mb-4">
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
            <wd-select-picker
              v-model="formData.roleIds"
              label="角色"
              :columns="roleOptions"
              required
            />
            <CuPicker v-model="formData.deptId" v-model:data="deptOptions" label="部门" required />
            <wd-input v-model="formData.mobile" label="手机号" />
            <wd-input v-model="formData.email" label="邮箱" />
            <wd-cell title="状态">
              <wd-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
            </wd-cell>
          </wd-cell-group>
        </wd-form>
        <view class="popup-actions">
          <wd-button type="info" plain @click="closeUserDialog">取消</wd-button>
          <wd-button type="primary" :loading="submitting" @click="submitUserForm">保存</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 浮动新增按钮 -->
    <wd-fab
      v-if="hasPermission('sys:user:create') && !dialog.visible"
      type="primary"
      position="right-bottom"
      :expandable="false"
      custom-class="fab--small"
      @click="openUserDialog()"
    />
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { FormRules } from "wot-design-uni/components/wd-form/types";
import { useMessage, useQueue } from "wot-design-uni";
import UserAPI, { type UserPageQuery, UserPageVO, UserForm } from "@/api/user";
import RoleAPI from "@/api/role";
import DeptAPI from "@/api/dept";
import { hasPermission } from "@/utils/permission";

const message = useMessage();
const { closeOutside } = useQueue();
const loadMoreState = ref<LoadMoreState>("loading");
const formRef = ref();
const submitting = ref(false);

const sortValue = ref(0);
const sortOptions = ref([
  { label: "默认排序", value: 0 },
  { label: "最近创建", value: 1 },
  { label: "最近更新", value: 2 },
]);

const queryParams = reactive<UserPageQuery>({ pageNum: 1, pageSize: 10, keywords: "" });
const total = ref(0);
const pageData = ref<UserPageVO[]>([]);
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
  queryParams.createTime = undefined;
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
  dialog.visible = true;
  roleOptions.value = await RoleAPI.getOptions();
  deptOptions.value = await DeptAPI.getOptions();
  if (id) {
    formData.id = id;
    const data = await UserAPI.getFormData(id);
    Object.assign(formData, data, { id });
  }
}

// 提交表单
function submitUserForm() {
  formRef.value.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;
    submitting.value = true;
    const action = formData.id ? UserAPI.update(formData.id, formData) : UserAPI.add(formData);
    action
      .then(() => {
        message.show(formData.id ? "修改成功" : "添加成功");
        closeUserDialog();
        loadUserList();
      })
      .finally(() => {
        submitting.value = false;
      });
  });
}

// 关闭弹窗
function closeUserDialog() {
  dialog.visible = false;
  formRef.value?.reset();
  Object.assign(formData, initialFormData);
}

// 更多操作
function showUserActions(item: UserPageVO) {
  const actions: string[] = [];
  const actionMap: Record<string, () => void> = {};

  // 编辑
  if (hasPermission("sys:user:update")) {
    actions.push("编辑");
    actionMap["编辑"] = () => openUserDialog(item.id);
  }

  // 删除
  if (hasPermission("sys:user:delete")) {
    actions.push("删除");
    actionMap["删除"] = async () => {
      const { confirm } = await uni.showModal({
        title: "确认删除",
        content: `确定要删除用户「${item.nickname}」吗？`,
      });
      if (confirm) {
        await UserAPI.deleteByIds(String(item.id));
        message.show("删除成功");
        loadUserList();
      }
    };
  }

  if (actions.length === 0) {
    message.show("暂无操作权限");
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

onReachBottom(() => {
  if (queryParams.pageNum * queryParams.pageSize < total.value) {
    fetchUserList();
  } else {
    loadMoreState.value = "finished";
  }
});

onLoad(() => loadUserList());
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

<style lang="scss" scoped></style>
