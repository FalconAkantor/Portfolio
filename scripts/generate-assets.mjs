/**
 * Regenerates the raster assets in /public from the HTML/SVG sources in scripts/assets:
 *   og-image.png (1200×630), apple-touch-icon.png (180), favicon-32.png, icon-192.png, icon-512.png
 *
 * Not part of the normal build — run it only when the brand or the headline changes:
 *   npm i -D playwright && npx playwright install chromium && node scripts/generate-assets.mjs
 * (PLAYWRIGHT_CHROMIUM can point to an existing Chromium binary.)
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const { chromium } = await import('playwright');
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {},
);

async function shoot(file, width, height, out, transparent = false) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(root, 'scripts/assets', file)).href);
  await page.evaluate('document.fonts.ready');
  await page.screenshot({ path: path.join(root, 'public', out), omitBackground: transparent });
  await page.close();
  console.log(`  public/${out}`);
}

await shoot('og.html', 1200, 630, 'og-image.png');
await shoot('icon.html', 180, 180, 'apple-touch-icon.png');
await shoot('icon.html', 32, 32, 'favicon-32.png', true);
await shoot('icon.html', 192, 192, 'icon-192.png');
await shoot('icon.html', 512, 512, 'icon-512.png');
await browser.close();
