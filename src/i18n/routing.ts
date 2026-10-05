import { DEFAULT_LANG, type Lang } from './types';
import type { Mode } from '../lib/mode';

/**
 * URL layout — every combination is a real, prerendered page:
 *   <base>            English · tech
 *   <base>lite/       English · simple
 *   <base>es/         Spanish · tech
 *   <base>es/lite/    Spanish · simple
 */
export function pathFor(lang: Lang, mode: Mode = 'tech', base: string = import.meta.env.BASE_URL): string {
  return `${base}${lang === DEFAULT_LANG ? '' : `${lang}/`}${mode === 'lite' ? 'lite/' : ''}`;
}

export function routeFromPath(pathname: string, base: string = import.meta.env.BASE_URL): { lang: Lang; mode: Mode } {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const parts = rest.split('/').filter(Boolean);
  const lang: Lang = parts[0] === 'es' ? 'es' : 'en';
  const mode: Mode = parts.includes('lite') ? 'lite' : 'tech';
  return { lang, mode };
}

/**
 * «All my projects» lives outside the two versions, one page per language:
 *   <base>[es/]projects/          the catalogue
 *   <base>[es/]projects/<slug>/   one project
 */
export type Page = { kind: 'home' } | { kind: 'catalog' } | { kind: 'project'; slug: string };

export function catalogPath(lang: Lang, slug?: string, base: string = import.meta.env.BASE_URL): string {
  return `${base}${lang === DEFAULT_LANG ? '' : `${lang}/`}projects/${slug ? `${slug}/` : ''}`;
}

export function pageFromPath(pathname: string, base: string = import.meta.env.BASE_URL): Page {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const parts = rest.split('/').filter((p) => p && p !== 'index.html');
  const at = parts.indexOf('projects');
  if (at < 0) return { kind: 'home' };
  const slug = parts[at + 1];
  return slug ? { kind: 'project', slug } : { kind: 'catalog' };
}
