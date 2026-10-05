/**
 * Builds the «All my projects» data from content/catalogo.md (the documented catalogue).
 *
 *   src/data/catalog/index.json            light list for the catalogue page (every project's card)
 *   src/data/catalog/projects/<slug>.json  full page data: sheet, prose (HTML), code
 *   content/diagrams/<slug>.mmd            Mermaid sources (render-diagrams.mjs renders them into
 *                                          each project's JSON as diagramSvg)
 *
 * Project names are written in Spanish in the catalogue; their English names live in
 * content/catalog-names.en.json. The storyboards («json animacion») stay in the markdown as
 * the script for future videos and are not published.
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
const namesEn = JSON.parse(await readFile(path.join(root, 'content/catalog-names.en.json'), 'utf8'));
const termsEn = JSON.parse(await readFile(path.join(root, 'content/catalog-terms.en.json'), 'utf8'));

// The sheets write triggers, integrations, extra technologies and AI models in Spanish only.
const DAYS = { lunes: 'Monday', martes: 'Tuesday', miércoles: 'Wednesday', jueves: 'Thursday', viernes: 'Friday', sábado: 'Saturday', domingo: 'Sunday' };
const untranslated = new Set();
function triggerEn(s) {
  if (termsEn.triggers[s]) return termsEn.triggers[s];
  let m;
  if ((m = /^cada (\d+) (s|min|h)$/.exec(s))) return `every ${m[1]} ${m[2]}`;
  if ((m = /^cada (\d+) días$/.exec(s))) return `every ${m[1]} days`;
  if ((m = /^(?:a las )?(\d\d:\d\d)$/.exec(s))) return `at ${m[1]}`;
  if ((m = /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo) (?:a las )?(\d\d:\d\d)$/.exec(s))) return `${DAYS[m[1]]} at ${m[2]}`;
  untranslated.add(s);
  return s;
}
const term = (s) => ({ es: s, en: termsEn.terms[s] ?? s });

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = new Marked({ gfm: true, breaks: false });
md.use({
  renderer: {
    html: (token) => escapeHtml(token.text),
    link: ({ href, text }) => `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${text}</a>`,
  },
});
const toHtml = (text) => md.parse(text.trim());

// ── meta, overview ─────────────────────────────────────────────────
const meta = JSON.parse(/<!-- catalog:meta\s*(\{.*?\})\s*-->/s.exec(src)[1]);
const between = (from, to) => {
  const a = src.indexOf(from);
  const b = src.indexOf(to, a + from.length);
  return src.slice(a + from.length, b);
};
const overview = between('## Visión general', '## Mapa del ecosistema');

// ── projects ───────────────────────────────────────────────────────
const SPECIAL = new Set(['Diagrama', 'Código', 'Animación']);
const blocks = [...src.matchAll(/<!-- project:begin slug="([^"]+)" -->([\s\S]*?)<!-- project:end -->/g)];
const projects = [];
for (const [, slug, body] of blocks) {
  const ficha = JSON.parse(/```json ficha\s*\n([\s\S]*?)\n```/.exec(body)[1]);
  if (!namesEn[slug]) console.warn(`  ! ${slug}: no English name in content/catalog-names.en.json`);
  ficha.name = { es: ficha.name, en: namesEn[slug] ?? ficha.name };
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
  projects.push({ slug, ficha, diagram, code, sections, words });
}

// ── write ──────────────────────────────────────────────────────────
await rm(outDir, { recursive: true, force: true });
await mkdir(path.join(outDir, 'projects'), { recursive: true });
await rm(diagramDir, { recursive: true, force: true });
await mkdir(diagramDir, { recursive: true });

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

// Spanish-only lists of the sheet → { es, en } for the page; the catalogue card keeps the
// Spanish integrations, which it only uses for search.
const localize = (f) => ({
  ...f,
  automations: (f.automations ?? []).map((a) => ({ ...a, trigger: { es: a.trigger, en: triggerEn(a.trigger) } })),
  integrations: (f.integrations ?? []).map(term),
  stackOther: (f.stackOther ?? []).map(term),
  ...(f.ai ? { ai: { ...f.ai, models: (f.ai.models ?? []).map(term) } } : {}),
});

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
  // Only the suites need their summary on the catalogue page (as the area's introduction).
  ...(f.kind === 'suite' ? { summary: f.summary } : {}),
  stack: f.stack ?? [],
  // Searched, never shown on the catalogue page.
  integrations: f.integrations ?? [],
  featured: Boolean(f.featured),
  ai: Boolean(f.ai?.used),
  aiLocal: Boolean(f.ai?.used && f.ai?.local),
});

const order = new Map(projects.map((p, i) => [p.slug, i]));
const bySlug = new Map(projects.map((p) => [p.slug, p]));
const featured = meta.featured.filter((s) => order.has(s));
const index = {
  generated: meta.generated,
  totals: meta.totals,
  suites: meta.suites.map((s) => ({ slug: s.slug, name: bySlug.get(s.slug)?.ficha.name ?? { es: s.name, en: s.name }, tools: s.tools })),
  featured,
  overviewHtml: toHtml(overview),
  projects: projects.map((p) => ({
    ...pick(p.ficha),
    minutes: Math.max(1, Math.round(p.words / 220)),
    // The featured cards draw their «how it works» as a tiny flow: only the step titles.
    ...(featured.includes(p.slug) ? { steps: (p.ficha.howItWorks ?? []).map((s) => s.title) } : {}),
  })),
};
await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index));
// Tiny summary for links from the home pages (so they never load the whole index).
const tools = projects.filter((p) => p.ficha.kind !== 'suite').length;
await writeFile(path.join(outDir, 'summary.json'), JSON.stringify({ projects: projects.length, tools, suites: meta.suites.length }) + '\n');

for (const p of projects) {
  const page = {
    ficha: localize(p.ficha),
    sections: p.sections,
    code: p.code,
    minutes: Math.max(1, Math.round(p.words / 220)),
  };
  await writeFile(path.join(outDir, 'projects', `${p.slug}.json`), JSON.stringify(page));
  if (p.diagram) await writeFile(path.join(diagramDir, `${p.slug}.mmd`), p.diagram + '\n');
}

if (untranslated.size) console.warn(`  ! triggers without English: ${[...untranslated].join(' | ')}`);
const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`  ${projects.length} projects · index ${kb(JSON.stringify(index).length)} · featured ${index.featured.length}`);
