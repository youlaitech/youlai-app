<template>
  <view class="app-container dark:text-[var(--wot-color-text)]">
    <!-- 用户信息卡片 -->
    <view class="user-profile">
      <view class="blur-bg"></view>

      <view class="user-info">
        <view class="avatar-container" @click="navigateToProfile">
          <image
            class="avatar"
            :src="isLogin ? userInfo!.avatar : defaultAvatar"
            mode="aspectFill"
          />
        </view>
        <view class="user-details">
          <block v-if="isLogin">
            <view class="nickname">
              {{ userInfo!.nickname || "匿名用户" }}
            </view>
            <view class="user-id">ID: {{ userInfo?.username || "0000000" }}</view>
          </block>
          <block v-else>
            <view class="login-prompt">立即登录获取更多功能</view>
            <wd-button
              custom-class="btn-login"
              size="small"
              type="primary"
              @click="navigateToLoginPage"
            >
              登录/注册
            </wd-button>
          </block>
        </view>

        <!-- 操作按钮区域 - 放在用户信息右侧 -->
        <view class="action-buttons">
          <view class="action-btn" @click="navigateToSettings">
            <wd-icon name="setting1" size="22" />
          </view>
          <view v-if="isLogin" class="action-btn relative" @click="navigateToSection('messages')">
            <wd-icon name="notification" size="22" />
            <view v-if="true" class="action-badge">2</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <wd-card custom-class="stats-card">
      <wd-grid :column="3" border>
        <wd-grid-item @click="navigateToSection('wallet')">
          <view class="stats-item">
            <view class="mb-8rpx text-36rpx font-600">0.00</view>
            <view class="text-26rpx text-gray-500">我的余额</view>
          </view>
        </wd-grid-item>
        <wd-grid-item @click="navigateToSection('favorites')">
          <view class="stats-item">
            <view class="mb-8rpx text-36rpx font-600">0</view>
            <view class="text-26rpx text-gray-500">我的收藏</view>
          </view>
        </wd-grid-item>
        <wd-grid-item @click="navigateToSection('history')">
          <view class="stats-item">
            <view class="mb-8rpx text-36rpx font-600">0</view>
            <view class="text-26rpx text-gray-500">浏览历史</view>
          </view>
        </wd-grid-item>
      </wd-grid>
    </wd-card>

    <!-- 常用工具 -->
    <wd-card>
      <template #header>
        <view class="flex-start">
          <wd-icon name="tools" size="18" :color="currentThemeColor" />
          <text class="ml-12rpx text-28rpx font-600">常用工具</text>
        </view>
      </template>

      <wd-grid :column="4" border>
        <wd-grid-item @click="navigateToProfile">
          <view class="flex-col-center py-20rpx">
            <view class="tool-icon mb-12rpx">
              <wd-icon name="user" size="24" :color="currentThemeColor" />
            </view>
            <view class="text-24rpx">个人资料</view>
          </view>
        </wd-grid-item>
        <wd-grid-item @click="navigateToFAQ">
          <view class="flex-col-center py-20rpx">
            <view class="mb-12rpx">
              <wd-icon name="help-circle" size="24" :color="currentThemeColor" />
            </view>
            <view class="text-24rpx">常见问题</view>
          </view>
        </wd-grid-item>
        <wd-grid-item @click="handleQuestionFeedback">
          <view class="flex-col-center py-20rpx">
            <view class="mb-12rpx">
              <wd-icon name="check-circle" size="24" :color="currentThemeColor" />
            </view>
            <view class="text-24rpx">问题反馈</view>
          </view>
        </wd-grid-item>
        <wd-grid-item @click="navigateToAbout">
          <view class="flex-col-center py-20rpx">
            <view class="mb-12rpx">
              <wd-icon name="info-circle" size="24" :color="currentThemeColor" />
            </view>
            <view class="text-24rpx">关于我们</view>
          </view>
        </wd-grid-item>
      </wd-grid>
    </wd-card>

    <!-- 推荐服务 -->
    <wd-card>
      <template #header>
        <view class="flex-start">
          <wd-icon name="star" size="18" :color="currentThemeColor" />
          <text class="ml-12rpx text-28rpx font-600">推荐服务</text>
        </view>
      </template>

      <wd-cell-group>
        <wd-cell
          title="会员中心"
          label="解锁更多特权"
          is-link
          custom-class="service-cell"
          @click="navigateToSection('services', 'vip')"
        >
          <template #icon>
            <view class="service-icon mr-20rpx">
              <wd-icon name="dong" size="22" :color="currentThemeColor" />
            </view>
          </template>
        </wd-cell>

        <wd-cell
          title="优惠券"
          label="查看我的优惠券"
          is-link
          custom-class="service-cell"
          @click="navigateToSection('services', 'coupon')"
        >
          <template #icon>
            <view class="service-icon mr-20rpx">
              <wd-icon name="discount" size="22" :color="currentThemeColor" />
            </view>
          </template>
        </wd-cell>

        <wd-cell
          title="邀请有礼"
          label="邀请好友得奖励"
          is-link
          custom-class="service-cell"
          @click="navigateToSection('services', 'invite')"
        >
          <template #icon>
            <view class="service-icon mr-20rpx">
              <wd-icon name="share" size="22" :color="currentThemeColor" />
            </view>
          </template>
        </wd-cell>
      </wd-cell-group>
    </wd-card>

    <!-- 退出登录按钮 -->
    <view v-if="isLogin" class="flex-center mt-20rpx">
      <wd-button custom-class="logout-button" plain @click="handleLogout">退出登录</wd-button>
    </view>

    <wd-toast />
  </view>
