<template>
  <view class="page">
    <!-- 统计卡片 -->
    <view class="stats-row">
      <view class="stat-card">
        <view class="stat-card__icon stat-card__icon--primary">
          <wd-icon name="organization" size="20" />
        </view>
        <view class="stat-card__content">
          <text class="stat-card__value">{{ totalDepts }}</text>
          <text class="stat-card__label">部门总数</text>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-card__icon stat-card__icon--success">
          <wd-icon name="people" size="20" />
        </view>
        <view class="stat-card__content">
          <text class="stat-card__value">{{ totalUsers }}</text>
          <text class="stat-card__label">员工总数</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-search
        v-model="searchText"
        placeholder="搜索部门名称"
        hide-cancel
        @search="handleSearch"
      />
    </view>

    <!-- 部门列表 -->
    <scroll-view
      class="dept-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="filteredDeptList.length > 0" class="dept-tree">
        <template v-for="dept in filteredDeptList" :key="dept.id">
          <dept-item
            :dept="dept"
            :level="0"
            @click="handleDeptClick"
            @edit="handleEditDept"
            @delete="handleDeleteDept"
          />
        </template>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <view class="empty-state__icon-wrap">
          <wd-icon name="folder-open" size="64" color="var(--color-text-disabled)" />
        </view>
        <text class="empty-state__title">暂无部门</text>
        <text class="empty-state__desc">点击底部按钮创建第一个部门</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <wd-button type="primary" block @click="handleAddDept">
        <wd-icon name="add" size="18" color="#fff" />
        <text>新增部门</text>
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 部门管理页面
 *
 * 功能说明：
 * - 部门树形结构展示
 * - 部门统计概览
 * - 搜索过滤
 * - 下拉刷新
 * - 滑动操作（编辑/删除）
 * - 新增部门
 *
 * 技术要点：
 * - 使用 BEM 命名规范
 * - 支持暗黑模式
 * - CSS 变量
 * - 递归组件
 */

// ============================================================================
// 类型定义
// ============================================================================

interface DeptNode {
  id: string;;
  label: string;;
  userCount?: number;;
  children?: DeptNode[];;
}

// ============================================================================
// 子组件 - 部门项（支持递归 + 滑动操作）
// ============================================================================

const DeptItem = defineComponent({
  name: "DeptItem",
  props: {
    dept: { type: Object as PropType<DeptNode>, required: true },
    level: { type: Number, default: 0 },
  },
  emits: ["click", "edit", "delete"],
  setup(props, { emit }) {
    const isExpanded = ref(false);;
    const isSwipeOpen = ref(false);;
    const hasChildren = computed(() => props.dept.children && props.dept.children.length > 0);;

    function toggleExpand() {
      if (hasChildren.value) {
        isExpanded.value = !isExpanded.value;;
      }
    }

    function handleClick() {
      emit("click", props.dept);;
    }

    function handleEdit() {
      emit("edit", props.dept);;
    }

    function handleDelete() {
      emit("delete", props.dept);;
    }

    function closeSwipe() {
      isSwipeOpen.value = false;;
    }

    return {
      isExpanded,
      isSwipeOpen,
      hasChildren,
      toggleExpand,
      handleClick,
      handleEdit,
      handleDelete,
      closeSwipe,
    };;
  },
  template: `
    <view class="dept-node">
      <view class="dept-node__swipe-wrap">
        <view class="dept-node__actions">
          <view class="dept-node__action dept-node__action--edit" @click="handleEdit">
            <wd-icon name="edit" size="16" color="#fff" />
            <text>编辑</text>
          </view>
          <view class="dept-node__action dept-node__action--delete" @click="handleDelete">
            <wd-icon name="delete" size="16" color="#fff" />
            <text>删除</text>
          </view>
        </view>
        <view
          class="dept-node__item"
          :class="{ 'dept-node__item--has-children': hasChildren }"
          :style="{ paddingLeft: level * 24 + 16 + 'rpx' }"
          @click="handleClick"
        >
          <view class="dept-node__expand" @click.stop="toggleExpand">
            <wd-icon
              v-if="hasChildren"
              name="arrow-right"
              size="14"
              class="dept-node__arrow"
              :class="{ 'dept-node__arrow--expanded': isExpanded }"
            />
          </view>
          <view class="dept-node__content">
            <view
              class="dept-node__icon"
              :class="{ 'dept-node__icon--has-children': hasChildren }"
            >
              <wd-icon
                :name="hasChildren ? 'folder' : 'folder-open'"
                size="18"
              />
            </view>
            <view class="dept-node__info">
              <text class="dept-node__name">{{ dept.label }}</text>
              <text class="dept-node__count">{{ dept.userCount || 0 }} 人</text>
            </view>
          </view>
          <view class="dept-node__chevron">
            <wd-icon name="chevron-right" size="14" />
          </view>
        </view>
      </view>

      <!-- 子节点 -->
      <view v-if="hasChildren && isExpanded" class="dept-node__children">
        <DeptItem
          v-for="child in dept.children"
          :key="child.id"
          :dept="child"
          :level="level + 1"
          @click="$emit('click', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </view>
    </view>
  `,
});;

