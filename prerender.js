/**
 * 构建后脚本：为每个产品页面生成静态 HTML 预渲染文件
 * 生成到 dist/product/{id}/index.html，Nginx 可直接回退到这些文件
 *
 * 注意：这是纯静态 HTML 壳（不含 JS 渲染的完整内容），
 * 但包含完整的 SEO meta 标签和结构化数据，
 * 确保搜索引擎爬虫能直接获取产品的 title、description、Product Schema。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');

// 产品数据 - 与 ProductDetailPage.tsx 保持同步
const products = [
  { id: 'a1', name: 'MC10吸顶麦克风', description: 'MC10是思必驰推出的一款高端吸顶会议麦克风，集成128单元全向麦克风阵列，16个独立可配拾音区，Dante数字音频技术，AI降噪/去混响/反馈抑制/自动增益/语音转写。适用于各类会议空间的吊装需求。' },
  { id: 'a2', name: 'MA600D矩阵麦克风', description: '无感扩声新标杆，3m拾音半径，>18dB扩声增益，48kHz采样率，<15ms延迟。AI降噪+反馈抑制双算法，24个可配拾音区，64单元MEMS麦克风阵列，Dante音频，支持无限级联。适用大会议室、指挥大厅、报告厅。' },
  { id: 'a3', name: 'MCS06拾扩一体吸顶麦克风', description: 'MCS06是思必驰推出的一款高端拾扩一体吸顶麦，集成32单元全向麦克风阵列，4个独立可配拾音区，Dante数字音频技术，2个15W高性能扬声器，AI降噪/去混响/回声抑制/双讲通话/自动增益/语音转写。' },
  { id: 'a4', name: 'C40T视频会议室摄像机', description: 'C40T超高清摄像机提供4K超高清会议体验，16倍数字变焦+12倍光学变焦，水平260°平移72.5°广角，视频叠加字幕功能，支持搭配MT100和吸顶麦实现智能声像追踪方案。' },
  { id: 'a5', name: 'AI智能声像追踪主机MT100', description: 'MT100搭载思必驰PTZ摄像机，与吸顶麦克风系统结合，AI算法实时追踪发言人和动作，支持4K@30fps，PIP/PBP多画面模式，HDMI/USB3.0/网络输出，PoE供电。' },
  { id: 'a6', name: 'AISPK-DC20PoE吸顶音箱', description: '全频同轴天花扬声器，6.5寸低音+1寸蚕丝膜高音，频率响应65Hz-20kHz，额定功率30W/峰值60W，Dante音频传输，嵌入式/吊挂安装，适用于会议室/酒店/商场等多种场所。' },
  { id: 'a7', name: '高端吸顶麦克风MC08', description: 'MC08是思必驰适用教学场景的高端吸顶麦克风，32单元全向麦克风阵列，8个可配置拾音区（4扩声+4通话），Dante数字音频+模拟音频双接口，支持教室扩声、远程教学、课程录播三合一。' },
  { id: 'a8', name: '企业级会议麦克风音箱M12', description: 'M12集拾音、扩音、语音转写、字幕同传于一体，12个模拟全向麦克风，1个8W全频喇叭+1个8W高音喇叭，支持多台级联，USB Type-C/DC/PoE多种供电方式。' },
  { id: 'a9', name: 'AI追踪双目语音摄像头C60', description: 'C60集多种AI追踪模式、AI会议助理、AI实时字幕、音视频融合于一体，双目镜头（特写+全景），12倍光学变焦+16倍数字变焦，水平+/-130°/垂直-30°~+90°，64个预置位。' },
  { id: 'a10', name: '桌面控制器AIMIC-B100系列', description: 'AIMIC-B100系列智能会议桌面控制器，集智能控制、精准拾音与便捷部署于一身。四款型号：有线/无线 x 静音单元/主席单元，触控按键，支持全局静音/音量调节/VIP模式切换。' },
];

const SITE_URL = 'https://www.techhdi.com';
const SITE_NAME = '恒迪视讯';

function generateProductHTML(product) {
  const imageUrl = `${SITE_URL}/src/assets/images/${product.id === 'a8' ? 'a8-2' : product.id}-1.webp`;
  const productUrl = `${SITE_URL}/product/${product.id}`;

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
</head>
<body>
  <!-- SPA 应用入口：搜索引擎爬到本页面后，用户访问时加载完整SPA -->
  <script>
    // 如果是用户直接访问（非爬虫），跳转到SPA入口由JS接管
    // 搜索引擎爬虫会直接读取上面的 meta 和 schema 数据
    if (!navigator.userAgent.includes('bot') && !navigator.userAgent.includes('spider') && !navigator.userAgent.includes('crawl')) {
      // 重定向到根路径，由 React Router 处理
      // Nginx 配置 try_files 会优先匹配到此静态文件，用户访问正常加载 SPA
    }
  </script>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
}

function generateCaseHTML(cases) {
  return cases.map(c => {
    const caseUrl = `${SITE_URL}/case/${c.id}`;
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${c.name} - ${SITE_NAME}</title>
  <meta name="description" content="${c.name} - 恒迪视讯音视频解决方案案例分享，思必驰AISPEECH智能会议产品实际应用。" />
  <link rel="canonical" href="${caseUrl}" />
  <meta property="og:title" content="${c.name} - ${SITE_NAME}" />
  <meta property="og:url" content="${caseUrl}" />
  <meta property="og:type" content="article" />
  <meta name="robots" content="index, follow" />
  <noscript>
    <h1>${c.name}</h1>
    <p>恒迪视讯音视频解决方案案例分享。请启用JavaScript以获得最佳浏览体验。</p>
  </noscript>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
  });
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

function prerender() {
  console.log('\n[Prerender] Generating static HTML for product and case pages...');

  // 生成产品页面
  for (const product of products) {
    const dir = path.join(distDir, 'product', product.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), generateProductHTML(product));
    console.log(`  [Prerender] /product/${product.id}/index.html -> ${product.name}`);
  }

  // 生成案例页面
  for (const caseItem of cases) {
    const dir = path.join(distDir, 'case', caseItem.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), generateCaseHTML([caseItem])[0]);
    console.log(`  [Prerender] /case/${caseItem.id}/index.html -> ${caseItem.name}`);
  }

  console.log(`[Prerender] Generated ${products.length + cases.length} static HTML pages`);
}

prerender();
