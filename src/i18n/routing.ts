import { DEFAULT_LANG, type Lang } from './types';

/**
 * URL layout:
 *   <base>      → English (default)
 *   <base>es/   → Spanish
 * Each language is a real, prerendered HTML page (good for SEO and hreflang).
 */
export function pathForLang(lang: Lang, base: string = import.meta.env.BASE_URL): string {
  return lang === DEFAULT_LANG ? base : `${base}${lang}/`;
}

export function langFromPath(pathname: string, base: string = import.meta.env.BASE_URL): Lang {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  return rest.startsWith('es') ? 'es' : 'en';
}
