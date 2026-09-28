# AUTOMARIZA

Portfolio de **Nacho · AUTOMARIZA**: IA, automatización, sistemas e infraestructura.

> **La R es de Razonamiento.** Automatizar sin pensar solo consigue que los errores ocurran más rápido; cada sistema de AUTOMARIZA razona antes de actuar.

Contacto: **nacho.automariza@gmail.com** · WhatsApp **+34 624 42 15 03** (solo mensajes)

La web tiene **dos versiones**, para todos los públicos. En la primera visita pregunta cuál prefieres, y en la esquina superior derecha se cambia en cualquier momento:

- **⚡ Tech**: la web se presenta como un sistema operativo. Arranca con una secuencia de boot, se navega con un árbol de ficheros, los proyectos se inspeccionan como procesos y tiene una terminal que funciona.
- **Sencilla**: qué hago, cómo trabajo, ejemplos reales y contacto. Sin tecnicismos. Cada ejemplo tiene un enlace *Verlo por dentro* que abre ese proyecto en la versión tech.

| | Tech | Sencilla |
| --- | --- | --- |
| **EN** | `https://falconakantor.github.io/Portfolio/` | `…/Portfolio/lite/` |
| **ES** | `…/Portfolio/es/` | `…/Portfolio/es/lite/` |

La elección se guarda en el navegador (`automariza:mode`). Si alguien eligió la sencilla, al volver a la raíz se le lleva a ella. Nunca se redirige de la sencilla a la tech, así que un enlace a `/lite/` siempre abre la sencilla.

---

## Qué contiene

| Módulo | Qué hace |
| --- | --- |
| `boot` | Arranque tipo terminal (solo en la primera visita; se salta con cualquier tecla), titular, comprobación de capacidades y terminal interactiva |
| `projects/` | Los 5 MVP. En escritorio, tabla + inspector; en móvil y tablet, tarjetas desplegables que se abren en su sitio y se desplazan solas. Cada uno con su visual propio (réplica interactiva del Agent Workspace, consola interactiva del CCTV autónomo —escena nocturna en vivo, sesión de evento, análisis de la IA, topics de Telegram, línea de tiempo de 24 h e investigación en lenguaje natural—, render de estantería, recorrido RAG, rack), ficha, pipeline, qué se construyó y traza |
| *guía en vivo* | Dentro de cada proyecto, un reproductor «Cómo funciona, paso a paso y en vivo»: avanza solo (o paso a paso), explica qué está pasando, qué entra y qué sale, y enseña el fragmento de código que lo hace, marcado como *extracto simplificado del código real* o *boceto ilustrativo*. Contenido en `src/data/guides.ts`, que se carga aparte para no pesar en la primera carga |
| `network` | Mapa de integración animado (email, WhatsApp, cámaras, ERP, BD…) con nodos seleccionables |
| `automation/` | El mismo proceso manual vs. automatizado y los procesos que convierto en sistemas |
| `stack` | Tecnologías agrupadas por propósito, con logo, y un mapa de dos direcciones: señalas un proyecto y se iluminan sus tecnologías; eliges una tecnología y se iluminan los proyectos que la usan |
| `about` | Perfil, principios y ciclo idea → producción |
| `contact` | Email y WhatsApp directos (solo mensajes, sin llamadas). Sin formularios. La página termina «firmada»: la R de AUTOMARIZA se dibuja sola |

