import type { MouseEvent } from 'react';
import { useI18n } from '../../i18n/context';
import { pathFor } from '../../i18n/routing';
import { useMode, type Mode } from '../../lib/mode';
import { STORAGE_KEYS, writeStorage } from '../../lib/storage';
import './navigation.css';

/** Top-right switch between the tech and the simple version. Plain links, so it works without JS. */
export function ModeSwitch({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n();
  const mode = useMode();

  const go = (event: MouseEvent<HTMLAnchorElement>, target: Mode) => {
    writeStorage(STORAGE_KEYS.mode, target);
    if (target === mode) {
      event.preventDefault();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    window.location.assign(pathFor(lang, target));
  };

  return (
    <nav className={`mode-switch mono ${className}`} aria-label={t.mode.switchLabel}>
      {(['tech', 'lite'] as const).map((m) => (
        <a
          key={m}
          href={pathFor(lang, m)}
          className={m === mode ? 'is-on' : ''}
          aria-current={m === mode ? 'page' : undefined}
          onClick={(e) => go(e, m)}
        >
          {m === 'tech' ? <span aria-hidden="true">⚡</span> : null}
          {t.mode[m]}
        </a>
      ))}
    </nav>
  );
}
