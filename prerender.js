/**
 * 构建后脚本：为每个产品/案例页面生成静态 HTML 预渲染文件
 * 输出扁平文件：dist/product/a1.html（而非 dist/product/a1/index.html）
 * 避免 Nginx 301 重定向加尾部斜杠导致 URL 与 React Router 不一致
 *
 * 数据来源：src/data/products.json 与 src/data/cases.json（单一事实源）。
 *
 * 本次修订：
 *  1. 产品/案例数据改从单一事实源读取，不再在脚本里手抄一份。
 *  2. og:image / Product schema image 通过 Vite manifest 解析成**打包后的哈希文件名**。
 *     旧版写死 /assets/a1-1.webp，而 Vite 产物是 /assets/a1-1-BXr3magi.webp，
 *     导致全部产品页的分享预览图与结构化数据图片 404。图片主图统一取 cardImage。
 *  3. 顺带把 dist/index.html 里手写的 ItemList 结构化数据替换为按事实源生成，
 *     修掉"只列 10 个产品、缺 MC04/MK300/D1/BYOM"的问题。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');

// ============ 读取单一事实源 ============

function readData(fileName) {
  const filePath = path.resolve(__dirname, 'src/data', fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`[Prerender] ERROR: 找不到数据文件 ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const { site: SITE, products, bundles } = readData('products.json');
const { cases } = readData('cases.json');
const { details: caseDetails } = readData('caseDetails.json');

/**
 * 案例的卡片级与详情级数据分两个文件存（详情正文不该进首页 bundle）。
 * 预渲染需要两边，这里按 id 合并一次；doctor 会校验两个文件 id 集合一致。
 */
const caseDetailById = new Map(caseDetails.map((d) => [d.id, d]));
for (const c of cases) {
  const d = caseDetailById.get(c.id);
  if (!d) {
    console.error(`[Prerender] ERROR: cases.json 的 ${c.id} 在 caseDetails.json 里没有对应详情`);
    process.exit(1);
  }
  Object.assign(c, d);
}
const { items: faqItems } = readData('faq.json');

// ============ 资源路径解析 ============

/**
 * 读取 Vite 生成的 manifest，把源码资源路径映射为打包后的带哈希路径。
 * manifest 在 dist/.vite/manifest.json（Vite 5+ 默认位置）。
 */
function loadManifest() {
  const manifestPath = path.join(distDir, '.vite', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.warn(
      '[Prerender] WARN: 未找到 dist/.vite/manifest.json。' +
        '请确认 vite.config.ts 中已开启 build.manifest。' +
        'og:image 将回退为未哈希路径（可能 404）。'
    );
    return {};
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

const manifest = loadManifest();

/** 图片 key（如 "a1-1"）→ 站点绝对 URL */
function imageUrl(key) {
  const entry = manifest[`src/assets/images/${key}.webp`];
  if (!entry) {
    console.warn(`[Prerender] WARN: manifest 中找不到图片 src/assets/images/${key}.webp`);
    return `${SITE.url}/assets/${key}.webp`;
  }
  return `${SITE.url}/${entry.file}`;
}

function extractBuiltAssets() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('[Prerender] ERROR: dist/index.html not found. Run `pnpm build:client` first.');
    process.exit(1);
  }
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  const jsMatch = indexHtml.match(/<script[^>]*\bsrc="([^"]+)"[^>]*>/);
  const cssMatch =
    indexHtml.match(/<link[^>]*\brel="stylesheet"[^>]*\bcrossorigin[^>]*\bhref="([^"]+)"[^>]*>/) ||
    indexHtml.match(/<link[^>]*\bhref="([^"]*\/assets\/index[^"]*\.css)"[^>]*>/);
  const iconMatch = indexHtml.match(/<link[^>]*\brel="icon"[^>]*\bhref="([^"]+)"[^>]*>/);

  if (!jsMatch) {
    console.error('[Prerender] ERROR: Could not find JS bundle in dist/index.html');
    process.exit(1);
  }

  const assets = {
    js: jsMatch[1],
    css: cssMatch ? cssMatch[1] : '',
    icon: iconMatch ? iconMatch[1] : '',
  };
  console.log(`[Prerender] Built assets: JS=${assets.js}, CSS=${assets.css || '(none)'}`);
  return assets;
}

function assetTags(assets) {
  const iconTag = assets.icon
    ? `  <link rel="icon" href="${assets.icon}" type="image/webp" />`
    : '';
  const cssTag = assets.css
    ? `  <link rel="stylesheet" crossorigin href="${assets.css}">`
    : '';
  return { iconTag, cssTag };
}

