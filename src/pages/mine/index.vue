<template>
  <view class="page dark:text-[var(--wot-color-text)]">
    <view class="mine-hero" :style="{ paddingTop: `${navbar.totalHeight.value}px` }">
      <!-- 蓝色背景 -->
      <view class="mine-hero__bg" :style="{ background: headerBackground }" />

      <custom-navbar
        bg-color="transparent"
        title-color="#fff"
        icon-color="#fff"
        :show-back="false"
        :placeholder="false"
      >
        <template #center>
          <text class="mine-navbar__title">个人中心</text>
        </template>
      </custom-navbar>

      <view class="mine-hero__content">
        <view class="profile-card">
          <view class="profile-card__header">
            <view class="profile-card__left" @click="isLogin ? openProfile() : navigateToLogin()">
              <image
                class="profile-card__avatar"
                :src="isLogin && userInfo?.avatar ? userInfo.avatar : defaultAvatar"
                mode="aspectFill"
              />
              <view v-if="isLogin" class="profile-card__online-dot" />
              <view v-if="genderIconName" class="profile-card__gender" :class="genderIconClass">
                <wd-icon :name="genderIconName" size="12" color="#fff" />
              </view>
            </view>

            <view class="profile-card__main" @click="isLogin ? openProfile() : navigateToLogin()">
              <view class="profile-card__top">
                <text class="profile-card__name">
                  {{ isLogin ? userInfo?.nickname || "匿名用户" : "欢迎使用" }}
                </text>
              </view>

              <view v-if="isLogin" class="profile-card__tags">
                <view class="profile-tag">
                  <wd-icon name="user" size="12" color="rgba(255, 255, 255, 0.92)" />
                  <text>{{ isLogin ? userInfo?.username || "未设置账号" : "快捷登录" }}</text>
                </view>
                <view class="profile-tag">
                  <wd-icon
                    :name="isLogin && deptNameText ? 'home' : 'secured'"
                    size="12"
                    color="rgba(255, 255, 255, 0.92)"
                  />
                  <text>{{ isLogin && deptNameText ? deptNameText : "安全可靠" }}</text>
                </view>
              </view>

              <text v-else class="profile-card__hint">登录使用更多功能</text>
            </view>

            <view v-if="isLogin" class="profile-card__actions">
              <view class="profile-card__action-btn" @click.stop="openNotifications">
                <wd-icon name="notification" size="16" color="#fff" />
                <view v-if="notificationCount > 0" class="profile-card__notify-badge">
                  {{ notificationCount }}
                </view>
              </view>
              <view class="profile-card__action-btn" @click.stop="openThemeSettings">
                <wd-icon name="setting1" size="16" color="#fff" />
              </view>
            </view>

            <view v-if="!isLogin" class="profile-card__action" @click.stop="navigateToLogin()">
              <wd-button custom-class="profile-card__button" size="small" type="primary">
                立即登录
              </wd-button>
            </view>
          </view>
        </view>

        <!-- 官方社区推广区域 -->
        <view class="community-card" @click="openOfficialAccount">
          <image
            class="community-card__bg"
            src="/static/images/official-bg.png"
            mode="aspectFill"
          />
          <view class="community-card__mask" />
          <view class="community-card__sparkle" />
          <view class="community-card__logo">
            <image src="/static/logo.png" mode="aspectFit" class="w-full h-full" />
          </view>
          <view class="community-card__body">
            <view class="community-card__title-row">
              <text class="community-card__title">关注有来技术</text>
              <wd-tag type="success" plain custom-class="community-card__tag">官方社区</wd-tag>
            </view>
            <text class="community-card__desc">开源更新、实战内容、交流群入口，统一在这里查看</text>
          </view>
          <view class="community-card__arrow">
            <wd-icon name="arrow-right" size="16" color="#64748b" />
          </view>
        </view>

        <view v-if="quickCards.length" class="quick-cards">
          <view
            v-for="item in quickCards"
            :key="item.title"
            class="quick-card"
            @click="item.action"
          >
            <view class="quick-card__icon" :style="{ background: item.tint }">
              <wd-icon :name="item.icon" size="28" :color="item.iconColor || '#1e293b'" />
            </view>
            <view class="quick-card__body">
              <text class="quick-card__title">{{ item.title }}</text>
              <text class="quick-card__desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="mine-body">
      <view class="section-card">
        <text class="section-title">系统工具</text>
        <view class="menu-list menu-list--flat">
          <view
            v-for="item in settingsItems"
            :key="item.title"
            class="menu-row"
            @click="item.action"
          >
            <view class="menu-row__icon" :style="{ background: item.tint }">
              <wd-icon :name="item.icon" size="18" :color="item.iconColor || '#1e293b'" />
            </view>
            <view class="menu-row__main">
              <text class="menu-row__title">{{ item.title }}</text>
              <text class="menu-row__desc">{{ item.desc }}</text>
            </view>
            <text v-if="item.value" class="menu-row__value">{{ item.value }}</text>
            <wd-icon name="arrow-right" size="16" color="#94a3b8" />
          </view>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">帮助与支持</text>
        <view class="menu-list menu-list--flat">
          <view v-for="item in helpItems" :key="item.title" class="menu-row" @click="item.action">
            <view class="menu-row__icon" :style="{ background: item.tint }">
              <wd-icon :name="item.icon" size="18" :color="item.iconColor || '#1e293b'" />
            </view>
            <view class="menu-row__main">
              <text class="menu-row__title">{{ item.title }}</text>
              <text class="menu-row__desc">{{ item.desc }}</text>
            </view>
            <text v-if="item.value" class="menu-row__value">{{ item.value }}</text>
            <wd-icon name="arrow-right" size="16" color="#94a3b8" />
          </view>
        </view>
      </view>

      <view v-if="isLogin" class="logout-section">
        <wd-button custom-class="logout-btn" plain @click="handleLogout">退出登录</wd-button>
      </view>
    </view>

    <wd-loading
      v-if="clearing"
      v-model="clearing"
      text="正在清理..."
      mask
      custom-class="loading-center"
    />
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
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useUserStore, useThemeStore } from "@/store";
import { useRouter } from "uni-mini-router";
import { useNavbar } from "@/composables/useNavbar";
import { getAccessToken } from "@/utils/auth";

