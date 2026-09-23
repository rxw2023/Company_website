#!/usr/bin/env node
/**
 * 动效体检（motion check）
 *
 * 为什么把这个脚本固化下来：
 *   声场与波束的数学**算错了肉眼看不出来** —— 波束指反、拾音区归属镜像、
 *   弹簧在 120Hz 屏上比 60Hz 快一倍，画面上都只是"一条在动的光带"。
 *   这些必须靠数值判据守，而不是靠看。
 *
 * 判据的设计原则（motion-web `verification-harness.md` §0）：
 *   **一条断言只编码一条具体抱怨。** 通用"质量分"比没有测试更糟 ——
 *   它会把"我觉得不对"变成"测试通过了"。本文件里没有总分，只有逐条抱怨。
 *
 * 直接 import TypeScript 源文件：Node 24 原生类型擦除，无需打包器。
 * 因此测的是**组件真正使用的那份代码**，不是副本。
 *
 * 用法：pnpm run check:motion        （退出码非 0 表示存在 ERROR）
 */
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import {
  matchBundles,
  visibleMatches,
  MATCH_THRESHOLD,
  TAGS,
} from '../src/data/bundleMatch.ts';

const MATH = new URL('../src/components/soundFieldMath.ts', import.meta.url);
const M = await import(MATH.href);

const errors = [];
const notes = [];
const err = (m) => errors.push(m);
const note = (m) => notes.push(m);

const deg = (r) => (r * 180) / Math.PI;
const rad = (d) => (d * Math.PI) / 180;
let checks = 0;

/** 断言：失败即记为错误（编码一条具体抱怨） */
function must(name, ok, detail = '') {
  checks++;
  if (!ok) err(`${name}${detail ? `\n         ${detail}` : ''}`);
}

console.log('\n=== 动效体检 (motion check) ===\n');
console.log(`被测源文件：src/components/soundFieldMath.ts`);
console.log(`参数：ω=${M.BEAM_OMEGA}  ζ=${M.BEAM_ZETA}  d/λ=0.5\n`);

// ── 1 · 阵列因子 ────────────────────────────────────────────────
must('阵列因子主瓣峰值应为 1', Math.abs(M.arrayFactor(0, 8) - 1) < 1e-9);
let minAF = 1;
let maxAF = 0;
let nanAF = false;
for (let i = 0; i <= 2000; i++) {
  const v = M.arrayFactor(-Math.PI + (2 * Math.PI * i) / 2000, 8);
  if (Number.isNaN(v)) nanAF = true;
  minAF = Math.min(minAF, v);
  maxAF = Math.max(maxAF, v);
}
must('阵列因子全域无 NaN', !nanAF);
must('阵列因子全域应落在 [0,1]', minAF >= 0 && maxAF <= 1 + 1e-9, `实测 [${minAF.toFixed(4)}, ${maxAF.toFixed(4)}]`);

// ── 2 · 主瓣半宽（物理只保留在宽度里）────────────────────────────
// 抱怨：「波束宽度写错了 / 单元数越多反而越宽」
must('mainLobeHalfWidth(8) 应为 asin(2/8)=14.48°',
  Math.abs(deg(M.mainLobeHalfWidth(8)) - 14.4775) < 0.01,
  `实测 ${deg(M.mainLobeHalfWidth(8)).toFixed(2)}°`);
must('mainLobeHalfWidth(16) 应为 asin(2/16)=7.18°',
  Math.abs(deg(M.mainLobeHalfWidth(16)) - 7.1808) < 0.01,
  `实测 ${deg(M.mainLobeHalfWidth(16)).toFixed(2)}°`);

// 抱怨：「单元数越多主瓣越宽（方向搞反了）」
let monotonic = true;
let prev = Infinity;
for (let n = 2; n <= 64; n++) {
  const hw = M.mainLobeHalfWidth(n);
  if (Number.isNaN(hw) || hw > prev + 1e-12) monotonic = false;
  prev = hw;
}
must('单元数越大主瓣越窄（单调递减）', monotonic);

// 抱怨：「非法单元数导致 NaN / asin 越界」
let guarded = true;
for (const n of [0, 1, -5, 1e6, Infinity, NaN]) {
  const hw = M.mainLobeHalfWidth(n);
  if (!Number.isFinite(hw) || hw < 0 || hw >= Math.PI / 2) guarded = false;
}
must('极端单元数被钳制，不产生 NaN 或越界', guarded);

