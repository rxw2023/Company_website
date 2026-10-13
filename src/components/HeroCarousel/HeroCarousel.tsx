import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import catalog from '../../data/heroSlides.json';
import type { HeroSlide, HeroSlidesCatalog } from '../../data/heroSlides';
import { resolveImageKey } from '../../data/brands';
import { responsiveImage, CARD_SIZES } from '../../data/responsiveImage';
import { useCarousel } from './useCarousel';

const DATA = catalog as unknown as HeroSlidesCatalog;

/**
 * 是否显示右下/底部那排指示圆点。
 * 按需求关闭：轮播上只留图 + 左下角名称。
 * 关掉后轮播没有可点击的跳转入口，只剩自动播放 + 方向键/滑动。
 */
const SHOW_DOTS = false;

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
      className={`hd-carousel ${className || ''}`}
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