const userStore = useUserStore();
const themeStore = useThemeStore();
const currentThemeColor = computed(() => themeStore.themeVars.colorTheme);
const userInfo = computed(() => userStore.userInfo);
const defaultAvatar = "/static/images/default-avatar.png";

const hasAccessToken = ref(!!getAccessToken());
const isLogin = computed(() => !!getAccessToken());

const headerBackground = computed(() => {
  const color = currentThemeColor.value || "#4d80f0";
  const colorWithAlpha = color.length === 7 ? `${color}E6` : color;
  const colorWithAlpha2 = color.length === 7 ? `${color}CC` : color;
  return `linear-gradient(135deg, ${colorWithAlpha} 0%, ${colorWithAlpha2} 100%)`;
});

const router = useRouter();
const notificationCount = computed(() => 0);
const appVersion = ref("1.0.0");
const navbar = useNavbar({ hasTabbar: true });

const hasUserProfile = computed(() => {
  const info = userInfo.value as any;
  return !!(info && (info.id || info.userId || info.username || info.nickname));
});

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

const syncAuthState = () => {
  hasAccessToken.value = !!getAccessToken();
};

const fetchUserInfoIfNeeded = async () => {
  if (!hasAccessToken.value || hasUserProfile.value) return;
  try {
    await userStore.getInfo();
  } catch {
    // ignore
  }
};

const syncMiniProgramVersion = () => {
  // #ifdef MP-WEIXIN
  appVersion.value = uni.getAccountInfoSync().miniProgram.version || "1.0.0";
  // #endif
};

onLoad(async () => {
  syncAuthState();
  await fetchUserInfoIfNeeded();
  await fetchCacheSize();
  syncMiniProgramVersion();
});

onShow(async () => {
  syncAuthState();
  await fetchUserInfoIfNeeded();
  await fetchCacheSize();
  syncMiniProgramVersion();
});

// 登录
const navigateToLogin = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentPagePath = `/${currentPage.route}`;
  router.push({ path: "/pages/login/index", query: { redirect: currentPagePath } });
};

