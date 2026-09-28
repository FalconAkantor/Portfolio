import type { Localized } from '../i18n/types';

/** The lifecycle of a system, end to end. A real sequence, so it is numbered. */
export const lifecycle: { id: string; verb: Localized; detail: Localized }[] = [
  { id: 'imagine', verb: { en: 'Imagine', es: 'Imaginar' }, detail: { en: 'Find the process that should not need a person.', es: 'Encontrar el proceso que no debería necesitar a una persona.' } },
  { id: 'design', verb: { en: 'Design', es: 'Diseñar' }, detail: { en: 'Map inputs, decisions, data and outputs.', es: 'Mapear entradas, decisiones, datos y salidas.' } },
  { id: 'build', verb: { en: 'Build', es: 'Programar' }, detail: { en: 'Write the software, the models, the glue.', es: 'Escribir el software, los modelos y el pegamento.' } },
  { id: 'integrate', verb: { en: 'Integrate', es: 'Integrar' }, detail: { en: 'Connect it to email, WhatsApp, ERP, databases.', es: 'Conectarlo con email, WhatsApp, ERP, bases de datos.' } },
  { id: 'deploy', verb: { en: 'Deploy', es: 'Desplegar' }, detail: { en: 'Put it on real servers, containers and GPUs.', es: 'Ponerlo en servidores, contenedores y GPUs reales.' } },
  { id: 'monitor', verb: { en: 'Monitor', es: 'Monitorizar' }, detail: { en: 'Know it is working before anyone asks.', es: 'Saber que funciona antes de que nadie pregunte.' } },
  { id: 'automate', verb: { en: 'Automate', es: 'Automatizar' }, detail: { en: 'Let it run. Move on to the next process.', es: 'Dejarlo funcionar. Pasar al siguiente proceso.' } },
];

export interface ProcessStep {
  actor: 'person' | 'system';
  text: Localized;
}

/**
 * The same order-intake process, before and after. Illustrative: it describes
 * the kind of change, not a measured result.
 */
export const orderIntake: Record<'manual' | 'automated', ProcessStep[]> = {
  manual: [
    { actor: 'person', text: { en: 'An order arrives by email or WhatsApp', es: 'Llega un pedido por email o WhatsApp' } },
    { actor: 'person', text: { en: 'Someone opens it and reads the attachment', es: 'Alguien lo abre y lee el adjunto' } },
    { actor: 'person', text: { en: 'The lines are retyped into the ERP', es: 'Las líneas se reteclean en el ERP' } },
    { actor: 'person', text: { en: 'Stock is checked in a spreadsheet', es: 'Se comprueba el stock en una hoja de cálculo' } },
    { actor: 'person', text: { en: 'A confirmation is written by hand', es: 'Se redacta una confirmación a mano' } },
    { actor: 'person', text: { en: 'Nobody knows if something got lost', es: 'Nadie sabe si algo se ha perdido' } },
  ],
  automated: [
    { actor: 'system', text: { en: 'The order is received on any channel', es: 'El pedido se recibe por cualquier canal' } },
    { actor: 'system', text: { en: 'AI extracts customer, items and quantities', es: 'La IA extrae cliente, artículos y cantidades' } },
    { actor: 'system', text: { en: 'The order is created in the ERP', es: 'El pedido se crea en el ERP' } },
    { actor: 'system', text: { en: 'Stock is queried in the database', es: 'El stock se consulta en la base de datos' } },
    { actor: 'system', text: { en: 'Confirmation goes out automatically', es: 'La confirmación sale automáticamente' } },
    { actor: 'person', text: { en: 'Exceptions reach a person on Telegram', es: 'Las excepciones llegan a una persona por Telegram' } },
  ],
};

/** The layers a single person moves through — from code to business. */
export const layers: { id: string; name: Localized; detail: Localized }[] = [
  { id: 'business', name: { en: 'Business automation', es: 'Automatización empresarial' }, detail: { en: 'Orders, documents, ERP, reports', es: 'Pedidos, documentos, ERP, informes' } },
  { id: 'ai', name: { en: 'AI', es: 'IA' }, detail: { en: 'LLMs, RAG, vision, OCR', es: 'LLMs, RAG, visión, OCR' } },
  { id: 'database', name: { en: 'Database', es: 'Base de datos' }, detail: { en: 'SQL Server, vector indexes', es: 'SQL Server, índices vectoriales' } },
  { id: 'server', name: { en: 'Server', es: 'Servidor' }, detail: { en: 'Linux, Docker, Proxmox', es: 'Linux, Docker, Proxmox' } },
  { id: 'gpu', name: { en: 'GPU', es: 'GPU' }, detail: { en: 'NVIDIA, CUDA, multi-GPU', es: 'NVIDIA, CUDA, multi-GPU' } },
  { id: 'code', name: { en: 'Code', es: 'Código' }, detail: { en: 'Python, Node.js, SQL', es: 'Python, Node.js, SQL' } },
];
