/**
 * 产品图片 / 彩页资源映射表（唯一入口）
 *
 * 为什么需要这一层：Vite 要求静态 import 才能参与打包与哈希，
 * 不能从 JSON 里读文件名去动态拼路径。所以把"资源 → 打包后 URL"
 * 的映射集中在这里，JSON 里只存资源 key。
 *
 * 新增产品图片时：把文件放进 src/assets/images/，在下面加一行 import，
 * 并在 IMAGE_BY_KEY 里登记 key。key 必须与 products.json 中的
 * cardImage / images 完全一致，`pnpm run doctor` 会校验。
 */

// ── 产品图集 ──
import a1_1 from '../assets/images/a1-1.webp';
import a1_2 from '../assets/images/a1-2.webp';
import a1_3 from '../assets/images/a1-3.webp';
import a1_4 from '../assets/images/a1-4.webp';

import a2_1 from '../assets/images/a2-1.webp';
import a2_2 from '../assets/images/a2-2.webp';
import a2_3 from '../assets/images/a2-3.webp';
import a2_4 from '../assets/images/a2-4.webp';

import a3_1 from '../assets/images/a3-1.webp';
import a3_2 from '../assets/images/a3-2.webp';
import a3_3 from '../assets/images/a3-3.webp';
import a3_4 from '../assets/images/a3-4.webp';

import a4_1 from '../assets/images/a4-1.webp';
import a4_2 from '../assets/images/a4-2.webp';
import a4_3 from '../assets/images/a4-3.webp';
import a4_4 from '../assets/images/a4-4.webp';

import a5_1 from '../assets/images/a5-1.webp';
import a5_2 from '../assets/images/a5-2.webp';
import a5_3 from '../assets/images/a5-3.webp';
import a5_4 from '../assets/images/a5-4.webp';

import a6_1 from '../assets/images/a6-1.webp';
import a6_2 from '../assets/images/a6-2.webp';
import a6_3 from '../assets/images/a6-3.webp';
import a6_4 from '../assets/images/a6-4.webp';

import a7_1 from '../assets/images/a7-1.webp';
import a7_2 from '../assets/images/a7-2.webp';
import a7_3 from '../assets/images/a7-3.webp';
import a7_4 from '../assets/images/a7-4.webp';

import a8_1 from '../assets/images/a8-1.webp';
import a8_2 from '../assets/images/a8-2.webp';
import a8_3 from '../assets/images/a8-3.webp';
import a8_4 from '../assets/images/a8-4.webp';

import a9_1 from '../assets/images/a9-1.webp';
import a9_2 from '../assets/images/a9-2.webp';
import a9_3 from '../assets/images/a9-3.webp';
import a9_4 from '../assets/images/a9-4.webp';

import a10_1 from '../assets/images/a10-1.webp';
import a10_2 from '../assets/images/a10-2.webp';
import a10_3 from '../assets/images/a10-3.webp';
import a10_4 from '../assets/images/a10-4.webp';
import a10_5 from '../assets/images/a10-5.webp';

import a11_1 from '../assets/images/a11-1.webp';
import a11_2 from '../assets/images/a11-2.webp';
import a11_3 from '../assets/images/a11-3.webp';
import a11_4 from '../assets/images/a11-4.webp';

import a12_1 from '../assets/images/a12-1.webp';
import a12_2 from '../assets/images/a12-2.webp';

import a18_1 from '../assets/images/a18-1.webp';
import a18_2 from '../assets/images/a18-2.webp';

import a19_1 from '../assets/images/a19-1.webp';
import a19_2 from '../assets/images/a19-2.webp';
import a19_3 from '../assets/images/a19-3.webp';
import a19_4 from '../assets/images/a19-4.webp';

// ── 产品彩页 ──
import pdfA1 from '../assets/pdf/MC10吸顶麦克风.pdf';
import pdfA2 from '../assets/pdf/MA600D矩阵麦克风.pdf';
import pdfA3 from '../assets/pdf/MCS06拾扩一体吸顶麦克风.pdf';
import pdfA4 from '../assets/pdf/C40T视频会议室摄像机.pdf';
import pdfA5 from '../assets/pdf/AI智能声像追踪主机MT100.pdf';
import pdfA6 from '../assets/pdf/AISPK-DC20PoE吸顶音箱.pdf';
import pdfA7 from '../assets/pdf/高端吸顶麦克风-MC08.pdf';
import pdfA8 from '../assets/pdf/企业级会议麦克风音箱M12.pdf';
import pdfA9 from '../assets/pdf/AI追踪双目语音摄像头C60.pdf';
import pdfA10 from '../assets/pdf/B100_DM0403.pdf';
import pdfA11 from '../assets/pdf/MC04.pdf';
import pdfA12 from '../assets/pdf/MK300-结构尺寸六视图.pdf';
import pdfA18 from '../assets/pdf/会议办公大模型信创一体机D1.pdf';
import pdfA19 from '../assets/pdf/BYOM投屏套装.pdf';

