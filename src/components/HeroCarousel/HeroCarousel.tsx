import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import catalog from '../../data/heroSlides.json';
import type { HeroSlide, HeroSlidesCatalog } from '../../data/heroSlides';
import { resolveImageKey } from '../../data/brands';
import { responsiveImage, CARD_SIZES } from '../../data/responsiveImage';
import { useCarousel } from './useCarousel';

const DATA = catalog as unknown as HeroSlidesCatalog;

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
 * 首屏轮播（三张图）
 *
 * 设计要点：
 *   · 容器高度固定（CSS aspect-ratio），切换时页面不发生位移
 *   · 超宽产品图用 contain 完整显示 —— 用 cover 会把机器两端切掉
 *   · 悬停 / 键盘聚焦 / 切到后台 / 系统开了「减弱动态效果」都会暂停自动播放
 *   · 返回结构自定义：`fit` 字段决定裁切方式，见 heroSlides.json 的说明
 */
export default function HeroCarousel({ className }: { className?: string }) {
  const { index, select, handlers } = useCarousel(SLIDES.length, DATA.autoplayMs);
  const prefersReduced = useReducedMotion();

  if (SLIDES.length === 0) return null;
  const current = SLIDES[index];

  const transition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

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
            aria-hidden={false}
          >
            {current.src ? (
              <img
                className={`hd-carousel-img is-${current.fit || 'contain'}`}
                src={current.src}
                srcSet={current.srcSet}
                sizes={current.sizes}
                alt={current.alt}
                decoding="async"
                /* 第一张是首屏内容，必须立刻可见；其余懒加载 */
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
            ) : (
              /* 图片 key 没登记时不显示破图，也不静默留白 —— doctor 会报这个错 */
              <div className="hd-carousel-missing">{current.alt}</div>
            )}

            {(current.name || current.note) && (
              <div className="hd-carousel-caption">
                {current.name && <div className="hd-carousel-name">{current.name}</div>}
                {current.note && <div className="hd-carousel-note">{current.note}</div>}
              </div>
            )}

            {current.href && (
              current.href.startsWith('/') && !current.href.startsWith('//') ? (
                <Link to={current.href} className="hd-carousel-link">
                  {current.linkLabel || '了解更多'}
                </Link>
              ) : (
                <a
                  href={current.href}
                  className="hd-carousel-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {current.linkLabel || '了解更多'}
                </a>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

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

      {/* 给读屏用户的等价信息：轮播是视觉增强，文字内容不能只存在于图里 */}
      <p className="sr-only" aria-live="polite">
        第 {index + 1} / {SLIDES.length} 张：{current.alt}
      </p>
    </div>
  );
}
