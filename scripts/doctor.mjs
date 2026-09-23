#!/usr/bin/env node
/**
 * 知识一致性体检（doctor）
 *
 * 背景：本站产品数据曾在 5 个地方各存一份并互相矛盾 ——
 *   AI 客服说 MA600D 拾音半径 6m（丢掉"现场扩声 3m"的前提）、
 *   MCS06 尺寸被抄成了 MC10 的 53.5mm、C40T 光圈写成 F1.6-F2.8，
 *   而官网详情页分别是 6m/3m 分场景、72.5mm、F1.6-F3.0。
 *
 * 这个脚本做四件事：
 *   A. 结构校验：事实源里的图片 key / 彩页 / 关联产品 / 方案组合 是否都真实存在
 *   B. 名称漂移：产品详情页、站内搜索、index.html 的 ItemList 与事实源是否一致
 *   C. 数值漂移：同一规格标签在不同来源里的首个数字是否一致
 *   D. 临界事实护栏：容易说错的参数（如 MA600D 拾音半径必须带前提）是否写清
 *   E. 产物校验：dist 里预渲染页面的 og:image / 结构化数据图片是否真的存在
 *
 * 用法：pnpm run doctor        （退出码非 0 表示存在 ERROR）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { webpSize, MAX_EDGE, CARD_WIDTH } from './lib/webp.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const p = (...s) => path.join(ROOT, ...s);

const errors = [];
const warnings = [];
const notes = [];

const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const note = (m) => notes.push(m);

function readJSON(rel) {
  const abs = p(rel);
  if (!fs.existsSync(abs)) {
    err(`缺少数据文件 ${rel}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(abs, 'utf-8'));
}

function readText(rel) {
  const abs = p(rel);
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf-8') : null;
}

/**
 * 与 prerender.js 的 escapeHtml 保持一致。
 * 校验「正文是否进了 noscript」时必须比较转义后的文本 ——
 * 案例 e12 的正文里有英文引号，HTML 里是 &quot;，直接拿原文比对会误报缺失。
 */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============ 载入事实源 ============

const productCatalog = readJSON('src/data/products.json');
const caseCatalog = readJSON('src/data/cases.json');
const caseDetailCatalog = readJSON('src/data/caseDetails.json');

if (!productCatalog || !caseCatalog || !caseDetailCatalog) {
  console.error('事实源缺失，无法体检');
  process.exit(1);
}

const { products, bundles, site } = productCatalog;
const { cases } = caseCatalog;
const caseDetails = caseDetailCatalog.details;

/**
 * 案例数据分两个文件：cases.json（卡片级）与 caseDetails.json（详情级）。
 * 拆开是为了让 48 段正文不随 Home 的 import 进主 bundle。
 * 代价是两个文件的 id 必须严格一一对应 —— 这是拆分后唯一的失效模式，
 * 所以放在最前面查。
 */
{
  const cardIds = cases.map((c) => c.id);
  const detailIds = caseDetails.map((d) => d.id);
  const cardSet = new Set(cardIds);
  const detailSet = new Set(detailIds);

  if (cardSet.size !== cardIds.length) err('[案例] cases.json 的 id 有重复');
  if (detailSet.size !== detailIds.length) err('[案例] caseDetails.json 的 id 有重复');

  const onlyCard = cardIds.filter((id) => !detailSet.has(id));
  const onlyDetail = detailIds.filter((id) => !cardSet.has(id));
  if (onlyCard.length) {
    err(
      `[案例] 这些案例只有卡片数据、没有详情数据，详情页会跳回首页：${onlyCard.join('、')}`
    );
  }
  if (onlyDetail.length) {
    err(`[案例] 这些详情没有对应卡片，首页永远链不到：${onlyDetail.join('、')}`);
  }
  if (!onlyCard.length && !onlyDetail.length && caseDetails.length) {
    note(`[案例] cases.json 与 caseDetails.json 的 ${cardIds.length} 个 id 严格一一对应 ✓`);
  }
}

const caseDetailById = new Map(caseDetails.map((d) => [d.id, d]));
const productIds = new Set(products.map((x) => x.id));
const caseIds = new Set(cases.map((x) => x.id));

console.log('\n=== 知识一致性体检 (doctor) ===\n');
console.log(`事实源：${products.length} 个产品 / ${cases.length} 个案例 / ${bundles.length} 个方案组合\n`);

// ============ A. 结构校验 ============

const imageDir = p('src/assets/images');
const pdfDir = p('src/assets/pdf');
const imageFiles = fs.existsSync(imageDir)
  ? new Set(fs.readdirSync(imageDir).filter((f) => f.endsWith('.webp')))
  : new Set();
const pdfFiles = fs.existsSync(pdfDir) ? new Set(fs.readdirSync(pdfDir)) : new Set();

const imageKeyCache = new Map();
const imageKeyExists = (key) => {
  if (!imageKeyCache.has(key)) {
    imageKeyCache.set(key, imageFiles.has(`${key}.webp`));
  }
  return imageKeyCache.get(key);
};

const imageMapSrc = readText('src/data/productImages.ts') || '';

/**
 * 从 productImages.ts 里切出**单个映射表**的内容，而不是拿整份源码做 includes。
 *
 * 之前的写法是 `caseVideoMapSrc = imageMapSrc`（整份文件），于是「视频 e2 是否登记」
 * 只要文件里任何地方出现过 `'e2':` 就算通过 —— 而 CASE_IMAGE_BY_KEY 里正好有 `'e2':`。
 * 这条断言因此是空的：删掉视频映射它照样通过。切片之后才真正校验到对应的表。
 */
