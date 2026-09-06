<template>
  <view>
    <view class="mine-hero" :style="{ paddingTop: `${navbar.totalHeight.value}px` }">
      <view class="mine-hero__bg" :style="{ background: headerBackground }" />

      <custom-navbar
        bg-color="transparent"
        title-color="var(--color-text-inverse)"
        icon-color="var(--color-text-inverse)"
        :show-back="false"
        :placeholder="false"
      >
        <template #left>
          <view v-if="isLogin" class="mine-navbar__scan" aria-label="扫一扫" @click="scanLogin">
            <wd-icon name="scan" size="40rpx" color="var(--color-text-inverse)" />
          </view>
        </template>
        <template #center>
          <text class="mine-navbar__title">个人中心</text>
        </template>
      </custom-navbar>

      <view class="mine-hero__content">
        <profile-card
          :is-login="isLogin"
          :avatar="avatar"
          :name="displayName"
          :username="username"
          :dept-name="deptName"
          @profile="openProfile"
          @login="navigateToLogin"
          @notifications="openNotifications"
        />

        <community-card @open="openOfficialAccount" />

        <quick-cards v-if="isLogin" @profile="openProfile" @account="openAccount" />
      </view>
    </view>

    <view class="mine-body">
      <menu-section title="系统工具" :items="toolMenus" @select="handleMenuSelect" />
      <menu-section title="帮助与支持" :items="helpMenus" @select="handleMenuSelect" />
    </view>

    <wd-loading
      v-if="isClearing"
      v-model="isClearing"
      text="正在清理..."
      mask
      custom-class="loading-center"
    />
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useUserStore, useThemeStore } from "@/store";
import { useRouter } from "uni-mini-router";
import { useNavbar } from "@/composables/useNavbar";
import { useScanLogin } from "@/composables/useScanLogin";
import { formatBytes } from "@/utils/format";
import ProfileCard from "./components/profile-card.vue";
import CommunityCard from "./components/community-card.vue";
import QuickCards from "./components/quick-cards.vue";
import MenuSection, { type MenuItem } from "./components/menu-section.vue";

definePage({
  name: "mine",
  style: { navigationStyle: "custom" },
  layout: "tabbar",
});

const userStore = useUserStore();
const themeStore = useThemeStore();
const router = useRouter();
const navbar = useNavbar({ hasTabbar: true });
const { scanLogin } = useScanLogin();
const toast = useToast();

const isLogin = computed(() => !!userStore.userInfo);
const userInfo = computed(() => userStore.userInfo);
const defaultAvatar = "/static/images/default-avatar.png";

const avatar = computed(() =>
  isLogin.value && userInfo.value?.avatar ? userInfo.value.avatar : defaultAvatar
);
const displayName = computed(() =>
  isLogin.value ? userInfo.value?.nickname || "匿名用户" : "欢迎使用"
);
const username = computed(() => userInfo.value?.username || "未设置账号");
const deptName = computed(() => (isLogin.value ? userInfo.value?.deptName || "" : ""));

const headerBackground = computed(() => {
  const color = themeStore.themeVars.colorTheme || "var(--color-primary)";
  const colorWithAlpha = color.length === 7 ? `${color}E6` : color;
  const colorWithAlpha2 = color.length === 7 ? `${color}CC` : color;
  return `linear-gradient(135deg, ${colorWithAlpha} 0%, ${colorWithAlpha2} 100%)`;
});

const appVersion = ref("1.0.0");
const isClearing = ref(false);
const cacheSize = ref<string>("计算中...");

const toolMenus = computed<MenuItem[]>(() => [
  { key: "network", icon: "tool", tone: "warning", title: "网络检测", desc: "检测接口连通性" },
  {
    key: "clear-cache",
    icon: "delete",
    tone: "danger",
    title: "清理缓存",
    desc: "显示当前缓存大小",
    value: cacheSize.value,
  },
]);

const helpMenus = computed<MenuItem[]>(() => [
  {
    key: "settings",
    icon: "settings",
    tone: "primary",
    title: "系统设置",
    desc: "主题、语言、通知等设置",
  },
  {
    key: "agreement",
    icon: "safe",
    tone: "success",
    title: "用户协议",
    desc: "了解产品使用规则",
  },
  {
    key: "about",
    icon: "info-circle",
    tone: "info",
    title: "关于系统",
    desc: "产品介绍与联系方式",
    value: `v${appVersion.value}`,
  },
]);

const menuRoutes: Record<string, string> = {
  network: "/subPages/mine/settings/network/index",
  settings: "/subPages/mine/settings/index",
  agreement: "/subPages/mine/settings/agreement/index",
  about: "/subPages/mine/about/index",
};

function handleMenuSelect(key: string) {
  if (key === "clear-cache") {
    handleClearCache();
    return;
  }
  const path = menuRoutes[key];
  if (path) {
    router.push({ path });
  }
}

// 登录
const navigateToLogin = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentPagePath = `/${currentPage.route}`;
  router.push({ path: "/pages/login/index", query: { redirect: currentPagePath } });
};

const openProfile = () => {
  if (!isLogin.value) {
    navigateToLogin();
    return;
  }
  router.push({ path: "/subPages/mine/profile/index" });
};

// 账号和安全
const openAccount = () => {
  if (!isLogin.value) {
    navigateToLogin();
    return;
  }
  router.push({ path: "/subPages/mine/account/index" });
};

const openNotifications = () => {
  if (!isLogin.value) {
    navigateToLogin();
    return;
  }
  toast.info("功能开发中");
};

// 有来技术公众号
const openOfficialAccount = () => {
  uni.navigateTo({
    url: "/subPages/mine/official/index",
  });
};

const hasUserProfile = computed(() => {
  const info = userInfo.value;
  return !!(info && (info.userId || info.username || info.nickname));
});

const fetchUserInfoIfNeeded = async () => {
  if (!isLogin.value || hasUserProfile.value) return;
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

onShow(async () => {
  await fetchUserInfoIfNeeded();
  await fetchCacheSize();
  syncMiniProgramVersion();
});

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
  } catch {
    cacheSize.value = "获取失败";
  }
};

const handleClearCache = async () => {
  if (cacheSize.value === "获取失败") {
    toast.info("获取缓存信息失败，请稍后重试");
    return;
  }
  if (cacheSize.value === "0B") {
    toast.info("暂无缓存需要清理");
    return;
  }
  if (isClearing.value) {
    return;
  }

  try {
    isClearing.value = true;
    await uni.clearStorage();
    await fetchCacheSize();
    toast.success("清理成功");
  } catch {
    toast.error("清理失败");
  } finally {
    isClearing.value = false;
  }
};
</script>

<style lang="scss" scoped>
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

.mine-hero__content {
  position: relative;
  z-index: var(--z-sticky);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx 28rpx 0;
}

.mine-navbar__title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text-inverse);
  letter-spacing: 2rpx;
}

/* 扫码入口：渐变背景上的白色图标，64rpx 圆形热区 */
.mine-navbar__scan {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;

  &:active {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.mine-body {
  position: relative;
  z-index: var(--z-base);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 0 28rpx 40rpx;
  margin-top: 0;
  background: var(--color-bg-secondary);
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
}

.loading-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.72);
  border-radius: 24rpx;
}
</style>
