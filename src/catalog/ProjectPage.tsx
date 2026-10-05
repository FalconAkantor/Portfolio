import { site } from '../config/site';
import { tech } from '../data/stack';
import { useI18n } from '../i18n/context';
import { catalogPath } from '../i18n/routing';
import { whatsappHref } from '../lib/contact';
import { highlight } from '../lib/highlight';
import { TechLogo } from '../components/ui/TechLogo';
import { Card } from './CatalogIndex';
import { CATEGORY, CategoryGlyph, DEPARTMENT, KIND, STATUS, label } from './labels';
import { StoryPlayer } from './StoryPlayer';
import type { CatalogCard, ProjectPageData } from './types';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function ProjectPage({ data }: { data: ProjectPageData }) {
  const { t, lang } = useI18n();
  const { project, suite, siblings, prev, next } = data;
  const f = project.ficha;
  const isSuite = f.kind === 'suite';
  const wa = whatsappHref(site.contact.whatsapp, t.contact.whatsappGreeting);

  return (
    <article className="pj" aria-labelledby="pj-title">
      <nav className="pj-crumbs mono" aria-label="breadcrumb">
        <a href={catalogPath(lang)}>{t.catalog.root}</a>
        {suite && !isSuite ? (
          <>
            <span aria-hidden="true">›</span>
            <a href={catalogPath(lang, suite.slug)}>{suite.name}</a>
          </>
        ) : null}
        <span aria-hidden="true">›</span>
        <span aria-current="page">{f.name}</span>
      </nav>

      <header className="pj-head">
        <div className="pj-head__copy">
          <p className="pj-head__meta mono">
            <CategoryGlyph category={f.category} />
            {label(CATEGORY, f.category, lang)} · {label(KIND, f.kind, lang)}
            {f.featured ? <span className="pj-badge pj-badge--star">★</span> : null}
          </p>
          <h1 id="pj-title" className="pj-head__title">
            {f.name}
          </h1>
          <p className="pj-head__tagline">{f.tagline[lang]}</p>
          <p className="pj-head__summary">{f.summary[lang]}</p>
          <ul className="pj-badges">
            <li className="pj-badge pj-badge--ok">
              <i aria-hidden="true" /> {label(STATUS, f.status, lang)}
            </li>
            {f.ai?.used ? (
              <li className="pj-badge pj-badge--ai">✦ {lang === 'es' ? (f.ai.local ? 'IA local' : 'IA') : f.ai.local ? 'Local AI' : 'AI'}</li>
            ) : null}
            {(f.department ?? []).map((d) => (
              <li key={d} className="pj-badge">
                {label(DEPARTMENT, d, lang)}
              </li>
            ))}
            <li className="pj-badge pj-badge--dim">{t.catalog.read(project.minutes)}</li>
          </ul>
        </div>
        <figure className="pj-story">
          <StoryPlayer story={project.anim} />
          <figcaption className="pj-story__cap mono">
            {project.anim.concept[lang]} · {t.catalog.sample}
          </figcaption>
        </figure>
      </header>

      {f.howItWorks?.length ? (
        <section className="pj-sec" aria-labelledby="pj-how">
          <h2 id="pj-how" className="pj-sec__title">
            {t.catalog.howItWorks}
          </h2>
          <ol className="pj-steps">
            {f.howItWorks.map((s, i) => (
              <li key={i} className="pj-step">
                <span className="pj-step__n mono">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="pj-step__title">{s.title[lang]}</h3>
                <p className="pj-step__text">{s.text[lang]}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {isSuite ? (
        <section className="pj-sec" aria-labelledby="pj-tools">
          <h2 id="pj-tools" className="pj-sec__title">
            {t.catalog.suiteTools}
          </h2>
          <ul className="cat-grid">
            {siblings.map((p) => (
              <li key={p.slug}>
                <Card p={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.diagramSvg ? (
        <section className="pj-sec" aria-labelledby="pj-diagram">
          <h2 id="pj-diagram" className="pj-sec__title">
            {t.catalog.diagram}
          </h2>
          <figure className="pj-diagram" tabIndex={0} aria-label={t.catalog.diagram} dangerouslySetInnerHTML={{ __html: project.diagramSvg }} />
        </section>
      ) : null}

      <div className="pj-body">
        <div className="pj-main">
          {f.features?.length ? (
            <section className="pj-sec" aria-labelledby="pj-features">
              <h2 id="pj-features" className="pj-sec__title">
                {t.catalog.features}
              </h2>
              <ul className="pj-features">
                {f.features.map((x, i) => (
                  <li key={i}>{x[lang]}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="pj-sec" aria-labelledby="pj-docs">
            <h2 id="pj-docs" className="pj-sec__title">
              {t.catalog.docs}
            </h2>
            {t.catalog.spanishNote ? <p className="pj-note mono">{t.catalog.spanishNote}</p> : null}
            <nav className="pj-toc mono" aria-label={t.catalog.docs}>
              {project.sections.map((s) => (
                <a key={s.title} href={`#${slugify(s.title)}`}>
                  {s.title}
                </a>
              ))}
            </nav>
            <div className="pj-docs" lang="es">
              {project.sections.map((s) => (
                <section key={s.title} className="pj-doc" aria-labelledby={slugify(s.title)}>
                  <h3 id={slugify(s.title)} className="pj-doc__title">
                    {s.title}
                  </h3>
                  <div className="cat-prose" dangerouslySetInnerHTML={{ __html: s.html }} />
                </section>
              ))}
            </div>
          </section>

          {project.code.length ? (
            <section className="pj-sec" aria-labelledby="pj-code">
              <h2 id="pj-code" className="pj-sec__title">
                {t.catalog.code}
              </h2>
              {project.code.map((c, i) => (
                <figure key={i} className="pj-code">
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
              ))}
            </section>
          ) : null}
        </div>

        <aside className="pj-aside" aria-label={t.catalog.tech}>
          {f.businessValue ? (
            <div className="pj-fact pj-fact--value">
              <h2 className="pj-fact__title mono">{t.catalog.value}</h2>
              <p>{f.businessValue[lang]}</p>
            </div>
          ) : null}
          {f.stack.length || f.stackOther.length ? (
            <div className="pj-fact">
              <h2 className="pj-fact__title mono">{t.catalog.tech}</h2>
              <ul className="pj-tech">
                {f.stack.map((id) => (
                  <li key={id}>
                    <TechLogo id={id} /> {tech[id].label}
                  </li>
                ))}
                {f.stackOther.map((s) => (
                  <li key={s} className="pj-tech__other">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {f.automations?.length ? (
            <div className="pj-fact">
              <h2 className="pj-fact__title mono">{t.catalog.automations}</h2>
              <ul className="pj-auto">
                {f.automations.map((a, i) => (
                  <li key={i}>
                    <span className="mono">{a.trigger}</span>
                    {a.action[lang]}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {f.integrations?.length ? (
            <div className="pj-fact">
              <h2 className="pj-fact__title mono">{t.catalog.integrations}</h2>
              <ul className="pj-pills">
                {f.integrations.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {f.metrics?.length ? (
            <div className="pj-fact">
              <h2 className="pj-fact__title mono">{t.catalog.metrics}</h2>
              <dl className="pj-metrics">
                {f.metrics.map((m, i) => (
                  <div key={i}>
                    <dt>{m.label[lang]}</dt>
                    <dd className="mono">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          {f.users ? (
            <div className="pj-fact">
              <h2 className="pj-fact__title mono">{t.catalog.users}</h2>
              <p>{f.users[lang]}</p>
            </div>
          ) : null}
        </aside>
      </div>

      {!isSuite && siblings.length ? (
        <section className="pj-sec" aria-labelledby="pj-more">
          <h2 id="pj-more" className="pj-sec__title">
            {t.catalog.more(suite?.name ?? '')}
          </h2>
          <ul className="cat-grid">
            {siblings.slice(0, 6).map((p) => (
              <li key={p.slug}>
                <Card p={p} />
              </li>
            ))}
          </ul>
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

function PagerLink({ p, dir }: { p: CatalogCard | null; dir: 'prev' | 'next' }) {
  const { t, lang } = useI18n();
  if (!p) return <span />;
  return (
    <a className={`pj-pager__link pj-pager__link--${dir}`} href={catalogPath(lang, p.slug)}>
      <span className="mono">{dir === 'prev' ? `‹ ${t.catalog.prev}` : `${t.catalog.next} ›`}</span>
      <span className="pj-pager__name">{p.name}</span>
    </a>
  );
}
