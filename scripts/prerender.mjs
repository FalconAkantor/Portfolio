/**
 * Build step 3/3 — static prerender + SEO files.
 *
 *   dist/index.html      English page (fully rendered HTML, hydrated by React)
 *   dist/es/index.html   Spanish page
 *   dist/404.html        "process not found" page for GitHub Pages
 *   dist/sitemap.xml     both languages, with hreflang alternates
 *   dist/robots.txt
 *
 * Environment:
 *   SITE_URL   public origin + path, e.g. https://user.github.io/Portfolio (set by the Pages workflow)
 *   BASE_PATH  same base as vite.config.ts
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const { render, seo } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

const base = normalizeBase(process.env.BASE_PATH ?? '/Portfolio/');
const siteUrl = (process.env.SITE_URL?.trim() || seo.site.siteUrl).replace(/\/+$/, '');
const pageUrl = (lang) => (lang === seo.defaultLang ? `${siteUrl}/` : `${siteUrl}/${lang}/`);
const ogLocale = { en: 'en_US', es: 'es_ES' };

function normalizeBase(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

const esc = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('index.html is missing the <!--app-html--> marker');

// Preload the Latin subset of the display face: it paints the hero headline (the LCP element).
const assets = await readdir(path.join(dist, 'assets'));
const displayFont = assets.find((f) => /^archivo-latin-wdth-normal.*\.woff2$/.test(f));
const monoFont = assets.find((f) => /^ibm-plex-mono-latin-400-normal.*\.woff2$/.test(f));
const preloads = [displayFont, monoFont]
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="${base}assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ');

function head(lang) {
  const meta = seo.meta[lang];
  const url = pageUrl(lang);
  const image = `${siteUrl}/og-image.png`;
  const alternates = seo.langs
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${pageUrl(l)}" />`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${pageUrl(seo.defaultLang)}" />`)
    .join('\n    ');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: seo.site.shortName,
    alternateName: seo.site.handle,
    description: seo.site.role[lang],
    brand: { '@type': 'Brand', name: seo.site.brand.name, slogan: seo.site.brand.claim[lang] },
    ...(seo.site.contact.email ? { email: `mailto:${seo.site.contact.email}` } : {}),
    url,
    ...(seo.sameAs.length ? { sameAs: seo.sameAs } : {}),
    knowsAbout: seo.knowsAbout,
  };

  return `<title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}" />
    <meta name="author" content="${esc(`${seo.site.shortName} · ${seo.site.brand.name}`)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />
    ${alternates}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(seo.site.systemName)}" />
    <meta property="og:title" content="${esc(meta.title)}" />
    <meta property="og:description" content="${esc(meta.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:locale" content="${ogLocale[lang]}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(meta.ogAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(meta.title)}" />
    <meta name="twitter:description" content="${esc(meta.description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${esc(meta.ogAlt)}" />
    ${preloads}
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
}

function page(lang) {
  const html = template
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/<!--head:start-->[\s\S]*?<!--head:end-->/, head(lang))
    .replace('<!--app-html-->', render(lang));
  if (html.includes('<!--head:start-->')) throw new Error('head markers were not replaced');
  return html;
}

for (const lang of seo.langs) {
  const dir = lang === seo.defaultLang ? dist : path.join(dist, lang);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), page(lang));
  console.log(`  prerendered ${path.relative(root, path.join(dir, 'index.html'))}`);
}

// 404 — a tiny static page in the same visual language; no JS needed.
await writeFile(
  path.join(dist, '404.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>404 · process not found · ${esc(seo.site.systemName)}</title>
    <link rel="icon" href="${base}favicon.svg" type="image/svg+xml" />
    <style>
      html,body{margin:0;height:100%;background:#05070a;color:#d9dfe5;font:14px/1.7 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
      main{min-height:100%;display:grid;place-content:center;padding:24px}
      .a{color:#f2a93b}.d{color:#8d99a6}.e{color:#ef5b4c}
      a{color:#5cc8d6}
    </style>
  </head>
  <body>
    <main>
      <p><span class="a">visitor@automariza</span><span class="d">:~$</span> cd <span id="p"></span></p>
      <p class="e">404 · process not found</p>
      <p class="d">The page you asked for is not running on this system.</p>
      <p><a href="${base}">cd ~ — back to ${esc(seo.site.systemName)}</a> · <a href="${base}es/">versión en español</a></p>
    </main>
    <script>document.getElementById('p').textContent = location.pathname;</script>
  </body>
</html>
`,
);

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${seo.langs
  .map(
    (lang) => `  <url>
    <loc>${pageUrl(lang)}</loc>
    <lastmod>${today}</lastmod>
${seo.langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${pageUrl(l)}" />`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(seo.defaultLang)}" />
  </url>`,
  )
  .join('\n')}
</urlset>
`;
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await rm(ssrDir, { recursive: true, force: true });

console.log(`  sitemap.xml, robots.txt, 404.html → ${siteUrl}`);
if (seo.missingContact.length) {
  console.warn(`\n  ⚠ contact placeholders not configured in src/config/site.ts: ${seo.missingContact.join(', ')}`);
  console.warn('    Empty channels are hidden on the site. Fill them in when ready.\n');
}
