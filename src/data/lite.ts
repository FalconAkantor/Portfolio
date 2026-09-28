import type { Localized } from '../i18n/types';
import type { ProjectId } from './projects';

/**
 * Content of the simple version: the same work as the tech version,
 * told for people who just want to know what I offer.
 */

export type ServiceIcon = 'documents' | 'assistant' | 'chat' | 'camera' | 'report' | 'server';

export interface Service {
  id: string;
  icon: ServiceIcon;
  title: Localized;
  text: Localized;
}

export const services: Service[] = [
  {
    id: 'orders',
    icon: 'documents',
    title: { en: 'Orders and documents that process themselves', es: 'Pedidos y documentos que se procesan solos' },
    text: {
      en: 'Orders arriving by e-mail or WhatsApp, delivery notes, PDFs and supplier price lists are read automatically and go straight into your system.',
      es: 'Los pedidos que llegan por email o WhatsApp, los albaranes, los PDFs y las tarifas de proveedores se leen solos y pasan directamente a tu sistema.',
    },
  },
  {
    id: 'assistant',
    icon: 'assistant',
    title: { en: 'An AI assistant that knows your company', es: 'Un asistente de IA que conoce tu empresa' },
    text: {
      en: 'Ask in plain words and get answers from your own manuals, documents and incidents — with the data staying at home.',
      es: 'Pregunta con tus palabras y obtén respuestas a partir de tus propios manuales, documentos e incidencias, sin que los datos salgan de casa.',
    },
  },
  {
    id: 'bots',
    icon: 'chat',
    title: { en: 'WhatsApp and Telegram bots', es: 'Bots de WhatsApp y Telegram' },
    text: {
      en: 'Your customers or your team send photos, requests or questions by WhatsApp, and the system handles them and notifies whoever needs to know.',
      es: 'Tus clientes o tu equipo envían fotos, peticiones o dudas por WhatsApp, y el sistema lo gestiona y avisa a quien tenga que saberlo.',
    },
  },
  {
    id: 'vision',
    icon: 'camera',
    title: { en: 'Cameras and photos that understand', es: 'Cámaras y fotos que entienden' },
    text: {
      en: 'Cameras that detect people and record only when it matters; photos of a shelf that turn into a stock count.',
      es: 'Cámaras que detectan personas y graban solo cuando importa; fotos de una estantería que se convierten en un recuento de stock.',
    },
  },
  {
    id: 'reports',
    icon: 'report',
    title: { en: 'Reports and spreadsheets that build themselves', es: 'Informes y Excel que se hacen solos' },
    text: {
      en: 'The weekly report someone rebuilds by hand, the margins at the end of the quarter, the restocking list — generated and delivered on their own.',
      es: 'El informe que alguien rehace a mano cada semana, los márgenes al cerrar el trimestre, la lista de reposición: generados y entregados solos.',
    },
  },
  {
    id: 'infra',
    icon: 'server',
    title: { en: 'Your own AI, on your own servers', es: 'Tu propia IA, en tus propios equipos' },
    text: {
      en: 'Artificial intelligence running on your machines instead of someone else’s cloud, with everything monitored and alerts when something needs attention.',
      es: 'Inteligencia artificial funcionando en tus máquinas en lugar de en la nube de otro, con todo vigilado y avisos cuando algo necesita atención.',
    },
  },
];

export const steps: { id: string; title: Localized; text: Localized }[] = [
  {
    id: 'listen',
    title: { en: 'You tell me the problem', es: 'Me cuentas el problema' },
    text: { en: 'Which task eats the most time, who does it and how.', es: 'Qué tarea os come más tiempo, quién la hace y cómo.' },
  },
  {
    id: 'design',
    title: { en: 'I propose how to automate it', es: 'Te propongo cómo automatizarlo' },
    text: { en: 'In plain words: what would run by itself and what stays in human hands.', es: 'Con palabras claras: qué funcionaría solo y qué seguiría en manos de una persona.' },
  },
  {
    id: 'build',
    title: { en: 'I build it and connect it', es: 'Lo construyo y lo conecto' },
    text: { en: 'With what you already use: e-mail, WhatsApp, Excel, your ERP or your database.', es: 'Con lo que ya usáis: email, WhatsApp, Excel, vuestro ERP o vuestra base de datos.' },
  },
  {
    id: 'run',
    title: { en: 'I leave it running and watched', es: 'Lo dejo funcionando y vigilado' },
    text: { en: 'With alerts when something needs a person, so nothing fails silently.', es: 'Con avisos cuando algo necesita a una persona, para que nada falle en silencio.' },
  },
];

export const examples: { project: ProjectId; title: Localized; text: Localized }[] = [
  {
    project: 'inventory-ai',
    title: { en: 'Stock checked by photo', es: 'Stock revisado con una foto' },
    text: {
      en: 'Pharmacies send a photo of their display by WhatsApp and the AI counts the products. Every morning the list of what needs restocking arrives.',
      es: 'Las farmacias mandan una foto de su expositor por WhatsApp y la IA cuenta los productos. Cada mañana llega la lista de lo que hay que reponer.',
    },
  },
  {
    project: 'workspace',
    title: { en: 'All the tools in one place', es: 'Todas las herramientas en un solo sitio' },
    text: {
      en: 'An online desktop where every tool a team uses works together, with a single login and an assistant that tells you which one to use.',
      es: 'Un escritorio online donde todas las herramientas de un equipo funcionan juntas, con un solo inicio de sesión y un asistente que te dice cuál usar.',
    },
  },
  {
    project: 'cctv',
    title: { en: 'Cameras that warn you', es: 'Cámaras que avisan' },
    text: {
      en: 'Cameras that detect people, record only during the hours you choose and send notices on their own.',
      es: 'Cámaras que detectan personas, graban solo en las horas que eliges y envían los avisos solas.',
    },
  },
  {
    project: 'rag',
    title: { en: 'A search engine that understands questions', es: 'Un buscador que entiende preguntas' },
    text: {
      en: 'Ask like you would ask a colleague and get the answer from the company’s own documentation — without sending data outside.',
      es: 'Pregunta como se lo preguntarías a un compañero y obtén la respuesta de la propia documentación de la empresa, sin enviar datos fuera.',
    },
  },
];
