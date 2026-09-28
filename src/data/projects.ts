import type { Localized } from '../i18n/types';
import type { TechId } from './stack';

/** Same text in every language (technical names, product names…). */
export const same = (text: string): Localized => ({ en: text, es: text });

export type ProjectId = 'workspace' | 'inventory-ai' | 'cctv' | 'rag' | 'gpu-lab';

export type ProjectDomain = 'platform' | 'vision' | 'ai' | 'infrastructure';

/** Signature visual rendered inside the project inspector. */
export type ProjectVisual = 'workspace' | 'shelf' | 'cctv' | 'rag' | 'rack';

export interface ProjectSpec {
  key: Localized;
  value: Localized;
}

export interface PipelineStep {
  label: Localized;
  detail: Localized;
}

/** One line of the illustrative trace shown in the project console (not real telemetry). */
export interface TraceLine {
  src: string;
  msg: string;
  level?: 'ok' | 'info' | 'warn';
}

/** A tool that is part of a larger system (e.g. the agents that live in the workspace). */
export interface SuiteItem {
  name: Localized;
  line: Localized;
}

export interface Project {
  id: ProjectId;
  /** Process id shown in the explorer — purely a visual identifier. */
  pid: string;
  name: Localized;
  /** Module path inside NACHO.SYS — purely visual. */
  path: string;
  domain: ProjectDomain;
  /** One-line hook shown in the process table. */
  tagline: Localized;
  summary: Localized;
  problem: Localized;
  solution: Localized;
  visual: ProjectVisual;
  built: Localized<string[]>;
  suite?: SuiteItem[];
  specs: ProjectSpec[];
  pipeline: PipelineStep[];
  stack: TechId[];
  trace: TraceLine[];
}

