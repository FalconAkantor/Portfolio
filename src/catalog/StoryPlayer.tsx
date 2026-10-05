import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useI18n } from '../i18n/context';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { Story, StoryElement } from './types';
import './story.css';

/**
 * Animated explainer generated from a project's storyboard (`json animacion` in the catalogue):
 * the elements are laid out by their position, drawn by their type, and every beat lights up the
 * elements its text mentions, draws the flow from the previous one and speaks any «quoted» line.
 */

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const STOP = new Set(['para', 'como', 'desde', 'hacia', 'sobre', 'entre', 'con', 'sin', 'del', 'los', 'las', 'una', 'uno', 'que', 'por', 'cada', 'todo', 'todos', 'nuevo', 'nueva']);

const SYNONYMS: Record<string, string[]> = {
  archivo: ['archivo', 'excel', 'pdf', 'fichero', 'documento', 'csv'],
  tabla: ['tabla', 'filas', 'fila'],
  ventana: ['ventana', 'pantalla', 'panel', 'web'],
  grafico: ['grafica', 'grafico', 'barras', 'linea', 'curva'],
  correo: ['correo', 'email', 'mail', 'buzon'],
  sobre: ['correo', 'email', 'sobre'],
  chat: ['chat', 'burbuja', 'bot', 'mensaje', 'responde'],
  bot: ['bot', 'chat', 'mensaje'],
  movil: ['movil', 'telefono', 'whatsapp', 'telegram'],
  servidor: ['erp', 'servidor', 'base', 'sql', 'datos'],
  formulario: ['formulario', 'boton', 'campo', 'pulsa'],
  indicador: ['indicador', 'anillo', 'porcentaje'],
  kanban: ['kanban', 'tablero', 'columna', 'tarjeta'],
  tablero: ['tablero', 'columna', 'tarjeta'],
  camara: ['camara', 'video'],
  onda: ['onda', 'voz', 'audio', 'nota'],
  sello: ['sello', 'firma', 'firmado'],
  lista: ['lista'],
  tarjeta: ['tarjeta', 'ficha'],
};

function tokensFor(el: StoryElement): string[] {
  const words = norm(el.label)
    .split(/[^a-z0-9ñ]+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
  return [...new Set([norm(el.id), ...words, ...(SYNONYMS[el.type] ?? [])])].filter(Boolean);
}

function slotOf(position: string) {
  const p = norm(position);
  const col = p.includes('izquierda') ? 1 : p.includes('derecha') ? 3 : 2;
  const row = p.includes('arriba') ? 1 : p.includes('abajo') ? 3 : 2;
  return { col, row };
}

const quoteOf = (text: string) => /«([^»]{2,90})»/.exec(text)?.[1] ?? null;

/** Which elements each beat is about (by id, label words or type), falling back to story order. */
function useScript(story: Story) {
  return useMemo(() => {
    const toks = story.elements.map(tokensFor);
    const beats = story.beats.map((b, i) => {
      const text = norm(b.action);
      const scores = toks.map((ts) => ts.reduce((n, t) => n + (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text) ? 1 : 0), 0));
      const max = Math.max(...scores);
      let hit = max > 0 ? scores.map((s, k) => (s >= Math.max(1, max - 0) ? k : -1)).filter((k) => k >= 0).slice(0, 2) : [];
      if (!hit.length) hit = [i % Math.max(1, story.elements.length)];
      const tones = { ok: /verde|ok|check|correcto|aprob/.test(text), warn: /ambar|amarill|aviso|pendiente/.test(text), bad: /roj|error|alerta|cri?tic|ko\b|caid/.test(text) };
      return { ...b, hit, quote: quoteOf(b.action), tones };
    });
    const firstHit = story.elements.map((_, k) => beats.findIndex((b) => b.hit.includes(k)));
    return { beats, firstHit };
  }, [story]);
}

