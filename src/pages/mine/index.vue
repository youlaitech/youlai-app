<template>
  <view class="page-container dark:text-[var(--wot-color-text)]">
    <custom-navbar
      title="我的主页"
      bg-color="transparent"
      title-color="#fff"
      icon-color="#fff"
      :show-back="false"
      :placeholder="false"
    />

    <!-- 用户信息卡片 -->
    <view class="user-profile" :style="{ paddingTop: navbar.totalHeight.value + 'px' }">
      <view class="blur-bg" :style="{ background: headerBackground }" />

      <view class="user-info">
        <view class="avatar-container" @click="navigateToProfile">
          <image
            class="avatar"
            :src="isLogin ? userInfo!.avatar : defaultAvatar"
            mode="aspectFill"
          />
          <view v-if="genderIconName" class="gender-icon" :class="genderIconClass">
            <wd-icon :name="genderIconName" size="12" color="#fff" />
          </view>
        </view>
        <view class="user-details">
          <block v-if="isLogin">
            <view class="nickname">
              {{ userInfo!.nickname || "匿名用户" }}
            </view>
            <view class="user-meta">
              <view class="meta-row">
                <wd-icon name="user" size="14" color="rgba(255, 255, 255, 0.92)" />
                <text class="meta-value">{{ userInfo?.username || "0000000" }}</text>
              </view>
              <view v-if="deptNameText" class="meta-row">
                <wd-icon name="home" size="14" color="rgba(255, 255, 255, 0.92)" />
                <text class="meta-value">{{ deptNameText }}</text>
              </view>
            </view>
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

        <view class="header-actions">
          <view class="action-btn relative" @click="navigateToNotifications">
            <wd-icon name="notification" size="20" color="#fff" />
            <view v-if="true" class="action-badge">2</view>
          </view>
          <view class="action-btn" @click="navigateToSettings">
            <wd-icon name="setting" size="20" color="#fff" />
          </view>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view class="section-title">
          <wd-icon name="user" size="18" :color="currentThemeColor" />
          <text class="title-text">个人中心</text>
        </view>
      </view>
      <view class="menu-list">
        <view class="menu-item" @click="navigateToProfile">
          <wd-icon name="user" size="20" color="#666" />
          <text class="menu-text">个人资料</text>
          <wd-icon name="arrow-right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @click="navigateToAccount">
          <wd-icon name="secured" size="20" color="#666" />
          <text class="menu-text">账号和安全</text>
          <wd-icon name="arrow-right" size="16" color="#ccc" />
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view class="section-title">
          <wd-icon name="help-circle" size="18" :color="currentThemeColor" />
          <text class="title-text">帮助与支持</text>
        </view>
      </view>
      <view class="menu-list">
        <view class="menu-item" @click="handleQuestionFeedback">
          <wd-icon name="edit" size="20" color="#666" />
          <text class="menu-text">问题反馈</text>
          <wd-icon name="arrow-right" size="16" color="#ccc" />
        </view>
      </view>
    </view>

    <view class="section-card official-section">
      <view class="official-card" @click="navigateToOfficialAccount">
        <image class="official-avatar" src="/static/logo.png" mode="aspectFill" />
        <view class="official-body">
          <view class="official-title">有来技术</view>
          <view class="official-desc">技术干货 · 开源社区 · 交流群</view>
        </view>
        <view class="official-action">
          <wd-icon name="arrow-right" size="18" color="#9ca3af" />
        </view>
      </view>
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
import { onLoad } from "@dcloudio/uni-app";
import { useUserStore, useThemeStore } from "@/store";
import { useRouter } from "uni-mini-router";
import { useNavbar } from "@/composables/useNavbar";

const userStore = useUserStore();
const themeStore = useThemeStore();
const currentThemeColor = computed(() => themeStore.themeVars.colorTheme);
const userInfo = computed(() => userStore.userInfo);
const isLogin = computed(() => !!userInfo.value);
const defaultAvatar = "/static/images/default-avatar.png";

const headerBackground = computed(() => {
  const color = currentThemeColor.value || "#4d80f0";
  const colorWithAlpha = color.length === 7 ? `${color}E6` : color;
  const colorWithAlpha2 = color.length === 7 ? `${color}CC` : color;
  return `linear-gradient(135deg, ${colorWithAlpha} 0%, ${colorWithAlpha2} 100%)`;
});

const router = useRouter();

// 使用导航栏 Hook（TabBar 页面）
const navbar = useNavbar({ hasTabbar: true });

const genderValue = computed(() => (userInfo.value as any)?.gender);
const normalizedGender = computed(() => {
  const v = genderValue.value;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
});

