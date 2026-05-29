import * as React from 'react';
const { useState } = React;
import { Header } from '../components/Header';
import SeoHead from '../components/SeoHead';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  // 公司与服务
  {
    category: '公司与服务',
    question: '恒迪视讯是做什么的？',
    answer: '恒迪视讯（杭州）科技有限公司是一家专注于专业音视频解决方案的技术公司，是思必驰（AISPEECH）的授权代理商，为企业、高校、政府机构、酒店等提供智能会议室音视频系统集成与技术支持服务。',
  },
  {
    category: '公司与服务',
    question: '恒迪视讯代理哪些品牌？',
    answer: '目前主要代理思必驰（AISPEECH）品牌的智能会议音视频产品，包括吸顶麦克风、矩阵麦克风、拾扩一体设备、会议摄像机、AI声像追踪主机、吸顶音箱、桌面控制器等全系产品。',
  },
  {
    category: '公司与服务',
    question: '如何联系恒迪视讯咨询或采购？',
    answer: '可通过电话 18814845538 联系我们的销售顾问，我们提供样品体验、技术方案设计、现场勘测等服务，支持全国交付。',
  },
  // 产品相关
  {
    category: '产品相关',
    question: '思必驰AISPEECH MC10吸顶麦克风有什么特点？',
    answer: 'MC10是一款高端吸顶会议麦克风，集成128单元全向麦克风阵列，提供16个独立可配拾音区，支持精细化拾音配置，适用于大型会议室、报告厅等场景，可实现通话区、扩声区、静音区灵活划分。',
  },
  {
    category: '产品相关',
    question: 'MA600D矩阵麦克风适合什么场景？',
    answer: 'MA600D是无感扩声新标杆，拥有3米拾音半径、18dB以上扩声增益、48kHz采样率及低于15ms的延迟，配备AI降噪和反馈抑制双算法，适合中大型会议室、报告厅、多功能厅等对音质要求较高的场合。',
  },
  {
    category: '产品相关',
    question: 'C40T会议摄像机支持多大分辨率？',
    answer: 'C40T支持4K超高清分辨率，具备12倍光学变焦和16倍数字变焦，专为现代企业会议室设计，确保视频会议中的每个细节都清晰可见。',
  },
  {
    category: '产品相关',
    question: 'AISPEECH产品支持Dante数字音频协议吗？',
    answer: '是的，MCS06拾扩一体吸顶麦克风等部分产品支持Dante数字音频技术，可通过标准以太网传输高质量数字音频，便于大型系统集成和扩展。',
  },
  {
    category: '产品相关',
    question: 'AI追踪双目语音摄像头C60有哪些AI功能？',
    answer: 'C60集成了多种AI追踪模式（声源追踪、人脸追踪、区域追踪）、AI会议助理、AI实时字幕、音视频融合等特色能力，适用于会议讨论、演讲、板书等各类视频场景。',
  },
  // 安装与技术
  {
    category: '安装与技术',
    question: '吸顶麦克风的安装难度大吗？',
    answer: '思必驰吸顶麦克风采用标准吊装设计，支持PoE供电（网线供电），无需独立电源，布线简洁。专业安装人员通常可在1-2天内完成中型会议室的全套安装调试。',
  },
  {
    category: '安装与技术',
    question: '多套设备可以级联使用吗？',
    answer: '可以。例如企业级会议麦克风音箱M12支持多台级联，满足大、中、小型会议室的不同需求；部分吸顶麦克风也支持多设备组网覆盖大空间。',
  },
  {
    category: '安装与技术',
    question: '产品是否提供技术培训和售后支持？',
    answer: '恒迪视讯提供完整的售前咨询、方案设计、现场安装指导以及售后技术支持服务，并可协助对接思必驰原厂技术团队，保障系统稳定运行。',
  },
  // 应用场景
  {
    category: '应用场景',
    question: '思必驰AISPEECH产品适合哪些应用场景？',
    answer: '主要适用于：企业会议室（大、中、小型）、高校多媒体教室和报告厅、政府机关会议室、医院远程会诊室、酒店宴会厅和会议中心、广播电视演播室等对音视频质量有较高要求的专业场所。',
  },
  {
    category: '应用场景',
    question: '已有哪些知名客户案例？',
    answer: '恒迪视讯已服务香港科技大学、上海交通大学、华东师范大学、北京理工大学、成都大学、上海交通大学医学院附属仁济医院、国泰基金、苏州独墅湖世尊酒店、国际陆港集团等多家知名机构。',
  },
];

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
    <div className="min-h-screen text-gray-900">
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
        <Header isNotHomePage={true} />

        <div className="mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">常见问题</h1>
          <p className="text-gray-500 mb-8">关于恒迪视讯与思必驰AISPEECH产品的常见问题解答</p>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['全部', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-gray-800 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  className="w-full text-left px-5 py-4 flex justify-between items-start gap-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium text-gray-900">{item.question}</span>
                  <span className="text-gray-400 flex-shrink-0 mt-0.5">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 联系引导 */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
            <h2 className="font-semibold text-lg mb-2">还有其他问题？</h2>
            <p className="text-gray-500 text-sm mb-4">联系我们的专业顾问，获取个性化解决方案</p>
            <a
              href="tel:18814845538"
              className="inline-block bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              致电 18814845538
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
