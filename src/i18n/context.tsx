import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ui, type UIStrings } from './ui';
import type { Lang, Localized } from './types';

interface I18nValue {
  lang: Lang;
  /** UI strings for the active language. */
  t: UIStrings;
  /** Resolve a localized data value. */
  l: <T>(value: Localized<T>) => T;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo<I18nValue>(
    () => ({ lang, t: ui[lang], l: (v) => v[lang] }),
    [lang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
