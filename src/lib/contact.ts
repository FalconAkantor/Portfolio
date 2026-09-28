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
  if (whatsapp) channels.push({ id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${whatsapp}`, display: `+${whatsapp}`, external: true });
  return channels;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