const deptNameText = computed(() => {
  if (!isLogin.value) return "";
  return (userInfo.value as any)?.deptName || "";
});

const genderIconName = computed(() => {
  if (!isLogin.value) return "";
  if (normalizedGender.value === 1) return "gender-male";
  if (normalizedGender.value === 2) return "gender-female";
  return "";
});

const genderIconClass = computed(() => {
  if (normalizedGender.value === 1) return "gender-icon--male";
  if (normalizedGender.value === 2) return "gender-icon--female";
  return "";
});

onLoad(() => {});

// 登录
const navigateToLoginPage = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentPagePath = `/${currentPage.route}`;
  router.push({ path: "/pages/login/index", query: { redirect: currentPagePath } });
};

// 个人信息
const navigateToProfile = () => {
  if (!isLogin.value) {
    navigateToLoginPage();
    return;
  }
  router.push({ path: "/pages/mine/profile/index" });
};

// 账号和安全
const navigateToAccount = () => {
  if (!isLogin.value) {
    navigateToLoginPage();
    return;
  }
  router.push({ path: "/pages/mine/account/index" });
};

const navigateToNotifications = () => {
  uni.showToast({
    title: "功能开发中",
    icon: "none",
  });
};

// 设置
const navigateToSettings = () => {
  router.push({ path: "/pages/mine/settings/index" });
};

// 问题反馈
const handleQuestionFeedback = () => {
  router.push({ path: "/pages/mine/feedback/index" });
};

// 有来技术公众号
const navigateToOfficialAccount = () => {
  router.push({ path: "/pages/mine/official/index" });
};
</script>

<style lang="scss" scoped>
// page-container 使用全局样式，支持暗黑模式

// 用户信息卡片
.user-profile {
  position: relative;
  overflow: hidden;

  .blur-bg {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 0;
    height: 460rpx;
    border-bottom-right-radius: 48rpx;
    border-bottom-left-radius: 48rpx;
  }

  .user-info {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    padding: 48rpx 32rpx 56rpx;
    padding-right: 140rpx;

    .avatar-container {
      position: relative;

      .avatar {
        width: 144rpx;
        height: 144rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
      }

      .gender-icon {
        position: absolute;
        right: 8rpx;
        bottom: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28rpx;
        height: 28rpx;
        border: 2rpx solid rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.18);
      }

      .gender-icon--male {
        background-color: #409eff;
      }

      .gender-icon--female {
        background-color: #ff6384;
      }
    }

    .user-details {
      flex: 1;
      margin-left: 28rpx;

      .nickname {
        margin-bottom: 10rpx;
        font-size: 40rpx;
        font-weight: 700;
        color: #fff;
      }

      .user-meta {
        margin-top: 4rpx;
        display: flex;
        flex-direction: column;
        gap: 6rpx;
        color: rgba(255, 255, 255, 0.85);
      }

      .meta-row {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 24rpx;
        line-height: 1.2;
      }

      .meta-value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .login-prompt {
        margin-bottom: 16rpx;
        font-size: 28rpx;
        color: #fff;
      }
    }

    .header-actions {
      position: absolute;
      top: 50%;
      right: 32rpx;
      display: flex;
      gap: 20rpx;
      transform: translateY(-50%);
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64rpx;
      height: 64rpx;
      background-color: rgba(255, 255, 255, 0.28);
      backdrop-filter: blur(8px);
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

// 通用卡片样式
.section-card {
  padding: 28rpx;
  margin: 24rpx 28rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-card:first-of-type {
  margin-top: -20rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

// 菜单列表
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  overflow: hidden;
  background: #f9fafb;
  border-radius: 14rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  background: #fff;
  transition: background 0.2s;

  &:active {
    background: #f9fafb;
  }

  &:not(:last-child) {
    border-bottom: 1rpx solid #f3f4f6;
  }
}

.menu-text {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #374151;
}

.menu-value {
  font-size: 26rpx;
  color: #9ca3af;
}

.official-section {
  margin-top: 16rpx;
}

.official-card {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.official-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 24rpx;
}

.official-body {
  flex: 1;
  min-width: 0;
  margin-left: 28rpx;
}

.official-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.official-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #9ca3af;
  letter-spacing: 1rpx;
}

.official-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  background: #f3f4f6;
  border-radius: 50%;
}

// 退出登录
.logout-section {
  padding: 40rpx 28rpx 80rpx;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

.logout-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #ef4444;
}

// 加载遮罩
:deep(.loading-center) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
}

// 登录按钮样式
:deep(.btn-login) {
  font-size: 24rpx !important;
  border-radius: 20rpx !important;
}
</style>
