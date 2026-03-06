<template>
  <view class="dept-page">
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
    <scroll-view class="dept-list" scroll-y>
      <view v-if="filteredDeptList.length > 0" class="dept-tree">
        <template v-for="dept in filteredDeptList" :key="dept.id">
          <dept-item
            :dept="dept"
            :level="0"
            @click="handleDeptClick"
          />
        </template>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <wd-icon name="folder-open" size="48" color="#d1d5db" />
        <text class="empty-state__text">暂无部门数据</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <wd-button type="primary" block @click="handleAddDept">
        <wd-icon name="add" size="16" color="#fff" />
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
 * - 展示部门树形结构
 * - 支持搜索部门
 * - 新增/编辑/删除部门
 *
 * 技术要点：
 * - 使用 BEM 命名规范
 * - 支持暗黑模式
 * - 使用 CSS 变量
 * - 递归组件实现树形结构
 */

// ============================================================================
// 类型定义
// ============================================================================

interface DeptNode {
  id: string
  label: string
  userCount?: number
  children?: DeptNode[]
}

// ============================================================================
// 子组件 - 部门项（支持递归）
// ============================================================================

const DeptItem = defineComponent({
  name: "DeptItem",
  props: {
    dept: { type: Object as PropType<DeptNode>, required: true },
    level: { type: Number, default: 0 },
  },
  emits: ["click"],
  setup(props, { emit }) {
    const isExpanded = ref(false)
    const hasChildren = computed(() => props.dept.children && props.dept.children.length > 0)

    function toggleExpand() {
      if (hasChildren.value) {
        isExpanded.value = !isExpanded.value
      }
    }

    function handleClick() {
      emit("click", props.dept)
    }

    return {
      isExpanded,
      hasChildren,
      toggleExpand,
      handleClick,
    }
  },
  template: `
    <view class="dept-node">
      <view
        class="dept-node__item"
        :class="{ 'dept-node__item--has-children': hasChildren }"
        :style="{ paddingLeft: level * 32 + 16 + 'rpx' }"
      >
        <view class="dept-node__expand" @click="toggleExpand">
          <wd-icon
            v-if="hasChildren"
            name="arrow-right"
            size="14"
            class="dept-node__arrow"
            :class="{ 'dept-node__arrow--expanded': isExpanded }"
          />
        </view>
        <view class="dept-node__content" @click="handleClick">
          <wd-icon
            name="folder"
            size="18"
            :color="hasChildren ? 'var(--color-primary)' : 'var(--color-text-secondary)'"
          />
          <text class="dept-node__name">{{ dept.label }}</text>
        </view>
        <view class="dept-node__meta" @click="handleClick">
          <text class="dept-node__count">{{ dept.userCount || 0 }} 人</text>
          <wd-icon name="arrow-right" size="14" color="var(--color-text-secondary)" />
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
        />
      </view>
    </view>
  `,
})

// ============================================================================
// 响应式数据
// ============================================================================

const searchText = ref("")

// 部门树形数据（示例数据）
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
])

// 过滤后的部门列表
const filteredDeptList = computed(() => {
  if (!searchText.value) return deptList.value

  function filterDepts(depts: DeptNode[]): DeptNode[] {
    return depts.reduce<DeptNode[]>((acc, dept) => {
      const matched = dept.label.toLowerCase().includes(searchText.value.toLowerCase())
      const filteredChildren = dept.children ? filterDepts(dept.children) : []

      if (matched || filteredChildren.length > 0) {
        acc.push({
          ...dept,
          children: filteredChildren.length > 0 ? filteredChildren : dept.children,
        })
      }
      return acc
    }, [])
  }

  return filterDepts(deptList.value)
})

// ============================================================================
// 事件处理
// ============================================================================

/** 搜索 */
function handleSearch() {
  uni.showToast({ title: `搜索: ${searchText.value}`, icon: "none" })
}

/** 部门点击 */
function handleDeptClick(dept: DeptNode) {
  uni.showToast({ title: `点击: ${dept.label}`, icon: "none" })
}

/** 新增部门 */
function handleAddDept() {
  uni.showToast({ title: "新增部门", icon: "none" })
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

.dept-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
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
// 部门节点（递归组件样式）
// ============================================================================

.dept-node {
  &__item {
    display: flex;
    align-items: center;
    height: 96rpx;
    border-bottom: 2rpx solid var(--color-border-light);

    &:active {
      background-color: var(--color-bg-secondary);
    }
  }

  &__expand {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
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
    align-items: center;
    gap: 16rpx;
  }

  &__name {
    font-size: 28rpx;
    color: var(--color-text);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding-right: 24rpx;
  }

  &__count {
    font-size: 24rpx;
    color: var(--color-text-secondary);
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
  padding: 100rpx 0;

  &__text {
    margin-top: 24rpx;
    font-size: 28rpx;
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
