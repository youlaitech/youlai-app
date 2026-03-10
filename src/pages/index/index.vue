<template>
  <view class="home-page">
    <!-- 轮播�?-->
    <view class="hero">
      <wd-swiper
        v-model:current="current"
        custom-class="swiper-box"
        :list="swiperList"
        autoplay
        @click="handleSwiperClick"
        @change="handleSwiperChange"
      />
    </view>

    <!-- 快捷导航 -->
    <view class="section section--overlay">
      <wd-grid clickable :column="4">
        <wd-grid-item
          v-for="(item, index) in quickNavList"
          :key="index"
          use-slot
          @click="handleNavClick(item)"
        >
          <view class="nav-item">
            <image class="nav-item__icon" :src="item.icon" />
            <text class="nav-item__label">{{ item.title }}</text>
          </view>
        </wd-grid-item>
      </wd-grid>
    </view>

    <!-- 通知公告 -->
    <view v-if="noticeList.length" class="section">
      <view class="notice-bar" @click="handleNoticeClick">
        <view class="notice-bar__icon">
          <wd-icon name="check-outline" size="32rpx" color="#34D19D" />
        </view>
        <view class="notice-bar__content">
          <view v-if="isNoticeScrolling" class="notice-bar__marquee">
            <view class="notice-bar__marquee-inner">
              <text class="notice-bar__text">{{ noticeText }}</text>
              <text class="notice-bar__text notice-bar__text--gap">{{ noticeText }}</text>
            </view>
          </view>
          <text v-else class="notice-bar__text">{{ noticeText }}</text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="section">
      <view class="stat-grid">
        <view class="stat-card stat-card--green">
          <view class="stat-card__bg">
            <view class="stat-card__icon stat-card__icon--user"></view>
          </view>
          <view class="stat-card__head">
            <text class="stat-card__label">访客�?/text>
            <view class="stat-card__dot stat-card__dot--green"></view>
          </view>
          <text class="stat-card__num stat-card__num--green">
            {{ visitStatsData.todayUvCount }}
          </text>
        </view>
        <view class="stat-card stat-card--blue">
          <view class="stat-card__bg">
            <view class="stat-card__icon stat-card__icon--eye"></view>
          </view>
          <view class="stat-card__head">
            <text class="stat-card__label">浏览�?/text>
            <view class="stat-card__dot stat-card__dot--blue"></view>
          </view>
          <text class="stat-card__num stat-card__num--blue">
            {{ visitStatsData.todayPvCount }}
          </text>
        </view>
        <view v-if="appVersion" class="stat-card stat-card--orange stat-card--full">
          <view class="stat-card__bg">
            <view class="stat-card__icon stat-card__icon--gear"></view>
          </view>
          <view class="stat-card__head">
            <text class="stat-card__label">应用版本</text>
            <view class="stat-card__dot stat-card__dot--orange"></view>
          </view>
          <text class="stat-card__num stat-card__num--orange">{{ appVersion }}</text>
        </view>
      </view>
    </view>

    <!-- 访问趋势图表 -->
    <view class="section">
      <wd-card custom-class="chart-card">
        <template #title>
          <view class="chart-header">
            <text class="chart-header__title">访问趋势</text>
            <wd-radio-group
              v-model="recentDaysRange"
              shape="button"
              inline
              @change="handleDataRangeChange"
            >
              <wd-radio :value="7">�?�?/wd-radio>
              <wd-radio :value="15">�?5�?/wd-radio>
            </wd-radio-group>
          </view>
        </template>

        <view class="chart-container">
          <qiun-data-charts type="area" :chartData="chartData" :opts="chartOpts" />
        </view>
      </wd-card>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 首页
 *
 * 功能说明�? * - 自定义导航栏（搜索框�? * - 轮播图展�? * - 快捷导航入口
 * - 通知公告
 * - 数据统计
 * - 访问趋势图表
 *
 * 技术要点：
 * - 使用 useNavbar 处理自定义导航栏高度和胶囊避�?
 * - 使用 BEM 命名规范组织 CSS
 * - 支持暗黑模式（通过 CSS 变量�? */