export function StoryPlayer({ story, autoPlay = true, compact = false }: { story: Story; autoPlay?: boolean; compact?: boolean }) {
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const { beats, firstHit } = useScript(story);
  const lastT = beats.at(-1)?.t ?? 0;
  const total = Math.max(story.duration, lastT + 2.2);
  const [playing, setPlaying] = useState(autoPlay);
  const [clockBeat, setBeat] = useState(-1);
  // With reduced motion the story is shown complete and still.
  const beat = reduced ? beats.length - 1 : clockBeat;
  const clock = useRef({ t: 0, last: 0 });
  const bar = useRef<HTMLSpanElement>(null);

  // Clock: advances only while visible and playing; re-renders only when the beat changes.
  useEffect(() => {
    if (reduced || !playing || !inView) return;
    let raf = 0;
    clock.current.last = performance.now();
    const tick = (now: number) => {
      const c = clock.current;
      c.t += (now - c.last) / 1000;
      c.last = now;
      if (c.t > total + 1.2) c.t = 0;
      let b = -1;
      beats.forEach((x, i) => {
        if (c.t >= x.t) b = i;
      });
      setBeat((prev) => (prev === b ? prev : b));
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, c.t / total)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView, reduced, beats, total]);

  const jump = (i: number) => {
    clock.current.t = (beats[i]?.t ?? 0) + 0.01;
    setBeat(i);
    if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, clock.current.t / total)})`;
  };

  const current = beat >= 0 ? (beats[beat] ?? null) : null;
  const active = new Set(current?.hit ?? []);
  const prevHit = beat > 0 ? (beats[beat - 1]?.hit[0] ?? -1) : -1;

  // Element centres, for the flow line between the previous and the current element.
  const stage = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const [centres, setCentres] = useState<{ x: number; y: number }[]>([]);
  useLayoutEffect(() => {
    const measure = () => {
      const box = stage.current?.getBoundingClientRect();
      if (!box) return;
      setCentres(
        nodes.current.map((n) => {
          const r = n?.getBoundingClientRect();
          return r ? { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 } : { x: 0, y: 0 };
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
  }, [story]);

  const curHit = current?.hit[0] ?? -1;
  const from = prevHit >= 0 && curHit >= 0 && prevHit !== curHit ? centres[prevHit] : null;
  const to = curHit >= 0 ? centres[curHit] : null;

  // Group elements by grid cell.
  const cells = new Map<string, number[]>();
  story.elements.forEach((el, k) => {
    const { col, row } = slotOf(el.position);
    const key = `${row}-${col}`;
    cells.set(key, [...(cells.get(key) ?? []), k]);
  });

  // Rows without elements shrink, so a story laid out on one line fills the stage.
  const used = new Set([...cells.keys()].map((k) => Number(k.split('-')[0])));
  const rows = [1, 2, 3].map((r) => (used.has(r) ? '1fr' : '0.3fr')).join(' ');

  return (
    <div ref={ref} className={`sp${compact ? ' sp--compact' : ''}`} data-playing={playing && inView && !reduced ? '' : undefined}>
      <div ref={stage} className="sp__stage" aria-hidden="true" style={{ gridTemplateRows: rows }}>
        {[...cells.entries()].map(([key, ks]) => {
          const [row, col] = key.split('-').map(Number);
          return (
            <div key={key} className="sp__cell" style={{ gridRow: row, gridColumn: col }}>
              {ks.map((k) => {
                const el = story.elements[k];
                if (!el) return null;
                const isOn = active.has(k);
                const fh = firstHit[k] ?? -1;
                const seen = beat >= 0 && (fh < 0 || fh <= beat);
                const state = isOn ? 'on' : seen ? 'done' : 'idle';
                return (
                  <div key={el.id} ref={(n) => void (nodes.current[k] = n)} className={`sp-node sp-node--${el.type}`} data-state={state}>
                    <Visual el={el} on={isOn} tones={isOn ? current?.tones : undefined} quote={isOn ? (current?.quote ?? null) : null} />
                    <span className="sp-node__label" data-text={el.label} />
                    {isOn && current?.quote && !QUOTE_INSIDE.has(el.type) && current.hit[0] === k ? <span className="sp-node__quote">{current.quote}</span> : null}
                  </div>
                );
              })}
            </div>
          );
        })}
        {from && to ? (
          <svg className="sp__flow" key={`${beat}`}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
            <circle r="4" style={{ offsetPath: `path('M${from.x},${from.y} L${to.x},${to.y}')` } as CSSProperties} />
          </svg>
        ) : null}
      </div>

      <div className="sp__bar">
        <button type="button" className="sp__btn" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t.catalog.pause : t.catalog.play} disabled={reduced}>
          {playing && !reduced ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5l11 7-11 7z" />
            </svg>
          )}
        </button>
        <div className="sp__caption" lang="es">
          <span className="sp__step mono">
            {beat >= 0 ? `${t.catalog.step} ${beat + 1}/${beats.length}` : story.concept[lang]}
          </span>
          <span className="sp__text">{current ? current.action : ''}</span>
        </div>
        <div className="sp__dots">
          {beats.map((_, i) => (
            <button key={i} type="button" className={`sp__dot${i === beat ? ' is-on' : i < beat ? ' is-done' : ''}`} onClick={() => jump(i)} aria-label={`${t.catalog.step} ${i + 1}`} />
          ))}
        </div>
        <span className="sp__progress" aria-hidden="true">
          <span ref={bar} />
        </span>
      </div>
      <ol className="sr-only" lang="es">
        {beats.map((b, i) => (
          <li key={i}>{b.action}</li>
        ))}
      </ol>
    </div>
  );
}

const QUOTE_INSIDE = new Set(['chat', 'bot', 'movil']);

type Tones = { ok: boolean; warn: boolean; bad: boolean };

/** One drawing per element type. Everything is CSS/SVG so it stays crisp and tiny. */
function Visual({ el, on, tones, quote }: { el: StoryElement; on: boolean; tones?: Tones; quote: string | null }): ReactNode {
  const type = el.type;
  const label = norm(el.label);
  switch (type) {
    case 'archivo': {
      const ext = /\.(xlsx?|csv)/.test(label) ? 'xls' : /\.pdf|pdf/.test(label) ? 'pdf' : /\.docx?|word/.test(label) ? 'doc' : /\.json/.test(label) ? 'json' : /\.(png|jpe?g)|foto|imagen/.test(label) ? 'img' : 'file';
      return (
        <div className={`v-file v-file--${ext}`}>
          <span className="v-file__lines" />
          <b data-text={ext === 'file' ? '···' : ext.toUpperCase()} />
        </div>
      );
    }
    case 'tabla':
      return (
        <div className="v-table">
          {[0, 1, 2, 3, 4].map((r) => (
            <span key={r} className={`v-table__row${on && tones ? ` is-${r === 2 && tones.warn ? 'warn' : r === 4 && tones.bad ? 'bad' : tones.ok || r % 2 ? 'ok' : 'scan'}` : ''}`}>
              <i />
              <i />
              <i />
            </span>
          ))}
          <span className="v-table__scan" />
        </div>
      );
    case 'grafico':
    case 'indicador':
      return type === 'indicador' ? (
        <svg className="v-gauge" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="15" />
          <circle cx="20" cy="20" r="15" className="v-gauge__fill" pathLength={100} />
        </svg>
      ) : (
        <div className="v-chart">
          {[42, 64, 38, 80, 56, 92].map((h, i) => (
            <span key={i} style={{ ['--h' as string]: `${h}%`, ['--d' as string]: `${i * 60}ms` }} />
          ))}
        </div>
      );
    case 'correo':
    case 'sobre':
      return (
        <svg className="v-mail" viewBox="0 0 48 34">
          <rect x="2" y="2" width="44" height="30" rx="4" />
          <path d="M3 4l21 16L45 4" />
        </svg>
      );
    case 'chat':
    case 'bot':
      return (
        <div className="v-chat">
          <span className="v-chat__in" />
          <span className="v-chat__out">{on && quote ? <q>{quote}</q> : <i className="v-dots" />}</span>
        </div>
      );
    case 'movil':
      return (
        <div className="v-phone">
          <span className="v-phone__b v-phone__b--in" />
          <span className="v-phone__b v-phone__b--out">{on && quote ? <q>{quote}</q> : null}</span>
        </div>
      );
    case 'servidor':
    case 'nodo':
      return /erp|sql|base|bd|datos|registro/.test(label) ? (
        <svg className="v-db" viewBox="0 0 40 44">
          <ellipse cx="20" cy="8" rx="16" ry="5" />
          <path d="M4 8v28c0 3 7 5 16 5s16-2 16-5V8 M4 22c0 3 7 5 16 5s16-2 16-5" />
        </svg>
      ) : (
        <div className="v-rack">
          {[0, 1, 2].map((i) => (
            <span key={i}>
              <i />
            </span>
          ))}
        </div>
      );
    case 'formulario':
    case 'botones':
      return (
        <div className="v-form">
          <span />
          <span />
          <b data-text={on && tones?.ok ? '✓' : ''} />
        </div>
      );
    case 'ventana':
    case 'tarjeta':
    case 'diagrama':
      return (
        <div className="v-win">
          <span className="v-win__bar">
            <i />
            <i />
            <i />
          </span>
          <span className="v-win__l" />
          <span className="v-win__l v-win__l--s" />
          <span className="v-win__l" />
        </div>
      );
    case 'lista':
    case 'bloques':
    case 'chips':
    case 'chip':
      return (
        <div className="v-list">
          {[0, 1, 2].map((i) => (
            <span key={i}>
              <i />
            </span>
          ))}
        </div>
      );
    case 'kanban':
    case 'tablero':
      return (
        <div className="v-kanban">
          {[2, 1, 3].map((n, c) => (
            <span key={c}>
              {Array.from({ length: n }, (_, i) => (
                <i key={i} />
              ))}
            </span>
          ))}
        </div>
      );
    case 'onda':
      return (
        <div className="v-wave">
          {[30, 70, 45, 90, 55, 80, 35, 60].map((h, i) => (
            <span key={i} style={{ ['--h' as string]: `${h}%`, ['--d' as string]: `${i * 70}ms` }} />
          ))}
        </div>
      );
    case 'sello':
      return (
        <svg className="v-seal" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" />
          <path d="M12 20l6 6 10-12" />
        </svg>
      );
    case 'camara':
      return (
        <svg className="v-cam" viewBox="0 0 48 32">
          <rect x="2" y="6" width="32" height="22" rx="4" />
          <path d="M34 14l12-7v18l-12-7z" />
          <circle cx="9" cy="12" r="2.5" className="v-cam__rec" />
        </svg>
      );
    default:
      return <IconGuess label={label} />;
  }
}

/** Generic icon: picks a pictogram from the element's label. */
function IconGuess({ label }: { label: string }) {
  const d = /campana|aviso|alerta|notif/.test(label)
    ? 'M6 16V11a6 6 0 1112 0v5l2 2H4z M10 20a2 2 0 004 0'
    : /reloj|hora|cron|horario|tiempo/.test(label)
      ? 'M12 3a9 9 0 100 18 9 9 0 000-18z M12 7v5l3 3'
      : /usuario|persona|cliente|equipo|tecnico|comercial/.test(label)
        ? 'M12 12a4 4 0 100-8 4 4 0 000 8z M4 21c0-4 4-6 8-6s8 2 8 6'
        : /candado|login|contrasen|acceso|clave|permiso/.test(label)
          ? 'M6 11h12v10H6z M8 11V8a4 4 0 118 0v3'
          : /lupa|busca|consulta|pregunta/.test(label)
            ? 'M10 4a6 6 0 104.5 10L20 20 M10 4a6 6 0 010 12'
            : /gpu|cpu|chip|memoria|ram/.test(label)
              ? 'M7 7h10v10H7z M10 3v4 M14 3v4 M10 17v4 M14 17v4 M3 10h4 M3 14h4 M17 10h4 M17 14h4'
              : /temperat|termo|°c|grado/.test(label)
                ? 'M10 4a2 2 0 014 0v10a4 4 0 11-4 0z'
                : /ia|llm|modelo|cerebro|agente|ollama|qwen/.test(label)
                  ? 'M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z'
                  : /check|ok|valid|correct/.test(label)
                    ? 'M5 12l4 4 10-10'
                    : 'M12 2l9 5v10l-9 5-9-5V7z M12 12l9-5 M12 12v10 M12 12L3 7';
  return (
    <svg className="v-icon" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}
