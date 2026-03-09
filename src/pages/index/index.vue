<template>
  <view class="home-page">
    <!-- 轮播图 -->
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
    <view class="section">
      <wd-notice-bar
        :text="noticeText"
        color="#34D19D"
        type="info"
        @click="handleNoticeClick"
      >
        <template #prefix>
          <wd-tag color="#FAA21E" bg-color="#FAA21E" plain custom-style="margin-right: 10rpx">
            通知公告
          </wd-tag>
        </template>
      </wd-notice-bar>
    </view>

    <!-- 数据统计 -->
    <view class="section">
      <wd-card>
        <template #title>
          <view class="overview-header">
            <text class="overview-header__title">今日数据概览</text>
            <view class="overview-header__more" @click="handleOverviewMore">查看更多</view>
          </view>
        </template>

        <view class="overview-grid">
          <view class="overview-item">
            <image class="overview-item__icon" src="/static/icons/visitor.png" />
            <view class="overview-item__info">
              <text class="overview-item__label">访客数</text>
              <text class="overview-item__value">{{ visitStatsData.todayUvCount }}</text>
            </view>
          </view>
          <view class="overview-item">
            <image class="overview-item__icon" src="/static/icons/browser.png" />
            <view class="overview-item__info">
              <text class="overview-item__label">浏览量</text>
              <text class="overview-item__value">{{ visitStatsData.todayPvCount }}</text>
            </view>
          </view>
          <view class="overview-item" v-if="appVersion">
            <image class="overview-item__icon" src="/static/icons/setting.png" />
            <view class="overview-item__info">
              <text class="overview-item__label">版本</text>
              <text class="overview-item__value">{{ appVersion }}</text>
            </view>
          </view>
        </view>
      </wd-card>
    </view>

    <!-- 访问趋势图表 -->
    <view class="section">
      <wd-card>
        <template #title>
          <view class="chart-header">
            <text class="chart-header__title">访问趋势</text>
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
 * 功能说明：
 * - 自定义导航栏（搜索框）
 * - 轮播图展示
 * - 快捷导航入口
 * - 通知公告
 * - 数据统计
 * - 访问趋势图表
 *
 * 技术要点：
 * - 使用 useNavbar 处理自定义导航栏高度和胶囊避让;
 * - 使用 BEM 命名规范组织 CSS
 * - 支持暗黑模式（通过 CSS 变量）
 */

import { computed, ref } from "vue";
import { onReady } from "@dcloudio/uni-app";
import { dayjs } from "wot-design-uni";
import { useRouter } from "uni-mini-router";
import { useUserStore } from "@/store";
import { workMenuConfig } from "@/constants/work-menu";
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
// custom-navbar 组件内部已处理导航栏高度与胶囊避让

// ============================================================================
// 响应式数据
// ============================================================================

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
  if (!noticeList.value.length) {
    return "暂无通知";
  }
  const titles = noticeList.value
    .map((n: NoticePageVO) => n.title)
    .filter(Boolean)
    .slice(0, 2) as string[];
  return titles.length ? titles.join("    ") : "暂无通知";
});

// 用户权限列表
const userPerms = computed(() => userStore.userInfo?.perms || []);

// 检查是否有权限
const hasPermission = (perm: string) => {
  if (!perm) return true;
  return userPerms.value.includes(perm) || userPerms.value.includes("*:*:*");
};

// 快捷入口：按权限过滤后取前 4 个
const quickNavList = computed(() => {
  const result: { icon: string; title: string; url: string; perm: string }[] = [];
  for (const group of workMenuConfig) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p: any = (globalThis as any).plus;
    if (p?.runtime?.version) {
      appVersion.value = `v${p.runtime.version}`;
    }
  } catch {
    appVersion.value = "";
  }
}

async function loadNoticeData() {
  try {
    const { list } = await NoticeAPI.getMyNoticePage({ pageNum: 1, pageSize: 2 });
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
  const startDate = dayjs().subtract(recentDaysRange.value - 1, "day").format("YYYY-MM-DD");

  try {
    const data: VisitTrendVO = await LogAPI.getVisitTrend({ startDate, endDate });
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
  router.push({ path: item.url });
}

function handleNoticeClick() {
  router.push({ path: "/pages/work/notice/index" });
}

function handleOverviewMore() {
  router.push({ path: "/pages/work/log/index" });
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
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: linear-gradient(
    to bottom,
    rgba(245, 247, 250, 0) 0%,
    rgba(245, 247, 250, 0.85) 60%,
    rgba(245, 247, 250, 1) 100%
  );
  pointer-events: none;
  z-index: 1;
}

:deep(.swiper-box) {
  height: 420rpx;
  overflow: hidden;
  border-bottom-left-radius: 32rpx;
  border-bottom-right-radius: 32rpx;
}

:deep(.swiper-box .wd-swiper__item),
:deep(.swiper-box image) {
  height: 420rpx;
}

// ============================================================================
// 导航栏
// ============================================================================

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
  margin-top: -72rpx;
  padding: 16rpx 8rpx;
  background: var(--color-bg);
  border-radius: 24rpx;
  box-shadow: 0 16rpx 36rpx rgba(0, 0, 0, 0.08);
}

// ============================================================================
// 快捷导航项
// ============================================================================

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
// 数据统计网格
// ============================================================================

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.stats-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background-color: var(--color-bg);
  border-radius: 24rpx;

  &__icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
  }

  &__info {
    margin-left: 32rpx;
  }

  &__label {
    display: block;
    font-size: 26rpx;
    font-weight: 500;
    color: var(--color-text);
  }

  &__value {
    display: block;
    margin-top: 8rpx;
    font-size: 36rpx;
    font-weight: 600;
    color: var(--color-text);
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
</style>
