/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import sitemapPlugin from "./sitemap-generator.js";

function getPlugins() {
  const plugins = [react(), tsconfigPaths(), sitemapPlugin()];
  return plugins;
}

export default defineConfig({
  plugins: getPlugins(),
  server: {
    proxy: {
      '/api-ai': {
        target: 'https://api.siliconflow.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-ai/, ''),
        headers: { Origin: 'https://api.siliconflow.cn' },
      },
    },
  },
  build: {
    // 构建完成后自动执行预渲染脚本
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
