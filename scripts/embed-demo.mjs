#!/usr/bin/env node
// 将 examples/care-summary.demo.json 安全嵌入 index.html，使页面无数据传入时也能显示示例。
// 用法：node scripts/embed-demo.mjs [--check]
// --check 只校验当前内嵌内容是否与 JSON 一致，不写文件。

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'index.html');
const jsonPath = path.join(root, 'examples', 'care-summary.demo.json');
const scriptId = 'embedded-demo-data';

const escapeForScript = (json) =>
  json.replace(/<\//gi, '<\\/').replace(/<!--/g, '<\\u0021--').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const html = await fs.readFile(htmlPath, 'utf8');
const source = (await fs.readFile(jsonPath, 'utf8')).trim();
JSON.parse(source);

const pattern = new RegExp(`(<script id="${scriptId}" type="application/json">)([\\s\\S]*?)(</script>)`);
const match = html.match(pattern);
if (!match) throw new Error(`index.html 中未找到 <script id="${scriptId}"> 容器`);
const embedded = match[2].trim();
const expected = escapeForScript(source);
const same = embedded === expected;

if (process.argv.includes('--check')) {
  const parsed = JSON.parse(embedded.replace(/<\\\//g, '</').replace(/<\\u0021--/g, '<!--'));
  const original = JSON.parse(source);
  if (JSON.stringify(parsed) !== JSON.stringify(original)) throw new Error('内嵌示例与 examples/care-summary.demo.json 不一致');
  console.log(`内嵌示例与 JSON 一致（${source.length} 字节，${original.orders.length} 笔订单）`);
  process.exit(0);
}

if (same) {
  console.log('内嵌示例已是最新，无需更新');
  process.exit(0);
}
const next = `${html.slice(0, match.index)}${match[1]}${expected}${match[3]}${html.slice(match.index + match[0].length)}`;
await fs.writeFile(htmlPath, next, 'utf8');
console.log(`已嵌入示例数据（${source.length} 字节，${JSON.parse(source).orders.length} 笔订单）`);
