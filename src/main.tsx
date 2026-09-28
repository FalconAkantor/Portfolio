import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { isLang } from './i18n/types';
import { routeFromPath } from './i18n/routing';
import { isMode } from './lib/mode';
import { boot } from './lib/boot';
import { startCursorLight } from './lib/cursorLight';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

// Prerendered pages carry their language and version on <html>; the dev server derives them from the URL.
const html = document.documentElement;
const route = routeFromPath(window.location.pathname);
const prerendered = container.hasChildNodes();
const lang = prerendered && isLang(html.lang) ? html.lang : route.lang;
const mode = prerendered && isMode(html.dataset.mode) ? html.dataset.mode : route.mode;
html.lang = lang;
html.dataset.mode = mode;

const app = <App lang={lang} mode={mode} />;

// Production pages are prerendered → hydrate. The dev server serves an empty shell → render.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);

if (html.classList.contains('booting')) boot.start();
if (mode === 'tech') startCursorLight();
