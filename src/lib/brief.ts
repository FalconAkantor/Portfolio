import type { UIStrings } from '../i18n/ui';
import { hashString } from './random';

export type BriefType = keyof UIStrings['contact']['types'];

export interface Brief {
  types: BriefType[];
  process: string;
  company: string;
  name: string;
}

/** Short, stable request id derived from the content — handy as an e-mail subject reference. */
export function briefId(brief: Brief): string {
  const h = hashString(`${brief.types.join(',')}|${brief.process}|${brief.company}|${brief.name}`);
  return `REQ-${h.toString(16).slice(0, 6).toUpperCase().padStart(6, '0')}`;
}

/** Plain-text request, used for the preview, the clipboard and the mailto body. */
export function formatBrief(brief: Brief, t: UIStrings['contact']): string {
  const f = t.ticketFields;
  const pad = (label: string) => `${label}:`.padEnd(10, ' ');
  const orNone = (v: string) => v.trim() || t.notSpecified;
  const types = brief.types.length ? brief.types.map((k) => t.types[k]).join(', ') : t.notSpecified;
  return [
    `# ${t.subject.toUpperCase()} · ${briefId(brief)}`,
    '',
    `${pad(f.type)}${types}`,
    `${pad(f.company)}${orNone(brief.company)}`,
    `${pad(f.from)}${orNone(brief.name)}`,
    '',
    `${f.process}:`,
    orNone(brief.process),
  ].join('\n');
}

export function mailtoHref(email: string, brief: Brief, t: UIStrings['contact']): string {
  const subject = `${t.subject} · ${briefId(brief)}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formatBrief(brief, t))}`;
}