function mapBody(src, exportName) {
  const i = src.indexOf(`export const ${exportName}`);
  if (i < 0) return '';
  const open = src.indexOf('{', i);
  const close = src.indexOf('};', open);
  if (open < 0 || close < 0) return '';
  return src.slice(open, close);
}

const IMAGE_MAP_BODY = mapBody(imageMapSrc, 'IMAGE_BY_KEY');
const PDF_MAP_BODY = mapBody(imageMapSrc, 'PDF_BY_FILE');
const CASE_IMAGE_MAP_BODY = mapBody(imageMapSrc, 'CASE_IMAGE_BY_KEY');
const CASE_VIDEO_MAP_BODY = mapBody(imageMapSrc, 'CASE_VIDEO_BY_KEY');

const videoDir = p('src/assets/videos');
const videoFiles = fs.existsSync(videoDir)
  ? new Set(fs.readdirSync(videoDir))
  : new Set();

for (const prod of products) {
  // 卡片主图
  if (!imageKeyExists(prod.cardImage)) {
    err(`[结构] ${prod.id} 卡片主图 "${prod.cardImage}" 在 src/assets/images/ 下不存在`);
  }
  if (!IMAGE_MAP_BODY.includes(`'${prod.cardImage}':`)) {
    err(`[结构] ${prod.id} 卡片主图 "${prod.cardImage}" 未登记到 productImages.ts 的 IMAGE_BY_KEY`);
  }
  // 图集
  prod.images.forEach((key, i) => {
    if (!imageKeyExists(key)) {
      err(`[结构] ${prod.id} 图集第 ${i + 1} 张 "${key}" 在 src/assets/images/ 下不存在`);
    }
    if (!IMAGE_MAP_BODY.includes(`'${key}':`)) {
      err(`[结构] ${prod.id} 图集 "${key}" 未登记到 productImages.ts 的 IMAGE_BY_KEY`);
    }
  });
  if (!prod.images.includes(prod.cardImage)) {
    note(`[结构] ${prod.id} 卡片主图 "${prod.cardImage}" 不在图集内（首页与详情页主图不同，属正常，仅提示）`);
  }
  // 彩页
  if (!prod.pdf) {
    err(`[结构] ${prod.id} 未配置彩页 pdf`);
  } else if (!pdfFiles.has(prod.pdf)) {
    err(`[结构] ${prod.id} 彩页 "${prod.pdf}" 在 src/assets/pdf/ 下不存在`);
  } else if (!PDF_MAP_BODY.includes(`'${prod.pdf}':`)) {
    err(`[结构] ${prod.id} 彩页 "${prod.pdf}" 未登记到 productImages.ts 的 PDF_BY_FILE`);
  }
  // 关联产品
  for (const rel of prod.relations) {
    if (!productIds.has(rel)) {
      err(`[结构] ${prod.id} 的关联产品 "${rel}" 不存在`);
    }
    if (rel === prod.id) {
      warn(`[结构] ${prod.id} 关联了自身`);
    }
  }
  // 必填字段
  if (!prod.keySpecs?.length) err(`[结构] ${prod.id} 没有 keySpecs`);
  if (!prod.seoDescription) err(`[结构] ${prod.id} 缺少 seoDescription`);
  if (!prod.cardDesc) err(`[结构] ${prod.id} 缺少 cardDesc`);
  if (!prod.scenarios?.length) warn(`[结构] ${prod.id} 未填写适用场景`);
}

for (const c of cases) {
  const d = caseDetailById.get(c.id);

  // ── 卡片级（cases.json）──
  if (!imageKeyExists(c.cardImage)) {
    err(`[结构] 案例 ${c.id} 卡片图 "${c.cardImage}" 在 src/assets/images/ 下不存在`);
  }
  if (!CASE_IMAGE_MAP_BODY.includes(`'${c.cardImage}':`)) {
    err(`[结构] 案例 ${c.id} 卡片图 "${c.cardImage}" 未登记到 CASE_IMAGE_BY_KEY`);
  }
  if (!c.seoDescription) warn(`[结构] 案例 ${c.id} 缺少 seoDescription`);

  if (!d) continue; // 缺详情已在上面的 id 对应检查里报过

  // ── 详情级（caseDetails.json）──
  if (!d.detailTitle) {
    err(`[结构] 案例 ${c.id} 缺少 detailTitle —— 详情页 H1 与 title 会变成 undefined`);
  }
  if (!d.detailTag) err(`[结构] 案例 ${c.id} 缺少 detailTag`);
  if (!d.tagColor) {
    err(`[结构] 案例 ${c.id} 缺少 tagColor —— 详情页角标拿不到配色`);
  }

  // 图集：文件要存在，且必须登记进 CASE_IMAGE_BY_KEY（否则详情页图片静默消失）
  if (!Array.isArray(d.images) || d.images.length === 0) {
    err(`[结构] 案例 ${c.id} 的 images 为空 —— 详情页会没有图`);
  } else {
    d.images.forEach((key, i) => {
      if (!imageKeyExists(key)) {
        err(`[结构] 案例 ${c.id} 图集第 ${i + 1} 张 "${key}" 在 src/assets/images/ 下不存在`);
      }
      if (!CASE_IMAGE_MAP_BODY.includes(`'${key}':`)) {
        err(`[结构] 案例 ${c.id} 图集 "${key}" 未登记到 CASE_IMAGE_BY_KEY`);
      }
    });
    // 预渲染的 og:image 用 cardImage，客户端用 images[0]，两者必须一致
    if (d.images[0] !== c.cardImage) {
      warn(
        `[结构] 案例 ${c.id} 卡片图 "${c.cardImage}" 与图集首图 "${d.images[0]}" 不同 ——` +
          ` 预渲染 og:image 与客户端 og:image 会不一致`
      );
    }
  }

  // 视频：可以为空，但登记了就必须有映射
  if (!Array.isArray(d.videos)) {
    err(`[结构] 案例 ${c.id} 的 videos 不是数组（空数组也要写 []）`);
  } else {
    for (const key of d.videos) {
      if (!CASE_VIDEO_MAP_BODY.includes(`'${key}':`)) {
        err(`[结构] 案例 ${c.id} 的视频 "${key}" 未登记到 CASE_VIDEO_BY_KEY`);
      }
      if (!videoFiles.has(`${key}.mp4`)) {
        err(`[结构] 案例 ${c.id} 的视频 "${key}.mp4" 在 src/assets/videos/ 下不存在`);
      }
    }
  }

  // 正文段落
  if (!Array.isArray(d.sections) || d.sections.length === 0) {
    err(`[结构] 案例 ${c.id} 的 sections 为空 —— 详情页正文会是空白`);
  } else {
    d.sections.forEach((s, i) => {
      if (!s.label) err(`[结构] 案例 ${c.id} 第 ${i + 1} 段缺少 label`);
      if (!s.content) err(`[结构] 案例 ${c.id} 第 ${i + 1} 段（${s.label}）缺少 content`);
    });
    const labels = d.sections.map((s) => s.label);
    if (new Set(labels).size !== labels.length) {
      warn(`[结构] 案例 ${c.id} 的段落 label 有重复：${labels.join('、')}`);
    }
  }
}

