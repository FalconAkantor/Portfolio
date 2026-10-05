import type { CSSProperties } from 'react';
import { site } from '../config/site';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/context';
import { catalogPath } from '../i18n/routing';
import { whatsappHref } from '../lib/contact';
import { AreaExplorer, useAreaSelection } from './AreaExplorer';
import { areaOf } from './areas';
import { EcosystemMap } from './EcosystemMap';
import { Glyph, ICON, type IconName } from './icons';
import type { CatalogCard, CatalogIndex } from './types';
import { useReveal } from './useReveal';

const PRINCIPLE_ICONS: IconName[] = ['lock', 'bell', 'undo', 'user', 'eye', 'ai'];

export function CatalogIndexPage({ index }: { index: CatalogIndex }) {
  const { t } = useI18n();
  const [active, pick] = useAreaSelection();
  const tools = index.projects.filter((p) => p.kind !== 'suite');
  const featured = index.featured.map((slug) => index.projects.find((p) => p.slug === slug)).filter((p): p is CatalogCard => Boolean(p));
  const principles = useReveal<HTMLUListElement>();
  const wa = whatsappHref(site.contact.whatsapp, t.contact.whatsappGreeting);

  return (
    <>
      <section className="cat-hero" aria-labelledby="cat-title">
        <div className="cat-hero__copy">
          <p className="cat-kicker mono">{t.catalog.kicker}</p>
          <h1 id="cat-title" className="cat-hero__title">
            {t.catalog.title}
          </h1>
          <p className="cat-hero__lead">{t.catalog.lead}</p>
          <ol className="cat-howto">
            {t.catalog.howTo.map((step, i) => (
              <li key={step}>
                <span className="cat-howto__n mono" aria-hidden="true">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="cat-hero__actions">
            <a className="btn btn--primary" href="#explorar">
              {t.catalog.exploreCta} <span aria-hidden="true">↓</span>
            </a>
            <a className="btn" href="#destacados">
              {t.catalog.startCta}
            </a>
          </p>
        </div>
        <EcosystemMap index={index} onPick={pick} />
        <dl className="cat-stats">
          <div>
            <dt>{t.catalog.stats.tools}</dt>
            <dd>{tools.length}</dd>
          </div>
          <div>
            <dt>{t.catalog.stats.areas}</dt>
            <dd>{index.suites.length}</dd>
          </div>
          <div>
            <dt>{t.catalog.stats.ai}</dt>
            <dd>{tools.filter((p) => p.ai).length}</dd>
          </div>
          <div>
            <dt>{t.catalog.stats.processes}</dt>
            <dd>{index.totals.procesosEnProduccion}</dd>
          </div>
        </dl>
      </section>

      <section className="cat-sec" aria-labelledby="cat-start">
        <span id="destacados" className="cx__anchor" aria-hidden="true" />
        <div className="cat-sec__head">
          <h2 id="cat-start" className="cat-sec__title">
            {t.catalog.start}
          </h2>
          <p className="cat-sec__lead">{t.catalog.startLead}</p>
        </div>
        <FeaturedGrid items={featured} index={index} />
      </section>

      <AreaExplorer index={index} active={active} onPick={pick} />

      <section className="cat-sec" aria-labelledby="cat-principles">
        <div className="cat-sec__head">
          <h2 id="cat-principles" className="cat-sec__title">
            {t.catalog.principles}
          </h2>
          <p className="cat-sec__lead">{t.catalog.principlesLead}</p>
        </div>
        <ul ref={principles} className="cprinciples">
          {t.catalog.principleList.map((p, i) => (
            <li key={p.title} className="cprinciple rv" style={{ '--i': i } as CSSProperties}>
              <span className="cprinciple__icon">
                <Glyph d={ICON[PRINCIPLE_ICONS[i] ?? 'check']} />
              </span>
              <h3 className="cprinciple__title">{p.title}</h3>
              <p className="cprinciple__text">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <details className="cat-overview">
        <summary>
          <span>{t.catalog.overview}</span>
          <Glyph d={ICON.arrow} className="cat-overview__chev" />
        </summary>
        {t.catalog.spanishNote ? <p className="pj-note mono">{t.catalog.spanishNote}</p> : null}
        <div className="cat-prose" lang="es" dangerouslySetInnerHTML={{ __html: index.overviewHtml }} />
      </details>

      <section className="pj-cta" aria-labelledby="cat-cta">
        <h2 id="cat-cta" className="pj-cta__title">
          {t.catalog.ctaTitle}
        </h2>
        <p className="pj-cta__text">{t.catalog.ctaText}</p>
        <a className="btn btn--wa" href={wa} target="_blank" rel="noopener noreferrer">
          {t.catalog.ctaButton}
          <span className="sr-only"> ({t.a11y.externalLink})</span>
        </a>
      </section>
    </>
  );
}

function FeaturedGrid({ items, index }: { items: CatalogCard[]; index: CatalogIndex }) {
  const { t, lang } = useI18n();
  const [ref, inView] = useInView<HTMLUListElement>({ threshold: 0.1 });
  return (
    <ul ref={ref} className={`cfeats${inView ? ' is-live' : ''}`}>
      {items.map((p, i) => {
        const area = areaOf(p, index);
        const ai = p.ai ? (p.aiLocal ? t.catalog.aiLocal : lang === 'es' ? 'IA' : 'AI') : null;
        return (
          <li key={p.slug} style={{ '--c': area?.color, '--i': i } as CSSProperties}>
            <a className="cfeat" href={catalogPath(lang, p.slug)}>
              <span className="cfeat__area mono">
                {area ? <Glyph d={area.icon} /> : null}
                {area?.name[lang]}
              </span>
              <span className="cfeat__name">{p.name[lang]}</span>
              <span className="cfeat__tagline">{p.tagline[lang]}</span>
              {p.steps?.length ? (
                <span className="cfeat__flow" aria-hidden="true" style={{ '--n': p.steps.length } as CSSProperties}>
                  {p.steps.map((s, k) => (
                    <span key={k} className="cfeat__step" style={{ '--k': k } as CSSProperties}>
                      <b>{k + 1}</b>
                      {s[lang]}
                    </span>
                  ))}
                </span>
              ) : null}
              <span className="cfeat__foot mono">
                {ai ? <span className="ctag ctag--ai">✦ {ai}</span> : null}
                <span>{t.catalog.read(p.minutes)}</span>
                <Glyph d={ICON.arrow} className="cfeat__go" />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
