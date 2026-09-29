import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/context';
import type { Localized } from '../../i18n/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './docs.css';

/**
 * Interactive replica of the AI document library: a scanned PDF goes through the whole
 * pipeline live, and the library answers questions. Files, folders and answers are samples.
 */

const same = (text: string): Localized => ({ en: text, es: text });

const STEPS: { ms: number; title: Localized; detail: Localized; tone?: 'warn' }[] = [
  { ms: 1500, title: { en: 'Uploaded', es: 'Subido' }, detail: same('tarifa_proveedor_2026.pdf · 2,4 MB · Compras') },
  {
    ms: 1700,
    title: { en: 'Read the text (pypdf)', es: 'Leer el texto (pypdf)' },
    detail: { en: 'only 38 characters → it is a scan', es: 'solo 38 caracteres → es un escaneo' },
    tone: 'warn',
  },
  { ms: 1900, title: { en: 'OCR (Tesseract)', es: 'OCR (Tesseract)' }, detail: { en: '6,812 characters from 4 pages', es: '6.812 caracteres de 4 páginas' } },
  { ms: 2300, title: { en: 'Local AI describes it', es: 'La IA local lo describe' }, detail: { en: 'description + 5 tags · JSON ok', es: 'descripción + 5 etiquetas · JSON ok' } },
  { ms: 1600, title: { en: 'Embeddings', es: 'Vectores' }, detail: same('nomic-embed-text · 5 chunks') },
  {
    ms: 2200,
    title: { en: 'Duplicate check', es: 'Comprobar duplicados' },
    detail: { en: '94 % similar to tarifa_proveedor_2025.pdf', es: '94 % parecido a tarifa_proveedor_2025.pdf' },
    tone: 'warn',
  },
  { ms: 4200, title: { en: 'Saved as a new version', es: 'Guardado como versión nueva' }, detail: { en: 'v3 · approval requested to 2 reviewers', es: 'v3 · aprobación pedida a 2 revisores' } },
];

const TXT = {
  label: { en: 'Interactive replica of the AI document library', es: 'Réplica interactiva de la biblioteca documental con IA' },
  live: { en: 'Live upload', es: 'Subida en vivo' },
  ask: { en: 'Ask the library', es: 'Pregunta a la biblioteca' },
  library: { en: 'Library · procedures', es: 'Biblioteca · procedimientos' },
  sample: { en: 'sample files', es: 'archivos de ejemplo' },
  desc: {
    en: 'Supplier price list for 2026: unit prices per reference, volume discounts and changes compared with the previous year.',
    es: 'Tarifa del proveedor para 2026: precios unitarios por referencia, descuentos por volumen y cambios respecto al año anterior.',
  },
  tags: ['tarifa', 'proveedor', '2026', 'precios', 'compras'],
  thinking: { en: 'Searching by meaning with the local AI', es: 'Buscando por significado con la IA local' },
  sources: { en: 'Sources', es: 'Fuentes' },
} satisfies Record<string, Localized | string[]>;

const FOLDERS = [
  { name: { en: 'Purchasing', es: 'Compras' }, n: 42 },
  { name: { en: 'Production', es: 'Producción' }, n: 118 },
  { name: { en: 'Quality', es: 'Calidad' }, n: 37 },
  { name: { en: 'People', es: 'RR. HH.' }, n: 21 },
];

const RECENT: { file: string; kind: 'pdf' | 'xlsx' | 'docx' | 'pptx'; tags: string[] }[] = [
  { file: 'alta_proveedor.docx', kind: 'docx', tags: ['procedimiento', 'proveedores'] },
  { file: 'margenes_T2.xlsx', kind: 'xlsx', tags: ['márgenes', 'trimestre'] },
  { file: 'formacion_calidad.pptx', kind: 'pptx', tags: ['calidad', 'formación'] },
];

const QUESTIONS: { q: Localized; a: Localized; sources: { file: string; score: number }[] }[] = [
  {
    q: { en: 'How do we register a new supplier?', es: '¿Cómo se da de alta un proveedor nuevo?' },
    a: {
      en: 'Fill in the supplier form, attach their tax certificate and bank details, and send it to Purchasing for approval. Once approved, Administration creates it in the ERP.',
      es: 'Se rellena la ficha de proveedor, se adjuntan el certificado fiscal y los datos bancarios y se envía a Compras para su aprobación. Una vez aprobado, Administración lo da de alta en el ERP.',
    },
    sources: [
      { file: 'alta_proveedor.docx', score: 91 },
      { file: 'checklist_compras.pdf', score: 78 },
    ],
  },
  {
    q: { en: 'What went up in the new supplier price list?', es: '¿Qué ha subido en la tarifa nueva del proveedor?' },
    a: {
      en: 'Compared with 2025, the 2026 list raises the references of the power range by about 4 % and adds a volume discount from 50 units.',
      es: 'Respecto a 2025, la tarifa de 2026 sube en torno a un 4 % las referencias de la gama de alimentación y añade un descuento por volumen a partir de 50 unidades.',
    },
    sources: [
      { file: 'tarifa_proveedor_2026.pdf', score: 94 },
      { file: 'tarifa_proveedor_2025.pdf', score: 82 },
    ],
  },
  {
    q: { en: 'Where is the returns (RMA) template?', es: '¿Dónde está la plantilla de devoluciones (RMA)?' },
    a: {
      en: 'In Quality › Returns: “plantilla_rma.xlsx”. The procedure that explains how to fill it in is “procedimiento_rma.pdf”.',
      es: 'En Calidad › Devoluciones: «plantilla_rma.xlsx». El procedimiento que explica cómo rellenarla es «procedimiento_rma.pdf».',
    },
    sources: [
      { file: 'plantilla_rma.xlsx', score: 89 },
      { file: 'procedimiento_rma.pdf', score: 86 },
    ],
  },
];

