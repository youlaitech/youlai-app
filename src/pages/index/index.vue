<template>
  <view>
    <!-- 轮播图：height 控制轨道与图片高度，custom-style 给根节点确定高度（小程序内部 scroll-view 用 100%） -->
    <view class="relative">
      <wd-swiper
        v-model:current="activeSlideIndex"
        custom-style="height: 420rpx"
        height="420rpx"
        :list="swiperList"
        autoplay
      />
      <view class="hero-fade"></view>
    </view>

    <!-- 快捷导航 -->
    <view class="quick-nav-card">
      <wd-grid clickable :column="4">
        <wd-grid-item
          v-for="(item, index) in quickNavList"
          :key="index"
          @click="handleNavItemClick(item)"
        >
          <view class="quick-nav-card__item">
            <image class="quick-nav-card__icon" :src="item.icon" mode="aspectFit" />
            <text class="quick-nav-card__label">{{ item.title }}</text>
          </view>
        </wd-grid-item>
      </wd-grid>
    </view>

    <!-- 通知公告 -->
    <view class="notice-bar m-24rpx" @click="handleNoticeClick">
      <view class="notice-bar__icon">
        <wd-icon name="check" size="32rpx" color="var(--color-success)" />
      </view>
      <view class="notice-bar__content">
        <text class="notice-bar__text">{{ noticeText || "暂无通知公告" }}</text>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="home__stats">
      <view class="stat-card stat-card--uv">
        <image class="stat-card__icon" src="/static/icons/uv.svg" mode="aspectFit" />
        <view class="stat-card__header">
          <text class="stat-card__label">访客数</text>
          <view class="stat-card__dot"></view>
        </view>
        <text class="stat-card__num">{{ visitOverviewData.todayUvCount }}</text>
      </view>
      <view class="stat-card">
        <image class="stat-card__icon" src="/static/icons/pv.svg" mode="aspectFit" />
        <view class="stat-card__header">
          <text class="stat-card__label">浏览量</text>
          <view class="stat-card__dot"></view>
        </view>
        <text class="stat-card__num">{{ visitOverviewData.todayPvCount }}</text>
      </view>
    </view>

    <!-- 访问趋势图表 -->
    <view class="chart-wrapper m-24rpx">
      <view class="chart-wrapper__header">
        <text class="chart-wrapper__title">访问趋势</text>
        <view class="segment-control">
          <view
            class="segment-control__item"
            :class="{ 'is-active': trendDays === 7 }"
            @click="switchRange(7)"
          >
            近7天
          </view>
          <view
            class="segment-control__item"
            :class="{ 'is-active': trendDays === 15 }"
            @click="switchRange(15)"
          >
            近15天
          </view>
        </view>
      </view>
      <view class="chart-wrapper__canvas">
        <qiun-data-charts
          type="area"
          :chart-data="chartData"
          :opts="chartOpts"
          background="transparent"
          :canvas2d="true"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref } from "vue";
import dayjs from "dayjs";
import { onHide, onShow } from "@dcloudio/uni-app";
import { useRealtime } from "@/composables/useRealtime";
import { useThemeStore, useUserStore } from "@/store";
import { useNavigation } from "@/composables/useNavigation";
import { workMenuGroups, type WorkMenuItem } from "@/config/work-menu";
import { isMenuAllowed } from "@/utils/permission";
import LogAPI, { type VisitOverview, type VisitTrend } from "@/api/log";
import NoticeAPI, { type NoticeItem } from "@/api/notice";

definePage({
  name: "home",
  style: { navigationStyle: "custom" },
  layout: "tabbar",
});

const userStore = useUserStore();
const realtime = useRealtime();
let pageVisible = false;
let noticeRequest: Promise<void> | null = null;
let noticeDirty = false;
let disposed = false;
const themeStore = useThemeStore();
const { navigate } = useNavigation();

const activeSlideIndex = ref(0);
const trendDays = ref(7);