// ── 3 · 端射展宽 ────────────────────────────────────────────────
// 抱怨：「转向后主瓣不变宽（方向搞反）」
{
  const broad = M.effectiveElements(8, Math.PI / 2);
  const steered = M.effectiveElements(8, Math.PI / 2 + 1.0);
  must('正下方时 N_eff 应等于 N', Math.abs(broad - 8) < 1e-9, `实测 ${broad.toFixed(3)}`);
  must('转向后 N_eff 变小（主瓣展宽）', steered < broad,
    `正下方 ${broad.toFixed(3)} → 转向 ${steered.toFixed(3)}`);
}

// ── 4 · 声源弧覆盖 0–180° ──────────────────────────────────────
// 抱怨：「扫描范围只有两边，中间是空的」
const SOURCE_COUNT = 7;
function layout(w, h) {
  const narrow = w < 760;
  const fanHalf = narrow ? 1.05 : 1.42;
  const spread = narrow ? 0.85 : 1.34;
  const reach = narrow ? Math.min(h * 0.5, w * 0.52) : Math.min(h * 0.72, w * 0.46);
  const deltas = [];
  for (let i = 0; i < SOURCE_COUNT; i++) {
    deltas.push(((i / (SOURCE_COUNT - 1)) * 2 - 1) * spread);
  }
  return { narrow, fanHalf, spread, reach, ax: w * 0.5, ay: h * 0.13, deltas };
}
{
  const L = layout(1440, 900);
  const bearings = L.deltas.map((d) => M.bearingOf(d));
  const lo = deg(Math.min(...bearings));
  const hi = deg(Math.max(...bearings));
  must('声源弧应覆盖接近整个半平面（跨度 ≥140°）', hi - lo >= 140,
    `实测 ${lo.toFixed(1)}°–${hi.toFixed(1)}°，跨度 ${(hi - lo).toFixed(1)}°`);
  must('全部声源应落在扇区内',
    bearings.every((b) => Math.abs(b - Math.PI / 2) <= L.fanHalf + 1e-9));
}

// ── 5 · 声源必须在画面内 ────────────────────────────────────────
// 抱怨：「声源跑到屏幕外，看不到轮流发言」
const VIEWPORTS = [
  [1440, 900], [1280, 800], [1920, 1080], [1024, 768], [768, 1024], [390, 844], [360, 740],
];
for (const [w, h] of VIEWPORTS) {
  const L = layout(w, h);
  const pts = L.deltas.map((d) => M.sourcePosition(L.ax, L.ay, L.reach, d));
  const off = pts.filter((p) => p.x < 8 || p.x > w - 8 || p.y < 0 || p.y > h - 8);
  must(`${w}×${h}：全部声源应在画面内`, off.length === 0,
    off.length ? `${off.length} 个越界` : '');
}

// ── 6 · 声源与拾音区一一对应 ────────────────────────────────────
// 抱怨：「两个声源落在同一个拾音区，高亮看不出变化」
{
  const L = layout(1440, 900);
  const zones = L.deltas.map((d) => M.zoneIndexFor(d, L.fanHalf, SOURCE_COUNT));
  must('每个声源应落在不同的拾音区', new Set(zones).size === SOURCE_COUNT,
    `用到 ${new Set(zones).size}/${SOURCE_COUNT} 个区：${zones.join(',')}`);
}

// ── 7 · 拾音区索引约定与扇区绘制一致 ────────────────────────────
// 抱怨：「高亮的扇区不是声源所在的那个（镜像了）」
for (const half of [1.05, 1.42]) {
  let consistent = true;
  for (let i = 0; i <= 400; i++) {
    const delta = -half + (2 * half * i) / 400;
    const z = M.zoneIndexFor(delta, half, SOURCE_COUNT);
    if (z < 0 || z >= SOURCE_COUNT) { consistent = false; break; }
    const a0 = -half + (2 * half * z) / SOURCE_COUNT;
    const a1 = -half + (2 * half * (z + 1)) / SOURCE_COUNT;
    if (!(delta >= a0 - 1e-9 && delta <= a1 + 1e-9)) { consistent = false; break; }
  }
  must(`fanHalf=${half}：区索引与扇区角范围一致`, consistent);
}

