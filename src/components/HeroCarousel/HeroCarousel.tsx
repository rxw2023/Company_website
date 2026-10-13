import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import catalog from '../../data/heroSlides.json';
import type { HeroSlide, HeroSlidesCatalog } from '../../data/heroSlides';
import { resolveImageKey } from '../../data/brands';
import { responsiveImage, CARD_SIZES } from '../../data/responsiveImage';
import { useCarousel } from './useCarousel';

const DATA = catalog as unknown as HeroSlidesCatalog;

/**
 * 是否显示底部那排指示圆点。
 *
 * 中途按需求关过一次，后来又按要求开回来 —— 结论是它有用：
 * 关掉时访客不知道这里有几张图、也没有手动跳转入口。
 * 关掉后键盘方向键需要先 Tab 到容器上才生效，开启后点圆点即可。
 */
const SHOW_DOTS = true;

interface SlideView extends HeroSlide {
  src: string;
  srcSet?: string;
  sizes?: string;
}

const SLIDES: SlideView[] = (DATA.slides || []).map((s) => {
  // 取图走统一的 key 空间（brands.ts 的 resolveImageKey）：
  // a2-1 这类思必驰图集里的 key 不必再往 HERO_IMAGE_BY_KEY 抄一遍
  const src = resolveImageKey(s.image) || '';
  const responsive =
    src && !src.startsWith('data:') ? responsiveImage(s.image, src, CARD_SIZES) : {};
  return { ...s, src, ...responsive };
});

/**
 * 产品图轮播（首页 hero 之下的展示带）
 *
 * 设计约束（都是改出来的，别轻易动）：
 *   · **只有淡入淡出，没有位移**。曾经让新图从下方滑入（y: 12），
 *     在一张 6.9:1 的超宽产品图上看起来像整条带子在上下抖。
 *   · **背景恒定**。容器底色只用 --warm-canvas，不跟着图片走 ——
 *     三张图自带的白底/蓝底已经够不同了，容器再变色就是双份刺激。
 *   · **每张图只在左下角列一个名称**，不放按钮、不放参数。
 *   · 容器高度固定，切换时页面不位移。
 */
export default function HeroCarousel({ className }: { className?: string }) {
  const { index, select, handlers } = useCarousel(SLIDES.length, DATA.autoplayMs);
  const prefersReduced = useReducedMotion();

  if (SLIDES.length === 0) return null;
  const current = SLIDES[index];

  // 减弱动态效果时直接切换，不做淡入淡出
  const transition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <div
      className={`hd-carousel ${SHOW_DOTS ? 'js-dots-on' : ''} ${className || ''}`}
      role="group"
      aria-roledescription="轮播"
      aria-label="产品图轮播"
      tabIndex={0}
      {...handlers}
    >
      <div className="hd-carousel-stage-inner">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            className="hd-carousel-slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            {current.src ? (
              <img
                className={`hd-carousel-img is-${current.fit || 'contain'}`}
                src={current.src}
                srcSet={current.srcSet}
                sizes={current.sizes}
                alt={current.alt}
                decoding="async"
                /* 第一张是页面主要内容，必须立刻可见；其余懒加载 */
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
            ) : (
              /* 图片 key 没登记时不显示破图，也不静默留白 —— doctor 会报这个错 */
              <div className="hd-carousel-missing">{current.alt}</div>
            )}

            {/* 左下角只有一个名称：公司 + 产品名 */}
            {current.name && <div className="hd-carousel-name">{current.name}</div>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/*
        指示点按需求关闭了：轮播上只留图 + 左下角名称。
        代码保留（而不是删掉）是因为它是唯一的「手动跳到第 N 张」入口 ——
        现在只剩自动播放和左右方向键/滑动。哪天想开回来，把 SHOW_DOTS 改成 true。

        关掉后要留意：访客不知道这里有几张图、也点不了；
        同时轮播不再有可聚焦元素，键盘方向键需要先 Tab 到容器上才生效。
      */}
      {/* 指示点样式写在这里而不是 Home.tsx 的页面样式块里，是有原因的：
          index.css 有一条移动端全局规则 `button, a { min-width/height: 44px }`，
          它把圆点也当成按钮一起撑成 44px 的大灰饼。Home.tsx 的 <style> 虽然写在
          后面，但插入 DOM 的位置在 index.css **之前**，同权重下赢不了它。
          组件自己的 <style> 渲染在 index.css 之后，同权重即可覆盖。
          （更省事的 !important 也能修，但那会让以后调尺寸的人莫名其妙。） */}
      <style>{`
        .hd-carousel-dots {
          position: absolute;
          left: 0; right: 0; bottom: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
        }
        .hd-carousel-dot {
          box-sizing: border-box;
          /* 尺寸全部钉死：width/height 是 24px 的热区，视觉上的点是 8px */
          width: 24px; height: 24px;
          min-width: 24px; min-height: 24px;
          max-width: 24px; max-height: 24px;
          padding: 8px;
          margin: 0;
          border: 0;
          border-radius: 50%;
          background: var(--warm-muted);
          background-clip: content-box;
          opacity: 0.35;
          cursor: pointer;
          transition: opacity 0.2s, background 0.2s, transform 0.2s;
        }
        .hd-carousel-dot:hover { opacity: 0.7; }
        .hd-carousel-dot.active {
          opacity: 1;
          background: var(--warm-ink);
          transform: scale(1.15);
        }
        .hd-carousel-dot:focus-visible {
          outline: 2px solid var(--warm-primary);
          outline-offset: 2px;
        }
      `}</style>

      {SHOW_DOTS && (
        <div className="hd-carousel-dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`hd-carousel-dot ${i === index ? 'active' : ''}`}
              aria-label={`第 ${i + 1} 张：${s.alt}`}
              aria-current={i === index}
              onClick={() => select(i)}
            />
          ))}
        </div>
      )}

      {/* 给读屏用户的等价信息：轮播是视觉增强，文字内容不能只存在于图里 */}
      <p className="sr-only" aria-live="polite">
        第 {index + 1} / {SLIDES.length} 张：{current.alt}
      </p>
    </div>
  );
}
