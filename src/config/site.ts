/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  NACHO.SYS — central configuration
 * ─────────────────────────────────────────────────────────────────────────────
 *  Everything personal or deployment-specific lives here.
 *
 *  PRIVACY
 *  The site identifies its author only by first name and brand (Nacho ·
 *  AUTOMARIZA). Do not add surnames, an employer, a job title at a company or a
 *  private e-mail — the only public address is the brand one below.
 *
 *  CONTACT PLACEHOLDERS
 *  Any channel left as an empty string is simply not rendered. Fill in the real
 *  values and push: the site rebuilds and deploys on its own.
 *  Nothing here is invented — empty means "not provided yet".
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Localized } from '../i18n/types';

export interface ContactConfig {
  /** Public e-mail address, e.g. "hello@example.com". Enables the "Send by e-mail" button. */
  email: string;
  /** Full LinkedIn profile URL. */
  linkedin: string;
  /** Full GitHub profile URL. */
  github: string;
  /** Telegram username without "@". */
  telegram: string;
  /** WhatsApp number in international format, digits only (e.g. "34600000000"). */
  whatsapp: string;
}

export interface BrandConfig {
  name: string;
  /** Index of the letter the brand plays on (the R). */
  accentIndex: number;
  /** What the accented letter means. */
  meaning: Localized;
  /** One-line claim. */
  claim: Localized;
  /** Why the brand is called that — shown in the "about" section. */
  story: Localized;
}

export interface SiteConfig {
  brand: BrandConfig;
  /** Public name. Deliberately a first name / alias only. */
  shortName: string;
  /** Online handle. */
  handle: string;
  /** Name of the "operating system" the site presents. */
  systemName: string;
  /** Version of this website (not of any project). */
  version: string;
  /** Generic professional description — not tied to any employer. */
  role: Localized;
  /**
   * Canonical public URL, without trailing slash.
   * The GitHub Pages workflow overrides it through the SITE_URL env variable,
   * so this value only matters for local builds or a custom setup.
   */
  siteUrl: string;
  contact: ContactConfig;
}

export const site: SiteConfig = {
  brand: {
    name: 'AUTOMARIZA',
    accentIndex: 6,
    meaning: { en: 'The R stands for Reasoning', es: 'La R es de Razonamiento' },
    claim: { en: 'Automation that reasons.', es: 'Automatización que razona.' },
    story: {
      en: 'Automating without thinking only makes mistakes happen faster. So every system I build reasons before it acts: it reads the document, checks it against the data, decides — and asks a person when something doesn’t add up. Automate, with reasoning: AUTOMARIZA.',
      es: 'Automatizar sin pensar solo consigue que los errores ocurran más rápido. Por eso cada sistema que construyo razona antes de actuar: lee el documento, lo contrasta con los datos, decide y, cuando algo no cuadra, pregunta a una persona. Automatizar, con razonamiento: AUTOMARIZA.',
    },
  },
  shortName: 'Nacho',
  handle: 'Akantor',
  systemName: 'AUTOMARIZA',
  version: '1.0.0',
  role: {
    en: 'AI, automation & systems developer',
    es: 'Desarrollador de IA, automatización y sistemas',
  },
  siteUrl: 'https://falconakantor.github.io/Portfolio',
  contact: {
    email: 'nacho.automariza@gmail.com',
    linkedin: '', // TODO(config): https://www.linkedin.com/in/…
    github: 'https://github.com/FalconAkantor',
    telegram: '', // TODO(config): username without @
    whatsapp: '', // TODO(config): digits only, international format
  },
};

/** Channels that still need a real value — surfaced as a warning at build time. */
export function missingContactFields(config: SiteConfig = site): (keyof ContactConfig)[] {
  return (Object.keys(config.contact) as (keyof ContactConfig)[]).filter(
    (key) => config.contact[key].trim() === '',
  );
}
