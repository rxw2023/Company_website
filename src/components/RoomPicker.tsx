import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BUNDLES, getProduct, productPath } from '../data/products';
import { TAGS, isUntouched, visibleMatches } from '../data/bundleMatch';

/** 常见房间面积，点一下比敲数字快 */
const AREA_PRESETS = [30, 60, 120, 300];

/** 未展开时最多给几套方案。8 套全铺出来正是这个区块「信息太多」的来源 */
const PREVIEW_COUNT = 3;

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * 会议室选型器。
 *
 * 设计取舍：
 *   · 只有一条需求轴（8 个标签）。原本是「用途 + 诉求」两条共 12 个标签，
 *     但其中 3 对结果集完全相同、1 个命中全部方案 —— 详见 bundleMatch.ts。
 *   · 未选任何条件时不渲染卡片。这个区块的承诺是「告诉我房间」，
 *     一上来铺满 8 套方案既与承诺矛盾，也让首屏重了一倍。
 *   · 结果先给 3 套，其余折叠。宁可让用户点一下「还有 N 套」，也不要一堵墙。
 *   · 不做数字化的「匹配度百分比」。分数是同分密集的（命中率），
 *     显示成 87% 是在编造精度；改为展示命中的标签。
 *   · 数据全部来自 products.json 的 bundles，不新建平行数据集。
 */
