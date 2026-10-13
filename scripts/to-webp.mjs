#!/usr/bin/env node
/**
 * 把 png / jpg / jpeg / gif / bmp 转成 WebP（网站只收 WebP 的入口脚本）。
 *
 * 为什么必须有这一步：站点的图片管线（optimize-images / gen-image-variants /
 * doctor 的尺寸校验）**只认 .webp**。设计给的图、官网扒下来的图通常还是 png/jpg，
 * 直接丢进 src/assets/images/ 会得到一个更糟的结果 ——
 * 文件进了仓库、doctor 看不见它（只扫 .webp），页面还得靠 PNG 原图渲染。
 *
 * 这个脚本负责「进门前那一步」：
 *   1. ffmpeg 转码为 WebP（默认质量 82，q 越高越清晰、体积越大）
 *   2. 写出到目标目录（默认与源同目录）
 *   3. **不删除**源文件 —— 删不删由人决定，脚本不替你做不可逆的事
 *
 * 用法：
 *   pnpm towebp 下载                              # 处理目录下所有 png/jpg（递归）
 *   pnpm towebp 下载/a.png                        # 单个文件
 *   pnpm towebp 下载 --out src/assets/images      # 直接落到站点图片目录
 *   pnpm towebp 下载 --quality 90                 # 提高画质（默认 82）
 *   pnpm towebp 下载 --force                      # 覆盖已存在的同名 .webp
 *
 * 转完记得接着做两件事（见 BRAND_GUIDE.md「加图片」）：
 *   1. 文件名改成资源 key 规范，如 w1-1.webp / h1-1.webp
 *   2. 在 src/data/productImages.ts 里 import 并登记 key
 * 然后 `pnpm run doctor` 会告诉你还差什么。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 支持的输入格式（WebP 本身跳过：已经是目标格式） */
const INPUT_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tif', '.tiff', '.avif'];

/** 每个源文件在页面上真正需要的最大边长（与 optimize-images.mjs 的 MAX_EDGE 一致） */
const MAX_EDGE = 1920;

const args = process.argv.slice(2);

/**
 * 手写解析而不是用库：这里只有 5 个开关，但有个坑必须处理对 ——
 * `--out 目录` 的值会被朴素过滤当成位置参数，于是「待转文件」里多出一个目录、
 * 而输出目录又丢了。所以遇到取值型开关时要显式跳过它的值。
 */
const VALUE_FLAGS = new Set(['--out', '--quality']);
const positional = [];
let outFlag;
let qualityFlag;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (VALUE_FLAGS.has(a)) {
    const v = args[++i];
    if (a === '--out') outFlag = v;
    else qualityFlag = v;
    continue;
  }
  if (a.startsWith('--')) continue; // 布尔开关
  positional.push(a);
}

const QUALITY = Number(qualityFlag || 82);
const OUT_DIR = outFlag ? path.resolve(ROOT, outFlag) : null;
const FORCE = args.includes('--force');

if (qualityFlag !== undefined && (!Number.isFinite(QUALITY) || QUALITY < 1 || QUALITY > 100)) {
  console.error(`[webp] --quality 必须是 1–100 的数字，实际是 ${qualityFlag}`);
  process.exit(1);
}

function hasFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** 递归收集待转换的文件 */
function collect(input) {
  const abs = path.resolve(ROOT, input);
  if (!fs.existsSync(abs)) {
    console.error(`[webp] 找不到路径：${input}`);
    return [];
  }
  const stat = fs.statSync(abs);
  if (stat.isFile()) {
    return INPUT_EXT.includes(path.extname(abs).toLowerCase()) ? [abs] : [];
  }
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) out.push(...collect(full));
    else if (INPUT_EXT.includes(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

/**
 * 最长边限制，和 optimize-images.mjs 同一套写法。
 * 竖图同样受约束 —— 只限宽度会让竖图处理完仍然超限，脚本就失去幂等性了。
 */
const scaleFilter =
  `scale=w='if(gt(iw,ih),min(${MAX_EDGE},iw),-2)'` +
  `:h='if(gt(iw,ih),-2,min(${MAX_EDGE},ih))':flags=lanczos`;

function convert(src) {
  const base = path.basename(src, path.extname(src));
  const dir = OUT_DIR || path.dirname(src);
  const out = path.join(dir, `${base}.webp`);

  if (fs.existsSync(out) && !FORCE) {
    console.log(`[webp] 跳过（已存在，加 --force 覆盖）：${path.relative(ROOT, out)}`);
    return { skipped: true };
  }
  fs.mkdirSync(dir, { recursive: true });

  const before = fs.statSync(src).size;
  try {
    execFileSync(
      'ffmpeg',
      [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-i', src,
        '-vf', scaleFilter,
        // 去掉可能存在的 EXIF/ICC 元数据块，避免把相机信息带进网站图片
        '-map_metadata', '-1',
        '-c:v', 'libwebp',
        '-quality', String(QUALITY),
        '-compression_level', '6',
        out,
      ],
      { stdio: 'ignore' }
    );
  } catch (e) {
    console.error(`[webp] 转换失败 ${path.relative(ROOT, src)}：${e.message}`);
    if (fs.existsSync(out)) fs.rmSync(out);
    return { failed: true };
  }

  const after = fs.statSync(out).size;
  const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;
  console.log(
    `[webp] ${path.relative(ROOT, src)} → ${path.relative(ROOT, out)}` +
      `  ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB（省 ${saved}%）`
  );
  return { bytesBefore: before, bytesAfter: after };
}

function main() {
  if (!positional.length) {
    console.log(
      '\n用法：pnpm towebp <文件或目录> [--out <输出目录>] [--quality 82] [--force]\n' +
        '  例：pnpm towebp 下载 --out src/assets/images\n'
    );
    process.exit(0);
  }
  if (!hasFfmpeg()) {
    console.error('[webp] 未检测到 ffmpeg。安装后重试（Windows: winget install ffmpeg）。');
    process.exit(1);
  }

  const files = positional.flatMap(collect);
  if (!files.length) {
    console.log('[webp] 没有找到可转换的文件（支持 ' + INPUT_EXT.join(' / ') + '）');
    process.exit(0);
  }

  console.log(`\n[webp] 待转换 ${files.length} 个文件，质量 q${QUALITY}，最长边 ≤${MAX_EDGE}px\n`);

  let done = 0;
  let skipped = 0;
  let failed = 0;
  let before = 0;
  let after = 0;
  for (const f of files) {
    const r = convert(f);
    if (r.skipped) skipped++;
    else if (r.failed) failed++;
    else {
      done++;
      before += r.bytesBefore;
      after += r.bytesAfter;
    }
  }

  console.log(
    `\n[webp] 完成：转换 ${done} / 跳过 ${skipped} / 失败 ${failed}` +
      (done ? `，合计 ${(before / 1048576).toFixed(2)} MB → ${(after / 1048576).toFixed(2)} MB` : '')
  );
  if (done) {
    console.log(
      '[webp] 源文件保留未删（确认无误后自行清理）。\n' +
        '[webp] 下一步：按资源 key 规范重命名 → 登记到 productImages.ts → pnpm run doctor'
    );
  }
  if (failed) process.exitCode = 1;
}

main();
