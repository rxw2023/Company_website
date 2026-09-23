/**
 * 工程案例「卡片级」数据访问层 —— 数据本体在 ./cases.json
 *
 * 首页案例网格、分类筛选、sitemap、预渲染的标题与描述从这里取。
 *
 * 详情页正文不在这个文件里，见 ./caseDetails.ts。两者拆开的原因：
 * 正文有 48 段散文（约 5.6 KB gzip），而 Home 会 import CASES ——
 * 合成一份的话这些散文会跟着进主 bundle，首页一个字都用不到。
 * 拆的是存储位置，不是把同一个字段抄两份：没有任何字段同时出现在两个文件里，
 * doctor 会校验两个文件的 id 集合完全一致。
 *
 * 两个 name 类字段是有意分开的（都只在本文件）：
 *   name       卡片短名，用于首页卡片与 sitemap
 *   detailTitle 详情页 H1 / title / 面包屑，比 name 完整，见 caseDetails.json
 */
import catalog from './cases.json';

export interface CaseItem {
  id: string;
  /** 卡片短名。用于首页卡片与 sitemap —— 以本文件为准 */
  name: string;
  /** 卡片角标，如 "高等教育"。详情页角标是另一个值，见 caseDetails.json 的 detailTag */
  tag: string;
  /** 案例分类，见 CASE_CATEGORIES */
  category: string;
  /** 卡片主图，对应 assets/images/<cardImage>.webp。须等于详情页图集首图 */
  cardImage: string;
  /** 预渲染 / og:description */
  seoDescription: string;
}

interface CaseCatalog {
  categories: string[];
  cases: CaseItem[];
}

const typed = catalog as unknown as CaseCatalog;

export const CASE_CATEGORIES: readonly string[] = typed.categories;
export const CASES: readonly CaseItem[] = typed.cases;
export const CASE_IDS: readonly string[] = CASES.map((c) => c.id);

const BY_ID: Record<string, CaseItem> = Object.fromEntries(
  CASES.map((c) => [c.id, c])
);

export function getCase(id: string | undefined): CaseItem | undefined {
  return id ? BY_ID[id] : undefined;
}

export function casePath(id: string): string {
  return `/case/${id}`;
}
