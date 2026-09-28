import type { MouseEvent } from 'react';
import { site } from '../config/site';
import { useI18n } from '../i18n/context';
import { scrollToSection } from '../lib/scroll';
import { ParticleField } from '../components/hero/ParticleField';
import { Terminal } from '../components/terminal/Terminal';
import { Wordmark } from '../components/ui/Wordmark';
import './hero.css';

export function Hero() {
  const { t, l } = useI18n();
  const go = (event: MouseEvent<HTMLAnchorElement>, target: 'projects' | 'contact') => {
    event.preventDefault();
    scrollToSection(target);
  };

  return (
    <section id="boot" className="hero" aria-labelledby="boot-title">
      <ParticleField />

      <div className="hero__hud mono" aria-hidden="true">
        <span>~/system/boot</span>
        <span className="hero__hud-rule" />
        <span>node 00 · grid ref 17-B / 04</span>
      </div>

      <h1 id="boot-title" className="hero__title">
        <span className="sr-only">{t.hero.headlineA11y}</span>
        <span className="hero__lines" aria-hidden="true">
          {t.hero.headline.map((lineText, i) => (
            <span key={lineText} className="hero__line" style={{ ['--i' as string]: i }}>
              {lineText}
              {i === t.hero.headline.length - 1 ? <span className="hero__cursor" /> : null}
            </span>
          ))}
        </span>
      </h1>

      <div className="hero__grid">
        <div className="hero__copy">
          <p className="hero__sub">{t.hero.sub}</p>

          <p className="hero__id mono">
            <span className="hero__alias">
              {site.shortName} <span className="hero__at">·</span> <Wordmark />
            </span>
            <span className="hero__role">{l(site.role)}</span>
            <span className="hero__brand">
              <span className="hero__brand-r" aria-hidden="true">
                R
              </span>{' '}
              {l(site.brand.meaning)} — {l(site.brand.claim).toLowerCase()}
            </span>
          </p>

          <div className="hero__readout mono">
            <p className="hero__readout-label">{t.hero.readoutLabel}</p>
            <ul>
              {t.hero.readout.map((item, i) => (
                <li key={item} style={{ ['--i' as string]: i }}>
                  <span className="hero__ok" aria-hidden="true">
                    [ ok ]
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero__cta">
            <a className="btn btn--primary" href="#projects" onClick={(e) => go(e, 'projects')}>
              {t.hero.ctaProjects}
            </a>
            <a className="btn" href="#contact" onClick={(e) => go(e, 'contact')}>
              {t.hero.ctaContact}
            </a>
          </div>
        </div>

        <div className="hero__terminal">
          <Terminal variant="hero" />
        </div>
      </div>
    </section>
  );
}