// ── 8 · 点击坐标 → 声源偏角（sourcePosition 的逆运算）────────────
// 抱怨：「点左边，声源却在右边冒出来」。
// 这个投影的符号约定（0 = 正下方、正负分居两侧）一旦搞反，表现是"点哪偏不哪"，
// 看起来像玄学而不是 bug —— 所以用往返断言把它钉死。
{
  const L = layout(1440, 900);
  let worst = 0;
  for (let i = 0; i <= 200; i++) {
    const delta = -L.spread + (2 * L.spread * i) / 200;
    const p = M.sourcePosition(L.ax, L.ay, L.reach, delta);
    const back = M.deltaFromPoint(L.ax, L.ay, p.x, p.y, L.spread);
    worst = Math.max(worst, Math.abs(back - delta));
  }
  must('点击坐标 → 偏角 是 sourcePosition 的左逆（往返误差 <1e-9）', worst < 1e-9,
    `最大误差 ${worst.toExponential(2)}`);

  // 方向不能镜像：正偏角在阵列左侧、负偏角在右侧
  const right = M.sourcePosition(L.ax, L.ay, L.reach, -0.9);
  const left = M.sourcePosition(L.ax, L.ay, L.reach, 0.9);
  must('偏角符号约定未镜像（负偏角在右、正偏角在左）',
    right.x > L.ax && left.x < L.ax,
    `右 ${right.x.toFixed(0)} px / 阵列 ${L.ax.toFixed(0)} px / 左 ${left.x.toFixed(0)} px`);

  // 点到阵列上方（画面里 H1 那一带）时必须钳到边缘，而不是产生越界偏角或 NaN
  let clampOk = true;
  for (const [px, py] of [[L.ax, 0], [0, 0], [1440, 0], [L.ax, L.ay - 400]]) {
    const d = M.deltaFromPoint(L.ax, L.ay, px, py, L.spread);
    if (!Number.isFinite(d) || Math.abs(d) > L.spread + 1e-9) clampOk = false;
  }
  must('点阵列上方/画外时偏角被钳在 ±spread 内且无 NaN', clampOk);

  /**
   * 钳制必须钳到**正确的那一侧**。
   *
   * 这条是补上来的：上面那条只断言"落在 ±spread 内"，而钳到左端(+spread)和
   * 钳到右端(−spread)都满足它 —— 少了 2π 归一化时，点左上角会算出约 −4.37 rad，
   * 直接钳成 −1.34（右端），也就是"点左上角、点在右下角冒出来"，
   * 而上面那条断言照样通过。（毒化测试抓出来的：去掉归一化后 60 项全绿。）
   */
  const topLeft = M.deltaFromPoint(L.ax, L.ay, 0, 0, L.spread);
  const topRight = M.deltaFromPoint(L.ax, L.ay, 1440, 0, L.spread);
  must('画外点击钳到正确的一侧（左上→左端、右上→右端）',
    topLeft > 0 && topRight < 0,
    `左上 ${topLeft.toFixed(3)}（应 >0）/ 右上 ${topRight.toFixed(3)}（应 <0）`);

  // 点到阵列正下方时应得到 0（正下方 = 偏角 0）
  const below = M.deltaFromPoint(L.ax, L.ay, L.ax, L.ay + L.reach, L.spread);
  must('正下方点击 → 偏角 0', Math.abs(below) < 1e-9, `实测 ${below}`);
}

