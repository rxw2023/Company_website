import { motion, type Variants, type Transition } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  /** 进入方向 */
  direction?: Direction;
  /** 偏移距离 px */
  distance?: number;
  /** 延迟 ms（用于 stagger） */
  delay?: number;
  /** 动画时长 s */
  duration?: number;
  /** 仅触发一次 */
  once?: boolean;
  /** 视口提前量，例如 0.2 表示元素进入视口 20% 时触发 */
  amount?: number;
  className?: string;
  style?: React.CSSProperties;
  /** 作为指定 HTML 元素渲染，默认 div */
  as?: 'div' | 'section' | 'li' | 'span' | 'p' | 'h1' | 'h2' | 'h3';
  /** hover 时上移距离 px，启用则卡片悬停抬升 */
  hoverLift?: number;
}

const offset = (direction: Direction, distance: number) => {
  switch (direction) {
    case 'up':    return { y: distance };
    case 'down':  return { y: -distance };
    case 'left':  return { x: distance };
    case 'right': return { x: -distance };
    default:      return {};
  }
};

export default function Reveal({
  children,
  direction = 'up',
  distance = 24,
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  className,
  style,
  as = 'div',
  hoverLift,
}: RevealProps) {
  const variants: Variants = {
    hidden: { opacity: 0, ...offset(direction, distance) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // easeOutQuint
      },
    },
  };

  const transition: Transition = { duration, delay, ease: [0.22, 1, 0.36, 1] };

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={transition}
      whileHover={hoverLift ? { y: -hoverLift } : undefined}
    >
      {children}
    </MotionTag>
  );
}
