/**
 * 构建后脚本：为每个产品/案例页面生成静态 HTML 预渲染文件
 * 输出扁平文件：dist/product/a1.html（而非 dist/product/a1/index.html）
 * 避免 Nginx 301 重定向加尾部斜杠导致 URL 与 React Router 不一致
 *
 * 注意：这是纯静态 HTML 壳（不含 JS 渲染的完整内容），
 * 但包含完整的 SEO meta 标签和结构化数据，
 * 确保搜索引擎爬虫能直接获取产品的 title、description、Product Schema。
 *
 * 修复：从 dist/index.html 提取编译后的 JS/CSS 资源路径，
 * 避免引用开发路径 /src/main.tsx 导致生产环境页面空白。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');

// 产品数据 - 与 ProductDetailPage.tsx 保持同步
const products = [
  { id: 'a1', name: '思必驰MC10吸顶麦克风', description: 'MC10是思必驰推出的一款高端吸顶会议麦克风，集成128单元全向麦克风阵列，16个独立可配拾音区，Dante数字音频技术，AI降噪/去混响/反馈抑制/自动增益/语音转写。适用于各类会议空间的吊装需求。' },
  { id: 'a2', name: '思必驰MA600D矩阵麦克风', description: '无感扩声新标杆，3m拾音半径，>18dB扩声增益，48kHz采样率，<15ms延迟。AI降噪+反馈抑制双算法，24个可配拾音区，64单元MEMS麦克风阵列，Dante音频，支持无限级联。适用大会议室、指挥大厅、报告厅。' },
  { id: 'a3', name: '思必驰MCS06拾扩一体吸顶麦克风', description: 'MCS06是思必驰推出的一款高端拾扩一体吸顶麦，集成32单元全向麦克风阵列，4个独立可配拾音区，Dante数字音频技术，2个15W高性能扬声器，AI降噪/去混响/回声抑制/双讲通话/自动增益/语音转写。' },
  { id: 'a4', name: '思必驰C40T视频会议室摄像机', description: 'C40T超高清摄像机提供4K超高清会议体验，16倍数字变焦+12倍光学变焦，水平260°平移72.5°广角，视频叠加字幕功能，支持搭配MT100和吸顶麦实现智能声像追踪方案。' },
  { id: 'a5', name: '思必驰AI智能声像追踪主机MT100', description: 'MT100搭载思必驰PTZ摄像机，与吸顶麦克风系统结合，AI算法实时追踪发言人和动作，支持4K@30fps，PIP/PBP多画面模式，HDMI/USB3.0/网络输出，PoE供电。' },
  { id: 'a6', name: '思必驰AISPK-DC20PoE吸顶音箱', description: '全频同轴天花扬声器，6.5寸低音+1寸蚕丝膜高音，频率响应65Hz-20kHz，额定功率30W/峰值60W，Dante音频传输，嵌入式/吊挂安装，适用于会议室/酒店/商场等多种场所。' },
  { id: 'a7', name: '思必驰高端吸顶麦克风MC08', description: 'MC08是思必驰适用教学场景的高端吸顶麦克风，32单元全向麦克风阵列，8个可配置拾音区（4扩声+4通话），Dante数字音频+模拟音频双接口，支持教室扩声、远程教学、课程录播三合一。' },
  { id: 'a8', name: '思必驰企业级会议麦克风音箱M12', description: 'M12集拾音、扩音、语音转写、字幕同传于一体，12个模拟全向麦克风，1个8W全频喇叭+1个8W高音喇叭，支持多台级联，USB Type-C/DC/PoE多种供电方式。' },
  { id: 'a9', name: '思必驰AI追踪双目语音摄像头C60', description: 'C60集多种AI追踪模式、AI会议助理、AI实时字幕、音视频融合于一体，双目镜头（特写+全景），12倍光学变焦+16倍数字变焦，水平+/-130°/垂直-30°~+90°，64个预置位。' },
  { id: 'a10', name: '思必驰桌面控制器AIMIC-B100系列', description: 'AIMIC-B100系列智能会议桌面控制器，集智能控制、精准拾音与便捷部署于一身。四款型号：有线/无线 x 静音单元/主席单元，触控按键，支持全局静音/音量调节/VIP模式切换。' },
  { id: 'a11', name: '思必驰MC04高端吸顶麦克风-教育款', description: 'MC04是思必驰面向教室教学场景推出的一款高端吸顶麦克风，搭载24单元全向MEMS麦克风阵列，具备2米精准扩声覆盖半径，内置ClearSpeakAI专利算法，专为常态化教室、紧凑型讲台及录播教室设计。' },
  { id:'a12',name:'思必驰MK300桌面安装套件',description:'MK300 是一款面向矩阵麦克风桌面安装场景开发的定制配件。通过与设备结构贴合的外观设计，可优化桌面安装效果，使设备部署更整洁、更美观，更适合高端会议空间。'},
  { id:'a13',name:'思必驰MK102 嵌入式安装配件',description:'MK102 是一款面向 MC08 高端吸顶麦克风嵌入式安装场景开发的定制配件。通过嵌入天花板的结构设计，使设备安装后与天花板表面齐平，实现美观隐蔽的安装效果，适配高端教学与会议空间。'},
  { id:'a14',name:'思必驰MK200 表面安装配件',description:'MK200 是一款面向 MC08 高端吸顶麦克风表面安装场景开发的定制配件。采用表面安装结构设计，安装操作简单快捷，适用于常规天花板表面安装，稳固可靠。'},
  { id:'a15',name:'思必驰高端吸顶麦克风 MC08-A（高校款）',description:'MC08-A 是思必驰推出的面向高校基础教学场景的高端吸顶麦克风，集成 32 单元全向麦克风阵列，提供 4 个独立扩声拾音区，通过模拟音频接口兼容传统音频系统。满足教室本地扩声需求，内置 AI 降噪、混响抑制、啸叫抑制、回声消除等算法。'},
  { id:'a16',name:'思必驰高端吸顶麦克风 MC08-U（教育款）',description:'MC08-U 是思必驰推出的面向教育教学场景的高端吸顶麦克风，集成 32 单元全向麦克风阵列，提供 8 个独立可配置拾音区。采用 Dante + 模拟双音频架构，支持 8 台级联覆盖超大型空间，配备 AI 实时语音转写功能，实现教室扩声、远程教学和课程录播三合一。'},
  { id:'a17',name:'思必驰AI转录麦克风音箱 AIMIC-M6',description:'AIMIC-M6 是思必驰推出的 AI 转录麦克风音箱，集 6 单元全向麦克风阵列、高保真扬声器、AI 实时语音转写与翻译于一体。蓝牙 V5.3 无线连接，5000mAh 大电池支持 25 小时以上连续通话，轻巧便携（仅 300g），是移动办公和中小型会议的理想选择。'},
];

const SITE_URL = 'https://www.techhdi.com';
const SITE_NAME = '恒迪视讯';

/**
 * 从 dist/index.html 提取编译后的 JS/CSS 资源路径
 * 确保预渲染页面加载的是生产构建产物而非开发路径
 */
