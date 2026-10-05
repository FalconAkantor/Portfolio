/**
 * Builds the «All my projects» data from content/catalogo.md (the documented catalogue).
 *
 *   src/data/catalog/index.json            light list for the catalogue page (every project's card)
 *   src/data/catalog/projects/<slug>.json  full page data: sheet, prose (HTML), code, storyboard
 *   content/diagrams/<slug>.mmd            Mermaid sources (render-diagrams.mjs turns them into
 *                                          public/catalog/diagrams/<slug>.svg)
 *
 *   node scripts/build-catalog.mjs
 *
 * The markdown is trusted, own content, but raw HTML inside it is escaped anyway.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Marked } from 'marked';

const root = path.resolve(import.meta.dirname, '..');
const src = await readFile(path.join(root, 'content/catalogo.md'), 'utf8');
const outDir = path.join(root, 'src/data/catalog');
const diagramDir = path.join(root, 'content/diagrams');
const svgDir = path.join(root, 'public/catalog/diagrams');

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = new Marked({ gfm: true, breaks: false });
md.use({
  renderer: {
    html: (token) => escapeHtml(token.text),
    link: ({ href, text }) => `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${text}</a>`,
  },
});
const toHtml = (text) => md.parse(text.trim());

// ── meta, overview, ecosystem map ──────────────────────────────────
const meta = JSON.parse(/<!-- catalog:meta\s*(\{.*?\})\s*-->/s.exec(src)[1]);
const between = (from, to) => {
  const a = src.indexOf(from);
  const b = src.indexOf(to, a + from.length);
  return src.slice(a + from.length, b);
};
const overview = between('## Visión general', '## Mapa del ecosistema');
const ecosystem = /```mermaid\s*\n([\s\S]*?)\n```/.exec(between('## Mapa del ecosistema', '## Índice'))[1];

// ── projects ───────────────────────────────────────────────────────
const SPECIAL = new Set(['Diagrama', 'Código', 'Animación']);
const blocks = [...src.matchAll(/<!-- project:begin slug="([^"]+)" -->([\s\S]*?)<!-- project:end -->/g)];
const projects = [];
for (const [, slug, body] of blocks) {
  const ficha = JSON.parse(/```json ficha\s*\n([\s\S]*?)\n```/.exec(body)[1]);
  const anim = JSON.parse(/```json animacion\s*\n([\s\S]*?)\n```/.exec(body)[1]);
  const diagram = /```mermaid\s*\n([\s\S]*?)\n```/.exec(body)?.[1] ?? null;
  const code = [...body.matchAll(/```(\w+)\s+title="([^"]*)"\s*\n([\s\S]*?)\n```/g)].map(([, lang, title, text]) => ({
    lang,
    title: title.replace(/^\d+\s*[—–-]\s*/, ''),
    code: text.replace(/\s+$/, ''),
  }));

  // Prose: every ### section except the ones rendered as diagram, code or animation.
  const afterFicha = body.slice(body.indexOf('```', body.indexOf('```json ficha') + 3) + 3);
  const parts = afterFicha.split(/^### /m).slice(1);
  const sections = [];
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const title = part.slice(0, nl).trim();
    if (SPECIAL.has(title)) continue;
    const text = part.slice(nl + 1).replace(/```(json ficha|json animacion|mermaid)[\s\S]*?```/g, '').trim();
    if (text) sections.push({ title, html: toHtml(text) });
  }

  const words = sections.reduce((n, s) => n + s.html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length, 0);
  projects.push({ slug, ficha, anim, diagram, code, sections, words });
}

// ── write ──────────────────────────────────────────────────────────
await rm(outDir, { recursive: true, force: true });
await mkdir(path.join(outDir, 'projects'), { recursive: true });
await mkdir(diagramDir, { recursive: true });
await mkdir(svgDir, { recursive: true });

// Stack ids the site knows (src/data/stack.ts); anything else becomes a plain label.
const known = new Set([...(await readFile(path.join(root, 'src/data/stack.ts'), 'utf8')).matchAll(/^ {2}([a-zA-Z]+): \{/gm)].map((m) => m[1]));
const ALIAS = { node: 'nodejs' };
const LABEL = { chartjs: 'Chart.js', css: 'CSS', gemma: 'Gemma', html: 'HTML', javascript: 'JavaScript', jinja: 'Jinja2', proxy: 'Proxy inverso', scraping: 'Scraping', sse: 'Server-Sent Events' };
for (const p of projects) {
  const f = p.ficha;
  const ids = (f.stack ?? []).map((id) => ALIAS[id] ?? id);
  f.stack = [...new Set(ids.filter((id) => known.has(id)))];
  f.stackOther = [...new Set([...ids.filter((id) => !known.has(id)).map((id) => LABEL[id] ?? id), ...(f.stackOther ?? [])])];
}

const pick = (f) => ({
  slug: f.slug,
  name: f.name,
  kind: f.kind,
  parent: f.parent ?? null,
  tools: f.tools ?? [],
  category: f.category,
  department: f.department ?? [],
  status: f.status,
  lifecycle: f.lifecycle,
  tagline: f.tagline,
  summary: f.summary,
  stack: f.stack ?? [],
  featured: Boolean(f.featured),
  impressiveness: f.impressiveness ?? 0,
  ai: Boolean(f.ai?.used),
});

const order = new Map(projects.map((p, i) => [p.slug, i]));
const index = {
  generated: meta.generated,
  totals: meta.totals,
  suites: meta.suites.map((s) => ({ slug: s.slug, name: s.name, tools: s.tools })),
  featured: meta.featured.filter((s) => order.has(s)),
  overviewHtml: toHtml(overview),
  // Storyboards of the featured projects, for the animated previews on the catalogue page.
  stories: Object.fromEntries(projects.filter((p) => meta.featured.includes(p.slug)).map((p) => [p.slug, p.anim])),
  projects: projects.map((p) => ({ ...pick(p.ficha), minutes: Math.max(1, Math.round(p.words / 220)) })),
};
await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index));
// Tiny summary for links from the home pages (so they never load the whole index).
await writeFile(path.join(outDir, 'summary.json'), JSON.stringify({ projects: projects.length, suites: meta.suites.length }) + '\n');

for (const p of projects) {
  const page = {
    ficha: p.ficha,
    sections: p.sections,
    code: p.code,
    anim: p.anim,
    diagram: p.diagram ? `${p.slug}.svg` : null,
    minutes: Math.max(1, Math.round(p.words / 220)),
  };
  await writeFile(path.join(outDir, 'projects', `${p.slug}.json`), JSON.stringify(page));
  if (p.diagram) await writeFile(path.join(diagramDir, `${p.slug}.mmd`), p.diagram + '\n');
}
await writeFile(path.join(diagramDir, '_ecosystem.mmd'), ecosystem + '\n');

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`  ${projects.length} projects · index ${kb(JSON.stringify(index).length)} · featured ${index.featured.length}`);
