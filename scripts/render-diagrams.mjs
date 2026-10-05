/**
 * Renders every catalogue diagram (content/diagrams/*.mmd) to SVG in the site's palette and stores
 * it inside the project's page data (src/data/catalog/projects/<slug>.json → diagramSvg), so the
 * prerendered HTML and the hydrated page carry exactly the same markup. Run after build-catalog.mjs.
 *
 * Needs Playwright and Mermaid (not project dependencies):
 *   npx -y -p playwright@1 -p mermaid@11 node scripts/render-diagrams.mjs
 * Env: CHROME=/path/to/chrome (optional), MERMAID_JS=/path/to/mermaid.min.js (optional)
 */
/* global window */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = process.env.ROOT ?? path.resolve(import.meta.dirname, '..');
const srcDir = path.join(root, 'content/diagrams');
const dataDir = path.join(root, 'src/data/catalog');
const mermaidJs = process.env.MERMAID_JS ?? require.resolve('mermaid/dist/mermaid.min.js');

const config = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  flowchart: { htmlLabels: false, curve: 'basis', padding: 14, nodeSpacing: 34, rankSpacing: 46 },
  themeVariables: {
    darkMode: true,
    background: 'transparent',
    fontFamily: 'IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '14px',
    primaryColor: '#0f151d',
    primaryBorderColor: '#2b3848',
    primaryTextColor: '#d9dfe5',
    secondaryColor: '#111822',
    secondaryBorderColor: '#5cc8d6',
    secondaryTextColor: '#d9dfe5',
    tertiaryColor: '#0b1017',
    tertiaryBorderColor: '#243142',
    tertiaryTextColor: '#d9dfe5',
    lineColor: '#5cc8d6',
    textColor: '#d9dfe5',
    mainBkg: '#0f151d',
    nodeBorder: '#2b3848',
    clusterBkg: '#0a0e14',
    clusterBorder: '#243142',
    titleColor: '#f2a93b',
    edgeLabelBackground: '#0b1017',
    noteBkgColor: '#1a1410',
    noteBorderColor: '#f2a93b',
  },
};

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ path: mermaidJs });
await page.evaluate((c) => window.mermaid.initialize(c), config);

const files = (await readdir(srcDir)).filter((f) => f.endsWith('.mmd') && !f.startsWith('_')).sort();
let ok = 0;
const failed = [];
for (const file of files) {
  const slug = file.replace(/\.mmd$/, '');
  const code = await readFile(path.join(srcDir, file), 'utf8');
  const id = `dg-${slug.replace(/[^a-z0-9-]/gi, '')}`;
  const draw = (c) =>
    page.evaluate(async ([i, src]) => (await window.mermaid.render(i, src)).svg, [id, c]).catch((e) => {
      failed.push(`${slug}: ${String(e.message).split('\n')[0]}`);
      return null;
    });
  const box = (svg) => (/viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 1 1').split(/\s+/).map(Number).slice(2);
  let svg = await draw(code);
  if (!svg) continue;
  // Very long left-to-right flows read better top-to-bottom on a page.
  const [w0, h0] = box(svg);
  if (w0 / h0 > 3.2 && /^\s*(flowchart|graph)\s+LR/m.test(code)) {
    const tb = await draw(code.replace(/^(\s*(?:flowchart|graph)\s+)LR/m, '$1TB'));
    if (tb) {
      const [w1, h1] = box(tb);
      if (Math.abs(Math.log(w1 / h1 / 1.6)) < Math.abs(Math.log(w0 / h0 / 1.6))) svg = tb;
    }
  }
  // Fixed size from the viewBox (Mermaid emits width="100%" + max-width) at 85 %, so text stays legible.
  // Slightly wider than the page column → fit it; much wider → keep it legible and let it scroll.
  const [vw, vh] = box(svg);
  let k = 0.85;
  if (vw * k > 1180 && vw * k < 1600) k = 1180 / vw;
  const sized = svg
    .replace(/(<svg[^>]*?)\swidth="100%"/, `$1 width="${Math.ceil(vw * k)}" height="${Math.ceil(vh * k)}"`)
    .replace(/(<svg[^>]*?)\sstyle="max-width:[^"]*"/, '$1');
  const target = path.join(dataDir, 'projects', `${slug}.json`);
  const data = JSON.parse(await readFile(target, 'utf8'));
  data.diagramSvg = sized;
  await writeFile(target, JSON.stringify(data));
  ok++;
}
await browser.close();
console.log(`  ${ok}/${files.length} diagrams rendered`);
if (failed.length) console.log('  failed:\n   ' + failed.join('\n   '));
