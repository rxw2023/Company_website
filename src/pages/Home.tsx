import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Navigation from '../components/Navigation';
import SeoHead from '../components/SeoHead';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';
import MouseGlow from '../components/MouseGlow';
import StarField from '../components/StarField';
// 产品图片
import a1Image from '../assets/images/a1-1.webp';
import a2Image from '../assets/images/a2-1.webp';
import a3Image from '../assets/images/a3-3.webp';
import a4Image from '../assets/images/a4-1.webp';
import a5Image from '../assets/images/a5-1.webp';
import a6Image from '../assets/images/a6-1.webp';
import a7Image from '../assets/images/a7-1.webp';
import a8Image from '../assets/images/a8-2.webp';
import a9Image from '../assets/images/a9-1.webp';
import a10Image from '../assets/images/a10-1.webp';
import a11Image from '../assets/images/a11-3.webp'
import a12Image from '../assets/images/a12-2.webp';
import a18Image from '../assets/images/a18-2.webp';
import a19Image from '../assets/images/a19-1.webp';
// import a13Image from '../assets/images/a13-2.webp';
// import a14Image from '../assets/images/a14-2.webp';
// import a15Image from '../assets/images/a15-1.webp';
// import a16Image from '../assets/images/a16-1.webp';
// import a17Image from '../assets/images/a17-2.webp';
import quickImage from '../assets/images/aispeech-logo.png';
import aispeechLogo from '../assets/images/aispeech-logo1.png';
import qrcodeImage from '../assets/images/qrcode.jpg';
// 案例图片
import e1Image from '../assets/images/e1.webp';
import e2Image from '../assets/images/e2.webp';
import e3Image from '../assets/images/e3-1.webp';
import e4Image from '../assets/images/e4-1.webp';
import e5Image from '../assets/images/e5-1.webp';
import e6Image from '../assets/images/e6-1.webp';
import e7Image from '../assets/images/e7-1.webp';
import e8Image from '../assets/images/e8-1.webp';
import e9Image from '../assets/images/e9-1.webp';
import e10Image from '../assets/images/e10-1.webp';
import e11Image from '../assets/images/e11-1.webp';
import e12Image from '../assets/images/e12-1.webp';

const products = [
  
  { id: 'a2',  name: 'MA600D 矩阵麦克风',        desc: '无感扩声新标杆，3m 拾音半径，>18dB 增益，AI 降噪 + 反馈抑制双算法。', img: a2Image, categories: ['矩阵麦克风'] },
  { id: 'a12', name: 'MK300 桌面安装套件',          desc: '专为MA600D矩阵麦克风桌面部署定制，安装更美观整洁，适配高端会议空间。', img: a12Image, categories: ['矩阵麦克风'] },
  { id: 'a10', name: 'AIMIC-B100 桌面控制器',      desc: '智能控制 + 精准拾音 + 便捷部署，现代高效会议的得力助手。', img: a10Image, categories: ['控制·投屏'] },
  { id: 'a7',  name: 'MC08 高端吸顶麦克风',        desc: '32 单元阵列，8 个独立配置拾音区，专为教学场景精心设计。', img: a7Image, categories: ['吸顶麦克风'] },
  // { id: 'a15', name: 'MC08-A 高端吸顶麦克风-高校款',  desc: '4 拾音区，模拟音频，专为基础教学空间设计。', img: a15Image },
  // { id: 'a16', name: 'MC08-U 高端吸顶麦克风-教育款',  desc: '8 拾音区，Dante+模拟，AI 转写，8台级联覆盖大型空间。', img: a16Image },
  // { id: 'a13', name: 'MK102 嵌入式安装配件',        desc: '专为MC08定制，嵌入式结构与天花板齐平，美观隐蔽。', img: a13Image },
  // { id: 'a14', name: 'MK200 表面安装配件',        desc: '专为MC08定制，表面安装便捷，结构稳固可靠。', img: a14Image },
  { id: 'a1',  name: 'MC10 吸顶麦克风',         desc: '128 单元全向麦克风阵列，16 个独立可配拾音区，精细化拾音配置。', img: a1Image, categories: ['吸顶麦克风'] },
  { id:'a11',  name: 'MC04 高端吸顶麦克风-教育款',      desc: '24单元MEMS阵列，2m精准扩声覆盖，ClearSpeakAI算法，专为教室教学打造。', img: a11Image, categories: ['吸顶麦克风'] },
  { id: 'a3',  name: 'MCS06 拾扩一体吸顶麦克风',      desc: '32 单元全向阵列，4 个拾音区，支持 Dante，集拾音扩声于一体。', img: a3Image, categories: ['吸顶麦克风'] },
  { id: 'a6',  name: 'AISPK-DC20 PoE 吸顶音箱',   desc: '全频同轴天花扬声器，PoE 供电，适用商店、会议室、酒店多场景。', img: a6Image, categories: ['会议音箱'] },
  { id: 'a8',  name: 'AIMIC-M12 企业级会议麦克风音箱',    desc: '集拾音、扩音、语音转写、字幕同传于一体，多台级联，覆盖大中小型会议室。', img: a8Image, categories: ['会议音箱'] },
  // { id: 'a17', name: 'AIMIC-M6 AI转录麦克风音箱',   desc: '6麦阵列，AI实时转写翻译，5000mAh超长续航，便携会议利器。', img: a17Image },
  { id: 'a9',  name: 'C60 AI 追踪双目摄像头',      desc: '多种 AI 追踪模式，实时字幕，音视频融合，适配会议讨论、演讲、板书。', img: a9Image, categories: ['摄像追踪'] },
  { id: 'a4',  name: 'C40T 视频会议摄像机',        desc: '4K 超高清，12 倍光学 + 16 倍数字变焦，适配各类企业会议室。', img: a4Image, categories: ['摄像追踪'] },
  { id: 'a5',  name: 'MT100 AI 声像追踪主机',      desc: '音视频融合追踪引擎，多种追踪模式，适配企业与教育演讲场景。', img: a5Image, categories: ['摄像追踪'] },
  { id: 'a18', name: '会议办公大模型信创一体机D1',      desc: 'AI 语音记录、AI要点总结、AI一键纪要、AI待办生成', img: a18Image, categories: ['控制·投屏'] },
  { id: 'a19', name: 'BYOM 投屏套装',                desc: '无线投屏、BYOM会议、HDMI矩阵切换、中控四合一，4K@60Hz，双网隔离', img: a19Image, categories: ['控制·投屏'] },
  { id: 'a99', name: '后续产品尽情期待',       desc: '', img: quickImage, categories: [] },
];

