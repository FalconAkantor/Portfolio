import { describe, expect, it } from 'vitest';
import { complete, runCommand, tokenize, type TermContext } from './engine';
import { ui } from '../../i18n/ui';
import { projects } from '../../data/projects';

const ctx = (overrides: Partial<TermContext> = {}): TermContext => ({
  lang: 'en',
  l: (v) => v.en,
  t: ui.en,
  history: [],
  sessionStart: 0,
  now: new Date(2026, 0, 1, 12, 0, 0),
  ...overrides,
});

describe('terminal engine', () => {
  it('tokenizes and ignores extra whitespace', () => {
    expect(tokenize('  open   cctv  ')).toEqual(['open', 'cctv']);
    expect(runCommand('   ', ctx())).toEqual({ lines: [], effects: [] });
  });

  it('lists every command in help', () => {
    const { lines } = runCommand('help', ctx());
    for (const name of Object.keys(ui.en.terminal.commands)) {
      expect(lines.some((l) => l.text === name)).toBe(true);
    }
  });

  it('lists all projects in order with clickable open commands', () => {
    const { lines } = runCommand('projects', ctx());
    const rows = lines.filter((l) => l.command?.startsWith('open '));
    expect(rows).toHaveLength(projects.length);
    expect(rows[0]!.text).toBe('01 / AGENT WORKSPACE');
    expect(rows.map((r) => r.command)).toEqual(projects.map((p) => `open ${p.id}`));
  });

  it('opens projects by number, id and prefix', () => {
    expect(runCommand('open 2', ctx()).effects).toEqual([{ type: 'open-project', id: 'inventory-ai' }]);
    expect(runCommand('open rag', ctx()).effects).toEqual([{ type: 'open-project', id: 'rag' }]);
    expect(runCommand('open gpu', ctx()).effects).toEqual([{ type: 'open-project', id: 'gpu-lab' }]);
    expect(runCommand('open nope', ctx()).lines[0]!.tone).toBe('error');
    expect(runCommand('open', ctx()).lines[0]!.tone).toBe('error');
  });

  it('navigates with goto and its aliases', () => {
    expect(runCommand('goto contact', ctx()).effects).toEqual([{ type: 'navigate', section: 'contact' }]);
    expect(runCommand('cd ~/system/projects/', ctx()).effects).toEqual([{ type: 'navigate', section: 'projects' }]);
    expect(runCommand('goto about', ctx()).effects).toEqual([{ type: 'navigate', section: 'about' }]);
    expect(runCommand('goto nowhere', ctx()).effects).toEqual([]);
  });

  it('informational commands do not move the page by themselves', () => {
    for (const cmd of ['about', 'ai', 'automation', 'infrastructure', 'vision', 'stack', 'contact']) {
      const { effects, lines } = runCommand(cmd, ctx());
      expect(effects).toEqual([]);
      expect(lines.some((l) => /^(goto|open) /.test(l.command ?? ''))).toBe(true);
    }
  });

  it('filters stack by category and rejects unknown ones', () => {
    const { lines } = runCommand('stack vision', ctx());
    expect(lines[0]!.text).toBe('Computer Vision');
    expect(runCommand('stack cooking', ctx()).lines[0]!.tone).toBe('error');
  });

  it('handles lang, clear, reboot, sudo and unknown commands', () => {
    expect(runCommand('lang es', ctx()).effects).toEqual([{ type: 'lang', lang: 'es' }]);
    expect(runCommand('lang fr', ctx()).effects).toEqual([]);
    expect(runCommand('clear', ctx()).effects).toEqual([{ type: 'clear' }]);
    expect(runCommand('reboot', ctx()).effects).toEqual([{ type: 'reboot' }]);
    expect(runCommand('sudo rm -rf /', ctx()).lines[0]!.tone).toBe('error');
    expect(runCommand('Frobnicate', ctx()).lines[0]!.text).toContain('Frobnicate');
  });

  it('localizes output', () => {
    expect(runCommand('projects', ctx({ lang: 'es', t: ui.es })).lines[0]!.text).toBe('PROYECTOS ENCONTRADOS:');
    expect(runCommand('brand', ctx({ lang: 'es', l: (v) => v.es, t: ui.es })).lines[0]!.text).toContain('Razonamiento');
  });

  it('reports uptime from the session start', () => {
    const { lines } = runCommand('uptime', ctx({ sessionStart: 0, now: new Date(3_723_000) }));
    expect(lines[0]!.text).toContain('01:02:03');
  });

  it('completes commands and arguments', () => {
    expect(complete('pro')).toEqual(['projects']);
    expect(complete('open c')).toEqual(['open cctv']);
    expect(complete('goto ')).toContain('goto contact');
    expect(complete('lang e')).toEqual(['lang en', 'lang es']);
  });
});
