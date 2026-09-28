export const LANGS = ['en', 'es'] as const;
export type Lang = (typeof LANGS)[number];

/** A value that exists in every supported language. */
export type Localized<T = string> = Record<Lang, T>;

export const DEFAULT_LANG: Lang = 'en';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}