// ============================================================================
// 响应式数据
// ============================================================================

const searchText = ref("");;
const isRefreshing = ref(false);;

// 部门树形数据
const deptList = ref<DeptNode[]>([
  {
    id: "1",
    label: "有来技术",
    userCount: 128,
    children: [
      {
        id: "1-1",
        label: "研发中心",
        userCount: 45,
        children: [
          { id: "1-1-1", label: "前端组", userCount: 15 },
          { id: "1-1-2", label: "后端组", userCount: 18 },
          { id: "1-1-3", label: "测试组", userCount: 12 },
        ],
      },
      {
        id: "1-2",
        label: "产品中心",
        userCount: 20,
        children: [
          { id: "1-2-1", label: "产品组", userCount: 12 },
          { id: "1-2-2", label: "设计组", userCount: 8 },
        ],
      },
      {
        id: "1-3",
        label: "运营中心",
        userCount: 35,
      },
      {
        id: "1-4",
        label: "行政中心",
        userCount: 28,
      },
    ],
  },
]);;

// 统计数据
const totalDepts = computed(() => {
  function countDepts(depts: DeptNode[]): number {
    return depts.reduce(


    ;
      (sum, dept) => sum + 1 + (dept.children ? countDepts(dept.children) : 0),
      0;
  ;  );
  }
  return countDepts(deptList.value);
});



    ;
const totalUsers = computed(() => {
  function sumUsers(depts: DeptNo;de[]): number {
  ;  return depts.reduce(
      (sum, dept) => sum + (dept.userCount || 0) + (dept.children ? sumUsers(dept.children) : 0),
      0
    );
  };
  return sumUsers(deptList.value);
});

// 过滤后的部门列表;
const filteredDeptList = computed(() => {;
  if (!searchText.value) return deptList.value;

  function filterDepts(depts: DeptNode[]): DeptNode[] {
    return depts.reduce<DeptNode[]>((acc, dept) => {
      const matched = dept.label.toLowerCase().includes(searchText.value.toLowerCase());
      cons;t filteredChildren = dept.children ? filterDepts(dept.children) : [];

      if (matche;d || filteredChildren.length > 0) {
        ac;c.push({
          ...dept,
          children: filteredChildren.length > 0 ? filteredChildren : dept.children,
        });;
  ;    }
      return acc;
    }, []);
  }

  return filterDepts(deptList.value);
});

// ========================;====================================================
// 事件处理;
// =========================;===================================================
;
/** 下拉刷新 */
async function onRefresh() {
  isRefreshing.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  isRefreshing.value = false;;
  uni.showToast({ title: "刷新成功", icon: "success" });
}