function extractBuiltAssets() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('[Prerender] ERROR: dist/index.html not found. Run `pnpm build:client` first.');
    process.exit(1);
  }
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  // 提取 <script type="module" crossorigin src="..."></script>
  const jsMatch = indexHtml.match(/<script[^>]*\bsrc="([^"]+)"[^>]*>/);
  // 提取 <link rel="stylesheet" crossorigin href="..."> （Vite编译产物的CSS带crossorigin属性）
  const cssMatch = indexHtml.match(/<link[^>]*\brel="stylesheet"[^>]*\bcrossorigin[^>]*\bhref="([^"]+)"[^>]*>/)
    || indexHtml.match(/<link[^>]*\bhref="([^"]*\/assets\/index[^"]*\.css)"[^>]*>/);
  // 提取 favicon
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

function generateProductHTML(product, assets) {
  const imageUrl = `${SITE_URL}/assets/${product.id === 'a8' ? 'a8-2' : product.id}-1.webp`;
  const productUrl = `${SITE_URL}/product/${product.id}`;

  // 构建资源引用标签
  const iconTag = assets.icon
    ? `  <link rel="icon" href="${assets.icon}" type="image/webp" />`
    : '';
  const cssTag = assets.css
    ? `  <link rel="stylesheet" crossorigin href="${assets.css}">`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${product.name} - ${SITE_NAME}</title>
  <meta name="description" content="${product.description}" />
  <meta name="keywords" content="${product.name},${SITE_NAME},思必驰,AISPEECH,音视频解决方案,智能会议,恒迪视讯" />
  <link rel="canonical" href="${productUrl}" />
  <meta property="og:title" content="${product.name} - ${SITE_NAME}" />
  <meta property="og:description" content="${product.description}" />
  <meta property="og:url" content="${productUrl}" />
  <meta property="og:type" content="product" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:locale" content="zh_CN" />
  <meta name="robots" content="index, follow" />
${iconTag}
  <!-- Product Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${product.name}",
    "description": "${product.description}",
    "image": "${imageUrl}",
    "brand": {
      "@type": "Brand",
      "name": "AISPEECH"
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "CNY",
      "seller": {
        "@type": "Organization",
        "name": "恒迪视讯（杭州）科技有限公司"
      }
    },
    "url": "${productUrl}"
  }
  </script>
  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首页",
        "item": "${SITE_URL}"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "产品",
        "item": "${SITE_URL}"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${product.name}",
        "item": "${productUrl}"
      }
    ]
  }
  </script>
  <noscript>
    <h1>${product.name}</h1>
    <p>${product.description}</p>
    <p>如需了解更多产品信息，请联系我们：guo@techhdi.com | 18814845538</p>
    <p>请启用JavaScript以获得最佳浏览体验。</p>
  </noscript>
