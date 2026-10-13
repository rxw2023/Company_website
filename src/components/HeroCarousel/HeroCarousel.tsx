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
          </motion.div>
        </AnimatePresence>
      </div>

      {/*
        结构改成「舞台（图）+ 底部信息行（左：产品名 / 中：指示点）」。
        此前名称与圆点都绝对定位叠在舞台里，矮屏上空间一紧，
        名称就压在机器上、它的底衬又压住圆点 —— 怎么调留白都只是把问题挪位置。
        排成上下两行之后三者互不遮挡，舞台高度也能按图片本身定。

        圆点样式写在组件自己的 <style> 里，不是随手放：index.css 有一条
        移动端全局规则给所有 button/a 设 44px 最小尺寸（那是给文字按钮留触控目标的），
        会把圆点撑成大灰饼。页面样式块插在 index.css **之前**，同权重覆盖不掉，
        组件样式渲染在它之后才能生效。
      */}
      <style>{`
        .hd-carousel-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2px;
        }
        .hd-carousel-dot {
          box-sizing: border-box;
          /* 尺寸全部钉死：width/height 是 22px 的热区，视觉上的点是 6px。
             之前视觉点 8px + active 再放大 1.15 倍，显得又大又抢眼 ——
             它是「第几张」的标记，不该比产品名还显眼。 */
          width: 22px; height: 22px;
          min-width: 22px; min-height: 22px;
          max-width: 22px; max-height: 22px;
          padding: 8px;
          margin: 0;
          border: 0;
          border-radius: 50%;
          background: var(--warm-muted);
          background-clip: content-box;
          opacity: 0.3;
          cursor: pointer;
          transition: opacity 0.2s, background 0.2s;
        }
        .hd-carousel-dot:hover { opacity: 0.65; }
        /* 选中态只靠深浅区分，不再放大 —— 放大一圈会让人以为点错了 */
        .hd-carousel-dot.active {
          opacity: 1;
          background: var(--warm-ink);
        }
        .hd-carousel-dot:focus-visible {
          outline: 2px solid var(--warm-primary);
          outline-offset: 1px;
        }
        /* 底部信息行：左名称、中指示点 */
        .hd-carousel-foot {
          display: flex;
          align-items: center;
          padding: 8px 20px;
          min-height: 38px;
          background: var(--warm-canvas);
        }
        .hd-carousel-foot-name {
          flex: 0 0 auto;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--warm-body);
          letter-spacing: -0.01em;
        }
        /* 指示点占满剩余宽度，因此视觉上居中于整条带子而不是名称右侧 */
        .hd-carousel-foot .hd-carousel-dots { flex: 1; }
      `}</style>

      {/* 底部信息行：产品名在左，指示点居中 */}
      <div className="hd-carousel-foot">
        <span className="hd-carousel-foot-name">{current.name || ''}</span>
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
      </div>

      {/* 给读屏用户的等价信息：轮播是视觉增强，文字内容不能只存在于图里 */}
      <p className="sr-only" aria-live="polite">
        第 {index + 1} / {SLIDES.length} 张：{current.alt}
      </p>
    </div>
  );
}
