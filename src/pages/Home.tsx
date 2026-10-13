import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Navigation from '../components/Navigation';
import SeoHead from '../components/SeoHead';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';
import MouseGlow from '../components/MouseGlow';
import SoundField from '../components/SoundField';
import HeroCarousel from '../components/HeroCarousel/HeroCarousel';
import Ma600dField from '../components/Ma600dField';
import RoomPicker from '../components/RoomPicker';
// 品牌层：首页「产品系列」区块的品牌卡片从这里派生（src/data/brands.json）
import {
  BRAND_VIEWS,
  PRIMARY_BRAND_ID,
  brandImage,
  type BrandProduct,
} from '../data/brands';
// 案例数据来自单一事实源 src/data/cases.json
import { CASES, CASE_CATEGORIES as CASE_CATEGORY_LIST } from '../data/cases';
import { CASE_IMAGE_BY_KEY } from '../data/productImages';
import { responsiveImage, CARD_SIZES } from '../data/responsiveImage';
import quickImage from '../assets/images/aispeech-logo.png';
import aispeechLogo from '../assets/images/aispeech-logo1.png';
import qrcodeImage from '../assets/images/qrcode.jpg';
import addressMapImage from '../assets/images/company-address-map.webp';

/**
 * 品牌卡片视图模型。
 *
 * 数据全部由 src/data/brands.json 派生 —— 首页的「产品系列」区块现在是
 * 「一张品牌卡片 = 一个品牌」，加品牌 / 加产品都不需要改这个文件：
 *   · 主品牌（思必驰）的卡片来自 products.json，详情页、站内搜索照旧
 *   · 其他品牌的卡片来自 src/data/brands/<id>.json，是纯展示卡片
 */
interface HomeBrandCard {
  id: string;
  name: string;
  desc: string;
  /** 分类，用于区块内的场景筛选；占位卡为空 */
  category?: string;
  /** 卡片图 URL；没有图时为 undefined，组件渲染 CSS 占位图（不会出现破图） */
  img?: string;
  srcSet?: string;
  sizes?: string;
  /** 站内 /product/<id> 或外部链接；undefined = 资料未到位，卡片不可点 */
  href?: string;
  /** true = 资料准备中，卡片显示「即将上线」 */
  soon: boolean;
}

interface HomeBrand {
  id: string;
  /** tab 上的文字 */
  tabLabel: string;
  eyebrow: string;
  tagline: string;
  /** 品牌强调色（来自 brands.json），供 tab 用 */
  color: string;
  /** 该品牌真实产品数（不含「敬请期待」占位卡），显示在 tab 上 */
  count: number;
  /** 该品牌产品覆盖的分类（已按出现顺序去重） */
  categories: string[];
  cards: HomeBrandCard[];
  /** 没有任何产品时显示的空态文案 */
  emptyState?: string;
  /** 末尾是否补一张「后续产品尽情期待」占位卡 */
  placeholderCard: boolean;
}