/** JSON-LD 字符串安全转义（避免引号截断脚本块） */
function ldJson(obj) {
  return JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');
}

// ============ 产品页 ============

function generateProductHTML(product, assets) {
  const { iconTag, cssTag } = assetTags(assets);
  const imageUrlFull = imageUrl(product.cardImage);
  const productUrl = `${SITE.url}/product/${product.id}`;
  const title = `${product.name} - ${SITE.name}`;

  const productSchema = ldJson({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seoDescription,
    image: imageUrlFull,
    sku: product.model,
    category: product.category,
    brand: { '@type': 'Brand', name: SITE.brandFull },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'CNY',
      seller: { '@type': 'Organization', name: SITE.legalName },
    },
    url: productUrl,
  });

  const breadcrumbSchema = ldJson({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: '产品', item: `${SITE.url}/#products` },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
    ],
  });

  const specList = product.keySpecs
    .map((s) => `      <li>${s.label}：${s.value}</li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${product.seoDescription}" />
  <meta name="keywords" content="${product.name},${product.model},${SITE.name},${SITE.brandFull},${SITE.brand},音视频解决方案,智能会议,Dante音频" />
  <link rel="canonical" href="${productUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${product.seoDescription}" />
  <meta property="og:url" content="${productUrl}" />
  <meta property="og:type" content="product" />
  <meta property="og:image" content="${imageUrlFull}" />
  <meta property="og:locale" content="zh_CN" />
  <meta name="robots" content="index, follow" />
${iconTag}
  <script type="application/ld+json">
${productSchema}
  </script>
  <script type="application/ld+json">
${breadcrumbSchema}
  </script>
${cssTag}
</head>
<body>
  <div id="root"></div>
  <noscript>
    <h1>${product.name}</h1>
    <p>${product.seoDescription}</p>
    <h2>关键规格</h2>
    <ul>
${specList}
    </ul>
    <p>如需了解更多产品信息，请联系我们：${SITE.email} | ${SITE.phone}</p>
    <p>请启用 JavaScript 以获得最佳浏览体验。</p>
  </noscript>
  <script type="module" crossorigin src="${assets.js}"></script>
</body>
</html>`;
}

// ============ 案例页 ============

/** HTML 文本转义：案例正文里出现过英文引号，未来也可能出现 < 或 & */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateCaseHTML(caseItem, assets) {
  const { iconTag, cssTag } = assetTags(assets);
  const caseUrl = `${SITE.url}/case/${caseItem.id}`;
  /**
   * title 必须与客户端 SeoHead 输出的一致。
   *
   * 此前这里用 cases.json 的 name（"中国香港科技大学"），而客户端详情页用的是
   * 它自己那份 caseData 里的 name（"行业案例分享 - 香港科技大学"）——
   * 同一个 URL 对不执行 JS 的爬虫（GPTBot / PerplexityBot 等，robots.txt 明确放行）
   * 和 Google 给出了两个不同的标题。现已合并数据源，两边都用 detailTitle。
   */
  const title = `${caseItem.detailTitle} - ${SITE.name}`;
  const imageUrlFull = imageUrl(caseItem.cardImage);

  const articleSchema = ldJson({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: caseItem.detailTitle,
    description: caseItem.seoDescription,
    image: imageUrlFull,
    articleSection: caseItem.category,
    about: caseItem.detailTag,
    inLanguage: 'zh-CN',
    publisher: { '@type': 'Organization', name: SITE.legalName },
    url: caseUrl,
  });

  const breadcrumbSchema = ldJson({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: '案例', item: `${SITE.url}/#cases` },
      { '@type': 'ListItem', position: 3, name: caseItem.detailTitle, item: caseUrl },
    ],
  });

  // 正文进 noscript：不执行 JS 的爬虫此前只看到一个标题加一句描述
  const sectionHtml = caseItem.sections
    .map((s) => `    <h2>${escapeHtml(s.label)}</h2>\n    <p>${escapeHtml(s.content)}</p>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(caseItem.seoDescription)}" />
  <link rel="canonical" href="${caseUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(caseItem.seoDescription)}" />
  <meta property="og:url" content="${caseUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="${imageUrlFull}" />
  <meta property="og:locale" content="zh_CN" />
  <meta name="robots" content="index, follow" />
${iconTag}
  <script type="application/ld+json">
${articleSchema}
  </script>
  <script type="application/ld+json">
${breadcrumbSchema}
  </script>
${cssTag}
</head>
<body>
  <div id="root"></div>
  <noscript>
    <h1>${escapeHtml(caseItem.detailTitle)}</h1>
    <p>${escapeHtml(caseItem.seoDescription)}</p>
${sectionHtml}
    <p>如需了解更多案例信息，请联系我们：${SITE.email} | ${SITE.phone}</p>
    <p>请启用 JavaScript 以获得最佳浏览体验。</p>
  </noscript>
  <script type="module" crossorigin src="${assets.js}"></script>
</body>
</html>`;
}

