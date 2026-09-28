import type { Localized } from '../i18n/types';
import { site } from '../config/site';

/**
 * Public profile shown in the "operator" section.
 * Intentionally anonymous: no employer, no company job title, no dates.
 */
export interface Profile {
  role: Localized;
  scope: Localized<string[]>;
}

export const profile: Profile = {
  role: site.role,
  scope: {
    en: ['Artificial intelligence', 'Process automation', 'System integration', 'Systems & infrastructure'],
    es: ['Inteligencia artificial', 'Automatización de procesos', 'Integración de sistemas', 'Sistemas e infraestructura'],
  },
};
