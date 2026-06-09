import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { products, cases } from '../data/siteData';

// ── 产品详情数据（摘要搜索用） ──
interface ProductDetail {
  id: string;
  name: string;
  description?: string;
}

const productDetails: ProductDetail[] = [
  { id: 'a1', name: '思必驰MC10吸顶麦克风', description: 'MC10是思必驰推出的一款高端吸顶会议麦克风，其集成了多达128单元的全向麦克风阵列，提供了16个独立可配拾音区，可实现精细化拾音配置。采用了Dante数字音频技术, 确保音频传输稳定和广泛兼容。MC10内置AI算法，提供高清降噪、去混响、反馈抑制、自动增益和语音转写等功能。' },
  { id: 'a2', name: 'MA600D 矩阵麦克风', description: '无感扩声新标杆，3m 拾音半径，>18dB 增益，AI 降噪 + 反馈抑制双算法。48kHz 采样率，低于 15ms 延迟。' },
  { id: 'a3', name: 'MCS06 拾扩一体吸顶麦克风', description: '32 单元全向阵列，4 个拾音区，支持 Dante，集拾音扩声于一体。PoE+ 供电。' },
  { id: 'a4', name: 'C40T 视频会议摄像机', description: '4K 超高清，12 倍光学 + 16 倍数字变焦，适配各类企业会议室。支持 HDMI/SDI/USB 输出。' },
  { id: 'a5', name: 'MT100 AI 声像追踪主机', description: '音视频融合追踪引擎，多种追踪模式（声源追踪、人脸追踪、区域追踪），适配企业与教育演讲场景。' },
  { id: 'a6', name: 'AISPK-DC20 PoE 吸顶音箱', description: '全频同轴天花扬声器，PoE 供电，适用商店、会议室、酒店多场景。Dante 数字音频。' },
  { id: 'a7', name: 'MC08 高端吸顶麦克风', description: '32 单元阵列，8 个独立配置拾音区，专为教学场景精心设计。支持 Dante，AI 降噪。' },
  { id: 'a8', name: 'AIMIC-M12 企业级会议麦克风音箱', description: '集拾音、扩音、语音转写、字幕同传于一体，多台级联，覆盖大中小型会议室。' },
  { id: 'a9', name: 'C60 AI 追踪双目摄像头', description: '多种 AI 追踪模式，实时字幕，音视频融合，适配会议讨论、演讲、板书。' },
  { id: 'a10', name: 'AIMIC-B100 桌面控制器', description: '智能控制 + 精准拾音 + 便捷部署，现代高效会议的得力助手。触控操作，PoE 供电。' },
  { id: 'a11', name: 'MC04 高端吸顶麦克风-教育款', description: '24单元MEMS阵列，2m精准扩声覆盖，ClearSpeakAI算法，专为教室教学打造。' },
  { id: 'a12', name: 'MK300 桌面安装套件', description: '专为MA600D矩阵麦克风桌面部署定制，安装更美观整洁，适配高端会议空间。' },
];

// ── 案例摘要数据 ──
interface CaseSummary {
  id: string;
  name: string;
  tag: string;
  snippet: string;
}

