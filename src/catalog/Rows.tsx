import { useI18n } from '../i18n/context';
import { catalogPath } from '../i18n/routing';
import { Glyph, ICON } from './icons';
import { CategoryGlyph, KIND, STATUS, label } from './labels';
import type { CatalogCard } from './types';

/** One project as a scannable row: what it is, in one line, and what kind of thing it is. */
export function ProjectRow({ p }: { p: CatalogCard }) {
  const { t, lang } = useI18n();
  const ai = p.ai ? (p.aiLocal ? t.catalog.aiLocal : lang === 'es' ? 'IA' : 'AI') : null;
  return (
    <a className={`crow${p.kind === 'sistema' ? ' crow--system' : ''}`} href={catalogPath(lang, p.slug)}>
      <span className="crow__icon">
        <CategoryGlyph category={p.category} />
      </span>
      <span className="crow__main">
        <span className="crow__name">{p.name[lang]}</span>
        <span className="crow__tagline">{p.tagline[lang]}</span>
      </span>
      <span className="crow__tags">
        {p.featured ? <span className="ctag ctag--star">★ {t.catalog.featuredTag}</span> : null}
        {p.kind === 'sistema' ? <span className="ctag ctag--system">{label(KIND, p.kind, lang)}</span> : null}
        {ai ? <span className="ctag ctag--ai">✦ {ai}</span> : null}
        {p.video ? <span className="ctag ctag--video">▶ {t.catalog.videoTag}</span> : null}
        {p.status !== 'produccion' ? <span className="ctag ctag--dim">{label(STATUS, p.status, lang)}</span> : null}
      </span>
      <span className="crow__go" aria-hidden="true">
        <Glyph d={ICON.arrow} />
      </span>
    </a>
  );
}

export function ProjectRows({ items }: { items: CatalogCard[] }) {
  return (
    <ul className="crows">
      {items.map((p) => (
        <li key={p.slug}>
          <ProjectRow p={p} />
        </li>
      ))}
    </ul>
  );
}
