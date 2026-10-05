import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { isLang } from './i18n/types';
import { pageFromPath, routeFromPath } from './i18n/routing';
import type { CatalogData, CatalogIndex } from './catalog/types';
import { isMode } from './lib/mode';
import { boot } from './lib/boot';
import { startCursorLight } from './lib/cursorLight';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

// Prerendered pages carry their language and version on <html>; the dev server derives them from the URL.
const html = document.documentElement;
const route = routeFromPath(window.location.pathname);
// The dev shell only holds a comment placeholder; prerendered pages hold real elements.
const prerendered = container.firstElementChild !== null;
const lang = prerendered && isLang(html.lang) ? html.lang : route.lang;
const mode = prerendered && isMode(html.dataset.mode) ? html.dataset.mode : route.mode;
html.lang = lang;
html.dataset.mode = mode;

const page = pageFromPath(window.location.pathname);

// Catalogue pages carry their data inline (prerendered); the dev server loads it on demand.
async function catalogData(): Promise<CatalogData | undefined> {
  if (page.kind === 'home') return undefined;
  const inline = document.getElementById('page-data')?.textContent;
  if (inline) return JSON.parse(inline) as CatalogData;
  if (!import.meta.env.DEV) return undefined;
  const index = (await import('./data/catalog/index.json')).default as unknown as CatalogIndex;
  if (page.kind === 'catalog') return { kind: 'catalog', index };
  const { composeProjectPage } = await import('./catalog/compose');
  const project = (await import(`./data/catalog/projects/${page.slug}.json`)).default;
  return { kind: 'project', page: composeProjectPage(index, project) };
}

void Promise.all([catalogData(), page.kind === 'home' ? null : import('./catalog/CatalogApp')]).then(([data, catalog]) => {
  const app = <App lang={lang} mode={mode} page={page} data={data} Catalog={catalog?.CatalogApp} />;
  // Production pages are prerendered → hydrate. The dev server serves an empty shell → render.
  if (prerendered) hydrateRoot(container, app);
  else createRoot(container).render(app);

  if (page.kind !== 'home') return;
  if (html.classList.contains('booting')) boot.start();
  if (mode === 'tech') startCursorLight();
});
