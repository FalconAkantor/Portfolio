import type { Localized } from '../i18n/types';
import type { TechId } from '../data/stack';

/** Shapes of the data produced by scripts/build-catalog.mjs from content/catalogo.md. */

export type CatalogKind = 'suite' | 'sistema' | 'herramienta';

export interface CatalogCard {
  slug: string;
  name: Localized;
  kind: CatalogKind;
  parent: string | null;
  tools: string[];
  category: string;
  department: string[];
  status: string;
  lifecycle: string;
  tagline: Localized;
  /** Only on suites (the introduction of their area). */
  summary?: Localized;
  stack: TechId[];
  integrations: string[];
  featured: boolean;
  ai: boolean;
  aiLocal: boolean;
  /** An explainer video exists at public/video/tools/<slug>.mp4. */
  video?: boolean;
  minutes: number;
  /** Only on featured projects: the titles of their «how it works» steps. */
  steps?: Localized[];
}

export interface CatalogIndex {
  generated: string;
  totals: {
    suites: number;
    sistemas: number;
    herramientas: number;
    procesosEnProduccion: number;
  };
  suites: { slug: string; name: Localized; tools: string[] }[];
  featured: string[];
  overviewHtml: string;
  projects: CatalogCard[];
}

export interface Ficha {
  slug: string;
  name: Localized;
  kind: CatalogKind;
  parent: string | null;
  tools?: string[];
  category: string;
  department?: string[];
  status: string;
  lifecycle: string;
  evolvedFrom?: string | null;
  tagline: Localized;
  summary: Localized;
  problem?: Localized;
  solution?: Localized;
  howItWorks?: { title: Localized; text: Localized }[];
  features?: Localized[];
  automations?: { trigger: Localized; action: Localized }[];
  integrations?: Localized[];
  ai?: {
    used: boolean;
    where?: Localized;
    local?: boolean;
    models?: Localized[];
  };
  users?: Localized;
  stack: TechId[];
  stackOther: Localized[];
  metrics?: { label: Localized; value: string; real?: boolean }[];
  businessValue?: Localized;
  complexity?: number;
  impressiveness?: number;
  featured?: boolean;
  visualLoop?: Localized;
}

export interface ProjectData {
  ficha: Ficha;
  sections: { title: string; html: string }[];
  code: { lang: string; title: string; code: string }[];
  diagramSvg?: string;
  minutes: number;
  video?: boolean;
}

export interface ProjectPageData {
  project: ProjectData;
  suite: CatalogCard | null;
  siblings: CatalogCard[];
  prev: CatalogCard | null;
  next: CatalogCard | null;
}

export type CatalogData = { kind: 'catalog'; index: CatalogIndex } | { kind: 'project'; page: ProjectPageData };