const BRANDS: HomeBrand[] = BRAND_VIEWS.map((brand) => {
  const cards: HomeBrandCard[] = brand.products.map((p: BrandProduct) => {
    const img = brandImage(p.cardImage);
    const responsive = img ? responsiveImage(p.cardImage!, img, CARD_SIZES) : {};
    return {
      id: p.id,
      name: p.name,
      desc: p.desc || '',
      category: p.category,
      img,
      ...responsive,
      href: p.href,
      soon: p.status === 'soon' || !p.href,
    };
  });

  /**
   * 占位卡只在**该品牌已经有产品**时补。
   *
   * 曾经无条件补，结果是：一个还没有任何产品的品牌，区块里只孤零零立着一张
   * 「后续产品尽情期待」，配的是思必驰的 logo —— 既误导（看着像有产品可点），
   * 又把真正的空态提示挤掉了。空品牌应该显示空态，有产品的品牌才需要「更多在后面」的收尾。
   */
  if (brand.placeholderCard && cards.length > 0) {
    cards.push({
      id: `${brand.id}-more`,
      name: '后续产品尽情期待',
      desc: '',
      img: quickImage,
      soon: true,
    });
  }

  // 分类只列真正有产品的项，避免点了必然 0 结果
  const categories = Array.from(
    new Set(brand.products.map((p) => p.category).filter(Boolean) as string[])
  );

  return {
    id: brand.id,
    tabLabel: brand.tabLabel,
    eyebrow: brand.eyebrow,
    tagline: brand.tagline,
    color: brand.color,
    count: brand.products.length,
    categories,
    cards,
    emptyState: brand.emptyState,
    placeholderCard: !!brand.placeholderCard,
  };
});
/** 首页案例卡片视图模型 —— 由 cases.json 派生 */
const cases = CASES.map((c) => {
  const img = CASE_IMAGE_BY_KEY[c.cardImage];
  const { srcSet, sizes } = responsiveImage(c.cardImage, img, CARD_SIZES);
  return {
    id: c.id,
    tag: c.tag,
    name: c.name,
    img,
    srcSet,
    sizes,
    category: c.category,
  };
});

