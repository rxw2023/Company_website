/**
 * 跨平台清理构建产物。
 * 取代原来的 `rm -rf dist`（在 Windows cmd 下不可用）。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
console.log('[Clean] 已清理 dist/');