for (const b of bundles) {
  for (const pid of b.products) {
    if (!productIds.has(pid)) err(`[结构] 方案组合 "${b.name}" 引用了不存在的产品 "${pid}"`);
  }
}

/**
 * 选型器字段校验。
 *
 * 这一段的重点是「静默失败」：选型器读的是 tags/areaMin/areaMax，
 * 而这些字段是人手写进 JSON 的。写错一个标签名不会报任何错 ——
 * 那个方案只是永远匹配不到，页面照常渲染，用户照常看到少一个方案。
 * 所以必须由 doctor 主动比对枚举。
 *
 * 「任意两个标签的结果集不得相同」这条断言放在 motion-check 里，
 * 因为它需要跑匹配逻辑；doctor 只负责比对数据本身。
 */
{
  const { TAGS } = await import('../src/data/bundleMatch.ts');
  const tagSet = new Set(TAGS);

  const usedTags = new Set();
  // 有标签非法时不能再说「全部合法」—— 否则报错和通过提示会同时出现
  let anyInvalidTag = false;
  let areaBoundsBroken = false;

  for (const b of bundles) {
    const where = `方案组合 "${b.name}"（${b.id}）`;

    if (!Array.isArray(b.tags) || b.tags.length === 0) {
      err(`[选型器] ${where} 缺少 tags —— 需求筛选永远匹配不到它`);
      anyInvalidTag = true;
    } else {
      for (const t of b.tags) {
        if (!tagSet.has(t)) {
          err(
            `[选型器] ${where} 的标签 "${t}" 不在 TAGS 里：\n` +
              `         合法取值：${TAGS.join('、')}`
          );
          anyInvalidTag = true;
        } else {
          usedTags.add(t);
        }
      }
    }

    for (const key of ['areaMin', 'areaMax']) {
      const v = b[key];
      if (v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < 0)) {
        err(`[选型器] ${where} 的 ${key} 必须是 null 或非负数字，实际是 ${JSON.stringify(v)}`);
        areaBoundsBroken = true;
      }
    }
    if (
      typeof b.areaMin === 'number' &&
      typeof b.areaMax === 'number' &&
      b.areaMin > b.areaMax
    ) {
      err(`[选型器] ${where} 面积区间反了：areaMin ${b.areaMin} > areaMax ${b.areaMax}`);
      areaBoundsBroken = true;
    }
  }

  // 反方向：UI 上摆了选项，却没有任何方案用它 —— 点了必然 0 结果
  const deadTags = TAGS.filter((t) => !usedTags.has(t));
  if (deadTags.length) {
    warn(
      `[选型器] 这些需求选项没有任何方案使用，用户点了一定是 0 结果：${deadTags.join('、')}`
    );
  }
  if (!deadTags.length && !anyInvalidTag && !areaBoundsBroken) {
    note(`[选型器] ${bundles.length} 个方案的标签全部合法，且 ${TAGS.length} 个选项都有方案命中 ✓`);
  }
}

// ============ B. 名称漂移 ============

const canonicalName = new Map(products.map((x) => [x.id, x.name]));

/** 断言某来源里的产品名与事实源一致 */
function checkNames(sourceLabel, pairs, severity = 'error') {
  for (const { id, name } of pairs) {
    if (!canonicalName.has(id)) {
      if (severity === 'error') err(`[漂移] ${sourceLabel} 出现未知产品 id "${id}"`);
      continue;
    }
    const expected = canonicalName.get(id);
    if (name !== expected) {
      const msg = `[漂移] ${sourceLabel} 中 ${id} 名称不一致\n         事实源: ${expected}\n         ${sourceLabel}: ${name}`;
      if (severity === 'error') err(msg);
      else warn(msg);
    }
  }
}

/**
 * 把某个数据区块按 id 切成条目分段。
 * endMarker 用于界定区块结尾 —— 否则"最后一个产品"的分段会一直吃到文件末尾，
 * 把后面的 FAQ、其他组件的文案都算成它的内容（曾因此误报 a19 有 3m 拾音半径）。
 */
function buildSegments(src, idRe, endMarker) {
  if (!src) return [];
  const marks = [...src.matchAll(idRe)].map((m) => ({ id: m[1], index: m.index }));
  if (!marks.length) return [];
  const regionEnd = src.indexOf(endMarker, marks[0].index);
  const fallback = regionEnd === -1 ? src.length : regionEnd;
  return marks.map((mark, i) => ({
    id: mark.id,
    body: src.slice(mark.index, i + 1 < marks.length ? marks[i + 1].index : fallback),
  }));
}