// ── 案例卡片图（每个案例首图）──
import caseE1 from '../assets/images/e1.webp';
import caseE2 from '../assets/images/e2.webp';
import caseE3 from '../assets/images/e3-1.webp';
import caseE4 from '../assets/images/e4-1.webp';
import caseE5 from '../assets/images/e5-1.webp';
import caseE6 from '../assets/images/e6-1.webp';
import caseE7 from '../assets/images/e7-1.webp';
import caseE8 from '../assets/images/e8-1.webp';
import caseE9 from '../assets/images/e9-1.webp';
import caseE10 from '../assets/images/e10-1.webp';
import caseE11 from '../assets/images/e11-1.webp';
import caseE12 from '../assets/images/e12-1.webp';

// ── 案例详情页第 2 张图（原先只在 CaseDetailPage 里 import，合并后统一收在这里）──
import caseE3_2 from '../assets/images/e3-2.webp';
import caseE4_2 from '../assets/images/e4-2.webp';
import caseE5_2 from '../assets/images/e5-2.webp';
import caseE6_2 from '../assets/images/e6-2.webp';
import caseE7_2 from '../assets/images/e7-2.webp';
import caseE8_2 from '../assets/images/e8-2.webp';
import caseE9_2 from '../assets/images/e9-2.webp';
import caseE10_2 from '../assets/images/e10-2.webp';
import caseE11_2 from '../assets/images/e11-2.webp';
import caseE12_2 from '../assets/images/e12-2.webp';

// ── 案例视频 ──
import caseE1Video from '../assets/videos/e1.mp4';
import caseE2Video from '../assets/videos/e2.mp4';

/** 资源 key（如 "a1-1"）→ 打包后的图片 URL */
export const IMAGE_BY_KEY: Record<string, string> = {
  'a1-1': a1_1, 'a1-2': a1_2, 'a1-3': a1_3, 'a1-4': a1_4,
  'a2-1': a2_1, 'a2-2': a2_2, 'a2-3': a2_3, 'a2-4': a2_4,
  'a3-1': a3_1, 'a3-2': a3_2, 'a3-3': a3_3, 'a3-4': a3_4,
  'a4-1': a4_1, 'a4-2': a4_2, 'a4-3': a4_3, 'a4-4': a4_4,
  'a5-1': a5_1, 'a5-2': a5_2, 'a5-3': a5_3, 'a5-4': a5_4,
  'a6-1': a6_1, 'a6-2': a6_2, 'a6-3': a6_3, 'a6-4': a6_4,
  'a7-1': a7_1, 'a7-2': a7_2, 'a7-3': a7_3, 'a7-4': a7_4,
  'a8-1': a8_1, 'a8-2': a8_2, 'a8-3': a8_3, 'a8-4': a8_4,
  'a9-1': a9_1, 'a9-2': a9_2, 'a9-3': a9_3, 'a9-4': a9_4,
  'a10-1': a10_1, 'a10-2': a10_2, 'a10-3': a10_3, 'a10-4': a10_4, 'a10-5': a10_5,
  'a11-1': a11_1, 'a11-2': a11_2, 'a11-3': a11_3, 'a11-4': a11_4,
  'a12-1': a12_1, 'a12-2': a12_2,
  'a18-1': a18_1, 'a18-2': a18_2,
  'a19-1': a19_1, 'a19-2': a19_2, 'a19-3': a19_3, 'a19-4': a19_4,
};

/** 彩页文件名 → 打包后的 PDF URL */
export const PDF_BY_FILE: Record<string, string> = {
  'MC10吸顶麦克风.pdf': pdfA1,
  'MA600D矩阵麦克风.pdf': pdfA2,
  'MCS06拾扩一体吸顶麦克风.pdf': pdfA3,
  'C40T视频会议室摄像机.pdf': pdfA4,
  'AI智能声像追踪主机MT100.pdf': pdfA5,
  'AISPK-DC20PoE吸顶音箱.pdf': pdfA6,
  '高端吸顶麦克风-MC08.pdf': pdfA7,
  '企业级会议麦克风音箱M12.pdf': pdfA8,
  'AI追踪双目语音摄像头C60.pdf': pdfA9,
  'B100_DM0403.pdf': pdfA10,
  'MC04.pdf': pdfA11,
  'MK300-结构尺寸六视图.pdf': pdfA12,
  '会议办公大模型信创一体机D1.pdf': pdfA18,
  'BYOM投屏套装.pdf': pdfA19,
};

/** 案例资源 key（如 "e1" / "e3-1"）→ 打包后的图片 URL */
export const CASE_IMAGE_BY_KEY: Record<string, string> = {
  'e1': caseE1,
  'e2': caseE2,
  'e3-1': caseE3,
  'e4-1': caseE4,
  'e5-1': caseE5,
  'e6-1': caseE6,
  'e7-1': caseE7,
  'e8-1': caseE8,
  'e9-1': caseE9,
  'e10-1': caseE10,
  'e11-1': caseE11,
  'e12-1': caseE12,
  'e3-2': caseE3_2,
  'e4-2': caseE4_2,
  'e5-2': caseE5_2,
  'e6-2': caseE6_2,
  'e7-2': caseE7_2,
  'e8-2': caseE8_2,
  'e9-2': caseE9_2,
  'e10-2': caseE10_2,
  'e11-2': caseE11_2,
  'e12-2': caseE12_2,
};

/** 案例视频 key（如 "e1"）→ 打包后的视频 URL */
export const CASE_VIDEO_BY_KEY: Record<string, string> = {
  'e1': caseE1Video,
  'e2': caseE2Video,
};