// ============ 404 ============

function generate404HTML(assets) {
  const { iconTag, cssTag } = assetTags(assets);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>页面不存在 - ${SITE.name}</title>
  <meta name="robots" content="noindex" />
  <meta http-equiv="refresh" content="3;url=/" />
${iconTag}
${cssTag}
</head>
<body>
  <div id="root"></div>
  <script type="module" crossorigin src="${assets.js}"></script>
</body>
</html>`;
}

// ============ 首页结构化数据回填 ============

/**
 * 把 dist/index.html 中手写的 ItemList JSON-LD 替换为按事实源生成的版本。
 * 首页没有做 SSR，这份静态 JSON-LD 是爬虫能拿到的唯一产品清单，必须完整。
 */
function patchIndexItemList(assets) {
  const indexPath = path.join(distDir, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE.name} - ${SITE.brandFull}${SITE.brand}智能会议产品`,
    description: `${SITE.name}代理${SITE.brandFull}${SITE.brand}全系列智能会议产品`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE.url}/product/${p.id}`,
    })),
  };

  const replacement = `<script type="application/ld+json">
${ldJson(itemList)}
    </script>`;

  const scriptRe = /<script type="application\/ld\+json">[\s\S]*?<\/script>/g;
  const blocks = html.match(scriptRe) || [];
  const target = blocks.find((b) => b.includes('"@type": "ItemList"'));

  if (!target) {
    console.warn('[Prerender] WARN: dist/index.html 中未找到 ItemList 结构化数据，跳过回填。');
    return;
  }

  fs.writeFileSync(indexPath, html.replace(target, replacement));
  console.log(
    `[Prerender] index.html ItemList 已回填：numberOfItems=${products.length}（含全部产品）`
  );
  void assets;
}

// ============ 首页正文（noscript）============

/**
 * 首页没有做 SSR，React 挂载前 <div id="root"> 是空的。
 *
 * 对**不执行 JS 的爬虫**来说整个首页就是一片空白 —— 而本站 robots.txt 明确
 * 允许 GPTBot / PerplexityBot / Claude-Web，也就是主动邀请了它们来抓。
 * 这里把真实正文写进 <noscript>：浏览器在 JS 开启时不显示它，
 * 爬虫读原始 HTML 时能拿到全部文字。
 *
 * 说明：这是「静态内容注入」，不是真 SSR（React 仍用 createRoot 而非 hydrateRoot）。
 * 真 SSR 需要引入 esbuild + react-dom/server 的构建链，是另一个量级的改动，
 * 收益（首屏可见内容）与本方案（可索引内容）不同，这里先取后者。
 */
function homeNoscript() {
  const productItems = products
    .map((p) => `      <li><a href="${SITE.url}/product/${p.id}">${p.name}</a>：${p.cardDesc}</li>`)
    .join('\n');

  const caseItems = cases
    .map((c) => `      <li>${c.name}（${c.tag}）—— ${c.seoDescription}</li>`)
    .join('\n');

  const bundleItems = bundles
    .map((b) => `      <li>${b.name}（${b.condition}）：${b.note}</li>`)
    .join('\n');

  return `  <noscript>
    <h1>智能音视频，重新定义会议体验</h1>
    <p>${SITE.legalName}专注于音视频系统集成、会议室智能控制、视频会议系统、音频处理，主营${SITE.brandFull}（${SITE.brand}）全系列音视频产品，服务高校、企业、政府、酒店客户。</p>

    <h2>产品系列（共 ${products.length} 款）</h2>
    <ul>
${productItems}
    </ul>

    <h2>工程案例（共 ${cases.length} 个）</h2>
    <ul>
${caseItems}
    </ul>

    <h2>方案组合参考</h2>
    <ul>
${bundleItems}
    </ul>

    <h2>联系我们</h2>
    <p>邮箱：${SITE.email}　电话：${SITE.phone}</p>
    <p><a href="${SITE.url}/faq">常见问题 FAQ</a></p>
    <p>请启用 JavaScript 以获得完整交互体验。</p>
  </noscript>