const CATEGORIES = ['all', '吸顶麦克风', '矩阵麦克风', '摄像追踪', '会议音箱', '控制·投屏'] as const;

const cases = [
  { id: 'e1',  tag: '高等教育', name: '中国香港科技大学',             img: e1Image, category: '教育院校' },
  { id: 'e2',  tag: '高等教育', name: '上海交通大学',                 img: e2Image, category: '教育院校' },
  { id: 'e3',  tag: '学前教育', name: '上海虹口艺术幼儿园',           img: e3Image, category: '教育院校' },
  { id: 'e4',  tag: '高等教育', name: '华东师范大学',                 img: e4Image, category: '教育院校' },
  { id: 'e5',  tag: '高等教育', name: '北京理工大学',                 img: e5Image, category: '教育院校' },
  { id: 'e6',  tag: '高等教育', name: '成都大学',                     img: e6Image, category: '教育院校' },
  { id: 'e7',  tag: '大型活动', name: '苏州广电跨年演讲晚会',         img: e7Image, category: '大型活动' },
  { id: 'e8',  tag: '酒店会场', name: '苏州独墅湖世尊酒店',           img: e8Image, category: '酒店会场' },
  { id: 'e9',  tag: '金融机构', name: '国泰基金',                     img: e9Image, category: '政企金融' },
  { id: 'e10', tag: '医疗机构', name: '上海仁济医院',                 img: e10Image, category: '政企金融' },
  { id: 'e11', tag: '物流企业', name: '国际陆港集团',                 img: e11Image, category: '政企金融' },
  { id: 'e12', tag: '金融科技', name: '成都新希望金融科技',           img: e12Image, category: '政企金融' },
];