const caseSummaries: CaseSummary[] = [
  { id: 'e1', name: '香港科技大学', tag: '声像追踪案例', snippet: '教室空间较大，面向国际对实时中英翻译有需求。采用吸顶麦MC10+C60摄像头声像追踪方案，实现全向拾音和实时翻译投屏。' },
  { id: 'e2', name: '上海交通大学', tag: '无感扩声案例', snippet: '教室隔音不好，现有扩声设备效果差。采用MC10+DC20，有效降噪拾音，实现无感扩声。' },
  { id: 'e3', name: '上海虹口艺术幼儿园', tag: '教育案例', snippet: '教室面积大，手持麦频繁啸叫。采用MC10+DP88，实现高音质本地扩声，降本增效。' },
  { id: 'e4', name: '华东师范大学', tag: '教育案例', snippet: '培训教室希望改造成无感扩声教室。采用MC08+利旧设备，设置拾音屏蔽区，过滤走步声板书声。' },
  { id: 'e5', name: '北京理工大学', tag: '教育案例', snippet: '大阶梯教室有啸叫和混响。采用MC10吸顶麦，覆盖讲台和学生区域，教师彻底告别手持麦。' },
  { id: 'e6', name: '成都大学', tag: '教育案例', snippet: '120平米会见室传统扩声设备繁多。采用2片MC10+7台DC20级联，实现大空间轻松扩音。' },
  { id: 'e7', name: '苏州广电跨年演讲晚会', tag: '大型活动案例', snippet: '传统舞台圆桌论坛麦克风传递打乱节奏。采用3台矩阵麦，智能拾音区定制，15ms超低延迟无感扩声。' },
  { id: 'e8', name: '苏州独墅湖世尊酒店', tag: '酒店案例', snippet: '每日密集会议排期，手持麦反复充电调试。采用MC10吸顶麦一次部署无需重复调试，翻台效率大幅提升。' },
  { id: 'e9', name: '国泰基金', tag: '金融案例', snippet: '会议室面积大，原有拾音设备不理想。采用MC10+DP88，实现大空间无感扩声，吸顶设计美观便利。' },
  { id: 'e10', name: '上海仁济医院', tag: '医疗案例', snippet: '传统视频会诊系统单台摄像机角度受限。采用MC10+C60声像追踪方案，实现全场景智能拾音和多角度发言人追踪。' },
  { id: 'e11', name: '国际陆港集团', tag: '企业案例', snippet: '跨部门跨地区沟通协作需求高。采用MC10+MT100+C40T声像追踪方案，会议效率提升30%。' },
  { id: 'e12', name: '成都新希望金融科技', tag: '金融科技案例', snippet: '300平展厅对接语音数字人，需屏蔽周边噪音。采用4台MC10+DP88，构建全域高质量语音覆盖。' },
];

// ── FAQ 数据 ──
interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  { category: '公司与服务', question: '恒迪视讯是做什么的？', answer: '恒迪视讯（杭州）科技有限公司是一家专注于专业音视频解决方案的技术公司，是思必驰（AISPEECH）的授权代理商，为企业、高校、政府机构、酒店等提供智能会议室音视频系统集成与技术支持服务。' },
  { category: '公司与服务', question: '恒迪视讯代理哪些品牌？', answer: '目前主要代理思必驰（AISPEECH）品牌的智能会议音视频产品，包括吸顶麦克风、矩阵麦克风、拾扩一体设备、会议摄像机、AI声像追踪主机、吸顶音箱、桌面控制器等全系产品。' },
  { category: '公司与服务', question: '如何联系恒迪视讯咨询或采购？', answer: '可通过电话 18814845538 联系我们的销售顾问，我们提供样品体验、技术方案设计、现场勘测等服务，支持全国交付。' },
  { category: '产品相关', question: '思必驰AISPEECH MC10吸顶麦克风有什么特点？', answer: 'MC10是一款高端吸顶会议麦克风，集成128单元全向麦克风阵列，提供16个独立可配拾音区，支持精细化拾音配置，适用于大型会议室、报告厅等场景，可实现通话区、扩声区、静音区灵活划分。' },
  { category: '产品相关', question: 'MA600D矩阵麦克风适合什么场景？', answer: 'MA600D是无感扩声新标杆，拥有3米拾音半径、18dB以上扩声增益、48kHz采样率及低于15ms的延迟，配备AI降噪和反馈抑制双算法，适合中大型会议室、报告厅、多功能厅等对音质要求较高的场合。' },
  { category: '产品相关', question: 'C40T会议摄像机支持多大分辨率？', answer: 'C40T支持4K超高清分辨率，具备12倍光学变焦和16倍数字变焦，专为现代企业会议室设计，确保视频会议中的每个细节都清晰可见。' },
  { category: '产品相关', question: 'AISPEECH产品支持Dante数字音频协议吗？', answer: '是的，MCS06拾扩一体吸顶麦克风等部分产品支持Dante数字音频技术，可通过标准以太网传输高质量数字音频，便于大型系统集成和扩展。' },
  { category: '产品相关', question: 'AI追踪双目语音摄像头C60有哪些AI功能？', answer: 'C60集成了多种AI追踪模式（声源追踪、人脸追踪、区域追踪）、AI会议助理、AI实时字幕、音视频融合等特色能力，适用于会议讨论、演讲、板书等各类视频场景。' },
  { category: '安装与技术', question: '吸顶麦克风的安装难度大吗？', answer: '思必驰吸顶麦克风采用标准吊装设计，支持PoE供电（网线供电），无需独立电源，布线简洁。专业安装人员通常可在1-2天内完成中型会议室的全套安装调试。' },
  { category: '安装与技术', question: '多套设备可以级联使用吗？', answer: '可以。例如企业级会议麦克风音箱M12支持多台级联，满足大、中、小型会议室的不同需求；部分吸顶麦克风也支持多设备组网覆盖大空间。' },
  { category: '安装与技术', question: '产品是否提供技术培训和售后支持？', answer: '恒迪视讯提供完整的售前咨询、方案设计、现场安装指导以及售后技术支持服务，并可协助对接思必驰原厂技术团队，保障系统稳定运行。' },
  { category: '应用场景', question: '思必驰AISPEECH产品适合哪些应用场景？', answer: '主要适用于：企业会议室（大、中、小型）、高校多媒体教室和报告厅、政府机关会议室、医院远程会诊室、酒店宴会厅和会议中心、广播电视演播室等对音视频质量有较高要求的专业场所。' },
  { category: '应用场景', question: '已有哪些知名客户案例？', answer: '恒迪视讯已服务香港科技大学、上海交通大学、华东师范大学、北京理工大学、成都大学、上海交通大学医学院附属仁济医院、国泰基金、苏州独墅湖世尊酒店、国际陆港集团等多家知名机构。' },
];

