<template>
  <view class="page-container">
    <!-- 用户信息卡片 -->
    <view class="user-profile" :style="{ paddingTop: navbar.statusBarHeight.value + 'px' }">
      <view class="blur-bg" />

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
              <text v-if="genderLabel" class="gender-badge" :class="genderClass">
                {{ genderLabel }}
              </text>
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

        <!-- 操作按钮区域 - 避开胶囊按钮 -->
        <view
          class="action-buttons"
          :style="{
            right: navbar.menuButtonRightGap.value + 8 + 'px',
            top: actionButtonsTop,
          }"
        >
          <view class="action-btn" @click="navigateToSettings">
            <wd-icon name="setting" size="22" color="#fff" />
          </view>
          <view v-if="isLogin" class="action-btn relative" @click="navigateToSection('messages')">
            <wd-icon name="notification" size="22" color="#fff" />
            <view v-if="true" class="action-badge">2</view>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view class="section-title">
          <wd-icon name="user" size="18" :color="currentThemeColor" />
          <text class="title-text">资料卡片</text>
        </view>
      </view>
      <view class="profile-grid">
        <view class="profile-tile">
          <view class="tile-icon" :style="{ backgroundColor: currentThemeColor + '15' }">
            <wd-icon name="secured" size="20" :color="currentThemeColor" />
          </view>
          <view class="tile-content">
            <text class="tile-label">角色</text>
            <text class="tile-value">{{ roleText }}</text>
          </view>
        </view>
        <view class="profile-tile">
          <view class="tile-icon" :style="{ backgroundColor: currentThemeColor + '15' }">
            <wd-icon name="goods" size="20" :color="currentThemeColor" />
          </view>
          <view class="tile-content">
            <text class="tile-label">部门</text>
            <text class="tile-value">{{ deptText }}</text>
          </view>
        </view>
        <view class="profile-tile">
          <view class="tile-icon" :style="{ backgroundColor: currentThemeColor + '15' }">
            <wd-icon name="phone" size="20" :color="currentThemeColor" />
          </view>
          <view class="tile-content">
            <text class="tile-label">手机</text>
            <text class="tile-value">{{ mobileText }}</text>
          </view>
        </view>
        <view class="profile-tile">
          <view class="tile-icon" :style="{ backgroundColor: currentThemeColor + '15' }">
            <wd-icon name="mail" size="20" :color="currentThemeColor" />
          </view>
          <view class="tile-content">
            <text class="tile-label">邮箱</text>
            <text class="tile-value">{{ emailText }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view class="section-title">
          <wd-icon name="setting" size="18" :color="currentThemeColor" />
          <text class="title-text">快捷入口</text>
        </view>
      </view>
      <view class="quick-grid">
        <view class="quick-item" @click="navigateToProfile">
          <view class="quick-icon" :style="{ backgroundColor: currentThemeColor + '15' }">
            <wd-icon name="user" size="24" :color="currentThemeColor" />
          </view>
          <text class="quick-text">个人资料</text>
        </view>
        <view v-if="isLogin" class="quick-item" @click="navigateToAccount">
          <view class="quick-icon" :style="{ backgroundColor: currentThemeColor + '15' }">
            <wd-icon name="secured" size="24" :color="currentThemeColor" />
          </view>
          <text class="quick-text">账号安全</text>
        </view>
        <view class="quick-item" @click="navigateToTheme">
          <view class="quick-icon" :style="{ backgroundColor: currentThemeColor + '15' }">
            <wd-icon name="color" size="24" :color="currentThemeColor" />
          </view>
          <text class="quick-text">主题设置</text>
        </view>
        <view class="quick-item" @click="navigateToSettings">
          <view class="quick-icon" :style="{ backgroundColor: currentThemeColor + '15' }">
            <wd-icon name="setting" size="24" :color="currentThemeColor" />
          </view>
          <text class="quick-text">更多设置</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view class="section-title">
          <wd-icon name="setting" size="18" :color="currentThemeColor" />
          <text class="title-text">系统设置</text>
        </view>
      </view>
      <view class="menu-list">
        <view class="menu-item" @click="navigateToUserAgreement">
          <wd-icon name="note" size="20" color="#666" />
          <text class="menu-text">用户协议</text>
          <wd-icon name="arrow-right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @click="navigateToAbout">
          <wd-icon name="info-circle" size="20" color="#666" />
          <text class="menu-text">关于我们</text>
          <wd-icon name="arrow-right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @click="navigateToNetworkTest">
          <wd-icon name="wifi" size="20" color="#666" />
          <text class="menu-text">网络测试</text>
          <wd-icon name="arrow-right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @click="handleClearCache">
          <wd-icon name="delete" size="20" color="#666" />
          <text class="menu-text">清空缓存</text>
          <text class="menu-value">{{ cacheSize }}</text>
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
        <view class="menu-item" @click="navigateToFAQ">
          <wd-icon name="question-circle" size="20" color="#666" />
          <text class="menu-text">常见问题</text>
          <wd-icon name="arrow-right" size="16" color="#ccc" />
        </view>
        <view class="menu-item" @click="handleQuestionFeedback">
          <wd-icon name="edit" size="20" color="#666" />
          <text class="menu-text">问题反馈</text>
          <wd-icon name="arrow-right" size="16" color="#ccc" />
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view v-if="isLogin" class="logout-section">
      <view class="logout-btn" @click="handleLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>

    <wd-toast />

    <wd-loading
      v-if="clearing"
      v-model="clearing"
      text="正在清理..."
      mask
      custom-class="loading-center"
    />
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
import { useToast } from "wot-design-uni";
import { useUserStore, useThemeStore } from "@/store";
import { useRouter } from "uni-mini-router";
import { useNavbar } from "@/composables/useNavbar";

const toast = useToast();
const userStore = useUserStore();
const themeStore = useThemeStore();
const currentThemeColor = computed(() => themeStore.themeVars.colorTheme);
const userInfo = computed(() => userStore.userInfo);
const isLogin = computed(() => !!userInfo.value);
const defaultAvatar = "/static/images/default-avatar.png";

const router = useRouter();

// 使用导航栏 Hook（TabBar 页面）
const navbar = useNavbar({ hasTabbar: true });

const navContentHeight = computed(() => {
  const height = navbar.totalHeight.value - navbar.statusBarHeight.value;
  return `${height > 0 ? height : 0}px`;
});

const actionButtonsTop = computed(() => {
  const navHeight = navbar.totalHeight.value - navbar.statusBarHeight.value;
  return `${navbar.statusBarHeight.value + navHeight / 2}px`;
});

const roleText = computed(() => {
  if (!userInfo.value) return "-";
  return userInfo.value.roleName || userInfo.value.roles?.join("、") || "-";
});

const deptText = computed(() => userInfo.value?.deptName || "-");
const mobileText = computed(() => userInfo.value?.mobile || "-");
const emailText = computed(() => userInfo.value?.email || "-");

const genderValue = computed(() => (userInfo.value as any)?.gender);
const genderLabel = computed(() => {
  if (genderValue.value === 1) return "♂";
  if (genderValue.value === 2) return "♀";
  return "";
});
const genderClass = computed(() => {
  if (genderValue.value === 1) return "gender-badge--male";
  if (genderValue.value === 2) return "gender-badge--female";
  return "";
});

const clearing = ref(false);
const cacheSize = ref<any>("-");

const formatSize = (size: number) => {
  if (size < 1024) {
    return size + "B";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + "KB";
  } else {
    return (size / 1024 / 1024).toFixed(2) + "MB";
  }
};

const getCacheSize = async () => {
  try {
    // #ifdef MP-WEIXIN
    const res = await uni.getStorageInfo();
    cacheSize.value = formatSize(res.currentSize);
    // #endif
    // #ifdef H5
    cacheSize.value = formatSize(
      Object.keys(localStorage).reduce((size, key) => size + localStorage[key].length, 0)
    );
    // #endif
    if (!cacheSize.value) {
      cacheSize.value = "0B";
    }
  } catch (error) {
    console.error("获取缓存大小失败:", error);
    cacheSize.value = "-";
  }
};

onLoad(() => {
  getCacheSize();
});

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

const navigateToAccount = () => {
  if (!isLogin.value) {
    navigateToLoginPage();
    return;
  }
  router.push({ path: "/pages/mine/settings/account/index" });
};

const navigateToTheme = () => {
  router.push({ path: "/pages/mine/settings/theme/index" });
};

const navigateToUserAgreement = () => {
  router.push({ path: "/pages/mine/settings/agreement/index" });
};

const navigateToNetworkTest = () => {
  router.push({ path: "/pages/mine/settings/network/index" });
};

// 问题反馈
const handleQuestionFeedback = () => {
  router.push({ path: "/pages/mine/feedback/index" });
};

const handleClearCache = async () => {
  if (clearing.value) return;

  try {
    clearing.value = true;
    await new Promise((resolve) => setTimeout(resolve, 800));
    await uni.clearStorage();
    await getCacheSize();
    toast.show("清理成功");
  } catch {
    toast.show("清理失败");
  } finally {
    clearing.value = false;
  }
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
.page-container {
  min-height: 100vh;
  background: #f5f7fa;
}

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
    height: 320rpx;
    background: linear-gradient(135deg, var(--wot-color-theme, #165dff) 0%, #667eea 100%);
  }

  .user-info {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    min-height: v-bind(navContentHeight);
    padding: 32rpx 32rpx 40rpx;
    padding-right: 200rpx;

    .avatar-container {
      position: relative;

      .avatar {
        width: 128rpx;
        height: 128rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
      }
    }

    .user-details {
      flex: 1;
      margin-left: 28rpx;

      .nickname {
        margin-bottom: 10rpx;
        font-size: 36rpx;
        font-weight: 700;
        color: #fff;

        .gender-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36rpx;
          height: 36rpx;
          padding: 0 12rpx;
          margin-left: 12rpx;
          font-size: 22rpx;
          font-weight: 700;
          line-height: 36rpx;
          color: #fff;
          background-color: rgba(255, 255, 255, 0.25);
          border-radius: 999px;
        }

        .gender-badge--male {
          background-color: rgba(64, 158, 255, 0.5);
        }

        .gender-badge--female {
          background-color: rgba(255, 99, 132, 0.5);
        }
      }

      .user-id {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.85);
      }

      .login-prompt {
        margin-bottom: 16rpx;
        font-size: 28rpx;
        color: #fff;
      }
    }

    // 操作按钮区域
    .action-buttons {
      position: absolute;
      right: 0;
      display: flex;
      gap: 16rpx;
      transform: translateY(-50%);
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72rpx;
      height: 72rpx;
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

// 资料卡片网格
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.profile-tile {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9fafb;
  border-radius: 14rpx;
  transition: background 0.2s;

  &:active {
    background: #f3f4f6;
  }
}

.tile-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;
}

.tile-content {
  flex: 1;
  overflow: hidden;
}

.tile-label {
  display: block;
  margin-bottom: 6rpx;
  overflow: hidden;
  font-size: 22rpx;
  color: #9ca3af;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile-value {
  display: block;
  overflow: hidden;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 快捷入口网格
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 8rpx;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.7;
  }
}

.quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-bottom: 12rpx;
  border-radius: 16rpx;
}

.quick-text {
  font-size: 24rpx;
  color: #374151;
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
