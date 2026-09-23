/**
 * WebP 头部解析：从文件字节直接读出真实像素尺寸。
 *
 * 为什么要手写而不是调 ffprobe：ffprobe 要把 stdout 捕获回来（管道），
 * 在受限沙箱下会被拦；而尺寸信息就在文件头里，20 行就能拿到。
 *
 * 三种格式：
 *   VP8  （有损）帧头里 14 位宽 / 14 位高
 *   VP8L （无损）紧接签名的 4 字节里 14 位宽-1 / 14 位高-1
 *   VP8X （扩展）24 位画布宽-1 / 高-1
 *
 * 供 gen-image-variants.mjs / optimize-images.mjs / doctor.mjs 共用，
 * 避免三份副本各自漂移。
 */
export function webpSize(buf) {
  if (buf.length < 30) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const fmt = buf.toString('ascii', 12, 16);

  if (fmt === 'VP8 ') {
    return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  if (fmt === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (fmt === 'VP8X') {
    return {
      w: (buf.readUIntLE(24, 3) & 0xffffff) + 1,
      h: (buf.readUIntLE(27, 3) & 0xffffff) + 1,
    };
  }
  return null;
}

/** 源图最长边的上限（与 optimize-images.mjs 保持一致） */
export const MAX_EDGE = 1920;

/** 卡片变体宽度（与 gen-image-variants.mjs 保持一致） */
export const CARD_WIDTH = 640;
