# Company Website

企业官网模板，使用 React + Vite + TypeScript + Tailwind CSS 构建，适用于产品展示型企业网站。

## 特性

- **响应式设计** — 适配桌面、平板、移动端
- **SEO 优化** — 预渲染静态 HTML + 结构化数据 + Sitemap 自动生成
- **AI 智能客服** — 接入 SiliconFlow 大模型 API（当前 `tencent/Hy4-preview`），流式输出回答产品咨询
- **全站搜索** — Cmd/Ctrl + K 呼出搜索弹窗，覆盖产品、案例、FAQ，支持多词加权匹配和高亮
- **产品全景展示** — 图片灯箱浏览、规格参数表、PDF 彩页下载
- **工程案例** — 分类筛选展示，图文并茂

## 技术栈

| 层次    | 技术                                                                           |
| ----- | ---------------------------------------------------------------------------- |
| 框架    | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| 构建    | [Vite 6](https://vitejs.dev)                                                 |
| 样式    | [Tailwind CSS 3](https://tailwindcss.com)                                    |
| 路由    | [React Router 7](https://reactrouter.com)                                    |
| 动画    | [Framer Motion](https://www.framer.com/motion)                               |
| SEO   | [React Helmet Async](https://github.com/staylor/react-helmet-async)          |
| Toast | [Sonner](https://sonner.emilkowal.ski)                                       |
| 包管理   | [pnpm](https://pnpm.io)                                                      |

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
│   ├── favicon.webp
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── images/                  # 产品图 + 案例图 (WebP)
│   │   ├── pdf/                     # 产品彩页 / 说明书 (PDF)
│   │   └── videos/                  # 案例视频 (MP4)
│   ├── components/
│   │   ├── AiChatWidget/            # AI 悬浮聊天窗
│   │   │   ├── AiChatWidget.tsx     # 聊天 UI 组件（不持有 API Key）
│   │   │   └── aiService.ts         # API 调用 + 知识库生成
│   │   ├── Header.tsx               # 面包屑头部
│   │   ├── Navigation.tsx           # 全局导航栏 + 全站搜索弹窗
│   │   └── SeoHead.tsx              # SEO 结构化数据
│   ├── data/                        # ★ 单一事实源（Single Source of Truth）
│   │   ├── products.json            # 全部产品数据：名称/规格/场景/关联/图片/彩页
│   │   ├── products.ts              # 产品访问层 + AI 知识库生成器
│   │   ├── cases.json               # 全部工程案例数据
│   │   ├── cases.ts                 # 案例访问层
│   │   └── productImages.ts         # 图片/PDF 资源映射（静态 import 集中处）
│   ├── pages/
│   │   ├── Home.tsx                 # 首页（产品卡片 + 案例网格，数据均派生）
│   │   ├── ProductDetailPage.tsx    # 产品详情页（图集 + 规格 + 下载）
│   │   ├── CaseDetailPage.tsx       # 案例详情页
│   │   ├── FaqPage.tsx              # FAQ 常见问题
│   │   └── NotFoundPage.tsx         # 404 页面
│   ├── App.tsx                      # 路由定义
│   ├── main.tsx                     # 应用入口
│   ├── index.css                    # Tailwind 指令 + 全局样式
│   └── vite-env.d.ts                # Vite 类型声明
├── scripts/
│   └── doctor.mjs                   # ★ 知识一致性体检（校验事实源是否漂移）
├── .env.example                     # 环境变量模板
├── .env.local                       # 本地环境变量（gitignore，不提交）
├── .gitignore
├── index.html                       # HTML 入口
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json                    # TypeScript 配置
├── vite.config.ts                   # Vite 配置（dev proxy 注入密钥 + build manifest）
├── tailwind.config.js               # Tailwind 配置
├── postcss.config.js                # PostCSS 配置
├── prerender.js                     # 构建后预渲染脚本（读事实源 + manifest）
├── sitemap-generator.js             # Vite 插件：自动生成 sitemap
├── DEPLOYMENT_GUIDE.md              # 部署指南（含 nginx 密钥注入配置）
├── LICENSE
└── README.md
```

## 数据维护：单一事实源

**改产品信息只需要改 `src/data/products.json` 一个文件。** 首页卡片、产品详情、
站内搜索索引、sitemap、预渲染 SEO、AI 客服知识库、`index.html` 的 ItemList
结构化数据，全部由它派生。

以前这些数据在 6 个文件里各存一份，已经产生过真实事故：

| 参数 | AI 客服曾说的 | 官网实际是 |
| --- | --- | --- |
| MA600D 拾音半径 | 6m（丢掉"现场扩声 3m"的前提） | 现场扩声 3m / 纯录音·远程 6m |
| MCS06 尺寸 | 597×597×53.5mm，<5KG（抄成了 MC10 的） | 597×597×72.5mm，<6KG |
| C40T 光圈 | F1.6-F2.8 | F1.6-F3.0 |
| D1 彩页 | 指向 MT100 的 PDF | 会议办公大模型信创一体机D1.pdf |

### 新增或修改产品的流程

```bash
# 1. 编辑 src/data/products.json（图片先放进 src/assets/images/）
# 2. 在 src/data/productImages.ts 登记新的图片/PDF key
# 3. 体检：校验图片存在、名称一致、规格数值不漂移
pnpm run doctor

# 4. 构建 + 体检（推荐发版前执行）
pnpm run verify
```

`pnpm run doctor` 会检查：

- 结构：图片 key / 彩页 / 关联产品 / 方案组合是否都真实存在
- 名称漂移：产品详情页、站内搜索、`index.html` 的 ItemList 与事实源是否一致
- 数值漂移：同一规格标签在不同来源里的首个数字是否一致
- 临界事实：拾音半径这类易错参数，事实源是否覆盖了详情页/搜索里的全部数值
- 产物：预渲染页面的 `og:image` 是否指向真实存在的打包文件
- 安全：打包产物里是否残留明文 API Key

## AI 客服配置

AI 客服使用 [SiliconFlow](https://siliconflow.cn) 提供的大模型，当前为 `tencent/Hy4-preview`（腾讯混元）。
换模型只需改 `VITE_AI_MODEL` 一个变量；聊天窗里的品牌文案会自动跟随，不会残留旧模型名。

### 安全模型：浏览器端不持有 API Key

```
浏览器  ──POST /api-ai/v1/chat/completions（无 Authorization）──▶  本站服务端
                                                                      │ 注入 Authorization
                                                                      ▼
                                                          https://api.siliconflow.cn
```

- **开发环境**：`vite.config.ts` 的 dev proxy 读取 `.env.local` 并在服务端注入鉴权头
- **生产环境**：nginx 反代注入（见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 第 6.2 节）

> ⚠️ **API Key 的变量名不能加 `VITE_` 前缀。** 带该前缀的变量会被 Vite 编译进
> `dist/assets/*.js`，访客打开开发者工具即可提取并盗刷额度。

### 环境变量

```bash
cp .env.example .env.local
```

`.env.local` 内容：

```bash
# 仅服务端使用，勿加 VITE_ 前缀
SILICONFLOW_API_KEY=sk-xxxxxxxxxxxxxxxx
# 模型名不是密钥，可以留在前端
VITE_AI_MODEL=tencent/Hy4-preview
```

### 知识库

system prompt 由 `src/data/products.json` 自动生成（见 `buildSystemPrompt()`），
不再手写，避免官网参数与 AI 口径再次漂移。

## License

[MIT](./LICENSE)
