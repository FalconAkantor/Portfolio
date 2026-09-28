import type { Localized } from '../i18n/types';

export type SectionId =
  | 'boot'
  | 'manifesto'
  | 'network'
  | 'projects'
  | 'ai'
  | 'vision'
  | 'automation'
  | 'infrastructure'
  | 'stack'
  | 'operator'
  | 'contact';

export interface SectionEntry {
  id: SectionId;
  /** Name in the system tree. Directories end with "/". */
  node: string;
  label: Localized;
}

/** Order of this list = order on the page = order in the system tree. */
export const sections: SectionEntry[] = [
  { id: 'boot', node: 'boot', label: { en: 'Start', es: 'Inicio' } },
  { id: 'manifesto', node: 'manifesto', label: { en: 'What I build', es: 'Qué construyo' } },
  { id: 'network', node: 'network', label: { en: 'Integration', es: 'Integración' } },
  { id: 'projects', node: 'projects/', label: { en: 'Projects', es: 'Proyectos' } },
  { id: 'ai', node: 'ai/', label: { en: 'AI lab', es: 'Laboratorio IA' } },
  { id: 'vision', node: 'vision/', label: { en: 'Vision', es: 'Visión' } },
  { id: 'automation', node: 'automation/', label: { en: 'Automation', es: 'Automatización' } },
  { id: 'infrastructure', node: 'infrastructure/', label: { en: 'Infrastructure', es: 'Infraestructura' } },
  { id: 'stack', node: 'stack', label: { en: 'Stack', es: 'Stack' } },
  { id: 'operator', node: 'operator', label: { en: 'About', es: 'Sobre mí' } },
  { id: 'contact', node: 'contact', label: { en: 'Contact', es: 'Contacto' } },
];

export function isSectionId(value: string): value is SectionId {
  return sections.some((s) => s.id === value);
}
