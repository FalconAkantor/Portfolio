import type { Localized } from '../i18n/types';
import type { TechId } from './stack';

/** Same text in every language (technical names, product names…). */
export const same = (text: string): Localized => ({ en: text, es: text });

export type ProjectId =
  | 'inventory-ai'
  | 'cctv'
  | 'stock-audit'
  | 'rag'
  | 'production'
  | 'purchasing-agent'
  | 'distributor-search'
  | 'margin-calculator'
  | 'monitoring'
  | 'gpu-infra'
  | 'vast-analyzer';

export type ProjectDomain = 'vision' | 'automation' | 'ai' | 'data' | 'observability' | 'infrastructure';

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

export interface Project {
  id: ProjectId;
  /** Process id shown in the explorer — purely a visual identifier. */
  pid: string;
  name: Localized;
  /** Module path inside NACHO.SYS — purely visual. */
  path: string;
  domain: ProjectDomain;
  featured: boolean;
  summary: Localized;
  problem: Localized;
  solution: Localized;
  built: Localized<string[]>;
  specs: ProjectSpec[];
  pipeline: PipelineStep[];
  stack: TechId[];
  trace: TraceLine[];
}

export const projects: Project[] = [
  {
    id: 'inventory-ai',
    pid: '0x01',
    name: { en: 'AI Inventory', es: 'Inventario IA' },
    path: '/srv/ai/inventory',
    domain: 'ai',
    featured: true,
    summary: {
      en: 'A complete platform that keeps a network of eyewear displays in pharmacies stocked: it asks every pharmacy for photos over WhatsApp, a local multimodal AI counts each unit, and the replenishment list arrives every morning.',
      es: 'Una plataforma completa que mantiene abastecida una red de expositores de gafas en farmacias: pide las fotos a cada farmacia por WhatsApp, una IA multimodal local cuenta cada unidad y la lista de reposición llega cada mañana.',
    },
    problem: {
      en: 'An eyewear brand with displays in a large network of pharmacies had no way to know what each display was missing short of calling, visiting or waiting for the pharmacy to ask — and no data on what actually sells.',
      es: 'Una marca de gafas con expositores en una gran red de farmacias no tenía forma de saber qué le faltaba a cada expositor salvo llamar, visitar o esperar a que la farmacia avisara, y tampoco tenía datos de qué se vende de verdad.',
    },
    solution: {
      en: 'A Flask platform with fully local AI (Ollama + Qwen multimodal). A WhatsApp bot runs review rounds on its own, each pharmacy uploads one photo per display through a personal link, and the AI analyses all photos jointly, deduplicates units and compares them with the expected stock in the database. Confirmed shortfalls reach a Telegram group as a single daily Excel; sales insights, PDF reports, a zoned map and self-service onboarding complete the system.',
      es: 'Una plataforma Flask con IA 100 % local (Ollama + Qwen multimodal). Un bot de WhatsApp lanza solo las rondas de revisión, cada farmacia sube una foto por expositor desde su enlace personal y la IA analiza todas las fotos en conjunto, deduplica unidades y las compara con el stock esperado de la base de datos. Los faltantes confirmados llegan a un grupo de Telegram en un único Excel diario; datos de ventas, informes PDF, un mapa por zonas y altas en autoservicio completan el sistema.',
    },
    built: {
      en: [
        'Joint analysis of every photo with a local multimodal model (Ollama + Qwen): units seen in several photos are counted once',
        'Expected stock always comes from the database — the AI only estimates what is physically there and never replaces it',
        'Validation and safe recovery of the AI’s JSON; unknown products are flagged, never invented; High / Medium / Low confidence and a “review needed” warning',
        'Shortfalls, surpluses and unrecognised products; manual correction with automatic recalculation; every change audited',
        'WhatsApp bot (Node.js gateway on Baileys, started and supervised by Flask): automatic rounds every 45 days, personal upload link valid for 24 h, at most two reminders 48 h apart',
        'Anti-blocking rules: daily cap, one message at a time 30–60 s apart, weekdays 9:00–20:00, a queue that survives disconnections and a 12-month sending calendar',
        'Zones: nearby pharmacies clustered with k-means in pure Python, one round per zone; new pharmacies join automatically, zone changes are proposed and approved by the admin',
        'Map (Leaflet + OpenStreetMap) and smart location search (Photon) with duplicate warnings and batch geolocation',
        'Self-service onboarding: a registration link valid for 24 h, exact map location, phone typed twice, approval queue and WhatsApp confirmations',
        'Telegram group with one topic per notice type, kept alive by the bot: photos, daily Excel at 08:00, WhatsApp, zones, sign-ups, reports, alerts, backups, access link — plus /estado, /enlace, /temas and /ayuda',
        'Daily replenishment Excel: a summary sheet plus one sheet per pharmacy; every shortfall is exported exactly once',
        'Sales insights (a shortfall ≈ a sale): top models and colours, by province and pharmacy, monthly trend and slow movers',
        'Automatic PDF reports — monthly, quarterly, half-yearly and yearly — compared with the previous period',
        'Nightly backups (local and to Telegram, never with secrets); recovers on its own after a power cut and sends the new access link',
        'Security: password hashing, CSRF, file validation, safe names, path-traversal protection and per-IP login lockout behind Cloudflare Tunnel',
        'Settings editable from the panel, built-in help assistant, AI usage tracking with monthly forecast and a REST API',
        'Demo engine with 1,200 real pharmacies from OpenStreetMap and months of simulated activity, plus a production reset with a client-handover mode',
        'Runs on Linux and Windows (Raspberry Pi install script included); documented with a user manual, client guide, demo script and pharmacy onboarding flyer',
      ],
      es: [
        'Análisis conjunto de todas las fotos con un modelo multimodal local (Ollama + Qwen): una unidad que aparece en varias fotos se cuenta una sola vez',
        'El stock esperado sale siempre de la base de datos: la IA solo estima lo que hay físicamente y nunca lo sustituye',
        'Validación y recuperación segura del JSON de la IA; los productos desconocidos se marcan, nunca se inventan; confianza Alta / Media / Baja y aviso de «revisión necesaria»',
        'Faltantes, sobrantes y productos no reconocidos; corrección manual con recálculo automático; cada cambio queda auditado',
        'Bot de WhatsApp (gateway Node.js sobre Baileys, arrancado y vigilado por Flask): rondas automáticas cada 45 días, enlace personal de subida válido 24 h y como mucho dos recordatorios separados 48 h',
        'Reglas anti-bloqueo: tope diario, mensajes de uno en uno con 30–60 s de pausa, de lunes a viernes de 9:00 a 20:00, cola que sobrevive a las desconexiones y calendario de envíos a 12 meses',
        'Zonas: farmacias cercanas agrupadas con k-means en Python puro y una ronda por zona; las nuevas entran solas y los cambios de zona se proponen y los aprueba el admin',
        'Mapa (Leaflet + OpenStreetMap) y buscador inteligente de ubicación (Photon) con aviso de duplicados y localización en lote',
        'Altas en autoservicio: enlace de registro válido 24 h, ubicación exacta en el mapa, teléfono escrito dos veces, cola de aprobación y confirmaciones por WhatsApp',
        'Grupo de Telegram con un tema por tipo de aviso que el bot mantiene: fotos, Excel diario a las 08:00, WhatsApp, zonas, altas, informes, alertas, copias y enlace de acceso, más /estado, /enlace, /temas y /ayuda',
        'Excel diario de reposición: hoja de resumen y una hoja por farmacia; cada faltante se exporta una única vez',
        'Datos de ventas (faltante ≈ venta): modelos y colores más vendidos, por provincia y farmacia, evolución mensual y productos sin rotación',
        'Informes PDF automáticos —mensual, trimestral, semestral y anual— comparados con el periodo anterior',
        'Copias nocturnas (locales y a Telegram, nunca con claves); se recupera sola tras un corte de luz y envía el nuevo enlace de acceso',
        'Seguridad: hash de contraseñas, CSRF, validación de archivos, nombres seguros, protección contra path traversal y bloqueo de login por IP tras Cloudflare Tunnel',
        'Ajustes editables desde el panel, asistente de ayuda integrado, control del consumo de IA con previsión mensual y API REST',
        'Motor de demo con 1.200 farmacias reales de OpenStreetMap y meses de actividad simulada, y reinicio a producción con modo de entrega al cliente',
        'Funciona en Linux y Windows (script de instalación para Raspberry Pi incluido); documentado con manual de usuario, guía para el cliente, guion de demo y folleto para las farmacias',
      ],
    },
    specs: [
      { key: { en: 'backend', es: 'backend' }, value: same('Flask · SQLAlchemy · SQLite') },
      { key: { en: 'ai', es: 'ia' }, value: { en: 'Ollama · Qwen multimodal · 100% local', es: 'Ollama · Qwen multimodal · 100 % local' } },
      { key: { en: 'channel', es: 'canal' }, value: { en: 'WhatsApp bot · Baileys gateway', es: 'bot de WhatsApp · gateway Baileys' } },
      { key: { en: 'cycle', es: 'ciclo' }, value: { en: '45 days · 24 h link · 2 reminders', es: '45 días · enlace 24 h · 2 recordatorios' } },
      { key: { en: 'operations', es: 'operación' }, value: { en: 'Telegram group with topics', es: 'grupo de Telegram con temas' } },
      { key: { en: 'output', es: 'salida' }, value: { en: 'daily Excel · PDF reports', es: 'Excel diario · informes PDF' } },
      { key: { en: 'geo', es: 'geo' }, value: same('Leaflet · OpenStreetMap · Photon · k-means') },
      { key: { en: 'load test', es: 'prueba de carga' }, value: { en: '1,200 real pharmacies (OSM)', es: '1.200 farmacias reales (OSM)' } },
    ],
    pipeline: [
      { label: { en: 'Zone round', es: 'Ronda por zona' }, detail: { en: 'Every 45 days, scheduled within the daily cap.', es: 'Cada 45 días, planificada dentro del tope diario.' } },
      { label: same('WhatsApp'), detail: { en: 'Personal upload link, valid for 24 h.', es: 'Enlace personal de subida, válido 24 h.' } },
      { label: { en: 'Photos', es: 'Fotos' }, detail: { en: 'One per display, from the phone. No app.', es: 'Una por expositor, desde el móvil. Sin app.' } },
      { label: { en: 'Local vision AI', es: 'IA de visión local' }, detail: { en: 'Qwen on Ollama reads every photo jointly.', es: 'Qwen en Ollama lee todas las fotos en conjunto.' } },
      { label: { en: 'Deduplicate', es: 'Deduplicar' }, detail: { en: 'Aggregated by code and colour.', es: 'Agregado por código y color.' } },
      { label: { en: 'Compare', es: 'Comparar' }, detail: { en: 'Against expected stock from the database.', es: 'Contra el stock esperado de la base de datos.' } },
      { label: { en: 'Telegram · Excel', es: 'Telegram · Excel' }, detail: { en: 'Instant notice; replenishment Excel at 08:00.', es: 'Aviso al momento; Excel de reposición a las 08:00.' } },
      { label: { en: 'Sales · PDF', es: 'Ventas · PDF' }, detail: { en: 'Shortfalls become sales data and reports.', es: 'Los faltantes se convierten en datos de venta e informes.' } },
    ],
    stack: [
      'python', 'flask', 'sqlalchemy', 'sqlite', 'ollama', 'qwen', 'llm', 'imageProcessing', 'whatsapp', 'baileys', 'nodejs',
      'telegram', 'excel', 'pdf', 'fpdf2', 'leaflet', 'osm', 'kmeans', 'rest', 'cloudflareTunnel', 'linux', 'windows', 'raspberryPi',
    ],
    trace: [
      { src: 'zones', msg: 'round planned for zone within daily cap' },
      { src: 'wa', msg: 'message sent · personal link (24 h)', level: 'ok' },
      { src: 'upload', msg: 'photos received from pharmacy' },
      { src: 'qwen', msg: 'joint analysis of all photos (local)' },
      { src: 'dedup', msg: 'units merged by code + colour' },
      { src: 'json', msg: 'model output validated', level: 'ok' },
      { src: 'compare', msg: 'expected vs detected · shortfalls found', level: 'warn' },
      { src: 'telegram', msg: 'notice posted to photos topic', level: 'ok' },
      { src: 'excel', msg: 'daily replenishment workbook @ 08:00', level: 'ok' },
      { src: 'backup', msg: 'nightly copy stored (no secrets)', level: 'ok' },
    ],
  },
  {
    id: 'cctv',
    pid: '0x02',
    name: { en: 'AI CCTV', es: 'CCTV con IA' },
    path: '/srv/vision/cctv',
    domain: 'vision',
    featured: true,
    summary: {
      en: 'Multi-camera surveillance that detects people, records on schedule and reports its own health.',
      es: 'Videovigilancia multicámara que detecta personas, graba por horario e informa de su propio estado.',
    },
    problem: {
      en: 'Conventional CCTV records everything and understands nothing: hours of footage, nobody watching it, and no signal when something actually happens.',
      es: 'El CCTV convencional lo graba todo y no entiende nada: horas de vídeo, nadie mirándolas y ninguna señal cuando de verdad pasa algo.',
    },
    solution: {
      en: 'A system that connects to IP cameras over RTSP, runs YOLO person detection on NVIDIA GPUs and turns raw streams into organised recordings, detection videos and Discord reports.',
      es: 'Un sistema que se conecta a cámaras IP por RTSP, ejecuta detección de personas con YOLO en GPUs NVIDIA y convierte los streams en grabaciones ordenadas, vídeos de detección e informes en Discord.',
    },
    built: {
      en: [
        'Simultaneous connection to multiple RTSP cameras',
        'Frame capture and processing pipeline',
        'Person detection with YOLOv5 accelerated by CUDA',
        'Recordings plus derived videos with the detections drawn in',
        'Recording schedules: the system only records inside configured time windows',
        'Recordings stored and organised by day',
        'Health monitoring of cameras and of the system itself',
        'Inference statistics tracking',
        'Status and events delivered through Discord',
      ],
      es: [
        'Conexión simultánea a múltiples cámaras RTSP',
        'Pipeline de captura y procesamiento de frames',
        'Detección de personas con YOLOv5 acelerada por CUDA',
        'Grabaciones y vídeos derivados con las detecciones dibujadas',
        'Control de horarios: el sistema graba solo dentro de las franjas configuradas',
        'Grabaciones almacenadas y organizadas por días',
        'Monitorización del estado de las cámaras y del propio sistema',
        'Control de estadísticas de inferencia',
        'Estado y eventos enviados mediante Discord',
      ],
    },
    specs: [
      { key: { en: 'input', es: 'entrada' }, value: { en: 'RTSP · multiple cameras', es: 'RTSP · múltiples cámaras' } },
      { key: { en: 'model', es: 'modelo' }, value: same('YOLOv5 · person detection') },
      { key: { en: 'inference', es: 'inferencia' }, value: { en: 'NVIDIA GPU · CUDA', es: 'GPU NVIDIA · CUDA' } },
      { key: { en: 'hardware', es: 'hardware' }, value: { en: 'RTX 4090 · multi-GPU', es: 'RTX 4090 · multi-GPU' } },
      { key: { en: 'video', es: 'vídeo' }, value: { en: 'FFmpeg · derived detection clips', es: 'FFmpeg · clips derivados con detecciones' } },
      { key: { en: 'storage', es: 'almacenamiento' }, value: { en: 'per-day archive', es: 'archivo por días' } },
      { key: { en: 'reporting', es: 'avisos' }, value: same('Discord') },
    ],
    pipeline: [
      { label: { en: 'RTSP camera', es: 'Cámara RTSP' }, detail: { en: 'IP cameras stream over RTSP; several at once.', es: 'Cámaras IP emitiendo por RTSP, varias a la vez.' } },
      { label: { en: 'Frame capture', es: 'Captura de frames' }, detail: { en: 'Frames are pulled from each stream for processing.', es: 'Se extraen frames de cada stream para procesarlos.' } },
      { label: same('YOLO'), detail: { en: 'YOLOv5 runs on the GPU with CUDA.', es: 'YOLOv5 se ejecuta en GPU con CUDA.' } },
      { label: { en: 'Detection', es: 'Detección' }, detail: { en: 'People are detected and marked in the frame.', es: 'Se detectan personas y se marcan en el frame.' } },
      { label: { en: 'Video pipeline', es: 'Pipeline de vídeo' }, detail: { en: 'Recordings and derived videos with detections, via FFmpeg.', es: 'Grabaciones y vídeos derivados con detecciones, vía FFmpeg.' } },
      { label: { en: 'Storage', es: 'Almacenamiento' }, detail: { en: 'Organised by day, inside the recording schedule.', es: 'Organizado por días, dentro del horario de grabación.' } },
      { label: same('Discord'), detail: { en: 'Status, events and statistics reach Discord.', es: 'Estado, eventos y estadísticas llegan a Discord.' } },
    ],
    stack: ['python', 'yolov5', 'pytorch', 'cuda', 'nvidia', 'multiGpu', 'gpuInference', 'rtsp', 'ffmpeg', 'cctv', 'discord'],
    trace: [
      { src: 'rtsp', msg: 'stream cam-01 connected', level: 'ok' },
      { src: 'rtsp', msg: 'stream cam-02 connected', level: 'ok' },
      { src: 'yolo', msg: 'yolov5 weights loaded on cuda:0', level: 'ok' },
      { src: 'sched', msg: 'recording window open' },
      { src: 'capture', msg: 'frame queue running' },
      { src: 'detect', msg: 'class=person · event opened', level: 'warn' },
      { src: 'video', msg: 'writing detection clip (ffmpeg)' },
      { src: 'store', msg: 'archived to recordings/{date}/' },
      { src: 'stats', msg: 'inference stats updated' },
      { src: 'discord', msg: 'status report delivered', level: 'ok' },
    ],
  },
  {
    id: 'purchasing-agent',
    pid: '0x03',
    name: { en: 'Purchasing & Supplier Agent', es: 'Agente de Compras y Proveedores' },
    path: '/srv/automation/purchasing',
    domain: 'automation',
    featured: true,
    summary: {
      en: 'Cleans and normalises the price documents every supplier sends — Excel, CSV, PDF or TXT — in one batch, ready for the price updater.',
      es: 'Limpia y normaliza los documentos de precios que envía cada proveedor —Excel, CSV, PDF o TXT— en un solo lote, listos para el actualizador de precios.',
    },
    problem: {
      en: 'Every supplier sends its price list in its own format, and each product line has a different layout. Turning them into something usable was manual work repeated for every document.',
      es: 'Cada proveedor envía su lista de precios en su propio formato, y cada línea de producto tiene una estructura distinta. Convertirlas en algo utilizable era trabajo manual repetido con cada documento.',
    },
    solution: {
      en: 'A library of Python scripts, one per supplier and document type. A multi-batch mode processes many documents from different suppliers in a single run, and an Excel merger consolidates everything generated in a date range into one file for the price updater.',
      es: 'Una biblioteca de scripts Python, uno por proveedor y tipo de documento. Un modo de lote múltiple procesa muchos documentos de distintos proveedores en una sola ejecución, y un fusionador de Excel consolida todo lo generado en un rango de fechas en un único archivo para el actualizador de precios.',
    },
    built: {
      en: [
        'Input in Excel, CSV, PDF and TXT',
        'One Python cleaning script per supplier and document type (servers, motherboards, monitors, mini PCs…)',
        '“Multi batch”: one line per document — supplier, script, file — and a single run',
        'One clean output file per supplier',
        'Excel merger that consolidates every file generated from a given date and time',
        'Output ready to load into the price updater',
        'Extensible: a new supplier or format is a new script registered with its name, path, language and working directory',
      ],
      es: [
        'Entrada en Excel, CSV, PDF y TXT',
        'Un script Python de limpieza por proveedor y tipo de documento (servidores, placas, monitores, mini PC…)',
        '“Lote multi”: una línea por documento —proveedor, script, archivo— y una sola ejecución',
        'Un archivo limpio de salida por proveedor',
        'Fusionador de Excel que consolida todo lo generado desde una fecha y hora',
        'Salida lista para cargar en el actualizador de precios',
        'Ampliable: un proveedor o formato nuevo es un script nuevo, registrado con su nombre, ruta, lenguaje y directorio de trabajo',
      ],
    },
    specs: [
      { key: { en: 'input', es: 'entrada' }, value: same('Excel · CSV · PDF · TXT') },
      { key: { en: 'parsers', es: 'parsers' }, value: { en: 'one per supplier × document type', es: 'uno por proveedor × tipo de documento' } },
      { key: { en: 'language', es: 'lenguaje' }, value: same('Python') },
      { key: { en: 'mode', es: 'modo' }, value: { en: 'multi-document batch', es: 'lote multi-documento' } },
      { key: { en: 'merge', es: 'fusión' }, value: { en: 'Excel merger by date range', es: 'fusionador Excel por rango de fechas' } },
      { key: { en: 'output', es: 'salida' }, value: { en: 'price updater file', es: 'archivo para el actualizador de precios' } },
    ],
    pipeline: [
      { label: { en: 'Supplier files', es: 'Archivos de proveedor' }, detail: { en: 'Price lists in Excel, CSV, PDF or TXT.', es: 'Listas de precios en Excel, CSV, PDF o TXT.' } },
      { label: { en: 'Batch', es: 'Lote' }, detail: { en: 'Each document paired with its supplier and script.', es: 'Cada documento asociado a su proveedor y script.' } },
      { label: { en: 'Parser', es: 'Parser' }, detail: { en: 'The supplier-specific Python script runs.', es: 'Se ejecuta el script Python específico del proveedor.' } },
      { label: { en: 'Clean file', es: 'Archivo limpio' }, detail: { en: 'One normalised output per supplier.', es: 'Una salida normalizada por proveedor.' } },
      { label: { en: 'Excel merger', es: 'Fusionador Excel' }, detail: { en: 'Everything from a date range in one workbook.', es: 'Todo lo de un rango de fechas en un libro.' } },
      { label: { en: 'Price updater', es: 'Actualizador de precios' }, detail: { en: 'The file is loaded to update prices.', es: 'El archivo se carga para actualizar precios.' } },
    ],
    stack: ['python', 'excel', 'csv', 'pdf', 'etl', 'dataProcessing'],
    trace: [
      { src: 'batch', msg: 'batch created · documents queued' },
      { src: 'map', msg: 'supplier → script resolved for each line', level: 'ok' },
      { src: 'parse', msg: 'reading pdf price list' },
      { src: 'parse', msg: 'reading xlsx price list' },
      { src: 'clean', msg: 'columns normalised · rows validated' },
      { src: 'out', msg: 'clean file written per supplier', level: 'ok' },
      { src: 'merge', msg: 'merging outputs since selected timestamp' },
      { src: 'out', msg: 'price-updater workbook ready', level: 'ok' },
    ],
  },
  {
    id: 'distributor-search',
    pid: '0x04',
    name: { en: 'Distributor Search', es: 'Buscador de distribuidores' },
    path: '/srv/data/distributors',
    domain: 'data',
    featured: true,
    summary: {
      en: 'One search across several IT wholesalers: availability and price side by side, exportable, with e-mail alerts when a product is back in stock.',
      es: 'Una sola búsqueda en varios mayoristas de informática: disponibilidad y precio lado a lado, exportable, con alertas por email cuando un producto vuelve a tener stock.',
    },
    problem: {
      en: 'Finding a product meant checking each wholesaler’s site one by one, comparing prices by hand and checking back later to see whether stock had arrived.',
      es: 'Encontrar un producto suponía revisar la web de cada mayorista una a una, comparar precios a mano y volver a mirar más tarde por si había entrado stock.',
    },
    solution: {
      en: 'A search tool that queries several wholesalers at once by part number, brand, model, SKU or EAN, shows availability and price per wholesaler, filters by stock and price range, exports to CSV or Excel, and watches products hourly to e-mail an alert when they are available again.',
      es: 'Un buscador que consulta varios mayoristas a la vez por part number, marca, modelo, SKU o EAN, muestra disponibilidad y precio por mayorista, filtra por stock y rango de precios, exporta a CSV o Excel y vigila productos cada hora para avisar por email cuando vuelven a estar disponibles.',
    },
    built: {
      en: [
        'Search across several wholesalers at once',
        'Lookup by part number, brand, model, SKU or EAN',
        'Availability and price per wholesaler',
        'Filters: in stock only, minimum and maximum price',
        'Export of results to CSV or Excel',
        'Stock alerts by e-mail, checked every hour',
        'Alert management: pause an alert or delete it',
      ],
      es: [
        'Búsqueda simultánea en varios mayoristas',
        'Consulta por part number, marca, modelo, SKU o EAN',
        'Disponibilidad y precio por mayorista',
        'Filtros: solo con stock, precio mínimo y máximo',
        'Exportación de resultados a CSV o Excel',
        'Alertas de stock por email, revisadas cada hora',
        'Gestión de alertas: pausar una alerta o eliminarla',
      ],
    },
    specs: [
      { key: { en: 'sources', es: 'fuentes' }, value: { en: 'multiple IT wholesalers', es: 'varios mayoristas de informática' } },
      { key: { en: 'query', es: 'consulta' }, value: same('part number · SKU · EAN · brand · model') },
      { key: { en: 'filters', es: 'filtros' }, value: { en: 'stock · price range', es: 'stock · rango de precio' } },
      { key: { en: 'export', es: 'exportación' }, value: same('CSV · Excel') },
      { key: { en: 'alerts', es: 'alertas' }, value: { en: 'e-mail · hourly check', es: 'email · revisión cada hora' } },
    ],
    pipeline: [
      { label: { en: 'Query', es: 'Consulta' }, detail: { en: 'Part number, SKU, EAN, brand or model.', es: 'Part number, SKU, EAN, marca o modelo.' } },
      { label: { en: 'Wholesalers', es: 'Mayoristas' }, detail: { en: 'Several sources queried at once.', es: 'Varias fuentes consultadas a la vez.' } },
      { label: { en: 'Normalise', es: 'Normalizar' }, detail: { en: 'Availability and price in one view.', es: 'Disponibilidad y precio en una sola vista.' } },
      { label: { en: 'Filter', es: 'Filtrar' }, detail: { en: 'In stock, within a price range.', es: 'Con stock, dentro de un rango de precio.' } },
      { label: { en: 'Export', es: 'Exportar' }, detail: { en: 'CSV or Excel for analysis.', es: 'CSV o Excel para analizar.' } },
      { label: { en: 'Watch', es: 'Vigilar' }, detail: { en: 'Hourly availability check.', es: 'Revisión de disponibilidad cada hora.' } },
      { label: { en: 'E-mail alert', es: 'Aviso por email' }, detail: { en: 'Sent when the product is back.', es: 'Se envía cuando el producto vuelve.' } },
    ],
    stack: ['dataProcessing', 'csv', 'excel', 'email'],
    trace: [
      { src: 'query', msg: 'part number received' },
      { src: 'fetch', msg: 'querying wholesalers' },
      { src: 'merge', msg: 'availability and price normalised', level: 'ok' },
      { src: 'filter', msg: 'in-stock · price range applied' },
      { src: 'export', msg: 'results.xlsx generated', level: 'ok' },
      { src: 'alert', msg: 'watch registered · hourly check' },
      { src: 'alert', msg: 'product back in stock', level: 'warn' },
      { src: 'mail', msg: 'notification e-mail sent', level: 'ok' },
    ],
  },
  {
    id: 'margin-calculator',
    pid: '0x05',
    name: { en: 'Gross Margin Calculator', es: 'Calculadora de márgenes brutos' },
    path: '/srv/data/margins',
    domain: 'data',
    featured: true,
    summary: {
      en: 'Quarterly or annual gross-margin reports built straight from ERP sales and cost data, exportable to Excel at every level of detail.',
      es: 'Informes trimestrales o anuales de margen bruto generados directamente desde los datos de ventas y costes del ERP, exportables a Excel con cualquier nivel de detalle.',
    },
    problem: {
      en: 'Knowing the real gross margin of a period meant pulling delivery notes, invoices, customers, items, sale prices and costs out of the ERP and assembling the report by hand.',
      es: 'Conocer el margen bruto real de un periodo obligaba a sacar del ERP albaranes, facturas, clientes, artículos, precios de venta y costes, y montar el informe a mano.',
    },
    solution: {
      en: 'A tool that, for a selected quarter or year, computes sales, costs and gross margin from ERP data and exports the analysis to Excel: full margins, detailed sales with one sheet per customer, grouped sales, and sales by product family and subfamily.',
      es: 'Una herramienta que, para el trimestre o año seleccionado, calcula ventas, costes y margen bruto a partir de los datos del ERP y exporta el análisis a Excel: márgenes completos, ventas detalladas con una hoja por cliente, ventas agrupadas y ventas por familia y subfamilia de artículo.',
    },
    built: {
      en: [
        'Period selection: quarter or full year',
        'Totals: sales, cost and gross margin for the period',
        'Breakdown by delivery note, customer, item, sale price and cost',
        'Export: full margins in Excel, filterable by column',
        'Export: detailed sales with one sheet per customer (line, invoice, date, item, serial number, units, prices, margin)',
        'Export: sales grouped by delivery note',
        'Export: sales by product family and by subfamily',
      ],
      es: [
        'Selección de periodo: trimestre o año completo',
        'Totales: ventas, coste y margen bruto del periodo',
        'Desglose por albarán, cliente, artículo, precio de venta y coste',
        'Exportación: márgenes completos en Excel, filtrables por columna',
        'Exportación: ventas detalladas con una hoja por cliente (línea, factura, fecha, artículo, nº de serie, unidades, precios, margen)',
        'Exportación: ventas agrupadas por albarán',
        'Exportación: ventas por familia y por subfamilia de artículo',
      ],
    },
    specs: [
      { key: { en: 'source', es: 'origen' }, value: { en: 'ERP · delivery notes · invoices', es: 'ERP · albaranes · facturas' } },
      { key: { en: 'period', es: 'periodo' }, value: { en: 'quarter · year', es: 'trimestre · año' } },
      { key: { en: 'computes', es: 'calcula' }, value: { en: 'sales · cost · gross margin', es: 'ventas · coste · margen bruto' } },
      { key: { en: 'views', es: 'vistas' }, value: { en: 'customer · item · family · subfamily', es: 'cliente · artículo · familia · subfamilia' } },
      { key: { en: 'output', es: 'salida' }, value: same('Excel (.xlsx)') },
    ],
    pipeline: [
      { label: same('ERP'), detail: { en: 'Delivery notes, invoices, customers, items.', es: 'Albaranes, facturas, clientes, artículos.' } },
      { label: { en: 'Period', es: 'Periodo' }, detail: { en: 'Quarter or year selected.', es: 'Trimestre o año seleccionado.' } },
      { label: { en: 'Sales & cost', es: 'Venta y coste' }, detail: { en: 'Sale and cost price per line.', es: 'Precio de venta y coste por línea.' } },
      { label: { en: 'Gross margin', es: 'Margen bruto' }, detail: { en: 'Computed per line and in total.', es: 'Calculado por línea y en total.' } },
      { label: { en: 'Grouping', es: 'Agrupación' }, detail: { en: 'Customer, delivery note, family, subfamily.', es: 'Cliente, albarán, familia, subfamilia.' } },
      { label: same('Excel'), detail: { en: 'Reports ready to analyse and share.', es: 'Informes listos para analizar y compartir.' } },
    ],
    stack: ['erp', 'dataProcessing', 'excel'],
    trace: [
      { src: 'erp', msg: 'loading delivery notes for period' },
      { src: 'erp', msg: 'invoices, customers and items joined', level: 'ok' },
      { src: 'calc', msg: 'sale and cost totals per line' },
      { src: 'calc', msg: 'gross margin computed' },
      { src: 'group', msg: 'by customer · family · subfamily' },
      { src: 'xlsx', msg: 'one sheet per customer written' },
      { src: 'xlsx', msg: 'margin report exported', level: 'ok' },
    ],
  },
  {
    id: 'vast-analyzer',
    pid: '0x06',
    name: { en: 'Vast.ai Market Analyzer', es: 'Analizador de mercado Vast.ai' },
    path: '/srv/infra/vast-analyzer',
    domain: 'infrastructure',
    featured: true,
    summary: {
      en: 'Maps the GPU market on the Vast.ai network — supply, occupancy, profitability — and places an operator’s own hosting against it, globally and by country.',
      es: 'Mapea el mercado de GPUs de la red Vast.ai —oferta, ocupación, rentabilidad— y sitúa el hosting propio frente a él, a nivel global y por país.',
    },
    problem: {
      en: 'Renting out GPUs on Vast.ai means deciding which hardware, configuration and pricing make sense — without a clear picture of what the rest of the network looks like.',
      es: 'Alquilar GPUs en Vast.ai obliga a decidir qué hardware, configuración y precio tienen sentido, sin una imagen clara de cómo es el resto de la red.',
    },
    solution: {
      en: 'An analyzer that crawls the network through the Vast.ai API with rate-limited concurrency, aggregates the offer by GPU model, configuration, VRAM and country, measures occupancy and profitability, and ranks the operator’s own position worldwide and locally.',
      es: 'Un analizador que recorre la red mediante la API de Vast.ai con concurrencia limitada, agrega la oferta por modelo de GPU, configuración, VRAM y país, mide ocupación y rentabilidad, y sitúa la posición propia a nivel mundial y local.',
    },
    built: {
      en: [
        'Network-wide collection through the Vast.ai API',
        'Rate-limited API concurrency, so the host is never flagged for saturating the network',
        'Top GPUs by units on the network',
        'Popularity of multi-GPU configurations',
        'Distribution by VRAM',
        'Ranking of countries by number of GPUs',
        'Full GPU ranking: most profitable models, total and available units',
        'Occupancy level per model and globally',
        'Own position worldwide and by country: hosting quality and earnings per hour',
        'Market insights to decide what to rent, how and at what price',
      ],
      es: [
        'Recogida de datos de toda la red mediante la API de Vast.ai',
        'Concurrencia de API limitada, para no saturar la red ni arriesgar el baneo del host',
        'Top de GPUs por unidades en la red',
        'Popularidad de configuraciones multi-GPU',
        'Distribución por VRAM',
        'Ranking de países por número de GPUs',
        'Ranking completo de GPUs: modelos más rentables, unidades totales y disponibles',
        'Nivel de ocupación por modelo y global',
        'Posición propia a nivel mundial y por país: calidad de hosting y ganancias por hora',
        'Insights de mercado para decidir qué alquilar, cómo y a qué precio',
      ],
    },
    specs: [
      { key: { en: 'source', es: 'fuente' }, value: same('Vast.ai API') },
      { key: { en: 'safety', es: 'seguridad' }, value: { en: 'rate-limited concurrency', es: 'concurrencia limitada' } },
      { key: { en: 'dimensions', es: 'dimensiones' }, value: { en: 'model · config · VRAM · country', es: 'modelo · config · VRAM · país' } },
      { key: { en: 'metrics', es: 'métricas' }, value: { en: 'occupancy · profitability', es: 'ocupación · rentabilidad' } },
      { key: { en: 'benchmark', es: 'comparativa' }, value: { en: 'own host vs network', es: 'host propio vs red' } },
    ],
    pipeline: [
      { label: same('Vast.ai API'), detail: { en: 'Offers across the whole network.', es: 'Ofertas de toda la red.' } },
      { label: { en: 'Rate limiter', es: 'Limitador' }, detail: { en: 'Bounded concurrency, no saturation.', es: 'Concurrencia acotada, sin saturar.' } },
      { label: { en: 'Aggregate', es: 'Agregar' }, detail: { en: 'By GPU, configuration, VRAM, country.', es: 'Por GPU, configuración, VRAM, país.' } },
      { label: { en: 'Occupancy', es: 'Ocupación' }, detail: { en: 'Rented vs available units.', es: 'Unidades alquiladas vs libres.' } },
      { label: { en: 'Profitability', es: 'Rentabilidad' }, detail: { en: 'High occupancy ≠ most profitable.', es: 'Mucha ocupación ≠ más rentable.' } },
      { label: { en: 'Own position', es: 'Posición propia' }, detail: { en: 'Global and local ranking.', es: 'Ranking global y local.' } },
      { label: { en: 'Insights', es: 'Insights' }, detail: { en: 'What to rent, how and at what price.', es: 'Qué alquilar, cómo y a qué precio.' } },
    ],
    stack: ['apis', 'vastai', 'nvidia', 'multiGpu', 'dataProcessing'],
    trace: [
      { src: 'api', msg: 'fetching offers · concurrency limited' },
      { src: 'api', msg: 'page batch received', level: 'ok' },
      { src: 'agg', msg: 'grouping by gpu model and configuration' },
      { src: 'agg', msg: 'vram distribution computed' },
      { src: 'geo', msg: 'country ranking built' },
      { src: 'market', msg: 'occupancy vs profitability compared', level: 'warn' },
      { src: 'host', msg: 'own position ranked · global and local' },
      { src: 'report', msg: 'market insights ready', level: 'ok' },
    ],
  },
  {
    id: 'stock-audit',
    pid: '0x07',
    name: { en: 'WhatsApp Stock Audit', es: 'Auditoría de stock por WhatsApp' },
    path: '/srv/automation/stock-audit',
    domain: 'automation',
    featured: false,
    summary: {
      en: 'Pharmacies send photos over WhatsApp; AI checks the optical/pharmaceutical stock and returns the audit as Excel or PDF.',
      es: 'Las farmacias envían fotos por WhatsApp; la IA revisa el stock óptico/farmacéutico y devuelve la auditoría en Excel o PDF.',
    },
    problem: {
      en: 'Auditing product stock in each pharmacy meant someone counting boxes by hand, checking codes and colours, and typing the results into a spreadsheet.',
      es: 'Auditar el stock de cada farmacia suponía que alguien contara cajas a mano, revisara códigos y colores y pasara los resultados a una hoja de cálculo.',
    },
    solution: {
      en: 'A WhatsApp-driven pipeline. The pharmacy photographs its stock, the system receives the images automatically, vision AI detects the boxes and reads codes and colours, compares the result with the expected stock and generates the report.',
      es: 'Un pipeline guiado por WhatsApp. La farmacia fotografía su stock, el sistema recibe las imágenes automáticamente, la IA de visión detecta las cajas, lee códigos y colores, compara con el stock esperado y genera el informe.',
    },
    built: {
      en: [
        'A pharmacy sends photographs through WhatsApp',
        'The system receives the images automatically',
        'AI analyses every photograph',
        'Products and boxes are detected',
        'Codes and colours are identified',
        'Detected stock is compared against expected stock',
        'Results are generated',
        'Reports are produced',
        'Output as Excel and/or PDF',
      ],
      es: [
        'Una farmacia envía fotografías mediante WhatsApp',
        'El sistema recibe las imágenes automáticamente',
        'La IA analiza cada fotografía',
        'Detecta productos y cajas',
        'Identifica códigos y colores',
        'Compara el stock detectado con el stock esperado',
        'Genera resultados',
        'Produce informes',
        'Salida en Excel y/o PDF',
      ],
    },
    specs: [
      { key: { en: 'channel', es: 'canal' }, value: same('WhatsApp · whatsapp-web.js') },
      { key: { en: 'runtime', es: 'runtime' }, value: same('Node.js') },
      { key: { en: 'vision', es: 'visión' }, value: { en: 'OpenAI · image analysis', es: 'OpenAI · análisis de imagen' } },
      { key: { en: 'detects', es: 'detecta' }, value: { en: 'boxes · codes · colours', es: 'cajas · códigos · colores' } },
      { key: { en: 'check', es: 'control' }, value: { en: 'detected vs expected stock', es: 'stock detectado vs esperado' } },
      { key: { en: 'output', es: 'salida' }, value: same('Excel (ExcelJS) · PDF (PDFKit)') },
    ],
    pipeline: [
      { label: same('WhatsApp'), detail: { en: 'The pharmacy sends photos to a WhatsApp number.', es: 'La farmacia envía fotos a un número de WhatsApp.' } },
      { label: { en: 'Image', es: 'Imagen' }, detail: { en: 'Images are received and queued automatically.', es: 'Las imágenes se reciben y encolan automáticamente.' } },
      { label: { en: 'Vision AI', es: 'IA de visión' }, detail: { en: 'Each photo is analysed by the vision model.', es: 'Cada foto la analiza el modelo de visión.' } },
      { label: { en: 'Product detection', es: 'Detección de producto' }, detail: { en: 'Boxes, codes and colours are identified.', es: 'Se identifican cajas, códigos y colores.' } },
      { label: { en: 'Stock comparison', es: 'Comparación de stock' }, detail: { en: 'What was seen is checked against what should be there.', es: 'Lo visto se contrasta con lo que debería haber.' } },
      { label: { en: 'Report', es: 'Informe' }, detail: { en: 'Results are consolidated into a report.', es: 'Los resultados se consolidan en un informe.' } },
      { label: same('Excel / PDF'), detail: { en: 'Generated with ExcelJS and PDFKit.', es: 'Generado con ExcelJS y PDFKit.' } },
    ],
    stack: ['nodejs', 'whatsappWebJs', 'whatsapp', 'openai', 'imageProcessing', 'exceljs', 'excel', 'pdfkit', 'pdf'],
    trace: [
      { src: 'wa', msg: 'session ready · listening', level: 'ok' },
      { src: 'wa', msg: 'incoming media from pharmacy chat' },
      { src: 'queue', msg: 'image stored · job created' },
      { src: 'vision', msg: 'analysing photograph' },
      { src: 'detect', msg: 'boxes located · reading codes and colours' },
      { src: 'stock', msg: 'comparing detected vs expected', level: 'warn' },
      { src: 'report', msg: 'audit result compiled' },
      { src: 'excel', msg: 'workbook generated (exceljs)', level: 'ok' },
      { src: 'pdf', msg: 'report rendered (pdfkit)', level: 'ok' },
      { src: 'wa', msg: 'report sent back to chat', level: 'ok' },
    ],
  },
  {
    id: 'rag',
    pid: '0x08',
    name: { en: 'RAG Knowledge System', es: 'Sistema de conocimiento RAG' },
    path: '/srv/ai/rag',
    domain: 'ai',
    featured: false,
    summary: {
      en: 'Semantic search and generated answers over large volumes of company information: documents, RMAs, internal knowledge.',
      es: 'Búsqueda semántica y respuestas generadas sobre grandes volúmenes de información empresarial: documentos, RMAs, conocimiento interno.',
    },
    problem: {
      en: 'A business’s knowledge is spread across documents, RMAs and internal notes. Keyword search misses it, and the answer ends up depending on the one person who remembers.',
      es: 'El conocimiento de un negocio está repartido entre documentos, RMAs y notas internas. La búsqueda por palabras clave no lo encuentra y la respuesta acaba dependiendo de la única persona que se acuerda.',
    },
    solution: {
      en: 'Documents are embedded with all-mpnet-base-v2 (Sentence Transformers) and indexed in FAISS. A query retrieves the relevant context, and an LLM running on my own GPUs through Ollama (DeepSeek, DeepSeek-R1, Mistral) or NVIDIA NIM writes the answer.',
      es: 'Los documentos se vectorizan con all-mpnet-base-v2 (Sentence Transformers) y se indexan en FAISS. Cada consulta recupera el contexto relevante y un LLM ejecutándose en GPUs propias mediante Ollama (DeepSeek, DeepSeek-R1, Mistral) o NVIDIA NIM redacta la respuesta.',
    },
    built: {
      en: [
        'Ingestion of documents, RMAs and internal documentation',
        'Embeddings with all-mpnet-base-v2 (Sentence Transformers)',
        'Vector indexing with FAISS',
        'Semantic search and context retrieval',
        'Answer generation with LLMs',
        'Local models served through Ollama: DeepSeek, DeepSeek-R1, Mistral',
        'NVIDIA NIM as an inference option',
        'Runs on self-operated NVIDIA GPU infrastructure',
      ],
      es: [
        'Ingesta de documentos, RMAs y documentación interna',
        'Embeddings con all-mpnet-base-v2 (Sentence Transformers)',
        'Indexación vectorial con FAISS',
        'Búsqueda semántica y recuperación de contexto',
        'Generación de respuestas mediante LLM',
        'Modelos locales servidos con Ollama: DeepSeek, DeepSeek-R1, Mistral',
        'NVIDIA NIM como opción de inferencia',
        'Ejecución sobre infraestructura propia con GPUs NVIDIA',
      ],
    },
    specs: [
      { key: { en: 'sources', es: 'fuentes' }, value: { en: 'documents · RMAs · internal docs', es: 'documentos · RMAs · docs internos' } },
      { key: { en: 'embeddings', es: 'embeddings' }, value: same('all-mpnet-base-v2') },
      { key: { en: 'index', es: 'índice' }, value: same('FAISS') },
      { key: { en: 'models', es: 'modelos' }, value: same('DeepSeek · DeepSeek-R1 · Mistral') },
      { key: { en: 'serving', es: 'serving' }, value: same('Ollama · NVIDIA NIM') },
      { key: { en: 'hardware', es: 'hardware' }, value: { en: 'own NVIDIA GPUs', es: 'GPUs NVIDIA propias' } },
    ],
    pipeline: [
      { label: { en: 'Documents', es: 'Documentos' }, detail: { en: 'Documents, RMAs and internal knowledge bases.', es: 'Documentos, RMAs y bases de conocimiento internas.' } },
      { label: { en: 'Embeddings', es: 'Embeddings' }, detail: { en: 'Text becomes vectors with all-mpnet-base-v2.', es: 'El texto se convierte en vectores con all-mpnet-base-v2.' } },
      { label: same('FAISS'), detail: { en: 'Vectors are indexed for similarity search.', es: 'Los vectores se indexan para búsqueda por similitud.' } },
      { label: { en: 'Semantic search', es: 'Búsqueda semántica' }, detail: { en: 'The question is matched by meaning, not keywords.', es: 'La pregunta se busca por significado, no por palabras.' } },
      { label: { en: 'Context', es: 'Contexto' }, detail: { en: 'The most relevant passages are assembled.', es: 'Se reúnen los fragmentos más relevantes.' } },
      { label: same('LLM'), detail: { en: 'A local model (Ollama / NIM) writes the answer.', es: 'Un modelo local (Ollama / NIM) redacta la respuesta.' } },
      { label: { en: 'Answer', es: 'Respuesta' }, detail: { en: 'Grounded in the organisation’s own information.', es: 'Basada en la información propia de la organización.' } },
    ],
    stack: ['python', 'rag', 'sentenceTransformers', 'mpnet', 'embeddings', 'faiss', 'vectorSearch', 'llm', 'ollama', 'deepseek', 'deepseekR1', 'mistral', 'nim', 'cuda', 'nvidia'],
    trace: [
      { src: 'ingest', msg: 'loading documents · rma · internal docs' },
      { src: 'embed', msg: 'model all-mpnet-base-v2 ready', level: 'ok' },
      { src: 'faiss', msg: 'index loaded', level: 'ok' },
      { src: 'query', msg: 'question received' },
      { src: 'embed', msg: 'query encoded' },
      { src: 'faiss', msg: 'similarity search · top-k context' },
      { src: 'ctx', msg: 'context window assembled' },
      { src: 'ollama', msg: 'generating with local model' },
      { src: 'answer', msg: 'response returned with sources', level: 'ok' },
    ],
  },
  {
    id: 'production',
    pid: '0x09',
    name: { en: 'Production Automation', es: 'Automatización de producción' },
    path: '/srv/data/production',
    domain: 'data',
    featured: false,
    summary: {
      en: 'SQL Server logic and Flask apps on top of production-planning and ERP data: stock, orders and production dates.',
      es: 'Lógica en SQL Server y apps Flask sobre datos de planificación de producción y ERP: stock, pedidos y fechas de producción.',
    },
    problem: {
      en: 'Production and planning data lives in SQL Server and ERP tables that only make sense through complex queries. Answering “what gets produced when, with which stock, for which order” meant digging by hand.',
      es: 'Los datos de producción y planificación viven en tablas de SQL Server y del ERP que solo tienen sentido mediante consultas complejas. Responder “qué se produce, cuándo, con qué stock y para qué pedido” obligaba a escarbar a mano.',
    },
    solution: {
      en: 'Integrations with the production and planning databases: complex SQL with CTEs that encodes the production logic, Flask applications connected to SQL Server, and a tool that exports database schemas so AI can use them as context.',
      es: 'Integraciones con las bases de datos de producción y planificación: SQL complejo con CTEs que codifica la lógica de producción, aplicaciones Flask conectadas a SQL Server y una herramienta que exporta esquemas de base de datos para usarlos como contexto de IA.',
    },
    built: {
      en: [
        'Production planning logic',
        'Stock, orders and production dates',
        'Complex queries with CTEs',
        'Integration with the ERP',
        'Information extraction from production databases',
        'Flask applications connected to SQL Server',
        'Schema analysis/export tool that feeds database structure to AI as context',
      ],
      es: [
        'Lógica de planificación de producción',
        'Stock, pedidos y fechas de producción',
        'Consultas complejas con CTEs',
        'Integración con el ERP',
        'Extracción de información de bases de datos de producción',
        'Aplicaciones Flask conectadas a SQL Server',
        'Herramienta de análisis/exportación de esquemas para dar la estructura de la BD a la IA como contexto',
      ],
    },
    specs: [
      { key: { en: 'database', es: 'base de datos' }, value: same('SQL Server') },
      { key: { en: 'logic', es: 'lógica' }, value: { en: 'CTEs · complex queries', es: 'CTEs · consultas complejas' } },
      { key: { en: 'domain', es: 'dominio' }, value: { en: 'planning · stock · orders · dates', es: 'planificación · stock · pedidos · fechas' } },
      { key: { en: 'apps', es: 'apps' }, value: same('Flask') },
      { key: { en: 'integration', es: 'integración' }, value: same('ERP') },
      { key: { en: 'ai bridge', es: 'puente IA' }, value: { en: 'schema export → AI context', es: 'exportación de esquema → contexto IA' } },
    ],
    pipeline: [
      { label: same('ERP'), detail: { en: 'Orders, stock and production data at the source.', es: 'Pedidos, stock y datos de producción en origen.' } },
      { label: same('SQL Server'), detail: { en: 'Production and planning databases.', es: 'Bases de datos de producción y planificación.' } },
      { label: { en: 'CTE logic', es: 'Lógica CTE' }, detail: { en: 'Complex queries that encode how production works.', es: 'Consultas complejas que codifican cómo funciona la producción.' } },
      { label: same('Flask'), detail: { en: 'Applications that expose that logic to people.', es: 'Aplicaciones que exponen esa lógica a las personas.' } },
      { label: { en: 'Planning', es: 'Planificación' }, detail: { en: 'Production dates, stock and orders in one place.', es: 'Fechas de producción, stock y pedidos en un solo sitio.' } },
      { label: { en: 'Schema export', es: 'Export. de esquema' }, detail: { en: 'Database structure exported for AI.', es: 'Estructura de la BD exportada para la IA.' } },
      { label: { en: 'AI context', es: 'Contexto IA' }, detail: { en: 'Models understand the data model they query.', es: 'Los modelos entienden el modelo de datos que consultan.' } },
    ],
    stack: ['python', 'flask', 'sqlserver', 'sqlCte', 'erp', 'etl', 'dataProcessing', 'rest'],
    trace: [
      { src: 'mssql', msg: 'connection pool ready', level: 'ok' },
      { src: 'erp', msg: 'orders and stock synced' },
      { src: 'cte', msg: 'planning query executed' },
      { src: 'logic', msg: 'production dates resolved' },
      { src: 'flask', msg: 'GET /planning → 200', level: 'ok' },
      { src: 'schema', msg: 'exporting tables, keys and relations' },
      { src: 'ai', msg: 'schema context available to model', level: 'ok' },
    ],
  },
  {
    id: 'monitoring',
    pid: '0x0A',
    name: { en: 'Infrastructure Monitoring', es: 'Monitorización de infraestructura' },
    path: '/srv/ops/observability',
    domain: 'observability',
    featured: false,
    summary: {
      en: 'Home-grown observability for servers, Docker, GPUs, network and cameras, reporting through Telegram and Discord.',
      es: 'Observabilidad propia para servidores, Docker, GPUs, red y cámaras, con avisos por Telegram y Discord.',
    },
    problem: {
      en: 'When servers, containers, GPUs, cameras and inference all run at once, problems are discovered by the person who notices something is not working.',
      es: 'Cuando servidores, contenedores, GPUs, cámaras e inferencia funcionan a la vez, los problemas los descubre quien nota que algo ha dejado de funcionar.',
    },
    solution: {
      en: 'Monitoring systems and custom scripts that watch CPU, RAM, GPU, containers, network, processes, services, cameras, inference and servers — plus network analysis and defensive security tooling — and push what matters to Telegram and Discord.',
      es: 'Sistemas de monitorización y scripts propios que vigilan CPU, RAM, GPU, contenedores, red, procesos, servicios, cámaras, inferencia y servidores —además de análisis de red y ciberseguridad defensiva— y envían lo importante a Telegram y Discord.',
    },
    built: {
      en: [
        'Docker and container monitoring',
        'Server monitoring',
        'Network monitoring',
        'Alerting through Telegram and Discord',
        'Custom scripts for CPU, RAM, GPU, processes and services',
        'Checks for cameras and inference workloads',
        'Network discovery and analysis: nmap, netdiscover, arp-scan, iftop',
        'Traffic capture and inspection: tcpdump, tshark',
        'Defensive security with Suricata',
        'Glances for live host overview',
      ],
      es: [
        'Monitorización de Docker y contenedores',
        'Monitorización de servidores',
        'Monitorización de red',
        'Avisos mediante Telegram y Discord',
        'Scripts propios para CPU, RAM, GPU, procesos y servicios',
        'Comprobaciones de cámaras y cargas de inferencia',
        'Descubrimiento y análisis de red: nmap, netdiscover, arp-scan, iftop',
        'Captura e inspección de tráfico: tcpdump, tshark',
        'Ciberseguridad defensiva con Suricata',
        'Glances para una vista en vivo de cada host',
      ],
    },
    specs: [
      { key: { en: 'watches', es: 'vigila' }, value: { en: 'CPU · RAM · GPU · containers · network', es: 'CPU · RAM · GPU · contenedores · red' } },
      { key: { en: 'also', es: 'también' }, value: { en: 'processes · services · cameras · inference', es: 'procesos · servicios · cámaras · inferencia' } },
      { key: { en: 'network', es: 'red' }, value: same('nmap · arp-scan · netdiscover · iftop') },
      { key: { en: 'traffic', es: 'tráfico' }, value: same('tcpdump · tshark') },
      { key: { en: 'security', es: 'seguridad' }, value: { en: 'Suricata · defensive', es: 'Suricata · defensiva' } },
      { key: { en: 'alerts', es: 'avisos' }, value: same('Telegram · Discord') },
    ],
    pipeline: [
      { label: { en: 'Hosts', es: 'Hosts' }, detail: { en: 'Servers, containers, GPUs, cameras.', es: 'Servidores, contenedores, GPUs, cámaras.' } },
      { label: { en: 'Collectors', es: 'Colectores' }, detail: { en: 'Custom scripts and Glances gather signals.', es: 'Scripts propios y Glances recogen señales.' } },
      { label: { en: 'Checks', es: 'Comprobaciones' }, detail: { en: 'Processes, services and inference are verified.', es: 'Se verifican procesos, servicios e inferencia.' } },
      { label: { en: 'Network', es: 'Red' }, detail: { en: 'Discovery, traffic inspection, Suricata.', es: 'Descubrimiento, inspección de tráfico, Suricata.' } },
      { label: { en: 'Alerts', es: 'Avisos' }, detail: { en: 'Only what needs a human is escalated.', es: 'Solo se escala lo que necesita a una persona.' } },
      { label: same('Telegram / Discord'), detail: { en: 'Delivered where the team already is.', es: 'Entregado donde ya está el equipo.' } },
    ],
    stack: ['python', 'docker', 'linux', 'glances', 'iftop', 'nmap', 'netdiscover', 'arpScan', 'tcpdump', 'tshark', 'suricata', 'telegram', 'discord', 'nvidia'],
    trace: [
      { src: 'host', msg: 'gpu-node reachable', level: 'ok' },
      { src: 'docker', msg: 'containers healthy', level: 'ok' },
      { src: 'gpu', msg: 'utilisation sampled' },
      { src: 'net', msg: 'arp-scan · new device on segment', level: 'warn' },
      { src: 'suricata', msg: 'ruleset loaded · watching' },
      { src: 'cam', msg: 'camera streams responding', level: 'ok' },
      { src: 'svc', msg: 'service restart detected', level: 'warn' },
      { src: 'telegram', msg: 'alert delivered', level: 'ok' },
    ],
  },
  {
    id: 'gpu-infra',
    pid: '0x0B',
    name: { en: 'GPU AI Infrastructure', es: 'Infraestructura GPU para IA' },
    path: '/srv/infra/gpu',
    domain: 'infrastructure',
    featured: false,
    summary: {
      en: 'Multi-GPU servers for local inference: the hardware and operating layer underneath the AI.',
      es: 'Servidores multi-GPU para inferencia local: la capa de hardware y operación que hay debajo de la IA.',
    },
    problem: {
      en: 'Running AI on your own terms — private data, local models, no per-token bill — needs someone who can build and operate the machines, not only call an API.',
      es: 'Ejecutar IA en tus propios términos —datos privados, modelos locales, sin factura por token— exige a alguien capaz de montar y operar las máquinas, no solo de llamar a una API.',
    },
    solution: {
      en: 'Inference servers with multiple NVIDIA GPUs, Threadripper PRO CPUs and large amounts of RAM, prepared with CUDA and Docker to serve local models — alongside virtualisation, storage and GPU hosting on the Vast.ai marketplace.',
      es: 'Servidores de inferencia con varias GPUs NVIDIA, CPUs Threadripper PRO y gran cantidad de RAM, preparados con CUDA y Docker para servir modelos locales, junto con virtualización, almacenamiento y hosting de GPUs en el marketplace de Vast.ai.',
    },
    built: {
      en: [
        'Machines with multiple NVIDIA RTX 3090',
        'Machines with multiple NVIDIA RTX 4090',
        'NVIDIA RTX 5090 and RTX 6000 Ada',
        'Threadripper PRO CPUs with large amounts of RAM',
        'CUDA environments for inference',
        'Dockerised inference servers running local models',
        'GPU hosting on the Vast.ai marketplace',
        'Virtualisation with Proxmox (QCOW2, VHDX)',
        'Storage on Synology and CIFS/Samba',
      ],
      es: [
        'Máquinas con múltiples NVIDIA RTX 3090',
        'Máquinas con múltiples NVIDIA RTX 4090',
        'NVIDIA RTX 5090 y RTX 6000 Ada',
        'CPUs Threadripper PRO con gran cantidad de RAM',
        'Entornos CUDA para inferencia',
        'Servidores de inferencia dockerizados con modelos locales',
        'Hosting de GPUs en el marketplace de Vast.ai',
        'Virtualización con Proxmox (QCOW2, VHDX)',
        'Almacenamiento en Synology y CIFS/Samba',
      ],
    },
    specs: [
      { key: { en: 'gpus', es: 'gpus' }, value: same('RTX 3090 · 4090 · 5090 · 6000 Ada') },
      { key: { en: 'topology', es: 'topología' }, value: { en: 'multiple GPUs per machine', es: 'varias GPUs por máquina' } },
      { key: { en: 'cpu', es: 'cpu' }, value: same('Threadripper PRO') },
      { key: { en: 'software', es: 'software' }, value: same('CUDA · Docker · Ollama') },
      { key: { en: 'virtualisation', es: 'virtualización' }, value: same('Proxmox · QCOW2 · VHDX') },
      { key: { en: 'marketplace', es: 'marketplace' }, value: { en: 'Vast.ai GPU hosting', es: 'hosting GPU en Vast.ai' } },
    ],
    pipeline: [
      { label: same('Hardware'), detail: { en: 'Multi-GPU, Threadripper PRO, large RAM.', es: 'Multi-GPU, Threadripper PRO, mucha RAM.' } },
      { label: { en: 'OS / hypervisor', es: 'SO / hipervisor' }, detail: { en: 'Linux, Windows, Proxmox.', es: 'Linux, Windows, Proxmox.' } },
      { label: same('CUDA'), detail: { en: 'Drivers and toolkits for GPU compute.', es: 'Drivers y toolkits para cómputo GPU.' } },
      { label: same('Docker'), detail: { en: 'Reproducible, isolated services.', es: 'Servicios aislados y reproducibles.' } },
      { label: { en: 'Inference server', es: 'Servidor de inferencia' }, detail: { en: 'Models served over the network.', es: 'Modelos servidos por red.' } },
      { label: { en: 'Local models', es: 'Modelos locales' }, detail: { en: 'LLMs, embeddings and vision models.', es: 'LLMs, embeddings y modelos de visión.' } },
      { label: { en: 'Applications', es: 'Aplicaciones' }, detail: { en: 'RAG, CCTV, automations.', es: 'RAG, CCTV, automatizaciones.' } },
    ],
    stack: ['nvidia', 'cuda', 'multiGpu', 'gpuInference', 'docker', 'compose', 'linux', 'ubuntu', 'windows', 'proxmox', 'vms', 'qcow2', 'vhdx', 'synology', 'cifs', 'vastai', 'ollama'],
    trace: [
      { src: 'bios', msg: 'threadripper pro · memory check', level: 'ok' },
      { src: 'pcie', msg: 'nvidia gpus enumerated' },
      { src: 'driver', msg: 'cuda runtime available', level: 'ok' },
      { src: 'docker', msg: 'nvidia container runtime ready', level: 'ok' },
      { src: 'ollama', msg: 'model pulled · serving' },
      { src: 'infer', msg: 'request routed to gpu' },
      { src: 'nas', msg: 'cifs share mounted', level: 'ok' },
    ],
  },
];

export function findProject(query: string): Project | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  if (/^\d+$/.test(q)) return projects[Number(q) - 1];
  return projects.find(
    (p) => p.id === q || p.pid === q || p.name.en.toLowerCase() === q || p.id.startsWith(q),
  );
}