import { computed, ref } from "vue";
import { onReady } from "@dcloudio/uni-app";
import { dayjs } from "wot-design-uni";
import { useRouter } from "uni-mini-router";
import { useUserStore } from "@/store";
import { menuConfig } from "@/config/menu";
import { checkLogin, isLoggedIn } from "@/utils/auth";
import LogAPI, { type VisitStatsVO as ApiVisitStatsVO, type VisitTrendVO } from "@/api/log";
import NoticeAPI, { type NoticePageVO } from "@/api/notice";

// ============================================================================
// 类型定义
// ============================================================================

type VisitStatsVO = ApiVisitStatsVO;

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
// custom-navbar 组件内部已处理导航栏高度与胶囊避�?
// ============================================================================
// 响应式数�?// ============================================================================

const current = ref(0);
const recentDaysRange = ref(7);

const swiperList = ref(["https://www.youlai.tech/storage/blog/banner9.png"]);

const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const appVersion = ref<string>("");

const noticeList = ref<NoticePageVO[]>([]);
const noticeText = computed(() => {
  const titles = noticeList.value
    .map((n: NoticePageVO) => n.title)
    .filter(Boolean)
    .slice(0, 5) as string[];
  return titles.length ? titles.join("    ") : "";
});

const isNoticeScrolling = computed(() => noticeList.value.length > 1);

// 用户权限列表
const userPerms = computed(() => userStore.userInfo?.perms || []);

// 是否已登�?const isLogged = computed(() => isLoggedIn());

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

// 快捷入口：已登录按权限过滤，未登录显示默认菜�?const quickNavList = computed(() => {
  if (!isLogged.value) {
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
    const { list } = await NoticeAPI.getMyNoticePage({ pageNum: 1, pageSize: 5 });
    noticeList.value = list || [];
  } catch {
    noticeList.value = [];
  }
}

async function loadVisitStatsData() {
  try {
    visitStatsData.value = await LogAPI.getVisitStats();
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
    const data: VisitTrendVO = await LogAPI.getVisitTrend({ startDate, endDate });
    chartData.value = JSON.parse(
      JSON.stringify({
        categories: (data.dates || []).map((d) => dayjs(d).format("MM-DD")),
        series: [
          { name: "访客�?UV)", data: data.uvList || [] },
          { name: "浏览�?PV)", data: data.pvList || [] },
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
  // 未登录时先检查登录状态并跳转登录�?  if (!checkLogin()) {
    return;
  }
  router.push({ path: item.url });
}

function handleNoticeClick() {
  router.push({ path: "/pages/work/notice/index" });
}

function handleSwiperClick(e: any) {
  console.log("Swiper click:", e);
}

function handleSwiperChange(e: any) {
  console.log("Swiper change:", e);
}

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
  loadVisitStatsData();
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
// ============================================================================
// 页面容器
// ============================================================================

.home-page {
  min-height: 100%;
  background-color: var(--color-bg-secondary);
}

.hero {
  position: relative;
}
.hero::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  height: 120rpx;
  pointer-events: none;
  content: "";
  background: linear-gradient(
    to bottom,
    rgba(245, 247, 250, 0) 0%,
    rgba(245, 247, 250, 0.85) 60%,
    rgba(245, 247, 250, 1) 100%
  );
}

:deep(.swiper-box) {
  height: 420rpx;
  overflow: hidden;
  border-bottom-right-radius: 32rpx;
  border-bottom-left-radius: 32rpx;
}

:deep(.swiper-box .wd-swiper__item),
:deep(.swiper-box image) {
  height: 420rpx;
}

// ============================================================================
// 导航�?// ============================================================================

.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 999;
  background-color: rgba(255, 255, 255, 0.92);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.06);

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16rpx;
  }

  &__left {
    display: flex;
    align-items: center;
  }

  &__title {
    font-size: 34rpx;
    font-weight: 600;
    color: var(--color-text);
  }

  &__right {
    display: flex;
    align-items: center;
  }

  &__search {
    width: 100%;
  }
}

// ============================================================================
// 区块
// ============================================================================

.section {
  margin: 24rpx;
}