export default function RoomPicker() {
  const [tags, setTags] = useState<string[]>([]);
  const [areaText, setAreaText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();

  /** 只在是正整数时才算「填了面积」，其余（空、0、负数、半截输入）都当没填 */
  const area = useMemo(() => {
    const n = Number.parseInt(areaText, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [areaText]);

  const matches = useMemo(() => visibleMatches({ tags, area }, BUNDLES), [tags, area]);

  // 条件一变就收回折叠状态，否则上一次展开的 8 张会一直摊着
  useEffect(() => {
    setExpanded(false);
  }, [tags, area]);

  const untouched = isUntouched({ tags, area });
  /** 填了内容但不是有效面积（0 / 负数 / 只敲了减号）——不能让用户以为它生效了 */
  const areaInvalid = areaText.trim() !== '' && area === null;

  const shown = expanded ? matches : matches.slice(0, PREVIEW_COUNT);
  const hidden = matches.length - shown.length;

  const reset = () => {
    setTags([]);
    setAreaText('');
  };

  return (
    <section
      className="hd-section-light scroll-mt-16"
      id="picker"
      aria-labelledby="hd-picker-title"
    >
      <style>{`
        /* 选型器。形态上刻意不做成第 4 种章节标题 ——
           它是一个工具，标题直接长在工具卡片里。 */
        .hd-picker {
          border: 1px solid var(--warm-hairline);
          border-radius: 20px;
          background: var(--warm-surface);
          padding: 40px;
        }
        .hd-picker-head { margin-bottom: 26px; }
        .hd-picker-head .hd-section-title { margin-bottom: 8px; }
        .hd-picker-head .hd-section-desc { margin: 0; max-width: 62ch; }

        /* 一条轴 + 面积，同一行；窄屏堆叠 */
        .hd-picker-controls {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: start;
          gap: 20px 40px;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--warm-hairline);
        }
        .hd-picker-field {
          border: 0;
          margin: 0;
          padding: 0;
          min-inline-size: 0;
        }
        .hd-picker-legend {
          display: block;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--warm-muted);
          margin-bottom: 12px;
          padding: 0;
        }
        .hd-picker-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .hd-picker-chips .hd-cat-tab { padding: 7px 16px; }

        .hd-picker-area { display: flex; align-items: center; gap: 8px; }
        .hd-picker-input {
          font-family: var(--font-body);
          font-size: 15px;
          width: 104px;
          padding: 9px 14px;
          border: 1px solid var(--warm-hairline);
          border-radius: 10px;
          background: var(--warm-canvas);
          color: var(--warm-ink);
        }
        .hd-picker-input::placeholder { color: var(--warm-muted); opacity: 0.7; }
        .hd-picker-input:focus-visible {
          outline: 2px solid var(--warm-primary);
          outline-offset: 1px;
          border-color: var(--warm-primary);
        }
        .hd-picker-unit { font-size: 14px; color: var(--warm-muted); }
        .hd-picker-presets { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; max-width: 220px; }
        .hd-picker-preset {
          font-family: var(--font-body);
          font-size: 12px;
          padding: 4px 10px;
          border: 1px solid transparent;
          border-radius: 999px;
          background: var(--warm-canvas);
          color: var(--warm-muted);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .hd-picker-preset:hover { color: var(--warm-ink); border-color: var(--warm-hairline); }

        .hd-picker-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin: 20px 0 16px;
        }
        .hd-picker-count {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--warm-body);
        }
        .hd-picker-count strong { color: var(--warm-ink); font-weight: 600; }
        .hd-picker-warn { color: var(--warm-primary); }
        .hd-picker-reset {
          font-family: var(--font-body);
          font-size: 13px;
          padding: 6px 14px;
          border: 1px solid var(--warm-hairline);
          border-radius: 999px;
          background: transparent;
          color: var(--warm-muted);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .hd-picker-reset:hover { color: var(--warm-ink); border-color: var(--warm-primary); }

        .hd-picker-hint {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.7;
          color: var(--warm-muted);
        }

        .hd-picker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .hd-picker-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 22px;
          border: 1px solid var(--warm-hairline);
          border-radius: 14px;
          background: var(--warm-canvas);
        }
        .hd-picker-card-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hd-picker-card-name {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--warm-ink);
          margin: 0;
        }
        .hd-picker-card-cond {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--warm-primary);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .hd-picker-card-note {
          margin: 0;
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.65;
          color: var(--warm-body);
        }
        .hd-picker-products {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          list-style: none;
          margin: auto 0 0;
          padding: 12px 0 0;
          border-top: 1px solid var(--warm-hairline);
        }
        .hd-picker-product {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          color: var(--warm-body);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .hd-picker-product:hover {
          color: var(--warm-primary);
          border-bottom-color: var(--warm-primary);
        }
        .hd-picker-more {
          display: block;
          width: 100%;
          margin-top: 16px;
          padding: 12px;
          font-family: var(--font-body);
          font-size: 13.5px;
          border: 1px dashed var(--warm-hairline);
          border-radius: 12px;
          background: transparent;
          color: var(--warm-muted);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .hd-picker-more:hover { color: var(--warm-ink); border-color: var(--warm-primary); }
        .hd-picker-empty {
          margin: 0;
          padding: 28px;
          text-align: center;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.7;
          color: var(--warm-muted);
          border: 1px dashed var(--warm-hairline);
          border-radius: 14px;
        }

        @media (max-width: 720px) {
          .hd-picker { padding: 26px 20px; border-radius: 16px; }
          .hd-picker-controls { grid-template-columns: 1fr; gap: 20px; }
          .hd-picker-presets { max-width: none; }
        }
      `}</style>

      <div className="hd-section-inner">
        <div className="hd-picker">
          <div className="hd-picker-head">
            <p className="hd-section-eyebrow">选型助手</p>
            <h2 className="hd-section-title" id="hd-picker-title">
              告诉我房间，我来配方案
            </h2>
            <p className="hd-section-desc">
              勾选需求或填一个面积即可。方案来自我们实际交付的组合，不是临时拼凑的清单。
            </p>
          </div>

          <div className="hd-picker-controls">
            <fieldset className="hd-picker-field">
              <legend className="hd-picker-legend">你的需求</legend>
              <div className="hd-picker-chips">
                {TAGS.map((t) => {
                  const on = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`hd-cat-tab ${on ? 'active' : ''}`}
                      aria-pressed={on}
                      onClick={() => setTags((v) => toggle(v, t))}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="hd-picker-field">
              <label className="hd-picker-legend" htmlFor="hd-picker-area">
                房间面积
              </label>
              <div className="hd-picker-area">
                <input
                  id="hd-picker-area"
                  className="hd-picker-input"
                  type="number"
                  min={1}
                  max={5000}
                  inputMode="numeric"
                  placeholder="例如 60"
                  value={areaText}
                  onChange={(e) => setAreaText(e.target.value)}
                />
                <span className="hd-picker-unit">㎡</span>
              </div>
              <div className="hd-picker-presets">
                {AREA_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="hd-picker-preset"
                    onClick={() => setAreaText(String(n))}
                  >
                    {n}㎡
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hd-picker-bar">
            <p className="hd-picker-count" role="status" aria-live="polite">
              {areaInvalid ? (
                <span className="hd-picker-warn">面积请填大于 0 的数字，当前按「未填」处理</span>
              ) : untouched ? (
                '选择需求或填写面积，即可看到对应的方案'
              ) : matches.length > 0 ? (
                <>
                  为你找到 <strong>{matches.length}</strong> 套方案
                </>
              ) : (
                '没有匹配的方案'
              )}
            </p>
            {!untouched && (
              <button type="button" className="hd-picker-reset" onClick={reset}>
                重新选择
              </button>
            )}
          </div>

          {untouched ? (
            <p className="hd-picker-hint">
              例如「报告厅」会直接给出大型会议室方案；不确定面积也可以只勾需求。
            </p>
          ) : matches.length === 0 ? (
            <p className="hd-picker-empty">
              这个组合暂时没有现成方案。
              <br />
              减少几个条件，或直接联系我们按现场情况配置。
            </p>
          ) : (
            <>
              <motion.div layout={!reduce} className="hd-picker-grid">
                <AnimatePresence mode="popLayout">
                  {shown.map((m) => (
                    <motion.article
                      layout={!reduce}
                      key={m.bundle.id}
                      className="hd-picker-card"
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="hd-picker-card-top">
                        <h3 className="hd-picker-card-name">{m.bundle.name}</h3>
                        <span className="hd-picker-card-cond">{m.bundle.condition}</span>
                      </div>
                      <p className="hd-picker-card-note">{m.bundle.note}</p>
                      <ul className="hd-picker-products">
                        {m.bundle.products.map((pid) => {
                          const product = getProduct(pid);
                          if (!product) return null;
                          return (
                            <li key={pid}>
                              <Link to={productPath(pid)} className="hd-picker-product">
                                {product.model}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>

              {hidden > 0 && (
                <button
                  type="button"
                  className="hd-picker-more"
                  aria-expanded={expanded}
                  onClick={() => setExpanded(true)}
                >
                  还有 {hidden} 套相关方案
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
