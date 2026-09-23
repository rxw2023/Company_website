import { useEffect, useRef } from 'react';
import {
  TAU,
  clamp01,
  ambientFade,
  deltaFromPoint,
  mainLobeHalfWidth,
  effectiveElements,
  bearingOf,
  sourcePosition,
  zoneIndexFor,
  steerStep,
  BEAM_OMEGA,
  BEAM_ZETA,
} from './soundFieldMath';

/**
 * SoundField —— 天花板麦克风阵列的「声场与波束」可视化
 *
 * 为什么是这个机制（而不是星空/粒子）：
 *   恒迪视讯做的是音视频会议。这个题材**自带物理**——声源定位（DOA）、
 *   波束成形、可配拾音区、双讲回声。一个放在咖啡品牌或律所首页同样好看的
 *   星空动画，按 motion-web `design-slop.md` B5 的判据就是装饰而非设计。
 *   这里画的正是 MC10 / MA600D / C60 实际在做的事：
 *     1. 声源发声 → 声波以弧面向前传播（幅度按距离衰减）
 *     2. 阵列估计来向 → 弹簧二阶动力学驱动波束**扫掠**过去（有惯性、会滞后）
 *     3. 波束半宽 = 阵列因子第一个零点 asin(2/N_eff)，且随转向角展宽（端射效应）
 *     4. 当前拾音区高亮，表示"可配拾音区"中被命中的那个
 *
 * ⚠️ 一个踩过的坑（务必不要改回去）：
 *   最初的实现把阵列因子 AF(ψ) 直接当**极坐标曲线**画（r = R·AF）。
 *   那是把一张科学图表当设计元素用：N=16 时主瓣两侧有约 15 个零点，
 *   曲线每到零点就回到圆心，渲染出来是一朵"多瓣花"，看起来像渲染事故。
 *   现在物理只保留在**宽度**里（可读的那个量），旁瓣用两层更宽更淡的锥体
 *   表示成柔和裙边。辐射方向图的形状不再逐瓣画出。
 *
 * DOA 跟踪延迟的故事保留在别处：**拾音区高亮是瞬间切换的，波束是扫过去的**。
 * （原来还画了一条"真实来向"的虚线来对照，但那条虚线把画面拉回了工程示意图的读感，已移除。）
 *
 * ── 点击交互：为什么它不算装饰 ──
 * 点画面任意位置 → 那里冒出一个声源（代表访客自己）、发出声波、波束带惯性扫过去，
 * 约 6 秒后淡出并交回自动巡游。
 *
 * 这条交互不是"加个动效好玩"，它演示的正是这个组件要讲的那件事：
 * **你在哪说话，阵列就转向哪** —— 声源定位 → 波束成形。访客亲手做一次，
 * 比看 7 个点自动轮换更能记住 MC10/MA600D 在干什么。按 design-slop B5 的判据，
 * 换成星空/粒子那种与业务无关的点击特效才叫装饰，这个不是。
 *
 * 两个实现约束：
 *   - canvas 默认 pointer-events: none（不拦截任何东西）。只有非降级模式下才在
 *     effect 里打开，并在清理时还原 —— 这样 prefers-reduced-motion 用户完全不受影响，
 *     也不会挡住覆盖其上的两个 CTA 按钮（它们 z-index 更高，天然优先）。
 *   - 用 click 而不是 pointerdown：触摸屏上滚动页面会触发 pointerdown，
 *     一边滑一边冒点。click 天然不会在滚动中触发。
 *
 * 配色遵循全站暖色体系（墨色 + 陶土），浅底低对比，不抢 H1。
 *
 * 性能约束（本站三个 canvas 组件同规：SoundField / Ma600dCurtain）：
 *   - 仅在视口内且标签页可见时跑 rAF
 *   - 颜色预置为常量，逐帧只用 globalAlpha，不拼接字符串
 *   - DPR 上限 2；物理用固定步长累加器推进
 *   - 声波弧数量封顶，避免长时间累积
 *
 * 无障碍：prefers-reduced-motion 下绘制一帧静态图；
 * 静态帧本身是构图完整的（阵列 + 拾音区 + 已锁定的波束），不是空白页。
 */

interface SoundFieldProps {
  className?: string;
  style?: React.CSSProperties;
  /** 阵列有效单元数，决定主瓣宽度。默认 8（= C60 的 8 单元阵列线麦） */
  elements?: number;
  /** 拾音区数量（默认 7；产品实际为 16 个可配区，这里取视觉可辨识的数） */
  zones?: number;
}

