/// <reference types="vite/client" />

/**
 * 环境变量类型声明
 */
interface ImportMetaEnv {
  /** 应用端口 */
  readonly VITE_APP_PORT: string;
  /** 请求前缀，开发为 /dev-api，生产为 /prod-api */
  readonly VITE_API_BASE: string;
  /** 接口地址，小程序/App 直接请求这里 */
  readonly VITE_API_URL: string;
  /** 工作台-应用监控地址，未配置时用代码内的默认值 */
  readonly VITE_APP_MONITOR_URL?: string;
  /** 应用版本号，构建时注入 */
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
