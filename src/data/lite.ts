import type { Localized } from '../i18n/types';
import type { ProjectId } from './projects';

/**
 * Content of the simple version: the same work as the tech version,
 * told for people who just want to know what I offer.
 */

export type ServiceIcon = 'documents' | 'assistant' | 'chat' | 'camera' | 'report' | 'library';

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
    title: { en: 'WhatsApp that answers — and a team behind it', es: 'Un WhatsApp que atiende, con tu equipo detrás' },
    text: {
      en: 'An assistant answers your customers at any hour, and when a person is needed, your whole team replies from the same number — without passing the phone around.',
      es: 'Un asistente atiende a tus clientes a cualquier hora y, cuando hace falta una persona, todo tu equipo responde desde el mismo número, sin pasarse el móvil.',
    },
  },
  {
    id: 'vision',
    icon: 'camera',
    title: { en: 'Cameras and photos that understand', es: 'Cámaras y fotos que entienden' },
    text: {
      en: 'Cameras whose AI understands what is happening and warns only when it matters; photos of a shelf that turn into a stock count.',
      es: 'Cámaras cuya IA entiende lo que pasa y avisa solo cuando importa; fotos de una estantería que se convierten en un recuento de stock.',
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
    id: 'library',
    icon: 'library',
    title: { en: 'Documents that sort themselves', es: 'Documentos que se ordenan solos' },
    text: {
      en: 'Every PDF, Excel and Word file in one place: described, searchable by what it says, with versions, approvals and no duplicates. Even scanned papers can be searched.',
      es: 'Todos tus PDF, Excel y Word en un solo sitio: descritos, buscables por lo que dicen, con versiones, aprobaciones y sin duplicados. Hasta los papeles escaneados se pueden buscar.',
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
    project: 'cctv',
    title: { en: 'A camera that watches itself', es: 'Una cámara que se vigila sola' },
    text: {
      en: 'It records all day, remembers the parked cars and an AI reviews every event — you only get a warning when something is really suspicious. And you can ask it: “anything odd last night?”',
      es: 'Graba todo el día, recuerda los coches aparcados y una IA revisa cada evento: solo te avisa si algo es sospechoso de verdad. Y le puedes preguntar: «¿pasó algo raro anoche?»',
    },
  },
  {
    project: 'docs',
    title: { en: 'Documents that answer questions', es: 'Documentos que responden preguntas' },
    text: {
      en: 'Upload a PDF, an Excel or even a scanned sheet: it is read, described and filed. Then ask “how do we register a supplier?” and get the answer with the document it comes from.',
      es: 'Sube un PDF, un Excel o hasta una hoja escaneada: se lee, se describe y se archiva. Después pregunta «¿cómo se da de alta un proveedor?» y tendrás la respuesta con el documento del que sale.',
    },
  },
  {
    project: 'whatsapp-desk',
    title: { en: 'One WhatsApp, the whole team', es: 'Un WhatsApp, todo el equipo' },
    text: {
      en: 'An assistant answers your customers on WhatsApp. When they want a person, your team replies from Discord — several people, the same number, files included.',
      es: 'Un asistente atiende a tus clientes por WhatsApp. Cuando quieren una persona, tu equipo responde desde Discord: varias personas, el mismo número y con archivos.',
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
];
