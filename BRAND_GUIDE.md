# 首页「产品系列」多品牌维护指南

首页产品系列区块现在是**三张品牌卡片**（思必驰 / 玩视智能 / 恒迪），点哪张就显示哪个品牌的产品。
这份文档是「要加东西时该改哪一行」的唯一说明。

> 目前玩视智能与恒迪两张卡片是**搭好的空框架**：卡片、tab、空态、校验都在，
> 只是还没有产品数据。往 `products` 数组里加一条，卡片立刻出现，不需要改任何组件代码。

---

## 1. 先看结构：数据在哪、谁读它

```
src/data/
├── brands.json              ★ 品牌清单（顺序 = 页面上 tab 的顺序）
├── brands/
│   ├── wanshi.json          ← 玩视智能的产品卡片（加产品改这里）
│   └── hengdi.json          ← 恒迪自有品牌的产品卡片（加产品改这里）
├── products.json            ← 思必驰产品（详情页 / 站内搜索 / AI 知识库的事实源）
├── brands.ts                访问层：把上面几份数据拼成首页要的视图模型
├── products.ts              思必驰产品的访问层
└── productImages.ts         图片 / PDF 资源映射（Vite 要求静态 import 集中处）
```

三句话讲清分工：

| 想知道… | 看哪个文件 |
| --- | --- |
| 首页有哪几张品牌卡片、怎么排序、文案是什么 | `brands.json` |
| 某个品牌下面有哪些产品卡片 | 思必驰 → `products.json`；其他 → `brands/<品牌>.json` |
| 卡片图对应哪个文件 | `productImages.ts` |

**关键规则：品牌 id 决定产品数据放哪个文件。**

- `isPrimary: true` 的品牌（现在是思必驰）用 `products.json` —— 那边的产品有详情页、规格表、彩页，
  进站内搜索、sitemap、AI 知识库。
- 其他品牌用 `src/data/brands/<品牌 id>.json` —— 纯展示卡片，没有详情页。

> 为什么不混在一个文件里？`products.json` 的每一步都有强校验（必须配详情页、彩页、搜索索引），
> 把「只有一张卡片」的产品塞进去会连带触发一堆必须补齐的字段，反而更难加。

---

## 2. 最常见的四件事

### ① 给玩视智能 / 恒迪加一个产品（最常做）

打开 `src/data/brands/wanshi.json`（或 `hengdi.json`），往 `products` 里加一条：

```json
{
  "id": "w1",
  "brand": "wanshi",
  "model": "WX-200",
  "name": "玩视智能 WX-200 无线投屏器",
  "category": "控制·投屏",
  "desc": "一句话说清它是什么、解决什么问题，40～80 字。",
  "status": "live",
  "cardImage": "w1-1",
  "placeholder": "WX-200"
}
```

字段含义：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | ✅ | 格式 `<品牌前缀><数字>`：玩视 = `w1` / `w2`，恒迪 = `h1` / `h2`。**不能和思必驰的 `a1`、`a2` 等重名**（doctor 会查） |
| `brand` | ✅ | 固定写该品牌的 id（`wanshi` / `hengdi`），doctor 会核对 |
| `model` | ✅ | 对外型号 |
| `name` | ✅ | 卡片标题，建议「品牌 + 型号 + 品类」 |
| `desc` | 建议 | 卡片描述，界面最多显示 3 行，写太长会被截断 |
| `category` | 可选 | 用于区块内的场景筛选 tab；写了就自动多出一个筛选项，**不用改代码** |
| `status` | 可选 | `live`（默认，资料齐全）/ `soon`（资料准备中，卡片显示「即将上线」） |
| `href` | 可选 | 站外官网填完整 `https://…`；站内产品详情填 `/product/<id>`（该 id 必须已存在于 `products.json`）。**不写就不可点**，显示「即将上线」 |
| `cardImage` | 可选 | 图片 key，如 `w1-1`。**不写不会出现破图**，卡片会显示带型号的占位图 |
| `hoverImage` | 可选 | 悬停切换图，规则同 `cardImage` |

