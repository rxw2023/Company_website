/**
 * 响应式图片工具
 *
 * 背景：源图最大 4500×2813，而在卡片里只渲染约 300px 宽 —— 过度投递 15 倍。
 * `scripts/gen-image-variants.mjs` 用 ffmpeg 生成更小的 WebP 变体，
 * 并把「源图宽度 + 各变体宽度」写进 imageVariants.json（构建前生成）。
 *
 * 这里负责把变体拼成 srcset。宽度是我们自己选的，因此不需要额外探测——
 * 这正是用固定宽度集而不是「让浏览器猜」的原因。
 *
 * 降级：变体不存在（没装 ffmpeg / 没跑 gen:images）时，
 * 返回的对象只有 src，组件行为与改动前完全一致。
 */
import manifest from './imageVariants.json';
import { IMAGE_BY_KEY, CASE_IMAGE_BY_KEY } from './productImages';

/** 变体文件 → 打包后的 URL。Vite 在构建时把 gen/*.webp 一并哈希输出。 */
const urls = import.meta.glob('../assets/images/gen/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** key → (宽度 → URL) */
const byKey = new Map<string, Map<number, string>>();
for (const [filePath, url] of Object.entries(urls)) {
  const m = /gen\/(.+)\.(\d+)\.webp$/.exec(filePath);
  if (!m) continue;
  const key = m[1];
  const width = Number(m[2]);
  if (!byKey.has(key)) byKey.set(key, new Map());
  byKey.get(key)!.set(width, url);
}

/** 原图 URL → key，供只持有 URL 的组件反查 */
const keyByUrl = new Map<string, string>();
for (const [key, url] of Object.entries({ ...IMAGE_BY_KEY, ...CASE_IMAGE_BY_KEY })) {
  keyByUrl.set(url, key);
}

interface VariantMeta {
  originalWidth: number;
  originalHeight: number;
  variants: { w: number; file: string; bytes: number }[];
}

const meta = manifest as Record<string, VariantMeta>;

export interface ResponsiveImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * @param key          图片资源 key（如 "a1-1"），与 products.json 的 cardImage/images 一致
 * @param originalUrl  productImages.ts 里打包后的原图 URL
 * @param sizes        CSS sizes 描述，决定浏览器选哪一档
 */
export function responsiveImage(
  key: string,
  originalUrl: string,
  sizes: string
): ResponsiveImageProps {
  const variants = byKey.get(key);
  const info = meta[key];

  if (!variants || !info || info.variants.length === 0) {
    return { src: originalUrl };
  }

  const parts: string[] = [];
  for (const v of [...info.variants].sort((a, b) => a.w - b.w)) {
    const url = variants.get(v.w);
    if (url) parts.push(`${url} ${v.w}w`);
  }
  // 原图作为最大一档，保证大屏/高 DPR 下仍然清晰
  parts.push(`${originalUrl} ${info.originalWidth}w`);

  return { src: originalUrl, srcSet: parts.join(', '), sizes };
}

/** 卡片类图片的通用 sizes：窄屏几乎满宽，中屏两列，宽屏固定约 300px */
export const CARD_SIZES = '(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 300px';

/** 详情页主图的 sizes：受容器 1040px 限制 */
export const DETAIL_SIZES = '(max-width: 1100px) 92vw, 1040px';

/** 案例详情页图片的 sizes */
export const CASE_IMAGE_SIZES = '(max-width: 1024px) 92vw, 720px';

/** 缩略图（约 80px） */
export const THUMB_SIZES = '80px';

/**
 * 按原图 URL 反查 key 再取 srcset。
 *
 * 给那些只持有解析后 URL、拿不到资源 key 的组件用（例如详情页的图集数组）。
 * 反查表由 productImages.ts 反推，不需要在业务数据里再加一份 key。
 */
export function responsiveImageByUrl(
  originalUrl: string,
  sizes: string
): ResponsiveImageProps {
  const key = keyByUrl.get(originalUrl);
  if (!key) return { src: originalUrl };
  return responsiveImage(key, originalUrl, sizes);
}
