import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * 鼠标跟随光晕：固定全屏、pointer-events:none、低 z-index。
 * 暖色径向渐变，用 spring 平滑跟随，桌面端可见。
 */
export default function MouseGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.4 });

  useEffect(() => {
    // 移动端不启用
    if (window.matchMedia('(hover: none)').matches) return;
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX - 300);
      y.set(e.clientY - 300);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        left: sx,
        top: sy,
        width: 600,
        height: 600,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(circle, rgba(204,120,92,0.10) 0%, rgba(204,120,92,0.04) 35%, rgba(204,120,92,0) 65%)',
        mixBlendMode: 'multiply',
      }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    />
  );
}
