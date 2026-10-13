import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * 轮播的自动播放 + 切换逻辑。
 *
 * 拆成 hook 的原因不是「复用」（只有首屏在用），而是为了把
 * **暂停语义**集中在一处 —— 自动轮播的坑几乎全在这里：
 *   · 用户鼠标停在上面正在看图，图片自己滑走
 *   · 键盘焦点在轮播里（Tab 到圆点），图片滑走导致焦点失联
 *   · 浏览器标签页切到后台，回来时补播一串动画
 *   · 用户开了「减弱动态效果」，还照旧自动滑动
 *
 * 这些都必须显式处理，否则就是「轮播很烦」这种说不清来源的体验问题。
 */
export function useCarousel(count: number, autoplayMs: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReduced = useReducedMotion();
  /** 用户手动切过一次就不再自动播放：他想看哪张，由他决定 */
  const [userTookOver, setUserTookOver] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (count < 1) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  /**
   * 手动切换：点击圆点 / 滑动 / 左右方向键都走这里。
   * 顺便标记「用户接管了」—— 他自己选了一张，就不该再被自动播放抢走。
   */
  const select = useCallback(
    (next: number) => {
      setUserTookOver(true);
      goTo(next);
    },
    [goTo]
  );

  const autoplayOn =
    !prefersReduced && !paused && !userTookOver && autoplayMs > 0 && count > 1;

  useEffect(() => {
    if (!autoplayOn) return;
    const t = window.setInterval(() => {
      // 标签页在后台时不推进：回来时不该看到一串补播
      if (document.hidden) return;
      setIndex((i) => (i + 1) % count);
    }, autoplayMs);
    return () => window.clearInterval(t);
  }, [autoplayOn, autoplayMs, count]);

  const handlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        select(index + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        select(index - 1);
      }
    },
    onTouchStart: (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const start = touchStartX.current;
      touchStartX.current = null;
      if (start === null) return;
      const dx = (e.changedTouches[0]?.clientX ?? start) - start;
      if (Math.abs(dx) < 40) return; // 太短的滑动当误触
      select(dx < 0 ? index + 1 : index - 1);
    },
  };

  return {
    index,
    /** 是否正在自动播放（关掉时圆点不显示进度动画） */
    autoplayOn,
    /** 手动切到某一张（点击圆点 / 滑动 / 左右方向键都走这里） */
    select,
    handlers,
  };
}
