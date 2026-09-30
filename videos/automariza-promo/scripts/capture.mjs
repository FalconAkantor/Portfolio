/**
 * Captures the real website screens used by the "proof" scene (assets/screens/*.jpg).
 * Needs the site running locally (`npm run build && npm run preview` at the repo root)
 * and Playwright + FFmpeg available.
 *
 *   node scripts/capture.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const SITE = process.env.SITE ?? 'http://localhost:4173/Portfolio';
const OUT = path.resolve(import.meta.dirname, '../capture/screens');
const ASSETS = path.resolve(import.meta.dirname, '../assets/screens');
mkdirSync(OUT, { recursive: true });
mkdirSync(ASSETS, { recursive: true });

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const shot = async (mode, url, name, prepare, wait, viewport = { width: 1920, height: 1080 }) => {
  const mobile = viewport.width < 700;
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  await ctx.addInitScript((m) => {
    localStorage.setItem('automariza:mode', m);
    localStorage.setItem('automariza:booted', '1');
  }, mode);
  const page = await ctx.newPage();
  await page.goto(SITE + url, { waitUntil: 'networkidle' });
  if (prepare) await prepare(page);
  await page.waitForTimeout(wait);
  await page.mouse.move(viewport.width - 5, viewport.height - 5);
  const png = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: png });
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-q:v', '3', path.join(ASSETS, `${name}.jpg`)]);
  await ctx.close();
};

const toSection = (id) => async (page) => page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), id);
const toProject = async (page) => {
  await page.waitForTimeout(700);
  await page.locator('.pvisual').first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -140));
};

await shot('tech', '/es/', 'tech-hero', null, 5500);
for (const id of ['cctv', 'docs', 'whatsapp-desk']) await shot('tech', `/es/#project-${id}`, `view-${id}`, toProject, 4200);
await shot('tech', '/es/', 'tech-stack', toSection('#stack'), 1500);
await shot('lite', '/es/lite/', 'lite-hero', null, 6000);
await shot('lite', '/es/lite/', 'lite-examples', toSection('#examples'), 5000);
await shot('lite', '/es/lite/', 'lite-mobile', null, 6000, { width: 390, height: 844 });
await browser.close();
console.log('screens →', ASSETS);
