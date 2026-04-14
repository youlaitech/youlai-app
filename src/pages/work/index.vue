<template>
  <custom-navbar title="工作台" :show-back="false" />
  <view
    class="page page--tabbar"
    :style="{ padding: `${navbar.totalHeight.value + 8}px 32rpx 0` }"
  >
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
import { useNavbar } from "@/composables/useNavbar";
import { useUserStore } from "@/store";
import { menuConfig } from "@/config/menu";
import { checkLogin, isLoggedIn } from "@/utils/auth";
import { hasPermission as checkPermission } from "@/utils/permission";

const router = useRouter();
const userStore = useUserStore();

const navbar = useNavbar({ hasTabbar: true });

// 用户权限列表
const userPerms = computed(() => userStore.userInfo?.perms || []);

// 是否已登录
const isLogged = computed(() => isLoggedIn());

// 检查是否有权限
const hasPermission = (perm: string) => {
  if (!perm) return true;
  return checkPermission(perm);
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
  // 未登录时跳转登录页
  if (!isLogged.value) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  // 已登录但访问受限时，仍做一次登录校验（防 token 过期）
  if (!checkLogin()) return;

  try {
    if (
      typeof item?.url === "string" &&
      (item.url.startsWith("http://") || item.url.startsWith("https://"))
    ) {
      uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(item.url)}` });
      return;
    }

    router.push({ path: item.url });
  } catch {
    // 路由跳转失败已由拦截器处理
  }
}
</script>

<route lang="json">
{
  "name": "work",
  "style": {
    "navigationStyle": "custom",
    "navigationBarTitleText": "工作台"
  },
  "layout": "tabbar"
}
</route>
