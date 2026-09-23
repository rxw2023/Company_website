/**
 * 产品数据访问层 —— 全站唯一的"事实来源"
 *
 * 数据本体在 ./products.json。首页卡片、产品详情、站内搜索、sitemap、
 * 预渲染 SEO、AI 客服知识库、index.html 的 ItemList 全部从这里派生。
 *
 * 为什么放 JSON 而不是 .ts：Node 构建脚本（prerender.js / sitemap-generator.js /
 * scripts/doctor.mjs）也要读同一份数据，JSON 对浏览器和 Node 都零成本。
 *
 * 改产品信息 → 只改 products.json → 跑 `pnpm run doctor` 校验 → 重新构建。
 */
import catalog from './products.json';

// ============ 类型 ============

export interface KeySpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  /** 对外型号，如 MC10 / MA600D */
  model: string;
  /** 规范全名，用于 SEO title 与结构化数据 */
  name: string;
  /** 首页卡片短名 */
  cardName: string;
  category: string;
  /** 首页卡片主图，对应 assets/images/<cardImage>.webp */
  cardImage: string;
  /** 详情页图集，按顺序 */
  images: string[];
  /** 彩页文件名，对应 assets/pdf/<pdf> */
  pdf: string;
  /** 已知的资料问题，doctor 会提示 */
  pdfNote?: string;
  /** 首页卡片文案 */
  cardDesc: string;
  /** 预渲染 / og:description / meta description */
  seoDescription: string;
  /** 给 AI 客服的一句话定位补充 */
  aiSummary: string;
  /** 结构化关键规格。数值含前提条件时必须写明 */
  keySpecs: KeySpec[];
  scenarios: string[];
  /** 关联产品 id */
  relations: string[];
}

export interface Bundle {
  id: string;
  name: string;
  /** 适用条件，如 "面积 ≤60㎡" */
  condition: string;
  products: string[];
  note: string;
  /** 需求标签。取值必须来自 TAGS，doctor 会校验 */
  tags: string[];
  /** 面积下限（㎡）。null = 不限制 */
  areaMin: number | null;
  /** 面积上限（㎡）。null = 不限制 */
  areaMax: number | null;
}

interface Catalog {
  site: {
    url: string;
    name: string;
    legalName: string;
    logo: string;
    brand: string;
    brandFull: string;
    email: string;
    phone: string;
  };
  categories: string[];
  products: Product[];
  bundles: Bundle[];
}

const typed = catalog as unknown as Catalog;

// ============ 导出 ============

export const SITE = typed.site;
export const CATEGORIES: readonly string[] = typed.categories;

/** 按官网展示顺序排列的产品列表 */
export const PRODUCTS: readonly Product[] = typed.products;

/** 方案组合（"条件空间"的雏形：面积/场景 → 推荐产品组合） */
export const BUNDLES: readonly Bundle[] = typed.bundles;

/**
 * 选型器的匹配逻辑与标签定义在 bundleMatch.ts —— 本文件 import 了 JSON，
 * Node 无法直接加载（缺 import attribute），motion-check 就断言不了。
 * 那边是纯逻辑模块，按本仓库的惯例（fieldMath / soundFieldMath）由使用方直接引用。
 */

const BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export function getProduct(id: string): Product | undefined {
  return BY_ID[id];
}

export function productPath(id: string): string {
  return `/product/${id}`;
}

/**
 * 生成 AI 客服的系统提示词。
 * 取代原先手写在 aiService.ts 里的产品散文——那份文案里的数值已经和官网脱节。
 */
export function buildSystemPrompt(): string {
  const specLines = PRODUCTS.map((p) => {
    const specs = p.keySpecs
      .map((s) => `    - ${s.label}：${s.value}`)
      .join('\n');
    return `### ${p.model}　${p.name}\n  定位：${p.aiSummary}\n  适用场景：${p.scenarios.join('、')}\n  关键规格：\n${specs}`;
  }).join('\n\n');

  const bundleLines = BUNDLES.map(
    (b) => `- ${b.name}（${b.condition}）：${b.note}`
  ).join('\n');

  return `你是${SITE.legalName}的官网智能助手，负责解答访客关于公司产品、方案和服务的问题。

## 公司简介
${SITE.legalName}位于杭州余杭区，专注于音视频系统集成、会议室智能控制、视频会议系统、音频处理等领域。主营${SITE.brandFull}（${SITE.brand}）全系列音视频产品。

## 主营产品（${SITE.brandFull} ${SITE.brand}）

${specLines}

## 方案组合参考
${bundleLines}

## 回答规范
1. 简洁专业，不超过 3 段话，优先引用上面列出的具体产品参数。
2. 涉及具体数值时，必须连带说出适用前提。例如 MA600D 的拾音半径要区分"现场扩声 3m"和"纯录音 / 远程通话 6m"，不可只说 6m。
3. 只使用上面列出的参数。如果某个参数上面没有写，不要推测，回答"这个参数建议以产品彩页为准，我可以帮您转接销售确认"。
4. 涉及价格、交期、库存等不确定信息，引导用户联系销售：${SITE.email} | ${SITE.phone}
5. 当访客描述会议室面积、人数或用途时，主动参考"方案组合参考"给出组合建议。
6. 回答用中文。`;
}