const CASE_CATEGORIES: string[] = ['all', ...CASE_CATEGORY_LIST];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Home() {
  const location = useLocation();

  /**
   * 产品系列：品牌卡片（tab）+ 场景过滤。
   * 默认选中主品牌（brands.json 里 isPrimary 的那个），首屏内容与加品牌之前一致。
   * 切换品牌时把场景筛选重置回「全部」，否则会出现「新品牌 + 上一个品牌的分类」
   * 这种必然 0 结果的组合。
   */
  const [activeBrand, setActiveBrand] = useState<string>(PRIMARY_BRAND_ID);
  const [activeCat, setActiveCat] = useState<string>('all');
  const currentBrand =
    BRANDS.find((b) => b.id === activeBrand) || BRANDS[0];
  const visibleCards = currentBrand
    ? activeCat === 'all'
      ? currentBrand.cards
      : currentBrand.cards.filter((c) => c.category === activeCat)
    : [];

  const selectBrand = (id: string) => {
    setActiveBrand(id);
    setActiveCat('all');
  };

  // 案例行业过滤
  const [caseCat, setCaseCat] = useState<string>('all');
  const [mapPreview, setMapPreview] = useState(false);
  const [qrPreview, setQrPreview] = useState(false);
  const filteredCases =
    caseCat === 'all'
      ? cases
      : cases.filter((c) => c.category === caseCat);

  // Hero 滚动视差
  const heroRef = useRef<HTMLDivElement>(null);
  /**
   * 注意：useScroll/useTransform 是**直接绑定**到 style 的 motion value，
   * 不经过 framer 的动画管线，因此 <MotionConfig reducedMotion="user"> 管不到它们，
   * 必须在此显式降级，否则减弱动效的用户依旧会被滚动视差影响。
   */
  const prefersReduced = useReducedMotion();
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
      />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        /* 设计 token 已上移到 src/index.css 的 :root，成为全站唯一字面量来源。
           此处不再重复定义，避免出现第二份色值。 */
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
          /* 刚好一屏高，而不是「至少一屏」。
             多了首屏轮播之后，内容自然高度远超一屏，min-height 会让首屏变成
             1360px —— 四个数字在 1440×900 上正好被挤到 839px（只剩 60px 余量），
             轮播整块掉到折叠线以下。改成固定 100vh 后，flex 的居中会把内容
             均分到一屏里，数字与轮播都在首屏内。 */
          height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          /* 底部 32px：轮播带紧随其后还有 28px 上边距，两者相加约 60px。
             曾经是 80px + 44px = 124px —— 那是「首屏之后直接接深色区」时的
             间隙，中间插进轮播后就成了明显的断层。 */
          padding: calc(var(--nav-h) + 36px) 24px 32px;
          position: relative; overflow: hidden;
        }
        /* Hero 机制：天花板阵列的声场与波束（见 components/SoundField.tsx）
           取代原先 659KB 的静态底图 —— 既让动效来自业务本身的物理，
           又把首屏最大的一笔字节开销移出关键路径。 */
        .hd-hero-field {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        /* 径向遮罩：中心（H1 所在）保持高可读性，四周尽量留出声场透出。
           边缘 0.14 是刻意的——声场元素本身很淡，遮罩太厚就等于没有。 */
        .hd-hero-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(
            ellipse 68% 56% at 50% 45%,
            rgba(250,246,242,0.90) 0%,
            rgba(250,246,242,0.60) 50%,
            rgba(250,246,242,0.14) 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        .hd-hero > *:not(.hd-hero-field):not(.hd-hero-overlay) {
          position: relative; z-index: 2;
        }
        .hd-hero::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: var(--warm-hairline);
          z-index: 3;
        }
        .hd-hero .hero-logo-wrap {
          margin-bottom: 20px;
        }
        .hd-hero .hero-logo {
          /* 192px 是「首屏只有 logo + 文案」时的尺寸；多了轮播之后
             它在 900/768 高的屏幕上会挤掉数字行和轮播，所以按屏高分档。
             用 vh 而不是媒体查询：真正的约束是高度，不是宽度。 */
          height: clamp(96px, 15vh, 176px);
          width: auto; display: block;
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
          /* 字号也要看屏高：6vw 在 1440×900 上出 72px 的两行标题（156px 高），
             是首屏里第二大的开支。取 vw 与 vh 的较小值，宽屏矮屏都不会爆。 */
          font-size: min(clamp(40px, 6vw, 72px), 8vh);
          font-weight: 400; line-height: 1.08;
          letter-spacing: -0.03em;
          color: var(--warm-ink);
          max-width: 760px;
        }
        .hd-hero .hero-sub {
          font-family: var(--font-body);
          font-size: clamp(16px, 2.5vw, 20px);
          font-weight: 400; line-height: 1.45;
          color: var(--warm-muted);
          margin-top: 16px; max-width: 540px;
          letter-spacing: -0.01em;
        }
        .hd-hero .hero-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          justify-content: center; margin-top: 26px;
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

        /* ── 产品图轮播（首屏之下的通栏展示带）──────────────────
           数据在 src/data/heroSlides.json；暂停/切换逻辑在
           components/HeroCarousel（含 useCarousel）。

           三条刻意定下的规则，别随手改：
             · 容器高度固定 —— 三张图比例差 3 倍以上（产品图 6.9:1、
               管理套装海报 2:1），跟着图走每切一张整页都会跳
             · 背景恒定 —— 底色只用 --warm-canvas，不跟图片变色；
               图自带的白底/蓝底已经够不同，容器再变色就是双份刺激
             · 图上只有一个左下角名称 —— 不放按钮、不放参数 */
        .hero-carousel-wrap {
          width: 100%;
          max-width: 1040px;
        }
        /* 轮播区块：首屏与「产品系列」之间的一条通栏展示带。
           z-index: 1 是**必需的**，不是装饰 ——
           .hd-hero 是 height:100vh + overflow:hidden，内容比盒子高时
           会溢到这条带子上（实测矮屏上「四个数字」会和轮播的圆点叠在一起）。
           把带子抬到 hero 之上，溢出的那点内容自然被遮住。 */
        .hd-carousel-band {
          position: relative;
          z-index: 1;
          background: var(--warm-canvas);
          padding: 26px 24px 10px;
        }
        .hd-carousel-band-inner {
          max-width: 1040px;
          margin: 0 auto;
        }
        .hd-carousel {
          /* --carousel-h 是舞台高度：**唯一**按屏高调的参数。
             超宽产品图靠 contain 完整显示，海报同理。 */
          --carousel-h: clamp(200px, 27vh, 300px);
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--warm-hairline);
          background: var(--warm-canvas);
          box-shadow: 0 20px 50px -30px rgba(20,20,19,0.45);
        }
        .hd-carousel:focus-visible {
          outline: 2px solid var(--warm-primary);
          outline-offset: 3px;
        }
        /* 舞台：高度固定，图片切换时页面不位移。
           背景**恒定**为 canvas，不跟图片走。 */
        .hd-carousel-stage-inner {
          position: relative;
          width: 100%;
          height: var(--carousel-h);
          background: var(--warm-canvas);
        }
        .hd-carousel-slide {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .hd-carousel-img {
          width: 100%; height: 100%;
          display: block;
        }
        .hd-carousel-img.is-contain {
          object-fit: contain;
          /* 底部多留 34px 给左下角的名称：图是 contain 居中的，
             名称要压在图片下方的空白里，不要压在图身上。 */
          padding: 14px 36px 34px;
        }
        .hd-carousel-img.is-cover {
          object-fit: cover;
        }
        .hd-carousel-missing {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--warm-muted);
          padding: 24px;
          text-align: center;
        }
        /* 左下角的名称：整条展示带上唯一的文字 */
        .hd-carousel-name {
          position: absolute;
          left: 32px; bottom: 20px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--warm-body);
          letter-spacing: -0.01em;
          pointer-events: none;
          max-width: 70%;
        }
        /* 指示点：比一般轮播收敛（6px、无外圈），它是标记不是控件主角 */
        .hd-carousel-dots {
          position: absolute;
          left: 0; right: 0; bottom: 12px;
          display: flex;
          justify-content: center;
          gap: 7px;
        }
        .hd-carousel-dot {
          width: 6px; height: 6px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: var(--warm-hairline);
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .hd-carousel-dot:hover { background: var(--warm-muted); }
        .hd-carousel-dot.active {
          background: var(--warm-muted);
          transform: scale(1.35);
        }
        .hd-carousel-dot:focus-visible {
          outline: 2px solid var(--warm-primary);
          outline-offset: 3px;
        }
        @media (max-width: 820px) {
          .hd-carousel-band { padding: 22px 20px 6px; }
          .hd-carousel { --carousel-h: clamp(170px, 24vh, 240px); }
          .hd-carousel-img.is-contain { padding: 10px 16px 28px; }
          .hd-carousel-name { left: 18px; bottom: 16px; font-size: 13px; }
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

        /* ── 三种不同的区块头形态 ──────────────────────────────
           依据 motion-web 「design-slop.md」A3：
           「一页至少要有 3 种不同的段落形状」——一个页面里每一段都是
           「eyebrow + 标题 + 段落」的同一套堆叠，无论字体多好都会读成模板。
           改动前 产品 / 案例 / 关于 / CTA 四段是完全相同的堆叠。
           现在分别是：分栏带分隔线 / 工具条 / 居中堆叠，CTA 是通栏深色。 */

        /* 形态 A · 分栏：标题在左、描述在右，顶部一条分隔线（产品） */
        .hd-sec-head--split {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 4px 48px;
          align-items: end;
          padding-top: 26px;
          border-top: 1px solid var(--warm-hairline);
          margin-bottom: 32px;
        }
        .hd-sec-head--split .hd-section-desc {
          max-width: none; margin-bottom: 0; padding-bottom: 2px;
        }

        /* 形态 B · 工具条：标题与筛选器同一行，没有独立描述段（案例） */
        .hd-sec-head--toolbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px 32px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .hd-sec-head--toolbar .hd-section-title { margin-bottom: 6px; }
        .hd-sec-head--toolbar .hd-section-desc {
          max-width: 460px; margin-bottom: 0; font-size: 15px;
        }
        .hd-sec-head--toolbar .hd-cat-tabs { margin: 0; flex-shrink: 0; }

        /* 形态 C · 居中堆叠：保留最经典的一种（关于） */
        .hd-sec-head--stack { text-align: center; }
        .hd-sec-head--stack .hd-section-desc {
          margin-left: auto; margin-right: auto;
        }

        @media (max-width: 820px) {
          .hd-sec-head--split { grid-template-columns: 1fr; gap: 0; }
          .hd-sec-head--split .hd-section-desc { margin-bottom: 8px; }
          .hd-sec-head--toolbar { align-items: flex-start; }
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
        /* 资料未到位：保持同样的位置与字号，但不可点、不抢注意力 */
        .hd-product-link.is-pending {
          color: var(--warm-muted);
          cursor: default;
        }
        .hd-product-link.is-pending:hover { color: var(--warm-muted); }

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

        /* ── 品牌切换卡片（产品系列的三个品牌）──────────────────
           刻意做成与下方「场景筛选」不同的一层：卡片有底面、有品牌色顶边，
           选中态用大色块而不是描边 —— 否则两层并排会读成同一组筛选器。
           --brandActive 由 JSX 内联传入（见 brands.json 的 color 字段）。 */
        .hd-brand-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .hd-brand-tab {
          --brandActive: var(--warm-primary);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 500;
          color: var(--warm-body);
          background: var(--warm-canvas);
          border: 1px solid var(--warm-hairline);
          /* 左侧留出的宽度就是品牌色条的位置（用 border 而不是绝对定位的伪元素：
             伪元素一旦忘了 position:relative，整条会跑到区块左上角去） */
          border-left: 3px solid var(--brandActive);
          border-radius: 10px;
          padding: 12px 20px 12px 17px;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: color 0.18s, background 0.18s, border-color 0.18s, opacity 0.18s;
        }
          /* 未选中的品牌：色条压暗到 35%，选中才整条点亮。
             用 color-mix 而不是 rgba()：品牌色是每个品牌各自配的（brands.json），
             写不成一条固定色值；color-mix 在 Chrome 111+ / Safari 16.2+ / Firefox 113+ 均可用，
             不支持的浏览器只是色条不透明，不影响可读性。 */
          border-left-color: color-mix(in srgb, var(--brandActive) 35%, transparent);
        .hd-brand-tab:hover {
          color: var(--warm-ink);
          background: var(--warm-card-hover);
        }
        .hd-brand-tab:focus-visible {
          outline: 2px solid var(--brandActive);
          outline-offset: 2px;
        }
        .hd-brand-tab.active {
          color: var(--warm-ink);
          /* 选中态除了色条与角标，再给一层很淡的品牌色底 ——
             只靠色条的话，三个 tab 在浅底上几乎分不出哪个是选中的。 */
          background: color-mix(in srgb, var(--brandActive) 8%, var(--warm-canvas));
          border-color: var(--warm-hairline);
          border-left-color: var(--brandActive);
        }
        /* 数量角标 */
        .hd-brand-tab-count {
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
          padding: 4px 7px;
          border-radius: 999px;
          color: var(--warm-muted);
          background: var(--warm-surface);
          border: 1px solid var(--warm-hairline);
          transition: color 0.18s, background 0.18s, border-color 0.18s;
        }
        .hd-brand-tab.active .hd-brand-tab-count {
          color: #fff;
          background: var(--brandActive);
          border-color: var(--brandActive);
        }
        @media (max-width: 640px) {
          .hd-brand-tabs { gap: 8px; }
          .hd-brand-tab { font-size: 14px; gap: 8px; padding: 10px 14px 10px 13px; }
        }

        /* ── 无图产品的占位图 ──────────────────────────────────
           素材还没到位时不会有破图：显示型号 + 一层淡色斜纹。 */
        .hd-product-img-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: var(--warm-muted);
          font-family: var(--font-body);
          font-size: 14px;
          letter-spacing: 0.06em;
          text-align: center;
          background-image: repeating-linear-gradient(
            45deg,
            transparent 0 10px,
            rgba(20,20,19,0.035) 10px 20px
          );
        }
        .hd-product-img-empty span {
          border: 1px dashed var(--warm-hairline);
          border-radius: 8px;
          padding: 10px 16px;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        /* 资料未到位的卡片：整卡不可点，但保留「即将上线」的说明 */
        .hd-product-empty {
          grid-column: 1 / -1;
          background: var(--warm-canvas);
          border: 1px dashed var(--warm-hairline);
          border-radius: 12px;
          padding: 40px 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hd-product-empty-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--warm-ink);
          letter-spacing: -0.02em;
        }
        .hd-product-empty-desc {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--warm-muted);
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
        /* MA600D 拾音场点阵：铺满通栏、位于内容之下 */
        .hd-cta-field {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          z-index: 0;
          pointer-events: none;
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

      {/* id/tabIndex 供 App.tsx 的「跳到主要内容」链接定位 */}
      <div className="hd-page" id="main-content" tabIndex={-1}>

        {/* NAV */}
        <Navigation />

        {/* 鼠标跟随光晕（桌面端） */}
        <MouseGlow />

        {/* HERO */}
        <motion.div ref={heroRef} style={prefersReduced ? undefined : { y: heroWrapY, opacity: heroWrapOpacity }}>
        <motion.section
          className="hd-hero"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
          }}
        >
          <SoundField className="hd-hero-field" />
          <div className="hd-hero-overlay" aria-hidden="true" />
          <motion.div
            className="hero-logo-wrap"
            style={prefersReduced ? undefined : { y: heroLogoY, scale: heroLogoScale }}
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
              {/* 由事实源派生，避免新增产品/案例后这个数字失真（原为写死的 14 / 12）。
                  产品数现在是全品牌合计（含玩视智能、恒迪自己的产品），
                  算的是真实产品条目 —— brands.json 里的「敬请期待」占位卡不计入。 */}
              <div className="stat-num">
                <CountUp
                  to={BRAND_VIEWS.reduce((n, b) => n + b.products.length, 0)}
                  suffix="+"
                />
              </div>
              <div className="stat-label">核心产品线</div>
            </div>
            <div className="stat">
              <div className="stat-num"><CountUp to={CASES.length} /></div>
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

        {/* 产品图轮播：紧接首屏的独立区块。
            为什么不放首屏里面：首屏内容（logo + 标题 + 副标题 + 按钮 + 四个数字）
            在 1366×768 上已经占到 586px，只剩约 180px —— 轮播塞进去后
            圆点和「查看产品」按钮会被切到屏幕外，产品图也会小到看不清。
            独立成段后从 1040px 通栏、按屏高给 240～360px，两边都不牺牲。
            数据在 src/data/heroSlides.json。 */}
        <section className="hd-carousel-band">
          <motion.div
            className="hd-carousel-band-inner"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroCarousel />
          </motion.div>
        </section>

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
             {/* 形态 A · 分栏 + 顶部规则线。多数内容直接就在，不做入场动画
                 品牌文案（eyebrow / 说明）跟随当前选中的品牌卡片 —— 数据见 brands.json */}
             <div className="hd-sec-head hd-sec-head--split">
               <div>
                 <p className="hd-section-eyebrow">{currentBrand?.eyebrow}</p>
                 <h2 className="hd-section-title">产品系列</h2>
               </div>
               <p className="hd-section-desc">{currentBrand?.tagline}</p>
             </div>

            {/* 品牌切换卡片：一个品牌一张卡片，顺序与文案见 src/data/brands.json */}
            <div className="hd-brand-tabs" role="tablist" aria-label="产品品牌">
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  id={`brand-tab-${b.id}`}
                  aria-selected={b.id === activeBrand}
                  aria-controls="brand-panel"
                  className={`hd-brand-tab ${b.id === activeBrand ? 'active' : ''}`}
                  style={{ '--brandActive': b.color } as React.CSSProperties}
                  onClick={() => selectBrand(b.id)}
                >
                  <span className="hd-brand-tab-label">{b.tabLabel}</span>
                  {/* 数量角标：让「这个品牌还没有产品」在选择之前就看得见，
                      而不是点进去才发现是空的 */}
                  <span className="hd-brand-tab-count">
                    {b.count > 0 ? b.count : '待'}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeBrand}
                id="brand-panel"
                role="tabpanel"
                aria-labelledby={`brand-tab-${activeBrand}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* 场景过滤 tab。分类由该品牌自己的产品派生，所以新品牌加产品时
                    这里会自动多出对应的筛选项，不需要改代码（也不会有点了 0 结果的空项） */}
                {currentBrand && currentBrand.categories.length > 0 && (
                  <div className="hd-cat-tabs">
                    {['all', ...currentBrand.categories].map((cat) => (
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
                )}

                <motion.div layout className="hd-product-grid">
                  {visibleCards.map((p, i) => (
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
                        {p.img ? (
                          <img
                            src={p.img}
                            srcSet={p.srcSet}
                            sizes={p.sizes}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="hd-product-img-empty" aria-hidden="true">
                            <span>{p.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="hd-product-info">
                        <div className="hd-product-name">{p.name}</div>
                        <div className="hd-product-desc">
                          {p.desc || '更多产品即将上线，敬请期待。'}
                        </div>
                        {p.href && !p.soon ? (
                          p.href.startsWith('/') ? (
                            <Link to={p.href} className="hd-product-link">了解更多</Link>
                          ) : (
                            <a
                              href={p.href}
                              className="hd-product-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              了解更多
                            </a>
                          )
                        ) : (
                          <span className="hd-product-link is-pending">即将上线</span>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* 空态：品牌已建卡片、产品资料还没录进来时的样子（不会出现破图） */}
                  {visibleCards.length === 0 && (
                    <motion.div
                      layout
                      className="hd-product-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="hd-product-empty-title">
                        {activeCat === 'all' ? '产品资料准备中' : '该分类下暂无产品'}
                      </span>
                      <span className="hd-product-empty-desc">
                        {activeCat === 'all'
                          ? currentBrand?.emptyState ||
                            '该品牌的产品资料正在整理，即将上线。'
                          : '换个分类看看，或选择「全部」。'}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* 选型器：产品看完了，下一个问题自然是「我的房间该配哪套」 */}
        <RoomPicker />

        {/* CASES */}
        <section className="hd-section-light scroll-mt-16" id="cases">
          <div className="hd-section-inner">
            {/* 形态 B · 工具条：标题块与筛选器同一行，与产品段的分栏明显不同 */}
            <div className="hd-sec-head hd-sec-head--toolbar">
              <div>
                <p className="hd-section-eyebrow">思必驰</p>
                <h2 className="hd-section-title">案例集锦</h2>
                <p className="hd-section-desc">
                  服务高校、金融机构、酒店及政企客户，每一个案例都是信任的见证。
                </p>
              </div>
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
            </div>

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
                        <img
                          src={c.img}
                          srcSet={c.srcSet}
                          sizes={c.sizes}
                          alt={c.name}
                          loading="lazy"
                          decoding="async"
                        />
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
            {/* 形态 C · 居中堆叠：保留最经典的一种，与 A/B 形成对比 */}
            <div className="hd-sec-head hd-sec-head--stack">
              <p className="hd-section-eyebrow">关于恒迪视讯</p>
              <h2 className="hd-section-title">专注音视频<br />企业级系统集成</h2>
              <p className="hd-section-desc">
                恒迪视讯是思必驰 AISPEECH 的授权代理商，总部位于杭州余杭，专注为教育、企业、政府和酒店客户提供专业级音视频集成解决方案。提供样品试用、现场测试、工程设计与售后支持的全流程服务。
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link to="/faq" style={{ display: 'inline-block', fontSize: 15, fontFamily: 'var(--font-body)', fontWeight: 500, padding: '10px 20px', background: 'var(--warm-primary)', color: '#fff', borderRadius: 8, textDecoration: 'none', marginRight: 12, marginBottom: 12 }}>
                常见问题 FAQ
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('footer')}
                style={{ display: 'inline-block', fontSize: 15, fontFamily: 'var(--font-body)', padding: '9px 19px', border: '1px solid var(--warm-hairline)', background: 'transparent', color: 'var(--warm-ink)', borderRadius: 8, textDecoration: 'none', cursor: 'pointer' }}
              >
                预约体验 / 申请样品
              </button>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <div className="hd-cta-band" ref={ctaRef} style={{ position: 'relative', overflow: 'hidden' }}>
          {/* 视差光晕。
              必须在点阵**下面**（DOM 在前、z-index 同为 0），原因：
              · 它带 mixBlendMode:'screen'，压在点阵上会提亮点阵，
                而"波前变亮"正是点阵唯一可读的信号
              · 它的暖陶土色是为原来的星空调的；垫在下面只负责给底带一个暖色焦点，
                不参与点阵的明暗，两者就不打架了 */}
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 600, height: 600,
              marginLeft: -300, marginTop: -300,
              borderRadius: '50%',
              ...(prefersReduced ? {} : { y: ctaGlowY, scale: ctaGlowScale }),
              background: 'radial-gradient(circle, rgba(204,120,92,0.22) 0%, rgba(204,120,92,0.06) 40%, rgba(204,120,92,0) 70%)',
              pointerEvents: 'none',
              zIndex: 0,
              mixBlendMode: 'screen',
            }}
          />
          {/* MA600D 拾音场：横杆按真实长宽比绘制，下方点阵是它投射的拾取点阵列。
              指针扫过时从落点发出声波涟漪，波前经过的点被抬起、变大、变亮。
              取代了原来的星空 —— 星空放在 B2B 音视频站上属于 design-slop.md 的 B5
              「动效与内容无关」。 */}
          <Ma600dField className="hd-cta-field" />
          <div style={{ position: 'relative', zIndex: 2 }}>
          {/* CTA 是通栏深色带，本身已是第 4 种形态，不再叠加入场动画 */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.12, color: 'var(--warm-on-dark)', letterSpacing: '-0.03em', marginBottom: 12 }}>准备好升级您的会议室了吗？</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--warm-on-dark-soft)', letterSpacing: '-0.01em', marginBottom: 36 }}>样品试用 · 现场演示 · 工程设计 · 全程支持</p>
          <span className="btn-white" onClick={() => scrollTo('footer')}>联系我们</span>
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
                <img
                  src={qrcodeImage}
                  alt="恒迪视讯公众号二维码"
                  className="w-28 h-28 object-contain rounded-md bg-white p-1 cursor-zoom-in hover:opacity-90 transition-opacity"
                  loading="lazy"
                  onClick={() => setQrPreview(true)}
                />
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
              <img
                src={addressMapImage}
                alt="公司地址"
                className="mt-3 w-full rounded-md object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                style={{ maxHeight: 140 }}
                loading="lazy"
                onClick={() => setMapPreview(true)}
              />
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

      {/* 地址地图全屏预览 */}
      {mapPreview && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setMapPreview(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setMapPreview(false)}
            aria-label="关闭"
          >
            ✕
          </button>
          <img
            src={addressMapImage}
            alt="公司地址全图"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 公众号二维码全屏预览 */}
      {qrPreview && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setQrPreview(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setQrPreview(false)}
            aria-label="关闭"
          >
            ✕
          </button>
          <img
            src={qrcodeImage}
            alt="公众号二维码"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </>
  );
}
