/**
 * 会议室选型器的匹配逻辑。
 *
 * 为什么单独一个文件，而不是写在 products.ts 里：
 *   products.ts 顶部 `import catalog from './products.json'`，Vite 能处理，
 *   但 Node 需要有 import attribute（`with { type: 'json' }`）才能加载，
 *   于是 scripts/motion-check.mjs 就无法直接断言这段逻辑了。
 *   soundFieldMath.ts / fieldMath.ts 当初也是因为这个原因从组件里拆出来的。
 *
 * 本文件不 import 任何 JSON，只 import 类型（运行时会被完全擦除），
 * 因此 `node --experimental-strip-types` 可以直接加载，逻辑可独立验证。
 */
import type { Bundle } from './products';

/**
 * 唯一的一条需求轴。
 *
 * 这里原本有两条轴（用途 / 诉求），共 12 个标签。实测发现其中 3 对标签的
 * 结果集完全相同 —— 「教室培训」==「录播」、「信创合规」==「数据安全」、
 * 「投屏协作」==「无线投屏」，因为每个方案在这两条轴上是成对打标的；
 * 另外「拾音」命中了全部 8 个方案，点了等于没点。
 *
 * 结论：两条轴不独立，12 个标签里只有 8 个是真实的。合并成一条轴后，
 * 用 motion-check 里「任意两个标签的结果集不得相同」这条断言守住，
 * 避免以后又长出重复选项。
 */
export const TAGS = [
  '会议',
  '教室培训',
  '报告厅',
  '远程视频',
  '信创合规',
  '投屏协作',
  '扩声',
  '摄像追踪',
] as const;

export interface PickerInput {
  /** 选中的需求标签，空数组 = 不限 */
  tags: string[];
  /** 房间面积（㎡）。null = 未填，不参与打分 */
  area: number | null;
}

export interface BundleMatch {
  bundle: Bundle;
  /** 0–1 */
  score: number;
  /** 命中的标签 */
  hits: string[];
  /** 面积是否落在区间内；方案无面积条件或用户未填时为 null */
  areaOk: boolean | null;
}

/** 低于这个分的方案不展示 —— 避免一条都没命中时凑数充版面 */
export const MATCH_THRESHOLD = 0.2;

/** 面积出界的扣分；不归零，因为用户报的面积可能比我们标的区间更宽松 */
const AREA_PENALTY = 0.35;

/** 面积落在区间内的加分，用于同分排序 */
const AREA_BONUS = 0.12;

/**
 * 按选型器输入给方案组合打分并排序。
 *
 * 打分用「命中率」而不是「命中数」：否则标签多的方案永远赢。
 * 面积只做加减分、不进分母 —— 一半的方案本来就没有面积条件，
 * 若把「无面积条件」算作不匹配，它们会永远排不到前面。
 *
 * 纯函数：同样的输入永远得到同样的顺序（同分时按事实源顺序稳定排列）。
 */
export function matchBundles(
  input: PickerInput,
  bundles: readonly Bundle[]
): BundleMatch[] {
  const want = input.tags;
  const hasArea = input.area !== null && Number.isFinite(input.area);
  const denominator = want.length;

  return bundles
    .map((bundle) => {
      const hits = want.filter((t) => bundle.tags.includes(t));

      let areaOk: boolean | null = null;
      if (hasArea) {
        const area = input.area as number;
        const hasBounds = bundle.areaMin !== null || bundle.areaMax !== null;
        if (hasBounds) {
          const aboveMin = bundle.areaMin === null || area >= bundle.areaMin;
          const belowMax = bundle.areaMax === null || area <= bundle.areaMax;
          areaOk = aboveMin && belowMax;
        }
        // 无面积条件的方案保持 null（「不冲突」，不是「命中」）
      }

      /**
       * 分母为 0 有两种情况，必须分开处理：
       *   · 没选标签、也没填面积 → 用户还没开始，给全部（分数无意义）
       *   · 只填了面积 → 面积就是唯一的轴，此时不能用 0 当基准，
       *     否则所有方案都是 0 分，会被阈值全部滤掉 —— 只填面积会得到空结果。
       */
      const base = denominator === 0 ? (hasArea ? 0.5 : 0) : hits.length / denominator;
      const score = Math.max(
        0,
        Math.min(
          1,
          base + (areaOk === true ? AREA_BONUS : 0) - (areaOk === false ? AREA_PENALTY : 0)
        )
      );

      return { bundle, score, hits, areaOk };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aArea = a.areaOk === true ? 1 : 0;
      const bArea = b.areaOk === true ? 1 : 0;
      if (bArea !== aArea) return bArea - aArea;
      return bundles.indexOf(a.bundle) - bundles.indexOf(b.bundle);
    });
}

/** 用户是否已经做了任何选择 */
export function isUntouched(input: PickerInput): boolean {
  return input.tags.length === 0 && input.area === null;
}

/** 过滤掉低于阈值的方案。用户什么都没选时返回全部（按事实源顺序） */
export function visibleMatches(
  input: PickerInput,
  bundles: readonly Bundle[]
): BundleMatch[] {
  const all = matchBundles(input, bundles);
  return isUntouched(input) ? all : all.filter((m) => m.score >= MATCH_THRESHOLD);
}
