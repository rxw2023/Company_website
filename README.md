# 恒迪视讯官网

杭州恒迪视讯技术有限公司官方网站，基于 React + Vite + TypeScript + Tailwind CSS 构建的现代化企业官网，主营思必驰（AISPEECH）全系列音视频产品。

## ✨ 特性

- **响应式设计** — 完美适配桌面、平板、移动端
- **SEO 优化** — 预渲染静态 HTML + 结构化数据 + 自动生成 Sitemap
- **AI 智能客服** — 接入 SiliconFlow / DeepSeek API，实时流式回答产品咨询
- **产品展示** — 图片灯箱、规格参数表、PDF 彩页下载
- **工程案例** — 分类筛选展示，图文并茂

## 🛠 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| 构建 | [Vite 6](https://vitejs.dev) |
| 样式 | [Tailwind CSS 3](https://tailwindcss.com) |
| 路由 | [React Router 7](https://reactrouter.com) |
| 动画 | [Framer Motion](https://www.framer.com/motion) |
| SEO | [React Helmet Async](https://github.com/staylor/react-helmet-async) |
| 包管理 | [pnpm](https://pnpm.io) |

## 📦 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 8

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
pnpm build
```

构建流程：
1. Vite 打包所有资源
2. 自动生成 `sitemap.xml`
3. `prerender.js` 为每个路由生成静态 HTML（SEO 预渲染）

构建产物输出至 `dist/` 目录。

## 📁 目录结构

```
├── public/              # 静态资源（favicon 等）
├── src/
│   ├── assets/          # 图片、PDF 等媒体文件
│   │   ├── images/      # 产品图片（WebP 格式）
│   │   └── pdf/         # 产品彩页 PDF
│   ├── components/      # 公共组件
│   │   └── AiChatWidget/  # AI 客服悬浮窗
│   ├── pages/           # 页面组件
│   │   ├── Home.tsx     # 首页（产品 + 案例）
│   │   ├── ProductDetailPage.tsx  # 产品详情页
│   │   └── EngineeringCasePage.tsx # 案例详情页
│   └── main.tsx         # 应用入口
├── prerender.js         # SSG 预渲染脚本
├── sitemap-generator.js # Sitemap 自动生成插件
├── vite.config.ts       # Vite 配置
└── tailwind.config.js   # Tailwind 配置
```

## 🤖 AI 客服配置

AI 客服使用 [SiliconFlow](https://siliconflow.cn) 提供的 DeepSeek-V3 模型。需在 `src/components/AiChatWidget/` 中配置 API Key。

开发环境通过 Vite 代理转发请求，生产环境需配置 Nginx 反向代理：

```nginx
location /api-ai/ {
    proxy_pass https://api.siliconflow.cn/;
}
```

## 📄 License

[MIT](./LICENSE)