// 个人信息
const openProfile = () => {
  if (!isLogin.value) {
    navigateToLogin();
    return;
  }
  router.push({ path: "/pages/mine/profile/index" });
};

// 账号和安全
const openAccount = () => {
  if (!isLogin.value) {
    navigateToLogin();
    return;
  }
  router.push({ path: "/pages/mine/account/index" });
};

const openNotifications = () => {
  if (!isLogin.value) {
    navigateToLogin();
    return;
  }
  uni.showToast({
    title: "功能开发中",
    icon: "none",
  });
};

// 主题设置
const openThemeSettings = () => {
  router.push({ path: "/pages/mine/settings/theme/index" });
};

// 用户协议
const openUserAgreement = () => {
  router.push({ path: "/pages/mine/settings/agreement/index" });
};

// 网络测试
const openNetworkTest = () => {
  router.push({ path: "/pages/mine/settings/network/index" });
};

const openAbout = () => {
  router.push({ path: "/pages/mine/about/index" });
};

const clearing = ref(false);
const cacheSize = ref<any>("计算中...");

const formatBytes = (size: number) => {
  if (size < 1024) {
    return size + "B";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + "KB";
  } else {
    return (size / 1024 / 1024).toFixed(2) + "MB";
  }
};

const fetchCacheSize = async () => {
  try {
    // #ifdef MP-WEIXIN
    const res = await uni.getStorageInfo();
    cacheSize.value = formatBytes(res.currentSize);
    // #endif
    // #ifdef H5
    cacheSize.value = formatBytes(
      Object.keys(localStorage).reduce((size, key) => size + localStorage[key].length, 0)
    );
    // #endif
    if (!cacheSize.value) {
      cacheSize.value = "0B";
    }
  } catch (error) {
    console.error("获取缓存大小失败:", error);
    cacheSize.value = "获取失败";
  }
};

const handleClearCache = async () => {
  if (cacheSize.value === "获取失败") {
    uni.showToast({
      title: "获取缓存信息失败，请稍后重试",
      icon: "none",
      duration: 2000,
    });
    return;
  }
  if (cacheSize.value === "0B") {
    uni.showToast({
      title: "暂无缓存需要清理",
      icon: "none",
      duration: 2000,
    });
    return;
  }
  if (clearing.value) {
    return;
  }

  try {
    clearing.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await uni.clearStorage();
    await fetchCacheSize();
    uni.showToast({
      title: "清理成功",
      icon: "success",
    });
  } catch {
    uni.showToast({
      title: "清理失败",
      icon: "error",
    });
  } finally {
    clearing.value = false;
  }
};

const handleLogout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: function (res) {
      if (res.confirm) {
        userStore.logout();
        uni.showToast({
          title: "已退出登录",
          icon: "success",
        });
      }
    },
  });
};

// 有来技术公众号
const openOfficialAccount = () => {
  uni.navigateTo({
    url: "/pages/mine/official/index",
  });
};

type ActionItem = {
  title: string;
  desc?: string;
  icon: string;
  tint: string;
  iconColor?: string;
  value?: string;
  action: () => void;
};

const quickCards = computed<ActionItem[]>(() => {
  const items: ActionItem[] = [
    {
      title: "我的资料",
      desc: "修改个人信息",
      icon: "user",
      tint: "#dbeafe",
      iconColor: "#1e40af",
      action: openProfile,
    },
    {
      title: "账号安全",
      desc: "修改密码 / 账号绑定",
      icon: "secured",
      tint: "#d1fae5",
      iconColor: "#065f46",
      action: openAccount,
    },
  ];

  if (isLogin.value) {
    return items;
  }

  return [];
});

const settingsItems = computed<ActionItem[]>(() => [
  {
    title: "网络检测",
    desc: "检测接口连通性",
    icon: "server",
    tint: "#fed7aa",
    iconColor: "#c2410c",
    action: openNetworkTest,
  },
  {
    title: "清理缓存",
    desc: "显示当前缓存大小",
    icon: "delete-thin",
    tint: "#fecdd3",
    iconColor: "#be123c",
    value: cacheSize.value,
    action: handleClearCache,
  },
]);