// ── 9 · 访客发声期间自动声源点的淡出系数 ────────────────────────
// 抱怨：「点一下冒出两个点」。只压暗"当前发声"那一个不够 —— 另外 6 个仍以
// alpha 0.35 画着，靠近点击位置的那个就读成第二个点。
// 这个系数必须是连续的：交接瞬间跳变会让那 7 个点闪一下。
{
  const WINDOW = 0.9;
  const DIM = 0.12;

  must('无常驻声源时系数为 1（常态）', M.ambientFade(0, WINDOW, DIM) === 1);
  must('保持期开始时压到 dim', Math.abs(M.ambientFade(6, WINDOW, DIM) - DIM) < 1e-9,
    `实测 ${M.ambientFade(6, WINDOW, DIM)}`);

  // 连续性：在交接点两侧取样，差值必须趋近于 0（不能跳变）
  const eps = 1e-6;
  const gap = Math.abs(M.ambientFade(eps, WINDOW, DIM) - M.ambientFade(0, WINDOW, DIM));
  must('交接处连续（userHold→0⁺ 与 0 之间无跳变）', gap < 1e-5, `跳变 ${gap.toExponential(2)}`);

  // 单调性：收尾段应单调回升到 1，中途不能回头
  let mono = true;
  let prev = -1;
  for (let i = 100; i >= 0; i--) {
    const v = M.ambientFade((WINDOW * i) / 100, WINDOW, DIM);
    if (v < prev - 1e-12) { mono = false; break; }
    prev = v;
  }
  must('收尾段单调淡回（不回头）', mono);
  // 收尾段的**起点**才是 userHold = fadeWindow（此时刚开始往回淡），
  // 到 userHold → 0 才回到 1 —— 一开始把这条写反了，是断言错不是代码错。
  must('收尾段起点为 dim（从这里开始淡回）',
    Math.abs(M.ambientFade(WINDOW, WINDOW, DIM) - DIM) < 1e-9,
    `实测 ${M.ambientFade(WINDOW, WINDOW, DIM)}`);
  must('临近交接时已回到 1',
    Math.abs(M.ambientFade(1e-6, WINDOW, DIM) - 1) < 1e-5,
    `实测 ${M.ambientFade(1e-6, WINDOW, DIM)}`);
}

// ── 9 · 帧率无关性（本次修复的核心不变量）──────────────────────
// 抱怨：「同一个弹簧在 120Hz 屏上比 60Hz 快」，即"手感取决于显示器"
const FIXED_DT = 1 / 120;
const MAX_SUBSTEPS = 4;

/** 用固定步长累加器跑一次完整扫掠 */
function sweep(hz) {
  const start = M.bearingOf(-1.34);
  const target = M.bearingOf(1.34);
  const travel = Math.abs(start - target);
  let ang = start;
  let vel = 0;
  let acc = 0;
  let t = 0;
  let crossed = false;
  let maxAfter = 0;
  let lastOut = 0;
  const band = 0.01;
  const frameDt = 1 / hz;

  while (t < 2.6) {
    acc = Math.min(acc + frameDt, FIXED_DT * MAX_SUBSTEPS);
    while (acc >= FIXED_DT) {
      const before = ang - target;
      const r = M.steerStep(ang, vel, target, FIXED_DT, M.BEAM_OMEGA, M.BEAM_ZETA);
      ang = r.angle;
      vel = r.vel;
      const after = ang - target;
      if (!crossed && before * after < 0) crossed = true;
      if (crossed) maxAfter = Math.max(maxAfter, Math.abs(after));
      if (Math.abs(after) >= band) lastOut = t;
      acc -= FIXED_DT;
    }
    t += frameDt;
  }
  return { overshoot: (maxAfter / travel) * 100, settle: lastOut, residual: Math.abs(ang - target) };
}

{
  const rates = [30, 60, 75, 90, 120, 144];
  const results = rates.map((hz) => ({ hz, ...sweep(hz) }));
  const ovs = results.map((r) => r.overshoot);
  const ovSpread = Math.max(...ovs) - Math.min(...ovs);

  console.log('  帧率无关性（固定步长累加器）：');
  for (const r of results) {
    console.log(`    ${String(r.hz).padStart(3)}Hz  过冲 ${r.overshoot.toFixed(2)}%  稳定 ${r.settle.toFixed(3)}s`);
  }
  console.log('');

  // 抱怨：「过冲随刷新率漂移」——修复前 30Hz 0.97% vs 144Hz 1.77%
  must('过冲不应随刷新率漂移（跨度 <0.05pp）', ovSpread < 0.05,
    `实测跨度 ${ovSpread.toFixed(3)} 个百分点`);
  must('过冲应柔和（<6%）', Math.max(...ovs) < 6, `最大 ${Math.max(...ovs).toFixed(2)}%`);
  must('不应死板无回弹（>0.5%）', Math.min(...ovs) > 0.5, `最小 ${Math.min(...ovs).toFixed(2)}%`);
  must('扫掠不应拖沓（<2.0s）', Math.max(...results.map((r) => r.settle)) < 2.0);
  must('应最终收敛（残差 <1e-3）', Math.max(...results.map((r) => r.residual)) < 1e-3);
}

