import type { MouseEvent } from 'react';
import { site } from '../config/site';
import { useI18n } from '../i18n/context';
import { catalogPath, pathFor, type Page } from '../i18n/routing';
import type { Lang } from '../i18n/types';
import { STORAGE_KEYS, writeStorage } from '../lib/storage';
import { Wordmark } from '../components/ui/Wordmark';
import { Footer } from '../components/navigation/Footer';
import { CatalogIndexPage } from './CatalogIndex';
import { ProjectPage } from './ProjectPage';
import type { CatalogData } from './types';
import './catalog.css';

/** «All my projects»: the catalogue and one page per project, shared by both versions of the site. */
export function CatalogApp({ page, data }: { page: Page; data: CatalogData }) {
  const { t, lang } = useI18n();
  const slug = page.kind === 'project' ? page.slug : undefined;
  const other: Lang = lang === 'en' ? 'es' : 'en';

  const switchLang = (event: MouseEvent<HTMLAnchorElement>) => {
    writeStorage(STORAGE_KEYS.lang, other);
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    window.location.assign(catalogPath(other, slug) + window.location.hash);
  };

  return (
    <>
      <a className="skip-link" href="#main">
        {t.a11y.skip}
      </a>
      <header className="cbar">
        <a className="cbar__brand" href={pathFor(lang)} aria-label={`${site.brand.name} — ${t.a11y.home}`}>
          <span className="statusbar__mark" aria-hidden="true" />
          <Wordmark />
        </a>
        <nav className="cbar__nav mono" aria-label={t.catalog.title}>
          <a href={pathFor(lang)}>{t.catalog.home}</a>
          <a href={catalogPath(lang)} aria-current={page.kind === 'catalog' ? 'page' : undefined}>
            {t.catalog.nav}
          </a>
        </nav>
        <a className="lang-switch mono cbar__lang" href={catalogPath(other, slug)} hrefLang={other} lang={other} onClick={switchLang} aria-label={t.a11y.switchLang}>
          <span className={lang === 'en' ? 'is-on' : ''}>EN</span>
          <span aria-hidden="true">/</span>
          <span className={lang === 'es' ? 'is-on' : ''}>ES</span>
        </a>
      </header>
      <main id="main" className="cat" tabIndex={-1}>
        {data.kind === 'catalog' ? <CatalogIndexPage index={data.index} /> : <ProjectPage data={data.page} />}
      </main>
      <div className="cat-foot">
        <Footer />
      </div>
    </>
  );
}
