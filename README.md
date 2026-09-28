# NACHO.SYS

Portfolio de **Nacho / Akantor**: IA, automatización, sistemas e infraestructura.

La web no funciona como un portfolio clásico. Se presenta como un sistema operativo: arranca con una secuencia de boot, la navegación es un árbol de ficheros, los proyectos se inspeccionan como procesos y tiene una terminal funcional.

- **EN** → `https://falconakantor.github.io/Portfolio/`
- **ES** → `https://falconakantor.github.io/Portfolio/es/`

---

## Qué contiene

| Módulo | Qué hace |
| --- | --- |
| `boot` | Arranque tipo terminal (solo en la primera visita; se salta con cualquier tecla), titular, comprobación de capacidades y terminal interactiva |
| `projects/` | Los 5 MVP. Cada uno con su visual propio (réplica interactiva del Agent Workspace, renders de visión, recorrido RAG, rack), ficha, pipeline, qué se construyó y traza |
| `network` | Mapa de integración animado (email, WhatsApp, cámaras, ERP, BD…) con nodos seleccionables |
| `automation/` | El mismo proceso manual vs. automatizado y los procesos que convierto en sistemas |
| `stack` | Tecnologías agrupadas por propósito, con referencias cruzadas a los proyectos que las usan |
| `about` | Perfil, principios y ciclo idea → producción |
| `contact` | Generador de peticiones de automatización (mailto / copiar), sin backend |

**Terminal:** `help`, `projects`, `open <n|id>`, `stack [categoría]`, `ai`, `automation`, `infrastructure`, `vision`, `contact`, `goto <sección>`, `ls`, `whoami`, `date`, `uptime`, `history`, `lang <en|es>`, `reboot`, `clear`. Tiene autocompletado con Tab e historial con ↑/↓. Se abre desde cualquier punto con `Ctrl/⌘ + K` o con `` ` ``.

---

## Configurar tus datos (un único archivo)

Todo lo personal está en **`src/config/site.ts`**:

```ts
contact: {
  email: '',     // TODO: email público → activa el botón "Enviar por email"
  linkedin: '',  // TODO: https://www.linkedin.com/in/…
  github: 'https://github.com/FalconAkantor',
  telegram: '',  // TODO: usuario sin @
  whatsapp: '',  // TODO: solo dígitos, formato internacional (34600000000)
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
| `src/i18n/ui.ts` | Todos los textos de la interfaz en EN y ES |

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

Para volver a ver la secuencia de arranque: escribe `reboot` en la terminal, o borra `nacho.sys:booted` de localStorage.

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
├── i18n/                   ← tipos, contexto, rutas por idioma, diccionario EN/ES
├── data/                   ← todo el contenido (sin JSX)
├── lib/
│   ├── terminal/engine.ts  ← intérprete de la terminal (puro, testeado)
│   ├── boot.ts             ← controlador de la secuencia de arranque
│   ├── graph.ts            ← geometría del mapa de integración
│   ├── brief.ts            ← petición de automatización (texto / mailto)
│   └── …                   ← storage seguro, eventos, formato, scroll
├── hooks/                  ← reloj de sesión, reduced-motion, in-view, sección activa
├── components/             ← boot, navigation, terminal, systems, projects, ai, vision, infra, contact, ui
├── sections/               ← una sección por módulo del sistema
├── App.tsx                 ← composición
├── main.tsx                ← cliente (hidrata el HTML prerenderizado)
└── entry-server.tsx        ← render estático usado en el build
scripts/
├── prerender.mjs           ← HTML por idioma, head SEO, sitemap, robots, 404
└── generate-assets.mjs     ← regenera og-image e iconos (opcional)
```

**Decisiones:**
- **React + Vite + TypeScript y CSS propio**, sin Tailwind ni librerías de animación. Las animaciones son CSS, SVG/SMIL y un único canvas 2D (las partículas del hero).
- **Prerender estático (SSG):** cada idioma es un HTML real con todo el contenido, que React hidrata después. Así hay SEO completo y la primera pintura no espera al JavaScript.
- **Dos idiomas con URL propia** (`/` y `/es/`), enlazados con `hreflang`. En la primera visita, un navegador en español se redirige a `/es/`; nunca al revés, así que los enlaces a `/es/` siempre funcionan.
- **Sin backend:** el contacto abre el cliente de correo del visitante o copia la petición.
- **Sin lazy-loading de secciones:** todas se prerenderizan y se hidratan al cargar. Partirlas en chunks solo retrasaría la hidratación sin reducir el total.

**Rendimiento:** fuentes autoalojadas con subsets y *preload* de la tipografía del titular; el canvas y todas las animaciones se pausan fuera de pantalla o con la pestaña oculta; DPR limitado; sin imágenes ni vídeos pesados. Build actual: JS ≈ 111 KB gzip (React incluido) y CSS ≈ 11 KB gzip.

**Accesibilidad:** HTML semántico con landmarks y *skip link*, navegación completa por teclado (el explorador de proyectos sigue el patrón WAI-ARIA de pestañas; los nodos del grafo son botones), foco visible, `prefers-reduced-motion` respetado en todo (sin boot y sin animaciones), contraste AA en todos los textos, y resúmenes textuales de los diagramas para lectores de pantalla. Verificado con axe-core (WCAG 2.1 AA): 0 incidencias.

**SEO:** title/description por idioma, canonical, `hreflang`, Open Graph, Twitter/X card, JSON-LD `Person`, `sitemap.xml`, `robots.txt`, favicon SVG/PNG, manifest y página 404 propia.
> En una *project page* (`usuario.github.io/Portfolio`), los buscadores solo leen el `robots.txt` de la raíz del dominio. Para que cuente, envía el sitemap desde Google Search Console o usa un dominio propio.

## Regenerar imagen OG e iconos

Las fuentes están en `scripts/assets/` (HTML y SVG). Solo hace falta si cambia la marca o el titular:

```bash
npm i -D playwright && npx playwright install chromium
node scripts/generate-assets.mjs
```

---

## Regla de contenido

La web no inventa clientes, cifras, porcentajes, años de experiencia, certificaciones ni resultados. Las trazas de log, la simulación RAG, los renders de visión y las señales de monitorización están **marcados en la propia web** como ilustrativos. Las coordenadas del HUD son decorativas. Los datos que faltan se dejan como *placeholders* en `src/config/site.ts`.