const swiperList = ref(["https://www.youlai.tech/storage/youlai/bg02.png"]);

// 访问概览数据
const visitOverviewData = ref<VisitOverview>({
  todayUvCount: 0,
  todayPvCount: 0,
} as VisitOverview);

// 公告列表：只取前两条拼成滚动文案
const noticeList = ref<NoticeItem[]>([]);
const noticeText = computed(() => {
  const titles = noticeList.value
    .map((n: NoticeItem) => n.title)
    .filter(Boolean)
    .slice(0, 2);
  return titles.length ? titles.join("    ") : "暂无通知";
});

const isAuthenticated = computed(() => userStore.isAuthenticated);

// 快捷入口最多展示的数量
const QUICK_NAV_LIMIT = 4;

// 登录后按权限筛选入口；未登录时保留入口作为登录引导
const quickNavList = computed<WorkMenuItem[]>(() => {
  const result: WorkMenuItem[] = [];
  for (const group of workMenuGroups) {
    for (const item of group.children) {
      if (!isAuthenticated.value || isMenuAllowed(item.perm)) result.push(item);
      if (result.length >= QUICK_NAV_LIMIT) return result;
    }
  }
  return result;
});

const chartData = ref({});
const chartOpts = computed(() => ({
  // canvas 不认 CSS 变量，系列色与轴标签色按选中色/主题取值
  color: [themeStore.selectedThemeColor.primary],
  padding: [20, 0, 20, 0],
  fontColor: themeStore.isDark ? "#a9aeb8" : "#666666",
  xAxis: { fontSize: 10, rotateLabel: true, rotateAngle: 30 },
  yAxis: { disabled: true },
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
}));

/**
 * 仅登录后加载首页通知，忽略旧会话结果
 */
async function fetchNoticeData() {
  // 请求返回前可能切换账号，旧公告不能回填新会话
  const token = userStore.accessToken;
  if (!isAuthenticated.value) {
    noticeList.value = [];
    return;
  }
  try {
    const { list } = await NoticeAPI.getMyNoticePage({ pageNum: 1, pageSize: 2 });
    if (!disposed && token === userStore.accessToken) noticeList.value = list || [];
  } catch {
    if (!disposed && token === userStore.accessToken) noticeList.value = [];
  }
}

/**
 * 在途刷新只记录一次补拉，避免连续提示并发查询同一列表
 */
function loadNoticeData(): void {
  if (disposed || !pageVisible) return;
  if (noticeRequest) {
    noticeDirty = true;
    return;
  }
  noticeRequest = fetchNoticeData().finally(() => {
    noticeRequest = null;
    if (noticeDirty) {
      noticeDirty = false;
      loadNoticeData();
    }
  });
}

realtime.onNoticeChange(loadNoticeData);
onScopeDispose(() => {
  disposed = true;
});

/**
 * 加载首页访问概览
 */
function loadVisitOverviewData() {
  LogAPI.getVisitOverview()
    .then((data) => (visitOverviewData.value = data))
    .catch(() => {});
}

/**
 * 按所选范围加载访问趋势
 */
async function loadVisitTrendData() {
  const endDate = dayjs().format("YYYY-MM-DD");
  const startDate = dayjs()
    .subtract(trendDays.value - 1, "day")
    .format("YYYY-MM-DD");
  try {
    const data: VisitTrend = await LogAPI.getVisitTrend({ startDate, endDate });
    chartData.value = JSON.parse(
      JSON.stringify({
        categories: (data.dates || []).map((d) => dayjs(d).format("MM-DD")),
        series: [
          { name: "访客数", data: data.uvList || [] },
          { name: "浏览量", data: data.pvList || [] },
        ],
      }),
    );
  } catch {
    chartData.value = { categories: [], series: [] };
  }
}

/**
 * 检查入口要求并跳转目标页面
 */