// ── 9 · 声波衰减必须是精确指数 ──────────────────────────────────
// 抱怨：「声波在低刷新率下衰减过快」——逐帧 (1-k·dt) 复合在 30Hz 下偏快 8%
{
  const exact = Math.exp(-2.2 * 1);
  let worst = 0;
  for (const hz of [30, 60, 90, 120, 144]) {
    const dt = 1 / hz;
    const step = Math.exp(-2.2 * dt);
    const after1s = Math.pow(step, Math.round(1 / dt));
    worst = Math.max(worst, Math.abs(after1s / exact - 1));
  }
  must('声波 1 秒后剩余幅度应与刷新率无关（偏差 <1%）', worst < 0.01,
    `最大偏差 ${(worst * 100).toFixed(2)}%`);
}

// ── 10 · 换人策略必须走遍整条弧 ─────────────────────────────────
// 抱怨：「波束只在两个固定点之间来回」
{
  const n = SOURCE_COUNT;
  let cur = 0;
  const visited = new Set([0]);
  let lo = 0;
  let hi = 0;
  for (let i = 0; i < 600; i++) {
    let off;
    if (Math.random() < 0.35 && n >= 5) {
      off = 3 + Math.floor(Math.random() * (n - 3));
      if (Math.random() < 0.5) off = -off;
    } else {
      off = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
    }
    cur = (((cur + off) % n) + n) % n;
    visited.add(cur);
    lo = Math.min(lo, cur);
    hi = Math.max(hi, cur);
  }
  must('换人应能走到全部声源', visited.size === n, `实测 ${visited.size}/${n}`);
  must('换人应能到达弧的两端', lo === 0 && hi === n - 1, `到达过 ${lo} 与 ${hi}`);
}

// ── 11 · 拾音场点阵（声波涟漪）────────────────────────────────
const FIELD = new URL('../src/components/fieldMath.ts', import.meta.url);
const F = await import(FIELD.href);

// 抱怨：「波前位置算错 —— 涟漪从中心亮起而不是从波前亮起」
{
  const age = 0.5;
  const front = F.WAVE_SPEED * age;
  const atFront = F.rippleEnergy(front, age);
  const inside = F.rippleEnergy(front * 0.4, age);
  const outside = F.rippleEnergy(front * 1.8, age);
  must(
    '涟漪峰值出现在波前位置',
    atFront > inside && atFront > outside,
    `波前 ${atFront.toFixed(4)} / 内侧 ${inside.toFixed(4)} / 外侧 ${outside.toFixed(4)}`
  );
  must('波前之外迅速衰减', F.rippleEnergy(front + F.RING_WIDTH * 4, age) < 0.02);
}

// 抱怨：「非法输入产生 NaN，一路传到颜色索引」
{
  let ok = true;
  for (const [d, a] of [[0, 0], [-5, 1], [NaN, 1], [10, NaN], [10, -1], [Infinity, 1]]) {
    const v = F.rippleEnergy(d, a);
    if (!Number.isFinite(v) || v < 0 || v > 1) ok = false;
  }
  must('涟漪能量对非法输入返回有限值', ok);
}

// 抱怨：「多点叠加后能量溢出，取到越界的调色板颜色」
{
  const rs = [
    { x: 0, y: 0, age: 0.2 },
    { x: 3, y: 0, age: 0.22 },
    { x: 6, y: 0, age: 0.24 },
  ];
  const e = F.fieldAt(3, 0, rs, 1);
  must('叠加能量被钳制在 maxEnergy 内', e <= 1 + 1e-9, `实测 ${e.toFixed(4)}`);
  must('叠加能量无 NaN', Number.isFinite(e));

  let idxOk = true;
  for (const v of [-1, 0, 0.5, 1, 99, Infinity, NaN]) {
    const i = F.levelIndex(v, 1, 8);
    if (!Number.isInteger(i) || i < 0 || i > 7) idxOk = false;
  }
  must('调色板档位恒在 [0,7]', idxOk);
}

// 抱怨：「空涟漪数组崩溃」
must('无涟漪时能量为 0', F.fieldAt(10, 10, [], 1) === 0);

