import { useCallback, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useI18n } from '../../../i18n/context';
import { useSessionClock } from '../../../hooks/useSessionClock';
import { formatClock } from '../../../lib/format';
import type { Localized } from '../../../i18n/types';
import './workspace.css';

/**
 * Interactive replica of the Agent Workspace: a tiny window manager with
 * drag, edge snapping (with preview), maximise, minimise to taskbar, tiling
 * and two virtual desktops. All content is sample data.
 */

type Rect = { x: number; y: number; w: number; h: number }; // % of the work area
type Snap = 'left' | 'right' | 'max' | null;

interface Win extends Rect {
  id: string;
  desktop: 0 | 1;
  z: number;
  min: boolean;
  max: boolean;
}

interface WinDef {
  id: string;
  desktop: 0 | 1;
  title: Localized;
  icon: string;
  rect: Rect;
}

const WINDOWS: WinDef[] = [
  { id: 'purchasing', desktop: 0, icon: '▤', title: { en: 'Purchasing agent · batch', es: 'Agente de compras · lote' }, rect: { x: 2, y: 3, w: 50, h: 52 } },
  { id: 'search', desktop: 0, icon: '⌕', title: { en: 'Distributor search', es: 'Buscador de distribuidores' }, rect: { x: 55, y: 3, w: 43, h: 44 } },
  { id: 'gpu', desktop: 0, icon: '▦', title: { en: 'Server · GPUs', es: 'Servidor · GPUs' }, rect: { x: 55, y: 51, w: 43, h: 45 } },
  { id: 'assistant', desktop: 0, icon: '✦', title: { en: 'AI assistant', es: 'Asistente IA' }, rect: { x: 2, y: 59, w: 50, h: 37 } },
  { id: 'margins', desktop: 1, icon: '▥', title: { en: 'Margin report', es: 'Informe de márgenes' }, rect: { x: 3, y: 4, w: 55, h: 58 } },
  { id: 'docs', desktop: 1, icon: '▤', title: { en: 'Document library', es: 'Biblioteca documental' }, rect: { x: 50, y: 30, w: 47, h: 62 } },
  { id: 'note', desktop: 1, icon: '✎', title: { en: 'Sticky note', es: 'Nota' }, rect: { x: 6, y: 66, w: 30, h: 28 } },
];

const initialState = (): Win[] =>
  WINDOWS.map((w, i) => ({ id: w.id, desktop: w.desktop, ...w.rect, z: i + 1, min: false, max: false }));

const EDGE = 14; // px from an edge that triggers snapping

