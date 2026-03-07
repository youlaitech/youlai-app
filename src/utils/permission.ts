import { useUserStore } from "@/store";
import { ROLE_ROOT, PERM_ALL } from "@/constants";

/**
 * 检查是否拥有指定权限
 *
 * @param permission 权限标识，支持字符串或字符串数组（满足其一即可）
 * @returns 是否拥有权限
 *
 * @example
 * hasPermission('sys:user:create') // 检查单个权限
 * hasPermission(['sys:user:create', 'sys:user:update']) // 满足其一即可
 */
export function hasPermission(permission: string | string[]): boolean {
  // 参数校验
  if (!permission) {
    console.warn("[Permission] 需要提供权限标识");
    return false;
  }

  // 标准化为数组
  const permissions = Array.isArray(permission) ? permission : [permission];

  // 空数组校验
  if (permissions.length === 0) {
    console.warn("[Permission] 权限标识数组不能为空");
    return false;
  }

  const userStore = useUserStore();
  const userInfo = userStore.userInfo;

  // 未登录或无用户信息
  if (!userInfo) {
    return false;
  }

  const { roles = [], perms = [] } = userInfo;

  // 超级管理员拥有所有权限
  if (roles.includes(ROLE_ROOT)) {
    return true;
  }

  // 检查是否包含全部权限标识
  if (permissions.includes(PERM_ALL)) {
    return true;
  }

  // 检查权限：满足其一即可
  return permissions.some((perm) => perms.includes(perm));
}

/**
 * 检查是否拥有指定角色
 *
 * @param role 角色标识，支持字符串或字符串数组（满足其一即可）
 * @returns 是否拥有角色
 *
 * @example
 * hasRole('ADMIN') // 检查单个角色
 * hasRole(['ADMIN', 'TEST']) // 满足其一即可
 */
export function hasRole(role: string | string[]): boolean {
  // 参数校验
  if (!role) {
    console.warn("[Permission] 需要提供角色标识");
    return false;
  }

  // 标准化为数组
  const roles = Array.isArray(role) ? role : [role];

  // 空数组校验
  if (roles.length === 0) {
    console.warn("[Permission] 角色标识数组不能为空");
    return false;
  }

  const userStore = useUserStore();
  const userInfo = userStore.userInfo;

  // 未登录或无用户信息
  if (!userInfo) {
    return false;
  }

  const userRoles = userInfo.roles || [];

  // 超级管理员拥有所有角色
  if (userRoles.includes(ROLE_ROOT)) {
    return true;
  }

  // 检查角色：满足其一即可
  return roles.some((r) => userRoles.includes(r));
}

/**
 * 检查是否拥有所有指定权限（且关系）
 *
 * @param permissions 权限标识数组
 * @returns 是否拥有所有权限
 */
export function hasAllPermissions(permissions: string[]): boolean {
  if (!permissions || permissions.length === 0) {
    return false;
  }

  const userStore = useUserStore();
  const userInfo = userStore.userInfo;

  if (!userInfo) {
    return false;
  }

  const { roles = [], perms = [] } = userInfo;

  // 超级管理员拥有所有权限
  if (roles.includes(ROLE_ROOT)) {
    return true;
  }

  // 检查权限：必须全部满足
  return permissions.every((perm) => perms.includes(perm));
}

/**
 * 检查是否拥有所有指定角色（且关系）
 *
 * @param roles 角色标识数组
 * @returns 是否拥有所有角色
 */
export function hasAllRoles(roles: string[]): boolean {
  if (!roles || roles.length === 0) {
    return false;
  }

  const userStore = useUserStore();
  const userInfo = userStore.userInfo;

  if (!userInfo) {
    return false;
  }

  const userRoles = userInfo.roles || [];

  // 超级管理员拥有所有角色
  if (userRoles.includes(ROLE_ROOT)) {
    return true;
  }

  // 检查角色：必须全部满足
  return roles.every((role) => userRoles.includes(role));
}
