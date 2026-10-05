import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { site } from '../config/site';
import { tech } from '../data/stack';
import { useI18n } from '../i18n/context';
import { catalogPath } from '../i18n/routing';
import { whatsappHref } from '../lib/contact';
import { highlight } from '../lib/highlight';
import { TechLogo } from '../components/ui/TechLogo';
import { areaBySuite, sortTools } from './areas';
import { FlowSteps } from './FlowSteps';
import { Glyph, ICON } from './icons';
import { KIND, STATUS, label } from './labels';
import { ProjectRows } from './Rows';
import type { CatalogCard, ProjectData, ProjectPageData } from './types';
import { useReveal } from './useReveal';

export function ProjectPage({ data }: { data: ProjectPageData }) {
  const { t, lang } = useI18n();
  const { project, suite, siblings, prev, next } = data;
  const f = project.ficha;
  const isSuite = f.kind === 'suite';
  const area = areaBySuite(isSuite ? f.slug : suite?.slug);
  const wa = whatsappHref(site.contact.whatsapp, t.contact.whatsappGreeting);
  const ai = f.ai?.used ? (f.ai.local ? t.catalog.aiLocal : t.catalog.aiCloud) : null;
  const es = lang === 'es' ? undefined : 'es';
  const summaryRef = useReveal<HTMLDivElement>();
  const metricsRef = useReveal<HTMLDListElement>();

  const sections = [
    {
      id: 'summary',
      label: t.catalog.summary,
      show: Boolean(f.problem && f.solution),
    },
    {
      id: 'tools',
      label: t.catalog.suiteTools,
      show: isSuite && siblings.length > 0,
    },
    {
      id: 'how',
      label: t.catalog.howItWorks,
      show: Boolean(f.howItWorks?.length),
    },
    {
      id: 'features',
      label: t.catalog.features,
      show: Boolean(f.features?.length),
    },
    {
      id: 'figures',
      label: t.catalog.metrics,
      show: Boolean(f.metrics?.length),
    },
    {
      id: 'architecture',
      label: t.catalog.diagram,
      show: Boolean(project.diagramSvg),
    },
    { id: 'docs', label: t.catalog.docs, show: project.sections.length > 0 },
    { id: 'code', label: t.catalog.code, show: project.code.length > 0 },
  ].filter((s) => s.show);

  return (
    <article className="pj" aria-labelledby="pj-title" style={{ '--c': area?.color } as CSSProperties}>
      <nav className="pj-crumbs mono" aria-label="breadcrumb">
        <a href={catalogPath(lang)}>{t.catalog.root}</a>
        {area && suite ? (
          <>
            <span aria-hidden="true">›</span>
            {isSuite ? <span aria-current="page">{area.name[lang]}</span> : <a href={catalogPath(lang, suite.slug)}>{area.name[lang]}</a>}
          </>
        ) : null}
        {!isSuite ? (
          <>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{f.name[lang]}</span>
          </>
        ) : null}
      </nav>

      <header className="pj-hero">
        <div className="pj-hero__copy">
          <p className="pj-hero__kicker mono">
            {area ? (
              <span className="pj-area">
                <Glyph d={area.icon} />
                {area.name[lang]}
              </span>
            ) : null}
            <span>{label(KIND, f.kind, lang)}</span>
          </p>
          <h1 id="pj-title" className="pj-hero__title">
            {f.name[lang]}
          </h1>
          <p className="pj-hero__tagline">{f.tagline[lang]}</p>
          <p className="pj-hero__summary">{f.summary[lang]}</p>
          <ul className="pj-badges">
            <li className="pj-badge pj-badge--ok">
              <i aria-hidden="true" /> {label(STATUS, f.status, lang)}
            </li>
            {ai ? <li className="pj-badge pj-badge--ai">✦ {ai}</li> : null}
            {f.featured ? <li className="pj-badge pj-badge--star">★ {t.catalog.featuredTag}</li> : null}
            <li className="pj-badge pj-badge--dim">{t.catalog.read(project.minutes)}</li>
          </ul>
        </div>

        <aside className="pj-facts" aria-label={t.catalog.tech}>
          <dl>
            {f.users ? (
              <div>
                <dt>{t.catalog.users}</dt>
                <dd>{f.users[lang]}</dd>
              </div>
            ) : null}
            {f.stack.length || f.stackOther.length ? (
              <div>
                <dt>{t.catalog.tech}</dt>
                <dd>
                  <ul className="pj-tech">
                    {f.stack.map((id) => (
                      <li key={id}>
                        <TechLogo id={id} /> {tech[id].label}
                      </li>
                    ))}
                    {f.stackOther.map((s) => (
                      <li key={s.es} className="pj-tech__other">
                        {s[lang]}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {f.integrations?.length ? (
              <div>
                <dt>{t.catalog.integrations}</dt>
                <dd>
                  <ul className="pj-pills">
                    {f.integrations.map((s) => (
                      <li key={s.es}>{s[lang]}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </header>

      {sections.length > 2 ? <PageNav sections={sections} /> : null}

      {f.problem && f.solution ? (
        <section id="summary" className="pj-sec pj-anchor" aria-label={t.catalog.summary}>
          <div ref={summaryRef} className="pj-ps">
            <div className="pj-ps__card pj-ps__card--problem rv">
              <p className="pj-ps__label mono">
                <Glyph d={ICON.bell} />
                {t.catalog.problem}
              </p>
              <p className="pj-ps__text">{f.problem[lang]}</p>
            </div>
            <span className="pj-ps__arrow rv" aria-hidden="true" style={{ '--i': 1 } as CSSProperties}>
              <Glyph d={ICON.arrow} />
            </span>
            <div className="pj-ps__card pj-ps__card--solution rv" style={{ '--i': 2 } as CSSProperties}>
              <p className="pj-ps__label mono">
                <Glyph d={ICON.check} />
                {t.catalog.solution}
              </p>
              <p className="pj-ps__text">{f.solution[lang]}</p>
            </div>
          </div>
        </section>
      ) : null}

      {isSuite && siblings.length ? (
        <section id="tools" className="pj-sec pj-anchor" aria-labelledby="pj-tools">
          <div className="pj-sec__head">
            <h2 id="pj-tools" className="pj-sec__title">
              {t.catalog.suiteTools}
            </h2>
            <p className="pj-sec__lead">{t.catalog.legend.map(([term, def]) => `${term}: ${def}`).join(' · ')}</p>
          </div>
          <ProjectRows items={sortTools(siblings)} />
        </section>
      ) : null}

      {f.howItWorks?.length ? (
        <section id="how" className="pj-sec pj-anchor" aria-labelledby="pj-how">
          <div className="pj-sec__head">
            <h2 id="pj-how" className="pj-sec__title">
              {t.catalog.howItWorks}
            </h2>
            <p className="pj-sec__lead">{t.catalog.howItWorksLead}</p>
          </div>
          <FlowSteps steps={f.howItWorks} />
        </section>
      ) : null}

      {f.features?.length ? (
        <section id="features" className="pj-sec pj-anchor" aria-labelledby="pj-features">
          <div className={`pj-cols${f.automations?.length || ai ? '' : ' pj-cols--single'}`}>
            <div>
              <h2 id="pj-features" className="pj-sec__title">
                {t.catalog.features}
              </h2>
              <ul className="pj-features">
                {f.features.map((x, i) => (
                  <li key={i}>
                    <Glyph d={ICON.check} />
                    <span>{x[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
            {f.automations?.length || ai ? (
              <div className="pj-side">
                {f.automations?.length ? (
                  <div className="pj-box">
                    <h3 className="pj-box__title">
                      <Glyph d={ICON.clock} />
                      {t.catalog.automations}
                    </h3>
                    <ul className="pj-auto">
                      {f.automations.map((a, i) => (
                        <li key={i}>
                          <span className="pj-auto__when mono">{a.trigger[lang]}</span>
                          <span className="pj-auto__what">{a.action[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {ai ? (
                  <div className="pj-box pj-box--ai">
                    <h3 className="pj-box__title">
                      <Glyph d={ICON.ai} />
                      {t.catalog.aiWhere}
                    </h3>
                    {f.ai?.where ? <p className="pj-box__text">{f.ai.where[lang]}</p> : null}
                    {f.ai?.models?.length ? (
                      <ul className="pj-pills">
                        {f.ai.models.map((m) => (
                          <li key={m.es}>{m[lang]}</li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="pj-box__note mono">✦ {ai}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {f.metrics?.length ? (
        <section id="figures" className="pj-sec pj-anchor" aria-labelledby="pj-figures">
          <div className="pj-sec__head">
            <h2 id="pj-figures" className="pj-sec__title">
              {t.catalog.metrics}
            </h2>
            <p className="pj-sec__lead">{t.catalog.metricsLead}</p>
          </div>
          <dl ref={metricsRef} className="pj-metrics">
            {f.metrics.map((m, i) => (
              <div key={i} className={`pj-metric rv${m.value.length > 14 ? ' pj-metric--long' : ''}`} style={{ '--i': i } as CSSProperties}>
                <dt>
                  {m.label[lang]}
                  {m.real === false ? <span className="ctag ctag--dim">{t.catalog.sample}</span> : null}
                </dt>
                <dd className="mono" lang={es}>
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {f.businessValue ? (
        <section className="pj-sec" aria-labelledby="pj-value">
          <figure className="pj-value">
            <Glyph d={ICON.chart} className="pj-value__icon" />
            <h2 id="pj-value" className="pj-value__title mono">
              {t.catalog.value}
            </h2>
            <blockquote className="pj-value__text">
              <p>{f.businessValue[lang]}</p>
            </blockquote>
          </figure>
        </section>
      ) : null}

      {project.diagramSvg ? (
        <section id="architecture" className="pj-sec pj-anchor" aria-labelledby="pj-diagram">
          <div className="pj-sec__head">
            <h2 id="pj-diagram" className="pj-sec__title">
              {t.catalog.diagram}
            </h2>
            <p className="pj-sec__lead">{t.catalog.diagramLead}</p>
          </div>
          <Diagram svg={project.diagramSvg} />
        </section>
      ) : null}

      {project.sections.length ? (
        <section id="docs" className="pj-sec pj-anchor" aria-labelledby="pj-docs">
          <Docs project={project} />
        </section>
      ) : null}

      {project.code.length ? (
        <section id="code" className="pj-sec pj-anchor" aria-labelledby="pj-code">
          <div className="pj-sec__head">
            <h2 id="pj-code" className="pj-sec__title">
              {t.catalog.code}
            </h2>
            <p className="pj-sec__lead">{t.catalog.codeLead}</p>
          </div>
          <CodeTabs code={project.code} />
        </section>
      ) : null}

      {!isSuite && siblings.length && area && suite ? (
        <section className="pj-sec" aria-labelledby="pj-more">
          <div className="pj-sec__head pj-sec__head--row">
            <h2 id="pj-more" className="pj-sec__title">
              {t.catalog.more(area.name[lang])}
            </h2>
            <a className="pj-more__all mono" href={catalogPath(lang, suite.slug)}>
              {t.catalog.seeArea(area.name[lang])} <span aria-hidden="true">→</span>
            </a>
          </div>
          <ProjectRows items={sortTools(siblings).slice(0, 5)} />
        </section>
      ) : null}

      <nav className="pj-pager" aria-label={`${t.catalog.prev} / ${t.catalog.next}`}>
        <PagerLink p={prev} dir="prev" />
        <PagerLink p={next} dir="next" />
      </nav>

      <section className="pj-cta" aria-labelledby="pj-cta">
        <h2 id="pj-cta" className="pj-cta__title">
          {t.catalog.ctaTitle}
        </h2>
        <p className="pj-cta__text">{t.catalog.ctaText}</p>
        <a className="btn btn--wa" href={wa} target="_blank" rel="noopener noreferrer">
          {t.catalog.ctaButton}
          <span className="sr-only"> ({t.a11y.externalLink})</span>
        </a>
      </section>
    </article>
  );
}

/** Sticky list of the page's sections; the one being read is highlighted. */
function PageNav({ sections }: { sections: { id: string; label: string }[] }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState<string | null>(null);
  const ids = sections.map((s) => s.id).join(' ');
  useEffect(() => {
    const els = ids.split(' ').flatMap((id) => document.getElementById(id) ?? []);
    let frame = 0;
    // The section being read is the last one whose top has passed the upper third of the screen.
    const update = () => {
      frame = 0;
      let at: string | null = null;
      const line = window.innerHeight * 0.35;
      for (const el of els) if (el.getBoundingClientRect().top <= line) at = el.id;
      setCurrent(at);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ids]);
  return (
    <nav className="pj-toc" aria-label={t.catalog.onPage}>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={current === s.id ? 'true' : undefined}>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Tall diagrams start folded so the page keeps its rhythm; one click shows the whole thing. */
function Diagram({ svg }: { svg: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const height = Number(/<svg[^>]*?\sheight="(\d+(?:\.\d+)?)"/.exec(svg)?.[1] ?? 0);
  const tall = height > 600;
  return (
    <div className={`pj-diagram-wrap${tall && !open ? ' is-folded' : ''}`}>
      <figure id="pj-diagram-figure" className="pj-diagram" tabIndex={0} aria-label={t.catalog.diagram} dangerouslySetInnerHTML={{ __html: svg }} />
      {tall ? (
        <button type="button" className="pj-diagram__toggle mono" aria-expanded={open} aria-controls="pj-diagram-figure" onClick={() => setOpen((v) => !v)}>
          {open ? t.catalog.collapse : t.catalog.expand}
        </button>
      ) : null}
    </div>
  );
}

/** The full sheet, one collapsible section per heading. */
function Docs({ project }: { project: ProjectData }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const toggleAll = (open: boolean) => ref.current?.querySelectorAll('details').forEach((d) => (d.open = open));
  return (
    <>
      <div className="pj-sec__head pj-sec__head--row">
        <div>
          <h2 id="pj-docs" className="pj-sec__title">
            {t.catalog.docs}
          </h2>
          <p className="pj-sec__lead">
            {t.catalog.docsLead} {t.catalog.spanishNote}
          </p>
        </div>
        <p className="pj-docs__all">
          <button type="button" className="cat-chip" onClick={() => toggleAll(true)}>
            {t.catalog.openAll}
          </button>
          <button type="button" className="cat-chip" onClick={() => toggleAll(false)}>
            {t.catalog.closeAll}
          </button>
        </p>
      </div>
      <div ref={ref} className="pj-docs" lang="es">
        {project.sections.map((s, i) => (
          <details key={s.title} className="pj-doc">
            <summary>
              <span className="pj-doc__n mono" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="pj-doc__title">{s.title}</h3>
              <Glyph d={ICON.arrow} className="pj-doc__chev" />
            </summary>
            <div className="cat-prose" dangerouslySetInnerHTML={{ __html: s.html }} />
          </details>
        ))}
      </div>
    </>
  );
}

/** Code excerpts as tabs: one visible at a time, each with its own scroll. */
function CodeTabs({ code }: { code: ProjectData['code'] }) {
  const [at, setAt] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (to: number) => {
    const i = (to + code.length) % code.length;
    setAt(i);
    tabs.current[i]?.focus();
  };
  return (
    <div className="pj-code">
      {code.length > 1 ? (
        <div className="pj-code__tabs" role="tablist" aria-label="code">
          {code.map((c, i) => (
            <button
              key={i}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`pj-code-tab-${i}`}
              aria-selected={at === i}
              aria-controls={`pj-code-panel-${i}`}
              tabIndex={at === i ? 0 : -1}
              className="pj-code__tab"
              onClick={() => setAt(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') move(i + 1);
                else if (e.key === 'ArrowLeft') move(i - 1);
                else if (e.key === 'Home') move(0);
                else if (e.key === 'End') move(code.length - 1);
                else return;
                e.preventDefault();
              }}
            >
              <span className="mono">{String(i + 1).padStart(2, '0')}</span> {c.title}
            </button>
          ))}
        </div>
      ) : null}
      {code.map((c, i) => (
        <div
          key={i}
          id={`pj-code-panel-${i}`}
          className="pj-code__panel"
          role={code.length > 1 ? 'tabpanel' : undefined}
          aria-labelledby={code.length > 1 ? `pj-code-tab-${i}` : undefined}
          hidden={at !== i}
        >
          <figure className="pj-code__figure">
            <figcaption className="pj-code__cap mono">
              <span>{c.lang}</span> {c.title}
            </figcaption>
            <pre tabIndex={0}>
              <code>
                {c.code.split('\n').map((line, n) => (
                  <span key={n} className="pj-code__line">
                    {highlight(line)}
                    {'\n'}
                  </span>
                ))}
              </code>
            </pre>
          </figure>
        </div>
      ))}
    </div>
  );
}

function PagerLink({ p, dir }: { p: CatalogCard | null; dir: 'prev' | 'next' }) {
  const { t, lang } = useI18n();
  if (!p) return <span />;
  return (
    <a className={`pj-pager__link pj-pager__link--${dir}`} href={catalogPath(lang, p.slug)}>
      <span className="mono">{dir === 'prev' ? `‹ ${t.catalog.prev}` : `${t.catalog.next} ›`}</span>
      <span className="pj-pager__name">{p.name[lang]}</span>
    </a>
  );
}
