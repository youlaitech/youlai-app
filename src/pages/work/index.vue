<template>
  <view class="page-container work">
    <template v-for="(item, index) in gridList" :key="index">
      <wd-card :title="item.title">
        <wd-grid clickable :column="4">
          <wd-grid-item
            v-for="(child, index) in item.children"
            :key="index"
            :v-has-perm="child.prem"
            use-slot
            @click="handleNavClick(child)"
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
import { useRouter } from "uni-mini-router";

const router = useRouter();

const gridList = reactive([
  {
    title: "系统管理",
    children: [
      {
        icon: "/static/icons/user.png",
        title: "用户管理",
        url: "/pages/work/user/index",
        prem: "sys:user:query",
      },
      {
        icon: "/static/icons/role.png",
        title: "角色管理",
        url: "/pages/work/role/index",
        prem: "sys:role:query",
      },

      {
        icon: "/static/icons/notice.png",
        title: "通知公告",
        url: "/pages/work/notice/index",
        prem: "sys:notice:query",
      },
      {
        icon: "/static/icons/setting.png",
        title: "系统配置",
        url: "/pages/work/config/index",
        prem: "sys:config:query",
      },
    ],
  },
  {
    title: "系统监控",
    children: [
      {
        icon: "/static/icons/log.png",
        title: "系统日志",
        url: "/pages/work/log/index",
        prem: "sys:log:query",
      },
    ],
  },
]);

// 处理导航点击
function handleNavClick(item: any) {
  router.push({ path: item.url });
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
