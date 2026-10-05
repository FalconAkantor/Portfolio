import type { Localized } from '../i18n/types';
import type { CatalogCard, CatalogIndex } from './types';

/**
 * The catalogue is read by business area: each suite of the documented catalogue is one area of
 * the company. Listed in the order a visitor follows the business (buy → cost → build → store →
 * sell → serve), with the infrastructure that keeps it all running last.
 */
export interface Area {
  /** Short key used in links (#area-<key>). */
  key: string;
  /** Slug of the suite that documents this area. */
  suite: string;
  name: Localized;
  /** Accent colour; every one stays above 7:1 on the page background. */
  color: string;
  /** 24×24 line icon, stroked with currentColor. */
  icon: string;
}

export const AREAS: Area[] = [
  {
    key: 'compras',
    suite: 'suite-compras',
    name: { es: 'Compras', en: 'Purchasing' },
    color: '#5cc8d6',
    icon: 'M3 4h2.4l2.3 10.5h10.6L20.5 7H6.3 M8.5 19.2a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0 M15.5 19.2a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0',
  },
  {
    key: 'costes',
    suite: 'suite-costes-margenes',
    name: { es: 'Costes y márgenes', en: 'Costs & margins' },
    color: '#f2a93b',
    icon: 'M5 7c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5-3.1 2.5-7 2.5S5 8.4 5 7z M5 7v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V7 M5 12v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5',
  },
  {
    key: 'produccion',
    suite: 'suite-produccion',
    name: { es: 'Producción', en: 'Production' },
    color: '#52d18e',
    icon: 'M3 20.5V11l5 3v-3l5 3v-3l5 3V4h3v16.5z M7 17.5h1.5 M11.5 17.5H13 M16 17.5h1.5',
  },
  {
    key: 'stock',
    suite: 'suite-stock',
    name: { es: 'Stock', en: 'Stock' },
    color: '#a78bfa',
    icon: 'M3.5 13h7.5v7.5H3.5z M13 13h7.5v7.5H13z M8.25 3.5h7.5V11h-7.5z M6 13v2.5 M15.5 13v2.5 M10.75 3.5V6',
  },
  {
    key: 'portal',
    suite: 'suite-portal-b2b',
    name: { es: 'Portal B2B', en: 'B2B portal' },
    color: '#f472b6',
    icon: 'M4.5 11v9.5h15V11 M3 9.5L5 4h14l2 5.5 M3 9.5a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0 M10 20.5v-5h4v5',
  },
  {
    key: 'administracion',
    suite: 'suite-administracion',
    name: { es: 'Administración', en: 'Finance' },
    color: '#60a5fa',
    icon: 'M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z M9 8h6 M9 11.5h6 M9 15h3.5',
  },
  {
    key: 'comercial',
    suite: 'suite-comercial-marketing',
    name: { es: 'Comercial y marketing', en: 'Sales & marketing' },
    color: '#2dd4bf',
    icon: 'M3 10v4h3l7.5 4.5v-13L6 10z M6.5 14l1.2 5.5h2.6l-1-4.5 M16.5 9a4 4 0 0 1 0 6 M19 6.5a7.5 7.5 0 0 1 0 11',
  },
  {
    key: 'atencion',
    suite: 'suite-atencion',
    name: { es: 'Atención al cliente', en: 'Customer service' },
    color: '#fb923c',
    icon: 'M4 14.5V12a8 8 0 0 1 16 0v2.5 M4 14h3.5v5.5H5.5A1.5 1.5 0 0 1 4 18z M20 14h-3.5v5.5h2A1.5 1.5 0 0 0 20 18z M16.5 19.5c-.4 1.3-2 2-4.5 2',
  },
  {
    key: 'conocimiento',
    suite: 'suite-conocimiento',
    name: { es: 'Conocimiento', en: 'Knowledge' },
    color: '#a3e635',
    icon: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5 M8.5 7.5h7 M8.5 11h5',
  },
  {
    key: 'infraestructura',
    suite: 'suite-infraestructura',
    name: { es: 'Infraestructura', en: 'Infrastructure' },
    color: '#f87171',
    icon: 'M4 4h16v6.5H4z M4 13.5h16V20H4z M7.5 7.25h.01 M7.5 16.75h.01 M11 7.25h5 M11 16.75h5',
  },
];

const BY_SUITE = new Map(AREAS.map((a) => [a.suite, a]));
const BY_KEY = new Map(AREAS.map((a) => [a.key, a]));

export const areaBySuite = (suite: string | null | undefined): Area | undefined => (suite ? BY_SUITE.get(suite) : undefined);
export const areaByKey = (key: string | null | undefined): Area | undefined => (key ? BY_KEY.get(key) : undefined);

/** The area a project belongs to: its own if it is a suite, else its suite's. */
export function areaOf(card: Pick<CatalogCard, 'slug' | 'kind' | 'parent'>, index?: Pick<CatalogIndex, 'suites'>): Area | undefined {
  if (card.kind === 'suite') return areaBySuite(card.slug);
  const suite = index?.suites.find((s) => s.tools.includes(card.slug))?.slug ?? card.parent;
  return areaBySuite(suite);
}

/** Systems before single tools, live work before prototypes and experiments; otherwise as documented. */
export function sortTools(cards: CatalogCard[]): CatalogCard[] {
  const rank = (p: CatalogCard) => (p.status === 'produccion' ? 0 : 2) + (p.kind === 'sistema' ? 0 : 1) - (p.featured ? 0.5 : 0);
  return cards
    .map((p, i) => ({ p, i }))
    .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
    .map(({ p }) => p);
}
