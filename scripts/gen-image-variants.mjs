#!/usr/bin/env node
/**
 * 生成图片的尺寸变体。
 *
 * 为什么需要：站点里最过分的过度投递是 —— 一张 4500×2813 的图，在卡片里
 * 只渲染约 300px 宽（DPR2 下 600 设备像素）。15 倍的浪费。
 *
 * 做法：用 ffmpeg 为每张源图生成若干更小的 WebP 变体（绝不放大），
 * 并把「源图宽度 + 各变体宽度」写成 src/data/imageVariants.json。
 * 组件侧据此拼 srcset 的 w 描述符 —— 宽度是我们自己选的，不需要额外探测。
 *
 * 源图宽度由 Node 直接解析 WebP 头得到（省掉 ffprobe，也避开沙箱的管道捕获限制）。
 * 没有 ffmpeg 时整体跳过，组件自动回落到原图，行为与改动前一致。
 *
 * 用法：pnpm gen:images
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { webpSize, CARD_WIDTH } from './lib/webp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'src/assets/images');
const OUT_DIR = path.join(SRC_DIR, 'gen');
const MANIFEST = path.join(ROOT, 'src/data/imageVariants.json');

/**
 * 目标宽度。
 *
 * 源图已由 `optimize-images.mjs` 统一缩到最长边 1920px，因此现在只需要
 * **一档卡片尺寸**：卡片实际渲染约 300 CSS px（DPR2 → 600 设备像素），640 足够。
 * 详情页/灯箱直接用 1920 的源图作为 srcset 的最大一档。
 *
 * 早先还有 1280 一档，但在源图缩到 1920 之后它意义不大，反而让仓库变重。
 */
const WIDTHS = [CARD_WIDTH];
const QUALITY = 80;

function hasFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function encode(src, out, width) {
  // -2 保证高度是偶数（编码器要求）；scale 用 min() 避免放大
  execFileSync(
    'ffmpeg',
    [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', src,
      '-vf', `scale='min(${width},iw)':-2:flags=lanczos`,
      '-c:v', 'libwebp',
      '-quality', String(QUALITY),
      '-compression_level', '6',
      out,
    ],
    { stdio: 'ignore' }
  );
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('[images] 找不到 src/assets/images');
    process.exit(1);
  }
  if (!hasFfmpeg()) {
    console.warn('[images] 未检测到 ffmpeg，跳过变体生成。组件将回落到原图。');
    process.exit(0);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const sources = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith('.webp') && fs.statSync(path.join(SRC_DIR, f)).isFile());

  const manifest = {};
  let made = 0;
  let skipped = 0;
  let srcBytes = 0;
  let variantBytesAt640 = 0;

  for (const file of sources) {
    const key = file.replace(/\.webp$/, '');
    const srcPath = path.join(SRC_DIR, file);
    const size = webpSize(fs.readFileSync(srcPath));
    if (!size) {
      console.warn(`[images] 无法解析 WebP 头，跳过：${file}`);
      skipped++;
      continue;
    }
    srcBytes += fs.statSync(srcPath).size;

    const variants = [];
    for (const width of WIDTHS) {
      if (size.w <= width) {
        // 不放大：源图本来就没这么宽
        skipped++;
        continue;
      }
      const outName = `${key}.${width}.webp`;
      const outPath = path.join(OUT_DIR, outName);
      try {
        encode(srcPath, outPath, width);
      } catch (e) {
        console.warn(`[images] 编码失败 ${file} @${width}: ${e.message}`);
        continue;
      }
      const outSize = fs.statSync(outPath).size;
      if (width === 640) variantBytesAt640 += outSize;
      variants.push({ w: width, file: outName, bytes: outSize });
      made++;
    }

    manifest[key] = { originalWidth: size.w, originalHeight: size.h, variants };
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

  console.log(`\n[images] 源图 ${sources.length} 张，生成变体 ${made} 个（跳过 ${skipped} 个：源图更小或无法解析）`);
  console.log(`[images] 源图合计 ${(srcBytes / 1048576).toFixed(1)} MB`);
  console.log(`[images] 640px 变体合计 ${(variantBytesAt640 / 1048576).toFixed(2)} MB`);
  console.log(`[images] 清单写入 src/data/imageVariants.json`);
}

main();