// ── 配色：与 --warm-* 体系一致，避免另起一套 ──
const INK = 'rgb(20,20,19)';
const WARM = 'rgb(204,120,92)';

interface SoundSource {
  /** 相对阵列的偏角（弧度），0 = 正下方 */
  delta: number;
  phase: number;
}

interface Wave {
  x: number;
  y: number;
  /** 当前半径（px） */
  r: number;
  /** 发射时的初始幅度 */
  amp0: number;
  /** 随时间衰减的包络系数（每帧相乘，与距离衰减分开计算） */
  decay: number;
  /** 点击产生的强调环：画得更粗更实，用来和语音包络的细环区分开 */
  strong?: boolean;
}

/** 点击瞬间的爆开环：粗、扩张快、短命，专门负责"这一下点到了"的反馈 */
interface Burst {
  x: number;
  y: number;
  r: number;
  /** 剩余寿命（秒），从 BURST_LIFE 递减到 0 */
  life: number;
}

export default function SoundField({
  className,
  style,
  // 8 = C60 双目摄像头的 8 单元阵列线麦。N 越大主瓣越窄（宽度 = asin(2/N)）
  elements = 8,
  zones = 7,
}: SoundFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── 几何：全部按当前尺寸换算，resize 时重算 ──
    let w = 0;
    let h = 0;
    let ax = 0; // 阵列位置
    let ay = 0;
    let reach = 0; // 阵列到声源的距离
    let fanHalf = 1.3; // 扇区半角（弧度）
    let spreadClamp = 1.34; // 声源偏角上限，点击也会被钳到这里（见 resize）

    // ── 点击交互的时长（唯一调参处）──
    /** 手动发声保持多久；同时也是「自动轮换暂停多久」 */
    const USER_HOLD = 6.0;
    /** 保持结束前这段时间内淡出，避免声源突然消失 */
    const USER_FADE = 0.9;
    /** 点击爆开环的寿命 */
    const BURST_LIFE = 0.75;
    /**
     * 访客发声期间，自动声源点压到多淡。
     * 0.12 让它们基本读不出来（0.35 × 0.12 ≈ 0.04 alpha），
     * 但又没硬删掉 —— 恢复时是淡入，不是突然冒出来。
     */
    const AMBIENT_DIM = 0.12;

    // 声源沿阵列下方的一条圆弧铺开，覆盖接近 0–180° 的整个半平面。
    // 原先只有左右两个点，中间一大片空着，波束也只在两点间来回。
    // 偏角在 resize 时按视口统一分配（见下）。
    const SOURCE_COUNT = 7;
    const sources: SoundSource[] = Array.from({ length: SOURCE_COUNT }, (_, i) => ({
      delta: 0,
      phase: i * 1.37, // 错开相位，避免所有声源的语音包络同相
    }));

    const srcPos = (s: SoundSource) => sourcePosition(ax, ay, reach, s.delta);

    /**
     * 波束分层：亮核 + 柔肩 + 旁瓣裙边。
     * k = 相对主瓣半宽的倍数，a = 该层的峰值透明度（三层叠加出柔和的核）。
     */
    const beamLayers = [
      { k: 1.0, a: 0.32 },
      { k: 2.0, a: 0.14 },
      { k: 3.4, a: 0.06 },
    ];
    /** 每层的径向渐变，只在 resize 时创建 —— 逐帧 createRadialGradient 是无谓分配 */
    let beamGrads: CanvasGradient[] = [];

    // ── 状态 ──
    let waves: Wave[] = [];
    let waveAcc = 0;
    let t = 0;
    let lastTs = 0;
    let raf = 0;

    // 会话调度：谁在说话、说了多久、什么时候换人
    let activeIdx = 0;
    let speaking = true;
    let phraseT = 0;
    let phraseLen = 3.4;
    let gapT = 0;

    // 波束动力学状态
    let beamAngle = bearingOf(sources[0].delta);
    let beamVel = 0;

    // ── 点击交互状态 ──
    /** 点击产生的声源偏角 */
    let userDelta = 0;
    /** > 0 表示"访客在说话"：它是当前发声者，且冻结自动轮换 */
    let userHold = 0;
    /** 点击爆开环 */
    let bursts: Burst[] = [];

    /**
     * 固定物理步长 + 累加器。
     * 借自 motion-web `cases/string-clock` 的「fixed DT + accumulator」模式。
     *
     * 为什么必须固定：半隐式欧拉配可变步长，会让**同一个弹簧在不同刷新率下表现不同**。
     * 实测本组件：30Hz 过冲 0.97%、144Hz 过冲 1.77%（相差 82%），
     * 稳定用时也从 1.600s 漂到 1.750s —— 等于把"手感"交给了用户的显示器。
     * 更麻烦的是 oracle 只在 dt=1/60 下跑过，测到的是刷新率而不是设计本身
     * （这正是 string-clock 说的"让 rAF 与 oracle 走同一条积分路径"）。
     */
    const FIXED_DT = 1 / 120;
    const MAX_SUBSTEPS = 4;
    let acc = 0;

    // 运行条件：非降级 && 在视口内 && 标签页可见
    let inView = false;
    let tabHidden = document.hidden;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const narrow = w < 760;
      // 扇角开到接近 ±83°，让扫描范围覆盖 0–180° 的整个半平面
      fanHalf = narrow ? 1.05 : 1.42;
      // 声源最外侧的偏角（略小于扇角，保证仍在扇区内且不出画面）
      const spread = narrow ? 0.85 : 1.34;
      spreadClamp = spread;

      // 沿圆弧均匀分配声源偏角：-spread … +spread
      const last = sources.length - 1;
      for (let i = 0; i < sources.length; i++) {
        const u = last === 0 ? 0 : (i / last) * 2 - 1; // -1 … +1
        sources[i].delta = u * spread;
      }

      ax = w * 0.5;
      ay = h * 0.13;
      reach = narrow ? Math.min(h * 0.5, w * 0.52) : Math.min(h * 0.72, w * 0.46);
      waves = [];
      bursts = [];

      const R = reach * 1.24;
      beamGrads = beamLayers.map((L) => {
        const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, R);
        g.addColorStop(0, `rgba(204,120,92,${L.a})`);
        g.addColorStop(0.55, `rgba(204,120,92,${L.a * 0.5})`);
        g.addColorStop(1, 'rgba(204,120,92,0)');
        return g;
      });
    };

    /**
     * 点击 → 在该方向上放置一个属于访客的声源。
     *
     * 用 click 而不是 pointerdown：触摸屏上滚动页面会先触发 pointerdown，
     * 于是变成"一边滑一边冒点"。click 不会在滚动过程中触发。
     *
     * 不做 preventDefault：这个 canvas 只是装饰层，不该打断用户选中文字。
     */
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      userDelta = deltaFromPoint(
        ax,
        ay,
        e.clientX - rect.left,
        e.clientY - rect.top,
        spreadClamp
      );
      userHold = USER_HOLD; // 每次点击都重新计时，连点就是连着说

      // 点击瞬间给足反馈：一个粗爆开环 + 两圈强调声波，都从新声源位置发出。
      // 波束不用手动指过去 —— 它由弹簧自然扫过去（那正是"有惯性"的观感来源）。
      const { x, y } = sourcePosition(ax, ay, reach, userDelta);
      bursts.push({ x, y, r: 0, life: BURST_LIFE });
      waves.push({ x, y, r: 0, amp0: 0.8, decay: 1, strong: true });
      waves.push({ x, y, r: 0, amp0: 0.5, decay: 1, strong: true });
    };

    // ── 绘制：当前拾音区 ──
    // 只画"正在听的那个扇区"，不再把 7 条扇区轮廓全画出来。
    // 全画时那些大半径圆弧会横贯整个画面，读起来是几条莫名其妙的杂线。
    const drawZone = (activeZone: number) => {
      const a0 = -fanHalf + (2 * fanHalf * activeZone) / zones;
      const a1 = -fanHalf + (2 * fanHalf * (activeZone + 1)) / zones;
      const R = reach * 1.32;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.arc(ax, ay, R, bearingOf(a0), bearingOf(a1));
      ctx.closePath();
      ctx.globalAlpha = 0.11;
      ctx.fillStyle = WARM;
      ctx.fill();

      // 区界只在近场画短刻度，读作"可配拾音区"而不制造长杂线
      ctx.strokeStyle = WARM;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.32;
      for (const a of [a0, a1]) {
        const b = bearingOf(a);
        ctx.beginPath();
        ctx.moveTo(ax + Math.cos(b) * 34, ay + Math.sin(b) * 34);
        ctx.lineTo(ax + Math.cos(b) * 84, ay + Math.sin(b) * 84);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // ── 绘制：阵列单元 ──
    const drawArray = () => {
      const dots: { x: number; y: number; r: number }[] = [];
      // 3 圈同心圆排布。不做纵向压扁 —— 压扁后读起来是一坨椭圆而不是阵列。
      for (let ring = 0; ring <= 2; ring++) {
        if (ring === 0) {
          dots.push({ x: ax, y: ay, r: 2.9 });
          continue;
        }
        const count = ring * 6;
        const rad = ring * 8.5;
        for (let i = 0; i < count; i++) {
          const a = (TAU * i) / count + ring * 0.35;
          dots.push({ x: ax + Math.cos(a) * rad, y: ay + Math.sin(a) * rad, r: 1.9 });
        }
      }
      // 暖色而非墨色：阵列是"设备"，和全站暖陶土体系一致；
      // 用墨色在浅底上读起来是一坨灰斑，会显得像脏点。
      ctx.fillStyle = WARM;
      ctx.globalAlpha = 0.62;
      for (let i = 1; i < dots.length; i++) {
        ctx.beginPath();
        ctx.arc(dots[i].x, dots[i].y, dots[i].r, 0, TAU);
        ctx.fill();
      }
      // 中心点更实，给整个阵列一个明确的锚
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(dots[0].x, dots[0].y, dots[0].r, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    // ── 绘制：波束 ──
    // 画的是"一束光"，不是辐射方向图。
    // 物理保留在**宽度**里：半角 = 阵列因子第一个零点 asin(2/N_eff)，
    // 且 N_eff 随转向角变化（端射展宽）。旁瓣不再逐瓣画出，
    // 而是用两层更宽更淡的锥体表示成柔和的裙边。
    // 三层的 alpha 叠加出"亮核 + 柔肩"，且避免了逐片填充的色带。
    const drawBeam = (angle: number) => {
      const nEff = effectiveElements(elements, angle);
      const half = mainLobeHalfWidth(nEff);
      const R = reach * 1.24;

      for (let i = 0; i < beamLayers.length; i++) {
        const L = beamLayers[i];
        const hw = half * L.k;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.arc(ax, ay, R, angle - hw, angle + hw);
        ctx.closePath();
        ctx.fillStyle = beamGrads[i];
        ctx.fill();
      }
    };

    // ── 绘制：声源 + 声波 ──
    // suppressActive：访客手动发声期间，自动声源不该同时亮着（否则画面上有两个
    // "正在说话"的点，读起来像 bug）。此时话轮归访客，自动点全部退回静默态。
    // fade：整体透明度系数。访客发声时把它们压到几乎不可见 —— 只压暗"当前发声"
    // 那一个是不够的，其余 6 个仍以 0.35 画着，只要有一个靠近点击位置，画面上
    // 就是两个点（用户截图指出的就是这个）。交接时同步淡回，不留突跳。
    const drawSources = (env: number, suppressActive: boolean, fade: number) => {
      for (let i = 0; i < sources.length; i++) {
        const { x, y } = srcPos(sources[i]);
        const isActive = !suppressActive && i === activeIdx && env > 0.02;

        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, TAU);
        ctx.fillStyle = isActive ? WARM : INK;
        ctx.globalAlpha = (isActive ? 0.95 : 0.35) * fade;
        ctx.fill();

        if (isActive) {
          // 发声时的能量环，半径随语音包络呼吸
          ctx.beginPath();
          ctx.arc(x, y, 7 + env * 12, 0, TAU);
          ctx.globalAlpha = 0.34 * env * fade;
          ctx.strokeStyle = WARM;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawWaves = () => {
      const falloff = reach * 0.95;
      ctx.strokeStyle = WARM;
      for (const wv of waves) {
        // 显示幅度 = 初始幅度 × 时间包络 × 距离衰减（不逐帧复合，避免衰减过快）
        const a = (wv.amp0 * wv.decay) / (1 + wv.r / falloff);
        // 强调环（点击产生）加粗并略微提亮，和语音包络的细环拉开层次
        ctx.globalAlpha = wv.strong ? Math.min(1, a * 1.15) : a;
        ctx.lineWidth = wv.strong ? 2.4 : 1.2;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, wv.r, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // ── 绘制：点击爆开环 ──
    // 粗、扩张快、短命。它和强调声波环叠在一起，负责把"这一次点击"和
    // 背景里持续滚动的语音声波区分开。
    const drawBursts = () => {
      for (const b of bursts) {
        const k = b.life / BURST_LIFE; // 1 → 0
        ctx.strokeStyle = WARM;
        ctx.lineWidth = 0.8 + 3.4 * k;
        ctx.globalAlpha = 0.34 * k * k;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // ── 绘制：访客点击产生的声源 ──
    // 画在最后（压在阵列和其他声源之上），并且刻意比那 7 个点大得多、实得多：
    //   · 非活动声源是墨色 alpha 0.35、r=3.2，几乎隐形
    //   · 更关键的是 .hd-hero-overlay 那层径向遮罩（中心 0.90、边缘 0.14）
    //     会把中段半径上的东西洗掉大半 —— 所以这里用高饱和的暖色 + 亮核，
    //     让点击反馈能穿透那层遮罩读出来。
    const drawUserSource = (env: number) => {
      if (userHold <= 0) return;
      const { x, y } = sourcePosition(ax, ay, reach, userDelta);
      // 最后 USER_FADE 秒线性淡出，避免 6 秒一到声源凭空消失
      const fade = Math.min(1, userHold / USER_FADE);

      // 外光晕：给这个点一个"发光"的读感
      ctx.fillStyle = WARM;
      ctx.globalAlpha = 0.2 * fade;
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, TAU);
      ctx.fill();

      // 脉动能量环：半径随语音包络呼吸，和自动声源的环同一套语汇但更大更实
      ctx.strokeStyle = WARM;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.55 * fade;
      ctx.beginPath();
      ctx.arc(x, y, 13 + env * 17, 0, TAU);
      ctx.stroke();

      // 实心点 + 亮核
      ctx.globalAlpha = 0.95 * fade;
      ctx.beginPath();
      ctx.arc(x, y, 5.6, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.9 * fade;
      ctx.fillStyle = 'rgb(255,247,242)';
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, TAU);
      ctx.fill();

      ctx.globalAlpha = 1;
    };

    // 注：原先这里画了一条"真实来向"的虚线，用来和滞后的波束对照。
    // 它把画面拉回了工程示意图的读感，已移除。
    // DOA 跟踪延迟的故事保留在别处：**拾音区高亮是瞬间切换的，波束是扫过去的**。

    // ── 静态帧（prefers-reduced-motion）──
    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      drawZone(0);
      drawArray();
      drawBeam(bearingOf(sources[0].delta));
      ctx.strokeStyle = WARM;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const { x, y } = srcPos(sources[0]);
        ctx.globalAlpha = 0.16 / i;
        ctx.beginPath();
        ctx.arc(x, y, i * 26, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // ── 每帧 ──
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const raw = lastTs ? (now - lastTs) / 1000 : FIXED_DT;
      lastTs = now;
      // 视觉与调度用真实时间（线性或基于绝对时间，与步长无关）；上限 50ms 防切页跳变
      const dt = Math.min(raw, 0.05);
      t += dt;

      /**
       * 话轮归属：访客手动发声期间，自动巡游整段冻结。
       *
       * 注意这里**不清空** speaking / phraseT —— 冻结而不是重置。
       * 保持结束、话轮交回时，自动流程从原来的状态接着走（只在交接处补一个
       * 短停顿），不会因为一次点击就把整场会议的节奏打乱重来。
       */
      const userActive = userHold > 0;
      if (userActive) {
        userHold = Math.max(0, userHold - dt);
        if (userHold === 0) {
          // 访客说完了：略作停顿再把话轮交回去，读起来像自然的换人
          speaking = false;
          phraseT = 0;
          gapT = 0.45;
        }
      } else if (speaking) {
        phraseT += dt;
        if (phraseT > phraseLen) {
          speaking = false;
          gapT = 0.5 + Math.random() * 1.2;
          phraseT = 0;
        }
      } else {
        gapT -= dt;
        if (gapT <= 0) {
          speaking = true;
          phraseLen = 2.6 + Math.random() * 2.6;

          // 换人：多数时候挪到邻近声源（同一场会议里的小幅交接），
          // 少数时候直接跳到较远处 —— 这样波束才会真的扫过整个 0–180°，
          // 而不是只在两个固定点之间来回。
          const n = sources.length;
          let off: number;
          if (Math.random() < 0.35 && n >= 5) {
            off = 3 + Math.floor(Math.random() * (n - 3)); // 远跳：至少跨 3 个位次
            if (Math.random() < 0.5) off = -off;
          } else {
            off = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
          }
          activeIdx = (((activeIdx + off) % n) + n) % n;
        }
      }

      // 语音包络：音节率 × 短语率，看起来像说话而不是正弦波
      const ph = sources[activeIdx].phase;
      const autoEnv = speaking
        ? clamp01(
            (0.55 + 0.45 * Math.sin(t * TAU * 4.3 + ph)) *
              (0.72 + 0.28 * Math.sin(t * TAU * 1.6 + ph * 1.7))
          )
        : 0;
      // 访客的声源只要还在保持期内就一直"在说话"，用同一套包络语汇
      const userEnv = userActive
        ? clamp01(
            (0.62 + 0.38 * Math.sin(t * TAU * 4.3)) *
              (0.78 + 0.22 * Math.sin(t * TAU * 1.6))
          )
        : 0;

      const env = userActive ? userEnv : autoEnv;
      /** 当前发声者：访客优先，否则自动轮到的那个 */
      const speakerDelta = userActive ? userDelta : sources[activeIdx].delta;
      const pos = sourcePosition(ax, ay, reach, speakerDelta);

      // 声波发射与传播：速度随画布尺度缩放，幅度按 1/(1+r) 衰减
      waveAcc += dt;
      if ((userActive || speaking) && waveAcc > 0.38) {
        waveAcc = 0;
        waves.push({ x: pos.x, y: pos.y, r: 0, amp0: 0.22 + 0.42 * env, decay: 1 });
      }
      const waveSpeed = reach * 0.4;
      // 衰减用精确指数：逐帧复合 (1 - k·dt) 在 30Hz 下会比理论快 8%、60Hz 下快 4%
      const decayStep = Math.exp(-2.2 * dt);
      for (const wv of waves) {
        wv.r += waveSpeed * dt;
        wv.decay *= decayStep;
      }
      waves = waves
        .filter((wv) => wv.r < reach * 1.6 && wv.decay > 0.05)
        .slice(-34); // 上限略放宽：点击会一次塞进两圈强调环，别把它们挤掉

      // 点击爆开环：扩张比声波快，寿命短
      for (const b of bursts) {
        b.r += reach * 0.62 * dt;
        b.life -= dt;
      }
      bursts = bursts
        .filter((b) => b.life > 0)
        // 上限兜底：每次点击都会塞进一个爆开环，连点时不限制会无限堆积
        .slice(-6);

      // 波束转向：固定步长积分，保证任何刷新率下过冲与稳定时间完全一致
      const target = bearingOf(speakerDelta);
      acc = Math.min(acc + raw, FIXED_DT * MAX_SUBSTEPS);
      while (acc >= FIXED_DT) {
        const st = steerStep(beamAngle, beamVel, target, FIXED_DT, BEAM_OMEGA, BEAM_ZETA);
        beamAngle = st.angle;
        beamVel = st.vel;
        acc -= FIXED_DT;
      }

      // 命中的拾音区（按真实来向，瞬间切换 → 与滞后波束形成对照）
      const activeZone = zoneIndexFor(speakerDelta, fanHalf, zones);

      ctx.clearRect(0, 0, w, h);
      // 顺序即层次：拾音区 → 声波 → 爆开环 → 波束 → 阵列 → 声源 → 访客声源
      drawZone(activeZone);
      drawWaves();
      drawBursts();
      drawBeam(beamAngle);
      drawArray();
      drawSources(autoEnv, userActive, ambientFade(userHold, USER_FADE, AMBIENT_DIM));
      drawUserSource(userEnv);
    };

    const start = () => {
      if (raf || reduceMotion) return;
      lastTs = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (!reduceMotion && inView && !tabHidden) start();
      else stop();
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) drawStatic();
    });
    ro.observe(canvas);

    let io: IntersectionObserver | null = null;
    const onVisibility = () => {
      tabHidden = document.hidden;
      sync();
    };

    if (reduceMotion) {
      drawStatic();
    } else {
      /**
       * 只有非降级模式才接管指针。
       *
       * canvas 的声明式样式是 pointer-events: none（不拦截任何东西）；
       * 这里临时打开，清理时还原。降级用户拿到的是静态帧 —— 给他们一块
       * "能点但点了没反应"的区域是骗人，所以干脆不接管。
       *
       * 打开后也不会挡住上面那两个 CTA：它们在 .hd-hero 里是 z-index 2，
       * 而 canvas 是 z-index 0，被覆盖的地方点击天然归按钮。
       */
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = 'pointer';
      canvas.addEventListener('click', onClick);

      io = new IntersectionObserver(
        (entries) => {
          inView = entries.some((e) => e.isIntersecting);
          sync();
        },
        { threshold: 0 }
      );
      io.observe(canvas);
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      stop();
      ro.disconnect();
      io?.disconnect();
      canvas.removeEventListener('click', onClick);
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = '';
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [elements, zones]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
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