加完跑一次：

```bash
pnpm run doctor
```

它会告诉你图片有没有、id 有没有撞车、链接会不会 404。

**还没准备素材时怎么办？** 什么都不用做 —— 保持 `products: []` 就是现在这样：
区块显示一行「产品资料准备中，即将上线」。也可以先把产品条目写进去、只填 `status: "soon"`
或干脆不写 `cardImage`，卡片会带着占位图先排上去。

### ② 加图片（只能用 WebP）

站点图片管线（尺寸压缩、卡片变体、体积校验）**只认 `.webp`**。
png/jpg 直接丢进 `src/assets/images/` 的后果是：文件进了仓库，doctor 看不见它，页面还得下载原图。

完整流程：

```bash
# 1. 转 WebP（源文件不会被删，q 默认 82，越高越清晰越大）
pnpm towebp 下载 --out src/assets/images

# 2. 改成资源 key 规范的文件名（同一个产品的多张图用 -1/-2 后缀）
#    玩视智能：w1-1.webp / w1-2.webp      恒迪：h1-1.webp / h1-2.webp
#    思必驰沿用旧规范：a1-5.webp（追加在末尾，不要改动已有文件名）

# 3. 生成卡片用的小尺寸变体（640px），并刷新 imageVariants.json
pnpm gen:images
```

然后在 `src/data/productImages.ts` **末尾的 `BRAND_IMAGE_BY_KEY`** 里登记两行：

```ts
import w1_1 from '../assets/images/w1-1.webp';   // 加到 import 区

export const BRAND_IMAGE_BY_KEY: Record<string, string> = {
  'w1-1': w1_1,
};
```

再把 `cardImage` 写成 `"w1-1"`，跑 `pnpm run doctor` 验证。

> ⚠️ 不要把品牌产品的图登记进 `IMAGE_BY_KEY` —— 那是思必驰产品图集的表，
> doctor 会拿它跟 `products.json` 逐条核对，混着放会两边都报错。

**为什么一定要 WebP + 640 变体？** 站点此前最过分的过度投递是「一张 4500×2813 的图在卡片里只渲染 300px」，
15 倍浪费。现在 `towebp` 限最长边 1920px，`gen:images` 再出一档 640px，
浏览器按屏幕挑合适的档位下载。doctor 会检查「源图有没有超限」「卡片图有没有变体」。

### ③ 加一个全新品牌（第四张卡片）

三步，每步都只有一行：

1. `src/data/brands.json` 的 `brands` 数组里加一条：

```json
{
  "id": "xxx",
  "name": "某某科技",
  "enName": "XXX",
  "tabLabel": "某某科技",
  "eyebrow": "某某科技有限公司",
  "tagline": "一句话说明这条产品线，建议 ≤ 20 个汉字。",
  "color": "#4a7c9b",
  "isPrimary": false,
  "dataFile": "src/data/brands/xxx.json",
  "emptyState": "某某科技的产品资料正在整理，即将上线。",
  "placeholderCard": true
}
```

   - `color` 是 6 位十六进制，控制 tab 上的品牌色条与选中描边（**唯一允许写色值的地方**）
   - `isPrimary` 只能有一个品牌是 `true`（现在是思必驰），doctor 会查
   - `placeholderCard: true` 表示末尾补一张「后续产品尽情期待」占位卡

2. 新建 `src/data/brands/xxx.json`（照抄 `wanshi.json`）：

```json
{ "brand": "xxx", "products": [] }
```

3. 登记这个新文件（**两个地方都要加，漏一个那张卡片会永远空着**）：

   | 文件 | 加什么 |
   | --- | --- |
   | `src/data/brands.ts` | `import xxxData from './brands/xxx.json';` + `BRAND_DATA_FILES` 里加 `xxx: xxxData` |
   | `scripts/doctor.mjs` | 顶部 `import xxxBrandData …` + `BRAND_DATA_FILES` 里加 `xxx: xxxBrandData` |