const CASE_CATEGORIES = ['all', '教育院校', '政企金融', '酒店会场', '大型活动'] as const;

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Home() {
  const location = useLocation();

  // 产品场景过滤
  const [activeCat, setActiveCat] = useState<typeof CATEGORIES[number]>('all');
  const filteredProducts =
    activeCat === 'all'
      ? products
      : products.filter((p) => p.categories.includes(activeCat));

  // 案例行业过滤
  const [caseCat, setCaseCat] = useState<typeof CASE_CATEGORIES[number]>('all');
  const filteredCases =
    caseCat === 'all'
      ? cases
      : cases.filter((c) => c.category === caseCat);

  // Hero 滚动视差
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroWrapY = useTransform(heroProgress, [0, 1], [0, -60]);
  const heroWrapOpacity = useTransform(heroProgress, [0, 0.85], [1, 0]);
  const heroLogoY = useTransform(heroProgress, [0, 1], [0, -40]);
  const heroLogoScale = useTransform(heroProgress, [0, 1], [1, 0.82]);

  // CTA 滚动视差背景
  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ['start end', 'end start'],
  });
  const ctaGlowY = useTransform(ctaProgress, [0, 1], [-80, 80]);
  const ctaGlowScale = useTransform(ctaProgress, [0, 0.5, 1], [0.8, 1.1, 0.9]);

  // 从其他页面导航过来时，滚动到指定区块
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      // 等待 DOM 渲染
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById(state.scrollTo!);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        });
      });
      // 清除 state 避免重复滚动
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <>
      <SeoHead
        title="恒迪视讯 - 专业音视频解决方案 | MC10 MA600D MCS06 C40T MT100 MC08 M12 C60 AIMIC-B100"
        description="恒迪视讯代理思必驰AISPEECH智能会议产品：MC10吸顶麦克风、MA600D矩阵麦克风、MCS06拾扩一体吸顶麦、C40T视频会议室摄像机、MT100声像追踪主机、DC20PoE吸顶音箱、MC08教学吸顶麦、M12会议麦克风音箱、C60 AI追踪摄像头、AIMIC-B100桌面控制器。服务高校、企业、政府、酒店。"
        url="/"
        breadcrumbs={[{ name: '首页', url: '/' }]}
        itemList={products.filter(p => p.id !== 'a99').map(p => ({
          name: p.name,
          url: `/product/${p.id}`,
        }))}
      />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --warm-canvas:      #faf9f5;
          --warm-primary:     #cc785c;
          --warm-primary-active: #a9583e;
          --warm-ink:         #141413;
          --warm-body:        #3d3d3a;
          --warm-muted:       #6c6a64;
          --warm-hairline:    #e6dfd8;
          --warm-surface:     #efe9de;
          --warm-surface-dark: #181715;
          --warm-on-dark:     #faf9f5;
          --warm-on-dark-soft:#a09d96;
          --warm-card-hover:  #f4efe6;
          --nav-h: 64px;
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }
        .hd-page {
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        .hd-page { background: var(--warm-canvas); color: var(--warm-body); overflow-x: hidden; }

        .hd-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: var(--nav-h);
          background: rgba(250,249,245,0.85);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid var(--warm-hairline);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
        }
        .hd-nav .nav-logo {
          font-family: var(--font-display);
          font-size: 20px; font-weight: 500; color: var(--warm-ink);
          letter-spacing: -0.02em; text-decoration: none; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
        }
        .hd-nav .nav-logo-icon {
          height: 36px; width: auto; display: block;
        }
        .hd-nav .nav-links { display: flex; gap: 28px; list-style: none; }
        .hd-nav .nav-links span {
          font-size: 14px; font-weight: 400; color: var(--warm-muted);
          text-decoration: none; letter-spacing: -0.1px; cursor: pointer;
          transition: color 0.15s;
        }
        .hd-nav .nav-links span:hover { color: var(--warm-ink); }
        .hd-nav .nav-cta {
          font-size: 14px; color: var(--warm-primary);
          text-decoration: none; letter-spacing: -0.1px; cursor: pointer;
        }
        .hd-nav .nav-cta:hover { text-decoration: underline; }

        .hd-hero {
          min-height: 100vh;
          background: var(--warm-canvas);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: calc(var(--nav-h) + 60px) 24px 80px;
          position: relative; overflow: hidden;
        }
        .hd-hero::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: var(--warm-hairline);
        }
        .hd-hero .hero-logo-wrap {
          margin-bottom: 20px;
        }
        .hd-hero .hero-logo {
          height: 192px; width: auto; display: block;
          mix-blend-mode: multiply;
        }
        .hd-hero .hero-eyebrow {
          font-family: var(--font-body);
          font-size: 14px; font-weight: 400;
          color: var(--warm-muted);
          letter-spacing: 0.4px; margin-bottom: 16px;
        }
        .hd-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 400; line-height: 1.08;
          letter-spacing: -0.03em;
          color: var(--warm-ink);
          max-width: 760px;
        }
        .hd-hero .hero-sub {
          font-family: var(--font-body);
          font-size: clamp(17px, 2.5vw, 20px);
          font-weight: 400; line-height: 1.45;
          color: var(--warm-muted);
          margin-top: 20px; max-width: 540px;
          letter-spacing: -0.01em;
        }
        .hd-hero .hero-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          justify-content: center; margin-top: 36px;
        }
        .hd-hero .btn-primary {
          display: inline-block;
          background: var(--warm-primary); color: #fff;
          font-family: var(--font-body);
          font-size: 15px; font-weight: 500; text-decoration: none;
          padding: 10px 20px; border-radius: 8px; cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .hd-hero .btn-primary:hover { background: var(--warm-primary-active); }
        .hd-hero .btn-primary:active { transform: scale(0.97); }
        .hd-hero .btn-outline {
          display: inline-block;
          background: transparent; color: var(--warm-ink);
          font-family: var(--font-body);
          font-size: 15px; font-weight: 400; text-decoration: none;
          padding: 9px 19px; border-radius: 8px;
          border: 1px solid var(--warm-hairline);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, transform 0.1s;
        }
        .hd-hero .btn-outline:hover { border-color: var(--warm-primary); background: rgba(204,120,92,0.04); }
        .hd-hero .btn-outline:active { transform: scale(0.97); }
        .hd-hero .hero-stats {
          display: flex; gap: 48px; flex-wrap: wrap;
          justify-content: center; margin-top: 72px;
          border-top: 1px solid var(--warm-hairline);
          padding-top: 40px; width: 100%; max-width: 780px;
        }
        .hd-hero .stat { text-align: center; }
        .hd-hero .stat-num {
          font-family: var(--font-display);
          font-size: 36px; font-weight: 500;
          color: var(--warm-ink); letter-spacing: -0.03em;
        }
        .hd-hero .stat-label {
          font-size: 13px; color: var(--warm-muted);
          margin-top: 4px; letter-spacing: -0.1px;
        }

        .hd-section-light {
          background: var(--warm-canvas);
          color: var(--warm-body);
          padding: 96px 24px;
        }
        .hd-section-gray {
          background: var(--warm-surface);
          color: var(--warm-body);
          padding: 96px 24px;
        }
        .hd-section-inner { max-width: 1040px; margin: 0 auto; }

        .hd-section-eyebrow {
          font-family: var(--font-body);
          font-size: 13px; font-weight: 500; letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 8px;
          color: var(--warm-muted);
        }

        .hd-section-title {
          font-family: var(--font-display);
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 400; line-height: 1.12;
          letter-spacing: -0.03em;
          color: var(--warm-ink);
          margin-bottom: 12px;
        }
        .hd-section-desc {
          font-family: var(--font-body);
          font-size: 16px; line-height: 1.55;
          letter-spacing: -0.01em;
          color: var(--warm-muted);
          max-width: 540px;
          margin-bottom: 56px;
        }

        .hd-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .hd-product-card {
          background: var(--warm-canvas);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--warm-hairline);
          display: flex; flex-direction: column;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .hd-product-card:hover {
          border-color: var(--warm-primary);
          background: var(--warm-card-hover);
          box-shadow: 0 12px 28px -12px rgba(20,20,19,0.18);
        }
        .hd-product-img-wrap {
          background: var(--warm-surface);
          aspect-ratio: 16/10;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          position: relative;
          perspective: 900px;
        }
        .hd-product-img-wrap img {
          width: 100%; height: 100%; object-fit: contain;
          padding: 8px;
          mix-blend-mode: multiply;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: center;
          will-change: transform;
        }
        .hd-product-card:hover .hd-product-img-wrap img {
          transform: scale(1.05) rotateY(-3deg) rotateX(1.5deg);
        }
        .hd-product-info { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        .hd-product-name {
          font-family: var(--font-display);
          font-size: 18px; font-weight: 500;
          color: var(--warm-ink);
          letter-spacing: -0.02em; margin-bottom: 6px;
        }
        .hd-product-desc {
          font-family: var(--font-body);
          font-size: 13px; line-height: 1.5;
          color: var(--warm-muted);
          letter-spacing: -0.01em;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hd-product-link {
          display: inline-block; margin-top: 14px;
          font-family: var(--font-body);
          font-size: 14px; font-weight: 500;
          color: var(--warm-primary);
          text-decoration: none; letter-spacing: -0.01em;
        }
        .hd-product-link:hover { color: var(--warm-primary-active); }

        .hd-feature-strip {
          background: var(--warm-surface);
          padding: 80px 24px;
        }
        .hd-feature-inner {
          max-width: 1040px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1px;
        }
        .hd-feature-item {
          background: var(--warm-canvas);
          padding: 40px 32px;
          transition: background 0.15s;
        }
        .hd-feature-item:first-child { border-radius: 12px 0 0 12px; }
        .hd-feature-item:last-child  { border-radius: 0 12px 12px 0; }
        .hd-feature-icon {
          width: 32px; height: 32px; margin-bottom: 16px; display: block;
          color: var(--warm-primary);
        }
        .hd-feature-title {
          font-family: var(--font-display);
          font-size: 20px; font-weight: 500;
          color: var(--warm-ink);
          letter-spacing: -0.02em; margin-bottom: 8px;
        }
        .hd-feature-body {
          font-family: var(--font-body);
          font-size: 14px; line-height: 1.55;
          color: var(--warm-muted);
          letter-spacing: -0.01em;
        }

        .hd-case-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        /* 场景过滤 tab */
        .hd-cat-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
          padding-bottom: 4px;
        }
        .hd-cat-tab {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          padding: 8px 18px;
          background: transparent;
          color: var(--warm-muted);
          border: 1px solid var(--warm-hairline);
          border-radius: 999px;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: color 0.15s, background 0.15s, border-color 0.15s;
        }
        .hd-cat-tab:hover {
          color: var(--warm-ink);
          border-color: var(--warm-primary);
        }
        .hd-cat-tab.active {
          background: var(--warm-primary);
          color: #fff;
          border-color: var(--warm-primary);
        }

        /* 案例横向画廊 */
        .hd-case-scroller-hint {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .hd-case-hint-label {
          font-family: var(--font-body);
          font-size: 11px;
          color: var(--warm-muted);
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .hd-case-arrows { display: flex; gap: 8px; }
        .hd-case-arrow {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid var(--warm-hairline);
          background: var(--warm-canvas);
          color: var(--warm-ink);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          transition: border-color 0.15s, color 0.15s, background 0.15s, transform 0.1s;
        }
        .hd-case-arrow:hover:not(:disabled) {
          border-color: var(--warm-primary);
          color: var(--warm-primary);
          background: rgba(204,120,92,0.06);
        }
        .hd-case-arrow:active:not(:disabled) { transform: scale(0.94); }
        .hd-case-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .hd-case-scroller {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 8px 0 20px;
          scroll-snap-type: x mandatory;
          margin: 0 -24px;
          padding-left: 24px;
          padding-right: 24px;
        }
        .hd-case-scroller::-webkit-scrollbar { display: none; }
        .hd-case-card-wide {
          flex: 0 0 300px;
          scroll-snap-align: start;
        }
        @media (min-width: 640px) { .hd-case-card-wide { flex: 0 0 320px; } }
        .hd-case-card {
          background: var(--warm-canvas);
          border-radius: 12px; overflow: hidden;
          border: 1px solid var(--warm-hairline);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          text-decoration: none;
          display: block;
        }
        .hd-case-card:hover {
          border-color: var(--warm-primary);
          background: var(--warm-card-hover);
          box-shadow: 0 12px 28px -12px rgba(20,20,19,0.18);
        }
        .hd-case-img-wrap {
          aspect-ratio: 16/10;
          overflow: hidden;
          position: relative;
        }
        .hd-case-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hd-case-card:hover .hd-case-img-wrap img { transform: scale(1.06); }
        /* 案例遮罩：从左滑入 */
        .hd-case-img-wrap::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(110deg, rgba(204,120,92,0.0), rgba(204,120,92,0.22));
          transform: translateX(-100%);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .hd-case-card:hover .hd-case-img-wrap::after { transform: translateX(0); }
        .hd-case-info { padding: 16px 20px; }
        .hd-case-tag {
          font-family: var(--font-body);
          font-size: 11px; font-weight: 500;
          color: var(--warm-primary);
          letter-spacing: 0.04em; text-transform: uppercase;
          margin-bottom: 4px;
        }
        .hd-case-name {
          font-family: var(--font-display);
          font-size: 16px; font-weight: 500;
          color: var(--warm-ink);
          letter-spacing: -0.02em;
        }

        .hd-cta-band {
          background: var(--warm-surface-dark);
          padding: 96px 24px; text-align: center;
        }
        .hd-cta-band h2 {
          font-family: var(--font-display);
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 400; line-height: 1.12;
          color: var(--warm-on-dark);
          letter-spacing: -0.03em; margin-bottom: 12px;
        }
        .hd-cta-band p {
          font-family: var(--font-body);
          font-size: 16px; color: var(--warm-on-dark-soft);
          letter-spacing: -0.01em; margin-bottom: 36px;
        }
        .hd-cta-band .btn-white {
          display: inline-block;
          background: var(--warm-on-dark); color: var(--warm-ink);
          font-family: var(--font-body);
          font-size: 15px; font-weight: 500; text-decoration: none;
          padding: 10px 24px; border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .hd-cta-band .btn-white:hover { background: var(--warm-hairline); }
        .hd-cta-band .btn-white:active { transform: scale(0.97); }

        .hd-footer {
          background: var(--warm-surface-dark);
          padding: 56px 24px 40px;
          color: var(--warm-on-dark-soft);
        }
        .hd-footer-inner {
          max-width: 1040px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 40px; margin-bottom: 28px;
        }
        .hd-footer-brand { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--warm-on-dark); margin-bottom: 8px; }
        .hd-footer-desc { font-size: 13px; line-height: 1.6; color: var(--warm-on-dark-soft); }
        .hd-footer-head { font-family: var(--font-body); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: var(--warm-on-dark-soft); margin-bottom: 14px; }
        .hd-footer-links { list-style: none; }
        .hd-footer-links li { margin-bottom: 4px; }
        .hd-footer-links a { font-size: 13px; color: var(--warm-on-dark-soft); text-decoration: none; }
        .hd-footer-links a:hover { color: var(--warm-on-dark); }
        .hd-footer-contact p { font-size: 13px; line-height: 1.8; color: var(--warm-on-dark-soft); }
        .hd-footer-contact a { color: var(--warm-on-dark-soft); text-decoration: none; }
        .hd-footer-contact a:hover { color: var(--warm-primary); }
        .hd-footer-bottom {
          max-width: 1040px; margin: 0 auto;
          font-size: 12px; line-height: 1.5;
          display: flex; flex-wrap: wrap; gap: 12px;
          justify-content: space-between; align-items: center;
          color: var(--warm-on-dark-soft);
        }
        .hd-footer-bottom a { color: var(--warm-on-dark-soft); text-decoration: none; }
        .hd-footer-bottom a:hover { color: var(--warm-on-dark); }
        .hd-footer-bottom .beian-row {
          display: flex; align-items: center; gap: 6px;
          flex-wrap: wrap;
        }
        .hd-footer-bottom .beian-icon {
          width: 14px; height: 14px; flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .hd-nav .nav-links { display: none; }
          .hd-footer-inner { grid-template-columns: 1fr; }
          .hd-hero .hero-stats { gap: 28px; }
          .hd-feature-item:first-child, .hd-feature-item:last-child { border-radius: 12px; }
          .hd-feature-inner { grid-template-columns: 1fr 1fr; gap: 2px; }
        }
        @media (max-width: 480px) {
          .hd-feature-inner { grid-template-columns: 1fr; gap: 2px; }
          .hd-feature-item { border-radius: 0; }
          .hd-hero .hero-actions { flex-direction: column; align-items: center; }
        }
      `}</style>

      <div className="hd-page">

        {/* NAV */}
        <Navigation />

        {/* 鼠标跟随光晕（桌面端） */}
        <MouseGlow />

        {/* HERO */}
        <motion.div ref={heroRef} style={{ y: heroWrapY, opacity: heroWrapOpacity }}>
        <motion.section
          className="hd-hero"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
          }}
        >
          <motion.div
            className="hero-logo-wrap"
            style={{ y: heroLogoY, scale: heroLogoScale }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
          >
            <img src={aispeechLogo} alt="AISPEECH" className="hero-logo" />
          </motion.div>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
          >
            <motion.span style={{ display: 'inline-block' }} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}>智能音视频</motion.span>
            <br />
            <motion.span style={{ display: 'inline-block' }} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}>重新定义会议体验</motion.span>
          </motion.h1>
          <motion.p
            className="hero-sub"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
          >专业吸顶麦克风、音箱、AI 追踪摄像机、声像主机<br />服务高校、企业、政府与酒店</motion.p>
          <motion.div
            className="hero-actions"
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
          >
            <span className="btn-primary" onClick={() => scrollTo('products')}>探索产品</span>
            <span className="btn-outline" onClick={() => scrollTo('footer')}>样品 / 预约体验</span>
          </motion.div>
          <motion.div
            className="hero-stats"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
          >
            <div className="stat">
              <div className="stat-num"><CountUp to={14} suffix="+" /></div>
              <div className="stat-label">核心产品线</div>
            </div>
            <div className="stat">
              <div className="stat-num"><CountUp to={12} /></div>
              <div className="stat-label">标杆案例</div>
            </div>
            <div className="stat">
              <div className="stat-num"><CountUp to={128} /></div>
              <div className="stat-label">麦克风阵列单元（MC10）</div>
            </div>
            <div className="stat">
              <div className="stat-num"><CountUp to={4} suffix="K" /></div>
              <div className="stat-label">超高清会议视频（C40T）</div>
            </div>
          </motion.div>
        </motion.section>
        </motion.div>

        {/* FEATURE STRIP */}
        <div className="hd-feature-strip">
          <div className="hd-feature-inner">
            <Reveal className="hd-feature-item" direction="up" delay={0} duration={0.6} as="div">
              <svg className="hd-feature-icon" viewBox="0 0 32 32" fill="none">
                <rect x="12" y="4" width="8" height="16" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 12v4a8 8 0 0016 0v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="16" y1="20" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="28" x2="22" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div className="hd-feature-title">AI 麦克风阵列</div>
              <div className="hd-feature-body">最多 128 单元全向拾音，16 个独立配置拾音区，精准隔离，AI 降噪。</div>
            </Reveal>
            <Reveal className="hd-feature-item" direction="up" delay={0.1} duration={0.6} as="div">
              <svg className="hd-feature-icon" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M22 22l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              <div className="hd-feature-title">AI 声像追踪</div>
              <div className="hd-feature-body">多目标跟踪、自动取景，实时锁定发言人，4K 超高清输出。</div>
            </Reveal>
            <Reveal className="hd-feature-item" direction="up" delay={0.2} duration={0.6} as="div">
              <svg className="hd-feature-icon" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="24" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 18l4 6h12l4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="hd-feature-title">拾扩一体</div>
              <div className="hd-feature-body">吸顶麦克风与音箱合体，PoE 供电，{' >'}18dB 增益，覆盖大空间。</div>
            </Reveal>
            <Reveal className="hd-feature-item" direction="up" delay={0.3} duration={0.6} as="div">
              <svg className="hd-feature-icon" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <ellipse cx="16" cy="16" rx="6" ry="10" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="4" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="4" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <div className="hd-feature-title">Dante 数字音频</div>
              <div className="hd-feature-body">支持 Dante / AES67 标准，48kHz 采样，低延迟 &lt;15ms 数字传输。</div>
            </Reveal>
          </div>
        </div>

        {/* PRODUCTS */}
        <section className="hd-section-gray scroll-mt-16" id="products">
          <div className="hd-section-inner">
             <Reveal direction="up" as="p" className="hd-section-eyebrow">思必驰</Reveal>
             <Reveal direction="up" delay={0.08} as="h2" className="hd-section-title">产品系列</Reveal>
             <Reveal direction="up" delay={0.16} as="p" className="hd-section-desc" style={{ maxWidth: 'none' }}>专为现代会议室设计的智能音视频设备，覆盖从教室到大礼堂的全场景需求。</Reveal>

            {/* 场景过滤 tab */}
            <Reveal direction="up" delay={0.2}>
              <div className="hd-cat-tabs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`hd-cat-tab ${activeCat === cat ? 'active' : ''}`}
                    onClick={() => setActiveCat(cat)}
                    type="button"
                  >
                    {cat === 'all' ? '全部' : cat}
                  </button>
                ))}
              </div>
            </Reveal>

            <motion.div layout className="hd-product-grid">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p, i) => (
                  <motion.div
                    layout
                    key={p.id}
                    className="hd-product-card"
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="hd-product-img-wrap">
                      <img src={p.img} alt={p.name} loading="lazy" />
                    </div>
                    <div className="hd-product-info">
                      <div className="hd-product-name">{p.name}</div>
                      <div className="hd-product-desc">{p.desc || '更多产品即将上线，敬请期待。'}</div>
                      {p.id !== 'a99' ? (
                        <Link to={`/product/${p.id}`} className="hd-product-link">了解更多</Link>
                      ) : (
                        <span className="hd-product-link" style={{ color: '#999', cursor: 'default' }}>即将上线</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* CASES */}
        <section className="hd-section-light scroll-mt-16" id="cases">
          <div className="hd-section-inner">
             <Reveal direction="up" as="p" className="hd-section-eyebrow">思必驰</Reveal>
             <Reveal direction="up" delay={0.08} as="h2" className="hd-section-title">案例集锦</Reveal>
             <Reveal direction="up" delay={0.16} as="p" className="hd-section-desc">服务高校、金融机构、酒店及政企客户，每一个案例都是信任的见证。</Reveal>

            {/* 案例行业过滤 tab */}
            <Reveal direction="up" delay={0.2}>
              <div className="hd-cat-tabs">
                {CASE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`hd-cat-tab ${caseCat === cat ? 'active' : ''}`}
                    onClick={() => setCaseCat(cat)}
                    type="button"
                  >
                    {cat === 'all' ? '全部' : cat}
                  </button>
                ))}
              </div>
            </Reveal>

            <motion.div layout className="hd-case-grid">
              <AnimatePresence mode="popLayout">
                {filteredCases.map((c, i) => (
                  <motion.div
                    layout
                    key={c.id}
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={`/case/${c.id}`} className="hd-case-card">
                      <div className="hd-case-img-wrap">
                        <img src={c.img} alt={c.name} loading="lazy" />
                      </div>
                      <div className="hd-case-info">
                        <div className="hd-case-tag">{c.tag}</div>
                        <div className="hd-case-name">{c.name}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="hd-section-gray scroll-mt-16" id="about">
          <div className="hd-section-inner">
            <Reveal direction="up" as="p" className="hd-section-eyebrow">关于恒迪视讯</Reveal>
            <Reveal direction="up" delay={0.08} as="h2" className="hd-section-title">专注音视频<br />企业级系统集成</Reveal>
            <Reveal direction="up" delay={0.16} as="p" className="hd-section-desc">
              恒迪视讯是思必驰 AISPEECH 的授权代理商，总部位于杭州余杭，专注为教育、企业、政府和酒店客户提供专业级音视频集成解决方案。提供样品试用、现场测试、工程设计与售后支持的全流程服务。
            </Reveal>
            <Reveal direction="up" delay={0.24}>
              <Link to="/faq" style={{ display: 'inline-block', fontSize: 15, fontFamily: 'var(--font-body)', fontWeight: 500, padding: '10px 20px', background: 'var(--warm-primary)', color: '#fff', borderRadius: 8, textDecoration: 'none', marginRight: 12, marginBottom: 12 }}>
                常见问题 FAQ
              </Link>
              <span onClick={() => scrollTo('footer')} style={{ display: 'inline-block', fontSize: 15, fontFamily: 'var(--font-body)', padding: '9px 19px', border: '1px solid var(--warm-hairline)', color: 'var(--warm-ink)', borderRadius: 8, textDecoration: 'none', cursor: 'pointer' }}>
                预约体验 / 申请样品
              </span>
            </Reveal>
          </div>
        </section>

        {/* CTA BAND */}
        <div className="hd-cta-band" ref={ctaRef} style={{ position: 'relative', overflow: 'hidden' }}>
          {/* 星空背景 */}
          <StarField density={90} style={{ zIndex: 0 }} />
          {/* 视差光晕 */}
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 600, height: 600,
              marginLeft: -300, marginTop: -300,
              borderRadius: '50%',
              y: ctaGlowY,
              scale: ctaGlowScale,
              background: 'radial-gradient(circle, rgba(204,120,92,0.28) 0%, rgba(204,120,92,0.08) 40%, rgba(204,120,92,0) 70%)',
              pointerEvents: 'none',
              zIndex: 1,
              mixBlendMode: 'screen',
            }}
          />
          <div style={{ position: 'relative', zIndex: 2 }}>
          <Reveal direction="up" as="h2" className="" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.12, color: 'var(--warm-on-dark)', letterSpacing: '-0.03em', marginBottom: 12 }}>准备好升级您的会议室了吗？</Reveal>
          <Reveal direction="up" delay={0.12} as="p" style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--warm-on-dark-soft)', letterSpacing: '-0.01em', marginBottom: 36 }}>样品试用 · 现场演示 · 工程设计 · 全程支持</Reveal>
          <Reveal direction="up" delay={0.24}>
            <span className="btn-white" onClick={() => scrollTo('footer')}>联系我们</span>
          </Reveal>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="hd-footer scroll-mt-16" id="footer">
          <div className="hd-footer-inner">
            <div>
              <div className="hd-footer-brand">恒迪视讯</div>
              <p className="hd-footer-desc">思必驰 AISPEECH 授权代理商<br />杭州余杭 · 专业音视频集成<br />专注为教育、企业、政府、酒店客户提供智能会议系统、音视频集成解决方案及全流程服务。</p>
              <div className="mt-4 flex flex-col items-start">
                <span className="text-sm font-medium mb-2" style={{ color: 'var(--warm-on-dark-soft)' }}>公司公众号</span>
                <img src={qrcodeImage} alt="恒迪视讯公众号二维码" className="w-28 h-28 object-contain rounded-md bg-white p-1" loading="lazy" />
              </div>
            </div>
            <div>
              <div className="hd-footer-head">主要产品系列</div>
              <ul className="hd-footer-links">
                <li><Link to="/product/a1">MC10 吸顶麦克风</Link></li>
                <li><Link to="/product/a2">MA600D 矩阵麦克风</Link></li>
                <li><Link to="/product/a10">AIMIC-B100 桌面控制器</Link></li>
                <li><Link to="/product/a12">MK300 桌面安装套件</Link></li>
                <li><Link to="/product/a3">MCS06 拾扩一体吸顶麦克风</Link></li>
                <li><Link to="/product/a11">MC04 高端吸顶麦克风-教育款</Link></li>
                <li><Link to="/product/a19">思必驰BYOM投屏套装</Link></li>
              </ul>
            </div>
            <div className="hd-footer-contact">
              <div className="hd-footer-head">联系我们</div>
              <p>
                电话：<a href="tel:18814845538">18814845538</a><br />
                邮箱：<a href="mailto:guo@techhdi.com">guo@techhdi.com</a><br />
                地址：杭州市余杭区七彩汇商业中心 2-305 室
              </p>
            </div>
          </div>
          <div className="hd-footer-bottom">
            <span>© 2026 恒迪视讯 All rights reserved.</span>
            <span className="beian-row">
              <a href="http://beian.miit.gov.cn/" target="_blank" rel="nofollow noopener">浙ICP备2026007647号-1</a>
              <img className="beian-icon" src="https://beian.mps.gov.cn/img/logo01.dd7ff50e.png" alt="公安备案" />
              <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=33011002019014" target="_blank" rel="noreferrer">浙公网安备33011002019014号</a>
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
