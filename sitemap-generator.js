/**
 * Vite 插件：构建时自动生成 sitemap.xml
 *
 * 数据来源：src/data/products.json 与 src/data/cases.json（单一事实源）。
 *
 * 历史教训：旧版用正则去抓 Home.tsx 的源码来提取 id，一旦首页改成从数据文件
 * 派生就立刻失效（sitemap 只剩 2 条 URL）。改为直接读数据文件，彻底消除这类脆弱依赖。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readData(fileName) {
  const filePath = path.resolve(__dirname, 'src/data', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`[Sitemap] 找不到数据文件：${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function sitemapPlugin() {
  return {
    name: 'vite-plugin-sitemap',
    enforce: 'post',
    closeBundle() {
      console.log('\n[Sitemap] Generating sitemap.xml...');

      const { site, products } = readData('products.json');
      const { cases } = readData('cases.json');

      // 构建日期作为 lastmod（内容在构建时重新生成）
      const lastmod = new Date().toISOString().slice(0, 10);

      const urls = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/faq', priority: '0.8', changefreq: 'monthly' },
        ...products.map((p) => ({
          loc: `/product/${p.id}`,
          priority: '0.9',
          changefreq: 'monthly',
        })),
        ...cases.map((c) => ({
          loc: `/case/${c.id}`,
          priority: '0.7',
          changefreq: 'monthly',
        })),
      ];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${site.url}${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

      const outDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
      console.log(
        `[Sitemap] Generated ${urls.length} URLs (${products.length} 产品 + ${cases.length} 案例) → dist/sitemap.xml`
      );
    },
  };
}

export default sitemapPlugin;
