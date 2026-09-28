import { describe, expect, it } from 'vitest';
import { briefId, formatBrief, mailtoHref } from './brief';
import { contactChannels } from './contact';
import { edgePath } from './graph';
import { ui } from '../i18n/ui';
import { networkEdges, networkNodes } from '../data/network';

const brief = { types: ['orders', 'data'] as const, process: 'Copy orders into the ERP', company: 'ACME', name: '' };

describe('automation request', () => {
  it('formats a readable request and marks empty fields', () => {
    const text = formatBrief({ ...brief, types: [...brief.types] }, ui.en.contact);
    expect(text).toContain('Orders & email, ERP & databases');
    expect(text).toContain('Copy orders into the ERP');
    expect(text).toContain('ACME');
    expect(text).toContain('not specified');
  });

  it('derives a stable id from the content', () => {
    const a = briefId({ ...brief, types: [...brief.types] });
    expect(a).toMatch(/^REQ-[0-9A-F]{6}$/);
    expect(briefId({ ...brief, types: [...brief.types] })).toBe(a);
    expect(briefId({ ...brief, types: [...brief.types], process: 'other' })).not.toBe(a);
  });

  it('encodes the mailto link', () => {
    const href = mailtoHref('hello@example.com', { ...brief, types: [...brief.types] }, ui.en.contact);
    expect(href.startsWith('mailto:hello@example.com?subject=')).toBe(true);
    expect(href).not.toContain(' ');
  });
});

describe('contact channels', () => {
  it('skips empty placeholders and normalizes values', () => {
    const channels = contactChannels({ email: '', linkedin: '', github: 'https://github.com/x', telegram: '@nacho', whatsapp: '+34 600 00 00 00' });
    expect(channels.map((c) => c.id)).toEqual(['github', 'telegram', 'whatsapp']);
    expect(channels[1]!.href).toBe('https://t.me/nacho');
    expect(channels[2]!.href).toBe('https://wa.me/34600000000');
  });
});

describe('integration graph geometry', () => {
  it('produces a valid cubic path for every edge in both layouts', () => {
    const byId = new Map(networkNodes.map((n) => [n.id, n]));
    for (const layout of ['wide', 'tall'] as const) {
      for (const e of networkEdges) {
        const d = edgePath(e, byId.get(e.from)!, byId.get(e.to)!, layout);
        expect(d).toMatch(/^M-?[\d.]+,-?[\d.]+ C/);
        expect(d).not.toContain('NaN');
      }
    }
  });
});
