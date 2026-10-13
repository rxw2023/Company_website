/**
 * 品牌层访问层 —— 首页「产品系列」区块的卡片（= 品牌）从这里派生
 *
 * 为什么单独一层：产品数据（products.json）回答的是「这个产品是什么」，
 * 品牌层回答的是「首页上有几张卡片、每张卡片叫什么、点开看谁的产品」。
 * 两者分开之后，加一个代理品牌不需要动 Home.tsx 一行代码。
 *
 * 数据本体：
 *   · brands.json                 品牌清单（顺序 = 页面上 tab 的顺序）
 *   · brands/<id>.json            非主品牌自己的产品卡片
 *   · products.json               主品牌产品（详情页 / 站内搜索 / AI 知识库都在那边）
 *
 * 品牌图片走 productImages.ts 的 BRAND_IMAGE_BY_KEY —— Vite 要求静态 import
 * 才能参与打包，这条约束和产品图完全一样。
 *
 * 改品牌信息 → 只改 brands.json → 跑 `pnpm run doctor` 校验。
 */
import brandsData from './brands.json';
// 非主品牌的产品卡片数据。新增品牌就在这里加一行 import。
import wanshiData from './brands/wanshi.json';
import hengdiData from './brands/hengdi.json';
import { PRODUCTS } from './products';
import {
  BRAND_IMAGE_BY_KEY,
  HERO_IMAGE_BY_KEY,
  IMAGE_BY_KEY,
  PDF_BY_FILE,
} from './productImages';

// ============ 类型 ============

/** 非主品牌的产品卡片 —— 精简版：只够渲染一张卡片，不参与详情页 / AI 知识库 */
export interface BrandProduct {
  id: string;
  /** 必须与所属品牌 id 一致，doctor 会核对 */
  brand: string;
  model: string;
  name: string;
  /** 分类，用于区块内的场景筛选 tab；不填则不进任何分类（只在「全部」里出现） */
  category?: string;
  /** 一句话定位（副标题） */
  tagline?: string;
  /** 卡片描述 */
  desc?: string;
  /** live = 资料齐全；soon = 资料准备中（卡片显示「即将上线」） */
  status?: 'live' | 'soon';
  /** 站内 /product/<id> 或外部 https:// 链接；不填则卡片不可点 */
  href?: string;
  /** 对应 src/assets/images/<key>.webp */
  cardImage?: string;
  /** 无图时占位图上显示的文字，通常写型号 */
  placeholder?: string;
  /** 悬停切换图，规则同 cardImage */
  hoverImage?: string;
}

export interface Brand {
  id: string;
  name: string;
  enName: string;
  /** 卡片 tab 上的文字 */
  tabLabel: string;
  /** 区块左上角的小字 */
  eyebrow: string;
  /** 该品牌区块的说明文字，建议 ≤ 20 个汉字（超过会在小屏被截成两行） */
  tagline: string;
  /** 品牌强调色。用于 tab 的色条与选中描边，是**唯一**允许写色值的地方 */
  color: string;
  /** 主品牌：产品数据来自 products.json，卡片顺序、详情页、站内搜索都跟着它 */
  isPrimary: boolean;
  /**
   * 该品牌的产品数据文件路径。
   * 只作声明与校验用（doctor 会核对这个文件里的 brand 字段）；
   * 浏览器侧实际读的是下面按品牌 id 登记的 BRAND_DATA_FILES —— Vite 要求静态 import。
   */
  dataFile?: string;
  /** 还没有任何产品时区块里显示的话 */
  emptyState?: string;
  /** 末尾是否补一张「后续产品敬请期待」占位卡（仅在该品牌已有产品时补） */
  placeholderCard?: boolean;
}

/** 首页真正渲染用的视图模型：一个品牌 + 它这一屏要显示的卡片 */
export interface BrandView extends Brand {
  products: BrandProduct[];
}

interface BrandsCatalog {
  brands: Brand[];
}

interface BrandDataFile {
  brand: string;
  products: BrandProduct[];
}

