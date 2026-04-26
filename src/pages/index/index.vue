<template>
  <view class="page page--tabbar">
    <!-- 轮播图 -->
    <view class="relative">
      <wd-swiper v-model:current="current" custom-class="swiper-box" :list="swiperList" autoplay />
      <view class="hero-fade"></view>
    </view>

    <!-- 快捷导航 -->
    <view class="section--overlay">
      <wd-grid clickable :column="4">
        <wd-grid-item
          v-for="(item, index) in quickNavList"
          :key="index"
          use-slot
          @itemclick="handleNavClickWithGuard(item)"
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
        <view class="stat-card stat-card--uv">
          <image class="stat-card__icon" src="/static/icons/uv.svg" mode="aspectFit" />
          <view class="stat-card__header">
            <text class="stat-card__label">访客数</text>
            <view class="stat-card__dot stat-card__dot--uv"></view>
          </view>
          <text class="stat-card__num stat-card__num--uv">
            {{ visitOverviewData.todayUvCount }}
          </text>
        </view>
        <view class="stat-card stat-card--pv">
          <image class="stat-card__icon" src="/static/icons/pv.svg" mode="aspectFit" />
          <view class="stat-card__header">
            <text class="stat-card__label">浏览量</text>
            <view class="stat-card__dot stat-card__dot--pv"></view>
          </view>
          <text class="stat-card__num stat-card__num--pv">
            {{ visitOverviewData.todayPvCount }}
          </text>
        </view>
      </view>
    </view>

    <!-- 访问趋势图表 -->
    <view class="mt-24rpx">
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
import { useNavigation } from "@/composables/useNavigation";
import { menuConfig } from "@/config/menu";
import { isLoggedIn } from "@/utils/auth";
import { hasPermission } from "@/utils/permission";
import LogAPI, { type VisitOverview as ApiVisitOverview, type VisitTrend } from "@/api/log";
import NoticeAPI, { type NoticeItem } from "@/api/notice";

type VisitOverviewVO = ApiVisitOverview;

interface NavItem {
  icon: string;
  title: string;
  url: string;
  perm: string;
}

const router = useRouter();
const userStore = useUserStore();
const { handleNavClick } = useNavigation();
// custom-navbar 组件内部已处理导航栏高度与胶囊避让

const current = ref(0);
const recentDaysRange = ref(7);

const swiperList = ref([
  "https://www.youlai.tech/storage/youlai/bg02.png",
  "https://www.youlai.tech/storage/blog/banner9.png",
]);

const visitOverviewData = ref<VisitOverviewVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const noticeList = ref<NoticeItem[]>([]);
const noticeText = computed(() => {
  const titles = noticeList.value
    .map((n: NoticeItem) => n.title)
    .filter(Boolean)
    .slice(0, 2);
  return titles.length ? titles.join("    ") : "暂无通知";
});

// 用户权限列表
const userPerms = computed(() => userStore.userInfo?.perms || []);

// 是否已登录
const isLogged = computed(() => isLoggedIn());

const hasAnyPerm = computed(() => userPerms.value.length > 0);

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

function handleNavClickWithGuard(item: NavItem) {
  if (!isLogged.value || !hasAnyPerm.value) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  handleNavClick(item);
}

function handleNoticeClick() {
  router.push({ path: "/pages/work/notice/index" });
}

function handleDataRangeChange({ value }: { value: number }) {
  recentDaysRange.value = value;
  loadVisitTrendData();
}

onReady(() => {
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
    border-radius: 50%;

    &--uv,
    &--green {
      background: var(--color-success);
      box-shadow: 0 0 10rpx rgba(52, 209, 157, 0.35);
    }

    &--pv,
    &--blue {
      background: var(--color-primary);
      box-shadow: 0 0 10rpx rgba(77, 128, 240, 0.3);
    }
  }

  &__num {
    position: relative;
    font-size: 48rpx;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1rpx;

    &--uv,
    &--green {
      color: var(--color-success);
    }

    &--pv,
    &--blue {
      color: var(--color-primary);
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