// 产品详情页
const detailSrc = readText('src/pages/ProductDetailPage.tsx');
if (detailSrc) {
  const pairs = [...detailSrc.matchAll(/id:\s*'(a\d+)',\s*\n\s*name:\s*'([^']+)'/g)].map((m) => ({
    id: m[1],
    name: m[2],
  }));
  checkNames('ProductDetailPage.tsx', pairs);
  const detailIds = new Set(pairs.map((x) => x.id));
  for (const id of productIds) {
    if (!detailIds.has(id)) err(`[漂移] 事实源有 ${id}，但 ProductDetailPage.tsx 没有对应详情数据`);
  }
}

// 站内搜索索引
//
// Navigation.tsx 里的 name 原本是手抄的（doctor 用正则比对，且只 warn）。
// 现在 name 直接从 PRODUCTS / CASES 取，名称漂移在结构上不可能发生 ——
// 于是这一段改查真正的失效模式：**漏写搜索文本**。
// 漏了不会报错，那条产品/案例只是从站内搜索里静默消失。
const navSrc = readText('src/components/Navigation.tsx');
if (navSrc) {
  /** 取出某个 Record 常量的 key 集合 */
  const searchTextIds = (constName) => {
    // 用词边界而不是裸 indexOf：`const PRODUCT_SEARCH_TEXT` 是
    // `const PRODUCT_SEARCH_TEXT_X` 的前缀，裸 indexOf 会认错常量
    const decl = new RegExp(`const\\s+${constName}\\b`);
    const m = decl.exec(navSrc);
    if (!m) return null;
    const open = navSrc.indexOf('{', m.index);
    const close = navSrc.indexOf('\n};', open);
    if (open < 0 || close < 0) return null;
    const body = navSrc.slice(open, close);
    return new Set([...body.matchAll(/^\s{2}([a-z]\d+):\s*\{/gm)].map((x) => x[1]));
  };

  const navProdIds = searchTextIds('PRODUCT_SEARCH_TEXT');
  const navCaseIds = searchTextIds('CASE_SEARCH_TEXT');

  if (!navProdIds || !navCaseIds) {
    err(
      '[漂移] Navigation.tsx 里找不到 PRODUCT_SEARCH_TEXT / CASE_SEARCH_TEXT ——' +
        ' 搜索索引结构变了，doctor 的覆盖率检查已失效，请同步更新'
    );
  } else {
    const missingProd = [...productIds].filter((id) => !navProdIds.has(id));
    const extraProd = [...navProdIds].filter((id) => !productIds.has(id));
    const missingCase = [...caseIds].filter((id) => !navCaseIds.has(id));
    const extraCase = [...navCaseIds].filter((id) => !caseIds.has(id));

    if (missingProd.length) {
      err(
        `[漂移] 这些产品没有搜索文本，站内搜索里搜不到：${missingProd.join('、')}\n` +
          `         请在 Navigation.tsx 的 PRODUCT_SEARCH_TEXT 里补一条`
      );
    }
    if (missingCase.length) {
      err(
        `[漂移] 这些案例没有搜索文本，站内搜索里搜不到：${missingCase.join('、')}\n` +
          `         请在 Navigation.tsx 的 CASE_SEARCH_TEXT 里补一条`
      );
    }
    if (extraProd.length) {
      err(`[漂移] Navigation.tsx 的 PRODUCT_SEARCH_TEXT 有未知产品 id：${extraProd.join('、')}`);
    }
    if (extraCase.length) {
      err(`[漂移] Navigation.tsx 的 CASE_SEARCH_TEXT 有未知案例 id：${extraCase.join('、')}`);
    }
    if (!missingProd.length && !missingCase.length && !extraProd.length && !extraCase.length) {
      note(
        `[漂移] 站内搜索覆盖全部 ${productIds.size} 个产品与 ${caseIds.size} 个案例，` +
          `且名称直接取自事实源（不可能漂移）✓`
      );
    }
  }
}

// index.html 的 ItemList
const indexHtml = readText('index.html');
if (indexHtml) {
  const blocks = indexHtml.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
  const itemListBlock = blocks.find((b) => b.includes('"@type": "ItemList"'));
  if (!itemListBlock) {
    warn('[漂移] index.html 中未找到 ItemList 结构化数据');
  } else {
    const json = JSON.parse(itemListBlock.replace(/<\/?script[^>]*>/g, ''));
    const idsInHtml = (json.itemListElement || [])
      .map((el) => (el.url || '').split('/product/')[1])
      .filter(Boolean);
    const missing = [...productIds].filter((id) => !idsInHtml.includes(id));
    const extra = idsInHtml.filter((id) => !productIds.has(id));
    if (missing.length) {
      warn(
        `[漂移] index.html 的 ItemList 缺少 ${missing.length} 个产品：${missing.join(', ')}\n` +
          `         （构建时 prerender.js 会自动回填为全部 ${products.length} 个，源码层面同步更好）`
      );
    }
    if (extra.length) warn(`[漂移] index.html 的 ItemList 含未知产品：${extra.join(', ')}`);
    if (json.numberOfItems !== products.length) {
      note(
        `[漂移] index.html 的 numberOfItems=${json.numberOfItems}，事实源为 ${products.length}（构建后会回填）`
      );
    }
  }

  // Organization logo 必须指向真实存在的文件
  const logoMatch = indexHtml.match(/"logo":\s*"([^"]+)"/);
  if (logoMatch) {
    const logoPath = logoMatch[1].replace(site.url, '');
    const logoAbs = p('public', logoPath.replace(/^\//, ''));
    if (!fs.existsSync(logoAbs)) {
      err(
        `[漂移] index.html 的 Organization logo 指向 ${logoMatch[1]}，但 public${logoPath} 不存在（会导致品牌 logo 404）`
      );
    }
  }
}

// ============ C. 数值漂移 ============

/**
 * 只比较"首个数字"，避免"24 个可配拾音区"对比"24 个（…），4 种波束类型"这类
 * 合理的信息量差异造成误报。
 */
const firstNumber = (s) => {
  const m = String(s).match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
};

const SPEC_ALIASES = [
  ['尺寸重量', '产品尺寸'],
  ['麦克风阵列', '麦克风类型'],
  ['可配拾音区', '可配拾音区'],
  ['供电', '供电方式'],
  ['光圈', '光圈'],
];

if (detailSrc) {
  const segments = buildSegments(detailSrc, /id:\s*'(a\d+)',\s*\n\s*name:/g, '\n};');

  for (const seg of segments) {
    const prod = products.find((x) => x.id === seg.id);
    if (!prod) continue;
    const detailSpecs = new Map(
      [...seg.body.matchAll(/\{\s*name:\s*'([^']+)',\s*value:\s*'([^']*)'\s*\}/g)].map((m) => [
        m[1],
        m[2],
      ])
    );

    for (const [catalogLabel, detailLabel] of SPEC_ALIASES) {
      const catSpec = prod.keySpecs.find((s) => s.label === catalogLabel);
      const detailValue = detailSpecs.get(detailLabel);
      if (!catSpec || !detailValue) continue;

      // 只取事实源里分号/逗号前的第一段，避免把重量等附加信息一起比
      const catFirst = String(catSpec.value).split(/[；，,]/)[0];
      const a = firstNumber(catFirst);
      const b = firstNumber(detailValue);
      if (a !== null && b !== null && a !== b) {
        err(
          `[数值] ${prod.id} ${prod.model} 的「${catalogLabel}」不一致\n` +
            `         事实源 products.json: ${catSpec.value}\n` +
            `         详情页 ProductDetailPage.tsx: ${detailValue}`
        );
      }
    }
  }
}

// ── 彩页对应关系：详情页实际给出的 PDF 必须与事实源一致 ──
// 这条是真出过事的：D1 的「下载产品彩页」曾经指向 MT100 的规格书。
// 原因：事实源修好了，但详情页维护着自己的导入表，没人同步它。
// 所以光检查「事实源里的文件存在」不够 —— 必须检查**消费者实际用的是哪个文件**。
{
  const detailPdfSrc = readText('src/pages/ProductDetailPage.tsx');
  if (detailPdfSrc) {
    const varToFile = new Map();
    for (const m of detailPdfSrc.matchAll(
      /import\s+(\w+)\s+from\s+'\.\.\/assets\/pdf\/([^']+)'/g
    )) {
      varToFile.set(m[1], m[2]);
    }

    const segments = buildSegments(detailPdfSrc, /id:\s*'(a\d+)',\s*\n\s*name:/g, '\n};');
    for (const seg of segments) {
      const prod = products.find((x) => x.id === seg.id);
      if (!prod) continue;
      const m = /brochureUrl:\s*(\w+)/.exec(seg.body);
      if (!m) {
        err(`[彩页] ProductDetailPage.tsx 的 ${seg.id} ${prod.model} 没有配置 brochureUrl`);
        continue;
      }
      const file = varToFile.get(m[1]);
      if (!file) {
        err(`[彩页] ${seg.id} 的 brochureUrl 指向 ${m[1]}，但找不到对应的 import`);
        continue;
      }
      if (file !== prod.pdf) {
        err(
          `[彩页] ${seg.id} ${prod.model} 的下载彩页与事实源不一致\n` +
            `         事实源 products.json: ${prod.pdf}\n` +
            `         详情页实际指向:      ${file}`
        );
      }
    }
    if (!errors.some((e) => e.includes('[彩页]'))) {
      note(`[彩页] ${segments.length} 个产品页的下载彩页与事实源一致 ✓`);
    }
  }
}

