import type { Localized } from '../i18n/types';

export interface Tech {
  label: string;
}

/**
 * Every technology mentioned anywhere on the site.
 * Projects, sections and the terminal reference these ids, so a typo is a type error.
 */
export const tech = {
  python: { label: 'Python' },
  pytorch: { label: 'PyTorch' },
  yolo: { label: 'YOLO' },
  yolov5: { label: 'YOLOv5' },
  llm: { label: 'LLMs' },
  rag: { label: 'RAG' },
  faiss: { label: 'FAISS' },
  sentenceTransformers: { label: 'Sentence Transformers' },
  mpnet: { label: 'all-mpnet-base-v2' },
  ollama: { label: 'Ollama' },
  deepseek: { label: 'DeepSeek' },
  deepseekR1: { label: 'DeepSeek-R1' },
  mistral: { label: 'Mistral' },
  nim: { label: 'NVIDIA NIM' },
  openai: { label: 'OpenAI' },
  nodejs: { label: 'Node.js' },
  whatsappWebJs: { label: 'whatsapp-web.js' },
  exceljs: { label: 'ExcelJS' },
  pdfkit: { label: 'PDFKit' },
  apis: { label: 'APIs' },
  rest: { label: 'REST APIs' },
  whatsapp: { label: 'WhatsApp' },
  telegram: { label: 'Telegram' },
  discord: { label: 'Discord' },
  email: { label: 'Email' },
  excel: { label: 'Excel' },
  csv: { label: 'CSV' },
  pdf: { label: 'PDF' },
  ocr: { label: 'OCR' },
  erp: { label: 'ERP' },
  flask: { label: 'Flask' },
  sqlalchemy: { label: 'SQLAlchemy' },
  sqlite: { label: 'SQLite' },
  qwen: { label: 'Qwen (multimodal)' },
  baileys: { label: 'Baileys' },
  leaflet: { label: 'Leaflet' },
  osm: { label: 'OpenStreetMap' },
  kmeans: { label: 'k-means clustering' },
  fpdf2: { label: 'fpdf2' },
  cloudflareTunnel: { label: 'Cloudflare Tunnel' },
  raspberryPi: { label: 'Raspberry Pi' },
  fastapi: { label: 'FastAPI' },
  sqlserver: { label: 'SQL Server' },
  sqlCte: { label: 'SQL · CTEs' },
  docker: { label: 'Docker' },
  compose: { label: 'Docker Compose' },
  linux: { label: 'Linux' },
  ubuntu: { label: 'Ubuntu' },
  lubuntu: { label: 'Lubuntu' },
  dietpi: { label: 'Debian / DietPi' },
  windows: { label: 'Windows' },
  wsl: { label: 'WSL' },
  proxmox: { label: 'Proxmox' },
  vms: { label: 'Virtual Machines' },
  qcow2: { label: 'QCOW2' },
  vhdx: { label: 'VHDX' },
  synology: { label: 'Synology' },
  containerManager: { label: 'Synology Container Manager' },
  cifs: { label: 'CIFS / Samba' },
  cuda: { label: 'CUDA' },
  nvidia: { label: 'NVIDIA' },
  multiGpu: { label: 'Multi-GPU' },
  vastai: { label: 'Vast.ai' },
  embeddings: { label: 'Embeddings' },
  vectorSearch: { label: 'Vector Search' },
  etl: { label: 'ETL' },
  dataProcessing: { label: 'Data Processing' },
  imageProcessing: { label: 'Image Processing' },
  opencv: { label: 'OpenCV' },
  ffmpeg: { label: 'FFmpeg' },
  rtsp: { label: 'RTSP' },
  cctv: { label: 'CCTV' },
  gpuInference: { label: 'GPU Inference' },
  glances: { label: 'Glances' },
  iftop: { label: 'iftop' },
  nmap: { label: 'nmap' },
  netdiscover: { label: 'netdiscover' },
  arpScan: { label: 'arp-scan' },
  tcpdump: { label: 'tcpdump' },
  tshark: { label: 'tshark' },
  suricata: { label: 'Suricata' },
} as const satisfies Record<string, Tech>;

export type TechId = keyof typeof tech;

export type StackCategoryId = 'ai' | 'automation' | 'backend' | 'infrastructure' | 'data' | 'vision';

export interface StackCategory {
  id: StackCategoryId;
  name: Localized;
  /** One line on what the category is for, in plain words. */
  purpose: Localized;
  items: TechId[];
}

export const stackCategories: StackCategory[] = [
  {
    id: 'ai',
    name: { en: 'AI', es: 'IA' },
    purpose: {
      en: 'Models that read, search, reason and answer.',
      es: 'Modelos que leen, buscan, razonan y responden.',
    },
    items: ['python', 'pytorch', 'yolo', 'llm', 'rag', 'faiss', 'sentenceTransformers', 'ollama', 'qwen', 'nim'],
  },
  {
    id: 'automation',
    name: { en: 'Automation', es: 'Automatización' },
    purpose: {
      en: 'The glue that turns a manual process into one that runs itself.',
      es: 'El pegamento que convierte un proceso manual en uno que funciona solo.',
    },
    items: ['python', 'nodejs', 'apis', 'whatsapp', 'telegram', 'discord', 'email', 'excel', 'pdf', 'ocr', 'erp'],
  },
  {
    id: 'backend',
    name: { en: 'Backend', es: 'Backend' },
    purpose: {
      en: 'Services and apps that expose data and logic to people and systems.',
      es: 'Servicios y apps que exponen datos y lógica a personas y sistemas.',
    },
    items: ['python', 'flask', 'fastapi', 'nodejs', 'rest', 'sqlserver', 'sqlalchemy', 'sqlite'],
  },
  {
    id: 'infrastructure',
    name: { en: 'Infrastructure', es: 'Infraestructura' },
    purpose: {
      en: 'The machines, GPUs and platforms everything above runs on.',
      es: 'Las máquinas, GPUs y plataformas sobre las que corre todo lo demás.',
    },
    items: ['docker', 'compose', 'linux', 'proxmox', 'synology', 'cuda', 'nvidia', 'vms'],
  },
  {
    id: 'data',
    name: { en: 'Data', es: 'Datos' },
    purpose: {
      en: 'Where information is stored, indexed, moved and made searchable.',
      es: 'Dónde se guarda, indexa, mueve y hace buscable la información.',
    },
    items: ['sqlserver', 'faiss', 'embeddings', 'vectorSearch', 'etl', 'dataProcessing'],
  },
  {
    id: 'vision',
    name: { en: 'Computer Vision', es: 'Visión artificial' },
    purpose: {
      en: 'Cameras and images turned into events, counts and decisions.',
      es: 'Cámaras e imágenes convertidas en eventos, recuentos y decisiones.',
    },
    items: ['yolo', 'opencv', 'ffmpeg', 'rtsp', 'cctv', 'gpuInference'],
  },
];