**Terminal:** `help`, `brand`, `projects`, `open <n|id>`, `stack [categoría]`, `ai`, `automation`, `infrastructure`, `vision`, `contact`, `goto <sección>`, `ls`, `whoami`, `date`, `uptime`, `history`, `lang <en|es>`, `snap`, `reboot`, `clear`. Tiene autocompletado con Tab e historial con ↑/↓. Se abre desde cualquier punto con `Ctrl/⌘ + K` o con `` ` ``.

**Efectos de la versión tech:**
- **Titular tecleado:** «Construyo / sistemas / que piensan.» se escribe tecla a tecla, con el cursor avanzando. Es CSS puro, funciona en el HTML prerenderizado y espera a que se cierre el selector o el boot. Una vez escrito, cada pocos segundos (y al pasar el ratón) el titular se «rasga» como si saltara a otro universo: copias en cian y rojo desplazadas por franjas.
- **El chasquido (polvo):** `src/lib/snap.ts` es un motor propio de desintegración. Repinta los elementos en un canvas leyendo sus estilos (cajas, bordes, texto, imágenes), los sustituye por esa copia y la deshace en partículas que se lleva el viento, en barrido y a grumos. También funciona al revés (el polvo vuelve y lo reconstruye). Se usa en:
  - el cierre del **boot** (el log se convierte en polvo);
  - **Manual → Automatizado**: el trabajo hecho por personas se desintegra y entra el sistema;
  - el paso de **tech → sencilla**: la pantalla entera se deshace antes de cambiar;
  - el comando **`snap`** de la terminal: medio sistema desaparece y, tras unos segundos, vuelve.
- **Luz bajo el ratón:** con ratón, un foco suave ilumina la cuadrícula del fondo y el borde del panel que tienes debajo (`src/lib/cursorLight.ts`, sin tocar variables globales para no recalcular toda la página en cada frame).
- **Grano de película:** una textura muy fina sobre todo, para que el negro no sea plano y los degradados no hagan bandas.
- Con `prefers-reduced-motion` no hay tecleo, grietas, polvo ni foco: todo aparece directamente.

**Versión sencilla:** en la portada, un móvil reproduce una conversación de ejemplo del sistema de stock por foto (foto del expositor → productos contados → lista de reposición al día siguiente), marcada como ilustrativa. Los iconos de los servicios se dibujan solos al pasar el ratón.

---

## Configurar tus datos (un único archivo)

Todo lo personal está en **`src/config/site.ts`**: la marca (`brand`: nombre, letra destacada, significado, lema e historia) y el contacto:

```ts
contact: {
  email: 'nacho.automariza@gmail.com',
  linkedin: '',  // TODO: https://www.linkedin.com/in/…
  github: 'https://github.com/FalconAkantor',
  telegram: '',  // TODO: usuario sin @
  whatsapp: '34624421503', // solo mensajes, sin llamadas
},
```

Los canales vacíos **no se muestran** en la web. El build avisa de los que faltan por rellenar. Nada de esto se inventa: si está vacío, es que aún no se ha proporcionado.

## Editar contenido

Los datos están separados de los componentes:

| Archivo | Contenido |
| --- | --- |
| `src/data/projects.ts` | Proyectos: ficha, visual, problema, solución, suite de agentes, pipeline, qué se construyó, stack, traza |
| `src/data/stack.ts` | Catálogo de tecnologías (IDs tipados) y categorías |
| `src/data/automation.ts` | Flujos de automatización |
| `src/data/infrastructure.ts` | Hardware del rack y señales de monitorización |
| `src/data/ai.ts` | Preguntas y etapas del recorrido RAG |
| `src/data/network.ts` | Nodos y conexiones del mapa de integración (layout de escritorio y de móvil) |
| `src/data/manifesto.ts` | Ciclo de vida y proceso manual vs. automatizado |
| `src/data/guides.ts` | Guías en vivo: pasos, explicación, entrada/salida y código de cada proyecto |
| `src/data/lite.ts` | Versión sencilla: servicios, pasos y ejemplos (enlazados a los proyectos) |
| `src/i18n/ui.ts` | Todos los textos de la interfaz en EN y ES (incluido el selector y la versión sencilla) |

Todo el contenido es bilingüe (`{ en, es }`). El diccionario español se comprueba con TypeScript contra el inglés, así que si falta una traducción el build falla. Los proyectos solo pueden referenciar tecnologías que existan en `stack.ts`; si no, también falla.

---

## Desarrollo

Requisitos: Node 20.19+ (recomendado 22, ver `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173/Portfolio/
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # Vitest
npm run build      # typecheck + build + prerender → dist/
npm run preview    # sirve dist/ en http://localhost:4173/Portfolio/
```

Para volver a ver la secuencia de arranque: escribe `reboot` en la terminal, o borra `automariza:booted` de localStorage. Para volver a ver el selector tech/sencilla, borra `automariza:mode`.

---

## Despliegue (automático)

```
git push → GitHub Actions → npm ci → lint · test → build + prerender → GitHub Pages
```

- `.github/workflows/deploy.yml` se ejecuta en cada push a `main`/`master`, y también a mano (*Run workflow*).
- `.github/workflows/ci.yml` pasa lint, tests y build en el resto de ramas y en los pull requests.

**Configuración única en GitHub (una sola vez):**
1. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
2. Llevar el código a `main` (merge de la rama de trabajo). Cada push posterior se despliega solo.

El workflow calcula automáticamente la ruta base (`BASE_PATH`) y la URL pública (`SITE_URL`) con `actions/configure-pages`. Con un dominio propio (o un repo `<usuario>.github.io`), canonical, sitemap y Open Graph se ajustan sin tocar código.

---

## Arquitectura

```
src/
├── config/site.ts          ← datos personales y de contacto
├── i18n/                   ← tipos, contexto, rutas (idioma × versión), diccionario EN/ES
├── data/                   ← todo el contenido (sin JSX)
├── lib/
│   ├── terminal/engine.ts  ← intérprete de la terminal (puro, testeado)
│   ├── boot.ts             ← controlador de la secuencia de arranque
│   ├── graph.ts            ← geometría del mapa de integración
│   ├── mode.tsx            ← versión activa (tech / sencilla)
│   ├── snap.ts             ← motor de desintegración en polvo (canvas)
│   ├── cursorLight.ts      ← foco que sigue al ratón (versión tech)
│   ├── contact.ts          ← canales, formato del teléfono, enlace wa.me
│   └── …                   ← storage seguro, eventos, formato, scroll
├── hooks/                  ← reloj de sesión, reduced-motion, in-view, sección activa
├── components/             ← chooser, boot, navigation, terminal, systems, projects, ai, vision, infra, contact, ui
├── lite/                   ← versión sencilla (página, iconos, estilos)
├── sections/               ← una sección por módulo del sistema
├── App.tsx                 ← composición
├── main.tsx                ← cliente (hidrata el HTML prerenderizado)
└── entry-server.tsx        ← render estático usado en el build
scripts/
├── prerender.mjs           ← 4 HTML (idioma × versión), head SEO, sitemap, robots, 404
├── generate-assets.mjs     ← regenera og-image e iconos (opcional)
└── generate-logos.mjs      ← regenera los logos del Stack desde Simple Icons (opcional)
```

**Decisiones:**
- **React + Vite + TypeScript y CSS propio**, sin Tailwind ni librerías de animación. Las animaciones son CSS, SVG/SMIL y un único canvas 2D (las partículas del hero).
- **Prerender estático (SSG):** cada combinación de idioma y versión es un HTML real con todo el contenido, que React hidrata después. Así hay SEO completo y la primera pintura no espera al JavaScript.
- **Dos idiomas y dos versiones con URL propia** (`/`, `/lite/`, `/es/`, `/es/lite/`), con `hreflang` entre idiomas de la misma versión y title/description propios de la sencilla. En la primera visita, un navegador en español se redirige a `/es/`; nunca al revés, así que los enlaces a `/es/` siempre funcionan.
- **Selector sin parpadeo:** el selector tech/sencilla y el boot vienen prerenderizados y ocultos. Un script inline decide antes de la primera pintura si se muestran, así que no hay saltos. Los enlaces profundos (`#proyecto`) se saltan el boot y van directos al contenido.
- **Sin backend ni formularios:** el contacto es email (mailto) y WhatsApp (`wa.me`, abre la app en el móvil y WhatsApp Web en el ordenador, con un saludo ya escrito).
- **Sin lazy-loading de secciones:** todas se prerenderizan y se hidratan al cargar. Partirlas en chunks solo retrasaría la hidratación sin reducir el total.