// ============ D. 临界事实护栏 ============

/**
 * 为什么专门查"拾音半径"：
 * aiService 曾经把 MA600D 写成"6m 拾音半径"，丢掉了"现场扩声 3m"的前提，
 * 而官网和彩页都是 3m 起。这类参数一旦说错，会直接导致客户选型事故。
 *
 * 规则：把详情页 FAQ 与站内搜索全文里出现的所有拾音半径数字收集起来，
 * 要求事实源里"半径"类规格覆盖全部数字。只报"外部有、事实源漏"的情况，
 * 避免对 MC10 这类单值参数产生误报。
 */
/**
 * 匹配"数字 + m/米"，并排除 mm / ms / mAh 这些同前缀单位。
 */
const RADIUS_NUM = /(\d+(?:\.\d+)?)\s*(?:m(?!m|s|A|a)|米)/g;

/**
 * 从外部文案里取拾音半径数字。
 * 只在**包含"半径"二字的短句**内取值，否则 "延迟25ms"、"1500mAh" 都会被误判成半径。
 */
function radiusNumbers(text) {
  const out = new Set();
  for (const clause of String(text).split(/[。；;，,、\n]/)) {
    if (!/半径/.test(clause)) continue;
    for (const m of clause.matchAll(RADIUS_NUM)) out.add(Number(m[1]));
  }
  return out;
}

/** 事实源里"半径"类规格的取值：标签本身含"半径"，直接取数字 */
function radiusNumbersFromSpecValue(value) {
  const out = new Set();
  for (const m of String(value).matchAll(RADIUS_NUM)) out.add(Number(m[1]));
  return out;
}