export const projects: Project[] = [
  {
    id: 'workspace',
    pid: '0x01',
    name: { en: 'Agent Workspace', es: 'Agent Workspace' },
    path: '/srv/platform/workspace',
    domain: 'platform',
    visual: 'workspace',
    tagline: { en: 'A desktop OS in the browser where a whole suite of agents runs side by side', es: 'Un sistema operativo de escritorio en el navegador donde corre una suite entera de agentes' },
    summary: {
      en: 'A web desktop with its own window manager and virtual desktops, where every internal tool and AI agent opens in its own window — signed in automatically through a built-in reverse proxy.',
      es: 'Un escritorio web con gestor de ventanas y escritorios virtuales propios, donde cada herramienta interna y cada agente de IA se abre en su propia ventana, con sesión iniciada automáticamente a través de un proxy inverso propio.',
    },
    problem: {
      en: 'A team working with dozens of internal tools lives in a mess of tabs, logins and ports. Nobody knows which tool does what, and every tool asks for its own password.',
      es: 'Un equipo que trabaja con decenas de herramientas internas vive entre pestañas, logins y puertos. Nadie sabe qué herramienta hace qué, y cada una pide su propia contraseña.',
    },
    solution: {
      en: 'One workspace that behaves like an operating system: drag, snap and tile windows across several virtual desktops, each window running a tool through a proxy that rewrites the app on the fly and logs the user in. A local LLM tells people which tool to use, and every tool ships with a guide generated automatically from its walkthrough video.',
      es: 'Un único espacio de trabajo que se comporta como un sistema operativo: ventanas que se arrastran, se acoplan y se ordenan en mosaico en varios escritorios virtuales, cada una ejecutando una herramienta a través de un proxy que reescribe la aplicación al vuelo e inicia la sesión del usuario. Un LLM local indica qué herramienta usar, y cada herramienta llega con su guía generada automáticamente a partir de su vídeo.',
    },
    built: {
      en: [
        'A real window manager in the browser: drag, resize, edge snapping with preview, tile and cascade, minimise and maximise, tabs, context menus and a taskbar',
        'Multiple virtual desktops — create, rename, move windows between them — with layouts saved per user and full session restore',
        'Reverse proxy that runs any internal web app inside a window, rewriting HTML, JavaScript, CSS, cookies and redirects on the fly',
        'Automatic single sign-on into the apps inside: detects classic login forms and SPA logins and signs the user in',
        'Proxy locked to internal hosts and allowed ports only, as SSRF protection',
        'Command palette, pinned and recent tools, desktop icons, sticky notes and wallpapers',
        'Live server widget — CPU, RAM, network, top processes and NVIDIA GPUs (pynvml with nvidia-smi fallback) — plus up/down status of every tool',
        'Presence and watch mode: see who is online and follow a colleague’s desktop live to help them',
        'Local LLM assistant (Ollama · Qwen) that recommends the right tool, aware only of the tools each user may open',
        'Tool library with per-role visibility, favourites, notes, usage stats, notifications, user approval (bcrypt) and crash-safe storage with atomic writes and rotating backups',
      ],
      es: [
        'Un gestor de ventanas real en el navegador: arrastrar, redimensionar, acoplar a los bordes con previsualización, mosaico y cascada, minimizar y maximizar, pestañas, menús contextuales y barra de tareas',
        'Varios escritorios virtuales —crear, renombrar, mover ventanas entre ellos— con distribuciones guardadas por usuario y restauración completa de la sesión',
        'Proxy inverso que ejecuta cualquier aplicación web interna dentro de una ventana, reescribiendo al vuelo HTML, JavaScript, CSS, cookies y redirecciones',
        'Inicio de sesión automático (SSO) en las aplicaciones de dentro: detecta formularios de login clásicos y logins de SPA y entra por el usuario',
        'Proxy limitado a hosts internos y puertos permitidos, como protección contra SSRF',
        'Paleta de comandos, herramientas fijadas y recientes, iconos de escritorio, notas adhesivas y fondos de pantalla',
        'Widget del servidor en vivo —CPU, RAM, red, procesos y GPUs NVIDIA (pynvml con nvidia-smi de respaldo)— y estado de cada herramienta',
        'Presencia y modo observador: quién está conectado y seguir en directo el escritorio de un compañero para ayudarle',
        'Asistente con LLM local (Ollama · Qwen) que recomienda la herramienta adecuada y solo conoce las que cada usuario puede abrir',
        'Biblioteca de herramientas con visibilidad por rol, favoritos, notas, estadísticas de uso, notificaciones, aprobación de usuarios (bcrypt) y almacenamiento a prueba de fallos con escrituras atómicas y copias rotativas',
      ],
    },
    suite: [
      {
        name: { en: 'Purchasing & Supplier Agent', es: 'Agente de Compras y Proveedores' },
        line: {
          en: 'Cleans every supplier’s price list — Excel, CSV, PDF or TXT — with one Python parser per supplier and document type, in multi-document batches, and merges the result for the price updater.',
          es: 'Limpia la tarifa de cada proveedor —Excel, CSV, PDF o TXT— con un parser Python por proveedor y tipo de documento, en lotes de varios documentos, y fusiona el resultado para el actualizador de precios.',
        },
      },
      {
        name: { en: 'Distributor Search', es: 'Buscador de distribuidores' },
        line: {
          en: 'One query across several IT wholesalers by part number, SKU or EAN: stock and price side by side, CSV/Excel export and e-mail alerts checked every hour.',
          es: 'Una consulta en varios mayoristas de informática por part number, SKU o EAN: stock y precio lado a lado, exportación CSV/Excel y alertas por email revisadas cada hora.',
        },
      },
      {
        name: { en: 'Gross Margin Calculator', es: 'Calculadora de márgenes brutos' },
        line: {
          en: 'Quarterly or yearly gross-margin reports straight from ERP data, exported to Excel by customer, delivery note, family and subfamily.',
          es: 'Informes trimestrales o anuales de margen bruto directamente desde los datos del ERP, exportados a Excel por cliente, albarán, familia y subfamilia.',
        },
      },
      {
        name: { en: 'Vast.ai Market Analyzer', es: 'Analizador de mercado Vast.ai' },
        line: {
          en: 'Crawls the Vast.ai GPU market with rate-limited API calls — supply, VRAM, occupancy, profitability by model and country — and ranks your own hosting against it.',
          es: 'Recorre el mercado de GPUs de Vast.ai con llamadas a la API limitadas —oferta, VRAM, ocupación y rentabilidad por modelo y país— y sitúa tu propio hosting frente a él.',
        },
      },
      {
        name: { en: 'Video-to-guide generator', es: 'Generador de guías desde vídeo' },
        line: {
          en: 'Turns the walkthrough video of each tool into structured documentation with Whisper large-v3 and a local LLM on Ollama; the workspace publishes it as that tool’s guide.',
          es: 'Convierte el vídeo explicativo de cada herramienta en documentación estructurada con Whisper large-v3 y un LLM local en Ollama; el workspace la publica como la guía de esa herramienta.',
        },
      },
    ],
    specs: [
      { key: { en: 'backend', es: 'backend' }, value: same('Flask · Python') },
      { key: { en: 'desktop', es: 'escritorio' }, value: { en: 'window manager · virtual desktops', es: 'gestor de ventanas · escritorios virtuales' } },
      { key: { en: 'apps inside', es: 'apps dentro' }, value: { en: 'reverse proxy · on-the-fly rewriting', es: 'proxy inverso · reescritura al vuelo' } },
      { key: { en: 'login', es: 'login' }, value: { en: 'automatic SSO into every tool', es: 'SSO automático en cada herramienta' } },
      { key: { en: 'ai', es: 'ia' }, value: { en: 'local LLM assistant · Ollama', es: 'asistente LLM local · Ollama' } },
      { key: { en: 'docs', es: 'docs' }, value: { en: 'guides from video · Whisper', es: 'guías desde vídeo · Whisper' } },
    ],
    pipeline: [
      { label: { en: 'Sign in once', es: 'Un solo login' }, detail: { en: 'bcrypt, roles and per-role visibility.', es: 'bcrypt, roles y visibilidad por rol.' } },
      { label: { en: 'Desktop', es: 'Escritorio' }, detail: { en: 'Session and layout restored.', es: 'Se restauran sesión y distribución.' } },
      { label: { en: 'Open a tool', es: 'Abrir herramienta' }, detail: { en: 'Palette, icon, pin or AI suggestion.', es: 'Paleta, icono, fijado o sugerencia de la IA.' } },
      { label: { en: 'Proxy', es: 'Proxy' }, detail: { en: 'App rewritten to live inside a window.', es: 'La app se reescribe para vivir en una ventana.' } },
      { label: same('SSO'), detail: { en: 'Login form detected and filled.', es: 'Se detecta y rellena el formulario de login.' } },
      { label: { en: 'Agent runs', es: 'El agente trabaja' }, detail: { en: 'Many windows, many desktops, at once.', es: 'Muchas ventanas y escritorios a la vez.' } },
    ],
    stack: ['python', 'flask', 'reverseProxy', 'sso', 'bcrypt', 'ollama', 'qwen', 'llm', 'whisper', 'pynvml', 'nvidia', 'rest', 'linux'],
    trace: [
      { src: 'auth', msg: 'session restored · layout "desk-2"', level: 'ok' },
      { src: 'wm', msg: 'window opened · purchasing agent' },
      { src: 'proxy', msg: 'html/js/css rewritten for window' },
      { src: 'sso', msg: 'login form detected · signed in', level: 'ok' },
      { src: 'wm', msg: 'snap → right half' },
      { src: 'ai', msg: 'assistant suggested: distributor search' },
      { src: 'gpu', msg: 'nvml stats refreshed' },
      { src: 'presence', msg: 'teammate joined · watch mode available', level: 'warn' },
      { src: 'store', msg: 'layout saved · atomic write + backup', level: 'ok' },
    ],
  },
  {
    id: 'inventory-ai',
    pid: '0x02',
    name: { en: 'AI Inventory', es: 'Inventario IA' },
    path: '/srv/ai/inventory',
    domain: 'ai',
    visual: 'shelf',
    tagline: { en: 'WhatsApp asks for a photo, local AI counts every unit, restocking arrives at 08:00', es: 'WhatsApp pide una foto, la IA local cuenta cada unidad y la reposición llega a las 08:00' },
    summary: {
      en: 'A complete platform that keeps a network of eyewear displays in pharmacies stocked: a WhatsApp bot asks for photos, a local multimodal AI counts every unit, and the replenishment list arrives every morning.',
      es: 'Una plataforma completa que mantiene abastecida una red de expositores de gafas en farmacias: un bot de WhatsApp pide las fotos, una IA multimodal local cuenta cada unidad y la lista de reposición llega cada mañana.',
    },
    problem: {
      en: 'An eyewear brand with displays across a large network of pharmacies could only know what each display was missing by calling, visiting or waiting — and had no data on what actually sells.',
      es: 'Una marca de gafas con expositores en una gran red de farmacias solo podía saber qué le faltaba a cada uno llamando, visitando o esperando, y no tenía datos de qué se vende de verdad.',
    },
    solution: {
      en: 'A Flask platform with fully local AI (Ollama + Qwen multimodal). The bot runs review rounds by zone, each pharmacy uploads one photo per display, and the AI analyses all photos jointly, deduplicates units and compares them with the expected stock. Shortfalls reach Telegram as one daily Excel; sales insights and PDF reports come out of the same data.',
      es: 'Una plataforma Flask con IA 100 % local (Ollama + Qwen multimodal). El bot lanza rondas de revisión por zonas, cada farmacia sube una foto por expositor y la IA analiza todas las fotos en conjunto, deduplica unidades y las compara con el stock esperado. Los faltantes llegan a Telegram en un único Excel diario; los datos de ventas y los informes PDF salen de esa misma información.',
    },
    built: {
      en: [
        'Joint analysis of every photo with a local multimodal model: a unit seen in several photos is counted once',
        'Expected stock always comes from the database; the AI’s JSON is validated, unknown products are flagged, never invented, with High / Medium / Low confidence',
        'WhatsApp bot on Baileys: automatic rounds every 45 days, personal upload link valid 24 h, at most two reminders',
        'Anti-blocking rules: daily cap, one message every 30–60 s, weekdays 9–20 h, a queue that survives disconnections and a 12-month sending calendar',
        'Zones clustered with k-means in pure Python, map with Leaflet + OpenStreetMap and smart location search',
        'Self-service onboarding by link, with an approval queue and WhatsApp confirmations',
        'Telegram group with one topic per notice, kept by the bot; replenishment Excel at 08:00 where each shortfall appears exactly once',
        'Sales insights (a shortfall ≈ a sale) and automatic monthly, quarterly, half-yearly and yearly PDF reports',
        'Nightly backups without secrets, auto-recovery after power cuts, hardened security and a demo engine with 1,200 real pharmacies from OpenStreetMap',
      ],
      es: [
        'Análisis conjunto de todas las fotos con un modelo multimodal local: una unidad que sale en varias fotos se cuenta una vez',
        'El stock esperado sale siempre de la base de datos; el JSON de la IA se valida y los productos desconocidos se marcan, nunca se inventan, con confianza Alta / Media / Baja',
        'Bot de WhatsApp sobre Baileys: rondas automáticas cada 45 días, enlace personal de subida válido 24 h y como mucho dos recordatorios',
        'Reglas anti-bloqueo: tope diario, un mensaje cada 30–60 s, de lunes a viernes de 9 a 20 h, cola que sobrevive a las desconexiones y calendario de envíos a 12 meses',
        'Zonas calculadas con k-means en Python puro, mapa con Leaflet + OpenStreetMap y buscador inteligente de ubicación',
        'Altas en autoservicio por enlace, con cola de aprobación y confirmaciones por WhatsApp',
        'Grupo de Telegram con un tema por aviso que mantiene el bot; Excel de reposición a las 08:00 donde cada faltante sale una única vez',
        'Datos de ventas (faltante ≈ venta) e informes PDF automáticos mensuales, trimestrales, semestrales y anuales',
        'Copias nocturnas sin claves, recuperación automática tras cortes de luz, seguridad reforzada y motor de demo con 1.200 farmacias reales de OpenStreetMap',
      ],
    },
    specs: [
      { key: { en: 'backend', es: 'backend' }, value: same('Flask · SQLAlchemy · SQLite') },
      { key: { en: 'ai', es: 'ia' }, value: { en: 'Ollama · Qwen multimodal · 100% local', es: 'Ollama · Qwen multimodal · 100 % local' } },
      { key: { en: 'channel', es: 'canal' }, value: { en: 'WhatsApp bot · Baileys', es: 'bot de WhatsApp · Baileys' } },
      { key: { en: 'cycle', es: 'ciclo' }, value: { en: '45 days · 24 h link', es: '45 días · enlace 24 h' } },
      { key: { en: 'output', es: 'salida' }, value: { en: 'Telegram · Excel · PDF', es: 'Telegram · Excel · PDF' } },
      { key: { en: 'load test', es: 'prueba de carga' }, value: { en: '1,200 real pharmacies', es: '1.200 farmacias reales' } },
    ],
    pipeline: [
      { label: { en: 'Zone round', es: 'Ronda por zona' }, detail: { en: 'Scheduled within the daily cap.', es: 'Planificada dentro del tope diario.' } },
      { label: same('WhatsApp'), detail: { en: 'Personal upload link.', es: 'Enlace personal de subida.' } },
      { label: { en: 'Photos', es: 'Fotos' }, detail: { en: 'One per display. No app.', es: 'Una por expositor. Sin app.' } },
      { label: { en: 'Local vision AI', es: 'IA de visión local' }, detail: { en: 'All photos read together.', es: 'Todas las fotos a la vez.' } },
      { label: { en: 'Deduplicate', es: 'Deduplicar' }, detail: { en: 'By code and colour.', es: 'Por código y color.' } },
      { label: { en: 'Compare', es: 'Comparar' }, detail: { en: 'Against expected stock.', es: 'Contra el stock esperado.' } },
      { label: { en: 'Excel · 08:00', es: 'Excel · 08:00' }, detail: { en: 'Replenishment, on Telegram.', es: 'Reposición, en Telegram.' } },
    ],
    stack: ['python', 'flask', 'sqlalchemy', 'sqlite', 'ollama', 'qwen', 'whatsapp', 'baileys', 'nodejs', 'telegram', 'excel', 'fpdf2', 'leaflet', 'osm', 'kmeans', 'cloudflareTunnel', 'raspberryPi'],
    trace: [
      { src: 'zones', msg: 'round planned within daily cap' },
      { src: 'wa', msg: 'message sent · personal link (24 h)', level: 'ok' },
      { src: 'upload', msg: 'photos received from pharmacy' },
      { src: 'qwen', msg: 'joint analysis of all photos (local)' },
      { src: 'dedup', msg: 'units merged by code + colour' },
      { src: 'compare', msg: 'expected vs detected · shortfalls found', level: 'warn' },
      { src: 'telegram', msg: 'notice posted to photos topic', level: 'ok' },
      { src: 'excel', msg: 'replenishment workbook @ 08:00', level: 'ok' },
    ],
  },
  {
    id: 'cctv',
    pid: '0x03',
    name: { en: 'AI CCTV', es: 'CCTV con IA' },
    path: '/srv/vision/cctv',
    domain: 'vision',
    visual: 'cctv',
    tagline: { en: 'Multi-camera RTSP with YOLO person detection on NVIDIA GPUs', es: 'Multicámara RTSP con detección de personas YOLO en GPUs NVIDIA' },
    summary: {
      en: 'Multi-camera surveillance that detects people with YOLO on NVIDIA GPUs, records on schedule and reports its own health on Discord.',
      es: 'Videovigilancia multicámara que detecta personas con YOLO en GPUs NVIDIA, graba por horario e informa de su propio estado en Discord.',
    },
    problem: {
      en: 'Conventional CCTV records everything and understands nothing: hours of footage, nobody watching, and no signal when something actually happens.',
      es: 'El CCTV convencional lo graba todo y no entiende nada: horas de vídeo, nadie mirando y ninguna señal cuando de verdad pasa algo.',
    },
    solution: {
      en: 'A pipeline that connects to IP cameras over RTSP, runs YOLOv5 on CUDA, and turns raw streams into organised recordings, detection videos and Discord reports.',
      es: 'Un pipeline que se conecta a cámaras IP por RTSP, ejecuta YOLOv5 sobre CUDA y convierte los streams en grabaciones ordenadas, vídeos de detección e informes en Discord.',
    },
    built: {
      en: [
        'Simultaneous connection to multiple RTSP cameras and frame processing',
        'Person detection with YOLOv5 on NVIDIA GPUs (CUDA, RTX 4090, multi-GPU)',
        'Recordings plus derived videos with the detections drawn in (FFmpeg)',
        'Recording schedules and storage organised by day',
        'Health monitoring of cameras and system, with inference statistics',
        'Status and events delivered to Discord',
      ],
      es: [
        'Conexión simultánea a múltiples cámaras RTSP y procesamiento de frames',
        'Detección de personas con YOLOv5 en GPUs NVIDIA (CUDA, RTX 4090, multi-GPU)',
        'Grabaciones y vídeos derivados con las detecciones dibujadas (FFmpeg)',
        'Horarios de grabación y almacenamiento organizado por días',
        'Monitorización de cámaras y sistema, con estadísticas de inferencia',
        'Estado y eventos enviados a Discord',
      ],
    },
    specs: [
      { key: { en: 'input', es: 'entrada' }, value: { en: 'RTSP · multiple cameras', es: 'RTSP · múltiples cámaras' } },
      { key: { en: 'model', es: 'modelo' }, value: same('YOLOv5 · person') },
      { key: { en: 'inference', es: 'inferencia' }, value: same('CUDA · RTX 4090 · multi-GPU') },
      { key: { en: 'video', es: 'vídeo' }, value: same('FFmpeg') },
      { key: { en: 'reporting', es: 'avisos' }, value: same('Discord') },
    ],
    pipeline: [
      { label: { en: 'RTSP camera', es: 'Cámara RTSP' }, detail: { en: 'Several streams at once.', es: 'Varios streams a la vez.' } },
      { label: { en: 'Frames', es: 'Frames' }, detail: { en: 'Pulled from each stream.', es: 'Extraídos de cada stream.' } },
      { label: same('YOLOv5'), detail: { en: 'On the GPU with CUDA.', es: 'En GPU con CUDA.' } },
      { label: { en: 'Detection', es: 'Detección' }, detail: { en: 'People marked in frame.', es: 'Personas marcadas.' } },
      { label: { en: 'Video', es: 'Vídeo' }, detail: { en: 'Recordings + detection clips.', es: 'Grabaciones + clips.' } },
      { label: same('Discord'), detail: { en: 'Status and events.', es: 'Estado y eventos.' } },
    ],
    stack: ['python', 'yolov5', 'pytorch', 'cuda', 'nvidia', 'multiGpu', 'rtsp', 'ffmpeg', 'discord'],
    trace: [
      { src: 'rtsp', msg: 'stream cam-01 connected', level: 'ok' },
      { src: 'rtsp', msg: 'stream cam-02 connected', level: 'ok' },
      { src: 'yolo', msg: 'yolov5 weights loaded on cuda:0', level: 'ok' },
      { src: 'sched', msg: 'recording window open' },
      { src: 'detect', msg: 'class=person · event opened', level: 'warn' },
      { src: 'video', msg: 'writing detection clip (ffmpeg)' },
      { src: 'store', msg: 'archived to recordings/{date}/' },
      { src: 'discord', msg: 'status report delivered', level: 'ok' },
    ],
  },
  {
    id: 'rag',
    pid: '0x04',
    name: { en: 'Local RAG Knowledge System', es: 'Sistema RAG con IA local' },
    path: '/srv/ai/rag',
    domain: 'ai',
    visual: 'rag',
    tagline: { en: 'Semantic search and answers over company documents, on own GPUs', es: 'Búsqueda semántica y respuestas sobre documentación, en GPUs propias' },
    summary: {
      en: 'Semantic search and generated answers over large volumes of documents, RMAs and internal knowledge — with the models running on own NVIDIA GPUs.',
      es: 'Búsqueda semántica y respuestas generadas sobre grandes volúmenes de documentos, RMAs y conocimiento interno, con los modelos corriendo en GPUs NVIDIA propias.',
    },
    problem: {
      en: 'Knowledge is spread across documents, RMAs and internal notes. Keyword search misses it, and the answer ends up depending on the one person who remembers.',
      es: 'El conocimiento está repartido entre documentos, RMAs y notas internas. La búsqueda por palabras clave no lo encuentra y la respuesta acaba dependiendo de quien se acuerda.',
    },
    solution: {
      en: 'Documents are embedded with all-mpnet-base-v2 and indexed in FAISS; each question retrieves the relevant context and a local LLM (DeepSeek, DeepSeek-R1 or Mistral on Ollama, or NVIDIA NIM) writes the answer.',
      es: 'Los documentos se vectorizan con all-mpnet-base-v2 y se indexan en FAISS; cada pregunta recupera el contexto relevante y un LLM local (DeepSeek, DeepSeek-R1 o Mistral en Ollama, o NVIDIA NIM) redacta la respuesta.',
    },
    built: {
      en: [
        'Ingestion of documents, RMAs and internal documentation',
        'Embeddings with all-mpnet-base-v2 (Sentence Transformers) and vector index in FAISS',
        'Semantic search and context retrieval',
        'Answers generated by local models: DeepSeek, DeepSeek-R1, Mistral on Ollama, or NVIDIA NIM',
        'Runs entirely on self-operated NVIDIA GPU infrastructure',
      ],
      es: [
        'Ingesta de documentos, RMAs y documentación interna',
        'Embeddings con all-mpnet-base-v2 (Sentence Transformers) e índice vectorial en FAISS',
        'Búsqueda semántica y recuperación de contexto',
        'Respuestas generadas por modelos locales: DeepSeek, DeepSeek-R1, Mistral en Ollama, o NVIDIA NIM',
        'Funciona íntegramente sobre infraestructura propia con GPUs NVIDIA',
      ],
    },
    specs: [
      { key: { en: 'embeddings', es: 'embeddings' }, value: same('all-mpnet-base-v2') },
      { key: { en: 'index', es: 'índice' }, value: same('FAISS') },
      { key: { en: 'models', es: 'modelos' }, value: same('DeepSeek · DeepSeek-R1 · Mistral') },
      { key: { en: 'serving', es: 'serving' }, value: same('Ollama · NVIDIA NIM') },
    ],
    pipeline: [
      { label: { en: 'Documents', es: 'Documentos' }, detail: { en: 'Docs, RMAs, knowledge bases.', es: 'Docs, RMAs, bases de conocimiento.' } },
      { label: { en: 'Embeddings', es: 'Embeddings' }, detail: { en: 'all-mpnet-base-v2.', es: 'all-mpnet-base-v2.' } },
      { label: same('FAISS'), detail: { en: 'Similarity index.', es: 'Índice de similitud.' } },
      { label: { en: 'Retrieve', es: 'Recuperar' }, detail: { en: 'By meaning, not keywords.', es: 'Por significado, no por palabras.' } },
      { label: { en: 'Local LLM', es: 'LLM local' }, detail: { en: 'Ollama or NIM on GPU.', es: 'Ollama o NIM en GPU.' } },
      { label: { en: 'Answer', es: 'Respuesta' }, detail: { en: 'Grounded in own data.', es: 'Basada en datos propios.' } },
    ],
    stack: ['python', 'rag', 'sentenceTransformers', 'mpnet', 'faiss', 'ollama', 'deepseek', 'deepseekR1', 'mistral', 'nim', 'cuda'],
    trace: [
      { src: 'embed', msg: 'model all-mpnet-base-v2 ready', level: 'ok' },
      { src: 'faiss', msg: 'index loaded', level: 'ok' },
      { src: 'query', msg: 'question received' },
      { src: 'faiss', msg: 'similarity search · top-k context' },
      { src: 'ollama', msg: 'generating with local model' },
      { src: 'answer', msg: 'response returned with sources', level: 'ok' },
    ],
  },
  {
    id: 'gpu-lab',
    pid: '0x05',
    name: { en: 'GPU Lab & Observability', es: 'Laboratorio GPU y observabilidad' },
    path: '/srv/infra/gpu-lab',
    domain: 'infrastructure',
    visual: 'rack',
    tagline: { en: 'Multi-GPU servers, Vast.ai hosting and home-grown monitoring', es: 'Servidores multi-GPU, hosting en Vast.ai y monitorización propia' },
    summary: {
      en: 'The metal under the AI: multi-GPU inference servers, GPU hosting on the Vast.ai marketplace and a home-grown monitoring stack that reports to Telegram and Discord.',
      es: 'El hierro bajo la IA: servidores de inferencia multi-GPU, hosting de GPUs en el marketplace de Vast.ai y una monitorización propia que avisa por Telegram y Discord.',
    },
    problem: {
      en: 'Running AI on your own terms — private data, local models, no per-token bill — needs someone who can build, operate and watch the machines, not just call an API.',
      es: 'Ejecutar IA en tus propios términos —datos privados, modelos locales, sin factura por token— exige a alguien que monte, opere y vigile las máquinas, no solo que llame a una API.',
    },
    solution: {
      en: 'Servers with multiple NVIDIA GPUs, Threadripper PRO and large RAM, prepared with CUDA and Docker to serve local models; virtualisation and storage around them; and monitoring scripts that watch everything and alert only when a human is needed.',
      es: 'Servidores con varias GPUs NVIDIA, Threadripper PRO y mucha RAM, preparados con CUDA y Docker para servir modelos locales; virtualización y almacenamiento alrededor; y scripts de monitorización que lo vigilan todo y solo avisan cuando hace falta una persona.',
    },
    built: {
      en: [
        'Machines with multiple RTX 3090 and RTX 4090, plus RTX 5090 and RTX 6000 Ada',
        'Threadripper PRO, large RAM, CUDA and Docker serving local models',
        'Proxmox virtualisation (QCOW2, VHDX) and Synology storage over CIFS/Samba',
        'GPU hosting on the Vast.ai marketplace, with its own market analyzer',
        'Custom monitoring of CPU, RAM, GPU, containers, processes, services, cameras and inference',
        'Network and defensive security: nmap, arp-scan, tcpdump, tshark, Suricata — alerts to Telegram and Discord',
      ],
      es: [
        'Máquinas con varias RTX 3090 y RTX 4090, además de RTX 5090 y RTX 6000 Ada',
        'Threadripper PRO, mucha RAM, CUDA y Docker sirviendo modelos locales',
        'Virtualización con Proxmox (QCOW2, VHDX) y almacenamiento Synology por CIFS/Samba',
        'Hosting de GPUs en el marketplace de Vast.ai, con su propio analizador de mercado',
        'Monitorización propia de CPU, RAM, GPU, contenedores, procesos, servicios, cámaras e inferencia',
        'Red y ciberseguridad defensiva: nmap, arp-scan, tcpdump, tshark, Suricata, con avisos a Telegram y Discord',
      ],
    },
    specs: [
      { key: { en: 'gpus', es: 'gpus' }, value: same('RTX 3090 · 4090 · 5090 · 6000 Ada') },
      { key: { en: 'cpu', es: 'cpu' }, value: same('Threadripper PRO') },
      { key: { en: 'platform', es: 'plataforma' }, value: same('CUDA · Docker · Proxmox') },
      { key: { en: 'marketplace', es: 'marketplace' }, value: same('Vast.ai') },
      { key: { en: 'alerts', es: 'avisos' }, value: same('Telegram · Discord') },
    ],
    pipeline: [
      { label: same('Hardware'), detail: { en: 'Multi-GPU, Threadripper PRO.', es: 'Multi-GPU, Threadripper PRO.' } },
      { label: { en: 'Hypervisor', es: 'Hipervisor' }, detail: { en: 'Linux, Proxmox, VMs.', es: 'Linux, Proxmox, VMs.' } },
      { label: same('CUDA · Docker'), detail: { en: 'Reproducible GPU services.', es: 'Servicios GPU reproducibles.' } },
      { label: { en: 'Models', es: 'Modelos' }, detail: { en: 'LLMs, embeddings, vision.', es: 'LLMs, embeddings, visión.' } },
      { label: { en: 'Watch', es: 'Vigilar' }, detail: { en: 'Hosts, GPUs, network.', es: 'Hosts, GPUs, red.' } },
      { label: { en: 'Alert', es: 'Avisar' }, detail: { en: 'Telegram · Discord.', es: 'Telegram · Discord.' } },
    ],
    stack: ['nvidia', 'cuda', 'multiGpu', 'docker', 'linux', 'proxmox', 'synology', 'vastai', 'ollama', 'glances', 'nmap', 'tshark', 'suricata', 'telegram', 'discord'],
    trace: [
      { src: 'pcie', msg: 'nvidia gpus enumerated' },
      { src: 'driver', msg: 'cuda runtime available', level: 'ok' },
      { src: 'docker', msg: 'nvidia container runtime ready', level: 'ok' },
      { src: 'vast', msg: 'host listed on marketplace' },
      { src: 'net', msg: 'arp-scan · new device on segment', level: 'warn' },
      { src: 'suricata', msg: 'ruleset loaded · watching' },
      { src: 'telegram', msg: 'alert delivered', level: 'ok' },
    ],
  },
];

export function findProject(query: string): Project | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  if (/^\d+$/.test(q)) return projects[Number(q) - 1];
  return projects.find(
    (p) => p.id === q || p.pid.toLowerCase() === q || p.name.en.toLowerCase() === q || p.id.startsWith(q),
  );
}
