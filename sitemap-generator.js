/**
 * Vite 插件：构建时自动生成 sitemap.xml
 * 从 Home.tsx 的数据中提取产品 ID 和案例 ID
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://www.techhdi.com';

function sitemapPlugin() {
  return {
    name: 'vite-plugin-sitemap',
    enforce: 'post',
    closeBundle() {
      console.log('\n[Sitemap] Generating sitemap.xml...');

      // 从 Home.tsx 源码提取产品和案例数据
      const homePath = path.resolve(__dirname, 'src/pages/Home.tsx');
      const homeSource = fs.readFileSync(homePath, 'utf-8');

      // 提取产品 ID：id: 'a1', id: 'a2', ...
      const productIds = [...homeSource.matchAll(/id:\s*'(a\d+)'/g)].map(m => m[1]);

      // 提取案例 ID：id: 'e1', id: 'e2', ...
      const caseIds = [...homeSource.matchAll(/id:\s*'(e\d+)'/g)].map(m => m[1]);

      // 过滤掉占位产品（如 a11）
      const realProductIds = productIds.filter(id => id !== 'a11');

      const urls = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/faq', priority: '0.8', changefreq: 'monthly' },
        ...realProductIds.map(id => ({
          loc: `/product/${id}`,
          priority: '0.9',
          changefreq: 'monthly',
        })),
        ...caseIds.map(id => ({
          loc: `/case/${id}`,
          priority: '0.7',
          changefreq: 'monthly',
        })),
      ];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

      const outDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
      console.log(`[Sitemap] Generated ${urls.length} URLs → dist/sitemap.xml`);
    },
  };
}

export default sitemapPlugin;