if (detailSrc) {
  const detailSegments = buildSegments(detailSrc, /id:\s*'(a\d+)',\s*\n\s*name:/g, '\n};');
  const navSegments = buildSegments(navSrc, /id:\s*'(a\d+)',\s*name:/g, '\n];');

  for (const seg of detailSegments) {
    const prod = products.find((x) => x.id === seg.id);
    if (!prod) continue;

    // 外部来源：详情页 FAQ 答案 + 搜索索引全文
    const external = radiusNumbers(
      [...seg.body.matchAll(/answer:\s*'([^']*)'/g)].map((m) => m[1]).join(' ')
    );
    const navSeg = navSegments.find((s) => s.id === seg.id);
    if (navSeg) {
      for (const n of radiusNumbers(navSeg.body)) external.add(n);
    }

    // 事实源里所有"半径"类规格覆盖的数字
    const covered = new Set();
    for (const spec of prod.keySpecs) {
      if (/半径/.test(spec.label)) {
        for (const n of radiusNumbersFromSpecValue(spec.value)) covered.add(n);
      }
    }

    for (const n of external) {
      if (!covered.has(n)) {
        err(
          `[护栏] ${prod.id} ${prod.model}：详情页/搜索索引里出现「${n}m 拾音半径」，` +
            `但事实源 products.json 的半径类规格未覆盖该数值。\n` +
            `         事实源已有：${[...covered].map((x) => x + 'm').join('、') || '(无)'}\n` +
            `         请补全并写清适用前提（现场扩声 / 纯录音·远程通话）`
        );
      }
    }
  }
}

// 联系方式必须真的出现在**页面上**，而不是只躺在数据文件里。
// 注意别写成"检查某个文件的源码里有没有这串数字"——那样一旦文案被搬到
// faq.json 之类的数据文件，检查就会误报（本检查曾经就这么错过一次）。
{
  const surfaces = [
    ['Home.tsx（页脚）', readText('src/pages/Home.tsx')],
    ['AiChatWidget.tsx（聊天窗）', readText('src/components/AiChatWidget/AiChatWidget.tsx')],
    ['index.html（noscript 正文）', readText('dist/index.html')],
  ].filter(([, t]) => t);

  if (site.phone && !surfaces.some(([, t]) => t.includes(site.phone))) {
    warn(
      `[护栏] 联系电话 ${site.phone} 未出现在任何面向访客的界面上` +
        `（检查过：${surfaces.map(([n]) => n).join('、')}）`
    );
  }
  if (site.email && !surfaces.some(([, t]) => t.includes(site.email))) {
    warn(`[护栏] 邮箱 ${site.email} 未出现在任何面向访客的界面上`);
  }
}

// ============ E. 产物校验 ============

