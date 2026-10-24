#!/usr/bin/env node
// 把 MCP 订单数据嵌入 index.html，生成可双击打开的独立关怀小结页面。
// 用法：node scripts/embed-mcp-data.mjs <数据.json> [--out <输出.html>] [--force] [--check]
//   <数据.json> 必须含 "source": "mcp" 与 generatedAt。
//   --out    默认在源文件旁生成 care-summary.mcp.html，不覆盖 index.html。
//   --force  允许覆盖已存在的输出文件。
//   --check  只校验源数据与输出是否一致，不写文件（需配合 --out）。

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const positional = args.filter((arg) => !arg.startsWith('--'));
const optionValue = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

if (!positional[0]) {
  console.error('用法：node scripts/embed-mcp-data.mjs <数据.json> [--out <输出.html>] [--force] [--check]');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), positional[0]);
const outputPath = path.resolve(process.cwd(), optionValue('--out') || path.join(path.dirname(inputPath), 'care-summary.mcp.html'));

const FORBIDDEN_KEY = /^(authorization|token|accessToken|apiKey|secret|password|phone|mobile|address|addressDetail|memberId|memberCode)$/i;
const visits = [];

function inspect(value, pointer) {
  if (Array.isArray(value)) return value.forEach((item, index) => inspect(item, `${pointer}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_KEY.test(key) && typeof item !== 'undefined' && item !== null && item !== '') {
      throw new Error(`检测到敏感或未脱敏字段：${pointer}.${key}，请先脱敏再嵌入`);
    }
    inspect(item, `${pointer}.${key}`);
  }
}

function scanSensitive(payload) {
  visits.length = 0;
  inspect(payload, '$');
  const raw = JSON.stringify(payload);
  if (/(?<!\d)1[3-9]\d{9}(?!\d)/.test(raw)) throw new Error('检测到疑似完整手机号，请脱敏后再嵌入');
  if (/Bearer\s+[A-Za-z0-9._-]{12,}/.test(raw)) throw new Error('检测到疑似 Bearer Token，请移除后再嵌入');
  if (/"(?:couponCode|couponId)"\s*:\s*"[^"]{8,}"/.test(raw)) throw new Error('检测到疑似券码字段，请脱敏后再嵌入');
}

const escapeForScript = (json) =>
  json.replace(/<\//gi, '<\\/').replace(/<!--/g, '<\\u0021--').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const payload = JSON.parse(await fs.readFile(inputPath, 'utf8'));
if (payload.source !== 'mcp') throw new Error('数据文件必须标记 "source": "mcp"，否则不能作为真实订单嵌入');
if (typeof payload.generatedAt !== 'string' || !payload.generatedAt.trim()) throw new Error('数据文件必须包含 generatedAt');
if (!Array.isArray(payload.orders) || payload.orders.length === 0) throw new Error('数据文件必须包含非空 orders 数组');
scanSensitive(payload);

const template = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const pattern = /(<script id="embedded-demo-data" type="application\/json">)([\s\S]*?)(<\/script>)/;
if (!pattern.test(template)) throw new Error('index.html 中未找到示例数据容器，无法嵌入');

const serialized = escapeForScript(JSON.stringify({ ...payload, label: 'MCP 数据 · 本地脱敏展示' }));
const generated = template
  .replace(pattern, (_, open, _body, close) => `${open}${serialized}${close}`)
  .replace('交互演示 · 示例数据非实时', 'MCP 数据 · 本地脱敏展示')
  .replace('<title>MCD w/Work｜关怀小结</title>', '<title>MCD w/Work｜关怀小结 · MCP 订单</title>');

if (flags.has('--check')) {
  const existing = await fs.readFile(outputPath, 'utf8').catch(() => null);
  if (!existing) throw new Error(`输出文件不存在：${outputPath}`);
  if (existing !== generated) throw new Error('输出文件与当前 MCP 数据不一致，请重新生成');
  console.log(`已校验：${outputPath} 与 ${payload.orders.length} 笔 MCP 订单一致`);
  process.exit(0);
}

if (!flags.has('--force') && await fs.stat(outputPath).then(() => true, () => false)) {
  throw new Error(`输出文件已存在：${outputPath}，如需覆盖请加 --force`);
}

await fs.writeFile(outputPath, generated, 'utf8');
console.log(`已嵌入 ${payload.orders.length} 笔 MCP 订单 -> ${outputPath}`);
console.log('页面已在数据嵌入时标注“MCP 数据 · 本地脱敏展示”，无参数打开即可查看。');
