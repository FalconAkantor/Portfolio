import type { Localized } from '../i18n/types';
import type { TechId } from './stack';

export type NetworkNodeId =
  | 'email'
  | 'whatsapp'
  | 'telegram'
  | 'cameras'
  | 'documents'
  | 'ai'
  | 'database'
  | 'erp'
  | 'automation'
  | 'reports'
  | 'alerts'
  | 'apps'
  | 'monitoring';

export type NetworkRole = 'input' | 'core' | 'store' | 'output' | 'watch';

export interface NetworkNode {
  id: NetworkNodeId;
  label: Localized;
  role: NetworkRole;
  description: Localized;
  tech: TechId[];
  /** Centre position in the wide (desktop) and tall (mobile) layouts. */
  wide: { x: number; y: number };
  tall: { x: number; y: number };
  /** Per-layout width override for nodes with long labels. */
  width?: Partial<Record<'wide' | 'tall', number>>;
}

export interface NetworkEdge {
  from: NetworkNodeId;
  to: NetworkNodeId;
  /** "data" edges carry animated packets; "watch" edges are observability links. */
  kind: 'data' | 'watch';
}

export const networkLayouts = {
  wide: { width: 1040, height: 480, nodeWidth: 140, nodeHeight: 40 },
  tall: { width: 360, height: 670, nodeWidth: 104, nodeHeight: 34 },
} as const;

