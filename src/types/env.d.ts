// src/types/env.d.ts
interface ImportMetaEnv {
  /**
   * 应用端口
   */
  VITE_APP_PORT: number;
  /**
   * API 基础路径
   */
  VITE_APP_BASE_API: string;
  /**
   * API 服务器的 URL
   */
  VITE_APP_API_URL: string;

  /**
   * WebSocket 端点
   */
  VITE_APP_WS_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
