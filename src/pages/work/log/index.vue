<template>
  <view class="page page--padding">
    <view>
      <wd-search
        v-model="queryParams.keywords"
        placeholder="搜索日志内容"
        hide-cancel
        @search="handleSearch"
      />
    </view>

    <!-- 日志列表 -->
    <view class="mt-16rpx">
      <wd-card
        v-for="item in pageData"
        :key="item.id"
        custom-class="item-card"
        @click="openLogDetail(item)"
      >
        <!-- 主信息行 -->
        <view class="flex-start">
          <view class="flex-1">
            <view class="flex-start mt-12rpx">
              <text class="font-bold text-32rpx">{{ item.operator }}</text>
              <wd-tag plain size="small" class="ml-16rpx">{{ item.module }}</wd-tag>
            </view>
            <text class="text-24rpx color-text-secondary truncate">{{ item.content }}</text>
          </view>
        </view>

        <!-- 辅助信息行 -->
        <view class="flex gap-24rpx mt-12rpx">
          <view class="flex-start min-w-0 flex-1">
            <wd-icon name="location" size="16" class="color-text-secondary" />
            <text class="ml-8rpx text-24rpx color-text-secondary">
              {{ item.ip }} {{ item.region }}
            </text>
          </view>
        </view>

        <!-- 元信息行 -->
        <view class="flex-between mt-16rpx">
          <text class="text-24rpx color-text-placeholder">{{ item.createTime }}</text>
          <view
            class="w-64rpx h-64rpx flex-center rounded-full"
            hover-class="bg-[var(--color-text-placeholder)]/16"
            @click.stop="openLogDetail(item)"
          >
            <wd-icon name="view" size="16" class="color-text-secondary" />
          </view>
        </view>
      </wd-card>

      <wd-loadmore v-if="total > 0" :state="loadMoreState" @reload="fetchLogList" />
      <wd-status-tip v-else-if="total === 0" image="search" tip="暂无数据" />
    </view>

    <!-- 详情弹窗 -->
    <wd-popup
      v-model="detailDialog.visible"
      position="bottom"
      custom-style="border-radius: 24rpx 24rpx 0 0"
      @close="closeLogDetail"
    >
      <view class="p-4">
        <view class="text-center font-bold text-32rpx mb-4">日志详情</view>
        <wd-cell-group border>
          <wd-cell title="操作人" :value="logDetail.operator" />
          <wd-cell title="操作时间" :value="logDetail.createTime" />
          <wd-cell title="模块" :value="logDetail.module" />
          <wd-cell title="内容" :value="logDetail.content" />
          <wd-cell title="IP" :value="logDetail.ip" />
          <wd-cell title="地区" :value="logDetail.region" />
          <wd-cell title="浏览器" :value="logDetail.browser" />
          <wd-cell title="终端系统" :value="logDetail.os" />
          <wd-cell title="耗时(毫秒)" :value="String(logDetail.executionTime || 0)" />
        </wd-cell-group>
        <view class="popup-actions">
          <wd-button type="info" plain block @click="closeLogDetail">关闭</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import LogAPI, { type LogPageQuery, LogVO } from "@/api/log";

const loadMoreState = ref<LoadMoreState>("loading");

const queryParams = reactive<LogPageQuery>({ pageNum: 1, pageSize: 10 });
const total = ref(0);
const pageData = ref<LogVO[]>([]);

const logDetail = ref<LogVO>({});
const detailDialog = reactive({ visible: false });

// 搜索触发
const handleSearch = () => loadLogList();

// 加载列表
function loadLogList() {
  queryParams.pageNum = 1;
  fetchLogList();
}

// 分页加载列表
function fetchLogList() {
  loadMoreState.value = "loading";
  LogAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
      queryParams.pageNum++;
    })
    .catch(() => {
      pageData.value = [];
    })
    .finally(() => {
      loadMoreState.value = "finished";
    });
}

// 打开详情弹窗
function openLogDetail(item: LogVO) {
  logDetail.value = item;
  detailDialog.visible = true;
}

// 关闭详情弹窗
function closeLogDetail() {
  detailDialog.visible = false;
}

onReachBottom(() => {
  if (queryParams.pageNum * queryParams.pageSize < total.value) {
    fetchLogList();
  } else {
    loadMoreState.value = "finished";
  }
});

onLoad(() => {
  loadLogList();
});
</script>

<script lang="ts">
export default { options: { styleIsolation: "shared" } };
</script>

<route lang="json">
{
  "name": "log",
  "style": {
    "navigationBarTitleText": "系统日志"
  }
}
</route>