export const networkNodes: NetworkNode[] = [
  {
    id: 'email',
    label: { en: 'EMAIL', es: 'EMAIL' },
    role: 'input',
    description: { en: 'Orders, documents and requests arriving in inboxes.', es: 'Pedidos, documentos y peticiones que llegan al correo.' },
    tech: ['email', 'pdf', 'excel'],
    wide: { x: 80, y: 60 },
    tall: { x: 70, y: 40 },
  },
  {
    id: 'whatsapp',
    label: { en: 'WHATSAPP', es: 'WHATSAPP' },
    role: 'input',
    description: { en: 'Messages and photos from customers or field teams.', es: 'Mensajes y fotos de clientes o equipos en campo.' },
    tech: ['whatsapp', 'whatsappWebJs', 'nodejs'],
    wide: { x: 80, y: 150 },
    tall: { x: 70, y: 100 },
  },
  {
    id: 'telegram',
    label: { en: 'TELEGRAM', es: 'TELEGRAM' },
    role: 'input',
    description: { en: 'Bots that take commands and answer questions.', es: 'Bots que reciben órdenes y responden preguntas.' },
    tech: ['telegram', 'python'],
    wide: { x: 80, y: 240 },
    tall: { x: 70, y: 160 },
  },
  {
    id: 'cameras',
    label: { en: 'CAMERAS', es: 'CÁMARAS' },
    role: 'input',
    description: { en: 'RTSP video streams from IP cameras.', es: 'Streams de vídeo RTSP de cámaras IP.' },
    tech: ['rtsp', 'cctv', 'ffmpeg'],
    wide: { x: 80, y: 330 },
    tall: { x: 70, y: 220 },
  },
  {
    id: 'documents',
    label: { en: 'DOCUMENTS', es: 'DOCUMENTOS' },
    role: 'input',
    description: { en: 'PDFs, delivery notes, spreadsheets, internal docs.', es: 'PDFs, albaranes, hojas de cálculo, documentación interna.' },
    tech: ['pdf', 'ocr', 'excel'],
    wide: { x: 80, y: 420 },
    tall: { x: 70, y: 280 },
  },
  {
    id: 'ai',
    label: { en: 'AI ENGINE', es: 'MOTOR IA' },
    role: 'core',
    description: {
      en: 'Understands the input: LLMs, RAG, OCR and vision models, running locally on GPUs or through APIs.',
      es: 'Entiende la entrada: LLMs, RAG, OCR y modelos de visión, en GPUs propias o mediante APIs.',
    },
    tech: ['llm', 'rag', 'yolo', 'ocr', 'ollama', 'openai'],
    wide: { x: 330, y: 240 },
    tall: { x: 268, y: 160 },
  },
  {
    id: 'database',
    label: { en: 'DATABASE', es: 'BASE DATOS' },
    role: 'store',
    description: { en: 'SQL Server and vector indexes: the memory of the system.', es: 'SQL Server e índices vectoriales: la memoria del sistema.' },
    tech: ['sqlserver', 'faiss', 'embeddings'],
    wide: { x: 560, y: 150 },
    tall: { x: 92, y: 380 },
  },
  {
    id: 'erp',
    label: { en: 'ERP', es: 'ERP' },
    role: 'store',
    description: { en: 'Orders, stock and production, kept in sync.', es: 'Pedidos, stock y producción, sincronizados.' },
    tech: ['erp', 'sqlserver', 'sqlCte'],
    wide: { x: 560, y: 330 },
    tall: { x: 268, y: 380 },
  },
  {
    id: 'automation',
    label: { en: 'AUTOMATION', es: 'AUTOMATIZACIÓN' },
    role: 'core',
    description: {
      en: 'Business logic that acts on its own: decides, writes, generates and notifies.',
      es: 'Lógica de negocio que actúa sola: decide, escribe, genera y avisa.',
    },
    tech: ['python', 'nodejs', 'apis', 'flask'],
    wide: { x: 780, y: 240 },
    tall: { x: 122, y: 500 },
    width: { tall: 132, wide: 164 },
  },
  {
    id: 'reports',
    label: { en: 'REPORTS', es: 'INFORMES' },
    role: 'output',
    description: { en: 'Excel and PDF documents generated automatically.', es: 'Documentos Excel y PDF generados automáticamente.' },
    tech: ['excel', 'exceljs', 'pdf', 'pdfkit'],
    wide: { x: 965, y: 120 },
    tall: { x: 66, y: 630 },
  },
  {
    id: 'alerts',
    label: { en: 'ALERTS', es: 'AVISOS' },
    role: 'output',
    description: { en: 'Telegram and Discord messages when something needs a human.', es: 'Mensajes en Telegram y Discord cuando algo necesita a una persona.' },
    tech: ['telegram', 'discord'],
    wide: { x: 965, y: 240 },
    tall: { x: 180, y: 630 },
  },
  {
    id: 'apps',
    label: { en: 'APPS', es: 'APPS' },
    role: 'output',
    description: { en: 'Web apps and APIs that expose the data to people and systems.', es: 'Apps web y APIs que exponen los datos a personas y sistemas.' },
    tech: ['flask', 'fastapi', 'rest'],
    wide: { x: 965, y: 360 },
    tall: { x: 294, y: 630 },
  },
  {
    id: 'monitoring',
    label: { en: 'MONITORING', es: 'MONITORIZACIÓN' },
    role: 'watch',
    description: {
      en: 'Watches every part of the chain — hosts, GPUs, containers, network — and reports.',
      es: 'Vigila cada eslabón —hosts, GPUs, contenedores, red— e informa.',
    },
    tech: ['glances', 'docker', 'suricata', 'telegram', 'discord'],
    wide: { x: 560, y: 448 },
    tall: { x: 290, y: 500 },
    width: { tall: 132, wide: 164 },
  },
];

export const networkEdges: NetworkEdge[] = [
  { from: 'email', to: 'ai', kind: 'data' },
  { from: 'whatsapp', to: 'ai', kind: 'data' },
  { from: 'telegram', to: 'ai', kind: 'data' },
  { from: 'cameras', to: 'ai', kind: 'data' },
  { from: 'documents', to: 'ai', kind: 'data' },
  { from: 'ai', to: 'database', kind: 'data' },
  { from: 'ai', to: 'erp', kind: 'data' },
  { from: 'database', to: 'automation', kind: 'data' },
  { from: 'erp', to: 'automation', kind: 'data' },
  { from: 'automation', to: 'reports', kind: 'data' },
  { from: 'automation', to: 'alerts', kind: 'data' },
  { from: 'automation', to: 'apps', kind: 'data' },
  { from: 'monitoring', to: 'ai', kind: 'watch' },
  { from: 'monitoring', to: 'automation', kind: 'watch' },
  { from: 'monitoring', to: 'erp', kind: 'watch' },
];