const helpItems = computed<ActionItem[]>(() => [
  {
    title: "用户协议",
    desc: "了解产品使用规则",
    icon: "secured",
    tint: "#d1fae5",
    iconColor: "#065f46",
    action: openUserAgreement,
  },
  {
    title: "关于系统",
    desc: "产品介绍与联系方式",
    icon: "info-circle",
    tint: "#ccfbf1",
    iconColor: "#0f766e",
    value: `v${appVersion.value}`,
    action: openAbout,
  },
]);
</script>

<style lang="scss" scoped>
// ...
.mine-hero {
  position: relative;
  padding-bottom: 24rpx;
  overflow: visible;
}

.mine-hero__bg {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 520rpx;
  pointer-events: none;
}

.mine-hero__content,
.profile-card,
.profile-card__top,
.profile-card__tags,
.menu-row {
  display: flex;
}

.mine-hero__content {
  position: relative;
  z-index: 1;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx 28rpx 0;
}

.mine-navbar__title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2rpx;
}

.profile-card__status,
.profile-tag,
.profile-card__gender {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.profile-card {
  position: relative;
  padding: 28rpx 28rpx;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.12) 100%);
  backdrop-filter: blur(20px);
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  border-radius: 28rpx;
  box-shadow:
    0 8rpx 32rpx rgba(0, 0, 0, 0.08),
    0 2rpx 8rpx rgba(0, 0, 0, 0.04),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
}

.profile-card::before {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200rpx;
  height: 200rpx;
  pointer-events: none;
  content: "";
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%);
  border-radius: 50%;
}

.profile-card__header {
  display: flex;
  gap: 28rpx;
  align-items: center;
  width: 100%;
}

.profile-card__left {
  position: relative;
  flex-shrink: 0;
}

.profile-card__avatar {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.profile-card__gender {
  position: absolute;
  right: -4rpx;
  bottom: 2rpx;
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #fff;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.profile-card__online-dot {
  position: absolute;
  right: 6rpx;
  bottom: 6rpx;
  width: 18rpx;
  height: 18rpx;
  background: #22c55e;
  border: 3rpx solid rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.12);
}

.profile-card__actions {
  display: flex;
  flex-shrink: 0;
  gap: 10rpx;
  align-items: center;
  margin-right: -10rpx;
  margin-left: auto;
}

.profile-card__action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.22);
  border-radius: 999rpx;
}

.profile-card__notify-badge {
  position: absolute;
  top: -8rpx;
  right: -6rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30rpx;
  height: 30rpx;
  padding: 0 8rpx;
  font-size: 18rpx;
  color: #fff;
  background: #ef4444;
  border: 2rpx solid rgba(255, 255, 255, 0.95);
  border-radius: 999rpx;
}

.gender-icon--male {
  background: #60a5fa;
}

.gender-icon--female {
  background: #fb7185;
}

.profile-card__main {
  flex: 1;
  min-width: 0;
}

.profile-card__top {
  gap: 16rpx;
  align-items: center;
  margin-bottom: 18rpx;
}

.profile-card__name {
  flex: 1;
  min-width: 0;
  font-size: 38rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.profile-card__status {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  font-size: 20rpx;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
}

.profile-card__desc {
  display: -webkit-box;
  margin-top: 12rpx;
  overflow: hidden;
  font-size: 24rpx;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.84);
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.profile-card__hint {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.84);
}

.profile-card__tags {
  flex-wrap: wrap;
  gap: 12rpx;
}

.profile-card__action {
  flex-shrink: 0;
  align-self: center;
}

.profile-tag {
  gap: 8rpx;
  padding: 8rpx 14rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
}

.quick-cards {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-top: 24rpx;
  margin-bottom: 0;
}

.community-card {
  position: relative;
  display: flex;
  gap: 24rpx;
  align-items: center;
  padding: 36rpx;
  overflow: hidden;
  background: transparent;
  border-radius: 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
}

.community-card__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 1;
}

.community-card__mask {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.62) 0%,
    rgba(255, 255, 255, 0.34) 55%,
    rgba(255, 255, 255, 0.58) 100%
  );
}

