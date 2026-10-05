import { useMemo, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { tech } from '../data/stack';
import { useI18n } from '../i18n/context';
import { catalogPath } from '../i18n/routing';
import { AREAS, areaByKey, sortTools, type Area } from './areas';
import { Glyph, ICON } from './icons';
import { ProjectRows } from './Rows';
import type { CatalogCard, CatalogIndex } from './types';

export const ALL = 'all';

const subscribeHash = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};
const currentHash = () => window.location.hash;
const serverHash = () => '';

/**
 * Which area the explorer shows. A link to #area-<key> (the map, a project's breadcrumb, a shared
 * link) selects that area; so does a click in the explorer, which also puts it in the address
 * so the view can be shared. Whatever happened last wins.
 */
export function useAreaSelection(): [string, (key: string) => void] {
  const hash = useSyncExternalStore(subscribeHash, currentHash, serverHash);
  const [choice, setChoice] = useState<{ key: string; at: string } | null>(null);
  const linked = areaByKey(/^#area-([\w-]+)$/.exec(hash)?.[1])?.key;
  const active = choice && choice.at === hash ? choice.key : (linked ?? choice?.key ?? AREAS[0]!.key);
  const pick = (key: string) => setChoice({ key, at: window.location.hash });
  return [active, pick];
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

interface Group {
  area: Area;
  suite: CatalogCard;
  tools: CatalogCard[];
  hits: CatalogCard[];
}

export function AreaExplorer({ index, active, onPick }: { index: CatalogIndex; active: string; onPick: (key: string) => void }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [aiOnly, setAiOnly] = useState(false);

  const areas = useMemo(() => {
    const cards = new Map(index.projects.map((p) => [p.slug, p]));
    return AREAS.flatMap((area) => {
      const suite = cards.get(area.suite);
      const slugs = index.suites.find((s) => s.slug === area.suite)?.tools ?? [];
      const tools = sortTools(slugs.map((slug) => cards.get(slug)).filter((p): p is CatalogCard => Boolean(p)));
      return suite ? [{ area, suite, tools }] : [];
    });
  }, [index]);

  const q = norm(query.trim());
  const filtering = Boolean(q) || aiOnly;
  const matches = (p: CatalogCard) => {
    if (aiOnly && !p.ai) return false;
    if (!q) return true;
    const hay = norm([p.name.es, p.name.en, p.tagline[lang], ...p.stack.map((id) => tech[id]?.label ?? id), ...p.integrations].join(' '));
    return q.split(/\s+/).every((w) => hay.includes(w));
  };
  const groups: Group[] = areas.map((g) => ({
    ...g,
    hits: g.tools.filter(matches),
  }));
  const total = groups.reduce((n, g) => n + g.hits.length, 0);

  // Choosing an area also puts it in the address (#area-…), so the view can be shared.
  const choose = (key: string) => {
    const url = key === ALL ? window.location.pathname + window.location.search : `#area-${key}`;
    window.history.replaceState(window.history.state, '', url);
    onPick(key);
  };
  // Typing a search looks everywhere, not only in the area that happens to be open.
  const type = (value: string) => {
    if (!query.trim() && value.trim() && active !== ALL) choose(ALL);
    setQuery(value);
  };

  return (
    <section className="cx" aria-labelledby="cx-title">
      {AREAS.map((a) => (
        <span key={a.key} id={`area-${a.key}`} className="cx__anchor" aria-hidden="true" />
      ))}
      <span id="explorar" className="cx__anchor" aria-hidden="true" />
      <div className="cat-sec__head">
        <h2 id="cx-title" className="cat-sec__title">
          {t.catalog.explore}
        </h2>
        <p className="cat-sec__lead">{t.catalog.exploreLead}</p>
      </div>

      <div className="cx__bar" role="search">
        <label className="cat-search">
          <span className="sr-only">{t.catalog.searchLabel}</span>
          <Glyph d={ICON.search} />
          <input type="search" value={query} placeholder={t.catalog.search} onChange={(e) => type(e.target.value)} />
        </label>
        <button type="button" className={`cat-chip cat-chip--ai${aiOnly ? ' is-on' : ''}`} aria-pressed={aiOnly} onClick={() => setAiOnly((v) => !v)}>
          ✦ {t.catalog.aiOnly}
        </button>
        {filtering ? (
          <button
            type="button"
            className="cat-chip"
            onClick={() => {
              setQuery('');
              setAiOnly(false);
            }}
          >
            {t.catalog.clear}
          </button>
        ) : null}
        <dl className="cx__legend">
          {t.catalog.legend.map(([term, def]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="cx__body">
        <nav className="cx__areas" aria-label={t.catalog.areas}>
          <ul>
            <li>
              <button type="button" className="cx__area cx__area--all" aria-pressed={active === ALL} onClick={() => choose(ALL)}>
                <Glyph d={ICON.grid} />
                <span className="cx__area-name">{t.catalog.allAreas}</span>
                <span className="cx__n mono">{filtering ? total : groups.reduce((n, g) => n + g.tools.length, 0)}</span>
              </button>
            </li>
            {groups.map(({ area, tools, hits }) => (
              <li key={area.key}>
                <button
                  type="button"
                  className={`cx__area${filtering && !hits.length ? ' is-empty' : ''}`}
                  style={{ '--c': area.color } as CSSProperties}
                  aria-pressed={active === area.key}
                  aria-controls={`cx-${area.key}`}
                  onClick={() => choose(area.key)}
                >
                  <Glyph d={area.icon} />
                  <span className="cx__area-name">{area.name[lang]}</span>
                  <span className="cx__n mono">{filtering ? hits.length : tools.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="cx__panels">
          {active === ALL ? (
            <section className="cx-panel cx-panel--all" aria-label={t.catalog.allAreas}>
              <p className="cx-panel__kicker mono" role="status">
                {t.catalog.results(total)}
              </p>
              {total ? (
                groups
                  .filter((g) => g.hits.length)
                  .map((g) => (
                    <section key={g.area.key} className="cx-group" style={{ '--c': g.area.color } as CSSProperties} aria-labelledby={`cx-g-${g.area.key}`}>
                      <h3 id={`cx-g-${g.area.key}`} className="cx-group__title">
                        <Glyph d={g.area.icon} />
                        {g.area.name[lang]}
                        <span className="mono">{g.hits.length}</span>
                      </h3>
                      <ProjectRows items={g.hits} />
                    </section>
                  ))
              ) : (
                <p className="cx-empty">{t.catalog.noResults}</p>
              )}
            </section>
          ) : null}

          {groups.map((g) => (
            <AreaPanel key={g.area.key} group={g} hidden={active !== g.area.key} filtering={filtering} onAll={() => choose(ALL)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AreaPanel({ group, hidden, filtering, onAll }: { group: Group; hidden: boolean; filtering: boolean; onAll: () => void }) {
  const { t, lang } = useI18n();
  const { area, suite, tools, hits } = group;
  return (
    <section id={`cx-${area.key}`} className="cx-panel" hidden={hidden} aria-labelledby={`cx-h-${area.key}`} style={{ '--c': area.color } as CSSProperties}>
      <header className="cx-panel__head">
        <span className="cx-panel__icon">
          <Glyph d={area.icon} />
        </span>
        <div className="cx-panel__heading">
          <p className="cx-panel__kicker mono">{t.catalog.areaCount(tools.length, tools.filter((p) => p.ai).length)}</p>
          <h3 id={`cx-h-${area.key}`} className="cx-panel__title">
            {area.name[lang]}
          </h3>
          <p className="cx-panel__promise">{suite.tagline[lang]}</p>
        </div>
      </header>
      {!filtering && suite.summary ? <p className="cx-panel__summary">{suite.summary[lang]}</p> : null}
      {!filtering ? (
        <a className="cx-panel__suite mono" href={catalogPath(lang, suite.slug)}>
          {t.catalog.openArea} <span aria-hidden="true">→</span>
        </a>
      ) : null}
      {hits.length ? (
        <ProjectRows items={hits} />
      ) : (
        <p className="cx-empty">
          {t.catalog.noneHere}{' '}
          <button type="button" className="cx-empty__link" onClick={onAll}>
            {t.catalog.seeAllAreas}
          </button>
        </p>
      )}
    </section>
  );
}
