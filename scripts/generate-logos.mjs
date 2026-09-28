/**
 * Regenerates src/data/techLogos.ts from Simple Icons (CC0 brand marks).
 * Only the marks the site uses are embedded, so there is no runtime dependency.
 *
 *   npm i --no-save simple-icons && node scripts/generate-logos.mjs
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const icons = await import('simple-icons');

/**
 * TechId → Simple Icons slug, only for technologies shown in the Stack section.
 * Without a public mark — or when the mark is very heavy (Linux, Synology) — they keep a monogram.
 */
const map = {
  python: 'python',
  pytorch: 'pytorch',
  yolo: 'ultralytics',
  yolov5: 'ultralytics',
  yolov8: 'ultralytics',
  yoloPose: 'ultralytics',
  ollama: 'ollama',
  qwen: 'qwen',
  qwenVl: 'qwen',
  sentenceTransformers: 'huggingface',
  mpnet: 'huggingface',
  faiss: 'meta',
  nim: 'nvidia',
  nvidia: 'nvidia',
  cuda: 'nvidia',
  nodejs: 'nodedotjs',
  whatsapp: 'whatsapp',
  telegram: 'telegram',
  discord: 'discord',
  flask: 'flask',
  fastapi: 'fastapi',
  sqlite: 'sqlite',
  docker: 'docker',
  compose: 'docker',
  proxmox: 'proxmox',
  opencv: 'opencv',
  ffmpeg: 'ffmpeg',
};

const key = (slug) => `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
// Each mark is embedded once; several technologies can share it (CUDA, NIM → NVIDIA…).
const marks = {};
const ids = {};
const missing = [];
for (const [id, slug] of Object.entries(map)) {
  const icon = icons[key(slug)];
  if (!icon) {
    missing.push(`${id} (${slug})`);
    continue;
  }
  marks[slug] = { path: icon.path, hex: icon.hex };
  ids[id] = slug;
}

const markBody = Object.entries(marks)
  .map(([slug, v]) => `  ${JSON.stringify(slug)}: { hex: '${v.hex}', path: '${v.path}' },`)
  .join('\n');
const idBody = Object.entries(ids)
  .map(([id, slug]) => `  ${id}: marks[${JSON.stringify(slug)}],`)
  .join('\n');
const file = `import type { TechId } from './stack';

/* Brand marks by technology. Generated from Simple Icons (CC0) by scripts/generate-logos.mjs — do not edit. */

type Mark = { path: string; hex: string };

const marks: Record<string, Mark> = {
${markBody}
};

export const techLogos: Partial<Record<TechId, Mark>> = {
${idBody}
};
`;
await writeFile(path.resolve(import.meta.dirname, '../src/data/techLogos.ts'), file);
console.log(`  ${Object.keys(ids).length} technologies · ${Object.keys(marks).length} marks written`);
if (missing.length) console.log(`  no mark (monogram): ${missing.join(', ')}`);