// 抱怨：「趋近速度依赖刷新率」
// wheel-rail 记过这条：裸的 x += (target-x)*0.1 在 120Hz 屏上会快一倍。
{
  const rates = [30, 60, 120, 144];
  const expRun = rates.map((hz) => {
    let x = 0;
    const dt = 1 / hz;
    for (let i = 0; i < hz; i++) x = F.easeToward(x, 1, 9, dt);
    return x;
  });
  const naiveRun = rates.map((hz) => {
    let x = 0;
    for (let i = 0; i < hz; i++) x += (1 - x) * 0.1;
    return x;
  });
  const expSpread = Math.max(...expRun) - Math.min(...expRun);
  const naiveSpread = Math.max(...naiveRun) - Math.min(...naiveRun);

  console.log('  拾音场点阵 · 趋近目标（1 秒后到达比例）：');
  rates.forEach((hz, i) => {
    console.log(
      `    ${String(hz).padStart(3)}Hz   1-exp(-k·dt) ${expRun[i].toFixed(6)}   裸 *0.1 ${naiveRun[i].toFixed(4)}`
    );
  });
  console.log('');

  must('1-exp(-k·dt) 与刷新率无关（跨度 <1e-9）', expSpread < 1e-9, `跨度 ${expSpread.toExponential(2)}`);
  must('裸 *0.1 确实会漂移（说明检查有分辨力）', naiveSpread > 0.02, `跨度 ${naiveSpread.toFixed(4)}`);
  must('趋近最终到达目标', Math.abs(expRun[0] - 1) < 1e-3, `1 秒后 ${expRun[0].toFixed(6)}`);
}