function handleNavItemClick(item: WorkMenuItem) {
  if (!isAuthenticated.value) {
    navigateToLogin();
    return;
  }
  navigate(item);
}

/**
 * 进入登录页面
 */
function navigateToLogin() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const redirect = encodeURIComponent(`/${currentPage.route}`);
  uni.navigateTo({ url: `/pages/login/index?redirect=${redirect}` });
}

/**
 * 进入通知页面，未登录时先跳转登录
 */
function handleNoticeClick() {
  if (!isAuthenticated.value) {
    navigateToLogin();
    return;
  }
  uni.navigateTo({ url: "/subPages/work/notice/index" });
}

/**
 * 切换统计范围并更新趋势
 */
function switchRange(value: number) {
  if (trendDays.value === value) return;
  trendDays.value = value;
  loadVisitTrendData();
}

// onShow 首次进入同样触发，统一在此加载统计数据（切回 tab 时自动刷新）
onShow(() => {
  pageVisible = true;
  loadNoticeData();
  loadVisitOverviewData();
  loadVisitTrendData();
});
onHide(() => {
  pageVisible = false;
});
</script>

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
    var(--color-bg-page) 60%,
    var(--color-bg-page) 100%
  );
}

/* 统计卡片网格：一组布局样式集中在这里，模板只留一个语义类 */
.home__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin: 24rpx;
}

.chart-wrapper {
  box-sizing: border-box;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1rpx solid var(--color-border);
  border-radius: 16rpx;
  box-shadow: var(--shadow-sm);

  &__canvas {
    box-sizing: border-box;
    width: 100%;
    height: 600rpx;
    padding: 0 20rpx;
  }

  &__header {
    display: flex;
    gap: 24rpx;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 20rpx;
  }

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
  }
}

.segment-control {
  display: inline-flex;
  align-items: center;
  padding: 4rpx;
  background: var(--color-fill-1);
  border: 1rpx solid var(--color-border);
  border-radius: 12rpx;
}

.segment-control__item {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: 8rpx;
  transition: all 0.2s ease;
}

.segment-control__item.is-active {
  color: var(--color-text-inverse);
  background: var(--color-primary);
}

.quick-nav-card {
  position: relative;
  z-index: var(--z-sticky);
  padding: 12rpx 8rpx;
  margin: 24rpx;
  margin-top: -120rpx;
  overflow: hidden;
  background: var(--color-bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-sm);
  /* 网格项背景交给卡片本身，避免 wot 深色模式默认黑底 */
  --wot-grid-item-bg: transparent;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 8rpx;
  }

  &__icon {
    width: 56rpx;
    height: 56rpx;
  }

  &__label {
    margin-top: 12rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
  }
}

.notice-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 24rpx 20rpx;
  background: var(--color-bg-card);
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
    -webkit-line-clamp: 1;
    line-clamp: 1;
    font-size: 26rpx;
    font-weight: 500;
    color: var(--color-text);
    -webkit-box-orient: vertical;
  }
}

.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24rpx 20rpx;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1rpx solid var(--color-border);
  border-radius: 16rpx;
  box-shadow: var(--shadow-sm);
  /* 数字与圆点统一取 --accent，访客数用 --uv 换成绿色 */
  --accent: var(--color-primary);
  --accent-glow: rgba(77, 128, 240, 0.3);

  &--uv {
    --accent: var(--color-success);
    --accent-glow: rgba(52, 209, 157, 0.35);
  }

  &__header {
    position: relative;
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
    right: 4px;
    bottom: 4px;
    width: 72rpx;
    height: 72rpx;
    opacity: 0.25;
  }

  &__dot {
    width: 12rpx;
    height: 12rpx;
    background: var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 10rpx var(--accent-glow);
  }

  &__num {
    position: relative;
    font-size: 48rpx;
    font-weight: 700;
    line-height: 1;
    color: var(--accent);
    letter-spacing: -1rpx;
  }
}
</style>