.section--overlay {
  position: relative;
  z-index: 2;
  padding: 18rpx 8rpx;
  margin-top: -140rpx;
  background: var(--color-bg);
  border-radius: 24rpx;
  box-shadow: 0 16rpx 36rpx rgba(0, 0, 0, 0.08);
}

// ============================================================================
// 快捷导航�?// ============================================================================

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

// ============================================================================
// 通知�?// ============================================================================

.notice-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 24rpx 20rpx;
  background: #fff;
  border: 1rpx solid rgba(0, 0, 0, 0.04);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    margin-right: 16rpx;
    background: rgba(52, 209, 157, 0.1);
    border-radius: 12rpx;
  }

  &__content {
    flex: 1;
    overflow: hidden;
  }

  &__text {
    font-size: 26rpx;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
  }

  &__text--gap {
    padding-left: 48rpx;
  }

  &__marquee {
    width: 100%;
    overflow: hidden;
  }

  &__marquee-inner {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    animation: notice-marquee 14s linear infinite;
  }
}

@keyframes notice-marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

// ============================================================================
// 统计卡片（简洁大气风格）
// ============================================================================

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24rpx 20rpx;
  overflow: hidden;
  background: #fff;
  border: 1rpx solid rgba(0, 0, 0, 0.04);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  &__bg {
    position: absolute;
    right: 12rpx;
    bottom: 12rpx;
    width: 70rpx;
    height: 70rpx;
    pointer-events: none;
    opacity: 0.08;
  }

  &__icon {
    width: 100%;
    height: 100%;

    &--user {
      background-image: url("/static/icons/visitor.svg");
      background-repeat: no-repeat;
      background-size: contain;
    }

    &--eye {
      background-image: url("/static/icons/browser.svg");
      background-repeat: no-repeat;
      background-size: contain;
    }

    &--gear {
      background-image: url("/static/icons/setting.svg");
      background-repeat: no-repeat;
      background-size: contain;
    }
  }

  &--green {
    background: linear-gradient(135deg, #f0fdf9 0%, #fff 100%);
  }

  &--blue {
    background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%);
  }

  &--orange {
    background: linear-gradient(135deg, #fffbf0 0%, #fff 100%);
  }

  &__head {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  &__label {
    font-size: 24rpx;
    font-weight: 500;
    color: #999;
  }

  &__dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;

    &--green {
      background: #34d19d;
      box-shadow: 0 0 10rpx rgba(52, 209, 157, 0.4);
    }

    &--blue {
      background: #409eff;
      box-shadow: 0 0 10rpx rgba(64, 158, 255, 0.4);
    }

    &--orange {
      background: #faa21e;
      box-shadow: 0 0 12rpx rgba(250, 162, 30, 0.4);
    }
  }

  &__num {
    position: relative;
    z-index: 1;
    font-size: 48rpx;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1rpx;

    &--green {
      color: #2ab789;
      text-shadow: 0 4rpx 12rpx rgba(42, 183, 137, 0.3);
    }

    &--blue {
      color: #3a8ee6;
      text-shadow: 0 4rpx 12rpx rgba(58, 142, 230, 0.3);
    }

    &--orange {
      color: #e8a838;
      text-shadow: 0 4rpx 12rpx rgba(232, 168, 56, 0.3);
    }
  }

  &--full {
    flex-direction: row;
    grid-column: 1 / -1;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 20rpx;

    .stat-card__head {
      margin-bottom: 0;
    }

    .stat-card__num {
      font-size: 28rpx;
      letter-spacing: 0;
    }

    .stat-card__bg {
      right: 16rpx;
      bottom: 50%;
      width: 50rpx;
      height: 50rpx;
      transform: translateY(50%);
    }
  }
}

// ============================================================================
// 图表
// ============================================================================

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
  }
}

.chart-container {
  width: 100%;
  height: 300px;
  margin-bottom: 40rpx;
}

:deep(.chart-card) {
  margin: 0 !important;
}

:deep(.chart-card .wd-card) {
  margin: 0 !important;
  border-radius: 16rpx;
}

:deep(.chart-card .wd-card__body) {
  padding: 24rpx !important;
}
</style>