// ── 会议室选型器 ────────────────────────────────────────────────
//
// 这一段的断言都来自具体的失败模式，不是「看起来对不对」：
//   · 只填面积曾真的返回空结果（分母为 0 时基准分也是 0，全被阈值滤掉）
//   · 手写一个不存在的标签不会报错，只是永远匹配不到 —— 页面照常渲染
//   · 面积明显不符的方案必须排在后面，否则「450㎡」也会推小会议室
//   · 曾经有两条轴共 12 个标签，其中 3 对结果集完全相同、1 个命中全部方案 ——
//     所以下面有一条断言专门禁止「两个标签结果集相同」
{
  const catalog = JSON.parse(
    readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf-8')
  );
  const bundles = catalog.bundles;

  const idsOf = (m) => m.map((x) => x.bundle.id).sort().join(',');
  const only = (tag) => visibleMatches({ tags: [tag], area: null }, bundles);

  console.log('  会议室选型器：');
  console.log(`    方案 ${bundles.length} 个 · 需求 ${TAGS.length} 项`);

  // 抱怨：「什么都不选时页面是空的」
  const none = visibleMatches({ tags: [], area: null }, bundles);
  must(
    '什么都不选时返回全部方案（不是空）',
    none.length === bundles.length,
    `可见 ${none.length}/${bundles.length}`
  );

  // 抱怨：「只填面积得到空结果」—— 这条断言就是这个 bug 的回归测试
  for (const area of [30, 60, 70, 120, 300, 450]) {
    const r = visibleMatches({ tags: [], area }, bundles);
    must(`只填面积 ${area}㎡ 时结果非空`, r.length > 0, `可见 ${r.length}`);
  }

  // 抱怨：「面积不符的方案排在前面」
  const big = visibleMatches({ tags: ['会议'], area: 450 }, bundles);
  const bigIds = big.map((m) => m.bundle.id);
  must(
    '450㎡ 时大型方案排在小会议室之前',
    bigIds.indexOf('b-large') !== -1 && bigIds.indexOf('b-large') < bigIds.indexOf('b-small'),
    `顺序 ${bigIds.slice(0, 4).join(' > ')}`
  );
  const smallAt = big.find((m) => m.bundle.id === 'b-small');
  must(
    '450㎡ 时小会议室被判定为面积出界',
    smallAt && smallAt.areaOk === false,
    `areaOk=${smallAt ? String(smallAt.areaOk) : 'n/a'}`
  );

  // 抱怨：「一个都不命中时凑数充版面」
  const bogus = visibleMatches({ tags: ['不存在的需求'], area: null }, bundles);
  must(
    '手写的不存在标签不会匹配到任何方案（说明过滤有分辨力）',
    bogus.length === 0,
    `可见 ${bogus.length}`
  );

  // 抱怨：「某个选项点了必然 0 结果」
  const deadTags = TAGS.filter((t) => !bundles.some((b) => b.tags.includes(t)));
  must('每个需求选项都至少有一个方案命中', deadTags.length === 0, deadTags.join('、'));

  /**
   * 抱怨：「有两排筛选器，点了结果却一模一样」。
   * 这条断言正是当初那 12 个标签的设计错误：用途与诉求不独立，
   * 「教室培训」==「录播」、「信创合规」==「数据安全」、「投屏协作」==「无线投屏」。
   * 结果集相同的两个标签，对用户来说就是同一个按钮摆了两次。
   */
  const resultSets = TAGS.map((t) => ({ tag: t, key: idsOf(only(t)) }));
  const dupes = [];
  for (let i = 0; i < resultSets.length; i++) {
    for (let j = i + 1; j < resultSets.length; j++) {
      if (resultSets[i].key && resultSets[i].key === resultSets[j].key) {
        dupes.push(`${resultSets[i].tag} == ${resultSets[j].tag}`);
      }
    }
  }
  must('任意两个需求标签的结果集都不相同（没有重复按钮）', dupes.length === 0, dupes.join('；'));

  /**
   * 抱怨：「有个筛选器点了跟没点一样」。
   * 「拾音」曾经命中全部 8 个方案 —— 命中率 100% 的标签是装饰品。
   */
  const noop = resultSets.filter((r) => r.key.split(',').length === bundles.length).map((r) => r.tag);
  must('没有命中全部方案的无效标签', noop.length === 0, noop.join('、'));

  // 抱怨：「同样输入两次顺序不一样」（未来若引入 Map/时间戳会静默坏掉）
  const runA = matchBundles({ tags: ['会议', '扩声'], area: 60 }, bundles);
  const runB = matchBundles({ tags: ['会议', '扩声'], area: 60 }, bundles);
  must(
    '同样输入两次得到完全相同的顺序（确定性）',
    runA.map((m) => m.bundle.id).join() === runB.map((m) => m.bundle.id).join()
  );

  // 抱怨：「hits 里出现了用户没选过的标签」
  let hitsSubset = true;
  for (const t of [null, ...TAGS]) {
    const want = t === null ? [] : [t];
    for (const m of matchBundles({ tags: want, area: null }, bundles)) {
      if (!m.hits.every((h) => want.includes(h))) hitsSubset = false;
      if (m.hits.length !== want.filter((w) => m.bundle.tags.includes(w)).length) {
        hitsSubset = false;
      }
    }
  }
  must('hits 恒为「用户所选 ∩ 方案标签」的子集', hitsSubset);

  let scoreOk = true;
  let areaOkValid = true;
  for (const tg of [[], ...TAGS.map((t) => [t])]) {
    for (const area of [null, 25, 75, 500]) {
      for (const m of matchBundles({ tags: tg, area }, bundles)) {
        if (!(m.score >= 0 && m.score <= 1)) scoreOk = false;
        if (!(m.areaOk === null || m.areaOk === true || m.areaOk === false)) areaOkValid = false;
      }
    }
  }
  must('所有组合下分数恒在 [0,1]', scoreOk);
  must('所有组合下 areaOk 恒为 true/false/null', areaOkValid);
  console.log(`    阈值 ${MATCH_THRESHOLD} · 全组合扫描通过`);
  console.log('');
}

// ── 输出 ────────────────────────────────────────────────────────

console.log('─'.repeat(66));
if (notes.length) {
  console.log(`\n提示 (${notes.length})：`);
  notes.forEach((m) => console.log(`  · ${m}`));
}
if (errors.length) {
  console.log(`\n错误 (${errors.length})：`);
  errors.forEach((m) => console.log(`  ✗ ${m}`));
}
console.log('\n' + '─'.repeat(66));
/**
 * 这里刻意用 process.exitCode 而不是 process.exit()。
 *
 * Windows 上 process.exit() 会在「动态/静态 import 进来的 .ts 模块对应的
 * loader 异步句柄还没关闭」时触发 libuv 断言：
 *   Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c
 * 表现为断言全过、stdout 也打印了「通过」，进程却以 -1073740791 结束 ——
 * pnpm verify 会因此误判为失败。设置 exitCode 让 Node 自己排空事件循环即可。
 */
if (errors.length === 0) {
  console.log(`动效体检通过：${checks} 项断言全部成立\n`);
  process.exitCode = 0;
} else {
  console.log(`动效体检未通过：${errors.length} 项失败 / 共 ${checks} 项断言\n`);
  process.exitCode = 1;
}
