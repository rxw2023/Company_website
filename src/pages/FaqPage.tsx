import { useState } from 'react';
import { Header } from '../components/Header';
import Navigation from '../components/Navigation';
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
  {
    category: '产品相关',
    question: '思必驰MT100 AI智能声像追踪主机是什么？',
    answer: 'MT100是一款AI智能声像追踪主机，搭载思必驰PTZ摄像机并与高端吸顶麦克风系统深度集成，能够实时追踪发言人和动作，自动切换摄像头视角，确保画面始终聚焦会议核心内容。适用于大型会议、培训空间等需要多角度追踪的场景。',
  },
  {
    category: '产品相关',
    question: 'MC08高端吸顶麦克风适合什么场景？',
    answer: 'MC08专为教学场景设计，搭载32单元全向麦克风阵列，提供8个独立可配置拾音区，实现扩声区、通话区、静音区灵活划分。单台MC08即可覆盖整个讲台区域，同时实现教室扩声、远程教学和课程录播的三合一能力，适用于高校教室、培训室、报告厅等场景。',
  },
  {
    category: '产品相关',
    question: 'MC04教育款吸顶麦克风与MC08有何区别？',
    answer: 'MC04是面向常态化教室和紧凑型讲台推出的高性价比款，搭载24单元MEMS麦克风阵列，2米精准扩声覆盖半径，支持模拟音频接口。MC08则为更高端的32单元8分区配置，带Dante数字音频，适合对拾音分区有更高要求的讲台。两者均内置ClearSpeakAI教育专有算法，可有效抑制板书声、翻书声等教学噪声。',
  },
  {
    category: '产品相关',
    question: 'AISPK-DC20PoE吸顶音箱有哪些特点？',
    answer: 'DC20PoE是一款全频同轴定阻有源吸顶音箱，支持Dante数字音频协议和PoE+供电，内置功率放大器和DSP数字信号处理，无需独立功放即可输出高保真音质。支持嵌入式安装和吊装两种方式，适用于会议室、酒店、商店等场所的背景音乐和会议扩声。',
  },
  {
    category: '产品相关',
    question: 'AIMIC-M12企业级会议麦克风音箱支持级联吗？',
    answer: 'M12是一款集拾音、扩音、语音转写、字幕同传于一体的企业级会议麦克风音箱，支持多台级联满足大中小型会议室需求。通过USB即插即用，无需复杂配置，是中小型会议室"一站式"快速部署的理想选择。',
  },
  {
    category: '产品相关',
    question: 'AIMIC-B100桌面控制器系列有哪些型号？',
    answer: 'B100系列共四款型号：有线主席版、有线静音版、无线主席版、无线静音版。主席版支持VIP模式切换和全局静音，静音版支持全局静音和音量调节。有线版通过PoE网线供电和通信，无线版内置1500mAh锂电池，通过蓝牙连接，灵活适配各类会议桌面部署需求。',
  },
  {
    category: '产品相关',
    question: '思必驰D1大模型信创一体机是什么？',
    answer: 'D1是思必驰专为党政企客户推出的会议办公大模型信创一体机，内置"DFM+DeepSeek"双大语言模型，采用从鲲鹏CPU、昇腾GPU到银河麒麟操作系统的全国产化技术架构。支持离线语音识别、声纹区分发言人、AI纪要生成等功能，满足政企客户对数据安全的高要求，解决会议记录难、纪要整理费时费力等问题。',
  },
  {
    category: '产品相关',
    question: 'BYOM投屏套装（SW10+SD10）支持哪些投屏方式？',
    answer: '该套装支持AirPlay、Miracast和专用投屏器三种无线投屏方式。SD10无线传屏器通过一根USB-C线即可传输视频、音频、USB数据和千兆网络，同时为PC提供60W供电。SW10主机具备多路音视频矩阵切换功能和双千兆网口（支持透明/隔离模式），适合10-100㎡中高端会议室的一站式无线协作。',
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
    <>
    <Navigation />
    <div className="min-h-screen bg-[#faf9f5] text-[#3d3d3a] pt-16">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141413] mb-2">常见问题</h1>
          <p className="text-[#6c6a64] mb-8">关于恒迪视讯与思必驰AISPEECH产品的常见问题解答</p>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['全部', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-[#141413] text-white'
                    : 'bg-[#faf9f5] border border-[#e6dfd8] text-[#3d3d3a] hover:border-[#cc785c]'
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
                className="bg-[#faf9f5] rounded-xl border border-[#e6dfd8] overflow-hidden"
              >
                <button
                  className="w-full text-left px-5 py-4 flex justify-between items-start gap-4 hover:bg-[#f4efe6] transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium text-[#141413]">{item.question}</span>
                  <span className="text-[#6c6a64] flex-shrink-0 mt-0.5">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 text-[#6c6a64] text-sm leading-relaxed border-t border-[#e6dfd8] pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 联系引导 */}
          <div className="mt-12 bg-[#efe9de] rounded-xl p-6 text-center">
            <h2 className="font-semibold text-lg mb-2 text-[#141413]">还有其他问题？</h2>
            <p className="text-[#6c6a64] text-sm mb-4">联系我们的专业顾问，获取个性化解决方案</p>
            <a
              href="tel:18814845538"
              className="inline-block bg-[#cc785c] text-white px-6 py-2.5 rounded-[8px] text-sm font-medium hover:bg-[#a9583e] transition-all active:scale-[0.97]"
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
