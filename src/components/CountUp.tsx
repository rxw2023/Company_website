import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';

interface CountUpProps {
  /** 目标数值 */
  to: number;
  /** 起始值，默认 0 */
  from?: number;
  /** 动画时长 s */
  duration?: number;
  /** 延迟 s */
  delay?: number;
  /** 仅触发一次 */
  once?: boolean;
  /** 视口提前量 */
  amount?: number;
  /** 前缀，例如 "¥" */
  prefix?: string;
  /** 后缀，例如 "+" */
  suffix?: string;
  /** 小数位数 */
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function CountUp({
  to,
  from = 0,
  duration = 1.6,
  delay = 0,
  once = true,
  amount = 0.5,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  style,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount });
  const motionVal = useMotionValue(from);
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, to, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, to, from, duration, delay, motionVal]);

  // 不支持数字滚动时（如 4K）直接显示原文，由调用方处理
  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <motion.span
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {prefix}{formatted}{suffix}
    </motion.span>
  );
}