.community-card__sparkle {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 30%, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0) 52%),
    radial-gradient(circle at 72% 20%, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0) 58%),
    radial-gradient(circle at 60% 78%, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 60%);
  opacity: 0.55;
}

.community-card__logo {
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  width: 84rpx;
  height: 84rpx;
  padding: 10rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 1rpx solid rgba(148, 163, 184, 0.22);
  border-radius: 20rpx;
  box-shadow: 0 6rpx 18rpx rgba(15, 23, 42, 0.06);
}

.community-card__body {
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: 0;
}

.community-card__arrow {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  background: rgba(255, 255, 255, 0.68);
  border-radius: 999rpx;
}

.community-card__title-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.community-card__title {
  display: block;
  margin-top: 14rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--wot-color-text, #2f3a4a);
  letter-spacing: 0.2px;
}

:deep(.community-card__tag) {
  margin-top: 14rpx;
}

.community-card__desc {
  display: block;
  display: -webkit-box;
  margin-top: 10rpx;
  overflow: hidden;
  font-size: 24rpx;
  line-height: 1.55;
  color: var(--wot-color-text-secondary, #64748b);
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.section-card {
  padding: 28rpx;
  background: var(--wot-color-white, #fff);
  border-radius: 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.05);
}

.section-card + .section-card {
  margin-top: 24rpx;
}

.section-title {
  display: block;
  margin-bottom: 18rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--wot-color-text, #2f3a4a);
}

.quick-card {
  display: flex;
  gap: 20rpx;
  align-items: center;
  padding: 28rpx 24rpx;
  background: var(--wot-color-white, #fff);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: all 0.2s ease;
}

.quick-card:active {
  box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.06);
  transform: scale(0.96);
}

.quick-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84rpx;
  height: 84rpx;
  border-radius: 22rpx;
}

.quick-card__body {
  flex: 1;
  min-width: 0;
}

.quick-card__title {
  display: block;
  overflow: hidden;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.35;
  color: var(--wot-color-text, #2f3a4a);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-card__desc {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--wot-color-text-secondary, #64748b);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-row__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
}

.mine-body {
  position: relative;
  z-index: 0;
  padding: 0 28rpx calc(env(safe-area-inset-bottom) + 40rpx);
  margin-top: 0;
  background: var(--wot-color-bg, #f8fafc);
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
}

.menu-list {
  padding: 0 28rpx;
  margin-top: 24rpx;
  overflow: hidden;
  background: var(--wot-color-white, #fff);
  border-radius: 32rpx;
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.05);
}

.menu-list--flat {
  padding: 0;
  margin-top: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.menu-row {
  gap: 20rpx;
  align-items: center;
  padding: 24rpx 20rpx;
  background: transparent;
}

.menu-row + .menu-row {
  border-top: 1rpx solid rgba(148, 163, 184, 0.14);
}

.menu-row__icon {
  flex-shrink: 0;
  width: 76rpx;
  height: 76rpx;
}

.menu-row__main {
  flex: 1;
  min-width: 0;
}

.menu-row__title {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: var(--wot-color-text, #2f3a4a);
}

.menu-row__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--wot-color-text-secondary, #64748b);
}

.menu-row__value {
  margin-left: 12rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

.logout-section {
  padding: 36rpx 32rpx 0;
}

:deep(.profile-card__button) {
  flex-shrink: 0;
  min-width: 156rpx;
  height: 72rpx !important;
  padding: 0 24rpx !important;
  font-size: 24rpx !important;
  font-weight: 600;
  border: 0 !important;
  border-radius: 999rpx !important;
}

:deep(.logout-btn) {
  width: 100%;
  height: 88rpx !important;
  font-size: 28rpx !important;
  color: #ef4444 !important;
  background: var(--wot-color-white, #fff) !important;
  border: 1rpx solid rgba(239, 68, 68, 0.18) !important;
  border-radius: 24rpx !important;
  box-shadow: 0 12rpx 30rpx rgba(239, 68, 68, 0.08);
}

:deep(.loading-center) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.72);
  border-radius: 24rpx;
}
</style>
