import { ref, type Ref } from "vue";
import { onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";

/**
 * 管理分页加载、下拉刷新与失败重试。
 * 过期响应不回填；下拉刷新失败时保留现有列表。
 */
export function usePagedList<T, Q extends { pageNum: number; pageSize: number }>(
  fetcher: (query: Q) => Promise<{ list: T[]; total: number }>,
  queryParams: Q
) {
  const total = ref(0);
  const items = ref<T[]>([]) as Ref<T[]>;
  const loadMoreState = ref<"loading" | "error" | "finished" | "idle">("loading");

  // 已成功加载的页数，下一页 = loadedPages + 1
  let loadedPages = 0;
  // 请求序号：序号不匹配的响应一律丢弃
  let requestSeq = 0;
  // 最近一次请求的目标页与写入方式，供失败重试
  let lastAttempt: { page: number; append: boolean } | null = null;

  /**
   * 已加载数量是否小于总数
   */
  function hasMore(): boolean {
    return items.value.length < total.value;
  }

  /**
   * 加载指定页，丢弃过期响应。
   *
   * @param append 是否追加到现有列表
   * @param keepOnFail 替换加载失败时是否保留现有列表
   */
  async function fetchPage(page: number, append: boolean, keepOnFail = false): Promise<void> {
    const seq = ++requestSeq;
    lastAttempt = { page, append };
    loadMoreState.value = "loading";
    try {
      const data = await fetcher({ ...queryParams, pageNum: page });
      if (seq !== requestSeq) return; // 过期响应：已被更新的请求接管
      items.value = append ? [...items.value, ...data.list] : data.list;
      total.value = data.total;
      loadedPages = page;
      loadMoreState.value = items.value.length === 0 || hasMore() ? "idle" : "finished";
    } catch {
      if (seq !== requestSeq) return;
      if (!append && !keepOnFail) {
        items.value = [];
        total.value = 0;
      }
      loadMoreState.value = "error";
    }
  }

  /**
   * 返回第一页并重新加载列表。
   */
  async function reload(): Promise<void> {
    loadedPages = 0;
    await fetchPage(1, false);
  }

  /**
   * 按原页码与追加方式重试最近一次请求。
   */
  function retry(): void {
    if (!lastAttempt) return;
    fetchPage(lastAttempt.page, lastAttempt.append);
  }

  // 触底加载下一页：请求进行中不重复触发，防止并发追加
  onReachBottom(() => {
    if (loadMoreState.value === "loading") return;
    if (hasMore()) {
      fetchPage(loadedPages + 1, true);
    }
  });

  // 下拉刷新：回到第一页；失败保留现有数据，请求序号防止与触底请求交叉写入
  onPullDownRefresh(async () => {
    try {
      await fetchPage(1, false, true);
    } finally {
      uni.stopPullDownRefresh();
    }
  });

  return { items, total, loadMoreState, reload, retry };
}
