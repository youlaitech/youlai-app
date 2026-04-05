<template>
  <view class="page page--tabbar">
    <!-- 轮播图 -->
    <view class="relative">
      <wd-swiper
        v-model:current="current"
        custom-class="swiper-box"
        :list="swiperList"
        autoplay
        @click="handleSwiperClick"
        @change="handleSwiperChange"
      />
      <view class="hero-fade"></view>
    </view>

    <!-- 快捷导航 -->
    <view class="section--overlay">
      <wd-grid clickable :column="4">
        <wd-grid-item
          v-for="(item, index) in quickNavList"
          :key="index"
          use-slot
          @itemclick="handleNavClick(item)"
        >
          <view class="nav-item">
            <image class="nav-item__icon" :src="item.icon" mode="aspectFit" />
            <text class="nav-item__label">{{ item.title }}</text>
          </view>
        </wd-grid-item>
      </wd-grid>
    </view>

    <!-- 通知公告 -->
    <view class="m-24rpx">
      <view class="notice-bar" @click="handleNoticeClick">
        <view class="notice-bar__icon">
          <wd-icon name="check-outline" size="32rpx" color="var(--color-success)" />
        </view>
        <view class="notice-bar__content">
          <text class="notice-bar__text">{{ noticeText || "暂无通知公告" }}</text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="m-24rpx">
      <view class="grid grid-cols-2 gap-16rpx">
        <view class="stat-card gradient-bg--success">
          <image class="stat-card__icon" src="/static/icons/visitor.svg" mode="aspectFit" />
          <view class="stat-card__header">
            <text class="stat-card__label">访客数</text>
            <view class="stat-card__dot stat-card__dot--green"></view>
          </view>
          <text class="stat-card__num stat-card__num--green">
            {{ visitOverviewData.todayUvCount }}
          </text>
        </view>
        <view class="stat-card gradient-bg--primary">
          <image class="stat-card__icon" src="/static/icons/browser.svg" mode="aspectFit" />
          <view class="stat-card__header">
            <text class="stat-card__label">浏览量</text>
            <view class="stat-card__dot stat-card__dot--blue"></view>
          </view>
          <text class="stat-card__num stat-card__num--blue">
            {{ visitOverviewData.todayPvCount }}
          </text>
        </view>
      </view>
    </view>

    <!-- 访问趋势图表 -->
    <view class="m-24rpx">
      <wd-card custom-class="chart-card">
        <template #title>
          <view class="flex-between">
            <text class="text-28rpx font-semibold">访问趋势</text>
            <wd-radio-group
              v-model="recentDaysRange"
              shape="button"
              inline
              @change="handleDataRangeChange"
            >
              <wd-radio :value="7">近7天</wd-radio>
              <wd-radio :value="15">近15天</wd-radio>
            </wd-radio-group>
          </view>
        </template>

        <view class="w-full h-600rpx">
          <qiun-data-charts type="area" :chartData="chartData" :opts="chartOpts" />
        </view>
      </wd-card>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onReady, onShow } from "@dcloudio/uni-app";
import { dayjs } from "wot-design-uni";
import { useRouter } from "uni-mini-router";
import { useUserStore } from "@/store";
import { menuConfig } from "@/config/menu";
import { checkLogin, isLoggedIn } from "@/utils/auth";
import LogAPI, { type VisitOverview as ApiVisitOverview, type VisitTrend } from "@/api/log";
import NoticeAPI, { type NoticeItem } from "@/api/notice";

// ============================================================================
// 类型定义
// ============================================================================

type VisitOverviewVO = ApiVisitOverview;

interface NavItem {
  icon: string;
  title: string;
  url: string;
  perm: string;
}

// ============================================================================
// Hooks
// ============================================================================

const router = useRouter();
const userStore = useUserStore();
// custom-navbar 组件内部已处理导航栏高度与胶囊避让

// ============================================================================
// 响应式数据
// ============================================================================

const current = ref(0);
const recentDaysRange = ref(7);

