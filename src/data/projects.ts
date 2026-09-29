import type { Localized } from '../i18n/types';
import type { TechId } from './stack';

/** Same text in every language (technical names, product names…). */
export const same = (text: string): Localized => ({ en: text, es: text });

export type ProjectId = 'workspace' | 'cctv' | 'inventory-ai' | 'docs' | 'whatsapp-desk';

export type ProjectDomain = 'platform' | 'vision' | 'ai' | 'infrastructure';

/** Signature visual rendered inside the project inspector. */
export type ProjectVisual = 'workspace' | 'shelf' | 'cctv' | 'docs' | 'bridge';

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
  /** Module path inside AUTOMARIZA — purely visual. */
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
  /** Heading for the suite list (defaults to the agent-suite heading). */
  suiteTitle?: Localized;
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
    id: 'cctv',
    pid: '0x02',
    name: { en: 'Autonomous AI CCTV', es: 'CCTV autónomo con IA' },
    path: '/srv/vision/sentinel',
    domain: 'vision',
    visual: 'cctv',
    tagline: {
      en: 'A camera that watches, records, understands and warns on its own — and answers questions about what happened',
      es: 'Una cámara que vigila, graba, entiende y avisa sola, y responde preguntas sobre lo que ha pasado',
    },
    summary: {
      en: 'A surveillance system that runs a camera end to end with nobody watching: it records 24/7, detects people and vehicles, remembers every parked car, has a local vision model watch and describe every event, alerts only when there is a reason — and answers plain-language questions about any day.',
      es: 'Un sistema de vigilancia que lleva una cámara de principio a fin sin que nadie mire: graba 24/7, detecta personas y vehículos, recuerda cada coche aparcado, un modelo de visión local ve y describe cada evento, solo alerta cuando hay motivo y responde en lenguaje natural sobre lo que pasó cualquier día.',
    },
    problem: {
      en: 'Cameras record everything and understand nothing. Hours of footage nobody watches, motion alerts that fire with every shadow or headlight, and when something really happens someone has to scrub through the recording to find it.',
      es: 'Las cámaras lo graban todo y no entienden nada. Horas de vídeo que nadie mira, avisos de movimiento que saltan con cada sombra o cada faro, y cuando de verdad pasa algo alguien tiene que rebobinar la grabación para encontrarlo.',
    },
    solution: {
      en: 'One FFmpeg process opens a single RTSP connection, records hour-long segments with audio and pipes frames to YOLOv8x. Each detection opens an event session that becomes a video; an asynchronous forensic worker picks the frames where the action is, adds YOLO11 pose and the moving vehicle as hints, and asks a local vision model to describe what happened in strict JSON, under a no-hallucination rule and a stricter night mode. Everything lands in SQLite, in Telegram topics and in a live control panel.',
      es: 'Un único proceso FFmpeg abre una sola conexión RTSP, graba segmentos de una hora con audio y pasa los frames a YOLOv8x. Cada detección abre una sesión de evento que se convierte en vídeo; un worker forense asíncrono elige los fotogramas donde está la acción, añade como pistas la pose de YOLO11 y el vehículo en movimiento, y pide a un modelo de visión local que describa lo ocurrido en JSON estricto, con una regla anti-alucinación y un modo nocturno más estricto. Todo acaba en SQLite, en topics de Telegram y en un panel de control en vivo.',
    },
    suiteTitle: { en: 'What runs on its own', es: 'Lo que funciona solo' },
    suite: [
      {
        name: { en: 'One connection, two jobs', es: 'Una conexión, dos trabajos' },
        line: {
          en: 'A single RTSP connection records 1-hour segments with audio and feeds YOLO through a pipe. If the camera drops it retries forever and keeps sending critical alerts until it is back, then reports the recovery.',
          es: 'Una sola conexión RTSP graba segmentos de una hora con audio y alimenta a YOLO por un pipe. Si la cámara se cae, reintenta sin parar y manda alertas críticas hasta que vuelve; después avisa de la recuperación.',
        },
      },
      {
        name: { en: 'Parking memory', es: 'Memoria del parking' },
        line: {
          en: 'Learns every parked vehicle by itself — position plus a visual fingerprint — and reports arrivals, departures and moves with a photo. Moves need several frames of confirmation, and when all cars shift at once it knows the camera moved (pan/tilt, wind) and recalibrates silently.',
          es: 'Aprende sola cada vehículo aparcado —posición y huella visual— y avisa con foto de llegadas, salidas y cambios de sitio. Un cambio de sitio necesita varios frames de confirmación, y si todos los coches se desplazan a la vez entiende que se ha movido la cámara (giro automático, viento) y se recalibra en silencio.',
        },
      },
      {
        name: { en: 'Event sessions', es: 'Sesiones de evento' },
        line: {
          en: 'People, continuous presence of more than a minute and generic motion open sessions that close when the scene calms down. Each becomes a clip with the seconds before included, split into parts under Telegram’s size limit and never sent twice.',
          es: 'Las personas, la presencia continuada de más de un minuto y el movimiento genérico abren sesiones que se cierran cuando la escena se calma. Cada una se convierte en un clip que incluye los segundos previos, partido en trozos por debajo del límite de Telegram y sin envíos duplicados.',
        },
      },
      {
        name: { en: 'AI forensic analyst', es: 'Analista forense con IA' },
        line: {
          en: 'Qwen2.5-VL on Ollama watches the key frames and returns a summary, a timeline, vehicles (type, colour, probable make and why), people without identifying anyone, security risks and what it cannot be sure of. A 0–100 risk score decides; only suspicious events are tagged #alerta, and between 20:00 and 07:00 any human presence counts.',
          es: 'Qwen2.5-VL en Ollama ve los fotogramas clave y devuelve resumen, cronología, vehículos (tipo, color, marca probable y por qué), personas sin identificar a nadie, riesgos de seguridad y lo que no puede asegurar. Una puntuación de riesgo de 0 a 100 decide; solo los eventos sospechosos llevan #alerta, y entre las 20:00 y las 07:00 cualquier presencia humana cuenta.',
        },
      },
      {
        name: { en: 'Ask it what happened', es: 'Pregúntale qué pasó' },
        line: {
          en: '“Which delivery companies came today?”, “anything odd last night?”. It works out the time range and the intent, searches the event database and a local LLM answers in plain Spanish with buttons that open the exact videos. Recurring vehicles are recognised across 30 days.',
          es: '«¿Qué empresas de reparto han venido hoy?», «¿pasó algo raro anoche?». Deduce el rango de tiempo y la intención, busca en la base de eventos y un LLM local responde en castellano claro con botones que abren los vídeos exactos. Los vehículos recurrentes se reconocen durante 30 días.',
        },
      },
      {
        name: { en: 'Control centre', es: 'Centro de control' },
        line: {
          en: 'A web panel with live video reusing the same frames (no extra camera connection), events, a 24-hour timeline to scrub, recordings converted to MP4 on demand, clips, captures, a map of the learned cars, GPU and disk gauges, settings and logs — plus temporary remote access through a password-protected tunnel that closes itself.',
          es: 'Un panel web con vídeo en vivo que reutiliza los mismos frames (sin abrir otra conexión a la cámara), eventos, una línea de tiempo de 24 horas para saltar a cualquier momento, grabaciones convertidas a MP4 al vuelo, clips, capturas, un mapa de los coches aprendidos, medidores de GPU y disco, ajustes y logs; además de acceso remoto temporal por un túnel con contraseña que se cierra solo.',
        },
      },
    ],
    built: {
      en: [
        'Telegram group with one topic per kind of event — people, continuous presence, motion, videos, AI, alerts, investigation, cars and system — through a send queue that respects flood control',
        'Emergency push notifications reserved for a camera down and real AI alerts; routine detections go out at normal priority',
        'Frame selection that mixes motion peaks with even coverage, so the model sees the exact instant something happens',
        'Robust parsing of model output: strips reasoning and Markdown, recovers balanced JSON and falls back to field extraction',
        'Up to two AI workers in parallel with the detectors behind a dedicated lock; the model context is sized to the number of images',
        'Events with less than 5% of change are sent but not analysed, so the GPU is spent where it matters; 30-day retention',
      ],
      es: [
        'Grupo de Telegram con un topic por tipo de evento —personas, presencia continuada, movimiento, vídeos, IA, alertas, investigación, coches y sistema— mediante una cola de envío que respeta el control de flood',
        'Notificaciones push de emergencia reservadas para cámara caída y alertas reales de la IA; las detecciones rutinarias van con prioridad normal',
        'Selección de fotogramas que mezcla los picos de movimiento con una cobertura uniforme, para que el modelo vea el instante exacto en que pasa algo',
        'Lectura robusta de la salida del modelo: quita el razonamiento y el Markdown, recupera el JSON equilibrado y, si hace falta, extrae los campos uno a uno',
        'Hasta dos workers de IA en paralelo con los detectores protegidos por un lock propio; el contexto del modelo se dimensiona según el número de imágenes',
        'Los eventos con menos de un 5% de cambio se envían pero no se analizan, para gastar GPU solo donde importa; retención de 30 días',
      ],
    },
    specs: [
      { key: { en: 'camera', es: 'cámara' }, value: { en: 'RTSP · one connection', es: 'RTSP · una sola conexión' } },
      { key: { en: 'detection', es: 'detección' }, value: same('YOLOv8x · YOLO11x-pose') },
      { key: { en: 'vision AI', es: 'IA de visión' }, value: { en: 'Qwen2.5-VL 7B · Ollama (local)', es: 'Qwen2.5-VL 7B · Ollama (local)' } },
      { key: { en: 'memory', es: 'memoria' }, value: { en: 'SQLite · 30 days', es: 'SQLite · 30 días' } },
      { key: { en: 'alerts', es: 'avisos' }, value: same('Telegram topics · Pushover') },
      { key: { en: 'panel', es: 'panel' }, value: same('Flask · MJPEG · SSE') },
    ],
    pipeline: [
      { label: { en: 'RTSP camera', es: 'Cámara RTSP' }, detail: { en: 'One connection only.', es: 'Una sola conexión.' } },
      { label: same('FFmpeg'), detail: { en: 'Records and pipes frames.', es: 'Graba y pasa frames.' } },
      { label: same('YOLOv8x'), detail: { en: 'People and vehicles.', es: 'Personas y vehículos.' } },
      { label: { en: 'Session', es: 'Sesión' }, detail: { en: 'Event becomes a clip.', es: 'El evento se hace clip.' } },
      { label: { en: 'Vision AI', es: 'IA de visión' }, detail: { en: 'Describes and scores risk.', es: 'Describe y puntúa riesgo.' } },
      { label: { en: 'Alert / ask', es: 'Aviso / pregunta' }, detail: { en: 'Telegram, panel, search.', es: 'Telegram, panel, búsqueda.' } },
    ],
    stack: ['python', 'yolov8', 'yoloPose', 'opencv', 'ffmpeg', 'rtsp', 'ollama', 'qwenVl', 'sqlite', 'flask', 'telegram', 'pushover', 'cloudflareTunnel', 'nvidia'],
    trace: [
      { src: 'ffmpeg', msg: 'rtsp connected · rec 1h segment + pipe 1280x720', level: 'ok' },
      { src: 'yolo', msg: 'yolov8x · yolo11x-pose ready', level: 'ok' },
      { src: 'parking', msg: 'learned vehicles loaded · no changes' },
      { src: 'detect', msg: 'person · event session opened (-8s)', level: 'warn' },
      { src: 'session', msg: 'closed after 5s calm · clip ready' },
      { src: 'ai', msg: 'qwen2.5-vl · 12 key frames + pose hints' },
      { src: 'ai', msg: 'nivel=alto · riesgo 80 · #alerta', level: 'warn' },
      { src: 'notify', msg: 'topic alertas + push · stored in sqlite', level: 'ok' },
    ],
  },
  {
    id: 'inventory-ai',
    pid: '0x03',
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
    id: 'docs',
    pid: '0x04',
    name: { en: 'AI Document Library', es: 'Biblioteca documental con IA' },
    path: '/srv/docs/library',
    domain: 'ai',
    visual: 'docs',
    tagline: {
      en: 'Every PDF, Excel and Word file described, searchable by meaning, versioned and approved',
      es: 'Cada PDF, Excel y Word descrito, buscable por significado, con versiones y aprobaciones',
    },
    summary: {
      en: 'The company’s documents in one place that reads them for you: any PDF, Excel, Word, PowerPoint or scanned image is described and tagged by a local AI, found by meaning, answered from, checked for duplicates, versioned and approved — with permissions per department.',
      es: 'Los documentos de la empresa en un solo sitio que los lee por ti: cualquier PDF, Excel, Word, PowerPoint o imagen escaneada queda descrito y etiquetado por una IA local, se encuentra por significado, responde preguntas, detecta duplicados, guarda versiones y pasa por aprobación, con permisos por departamento.',
    },
    problem: {
      en: 'Procedures, price lists and forms live in shared folders nobody can search: files named “final_v3_OK.pdf”, the same Excel saved five times, scanned PDFs with no text, and the answer to “how do we do this?” depends on who you ask.',
      es: 'Los procedimientos, las tarifas y los formularios viven en carpetas compartidas que nadie puede buscar: archivos llamados «final_v3_OK.pdf», el mismo Excel guardado cinco veces, PDFs escaneados sin texto, y la respuesta a «¿esto cómo se hace?» depende de a quién preguntes.',
    },
    solution: {
      en: 'Every upload is read — text straight from PDF, Word, Excel and PowerPoint, OCR when a PDF or image is a scan. A local model writes a short description and tags; the text is cut into chunks and embedded, so search works by meaning and any document can be questioned. A SHA-256 fingerprint and semantic similarity catch duplicates, and a background scheduler does the heavy AI work in the hours you choose.',
      es: 'Cada archivo que se sube se lee: el texto sale directamente de PDF, Word, Excel y PowerPoint, y se pasa OCR cuando un PDF o una imagen es un escaneo. Un modelo local escribe una descripción corta y etiquetas; el texto se trocea y se vectoriza, así la búsqueda funciona por significado y se le puede preguntar a cualquier documento. Una huella SHA-256 y la similitud semántica detectan duplicados, y un planificador en segundo plano hace el trabajo pesado de IA en las horas que elijas.',
    },
    suiteTitle: { en: 'What it does for the team', es: 'Lo que hace por el equipo' },
    suite: [
      {
        name: { en: 'Reads any file', es: 'Lee cualquier archivo' },
        line: {
          en: 'PDF (with OCR fallback for scans), Word including tables, headers and text boxes, Excel and legacy .xls, PowerPoint with speaker notes, and images with text. Formats with nothing to read are skipped automatically.',
          es: 'PDF (con OCR de respaldo para escaneos), Word incluidas tablas, cabeceras y cuadros de texto, Excel y el .xls antiguo, PowerPoint con notas del presentador e imágenes con texto. Los formatos sin nada que leer se descartan solos.',
        },
      },
      {
        name: { en: 'Describes and tags itself', es: 'Se describe y se etiqueta solo' },
        line: {
          en: 'A local model returns a two-to-three-sentence description and 3–6 tags as strict JSON, with the rule of never inventing what is not in the document. Uploads without a description are chased: their owners get a reminder email.',
          es: 'Un modelo local devuelve una descripción de dos o tres frases y de 3 a 6 etiquetas en JSON estricto, con la regla de no inventar nada que no esté en el documento. Lo que queda sin describir se persigue: su autor recibe un email recordatorio.',
        },
      },
      {
        name: { en: 'Search by meaning, ask anything', es: 'Busca por significado, pregunta lo que sea' },
        line: {
          en: 'Semantic search ranks documents by their embedding, their best chunk and a keyword boost on name, description and tags. Ask the whole library, or chat with one document; answers come from its own text.',
          es: 'La búsqueda semántica ordena los documentos por su vector, por su mejor fragmento y por un refuerzo de palabras clave en nombre, descripción y etiquetas. Pregunta a toda la biblioteca o chatea con un documento; las respuestas salen de su propio texto.',
        },
      },
      {
        name: { en: 'No more duplicates', es: 'Se acabaron los duplicados' },
        line: {
          en: 'Identical files are caught by SHA-256; near-identical and similar ones by semantic similarity (above 0.97 and 0.92). A pair marked “not a duplicate” is never flagged again.',
          es: 'Los archivos idénticos se detectan por SHA-256; los casi idénticos y los parecidos, por similitud semántica (por encima de 0,97 y de 0,92). Un par marcado como «no es duplicado» no vuelve a salir.',
        },
      },
      {
        name: { en: 'Versions, approvals and comments', es: 'Versiones, aprobaciones y comentarios' },
        line: {
          en: 'Every new upload of a document becomes a version you can compare, view or restore. Documents can be sent for approval to reviewers, and commented with @mentions that notify by email.',
          es: 'Cada nueva subida de un documento se convierte en una versión que se puede comparar, ver o restaurar. Los documentos se pueden enviar a aprobación a revisores y comentar con @menciones que avisan por email.',
        },
      },
      {
        name: { en: 'Permissions by department', es: 'Permisos por departamento' },
        line: {
          en: 'Areas with their own sub-admins, groups and per-folder permissions (read, download, upload, edit…). Everything is audited, deletions go to a 30-day bin, and folders download as ZIP.',
          es: 'Áreas con sus propios subadministradores, grupos y permisos por carpeta (leer, descargar, subir, editar…). Todo queda auditado, lo borrado va a una papelera de 30 días y las carpetas se descargan en ZIP.',
        },
      },
    ],
    built: {
      en: [
        'Inline viewers for Excel and Word, so a spreadsheet can be read in the browser without downloading it',
        'Background scheduler with an active time window (it can cross midnight) that processes pending descriptions and embeddings',
        'Semaphores for the AI calls and write locks for every JSON store, so parallel workers never corrupt the library',
        'Robust model output: a JSON-mode request first, a retry without it, and cleanup of any reasoning text',
        'A skip list for files that cannot be read, so the AI never retries them in a loop',
        'Help assistant that knows the platform itself and a “improve this text” button for descriptions',
      ],
      es: [
        'Visores integrados de Excel y Word, para leer una hoja de cálculo en el navegador sin descargarla',
        'Planificador en segundo plano con franja horaria activa (puede cruzar la medianoche) que procesa las descripciones y los vectores pendientes',
        'Semáforos para las llamadas a la IA y locks de escritura en cada almacén JSON, para que los workers en paralelo nunca corrompan la biblioteca',
        'Salida del modelo a prueba de fallos: primero en modo JSON, un reintento sin él y limpieza de cualquier texto de razonamiento',
        'Una lista de exclusión para los archivos que no se pueden leer, para que la IA no los reintente en bucle',
        'Asistente de ayuda que conoce la propia plataforma y un botón de «mejorar este texto» para las descripciones',
      ],
    },
    specs: [
      { key: { en: 'reads', es: 'lee' }, value: same('PDF · Excel · Word · PowerPoint · OCR') },
      { key: { en: 'ai', es: 'ia' }, value: { en: 'local LLM · Ollama', es: 'LLM local · Ollama' } },
      { key: { en: 'search', es: 'búsqueda' }, value: { en: 'nomic-embed-text · semantic + keywords', es: 'nomic-embed-text · semántica + palabras' } },
      { key: { en: 'duplicates', es: 'duplicados' }, value: same('SHA-256 · similarity ≥ 0.92') },
      { key: { en: 'workflow', es: 'flujo' }, value: { en: 'versions · approvals · @mentions', es: 'versiones · aprobaciones · @menciones' } },
      { key: { en: 'backend', es: 'backend' }, value: same('Flask · Python') },
    ],
    pipeline: [
      { label: { en: 'Upload', es: 'Subida' }, detail: { en: 'Any file, any folder.', es: 'Cualquier archivo, cualquier carpeta.' } },
      { label: { en: 'Read', es: 'Leer' }, detail: { en: 'Text or OCR.', es: 'Texto u OCR.' } },
      { label: { en: 'Describe', es: 'Describir' }, detail: { en: 'Summary + tags.', es: 'Resumen + etiquetas.' } },
      { label: { en: 'Embed', es: 'Vectorizar' }, detail: { en: 'Search by meaning.', es: 'Búsqueda por significado.' } },
      { label: { en: 'Duplicates', es: 'Duplicados' }, detail: { en: 'Hash + similarity.', es: 'Hash + parecido.' } },
      { label: { en: 'Ask', es: 'Preguntar' }, detail: { en: 'Answers from its own text.', es: 'Respuestas de su propio texto.' } },
    ],
    stack: ['python', 'flask', 'ollama', 'qwen', 'embeddings', 'ocr', 'tesseract', 'pdf', 'excel', 'bcrypt', 'email'],
    trace: [
      { src: 'upload', msg: 'tarifa_proveedor_2026.pdf · 2.4 MB', level: 'ok' },
      { src: 'extract', msg: 'pypdf returned 38 chars → OCR (tesseract)' },
      { src: 'extract', msg: 'ocr · 6,812 chars from 4 pages', level: 'ok' },
      { src: 'ai', msg: 'description + 5 tags · json ok' },
      { src: 'embed', msg: 'nomic-embed-text · 5 chunks' },
      { src: 'dupes', msg: 'similar to tarifa_proveedor_2025.pdf · 0.94', level: 'warn' },
      { src: 'version', msg: 'v3 registered · approval requested' },
      { src: 'mail', msg: 'reviewers notified', level: 'ok' },
    ],
  },
  {
    id: 'whatsapp-desk',
    pid: '0x05',
    name: { en: 'WhatsApp Sales Desk', es: 'Mostrador comercial de WhatsApp' },
    path: '/srv/sales/whatsapp-desk',
    domain: 'platform',
    visual: 'bridge',
    tagline: {
      en: 'An AI answers on WhatsApp; the whole team steps in from Discord, from one single number',
      es: 'Una IA atiende por WhatsApp y todo el equipo entra desde Discord, con un único número',
    },
    summary: {
      en: 'A sales assistant on the company’s WhatsApp that recommends from the real catalogue — and, the moment a customer asks for a person, opens a private Discord channel where several teammates can answer from the same WhatsApp number, files included, then hand the chat back to the AI.',
      es: 'Un asistente comercial en el WhatsApp de la empresa que recomienda a partir del catálogo real y, en cuanto un cliente pide una persona, abre un canal privado de Discord donde varios compañeros pueden responder desde el mismo número de WhatsApp, archivos incluidos, y luego devolver el chat a la IA.',
    },
    problem: {
      en: 'A WhatsApp number can only be in one pair of hands. Customers write at all hours, the same questions get answered again and again, and when a real person is needed, the chat is stuck on one phone and nobody else knows what was said.',
      es: 'Un número de WhatsApp solo puede estar en unas manos. Los clientes escriben a todas horas, las mismas preguntas se responden una y otra vez, y cuando hace falta una persona de verdad, el chat está atado a un móvil y nadie más sabe qué se ha dicho.',
    },
    solution: {
      en: 'A bot on whatsapp-web.js answers with an AI model grounded in the catalogue, which is refreshed every day by a scraper. Each customer gets their own private Discord channel, created silently in the background. Writing “asistente” opens the bridge: everything flows both ways — text, photos, PDFs — agents appear on WhatsApp with their name, and “!cerrar” gives the conversation back to the AI.',
      es: 'Un bot sobre whatsapp-web.js responde con un modelo de IA anclado al catálogo, que un scraper actualiza cada día. Cada cliente tiene su propio canal privado de Discord, creado en segundo plano. Escribir «asistente» abre el puente: todo fluye en los dos sentidos —texto, fotos, PDFs—, los agentes aparecen en WhatsApp con su nombre y «!cerrar» devuelve la conversación a la IA.',
    },
    suiteTitle: { en: 'How the desk works', es: 'Cómo funciona el mostrador' },
    suite: [
      {
        name: { en: 'Recommends from the real catalogue', es: 'Recomienda desde el catálogo real' },
        line: {
          en: 'It works out use case and budget, picks candidates and asks the model for at most three recommendations — never an invented price or URL, never an impossible combination.',
          es: 'Deduce el uso y el presupuesto, elige candidatos y pide al modelo como mucho tres recomendaciones: nunca un precio ni una URL inventados, nunca una combinación imposible.',
        },
      },
      {
        name: { en: 'A channel per customer', es: 'Un canal por cliente' },
        line: {
          en: 'The first message creates the customer’s private Discord channel, visible only to the staff role, and renames it with their name once they confirm it. The team can step in at any time, even before anyone asks.',
          es: 'El primer mensaje crea el canal privado del cliente en Discord, visible solo para el rol del equipo, y lo renombra con su nombre en cuanto lo confirma. El equipo puede entrar cuando quiera, incluso antes de que nadie lo pida.',
        },
      },
      {
        name: { en: 'Many people, one number', es: 'Muchas personas, un número' },
        line: {
          en: 'Whatever any teammate writes in the channel reaches the customer on WhatsApp, signed with their name; whatever the customer sends — text, photos, documents, audio — lands in the channel.',
          es: 'Lo que cualquier compañero escriba en el canal le llega al cliente por WhatsApp, firmado con su nombre; lo que envíe el cliente —texto, fotos, documentos, audio— aparece en el canal.',
        },
      },
      {
        name: { en: 'Back to the AI with one word', es: 'De vuelta a la IA con una palabra' },
        line: {
          en: '“!cerrar” closes the bridge and tells both sides; writing again in a closed channel reopens it automatically. The mapping survives restarts and follows the customer across WhatsApp id changes.',
          es: '«!cerrar» cierra el puente y avisa a los dos lados; volver a escribir en un canal cerrado lo reabre solo. La relación entre cliente y canal sobrevive a los reinicios y sigue al cliente aunque WhatsApp le cambie el identificador.',
        },
      },
    ],
    built: {
      en: [
        'Catalogue refreshed every 24 h by a Python scraper launched from the bot, then re-indexed by product, capacity and price',
        'The customer’s name is asked once, confirmed and remembered, and used naturally in every answer',
        'Demand insights: what customers ask for and what gets recommended, summarised for the sales team',
        'Health watchdog and real reconnection when WhatsApp Web breaks, with global anti-crash guards',
        'Long answers split to fit WhatsApp, contact cards (vCard) and broadcast lists with a safe pace',
      ],
      es: [
        'Catálogo actualizado cada 24 h por un scraper en Python que lanza el propio bot, y reindexado por producto, capacidad y precio',
        'El nombre del cliente se pide una vez, se confirma y se recuerda, y se usa con naturalidad en cada respuesta',
        'Información de demanda: qué piden los clientes y qué se les recomienda, resumido para el equipo comercial',
        'Vigilante de salud y reconexión real cuando WhatsApp Web se rompe, con protecciones globales contra caídas',
        'Respuestas largas partidas para WhatsApp, tarjetas de contacto (vCard) y listas de difusión a ritmo seguro',
      ],
    },
    specs: [
      { key: { en: 'channel', es: 'canal' }, value: same('WhatsApp · whatsapp-web.js') },
      { key: { en: 'team', es: 'equipo' }, value: same('Discord · discord.js') },
      { key: { en: 'ai', es: 'ia' }, value: same('Gemini 2.5 Flash') },
      { key: { en: 'catalogue', es: 'catálogo' }, value: { en: 'daily scraper · Python', es: 'scraper diario · Python' } },
      { key: { en: 'handoff', es: 'relevo' }, value: { en: '“asistente” ↔ “!cerrar”', es: '«asistente» ↔ «!cerrar»' } },
      { key: { en: 'runtime', es: 'runtime' }, value: same('Node.js') },
    ],
    pipeline: [
      { label: { en: 'Customer writes', es: 'Escribe el cliente' }, detail: { en: 'On WhatsApp.', es: 'Por WhatsApp.' } },
      { label: { en: 'AI answers', es: 'Responde la IA' }, detail: { en: 'From the catalogue.', es: 'Desde el catálogo.' } },
      { label: { en: '“asistente”', es: '«asistente»' }, detail: { en: 'Asks for a person.', es: 'Pide una persona.' } },
      { label: same('Discord'), detail: { en: 'Private channel, team alerted.', es: 'Canal privado, equipo avisado.' } },
      { label: { en: 'Team replies', es: 'Responde el equipo' }, detail: { en: 'Same WhatsApp number.', es: 'Mismo número de WhatsApp.' } },
      { label: same('!cerrar'), detail: { en: 'Back to the AI.', es: 'Vuelta a la IA.' } },
    ],
    stack: ['nodejs', 'whatsappWebJs', 'whatsapp', 'discordjs', 'discord', 'gemini', 'llm', 'python', 'apis'],
    trace: [
      { src: 'wa', msg: 'message from customer · session restored' },
      { src: 'discord', msg: 'private channel ensured · staff only', level: 'ok' },
      { src: 'ai', msg: 'intent: 3D design · budget ~2,000 €' },
      { src: 'ai', msg: '3 recommendations · urls from catalogue', level: 'ok' },
      { src: 'wa', msg: '"asistente" → handoff opened', level: 'warn' },
      { src: 'discord', msg: '@everyone · new WhatsApp enquiry' },
      { src: 'bridge', msg: 'agent reply → WhatsApp · file forwarded', level: 'ok' },
      { src: 'bridge', msg: '!cerrar → AI active again', level: 'ok' },
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
