<template>
  <view class="work">
    <template v-for="(item, index) in visibleGridList" :key="index">
      <wd-card :title="item.title">
        <wd-grid clickable :column="4">
          <wd-grid-item
            v-for="(child, childIndex) in item.children"
            :key="childIndex"
            use-slot
            @itemclick="handleNavClick(child)"
          >
            <view class="p-2">
              <image class="w-72rpx h-72rpx rounded-8rpx" :src="child.icon" />
            </view>
            <view class="text">{{ child.title }}</view>
          </wd-grid-item>
        </wd-grid>
      </wd-card>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "uni-mini-router";
import { useUserStore } from "@/store";
import { menuConfig } from "@/config/menu";

const router = useRouter();
const userStore = useUserStore();

// 用户权限列表
const userPerms = computed(() => userStore.userInfo?.perms || []);

// 检查是否有权限
const hasPermission = (perm: string) => {
  if (!perm) return true; // 无权限要求则显示
  return userPerms.value.includes(perm) || userPerms.value.includes("*:*:*");
};

// 根据权限过滤后的菜单列表
const visibleGridList = computed(() => {
  return menuConfig
    .map((group) => ({
      ...group,
      children: group.children.filter((item) => hasPermission(item.perm)),
    }))
    .filter((group) => group.children.length > 0);
});

// 处理导航点击
function handleNavClick(item: any) {
  try {
    router.push({ path: item.url });
  } catch (e) {
    console.error("[work] router.push failed:", e, item);
  }
}
</script>

<route lang="json">
{
  "name": "work",
  "style": {
    "navigationBarTitleText": "工作台"
  },
  "layout": "tabbar"
}
</route>

<style lang="scss" scoped>
/* stylelint-disable selector-type-no-unknown */
page {
  background: #f8f8f8;
}
/* stylelint-enable selector-type-no-unknown */

.work {
  padding: 40rpx 0;
}
</style>
