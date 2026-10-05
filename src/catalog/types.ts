import type { Localized } from '../i18n/types';
import type { TechId } from '../data/stack';

/** Shapes of the data produced by scripts/build-catalog.mjs from content/catalogo.md. */

export type CatalogKind = 'suite' | 'sistema' | 'herramienta';

export interface CatalogCard {
  slug: string;
  name: string;
  kind: CatalogKind;
  parent: string | null;
  tools: string[];
  category: string;
  department: string[];
  status: string;
  lifecycle: string;
  tagline: Localized;
  summary: Localized;
  stack: TechId[];
  featured: boolean;
  impressiveness: number;
  ai: boolean;
  minutes: number;
}

export interface CatalogIndex {
  generated: string;
  totals: { suites: number; sistemas: number; herramientas: number; procesosEnProduccion: number };
  suites: { slug: string; name: string; tools: string[] }[];
  featured: string[];
  overviewHtml: string;
  stories: Record<string, Story>;
  projects: CatalogCard[];
}

export interface StoryElement {
  id: string;
  type: string;
  label: string;
  position: string;
}

export interface Story {
  duration: number;
  aspect: string;
  concept: Localized;
  elements: StoryElement[];
  beats: { t: number; action: string }[];
}

export interface Ficha {
  slug: string;
  name: string;
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
  automations?: { trigger: string; action: Localized }[];
  integrations?: string[];
  ai?: { used: boolean; where?: Localized; local?: boolean; models?: string[] };
  users?: Localized;
  stack: TechId[];
  stackOther: string[];
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
  anim: Story;
  diagramSvg?: string;
  minutes: number;
}

export interface ProjectPageData {
  project: ProjectData;
  suite: CatalogCard | null;
  siblings: CatalogCard[];
  prev: CatalogCard | null;
  next: CatalogCard | null;
}

export type CatalogData = { kind: 'catalog'; index: CatalogIndex } | { kind: 'project'; page: ProjectPageData };
