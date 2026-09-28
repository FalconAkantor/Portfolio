import type { Localized } from '../i18n/types';

export type SectionId = 'boot' | 'projects' | 'network' | 'automation' | 'stack' | 'about' | 'contact';

export interface SectionEntry {
  id: SectionId;
  /** Name in the system tree. Directories end with "/". */
  node: string;
  label: Localized;
}

/** Order of this list = order on the page = order in the system tree. */
export const sections: SectionEntry[] = [
  { id: 'boot', node: 'boot', label: { en: 'Start', es: 'Inicio' } },
  { id: 'projects', node: 'projects/', label: { en: 'Projects', es: 'Proyectos' } },
  { id: 'network', node: 'network', label: { en: 'Integration', es: 'Integración' } },
  { id: 'automation', node: 'automation/', label: { en: 'Automation', es: 'Automatización' } },
  { id: 'stack', node: 'stack', label: { en: 'Stack', es: 'Stack' } },
  { id: 'about', node: 'about', label: { en: 'About', es: 'Sobre mí' } },
  { id: 'contact', node: 'contact', label: { en: 'Contact', es: 'Contacto' } },
];

export function isSectionId(value: string): value is SectionId {
  return sections.some((s) => s.id === value);
}
