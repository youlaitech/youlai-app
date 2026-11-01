import { computed, getCurrentInstance, inject, onScopeDispose, watch } from "vue";
import type { InjectionKey, Ref } from "vue";
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import RealtimeAPI from "@/api/realtime";
import { useUserStore } from "@/store";
import { createRealtimeClient, RealtimeConnectionStatus } from "@/utils/realtime/client";
import { parseRealtimeTicket } from "@/utils/realtime/protocol";

/**
 * 页面可用的连接状态与公告订阅入口。
 */
interface RealtimeContext {
  readonly status: Readonly<Ref<RealtimeConnectionStatus>>;
  readonly isConnected: Readonly<Ref<boolean>>;
  readonly onNoticeChange: (handler: () => void) => () => void;
}

const REALTIME_CONTEXT: InjectionKey<RealtimeContext> = Symbol("realtime-context");

/**
 * 在 App.vue 初始化连接，绑定会话与应用生命周期。
 */
export function provideRealtime(): RealtimeContext {
  const userStore = useUserStore();
  const noticeHandlers = new Set<() => void>();
  let launched = false;
  let foreground = true;
  let disposed = false;
  let calibrationTimer: ReturnType<typeof setTimeout> | null = null;

  const client = createRealtimeClient({
    /**
     * 领取并校验票据；服务未启用或无权限时停止连接。
     */
    async requestTicket(request) {
      const ticket = await RealtimeAPI.createTicket(request);
      if (ticket === null) return null;
      const result = parseRealtimeTicket(ticket);
      if (result.kind === "rejected") throw new Error("领票响应格式不正确");
      return result.value;
    },
  });

  /**
   * 通知页面刷新公告，隔离处理器异常。
   */
  function notifyNotices(): void {
    for (const handler of noticeHandlers) {
      try {
        handler();
      } catch {
        console.error("[Realtime] 通知刷新失败");
      }
    }
  }

  /**
   * 清除待执行的 HTTP 校准任务。
   */
  function stopCalibration(): void {
    if (calibrationTimer !== null) clearTimeout(calibrationTimer);
    calibrationTimer = null;
  }

  /**
   * 定期用 HTTP 刷新通知，补偿实时提示丢失；随机间隔分散请求。
   */
  function calibrate(): void {
    stopCalibration();
    if (disposed || !launched || !foreground || !userStore.isAuthenticated) return;
    notifyNotices();
    calibrationTimer = setTimeout(calibrate, 120_000 + Math.random() * 180_000);
  }

  /**
   * 前台恢复时检查连接并校准业务数据。
   */
  function resume(): void {
    if (!launched || !foreground || !userStore.isAuthenticated || disposed) return;
    client.connect();
    calibrate();
  }

  const stopMessages = client.onMessage((message) => {
    if (message.type === "notice.changed" || message.type === "connection.ready") {
      notifyNotices();
    }
  });

  const stopSessionWatcher = watch(
    () => userStore.accessToken,
    () => {
      client.disconnect();
      stopCalibration();
      if (userStore.isAuthenticated) resume();
      else notifyNotices();
    },
    { flush: "sync" }
  );

  onLaunch(() => {
    launched = true;
    // #ifndef H5
    uni.onNetworkStatusChange(handleNetworkChange);
    // #endif
    resume();
  });

  /**
   * 网络恢复时重连，断网时释放连接。
   */
  function handleNetworkChange(event: { isConnected: boolean }): void {
    if (event.isConnected) resume();
    else {
      stopCalibration();
      client.disconnect();
    }
  }
  onShow(() => {
    // #ifndef H5
    foreground = true;
    // #endif
    resume();
  });
  onHide(() => {
    // #ifndef H5
    // 小程序进后台释放连接，回到前台后重新领票与校准。
    foreground = false;
    stopCalibration();
    client.disconnect();
    // #endif
  });

  // #ifdef H5
  /**
   * 随页面可见状态恢复或暂停 HTTP 校准。
   */
  function handleVisibility(): void {
    foreground = document.visibilityState === "visible";
    if (foreground) resume();
    // H5 隐藏时保留 SocketTask，只暂停 HTTP 校准。
    else stopCalibration();
  }
  if (typeof document !== "undefined") {
    foreground = document.visibilityState === "visible";
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", resume);
  }
  // #endif

  const context: RealtimeContext = {
    status: client.status,
    isConnected: computed(() => client.status.value === RealtimeConnectionStatus.CONNECTED),
    /**
     * 在 setup 中订阅公告，随当前作用域释放，也可手动取消。
     */
    onNoticeChange(handler) {
      noticeHandlers.add(handler);
      /**
       * 取消当前公告订阅。
       */
      function unsubscribe(): void {
        noticeHandlers.delete(handler);
      }
      onScopeDispose(unsubscribe);
      return unsubscribe;
    },
  };
  // 小程序页面拥有独立组件树，使用当前应用的 provide。
  getCurrentInstance()?.appContext.app.provide(REALTIME_CONTEXT, context);

  /**
   * 释放连接、监听器和定时器。
   */
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    stopCalibration();
    stopSessionWatcher();
    stopMessages();
    noticeHandlers.clear();
    client.disconnect();
    // #ifndef H5
    if (launched) uni.offNetworkStatusChange(handleNetworkChange);
    // #endif
    // #ifdef H5
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", resume);
    }
    // #endif
  }
  onScopeDispose(dispose);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  return context;
}

/**
 * 获取应用提供的实时状态与公告订阅入口。
 */
export function useRealtime(): RealtimeContext {
  const context = inject(REALTIME_CONTEXT);
  if (!context) throw new Error("实时通信尚未初始化");
  return context;
}