const typed = brandsData as unknown as BrandsCatalog;

/**
 * 品牌数据文件在这里静态登记。
 *
 * 不能用 import.meta.glob 省掉这一步：预渲染脚本（prerender.js）也要读同一份
 * 数据，而它跑在 Node 里、不经过 Vite。静态清单是唯一一份，两边都不会漏。
 *
 * 新增品牌 → 在 brands.json 加一条 + 下面加一行 import。
 */
const BRAND_DATA_FILES: Record<string, BrandDataFile> = {
  wanshi: wanshiData as unknown as BrandDataFile,
  hengdi: hengdiData as unknown as BrandDataFile,
};

// ============ 导出 ============

/** 品牌清单，顺序即首页 tab 的顺序 */
export const BRANDS: readonly Brand[] = typed.brands;

/** 主品牌 id（首页默认选中的卡片） */
export const PRIMARY_BRAND_ID =
  (BRANDS.find((b) => b.isPrimary) || BRANDS[0])?.id ?? '';

function getBrand(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id);
}

/** 把品牌产品数据文件里的条目规整成首页卡片视图模型 */
function toBrandProducts(brandId: string, rows: BrandProduct[]): BrandProduct[] {
  return rows.map((p) => ({
    ...p,
    brand: p.brand || brandId,
    status: p.status || 'live',
  }));
}

/**
 * 品牌 id → 该品牌的产品卡片。
 *
 * 主品牌取自 products.json（那里才是产品详情、站内搜索、AI 知识库的事实源），
 * 其余品牌取自各自的 brands/<id>.json。
 */
export function productsByBrand(brandId: string): BrandProduct[] {
  const brand = getBrand(brandId);
  if (!brand) return [];

  if (brand.isPrimary) {
    // products.json 里的产品按 brand 字段归属；没有该字段的视为主品牌产品，
    // 这样给 products.json 加产品时不会因为漏写 brand 而静默消失。
    return PRODUCTS.filter((p) => (p.brand || PRIMARY_BRAND_ID) === brand.id).map(
      (p) => ({
        id: p.id,
        brand: brand.id,
        model: p.model,
        name: p.cardName,
        category: p.category,
        desc: p.cardDesc,
        status: 'live' as const,
        href: `/product/${p.id}`,
        cardImage: p.cardImage,
      })
    );
  }

  const file = brand.dataFile ? BRAND_DATA_FILES[brand.id] : undefined;
  return toBrandProducts(brand.id, file?.products ?? []);
}

/** 首页「产品系列」区块的完整数据（品牌 + 产品），顺序 = brands.json 的顺序 */
export const BRAND_VIEWS: readonly BrandView[] = BRANDS.map((brand) => ({
  ...brand,
  products: productsByBrand(brand.id),
}));

/**
 * 品牌图片 key → 打包后的 URL。
 *
 * 三张登记表按用途分开（思必驰产品图集 / 品牌卡片图 / 首屏轮播图），
 * 但**取图时是同一个 key 空间**：一张图只登记一次，用到哪个场景都能取到。
 * 分开登记是为了让 doctor 按各自的数据文件精确校验，
 * 而不是逼同一张图在两张表里各写一遍（那样迟早漏一处）。
 */
export function brandImage(key?: string): string | undefined {
  return resolveImageKey(key);
}

/** 任意图片 key → URL：按「品牌卡片 → 首屏轮播 → 思必驰产品图集」顺序查找 */
export function resolveImageKey(key?: string): string | undefined {
  if (!key) return undefined;
  if (key.startsWith('data:')) return key; // 内联占位图，没有资源文件
  return (
    BRAND_IMAGE_BY_KEY[key] ||
    HERO_IMAGE_BY_KEY[key] ||
    IMAGE_BY_KEY[key] ||
    undefined
  );
}

/** 品牌产品彩页 key（文件名）→ 打包后的 PDF URL；没有登记就返回 undefined */
export function brandPdf(file?: string): string | undefined {
  if (!file) return undefined;
  return PDF_BY_FILE[file];
}