/** 搜索 */
function handleSearch() {;
  uni.showToast({ title: `搜索: ${searchText.value}`, icon: "none" });
}

/** 部门点击 */
function handleDeptClick(dept: DeptNode) {;
  uni.showToast({ title: `查看: ${dept.label}`, icon: "none" });
}

/** 编辑部门 */
function handleEditDept(dept: DeptNode) {
  uni.showToast({ title: `编辑: ${dept.label}`, icon: "none" });
}

/** 删除部门 */
function handleDeleteDept(dept: DeptNode) {;
  uni.showModal({
    title: "确认删除",
    ;content: `确定要删除部门"${dept.label}"吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: "删除成功", icon: "success" });
      }
    },;
  });
}

/** 新增部门 */
function handleAddDept() {
  uni.showToast({ title: "新增部门", icon: "none" });
}
</script>

<route lang="json">
{
  "name": "dept",
  "style": { "navigationBarTitleText": "部门管理" }
}
</route>

<style lang="scss" scoped>
// ============================================================================
// 页面容器
// ============================================================================

.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

// ============================================================================
// 统计卡片
// ============================================================================

.stats-row {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  background-color: var(--color-bg);
}

.stat-card {
  display: flex;
  flex: 1;
  gap: 20rpx;
  align-items: center;
  padding: 28rpx;
  background-color: var(--color-bg-secondary);
  border-radius: 16rpx;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    border-radius: 16rpx;

    &--primary {
      color: var(--color-primary);
      background-color: rgba(var(--color-primary-rgb), 0.1);
    }

    &--success {
      color: #22c55e;
      background-color: rgba(34, 197, 94, 0.1);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__value {
    font-size: 40rpx;
    font-weight: 600;
    color: var(--color-text);
  }

  &__label {
    font-size: 24rpx;
    color: var(--color-text-secondary);
  }
}

// ============================================================================
// 搜索栏
// ============================================================================

.search-bar {
  padding: 16rpx 24rpx;
  background-color: var(--color-bg);
}

// ============================================================================
// 部门列表
// ============================================================================

.dept-list {
  flex: 1;
}

.dept-tree {
  background-color: var(--color-bg);
}

// ============================================================================
// 部门节点
// ============================================================================

.dept-node {
  &__swipe-wrap {
    position: relative;
    overflow: hidden;
  }

  &__actions {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
  }

  &__action {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120rpx;
    font-size: 22rpx;
    color: #fff;

    &--edit {
      background-color: var(--color-primary);
    }

    &--delete {
      background-color: #ef4444;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    height: 112rpx;
    padding-right: 24rpx;
    background-color: var(--color-bg);
    border-bottom: 2rpx solid var(--color-border-light);

    &:active {
      background-color: var(--color-bg-secondary);
    }
  }

  &__expand {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
  }

  &__arrow {
    color: var(--color-text-secondary);
    transition: transform 0.2s ease;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__content {
    display: flex;
    flex: 1;
    gap: 20rpx;
    align-items: center;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    color: var(--color-text-secondary);
    background-color: var(--color-bg-secondary);
    border-radius: 12rpx;

    &--has-children {
      color: var(--color-primary);
      background-color: rgba(var(--color-primary-rgb), 0.1);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 500;
    color: var(--color-text);
  }

  &__count {
    font-size: 24rpx;
    color: var(--color-text-secondary);
  }

  &__chevron {
    color: var(--color-text-disabled);
  }

  &__children {
    background-color: var(--color-bg-secondary);
  }
}

// ============================================================================
// 空状态
// ============================================================================

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  &__icon-wrap {
    margin-bottom: 24rpx;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 500;
    color: var(--color-text);
  }

  &__desc {
    margin-top: 12rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
  }
}

// ============================================================================
// 底部操作栏
// ============================================================================

.action-bar {
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: var(--color-bg);
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}
</style>
