import type { MouseEvent } from 'react';
import { site } from '../config/site';
import { examples, services, steps } from '../data/lite';
import { projects } from '../data/projects';
import { useI18n } from '../i18n/context';
import { pathFor } from '../i18n/routing';
import { formatPhone, whatsappHref } from '../lib/contact';
import { STORAGE_KEYS, writeStorage } from '../lib/storage';
import { Wordmark } from '../components/ui/Wordmark';
import { LangSwitch } from '../components/navigation/LangSwitch';
import { ModeSwitch } from '../components/navigation/ModeSwitch';
import { Footer } from '../components/navigation/Footer';
import { ContactChannels } from '../components/contact/ContactChannels';
import { Icon } from './icons';
import { PhoneDemo } from './PhoneDemo';
import { ProjectGlyph } from '../components/projects/ProjectGlyph';
import './lite.css';

/** The simple version: what I offer, how I work, examples and contact — no jargon. */
export function LiteSite() {
  const { t, l, lang } = useI18n();
  const x = t.lite;
  const wa = whatsappHref(site.contact.whatsapp, t.contact.whatsappGreeting);
  const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent(t.contact.subject)}`;

  // Going to the tech version from here means the visitor wants it: remember that.
  const toTech = (event: MouseEvent<HTMLAnchorElement>, hash = '') => {
    writeStorage(STORAGE_KEYS.mode, 'tech');
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    window.location.assign(pathFor(lang, 'tech') + hash);
  };

  const nav = [
    ['services', x.nav.services],
    ['how', x.nav.how],
    ['examples', x.nav.examples],
    ['contact', x.nav.contact],
  ] as const;

  return (
    <>
      <a className="skip-link" href="#main">
        {t.a11y.skip}
      </a>
      <header className="lbar">
        <a className="lbar__brand" href="#top" aria-label={`${site.brand.name} — ${t.a11y.home}`}>
          <span className="statusbar__mark" aria-hidden="true" />
          <Wordmark />
        </a>
        <nav className="lbar__nav" aria-label={t.a11y.systemMap}>
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="lbar__right">
          <ModeSwitch />
          <LangSwitch className="lbar__lang" />
        </div>
      </header>

      <main id="main" className="lite" tabIndex={-1}>
        <section id="top" className="lhero" aria-labelledby="lite-title">
          <div className="lhero__copy">
          <p className="lhero__kicker">{x.heroKicker}</p>
          <h1 id="lite-title" className="lhero__title">
            {x.heroTitle}
          </h1>
          <p className="lhero__sub">{x.heroSub}</p>
          <div className="lhero__cta">
            <a className="btn btn--wa lbtn" href={wa} target="_blank" rel="noopener noreferrer">
              {x.ctaWhatsapp}
              <span className="sr-only"> ({t.a11y.externalLink})</span>
            </a>
            <a className="btn lbtn" href={mailto}>
              {x.ctaEmail}
            </a>
          </div>
          <p className="lhero__meta">
            <span>{formatPhone(site.contact.whatsapp)}</span>
            <span className="lhero__dot" aria-hidden="true">
              ·
            </span>
            <span>{t.contact.whatsappHint}</span>
          </p>
          <div className="lbrand">
            <span className="lbrand__r" aria-hidden="true">
              R
            </span>
            <p>
              <strong>
                <Wordmark /> — {l(site.brand.meaning)}.
              </strong>{' '}
              {x.brandLead}
            </p>
          </div>
          </div>
          <PhoneDemo />
        </section>

        <section id="services" className="lsec" aria-labelledby="lite-services">
          <h2 id="lite-services" className="lsec__title">
            {x.servicesTitle}
          </h2>
          <p className="lsec__lead">{x.servicesLead}</p>
          <ul className="lservices">
            {services.map((s) => (
              <li key={s.id} className="lcard">
                <span className="lcard__icon">
                  <Icon name={s.icon} />
                </span>
                <h3 className="lcard__title">{l(s.title)}</h3>
                <p className="lcard__text">{l(s.text)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="how" className="lsec" aria-labelledby="lite-how">
          <h2 id="lite-how" className="lsec__title">
            {x.howTitle}
          </h2>
          <p className="lsec__lead">{x.howLead}</p>
          <ol className="lsteps">
            {steps.map((s, i) => (
              <li key={s.id} className="lstep">
                <span className="lstep__n" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="lstep__title">{l(s.title)}</h3>
                <p className="lstep__text">{l(s.text)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="examples" className="lsec" aria-labelledby="lite-examples">
          <h2 id="lite-examples" className="lsec__title">
            {x.examplesTitle}
          </h2>
          <p className="lsec__lead">{x.examplesLead}</p>
          <ul className="lexamples">
            {examples.map((e) => {
              const project = projects.find((p) => p.id === e.project)!;
              const hash = `#project-${project.id}`;
              return (
                <li key={e.project} className="lcard lexample">
                  <p className="lexample__name">
                    <span className="lexample__glyph" aria-hidden="true">
                      <ProjectGlyph kind={project.visual} />
                    </span>
                    {l(project.name)}
                  </p>
                  <h3 className="lcard__title">{l(e.title)}</h3>
                  <p className="lcard__text">{l(e.text)}</p>
                  <a className="lexample__link" href={pathFor(lang, 'tech') + hash} onClick={(ev) => toTech(ev, hash)}>
                    {x.seeInside} <span aria-hidden="true">›</span>
                  </a>
                </li>
              );
            })}
            <li className="lcard lexample lexample--cta">
              <h3 className="lcard__title">{x.ctaCardTitle}</h3>
              <p className="lcard__text">{x.ctaCardText}</p>
              <a className="btn btn--wa lbtn" href={wa} target="_blank" rel="noopener noreferrer">
                {x.ctaCardButton}
                <span className="sr-only"> ({t.a11y.externalLink})</span>
              </a>
            </li>
          </ul>
        </section>

        <section className="lcurious" aria-label={x.curious}>
          <p className="lcurious__text">
            <span aria-hidden="true">⚡</span> {x.curious}
          </p>
          <a className="btn lbtn" href={pathFor(lang, 'tech')} onClick={(ev) => toTech(ev)}>
            {x.curiousCta}
          </a>
        </section>

        <section id="contact" className="lsec" aria-labelledby="lite-contact">
          <h2 id="lite-contact" className="lsec__title">
            {x.contactTitle}
          </h2>
          <p className="lsec__lead">{x.contactLead}</p>
          <ContactChannels showHook={false} />
        </section>
      </main>
      <div className="lite-foot">
        <Footer />
      </div>
    </>
  );
}