</template>

<route lang="json">
{
  "name": "mine",
  "style": { "navigationStyle": "custom" },
  "layout": "tabbar"
}
</route>

<script lang="ts" setup>
import { useToast } from "wot-design-uni";
import { useUserStore, useThemeStore } from "@/store";
import { useRouter } from "uni-mini-router";

const toast = useToast();
const userStore = useUserStore();
const themeStore = useThemeStore();
const currentThemeColor = computed(() => themeStore.themeVars.colorTheme);
const userInfo = computed(() => userStore.userInfo);
const isLogin = computed(() => !!userInfo.value);
const defaultAvatar = "/static/images/default-avatar.png";

const router = useRouter();

// 登录
const navigateToLoginPage = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentPagePath = `/${currentPage.route}`;
  router.push({ path: "/pages/login/index", query: { redirect: currentPagePath } });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: "提示",
    content: "确认退出登录吗？",
    success: function (res) {
      if (res.confirm) {
        userStore.logout();
        toast.show("已退出登录");
      }
    },
  });
};

// 个人信息
const navigateToProfile = () => {
  if (!isLogin.value) {
    navigateToLoginPage();
    return;
  }
  router.push({ path: "/pages/mine/profile/index" });
};

// 常见问题
const navigateToFAQ = () => {
  router.push({ path: "/pages/mine/faq/index" });
};

// 关于我们
const navigateToAbout = () => {
  router.push({ path: "/pages/mine/about/index" });
};

// 设置
const navigateToSettings = () => {
  router.push({ path: "/pages/mine/settings/index" });
};

// 问题反馈
const handleQuestionFeedback = () => {
  router.push({ path: "/pages/mine/feedback/index" });
};

// 导航到各个板块
const navigateToSection = (section: string, subSection?: string) => {
  console.log(`导航到: ${section}${subSection ? ` - ${subSection}` : ""}`);
  // 这里可以根据需要实现具体的导航逻辑
  uni.showToast({
    title: "功能开发中",
    icon: "none",
  });
};
</script>

<style lang="scss" scoped>
// 用户信息卡片
.user-profile {
  position: relative;
  padding: calc(var(--status-bar-height) + 80rpx) 30rpx 30rpx; // 顶部：状态栏高度 + 操作按钮区域(80rpx)
  overflow: hidden;

  .blur-bg {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 0;
    height: 320rpx;
    background: linear-gradient(135deg, var(--wot-color-theme, #165dff) 0%, #667eea 100%);
  }

  .user-info {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;

    .avatar-container {
      position: relative;

      .avatar {
        width: 120rpx;
        height: 120rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
      }
    }

    .user-details {
      flex: 1;
      margin-left: 24rpx;

      .nickname {
        margin-bottom: 8rpx;
        font-size: 34rpx;
        font-weight: bold;
        color: #fff;
      }

      .user-id {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }

      .login-prompt {
        margin-bottom: 16rpx;
        font-size: 28rpx;
        color: #fff;
      }
    }

    // 操作按钮区域
    .action-buttons {
      display: flex;
      gap: 16rpx;
      margin-left: auto;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70rpx;
      height: 70rpx;
      background-color: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10rpx);
      border-radius: 50%;
    }

    .action-badge {
      position: absolute;
      top: -6rpx;
      right: -6rpx;
      z-index: 3;
      min-width: 32rpx;
      height: 32rpx;
      padding: 0 6rpx;
      font-size: 20rpx;
      line-height: 32rpx;
      color: #fff;
      text-align: center;
      background-color: #ff4757;
      border: 2rpx solid #fff;
      border-radius: 16rpx;
    }
  }
}

:deep(.stats-card) {
  margin: 20rpx 30rpx !important;
}

// 服务图标
.service-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  background-color: var(--wot-color-bg-light);
  border-radius: 16rpx;
}

// 登录按钮样式
:deep(.btn-login) {
  font-size: 24rpx !important;
  border-radius: 20rpx !important;
}

// 退出登录按钮样式
:deep(.logout-button) {
  width: 80% !important;
  height: 80rpx !important;
  font-size: 32rpx !important;
  font-weight: bold !important;
  border-radius: 40rpx !important;
  transition: all 0.3s ease !important;

  &:active {
    opacity: 0.8 !important;
    transform: scale(0.98) !important;
  }
}
</style>
