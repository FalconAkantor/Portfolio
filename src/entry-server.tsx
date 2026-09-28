/**
 * Server entry used only at build time by scripts/prerender.mjs.
 * Produces the static HTML for each language × version page.
 */
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { ui } from './i18n/ui';
import { LANGS, DEFAULT_LANG, type Lang } from './i18n/types';
import { MODES, type Mode } from './lib/mode';
import { site, missingContactFields } from './config/site';
import { contactChannels } from './lib/contact';
import { stackCategories, tech } from './data/stack';

export function render(lang: Lang, mode: Mode): string {
  return renderToString(<App lang={lang} mode={mode} />);
}

export const seo = {
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
