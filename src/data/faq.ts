/**
 * FAQ 数据访问层 —— 数据本体在 ./faq.json
 *
 * 单一份数据同时供给：FAQ 页面展示、FAQPage 结构化数据、站内搜索索引。
 * 此前 FaqPage 与 Navigation 各维护一份（后者是前者的 13 条子集），已出现漂移风险。
 *
 * 分类不在这里单独导出：FaqPage 按 category 的首次出现顺序推导
 * （见 FaqPage 的 Array.from(new Set(...))），原先的 FAQ_CATEGORIES 无人引用，已删除。
 */
import catalog from './faq.json';

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

interface FaqCatalog {
  items: FaqItem[];
}

const typed = catalog as unknown as FaqCatalog;

export const FAQ_ITEMS: readonly FaqItem[] = typed.items;
