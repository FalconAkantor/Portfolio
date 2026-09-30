/**
 * Builds the 9:16 cut as a sibling HyperFrames project from this project's scenes.
 * assets/ is symlinked; compositions/ is copied at 1080×1920 with the `.tall` rules made
 * unconditional (HyperFrames scopes a scene's CSS to its root, so an <html> class can't reach it).
 *
 *   node scripts/vertical.mjs && cd ../automariza-promo-vertical && npx hyperframes render
 */
import { mkdirSync, readFileSync, writeFileSync, symlinkSync, existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const here = path.resolve(import.meta.dirname, '..');
const out = path.resolve(here, '../automariza-promo-vertical');
mkdirSync(out, { recursive: true });
const link = path.join(out, 'assets');
if (!existsSync(link)) symlinkSync(path.join('..', 'automariza-promo', 'assets'), link);
const copyScenes = (from, to) => {
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (entry.isDirectory()) copyScenes(path.join(from, entry.name), path.join(to, entry.name));
    else if (entry.name.endsWith('.html'))
      writeFileSync(
        path.join(to, entry.name),
        readFileSync(path.join(from, entry.name), 'utf8')
          .replaceAll('data-width="1920" data-height="1080"', 'data-width="1080" data-height="1920"')
          .replaceAll('.tall ', ''),
      );
  }
};
copyScenes(path.join(here, 'compositions'), path.join(out, 'compositions'));
const html = readFileSync(path.join(here, 'index.html'), 'utf8')
  .replace('<html lang="es">', '<html lang="es" class="tall">')
  .replace('width=1920, height=1080', 'width=1080, height=1920')
  .replace('AUTOMARIZA — promo 16:9', 'AUTOMARIZA — promo 9:16')
  .replaceAll('data-width="1920" data-height="1080"', 'data-width="1080" data-height="1920"');
writeFileSync(path.join(out, 'index.html'), html);
for (const f of ['hyperframes.json', 'package.json']) writeFileSync(path.join(out, f), readFileSync(path.join(here, f), 'utf8').replace('"automariza-promo"', '"automariza-promo-vertical"'));
writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ id: 'automariza-promo-vertical', name: 'automariza-promo-vertical' }, null, 2) + '\n');
console.log('vertical project →', out);
