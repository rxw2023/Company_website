/**
 * SoundField 的纯数学部分（无 DOM 依赖，便于独立验证）
 *
 * 抽出来的原因：波束指向、拾音区归属、弹簧收敛这几件事**算错了肉眼很难发现**
 * ——看起来都像"一条在动的光带"。把公式集中在这里，就能用脚本断言
 * "波束确实指向声源""拾音区索引不越界""弹簧无过冲收敛"。
 */

export const TAU = Math.PI * 2;

/**
 * 波束转向的弹簧参数（唯一调参处）。
 * 目标是"柔和"：频率降下来、阻尼提上去，扫过去时不抢眼、几乎不回弹。
 *   ω=4.2（原先 6.2，慢约 1/3）、ζ=0.78 → 过冲仅约 2%，约 1.2s 稳定。
 * 改动这两个值必须重跑 `sound-field-check`，确保收敛且过冲不失控。
 */
export const BEAM_OMEGA = 4.2;
export const BEAM_ZETA = 0.78;

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * 均匀直线阵的阵列因子：AF(ψ) = |sin(Nψ/2) / (N·sin(ψ/2))|
 *
 * 主瓣（ψ→0 时取值为 1）与旁瓣由这个式子自然产生，不需要手画。
 * ψ = 2π·(d/λ)·sin(φ)，本项目取 d/λ = 0.5。
 */
export function arrayFactor(psi: number, n: number): number {
  const s = Math.sin(psi / 2);
  if (Math.abs(s) < 1e-6) return 1;
  return Math.abs(Math.sin((n * psi) / 2) / (n * s));
}

/**
 * 主瓣半宽 = 阵列因子第一个零点对应的偏角。
 *
 * 推导：AF 的零点出现在 ψ = 2π/N，而 ψ = 2π·(d/λ)·sin φ，取 d/λ = 0.5，
 * 于是 sin φ_null = 2/N，即 φ_null = asin(2/N)。
 *
 * 这是本组件**唯一**用到阵列因子的地方，而且是用来定宽度、不是用来画形状。
 * 原因：把 AF(ψ) 直接当极坐标曲线画（r = R·AF）会得到一张科学图表 ——
 * N=16 时主瓣两侧有约 15 个零点，曲线每到零点就回到圆心，
 * 渲染出来是一朵"多瓣花"而不是一束光。宽度才是可读的那个量。
 */
export function mainLobeHalfWidth(nEff: number): number {
  // 非有限输入（NaN / Infinity）回落到默认单元数。
  // 只钳制数值范围是不够的：Math.max(2, NaN) === NaN，NaN 会一路传到 asin 变成 NaN，
  // 最终整条波束路径失效。这个分支是 motion-check 第一次运行时抓出来的。
  const n = Number.isFinite(nEff) ? nEff : 8;
  return Math.asin(Math.min(0.95, 2 / Math.max(2, n)));
}

/**
 * 转向偏离正下方时主瓣会展宽（真实阵列的端射展宽效应）。
 * |sin θ| = 1（正下方）时最窄，趋向端射时变宽。
 */
export function effectiveElements(elements: number, beamAngle: number): number {
  return elements * (0.45 + 0.55 * Math.abs(Math.sin(beamAngle)));
}

/** 偏角约定：0 = 阵列正下方；正负分别偏向两侧 */
export function bearingOf(delta: number): number {
  return Math.PI / 2 + delta;
}

/** 声源坐标（相对阵列位置 ax/ay，距离 reach） */
export function sourcePosition(
  ax: number,
  ay: number,
  reach: number,
  delta: number
): { x: number; y: number } {
  const a = bearingOf(delta);
  return { x: ax + Math.cos(a) * reach, y: ay + Math.sin(a) * reach };
}

/** 偏角落在第几个拾音区（索引已钳制在 [0, zones-1]） */
export function zoneIndexFor(delta: number, fanHalf: number, zones: number): number {
  const rel = delta + fanHalf;
  const raw = Math.floor((rel / (2 * fanHalf)) * zones);
  return Math.min(zones - 1, Math.max(0, raw));
}

/**
 * 点击坐标 → 声源偏角，即 sourcePosition 的逆运算。
 *
 * 只取**方向**、不取距离：所有声源都落在以阵列为中心、半径 reach 的同一段弧上，
 * 距离由 sourcePosition 统一决定。这样点击产生的声源会和原有 7 个严丝合缝地同弧，
 * 而不是飘到画面别处变成一个孤立的点。
 *
 * 返回值钳制在 ±clamp：点到阵列上方（画面里 H1 那一带）时方向会落到弧外，
 * 此时贴到最近的边缘，而不是让声源跑到阵列背后去。
 *
 * 之所以抽到这里：这个投影的符号约定（0 = 正下方、正左负右）一旦搞反，
 * 表现是"点左边却在右边冒点"——看起来像玄学而不是 bug，肉眼很难归因。
 * motion-check 用 sourcePosition 做往返断言来盯住它。
 */
export function deltaFromPoint(
  ax: number,
  ay: number,
  px: number,
  py: number,
  clamp: number
): number {
  const raw = Math.atan2(py - ay, px - ax) - Math.PI / 2;
  // 归一化到 (-π, π]：atan2 在正上方附近会跨 ±π，不归一化会出现 2π 级跳变
  const d = ((((raw + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  return Math.max(-clamp, Math.min(clamp, d));
}

/**
 * 二阶弹簧阻尼一步积分（半隐式欧拉）。
 * θ'' = ω²(θ_target − θ) − 2ζω·θ'
 * 返回新的角度与角速度。
 */
export function steerStep(
  angle: number,
  vel: number,
  target: number,
  dt: number,
  omega: number,
  zeta: number
): { angle: number; vel: number } {
  const acc = omega * omega * (target - angle) - 2 * zeta * omega * vel;
  const nextVel = vel + acc * dt;
  return { angle: angle + nextVel * dt, vel: nextVel };
}

/**
 * 访客发声期间，那 7 个自动声源点的透明度系数（1 = 常态，dim = 几乎不可见）。
 *
 * 为什么需要它：只把"当前发声"的那个自动点压暗是不够的 —— 另外 6 个仍以
 * alpha 0.35 画着，一旦有一个恰好落在点击位置附近，画面上就是**两个点**，
 * 读起来像渲染出错，而不是"房间里有别人"。（用户截图指出来的）
 *
 * 必须连续：收尾段（userHold < fadeWindow）让它们同步淡回来，且在 userHold = 0
 * 处正好回到 1，与"访客声源已消失"无缝衔接。不连续的话，交接瞬间那 7 个点会闪一下。
 */
export function ambientFade(userHold: number, fadeWindow: number, dim: number): number {
  if (userHold <= 0) return 1;
  const back = 1 - Math.min(1, userHold / fadeWindow);
  return dim + (1 - dim) * back;
}