export function WorkspaceDemo() {
  const { l, t } = useI18n();
  const w = t.workspace;
  const now = useSessionClock();
  const [wins, setWins] = useState<Win[]>(initialState);
  const [desktop, setDesktop] = useState<0 | 1>(0);
  const [preview, setPreview] = useState<Snap>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; px: number; py: number; start: Rect; snap: Snap } | null>(null);
  const zTop = useRef(WINDOWS.length + 1);

  const update = useCallback((id: string, patch: Partial<Win>) => {
    setWins((all) => all.map((win) => (win.id === id ? { ...win, ...patch } : win)));
  }, []);

  const focus = useCallback((id: string) => update(id, { z: ++zTop.current, min: false }), [update]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>, win: Win) => {
    if ((e.target as HTMLElement).closest('button')) return;
    focus(win.id);
    if (window.matchMedia('(max-width: 719px)').matches || win.max) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: win.id, px: e.clientX, py: e.clientY, start: { x: win.x, y: win.y, w: win.w, h: win.h }, snap: null };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const area = areaRef.current?.getBoundingClientRect();
    if (!d || !area) return;
    const dx = ((e.clientX - d.px) / area.width) * 100;
    const dy = ((e.clientY - d.py) / area.height) * 100;
    const x = Math.min(100 - d.start.w * 0.25, Math.max(-d.start.w * 0.75, d.start.x + dx));
    const y = Math.min(92, Math.max(0, d.start.y + dy));
    update(d.id, { x, y });
    const snap: Snap =
      e.clientY - area.top < EDGE ? 'max' : e.clientX - area.left < EDGE ? 'left' : area.right - e.clientX < EDGE ? 'right' : null;
    d.snap = snap;
    setPreview(snap);
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    setPreview(null);
    if (!d) return;
    if (d.snap === 'left') update(d.id, { x: 0, y: 0, w: 50, h: 100 });
    else if (d.snap === 'right') update(d.id, { x: 50, y: 0, w: 50, h: 100 });
    else if (d.snap === 'max') update(d.id, { max: true, x: d.start.x, y: d.start.y });
  };

  const tile = () => {
    const visible = wins.filter((win) => win.desktop === desktop);
    const cols = Math.ceil(Math.sqrt(visible.length));
    const rows = Math.ceil(visible.length / cols);
    setWins((all) =>
      all.map((win) => {
        const i = visible.findIndex((v) => v.id === win.id);
        if (i < 0) return win;
        return { ...win, min: false, max: false, x: (i % cols) * (100 / cols), y: Math.floor(i / cols) * (100 / rows), w: 100 / cols, h: 100 / rows };
      }),
    );
  };

  const onDesktop = wins.filter((win) => win.desktop === desktop);
  const activeId = onDesktop.filter((win) => !win.min).sort((a, b) => b.z - a.z)[0]?.id;

  return (
    <div className="wsd" role="region" aria-label={w.label}>
      <div
        ref={areaRef}
        className="wsd__area"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="wsd__watermark mono" aria-hidden="true">
          AUTOMARIZA · {w.desktop} {desktop + 1}
        </span>
        {preview ? <div className={`wsd__preview wsd__preview--${preview}`} aria-hidden="true" /> : null}

        {onDesktop.map((win) => {
          const def = WINDOWS.find((d) => d.id === win.id)!;
          const style: CSSProperties = win.max
            ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
            : { left: `${win.x}%`, top: `${win.y}%`, width: `${win.w}%`, height: `${win.h}%`, zIndex: win.z };
          return (
            <div
              key={win.id}
              className={`wsd__win${win.id === activeId ? ' is-active' : ''}${win.min ? ' is-min' : ''}${win.id === 'note' ? ' wsd__win--note' : ''}`}
              style={style}
              role="group"
              aria-label={l(def.title)}
              tabIndex={win.min ? -1 : 0}
              onFocus={() => win.id !== activeId && focus(win.id)}
            >
              <div
                className="wsd__bar"
                onPointerDown={(e) => onPointerDown(e, win)}
                onDoubleClick={() => update(win.id, { max: !win.max })}
              >
                <span className="wsd__icon" aria-hidden="true">
                  {def.icon}
                </span>
                <span className="wsd__title">{l(def.title)}</span>
                <button type="button" className="wsd__btn" aria-label={`${w.minimise}: ${l(def.title)}`} onClick={() => update(win.id, { min: true })}>
                  –
                </button>
                <button type="button" className="wsd__btn" aria-label={`${w.maximise}: ${l(def.title)}`} onClick={() => update(win.id, { max: !win.max })}>
                  {win.max ? '❐' : '□'}
                </button>
              </div>
              <div className="wsd__body">
                <WindowContent id={win.id} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="wsd__taskbar mono">
        <span className="wsd__start" aria-hidden="true">
          ◧
        </span>
        <div className="wsd__tasks" role="group" aria-label={w.taskbar}>
          {onDesktop.map((win) => {
            const def = WINDOWS.find((d) => d.id === win.id)!;
            return (
              <button
                key={win.id}
                type="button"
                className={`wsd__task${win.id === activeId ? ' is-active' : ''}${win.min ? ' is-min' : ''}`}
                aria-pressed={!win.min}
                onClick={() => (win.id === activeId ? update(win.id, { min: true }) : focus(win.id))}
                title={l(def.title)}
              >
                <span aria-hidden="true">{def.icon}</span>
                <span className="wsd__task-label">{l(def.title)}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="wsd__tool" onClick={tile}>
          {w.tile}
        </button>
        <div className="wsd__desktops" role="group" aria-label={w.desktops}>
          {([0, 1] as const).map((d) => (
            <button key={d} type="button" aria-pressed={desktop === d} onClick={() => setDesktop(d)} aria-label={`${w.desktop} ${d + 1}`}>
              {d + 1}
            </button>
          ))}
        </div>
        <button type="button" className="wsd__tool" onClick={() => setWins(initialState())} aria-label={w.reset}>
          ↺
        </button>
        <span className="wsd__clock" aria-hidden="true">
          {now ? formatClock(now).slice(0, 5) : '--:--'}
        </span>
      </div>
    </div>
  );
}

/* ── Window contents: sample data only ─────────────────────────── */

function Row({ children, tone }: { children: ReactNode; tone?: 'ok' | 'run' | 'off' }) {
  return <div className={`wsd__row${tone ? ` is-${tone}` : ''}`}>{children}</div>;
}

function WindowContent({ id }: { id: string }) {
  const { lang, t } = useI18n();
  const es = lang === 'es';
  const w = t.workspace;

  switch (id) {
    case 'purchasing':
      return (
        <div className="wsd__table mono">
          <Row>
            <span>{es ? 'proveedor' : 'supplier'}</span>
            <span>{es ? 'tipo' : 'type'}</span>
            <span>{es ? 'archivo' : 'file'}</span>
            <span>{es ? 'estado' : 'state'}</span>
          </Row>
          <Row tone="ok">
            <span>Supplier A</span>
            <span>{es ? 'servidores' : 'servers'}</span>
            <span>PDF</span>
            <span>✓ {es ? 'limpio' : 'clean'}</span>
          </Row>
          <Row tone="ok">
            <span>Supplier B</span>
            <span>{es ? 'monitores' : 'monitors'}</span>
            <span>XLSX</span>
            <span>✓ {es ? 'limpio' : 'clean'}</span>
          </Row>
          <Row tone="run">
            <span>Supplier C</span>
            <span>mini PC</span>
            <span>CSV</span>
            <span className="wsd__spin">{es ? 'procesando' : 'running'}</span>
          </Row>
          <div className="wsd__action">{es ? 'Fusionar → actualizador de precios' : 'Merge → price updater'}</div>
        </div>
      );
    case 'search':
      return (
        <div className="wsd__table mono">
          <div className="wsd__input">⌕ RTX 4090</div>
          <Row tone="ok">
            <span>Wholesaler 1</span>
            <span>● {es ? 'en stock' : 'in stock'}</span>
          </Row>
          <Row tone="off">
            <span>Wholesaler 2</span>
            <span>○ {es ? 'sin stock · alerta' : 'no stock · alert set'}</span>
          </Row>
          <Row tone="ok">
            <span>Wholesaler 3</span>
            <span>● {es ? 'en stock' : 'in stock'}</span>
          </Row>
        </div>
      );
    case 'gpu':
      return (
        <div className="wsd__gpus mono">
          {[0, 1, 2, 3].map((g) => (
            <div key={g} className="wsd__gpu">
              <span>GPU{g}</span>
              <span className="wsd__meter" aria-hidden="true">
                <i style={{ animationDelay: `${g * -1.3}s` }} />
              </span>
            </div>
          ))}
          <p className="wsd__muted">nvml · {w.sample}</p>
        </div>
      );
    case 'assistant':
      return (
        <div className="wsd__chat">
          <p className="wsd__msg wsd__msg--me">{es ? '¿Qué herramienta limpia la tarifa de un proveedor?' : 'Which tool cleans a supplier price list?'}</p>
          <p className="wsd__msg">
            {es ? 'El Agente de compras → «Lote multi». Te lo abro en una ventana.' : 'The Purchasing agent → “Multi batch”. Opening it in a window.'}
          </p>
        </div>
      );
    case 'margins':
      return (
        <div className="wsd__bars" aria-hidden="true">
          {[68, 52, 40, 31, 22].map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} />
          ))}
          <p className="wsd__muted mono">{es ? 'por familia' : 'by family'} · {w.sample}</p>
        </div>
      );
    case 'docs':
      return (
        <ul className="wsd__rows mono" aria-hidden="true">
          {[
            ['PDF', 'tarifa_proveedor_2026.pdf', '#tarifa'],
            ['XLSX', 'margenes_T2.xlsx', '#márgenes'],
            ['DOCX', 'alta_proveedor.docx', '#procedimiento'],
          ].map(([kind, file, tag]) => (
            <li key={file}>
              <span className="wsd__muted">{kind}</span> {file} <span className="wsd__tag">{tag}</span>
            </li>
          ))}
          <li className="wsd__muted">{w.sample}</li>
        </ul>
      );
    case 'note':
      return <p className="wsd__note">{es ? 'Viernes: revisar tarifas nuevas de proveedores.' : 'Friday: review new supplier price lists.'}</p>;
    default:
      return null;
  }
}
