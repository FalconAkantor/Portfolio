import type { Localized } from '../i18n/types';
import type { TechId } from './stack';

/** Layers of the AI stack, top (what users see) to bottom (metal). */
export interface AiLayer {
  id: string;
  name: Localized;
  items: TechId[];
  /** Runs on self-operated hardware. */
  selfHosted: boolean;
}

export const aiLayers: AiLayer[] = [
  { id: 'apps', name: { en: 'Applications', es: 'Aplicaciones' }, items: ['rag', 'yolo', 'ocr'], selfHosted: true },
  { id: 'llm', name: { en: 'Local language models', es: 'Modelos de lenguaje locales' }, items: ['deepseek', 'deepseekR1', 'mistral', 'qwen'], selfHosted: true },
  { id: 'retrieval', name: { en: 'Embeddings & retrieval', es: 'Embeddings y recuperación' }, items: ['sentenceTransformers', 'mpnet', 'faiss', 'vectorSearch'], selfHosted: true },
  { id: 'serving', name: { en: 'Model serving', es: 'Serving de modelos' }, items: ['ollama', 'nim', 'docker'], selfHosted: true },
  { id: 'compute', name: { en: 'Compute', es: 'Cómputo' }, items: ['cuda', 'nvidia', 'multiGpu', 'pytorch'], selfHosted: true },
  { id: 'hosted', name: { en: 'Hosted APIs, when they fit', es: 'APIs en la nube, cuando encajan' }, items: ['openai'], selfHosted: false },
];

export interface RagQuery {
  id: string;
  question: Localized;
}

/** Example questions for the RAG pipeline walkthrough. The run itself is a visual simulation. */
export const ragQueries: RagQuery[] = [
  {
    id: 'rma',
    question: {
      en: 'Which RMAs describe the same failure as this one?',
      es: '¿Qué RMAs describen la misma avería que esta?',
    },
  },
  {
    id: 'procedure',
    question: {
      en: 'Where is the procedure for this process documented?',
      es: '¿Dónde está documentado el procedimiento de este proceso?',
    },
  },
  {
    id: 'summary',
    question: {
      en: 'Summarise what our internal docs say about this product.',
      es: 'Resume lo que dice nuestra documentación interna sobre este producto.',
    },
  },
];

export interface RagStage {
  id: string;
  label: Localized;
  /** Log-style output shown when the stage completes. */
  output: Localized;
}

export const ragStages: RagStage[] = [
  { id: 'query', label: { en: 'Question', es: 'Pregunta' }, output: { en: 'natural language in', es: 'entra lenguaje natural' } },
  { id: 'embed', label: { en: 'Embed', es: 'Vectorizar' }, output: { en: 'all-mpnet-base-v2 → 768-dim vector', es: 'all-mpnet-base-v2 → vector de 768 dim.' } },
  { id: 'search', label: { en: 'FAISS search', es: 'Búsqueda FAISS' }, output: { en: 'nearest passages by meaning', es: 'fragmentos más cercanos por significado' } },
  { id: 'context', label: { en: 'Context', es: 'Contexto' }, output: { en: 'passages assembled into the prompt', es: 'fragmentos ensamblados en el prompt' } },
  { id: 'llm', label: { en: 'Local LLM', es: 'LLM local' }, output: { en: 'Ollama · DeepSeek-R1 / Mistral on GPU', es: 'Ollama · DeepSeek-R1 / Mistral en GPU' } },
  { id: 'answer', label: { en: 'Answer', es: 'Respuesta' }, output: { en: 'grounded answer + sources', es: 'respuesta fundamentada + fuentes' } },
];