const distDir = p('dist');
if (fs.existsSync(distDir)) {
  const missingOg = [];
  for (const prod of products) {
    const file = path.join(distDir, 'product', `${prod.id}.html`);
    if (!fs.existsSync(file)) {
      missingOg.push(`${prod.id}: 预渲染文件不存在`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf-8');
    const og = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!og) {
      missingOg.push(`${prod.id}: 缺少 og:image`);
      continue;
    }
    const assetPath = og[1].replace(site.url, '');
    if (!fs.existsSync(path.join(distDir, assetPath.replace(/^\//, '')))) {
      missingOg.push(`${prod.id}: og:image 指向的文件不存在 → ${og[1]}`);
    }
  }
  if (missingOg.length) {
    err(`[产物] ${missingOg.length} 个产品页的 og:image 有问题：\n` + missingOg.map((m) => `         ${m}`).join('\n'));
  } else {
    note(`[产物] ${products.length} 个产品页的 og:image 全部指向真实存在的打包文件 ✓`);
  }

  // 案例页：预渲染标题必须与客户端 SeoHead 同源，且正文真的进了 noscript
  const caseProblems = [];
  for (const c of cases) {
    const d = caseDetailById.get(c.id);
    if (!d) continue; // 已在结构检查里报过
    const file = path.join(distDir, 'case', `${c.id}.html`);
    if (!fs.existsSync(file)) {
      caseProblems.push(`${c.id}: 预渲染文件不存在`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf-8');
    // 客户端 SeoHead 输出 `${title} - ${SITE_NAME}`
    const expected = `${d.detailTitle} - ${site.name}`;
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    const actual = titleMatch ? titleMatch[1] : '';
    if (actual !== expected) {
      caseProblems.push(`${c.id}: title 不一致\n         预渲染: ${actual}\n         客户端: ${expected}`);
    }
    if (!html.includes(`<h1>${escapeHtml(d.detailTitle)}</h1>`)) {
      caseProblems.push(`${c.id}: noscript 里没有 detailTitle 的 h1`);
    }
    const missing = d.sections.filter(
      (s) => !html.includes(escapeHtml(s.content).slice(0, 24))
    );
    if (missing.length) {
      caseProblems.push(`${c.id}: noscript 缺少 ${missing.length} 段正文（${missing.map((s) => s.label).join('、')}）`);
    }
    const og = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!og) {
      caseProblems.push(`${c.id}: 缺少 og:image`);
    } else {
      const assetPath = og[1].replace(site.url, '');
      if (!fs.existsSync(path.join(distDir, assetPath.replace(/^\//, '')))) {
        caseProblems.push(`${c.id}: og:image 指向的文件不存在 → ${og[1]}`);
      }
    }
  }
  if (caseProblems.length) {
    err(
      `[产物] ${caseProblems.length} 个案例页有问题（预渲染与客户端必须同源）：\n` +
        caseProblems.map((m) => `         ${m}`).join('\n')
    );
  } else {
    const totalSections = caseDetails.reduce((a, d) => a + d.sections.length, 0);
    note(
      `[产物] ${cases.length} 个案例页的 title 与客户端一致、og:image 存在，` +
        `且 ${totalSections} 段正文都进了 noscript ✓`
    );
  }

  // 首页 ItemList
  const distIndex = path.join(distDir, 'index.html');
  if (fs.existsSync(distIndex)) {
    const html = fs.readFileSync(distIndex, 'utf-8');
    const blocks = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
    const il = blocks.find((b) => b.includes('"@type": "ItemList"'));
    if (il) {
      const json = JSON.parse(il.replace(/<\/?script[^>]*>/g, ''));
      if (json.numberOfItems !== products.length) {
        err(`[产物] dist/index.html 的 ItemList numberOfItems=${json.numberOfItems}，应为 ${products.length}`);
      }
    }
  }

  // 密钥泄露兜底检查
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const leaked = fs
      .readdirSync(assetsDir)
      .filter((f) => f.endsWith('.js'))
      .filter((f) => /sk-[a-z]{40,}/.test(fs.readFileSync(path.join(assetsDir, f), 'utf-8')));
    if (leaked.length) {
      err(
        `[安全] 打包产物中发现明文 API Key！涉及：${leaked.join(', ')}\n` +
          `         请检查环境变量是否误用了 VITE_ 前缀`
      );
    } else {
      note('[安全] 打包产物中未发现明文 API Key ✓');
    }
  }
} else {
  note('[产物] dist/ 不存在，跳过产物校验（先跑 pnpm build）');
}

// ============ F. 样式与前端产物 ============

/** 品牌色的唯一字面量来源是 src/index.css；其余地方必须用 var(--warm-*) */
const TOKEN_HEX = {
  '#faf9f5': '--warm-canvas / --warm-on-dark',
  '#cc785c': '--warm-primary',
  '#a9583e': '--warm-primary-active',
  '#141413': '--warm-ink',
  '#3d3d3a': '--warm-body',
  '#6c6a64': '--warm-muted',
  '#e6dfd8': '--warm-hairline',
  '#efe9de': '--warm-surface',
  '#181715': '--warm-surface-dark',
  '#a09d96': '--warm-on-dark-soft',
  '#f4efe6': '--warm-card-hover',
};

{
  const srcFiles = [];
  const walkSrc = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walkSrc(full);
      else if (/\.(tsx?|css)$/.test(e.name)) srcFiles.push(full);
    }
  };
  walkSrc(p('src'));

  const offenders = [];
  for (const file of srcFiles) {
    if (file.endsWith('index.css')) continue; // 字面量来源，允许
    const text = fs.readFileSync(file, 'utf-8');
    for (const hex of Object.keys(TOKEN_HEX)) {
      const n = (text.match(new RegExp(hex, 'gi')) || []).length;
      if (n) {
        offenders.push(
          `${path.relative(ROOT, file)}: ${hex}（应为 ${TOKEN_HEX[hex]}）× ${n}`
        );
      }
    }
  }
  if (offenders.length) {
    err(
      `[样式] 品牌色被硬编码在 src/index.css 之外，改品牌色会漏改：\n` +
        offenders.map((o) => `         ${o}`).join('\n') +
        `\n         请改用 var(--warm-*) 或对应的 Tailwind 类`
    );
  } else {
    note('[样式] 品牌色字面量只存在于 src/index.css ✓');
  }
}

// 孤儿资源：src/assets/images 下没有任何引用的文件
{
  const imgDir = p('src/assets/images');
  if (fs.existsSync(imgDir)) {
    /**
     * 收集引用来源。
     * **必须排除 src/data/imageVariants.json** —— 它是从图片文件生成的清单，
     * 天然包含每个文件名；把它算进来会让所有图都判为「在用」，永远报不出孤儿。
     * （这个检查的第一版就是这么错的，直到 hero-bg.webp 真的变成孤儿才发现。）
     */
    const sources = [];
    const walkSrc2 = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (full === imgDir) continue;
          walkSrc2(full);
        } else if (
          /\.(tsx?|js|json|css|html)$/.test(e.name) &&
          e.name !== 'imageVariants.json'
        ) {
          sources.push(fs.readFileSync(full, 'utf-8'));
        }
      }
    };
    walkSrc2(p('src'));
    for (const f of ['index.html', 'prerender.js', 'sitemap-generator.js']) {
      const full = p(f);
      if (fs.existsSync(full)) sources.push(fs.readFileSync(full, 'utf-8'));
    }
    const blob = sources.join('\n');

    const orphans = fs
      .readdirSync(imgDir)
      .filter((f) => /\.(webp|png|jpe?g|svg)$/.test(f))
      .filter((f) => !blob.includes(f.replace(/\.[^.]+$/, '')));

    if (orphans.length) {
      let bytes = 0;
      for (const o of orphans) bytes += fs.statSync(path.join(imgDir, o)).size;
      warn(
        `[资源] src/assets/images 下有 ${orphans.length} 个未被任何源码引用的文件` +
          `（合计 ${Math.round(bytes / 1024)} KB）：\n` +
          orphans.map((o) => `         ${o}`).join('\n') +
          '\n         它们仍会计入仓库体积。确认无用后删除。'
      );
    } else {
      note('[资源] 图片目录没有孤儿文件 ✓');
    }
  }
}

/**
 * 图片管线：源图上限 + 卡片变体覆盖。
 *
 * 这两件事都是「改了图但忘了跑脚本」才会坏，而坏了以后没有任何可见症状 ——
 * 站照常开，只是访客默默多下了几百 KB。所以必须由 doctor 主动发现：
 *   A. 源图超过 MAX_EDGE → 有人直接丢了一张 4000px 的原图进来
 *   B. 卡片图没有 CARD_WIDTH 变体 → products.json/cases.json 加了新图但没跑 gen:images
 */
{
  const genDir = p('src/assets/images/gen');
  const manifestPath = p('src/data/imageVariants.json');
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    : {};

  // A. 源图是否仍在尺寸上限内
  if (fs.existsSync(imageDir)) {
    const oversized = [];
    for (const f of fs.readdirSync(imageDir).filter((x) => x.endsWith('.webp'))) {
      const dim = webpSize(fs.readFileSync(path.join(imageDir, f)));
      if (!dim) {
        warn(`[图片] ${f} 不是可解析的 WebP，浏览器可能无法解码`);
        continue;
      }
      if (Math.max(dim.w, dim.h) > MAX_EDGE) {
        oversized.push(`${f}（${dim.w}×${dim.h}）`);
      }
    }
    if (oversized.length) {
      warn(
        `[图片] ${oversized.length} 张源图超过 ${MAX_EDGE}px 上限，跑 pnpm optimize:images 可无损缩小：\n` +
          oversized.map((o) => `         ${o}`).join('\n')
      );
    } else {
      note(`[图片] 源图全部在 ${MAX_EDGE}px 上限内 ✓`);
    }
  }

  // B. 卡片图是否都有小尺寸变体
  //
  // 判定前提很重要：gen-image-variants.mjs 只给「比 CARD_WIDTH 还宽」的图生成变体，
  // 源图本身就不大于 640px 时会刻意跳过（缩放只会更糊）。第一版检查漏了这个前提，
  // 于是 a1-1（626px）和 e8-1（349px）被误报成「缺少变体」。
  // 真正要抓的失败模式是：新加了一张大图，却忘了跑 pnpm gen:images。
  const cardKeys = [...products.map((x) => x.cardImage), ...cases.map((x) => x.cardImage)];
  const missing = [];
  for (const key of cardKeys) {
    const srcPath = path.join(imageDir, `${key}.webp`);
    if (!fs.existsSync(srcPath)) continue; // 图不存在由 A 段校验负责
    const dim = webpSize(fs.readFileSync(srcPath));
    if (!dim || dim.w <= CARD_WIDTH) continue;
    const hasEntry = Object.prototype.hasOwnProperty.call(manifest, key);
    const hasFile = fs.existsSync(path.join(genDir, `${key}.${CARD_WIDTH}.webp`));
    if (!hasEntry || !hasFile) missing.push(`${key}（源图 ${dim.w}px）`);
  }
  if (missing.length) {
    warn(
      `[图片] ${missing.length} 张卡片图缺少 ${CARD_WIDTH}px 变体，访客会下载原图（跑 pnpm gen:images 修复）：\n` +
        missing.map((k) => `         ${k}`).join('\n')
    );
  } else if (cardKeys.length) {
    const needVariant = cardKeys.filter((k) => {
      const srcPath = path.join(imageDir, `${k}.webp`);
      if (!fs.existsSync(srcPath)) return false;
      const dim = webpSize(fs.readFileSync(srcPath));
      return dim && dim.w > CARD_WIDTH;
    }).length;
    note(
      `[图片] ${cardKeys.length} 张卡片图变体齐全 ✓（其中 ${needVariant} 张需要变体，` +
        `${cardKeys.length - needVariant} 张源图本身 ≤${CARD_WIDTH}px）`
    );
  }
}

{
  const dist = p('dist');
  if (fs.existsSync(dist)) {
    const idx = path.join(dist, 'index.html');
    if (fs.existsSync(idx)) {
      const html = fs.readFileSync(idx, 'utf-8');
      if (!html.includes('<noscript>')) {
        err(
          '[产物] dist/index.html 缺少 noscript 正文 —— 本站 robots.txt 明确允许 GPTBot/PerplexityBot/Claude-Web，\n' +
            '         而它们不执行 JS，会看到一个空白首页'
        );
      } else {
        note('[产物] dist/index.html 含 noscript 正文（供不执行 JS 的爬虫）✓');
      }
    }

    const faq = path.join(dist, 'faq.html');
    if (!fs.existsSync(faq)) {
      err(
        '[产物] dist/faq.html 不存在 —— sitemap 里有 /faq，但 nginx 的 try_files 会把它回退到首页 HTML，\n' +
          '         导致 /faq 的 title/description 与首页重复'
      );
    } else {
      const html = fs.readFileSync(faq, 'utf-8');
      if (!html.includes('FAQPage')) {
        err('[产物] dist/faq.html 缺少 FAQPage 结构化数据');
      } else {
        note('[产物] dist/faq.html 存在，含独立 title 与 FAQPage 结构化数据 ✓');
      }
    }
  }
}

// ============ 输出 ============

console.log('─'.repeat(70));
if (notes.length) {
  console.log(`\n提示 (${notes.length})：`);
  notes.forEach((m) => console.log(`  · ${m}`));
}
if (warnings.length) {
  console.log(`\n警告 (${warnings.length})：`);
  warnings.forEach((m) => console.log(`  ! ${m}`));
}
if (errors.length) {
  console.log(`\n错误 (${errors.length})：`);
  errors.forEach((m) => console.log(`  ✗ ${m}`));
}

console.log('\n' + '─'.repeat(70));
// 用 process.exitCode 而非 process.exit()：本脚本会 await import 一个 .ts 模块
// （选型器枚举），Windows 上在 loader 句柄未关闭时调用 process.exit() 会触发
// libuv 断言并以 -1073740791 结束，导致 pnpm verify 误判失败。详见 motion-check.mjs。
if (errors.length === 0) {
  console.log(`体检通过：${errors.length} 错误 / ${warnings.length} 警告 / ${notes.length} 提示\n`);
  process.exitCode = 0;
} else {
  console.log(`体检未通过：${errors.length} 错误 / ${warnings.length} 警告\n`);
  process.exitCode = 1;
}
