<template>
  <view class="home-page">
    <custom-navbar title="首页" fixed placeholder>
      <template #right>
        <wd-search
          v-model="searchValue"
          class="navbar__search"
          hide-cancel
          disabled
          @click="handleSearch"
        />
      </template>
    </custom-navbar>

    <!-- 轮播图 -->
    <wd-swiper
      v-model:current="current"
      custom-class="swiper-box"
      :list="swiperList"
      autoplay
      @click="handleSwiperClick"
      @change="handleSwiperChange"
    />

    <!-- 快捷导航 -->
    <view class="section">
      <wd-grid clickable :column="4">
        <wd-grid-item
          v-for="(item, index) in navList"
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
        text="vue-uniapp-template 是一个基于 Vue3 + UniApp 的前端模板项目，提供了一套完整的前端解决方案，包括登录、权限、字典、接口请求、状态管理、页面布局、组件封装等功能。"
        color="#34D19D"
        type="info"
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
      <view class="stats-grid">
        <view class="stats-card">
          <image class="stats-card__icon" src="/static/icons/visitor.png" />
          <view class="stats-card__info">
            <text class="stats-card__label">访客数</text>
            <text class="stats-card__value">{{ visitStatsData.todayUvCount }}</text>
          </view>
        </view>
        <view class="stats-card">
          <image class="stats-card__icon" src="/static/icons/browser.png" />
          <view class="stats-card__info">
            <text class="stats-card__label">浏览量</text>
            <text class="stats-card__value">{{ visitStatsData.todayPvCount }}</text>
          </view>
        </view>
      </view>
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

import { dayjs } from "wot-design-uni";
import { useRouter } from "uni-mini-router";
import CustomNavbar from "@/components/custom-navbar/index.vue";

// ============================================================================
// 类型定义
// ============================================================================

interface VisitStatsVO {
  todayUvCount: number;
  uvGrowthRate: number;
  totalUvCount: number;
  todayPvCount: number;
  pvGrowthRate: number;
  totalPvCount: number;
}

interface NavItem {
  icon: string;
  title: string;
  url: string;
  prem: string;
}

// ============================================================================
// Hooks
// ============================================================================

const router = useRouter();
// custom-navbar 组件内部已处理导航栏高度与胶囊避让

// ============================================================================
// 响应式数据
// ============================================================================

const current = ref(0);
const searchValue = ref("");
const recentDaysRange = ref(7);

const swiperList = ref(["https://www.youlai.tech/storage/blog/banner9.png"]);

const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 1234,
  uvGrowthRate: 15.6,
  totalUvCount: 45678,
  todayPvCount: 5678,
  pvGrowthRate: 23.4,
  totalPvCount: 123456,
});

const navList = reactive<NavItem[]>([
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
]);

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

function generateStaticTrendData(days: number) {
  const dates: string[] = [];
  const ipList: number[] = [];
  const pvList: number[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(dayjs(date).format("MM-DD"));
    ipList.push(Math.floor(Math.random() * 500) + 200);
    pvList.push(Math.floor(Math.random() * 1000) + 500);
  }

  return { dates, ipList, pvList };
}

function loadVisitStatsData() {
  visitStatsData.value = {
    todayUvCount: 1234,
    uvGrowthRate: 15.6,
    totalUvCount: 45678,
    todayPvCount: 5678,
    pvGrowthRate: 23.4,
    totalPvCount: 123456,
  };
}

function loadVisitTrendData() {
  const data = generateStaticTrendData(recentDaysRange.value);

  chartData.value = JSON.parse(
    JSON.stringify({
      categories: data.dates,
      series: [
        { name: "访客数(UV)", data: data.ipList },
        { name: "浏览量(PV)", data: data.pvList },
      ],
    })
  );
}

// ============================================================================
// 事件处理
// ============================================================================

function handleSearch() {
  uni.showToast({ title: "搜索功能开发中", icon: "none" });
}

function handleNavClick(item: NavItem) {
  router.push({ path: item.url });
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
