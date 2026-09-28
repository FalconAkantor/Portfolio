import { describe, expect, it } from 'vitest';
import { projects } from './projects';
import { stackCategories, tech } from './stack';
import { networkEdges, networkNodes } from './network';
import { sections } from './navigation';
import { ui } from '../i18n/ui';
import { LANGS } from '../i18n/types';

describe('content integrity', () => {
  it('projects have unique ids and pids', () => {
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length);
    expect(new Set(projects.map((p) => p.pid)).size).toBe(projects.length);
  });

  it('every localized project list has the same length in every language', () => {
    for (const p of projects) {
      const counts = LANGS.map((l) => p.built[l].length);
      expect(new Set(counts).size, p.id).toBe(1);
    }
  });

  it('projects only reference known technologies', () => {
    for (const p of projects) for (const id of p.stack) expect(tech[id], `${p.id} → ${id}`).toBeDefined();
    for (const c of stackCategories) for (const id of c.items) expect(tech[id], `${c.id} → ${id}`).toBeDefined();
  });

  it('network edges connect existing nodes', () => {
    const ids = new Set(networkNodes.map((n) => n.id));
    for (const e of networkEdges) {
      expect(ids.has(e.from)).toBe(true);
      expect(ids.has(e.to)).toBe(true);
    }
  });

  it('featured tools are listed first', () => {
    const firstRegular = projects.findIndex((p) => !p.featured);
    expect(projects.slice(firstRegular).some((p) => p.featured)).toBe(false);
  });

  it('section ids are unique', () => {
    expect(new Set(sections.map((s) => s.id)).size).toBe(sections.length);
  });

  it('hero readout conveys the five core capabilities in both languages', () => {
    for (const l of LANGS) expect(ui[l].hero.readout).toHaveLength(5);
  });
});
