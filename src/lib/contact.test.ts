import { describe, expect, it } from 'vitest';
import { contactChannels, formatPhone, whatsappHref } from './contact';
import { edgePath } from './graph';
import { networkEdges, networkNodes } from '../data/network';

describe('contact channels', () => {
  it('skips empty placeholders and normalizes values', () => {
    const channels = contactChannels({ email: '', linkedin: '', github: 'https://github.com/x', telegram: '@nacho', whatsapp: '+34 600 00 00 00' });
    expect(channels.map((c) => c.id)).toEqual(['github', 'telegram', 'whatsapp']);
    expect(channels[1]!.href).toBe('https://t.me/nacho');
    expect(channels[2]!.href).toBe('https://wa.me/34600000000');
  });

  it('formats Spanish mobile numbers and builds a direct WhatsApp link', () => {
    expect(formatPhone('34624421503')).toBe('+34 624 42 15 03');
    expect(whatsappHref('+34 624 42 15 03', 'Hola')).toBe('https://wa.me/34624421503?text=Hola');
    expect(whatsappHref('34624421503')).toBe('https://wa.me/34624421503');
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
