/**
 * 拾音场点阵的纯数学部分（无 DOM 依赖，便于独立验证）
 *
 * 形态取自 MA600D 本身：它不是一条线，而是**空间里分布的一组分立拾取点**。
 * 所以用点阵而不是绳帷幕 —— 竖向长线表达不了"某个位置被拾取"这件事。
 *
 * 保留自 motion-web `cases/char-curtain` 的两条原则：
 *   · **能量同时映射到尺寸与亮度** —— 静帧也能看出刚才哪里被扰动过
 *   · 位移有阻尼、会回弹，不是硬切
 * 另加 wheel-rail 的 `1 - exp(-k·dt)` 形式，保证趋近速度与刷新率无关。
 */

export interface Ripple {
  x: number;
  y: number;
  /** 已存在的时间（秒） */
  age: number;
}

/** 声波前缘传播速度 px/s */
export const WAVE_SPEED = 320;
/** 波环厚度（高斯半宽）px */
export const RING_WIDTH = 52;
/** 涟漪强度随时间衰减 1/s */
export const RIPPLE_DECAY = 1.7;

/**
 * 单个涟漪在「距波源 d、年龄 age」处的强度。
 * 峰值出现在 d = WAVE_SPEED · age 的波前上，之后按 exp(-decay·age) 衰减。
 */
export function rippleEnergy(d: number, age: number): number {
  if (!Number.isFinite(d) || !Number.isFinite(age) || age < 0) return 0;
  const delta = d - WAVE_SPEED * age;
  const spatial = Math.exp(-(delta * delta) / (RING_WIDTH * RING_WIDTH));
  return spatial * Math.exp(-RIPPLE_DECAY * age);
}

/**
 * 某一点的总能量：所有涟漪叠加后钳制。
 * 距波前超过 3 倍环宽的直接跳过（贡献可忽略），避免点阵 × 涟漪的平方级开销。
 */
export function fieldAt(
  x: number,
  y: number,
  ripples: readonly Ripple[],
  maxEnergy = 1.5
): number {
  let sum = 0;
  const cut = RING_WIDTH * 3;
  for (const r of ripples) {
    if (r.age < 0) continue;
    const dx = x - r.x;
    const dy = y - r.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const delta = d - WAVE_SPEED * r.age;
    if (delta > cut || delta < -cut) continue;
    sum += Math.exp(-(delta * delta) / (RING_WIDTH * RING_WIDTH)) * Math.exp(-RIPPLE_DECAY * r.age);
    if (sum >= maxEnergy) return maxEnergy;
  }
  return sum;
}

/** 能量 → 调色板档位。越界会取到 undefined 颜色，所以必须钳制。 */
export function levelIndex(energy: number, maxEnergy: number, steps: number): number {
  if (!Number.isFinite(energy) || energy <= 0) return 0;
  const t = Math.min(1, energy / Math.max(maxEnergy, 1e-6));
  const idx = Math.floor(t * steps);
  return Math.min(steps - 1, Math.max(0, idx));
}

/**
 * 帧率无关的指数趋近。
 * `1 - exp(-k·dt)` 这个形式才是 60Hz 与 120Hz 表现一致的；裸的 `x += (t-x)*0.1`
 * 在 120Hz 屏上会快一倍（wheel-rail 记过这条）。
 */
export function easeToward(current: number, target: number, k: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-k * dt));
}