${cssTag}
</head>
<body>
  <div id="root"></div>
  <script type="module" crossorigin src="${assets.js}"></script>
</body>
</html>`;
}

function generateCaseHTML(caseItem, assets) {
  const caseUrl = `${SITE_URL}/case/${caseItem.id}`;

  const iconTag = assets.icon
    ? `  <link rel="icon" href="${assets.icon}" type="image/webp" />`
    : '';
  const cssTag = assets.css
    ? `  <link rel="stylesheet" crossorigin href="${assets.css}">`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${caseItem.name} - ${SITE_NAME}</title>
  <meta name="description" content="${caseItem.name} - 恒迪视讯音视频解决方案案例分享，思必驰AISPEECH智能会议产品实际应用。" />
  <link rel="canonical" href="${caseUrl}" />
  <meta property="og:title" content="${caseItem.name} - ${SITE_NAME}" />
  <meta property="og:url" content="${caseUrl}" />
  <meta property="og:type" content="article" />
  <meta name="robots" content="index, follow" />
${iconTag}
  <noscript>
    <h1>${caseItem.name}</h1>
    <p>恒迪视讯音视频解决方案案例分享。请启用JavaScript以获得最佳浏览体验。</p>
  </noscript>
${cssTag}
</head>
<body>
  <div id="root"></div>
  <script type="module" crossorigin src="${assets.js}"></script>
</body>
</html>`;
}

// 案例数据
const cases = [
  { id: 'e1', name: '案例分享 - 香港科技大学' },
  { id: 'e2', name: '案例分享 - 上海交通大学' },
  { id: 'e3', name: '案例分享 - 上海虹口艺术幼儿园' },
  { id: 'e4', name: '案例分享 - 华东师范大学' },
  { id: 'e5', name: '案例分享 - 北京理工大学' },
  { id: 'e6', name: '案例分享 - 成都大学' },
  { id: 'e7', name: '案例分享 - 苏州广电跨年演讲晚会' },
  { id: 'e8', name: '案例分享 - 苏州独墅湖世尊酒店' },
  { id: 'e9', name: '案例分享 - 国泰基金' },
  { id: 'e10', name: '案例分享 - 上海交通大学医学院附属仁济医院' },
  { id: 'e11', name: '案例分享 - 国际陆港集团' },
  { id: 'e12', name: '案例分享 - 成都新希望金融科技' },
];

function generate404HTML(assets) {
  const iconTag = assets.icon
    ? `  <link rel="icon" href="${assets.icon}" type="image/webp" />`
    : '';
  const cssTag = assets.css
    ? `  <link rel="stylesheet" crossorigin href="${assets.css}">`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>页面不存在 - 恒迪视讯</title>
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

function prerender() {
  console.log('\n[Prerender] Generating static HTML for product and case pages...');

  // 从 dist/index.html 提取编译后的 JS/CSS 资源路径
  const assets = extractBuiltAssets();

  // 生成产品页面（扁平文件：dist/product/a1.html）
  for (const product of products) {
    const productDir = path.join(distDir, 'product');
    fs.mkdirSync(productDir, { recursive: true });
    fs.writeFileSync(path.join(productDir, `${product.id}.html`), generateProductHTML(product, assets));
    console.log(`  [Prerender] /product/${product.id}.html -> ${product.name}`);
  }

  // 生成案例页面（扁平文件：dist/case/e1.html）
  for (const caseItem of cases) {
    const caseDir = path.join(distDir, 'case');
    fs.mkdirSync(caseDir, { recursive: true });
    fs.writeFileSync(path.join(caseDir, `${caseItem.id}.html`), generateCaseHTML(caseItem, assets));
    console.log(`  [Prerender] /case/${caseItem.id}.html -> ${caseItem.name}`);
  }

  console.log(`[Prerender] Generated ${products.length + cases.length} static HTML pages`);

  // 生成 404.html
  fs.writeFileSync(path.join(distDir, '404.html'), generate404HTML(assets));
  console.log('[Prerender] Generated 404.html');
}

prerender();
