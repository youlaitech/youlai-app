<template>
  <view class="page page--padding">
    <wd-card v-if="userDetail">
      <template #title>
        <view class="w-full flex-between">
          <view class="flex-center">
            <wd-img :width="60" :height="60" round :src="userDetail.avatar" />
            <view class="ml-3">
              <view class="text-lg font-semibold text-slate-900">
                {{ userDetail.nickname }}
                <wd-icon v-if="userDetail.gender == 1" name="gender-male" class="color-#4D80F0" />
                <wd-icon
                  v-else-if="userDetail.gender == 2"
                  name="gender-female"
                  class="color-#FA4350"
                />
              </view>
              <view class="mt-1 text-sm text-slate-500">{{ userDetail.deptName }}</view>
            </view>
          </view>
          <wd-tag v-if="userDetail.status === 1" type="success">正常</wd-tag>
          <wd-tag v-else-if="userDetail.status === 0" type="warning">禁用</wd-tag>
        </view>
      </template>

      <wd-cell-group border>
        <wd-cell title="用户名" :value="userDetail.username" icon="user" />
        <wd-cell title="角色" :value="userDetail.roleNames" icon="usergroup" />
        <wd-cell title="手机号码" :value="userDetail.mobile" icon="mobile" />
        <wd-cell title="邮箱" :value="userDetail.email" icon="mail" />
        <wd-cell title="创建时间" :value="userDetail.createTime" icon="calendar" />
      </wd-cell-group>
    </wd-card>

    <wd-loading v-else-if="loading" />
    <wd-status-tip v-else image="error" tip="加载失败" />

    <view class="mt-8 px-6">
      <wd-button v-if="hasPermission('sys:user:update')" type="primary" block @click="handleEdit">
        编辑
      </wd-button>
      <wd-button
        v-if="hasPermission('sys:user:delete')"
        type="error"
        block
        class="mt-3"
        @click="handleDelete"
      >
        删除
      </wd-button>
    </view>

    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";
import { useMessage } from "wot-design-uni";

import UserAPI, { UserPageVO } from "@/api/user";
import { hasPermission } from "@/utils/permission";

const message = useMessage();

const userDetail = ref<UserPageVO>();
const loading = ref(true);
const userId = ref<number>(0);

onLoad((options) => {
  const id = Number(options?.id);
  if (id) {
    userId.value = id;
    loadDetail(id);
  }
});

function loadDetail(id: number) {
  loading.value = true;
  UserAPI.getFormData(id)
    .then((data) => {
      userDetail.value = data as unknown as UserPageVO;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleEdit() {
  uni.navigateTo({
    url: `/pages/work/user/index?id=${userId.value}`,
  });
}

function handleDelete() {
  message
    .confirm({
      msg: "确认删除该用户吗？",
      title: "提示",
    })
    .then(() => {
      UserAPI.deleteByIds(userId.value + "").then(() => {
        message.show("删除成功");
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      });
    });
}
</script>
