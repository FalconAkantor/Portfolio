import { useEffect, useRef, type MouseEvent } from 'react';
import { useI18n } from '../../i18n/context';
import { pathFor } from '../../i18n/routing';
import { boot } from '../../lib/boot';
import { prefersReducedMotion } from '../../lib/motion';
import { readStorage, STORAGE_KEYS, writeStorage } from '../../lib/storage';
import { Wordmark } from '../ui/Wordmark';
import './chooser.css';

declare global {
  interface Window {
    __automarizaChooser?: boolean;
  }
}

/**
 * First visit: "tech or simple?". The markup is prerendered and hidden;
 * the inline script in index.html adds `html.choosing` before first paint
 * when no version has been chosen yet.
 */
export function ModeChooser() {
  const { t, lang } = useI18n();
  const c = t.chooser;
  const techRef = useRef<HTMLButtonElement>(null);

  const chooseTech = () => {
    writeStorage(STORAGE_KEYS.mode, 'tech');
    document.documentElement.classList.remove('choosing');
    if (!readStorage(STORAGE_KEYS.booted) && !prefersReducedMotion() && !window.location.hash) boot.start();
  };

  const chooseLite = (event: MouseEvent<HTMLAnchorElement>) => {
    writeStorage(STORAGE_KEYS.mode, 'lite');
    if (event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    window.location.assign(pathFor(lang, 'lite') + window.location.hash);
  };

  useEffect(() => {
    window.__automarizaChooser = true;
    if (!document.documentElement.classList.contains('choosing')) return;
    techRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.documentElement.classList.contains('choosing')) chooseTech();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="chooser" role="dialog" aria-modal="true" aria-labelledby="chooser-title" aria-describedby="chooser-sub">
      <div className="chooser__frame">
        <p className="chooser__brand mono">
          <Wordmark /> <span>· {c.kicker}</span>
        </p>
        <h2 id="chooser-title" className="chooser__title">
          {c.title}
        </h2>
        <p id="chooser-sub" className="chooser__sub">
          {c.sub}
        </p>

        <div className="chooser__options">
          <button ref={techRef} type="button" className="chooser__opt chooser__opt--tech" onClick={chooseTech}>
            <span className="chooser__badge mono">⚡ {c.techBadge}</span>
            <span className="chooser__name">{c.techTitle}</span>
            <span className="chooser__text">{c.techText}</span>
            <span className="chooser__preview mono" aria-hidden="true">
              <span className="chooser__prompt">visitor@automariza:~$</span> boot --full
            </span>
            <span className="chooser__cta">{c.techCta}</span>
          </button>

          <a className="chooser__opt chooser__opt--lite" href={pathFor(lang, 'lite')} onClick={chooseLite}>
            <span className="chooser__badge">{c.liteBadge}</span>
            <span className="chooser__name">{c.liteTitle}</span>
            <span className="chooser__text">{c.liteText}</span>
            <span className="chooser__preview chooser__preview--lite" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="chooser__cta">{c.liteCta}</span>
          </a>
        </div>

        <p className="chooser__note">{c.note}</p>
      </div>
    </div>
  );
}
