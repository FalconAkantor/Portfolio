import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { isLang } from './i18n/types';
import { langFromPath } from './i18n/routing';
import { boot } from './lib/boot';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

const htmlLang = document.documentElement.lang;
const lang = isLang(htmlLang) && container.hasChildNodes() ? htmlLang : langFromPath(window.location.pathname);
document.documentElement.lang = lang;

const app = <App lang={lang} />;

// Production pages are prerendered → hydrate. The dev server serves an empty shell → render.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);

if (document.documentElement.classList.contains('booting')) boot.start();
