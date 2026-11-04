import { ref, computed, onUnmounted, type Ref, type ComputedRef } from "vue";

/**
 * 微信胶囊按钮的屏幕坐标与尺寸，单位为 px
 */
interface CapsuleRect {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * 导航栏测量配置
 */
export interface NavbarMetricsOptions {
  /** H5 / App 无胶囊时的内容区高度（px），默认 44 */
  contentHeightPx?: number;
}

/**
 * 导航栏测量结果
 *
 * 长度单位统一为 px，与系统几何 API 保持一致
 */
export interface NavbarMetrics {
  /** 状态栏高度（px） */
  statusBarHeight: Ref<number>;
  /** 导航栏内容区高度（px），不含状态栏 */
  contentHeightPx: ComputedRef<number>;
  /** 导航栏总高度（px），含状态栏 */
  totalHeightPx: ComputedRef<number>;
  /** 胶囊左侧坐标（px），微信端即左侧可用宽度 */
  capsuleLeftPx: ComputedRef<number>;
  /** 胶囊右侧到屏幕右边缘的距离（px） */
  capsuleRightGapPx: ComputedRef<number>;
  /** 胶囊宽度（px） */
  capsuleWidthPx: ComputedRef<number>;
}

// 微信胶囊读取失败时的兜底尺寸（px）：87×32 为默认胶囊，上下与右侧留 10，顶部偏移 6
const FALLBACK_CAPSULE = { width: 87, height: 32, margin: 10, topOffset: 6 };

/**
 * 测量状态栏与导航栏尺寸，微信端按胶囊位置计算
 * setup 阶段同步读取，卸载时清理重试任务
 *
 * @see https://github.com/dcloudio/uni-ui
 */
export function useNavbarMetrics(options: NavbarMetricsOptions = {}): NavbarMetrics {
  const { contentHeightPx: fallbackContentHeightPx = 44 } = options;

  const statusBarHeight = ref(0);
  const capsuleRect = ref<CapsuleRect | null>(null);
  const windowWidth = ref(375);

  // 胶囊矩形可能晚于首次渲染就绪，重试定时器在卸载与重新测量时清理
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 清除胶囊尺寸读取的重试任务
   */
  const clearRetryTimer = () => {
    if (retryTimer !== null) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  };

  // 导航栏内容区高度：微信端按胶囊推算，其余端用固定值
  const contentHeightPx = computed(() => {
    // #ifdef MP-WEIXIN
    const capsule = capsuleRect.value;
    if (capsule && capsule.height > 0 && capsule.top > 0) {
      // 胶囊上下留白相等，内容区包含胶囊与两侧留白
      const spaceHeight = capsule.top - statusBarHeight.value;
      return capsule.height + spaceHeight * 2;
    }
    // #endif

    return fallbackContentHeightPx;
  });

  const totalHeightPx = computed(() => statusBarHeight.value + contentHeightPx.value);

  const capsuleLeftPx = computed(() => {
    // #ifdef MP-WEIXIN
    if (capsuleRect.value) {
      return capsuleRect.value.left;
    }
    // #endif
    return 0;
  });

  // 微信端取窗口右边缘与胶囊右边缘的差值，其余端只留固定边距
  const capsuleRightGapPx = computed(() => {
    // #ifdef MP-WEIXIN
    if (capsuleRect.value && capsuleRect.value.right > 0) {
      return windowWidth.value - capsuleRect.value.right;
    }
    // #endif
    return FALLBACK_CAPSULE.margin;
  });

  const capsuleWidthPx = computed(() => {
    // #ifdef MP-WEIXIN
    if (capsuleRect.value) {
      return capsuleRect.value.width;
    }
    // #endif
    return 0;
  });

  // #ifdef MP-WEIXIN
  /**
   * 检查胶囊尺寸与位置是否有效
   */
  const isValidCapsuleRect = (rect: ReturnType<typeof uni.getMenuButtonBoundingClientRect>) => {
    return !!rect && rect.width > 0 && rect.height > 0 && rect.top > 0 && rect.right > 0;
  };

  /**
   * 有限重试读取胶囊尺寸，失败时使用默认值
   */
  const readCapsuleRect = (maxRetry = 6, delayMs = 50) => {
    /**
     * 按状态栏与窗口尺寸设置默认胶囊位置
     */
    const applyDefaultCapsuleRect = () => {
      const { width, height, margin, topOffset } = FALLBACK_CAPSULE;
      const top = statusBarHeight.value + topOffset;
      capsuleRect.value = {
        width,
        height,
        top,
        right: windowWidth.value - margin,
        bottom: top + height,
        left: windowWidth.value - margin - width,
      };
    };

    try {
      const rect = uni.getMenuButtonBoundingClientRect();

      if (isValidCapsuleRect(rect)) {
        capsuleRect.value = {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
        };
        return;
      }

      if (maxRetry > 0) {
        retryTimer = setTimeout(() => {
          readCapsuleRect(maxRetry - 1, delayMs);
        }, delayMs);
      } else {
        applyDefaultCapsuleRect();
      }
    } catch {
      applyDefaultCapsuleRect();
    }
  };
  // #endif

  /**
   * 更新窗口与胶囊尺寸，读取失败时保留当前值
   */
  const refreshMetrics = () => {
    try {
      const windowInfo =
        typeof uni.getWindowInfo === "function" ? uni.getWindowInfo() : uni.getSystemInfoSync();

      statusBarHeight.value = windowInfo.statusBarHeight || 0;
      windowWidth.value = windowInfo.windowWidth || 375;

      // #ifdef MP-WEIXIN
      clearRetryTimer();
      readCapsuleRect();
      // #endif
    } catch {
      // 读取失败时保留当前尺寸
    }
  };

  // setup 阶段同步读取一次，避免首屏按默认尺寸渲染后再跳动
  refreshMetrics();

  onUnmounted(clearRetryTimer);

  return {
    statusBarHeight,
    contentHeightPx,
    totalHeightPx,
    capsuleLeftPx,
    capsuleRightGapPx,
    capsuleWidthPx,
  };
}
