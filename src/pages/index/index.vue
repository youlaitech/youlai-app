<template>
  <view
    class="app-container dark:text-[var(--wot-color-text)]"
    :style="{ paddingTop: statusBarHeight + navBarHeight + 'px' }"
  >
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 导航栏内容 -->
      <view class="navbar-content">
        <wd-search
          v-model="searchValue"
          :custom-style="`width: ${searchWidth}`"
          placeholder="搜索"
          :placeholder-left="true"
          hide-cancel
          disabled
          @click="handleSearch"
        />
      </view>
    </view>

    <!-- 轮播图 -->
    <wd-swiper
      v-model:current="current"
      custom-class="swiper-box"
      :list="swiperList"
      autoplay
      @click="handleClick"
      @change="onChange"
    />

    <!-- 快捷导航 -->
    <wd-grid clickable :column="4" class="mt-2">
      <wd-grid-item
        v-for="(item, index) in navList"
        :key="index"
        use-slot
        @click="handleNavClick(item)"
      >
        <view class="p-2">
          <image class="w-72rpx h-72rpx rounded-8rpx" :src="item.icon" />
        </view>
        <view class="text-sm text-center">{{ item.title }}</view>
      </wd-grid-item>
    </wd-grid>

    <!-- 通知公告 -->
    <wd-notice-bar
      text="vue-uniapp-template 是一个基于 Vue3 + UniApp 的前端模板项目，提供了一套完整的前端解决方案，包括登录、权限、字典、接口请求、状态管理、页面布局、组件封装等功能。"
      color="#34D19D"
      type="info"
    >
      <template #prefix>
        <wd-tag color="#FAA21E" bg-color="#FAA21E" plain custom-style="margin-right:10rpx">
          通知公告
        </wd-tag>
      </template>
    </wd-notice-bar>

    <!-- 数据统计 -->
    <wd-grid :column="2" :gutter="2">
      <wd-grid-item use-slot custom-class="h-80px">
        <view class="flex justify-start pl-5">
          <view class="flex items-center">
            <image class="w-80rpx h-80rpx rounded-8rpx" src="/static/icons/visitor.png" />
            <view class="ml-5 text-left">
              <view class="font-bold">访客数</view>
              <view class="mt-2">{{ visitStatsData.todayUvCount }}</view>
            </view>
          </view>
        </view>
      </wd-grid-item>
      <wd-grid-item use-slot custom-class="h-80px">
        <view class="flex justify-start pl-5">
          <view class="flex items-center">
            <image class="w-80rpx h-80rpx rounded-8rpx" src="/static/icons/browser.png" />
            <view class="ml-5 text-left">
              <view class="font-bold">浏览量</view>
              <view class="mt-2">{{ visitStatsData.todayPvCount }}</view>
            </view>
          </view>
        </view>
      </wd-grid-item>
    </wd-grid>

    <wd-card>
      <template #title>
        <view class="flex justify-between items-center">
          <view>访问趋势</view>
          <view>
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
        </view>
      </template>

      <view class="w-full h-300px mb-40rpx">
        <qiun-data-charts type="area" :chartData="chartData" :opts="chartOpts" />
      </view>
    </wd-card>
  </view>
</template>

<script setup lang="ts">
import { dayjs } from "wot-design-uni";
import { useRouter } from "uni-mini-router";

// 定义访问统计数据类型
interface VisitStatsVO {
  todayUvCount: number;
  uvGrowthRate: number;
  totalUvCount: number;
  todayPvCount: number;
  pvGrowthRate: number;
  totalPvCount: number;
}

const router = useRouter();
const current = ref<number>(0);

// 搜索相关
const searchValue = ref("");

// 导航栏相关数据
const statusBarHeight = ref(0); // 状态栏高度（px）
const navBarHeight = ref(44); // 导航栏高度（px，默认44px ≈ 88rpx）
const searchWidth = ref("100%"); // 搜索框宽度

