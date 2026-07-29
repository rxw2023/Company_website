import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
  warm: boolean;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  len: number;
}

interface StarFieldProps {
  /** 星点密度，数值越大越密（推荐 60-120） */
  density?: number;
  /** 是否启用流星，默认 true */
  meteor?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Canvas 星空：星点闪烁 + 随机流星。
 * 绝对铺满父容器（父需 position: relative + overflow: hidden）。
 * 支持 prefers-reduced-motion（静态绘制一帧）。
 */
export default function StarField({
  density = 80,
  meteor = true,
  className,
  style,
}: StarFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let stars: Star[] = [];
    let activeMeteor: Meteor | null = null;
    let nextMeteorAt = Math.random() * 2 + 1.5;
    let w = 0;
    let h = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 根据面积 + density 生成星点
      stars = [];
      const count = Math.max(30, Math.floor((w * h) / 10000 * (density / 80)));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.3,
          base: Math.random() * 0.5 + 0.25,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 1.6 + 0.4,
          warm: Math.random() < 0.18, // ~18% 暖色星点
        });
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawnMeteor = () => {
      const fromLeft = Math.random() < 0.5;
      const speed = Math.random() * 3 + 4;
      const angle = Math.PI * 0.18 + Math.random() * 0.12; // ~10-20° 下倾
      activeMeteor = {
        x: fromLeft ? -60 : w + 60,
        y: Math.random() * h * 0.5,
        vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: Math.random() * 50 + 50,
        len: Math.random() * 70 + 50,
      };
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm ? 'rgba(204,120,92,0.7)' : 'rgba(255,250,245,0.7)';
        ctx.fill();
      }
    };

    const loop = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // 星点闪烁
      for (const s of stars) {
        const a = s.base + Math.sin(t * s.speed + s.phase) * 0.4;
        const alpha = Math.max(0.05, Math.min(1, a));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm
          ? `rgba(204,120,92,${alpha})`
          : `rgba(255,250,245,${alpha})`;
        ctx.fill();
      }

      // 流星
      if (activeMeteor) {
        const m = activeMeteor;
        m.life++;
        m.x += m.vx;
        m.y += m.vy;
        const ratio = m.life / m.max;
        const alpha = ratio < 0.2 ? ratio / 0.2 : Math.max(0, 1 - (ratio - 0.2) / 0.8);
        const speedMag = Math.hypot(m.vx, m.vy) || 1;
        const tailX = m.x - (m.vx / speedMag) * m.len;
        const tailY = m.y - (m.vy / speedMag) * m.len;
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,250,245,${alpha})`);
        grad.addColorStop(0.4, `rgba(204,120,92,${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(255,250,245,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // 头部光点
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,250,245,${alpha})`;
        ctx.fill();

        if (m.life >= m.max || m.x < -120 || m.x > w + 120 || m.y > h + 120) {
          activeMeteor = null;
          nextMeteorAt = t + Math.random() * 3 + 1.5;
        }
      } else if (meteor && t > nextMeteorAt) {
        spawnMeteor();
      }

      raf = requestAnimationFrame(loop);
    };

    if (reduceMotion) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, meteor]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}