最后 `pnpm run doctor` —— 如果漏了第 3 步，它会直接告诉你漏了哪个文件。

### ④ 改文案 / 换品牌色 / 调顺序

全部在 `src/data/brands.json`：

| 想改 | 改字段 |
| --- | --- |
| tab 上的字（如「恒迪」→「恒迪视讯」） | `tabLabel` |
| 标题上方的小字 | `eyebrow` |
| 标题右侧的说明 | `tagline`（建议 ≤ 20 汉字，太长小屏会挤） |
| 品牌色 | `color` |
| tab 顺序 | 调整 `brands` 数组顺序（首页默认显示第一个 `isPrimary` 的品牌） |
| 没有产品时显示的话 | `emptyState` |

---

## 3. 改完怎么验

```bash
pnpm run doctor     # 只体检：品牌结构 / 图片 / id 撞车 / 链接 404 / 样式色值
pnpm run verify     # 体检 + 构建 + 预渲染 + 动效检查（发版前跑这个）
```

`doctor` 关于品牌层会检查：

- `brands.json` 有且只有一个 `isPrimary`，每个品牌的 `name/enName/tabLabel/eyebrow/tagline/color` 都在
- 登记了品牌但没登记数据文件 → 报错（否则卡片永远空着，没人会发现）
- 非主品牌的产品 id 与思必驰产品、其他品牌产品是否撞车（撞了首页只渲染一张卡）
- 每条产品的 `brand` 字段与所在文件是否一致
- `cardImage` / `hoverImage` 的文件是否存在、是否登记到 `BRAND_IMAGE_BY_KEY`
- `href` 是站内 `/product/<id>` 时，那个产品是否真实存在
- 品牌色是否只写在 `brands.json`（`src/index.css` 之外禁止硬编码色值）

体检通过会打印每个品牌有几个产品卡片、几个还在准备中。

---

## 4. AI 知识库为什么没动

按需求，这次**没有改 AI 客服知识库**：

- `src/data/products.ts` 的 `buildSystemPrompt()` 只读 `products.json`
- 品牌层（`brands.json` / `brands/*.json`）的数据不进入 AI 客服的 system prompt

这样做的原因是：玩视智能、恒迪的产品参数目前还没核实，一旦进了 AI 知识库，
客服就会拿未核实的参数回答客户 —— 这个仓库以前正是因为这个吃过事故
（MA600D 拾音半径被说成 6m、丢了「现场扩声 3m」的前提）。

**以后想让某个品牌的产品进 AI 知识库**，不要直接把 `brands/*.json` 喂给 prompt，正确做法是：

1. 把该产品的**完整**资料（规格、场景、一句话定位）按 `products.json` 的结构补进 `products.json`
   （这样它同时获得详情页、站内搜索、sitemap、结构化数据）
2. 在 `brands.json` 里把该产品所属品牌的 `isPrimary` 之外的处理改成引用 —— 或者更简单：
   保持卡片在 `brands/<id>.json`，只把规格补进 `products.json`
3. 跑 `pnpm run doctor`：它会校验详情页名称、彩页、规格数值是否与事实源一致

---

## 5. 一句话对照表

| 我要… | 改哪 |
| --- | --- |
| 加玩视智能 / 恒迪的产品 | `src/data/brands/wanshi.json` 或 `hengdi.json` 的 `products` |
| 给产品配图 | `pnpm towebp` → `pnpm gen:images` → `productImages.ts` 的 `BRAND_IMAGE_BY_KEY` |
| 加品牌 | `brands.json` + 新建 `brands/<id>.json` + 三处登记（见 ③） |
| 改卡片文案 / 颜色 / 顺序 | `brands.json` |
| 改思必驰产品（参数、彩页、详情页） | `src/data/products.json`（[README](./README.md) 有完整流程） |
| 验证 | `pnpm run doctor` |
