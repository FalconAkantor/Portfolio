import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/context';
import { catalogPath } from '../i18n/routing';
import { tech } from '../data/stack';
import { TechLogo } from '../components/ui/TechLogo';
import { CATEGORY, CategoryGlyph, KIND, label } from './labels';
import { StoryPlayer } from './StoryPlayer';
import type { CatalogCard, CatalogIndex } from './types';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function CatalogIndexPage({ index }: { index: CatalogIndex }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [aiOnly, setAiOnly] = useState(false);

  const bySlug = useMemo(() => new Map(index.projects.map((p) => [p.slug, p])), [index]);
  const tools = index.projects.filter((p) => p.kind !== 'suite');
  const categories = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of tools) count.set(p.category, (count.get(p.category) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  }, [tools]);

  const filtering = Boolean(query.trim() || category || aiOnly);
  const results = useMemo(() => {
    const q = norm(query.trim());
    return tools.filter((p) => {
      if (category && p.category !== category) return false;
      if (aiOnly && !p.ai) return false;
      if (!q) return true;
      const hay = norm([p.name, p.tagline[lang], p.summary[lang], ...p.stack.map((id) => tech[id]?.label ?? id)].join(' '));
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [tools, query, category, aiOnly, lang]);

  const aiCount = tools.filter((p) => p.ai).length;

  return (
    <>
      <section className="cat-hero" aria-labelledby="cat-title">
        <p className="cat-kicker mono">{t.catalog.kicker}</p>
        <h1 id="cat-title" className="cat-hero__title">
          {t.catalog.title}
        </h1>
        <p className="cat-hero__lead">{t.catalog.lead}</p>
        <dl className="cat-stats">
          <div>
            <dt>{t.catalog.stats.projects}</dt>
            <dd>{index.projects.length}</dd>
          </div>
          <div>
            <dt>{t.catalog.stats.suites}</dt>
            <dd>{index.suites.length}</dd>
          </div>
          <div>
            <dt>{t.catalog.stats.ai}</dt>
            <dd>{aiCount}</dd>
          </div>
          <div>
            <dt>{t.catalog.stats.processes}</dt>
            <dd>{index.totals.procesosEnProduccion}</dd>
          </div>
        </dl>
      </section>

      <section className="cat-sec" aria-labelledby="cat-featured">
        <div className="cat-sec__head">
          <h2 id="cat-featured" className="cat-sec__title">
            {t.catalog.featured}
          </h2>
          <p className="cat-sec__lead">{t.catalog.featuredLead}</p>
        </div>
        <ul className="cat-featured">
          {index.featured.map((slug) => {
            const p = bySlug.get(slug);
            const story = index.stories[slug];
            if (!p || !story) return null;
            return (
              <li key={slug} className="cat-feat">
                <StoryPlayer story={story} compact />
                <a className="cat-feat__body" href={catalogPath(lang, slug)}>
                  <span className="cat-card__meta mono">
                    <CategoryGlyph category={p.category} /> {label(CATEGORY, p.category, lang)} · {label(KIND, p.kind, lang)}
                  </span>
                  <span className="cat-feat__name">{p.name}</span>
                  <span className="cat-feat__tagline">{p.tagline[lang]}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="cat-sec" aria-labelledby="cat-all">
        <div className="cat-sec__head">
          <h2 id="cat-all" className="cat-sec__title">
            {filtering ? t.catalog.results(results.length) : t.catalog.suites}
          </h2>
        </div>
        <div className="cat-tools" role="search">
          <label className="cat-search">
            <span className="sr-only">{t.catalog.searchLabel}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 4a6 6 0 104.5 10L20 20 M10 4a6 6 0 010 12" />
            </svg>
            <input type="search" value={query} placeholder={t.catalog.search} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="cat-chips">
            <button type="button" className={`cat-chip${!category ? ' is-on' : ''}`} aria-pressed={!category} onClick={() => setCategory(null)}>
              {t.catalog.all}
            </button>
            {categories.map((c) => (
              <button key={c} type="button" className={`cat-chip${category === c ? ' is-on' : ''}`} aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>
                <CategoryGlyph category={c} />
                {label(CATEGORY, c, lang)}
              </button>
            ))}
            <button type="button" className={`cat-chip cat-chip--ai${aiOnly ? ' is-on' : ''}`} aria-pressed={aiOnly} onClick={() => setAiOnly((v) => !v)}>
              ✦ {t.catalog.aiOnly}
            </button>
          </div>
        </div>

        {filtering ? (
          results.length ? (
            <ul className="cat-grid">
              {results.map((p) => (
                <li key={p.slug}>
                  <Card p={p} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="cat-empty">{t.catalog.noResults}</p>
          )
        ) : (
          index.suites.map((s) => {
            const suite = bySlug.get(s.slug);
            const items = s.tools.map((slug) => bySlug.get(slug)).filter((p): p is CatalogCard => Boolean(p));
            if (!suite) return null;
            return (
              <section key={s.slug} className="cat-suite" aria-labelledby={`suite-${s.slug}`}>
                <a className="cat-suite__head" href={catalogPath(lang, s.slug)}>
                  <span className="cat-suite__glyph">
                    <CategoryGlyph category={suite.category} />
                  </span>
                  <span className="cat-suite__text">
                    <span id={`suite-${s.slug}`} className="cat-suite__name">
                      {suite.name}
                    </span>
                    <span className="cat-suite__tagline">{suite.tagline[lang]}</span>
                  </span>
                  <span className="cat-suite__count mono">{t.catalog.tools(items.length)} ›</span>
                </a>
                <ul className="cat-grid">
                  {items.map((p) => (
                    <li key={p.slug}>
                      <Card p={p} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </section>

      <details className="cat-overview">
        <summary>{t.catalog.overview}</summary>
        <div className="cat-prose" lang="es" dangerouslySetInnerHTML={{ __html: index.overviewHtml }} />
      </details>
    </>
  );
}

export function Card({ p }: { p: CatalogCard }) {
  const { lang } = useI18n();
  return (
    <a className={`cat-card${p.featured ? ' is-featured' : ''}`} href={catalogPath(lang, p.slug)}>
      <span className="cat-card__meta mono">
        <CategoryGlyph category={p.category} />
        {label(CATEGORY, p.category, lang)}
        <span className="cat-card__kind">{label(KIND, p.kind, lang)}</span>
      </span>
      <span className="cat-card__name">
        {p.name}
        {p.featured ? <span className="cat-card__star" aria-hidden="true"> ★</span> : null}
      </span>
      <span className="cat-card__tagline">{p.tagline[lang]}</span>
      <span className="cat-card__foot">
        <span className="cat-card__logos" aria-hidden="true">
          {p.stack.slice(0, 4).map((id) => (
            <TechLogo key={id} id={id} />
          ))}
        </span>
        {p.ai ? <span className="cat-card__ai mono">✦ {lang === 'es' ? 'IA' : 'AI'}</span> : null}
      </span>
    </a>
  );
}
