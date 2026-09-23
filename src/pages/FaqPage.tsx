import { useState } from 'react';
import { Header } from '../components/Header';
import Navigation from '../components/Navigation';
import SeoHead from '../components/SeoHead';
import { FAQ_ITEMS as faqData } from '../data/faq';



const categories = Array.from(new Set(faqData.map(f => f.category)));

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  const filtered = activeCategory === '全部'
    ? faqData
    : faqData.filter(f => f.category === activeCategory);

  // Build FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
    <Navigation />
    <div id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--warm-canvas)] text-[var(--warm-body)] pt-16">
      <SeoHead
        title="常见问题 FAQ"
        description="恒迪视讯常见问题解答，涵盖公司服务、思必驰AISPEECH产品特点、安装技术、应用场景等，快速了解专业音视频解决方案。"
        url="/faq"
        breadcrumbs={[
          { name: '首页', url: '/' },
          { name: '常见问题', url: '/faq' },
        ]}
      />
      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Header />

        <div className="mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--warm-ink)] mb-2">常见问题</h1>
          <p className="text-[var(--warm-muted)] mb-8">关于恒迪视讯与思必驰AISPEECH产品的常见问题解答</p>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['全部', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-[var(--warm-ink)] text-white'
                    : 'bg-[var(--warm-canvas)] border border-[var(--warm-hairline)] text-[var(--warm-body)] hover:border-[var(--warm-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ 列表 */}
          <div className="space-y-3">
            {filtered.map((item, index) => (
              <div
                key={index}
                className="bg-[var(--warm-canvas)] rounded-xl border border-[var(--warm-hairline)] overflow-hidden"
              >
                <button
                  className="w-full text-left px-5 py-4 flex justify-between items-start gap-4 hover:bg-[var(--warm-card-hover)] transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium text-[var(--warm-ink)]">{item.question}</span>
                  <span className="text-[var(--warm-muted)] flex-shrink-0 mt-0.5">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 text-[var(--warm-muted)] text-sm leading-relaxed border-t border-[var(--warm-hairline)] pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 联系引导 */}
          <div className="mt-12 bg-[var(--warm-surface)] rounded-xl p-6 text-center">
            <h2 className="font-semibold text-lg mb-2 text-[var(--warm-ink)]">还有其他问题？</h2>
            <p className="text-[var(--warm-muted)] text-sm mb-4">联系我们的专业顾问，获取个性化解决方案</p>
            <a
              href="tel:18814845538"
              className="inline-block bg-[var(--warm-primary)] text-white px-6 py-2.5 rounded-[8px] text-sm font-medium hover:bg-[var(--warm-primary-active)] transition-all active:scale-[0.97]"
            >
              致电 18814845538
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
