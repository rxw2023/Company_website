import { Helmet } from 'react-helmet-async';

interface ProductSchemaProps {
  id: string;
  name: string;
  description: string;
  image: string;
  brand?: string;
}

interface SeoHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  product?: ProductSchemaProps;
  breadcrumbs?: { name: string; url: string }[];
}

const SITE_URL = 'https://www.techhdi.com';
const SITE_NAME = '恒迪视讯';

export default function SeoHead({
  title,
  description,
  url,
  image,
  type = 'website',
  product,
  breadcrumbs,
}: SeoHeadProps) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - 专业音视频解决方案`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const metaDesc = description || '恒迪视讯专注于专业音视频解决方案，代理思必驰AISPEECH智能会议产品，服务高校、企业、政府、酒店等场景。';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
      {image && <meta property="og:image" content={image} />}

      {/* Product Schema */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.image,
            brand: {
              '@type': 'Brand',
              name: product.brand || 'AISPEECH',
            },
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/InStock',
              priceCurrency: 'CNY',
              seller: {
                '@type': 'Organization',
                name: '恒迪视讯（杭州）科技有限公司',
              },
            },
            url: fullUrl,
          })}
        </script>
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: crumb.name,
              item: `${SITE_URL}${crumb.url}`,
            })),
          })}
        </script>
      )}
    </Helmet>
  );
}
