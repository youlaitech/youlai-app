<template>
  <slot v-if="authorized" />
  <slot v-else name="fallback" />
</template>

<script lang="ts" setup>
/**
 * 权限控制组件
 *
 * @description 跨平台权限控制组件，支持权限和角色检查
 * @usage 适用于所有平台（H5、小程序、App）
 *
 * @example
 * // 权限检查
 * <Auth permission="sys:user:create">
 *   <button>新增用户</button>
 * </Auth>
 *
 * // 多个权限（满足其一即可）
 * <Auth :permission="['sys:user:create', 'sys:user:update']">
 *   <button>操作</button>
 * </Auth>
 *
 * // 角色检查
 * <Auth role="ADMIN">
 *   <button>管理员操作</button>
 * </Auth>
 *
 * // 同时检查权限和角色
 * <Auth permission="sys:user:delete" role="ADMIN">
 *   <button>删除用户</button>
 * </Auth>
 *
 * // 无权限时显示备用内容
 * <Auth permission="sys:user:create">
 *   <template #default>
 *     <button>新增用户</button>
 *   </template>
 *   <template #fallback>
 *     <text>无权限</text>
 *   </template>
 * </Auth>
 */
import { computed } from "vue";
import { hasPermission, hasRole } from "@/utils/permission";

interface Props {
  /** 权限标识，支持字符串或字符串数组 */
  permission?: string | string[];
  /** 角色标识，支持字符串或字符串数组 */
  role?: string | string[];
  /** 是否需要同时满足权限和角色（默认：false，满足其一即可） */
  requireAll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  permission: undefined,
  role: undefined,
  requireAll: false,
});

/**
 * 计算是否有权限
 */
const authorized = computed(() => {
  const { permission, role, requireAll } = props;

  // 无任何限制条件，默认显示
  if (!permission && !role) {
    return true;
  }

  // 检查权限
  const hasPerm = permission ? hasPermission(permission) : true;

  // 检查角色
  const hasRoleFlag = role ? hasRole(role) : true;

  // 根据条件返回结果
  if (requireAll) {
    // 需要同时满足
    return hasPerm && hasRoleFlag;
  } else {
    // 满足其一即可
    if (permission && role) {
      return hasPerm || hasRoleFlag;
    }
    return hasPerm && hasRoleFlag;
  }
});
</script>
