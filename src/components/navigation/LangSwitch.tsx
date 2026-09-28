import type { MouseEvent } from 'react';
import { useI18n } from '../../i18n/context';
import { pathForLang } from '../../i18n/routing';
import { STORAGE_KEYS, writeStorage } from '../../lib/storage';
import type { Lang } from '../../i18n/types';

/** Real link to the other prerendered language page; keeps the current section hash. */
export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n();
  const other: Lang = lang === 'en' ? 'es' : 'en';

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    writeStorage(STORAGE_KEYS.lang, other);
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    window.location.assign(pathForLang(other) + window.location.hash);
  };

  return (
    <a
      className={`lang-switch mono ${className}`}
      href={pathForLang(other)}
      hrefLang={other}
      lang={other}
      onClick={onClick}
      aria-label={t.a11y.switchLang}
    >
      <span className={lang === 'en' ? 'is-on' : ''}>EN</span>
      <span aria-hidden="true">/</span>
      <span className={lang === 'es' ? 'is-on' : ''}>ES</span>
    </a>
  );
}
