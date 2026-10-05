/**
 * Server entry used only at build time by scripts/prerender.mjs.
 * Produces the static HTML for each language × version page.
 */
import { renderToString } from 'react-dom/server';
import { App } from './App';
import type { Page } from './i18n/routing';
import type { CatalogData } from './catalog/types';
import { composeProjectPage } from './catalog/compose';
import { CatalogApp } from './catalog/CatalogApp';
import { ui } from './i18n/ui';
import { LANGS, DEFAULT_LANG, type Lang } from './i18n/types';
import { MODES, type Mode } from './lib/mode';
import { site, missingContactFields } from './config/site';
import { contactChannels } from './lib/contact';
import { stackCategories, tech } from './data/stack';

export function render(lang: Lang, mode: Mode, page: Page = { kind: 'home' }, data?: CatalogData): string {
  return renderToString(<App lang={lang} mode={mode} page={page} data={data} Catalog={CatalogApp} />);
}

export { composeProjectPage };

export const seo = {
  catalog: Object.fromEntries(LANGS.map((l) => [l, { title: ui[l].catalog.title, lead: ui[l].catalog.lead }])) as Record<Lang, { title: string; lead: string }>,
  langs: LANGS,
  defaultLang: DEFAULT_LANG,
  site,
  modes: MODES,
  meta: Object.fromEntries(LANGS.map((l) => [l, ui[l].meta])) as Record<Lang, (typeof ui)['en']['meta']>,
  sameAs: contactChannels()
    .filter((c) => c.external)
    .map((c) => c.href),
  knowsAbout: [...new Set(stackCategories.flatMap((c) => c.items))].map((id) => tech[id].label),
  missingContact: missingContactFields(),
};
