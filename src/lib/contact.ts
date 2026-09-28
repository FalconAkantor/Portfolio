import { site, type ContactConfig } from '../config/site';

export interface ContactChannel {
  id: keyof ContactConfig;
  label: string;
  href: string;
  display: string;
  external: boolean;
}

/** Channels with a configured value, in display order. Empty placeholders are skipped. */
export function contactChannels(contact: ContactConfig = site.contact): ContactChannel[] {
  const channels: ContactChannel[] = [];
  const email = contact.email.trim();
  const linkedin = contact.linkedin.trim();
  const github = contact.github.trim();
  const telegram = contact.telegram.trim().replace(/^@/, '');
  const whatsapp = contact.whatsapp.replace(/\D/g, '');

  if (email) channels.push({ id: 'email', label: 'Email', href: `mailto:${email}`, display: email, external: false });
  if (linkedin) channels.push({ id: 'linkedin', label: 'LinkedIn', href: linkedin, display: stripProtocol(linkedin), external: true });
  if (github) channels.push({ id: 'github', label: 'GitHub', href: github, display: stripProtocol(github), external: true });
  if (telegram) channels.push({ id: 'telegram', label: 'Telegram', href: `https://t.me/${telegram}`, display: `@${telegram}`, external: true });
  if (whatsapp) channels.push({ id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${whatsapp}`, display: formatPhone(whatsapp), external: true });
  return channels;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/** "34624421503" → "+34 624 42 15 03" (Spanish grouping; other numbers get simple grouping). */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '');
  const m = /^34(\d{3})(\d{2})(\d{2})(\d{2})$/.exec(d);
  if (m) return `+34 ${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  return `+${d.replace(/(\d{2,3})(?=(\d{3})+$)/g, '$1 ')}`;
}

/** Direct WhatsApp link (app on phones, WhatsApp Web on desktop) with an optional greeting. */
export function whatsappHref(digits: string, text = ''): string {
  const d = digits.replace(/\D/g, '');
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