const swiperList = ref(["https://www.youlai.tech/storage/blog/banner9.png"]);

const visitOverviewData = ref<VisitOverviewVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const appVersion = ref<string>("");

const noticeList = ref<NoticeItem[]>([]);
const noticeText = computed(() => {
  if (!noticeList.value.length) {
    return "暂无通知";
  }
  const titles = noticeList.value
    .map((n: NoticeItem) => n.title)
    .filter(Boolean)
    .slice(0, 2) as string[];
  return titles.length ? titles.join("    ") : "暂无通知";
});

// 用户权限列表
const userPerms = computed(() => userStore.userInfo?.perms || []);

// 是否已登录
const isLogged = computed(() => isLoggedIn());

const hasAnyPerm = computed(() => userPerms.value.length > 0);

// 检查是否有权限
const hasPermission = (perm: string) => {
  if (!perm) return true;
  return userPerms.value.includes(perm) || userPerms.value.includes("*:*:*");
};

// 默认菜单（未登录时显示）
const defaultNavList = computed(() => {
  const result: { icon: string; title: string; url: string; perm: string }[] = [];
  for (const group of menuConfig) {
    for (const item of group.children) {
      result.push(item);
      if (result.length >= 4) {
        return result;
      }
    }
  }
  return result;
});

// 快捷入口：已登录按权限过滤，未登录显示默认菜单
const quickNavList = computed(() => {
  if (!isLogged.value || !hasAnyPerm.value) {
    return defaultNavList.value;
  }
  const result: { icon: string; title: string; url: string; perm: string }[] = [];
  for (const group of menuConfig) {
    for (const item of group.children) {
      if (hasPermission(item.perm)) {
        result.push(item);
      }
      if (result.length >= 4) {
        return result;
      }
    }
  }
  return result;
});

const chartData = ref({});
const chartOpts = ref({
  padding: [20, 0, 20, 0],
  xAxis: {
    fontSize: 10,
    rotateLabel: true,
    rotateAngle: 30,
  },
  yAxis: {
    disabled: true,
  },
  extra: {
    area: {
      type: "curve",
      opacity: 0.2,
      addLine: true,
      width: 2,
      gradient: true,
      activeType: "hollow",
    },
  },
});

// ============================================================================
// 数据加载
// ============================================================================

function loadAppVersion() {
  try {
    const p: any = (globalThis as any).plus;
    if (p?.runtime?.version) {
      appVersion.value = `v${p.runtime.version}`;
    }
  } catch {
    appVersion.value = "";
  }
}

async function loadNoticeData() {
  // 未登录时不调用通知接口
  if (!isLogged.value) {
    noticeList.value = [];
    return;
  }
  try {
    const { list } = await NoticeAPI.getMyNoticePage({ pageNum: 1, pageSize: 2 });
    noticeList.value = list || [];
  } catch {
    noticeList.value = [];
  }
}

async function loadVisitOverviewData() {
  try {
    visitOverviewData.value = await LogAPI.getVisitOverview();
  } catch {
    // ignore
  }
}

async function loadVisitTrendData() {
  const endDate = dayjs().format("YYYY-MM-DD");
  const startDate = dayjs()
    .subtract(recentDaysRange.value - 1, "day")
    .format("YYYY-MM-DD");

  try {
    const data: VisitTrend = await LogAPI.getVisitTrend({ startDate, endDate });
    chartData.value = JSON.parse(
      JSON.stringify({
        categories: (data.dates || []).map((d) => dayjs(d).format("MM-DD")),
        series: [
          { name: "访客数(UV)", data: data.uvList || [] },
          { name: "浏览量(PV)", data: data.pvList || [] },
        ],
      })
    );
  } catch {
    chartData.value = { categories: [], series: [] };
  }
}

// ============================================================================
// 事件处理
// ============================================================================