// ── 搜索结果类型 ──
export interface SearchResult {
  type: 'product' | 'case' | 'faq';
  title: string;
  snippet: string;
  url: string;
}

// ── 构建全文索引 ──
function buildSearchIndex(): { title: string; text: string; result: SearchResult }[] {
  const idx: { title: string; text: string; result: SearchResult }[] = [];

  for (const p of productDetails) {
    idx.push({ title: p.name, text: p.description || '', result: { type: 'product', title: p.name, snippet: p.description || '', url: `/product/${p.id}` } });
  }
  for (const c of caseSummaries) {
    idx.push({ title: c.name, text: c.snippet, result: { type: 'case', title: `${c.name}`, snippet: c.snippet, url: `/case/${c.id}` } });
  }
  for (const f of faqData) {
    idx.push({ title: f.question, text: f.answer, result: { type: 'faq', title: f.question, snippet: f.answer, url: '/faq' } });
  }

  return idx;
}

const SEARCH_INDEX = buildSearchIndex();

function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = SEARCH_INDEX
    .map((item) => {
      let score = 0;
      const titleL = item.title.toLowerCase();
      const textL = item.text.toLowerCase();
      for (const t of terms) {
        if (titleL.includes(t)) score += 10;
        else if (textL.includes(t)) score += 3;
      }
      return { ...item, score };
    })
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  return scored.map((s) => s.result);
}

// 高亮搜索词
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;
  const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: '#FFE066', color: '#1d1d1f', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
    ) : (
      part
    )
  );
}