`;
}

function injectHomeNoscript() {
  const indexPath = path.join(distDir, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');

  if (html.includes('</noscript>')) {
    console.log('[Prerender] index.html 已有 noscript 正文，跳过注入。');
    return;
  }

  const rootRe = /<div id="root"><\/div>/;
  if (!rootRe.test(html)) {
    console.warn('[Prerender] WARN: index.html 中未找到 <div id="root"></div>，跳过正文注入。');
    return;
  }

  fs.writeFileSync(indexPath, html.replace(rootRe, `${homeNoscript()}    <div id="root"></div>`));
  console.log(
    `[Prerender] index.html 已注入 noscript 正文：${products.length} 产品 / ${cases.length} 案例 / ${bundles.length} 方案组合`
  );
}

// ============ FAQ 页 ============

/**
 * 生成真实的 dist/faq.html。
 * 此前 /faq 只在 sitemap 里存在、却没有对应文件，nginx 会把它回退到 index.html，
 * 于是 /faq 的 title/description 与首页完全重复。
 *
 * ⚠️ 要让这个文件真的被送出，nginx 必须写 `try_files $uri $uri.html $uri/ /index.html;`
 *    —— 少了 $uri.html 这一项，全部预渲染页面都不会生效。见 DEPLOYMENT_GUIDE.md。
 */
function generateFaqHTML(assets) {
  const { iconTag, cssTag } = assetTags(assets);
  const faqUrl = `${SITE.url}/faq`;
  const title = `常见问题 FAQ - ${SITE.name}`;
  const description =
    '恒迪视讯常见问题：代理品牌与主营产品、会议室选型、安装与级联、售后支持，以及 MC10 / MA600D / MCS06 / C40T / C60 / M12 等设备的常见技术问答。';

  const faqSchema = ldJson({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  });

  // 按分类分组，让正文有结构而不是 21 条平铺
  const byCategory = new Map();
  for (const f of faqItems) {
    if (!byCategory.has(f.category)) byCategory.set(f.category, []);
    byCategory.get(f.category).push(f);
  }
  const body = [...byCategory.entries()]
    .map(
      ([cat, list]) =>
        `    <h2>${cat}</h2>\n` +
        list.map((f) => `    <h3>${f.question}</h3>\n    <p>${f.answer}</p>`).join('\n')
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${faqUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${faqUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="zh_CN" />
  <meta name="robots" content="index, follow" />
${iconTag}
  <script type="application/ld+json">
${faqSchema}
  </script>
${cssTag}
</head>
<body>
  <noscript>
    <h1>${SITE.name} 常见问题</h1>
${body}
    <p>如需更多帮助请联系：${SITE.email} | ${SITE.phone}</p>
  </noscript>
  <div id="root"></div>
  <script type="module" crossorigin src="${assets.js}"></script>
</body>
</html>`;
}

// ============ 主流程 ============

function prerender() {
  console.log('\n[Prerender] Generating static HTML for product and case pages...');

  const assets = extractBuiltAssets();

  const productDir = path.join(distDir, 'product');
  fs.mkdirSync(productDir, { recursive: true });
  for (const product of products) {
    fs.writeFileSync(
      path.join(productDir, `${product.id}.html`),
      generateProductHTML(product, assets)
    );
    console.log(`  [Prerender] /product/${product.id}.html -> ${product.name}`);
  }

  const caseDir = path.join(distDir, 'case');
  fs.mkdirSync(caseDir, { recursive: true });
  for (const caseItem of cases) {
    fs.writeFileSync(
      path.join(caseDir, `${caseItem.id}.html`),
      generateCaseHTML(caseItem, assets)
    );
    console.log(`  [Prerender] /case/${caseItem.id}.html -> ${caseItem.name}`);
  }

  console.log(
    `[Prerender] Generated ${products.length + cases.length} static HTML pages`
  );

  patchIndexItemList(assets);
  injectHomeNoscript();

  fs.writeFileSync(path.join(distDir, 'faq.html'), generateFaqHTML(assets));
  console.log(
    `[Prerender] Generated /faq.html -> ${faqItems.length} 条问答（含 FAQPage 结构化数据）`
  );

  fs.writeFileSync(path.join(distDir, '404.html'), generate404HTML(assets));
  console.log('[Prerender] Generated 404.html');

  // 构建完成标记（原由 shell 的 touch 生成，改为跨平台写法）
  fs.writeFileSync(path.join(distDir, 'build.flag'), '');
  console.log('[Prerender] Generated build.flag');
}

prerender();
