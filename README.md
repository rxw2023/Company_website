# Company Website

企业官网模板，使用 React + Vite + TypeScript + Tailwind CSS 构建，适用于产品展示型企业网站。

## 特性

- **响应式设计** — 适配桌面、平板、移动端
- **SEO 优化** — 预渲染静态 HTML + 结构化数据 + Sitemap 自动生成
- **AI 智能客服** — 接入 SiliconFlow / DeepSeek API，流式输出回答产品咨询
- **产品全景展示** — 图片灯箱浏览、规格参数表、PDF 彩页下载
- **工程案例** — 分类筛选展示，图文并茂

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| 构建 | [Vite 6](https://vitejs.dev) |
| 样式 | [Tailwind CSS 3](https://tailwindcss.com) |
| 路由 | [React Router 7](https://reactrouter.com) |
| 动画 | [Framer Motion](https://www.framer.com/motion) |
| SEO | [React Helmet Async](https://github.com/staylor/react-helmet-async) |
| Toast | [Sonner](https://sonner.emilkowal.ski) |
| 包管理 | [pnpm](https://pnpm.io) |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm build
```

构建流程：

1. Vite 打包并自动生成 `sitemap.xml`
2. `prerender.js` 为每个路由生成静态 HTML

构建产物输出至 `dist/` 目录。

## 项目结构

```
.
├── public/                          # 静态资源
│   └── favicon.webp
├── src/
│   ├── assets/
│   │   ├── images/                  # 产品图 + 案例图 (WebP)
│   │   ├── pdf/                     # 产品彩页 / 说明书 (PDF)
│   │   └── videos/                  # 案例视频 (MP4)
│   ├── components/
│   │   ├── AiChatWidget/            # AI 悬浮聊天窗
│   │   │   ├── AiChatWidget.tsx     # 聊天 UI 组件
│   │   │   └── aiService.ts         # API 调用 + System Prompt
│   │   ├── Header.tsx               # 面包屑头部
│   │   ├── Navigation.tsx           # 全局导航栏
│   │   └── SeoHead.tsx              # SEO 结构化数据
│   ├── pages/
│   │   ├── Home.tsx                 # 首页（产品卡片 + 案例网格）
│   │   ├── ProductDetailPage.tsx    # 产品详情页（图集 + 规格 + 下载）
│   │   ├── CaseDetailPage.tsx       # 案例详情页
│   │   ├── FaqPage.tsx              # FAQ 常见问题
│   │   └── NotFoundPage.tsx         # 404 页面
│   ├── App.tsx                      # 路由定义
│   ├── main.tsx                     # 应用入口
│   ├── index.css                    # Tailwind 指令 + 全局样式
│   └── vite-env.d.ts                # Vite 类型声明
├── .env.example                     # 环境变量模板
├── .env.local                       # 本地环境变量（gitignore，不提交）
├── .gitignore
├── index.html                       # HTML 入口
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json                    # TypeScript 配置
├── vite.config.ts                   # Vite 配置（含 API 代理）
├── tailwind.config.js               # Tailwind 配置
├── postcss.config.js                # PostCSS 配置
├── prerender.js                     # 构建后预渲染脚本
├── sitemap-generator.js             # Vite 插件：自动生成 sitemap
├── DEPLOYMENT_GUIDE.md              # 部署指南
├── LICENSE
└── README.md
```

## AI 客服配置

AI 客服使用 [SiliconFlow](https://siliconflow.cn) 提供的 DeepSeek-V3 模型。

### 环境变量

```bash
# 复制 .env.example 为 .env.local 并填入实际值
cp .env.example .env.local
```

`.env.local` 内容：

```bash
VITE_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
VITE_AI_MODEL=deepseek-ai/DeepSeek-V3
```

### 生产部署

生产环境需配置 Nginx 反向代理：

```nginx
location /api-ai/ {
    proxy_pass https://api.siliconflow.cn/;
}
```

## License

[MIT](./LICENSE)
