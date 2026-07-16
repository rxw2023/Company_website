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
});
