/**
 * 工作台菜单配置
 */

export interface WorkMenuItem {
  icon: string;
  title: string;
  url: string;
  perm: string;
}

export interface WorkMenuGroup {
  title: string;
  children: WorkMenuItem[];
}

export const menuConfig: WorkMenuGroup[] = [
  {
    title: "系统管理",
    children: [
      {
        icon: "/static/icons/user.png",
        title: "用户管理",
        url: "/pages/work/user/index",
        perm: "sys:user:list",
      },
      {
        icon: "/static/icons/role.png",
        title: "角色管理",
        url: "/pages/work/role/index",
        perm: "sys:role:list",
      },
      {
        icon: "/static/icons/notice.png",
        title: "通知公告",
        url: "/pages/work/notice/index",
        perm: "sys:notice:list",
      },
      {
        icon: "/static/icons/setting.png",
        title: "系统配置",
        url: "/pages/work/config/index",
        perm: "sys:config:list",
      },
    ],
  },
  {
    title: "系统监控",
    children: [
      {
        icon: "/static/icons/log.png",
        title: "系统日志",
        url: "/pages/work/log/index",
        perm: "sys:log:list",
      },
    ],
  },
];