**Rendimiento:** fuentes autoalojadas con subsets y *preload* de la tipografía del titular; el canvas y todas las animaciones se pausan fuera de pantalla o con la pestaña oculta; DPR limitado; sin imágenes ni vídeos pesados. Build actual: JS ≈ 111 KB gzip (React incluido) y CSS ≈ 11 KB gzip.

**Accesibilidad:** HTML semántico con landmarks y *skip link*, navegación completa por teclado (el explorador de proyectos sigue el patrón WAI-ARIA de pestañas; los nodos del grafo son botones), foco visible, `prefers-reduced-motion` respetado en todo (sin boot y sin animaciones), contraste AA en todos los textos, y resúmenes textuales de los diagramas para lectores de pantalla. Verificado con axe-core (WCAG 2.1 AA): 0 incidencias.

**SEO:** title/description por idioma y versión, canonical, `hreflang`, Open Graph, Twitter/X card, JSON-LD `Person`, `sitemap.xml`, `robots.txt`, favicon SVG/PNG, manifest y página 404 propia.
> En una *project page* (`usuario.github.io/Portfolio`), los buscadores solo leen el `robots.txt` de la raíz del dominio. Para que cuente, envía el sitemap desde Google Search Console o usa un dominio propio.

## Regenerar logos de tecnologías

Los logos del Stack salen de [Simple Icons](https://simpleicons.org) (CC0) y se incrustan solo los que se usan en `src/data/techLogos.ts`, así que no hay dependencia en tiempo de ejecución:

```bash
npm i --no-save simple-icons && node scripts/generate-logos.mjs
```

## Regenerar imagen OG e iconos

Las fuentes están en `scripts/assets/` (HTML y SVG). Solo hace falta si cambia la marca o el titular:

```bash
npm i -D playwright && npx playwright install chromium
node scripts/generate-assets.mjs
```

---

## Regla de contenido

La web no inventa clientes, cifras, porcentajes, años de experiencia, certificaciones ni resultados. Las trazas de log, la simulación RAG, los renders de visión y las señales de monitorización están **marcados en la propia web** como ilustrativos. Las coordenadas del HUD son decorativas. Los datos que faltan se dejan como *placeholders* en `src/config/site.ts`.
