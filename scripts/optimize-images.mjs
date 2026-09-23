#!/usr/bin/env node
/**
 * 把源图缩到网页真正需要的尺寸。
 *
 * 问题：源图是从相机/设计软件直接导出的 —— 最宽的一张 4826px、最过分的产品图
 * 4500×2813，而它们在页面上的最大用途是「点击查看大图」，容器 1040px。
 * 多出来的三千万像素纯粹是浪费：仓库 15.7 MB，访客首屏多下好几 MB。
 *
 * 这个脚本**原地重编码** src/assets/images/*.webp 到最长边 1920px。
 * 运行前会把原始文件完整备份到仓库外的一个目录（默认 ../<项目名>-images-original）。
 *
 * 幂等：已经不超过上限的图会跳过，重复运行不会二次压缩（避免代际损失）。
 *
 * 用法：
 *   node scripts/optimize-images.mjs --dry-run     # 只报告，不写文件
 *   node scripts/optimize-images.mjs               # 备份 + 原地重编码
 *   node scripts/optimize-images.mjs --no-backup   # 已单独备份过时使用
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { webpSize, MAX_EDGE } from './lib/webp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'src/assets/images');
const BACKUP_DIR = path.resolve(ROOT, '..', `${path.basename(ROOT)}-images-original`);

const QUALITY = 80;

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const NO_BACKUP = args.includes('--no-backup');

function hasFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const fmtMB = (b) => `${(b / 1048576).toFixed(1)} MB`;

function main() {
  if (!hasFfmpeg()) {
    console.error('[optimize] 未检测到 ffmpeg，无法重编码。');
    process.exit(1);
  }
  if (!fs.existsSync(IMG_DIR)) {
    console.error('[optimize] 找不到 src/assets/images');
    process.exit(1);
  }

  const files = fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.webp'));
  const todo = [];
  let totalBefore = 0;
  let skipped = 0;

  for (const file of files) {
    const p = path.join(IMG_DIR, file);
    const size = webpSize(fs.readFileSync(p));
    if (!size) {
      console.warn(`[optimize] 无法解析，跳过：${file}`);
      skipped++;
      continue;
    }
    const bytes = fs.statSync(p).size;
    totalBefore += bytes;
    if (Math.max(size.w, size.h) <= MAX_EDGE) {
      skipped++; // 已在上限内，跳过（幂等）
      continue;
    }
    todo.push({ file, path: p, ...size, bytes });
  }

  console.log(`\n[optimize] 源图 ${files.length} 张，需要缩小的 ${todo.length} 张，跳过 ${skipped} 张`);
  console.log(`[optimize] 当前合计 ${fmtMB(totalBefore)}，上限 ${MAX_EDGE}px / q${QUALITY}`);

  if (DRY) {
    console.log('\n[optimize] --dry-run，未写任何文件。以下是将被缩小的图：');
    for (const t of todo.slice(0, 20)) {
      console.log(`  ${t.file.padEnd(22)} ${t.w}×${t.h}  ${(t.bytes / 1024).toFixed(0)} KB`);
    }
    if (todo.length > 20) console.log(`  … 其余 ${todo.length - 20} 张`);
    return;
  }

  if (!NO_BACKUP) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    for (const t of todo) {
      const dest = path.join(BACKUP_DIR, t.file);
      if (!fs.existsSync(dest)) fs.copyFileSync(t.path, dest);
    }
    console.log(`[optimize] 原始文件已备份到 ${BACKUP_DIR}`);
  }

  let totalAfter = 0;
  let done = 0;

  /**
   * 限制**最长边**，而不是只限制宽度。
   * 早先写成 `scale='min(W,iw)':-2` 只约束宽度：竖图处理后高度仍可能超限，
   * 于是「跳过判断用最长边、缩放却只看宽度」两者不一致 —— 脚本失去幂等性，
   * 每跑一次都会对那几张竖图二次压缩（代际损失）。
   */
  const scaleFilter =
    `scale=w='if(gt(iw,ih),min(${MAX_EDGE},iw),-2)'` +
    `:h='if(gt(iw,ih),-2,min(${MAX_EDGE},ih))':flags=lanczos`;

  for (const t of todo) {
    const tmp = `${t.path}.tmp.webp`;
    try {
      execFileSync(
        'ffmpeg',
        [
          '-hide_banner', '-loglevel', 'error', '-y',
          '-i', t.path,
          '-vf', scaleFilter,
          '-c:v', 'libwebp',
          '-quality', String(QUALITY),
          '-compression_level', '6',
          tmp,
        ],
        { stdio: 'ignore' }
      );
      fs.renameSync(tmp, t.path);
      totalAfter += fs.statSync(t.path).size;
      done++;
    } catch (e) {
      console.warn(`[optimize] 失败 ${t.file}: ${e.message}`);
      if (fs.existsSync(tmp)) fs.rmSync(tmp);
    }
  }

  // 未处理的图保持原样计入总量
  const untouched = totalBefore - todo.reduce((s, t) => s + t.bytes, 0);
  console.log(`[optimize] 已重编码 ${done} 张`);
  console.log(`[optimize] 合计 ${fmtMB(totalBefore)} → ${fmtMB(totalAfter + untouched)}`);
  console.log(`[optimize] 备份仍在 ${BACKUP_DIR}（确认无误后可自行删除）`);
}

main();
