import { ref, type Ref } from "vue";
import { onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";

/**
 * 分页列表统一逻辑：触底加载 + 下拉刷新
 *
 * fetcher 返回一页数据；pageNum 的推进与回退全部由这里维护，页面只消费
 * pageData / total / loadMoreState 三个状态。
 *
 * const { pageData, total, loadMoreState, reload } = usePagedList(UserAPI.getPage, queryParams);
 */
export function usePagedList<T, Q extends { pageNum: number; pageSize: number }>(
  fetcher: (query: Q) => Promise<{ list: T[]; total: number }>,
  queryParams: Q
) {
  const total = ref(0);
  const pageData = ref<T[]>([]) as Ref<T[]>;
  const loadMoreState = ref<"loading" | "finished" | "error">("loading");

  /** 拉取当前 pageNum 指向的一页（成功后 pageNum 前进）；append 为触底追加，否则整体替换 */
  function fetchPage(append: boolean) {
    loadMoreState.value = "loading";
    fetcher(queryParams)
      .then((data) => {
        pageData.value = append ? [...pageData.value, ...data.list] : data.list;
        total.value = data.total;
        queryParams.pageNum++;
        loadMoreState.value = "finished";
      })
      .catch(() => {
        if (!append) pageData.value = [];
        loadMoreState.value = "error";
      });
  }

  /** 回到第一页重新拉取（搜索/筛选/增删改后调用） */
  function reload() {
    queryParams.pageNum = 1;
    fetchPage(false);
  }

  // 触底加载下一页
  onReachBottom(() => {
    if (loadMoreState.value === "loading") return;
    if (queryParams.pageNum * queryParams.pageSize < total.value) {
      fetchPage(true);
    } else {
      loadMoreState.value = "finished";
    }
  });

  // 下拉刷新：回到第一页（失败时保留现有数据，展示重试态）
  onPullDownRefresh(async () => {
    try {
      const data = await fetcher({ ...queryParams, pageNum: 1 });
      pageData.value = data.list;
      total.value = data.total;
      queryParams.pageNum = 2;
      loadMoreState.value = "finished";
    } catch {
      loadMoreState.value = "error";
    } finally {
      uni.stopPullDownRefresh();
    }
  });

  return { pageData, total, loadMoreState, reload };
}