// ── SearchModal 组件 ──
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 打开时聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setActiveIdx(0);
    }
  }, [isOpen]);

  // 搜索
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const r = search(val);
    setResults(r);
    setActiveIdx(0);
  }, []);

  // 跳转
  const goTo = useCallback((item: SearchResult) => {
    onClose();
    setTimeout(() => navigate(item.url), 50);
  }, [navigate, onClose]);

  // 键盘
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { const t = results[activeIdx]; if (t) goTo(t); }
  }, [results, activeIdx, onClose, goTo]);

  // active 项滚动到可见
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[activeIdx] as HTMLElement | undefined;
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIdx]);

  if (!isOpen) return null;

  const typeLabel: Record<string, string> = { product: '产品', case: '案例', faq: 'FAQ' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.40)',
        backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 580, maxWidth: '92vw',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 16px 64px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          maxHeight: '70vh',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入行 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: results.length > 0 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginRight: 12, color: 'rgba(0,0,0,0.35)' }}>
            <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11.5 11.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="搜索产品、案例、常见问题…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 16, color: '#1d1d1f',
              background: 'transparent',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={onClose}
            style={{
              flexShrink: 0, marginLeft: 8,
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'rgba(0,0,0,0.35)',
              background: 'transparent', border: 'none',
              borderRadius: 6, cursor: 'pointer',
              fontFamily: 'inherit', lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = 'rgba(0,0,0,0.65)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(0,0,0,0.35)'; }}
          >
            ×
          </button>
        </div>

        {/* 结果列表 */}
        <div ref={listRef} style={{ overflow: 'auto', flex: 1 }}>
          {results.length > 0 ? (
            results.map((item, idx) => (
              <div
                key={`${item.type}-${idx}`}
                onClick={() => goTo(item)}
                style={{
                  display: 'flex', gap: 12, padding: '12px 20px',
                  cursor: 'pointer',
                  background: idx === activeIdx ? 'rgba(0,102,204,0.06)' : 'transparent',
                  borderBottom: idx < results.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = idx === activeIdx ? 'rgba(0,102,204,0.06)' : 'transparent'; }}
              >
                {/* 类型标记 */}
                <span style={{
                  flexShrink: 0, marginTop: 2,
                  fontSize: 10, fontWeight: 600,
                  color: item.type === 'product' ? '#0071e3' : item.type === 'case' ? '#34c759' : '#ff9500',
                  background: item.type === 'product' ? 'rgba(0,113,227,0.08)' : item.type === 'case' ? 'rgba(52,199,89,0.10)' : 'rgba(255,149,0,0.10)',
                  borderRadius: 4, padding: '2px 6px',
                  whiteSpace: 'nowrap', height: 'fit-content',
                }}>
                  {typeLabel[item.type]}
                </span>

                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f', marginBottom: 3, lineHeight: 1.4 }}>
                    {highlightText(item.title, query)}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.48)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {highlightText(item.snippet, query)}
                  </div>
                </div>
              </div>
            ))
          ) : query.trim() ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.40)', fontSize: 14 }}>
              未找到相关内容
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.30)', fontSize: 13 }}>
              输入关键词搜索产品、案例和常见问题
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Navigation ──
export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [searchOpen, setSearchOpen] = useState(false);

  const scrollTo = (id: string) => {
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const goHome = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  // CMD+K / Ctrl+K 打开搜索
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 64, background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* 左：Logo */}
        <span onClick={goHome} style={{ fontSize: 20, fontWeight: 600, color: '#1d1d1f', letterSpacing: -0.3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <img src="/hd-logo.webp" alt="" style={{ height: 36, width: 'auto', display: 'block' }} />
          恒迪视讯
        </span>

        {/* 中：菜单 */}
        <ul style={{ display: 'flex', gap: 28, listStyle: 'none', margin: 0, padding: 0 }}>
          {[
            { label: '首页', action: goHome },
            { label: '产品', action: () => scrollTo('products') },
            { label: '案例', action: () => scrollTo('cases') },
            { label: '关于我们', action: () => scrollTo('about') },
          ].map((item) => (
            <li key={item.label}>
              <span
                onClick={item.action}
                style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.72)', letterSpacing: -0.1, cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1d1d1f')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.72)')}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        {/* 右：搜索按钮 + 咨询热线 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {/* 搜索按钮 */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, width: 200, padding: '0 12px',
              fontSize: 13, color: 'rgba(0,0,0,0.45)',
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.10)',
              borderRadius: 8, cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.20)'; e.currentTarget.style.color = 'rgba(0,0,0,0.65)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'; e.currentTarget.style.color = 'rgba(0,0,0,0.45)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>搜索</span>
          </button>

          {/* 咨询热线 */}
          <span
            onClick={() => scrollTo('footer')}
            style={{ fontSize: 14, color: '#0066cc', letterSpacing: -0.1, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            咨询热线
          </span>
        </div>
      </nav>

      {/* 全屏搜索弹窗 */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