export function DocsDemo({ active }: { active: boolean }) {
  const { l } = useI18n();
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<'live' | 'ask'>('live');
  const [i, setI] = useState(0);
  const step = reduced ? STEPS.length - 1 : i;

  useEffect(() => {
    if (reduced || !active || tab !== 'live') return;
    const id = window.setTimeout(() => setI((n) => (n + 1) % STEPS.length), STEPS[i]!.ms);
    return () => window.clearTimeout(id);
  }, [i, active, reduced, tab]);

  return (
    <div className="dcs" role="region" aria-label={l(TXT.label)}>
      <div className="dcs__bar mono">
        <span className="dcs__title">▤ {l(TXT.library)}</span>
        <div className="dcs__tabs" role="tablist" aria-label={l(TXT.label)}>
          {(['live', 'ask'] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>
              {l(k === 'live' ? TXT.live : TXT.ask)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'live' ? (
        <div className="dcs__live">
          <aside className="dcs__folders" aria-hidden="true">
            {FOLDERS.map((f, k) => (
              <p key={k} className={k === 0 ? 'is-on' : ''}>
                <span>▸ {l(f.name)}</span>
                <b className="mono">{f.n}</b>
              </p>
            ))}
          </aside>

          <div className="dcs__job">
            <p className="dcs__file">
              <span className="dcs__kind dcs__kind--pdf mono">PDF</span>
              <span className="mono">tarifa_proveedor_2026.pdf</span>
            </p>
            <ol className="dcs__steps">
              {STEPS.map((s, k) => {
                const state = k < step ? 'done' : k === step ? 'run' : 'wait';
                return (
                  <li key={k} className={`dcs__step is-${state}${s.tone && k <= step ? ` is-${s.tone}` : ''}`}>
                    <span className="dcs__dot" aria-hidden="true" />
                    <span className="dcs__step-title">{l(s.title)}</span>
                    {k <= step ? <span className="dcs__step-detail mono">{l(s.detail)}</span> : null}
                  </li>
                );
              })}
            </ol>
            {step >= 3 ? (
              <div className="dcs__meta">
                <p>{l(TXT.desc)}</p>
                <p className="dcs__tags">
                  {TXT.tags.map((tag) => (
                    <span key={tag} className="mono">
                      #{tag}
                    </span>
                  ))}
                </p>
              </div>
            ) : null}
          </div>

          <ul className="dcs__recent" aria-hidden="true">
            {RECENT.map((r) => (
              <li key={r.file}>
                <span className={`dcs__kind dcs__kind--${r.kind} mono`}>{r.kind.toUpperCase()}</span>
                <span className="dcs__recent-name mono">{r.file}</span>
                <span className="dcs__recent-tags mono">{r.tags.map((x) => `#${x}`).join(' ')}</span>
              </li>
            ))}
            {step === STEPS.length - 1 ? (
              <li className="is-new">
                <span className="dcs__kind dcs__kind--pdf mono">PDF</span>
                <span className="dcs__recent-name mono">tarifa_proveedor_2026.pdf · v3</span>
                <span className="dcs__recent-tags mono">#tarifa #proveedor #2026</span>
              </li>
            ) : null}
          </ul>
          <p className="dcs__sample mono">{l(TXT.sample)}</p>
        </div>
      ) : (
        <Ask />
      )}
    </div>
  );
}

function Ask() {
  const { l } = useI18n();
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<'thinking' | 'answer'>('answer');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const ask = (k: number) => {
    window.clearTimeout(timer.current);
    setPicked(k);
    if (reduced) return setPhase('answer');
    setPhase('thinking');
    timer.current = window.setTimeout(() => setPhase('answer'), 1100);
  };

  return (
    <div className="dcs__ask">
      <div className="dcs__chips" role="group" aria-label={l(TXT.ask)}>
        {QUESTIONS.map((item, k) => (
          <button key={k} type="button" className={`dcs__chip${picked === k ? ' is-on' : ''}`} onClick={() => ask(k)}>
            {l(item.q)}
          </button>
        ))}
      </div>
      <div className="dcs__chat" aria-live="polite">
        {picked === null ? (
          <p className="dcs__hint mono">⌕ {l({ en: 'Pick a question…', es: 'Elige una pregunta…' })}</p>
        ) : (
          <>
            <p className="dcs__q">{l(QUESTIONS[picked]!.q)}</p>
            {phase === 'thinking' ? (
              <p className="dcs__thinking mono">{l(TXT.thinking)}</p>
            ) : (
              <>
                <p className="dcs__a">{l(QUESTIONS[picked]!.a)}</p>
                <div className="dcs__sources mono">
                  <span>{l(TXT.sources)}:</span>
                  {QUESTIONS[picked]!.sources.map((s) => (
                    <span key={s.file} className="dcs__source">
                      {s.file} <b>{s.score} %</b>
                    </span>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
