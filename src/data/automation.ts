import type { Localized } from '../i18n/types';

export type AutomationChannel = 'email' | 'whatsapp' | 'documents' | 'data' | 'erp' | 'knowledge';

/** A business process expressed as trigger → engine → result. */
export interface AutomationFlow {
  id: string;
  channel: AutomationChannel;
  name: Localized;
  trigger: Localized;
  engine: Localized;
  result: Localized;
}

export const automationFlows: AutomationFlow[] = [
  {
    id: 'orders-email',
    channel: 'email',
    name: { en: 'Orders received by email', es: 'Pedidos recibidos por email' },
    trigger: { en: 'An order arrives in the inbox', es: 'Llega un pedido al buzón' },
    engine: { en: 'AI reads it and extracts the order lines', es: 'La IA lo lee y extrae las líneas' },
    result: { en: 'Order registered, no retyping', es: 'Pedido registrado sin reteclear' },
  },
  {
    id: 'orders-whatsapp',
    channel: 'whatsapp',
    name: { en: 'Orders received by WhatsApp', es: 'Pedidos recibidos por WhatsApp' },
    trigger: { en: 'A customer writes or sends a photo', es: 'Un cliente escribe o manda una foto' },
    engine: { en: 'Message and image are interpreted', es: 'Se interpretan mensaje e imagen' },
    result: { en: 'Structured order, ready to process', es: 'Pedido estructurado, listo para procesar' },
  },
  {
    id: 'display-restock',
    channel: 'whatsapp',
    name: { en: 'Display restocking by photo', es: 'Reposición de expositores por foto' },
    trigger: { en: 'A display is due for review', es: 'A un expositor le toca revisión' },
    engine: { en: 'WhatsApp asks for a photo; local AI counts every unit', es: 'WhatsApp pide una foto; la IA local cuenta cada unidad' },
    result: { en: 'The replenishment list, every morning', es: 'La lista de reposición, cada mañana' },
  },
  {
    id: 'delivery-notes',
    channel: 'documents',
    name: { en: 'Delivery note (albarán) data', es: 'Datos de albaranes' },
    trigger: { en: 'A delivery note is received', es: 'Se recibe un albarán' },
    engine: { en: 'Items, quantities and references extracted', es: 'Se extraen artículos, cantidades y referencias' },
    result: { en: 'Ready to check or load into the ERP', es: 'Listo para cotejar o cargar en el ERP' },
  },
  {
    id: 'supplier-prices',
    channel: 'documents',
    name: { en: 'Supplier price lists', es: 'Listas de precios de proveedores' },
    trigger: { en: 'Each supplier sends prices in its own format', es: 'Cada proveedor envía precios en su formato' },
    engine: { en: 'One parser per supplier cleans them in batch', es: 'Un parser por proveedor los limpia en lote' },
    result: { en: 'One merged file for the price updater', es: 'Un archivo fusionado para el actualizador de precios' },
  },
  {
    id: 'stock-alerts',
    channel: 'data',
    name: { en: 'Wholesaler stock watch', es: 'Vigilancia de stock en mayoristas' },
    trigger: { en: 'A product is out of stock everywhere', es: 'Un producto no tiene stock en ningún sitio' },
    engine: { en: 'Availability checked every hour', es: 'La disponibilidad se revisa cada hora' },
    result: { en: 'An e-mail the moment it is back', es: 'Un email en cuanto vuelve' },
  },
  {
    id: 'margins',
    channel: 'erp',
    name: { en: 'Gross-margin reporting', es: 'Informes de margen bruto' },
    trigger: { en: 'A quarter or year closes', es: 'Se cierra un trimestre o un año' },
    engine: { en: 'Sales and costs pulled from the ERP', es: 'Ventas y costes extraídos del ERP' },
    result: { en: 'Excel reports by customer, family and subfamily', es: 'Informes Excel por cliente, familia y subfamilia' },
  },
  {
    id: 'smart-search',
    channel: 'knowledge',
    name: { en: 'Smart search over documentation', es: 'Búsqueda inteligente en documentación' },
    trigger: { en: 'A question in plain language', es: 'Una pregunta en lenguaje natural' },
    engine: { en: 'RAG: semantic search + LLM', es: 'RAG: búsqueda semántica + LLM' },
    result: { en: 'An answer grounded in your own documents', es: 'Una respuesta basada en tus documentos' },
  },
];
