import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * 鼠标跟随光晕：固定全屏、pointer-events:none、低 z-index。
 * 暖色径向渐变，用 spring 平滑跟随，桌面端可见。
 *
 * 性能说明（2024 修订）：
 *   原先用 style={{ left, top }} 驱动位置。left/top 是**布局属性**，
 *   spring 每帧变化都会触发 layout + paint；改用 x/y（映射为 transform: translate）
 *   后只走合成器，同样效果但不再让主线程重排。
 *   配合 willChange: 'transform' 提前提升为独立图层，避免逐帧创建。
 *
 * 无障碍：prefers-reduced-motion 时完全不渲染，也不挂监听。
 */
export default function MouseGlow() {
  const prefersReduced = useReducedMotion();
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.4 });

  useEffect(() => {
    if (prefersReduced) return;
    // 移动端 / 无精确指针设备不启用
    if (window.matchMedia('(hover: none)').matches) return;

    const onMove = (e: MouseEvent) => {
      // 减去半径，使光晕中心对齐指针
      x.set(e.clientX - 300);
      y.set(e.clientY - 300);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [x, y, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        // x / y 由 framer 编译为 transform: translate(...)，不触发布局
        x: sx,
        y: sy,
        width: 600,
        height: 600,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        willChange: 'transform',
        background:
          'radial-gradient(circle, rgba(204,120,92,0.10) 0%, rgba(204,120,92,0.04) 35%, rgba(204,120,92,0) 65%)',
        mixBlendMode: 'multiply',
      }}
    />
  );
}
