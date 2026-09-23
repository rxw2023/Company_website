/**
 * 工程案例「详情级」数据访问层 —— 数据本体在 ./caseDetails.json
 *
 * 只有 CaseDetailPage 引用本文件，所以它随详情页的懒加载 chunk 走，
 * 不会拖累首页首屏。卡片级字段（name / tag / category / cardImage）在 ./cases.ts。
 *
 * 图片与视频只存 key，URL 由 ./productImages.ts 映射 —— Vite 要求静态 import
 * 才能参与打包与哈希，不能从 JSON 里读文件名去拼路径。
 */
import catalog from './caseDetails.json';

/** 详情页正文段落 */
export interface CaseSection {
  label: string;
  content: string;
}

export type CaseTagColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'indigo'
  | 'gray'
  | 'yellow';

export interface CaseDetail {
  id: string;
  /** 详情页 H1、title 标签、面包屑。比 cases.json 的 name 完整 */
  detailTitle: string;
  /** 详情页角标，如 "声像追踪案例"。与卡片角标本就是两个值 */
  detailTag: string;
  /** 详情页角标配色 */
  tagColor: CaseTagColor;
  /** 图集，元素是 CASE_IMAGE_BY_KEY 的 key */
  images: string[];
  /** 视频，元素是 CASE_VIDEO_BY_KEY 的 key；没有视频就是空数组 */
  videos: string[];
  /** 详情页四段正文 */
  sections: CaseSection[];
}

interface CaseDetailCatalog {
  details: CaseDetail[];
}

const typed = catalog as unknown as CaseDetailCatalog;

export const CASE_DETAILS: readonly CaseDetail[] = typed.details;

const BY_ID: Record<string, CaseDetail> = Object.fromEntries(
  CASE_DETAILS.map((d) => [d.id, d])
);

export function getCaseDetail(id: string | undefined): CaseDetail | undefined {
  return id ? BY_ID[id] : undefined;
}