function handleNavClick(item: NavItem) {
  // 未登录 / 无权限时：展示默认导航，但点击统一跳登录
  if (!isLogged.value || !hasAnyPerm.value) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  // 已登录但访问受限时，仍做一次登录校验（防 token 过期）
  if (!checkLogin()) return;

  // 外部链接处理
  if (item.url.startsWith("http://") || item.url.startsWith("https://")) {
    const isH5 = typeof window !== "undefined";
    if (isH5) {
      uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(item.url)}` });
    } else {
      try {
        const p = (globalThis as any).plus;
        p?.runtime?.openURL(item.url);
      } catch {
        uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(item.url)}` });
      }
    }
    return;
  }

  router.push({ path: item.url });
}

function handleNoticeClick() {
  router.push({ path: "/pages/work/notice/index" });
}

function handleSwiperClick(_e: any) {}

function handleSwiperChange(_e: any) {}

function handleDataRangeChange({ value }: { value: number }) {
  recentDaysRange.value = value;
  loadVisitTrendData();
}

// ============================================================================
// 生命周期
// ============================================================================

onReady(() => {
  loadAppVersion();
  loadNoticeData();
  loadVisitOverviewData();
  loadVisitTrendData();
});

// 每次页面显示时刷新数据（登录后跳转回来也能更新）
onShow(() => {
  loadVisitOverviewData();
  loadVisitTrendData();
});
</script>

<route lang="json">
{
  "name": "home",
  "style": { "navigationStyle": "custom" },
  "layout": "tabbar"
}
</route>

<style lang="scss" scoped>
.hero-fade {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--z-sticky);
  height: 120rpx;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--color-bg-secondary) 60%,
    var(--color-bg-secondary) 100%
  );
}

:deep(.swiper-box),
:deep(.swiper-box .wd-swiper__item),
:deep(.swiper-box image) {
  height: 420rpx;
}

.section--overlay {
  position: relative;
  z-index: var(--z-sticky);
  padding: 18rpx 8rpx;
  margin: 24rpx;
  margin-top: -120rpx;
  background: var(--color-bg);
  border-radius: 24rpx;
  box-shadow: var(--shadow-md);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;

  &__icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 16rpx;
  }

  &__label {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: var(--color-text);
  }
}

.notice-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 24rpx 20rpx;
  background: var(--color-bg);
  border: 1rpx solid var(--color-border);
  border-radius: 16rpx;
  box-shadow: var(--shadow-sm);

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    margin-right: 16rpx;
    background: var(--color-success-light);
    border-radius: 12rpx;
  }

  &__content {
    flex: 1;
    overflow: hidden;
  }

  &__text {
    display: -webkit-box;
    overflow: hidden;
    font-size: 26rpx;
    font-weight: 500;
    color: var(--color-text);
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }
}

.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24rpx 20rpx;
  overflow: hidden;
  background: var(--color-bg);
  border: 1rpx solid var(--color-border);
  border-radius: 16rpx;
  box-shadow: var(--shadow-sm);

  &__header {
    position: relative;
    z-index: var(--z-sticky);
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  &__label {
    font-size: 24rpx;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__icon {
    position: absolute;
    right: -10rpx;
    bottom: -10rpx;
    width: 100rpx;
    height: 100rpx;
    opacity: 0.15;
  }

  &__dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;

    &--green {
      background: var(--color-success);
      box-shadow: 0 0 10rpx rgba(52, 209, 157, 0.4);
    }

    &--blue {
      background: var(--color-primary);
      box-shadow: 0 0 10rpx rgba(37, 99, 235, 0.4);
    }

    &--orange {
      background: var(--color-warning);
      box-shadow: 0 0 12rpx rgba(245, 158, 11, 0.4);
    }
  }

  &__num {
    position: relative;
    z-index: var(--z-sticky);
    font-size: 48rpx;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1rpx;

    &--green {
      color: var(--color-success);
    }

    &--blue {
      color: var(--color-primary);
    }

    &--orange {
      color: var(--color-warning);
    }
  }

  &--full {
    flex-direction: row;
    grid-column: 1 / -1;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 20rpx;

    .stat-card__num {
      font-size: 28rpx;
      letter-spacing: 0;
    }
  }
}
</style>
