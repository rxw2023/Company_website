/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/**
 * 2024 安全修订（已确认必要，故改动）：
 *  1. dev proxy 在**服务端**注入 Authorization 头，前端不再持有 API Key。
 *  2. 打开 build.manifest，供 prerender.js 把源图路径解析成打包后的哈希文件名
 *     （此前预渲染写死的 /assets/a1-1.webp 在构建产物里不存在，导致 og:image 404）。
 */

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import sitemapPlugin from "./sitemap-generator.js";

function getPlugins() {
  const plugins = [react(), tsconfigPaths(), sitemapPlugin()];
  return plugins;
}

export default defineConfig(({ mode }) => {
  // 第三个参数传 '' 表示加载**全部**环境变量（含无 VITE_ 前缀的）
  const env = loadEnv(mode, process.cwd(), "");
  // SILICONFLOW_API_KEY 为新的服务端变量；兼容旧的 VITE_AI_API_KEY
  const apiKey = env.SILICONFLOW_API_KEY || env.VITE_AI_API_KEY;

  if (!apiKey) {
    console.warn(
      "[vite] 未检测到 SILICONFLOW_API_KEY，AI 助手将返回 401。请在 .env.local 中配置。"
    );
  }

  return {
    plugins: getPlugins(),
    server: {
      proxy: {
        '/api-ai': {
          target: 'https://api.siliconflow.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-ai/, ''),
          headers: {
            Origin: 'https://api.siliconflow.cn',
            // 关键：密钥只存在于 dev server 进程，不进浏览器
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
        },
      },
    },
    build: {
      // 供 prerender.js 解析哈希后的资源路径
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // React 核心
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // 动画库
            'vendor-motion': ['framer-motion'],
            // UI 工具
            'vendor-ui': ['sonner', 'react-helmet-async'],
          },
        },
      },
    },
  };
});