// 初始化导航栏信息
onMounted(() => {
  // #ifdef MP-WEIXIN
  // 微信小程序：使用新的 API 获取窗口信息
  const windowInfo = uni.getWindowInfo();
  statusBarHeight.value = windowInfo.statusBarHeight || 0;

  // 获取胶囊按钮信息
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
  // 计算导航栏高度：(胶囊底部 - 状态栏高度) + (胶囊顶部 - 状态栏高度)
  navBarHeight.value =
    menuButtonInfo.bottom - statusBarHeight.value + (menuButtonInfo.top - statusBarHeight.value);
  // 搜索框宽度：胶囊左侧位置 - 左右边距
  searchWidth.value = `${menuButtonInfo.left - 30}px`;
  // #endif

  // #ifdef H5 || APP-PLUS
  // H5 和 App：使用 getSystemInfoSync（非小程序环境仍然可用）
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
  navBarHeight.value = 44;
  searchWidth.value = "100%";
  // #endif
});

const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 1234,
  uvGrowthRate: 15.6,
  totalUvCount: 45678,
  todayPvCount: 5678,
  pvGrowthRate: 23.4,
  totalPvCount: 123456,
});

// 图表数据
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

// 日期范围
const recentDaysRange = ref(7);

const swiperList = ref(["https://www.youlai.tech/storage/blog/banner9.png"]);

// 快捷导航列表
const navList = reactive([
  {
    icon: "/static/icons/user.png",
    title: "用户管理",
    url: "/pages/work/index",
    prem: "sys:user:query",
  },
  {
    icon: "/static/icons/role.png",
    title: "角色管理",
    url: "/pages/work/index",
    prem: "sys:role:query",
  },
  {
    icon: "/static/icons/notice.png",
    title: "通知公告",
    url: "/pages/work/index",
    prem: "sys:notice:query",
  },
  {
    icon: "/static/icons/setting.png",
    title: "系统配置",
    url: "/pages/work/index",
    prem: "sys:config:query",
  },
]);

// 处理搜索
function handleSearch() {
  uni.showToast({
    title: "搜索功能开发中",
    icon: "none",
  });
}

// 处理导航点击
function handleNavClick(item: any) {
  // 使用路由系统进行导航，这样会触发路由守卫
  router.push({ path: item.url });
}

// 生成静态的访问趋势数据
const generateStaticTrendData = (days: number) => {
  const dates = [];
  const ipList = [];
  const pvList = [];

  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(dayjs(date).format("MM-DD"));

    // 生成模拟数据
    ipList.push(Math.floor(Math.random() * 500) + 200);
    pvList.push(Math.floor(Math.random() * 1000) + 500);
  }

  return {
    dates,
    ipList,
    pvList,
  };
};

function handleClick(e: any) {
  console.log(e);
}
function onChange(e: any) {
  console.log(e);
}

// 加载访问统计数据（使用静态数据）
const loadVisitStatsData = async () => {
  // 模拟异步加载
  setTimeout(() => {
    visitStatsData.value = {
      todayUvCount: 1234,
      uvGrowthRate: 15.6,
      totalUvCount: 45678,
      todayPvCount: 5678,
      pvGrowthRate: 23.4,
      totalPvCount: 123456,
    };
  }, 100);
};

// 加载访问趋势数据（使用静态数据）
const loadVisitTrendData = () => {
  // 模拟异步加载
  setTimeout(() => {
    const data = generateStaticTrendData(recentDaysRange.value);

    const res = {
      categories: data.dates,
      series: [
        {
          name: "访客数(UV)",
          data: data.ipList,
        },
        {
          name: "浏览量(PV)",
          data: data.pvList,
        },
      ],
    };
    chartData.value = JSON.parse(JSON.stringify(res));
  }, 100);
};

//  数据范围变化
const handleDataRangeChange = ({ value }: { value: number }) => {
  console.log("handleDataRangeChange", value);
  recentDaysRange.value = value;
  loadVisitTrendData();
};

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
// 自定义导航栏
.custom-navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 999;
  background-color: var(--wot-color-bg);
}

.navbar-content {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 88rpx;
  background-color: var(--wot-color-bg);
}
</style>
