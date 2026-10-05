import type { Localized } from '../i18n/types';
import type { CatalogKind } from './types';

export const KIND: Record<CatalogKind, Localized> = {
  suite: { en: 'Suite', es: 'Suite' },
  sistema: { en: 'System', es: 'Sistema' },
  herramienta: { en: 'Tool', es: 'Herramienta' },
};

export const CATEGORY: Record<string, Localized> = {
  ia: { en: 'AI', es: 'IA' },
  automatizacion: { en: 'Automation', es: 'Automatización' },
  datos: { en: 'Data', es: 'Datos' },
  bots: { en: 'Bots', es: 'Bots' },
  infra: { en: 'Infrastructure', es: 'Infraestructura' },
  web: { en: 'Web app', es: 'Web' },
  plataforma: { en: 'Platform', es: 'Plataforma' },
  documentos: { en: 'Documents', es: 'Documentos' },
  devtools: { en: 'Dev tools', es: 'Desarrollo' },
  seguridad: { en: 'Security', es: 'Seguridad' },
  integracion: { en: 'Integration', es: 'Integración' },
  monitorizacion: { en: 'Monitoring', es: 'Monitorización' },
  vision: { en: 'Vision', es: 'Visión' },
};

export const DEPARTMENT: Record<string, Localized> = {
  compras: { en: 'Purchasing', es: 'Compras' },
  produccion: { en: 'Production', es: 'Producción' },
  comercial: { en: 'Sales', es: 'Comercial' },
  stock: { en: 'Stock', es: 'Stock' },
  administracion: { en: 'Finance', es: 'Administración' },
  marketing: { en: 'Marketing', es: 'Marketing' },
  soporte: { en: 'Support', es: 'Soporte' },
  it: { en: 'IT', es: 'IT' },
  sistemas: { en: 'Systems', es: 'Sistemas' },
  direccion: { en: 'Management', es: 'Dirección' },
  producto: { en: 'Product', es: 'Producto' },
  todos: { en: 'Whole company', es: 'Toda la empresa' },
};

export const STATUS: Record<string, Localized> = {
  produccion: { en: 'In production', es: 'En producción' },
  prototipo: { en: 'Prototype', es: 'Prototipo' },
  parado: { en: 'Paused', es: 'En pausa' },
  mvp: { en: 'MVP', es: 'MVP' },
};

export const label = (map: Record<string, Localized>, key: string, lang: 'en' | 'es') => map[key]?.[lang] ?? key;

/** Small line icon per category (24×24, stroke = currentColor). */
const PATHS: Record<string, string> = {
  ia: 'M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z M5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6z',
  automatizacion: 'M12 8a4 4 0 100 8 4 4 0 000-8z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1',
  datos: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  bots: 'M4 5h16v11H9l-5 4z M9 10h.01 M15 10h.01',
  infra: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01',
  web: 'M3 5h18v14H3z M3 9h18 M7 7h.01',
  plataforma: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  documentos: 'M6 2h9l5 5v15H6z M15 2v5h5 M9 13h8 M9 17h6',
  devtools: 'M8 7l-5 5 5 5 M16 7l5 5-5 5 M14 4l-4 16',
  seguridad: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z M9 12l2 2 4-4',
  integracion: 'M7 7h4v4H7z M13 13h4v4h-4z M11 9h3a3 3 0 013 3v1 M9 11v3a3 3 0 003 3h1',
  monitorizacion: 'M2 12h4l3-8 4 16 3-8h6',
  vision: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 100 6 3 3 0 000-6z',
};

export function CategoryGlyph({ category, className = '' }: { category: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`cglyph ${className}`} aria-hidden="true">
      <path d={PATHS[category] ?? PATHS.plataforma} />
    </svg>
  );
}
