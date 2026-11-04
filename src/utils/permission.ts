import { useUserStore } from "@/store";
import { ROLE_ROOT, PERM_ALL } from "@/constants";

/**
 * 检查当前用户是否具备任一指定权限，根角色与通配权限直接通过
 */
export function hasPermission(perm: string | string[]): boolean {
  if (!perm) return false;

  const keys = Array.isArray(perm) ? perm : [perm];
  if (keys.length === 0) return false;

  const userInfo = useUserStore().userInfo;
  if (!userInfo) return false;

  const { roles = [], perms = [] } = userInfo;
  if (roles.includes(ROLE_ROOT) || perms.includes(PERM_ALL)) return true;
  if (perms.length === 0) return false;

  return keys.some((key) => perms.includes(key));
}

/**
 * 判断菜单权限，未配置权限码时允许显示
 */
export function isMenuAllowed(perm: string): boolean {
  return !perm || hasPermission(perm);
}
